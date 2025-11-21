<script lang="ts">
	interface Props {
		countdown: number | null;
		buttonPressed: boolean;
		deployConnecting: boolean;
		onDeploy: () => void;
		onButtonPress: (pressed: boolean) => void;
	}

	let {
		countdown,
		buttonPressed,
		deployConnecting,
		onDeploy,
		onButtonPress
	}: Props = $props();
</script>

<div class="relative w-[12.6rem] h-[12.6rem]">
	<!-- 메탈 프레임 -->
	<div class="absolute -inset-4 bg-gradient-to-br from-gray-600 via-gray-650 to-gray-700 border-2 border-gray-500/50 rounded-lg shadow-2xl z-0" style="box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);">
		<!-- 나사 4개 -->
		<div class="absolute top-1 left-1 w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);"></div>
		<div class="absolute top-1 right-1 w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);"></div>
		<div class="absolute bottom-1 left-1 w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);"></div>
		<div class="absolute bottom-1 right-1 w-3 h-3 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full border-2 border-gray-600 shadow-md" style="box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.3);"></div>
	</div>
	<!-- 노란색-검은색 대각선 줄무늬 배경 -->
	<div class="absolute inset-0 rounded-lg border-4 border-black launch-button-bg shadow-2xl z-0" style="box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(251, 191, 36, 0.2);"></div>

	<!-- 발사 버튼 -->
	<button
		onclick={(e) => {
			e.preventDefault();
			e.stopPropagation();
			if (onDeploy) {
				onDeploy();
			}
		}}
		onmousedown={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onButtonPress(true);
		}}
		onmouseup={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onButtonPress(false);
		}}
		onmouseleave={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onButtonPress(false);
		}}
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[11.6rem] h-[11.6rem] rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-800 transition-all shadow-2xl group {buttonPressed && countdown === null ? 'scale-95 ' : 'scale-100'} z-50 cursor-pointer"
		style="box-shadow: 0 12px 32px rgba(220, 38, 38, 0.5), 0 6px 16px rgba(0, 0, 0, 0.4), inset 0 3px 6px rgba(255, 255, 255, 0.2), inset 0 -3px 6px rgba(0, 0, 0, 0.4); pointer-events: auto !important;"
		aria-label="배포 시작"
	>
		<!-- 로켓 발사 버튼 아이콘 -->
		<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
			<svg class="w-[9.9rem] h-[9.9rem] text-white pointer-events-none" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
				<!-- 버튼 본체 (원형) -->
				<circle cx="40" cy="40" r="35" fill="currentColor" class="group-hover:brightness-110" />
				<circle cx="40" cy="40" r="30" fill="url(#launch-button-gradient)" />

				<!-- 로켓 아이콘 -->
				<g transform="translate(40, 40)">
					<!-- 로켓 본체 -->
					<path
						d="M 0 -15 L -8 -5 L 0 5 L 8 -5 Z"
						fill="#ffffff"
					/>
					<!-- 로켓 창문 -->
					<circle cx="0" cy="-5" r="3" fill="#1e40af" />
					<!-- 로켓 날개 -->
					<path d="M -8 -5 L -10 0 L -8 5 L -6 0 Z" fill="#ffffff" />
					<path d="M 8 -5 L 10 0 L 8 5 L 6 0 Z" fill="#ffffff" />
					<!-- 엔진 불꽃 -->
					<path
						d="M -4 5 L 0 12 L 4 5 L 0 8 Z"
						fill="#fbbf24"
					/>
					<path
						d="M -3 7 L 0 14 L 3 7 L 0 10 Z"
						fill="#f59e0b"
					/>
				</g>

				<!-- 그라데이션 정의 -->
				<defs>
					<radialGradient id="launch-button-gradient" cx="45%" cy="35%">
						<stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
						<stop offset="100%" stop-color="#000000" stop-opacity="1" />
					</radialGradient>
				</defs>
			</svg>
		</div>

		<!-- 클릭 시 글로우 효과 -->
		<div class="absolute inset-0 rounded-full bg-orange-400 opacity-0 transition-opacity blur-xl pointer-events-none"></div>

		<!-- 눌린 효과 (그림자) - 카운트다운 중이 아닐 때만 -->
		{#if buttonPressed && countdown === null}
			<div class="absolute inset-0 rounded-full bg-black opacity-20 pointer-events-none"></div>
		{/if}

		{#if deployConnecting}
			<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
				<div class="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
			</div>
		{/if}
	</button>
</div>

<style>
	.launch-button-bg {
		background: repeating-linear-gradient(
			45deg,
			#fbbf24,
			#fbbf24 20px,
			#000000 20px,
			#000000 40px
		);
	}
</style>

