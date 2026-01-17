/**
 * VIP-181 NFT Operations
 *
 * Operations for VIP-181 (Non-Fungible Tokens):
 * - Get NFT info and metadata
 * - Get owner and ownership
 * - Transfer NFTs
 * - Approve and manage operators
 *
 * @author Velocity BPA
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createThorClient } from '../../transport/thorClient';
import { VIP181_ABI } from '../../constants/abis';
import { Transaction, secp256k1, abi, address } from 'thor-devkit';

export const vip181Properties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['vip181'],
			},
		},
		options: [
			{
				name: 'Get Collection Info',
				value: 'getCollectionInfo',
				description: 'Get NFT collection name and symbol',
				action: 'Get collection info',
			},
			{
				name: 'Get Owner',
				value: 'getOwner',
				description: 'Get the owner of a specific NFT',
				action: 'Get NFT owner',
			},
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get NFT count owned by address',
				action: 'Get NFT balance',
			},
			{
				name: 'Get Token URI',
				value: 'getTokenUri',
				description: 'Get metadata URI for a token',
				action: 'Get token URI',
			},
			{
				name: 'Get Tokens by Owner',
				value: 'getTokensByOwner',
				description: 'Get all token IDs owned by an address',
				action: 'Get tokens by owner',
			},
			{
				name: 'Transfer',
				value: 'transfer',
				description: 'Transfer NFT to another address',
				action: 'Transfer NFT',
			},
			{
				name: 'Safe Transfer',
				value: 'safeTransfer',
				description: 'Safely transfer NFT with receiver check',
				action: 'Safe transfer NFT',
			},
			{
				name: 'Approve',
				value: 'approve',
				description: 'Approve address to transfer a specific NFT',
				action: 'Approve NFT',
			},
			{
				name: 'Set Approval For All',
				value: 'setApprovalForAll',
				description: 'Approve operator for all NFTs',
				action: 'Set approval for all',
			},
			{
				name: 'Get Approved',
				value: 'getApproved',
				description: 'Get approved address for a token',
				action: 'Get approved address',
			},
			{
				name: 'Is Approved For All',
				value: 'isApprovedForAll',
				description: 'Check if operator is approved for all',
				action: 'Check approval for all',
			},
		],
		default: 'getCollectionInfo',
	},
	// Contract address
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip181'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'VIP-181 NFT contract address',
	},
	// Token ID
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip181'],
				operation: ['getOwner', 'getTokenUri', 'transfer', 'safeTransfer', 'approve', 'getApproved'],
			},
		},
		default: '',
		placeholder: '1',
		description: 'NFT token ID',
	},
	// Address for balance/tokens
	{
		displayName: 'Owner Address',
		name: 'ownerAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip181'],
				operation: ['getBalance', 'getTokensByOwner', 'isApprovedForAll'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'NFT owner address',
	},
	// To address for transfers
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip181'],
				operation: ['transfer', 'safeTransfer', 'approve'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Recipient or approved address',
	},
	// Operator address
	{
		displayName: 'Operator Address',
		name: 'operatorAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['vip181'],
				operation: ['setApprovalForAll', 'isApprovedForAll'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Operator address',
	},
	// Approved boolean
	{
		displayName: 'Approved',
		name: 'approved',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['vip181'],
				operation: ['setApprovalForAll'],
			},
		},
		default: true,
		description: 'Whether to approve or revoke',
	},
	// Data for safe transfer
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['vip181'],
				operation: ['safeTransfer'],
			},
		},
		default: '0x',
		description: 'Additional data to send with transfer',
	},
	// Gas options
	{
		displayName: 'Gas Options',
		name: 'gasOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['vip181'],
				operation: ['transfer', 'safeTransfer', 'approve', 'setApprovalForAll'],
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
				default: 100000,
				description: 'Maximum gas to use',
			},
		],
	},
];

export async function executeVip181Operation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('vechainNetwork');
	const network = credentials.network as string;
	const customUrl = credentials.nodeUrl as string;
	const privateKey = credentials.privateKey as string;

	const client = createThorClient(network, customUrl);
	const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;

	// Helper to encode function call
	const encodeCall = (funcName: string, params: any[]): string => {
		const func = VIP181_ABI.find((f) => f.name === funcName && f.type === 'function');
		if (!func) throw new Error(`Function ${funcName} not found in ABI`);
		const abiFunc = new abi.Function(func as abi.Function.Definition);
		return abiFunc.encode(...params);
	};

	// Helper to decode result
	const decodeResult = (funcName: string, data: string): any => {
		const func = VIP181_ABI.find((f) => f.name === funcName && f.type === 'function');
		if (!func) throw new Error(`Function ${funcName} not found in ABI`);
		const abiFunc = new abi.Function(func as abi.Function.Definition);
		return abiFunc.decode(data);
	};

	switch (operation) {
		case 'getCollectionInfo': {
			const nameData = encodeCall('name', []);
			const symbolData = encodeCall('symbol', []);

			const [nameResult, symbolResult] = await Promise.all([
				client.call({ to: contractAddress, value: '0x0', data: nameData }),
				client.call({ to: contractAddress, value: '0x0', data: symbolData }),
			]);

			const name = decodeResult('name', nameResult.data);
			const symbol = decodeResult('symbol', symbolResult.data);

			return {
				contractAddress,
				name: name[0],
				symbol: symbol[0],
			};
		}

		case 'getOwner': {
			const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
			const data = encodeCall('ownerOf', [tokenId]);
			const result = await client.call({ to: contractAddress, value: '0x0', data });
			const decoded = decodeResult('ownerOf', result.data);

			return {
				contractAddress,
				tokenId,
				owner: decoded[0],
			};
		}

		case 'getBalance': {
			const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex) as string;
			const data = encodeCall('balanceOf', [ownerAddress]);
			const result = await client.call({ to: contractAddress, value: '0x0', data });
			const decoded = decodeResult('balanceOf', result.data);

			return {
				contractAddress,
				owner: ownerAddress,
				balance: decoded[0].toString(),
			};
		}

		case 'getTokenUri': {
			const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
			const data = encodeCall('tokenURI', [tokenId]);
			const result = await client.call({ to: contractAddress, value: '0x0', data });
			const decoded = decodeResult('tokenURI', result.data);

			return {
				contractAddress,
				tokenId,
				tokenUri: decoded[0],
			};
		}

		case 'getTokensByOwner': {
			const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex) as string;

			// Get balance first
			const balanceData = encodeCall('balanceOf', [ownerAddress]);
			const balanceResult = await client.call({ to: contractAddress, value: '0x0', data: balanceData });
			const balance = parseInt(decodeResult('balanceOf', balanceResult.data)[0].toString());

			// Get each token by index
			const tokens: string[] = [];
			for (let i = 0; i < balance && i < 100; i++) {
				try {
					const data = encodeCall('tokenOfOwnerByIndex', [ownerAddress, i]);
					const result = await client.call({ to: contractAddress, value: '0x0', data });
					const tokenId = decodeResult('tokenOfOwnerByIndex', result.data)[0].toString();
					tokens.push(tokenId);
				} catch {
					break;
				}
			}

			return {
				contractAddress,
				owner: ownerAddress,
				tokenCount: balance,
				tokens,
			};
		}

		case 'transfer': {
			const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const fromAddress = address.fromPublicKey(secp256k1.derivePublicKey(privateKeyBuffer));

			const data = encodeCall('transferFrom', [fromAddress, toAddress, tokenId]);

			const bestBlock = await client.getBlock('best');
			const txBody = {
				chainTag: getChainTag(network),
				blockRef: bestBlock.id.slice(0, 18),
				expiration: 720,
				clauses: [{ to: contractAddress, value: '0x0', data }],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 100000,
				dependsOn: null,
				nonce: generateNonce(),
			};

			const tx = new Transaction(txBody as any);
			const signingHash = tx.signingHash();
			tx.signature = secp256k1.sign(signingHash, privateKeyBuffer);

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				from: fromAddress,
				to: toAddress,
				tokenId,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'safeTransfer': {
			const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const transferData = this.getNodeParameter('data', itemIndex, '0x') as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const fromAddress = address.fromPublicKey(secp256k1.derivePublicKey(privateKeyBuffer));

			const data = encodeCall('safeTransferFrom', [fromAddress, toAddress, tokenId, transferData]);

			const bestBlock = await client.getBlock('best');
			const txBody = {
				chainTag: getChainTag(network),
				blockRef: bestBlock.id.slice(0, 18),
				expiration: 720,
				clauses: [{ to: contractAddress, value: '0x0', data }],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 150000,
				dependsOn: null,
				nonce: generateNonce(),
			};

			const tx = new Transaction(txBody as any);
			const signingHash = tx.signingHash();
			tx.signature = secp256k1.sign(signingHash, privateKeyBuffer);

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				from: fromAddress,
				to: toAddress,
				tokenId,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'approve': {
			const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			const data = encodeCall('approve', [toAddress, tokenId]);

			const bestBlock = await client.getBlock('best');
			const txBody = {
				chainTag: getChainTag(network),
				blockRef: bestBlock.id.slice(0, 18),
				expiration: 720,
				clauses: [{ to: contractAddress, value: '0x0', data }],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 80000,
				dependsOn: null,
				nonce: generateNonce(),
			};

			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const tx = new Transaction(txBody as any);
			const signingHash = tx.signingHash();
			tx.signature = secp256k1.sign(signingHash, privateKeyBuffer);

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				tokenId,
				approved: toAddress,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'setApprovalForAll': {
			const operatorAddress = this.getNodeParameter('operatorAddress', itemIndex) as string;
			const approved = this.getNodeParameter('approved', itemIndex) as boolean;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			const data = encodeCall('setApprovalForAll', [operatorAddress, approved]);

			const bestBlock = await client.getBlock('best');
			const txBody = {
				chainTag: getChainTag(network),
				blockRef: bestBlock.id.slice(0, 18),
				expiration: 720,
				clauses: [{ to: contractAddress, value: '0x0', data }],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 60000,
				dependsOn: null,
				nonce: generateNonce(),
			};

			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const tx = new Transaction(txBody as any);
			const signingHash = tx.signingHash();
			tx.signature = secp256k1.sign(signingHash, privateKeyBuffer);

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				operator: operatorAddress,
				approved,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'getApproved': {
			const tokenId = this.getNodeParameter('tokenId', itemIndex) as string;
			const data = encodeCall('getApproved', [tokenId]);
			const result = await client.call({ to: contractAddress, value: '0x0', data });
			const decoded = decodeResult('getApproved', result.data);

			return {
				contractAddress,
				tokenId,
				approved: decoded[0],
			};
		}

		case 'isApprovedForAll': {
			const ownerAddress = this.getNodeParameter('ownerAddress', itemIndex) as string;
			const operatorAddress = this.getNodeParameter('operatorAddress', itemIndex) as string;
			const data = encodeCall('isApprovedForAll', [ownerAddress, operatorAddress]);
			const result = await client.call({ to: contractAddress, value: '0x0', data });
			const decoded = decodeResult('isApprovedForAll', result.data);

			return {
				contractAddress,
				owner: ownerAddress,
				operator: operatorAddress,
				isApproved: decoded[0],
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

function getChainTag(network: string): number {
	switch (network) {
		case 'mainnet': return 0x4a;
		case 'testnet': return 0x27;
		case 'solo': return 0xf6;
		default: return 0x4a;
	}
}

function getExplorerUrl(network: string, txId: string): string {
	switch (network) {
		case 'mainnet': return `https://explore.vechain.org/transactions/${txId}`;
		case 'testnet': return `https://explore-testnet.vechain.org/transactions/${txId}`;
		default: return '';
	}
}

function generateNonce(): string {
	return '0x' + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
}
