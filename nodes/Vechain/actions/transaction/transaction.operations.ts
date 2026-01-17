/**
 * VeChain Transaction Actions
 * 
 * Operations for working with VeChain transactions:
 * - Send VET and VTHO
 * - Build and sign transactions
 * - Get transaction details and receipts
 * - Multi-clause transactions
 * - Fee delegation
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { ethers } from 'ethers';
import { Transaction } from 'thor-devkit';
import { createThorClient, ThorClient } from '../../transport/thorClient';
import { createDelegationService } from '../../transport/delegationService';
import { vetToWei, vthoToWei, weiToVtho } from '../../utils/unitConverter';
import { Clause } from '../../utils/clauseBuilder';
import { VTHO_CONTRACT_ADDRESS } from '../../constants/tokens';
import { VIP180_ABI } from '../../constants/abis';

/**
 * Transaction resource properties
 */
export const transactionProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		options: [
			{
				name: 'Send VET',
				value: 'sendVet',
				description: 'Send VET to an address',
				action: 'Send VET',
			},
			{
				name: 'Send VTHO',
				value: 'sendVtho',
				description: 'Send VTHO (energy) to an address',
				action: 'Send VTHO',
			},
			{
				name: 'Get Transaction',
				value: 'getTransaction',
				description: 'Get transaction details by ID',
				action: 'Get transaction',
			},
			{
				name: 'Get Transaction Receipt',
				value: 'getReceipt',
				description: 'Get transaction receipt (execution result)',
				action: 'Get transaction receipt',
			},
			{
				name: 'Get Transaction Status',
				value: 'getStatus',
				description: 'Check transaction status (pending, confirmed, finalized)',
				action: 'Get transaction status',
			},
			{
				name: 'Estimate Gas',
				value: 'estimateGas',
				description: 'Estimate gas for a transaction',
				action: 'Estimate gas',
			},
			{
				name: 'Build Transaction',
				value: 'buildTransaction',
				description: 'Build a transaction without sending',
				action: 'Build transaction',
			},
			{
				name: 'Sign Transaction',
				value: 'signTransaction',
				description: 'Sign a built transaction',
				action: 'Sign transaction',
			},
			{
				name: 'Send Raw Transaction',
				value: 'sendRaw',
				description: 'Send a signed raw transaction',
				action: 'Send raw transaction',
			},
			{
				name: 'Multi-Clause Transaction',
				value: 'multiClause',
				description: 'Send multiple operations in a single transaction',
				action: 'Multi-clause transaction',
			},
			{
				name: 'Simulate Transaction',
				value: 'simulate',
				description: 'Simulate a transaction without sending',
				action: 'Simulate transaction',
			},
		],
		default: 'sendVet',
	},
	// To address
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendVet', 'sendVtho'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
	},
	// Amount
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendVet', 'sendVtho'],
			},
		},
		default: '',
		placeholder: '1.5',
		description: 'Amount to send (in VET or VTHO)',
	},
	// Transaction ID
	{
		displayName: 'Transaction ID',
		name: 'txId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getTransaction', 'getReceipt', 'getStatus'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Transaction ID (66 hex characters)',
	},
	// Raw transaction
	{
		displayName: 'Raw Transaction',
		name: 'rawTransaction',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendRaw', 'signTransaction'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Raw transaction hex string',
	},
	// Multi-clause clauses
	{
		displayName: 'Clauses',
		name: 'clauses',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['multiClause', 'buildTransaction', 'simulate', 'estimateGas'],
			},
		},
		default: '[\n  {\n    "to": "0x...",\n    "value": "1000000000000000000",\n    "data": "0x"\n  }\n]',
		description: 'Array of clauses (each with to, value, data)',
	},
	// Gas options
	{
		displayName: 'Gas Limit',
		name: 'gasLimit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendVet', 'sendVtho', 'multiClause', 'buildTransaction'],
			},
		},
		default: 0,
		description: 'Gas limit (0 for auto-estimate)',
	},
	{
		displayName: 'Gas Price Coefficient',
		name: 'gasPriceCoef',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendVet', 'sendVtho', 'multiClause', 'buildTransaction'],
			},
		},
		default: 0,
		description: 'Gas price coefficient (0-255, higher = faster confirmation)',
	},
	// Fee delegation
	{
		displayName: 'Use Fee Delegation',
		name: 'useDelegation',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendVet', 'sendVtho', 'multiClause'],
			},
		},
		default: false,
		description: 'Whether to use fee delegation (VIP-191)',
	},
	// Expiration
	{
		displayName: 'Expiration (Blocks)',
		name: 'expiration',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendVet', 'sendVtho', 'multiClause', 'buildTransaction'],
			},
		},
		default: 720,
		description: 'Transaction expiration in blocks (~2 hours at 720 blocks)',
	},
];

/**
 * Execute transaction operations
 */
