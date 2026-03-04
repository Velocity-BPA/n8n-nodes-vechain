import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class VeChainApi implements ICredentialType {
	name = 'veChainApi';
	displayName = 'VeChain API';
	documentationUrl = 'https://docs.vechain.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for VeChain node services. Optional for public endpoints but recommended for higher rate limits.',
		},
		{
			displayName: 'Network',
			name: 'network',
			type: 'options',
			options: [
				{
					name: 'Mainnet',
					value: 'mainnet',
				},
				{
					name: 'Testnet',
					value: 'testnet',
				},
			],
			default: 'mainnet',
			description: 'VeChain network to connect to',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://mainnet.veblocks.net',
			description: 'Base URL for VeChain API. Defaults to mainnet. Use https://testnet.veblocks.net for testnet.',
		},
	];
}