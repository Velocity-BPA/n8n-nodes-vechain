/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * VeChain Node for n8n
 *
 * A comprehensive n8n community node for interacting with the VeChain blockchain.
 * Supports VET/VTHO transfers, VIP-180 tokens, VIP-181 NFTs, smart contracts,
 * multi-clause transactions, fee delegation, and enterprise ToolChain features.
 *
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { accountProperties, executeAccountOperation } from './actions/account/account.operations';
import { transactionProperties, executeTransactionOperation } from './actions/transaction/transaction.operations';
import { vetProperties, executeVetOperation } from './actions/vet/vet.operations';
import { vthoProperties, executeVthoOperation } from './actions/vtho/vtho.operations';
import { vip180Properties, executeVip180Operation } from './actions/vip180/vip180.operations';
import { vip181Properties, executeVip181Operation } from './actions/vip181/vip181.operations';
import { contractProperties, executeContractOperation } from './actions/contract/contract.operations';
import { blockProperties, executeBlockOperation } from './actions/block/block.operations';
import { utilityProperties, executeUtilityOperation } from './actions/utility/utility.operations';

export class Vechain implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VeChain',
		name: 'vechain',
		icon: 'file:vechain.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the VeChain blockchain - transfers, tokens, NFTs, contracts, and enterprise features',
		defaults: {
			name: 'VeChain',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'vechainNetwork',
				required: true,
			},
			{
				name: 'vechainApi',
				required: false,
			},
			{
				name: 'feeDelegation',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
						description: 'Get account info, balances, and validate addresses',
					},
					{
						name: 'Transaction',
						value: 'transaction',
						description: 'Send transactions, get receipts, and manage multi-clause operations',
					},
					{
						name: 'VET',
						value: 'vet',
						description: 'VET token operations - transfer, balance, and multi-transfer',
					},
					{
						name: 'VTHO',
						value: 'vtho',
						description: 'VTHO energy token operations - transfer, generation, and burn rate',
					},
					{
						name: 'VIP-180 Token',
						value: 'vip180',
						description: 'Fungible token operations - balance, transfer, approve, allowance',
					},
					{
						name: 'VIP-181 NFT',
						value: 'vip181',
						description: 'NFT operations - ownership, transfer, metadata, minting',
					},
					{
						name: 'Smart Contract',
						value: 'contract',
						description: 'Read/write contracts, deploy, and encode/decode data',
					},
					{
						name: 'Block',
						value: 'block',
						description: 'Get block info, transactions, and finality status',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Unit conversion, signing, address generation, and helpers',
					},
				],
				default: 'account',
			},
			// Include all resource-specific properties
			...accountProperties,
			...transactionProperties,
			...vetProperties,
			...vthoProperties,
			...vip180Properties,
			...vip181Properties,
			...contractProperties,
			...blockProperties,
			...utilityProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result;

				switch (resource) {
					case 'account':
						result = await executeAccountOperation.call(this, operation, i);
						break;
					case 'transaction':
						result = await executeTransactionOperation.call(this, operation, i);
						break;
					case 'vet':
						result = await executeVetOperation.call(this, operation, i);
						break;
					case 'vtho':
						result = await executeVthoOperation.call(this, operation, i);
						break;
					case 'vip180':
						result = await executeVip180Operation.call(this, operation, i);
						break;
					case 'vip181':
						result = await executeVip181Operation.call(this, operation, i);
						break;
					case 'contract':
						result = await executeContractOperation.call(this, operation, i);
						break;
					case 'block':
						result = await executeBlockOperation.call(this, operation, i);
						break;
					case 'utility':
						result = await executeUtilityOperation.call(this, operation, i);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown resource: ${resource}`,
							{ itemIndex: i },
						);
				}

				returnData.push({
					json: result,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
