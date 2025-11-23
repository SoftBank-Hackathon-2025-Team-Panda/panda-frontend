<script lang="ts">
  import type { DeploymentResultData } from "$lib/api/client";
  import { switchTraffic } from "$lib/api/client";
  import Swal from "sweetalert2";

  interface Props {
    result: DeploymentResultData | null;
    deploymentId?: string | null;
  }

  let { result, deploymentId = null }: Props = $props();

  // 정보창 표시 상태
  let blueInfoOpen = $state(false);
  let greenInfoOpen = $state(false);
  let isSwitching = $state(false);

  // blue와 green 정보가 있는지 확인 (URL만 있어도 됨)
  const hasBlue = $derived(!!result?.blueUrl);
  const hasGreen = $derived(!!result?.greenUrl);
  const hasBoth = $derived(hasBlue && hasGreen);

  // deploymentId와 hasBoth가 모두 true인지 확인 (반응형)
  const showManualSwitchButton = $derived(!!deploymentId && hasBoth);

  // fasterService에 따라 레이저 길이 비율 결정 (8:2 또는 2:8)
  // left-[30%]와 right-[30%] 사이의 거리 = 40vw, 우주선 너비 80px씩 제외
  // 전체 레이저 거리 = 40vw - 160px
  const totalLaserDistance = $derived(hasBoth ? "calc(40vw - 160px)" : "0px");

  const blueLaserRatio = $derived(
    hasBoth && result?.fasterService === "blue" ? 0.8 : 0.2
  );
  const greenLaserRatio = $derived(
    hasBoth && result?.fasterService === "green" ? 0.8 : 0.2
  );

  // 레이저 너비 계산: 전체 거리의 비율
  const blueLaserWidth = $derived(
    hasBoth ? `calc(${totalLaserDistance} * ${blueLaserRatio})` : "0px"
  );
  const greenLaserWidth = $derived(
    hasBoth ? `calc(${totalLaserDistance} * ${greenLaserRatio})` : "0px"
  );

  // 레이저 점 개수 계산 (거리당 적절한 개수)
  // fasterService에 따라 더 많은 점이 발사됨
  const blueDotCount = $derived(
    hasBoth
      ? result?.fasterService === "blue"
        ? 12 // 빠른 서비스는 더 많은 점
        : 4
      : 0
  );
  const greenDotCount = $derived(
    hasBoth
      ? result?.fasterService === "green"
        ? 12 // 빠른 서비스는 더 많은 점
        : 4
      : 0
  );

  // 레이저 충돌 지점 계산 (두 레이저가 만나는 지점)
  // Blue 우주선: left 30%, width 80px
  // Blue 레이저 시작: left calc(30% + 80px)
  // Blue 레이저 끝: left calc(30% + 80px + blueLaserWidth)
  //
  // Green 우주선: right 30%, width 80px
  // Green 우주선 왼쪽 끝: left calc(100% - 30% - 80px) = left calc(70% - 80px)
  // Green 레이저 시작: right calc(30% + 80px) = left calc(100% - 30% - 80px)
  // Green 레이저 끝: left calc(70% - 80px - greenLaserWidth)
  //
  // 충돌 지점 = Blue 레이저 끝점 = Green 레이저 끝점이 만나는 곳
  // fasterService가 blue면: blue=80%, green=20%
  // fasterService가 green이면: blue=20%, green=80%
  const collisionPoint = $derived(
    hasBoth
      ? result?.fasterService === "blue"
        ? `calc(30% + 80px + (40vw - 160px) * 0.8)`
        : `calc(30% + 80px + (40vw - 160px) * 0.2)`
      : "50%"
  );

  function toggleBlueInfo() {
    blueInfoOpen = !blueInfoOpen;
  }

  function toggleGreenInfo() {
    greenInfoOpen = !greenInfoOpen;
  }

  async function handleManualSwitch() {
    if (!deploymentId) {
      Swal.fire({
        icon: "error",
        title: "오류",
        text: "배포 ID가 없습니다.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      icon: "question",
      title: "수동 전환",
      text: "트래픽을 전환하시겠습니까? (Blue/Green 배포)",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "전환",
      cancelButtonText: "취소",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    isSwitching = true;
    try {
      await switchTraffic(deploymentId);
      Swal.fire({
        icon: "success",
        title: "전환 완료",
        text: "트래픽 전환이 시작되었습니다.",
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "확인",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "전환 실패",
        text:
          error instanceof Error
            ? error.message
            : "트래픽 전환에 실패했습니다.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "확인",
      });
    } finally {
      isSwitching = false;
    }
  }
</script>

{#if result && (hasBlue || hasGreen)}
  <div class="fixed inset-0 pointer-events-none z-20">
    {#if hasBoth}
      <!-- Blue와 Green 둘 다 있는 경우: 레이저 전투 애니메이션 -->
      <!-- 모든 요소를 absolute로 고정하여 한 줄 정렬 -->
      {@const fixedY = "calc(75% + 50px)"}
      <!-- 50px 더 아래로 -->
      {@const rocketHeadOffset = 6}
      <!-- viewBox 24x32에서 머리 y=2, 회전 후 96px * 2/32 = 6px -->

      <!-- Blue 우주선 (왼쪽, 오른쪽을 향함, 좌우 반전) -->
      <button
        type="button"
        class="absolute pointer-events-auto cursor-pointer bg-transparent border-none p-0"
        style="left: 30%; top: {fixedY}; transform: translateY(-50%); z-index: 5;"
        onclick={toggleBlueInfo}
        onkeydown={(e) => e.key === "Enter" && toggleBlueInfo()}
        aria-label="Blue Service 정보 보기"
      >
        <!-- 우주선 SVG (파란색, 오른쪽을 향함 - 레이저 방향을 봄) -->
        <!-- 원래 위를 향하는 우주선을 오른쪽으로 90도 회전하여 오른쪽을 향하게 함 -->
        <div style="transform: rotate(90deg); transform-origin: center;">
          <svg
            class="w-20 h-24 text-blue-400 drop-shadow-2xl"
            viewBox="0 0 24 32"
            fill="none"
            style="filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.9));"
          >
            <path
              d="M12 2L8 8L12 12L16 8L12 2Z"
              fill="currentColor"
              class="drop-shadow-lg"
            />
            <circle cx="12" cy="6" r="2" fill="#1e40af" />
            <path d="M8 8L6 12L8 16L10 12L8 8Z" fill="#3b82f6" />
            <path d="M16 8L18 12L16 16L14 12L16 8Z" fill="#3b82f6" />
          </svg>
        </div>
      </button>

      <!-- Blue 레이저 점들 (우주선에서 Green 우주선 방향으로 발사) -->
      <div
        class="absolute laser-dots-container blue-dots-container"
        style="left: calc(30% + 80px); top: calc(75% + 56px); transform: translateY(calc(-50% - 6px)); z-index: 4; pointer-events: none; --blue-distance: calc((40vw - 160px) * {blueLaserRatio});"
      >
        {#each Array(blueDotCount) as _, i}
          <div
            class="laser-dot blue-dot"
            style="animation-delay: {i *
              (result?.fasterService === 'blue' ? 0.15 : 0.3)}s;"
          ></div>
        {/each}
      </div>

      <!-- Blue 정보창 (우주선 왼쪽에 배치) -->
      {#if blueInfoOpen && hasBlue}
        <div
          class="absolute bg-gray-900/95 backdrop-blur-lg border-2 border-blue-400 rounded-lg p-4 shadow-2xl pointer-events-auto min-w-[250px] max-w-[300px] z-30"
          style="left: calc(30% - 300px); top: {fixedY}; transform: translateY(-50%);"
        >
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-blue-400 font-bold text-lg">Blue Service</h3>
            <button
              type="button"
              onclick={toggleBlueInfo}
              class="text-gray-400 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="space-y-2 text-sm text-gray-300">
            {#if result.blueUrl}
              <div class="break-words">
                <span class="text-gray-500">URL:</span>
                <a
                  href={result.blueUrl}
                  target="_blank"
                  class="text-blue-400 hover:underline ml-2 break-all"
                >
                  {result.blueUrl}
                </a>
              </div>
            {/if}
            {#if result.blueLatencyMs !== null}
              <div>
                <span class="text-gray-500">Latency:</span>
                <span class="text-white ml-2">{result.blueLatencyMs}ms</span>
              </div>
            {/if}
            {#if result.blueErrorRate !== null}
              <div>
                <span class="text-gray-500">Error Rate:</span>
                <span class="text-white ml-2"
                  >{(result.blueErrorRate * 100).toFixed(2)}%</span
                >
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- Green 우주선 (오른쪽, 왼쪽을 향함, 좌우 반전) -->
      <button
        type="button"
        class="absolute pointer-events-auto cursor-pointer bg-transparent border-none p-0"
        style="right: 30%; top: {fixedY}; transform: translateY(-50%); z-index: 5;"
        onclick={toggleGreenInfo}
        onkeydown={(e) => e.key === "Enter" && toggleGreenInfo()}
        aria-label="Green Service 정보 보기"
      >
        <!-- 우주선 SVG (초록색, 왼쪽을 향함 - 레이저 방향을 봄) -->
        <!-- 원래 위를 향하는 우주선을 왼쪽으로 90도 회전하여 왼쪽을 향하게 함, 좌우 반전 -->
        <div
          style="transform: rotate(-90deg) scaleX(-1); transform-origin: center;"
        >
          <svg
            class="w-20 h-24 text-green-400 drop-shadow-2xl"
            viewBox="0 0 24 32"
            fill="none"
            style="filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.9));"
          >
            <path
              d="M12 2L8 8L12 12L16 8L12 2Z"
              fill="currentColor"
              class="drop-shadow-lg"
            />
            <circle cx="12" cy="6" r="2" fill="#065f46" />
            <path d="M8 8L6 12L8 16L10 12L8 8Z" fill="#16a34a" />
            <path d="M16 8L18 12L16 16L14 12L16 8Z" fill="#16a34a" />
          </svg>
        </div>
      </button>

      <!-- Green 레이저 점들 (우주선에서 Blue 우주선 방향으로 발사) -->
      <div
        class="absolute laser-dots-container green-dots-container"
        style="right: calc(30% + 80px); top: calc(75% + 56px); transform: translateY(calc(-50% - 6px)); z-index: 4; pointer-events: none; --green-distance: calc((40vw - 160px) * {greenLaserRatio});"
      >
        {#each Array(greenDotCount) as _, i}
          <div
            class="laser-dot green-dot"
            style="animation-delay: {i *
              (result?.fasterService === 'green' ? 0.15 : 0.3)}s;"
          ></div>
        {/each}
      </div>

      <!-- Green 정보창 (우주선 왼쪽에 배치) -->
      {#if greenInfoOpen && hasGreen}
        <div
          class="absolute bg-gray-900/95 backdrop-blur-lg border-2 border-green-400 rounded-lg p-4 shadow-2xl pointer-events-auto min-w-[250px] max-w-[300px] z-30"
          style="left: calc(70%); top: {fixedY}; transform: translateY(-50%);"
        >
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-green-400 font-bold text-lg">Green Service</h3>
            <button
              type="button"
              onclick={toggleGreenInfo}
              class="text-gray-400 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="space-y-2 text-sm text-gray-300">
            {#if result.greenUrl}
              <div class="break-words">
                <span class="text-gray-500">URL:</span>
                <a
                  href={result.greenUrl}
                  target="_blank"
                  class="text-green-400 hover:underline ml-2 break-all"
                >
                  {result.greenUrl}
                </a>
              </div>
            {/if}
            {#if result.greenLatencyMs !== null}
              <div>
                <span class="text-gray-500">Latency:</span>
                <span class="text-white ml-2">{result.greenLatencyMs}ms</span>
              </div>
            {/if}
            {#if result.greenErrorRate !== null}
              <div>
                <span class="text-gray-500">Error Rate:</span>
                <span class="text-white ml-2"
                  >{(result.greenErrorRate * 100).toFixed(2)}%</span
                >
              </div>
            {/if}
          </div>
        </div>
      {/if}

      <!-- 수동 전환 버튼 (레이저 충돌 지점 아래 중앙) -->
       {#if showManualSwitchButton}
        <button
          type="button"
          onclick={handleManualSwitch}
          disabled={isSwitching}
          class="absolute pointer-events-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-yellow-400 disabled:to-orange-400 text-white font-bold rounded-lg shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed z-30"
          style="left: calc(30% + 300px); top: calc(80% + 50px); transform: translateX(-50%) translateY(0);"
          aria-label="수동 트래픽 전환"
        >
          {#if isSwitching}
            <span class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              전환 중...
            </span>
          {:else}
            Blue to Green
          {/if}
        </button>
      {/if}
    {:else if hasGreen}
      <!-- Green만 있는 경우: x방향으로 직선 이동하는 우주선 (UFO 아래 배치) -->
      <div
        class="absolute pointer-events-none animate-green-rocket-fly"
        style="top: 75%; animation-duration: 25s; animation-iteration-count: infinite; animation-timing-function: linear; z-index: 5;"
      >
        <!-- 발사 때 사용한 우주선 SVG (초록색, 오른쪽으로 90도 회전) -->
        <button
          type="button"
          class="relative pointer-events-auto cursor-pointer bg-transparent border-none p-0"
          onclick={toggleGreenInfo}
          onkeydown={(e) => e.key === "Enter" && toggleGreenInfo()}
          aria-label="Green Service 정보 보기"
        >
          <div
            class="relative rocket-horizontal"
            style="transform: rotate(90deg); transform-origin: center;"
          >
            <svg
              class="w-20 h-24 text-green-400 drop-shadow-2xl"
              viewBox="0 0 24 32"
              fill="none"
              style="filter: drop-shadow(0 0 12px rgba(34, 197, 94, 0.9));"
            >
              <!-- 본체 -->
              <path
                d="M12 2L8 8L12 12L16 8L12 2Z"
                fill="currentColor"
                class="drop-shadow-lg"
              />
              <!-- 창문 -->
              <circle cx="12" cy="6" r="2" fill="#065f46" />
              <!-- 날개 -->
              <path d="M8 8L6 12L8 16L10 12L8 8Z" fill="#16a34a" />
              <path d="M16 8L18 12L16 16L14 12L16 8Z" fill="#16a34a" />
            </svg>
          </div>
        </button>

        <!-- Green 정보창 (로켓 기준 오른쪽 위에 붙여서 배치, 로켓과 함께 이동) -->
        {#if greenInfoOpen && hasGreen}
          <div
            class="absolute bg-gray-900/95 backdrop-blur-lg border-2 border-green-400 rounded-lg p-4 shadow-2xl pointer-events-auto min-w-[250px] z-30"
            style="left: 120%; top: -150px;"
          >
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-green-400 font-bold text-lg">Green Service</h3>
              <button
                type="button"
                onclick={toggleGreenInfo}
                class="text-gray-400 hover:text-white transition-colors"
                aria-label="닫기"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="space-y-2 text-sm text-gray-300">
              {#if result.greenUrl}
                <div>
                  <span class="text-gray-500">URL:</span>
                  <a
                    href={result.greenUrl}
                    target="_blank"
                    class="text-green-400 hover:underline ml-2"
                  >
                    {result.greenUrl}
                  </a>
                </div>
              {/if}
              {#if result.greenLatencyMs !== null}
                <div>
                  <span class="text-gray-500">Latency:</span>
                  <span class="text-white ml-2">{result.greenLatencyMs}ms</span>
                </div>
              {/if}
              {#if result.greenErrorRate !== null}
                <div>
                  <span class="text-gray-500">Error Rate:</span>
                  <span class="text-white ml-2"
                    >{(result.greenErrorRate * 100).toFixed(2)}%</span
                  >
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* 레이저 점 컨테이너 */
  .laser-dots-container {
    position: absolute;
    overflow: visible;
    pointer-events: none;
  }

  /* 레이저 점 스타일 */
  .laser-dot {
    position: absolute;
    border-radius: 50%;
    animation: laserDotShoot 1.5s linear infinite;
  }

  /* Blue 레이저 점 */
  .blue-dot {
    width: 6px;
    height: 6px;
    background: radial-gradient(
      circle,
      rgba(191, 219, 254, 1) 0%,
      rgba(96, 165, 250, 0.8) 50%,
      transparent 100%
    );
    box-shadow:
      0 0 8px rgba(96, 165, 250, 1),
      0 0 16px rgba(96, 165, 250, 0.8),
      0 0 24px rgba(96, 165, 250, 0.6);
    left: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Green 레이저 점 */
  .green-dot {
    width: 6px;
    height: 6px;
    background: radial-gradient(
      circle,
      rgba(187, 247, 208, 1) 0%,
      rgba(52, 211, 153, 0.8) 50%,
      transparent 100%
    );
    box-shadow:
      0 0 8px rgba(52, 211, 153, 1),
      0 0 16px rgba(52, 211, 153, 0.8),
      0 0 24px rgba(52, 211, 153, 0.6);
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Blue 점들이 오른쪽으로 발사되는 애니메이션 */
  .blue-dots-container .blue-dot {
    animation: laserDotShootRight 1.2s linear infinite;
  }

  /* Green 점들이 왼쪽으로 발사되는 애니메이션 */
  .green-dots-container .green-dot {
    animation: laserDotShootLeft 1.2s linear infinite;
  }

  /* Blue 점 발사 애니메이션 (왼쪽에서 오른쪽으로) */
  /* fasterService에 따라 8:2 또는 2:8 비율로 거리 결정 */
  @keyframes laserDotShootRight {
    0% {
      transform: translate(0, -50%) scale(0.8);
      opacity: 0;
    }
    5% {
      opacity: 1;
      transform: translate(0, -50%) scale(1.1);
    }
    15% {
      opacity: 1;
      transform: translate(calc(var(--blue-distance) * 0.1), -50%) scale(1);
    }
    85% {
      opacity: 1;
      transform: translate(calc(var(--blue-distance) * 0.9), -50%) scale(0.9);
    }
    95% {
      opacity: 0.5;
      transform: translate(var(--blue-distance), -50%) scale(0.7);
    }
    100% {
      transform: translate(var(--blue-distance), -50%) scale(0.5);
      opacity: 0;
    }
  }

  /* Green 점 발사 애니메이션 (오른쪽에서 왼쪽으로) */
  /* fasterService에 따라 8:2 또는 2:8 비율로 거리 결정 */
  @keyframes laserDotShootLeft {
    0% {
      transform: translate(0, -50%) scale(0.8);
      opacity: 0;
    }
    5% {
      opacity: 1;
      transform: translate(0, -50%) scale(1.1);
    }
    15% {
      opacity: 1;
      transform: translate(calc(var(--green-distance) * -0.1), -50%) scale(1);
    }
    85% {
      opacity: 1;
      transform: translate(calc(var(--green-distance) * -0.9), -50%) scale(0.9);
    }
    95% {
      opacity: 0.5;
      transform: translate(calc(var(--green-distance) * -1), -50%) scale(0.7);
    }
    100% {
      transform: translate(calc(var(--green-distance) * -1), -50%) scale(0.5);
      opacity: 0;
    }
  }

  /* Green 우주선 x방향 직선 이동 애니메이션 (UFO와 비슷한 위치, 아래쪽) */
  @keyframes green-rocket-fly {
    0% {
      left: -10%;
      opacity: 0;
    }
    5% {
      opacity: 1;
    }
    95% {
      opacity: 1;
    }
    100% {
      left: 110%;
      opacity: 0;
    }
  }

  .animate-green-rocket-fly {
    animation: green-rocket-fly linear infinite;
  }

  /* 우주선을 90도 회전한 상태 */
  .rocket-horizontal {
    transform: rotate(90deg);
    transform-origin: center;
  }
</style>
