import { writable } from 'svelte/store';

export interface GitHubConnection {
	connected: boolean;
	connectionId?: string;
	owner?: string;
	repo?: string;
	branch?: string;
}

export interface AWSConnection {
	connected: boolean;
	connectionId?: string;
	region?: string;
}

export interface DeploymentConfig {
	github: GitHubConnection;
	aws: AWSConnection;
	readyToDeploy: boolean;
}

export const deploymentConfig = writable<DeploymentConfig>({
	github: { connected: false },
	aws: { connected: false },
	readyToDeploy: false
});

export interface CurrentDeployment {
	deploymentId: string | null;
	isActive: boolean;
}

export const currentDeployment = writable<CurrentDeployment>({
	deploymentId: null,
	isActive: false
});
