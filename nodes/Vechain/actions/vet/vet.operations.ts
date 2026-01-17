/**
 * VET Token Operations
 *
 * Operations for VET (VeChain Token):
 * - Get balance
 * - Transfer VET
 * - Multi-transfer VET
 * - Calculate fees
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createThorClient } from '../../transport/thorClient';
import { weiToVet, vetToWei } from '../../utils/unitConverter';
import { Transaction, secp256k1, address } from 'thor-devkit';

export const vetProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vet'],
			},
		},
		options: [
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get VET balance of an address',
				action: 'Get VET balance',
			},
			{
				name: 'Transfer',
				value: 'transfer',
				description: 'Transfer VET to an address',
				action: 'Transfer VET',
			},
			{
				name: 'Multi-Transfer',
				value: 'multiTransfer',
				description: 'Transfer VET to multiple addresses in one transaction',
				action: 'Multi-transfer VET',
			},
			{
				name: 'Estimate Transfer Fee',
				value: 'estimateFee',
				description: 'Estimate gas cost for a VET transfer',
				action: 'Estimate transfer fee',
			},
		],
		default: 'getBalance',
	},
	// Address for balance
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vet'],
				operation: ['getBalance'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Address to check balance',
	},
	// Transfer fields
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vet'],
				operation: ['transfer', 'estimateFee'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
	},
	{
		displayName: 'Amount (VET)',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vet'],
				operation: ['transfer', 'estimateFee'],
			},
		},
		default: '',
		placeholder: '100',
		description: 'Amount of VET to send',
	},
	// Multi-transfer recipients
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['vet'],
				operation: ['multiTransfer'],
			},
		},
		default: {},
		options: [
			{
				name: 'recipient',
				displayName: 'Recipient',
				values: [
					{
						displayName: 'Address',
						name: 'address',
						type: 'string',
						default: '',
						placeholder: '0x...',
						description: 'Recipient address',
					},
					{
						displayName: 'Amount (VET)',
						name: 'amount',
						type: 'string',
						default: '',
						placeholder: '100',
						description: 'Amount of VET to send',
					},
				],
			},
		],
		description: 'List of recipients and amounts',
	},
	// Gas options
	{
		displayName: 'Gas Options',
		name: 'gasOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['vet'],
				operation: ['transfer', 'multiTransfer'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Gas Price Coefficient',
				name: 'gasPriceCoef',
				type: 'number',
				default: 0,
				description: 'Gas price coefficient (0-255). Higher = faster confirmation.',
			},
			{
				displayName: 'Gas Limit',
				name: 'gas',
				type: 'number',
				default: 21000,
				description: 'Maximum gas to use',
			},
			{
				displayName: 'Expiration (Blocks)',
				name: 'expiration',
				type: 'number',
				default: 720,
				description: 'Transaction expiration in blocks (~2 hours)',
			},
		],
	},
	// Use fee delegation
	{
		displayName: 'Use Fee Delegation',
		name: 'useFeeDelegation',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['vet'],
				operation: ['transfer', 'multiTransfer'],
			},
		},
		default: false,
		description: 'Whether to use fee delegation (VIP-191) for gas payment',
	},
];

export async function executeVetOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('vechainNetwork');
	const network = credentials.network as string;
	const customUrl = credentials.nodeUrl as string;
	const privateKey = credentials.privateKey as string;

	const client = createThorClient(network, customUrl);

	switch (operation) {
		case 'getBalance': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const account = await client.getAccount(address);

			return {
				address,
				balance: account.balance,
				balanceFormatted: weiToVet(account.balance) + ' VET',
				balanceVet: parseFloat(weiToVet(account.balance)),
			};
		}

		case 'transfer': {
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;
			const useFeeDelegation = this.getNodeParameter('useFeeDelegation', itemIndex, false) as boolean;

			const amountWei = vetToWei(amount);

			// Build transaction
			const bestBlock = await client.getBlock('best');
			const blockRef = bestBlock.id.slice(0, 18);

			const txBody = {
				chainTag: getChainTag(network),
				blockRef,
				expiration: (gasOptions.expiration as number) || 720,
				clauses: [
					{
						to: toAddress,
						value: '0x' + BigInt(amountWei).toString(16),
						data: '0x',
					},
				],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 21000,
				dependsOn: null,
				nonce: generateNonce(),
				reserved: useFeeDelegation ? { features: 1 } : undefined,
			};

			const tx = new Transaction(txBody as any);

			// Sign transaction
			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const signingHash = tx.signingHash();
			const signature = secp256k1.sign(signingHash, privateKeyBuffer);
			tx.signature = signature;

			// Send transaction
			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				from: address.fromPublicKey(secp256k1.derivePublicKey(privateKeyBuffer)),
				to: toAddress,
				amount,
				amountWei,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'multiTransfer': {
			const recipients = this.getNodeParameter('recipients', itemIndex) as IDataObject;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;
			const useFeeDelegation = this.getNodeParameter('useFeeDelegation', itemIndex, false) as boolean;

			const recipientList = (recipients.recipient as IDataObject[]) || [];
			if (recipientList.length === 0) {
				throw new Error('At least one recipient is required');
			}

			// Build clauses for each recipient
			const clauses = recipientList.map((r) => ({
				to: r.address as string,
				value: '0x' + BigInt(vetToWei(r.amount as string)).toString(16),
				data: '0x',
			}));

			// Calculate total gas (21000 base + 9000 per additional clause)
			const totalGas = 21000 + (clauses.length - 1) * 9000;

			const bestBlock = await client.getBlock('best');
			const blockRef = bestBlock.id.slice(0, 18);

			const txBody = {
				chainTag: getChainTag(network),
				blockRef,
				expiration: (gasOptions.expiration as number) || 720,
				clauses,
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || totalGas,
				dependsOn: null,
				nonce: generateNonce(),
				reserved: useFeeDelegation ? { features: 1 } : undefined,
			};

			const tx = new Transaction(txBody as any);
			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const signingHash = tx.signingHash();
			const signature = secp256k1.sign(signingHash, privateKeyBuffer);
			tx.signature = signature;

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			const totalAmount = recipientList.reduce(
				(sum, r) => sum + parseFloat(r.amount as string),
				0,
			);

			return {
				success: true,
				txId: result.id,
				clauseCount: clauses.length,
				recipients: recipientList,
				totalAmount: totalAmount + ' VET',
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'estimateFee': {
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;

			const amountWei = vetToWei(amount);

			// Estimate gas for VET transfer
			const clauses = [
				{
					to: toAddress,
					value: '0x' + BigInt(amountWei).toString(16),
					data: '0x',
				},
			];

			const estimates = await client.estimateGas(clauses, '0x0000000000000000000000000000000000000000');
			const totalGas = estimates.reduce((sum: number, e: { gasUsed: number }) => sum + e.gasUsed, 0);

			// Base VTHO cost = gas * baseGasPrice (1e15 wei per gas unit)
			const baseGasPrice = BigInt(1e15);
			const vthoCost = BigInt(totalGas) * baseGasPrice;

			return {
				estimatedGas: totalGas,
				baseFeeVtho: (Number(vthoCost) / 1e18).toFixed(6) + ' VTHO',
				note: 'Actual fee depends on gas price coefficient',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

function getChainTag(network: string): number {
	switch (network) {
		case 'mainnet':
			return 0x4a;
		case 'testnet':
			return 0x27;
		case 'solo':
			return 0xf6;
		default:
			return 0x4a;
	}
}

function getExplorerUrl(network: string, txId: string): string {
	switch (network) {
		case 'mainnet':
			return `https://explore.vechain.org/transactions/${txId}`;
		case 'testnet':
			return `https://explore-testnet.vechain.org/transactions/${txId}`;
		default:
			return '';
	}
}

function generateNonce(): string {
	return '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
}
