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
 * VeChain Fee Delegation Credentials (VIP-191 / MPP)
 * 
 * VeChain supports fee delegation where a third party (sponsor) can pay
 * transaction fees (VTHO) on behalf of users. This is powerful for:
 * - Onboarding new users without requiring them to hold VTHO
 * - Enterprise applications where company pays all fees
 * - DApps providing gasless transactions
 * 
 * Two modes:
 * 1. Designated Gas Payer: Uses a delegation service
 * 2. Self-sponsoring: Your own account pays the fees
 */
export class FeeDelegation implements ICredentialType {
	name = 'feeDelegation';
	displayName = 'VeChain Fee Delegation';
	documentationUrl = 'https://docs.vechain.org/thor/learn/fee-delegation';
	properties: INodeProperties[] = [
		{
			displayName: 'Delegation Type',
			name: 'delegationType',
			type: 'options',
			options: [
				{
					name: 'Delegation Service',
					value: 'service',
					description: 'Use a third-party fee delegation service',
				},
				{
					name: 'Self-Sponsor',
					value: 'self',
					description: 'Sponsor transactions with your own account',
				},
				{
					name: 'VeChain Energy',
					value: 'energy',
					description: 'Use VeChain Energy delegation service',
				},
			],
			default: 'service',
			description: 'Select the type of fee delegation',
		},
		{
			displayName: 'Delegator URL',
			name: 'delegatorUrl',
			type: 'string',
			default: '',
			placeholder: 'https://sponsor.vechain.energy/by/123',
			description: 'URL of the fee delegation service endpoint',
			displayOptions: {
				show: {
					delegationType: ['service'],
				},
			},
		},
		{
			displayName: 'VeChain Energy API Key',
			name: 'energyApiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'API key for VeChain Energy service',
			displayOptions: {
				show: {
					delegationType: ['energy'],
				},
			},
		},
		{
			displayName: 'Sponsor Address',
			name: 'sponsorAddress',
			type: 'string',
			default: '',
			placeholder: '0x...',
			description: 'Address of the sponsor account',
		},
		{
			displayName: 'Sponsor Private Key',
			name: 'sponsorPrivateKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: '0x...',
			description: 'Private key of the sponsor account (for self-sponsoring)',
			displayOptions: {
				show: {
					delegationType: ['self'],
				},
			},
		},
		{
			displayName: 'Credit Limit (VTHO)',
			name: 'creditLimit',
			type: 'number',
			default: 1000,
			description: 'Maximum VTHO to spend on delegated transactions',
		},
		{
			displayName: 'Whitelist Only',
			name: 'whitelistOnly',
			type: 'boolean',
			default: false,
			description: 'Whether to only sponsor whitelisted addresses',
		},
		{
			displayName: 'Whitelisted Addresses',
			name: 'whitelistedAddresses',
			type: 'string',
			default: '',
			placeholder: '0x123..., 0x456...',
			description: 'Comma-separated list of addresses to whitelist for sponsorship',
			displayOptions: {
				show: {
					whitelistOnly: [true],
				},
			},
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.delegationType === "energy" ? "https://sponsor.vechain.energy" : $credentials.delegatorUrl}}',
			url: '/',
			method: 'GET',
		},
	};
}
