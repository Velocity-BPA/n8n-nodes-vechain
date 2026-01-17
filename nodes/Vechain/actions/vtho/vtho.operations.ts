/**
 * VTHO Token Operations
 *
 * Operations for VTHO (VeThor Token / Energy):
 * - Get balance
 * - Transfer VTHO
 * - Calculate generation rate
 * - Check burn rate
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createThorClient } from '../../transport/thorClient';
import { weiToVtho, vthoToWei, weiToVet } from '../../utils/unitConverter';
import { calculateVthoGenerated, calculateVthoPerDay, VTHO_PER_VET_PER_SECOND } from '../../utils/energyCalculator';
import { VTHO_CONTRACT_ADDRESS } from '../../constants/tokens';
import { VIP180_ABI } from '../../constants/abis';
import { Transaction, secp256k1, abi } from 'thor-devkit';

export const vthoProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vtho'],
			},
		},
		options: [
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get VTHO balance of an address',
				action: 'Get VTHO balance',
			},
			{
				name: 'Transfer',
				value: 'transfer',
				description: 'Transfer VTHO to an address',
				action: 'Transfer VTHO',
			},
			{
				name: 'Get Generation Rate',
				value: 'getGenerationRate',
				description: 'Calculate VTHO generation based on VET holdings',
				action: 'Get generation rate',
			},
			{
				name: 'Approve',
				value: 'approve',
				description: 'Approve an address to spend VTHO',
				action: 'Approve VTHO spending',
			},
			{
				name: 'Get Allowance',
				value: 'getAllowance',
				description: 'Get VTHO spending allowance',
				action: 'Get allowance',
			},
			{
				name: 'Get Total Supply',
				value: 'getTotalSupply',
				description: 'Get total VTHO supply',
				action: 'Get total supply',
			},
		],
		default: 'getBalance',
	},
	// Address field
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vtho'],
				operation: ['getBalance', 'getGenerationRate'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Address to check',
	},
	// Transfer fields
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vtho'],
				operation: ['transfer'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
	},
	{
		displayName: 'Amount (VTHO)',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vtho'],
				operation: ['transfer', 'approve'],
			},
		},
		default: '',
		placeholder: '1000',
		description: 'Amount of VTHO',
	},
	// Spender for approve
	{
		displayName: 'Spender Address',
		name: 'spenderAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vtho'],
				operation: ['approve'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Address to approve for spending',
	},
	// Allowance fields
	{
		displayName: 'Owner Address',
		name: 'ownerAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vtho'],
				operation: ['getAllowance'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Token owner address',
	},
	{
		displayName: 'Spender Address',
		name: 'spenderAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vtho'],
				operation: ['getAllowance'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Approved spender address',
	},
	// Gas options
	{
		displayName: 'Gas Options',
		name: 'gasOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['vtho'],
				operation: ['transfer', 'approve'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Gas Price Coefficient',
				name: 'gasPriceCoef',
				type: 'number',
				default: 0,
				description: 'Gas price coefficient (0-255)',
			},
			{
				displayName: 'Gas Limit',
				name: 'gas',
				type: 'number',
				default: 60000,
				description: 'Maximum gas to use',
			},
		],
	},
];

export async function executeVthoOperation(
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
				balance: account.energy,
				balanceFormatted: weiToVtho(account.energy) + ' VTHO',
				balanceVtho: parseFloat(weiToVtho(account.energy)),
			};
		}

		case 'transfer': {
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			const amountWei = vthoToWei(amount);

			// Encode transfer function call
			const transferAbi = VIP180_ABI.find((a) => a.name === 'transfer');
			if (!transferAbi) throw new Error('Transfer ABI not found');

			const func = new abi.Function(transferAbi as abi.Function.Definition);
			const data = func.encode(toAddress, amountWei);

			const bestBlock = await client.getBlock('best');
			const blockRef = bestBlock.id.slice(0, 18);

			const txBody = {
				chainTag: getChainTag(network),
				blockRef,
				expiration: 720,
				clauses: [
					{
						to: VTHO_CONTRACT_ADDRESS,
						value: '0x0',
						data,
					},
				],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 60000,
				dependsOn: null,
				nonce: generateNonce(),
			};

			const tx = new Transaction(txBody as any);
			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const signingHash = tx.signingHash();
			const signature = secp256k1.sign(signingHash, privateKeyBuffer);
			tx.signature = signature;

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				to: toAddress,
				amount,
				amountWei,
				tokenContract: VTHO_CONTRACT_ADDRESS,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'getGenerationRate': {
			const address = this.getNodeParameter('address', itemIndex) as string;
			const account = await client.getAccount(address);

			const vetBalance = account.balance;
			const vthoPerDay = calculateVthoPerDay(vetBalance);
			const vthoPerYear = calculateVthoGenerated(vetBalance, 365 * 24 * 3600);

			return {
				address,
				vetBalance: weiToVet(vetBalance) + ' VET',
				currentVtho: weiToVtho(account.energy) + ' VTHO',
				generationRate: {
					perSecond: VTHO_PER_VET_PER_SECOND + ' VTHO per VET',
					perDay: weiToVtho(vthoPerDay) + ' VTHO',
					perMonth: weiToVtho(calculateVthoGenerated(vetBalance, 30 * 24 * 3600)) + ' VTHO',
					perYear: weiToVtho(vthoPerYear) + ' VTHO',
				},
				dailyRate: '0.000432 VTHO per VET per day',
			};
		}

		case 'approve': {
			const spenderAddress = this.getNodeParameter('spenderAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			const amountWei = vthoToWei(amount);

			const approveAbi = VIP180_ABI.find((a) => a.name === 'approve');
			if (!approveAbi) throw new Error('Approve ABI not found');

			const func = new abi.Function(approveAbi as abi.Function.Definition);
			const data = func.encode(spenderAddress, amountWei);

			const bestBlock = await client.getBlock('best');
			const blockRef = bestBlock.id.slice(0, 18);

			const txBody = {
				chainTag: getChainTag(network),
				blockRef,
				expiration: 720,
				clauses: [
					{
						to: VTHO_CONTRACT_ADDRESS,
						value: '0x0',
						data,
					},
				],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 60000,
				dependsOn: null,
				nonce: generateNonce(),
			};

			const tx = new Transaction(txBody as any);
			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const signingHash = tx.signingHash();
			const signature = secp256k1.sign(signingHash, privateKeyBuffer);
			tx.signature = signature;

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				spender: spenderAddress,
				amount,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'getAllowance': {
			const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex) as string;
			const spenderAddress = this.getNodeParameter('spenderAddress', itemIndex) as string;

			const allowanceAbi = VIP180_ABI.find((a) => a.name === 'allowance');
			if (!allowanceAbi) throw new Error('Allowance ABI not found');

			const func = new abi.Function(allowanceAbi as abi.Function.Definition);
			const data = func.encode(ownerAddress, spenderAddress);

			const result = await client.call({
				to: VTHO_CONTRACT_ADDRESS,
				value: '0x0',
				data,
			});

			const decoded = func.decode(result.data);
			const allowance = decoded[0].toString();

			return {
				owner: ownerAddress,
				spender: spenderAddress,
				allowance,
				allowanceFormatted: weiToVtho(allowance) + ' VTHO',
			};
		}

		case 'getTotalSupply': {
			const totalSupplyAbi = VIP180_ABI.find((a) => a.name === 'totalSupply');
			if (!totalSupplyAbi) throw new Error('TotalSupply ABI not found');

			const func = new abi.Function(totalSupplyAbi as abi.Function.Definition);
			const data = func.encode();

			const result = await client.call({
				to: VTHO_CONTRACT_ADDRESS,
				value: '0x0',
				data,
			});

			const decoded = func.decode(result.data);
			const totalSupply = decoded[0].toString();

			return {
				totalSupply,
				totalSupplyFormatted: weiToVtho(totalSupply) + ' VTHO',
				contract: VTHO_CONTRACT_ADDRESS,
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
