<script lang="ts">
	import RocketAnimation from './RocketAnimation.svelte';

	interface DeploymentEvent {
		type: string;
		message: string;
		timestamp?: number | string;
		details?: Record<string, unknown>;
	}

	import type { DeploymentResultData } from "$lib/api/client";

	interface Props {
		currentStage: string;
		hasError: boolean;
		isConnected: boolean;
		isComplete: boolean;
		events: DeploymentEvent[];
		deploymentId: string;
		result?: DeploymentResultData | null;
		onReset?: () => void;
	}

	let {
		currentStage,
		hasError,
		isConnected,
		isComplete,
		events,
		deploymentId,
		result,
		onReset
	}: Props = $props();

	let showDetailedLogs = $state(false);

	// 가장 최근의 stage 이벤트에서 message 가져오기
	function getLatestStageMessage(): string {
		// events 배열에서 type이 'stage'인 가장 최근 이벤트 찾기
		const stageEvents = events.filter(e => e.type === 'stage');
		if (stageEvents.length > 0) {
			const latestEvent = stageEvents[stageEvents.length - 1];
			return latestEvent.message || '';
		}
		// stage 이벤트가 없으면 기본 메시지 반환
		const descriptions: Record<string, string> = {
			'SSE 연결 대기 중': 'SSE 연결을 준비하고 있습니다...',
			'idle': '대기 중...',
			'Docker Build': 'Docker 이미지 빌드 중...',
			'ECR Push': 'ECR에 이미지 업로드 중...',
			'ECS Deployment': 'ECS 서비스 배포 중...',
			'Blue/Green': 'Blue/Green 배포 진행 중...',
			'Completed': '배포 완료!',
			'Failed': '배포 실패'
		};
		return descriptions[currentStage] || currentStage;
	}

	// Stage 기반 진행률 계산 (5단계: Docker Build, ECR Push, ECS Deployment, Blue/Green, Completed)
	function getProgressPercentage(): number {
		const stageMap: Record<string, number> = {
			'SSE 연결 대기 중': 0,
			'idle': 0,
			'Docker Build': 1, // 20%
			'ECR Push': 2, // 40%
			'ECS Deployment': 3, // 60%
			'Blue/Green': 4, // 80%
			'Completed': 5, // 100%
			'Failed': 0
		};
		const stageNum = stageMap[currentStage] || 0;
		// 5단계로 나눔 (Blue/Green이 80%, Completed가 100%)
		return Math.min((stageNum / 5) * 100, 100);
	}
</script>

