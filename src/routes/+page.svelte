<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { deploymentConfig, currentDeployment, type DeploymentConfig } from "$lib/stores/deployment";
  import {
    deploymentEvents,
    createSSEConnection,
    closeSSEConnection,
    type DeploymentEvent,
    type DeploymentEventType,
  } from "$lib/stores/sse";
  import {
    connectGitHub,
    connectAWS,
    startDeployment,
    getDeploymentResult,
    getConnections,
    type GitHubConnectionInfo,
    type AWSConnectionInfo,
    type DeploymentResultData,
  } from "$lib/api/client";
  import Modal from "$lib/components/Modal.svelte";
  import LaunchModal from "$lib/components/LaunchModal.svelte";
  import SpaceBackground from "$lib/components/SpaceBackground.svelte";
  import ControlPanel from "$lib/components/ControlPanel.svelte";
  import DeploymentDashboard from "$lib/components/DeploymentDashboard.svelte";
  import DeploymentSpaceships from "$lib/components/DeploymentSpaceships.svelte";
  import Swal from "sweetalert2";

  let githubOwner = $state("");
  let githubRepo = $state("");
  let githubBranch = $state("main");
  let githubToken = $state("");
  let githubConnecting = $state(false);
  let githubError = $state("");
  let githubModalOpen = $state(false);

  let awsAccessKey = $state("");
  let awsSecretKey = $state("");
  let awsRegion = $state("ap-northeast-2");
  let awsConnecting = $state(false);
  let awsError = $state("");
  let awsModalOpen = $state(false);

  let deployConnecting = $state(false);
  let deployError = $state("");
  let launchModalOpen = $state(false);
  let countdown = $state<number | null>(null);

  let config = $state<DeploymentConfig>({ github: { connected: false }, aws: { connected: false }, readyToDeploy: false });
  let currentDeploymentState = $state({
    deploymentId: null as string | null,
    isActive: false,
  });
  let events = $state<{
    events: Array<{
      type: string;
      message: string;
      details?: Record<string, any>;
      timestamp?: string;
    }>;
    currentStage: string;
    isConnected: boolean;
    isComplete: boolean;
    hasError: boolean;
  }>({
    events: [],
    currentStage: "idle",
    isConnected: false,
    isComplete: false,
    hasError: false,
  });

	let eventSource: EventSource | null = null;
	let result = $state<DeploymentResultData | null>(null);

	let buttonPressed = $state(false);
	let pollingInterval: ReturnType<typeof setInterval> | null = null;
	let rocketSound: HTMLAudioElement | null = null;

  // Store 구독 및 초기화
  onMount(() => {
    // Store 구독
    const unsubscribeConfig = deploymentConfig.subscribe((value) => {
      config = value;
    });

    const unsubscribeDeployment = currentDeployment.subscribe((value) => {
      currentDeploymentState = value;
      // 활성 배포가 있으면 SSE 연결 및 polling 시작
      if (value.isActive && value.deploymentId) {
        if (!eventSource) {
          eventSource = createSSEConnection(value.deploymentId);
        }
        // polling 시작 (이미 실행 중이면 중복 방지)
        if (value.deploymentId && !pollingInterval) {
          startPolling(value.deploymentId);
        }
      } else if (!value.isActive && eventSource) {
        // 배포가 비활성화되면 SSE 연결만 종료, polling은 계속
        closeSSEConnection(eventSource);
        eventSource = null;
      }
    });

    const unsubscribeEvents = deploymentEvents.subscribe((value) => {
      events = value;

      // 배포가 완료되거나 실패하면 로켓 발사 소리 중지
      if ((value.isComplete || value.hasError) && rocketSound) {
        rocketSound.pause();
        rocketSound.currentTime = 0;
        rocketSound = null;
      }
    });

    // 배포 결과 polling (5초마다)
    const startPolling = (deploymentId: string) => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }

      const poll = async () => {
        try {
          const deploymentResult = await getDeploymentResult(deploymentId);

          result = deploymentResult;

          // 배포가 완료되거나 실패한 경우 SSE 연결만 종료
          // isActive는 변경하지 않음 - SSE나 사용자 액션에서만 변경
          if (deploymentResult.status === "completed" || deploymentResult.status === "failed") {
            // 로켓 발사 소리 중지
            if (rocketSound) {
              rocketSound.pause();
              rocketSound.currentTime = 0;
              rocketSound = null;
            }

            // SSE 연결 종료
            if (eventSource) {
              closeSSEConnection(eventSource);
              eventSource = null;
            }
            // polling은 계속하되 isActive는 그대로 유지
            // (SSE에서 이미 isActive를 false로 설정했거나, 사용자가 리셋할 때까지 유지)
          }
        } catch (error) {
          console.error("Failed to poll deployment result:", error);
        }
      };

      // 즉시 한 번 실행
      poll();
      // 5초마다 polling
      pollingInterval = setInterval(poll, 5000);
    };

    // 초기 상태 조회: 연결 정보 및 localStorage에서 배포 상태 복원
    fetchConnections();
    restoreDeploymentFromStorage();

    return () => {
      unsubscribeConfig();
      unsubscribeDeployment();
      unsubscribeEvents();
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (rocketSound) {
        rocketSound.pause();
        rocketSound = null;
      }
    };
  });

	onDestroy(() => {
		if (eventSource) {
			closeSSEConnection(eventSource);
		}
		if (rocketSound) {
			rocketSound.pause();
			rocketSound = null;
		}
	});

  // 연결 정보 조회 및 상태 업데이트
  async function fetchConnections() {
    try {
      const connections = await getConnections();

      // GitHub 연결 정보 업데이트 (가장 최근 연결 사용 - 첫 번째 요소)
      const latestGitHub = connections.github && connections.github.length > 0
        ? connections.github[0]
        : null;

      // AWS 연결 정보 업데이트 (가장 최근 연결 사용 - 첫 번째 요소)
      const latestAWS = connections.aws && connections.aws.length > 0
        ? connections.aws[0]
        : null;

      deploymentConfig.update((currentConfig) => ({
        github: latestGitHub
          ? {
              connected: true,
              connectionId: latestGitHub.connectionId,
              owner: latestGitHub.owner,
              repo: latestGitHub.repo,
              branch: latestGitHub.branch,
            }
          : { connected: false },
        aws: latestAWS
          ? {
              connected: true,
              connectionId: latestAWS.connectionId,
              region: latestAWS.region,
            }
          : { connected: false },
        readyToDeploy: (latestGitHub !== null) && (latestAWS !== null),
      }));
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      // 에러가 발생해도 기존 상태 유지
    }
  }

  // localStorage에서 배포 상태 복원
  async function restoreDeploymentFromStorage() {
    const savedDeploymentId = localStorage.getItem("deploymentId");

    if (!savedDeploymentId) {
      return;
    }

    try {
      const deploymentResult = await getDeploymentResult(savedDeploymentId);

      result = deploymentResult;

      if (deploymentResult.status === "completed" || deploymentResult.status === "failed") {
        // 배포가 끝나있으면 SSE 연결 종료하지만 deploymentId는 유지 (polling을 위해)
        if (eventSource) {
          closeSSEConnection(eventSource);
          eventSource = null;
        }
        // isActive는 false로 설정하되 deploymentId는 유지
        currentDeployment.set({
          deploymentId: savedDeploymentId,
          isActive: false
        });
      } else if (deploymentResult.status === "in-progress") {
        // 진행중이면 진행중인 상태부터 시작
        currentDeployment.set({
          deploymentId: savedDeploymentId,
          isActive: true,
        });
        // SSE 연결은 store 구독에서 자동으로 처리됨

        // 진행 중인 배포가 있으면 로켓 발사 소리 재생
        try {
          if (rocketSound) {
            rocketSound.pause();
            rocketSound = null;
          }
          rocketSound = new Audio("/rocket.mp4");
          rocketSound.loop = true;
          rocketSound.volume = 0.5;
          rocketSound.play().catch((e) => {
            console.error("Failed to play rocket sound:", e);
          });
        } catch (e) {
          console.error("Failed to load rocket sound:", e);
        }
      }
    } catch (error) {
      console.error("Failed to restore deployment from storage:", error);
    }
  }

  async function handleGitHubConnect() {
    if (!githubOwner || !githubRepo || !githubToken) {
      githubError = '모든 필드를 입력해주세요.';
      return;
    }

    githubConnecting = true;
    githubError = '';

    try {
      const response = await connectGitHub({
        owner: githubOwner,
        repo: githubRepo,
        branch: githubBranch,
        token: githubToken
      });

      // 연결 성공 후 서버에서 최신 연결 정보 조회
      await fetchConnections();

      githubModalOpen = false;
      Swal.fire({
        icon: "success",
        title: "GitHub 연결 성공!",
        text: "GitHub 레포지토리가 성공적으로 연결되었습니다.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
    } catch (error) {
      githubError = error instanceof Error ? error.message : 'GitHub 연결에 실패했습니다.';
      console.error('GitHub connection error:', error);
      Swal.fire({
        icon: "error",
        title: "GitHub 연결 실패",
        text: error instanceof Error ? error.message : 'GitHub 연결에 실패했습니다.',
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
    } finally {
      githubConnecting = false;
    }
  }

  async function handleAWSConnect() {
    if (!awsAccessKey || !awsSecretKey || !awsRegion) {
      awsError = '모든 필드를 입력해주세요.';
      return;
    }

    awsConnecting = true;
    awsError = '';

    try {
      const response = await connectAWS({
        region: awsRegion,
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey
      });

      // 연결 성공 후 서버에서 최신 연결 정보 조회
      await fetchConnections();

      awsModalOpen = false;
      Swal.fire({
        icon: "success",
        title: "AWS 연결 성공!",
        text: "AWS 계정이 성공적으로 연결되었습니다.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
    } catch (error) {
      awsError = error instanceof Error ? error.message : 'AWS 연결에 실패했습니다.';
      console.error('AWS connection error:', error);
      Swal.fire({
        icon: "error",
        title: "AWS 연결 실패",
        text: error instanceof Error ? error.message : 'AWS 연결에 실패했습니다.',
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
    } finally {
      awsConnecting = false;
    }
  }

  async function handleDeploy() {
    // 이미 배포가 진행 중이면 중단
    if (currentDeploymentState.isActive) {
      Swal.fire({
        icon: 'info',
        title: '배포 진행 중',
        text: '이미 배포가 진행 중입니다.',
        confirmButtonColor: '#dc2626',
        confirmButtonText: '확인'
      });
      return;
    }

    // 카운트다운이 이미 진행 중이면 중단
    if (countdown !== null) {
      return;
    }

    // 효과음 로드 및 재생
    const countdownSound = new Audio("/CountDown.mp3");
    countdownSound.volume = 0.7;

    // 카운트다운 시작 (5부터 시작)
    countdown = 5;

    try {
      await countdownSound.play();
    } catch (e) {
      console.error("Failed to play countdown sound:", e);
    }

    // 카운트다운 중에 필요한 정보 확인 및 가져오기
    let githubConfig = config.github;
    let awsConfig = config.aws;

    // 필요한 정보가 없으면 /api/v1/connect에서 가져오기
    if (!githubConfig.connected || !awsConfig.connected ||
        !githubConfig.connectionId || !awsConfig.connectionId ||
        !githubConfig.owner || !githubConfig.repo) {
      await fetchConnections();

      // 다시 확인
      githubConfig = config.github;
      awsConfig = config.aws;
    }

    // 카운트다운 진행
    for (let i = 5; i > 0; i--) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (i > 1) {
        countdown = i - 1;
      } else {
        countdown = null;
      }
    }

    // 카운트다운이 끝난 후 배포 요청
    // 필요한 정보가 여전히 없으면 에러
    if (!githubConfig.connected || !awsConfig.connected ||
        !githubConfig.connectionId || !awsConfig.connectionId ||
        !githubConfig.owner || !githubConfig.repo) {
      Swal.fire({
        icon: 'warning',
        title: '발사 준비 미완료',
        text: 'GitHub와 AWS 연결을 먼저 완료해주세요.',
        confirmButtonColor: '#dc2626',
        confirmButtonText: '확인'
      });
      return;
    }

    deployConnecting = true;
    deployError = "";
    result = null;

    try {
      const response = await startDeployment({
        githubConnectionId: githubConfig.connectionId,
        awsConnectionId: awsConfig.connectionId,
        owner: githubConfig.owner,
        repo: githubConfig.repo,
        branch: githubConfig.branch || "main",
      });

      // deploymentId를 localStorage에 저장 (polling을 위해 유지)
      localStorage.setItem("deploymentId", response.deploymentId);

      // store 업데이트 (SSE 연결은 store 구독에서 자동으로 처리됨)
      currentDeployment.set({
        deploymentId: response.deploymentId,
        isActive: true,
      });

      // 로켓 발사 소리 재생
      try {
        if (rocketSound) {
          rocketSound.pause();
          rocketSound = null;
        }
        rocketSound = new Audio("/rocket.mp4");
        rocketSound.loop = true;
        rocketSound.volume = 0.5;
        rocketSound.play().catch((e) => {
          console.error("Failed to play rocket sound:", e);
        });
      } catch (e) {
        console.error("Failed to load rocket sound:", e);
      }

      launchModalOpen = true;
    } catch (error) {
      deployError = error instanceof Error ? error.message : "배포 시작에 실패했습니다.";
      console.error("Deployment start error:", error);
      Swal.fire({
        icon: "error",
        title: "배포 시작 실패",
        text: error instanceof Error ? error.message : "배포 시작에 실패했습니다.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
    } finally {
      deployConnecting = false;
    }
  }
</script>

<div class="min-h-screen relative">
  <!-- 우주 배경 -->
  <SpaceBackground />

  <!-- 배포 결과 우주선 애니메이션 -->
  <DeploymentSpaceships {result} />

  <!-- 기존 발사 버튼은 LaunchModal 안으로 이동 (주석처리) -->

  <!-- 배포 진행 중 UI는 이제 LaunchModal 안에서만 표시됨 -->

  <!-- 연결/배포 시작 UI - 항상 표시 -->
  <div class="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
    <!-- 헤더 섹션 -->
    <div
      class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <h2 class="text-2xl font-bold text-white">연결 상태</h2>
          <div class="flex items-center space-x-3">
            <!-- GitHub 연결 상태 -->
            <div class="flex items-center space-x-2">
              <div
                class="w-3 h-3 rounded-full {config.github.connected
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-red-500 shadow-lg shadow-red-500/50'}"
              ></div>
              <span class="text-sm text-gray-300">GitHub</span>
            </div>
            <!-- AWS 연결 상태 -->
            <div class="flex items-center space-x-2">
              <div
                class="w-3 h-3 rounded-full {config.aws.connected
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-red-500 shadow-lg shadow-red-500/50'}"
              ></div>
              <span class="text-sm text-gray-300">AWS</span>
            </div>
          </div>
        </div>
					<div class="flex items-center gap-3">
						<!-- GitHub 연결 버튼 -->
						<button
							onclick={() => (githubModalOpen = true)}
							class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
						>
							GitHub 연결
						</button>

						<!-- AWS 연결 버튼 -->
						<button
							onclick={() => (awsModalOpen = true)}
							class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
						>
							AWS 연결
						</button>
					</div>
      </div>
    </div>

    <!-- 발사 준비 완료 버튼 -->
    {#if config.readyToDeploy}
      <div class="mt-6 flex justify-center">
        <button
          onclick={async () => {
            // localStorage에서 배포 상태 확인
            // 끝나있으면 끊고 localStorage에서도 제거, 진행중이면 진행중인 상태부터 시작
            await restoreDeploymentFromStorage();
            launchModalOpen = true;
          }}
          class="flex justify-center items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg
            class="w-6 h-6 text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m10.051 8.102-3.778.322-1.994 1.994a.94.94 0 0 0 .533 1.6l2.698.316m8.39 1.617-.322 3.78-1.994 1.994a.94.94 0 0 1-1.595-.533l-.4-2.652m8.166-11.174a1.366 1.366 0 0 0-1.12-1.12c-1.616-.279-4.906-.623-6.38.853-1.671 1.672-5.211 8.015-6.31 10.023a.932.932 0 0 0 .162 1.111l.828.835.833.832a.932.932 0 0 0 1.111.163c2.008-1.102 8.35-4.642 10.021-6.312 1.475-1.478 1.133-4.77.855-6.385Zm-2.961 3.722a1.88 1.88 0 1 1-3.76 0 1.88 1.88 0 0 1 3.76 0Z"
            />
          </svg>
          발사 준비 완료
        </button>
      </div>
    {/if}

    {#if deployError}
      <div class="text-center text-red-400 text-sm mb-4">{deployError}</div>
    {/if}
  </div>
</div>

<!-- GitHub 연결 모달 -->
<Modal title="GitHub 연결" bind:open={githubModalOpen}>
  <div class="space-y-4">
    <div>
      <label
        for="github-owner"
        class="block text-sm font-medium text-gray-300 mb-2"
      >
        Owner
      </label>
      <input
        id="github-owner"
        type="text"
        bind:value={githubOwner}
        placeholder="your-org"
        class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label
        for="github-repo"
        class="block text-sm font-medium text-gray-300 mb-2"
      >
        Repository
      </label>
      <input
        id="github-repo"
        type="text"
        bind:value={githubRepo}
        placeholder="your-repo"
        class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label
        for="github-branch"
        class="block text-sm font-medium text-gray-300 mb-2"
      >
        Branch
      </label>
      <input
        id="github-branch"
        type="text"
        bind:value={githubBranch}
        placeholder="main"
        class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div>
      <label
        for="github-token"
        class="block text-sm font-medium text-gray-300 mb-2"
      >
        GitHub Token
      </label>
      <input
        id="github-token"
        type="password"
        bind:value={githubToken}
        placeholder="ghp_xxxxxxxxx"
        class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    {#if githubError}
      <div class="text-red-400 text-sm">{githubError}</div>
    {/if}
    <button
      onclick={handleGitHubConnect}
      disabled={githubConnecting}
      class="w-full bg-[#5A4FCF] text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {githubConnecting ? '연결 중...' : '등록'}
    </button>
  </div>
</Modal>

<!-- AWS 연결 모달 -->
<Modal title="AWS 연결" bind:open={awsModalOpen}>
  <div class="space-y-4">
    <div>
      <label
        for="aws-region"
        class="block text-sm font-medium text-gray-300 mb-2"
      >
        Region
      </label>
      <input
        id="aws-region"
        type="text"
        bind:value={awsRegion}
        placeholder="ap-northeast-2"
        class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>
    <div>
      <label
        for="aws-access-key"
        class="block text-sm font-medium text-gray-300 mb-2"
      >
        Access Key ID
      </label>
      <input
        id="aws-access-key"
        type="text"
        bind:value={awsAccessKey}
        placeholder="AKIA..."
        class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>
    <div>
      <label
        for="aws-secret-key"
        class="block text-sm font-medium text-gray-300 mb-2"
      >
        Secret Access Key
      </label>
      <input
        id="aws-secret-key"
        type="password"
        bind:value={awsSecretKey}
        placeholder="xxxx"
        class="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
      />
    </div>
    {#if awsError}
      <div class="text-red-400 text-sm">{awsError}</div>
    {/if}
    <button
      onclick={handleAWSConnect}
      disabled={awsConnecting}
      class="w-full bg-[#5A4FCF] text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {awsConnecting ? '연결 중...' : '등록'}
    </button>
  </div>
</Modal>

<!-- 발사 모달 -->
<LaunchModal
  bind:open={launchModalOpen}
  disableClose={currentDeploymentState.isActive}
  backgroundTheme={currentDeploymentState.isActive ? "default" : "brown"}
>
  {#if !currentDeploymentState.isActive}
    <!-- 배포 진행 중이 아닐 때: 제어판 스타일 -->
    <ControlPanel
      {countdown}
      {buttonPressed}
      {deployConnecting}
      onDeploy={handleDeploy}
      onButtonPress={(pressed) => (buttonPressed = pressed)}
    />
  {:else}
    <!-- 배포 진행 중: 모달 안에서 애니메이션 및 로그 표시 -->
    <DeploymentDashboard
      currentStage={events.currentStage}
      hasError={events.hasError}
      isConnected={events.isConnected}
      isComplete={events.isComplete}
      events={events.events}
      deploymentId={currentDeploymentState.deploymentId || ""}
      {result}
      onReset={() => {
        // 로켓 발사 소리 중지
        if (rocketSound) {
          rocketSound.pause();
          rocketSound.currentTime = 0;
          rocketSound = null;
        }

        // 배포 상태 초기화 및 localStorage에서 제거
        currentDeployment.set({ deploymentId: null, isActive: false });
        deploymentEvents.set({
          events: [],
          currentStage: "idle",
          isConnected: false,
          isComplete: false,
          hasError: false,
        });
        result = null;
        launchModalOpen = false;
        if (eventSource) {
          closeSSEConnection(eventSource);
          eventSource = null;
        }
        // localStorage는 유지 (polling을 위해)
      }}
    />
  {/if}
</LaunchModal>
