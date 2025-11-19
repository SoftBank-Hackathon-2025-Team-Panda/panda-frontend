export interface DeploymentStage {
	id: string;
	name: string;
	status: 'pending' | 'in-progress' | 'completed' | 'failed';
	startTime?: string;
	endTime?: string;
	error?: string;
}

export interface DeploymentPipeline {
	id: string;
	stages: DeploymentStage[];
	currentStage: number;
	overallStatus: 'idle' | 'running' | 'completed' | 'failed';
	startTime?: string;
	endTime?: string;
}

export interface ECSResource {
	clusterName: string;
	serviceName: string;
	taskDefinition: string;
	desiredCount: number;
	runningCount: number;
}

export interface ALBResource {
	loadBalancerArn: string;
	dnsName: string;
	listenerArn: string;
}

export interface BlueGreenDeployment {
	blue: {
		taskDefinition: string;
		trafficWeight: number;
		status: 'active' | 'draining' | 'stopped';
	};
	green: {
		taskDefinition: string;
		trafficWeight: number;
		status: 'active' | 'draining' | 'stopped';
	};
}

