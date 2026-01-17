/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * VeChain Trigger Node for n8n
 *
 * Monitors VeChain blockchain events via polling:
 * - New blocks
 * - Transactions to/from addresses
 * - Token transfers (VIP-180/VIP-181)
 * - Contract events
 *
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 */

import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';


import { createThorClient } from './transport/thorClient';
import { weiToVet, weiToVtho } from './utils/unitConverter';
import { VTHO_CONTRACT_ADDRESS } from './constants/tokens';
// VIP180_ABI removed - unused

export class VechainTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'VeChain Trigger',
		name: 'vechainTrigger',
		icon: 'file:vechain.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers on VeChain blockchain events',
		defaults: {
			name: 'VeChain Trigger',
		},
		polling: true,
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'vechainNetwork',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Trigger On',
				name: 'triggerOn',
				type: 'options',
				options: [
					{
						name: 'New Block',
						value: 'newBlock',
						description: 'Trigger when a new block is produced',
					},
					{
						name: 'Block Finalized',
						value: 'blockFinalized',
						description: 'Trigger when a block reaches finality',
					},
					{
						name: 'VET Received',
						value: 'vetReceived',
						description: 'Trigger when VET is received at an address',
					},
					{
						name: 'VET Sent',
						value: 'vetSent',
						description: 'Trigger when VET is sent from an address',
					},
					{
						name: 'VTHO Received',
						value: 'vthoReceived',
						description: 'Trigger when VTHO is received at an address',
					},
					{
						name: 'VTHO Sent',
						value: 'vthoSent',
						description: 'Trigger when VTHO is sent from an address',
					},
					{
						name: 'Token Transfer (VIP-180)',
						value: 'tokenTransfer',
						description: 'Trigger on VIP-180 token transfers',
					},
					{
						name: 'NFT Transfer (VIP-181)',
						value: 'nftTransfer',
						description: 'Trigger on VIP-181 NFT transfers',
					},
					{
						name: 'Contract Event',
						value: 'contractEvent',
						description: 'Trigger on specific contract events',
					},
					{
						name: 'Large Transaction',
						value: 'largeTransaction',
						description: 'Trigger on transactions above a threshold',
					},
				],
				default: 'newBlock',
			},
			// Address field for transfer triggers
			{
				displayName: 'Address',
				name: 'address',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						triggerOn: [
							'vetReceived',
							'vetSent',
							'vthoReceived',
							'vthoSent',
							'tokenTransfer',
							'nftTransfer',
						],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'Address to monitor',
			},
			// Token contract address
			{
				displayName: 'Token Contract',
				name: 'tokenContract',
				type: 'string',
				displayOptions: {
					show: {
						triggerOn: ['tokenTransfer'],
					},
				},
				default: '',
				placeholder: '0x... (leave empty for all tokens)',
				description: 'Specific token contract to monitor (leave empty for all VIP-180 tokens)',
			},
			// NFT contract address
			{
				displayName: 'NFT Contract',
				name: 'nftContract',
				type: 'string',
				displayOptions: {
					show: {
						triggerOn: ['nftTransfer'],
					},
				},
				default: '',
				placeholder: '0x... (leave empty for all NFTs)',
				description: 'Specific NFT contract to monitor (leave empty for all VIP-181 NFTs)',
			},
			// Contract event settings
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						triggerOn: ['contractEvent'],
					},
				},
				default: '',
				placeholder: '0x...',
				description: 'Contract address to monitor',
			},
			{
				displayName: 'Event Signature',
				name: 'eventSignature',
				type: 'string',
				displayOptions: {
					show: {
						triggerOn: ['contractEvent'],
					},
				},
				default: '',
				placeholder: 'Transfer(address,address,uint256)',
				description: 'Event signature to filter (leave empty for all events)',
			},
			// Large transaction threshold
			{
				displayName: 'Threshold (VET)',
				name: 'threshold',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						triggerOn: ['largeTransaction'],
					},
				},
				default: 1000000,
				description: 'Minimum VET amount to trigger',
			},
			{
				displayName: 'Monitor Address',
				name: 'monitorAddress',
				type: 'string',
				displayOptions: {
					show: {
						triggerOn: ['largeTransaction'],
					},
				},
				default: '',
				placeholder: '0x... (leave empty for all addresses)',
				description: 'Specific address to monitor (leave empty for network-wide)',
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const credentials = await this.getCredentials('vechainNetwork');
		const network = credentials.network as string;
		const customUrl = credentials.nodeUrl as string;

		const client = createThorClient(network, customUrl);
		const triggerOn = this.getNodeParameter('triggerOn') as string;

		// Get last processed block from workflow static data
		const workflowStaticData = this.getWorkflowStaticData('node');
		let lastBlockNumber = workflowStaticData.lastBlockNumber as number | undefined;

		// Get current best block
		const bestBlock = await client.getBlock('best');
		if (!bestBlock) {
			return null;
		}

		// Initialize on first run
		if (lastBlockNumber === undefined) {
			lastBlockNumber = bestBlock.number - 1;
			workflowStaticData.lastBlockNumber = bestBlock.number;
			return null;
		}

		// No new blocks
		if (bestBlock.number <= lastBlockNumber) {
			return null;
		}

		const returnData: INodeExecutionData[] = [];

		// Process blocks from lastBlockNumber + 1 to bestBlock.number
		for (let blockNum = lastBlockNumber + 1; blockNum <= bestBlock.number; blockNum++) {
			const block = blockNum === bestBlock.number ? bestBlock : await client.getBlock(blockNum.toString());
			if (!block) continue;

			switch (triggerOn) {
				case 'newBlock':
					returnData.push({
						json: {
							blockNumber: block.number,
							blockId: block.id,
							timestamp: block.timestamp,
							gasLimit: block.gasLimit,
							gasUsed: block.gasUsed,
							txCount: block.transactions?.length || 0,
							signer: block.signer,
							beneficiary: block.beneficiary,
							isTrunk: block.isTrunk,
						},
					});
					break;

				case 'blockFinalized':
					// In PoA 2.0, finality is ~12 blocks behind
					if (blockNum <= bestBlock.number - 12) {
						returnData.push({
							json: {
								blockNumber: block.number,
								blockId: block.id,
								timestamp: block.timestamp,
								finalized: true,
								confirmations: bestBlock.number - block.number,
							},
						});
					}
					break;

				case 'vetReceived':
				case 'vetSent':
					await processVetTransfers(client, block as unknown as IDataObject, triggerOn, this, returnData);
					break;

				case 'vthoReceived':
				case 'vthoSent':
					await processVthoTransfers(client, block as unknown as IDataObject, triggerOn, this, returnData);
					break;

				case 'tokenTransfer':
					await processTokenTransfers(client, block as unknown as IDataObject, this, returnData);
					break;

				case 'nftTransfer':
					await processNftTransfers(client, block as unknown as IDataObject, this, returnData);
					break;

				case 'contractEvent':
					await processContractEvents(client, block as unknown as IDataObject, this, returnData);
					break;

				case 'largeTransaction':
					await processLargeTransactions(client, block as unknown as IDataObject, this, returnData);
					break;
			}
		}

		// Update last processed block
		workflowStaticData.lastBlockNumber = bestBlock.number;

		if (returnData.length === 0) {
			return null;
		}

		return [returnData];
	}
}

