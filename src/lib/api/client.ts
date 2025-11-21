// API 클라이언트 - 새로운 API 스펙에 맞게 업데이트
const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

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
	code: number;
	message: string;
	data: {
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
	code: number;
	message: string;
	data: DeploymentResultData;
}

export interface CurrentDeploymentResponse {
	code: number;
	message: string;
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
	code: number;
	message: string;
	data: {
		github: GitHubConnectionInfo[];
		aws: AWSConnectionInfo[];
	};
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

	const data = await response.json();

	if (!response.ok) {
		// 에러 응답 형식: { timestamp, status, error, message } 또는 { code, message }
		const errorMessage = data.message || `GitHub connection failed: ${response.statusText}`;
		throw new Error(errorMessage);
	}

	// 성공 응답 형식: { code: 0, message: "...", data: { githubConnectionId: "..." } }
	if (data.code === 0 && data.data && data.data.githubConnectionId) {
		return { githubConnectionId: data.data.githubConnectionId };
	}

	// code가 0이 아닌 경우 에러 메시지 반환
	const errorMessage = data.message || 'Invalid response format from GitHub connection API';
	throw new Error(errorMessage);
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

	const data = await response.json();

	if (!response.ok) {
		// 에러 응답 형식: { timestamp, status, error, message } 또는 { code, message }
		const errorMessage = data.message || `AWS connection failed: ${response.statusText}`;
		throw new Error(errorMessage);
	}

	// 성공 응답 형식: { code: 0, message: "...", data: { awsConnectionId: "..." } }
	if (data.code === 0 && data.data && data.data.awsConnectionId) {
		return { awsConnectionId: data.data.awsConnectionId };
	}

	// code가 0이 아닌 경우 에러 메시지 반환
	const errorMessage = data.message || 'Invalid response format from AWS connection API';
	throw new Error(errorMessage);
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

	const data: DeployResponse = await response.json();

	if (!response.ok) {
		const errorMessage = data.message || `Deployment start failed: ${response.statusText}`;
		throw new Error(errorMessage);
	}

	// 성공 응답 형식: { code: 0, message: "...", data: { deploymentId, message } }
	if (data.code === 0 && data.data && data.data.deploymentId) {
		return {
			deploymentId: data.data.deploymentId,
			message: data.data.message
		};
	}

	const errorMessage = data.message || 'Invalid response format from deployment API';
	throw new Error(errorMessage);
}

/**
 * 배포 최종 결과 조회
 */
export async function getDeploymentResult(deploymentId: string): Promise<DeploymentResultData> {
	const response = await fetch(`${API_BASE_URL}/deploy/${deploymentId}/result`);

	if (!response.ok) {
		throw new Error(`Failed to get deployment result: ${response.statusText}`);
	}

	const data: DeploymentResult = await response.json();

	// 성공 응답 형식: { code: 0, message: "...", data: {...} }
	if (data.code === 0 && data.data) {
		return data.data;
	}

	throw new Error(data.message || 'Invalid response format from deployment result API');
}

/**
 * 저장된 GitHub 및 AWS 연결 정보 조회
 */
export async function getConnections(): Promise<{ github: GitHubConnectionInfo[]; aws: AWSConnectionInfo[] }> {
	const response = await fetch(`${API_BASE_URL}/connections`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' }
	});

	const data: ConnectionsResponse = await response.json();

	if (!response.ok) {
		const errorMessage = data.message || `Failed to get connections: ${response.statusText}`;
		throw new Error(errorMessage);
	}

	// 성공 응답 형식: { code: 0, message: "...", data: { github: [...], aws: [...] } }
	if (data.code === 0 && data.data) {
		return {
			github: data.data.github || [],
			aws: data.data.aws || []
		};
	}

	const errorMessage = data.message || 'Invalid response format from connections API';
	throw new Error(errorMessage);
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

		const data: CurrentDeploymentResponse = await response.json();

		if (!response.ok) {
			// 에러가 발생해도 null 반환 (배포가 없는 것으로 간주)
			return null;
		}

		// 성공 응답 형식: { code: 0, message: "...", data: { deploymentId, isActive } }
		if (data.code === 0 && data.data) {
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
