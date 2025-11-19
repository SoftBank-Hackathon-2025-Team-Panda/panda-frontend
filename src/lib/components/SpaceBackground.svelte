<script lang="ts">
	// 별들 생성
	const stars = Array.from({ length: 100 }, (_, i) => ({
		id: i,
		x: Math.random() * 100,
		y: Math.random() * 100,
		size: Math.random() * 2 + 1,
		duration: Math.random() * 3 + 2,
		delay: Math.random() * 2
	}));

	// 행성들 생성 - 고정 위치, 서로 거리 유지, 크기 다양하게
	const planets = [
		{
			id: 0,
			x: 10, // 왼쪽 상단 (더 왼쪽으로)
			y: 15,
			size: 85, // 천왕성 (122 * 0.7 = 85.4)
			duration: 25,
			delay: 0,
			type: 'uranus'
		},
		{
			id: 1,
			x: 80, // 오른쪽 상단
			y: 30,
			size: 108, // 토성 (154 * 0.7 = 107.8)
			duration: 30,
			delay: 2,
			type: 'saturn'
		},
		{
			id: 2,
			x: 50, // 중앙 하단
			y: 75,
			size: 95, // 화성 (135 * 0.7 = 94.5)
			duration: 28,
			delay: 1,
			type: 'mars'
		}
	];

	// UFO 우주선 - 화면 전체를 돌아다니며 사라졌다 나타남
	const ufo = {
		id: 0,
		startX: -10, // 화면 왼쪽 밖에서 시작
		startY: 20,
		endX: 110, // 화면 오른쪽 밖으로 이동
		endY: 80,
		duration: 25, // 전체 경로 이동 시간
		delay: 0
	};
</script>