/**
 * Process VET transfers
 */
async function processVetTransfers(
	client: ReturnType<typeof createThorClient>,
	block: IDataObject,
	triggerOn: string,
	context: IPollFunctions,
	returnData: INodeExecutionData[],
): Promise<void> {
	const address = context.getNodeParameter('address') as string;
	const addressLower = address.toLowerCase();

	// Get transfers from block
	const transfers = await client.getTransfers({
		range: {
			unit: 'block',
			from: block.number as number,
			to: block.number as number,
		},
	});

	for (const transfer of transfers) {
		const isReceived = transfer.recipient?.toLowerCase() === addressLower;
		const isSent = transfer.sender?.toLowerCase() === addressLower;

		if ((triggerOn === 'vetReceived' && isReceived) || (triggerOn === 'vetSent' && isSent)) {
			returnData.push({
				json: {
					type: isReceived ? 'received' : 'sent',
					from: transfer.sender,
					to: transfer.recipient,
					amount: transfer.amount,
					amountFormatted: weiToVet(transfer.amount) + ' VET',
					txId: transfer.meta?.txID,
					blockNumber: transfer.meta?.blockNumber,
					timestamp: transfer.meta?.blockTimestamp,
				},
			});
		}
	}
}

/**
 * Process VTHO transfers
 */
