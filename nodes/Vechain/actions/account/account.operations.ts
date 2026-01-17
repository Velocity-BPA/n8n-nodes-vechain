/**
 * VeChain Account Actions
 * 
 * Operations for working with VeChain accounts:
 * - Get account info (VET balance, VTHO energy, code status)
 * - Check balances
 * - Validate addresses
 * - Calculate VTHO generation
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createThorClient } from '../../transport/thorClient';
import { weiToVet, weiToVtho } from '../../utils/unitConverter';
import { calculateVthoPerDay, calculateVthoGenerated } from '../../utils/energyCalculator';

/**
 * Account resource properties
 */
export const accountProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get Account Info',
				value: 'getAccountInfo',
				description: 'Get complete account information including VET balance, VTHO energy, and contract status',
				action: 'Get account info',
			},
			{
				name: 'Get VET Balance',
				value: 'getVetBalance',
				description: 'Get VET balance of an account',
				action: 'Get VET balance',
			},
			{
				name: 'Get VTHO Balance',
				value: 'getVthoBalance',
				description: 'Get VTHO (energy) balance of an account',
				action: 'Get VTHO balance',
			},
			{
				name: 'Get Account Code',
				value: 'getAccountCode',
				description: 'Get bytecode if account is a contract',
				action: 'Get account code',
			},
			{
				name: 'Get Account Storage',
				value: 'getAccountStorage',
				description: 'Get storage value at a specific key',
				action: 'Get account storage',
			},
			{
				name: 'Validate Address',
				value: 'validateAddress',
				description: 'Validate if a string is a valid VeChain address',
				action: 'Validate address',
			},
			{
				name: 'Calculate VTHO Generation',
				value: 'calculateVthoGeneration',
				description: 'Calculate VTHO generated from VET holdings over time',
				action: 'Calculate VTHO generation',
			},
			{
				name: 'Is Contract',
				value: 'isContract',
				description: 'Check if an address is a smart contract',
				action: 'Check if contract',
			},
		],
		default: 'getAccountInfo',
	},
	// Address field
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: [
					'getAccountInfo',
					'getVetBalance',
					'getVthoBalance',
					'getAccountCode',
					'getAccountStorage',
					'isContract',
				],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'VeChain address (40 hex characters with 0x prefix)',
	},
	// Address for validation
	{
		displayName: 'Address to Validate',
		name: 'addressToValidate',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['validateAddress'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Address string to validate',
	},
	// Storage key
	{
		displayName: 'Storage Key',
		name: 'storageKey',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getAccountStorage'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Storage slot key (32 bytes hex)',
	},
	// VTHO calculation fields
	{
		displayName: 'VET Amount',
		name: 'vetAmount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['calculateVthoGeneration'],
			},
		},
		default: '',
		placeholder: '1000000',
		description: 'Amount of VET holdings (in VET, not wei)',
	},
	{
		displayName: 'Time Period',
		name: 'timePeriod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['calculateVthoGeneration'],
			},
		},
		options: [
			{ name: 'Per Hour', value: 'hour' },
			{ name: 'Per Day', value: 'day' },
			{ name: 'Per Week', value: 'week' },
			{ name: 'Per Month', value: 'month' },
			{ name: 'Per Year', value: 'year' },
			{ name: 'Custom (Seconds)', value: 'custom' },
		],
		default: 'day',
		description: 'Time period for VTHO generation calculation',
	},
	{
		displayName: 'Custom Seconds',
		name: 'customSeconds',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['calculateVthoGeneration'],
				timePeriod: ['custom'],
			},
		},
		default: 86400,
		description: 'Custom time period in seconds',
	},
	// Block revision
	{
		displayName: 'Block Revision',
		name: 'blockRevision',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getAccountInfo', 'getVetBalance', 'getVthoBalance'],
			},
		},
		default: '',
		placeholder: 'best or block number/ID',
		description: 'Block number, ID, or "best" for latest (leave empty for best)',
	},
];