<div class="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-indigo-900 via-purple-900 to-black">
	<!-- 별들 -->
	{#each stars as star}
		<div
			class="absolute rounded-full bg-white animate-twinkle"
			style="left: {star.x}%; top: {star.y}%; width: {star.size}px; height: {star.size}px; animation-duration: {star.duration}s; animation-delay: {star.delay}s;"
		></div>
	{/each}

	<!-- 행성들 -->
	{#each planets as planet}
		<div
			class="absolute animate-float"
			style="left: {planet.x}%; top: {planet.y}%; width: {planet.type === 'saturn' ? planet.size * 1.8 : planet.size}px; height: {planet.type === 'saturn' ? planet.size * 1.8 : planet.size}px; animation-duration: {planet.duration}s; animation-delay: {planet.delay}s;"
		>
			{#if planet.type === 'saturn'}
				<!-- 토성 (SVG 아이콘) - 배경 투명, 고리 포함 -->
				<svg
					class="w-full h-full"
					viewBox="0 0 200 200"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					style="filter: drop-shadow(0 0 {planet.size / 2}px rgba(251, 191, 36, 0.6)); background: transparent;"
				>
					<!-- 토성 고리 (타원형) - viewBox에 맞게 조정 -->
					<ellipse
						cx="100"
						cy="100"
						rx="80"
						ry="20"
						fill="none"
						stroke="rgba(251, 191, 36, 0.8)"
						stroke-width="3"
						opacity="0.9"
					/>
					<ellipse
						cx="100"
						cy="100"
						rx="90"
						ry="25"
						fill="none"
						stroke="rgba(251, 191, 36, 0.6)"
						stroke-width="2.5"
						opacity="0.7"
					/>
					<ellipse
						cx="100"
						cy="100"
						rx="100"
						ry="28"
						fill="none"
						stroke="rgba(251, 191, 36, 0.5)"
						stroke-width="2"
						opacity="0.5"
					/>
					<!-- 토성 본체 -->
					<circle
						cx="100"
						cy="100"
						r="50"
						fill="url(#saturn-gradient)"
					/>
					<!-- 토성 표면 패턴 (줄무늬) -->
					<circle
						cx="100"
						cy="100"
						r="50"
						fill="url(#saturn-pattern)"
						opacity="0.4"
					/>
					<!-- 그라데이션 정의 -->
					<defs>
						<radialGradient id="saturn-gradient" cx="30%" cy="30%">
							<stop offset="0%" stop-color="rgba(251, 191, 36, 0.95)" />
							<stop offset="50%" stop-color="rgba(217, 119, 6, 0.9)" />
							<stop offset="100%" stop-color="rgba(180, 83, 9, 0.8)" />
						</radialGradient>
						<pattern
							id="saturn-pattern"
							x="0"
							y="0"
							width="15"
							height="15"
							patternUnits="userSpaceOnUse"
						>
							<line
								x1="0"
								y1="7.5"
								x2="15"
								y2="7.5"
								stroke="rgba(0,0,0,0.3)"
								stroke-width="1.5"
							/>
						</pattern>
					</defs>
				</svg>
			{:else if planet.type === 'uranus'}
				<!-- 천왕성 (SVG 아이콘) -->
				<svg
					class="w-full h-full"
					viewBox="0 0 200 200"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					style="filter: drop-shadow(0 0 {planet.size / 2}px rgba(34, 211, 238, 0.6)); background: transparent;"
				>
					<!-- 천왕성 고리 (수직, 기울어진) -->
					<ellipse
						cx="100"
						cy="100"
						rx="20"
						ry="60"
						fill="none"
						stroke="rgba(34, 211, 238, 0.6)"
						stroke-width="2"
						opacity="0.7"
						transform="rotate(90 100 100)"
					/>
					<ellipse
						cx="100"
						cy="100"
						rx="25"
						ry="70"
						fill="none"
						stroke="rgba(34, 211, 238, 0.4)"
						stroke-width="1.5"
						opacity="0.5"
						transform="rotate(90 100 100)"
					/>
					<!-- 천왕성 본체 -->
					<circle
						cx="100"
						cy="100"
						r="40"
						fill="url(#uranus-gradient)"
					/>
					<!-- 천왕성 표면 패턴 (구름 패턴) -->
					<circle
						cx="100"
						cy="100"
						r="40"
						fill="url(#uranus-pattern)"
						opacity="0.3"
					/>
					<!-- 그라데이션 정의 -->
					<defs>
						<radialGradient id="uranus-gradient" cx="30%" cy="30%">
							<stop offset="0%" stop-color="rgba(34, 211, 238, 0.9)" />
							<stop offset="50%" stop-color="rgba(6, 182, 212, 0.85)" />
							<stop offset="100%" stop-color="rgba(8, 145, 178, 0.8)" />
						</radialGradient>
						<pattern
							id="uranus-pattern"
							x="0"
							y="0"
							width="20"
							height="20"
							patternUnits="userSpaceOnUse"
						>
							<circle cx="10" cy="10" r="3" fill="rgba(255,255,255,0.2)" />
							<circle cx="5" cy="15" r="2" fill="rgba(255,255,255,0.15)" />
							<circle cx="15" cy="5" r="2.5" fill="rgba(255,255,255,0.15)" />
						</pattern>
					</defs>
				</svg>
			{:else if planet.type === 'mars'}
				<!-- 화성 (SVG 아이콘) -->
				<svg
					class="w-full h-full"
					viewBox="0 0 200 200"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					style="filter: drop-shadow(0 0 {planet.size / 2}px rgba(239, 68, 68, 0.6)); background: transparent;"
				>
					<!-- 화성 본체 -->
					<circle
						cx="100"
						cy="100"
						r="50"
						fill="url(#mars-gradient)"
					/>
					<!-- 화성 표면 패턴 (크레이터와 지형) -->
					<circle
						cx="100"
						cy="100"
						r="50"
						fill="url(#mars-pattern)"
						opacity="0.4"
					/>
					<!-- 화성 극지 빙관 -->
					<ellipse
						cx="100"
						cy="60"
						rx="15"
						ry="8"
						fill="rgba(255, 255, 255, 0.3)"
						opacity="0.6"
					/>
					<ellipse
						cx="100"
						cy="140"
						rx="15"
						ry="8"
						fill="rgba(255, 255, 255, 0.3)"
						opacity="0.6"
					/>
					<!-- 그라데이션 정의 -->
					<defs>
						<radialGradient id="mars-gradient" cx="30%" cy="30%">
							<stop offset="0%" stop-color="rgba(239, 68, 68, 0.95)" />
							<stop offset="50%" stop-color="rgba(220, 38, 38, 0.9)" />
							<stop offset="100%" stop-color="rgba(185, 28, 28, 0.85)" />
						</radialGradient>
						<pattern
							id="mars-pattern"
							x="0"
							y="0"
							width="30"
							height="30"
							patternUnits="userSpaceOnUse"
						>
							<!-- 크레이터 패턴 -->
							<circle cx="10" cy="10" r="2" fill="rgba(0,0,0,0.3)" />
							<circle cx="25" cy="20" r="1.5" fill="rgba(0,0,0,0.25)" />
							<circle cx="15" cy="25" r="1" fill="rgba(0,0,0,0.2)" />
							<!-- 지형 패턴 -->
							<path
								d="M5 15 L15 12 L20 18 L10 22 Z"
								fill="rgba(0,0,0,0.2)"
								opacity="0.4"
							/>
						</pattern>
					</defs>
				</svg>
			{/if}
		</div>
	{/each}

	<!-- UFO 우주선 -->
	<div
		class="absolute animate-ufo-fly z-10"
		style="animation-duration: {ufo.duration}s; animation-delay: {ufo.delay}s; animation-iteration-count: infinite; animation-timing-function: ease-in-out;"
	>
		<svg class="w-20 h-16 text-cyan-400 opacity-90 drop-shadow-2xl" viewBox="0 0 80 60" fill="currentColor" style="filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.9));">
			<!-- UFO 상단 돔 -->
			<ellipse cx="40" cy="20" rx="30" ry="12" fill="currentColor" opacity="0.9" />
			<ellipse cx="40" cy="20" rx="25" ry="10" fill="#06b6d4" opacity="0.7" />

			<!-- UFO 하단 -->
			<ellipse cx="40" cy="35" rx="35" ry="8" fill="currentColor" opacity="0.8" />

			<!-- UFO 창문들 -->
			<circle cx="30" cy="20" r="3" fill="#1e40af" opacity="0.8" />
			<circle cx="40" cy="18" r="4" fill="#1e40af" opacity="0.8" />
			<circle cx="50" cy="20" r="3" fill="#1e40af" opacity="0.8" />

			<!-- UFO 빛 (아래로) -->
			<ellipse cx="40" cy="43" rx="20" ry="15" fill="#60a5fa" opacity="0.4" class="animate-pulse" />
			<ellipse cx="40" cy="45" rx="15" ry="10" fill="#93c5fd" opacity="0.5" class="animate-pulse" />
			<ellipse cx="40" cy="47" rx="10" ry="6" fill="#dbeafe" opacity="0.6" class="animate-pulse" />

			<!-- UFO 조명 (옆쪽) -->
			<circle cx="15" cy="25" r="2" fill="#fbbf24" opacity="0.9" class="animate-pulse" />
			<circle cx="65" cy="25" r="2" fill="#fbbf24" opacity="0.9" class="animate-pulse" />
		</svg>
	</div>

	<!-- 혜성들 -->
	{#each Array(2) as _, i}
		<div
			class="absolute animate-comet"
			style="left: {20 + i * 40}%; top: {10 + i * 15}%; animation-duration: {30 + i * 10}s; animation-delay: {i * 5}s; animation-iteration-count: infinite;"
		>
			<svg
				class="w-32 h-32"
				viewBox="0 0 200 200"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				style="filter: drop-shadow(0 0 10px rgba(173, 216, 230, 0.6)); background: transparent;"
			>
				<!-- 혜성 핵 (밝은 중심) - 꼬리의 시작점 -->
				<circle
					cx="183"
					cy="165"
					r="6"
					fill="url(#comet-core-gradient)"
				/>
				<!-- 혜성 핵 글로우 -->
				<circle
					cx="183"
					cy="165"
					r="8"
					fill="rgba(255, 255, 255, 0.3)"
					opacity="0.6"
				/>
				<!-- 혜성 꼬리 (긴 가스 꼬리) - 핵에서 시작해서 왼쪽 위로 향하게 -->
				<ellipse
					cx="100"
					cy="115"
					rx="8"
					ry="100"
					fill="url(#comet-tail-gradient)"
					opacity="0.7"
					transform="rotate(-60 100 115)"
				/>
				<ellipse
					cx="98"
					cy="117"
					rx="6"
					ry="110"
					fill="url(#comet-tail-gradient-2)"
					opacity="0.5"
					transform="rotate(-60 98 117)"
				/>
				<ellipse
					cx="60"
					cy="90"
					rx="4"
					ry="120"
					fill="url(#comet-tail-gradient-3)"
					opacity="0.3"
					transform="rotate(-60 96 119)"
				/>
				<!-- 그라데이션 정의 -->
				<defs>
					<radialGradient id="comet-core-gradient" cx="50%" cy="50%">
						<stop offset="0%" stop-color="rgba(255, 255, 255, 1)" />
						<stop offset="50%" stop-color="rgba(200, 230, 255, 0.9)" />
						<stop offset="100%" stop-color="rgba(173, 216, 230, 0.7)" />
					</radialGradient>
					<linearGradient id="comet-tail-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
						<stop offset="0%" stop-color="rgba(173, 216, 230, 0.8)" />
						<stop offset="30%" stop-color="rgba(135, 206, 250, 0.6)" />
						<stop offset="70%" stop-color="rgba(100, 149, 237, 0.4)" />
						<stop offset="100%" stop-color="transparent" />
					</linearGradient>
					<linearGradient id="comet-tail-gradient-2" x1="100%" y1="100%" x2="0%" y2="0%">
						<stop offset="0%" stop-color="rgba(135, 206, 250, 0.6)" />
						<stop offset="50%" stop-color="rgba(100, 149, 237, 0.4)" />
						<stop offset="100%" stop-color="transparent" />
					</linearGradient>
					<linearGradient id="comet-tail-gradient-3" x1="100%" y1="100%" x2="0%" y2="0%">
						<stop offset="0%" stop-color="rgba(100, 149, 237, 0.4)" />
						<stop offset="100%" stop-color="transparent" />
					</linearGradient>
				</defs>
			</svg>
		</div>
	{/each}
</div>

<style>
	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.2);
		}
	}

	.animate-twinkle {
		animation: twinkle ease-in-out infinite;
	}

	@keyframes float {
		0% {
			transform: translate(0, 0) scale(1);
		}
		25% {
			transform: translate(30px, -30px) scale(1.05);
		}
		50% {
			transform: translate(-20px, 20px) scale(0.95);
		}
		75% {
			transform: translate(-30px, -15px) scale(1.02);
		}
		100% {
			transform: translate(0, 0) scale(1);
		}
	}

	.animate-float {
		animation: float ease-in-out infinite;
	}

	@keyframes ufo-fly {
		0% {
			left: -10%;
			top: 60%;
			opacity: 0;
			transform: translateY(0) rotate(-5deg);
		}
		5% {
			opacity: 1;
		}
		20% {
			left: 25%;
			top: 55%;
			transform: translateY(-10px) rotate(5deg);
		}
		40% {
			left: 60%;
			top: 70%;
			transform: translateY(10px) rotate(-3deg);
		}
		60% {
			left: 85%;
			top: 60%;
			transform: translateY(-5px) rotate(4deg);
		}
		80% {
			left: 110%;
			top: 65%;
			opacity: 1;
			transform: translateY(0) rotate(-2deg);
		}
		85% {
			opacity: 0;
		}
		100% {
			left: 110%;
			top: 65%;
			opacity: 0;
			transform: translateY(0) rotate(-2deg);
		}
	}

	.animate-ufo-fly {
		animation: ufo-fly ease-in-out infinite;
	}

	@keyframes comet {
		0% {
			opacity: 0;
			transform: translate(-100px, -50px) scale(0.8);
		}
		10% {
			opacity: 1;
		}
		90% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(calc(100vw + 100px), calc(100vh + 50px)) scale(1.2);
		}
	}

	.animate-comet {
		animation: comet linear infinite;
		pointer-events: none;
	}
</style>

