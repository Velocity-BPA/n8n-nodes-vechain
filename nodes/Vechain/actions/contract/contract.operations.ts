/**
 * Smart Contract Operations
 *
 * Operations for interacting with smart contracts:
 * - Read contract data (call)
 * - Write to contract (send transaction)
 * - Deploy contracts
 * - Encode/decode ABI data
 * - Get contract code and storage
 *
 * @author Velocity BPA
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createThorClient } from '../../transport/thorClient';
import { Transaction, secp256k1, abi } from 'thor-devkit';
import { ethers } from 'ethers';

export const contractProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['contract'],
			},
		},
		options: [
			{
				name: 'Read (Call)',
				value: 'read',
				description: 'Read data from contract (no transaction)',
				action: 'Read contract',
			},
			{
				name: 'Write (Send)',
				value: 'write',
				description: 'Write data to contract (creates transaction)',
				action: 'Write to contract',
			},
			{
				name: 'Deploy',
				value: 'deploy',
				description: 'Deploy a new smart contract',
				action: 'Deploy contract',
			},
			{
				name: 'Get Code',
				value: 'getCode',
				description: 'Get contract bytecode',
				action: 'Get contract code',
			},
			{
				name: 'Get Storage',
				value: 'getStorage',
				description: 'Get contract storage at position',
				action: 'Get storage',
			},
			{
				name: 'Encode Function',
				value: 'encodeFunction',
				description: 'Encode function call data',
				action: 'Encode function',
			},
			{
				name: 'Decode Result',
				value: 'decodeResult',
				description: 'Decode function return data',
				action: 'Decode result',
			},
			{
				name: 'Simulate',
				value: 'simulate',
				description: 'Simulate transaction without sending',
				action: 'Simulate call',
			},
			{
				name: 'Estimate Gas',
				value: 'estimateGas',
				description: 'Estimate gas for contract call',
				action: 'Estimate gas',
			},
		],
		default: 'read',
	},
	// Contract address
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['read', 'write', 'getCode', 'getStorage', 'simulate', 'estimateGas'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Smart contract address',
	},
	// ABI
	{
		displayName: 'ABI',
		name: 'abi',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['read', 'write', 'encodeFunction', 'decodeResult', 'simulate', 'estimateGas'],
			},
		},
		default: '[]',
		description: 'Contract ABI (JSON array)',
	},
	// Function name
	{
		displayName: 'Function Name',
		name: 'functionName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['read', 'write', 'encodeFunction', 'decodeResult', 'simulate', 'estimateGas'],
			},
		},
		default: '',
		placeholder: 'balanceOf',
		description: 'Contract function to call',
	},
	// Function parameters
	{
		displayName: 'Parameters',
		name: 'parameters',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['read', 'write', 'encodeFunction', 'simulate', 'estimateGas'],
			},
		},
		default: '[]',
		placeholder: '["0x..."]',
		description: 'Function parameters as JSON array',
	},
	// Value to send
	{
		displayName: 'Value (VET)',
		name: 'value',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['write', 'simulate'],
			},
		},
		default: '0',
		description: 'Amount of VET to send with the call',
	},
	// Bytecode for deploy
	{
		displayName: 'Bytecode',
		name: 'bytecode',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['deploy'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Contract bytecode to deploy',
	},
	// Constructor params
	{
		displayName: 'Constructor Parameters',
		name: 'constructorParams',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['deploy'],
			},
		},
		default: '[]',
		description: 'Constructor parameters as JSON array',
	},
	// Constructor ABI
	{
		displayName: 'Constructor ABI',
		name: 'constructorAbi',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['deploy'],
			},
		},
		default: '[]',
		description: 'Constructor ABI inputs definition',
	},
	// Storage position
	{
		displayName: 'Storage Position',
		name: 'storagePosition',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['getStorage'],
			},
		},
		default: '0x0',
		placeholder: '0x0',
		description: 'Storage slot position (hex)',
	},
	// Data to decode
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['decodeResult'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Hex data to decode',
	},
	// Caller for simulate
	{
		displayName: 'Caller Address',
		name: 'callerAddress',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['simulate', 'estimateGas'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Address simulating the call (optional)',
	},
	// Gas options
	{
		displayName: 'Gas Options',
		name: 'gasOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['write', 'deploy'],
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
				default: 200000,
				description: 'Maximum gas to use',
			},
			{
				displayName: 'Expiration (Blocks)',
				name: 'expiration',
				type: 'number',
				default: 720,
				description: 'Transaction expiration in blocks',
			},
		],
	},
];

export async function executeContractOperation(
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
		case 'read': {
			const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
			const abiJson = this.getNodeParameter('abi', itemIndex) as string;
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const paramsJson = this.getNodeParameter('parameters', itemIndex, '[]') as string;

			const contractAbi = JSON.parse(abiJson);
			const params = JSON.parse(paramsJson);

			const funcDef = contractAbi.find((f: any) => f.name === functionName && f.type === 'function');
			if (!funcDef) throw new Error(`Function ${functionName} not found in ABI`);

			const abiFunc = new abi.Function(funcDef);
			const data = abiFunc.encode(...params);

			const result = await client.call({ to: contractAddress, value: '0x0', data });

			const decoded = abiFunc.decode(result.data);

			return {
				contractAddress,
				function: functionName,
				rawData: result.data,
				decoded: formatDecoded(decoded, funcDef.outputs),
				gasUsed: result.gasUsed,
				reverted: result.reverted,
			};
		}

		case 'write': {
			const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
			const abiJson = this.getNodeParameter('abi', itemIndex) as string;
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const paramsJson = this.getNodeParameter('parameters', itemIndex, '[]') as string;
			const value = this.getNodeParameter('value', itemIndex, '0') as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			const contractAbi = JSON.parse(abiJson);
			const params = JSON.parse(paramsJson);

			const funcDef = contractAbi.find((f: any) => f.name === functionName && f.type === 'function');
			if (!funcDef) throw new Error(`Function ${functionName} not found in ABI`);

			const abiFunc = new abi.Function(funcDef);
			const data = abiFunc.encode(...params);

			const valueWei = '0x' + BigInt(Math.floor(parseFloat(value) * 1e18)).toString(16);

			const bestBlock = await client.getBlock('best');
			const txBody = {
				chainTag: getChainTag(network),
				blockRef: bestBlock.id.slice(0, 18),
				expiration: (gasOptions.expiration as number) || 720,
				clauses: [{ to: contractAddress, value: valueWei, data }],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 200000,
				dependsOn: null,
				nonce: generateNonce(),
			};

			const tx = new Transaction(txBody as any);
			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const signingHash = tx.signingHash();
			tx.signature = secp256k1.sign(signingHash, privateKeyBuffer);

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				contractAddress,
				function: functionName,
				parameters: params,
				value,
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'deploy': {
			const bytecode = this.getNodeParameter('bytecode', itemIndex) as string;
			const constructorParamsJson = this.getNodeParameter('constructorParams', itemIndex, '[]') as string;
			const constructorAbiJson = this.getNodeParameter('constructorAbi', itemIndex, '[]') as string;
			const gasOptions = this.getNodeParameter('gasOptions', itemIndex, {}) as IDataObject;

			let deployData = bytecode.startsWith('0x') ? bytecode : '0x' + bytecode;

			// Encode constructor parameters if provided
			const constructorParams = JSON.parse(constructorParamsJson);
			const constructorAbi = JSON.parse(constructorAbiJson);

			if (constructorParams.length > 0 && constructorAbi.length > 0) {
				const abiCoder = new ethers.AbiCoder();
				const types = constructorAbi.map((input: { type: string }) => input.type);
				const encoded = abiCoder.encode(types, constructorParams);
				deployData += encoded.slice(2);
			}

			const bestBlock = await client.getBlock('best');
			const txBody = {
				chainTag: getChainTag(network),
				blockRef: bestBlock.id.slice(0, 18),
				expiration: (gasOptions.expiration as number) || 720,
				clauses: [{ to: null, value: '0x0', data: deployData }],
				gasPriceCoef: (gasOptions.gasPriceCoef as number) || 0,
				gas: (gasOptions.gas as number) || 2000000,
				dependsOn: null,
				nonce: generateNonce(),
			};

			const tx = new Transaction(txBody as any);
			const privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
			const signingHash = tx.signingHash();
			tx.signature = secp256k1.sign(signingHash, privateKeyBuffer);

			const rawTx = '0x' + tx.encode().toString('hex');
			const result = await client.sendTransaction(rawTx);

			return {
				success: true,
				txId: result.id,
				note: 'Contract address will be available in transaction receipt',
				explorerUrl: getExplorerUrl(network, result.id),
			};
		}

		case 'getCode': {
			const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
			const account = await client.getAccount(contractAddress);

			return {
				contractAddress,
				hasCode: account.hasCode,
				code: account.hasCode ? await client.getAccountCode(contractAddress) : null,
			};
		}

		case 'getStorage': {
			const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
			const position = this.getNodeParameter('storagePosition', itemIndex) as string;

			const storage = await client.getAccountStorage(contractAddress, position);

			return {
				contractAddress,
				position,
				value: storage,
			};
		}

		case 'encodeFunction': {
			const abiJson = this.getNodeParameter('abi', itemIndex) as string;
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const paramsJson = this.getNodeParameter('parameters', itemIndex, '[]') as string;

			const contractAbi = JSON.parse(abiJson);
			const params = JSON.parse(paramsJson);

			const funcDef = contractAbi.find((f: any) => f.name === functionName && f.type === 'function');
			if (!funcDef) throw new Error(`Function ${functionName} not found in ABI`);

			const abiFunc = new abi.Function(funcDef);
			const encoded = abiFunc.encode(...params);

			return {
				function: functionName,
				parameters: params,
				encoded,
				selector: encoded.slice(0, 10),
			};
		}

		case 'decodeResult': {
			const abiJson = this.getNodeParameter('abi', itemIndex) as string;
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const data = this.getNodeParameter('data', itemIndex) as string;

			const contractAbi = JSON.parse(abiJson);

			const funcDef = contractAbi.find((f: any) => f.name === functionName && f.type === 'function');
			if (!funcDef) throw new Error(`Function ${functionName} not found in ABI`);

			const abiFunc = new abi.Function(funcDef);
			const decoded = abiFunc.decode(data);

			return {
				function: functionName,
				rawData: data,
				decoded: formatDecoded(decoded, funcDef.outputs),
			};
		}

		case 'simulate': {
			const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
			const abiJson = this.getNodeParameter('abi', itemIndex) as string;
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const paramsJson = this.getNodeParameter('parameters', itemIndex, '[]') as string;
			const value = this.getNodeParameter('value', itemIndex, '0') as string;
			const callerAddress = this.getNodeParameter('callerAddress', itemIndex, '') as string;

			const contractAbi = JSON.parse(abiJson);
			const params = JSON.parse(paramsJson);

			const funcDef = contractAbi.find((f: any) => f.name === functionName && f.type === 'function');
			if (!funcDef) throw new Error(`Function ${functionName} not found in ABI`);

			const abiFunc = new abi.Function(funcDef);
			const data = abiFunc.encode(...params);
			const valueWei = '0x' + BigInt(Math.floor(parseFloat(value) * 1e18)).toString(16);

			const caller = callerAddress || '0x0000000000000000000000000000000000000000';
			const result = await client.call({ to: contractAddress, value: valueWei, data }, caller);

			return {
				contractAddress,
				function: functionName,
				success: !result.reverted,
				gasUsed: result.gasUsed,
				rawData: result.data,
				decoded: result.reverted ? null : formatDecoded(abiFunc.decode(result.data), funcDef.outputs),
				revertReason: result.revertReason,
			};
		}

		case 'estimateGas': {
			const contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
			const abiJson = this.getNodeParameter('abi', itemIndex) as string;
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const paramsJson = this.getNodeParameter('parameters', itemIndex, '[]') as string;
			const callerAddress = this.getNodeParameter('callerAddress', itemIndex, '') as string;

			const contractAbi = JSON.parse(abiJson);
			const params = JSON.parse(paramsJson);

			const funcDef = contractAbi.find((f: any) => f.name === functionName && f.type === 'function');
			if (!funcDef) throw new Error(`Function ${functionName} not found in ABI`);

			const abiFunc = new abi.Function(funcDef);
			const data = abiFunc.encode(...params);

			const caller = callerAddress || '0x0000000000000000000000000000000000000000';
			const clauses = [{ to: contractAddress, value: '0x0', data }];

			const gasEstimates = await client.estimateGas(clauses, caller);
			const totalGas = gasEstimates.reduce((sum: number, e: { gasUsed: number }) => sum + e.gasUsed, 0);

			// Calculate VTHO cost
			const baseGasPrice = BigInt(1e15);
			const vthoCost = BigInt(totalGas) * baseGasPrice;

			return {
				contractAddress,
				function: functionName,
				estimatedGas: totalGas,
				gasDetails: gasEstimates,
				baseFeeVtho: (Number(vthoCost) / 1e18).toFixed(6) + ' VTHO',
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

function formatDecoded(decoded: any, outputs: any[]): IDataObject {
	const result: IDataObject = {};
	if (Array.isArray(decoded)) {
		outputs.forEach((output, index) => {
			const key = output.name || `output${index}`;
			const value = decoded[index];
			result[key] = typeof value === 'bigint' ? value.toString() : value;
		});
	}
	return result;
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