export async function executeTransactionOperation(
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
		case 'sendVet': {
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const gasLimit = this.getNodeParameter('gasLimit', itemIndex, 0) as number;
			const gasPriceCoef = this.getNodeParameter('gasPriceCoef', itemIndex, 0) as number;
			const expiration = this.getNodeParameter('expiration', itemIndex, 720) as number;
			const useDelegation = this.getNodeParameter('useDelegation', itemIndex, false) as boolean;
			
			// Convert amount to wei
			const valueWei = vetToWei(amount);
			
			// Build clause
			const clause: Clause = {
				to: toAddress,
				value: valueWei,
				data: '0x',
			};
			
			// Send transaction
			const result = await sendTransaction(
				client,
				[clause],
				privateKey,
				gasLimit || 21000,
				gasPriceCoef,
				expiration,
				useDelegation ? credentials : undefined,
			);
			
			return {
				...result,
				type: 'VET Transfer',
				to: toAddress,
				amount,
				amountWei: valueWei,
			};
		}
		
		case 'sendVtho': {
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const gasLimit = this.getNodeParameter('gasLimit', itemIndex, 0) as number;
			const gasPriceCoef = this.getNodeParameter('gasPriceCoef', itemIndex, 0) as number;
			const expiration = this.getNodeParameter('expiration', itemIndex, 720) as number;
			const useDelegation = this.getNodeParameter('useDelegation', itemIndex, false) as boolean;
			
			// Convert amount to wei
			const valueWei = vthoToWei(amount);
			
			// Build transfer call
			const iface = new ethers.Interface(VIP180_ABI);
			const data = iface.encodeFunctionData('transfer', [toAddress, valueWei]);
			
			const clause: Clause = {
				to: VTHO_CONTRACT_ADDRESS,
				value: '0',
				data,
			};
			
			// Send transaction
			const result = await sendTransaction(
				client,
				[clause],
				privateKey,
				gasLimit || 60000,
				gasPriceCoef,
				expiration,
				useDelegation ? credentials : undefined,
			);
			
			return {
				...result,
				type: 'VTHO Transfer',
				to: toAddress,
				amount,
				amountWei: valueWei,
			};
		}
		
		case 'getTransaction': {
			const txId = this.getNodeParameter('txId', itemIndex) as string;
			
			const tx = await client.getTransaction(txId);
			
			if (!tx) {
				return {
					txId,
					found: false,
					message: 'Transaction not found',
				};
			}
			
			return {
				...tx,
				found: true,
			};
		}
		
		case 'getReceipt': {
			const txId = this.getNodeParameter('txId', itemIndex) as string;
			
			const receipt = await client.getTransactionReceipt(txId);
			
			if (!receipt) {
				return {
					txId,
					found: false,
					message: 'Receipt not found (transaction may be pending)',
				};
			}
			
			return {
				...receipt,
				found: true,
				paidFormatted: weiToVtho(receipt.paid) + ' VTHO',
			};
		}
		
		case 'getStatus': {
			const txId = this.getNodeParameter('txId', itemIndex) as string;
			
			const tx = await client.getTransaction(txId);
			const receipt = await client.getTransactionReceipt(txId);
			const finalizedBlock = await client.getFinalizedBlock();
			
			let status = 'unknown';
			let isFinalized = false;
			
			if (!tx) {
				status = 'not_found';
			} else if (!receipt) {
				status = 'pending';
			} else {
				status = receipt.reverted ? 'failed' : 'confirmed';
				isFinalized = receipt.meta.blockNumber <= finalizedBlock.number;
				if (isFinalized) {
					status = receipt.reverted ? 'failed_finalized' : 'finalized';
				}
			}
			
			return {
				txId,
				status,
				isFinalized,
				blockNumber: receipt?.meta?.blockNumber,
				reverted: receipt?.reverted,
			};
		}
		
		case 'estimateGas': {
			const clausesJson = this.getNodeParameter('clauses', itemIndex) as string;
			const clauses = JSON.parse(clausesJson) as Clause[];
			
			const estimates = await client.estimateGas(clauses);
			const totalGas = estimates.reduce((sum, e) => sum + e.gasUsed, 0);
			
			return {
				clauses: clauses.length,
				estimates,
				totalGasUsed: totalGas,
				recommendedGasLimit: Math.ceil(totalGas * 1.2), // 20% buffer
			};
		}
		
		case 'buildTransaction': {
			const clausesJson = this.getNodeParameter('clauses', itemIndex) as string;
			const clauses = JSON.parse(clausesJson) as Clause[];
			const gasLimit = this.getNodeParameter('gasLimit', itemIndex, 0) as number;
			const gasPriceCoef = this.getNodeParameter('gasPriceCoef', itemIndex, 0) as number;
			const expiration = this.getNodeParameter('expiration', itemIndex, 720) as number;
			
			const bestBlock = await client.getBestBlock();
			const blockRef = ThorClient.createBlockRef(bestBlock.id);
			
			const txBody = {
				chainTag: client.getChainTag(),
				blockRef,
				expiration,
				clauses,
				gasPriceCoef,
				gas: gasLimit || 100000,
				dependsOn: null,
				nonce: ThorClient.generateNonce(),
			};
			
			return {
				txBody,
				message: 'Transaction built (not signed)',
			};
		}
		
		case 'signTransaction': {
			const rawTx = this.getNodeParameter('rawTransaction', itemIndex) as string;
			
			const wallet = new ethers.Wallet(privateKey);
			const signature = await wallet.signMessage(ethers.getBytes(rawTx));
			
			return {
				signature,
				signer: wallet.address,
			};
		}
		
		case 'sendRaw': {
			const rawTx = this.getNodeParameter('rawTransaction', itemIndex) as string;
			
			const result = await client.sendTransaction(rawTx);
			
			return {
				txId: result.id,
				success: true,
				message: 'Transaction submitted',
			};
		}
		
		case 'multiClause': {
			const clausesJson = this.getNodeParameter('clauses', itemIndex) as string;
			const clauses = JSON.parse(clausesJson) as Clause[];
			const gasLimit = this.getNodeParameter('gasLimit', itemIndex, 0) as number;
			const gasPriceCoef = this.getNodeParameter('gasPriceCoef', itemIndex, 0) as number;
			const expiration = this.getNodeParameter('expiration', itemIndex, 720) as number;
			const useDelegation = this.getNodeParameter('useDelegation', itemIndex, false) as boolean;
			
			// Estimate gas if not provided
			let gas = gasLimit;
			if (!gas) {
				const estimates = await client.estimateGas(clauses);
				gas = Math.ceil(estimates.reduce((sum, e) => sum + e.gasUsed, 0) * 1.2);
			}
			
			const result = await sendTransaction(
				client,
				clauses,
				privateKey,
				gas,
				gasPriceCoef,
				expiration,
				useDelegation ? credentials : undefined,
			);
			
			return {
				...result,
				type: 'Multi-Clause Transaction',
				clauseCount: clauses.length,
			};
		}
		
		case 'simulate': {
			const clausesJson = this.getNodeParameter('clauses', itemIndex) as string;
			const clauses = JSON.parse(clausesJson) as Clause[];
			
			const wallet = new ethers.Wallet(privateKey);
			const results = await client.simulateTransaction(clauses, wallet.address);
			
			return {
				success: !results.some(r => r.reverted),
				results,
				totalGasUsed: results.reduce((sum, r) => sum + r.gasUsed, 0),
			};
		}
		
		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

/**
 * Helper function to send a transaction
 */
async function sendTransaction(
	client: ThorClient,
	clauses: Clause[],
	privateKey: string,
	gas: number,
	gasPriceCoef: number,
	expiration: number,
	delegationCredentials?: IDataObject,
): Promise<IDataObject> {
	const wallet = new ethers.Wallet(privateKey);
	const bestBlock = await client.getBestBlock();
	const blockRef = ThorClient.createBlockRef(bestBlock.id);
	
	// Build transaction body
	const txBody: Transaction.LegacyBody = {
		chainTag: client.getChainTag(),
		blockRef,
		expiration,
		clauses: clauses.map(c => ({
			to: c.to,
			value: c.value,
			data: c.data,
		})),
		gasPriceCoef,
		gas,
		dependsOn: null,
		nonce: ThorClient.generateNonce(),
	};
	
	// Handle delegation
	if (delegationCredentials?.enableDelegation) {
		(txBody as Transaction.LegacyBody & { reserved?: { features: number } }).reserved = { features: 1 };
	}
	
	// Create and sign transaction
	const tx = new Transaction(txBody);
	const signingHash = tx.signingHash();
	const signature = ethers.Signature.from(wallet.signingKey.sign(signingHash));
	const sig = ethers.concat([signature.r, signature.s, ethers.toBeHex(signature.v - 27)]);
	
	// Handle delegation signature if needed
	if (delegationCredentials?.enableDelegation && delegationCredentials?.delegatorUrl) {
		const delegationService = createDelegationService(
			delegationCredentials.delegatorUrl as string,
			delegationCredentials.delegatorPrivateKey as string,
		);
		
		const delegationResponse = await delegationService.requestDelegation(
			ethers.hexlify(tx.encode()),
			wallet.address,
		);
		
		if (delegationResponse.error) {
			throw new Error(`Fee delegation failed: ${delegationResponse.error}`);
		}
		
		// Combine signatures
		tx.signature = Buffer.concat([
			Buffer.from(ethers.getBytes(sig)),
			Buffer.from(ethers.getBytes(delegationResponse.signature)),
		]);
	} else {
		tx.signature = Buffer.from(ethers.getBytes(sig));
	}
	
	// Send transaction
	const encoded = '0x' + tx.encode().toString('hex');
	const result = await client.sendTransaction(encoded);
	
	return {
		txId: result.id,
		origin: wallet.address,
		gas,
		gasPriceCoef,
		expiration,
		blockRef,
		success: true,
		message: 'Transaction submitted successfully',
	};
}
