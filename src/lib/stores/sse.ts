import { writable } from 'svelte/store';

export type DeploymentEventType =
	| 'status'
	| 'log'
	| 'stage'
	| 'docker'
	| 'ecr'
	| 'ecs'
	| 'codedeploy'
	| 'bluegreen'
	| 'done'
	| 'error';

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
					const stageNum = data.details.stage;
					if (stageNum === 1) currentStage = 'Docker Build';
					else if (stageNum === 2) currentStage = 'ECR Push';
					else if (stageNum === 3) currentStage = 'ECS Deployment';
					else if (stageNum === 4) currentStage = 'Blue/Green';
					else if (stageNum === 5) currentStage = 'HealthCheck & 트래픽 전환';
					else if (stageNum === 6) currentStage = 'Completed';
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

	// done 이벤트 핸들러
	eventSource.addEventListener('done', (event: MessageEvent) => {
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
			console.error('Failed to parse SSE done event:', error);
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

	// 특정 이벤트 타입별 핸들러 (필요시)
	eventSource.addEventListener('docker', (event: MessageEvent) => {
		const data: DeploymentEvent = JSON.parse(event.data);
		console.log('Docker event:', data);
	});

	eventSource.addEventListener('ecr', (event: MessageEvent) => {
		const data: DeploymentEvent = JSON.parse(event.data);
		console.log('ECR event:', data);
	});

	eventSource.addEventListener('ecs', (event: MessageEvent) => {
		const data: DeploymentEvent = JSON.parse(event.data);
		console.log('ECS event:', data);
	});

	eventSource.addEventListener('codedeploy', (event: MessageEvent) => {
		const data: DeploymentEvent = JSON.parse(event.data);
		console.log('CodeDeploy event:', data);
	});

	eventSource.addEventListener('bluegreen', (event: MessageEvent) => {
		const data: DeploymentEvent = JSON.parse(event.data);
		console.log('Blue/Green event:', data);
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