<div class="relative flex-1 w-full h-full min-h-[700px]">
	<div class="relative w-full h-full min-h-[700px] overflow-hidden rounded-[32px] shadow-2xl">
		<!-- 배경 레이어 (ControlPanel과 동일한 느낌 유지) -->
		<div class="absolute inset-0 pointer-events-none rounded-[32px]">
			<div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 rounded-[32px]"></div>
			<div class="absolute inset-0 opacity-30 rounded-[32px]" style="background-image:
				repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px),
				repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px);"></div>
			<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
			<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
			<div class="absolute inset-0 rounded-[32px]" style="box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.35);"></div>
		</div>

		<div class="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style="height: 100%; max-height: 100%;">
		<!-- 우주선 애니메이션 배경 -->
		<div class="absolute inset-0 z-0 overflow-hidden rounded-3xl">
			<RocketAnimation stage={currentStage} {hasError} />
		</div>

		{#if !isComplete && !hasError}
			<!-- 배포 중: 왼쪽 상단 모서리에 현재 단계만 표시 -->
			<div class="absolute top-4 left-4 z-10 min-w-[320px] overflow-visible">
			<div class="bg-black/60 backdrop-blur-md rounded-lg p-4 border border-white/20">
				<h2 class="text-sm font-semibold mb-2 text-white">현재 단계</h2>
				<div class="space-y-2">
					<div>
						<p class="text-lg font-bold text-blue-400 mb-1">{currentStage}</p>
						<p class="text-xs text-gray-300 leading-relaxed break-words line-clamp-2">{getLatestStageMessage()}</p>
						<div class="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
							<div
								class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
								style="width: {getProgressPercentage()}%"
							></div>
						</div>
					</div>
					<div class="flex flex-wrap gap-1.5">
						{#if isConnected}
							<span class="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
								연결됨
							</span>
						{:else}
							<span class="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs border border-gray-500/30">
								연결 안 됨
							</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{:else if hasError}
		<!-- 배포 실패: 실패 전용 화면 -->
		<div class="relative z-10 w-full h-full max-w-6xl px-4 py-4 flex flex-col overflow-hidden">
			<!-- 상단 버튼 -->
			<div class="absolute top-4 right-4 flex flex-wrap gap-3 z-20">
				<button
					onclick={() => (showDetailedLogs = !showDetailedLogs)}
					class="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
				>
					{showDetailedLogs ? '상세 로그 숨기기' : '상세 로그 보기'}
				</button>
				{#if onReset}
					<button
						onclick={onReset}
						class="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
					>
						메인 화면으로
					</button>
				{/if}
			</div>

			<!-- 실패 메시지 중앙 표시 (상세 로그가 꺼져있을 때만) -->
			{#if !showDetailedLogs}
				<div class="flex-1 flex flex-col items-center justify-center space-y-6 pt-12">
					<!-- 실패 아이콘 -->
					<div class="relative">
						<div class="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse"></div>
						<div class="relative w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border-4 border-red-500/50">
							<svg class="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
					</div>

					<!-- 실패 제목 -->
					<div class="text-center space-y-2">
						<h2 class="text-4xl font-bold text-red-400">배포 실패</h2>
					</div>

					<!-- 에러 메시지 카드 -->
					{#if result?.errorMessage}
						<div class="w-full max-w-2xl bg-red-950/30 backdrop-blur-md rounded-lg p-6 border border-red-500/30">
							<div class="flex items-start space-x-3">
								<svg class="w-6 h-6 text-red-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<div class="flex-1">
									<h3 class="text-lg font-semibold text-red-400 mb-2">에러 메시지</h3>
									<p class="text-gray-300 whitespace-pre-wrap break-words">{result.errorMessage}</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- 하단: 상세 로그 -->
			{#if showDetailedLogs}
				<div class="flex-1 flex flex-col overflow-hidden pt-12">
					<div class="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-white/20 flex flex-col flex-1 min-h-0 overflow-hidden">
						<h3 class="text-lg font-semibold text-white mb-4">배포 로그</h3>
						<div class="space-y-3 flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1">
							{#if events.length === 0}
								<div class="text-gray-500 text-center py-8">
									<p>이벤트가 없습니다.</p>
								</div>
							{:else}
								{#each events as event (event.timestamp)}
									<div
										class="flex items-start space-x-3 p-3 bg-black/30 rounded-lg border {event.type === 'error' ? 'border-red-500/30' : 'border-white/5'} hover:border-white/20 transition-all"
									>
										<div class="flex-1 min-w-0">
											<div class="flex items-center space-x-2 mb-1">
												<span class="font-semibold {event.type === 'error' ? 'text-red-400' : 'text-white'}">{event.type}</span>
												<span class="text-xs text-gray-500">
													{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}
												</span>
											</div>
											<p class="text-gray-300 break-words">{event.message}</p>
											{#if event.details && Object.keys(event.details).length > 0}
												<details class="mt-2">
													<summary class="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
														상세 정보
													</summary>
													<pre class="mt-2 text-xs bg-black/50 p-2 rounded overflow-x-auto text-gray-400 border border-white/10">
{JSON.stringify(event.details, null, 2)}</pre
													>
												</details>
											{/if}
										</div>
									</div>
								{/each}
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- 배포 완료: 전체 정보 표시 -->
		<div class="relative z-10 w-full h-full max-w-6xl px-4 py-4 flex flex-col overflow-hidden">
			<!-- 상단 버튼 -->
			<div class="absolute top-4 right-4 flex flex-wrap gap-3 z-20">
				<button
					onclick={() => (showDetailedLogs = !showDetailedLogs)}
					class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
				>
					{showDetailedLogs ? '상세 로그 숨기기' : '상세 로그 보기'}
				</button>
				{#if onReset}
					<button
						onclick={onReset}
						class="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
					>
						메인 화면으로
					</button>
				{/if}
			</div>
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 flex-1 overflow-hidden pt-12 lg:pt-10">
				<!-- 좌측: 현재 단계 및 상태 -->
			<div class="lg:col-span-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 mt-16 lg:mt-12">
					<!-- 현재 단계 카드 -->
					<div class="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-white/20">
						<h2 class="text-xl font-semibold mb-4 text-white">배포 결과</h2>
						<div class="space-y-4">
							<div>
								<p class="text-2xl font-bold text-green-400 mb-2">{currentStage}</p>
								<div class="h-2 bg-gray-700 rounded-full overflow-hidden">
									<div
										class="h-full bg-green-500 transition-all duration-500"
										style="width: 100%"
									></div>
								</div>
							</div>
							<div class="flex flex-wrap gap-2">
								<span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
									완료
								</span>
							</div>
						</div>
					</div>

					<!-- 배포 결과 -->
					{#if result}
						<div class="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-white/20">
							<h2 class="text-xl font-semibold mb-4 text-white">상세 결과</h2>
							<div class="space-y-2">
								<div>
									<span class="font-semibold text-gray-300">상태:</span>
									<span
										class="ml-2 px-2 py-1 rounded text-sm {result.status === 'completed' || result.status === 'COMPLETED'
											? 'bg-green-500/20 text-green-400 border border-green-500/30'
											: 'bg-red-500/20 text-red-400 border border-red-500/30'}"
									>
										{result.status}
									</span>
								</div>
								<div>
									<span class="font-semibold text-gray-300">메시지:</span>
									<p class="mt-1 text-gray-400">{result.errorMessage || '배포가 실패했습니다.'}</p>
								</div>
								{#if result.errorMessage}
									<details class="mt-4">
										<summary class="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
											상세 정보
										</summary>
										<pre class="mt-2 text-xs bg-black/50 p-3 rounded overflow-x-auto text-gray-300 border border-white/10">
{result.errorMessage}</pre
										>
									</details>
								{/if}
							</div>
						</div>
					{/if}

				</div>

				<!-- 우측: 이벤트 로그 (배포 완료 후에만 표시) -->
			{#if showDetailedLogs}
				<div class="lg:col-span-2 flex flex-col overflow-hidden lg:ml-4 mt-16 lg:mt-12">
					<div class="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-white/20 flex flex-col flex-1 min-h-0 overflow-hidden">
							<h2 class="text-xl font-semibold mb-4 text-white">배포 로그</h2>
						<div class="space-y-3 flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1">
								{#if events.length === 0}
									<div class="text-gray-500 text-center py-12">
										<p>이벤트가 없습니다.</p>
									</div>
								{:else}
									{#each events as event (event.timestamp)}
										<div
											class="flex items-start space-x-3 p-4 bg-black/30 rounded-lg border border-white/5 hover:border-white/20 transition-all"
										>
											<div class="flex-1 min-w-0">
												<div class="flex items-center space-x-2 mb-1">
													<span class="font-semibold text-white">{event.type}</span>
													<span class="text-xs text-gray-500">
														{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}
													</span>
												</div>
												<p class="text-gray-300 break-words">{event.message}</p>
												{#if event.details && Object.keys(event.details).length > 0}
													<details class="mt-2">
														<summary class="text-sm text-gray-500 cursor-pointer hover:text-gray-400">
															상세 정보
														</summary>
														<pre class="mt-2 text-xs bg-black/50 p-2 rounded overflow-x-auto text-gray-400 border border-white/10">
{JSON.stringify(event.details, null, 2)}</pre
														>
													</details>
												{/if}
											</div>
										</div>
									{/each}
								{/if}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
	</div>
</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 8px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	/* 두 줄로 자연스럽게 넘어가게 하는 스타일 */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
	}
</style>

