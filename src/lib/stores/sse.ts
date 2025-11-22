import { writable } from 'svelte/store';
import { env } from '$env/dynamic/public';
const API_BASE_URL = env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export type DeploymentEventType =
	| 'status'
	| 'log'
	| 'stage'
	| 'done'
	| 'error'
	| 'success'
	| 'fail';

export interface DeploymentEvent {
	type: DeploymentEventType;
	message: string;
	details?: Record<string, any>;
	timestamp?: string;
}

export interface DeploymentEventsState {
	events: DeploymentEvent[];
	currentStage: string;
	isConnected: boolean;
	isComplete: boolean;
	hasError: boolean;
}

export const deploymentEvents = writable<DeploymentEventsState>({
	events: [],
	currentStage: 'idle',
	isConnected: false,
	isComplete: false,
	hasError: false
});

function getStageLabel(stageNum: number) {
	if (stageNum === 1) return 'Docker Build';
	if (stageNum === 2) return 'ECR Push';
	if (stageNum === 3) return 'ECS Deployment';
	if (stageNum >= 4) return 'Blue/Green';
	return 'Idle';
}

/**
 * SSE(Server-Sent Events) 연결 생성
 */
export function createSSEConnection(deploymentId: string): EventSource {
	const url = `${API_BASE_URL}/deploy/${deploymentId}/events`;
	const connectionStartTime = Date.now();
	console.log('[SSE] Connecting to:', url);
	console.log('[SSE] Connection attempt started at:', new Date().toISOString());

	// 초기 상태 업데이트
	deploymentEvents.update((state) => ({
		...state,
		events: []
	}));

	const eventSource = new EventSource(url);

	// 재연결 시도 카운트
	let reconnectAttempts = 0;
	const maxReconnectAttempts = 5;
	let errorTimeout: ReturnType<typeof setTimeout> | null = null;

	// connected 이벤트 핸들러를 가장 먼저 등록 (이벤트가 빠르게 도착할 수 있음)
	// 주의: connected 이벤트는 events 배열에 추가하지 않음 (전체 로그에서 제외)
	eventSource.addEventListener('connected', (event: MessageEvent) => {
		console.log('[SSE] Connected event listener triggered');
		console.log('[SSE] Connected event raw data:', event.data);
		try {
			if (!event.data || event.data.trim() === '') {
				console.warn('[SSE] Connected event has empty data');
				return;
			}
			const data = JSON.parse(event.data);
			console.log('[SSE] Connected event received:', data.message);
			console.log('[SSE] Connected event parsed data:', data);
			// 연결 확인 로그만 남기고 상태는 onopen에서 이미 처리됨
			// events 배열에 추가하지 않음 (전체 로그에서 제외)
		} catch (error) {
			console.error('[SSE] Failed to parse SSE connected event:', error);
			console.error('[SSE] Connected event raw data:', event.data);
		}
	});

	// 모든 이벤트를 로깅하기 위한 일반 리스너 (디버깅용)
	eventSource.addEventListener('message', (event: MessageEvent) => {
		console.log('[SSE] Generic message event received:', {
			type: event.type,
			data: event.data,
			lastEventId: event.lastEventId
		});
	});

	// 연결 성공 시
	eventSource.onopen = () => {
		const connectionTime = Date.now() - connectionStartTime;
		console.log('[SSE] Connection opened');
		console.log(`[SSE] Connection established in ${connectionTime}ms`);
		reconnectAttempts = 0;
		if (errorTimeout) {
			clearTimeout(errorTimeout);
			errorTimeout = null;
		}
		// SSE 연결 성공 후 "SSE 연결 대기 중" 또는 idle 상태에서 Docker Build 화면으로 전환
		deploymentEvents.update((state) => {
			// "SSE 연결 대기 중" 또는 idle 상태이거나 완료되지 않았고 에러가 아닌 경우 Docker Build로 전환
			if ((state.currentStage === 'SSE 연결 대기 중' || state.currentStage === 'idle' || !state.isComplete) && !state.hasError) {
				return {
					...state,
					events: [],
					currentStage: 'Docker Build',
					isConnected: true,
					isComplete: false,
					hasError: false
				};
			}
			return {
				...state,
				isConnected: true
			};
		});
	};

	// stage 이벤트 핸들러
	eventSource.addEventListener('stage', (event: MessageEvent) => {
		try {
			const data: DeploymentEvent = JSON.parse(event.data);
			console.log('[SSE] Stage event received:', data);
			const eventWithTimestamp: DeploymentEvent = {
				...data,
				timestamp: data.timestamp || new Date().toISOString()
			};

			deploymentEvents.update((state) => {
				const newEvents = [...state.events, eventWithTimestamp];
				const isComplete = false;
				const hasError = false;

				// 현재 단계 추출
			let currentStage = state.currentStage;
			if (data.type === 'stage' && data.details?.stage) {
				currentStage = getStageLabel(data.details.stage);
			}
				return {
					...state,
					events: newEvents,
					currentStage,
					isComplete,
					hasError
				};
			});
		} catch (error) {
			console.error('Failed to parse SSE stage event:', error);
		}
	});

	// success 이벤트 핸들러 (Blue/Green 배포 완료)
	eventSource.addEventListener('success', (event: MessageEvent) => {
		try {
			const data: DeploymentEvent = JSON.parse(event.data);
			console.log('[SSE] Success event received:', data);
			const eventWithTimestamp: DeploymentEvent = {
				...data,
				timestamp: data.timestamp || new Date().toISOString()
			};

			deploymentEvents.update((state) => {
				const newEvents = [...state.events, eventWithTimestamp];
				return {
					...state,
					events: newEvents,
					currentStage: 'Completed',
					isComplete: true,
					hasError: false
				};
			});

			// 배포 완료 후 SSE 연결 종료
			console.log('[SSE] Closing connection after success event');
			eventSource.close();
		} catch (error) {
			console.error('Failed to parse SSE success event:', error);
		}
	});

	// fail 이벤트 핸들러 (Blue/Green 배포 실패)
	eventSource.addEventListener('fail', (event: MessageEvent) => {
		try {
			const data: DeploymentEvent = JSON.parse(event.data);
			console.log('[SSE] Fail event received:', data);
			const eventWithTimestamp: DeploymentEvent = {
				...data,
				timestamp: data.timestamp || new Date().toISOString()
			};

			deploymentEvents.update((state) => {
				const newEvents = [...state.events, eventWithTimestamp];
				return {
					...state,
					events: newEvents,
					currentStage: data.details?.stage ? getStageLabel(data.details.stage) : 'Failed',
					isComplete: true,
					hasError: true
				};
			});

			// 배포 실패 후 SSE 연결 종료
			console.log('[SSE] Closing connection after fail event');
			eventSource.close();
		} catch (error) {
			console.error('Failed to parse SSE fail event:', error);
		}
	});


	// 연결 실패 처리 함수
	const handleConnectionFailure = (shouldClose: boolean = true) => {
		// 연결 종료
		if (shouldClose && errorTimeout) {
			clearTimeout(errorTimeout);
			errorTimeout = null;
		}
		if (shouldClose) {
			eventSource.close();
		}

		// 이미 fail 상태가 아니면 fail 이벤트 추가
		deploymentEvents.update((state) => {
			if (!state.hasError && !state.isComplete) {
				const failEvent: DeploymentEvent = {
					type: 'fail',
					message: 'SSE 연결에 실패했습니다.',
					timestamp: new Date().toISOString()
				};
				const newEvents = [...state.events, failEvent];
				return {
					...state,
					events: newEvents,
					isConnected: false,
					isComplete: true,
					hasError: true,
					currentStage: state.currentStage === 'idle' ? 'Failed' : state.currentStage
				};
			}
			return {
				...state,
				isConnected: false,
				hasError: true
			};
		});
	};

	// 연결 오류 처리
	eventSource.onerror = (error) => {
		// 연결이 완전히 닫힌 상태 (더 이상 재연결 불가능)
		if (eventSource.readyState === EventSource.CLOSED) {
			console.error('[SSE] Connection closed by server or network error');
			console.error('[SSE] URL:', eventSource.url || url);
			if (errorTimeout) {
				clearTimeout(errorTimeout);
				errorTimeout = null;
			}
			// 재연결 시도 횟수 확인 후 실패 처리
			if (reconnectAttempts >= maxReconnectAttempts) {
				console.error(`[SSE] Max reconnect attempts (${maxReconnectAttempts}) reached - failing`);
			}
			handleConnectionFailure(false);
			return;
		}

		// 재연결 시도 중이면 카운트 증가
		if (eventSource.readyState === EventSource.CONNECTING) {
			reconnectAttempts++;
			// 재연결 시도는 첫 번째와 마지막 시도만 로그 출력
			if (reconnectAttempts === 1 || reconnectAttempts >= maxReconnectAttempts) {
				console.warn(`[SSE] Reconnecting... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
			}

			// 최대 재연결 시도 횟수 초과 시 실패 처리
			if (reconnectAttempts >= maxReconnectAttempts) {
				console.error(`[SSE] Max reconnect attempts (${maxReconnectAttempts}) reached - failing`);
				if (errorTimeout) {
					clearTimeout(errorTimeout);
					errorTimeout = null;
				}
				// 연결을 닫고 실패 처리
				eventSource.close();
				handleConnectionFailure(false);
				return;
			}

			// 재연결 시도 중 타임아웃 설정 (각 재연결 시도마다 리셋되지 않음)
			// 첫 번째 재연결 시도 시에만 타임아웃 설정
			if (reconnectAttempts === 1 && !errorTimeout) {
				errorTimeout = setTimeout(() => {
					// 아직 연결이 안 되었고 최대 재연결 시도 횟수를 초과했으면
					if (eventSource.readyState !== EventSource.OPEN && reconnectAttempts >= maxReconnectAttempts) {
						console.error('[SSE] Reconnection timeout - max attempts reached');
						eventSource.close();
						handleConnectionFailure(false);
					}
				}, 60000); // 60초 후 타임아웃 (재연결 시도 시간 충분히 확보)
			}
			return;
		}
	};

	return eventSource;
}

/**
 * SSE 연결 종료
 */
export function closeSSEConnection(eventSource: EventSource | null) {
	if (eventSource) {
		eventSource.close();
		deploymentEvents.update((state) => ({
			...state,
			isConnected: false
		}));
	}
}

