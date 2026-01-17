/**
 * VIP-180 Token Operations
 *
 * Operations for VIP-180 fungible tokens (similar to ERC-20):
 * - Get token info
 * - Get balance
 * - Transfer tokens
 * - Approve spending
 * - Get allowance
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createThorClient } from '../../transport/thorClient';
import { VIP180_ABI } from '../../constants/abis';
import { Transaction, secp256k1, abi } from 'thor-devkit';

export const vip180Properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vip180'],
			},
		},
		options: [
			{
				name: 'Get Token Info',
				value: 'getTokenInfo',
				description: 'Get token name, symbol, decimals, and total supply',
				action: 'Get token info',
			},
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get token balance of an address',
				action: 'Get token balance',
			},
			{
				name: 'Transfer',
				value: 'transfer',
				description: 'Transfer tokens to an address',
				action: 'Transfer tokens',
			},
			{
				name: 'Approve',
				value: 'approve',
				description: 'Approve an address to spend tokens',
				action: 'Approve spending',
			},
			{
				name: 'Get Allowance',
				value: 'getAllowance',
				description: 'Get spending allowance',
				action: 'Get allowance',
			},
			{
				name: 'Transfer From',
				value: 'transferFrom',
				description: 'Transfer tokens from an approved address',
				action: 'Transfer from',
			},
		],
		default: 'getTokenInfo',
	},
	// Token contract address
	{
		displayName: 'Token Contract',
		name: 'tokenContract',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip180'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'VIP-180 token contract address',
	},
	// Address for balance
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip180'],
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
				resource: ['vip180'],
				operation: ['transfer'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip180'],
				operation: ['transfer', 'approve', 'transferFrom'],
			},
		},
		default: '',
		placeholder: '100',
		description: 'Amount of tokens (in token units, not wei)',
	},
	// Approve fields
	{
		displayName: 'Spender Address',
		name: 'spenderAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip180'],
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
				resource: ['vip180'],
				operation: ['getAllowance', 'transferFrom'],
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
				resource: ['vip180'],
				operation: ['getAllowance'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Approved spender address',
	},
	// Transfer from recipient
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip180'],
				operation: ['transferFrom'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
	},
	// Gas options
	{
		displayName: 'Gas Options',
		name: 'gasOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['vip180'],
				operation: ['transfer', 'approve', 'transferFrom'],
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
				default: 80000,
				description: 'Maximum gas to use',
			},
		],
	},
];

export async function executeVip180Operation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('vechainNetwork');
	const network = credentials.network as string;
	const customUrl = credentials.nodeUrl as string;
	const privateKey = credentials.privateKey as string;

	const client = createThorClient(network, customUrl);
	const tokenContract = this.getNodeParameter('tokenContract', itemIndex) as string;

	switch (operation) {
		case 'getTokenInfo': {
			// Get name
			const nameAbi = VIP180_ABI.find((a) => a.name === 'name');
			const nameFunc = new abi.Function(nameAbi as abi.Function.Definition);
			const nameResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: nameFunc.encode(),
			});
			const name = nameResult.data !== '0x' ? nameFunc.decode(nameResult.data)[0] : 'Unknown';

			// Get symbol
			const symbolAbi = VIP180_ABI.find((a) => a.name === 'symbol');
			const symbolFunc = new abi.Function(symbolAbi as abi.Function.Definition);
			const symbolResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: symbolFunc.encode(),
			});
			const symbol = symbolResult.data !== '0x' ? symbolFunc.decode(symbolResult.data)[0] : 'UNKNOWN';

			// Get decimals
			const decimalsAbi = VIP180_ABI.find((a) => a.name === 'decimals');
			const decimalsFunc = new abi.Function(decimalsAbi as abi.Function.Definition);
			const decimalsResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: decimalsFunc.encode(),
			});
			const decimals = decimalsResult.data !== '0x' ? Number(decimalsFunc.decode(decimalsResult.data)[0]) : 18;

			// Get total supply
			const supplyAbi = VIP180_ABI.find((a) => a.name === 'totalSupply');
			const supplyFunc = new abi.Function(supplyAbi as abi.Function.Definition);
			const supplyResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: supplyFunc.encode(),
			});
			const totalSupply = supplyResult.data !== '0x' ? supplyFunc.decode(supplyResult.data)[0].toString() : '0';

			return {
				contract: tokenContract,
				name,
				symbol,
				decimals,
				totalSupply,
				totalSupplyFormatted: formatTokenAmount(totalSupply, decimals) + ' ' + symbol,
			};
		}

		case 'getBalance': {
			const address = this.getNodeParameter('address', itemIndex) as string;

			// First get decimals for formatting
			const decimalsAbi = VIP180_ABI.find((a) => a.name === 'decimals');
			const decimalsFunc = new abi.Function(decimalsAbi as abi.Function.Definition);
			const decimalsResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: decimalsFunc.encode(),
			});
			const decimals = decimalsResult.data !== '0x' ? Number(decimalsFunc.decode(decimalsResult.data)[0]) : 18;

			// Get symbol
			const symbolAbi = VIP180_ABI.find((a) => a.name === 'symbol');
			const symbolFunc = new abi.Function(symbolAbi as abi.Function.Definition);
			const symbolResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: symbolFunc.encode(),
			});
			const symbol = symbolResult.data !== '0x' ? symbolFunc.decode(symbolResult.data)[0] : 'TOKEN';

			// Get balance
			const balanceAbi = VIP180_ABI.find((a) => a.name === 'balanceOf');
			const balanceFunc = new abi.Function(balanceAbi as abi.Function.Definition);
			const balanceResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: balanceFunc.encode(address),
			});
			const balance = balanceResult.data !== '0x' ? balanceFunc.decode(balanceResult.data)[0].toString() : '0';

			return {
				address,
				contract: tokenContract,
				symbol,
				decimals,
				balance,
				balanceFormatted: formatTokenAmount(balance, decimals) + ' ' + symbol,
			};
		}

		case 'transfer': {
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			// Get decimals
			const decimalsAbi = VIP180_ABI.find((a) => a.name === 'decimals');
			const decimalsFunc = new abi.Function(decimalsAbi as abi.Function.Definition);
			const decimalsResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: decimalsFunc.encode(),
			});
			const decimals = decimalsResult.data !== '0x' ? Number(decimalsFunc.decode(decimalsResult.data)[0]) : 18;

			const amountWei = parseTokenAmount(amount, decimals);

			const transferAbi = VIP180_ABI.find((a) => a.name === 'transfer');
			const transferFunc = new abi.Function(transferAbi as abi.Function.Definition);
			const data = transferFunc.encode(toAddress, amountWei);

			const bestBlock = await client.getBlock('best');
			const blockRef = bestBlock.id.slice(0, 18);

			const txBody = {
				chainTag: getChainTag(network),
				blockRef,
				expiration: 720,
				clauses: [
					{
						to: tokenContract,
						value: '0x0',
						data,
					},
				],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 80000,
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
				tokenContract,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'approve': {
			const spenderAddress = this.getNodeParameter('spenderAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			// Get decimals
			const decimalsAbi = VIP180_ABI.find((a) => a.name === 'decimals');
			const decimalsFunc = new abi.Function(decimalsAbi as abi.Function.Definition);
			const decimalsResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: decimalsFunc.encode(),
			});
			const decimals = decimalsResult.data !== '0x' ? Number(decimalsFunc.decode(decimalsResult.data)[0]) : 18;

			const amountWei = parseTokenAmount(amount, decimals);

			const approveAbi = VIP180_ABI.find((a) => a.name === 'approve');
			const approveFunc = new abi.Function(approveAbi as abi.Function.Definition);
			const data = approveFunc.encode(spenderAddress, amountWei);

			const bestBlock = await client.getBlock('best');
			const blockRef = bestBlock.id.slice(0, 18);

			const txBody = {
				chainTag: getChainTag(network),
				blockRef,
				expiration: 720,
				clauses: [
					{
						to: tokenContract,
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
				tokenContract,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'getAllowance': {
			const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex) as string;
			const spenderAddress = this.getNodeParameter('spenderAddress', itemIndex) as string;

			// Get decimals
			const decimalsAbi = VIP180_ABI.find((a) => a.name === 'decimals');
			const decimalsFunc = new abi.Function(decimalsAbi as abi.Function.Definition);
			const decimalsResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: decimalsFunc.encode(),
			});
			const decimals = decimalsResult.data !== '0x' ? Number(decimalsFunc.decode(decimalsResult.data)[0]) : 18;

			// Get symbol
			const symbolAbi = VIP180_ABI.find((a) => a.name === 'symbol');
			const symbolFunc = new abi.Function(symbolAbi as abi.Function.Definition);
			const symbolResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: symbolFunc.encode(),
			});
			const symbol = symbolResult.data !== '0x' ? symbolFunc.decode(symbolResult.data)[0] : 'TOKEN';

			const allowanceAbi = VIP180_ABI.find((a) => a.name === 'allowance');
			const allowanceFunc = new abi.Function(allowanceAbi as abi.Function.Definition);
			const allowanceResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: allowanceFunc.encode(ownerAddress, spenderAddress),
			});
			const allowance = allowanceResult.data !== '0x' ? allowanceFunc.decode(allowanceResult.data)[0].toString() : '0';

			return {
				owner: ownerAddress,
				spender: spenderAddress,
				tokenContract,
				symbol,
				allowance,
				allowanceFormatted: formatTokenAmount(allowance, decimals) + ' ' + symbol,
			};
		}

		case 'transferFrom': {
			const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex) as string;
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			// Get decimals
			const decimalsAbi = VIP180_ABI.find((a) => a.name === 'decimals');
			const decimalsFunc = new abi.Function(decimalsAbi as abi.Function.Definition);
			const decimalsResult = await client.call({
				to: tokenContract,
				value: '0x0',
				data: decimalsFunc.encode(),
			});
			const decimals = decimalsResult.data !== '0x' ? Number(decimalsFunc.decode(decimalsResult.data)[0]) : 18;

			const amountWei = parseTokenAmount(amount, decimals);

			const transferFromAbi = VIP180_ABI.find((a) => a.name === 'transferFrom');
			const transferFromFunc = new abi.Function(transferFromAbi as abi.Function.Definition);
			const data = transferFromFunc.encode(ownerAddress, toAddress, amountWei);

			const bestBlock = await client.getBlock('best');
			const blockRef = bestBlock.id.slice(0, 18);

			const txBody = {
				chainTag: getChainTag(network),
				blockRef,
				expiration: 720,
				clauses: [
					{
						to: tokenContract,
						value: '0x0',
						data,
					},
				],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 100000,
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
				from: ownerAddress,
				to: toAddress,
				amount,
				tokenContract,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

function formatTokenAmount(amount: string, decimals: number): string {
	const value = BigInt(amount);
	const divisor = BigInt(10 ** decimals);
	const whole = value / divisor;
	const fraction = value % divisor;
	const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 6);
	return `${whole}.${fractionStr}`;
}

function parseTokenAmount(amount: string, decimals: number): string {
	const parts = amount.split('.');
	let whole = parts[0] || '0';
	let fraction = parts[1] || '';

	fraction = fraction.padEnd(decimals, '0').slice(0, decimals);
	return BigInt(whole + fraction).toString();
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
