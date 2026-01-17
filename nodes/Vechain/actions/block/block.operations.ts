/**
 * Block Operations
 *
 * Operations for VeChain blocks:
 * - Get block by number or ID
 * - Get best/finalized block
 * - Get block transactions
 * - Block finality status
 *
 * @author Velocity BPA
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createThorClient } from '../../transport/thorClient';

export const blockProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['block'],
			},
		},
		options: [
			{
				name: 'Get Block',
				value: 'getBlock',
				description: 'Get block by number or ID',
				action: 'Get block',
			},
			{
				name: 'Get Best Block',
				value: 'getBestBlock',
				description: 'Get the latest best block',
				action: 'Get best block',
			},
			{
				name: 'Get Finalized Block',
				value: 'getFinalizedBlock',
				description: 'Get the latest finalized block',
				action: 'Get finalized block',
			},
			{
				name: 'Get Genesis Block',
				value: 'getGenesisBlock',
				description: 'Get the genesis block',
				action: 'Get genesis block',
			},
			{
				name: 'Get Block Transactions',
				value: 'getBlockTransactions',
				description: 'Get all transactions in a block',
				action: 'Get block transactions',
			},
			{
				name: 'Get Block Height',
				value: 'getBlockHeight',
				description: 'Get current block height',
				action: 'Get block height',
			},
			{
				name: 'Check Finality',
				value: 'checkFinality',
				description: 'Check if a block is finalized',
				action: 'Check finality',
			},
			{
				name: 'Get Block Range',
				value: 'getBlockRange',
				description: 'Get a range of blocks',
				action: 'Get block range',
			},
		],
		default: 'getBestBlock',
	},
	// Block reference (number or ID)
	{
		displayName: 'Block Reference',
		name: 'blockRef',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlock', 'getBlockTransactions', 'checkFinality'],
			},
		},
		default: '',
		placeholder: '12345 or 0x...',
		description: 'Block number or block ID (hash)',
	},
	// Block range
	{
		displayName: 'Start Block',
		name: 'startBlock',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlockRange'],
			},
		},
		default: 0,
		description: 'Starting block number',
	},
	{
		displayName: 'End Block',
		name: 'endBlock',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlockRange'],
			},
		},
		default: 10,
		description: 'Ending block number',
	},
	// Include transactions option
	{
		displayName: 'Include Transaction Details',
		name: 'includeTransactions',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['block'],
				operation: ['getBlock', 'getBestBlock', 'getFinalizedBlock', 'getGenesisBlock'],
			},
		},
		default: false,
		description: 'Whether to include full transaction details',
	},
];

export async function executeBlockOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('vechainNetwork');
	const network = credentials.network as string;
	const customUrl = credentials.nodeUrl as string;

	const client = createThorClient(network, customUrl);

	switch (operation) {
		case 'getBlock': {
			const blockRef = this.getNodeParameter('blockRef', itemIndex) as string;
			const includeTransactions = this.getNodeParameter('includeTransactions', itemIndex, false) as boolean;

			const block = await client.getBlock(blockRef);

			const result: IDataObject = {
				id: block.id,
				number: block.number,
				timestamp: block.timestamp,
				timestampFormatted: new Date(block.timestamp * 1000).toISOString(),
				parentID: block.parentID,
				gasLimit: block.gasLimit,
				gasUsed: block.gasUsed,
				totalScore: block.totalScore,
				txsRoot: block.txsRoot,
				stateRoot: block.stateRoot,
				receiptsRoot: block.receiptsRoot,
				signer: block.signer,
				beneficiary: block.beneficiary,
				isTrunk: block.isTrunk,
				transactionCount: block.transactions?.length || 0,
			};

			if (includeTransactions && block.transactions) {
				result.transactions = block.transactions;
			} else if (block.transactions) {
				result.transactionIds = block.transactions;
			}

			return result;
		}

		case 'getBestBlock': {
			const includeTransactions = this.getNodeParameter('includeTransactions', itemIndex, false) as boolean;
			const block = await client.getBlock('best');

			const result: IDataObject = {
				id: block.id,
				number: block.number,
				timestamp: block.timestamp,
				timestampFormatted: new Date(block.timestamp * 1000).toISOString(),
				parentID: block.parentID,
				gasLimit: block.gasLimit,
				gasUsed: block.gasUsed,
				signer: block.signer,
				transactionCount: block.transactions?.length || 0,
			};

			if (includeTransactions && block.transactions) {
				result.transactions = block.transactions;
			}

			return result;
		}

		case 'getFinalizedBlock': {
			const includeTransactions = this.getNodeParameter('includeTransactions', itemIndex, false) as boolean;
			const block = await client.getBlock('finalized');

			const bestBlock = await client.getBlock('best');

			const result: IDataObject = {
				id: block.id,
				number: block.number,
				timestamp: block.timestamp,
				timestampFormatted: new Date(block.timestamp * 1000).toISOString(),
				parentID: block.parentID,
				gasLimit: block.gasLimit,
				gasUsed: block.gasUsed,
				signer: block.signer,
				transactionCount: block.transactions?.length || 0,
				blocksToFinality: bestBlock.number - block.number,
			};

			if (includeTransactions && block.transactions) {
				result.transactions = block.transactions;
			}

			return result;
		}

		case 'getGenesisBlock': {
			const includeTransactions = this.getNodeParameter('includeTransactions', itemIndex, false) as boolean;
			const block = await client.getBlock(0);

			const result: IDataObject = {
				id: block.id,
				number: block.number,
				timestamp: block.timestamp,
				timestampFormatted: new Date(block.timestamp * 1000).toISOString(),
				gasLimit: block.gasLimit,
				signer: block.signer,
				beneficiary: block.beneficiary,
				network: getNetworkName(block.id),
			};

			if (includeTransactions && block.transactions) {
				result.transactions = block.transactions;
			}

			return result;
		}

		case 'getBlockTransactions': {
			const blockRef = this.getNodeParameter('blockRef', itemIndex) as string;
			const block = await client.getBlock(blockRef);

			const transactions: IDataObject[] = [];
			if (block.transactions) {
				for (const txId of block.transactions.slice(0, 50)) {
					try {
						const tx = await client.getTransaction(txId as string);
						if (tx) {
							transactions.push({
								id: tx.id,
								origin: tx.origin,
								clauseCount: tx.clauses?.length || 0,
								gas: tx.gas,
								gasPriceCoef: tx.gasPriceCoef,
							});
						} else {
							transactions.push({ id: txId, error: 'Transaction not found' });
						}
					} catch {
						transactions.push({ id: txId, error: 'Failed to fetch' });
					}
				}
			}

			return {
				blockNumber: block.number,
				blockId: block.id,
				transactionCount: block.transactions?.length || 0,
				transactions,
			};
		}

		case 'getBlockHeight': {
			const bestBlock = await client.getBlock('best');
			const finalizedBlock = await client.getBlock('finalized');

			return {
				bestBlockNumber: bestBlock.number,
				bestBlockId: bestBlock.id,
				finalizedBlockNumber: finalizedBlock.number,
				finalizedBlockId: finalizedBlock.id,
				confirmations: bestBlock.number - finalizedBlock.number,
			};
		}

		case 'checkFinality': {
			const blockRef = this.getNodeParameter('blockRef', itemIndex) as string;
			const block = await client.getBlock(blockRef);
			const finalizedBlock = await client.getBlock('finalized');
			const bestBlock = await client.getBlock('best');

			const isFinalized = block.number <= finalizedBlock.number;
			const confirmations = bestBlock.number - block.number;

			return {
				blockNumber: block.number,
				blockId: block.id,
				isFinalized,
				confirmations,
				blocksToFinality: isFinalized ? 0 : block.number - finalizedBlock.number,
				finalizedBlockNumber: finalizedBlock.number,
				estimatedTimeToFinality: isFinalized ? 0 : (block.number - finalizedBlock.number) * 10,
				note: isFinalized
					? 'Block is finalized and irreversible'
					: `~${(block.number - finalizedBlock.number) * 10} seconds until finality`,
			};
		}

		case 'getBlockRange': {
			const startBlock = this.getNodeParameter('startBlock', itemIndex) as number;
			const endBlock = this.getNodeParameter('endBlock', itemIndex) as number;

			if (endBlock - startBlock > 100) {
				throw new Error('Maximum range is 100 blocks');
			}

			const blocks: IDataObject[] = [];
			for (let i = startBlock; i <= endBlock; i++) {
				try {
					const block = await client.getBlock(i);
					blocks.push({
						number: block.number,
						id: block.id,
						timestamp: block.timestamp,
						timestampFormatted: new Date(block.timestamp * 1000).toISOString(),
						gasUsed: block.gasUsed,
						transactionCount: block.transactions?.length || 0,
						signer: block.signer,
					});
				} catch {
					blocks.push({ number: i, error: 'Block not found' });
				}
			}

			return {
				startBlock,
				endBlock,
				blockCount: blocks.length,
				blocks,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

function getNetworkName(genesisId: string): string {
	const knownGenesis: { [key: string]: string } = {
		'0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a': 'mainnet',
		'0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127': 'testnet',
	};
	return knownGenesis[genesisId] || 'unknown';
}
