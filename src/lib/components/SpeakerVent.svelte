<script lang="ts">
	interface Props {
		type: 'speaker' | 'vent';
	}

	let { type }: Props = $props();
</script>

<div class="relative w-40 h-40 bg-gradient-to-br from-gray-600 via-gray-650 to-gray-700 border-2 border-gray-500/50 rounded-lg shadow-2xl" style="box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);">
	{#if type === 'speaker'}
		<!-- 스피커 그릴 (원형 메쉬) -->
		<div class="absolute inset-2 flex items-center justify-center">
			<svg class="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="50" cy="50" r="40" fill="#374151" stroke="#4B5563" stroke-width="1" opacity="0.9"/>
				<circle cx="50" cy="50" r="30" fill="#1F2937" opacity="0.6"/>
				<circle cx="50" cy="50" r="20" fill="#111827" opacity="0.8"/>
				<!-- 메쉬 패턴 -->
				<defs>
					<pattern id="speaker-mesh-{type}" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
						<circle cx="5" cy="5" r="1" fill="#6B7280" opacity="0.4"/>
					</pattern>
					<radialGradient id="speaker-glow-{type}" cx="50%" cy="50%">
						<stop offset="0%" stop-color="#4B5563" stop-opacity="0.3"/>
						<stop offset="100%" stop-color="#1F2937" stop-opacity="0"/>
					</radialGradient>
				</defs>
				<circle cx="50" cy="50" r="40" fill="url(#speaker-mesh-{type})"/>
				<circle cx="50" cy="50" r="40" fill="url(#speaker-glow-{type})"/>
			</svg>
		</div>
	{:else}
		<!-- 벤트 그릴 (원형 구멍들) -->
		<div class="absolute inset-3 flex items-center justify-center">
			<div class="grid grid-cols-4 gap-3 place-items-center" style="width: calc(100% - 0.5rem); height: calc(100% - 0.5rem);">
				{#each Array(16) as _}
					<div class="w-3 h-3 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 rounded-full mx-auto shadow-inner" style="box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 1px rgba(255, 255, 255, 0.1);"></div>
				{/each}
			</div>
		</div>
	{/if}
	<!-- 나사 4개 -->
	<div class="absolute top-1 left-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);"></div>
	<div class="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);"></div>
	<div class="absolute bottom-1 left-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);"></div>
	<div class="absolute bottom-1 right-1 w-2.5 h-2.5 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2);"></div>
</div>

