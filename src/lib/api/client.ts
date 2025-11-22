// API 클라이언트 - 새로운 API 스펙에 맞게 업데이트
import { env } from '$env/dynamic/public';
const API_BASE_URL = env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface GitHubConnectRequest {
	owner: string;
	repo: string;
	branch: string;
	token: string;
}

export interface GitHubConnectResponse {
	code: number;
	message: string;
	data: {
		githubConnectionId: string;
	};
}

export interface AWSConnectRequest {
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
	sessionToken?: string;
}

export interface AWSConnectResponse {
	code: number;
	message: string;
	data: {
		awsConnectionId: string;
	};
}

export interface DeployRequest {
	githubConnectionId: string;
	awsConnectionId: string;
	owner: string;
	repo: string;
	branch: string;
}

export interface DeployResponse {
	code?: number;
	message?: string;
	data?: {
		deploymentId: string;
		message: string;
	};
}

export interface DeploymentResultData {
	deploymentId: string;
	status: 'completed' | 'failed' | 'in-progress' | string;
	owner: string;
	repo: string;
	branch: string;
	startedAt: string;
	completedAt: string | null;
	durationSeconds: number;
	finalService: string | null;
	blueUrl: string | null;
	greenUrl: string | null;
	errorMessage: string | null;
	blueLatencyMs: number | null;
	greenLatencyMs: number | null;
	blueErrorRate: number | null;
	greenErrorRate: number | null;
	eventCount: number;
	successful: boolean;
	failed: boolean;
	fasterService: string | null;
	latencyImprovement: number | null;
	formattedDuration: string;
}

export interface DeploymentResult {
	code?: number;
	message?: string;
	data?: DeploymentResultData;
}

export interface CurrentDeploymentResponse {
	code?: number;
	message?: string;
	data?: {
		deploymentId: string;
		isActive: boolean;
	};
}

export interface GitHubConnectionInfo {
	connectionId: string;
	owner: string;
	repo: string;
	branch: string;
}

export interface AWSConnectionInfo {
	connectionId: string;
	region: string;
}

export interface ConnectionsResponse {
	code?: number;
	message?: string;
	data?: {
		github?: GitHubConnectionInfo[];
		aws?: AWSConnectionInfo[];
	};
}

interface ApiResponse<T = any> {
	code?: number;
	message?: string;
	data?: T;
	error?: boolean;
}

const DEFAULT_ERROR_MESSAGE = 'API 요청에 실패했습니다.';

async function parseApiResponse<T = any>(response: Response): Promise<ApiResponse<T>> {
	const text = await response.text();
	let parsed: ApiResponse<T> = {};

	if (text) {
		try {
			parsed = JSON.parse(text);
		} catch {
			// ignore parse errors
		}
	}

	if (!response.ok) {
		const errorMessage = parsed.message || response.statusText || DEFAULT_ERROR_MESSAGE;
		throw new Error(errorMessage);
	}

	if (parsed.error) {
		const errorMessage = parsed.message || DEFAULT_ERROR_MESSAGE;
		throw new Error(errorMessage);
	}

	return parsed;
}

/**
 * GitHub 레포 검증 후 연결 ID 생성
 */
export async function connectGitHub(request: GitHubConnectRequest): Promise<{ githubConnectionId: string }> {
	const response = await fetch(`${API_BASE_URL}/connect/github`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});

	const payload = await parseApiResponse<GitHubConnectResponse['data']>(response);

	if (!payload.data || !payload.data.githubConnectionId) {
		throw new Error(payload.message || 'GitHub 연결 ID가 없습니다.');
	}

	return { githubConnectionId: payload.data.githubConnectionId };
}

/**
 * AWS STS 인증 후 연결 ID 생성
 */
export async function connectAWS(request: AWSConnectRequest): Promise<{ awsConnectionId: string }> {
	const response = await fetch(`${API_BASE_URL}/connect/aws`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});

	const payload = await parseApiResponse<AWSConnectResponse['data']>(response);

	if (!payload.data || !payload.data.awsConnectionId) {
		throw new Error(payload.message || 'AWS 연결 ID가 없습니다.');
	}

	return { awsConnectionId: payload.data.awsConnectionId };
}

/**
 * GitHub clone → Docker build → ECR Push → ECS 배포 시작
 */
export async function startDeployment(request: DeployRequest): Promise<{ deploymentId: string; message: string }> {
	const response = await fetch(`${API_BASE_URL}/deploy`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});

	const payload = await parseApiResponse<DeployResponse['data']>(response);

	if (!payload.data || !payload.data.deploymentId) {
		throw new Error(payload.message || '배포 ID가 없습니다.');
	}

	return {
		deploymentId: payload.data.deploymentId,
		message: payload.data.message
	};
}

/**
 * 배포 최종 결과 조회
 */
export async function getDeploymentResult(deploymentId: string): Promise<DeploymentResultData> {
	const response = await fetch(`${API_BASE_URL}/deploy/${deploymentId}/result`);

	const data = await parseApiResponse<DeploymentResultData>(response);

	if (!data.data) {
		throw new Error(data.message || '배포 결과가 없습니다.');
	}

	return data.data;
}

/**
 * 저장된 GitHub 및 AWS 연결 정보 조회
 */
export async function getConnections(): Promise<{ github: GitHubConnectionInfo[]; aws: AWSConnectionInfo[] }> {
	const response = await fetch(`${API_BASE_URL}/connections`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	});

	const data = await parseApiResponse<ConnectionsResponse['data']>(response);

	return {
		github: data.data?.github || [],
		aws: data.data?.aws || []
	};
}

/**
 * 현재 활성 배포 상태 조회
 */
export async function getCurrentDeployment(): Promise<{ deploymentId: string | null; isActive: boolean } | null> {
	try {
		const response = await fetch(`${API_BASE_URL}/deploy/current`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});

		// 404나 배포가 없는 경우 null 반환
		if (response.status === 404) {
			return null;
		}

		const data = await parseApiResponse<CurrentDeploymentResponse['data']>(response);

		if (data.data) {
			return {
				deploymentId: data.data.deploymentId,
				isActive: data.data.isActive
			};
		}

		return null;
	} catch (error) {
		// API가 없거나 에러가 발생하면 null 반환
		return null;
	}
}

/**
 * 수동 트래픽 전환 (Blue/Green 배포)
 */
export async function switchTraffic(deploymentId: string): Promise<void> {
	const response = await fetch(`${API_BASE_URL}/deploy/${deploymentId}/switch`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' }
	});

	await parseApiResponse(response);
}