/**
 * Execute account operations
 */
export async function executeAccountOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('vechainNetwork');
	const network = credentials.network as string;
	const customUrl = credentials.nodeUrl as string;
	
	const client = createThorClient(network, customUrl);
	
	switch (operation) {
		case 'getAccountInfo': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const revision = this.getNodeParameter('blockRevision', itemIndex, '') as string;
			
			const account = await client.getAccount(address, revision || undefined);
			
			return {
				address,
				balance: account.balance,
				balanceFormatted: weiToVet(account.balance) + ' VET',
				energy: account.energy,
				energyFormatted: weiToVtho(account.energy) + ' VTHO',
				hasCode: account.hasCode,
				isContract: account.hasCode,
				vthoPerDay: calculateVthoPerDay(account.balance),
			};
		}
		
		case 'getVetBalance': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const revision = this.getNodeParameter('blockRevision', itemIndex, '') as string;
			
			const account = await client.getAccount(address, revision || undefined);
			
			return {
				address,
				balance: account.balance,
				balanceFormatted: weiToVet(account.balance) + ' VET',
			};
		}
		
		case 'getVthoBalance': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const revision = this.getNodeParameter('blockRevision', itemIndex, '') as string;
			
			const account = await client.getAccount(address, revision || undefined);
			
			return {
				address,
				energy: account.energy,
				energyFormatted: weiToVtho(account.energy) + ' VTHO',
			};
		}
		
		case 'getAccountCode': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			
			const code = await client.getAccountCode(address);
			const hasCode = code !== '0x' && code !== '';
			
			return {
				address,
				code,
				hasCode,
				isContract: hasCode,
			};
		}
		
		case 'getAccountStorage': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const key = this.getNodeParameter('storageKey', itemIndex) as string;
			
			const value = await client.getAccountStorage(address, key);
			
			return {
				address,
				key,
				value,
			};
		}
		
		case 'validateAddress': {
			const address = this.getNodeParameter('addressToValidate', itemIndex) as string;
			
			const isValid = /^0x[a-fA-F0-9]{40}$/.test(address);
			const checksumValid = isValid ? isChecksumValid(address) : false;
			
			return {
				address,
				isValid,
				checksumValid,
				message: isValid
					? 'Valid VeChain address'
					: 'Invalid address format. Must be 40 hex characters with 0x prefix.',
			};
		}
		
		case 'calculateVthoGeneration': {
			const vetAmount = this.getNodeParameter('vetAmount', itemIndex) as string;
			const timePeriod = this.getNodeParameter('timePeriod', itemIndex) as string;
			const customSeconds = this.getNodeParameter('customSeconds', itemIndex, 86400) as number;
			
			// Convert VET to wei for calculation
			const vetWei = BigInt(Math.floor(parseFloat(vetAmount) * 1e18)).toString();
			
			let seconds: number;
			switch (timePeriod) {
				case 'hour':
					seconds = 3600;
					break;
				case 'day':
					seconds = 86400;
					break;
				case 'week':
					seconds = 604800;
					break;
				case 'month':
					seconds = 2592000;
					break;
				case 'year':
					seconds = 31536000;
					break;
				case 'custom':
					seconds = customSeconds;
					break;
				default:
					seconds = 86400;
			}
			
			const vthoGenerated = calculateVthoGenerated(vetWei, seconds);
			
			return {
				vetAmount,
				timePeriod,
				seconds,
				vthoGenerated,
				vthoGeneratedFormatted: weiToVtho(vthoGenerated) + ' VTHO',
				dailyRate: '0.000432 VTHO per VET',
			};
		}
		
		case 'isContract': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			
			const isContract = await client.isContract(address);
			
			return {
				address,
				isContract,
				type: isContract ? 'Contract' : 'EOA (Externally Owned Account)',
			};
		}
		
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

/**
 * Basic checksum validation
 */
function isChecksumValid(address: string): boolean {
	// For now, just return true for valid format
	// Full checksum validation would use keccak256
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}