async function processVthoTransfers(
	client: ReturnType<typeof createThorClient>,
	block: IDataObject,
	triggerOn: string,
	context: IPollFunctions,
	returnData: INodeExecutionData[],
): Promise<void> {
	const address = context.getNodeParameter('address') as string;
	const addressLower = address.toLowerCase();

	// Transfer event topic for VIP-180
	const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

	const events = await client.getEvents({
		range: {
			unit: 'block',
			from: block.number as number,
			to: block.number as number,
		},
		criteriaSet: [
			{
				address: VTHO_CONTRACT_ADDRESS,
				topic0: transferTopic,
			},
		],
	});

	for (const event of events) {
		if (!event.topics || event.topics.length < 3) continue;

		const from = '0x' + event.topics[1].slice(26);
		const to = '0x' + event.topics[2].slice(26);
		const amount = event.data;

		const isReceived = to.toLowerCase() === addressLower;
		const isSent = from.toLowerCase() === addressLower;

		if ((triggerOn === 'vthoReceived' && isReceived) || (triggerOn === 'vthoSent' && isSent)) {
			returnData.push({
				json: {
					type: isReceived ? 'received' : 'sent',
					from,
					to,
					amount,
					amountFormatted: weiToVtho(amount) + ' VTHO',
					txId: event.meta?.txID,
					blockNumber: event.meta?.blockNumber,
					timestamp: event.meta?.blockTimestamp,
				},
			});
		}
	}
}

/**
 * Process VIP-180 token transfers
 */
async function processTokenTransfers(
	client: ReturnType<typeof createThorClient>,
	block: IDataObject,
	context: IPollFunctions,
	returnData: INodeExecutionData[],
): Promise<void> {
	const address = context.getNodeParameter('address') as string;
	const tokenContract = context.getNodeParameter('tokenContract', '') as string;
	const addressLower = address.toLowerCase();

	const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

	const criteria: IDataObject = { topic0: transferTopic };
	if (tokenContract) {
		criteria.address = tokenContract;
	}

	const events = await client.getEvents({
		range: {
			unit: 'block',
			from: block.number as number,
			to: block.number as number,
		},
		criteriaSet: [criteria],
	});

	for (const event of events) {
		if (!event.topics || event.topics.length < 3) continue;

		const from = '0x' + event.topics[1].slice(26);
		const to = '0x' + event.topics[2].slice(26);

		const isReceived = to.toLowerCase() === addressLower;
		const isSent = from.toLowerCase() === addressLower;

		if (isReceived || isSent) {
			returnData.push({
				json: {
					type: isReceived ? 'received' : 'sent',
					tokenContract: event.address,
					from,
					to,
					amount: event.data,
					txId: event.meta?.txID,
					blockNumber: event.meta?.blockNumber,
					timestamp: event.meta?.blockTimestamp,
				},
			});
		}
	}
}

/**
 * Process VIP-181 NFT transfers
 */
