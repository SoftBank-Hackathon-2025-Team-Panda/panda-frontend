<script lang="ts">
	let { stage = 'idle', hasError = false } = $props();

	// 배경 단계별 opacity 계산 (자연스러운 전환)
	let groundOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'idle') return 1;
		if (stage === 'Docker Build') return 0.7;
		if (stage === 'ECR Push') return 0.4;
		if (stage === 'ECS Deployment') return 0.2;
		return 0;
	});

	let troposphereOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'Docker Build') return 1;
		if (stage === 'ECR Push') return 0.8;
		if (stage === 'ECS Deployment') return 0.5;
		if (stage === 'Blue/Green') return 0.2;
		return 0;
	});

	let stratosphereOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'ECR Push') return 1;
		if (stage === 'ECS Deployment') return 0.7;
		if (stage === 'Blue/Green') return 0.3;
		return 0;
	});

	let mesosphereOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'ECS Deployment') return 1;
		if (stage === 'Blue/Green') return 0.6;
		if (stage === 'HealthCheck & 트래픽 전환') return 0.3;
		return 0;
	});

	let spaceEarthOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'Blue/Green') return 1;
		if (stage === 'HealthCheck & 트래픽 전환') return 0;
		if (stage === 'Completed') return 0;
		return 0;
	});

	let earthPlanetOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'Blue/Green') return 1;
		if (stage === 'HealthCheck & 트래픽 전환') return 0;
		if (stage === 'Completed') return 0;
		return 0;
	});

	let marsPlanetOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'HealthCheck & 트래픽 전환') return 1;
		if (stage === 'Completed') return 0;
		return 0;
	});

	let jupiterPlanetOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'HealthCheck & 트래픽 전환') return 1;
		if (stage === 'Completed') return 0;
		return 0;
	});

	let spacePlanetsOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'HealthCheck & 트래픽 전환') return 1;
		if (stage === 'Completed') return 0;
		return 0;
	});

	let successOpacity = $derived.by(() => {
		if (hasError) return 0;
		if (stage === 'Completed') return 1;
		return 0;
	});
</script>

