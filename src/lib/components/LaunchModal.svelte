<script lang="ts">
	interface Props {
		open?: boolean;
		disableClose?: boolean; // 배포 진행 중일 때 닫기 방지
		backgroundTheme?: 'default' | 'brown'; // 배경 테마
	}

	let { open = $bindable(false), disableClose = false, backgroundTheme = 'default' }: Props = $props();

	function handleClose() {
		if (!disableClose) {
			open = false;
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget && !disableClose) {
			handleClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && !disableClose) {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
		onclick={handleBackdropClick}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter') {
				handleBackdropClick(e as any);
			}
		}}
		role="dialog"
		aria-modal="true"
		aria-labelledby="launch-modal-title"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="relative rounded-xl shadow-2xl max-w-5xl w-full mx-4 transform transition-all border-2 launch-modal-container {backgroundTheme === 'brown' ? 'border-gray-600/50' : 'border-purple-500/30'}"
			onmousedown={(e) => e.stopPropagation()}
			role="region"
		>
			<!-- 배경 레이어 -->
			<div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
				{#if backgroundTheme === 'brown'}
					<!-- 산업용 제어판 배경 (어두운 회색, 메쉬 텍스처) -->
					<div class="absolute inset-0 bg-gradient-to-br from-gray-800/95 via-gray-700/95 to-gray-800/95"></div>
					<div class="absolute inset-0 bg-gray-900/80"></div>
					<!-- 메쉬/탄소섬유 텍스처 -->
					<div class="absolute inset-0 opacity-20" style="background-image:
						repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
						repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);"></div>
				{:else}
					<!-- 기본 보라색 배경 -->
					<div class="absolute inset-0 bg-gradient-to-br from-purple-950/95 via-black/95 to-indigo-950/95"></div>
					<div class="absolute inset-0 bg-black/40"></div>
				{/if}
			</div>

			<!-- 닫기 버튼 (배포 진행 중이 아닐 때만 표시) -->
			{#if !disableClose}
				<button
					onclick={handleClose}
					type="button"
					class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20 pointer-events-auto bg-black/30 hover:bg-black/50 rounded-full p-2"
					aria-label="모달 닫기"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}

			<!-- 모달 내용 -->
			<div class="relative z-10 p-8 h-full flex items-stretch">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style>
	.launch-modal-container {
		backdrop-filter: blur(10px);
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		height: min(90vh, 820px);
	}

	.launch-modal-container[class*="border-gray"] {
		box-shadow: 0 0 30px rgba(75, 85, 99, 0.3), 0 0 60px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.2);
	}

	.launch-modal-container[class*="border-purple"] {
		box-shadow: 0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(0, 0, 0, 0.5);
	}

	.launch-modal-container::-webkit-scrollbar {
		width: 8px;
	}

	.launch-modal-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	.launch-modal-container::-webkit-scrollbar-thumb {
		background: rgba(139, 92, 246, 0.5);
		border-radius: 4px;
	}

	.launch-modal-container::-webkit-scrollbar-thumb:hover {
		background: rgba(139, 92, 246, 0.7);
	}
</style>

