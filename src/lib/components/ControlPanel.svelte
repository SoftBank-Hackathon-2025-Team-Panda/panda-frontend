<script lang="ts">
	import { onMount } from 'svelte';
	import SpeakerVent from './SpeakerVent.svelte';
	import ControlScreen from './ControlScreen.svelte';
	import IndicatorButtons from './IndicatorButtons.svelte';
	import NumericKeypad from './NumericKeypad.svelte';
	import LaunchButton from './LaunchButton.svelte';
	import ToggleSwitches from './ToggleSwitches.svelte';

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

	// 숫자 입력 상태
	let inputValue = $state('');
	const MAX_LENGTH = 20;

	// 키패드 버튼 클릭 핸들러
	function handleKeyPress(key: string) {
		if (key === '*') {
			// 전체 초기화
			inputValue = '';
			return;
		}

		if (key === '#') {
			// 마지막 글자 삭제
			inputValue = inputValue.slice(0, -1);
			return;
		}

		if (key >= '0' && key <= '9') {
			// 최대 길이 체크 - 넘으면 앞에서부터 제거
			if (inputValue.length >= MAX_LENGTH) {
				inputValue = inputValue.slice(1) + key;
			} else {
				inputValue = inputValue + key;
			}
		}
	}

	// ControlPanel이 마운트될 때마다 초기화
	onMount(() => {
		inputValue = '';
	});
</script>

<div class="relative w-full h-full min-h-[700px]">
	<div class="relative w-full h-full min-h-[700px] overflow-hidden rounded-[32px] shadow-2xl p-6">
		<!-- 배경 레이어 -->
		<div class="absolute inset-0 pointer-events-none rounded-[32px]">
			<!-- 메인 그라데이션 배경 -->
			<div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-800 rounded-[32px]"></div>
			<!-- 텍스처 레이어 -->
			<div class="absolute inset-0 opacity-30 rounded-[32px]" style="background-image:
				repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px),
				repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px);"></div>
			<!-- 글로우 효과 -->
			<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
			<div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
			<!-- 그림자 효과 -->
			<div class="absolute inset-0 rounded-[32px]" style="box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.3);"></div>
		</div>

		<!-- 상단 좌측 스피커/벤트 -->
		<div class="absolute top-6 left-6 z-0">
			<SpeakerVent type="speaker" />
		</div>

		<!-- 중앙 화면 -->
		<div class="absolute top-6 left-1/2 -translate-x-1/2 z-0">
			<ControlScreen {countdown} inputValue={inputValue} />
		</div>

		<!-- 상단 우측 스피커/벤트 -->
		<div class="absolute top-6 right-6 z-0">
			<SpeakerVent type="vent" />
		</div>

		<!-- 중앙 표시등과 버튼들 -->
		<div class="absolute top-[16.5rem] left-1/2 -translate-x-1/2 z-0">
			<IndicatorButtons />
		</div>

		<!-- 하단: 번호판, 발사 버튼, 빨간 토글 스위치 2x3를 한 줄에 배치 -->
		<!-- 좌측 하단 숫자 키패드 -->
		<div class="absolute bottom-6 left-6 z-10">
			<NumericKeypad onKeyPress={handleKeyPress} />
		</div>

	<!-- 중앙 하단 큰 빨간색 발사 버튼 -->
	<div class="absolute bottom-[calc(5rem)] left-1/2 -translate-x-1/2 z-50">
		<LaunchButton
			{countdown}
			{buttonPressed}
			{deployConnecting}
			onDeploy={onDeploy}
			onButtonPress={onButtonPress}
		/>
	</div>

		<!-- 우측 빨간색 토글 스위치들 (2x3 그리드) -->
		<div class="absolute bottom-[calc(4rem)] right-6 z-10">
			<ToggleSwitches />
		</div>
	</div>
</div>