<div class="relative w-full h-full overflow-hidden" style="height: 100%; min-height: 100%; max-height: 100%;">
	<!-- 배경 레이어들 (자연스러운 전환) -->

	<!-- 지상 배경 -->
	<div
		class="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-700 to-gray-600 transition-opacity duration-3000 ease-in-out"
		style="opacity: {groundOpacity};"
	>
		<!-- 건물 실루엣 (더 많은 건물들) -->
		<svg class="absolute bottom-0 w-full h-1/3" viewBox="0 0 1200 400" preserveAspectRatio="none">
			<!-- 배경 건물들 -->
			<polygon points="0,400 0,300 100,280 150,320 200,250 300,270 400,200 500,220 600,150 700,170 800,100 900,120 1000,80 1100,100 1200,60 1200,400" fill="#1f2937" />
			<polygon points="0,400 0,350 50,340 100,360 150,330 200,350 300,320 400,340 500,310 600,330 700,300 800,320 900,290 1000,310 1100,280 1200,300 1200,400" fill="#111827" />
			<!-- 추가 건물들 -->
			<rect x="50" y="280" width="40" height="120" fill="#1f2937" />
			<rect x="100" y="250" width="35" height="150" fill="#111827" />
			<rect x="250" y="270" width="45" height="130" fill="#1f2937" />
			<rect x="350" y="200" width="50" height="200" fill="#111827" />
			<rect x="550" y="150" width="40" height="250" fill="#1f2937" />
			<rect x="750" y="100" width="55" height="300" fill="#111827" />
			<rect x="950" y="80" width="45" height="320" fill="#1f2937" />
			<!-- 건물 창문들 -->
			<rect x="60" y="300" width="5" height="8" fill="#3b82f6" opacity="0.6" />
			<rect x="70" y="300" width="5" height="8" fill="#3b82f6" opacity="0.6" />
			<rect x="110" y="270" width="5" height="8" fill="#3b82f6" opacity="0.6" />
			<rect x="120" y="270" width="5" height="8" fill="#3b82f6" opacity="0.6" />
			<rect x="360" y="220" width="5" height="8" fill="#3b82f6" opacity="0.6" />
			<rect x="370" y="220" width="5" height="8" fill="#3b82f6" opacity="0.6" />
			<rect x="380" y="220" width="5" height="8" fill="#3b82f6" opacity="0.6" />
		</svg>
	</div>

	<!-- 대기권 (구름층, 하늘 점점 어두워짐) -->
	<div
		class="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 transition-opacity duration-3000 ease-in-out"
		style="opacity: {troposphereOpacity};"
	>
		<!-- 구름들 (SVG 아이콘, 군데군데) -->
		<svg class="absolute top-10 left-5 w-32 h-20" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.55"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.45"/>
		</svg>
		<svg class="absolute" style="top: 25%; left: 15%; width: 10rem; height: 6rem;" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.55"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.45"/>
		</svg>
		<svg class="absolute" style="top: 40%; right: 20%; width: 9rem; height: 5.5rem;" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.55"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.45"/>
		</svg>
		<svg class="absolute top-15 left-1/2 w-44 h-28" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.55"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.45"/>
		</svg>
		<svg class="absolute" style="top: 55%; left: 33.333333%; width: 9.5rem; height: 6rem;" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.55"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.45"/>
		</svg>
		<svg class="absolute" style="top: 70%; right: 33.333333%; width: 10.5rem; height: 6.5rem;" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.55"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.45"/>
		</svg>
	</div>

	<!-- 중간권 1 (파란 하늘 -> 짙은 남색) -->
	<div
		class="absolute inset-0 bg-gradient-to-b from-blue-600 via-indigo-700 to-indigo-900 transition-opacity duration-3000 ease-in-out"
		style="opacity: {stratosphereOpacity};"
	>
		<!-- 구름들 (바닥 부분에만, SVG 아이콘, 희미하게) -->
		<svg class="absolute bottom-0 left-5 w-32 h-20" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.4"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.35"/>
		</svg>
		<svg class="absolute bottom-0 left-1/4 w-40 h-24" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.4"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.35"/>
		</svg>
		<svg class="absolute bottom-0 right-1/4 w-36 h-22" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.4"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.35"/>
		</svg>
		<svg class="absolute bottom-0 right-10 w-38 h-23" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 32C8 32 4 28 4 24C4 20 8 16 12 16C12 12 16 8 20 8C24 8 28 12 28 16C32 16 36 20 36 24C36 28 32 32 28 32H12Z" fill="white" opacity="0.4"/>
			<path d="M20 24C20 20 24 16 28 16C28 12 32 8 36 8C40 8 44 12 44 16C48 16 52 20 52 24C52 28 48 32 44 32H20V24Z" fill="white" opacity="0.35"/>
		</svg>
		<!-- 별들 (약간) -->
		{#each Array(30) as _, i}
			<svg class="absolute animate-twinkle" style="left: {Math.random() * 100}%; top: {Math.random() * 60}%; width: 0.5rem; height: 0.5rem; animation-delay: {Math.random() * 2}s;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="white" opacity="0.9"/>
			</svg>
		{/each}
	</div>

	<!-- 중간권 2 (남색 -> 우주 분위기) -->
	<div
		class="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black transition-opacity duration-3000 ease-in-out"
		style="opacity: {mesosphereOpacity};"
	>
		<!-- 별들 (더 많이, SVG 아이콘) -->
		{#each Array(60) as _, i}
			<svg class="absolute animate-twinkle" style="left: {Math.random() * 100}%; top: {Math.random() * 100}%; width: 0.5rem; height: 0.5rem; animation-delay: {Math.random() * 2}s;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="white" opacity="0.9"/>
			</svg>
		{/each}
		<!-- 작은 행성들 (먼 행성처럼, SVG 아이콘) -->
		<svg class="absolute top-20 right-20 w-3 h-3 animate-twinkle opacity-60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10" fill="url(#small-planet-yellow)"/>
			<defs>
				<radialGradient id="small-planet-yellow" cx="30%" cy="30%">
					<stop offset="0%" stop-color="#fde047" />
					<stop offset="100%" stop-color="#fbbf24" />
				</radialGradient>
			</defs>
		</svg>
		<svg class="absolute animate-twinkle opacity-50" style="top: 30%; left: 30%; width: 0.5rem; height: 0.5rem; animation-delay: 0.5s;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10" fill="url(#small-planet-blue)"/>
			<defs>
				<radialGradient id="small-planet-blue" cx="30%" cy="30%">
					<stop offset="0%" stop-color="#93c5fd" />
					<stop offset="100%" stop-color="#3b82f6" />
				</radialGradient>
			</defs>
		</svg>
		<svg class="absolute animate-twinkle opacity-55" style="top: 50%; right: 40%; width: 0.625rem; height: 0.625rem; animation-delay: 1s;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="12" cy="12" r="10" fill="url(#small-planet-purple)"/>
			<defs>
				<radialGradient id="small-planet-purple" cx="30%" cy="30%">
					<stop offset="0%" stop-color="#c4b5fd" />
					<stop offset="100%" stop-color="#8b5cf6" />
				</radialGradient>
			</defs>
		</svg>
	</div>

	<!-- 우주 (지구) -->
	<div
		class="absolute inset-0 bg-black transition-opacity duration-3000 ease-in-out"
		style="opacity: {spaceEarthOpacity};"
	>
		<!-- 별들 (SVG 아이콘) -->
		{#each Array(100) as _, i}
			<svg class="absolute animate-twinkle" style="left: {Math.random() * 100}%; top: {Math.random() * 100}%; width: 0.75rem; height: 0.75rem; animation-delay: {Math.random() * 2}s;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="white" opacity="0.9"/>
			</svg>
		{/each}
		<!-- 지구 (왼쪽 아래 모서리) -->
		<div
			class="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-br from-blue-500 via-green-500 to-blue-600 rounded-full shadow-2xl transition-opacity duration-3000 ease-in-out"
			style="box-shadow: 0 0 80px rgba(59, 130, 246, 0.6); opacity: {earthPlanetOpacity};"
		>
			<div class="absolute inset-6 bg-blue-500/30 rounded-full"></div>
			<div class="absolute top-12 left-12 w-9 h-9 bg-green-400/50 rounded-full"></div>
			<div class="absolute bottom-12 right-12 w-8 h-8 bg-blue-300/50 rounded-full"></div>
		</div>
	</div>

	<!-- 우주 (행성들) - 지구에서 목성 방향으로 먼 행성들이 하나씩 나타남 -->
	<div
		class="absolute inset-0 bg-black transition-opacity duration-3000 ease-in-out"
		style="opacity: {spacePlanetsOpacity};"
	>
		<!-- 별들 (SVG 아이콘) -->
		{#each Array(100) as _, i}
			<svg class="absolute animate-twinkle" style="left: {Math.random() * 100}%; top: {Math.random() * 100}%; width: 0.75rem; height: 0.75rem; animation-delay: {Math.random() * 2}s;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="white" opacity="0.9"/>
			</svg>
		{/each}
		<!-- 지구 (왼쪽 아래 모서리) -->
		<div
			class="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-br from-blue-500 via-green-500 to-blue-600 rounded-full shadow-2xl transition-opacity duration-3000 ease-in-out"
			style="box-shadow: 0 0 80px rgba(59, 130, 246, 0.6); opacity: {earthPlanetOpacity};"
		>
			<div class="absolute inset-6 bg-blue-500/30 rounded-full"></div>
			<div class="absolute top-12 left-12 w-9 h-9 bg-green-400/50 rounded-full"></div>
			<div class="absolute bottom-12 right-12 w-8 h-8 bg-blue-300/50 rounded-full"></div>
		</div>
		<!-- 화성 (지구 다음) -->
		<div
			class="absolute top-20 right-20 w-36 h-36 bg-gradient-to-br from-red-500 to-orange-600 rounded-full shadow-2xl animate-float transition-opacity duration-3000 ease-in-out"
			style="box-shadow: 0 0 60px rgba(239, 68, 68, 0.5); animation-duration: 28s; animation-delay: 1s; opacity: {marsPlanetOpacity};"
		>
			<div class="absolute inset-4 bg-red-500/30 rounded-full"></div>
			<div class="absolute top-8 left-12 w-6 h-6 bg-orange-400/50 rounded-full"></div>
		</div>
		<!-- 목성 (더 먼 행성) -->
		<div
			class="absolute top-40 left-20 w-40 h-40 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full shadow-2xl animate-float transition-opacity duration-3000 ease-in-out"
			style="box-shadow: 0 0 70px rgba(251, 146, 60, 0.6); animation-duration: 30s; animation-delay: 2s; opacity: {jupiterPlanetOpacity};"
		>
			<div class="absolute inset-4 bg-orange-400/30 rounded-full"></div>
			<!-- 목성의 줄무늬 -->
			<div class="absolute top-1/2 left-0 right-0 h-2 bg-amber-600/40"></div>
			<div class="absolute top-1/3 left-0 right-0 h-1.5 bg-orange-500/40"></div>
			<div class="absolute top-2/3 left-0 right-0 h-1.5 bg-amber-700/40"></div>
		</div>
	</div>

	<!-- 성공 배경 (SpaceBackground와 동일) -->
	<div
		class="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black transition-opacity duration-0"
		style="opacity: {successOpacity};"
	>
		<!-- 별들 (SVG 아이콘) -->
		{#each Array(100) as _, i}
			<svg class="absolute animate-twinkle" style="left: {Math.random() * 100}%; top: {Math.random() * 100}%; width: {Math.random() * 2 + 1}px; height: {Math.random() * 2 + 1}px; animation-duration: {Math.random() * 3 + 2}s; animation-delay: {Math.random() * 2}s;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z" fill="white" opacity="0.9"/>
			</svg>
		{/each}

		<!-- 천왕성 -->
		<div
			class="absolute animate-float"
			style="left: 10%; top: 15%; width: 85px; height: 85px; animation-duration: 25s; animation-delay: 0s;"
		>
			<svg class="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 42px rgba(34, 211, 238, 0.6)); background: transparent;">
				<ellipse cx="100" cy="100" rx="20" ry="60" fill="none" stroke="rgba(34, 211, 238, 0.6)" stroke-width="2" opacity="0.7" transform="rotate(90 100 100)" />
				<ellipse cx="100" cy="100" rx="25" ry="70" fill="none" stroke="rgba(34, 211, 238, 0.4)" stroke-width="1.5" opacity="0.5" transform="rotate(90 100 100)" />
				<circle cx="100" cy="100" r="40" fill="url(#uranus-gradient-final)" />
				<defs>
					<radialGradient id="uranus-gradient-final" cx="30%" cy="30%">
						<stop offset="0%" stop-color="rgba(34, 211, 238, 0.9)" />
						<stop offset="50%" stop-color="rgba(6, 182, 212, 0.85)" />
						<stop offset="100%" stop-color="rgba(8, 145, 178, 0.8)" />
					</radialGradient>
				</defs>
			</svg>
		</div>

		<!-- 토성 -->
		<div
			class="absolute animate-float"
			style="left: 80%; top: 30%; width: 108px; height: 108px; animation-duration: 30s; animation-delay: 2s;"
		>
			<svg class="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 54px rgba(251, 191, 36, 0.6)); background: transparent;">
				<ellipse cx="100" cy="100" rx="80" ry="20" fill="none" stroke="rgba(251, 191, 36, 0.8)" stroke-width="3" opacity="0.9" />
				<ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="rgba(251, 191, 36, 0.6)" stroke-width="2.5" opacity="0.7" />
				<ellipse cx="100" cy="100" rx="100" ry="28" fill="none" stroke="rgba(251, 191, 36, 0.5)" stroke-width="2" opacity="0.5" />
				<circle cx="100" cy="100" r="50" fill="url(#saturn-gradient-final)" />
				<defs>
					<radialGradient id="saturn-gradient-final" cx="30%" cy="30%">
						<stop offset="0%" stop-color="rgba(251, 191, 36, 0.95)" />
						<stop offset="50%" stop-color="rgba(217, 119, 6, 0.9)" />
						<stop offset="100%" stop-color="rgba(180, 83, 9, 0.8)" />
					</radialGradient>
				</defs>
			</svg>
		</div>

		<!-- 화성 -->
		<div
			class="absolute animate-float"
			style="left: 50%; top: 75%; width: 95px; height: 95px; animation-duration: 28s; animation-delay: 1s;"
		>
			<svg class="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 47px rgba(239, 68, 68, 0.6)); background: transparent;">
				<circle cx="100" cy="100" r="50" fill="url(#mars-gradient-final)" />
				<ellipse cx="100" cy="60" rx="15" ry="8" fill="rgba(255, 255, 255, 0.3)" opacity="0.6" />
				<ellipse cx="100" cy="140" rx="15" ry="8" fill="rgba(255, 255, 255, 0.3)" opacity="0.6" />
				<defs>
					<radialGradient id="mars-gradient-final" cx="30%" cy="30%">
						<stop offset="0%" stop-color="rgba(239, 68, 68, 0.95)" />
						<stop offset="50%" stop-color="rgba(220, 38, 38, 0.9)" />
						<stop offset="100%" stop-color="rgba(185, 28, 28, 0.85)" />
					</radialGradient>
				</defs>
			</svg>
		</div>

		<!-- UFO -->
		<div
			class="absolute animate-ufo-fly z-10"
			style="animation-duration: 25s; animation-delay: 0s; animation-iteration-count: infinite; animation-timing-function: ease-in-out;"
		>
			<svg class="w-20 h-16 text-cyan-400 opacity-90 drop-shadow-2xl" viewBox="0 0 80 60" fill="currentColor" style="filter: drop-shadow(0 0 12px rgba(34, 211, 238, 0.9));">
				<ellipse cx="40" cy="20" rx="30" ry="12" fill="currentColor" opacity="0.9" />
				<ellipse cx="40" cy="20" rx="25" ry="10" fill="#06b6d4" opacity="0.7" />
				<ellipse cx="40" cy="35" rx="35" ry="8" fill="currentColor" opacity="0.8" />
				<circle cx="30" cy="20" r="3" fill="#1e40af" opacity="0.8" />
				<circle cx="40" cy="18" r="4" fill="#1e40af" opacity="0.8" />
				<circle cx="50" cy="20" r="3" fill="#1e40af" opacity="0.8" />
				<ellipse cx="40" cy="43" rx="20" ry="15" fill="#60a5fa" opacity="0.4" class="animate-pulse" />
				<ellipse cx="40" cy="45" rx="15" ry="10" fill="#93c5fd" opacity="0.5" class="animate-pulse" />
				<ellipse cx="40" cy="47" rx="10" ry="6" fill="#dbeafe" opacity="0.6" class="animate-pulse" />
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
				<svg class="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px rgba(173, 216, 230, 0.6)); background: transparent;">
					<circle cx="183" cy="165" r="6" fill="url(#comet-core-gradient-final)" />
					<circle cx="183" cy="165" r="8" fill="rgba(255, 255, 255, 0.3)" opacity="0.6" />
					<ellipse cx="100" cy="115" rx="8" ry="100" fill="url(#comet-tail-gradient-final)" opacity="0.7" transform="rotate(-60 100 115)" />
					<ellipse cx="98" cy="117" rx="6" ry="110" fill="url(#comet-tail-gradient-2-final)" opacity="0.5" transform="rotate(-60 98 117)" />
					<ellipse cx="60" cy="90" rx="4" ry="120" fill="url(#comet-tail-gradient-3-final)" opacity="0.3" transform="rotate(-60 96 119)" />
					<defs>
						<radialGradient id="comet-core-gradient-final" cx="50%" cy="50%">
							<stop offset="0%" stop-color="rgba(255, 255, 255, 1)" />
							<stop offset="50%" stop-color="rgba(200, 230, 255, 0.9)" />
							<stop offset="100%" stop-color="rgba(173, 216, 230, 0.7)" />
						</radialGradient>
						<linearGradient id="comet-tail-gradient-final" x1="100%" y1="100%" x2="0%" y2="0%">
							<stop offset="0%" stop-color="rgba(173, 216, 230, 0.8)" />
							<stop offset="30%" stop-color="rgba(135, 206, 250, 0.6)" />
							<stop offset="70%" stop-color="rgba(100, 149, 237, 0.4)" />
							<stop offset="100%" stop-color="transparent" />
						</linearGradient>
						<linearGradient id="comet-tail-gradient-2-final" x1="100%" y1="100%" x2="0%" y2="0%">
							<stop offset="0%" stop-color="rgba(135, 206, 250, 0.6)" />
							<stop offset="50%" stop-color="rgba(100, 149, 237, 0.4)" />
							<stop offset="100%" stop-color="transparent" />
						</linearGradient>
						<linearGradient id="comet-tail-gradient-3-final" x1="100%" y1="100%" x2="0%" y2="0%">
							<stop offset="0%" stop-color="rgba(100, 149, 237, 0.4)" />
							<stop offset="100%" stop-color="transparent" />
						</linearGradient>
					</defs>
				</svg>
			</div>
		{/each}
	</div>

	<!-- 에러 배경 (폭발) -->
	{#if hasError}
		<div class="absolute inset-0 bg-gradient-to-b from-red-900 via-orange-900 to-black">


			<!-- starburst.png를 주변에 여러 개 배치 (중앙에서 퍼지는 효과) -->
			{#each Array(5) as _, i}
				{@const angles = [25, 110, 200, 290, 160]}
				{@const angle = angles[i] * Math.PI / 180}
				{@const distances = [200, 280, 240, 300, 220]}
				{@const distance = distances[i]}
				{@const rotations = [20, 75, 130, 185, 240]}
				{@const rotation = rotations[i]}
				{@const sizes = [160, 220, 180, 240, 200]}
				{@const size = sizes[i]}
				{@const leftPos = 50 + Math.cos(angle) * (distance / 10)}
				{@const topPos = 50 + Math.sin(angle) * (distance / 10)}
				<img
					src="/starburst.png"
					alt="Explosion"
					class="absolute starburst-explosion"
					style="
						left: {leftPos}%;
						top: {topPos}%;
						width: {size}px;
						height: auto;
						animation-delay: {i * 0.1}s;
						--rotation: {rotation}deg;
					"
				/>
			{/each}
		</div>
	{/if}

	<!-- 우주선 (고정 위치, 아래쪽 중앙) -->
	<div
		class="absolute left-1/2 bottom-20 rocket-container"
		style="transform: translate(-50%, 0) {hasError ? 'rotate(45deg)' : ''};"
	>
		{#if hasError}
			<!-- 폭발 애니메이션 -->
			<div class="relative">

				<!-- 우주선 (폭발 중) -->
				<svg class="relative w-20 h-28" viewBox="0 0 24 32" fill="none">
					<path
						d="M12 2L8 8L12 12L16 8L12 2Z"
						fill="#ef4444"
						class="animate-pulse"
					/>
					<path d="M10 12L12 16L14 12L12 8L10 12Z" fill="#dc2626" />
					<path d="M8 8L12 12L10 16L6 12L8 8Z" fill="#b91c1c" />
					<path d="M16 8L12 12L14 16L18 12L16 8Z" fill="#b91c1c" />
				</svg>
			</div>
		{:else}
			<!-- 정상 우주선 (크게) -->
			<div class="relative">
				<svg class="w-24 h-32" viewBox="0 0 24 32" fill="none">
					<!-- 본체 -->
					<path
						d="M12 2L8 8L12 12L16 8L12 2Z"
						fill="#60a5fa"
						class="drop-shadow-lg"
					/>
					<!-- 창문 -->
					<circle cx="12" cy="6" r="2" fill="#1e40af" />
					<!-- 날개 -->
					<path d="M8 8L6 12L8 16L10 12L8 8Z" fill="#3b82f6" />
					<path d="M16 8L18 12L16 16L14 12L16 8Z" fill="#3b82f6" />
				</svg>
				<!-- 엔진 불꽃 (CSS 애니메이션) - 로켓 바로 아래에 붙임, 180도 뒤집힘 -->
				<div class="absolute left-1/2 -translate-x-1/2 flame-container" style="top: 100%; margin-top: 8px; transform: translateX(0%) scaleY(-1);">
					<div class="flame flame-outer"></div>
					<div class="flame flame-inner"></div>
					<div class="flame flame-core"></div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 1;
		}
	}

	.animate-twinkle {
		animation: twinkle 2s ease-in-out infinite;
	}


	/* starburst 폭발 애니메이션 */
	.starburst-explosion {
		opacity: 0;
		animation: starburst-pop 2s ease-out forwards;
		pointer-events: none;
		filter: drop-shadow(0 0 10px rgba(255, 165, 0, 0.8));
		transform: translate(-50%, -50%);
	}

	@keyframes starburst-pop {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0) rotate(var(--rotation, 0deg));
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.3) rotate(var(--rotation, 0deg));
		}
		60% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1) rotate(var(--rotation, 0deg));
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.8) rotate(var(--rotation, 0deg));
		}
	}

	.rocket-container {
		z-index: 10;
	}

	/* 불꽃 효과 */
	.flame-container {
		position: absolute;
		width: 40px;
		height: 60px;
		transform-origin: center top;
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

	.flame {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		animation: flame-flicker 0.3s ease-in-out infinite alternate;
	}

	.flame-outer {
		width: 32px;
		height: 48px;
		background: linear-gradient(to top, #fbbf24, #f59e0b, #ef4444);
		opacity: 0.8;
		animation-delay: 0s;
	}

	.flame-inner {
		width: 24px;
		height: 36px;
		background: linear-gradient(to top, #fcd34d, #fbbf24);
		opacity: 0.9;
		animation-delay: 0.1s;
		transform: translateX(-50%) translateY(6px);
	}

	.flame-core {
		width: 16px;
		height: 24px;
		background: linear-gradient(to top, #fef3c7, #fcd34d);
		opacity: 1;
		animation-delay: 0.2s;
		transform: translateX(-50%) translateY(12px);
	}

	@keyframes flame-flicker {
		0% {
			transform: translateX(-50%) scaleY(1) scaleX(1);
		}
		25% {
			transform: translateX(-50%) scaleY(1.1) scaleX(0.95);
		}
		50% {
			transform: translateX(-50%) scaleY(0.95) scaleX(1.05);
		}
		75% {
			transform: translateX(-50%) scaleY(1.05) scaleX(0.98);
		}
		100% {
			transform: translateX(-50%) scaleY(1) scaleX(1);
		}
	}
</style>