async function processNftTransfers(
	client: ReturnType<typeof createThorClient>,
	block: IDataObject,
	context: IPollFunctions,
	returnData: INodeExecutionData[],
): Promise<void> {
	const address = context.getNodeParameter('address') as string;
	const nftContract = context.getNodeParameter('nftContract', '') as string;
	const addressLower = address.toLowerCase();

	// Transfer(address,address,uint256) topic for NFTs
	const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

	const criteria: IDataObject = { topic0: transferTopic };
	if (nftContract) {
		criteria.address = nftContract;
	}

	const events = await client.getEvents({
		range: {
			unit: 'block',
			from: block.number as number,
			to: block.number as number,
		},
		criteriaSet: [criteria],
	});

	for (const event of events) {
		if (!event.topics || event.topics.length < 4) continue; // NFTs have indexed tokenId

		const from = '0x' + event.topics[1].slice(26);
		const to = '0x' + event.topics[2].slice(26);
		const tokenId = BigInt(event.topics[3]).toString();

		const isReceived = to.toLowerCase() === addressLower;
		const isSent = from.toLowerCase() === addressLower;

		if (isReceived || isSent) {
			returnData.push({
				json: {
					type: isReceived ? 'received' : 'sent',
					nftContract: event.address,
					from,
					to,
					tokenId,
					txId: event.meta?.txID,
					blockNumber: event.meta?.blockNumber,
					timestamp: event.meta?.blockTimestamp,
				},
			});
		}
	}
}

/**
 * Process contract events
 */
async function processContractEvents(
	client: ReturnType<typeof createThorClient>,
	block: IDataObject,
	context: IPollFunctions,
	returnData: INodeExecutionData[],
): Promise<void> {
	const contractAddress = context.getNodeParameter('contractAddress') as string;
	const eventSignature = context.getNodeParameter('eventSignature', '') as string;

	const criteria: IDataObject = { address: contractAddress };
	if (eventSignature) {
		// Calculate topic0 from event signature
		const { keccak256, toUtf8Bytes } = await import('ethers');
		criteria.topic0 = keccak256(toUtf8Bytes(eventSignature));
	}

	const events = await client.getEvents({
		range: {
			unit: 'block',
			from: block.number as number,
			to: block.number as number,
		},
		criteriaSet: [criteria],
	});

	for (const event of events) {
		returnData.push({
			json: {
				address: event.address,
				topics: event.topics,
				data: event.data,
				txId: event.meta?.txID,
				blockNumber: event.meta?.blockNumber,
				timestamp: event.meta?.blockTimestamp,
				clauseIndex: event.meta?.clauseIndex,
			},
		});
	}
}

/**
 * Process large transactions
 */
async function processLargeTransactions(
	client: ReturnType<typeof createThorClient>,
	block: IDataObject,
	context: IPollFunctions,
	returnData: INodeExecutionData[],
): Promise<void> {
	const threshold = context.getNodeParameter('threshold') as number;
	const monitorAddress = context.getNodeParameter('monitorAddress', '') as string;
	const thresholdWei = BigInt(threshold) * BigInt(10 ** 18);

	const transfers = await client.getTransfers({
		range: {
			unit: 'block',
			from: block.number as number,
			to: block.number as number,
		},
	});

	for (const transfer of transfers) {
		const amount = BigInt(transfer.amount || '0');
		if (amount < thresholdWei) continue;

		if (monitorAddress) {
			const addrLower = monitorAddress.toLowerCase();
			if (
				transfer.sender?.toLowerCase() !== addrLower &&
				transfer.recipient?.toLowerCase() !== addrLower
			) {
				continue;
			}
		}

		returnData.push({
			json: {
				from: transfer.sender,
				to: transfer.recipient,
				amount: transfer.amount,
				amountFormatted: weiToVet(transfer.amount) + ' VET',
				amountVet: Number(amount / BigInt(10 ** 18)),
				threshold,
				txId: transfer.meta?.txID,
				blockNumber: transfer.meta?.blockNumber,
				timestamp: transfer.meta?.blockTimestamp,
			},
		});
	}
}
