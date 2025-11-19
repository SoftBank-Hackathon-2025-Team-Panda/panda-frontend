<script lang="ts">
	let indicators = $state([
		{ light: 'red' },
		{ light: 'green' },
		{ light: 'red' },
		{ light: 'red' },
		{ light: 'green' },
		{ light: 'green' },
		{ light: 'green' }
	]);

	function toggleLight(index: number) {
		indicators[index].light = indicators[index].light === 'red' ? 'green' : 'red';
	}
</script>

<div class="flex items-center gap-4">
	{#each indicators as item, index}
		<div class="flex flex-col items-center gap-2">
			<!-- 표시등 -->
			<div
				class="w-4 h-4 rounded-full {item.light === 'red' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-green-500 shadow-lg shadow-green-500/50'}"
				style="box-shadow: {item.light === 'red' ? '0 0 12px rgba(239, 68, 68, 0.8), 0 0 24px rgba(239, 68, 68, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)' : '0 0 12px rgba(34, 197, 94, 0.8), 0 0 24px rgba(34, 197, 94, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'};"
			></div>
			<!-- 버튼 -->
			<button
				onclick={() => toggleLight(index)}
				class="w-12 h-12 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 rounded-full border-2 border-gray-600/50 shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
				style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.3);"
				aria-label={`표시등 ${index + 1} 토글`}
			></button>
		</div>
	{/each}
</div>

