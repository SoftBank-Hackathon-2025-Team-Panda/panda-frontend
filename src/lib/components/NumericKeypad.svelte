<script lang="ts">
	interface Props {
		onKeyPress?: (key: string) => void;
	}

	let { onKeyPress }: Props = $props();

	const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

	function handleClick(key: string) {
		if (onKeyPress) {
			onKeyPress(key);
		}
	}
</script>

<div class="relative w-56 h-80 bg-gradient-to-br from-gray-700 via-gray-750 to-gray-800 border-2 border-gray-500/50 rounded-lg p-4 flex items-center justify-center shadow-2xl" style="box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);">
	<div class="grid grid-cols-3 gap-3 place-items-center">
		{#each keys as key}
			<button
				onclick={() => handleClick(key)}
				class="w-14 h-14 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-full border border-gray-400/50 text-white font-bold text-xl flex items-center justify-center transition-all duration-200 hover:scale-110 hover:brightness-110 active:scale-95"
				style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.3);"
			>
				{key}
			</button>
		{/each}
	</div>
	<!-- 나사 4개 -->
	<div class="absolute top-1 left-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);"></div>
	<div class="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);"></div>
	<div class="absolute bottom-1 left-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);"></div>
	<div class="absolute bottom-1 right-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);"></div>
</div>

