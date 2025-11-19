<script lang="ts">
  interface Props {
    countdown: number | null;
    inputValue?: string;
  }

  let { countdown = null, inputValue = "" }: Props = $props();

  // 디버깅용
  $effect(() => {
    console.log("ControlScreen countdown changed:", countdown);
  });
</script>

<div
  class="relative w-96 h-56 bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 border-4 border-gray-500/50 rounded-lg shadow-2xl"
  style="box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);"
>
  <!-- 화면 내용 -->
  <div
    class="absolute inset-2 bg-gradient-to-br from-black via-gray-950 to-black rounded p-4 flex flex-col justify-between border border-gray-800/50"
    style="box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.5);"
  >
    {#if countdown !== null}
      <!-- 카운트다운 표시 -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="relative w-32 h-32 flex items-center justify-center">
          <!-- 원형 배경 -->
          <div
            class="absolute inset-0 w-32 h-32 rounded-full border-4 border-white/50 bg-white/10 animate-pulse aspect-square"
            style="box-shadow: 0 0 40px rgba(255, 255, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2); width: 8rem; height: 8rem;"
          ></div>
          <!-- 숫자 -->
          <div
            class="relative text-center text-8xl font-bold text-white drop-shadow-2xl animate-pulse flex items-center justify-center"
            style="text-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4);"
          >
            {countdown}
          </div>
        </div>
      </div>
    {:else}
      <div class="text-white font-mono text-sm tracking-wider drop-shadow-lg">
        CONTROL PANEL
      </div>
      <div
        class="text-white font-mono text-xs text-gray-400 flex items-center"
      >
        {#if inputValue}
          <span class="text-green-400 font-mono text-lg tracking-wider"
            >{inputValue}</span
          >
        {/if}
        <span
          class="inline-block w-2 h-4 bg-green-400 animate-pulse drop-shadow-lg"
          style="box-shadow: 0 0 8px rgba(74, 222, 128, 0.8);"
        ></span>
      </div>
    {/if}
  </div>
  <!-- 나사 4개 -->
  <div
    class="absolute top-1 left-1 w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 shadow-md"
    style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);"
  ></div>
  <div
    class="absolute top-1 right-1 w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 shadow-md"
    style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);"
  ></div>
  <div
    class="absolute bottom-1 left-1 w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 shadow-md"
    style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);"
  ></div>
  <div
    class="absolute bottom-1 right-1 w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 shadow-md"
    style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);"
  ></div>
</div>
