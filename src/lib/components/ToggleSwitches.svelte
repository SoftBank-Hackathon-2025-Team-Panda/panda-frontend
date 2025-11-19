<script lang="ts">
	const switchCount = 6;
</script>

<div class="grid grid-cols-2 grid-rows-3 gap-6">
	{#each Array(switchCount) as _, i}
		<div class="relative">
			<div class="w-16 h-16 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-full border-2 border-red-900/50 shadow-2xl" style="box-shadow: 0 8px 16px rgba(220, 38, 38, 0.4), 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.4);">
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="w-2.5 h-2.5 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full shadow-inner" style="box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(255, 255, 255, 0.5);"></div>
				</div>
			</div>
			<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-gradient-to-b from-gray-700 to-gray-800 rounded shadow-lg" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(0, 0, 0, 0.5);"></div>
		</div>
	{/each}
</div>

