<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { deploymentConfig, currentDeployment } from "$lib/stores/deployment";
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
  } from "$lib/api/client";
  import Modal from "$lib/components/Modal.svelte";
  import LaunchModal from "$lib/components/LaunchModal.svelte";
  import SpaceBackground from "$lib/components/SpaceBackground.svelte";
  import ControlPanel from "$lib/components/ControlPanel.svelte";
  import DeploymentDashboard from "$lib/components/DeploymentDashboard.svelte";
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

  // 더미: 연결 완료 상태로 설정 (테스트용)
  let config = $state({
    github: {
      connected: true,
      connectionId: "dummy-github-id",
      owner: "dummy-owner",
      repo: "dummy-repo",
      branch: "main",
    },
    aws: { connected: true, connectionId: "dummy-aws-id" },
    readyToDeploy: true,
  });

  // 기존 코드 (주석처리)
  // let config = $state({ github: { connected: false }, aws: { connected: false }, readyToDeploy: false });
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
	let result = $state<any>(null);
	let buttonPressed = $state(false);

  // Store 구독 및 초기화
  onMount(() => {
    // localStorage에서 배포 상태 복원
    const savedDeployment = localStorage.getItem("currentDeployment");
    if (savedDeployment) {
      try {
        const parsed = JSON.parse(savedDeployment);
        if (parsed.isActive && parsed.deploymentId) {
          currentDeploymentState = parsed;
          currentDeployment.set(parsed);
          // SSE 연결 시작
          eventSource = createSSEConnection(parsed.deploymentId);
        }
      } catch (e) {
        console.error("Failed to parse saved deployment:", e);
      }
    }

    // Store 구독 (더미 모드에서는 주석처리)
    // const unsubscribeConfig = deploymentConfig.subscribe((value) => {
    // 	config = value;
    // });
    const unsubscribeConfig = () => {}; // 더미: 빈 함수

    const unsubscribeDeployment = currentDeployment.subscribe((value) => {
      currentDeploymentState = value;
      if (value.isActive && value.deploymentId) {
        localStorage.setItem("currentDeployment", JSON.stringify(value));
      } else {
        localStorage.removeItem("currentDeployment");
      }
    });

    const unsubscribeEvents = deploymentEvents.subscribe((value) => {
      events = value;
    });

    // 배포 완료 시 결과 조회
    const checkResult = async () => {
      if (events.isComplete && currentDeploymentState.deploymentId) {
        try {
          result = await getDeploymentResult(
            currentDeploymentState.deploymentId
          );
          if (result.status === "failed") {
            events.hasError = true;
          }
          // 배포 완료 후 일정 시간 후 초기화
          setTimeout(() => {
            currentDeployment.set({ deploymentId: null, isActive: false });
            localStorage.removeItem("currentDeployment");
          }, 5000);
        } catch (error) {
          console.error("Failed to get deployment result:", error);
        }
      }
    };

    const interval = setInterval(checkResult, 2000);

    return () => {
      unsubscribeConfig();
      unsubscribeDeployment();
      unsubscribeEvents();
      clearInterval(interval);
    };
  });

	onDestroy(() => {
		if (eventSource) {
			closeSSEConnection(eventSource);
		}
	});

  // 기존 코드 (주석처리)
  /*
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

			deploymentConfig.update((config) => ({
				...config,
				github: {
					connected: true,
					connectionId: response.githubConnectionId,
					owner: githubOwner,
					repo: githubRepo,
					branch: githubBranch
				},
				readyToDeploy: config.aws.connected
			}));

			githubModalOpen = false;
		} catch (error) {
			githubError = error instanceof Error ? error.message : 'GitHub 연결에 실패했습니다.';
			console.error('GitHub connection error:', error);
		} finally {
			githubConnecting = false;
		}
	}
	*/

  // 더미 함수 (테스트용)
  async function handleGitHubConnect() {
    if (config.github.connected) {
      Swal.fire({
        icon: "info",
        title: "이미 연결됨",
        text: "GitHub는 이미 연결되어 있습니다.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
      return;
    }
    // 더미: 연결 완료 상태로 설정
    githubConnecting = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    config = {
      ...config,
      github: {
        connected: true,
        connectionId: "dummy-github-id",
        owner: githubOwner,
        repo: githubRepo,
        branch: githubBranch,
      },
      readyToDeploy: config.aws.connected,
    };
    githubConnecting = false;
    githubModalOpen = false;
    Swal.fire("GitHub 연결 성공!", "", "success");
  }

  // 기존 코드 (주석처리)
  /*
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

			deploymentConfig.update((config) => ({
				...config,
				aws: {
					connected: true,
					connectionId: response.awsConnectionId,
					region: awsRegion
				},
				readyToDeploy: config.github.connected
			}));

			awsModalOpen = false;
		} catch (error) {
			awsError = error instanceof Error ? error.message : 'AWS 연결에 실패했습니다.';
			console.error('AWS connection error:', error);
		} finally {
			awsConnecting = false;
		}
	}
	*/

  // 더미 함수 (테스트용)
  async function handleAWSConnect() {
    if (config.aws.connected) {
      Swal.fire({
        icon: "info",
        title: "이미 연결됨",
        text: "AWS는 이미 연결되어 있습니다.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
      return;
    }
    // 더미: 연결 완료 상태로 설정
    awsConnecting = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    config = {
      ...config,
      aws: { connected: true, connectionId: "dummy-aws-id" },
      readyToDeploy: config.github.connected,
    };
    awsConnecting = false;
    awsModalOpen = false;
    Swal.fire("AWS 연결 성공!", "", "success");
  }

  // 더미 이벤트 생성 함수
  function createDummySSEEvents() {
    const dummyDeploymentId = `dummy-${Date.now()}`;
    const timestamp = Math.floor(Date.now() / 1000);

    // 배포 상태 설정
    currentDeployment.set({
      deploymentId: dummyDeploymentId,
      isActive: true,
    });

    // 배포 시작 시 모달 열기
    launchModalOpen = true;

    // 초기 상태 설정
    deploymentEvents.set({
      events: [],
      currentStage: "idle",
      isConnected: true,
      isComplete: false,
      hasError: false,
    });

    // 더미 이벤트 순차 발생 (실제 SSE 스펙에 맞게)
    const dummyEvents = [
      // Stage 1: Dockerfile 탐색 및 Docker Build
      {
        type: "stage",
        message:
          "[Stage 1] Dockerfile 탐색 및 Docker Build - Repository 클론 중...",
        stage: 1,
        delay: 1000,
      },
      {
        type: "stage",
        message: "[Stage 1] Repository 클론 완료",
        stage: 1,
        details: { path: `/tmp/deployment_${timestamp}` },
        delay: 2000,
      },
      {
        type: "stage",
        message: "[Stage 1] Dockerfile 찾음",
        stage: 1,
        details: { path: `/tmp/deployment_${timestamp}/Dockerfile` },
        delay: 3000,
      },
      {
        type: "stage",
        message: "[Stage 1] Docker 이미지 빌드 완료",
        stage: 1,
        details: { imageName: `your-org-your-repo-main-${timestamp}` },
        delay: 5000,
      },

      // Stage 2: ECR Push
      {
        type: "stage",
        message: "[Stage 2] ECR에 이미지 Push 중 - ECR로 이미지 Push 중...",
        stage: 2,
        delay: 6000,
      },
      {
        type: "stage",
        message: "[Stage 2] ECR 리포지토리 확인 완료",
        stage: 2,
        details: { repository: "your-org-your-repo" },
        delay: 7000,
      },
      {
        type: "stage",
        message: "[Stage 2] ECR 로그인 완료",
        stage: 2,
        delay: 8000,
      },
      {
        type: "stage",
        message: "[Stage 2] 이미지 Push 완료",
        stage: 2,
        details: {
          uri: `123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/your-org-your-repo:your-org-your-repo-main-${timestamp}`,
        },
        delay: 10000,
      },

      // Stage 3: ECS 배포
      {
        type: "stage",
        message: "[Stage 3] ECS 배포 시작",
        stage: 3,
        details: {
          image: `123456789012.dkr.ecr.ap-northeast-2.amazonaws.com/your-org-your-repo:...`,
        },
        delay: 11000,
      },
      {
        type: "stage",
        message: "[Stage 3] ECS 서비스 생성 완료",
        stage: 3,
        details: { serviceName: "panda-service", clusterName: "panda-cluster" },
        delay: 13000,
      },
      {
        type: "stage",
        message: "[Stage 3] ECS 서비스 업데이트 완료",
        stage: 3,
        details: { serviceName: "panda-service" },
        delay: 15000,
      },

      // Stage 4: Blue/Green 배포
      {
        type: "stage",
        message: "[Stage 4] CodeDeploy Blue/Green 배포 시작",
        stage: 4,
        details: { image: "..." },
        delay: 16000,
      },
      {
        type: "stage",
        message: "[Stage 4] Blue 서비스 실행 중",
        stage: 4,
        details: { url: "http://blue.example.com" },
        delay: 17000,
      },
      {
        type: "stage",
        message: "[Stage 4] Green 서비스 시작 중",
        stage: 4,
        details: { url: "http://green.example.com" },
        delay: 18000,
      },
      {
        type: "stage",
        message: "[Stage 4] Green 서비스 준비 완료",
        stage: 4,
        details: { url: "http://green.example.com" },
        delay: 19000,
      },
      {
        type: "stage",
        message: "[Stage 4] CodeDeploy Lifecycle Hook: BeforeAllowTraffic",
        stage: 4,
        delay: 20000,
      },
      {
        type: "stage",
        message: "[Stage 4] CodeDeploy Lifecycle Hook: AfterAllowTraffic",
        stage: 4,
        delay: 21000,
      },

      // Stage 5: HealthCheck & 트래픽 전환
      {
        type: "stage",
        message: "[Stage 5] Green 서비스 HealthCheck 및 트래픽 전환",
        stage: 5,
        details: { url: "http://green.example.com" },
        delay: 22000,
      },
      {
        type: "stage",
        message: "[Stage 5] Green 서비스 HealthCheck 진행 중 - Check 1/5",
        stage: 5,
        details: { url: "http://green.example.com" },
        delay: 23000,
      },
      {
        type: "stage",
        message: "[Stage 5] Green 서비스 HealthCheck 진행 중 - Check 2/5",
        stage: 5,
        details: { url: "http://green.example.com" },
        delay: 24000,
      },
      {
        type: "stage",
        message: "[Stage 5] Green 서비스 HealthCheck 진행 중 - Check 3/5",
        stage: 5,
        details: { url: "http://green.example.com" },
        delay: 25000,
      },
      {
        type: "stage",
        message: "[Stage 5] Green 서비스 HealthCheck 진행 중 - Check 4/5",
        stage: 5,
        details: { url: "http://green.example.com" },
        delay: 26000,
      },
      {
        type: "stage",
        message: "[Stage 5] Green 서비스 HealthCheck 진행 중 - Check 5/5",
        stage: 5,
        details: { url: "http://green.example.com" },
        delay: 27000,
      },
      {
        type: "stage",
        message: "[Stage 5] HealthCheck 성공",
        stage: 5,
        details: { url: "http://green.example.com", passedChecks: 5 },
        delay: 28000,
      },
      {
        type: "stage",
        message: "[Stage 5] 트래픽 전환 중",
        stage: 5,
        details: { from: "blue", to: "green" },
        delay: 29000,
      },
      {
        type: "stage",
        message: "[Stage 5] 트래픽 전환 완료",
        stage: 5,
        details: { activeService: "green" },
        delay: 30000,
      },

      // Stage 6: 배포 완료
      {
        type: "stage",
        message: "[Stage 6] 배포 완료",
        stage: 6,
        details: {
          finalService: "green",
          blueUrl: "http://blue.example.com",
          greenUrl: "http://green.example.com",
        },
        delay: 31000,
      },
    ];

    dummyEvents.forEach((event) => {
      setTimeout(() => {
        const eventWithTimestamp: DeploymentEvent = {
          type: "stage" as DeploymentEventType,
          message: event.message,
          timestamp: new Date().toISOString(),
          details: {
            stage: event.stage,
            ...(event.details || {}),
          },
        };

        deploymentEvents.update((state) => {
          const newEvents = [...state.events, eventWithTimestamp];
          const isComplete = event.stage === 6;
          const hasError = false;

          // 현재 단계 추출
          let currentStage = state.currentStage;
          if (event.stage === 1) currentStage = "Docker Build";
          else if (event.stage === 2) currentStage = "ECR Push";
          else if (event.stage === 3) currentStage = "ECS Deployment";
          else if (event.stage === 4) currentStage = "Blue/Green";
          else if (event.stage === 5)
            currentStage = "HealthCheck & 트래픽 전환";
          else if (event.stage === 6) currentStage = "Completed";

          return {
            ...state,
            events: newEvents,
            currentStage,
            isComplete,
            hasError,
          };
        });

        // 완료 시 결과 설정
        if (event.stage === 6) {
          setTimeout(() => {
            result = {
              status: "completed",
              message: "배포가 성공적으로 완료되었습니다!",
              details: {
                deploymentId: dummyDeploymentId,
                completedAt: new Date().toISOString(),
                finalService: "green",
                blueUrl: "http://blue.example.com",
                greenUrl: "http://green.example.com",
              },
            };
          }, 1000);
        }
      }, event.delay);
    });
  }

  async function handleDeploy() {
    console.log("=== handleDeploy START ===", {
      githubConnected: config.github.connected,
      awsConnected: config.aws.connected,
      isActive: currentDeploymentState.isActive,
      countdown,
    });

    // 더미 모드: 모든 조건 체크 완전히 우회
    // if (!config.github.connected || !config.aws.connected) {
    // 	Swal.fire({
    // 		icon: 'warning',
    // 		title: '발사 준비 미완료',
    // 		text: 'GitHub와 AWS 연결을 먼저 완료해주세요.',
    // 		confirmButtonColor: '#dc2626',
    // 		confirmButtonText: '확인'
    // 	});
    // 	return;
    // }

    // if (currentDeploymentState.isActive) {
    // 	Swal.fire({
    // 		icon: 'info',
    // 		title: '배포 진행 중',
    // 		text: '이미 배포가 진행 중입니다.',
    // 		confirmButtonColor: '#dc2626',
    // 		confirmButtonText: '확인'
    // 	});
    // 	return;
    // }

    // 더미 모드: 카운트다운 체크도 완전히 우회
    // if (countdown !== null) {
    // 	console.log('Countdown in progress, skipping...');
    // 	return;
    // }

    console.log("Starting countdown...");

    // 효과음 로드 및 재생
    const countdownSound = new Audio("/CountDown.mp3");
    countdownSound.volume = 0.7;

    // 카운트다운 시작 (5부터 시작)
    countdown = 5;
    console.log("Countdown set to:", countdown);

    try {
      await countdownSound.play();
      console.log("Countdown sound playing");
    } catch (e) {
      console.error("Failed to play countdown sound:", e);
    }

    for (let i = 5; i > 0; i--) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (i > 1) {
        countdown = i - 1;
        console.log("Countdown:", countdown);
      } else {
        countdown = null;
        console.log("Countdown finished");
      }
    }

    deployConnecting = true;
    deployError = "";
    result = null; // 이전 결과 초기화

    // 더미 모드: 실제 API 호출 대신 더미 이벤트 생성
    try {
      // 실제 API 호출 시도 (실패해도 무시)
      try {
        const githubConfig = config.github as {
          connected: boolean;
          connectionId?: string;
          owner?: string;
          repo?: string;
          branch?: string;
        };
        const awsConfig = config.aws as {
          connected: boolean;
          connectionId?: string;
          region?: string;
        };

        const response = await startDeployment({
          githubConnectionId: githubConfig.connectionId!,
          awsConnectionId: awsConfig.connectionId!,
          owner: githubConfig.owner!,
          repo: githubConfig.repo!,
          branch: githubConfig.branch || "main",
        });

        currentDeployment.set({
          deploymentId: response.deploymentId,
          isActive: true,
        });

        launchModalOpen = true;
        eventSource = createSSEConnection(response.deploymentId);
      } catch (error) {
        // API 호출 실패 시 더미 모드로 전환
        console.log("API 호출 실패, 더미 모드로 전환:", error);
        createDummySSEEvents();
      }
    } catch (error) {
      deployError =
        error instanceof Error ? error.message : "배포 시작에 실패했습니다.";
      console.error("Deployment start error:", error);
    } finally {
      deployConnecting = false;
    }
  }
</script>

<div class="min-h-screen relative">
  <!-- 우주 배경 -->
  <SpaceBackground />

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
          onclick={() => {
            // 배포 상태를 초기화하여 ControlPanel이 보이도록
            currentDeployment.set({ deploymentId: null, isActive: false });
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
      class="w-full bg-[#5A4FCF] text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
    >
      등록
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
      class="w-full bg-[#5A4FCF] text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
    >
      등록
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
        // 배포 상태 초기화
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
        localStorage.removeItem("currentDeployment");
      }}
    />
  {/if}
</LaunchModal>
