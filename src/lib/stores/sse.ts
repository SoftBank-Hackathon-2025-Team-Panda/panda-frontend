import { writable } from 'svelte/store';

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
	const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
	const eventSource = new EventSource(`${API_BASE_URL}/deploy/${deploymentId}/events`);

	// 초기 상태 업데이트
	deploymentEvents.update((state) => ({
		...state,
		isConnected: true,
		events: []
	}));

	// stage 이벤트 핸들러
	eventSource.addEventListener('stage', (event: MessageEvent) => {
		try {
			const data: DeploymentEvent = JSON.parse(event.data);
			const eventWithTimestamp: DeploymentEvent = {
				...data,
				timestamp: data.timestamp || new Date().toISOString()
			};

			deploymentEvents.update((state) => {
				const newEvents = [...state.events, eventWithTimestamp];
				const isComplete = data.type === 'stage' && data.details?.stage === 6;
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

	// error 이벤트 핸들러
	eventSource.addEventListener('error', (event: MessageEvent) => {
		try {
			const data: DeploymentEvent = JSON.parse(event.data);
			const eventWithTimestamp: DeploymentEvent = {
				...data,
				timestamp: data.timestamp || new Date().toISOString()
			};

			deploymentEvents.update((state) => {
				const newEvents = [...state.events, eventWithTimestamp];
				return {
					...state,
					events: newEvents,
					currentStage: 'Failed',
					isComplete: true,
					hasError: true
				};
			});
		} catch (error) {
			console.error('Failed to parse SSE error event:', error);
		}
	});

	// success 이벤트 핸들러 (stage 4 완료)
	eventSource.addEventListener('success', (event: MessageEvent) => {
		try {
			const data: DeploymentEvent = JSON.parse(event.data);
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
		} catch (error) {
			console.error('Failed to parse SSE success event:', error);
		}
	});

	// fail 이벤트 핸들러 (stage 4 실패)
	eventSource.addEventListener('fail', (event: MessageEvent) => {
		try {
			const data: DeploymentEvent = JSON.parse(event.data);
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
		} catch (error) {
			console.error('Failed to parse SSE fail event:', error);
		}
	});


	// 연결 오류 처리
	eventSource.onerror = (error) => {
		console.error('SSE connection error:', error);
		deploymentEvents.update((state) => ({
			...state,
			isConnected: false,
			hasError: true
		}));
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

