<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let { title, open = $bindable(false), children }: { title?: string; open?: boolean; children?: import('svelte').Snippet } = $props();

	const dispatch = createEventDispatcher();

	function handleClose() {
		open = false;
		dispatch('close');
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity"
		onclick={handleBackdropClick}
		onkeydown={(e) => {
			if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
				handleBackdropClick(e as any);
			}
		}}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="relative rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all border border-purple-500/20 modal-container"
			onmousedown={(e) => e.stopPropagation()}
			role="region"
		>
			<!-- 배경 -->
			<div class="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
				<div class="absolute inset-0 bg-purple-950/98"></div>
				<div class="absolute inset-0 bg-black/10"></div>
			</div>

			<!-- Close Button -->
			<button
				onclick={handleClose}
				type="button"
				class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20 pointer-events-auto"
				aria-label="Close modal"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>

			<!-- Title -->
			{#if title}
				<h2 id="modal-title" class="text-2xl font-semibold mb-6 pr-8 text-white relative z-10">
					{title}
				</h2>
			{/if}

			<!-- Content -->
			<div class="relative z-10">
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-container {
		backdrop-filter: blur(10px);
		box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
	}
</style>

