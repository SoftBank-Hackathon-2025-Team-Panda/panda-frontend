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
	deploymentId: string;
	message: string;
}

export interface DeploymentResult {
	deploymentId: string;
	status: 'completed' | 'failed' | 'in-progress';
	message: string;
	details?: Record<string, any>;
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
		// 에러 응답 형식: { timestamp, status, error, message }
		const errorMessage = data.message || `GitHub connection failed: ${response.statusText}`;
		throw new Error(errorMessage);
	}

	// 성공 응답 형식: { code: 200, message: "...", data: { githubConnectionId: "..." } }
	if (data.code === 200 && data.data) {
		return { githubConnectionId: data.data.githubConnectionId };
	}

	throw new Error('Invalid response format from GitHub connection API');
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
		// 에러 응답 형식: { timestamp, status, error, message }
		const errorMessage = data.message || `AWS connection failed: ${response.statusText}`;
		throw new Error(errorMessage);
	}

	// 성공 응답 형식: { code: 200, message: "...", data: { awsConnectionId: "..." } }
	if (data.code === 200 && data.data) {
		return { awsConnectionId: data.data.awsConnectionId };
	}

	throw new Error('Invalid response format from AWS connection API');
}

/**
 * GitHub clone → Docker build → ECR Push → ECS 배포 시작
 */
export async function startDeployment(request: DeployRequest): Promise<DeployResponse> {
	const response = await fetch(`${API_BASE_URL}/deploy`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request)
	});
	if (!response.ok) {
		throw new Error(`Deployment start failed: ${response.statusText}`);
	}
	return response.json();
}

/**
 * 배포 최종 결과 조회
 */
export async function getDeploymentResult(deploymentId: string): Promise<DeploymentResult> {
	const response = await fetch(`${API_BASE_URL}/deploy/${deploymentId}/result`);
	if (!response.ok) {
		throw new Error(`Failed to get deployment result: ${response.statusText}`);
	}
	return response.json();
}
