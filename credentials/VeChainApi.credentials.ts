import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class VeChainApi implements ICredentialType {
	name = 'veChainApi';
	displayName = 'VeChain API';
	documentationUrl = 'https://docs.vechain.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://vethor-node.vechain.org',
			required: true,
			description: 'The base URL for the VeChain API endpoint',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'API key for authenticated requests (optional - public endpoints available without authentication)',
		},
	];
}