/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

/**
 * VeChain API Credentials
 * For accessing VeChain data services and APIs
 * 
 * Supports:
 * - VeChainStats API for analytics and statistics
 * - VeChain ToolChain for enterprise features
 * - Custom API endpoints
 */
export class VechainApi implements ICredentialType {
	name = 'vechainApi';
	displayName = 'VeChain API';
	documentationUrl = 'https://docs.vechain.org/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Service',
			name: 'apiService',
			type: 'options',
			options: [
				{
					name: 'VeChain Stats',
					value: 'vechainstats',
					description: 'VeChainStats analytics and statistics API',
				},
				{
					name: 'VeChain ToolChain',
					value: 'toolchain',
					description: 'VeChain ToolChain enterprise API',
				},
				{
					name: 'VeExplorer API',
					value: 'veexplorer',
					description: 'VeChain Explorer API',
				},
				{
					name: 'Custom API',
					value: 'custom',
					description: 'Custom VeChain API service',
				},
			],
			default: 'vechainstats',
			description: 'Select the VeChain API service to use',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for the selected service',
		},
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
			placeholder: 'https://api.vechainstats.com',
			description: 'Custom API URL (leave empty to use default for selected service)',
			displayOptions: {
				show: {
					apiService: ['custom'],
				},
			},
		},
		{
			displayName: 'ToolChain App ID',
			name: 'toolchainAppId',
			type: 'string',
			default: '',
			description: 'VeChain ToolChain Application ID',
			displayOptions: {
				show: {
					apiService: ['toolchain'],
				},
			},
		},
		{
			displayName: 'ToolChain Secret',
			name: 'toolchainSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'VeChain ToolChain Application Secret',
			displayOptions: {
				show: {
					apiService: ['toolchain'],
				},
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiService === "vechainstats" ? "https://api.vechainstats.com" : ($credentials.apiService === "toolchain" ? "https://api.vechain.tools" : ($credentials.apiService === "veexplorer" ? "https://explore.vechain.org/api" : $credentials.apiUrl))}}',
			url: '/health',
			method: 'GET',
		},
	};
}
