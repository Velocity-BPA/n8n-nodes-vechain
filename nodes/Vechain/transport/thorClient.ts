/**
 * VeChain Thor Client
 * 
 * This is the main transport layer for communicating with VeChain nodes.
 * It provides methods for:
 * - Reading blockchain data (accounts, blocks, transactions)
 * - Sending transactions
 * - Interacting with smart contracts
 * - Event filtering and subscription
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { ethers } from 'ethers';
import { getNodeUrl, getChainTag } from '../constants/networks';
import { Clause } from '../utils/clauseBuilder';

/**
 * Account information response
 */
export interface AccountInfo {
	balance: string;
	energy: string;
	hasCode: boolean;
}

/**
 * Block information response
 */
export interface BlockInfo {
	number: number;
	id: string;
	size: number;
	parentID: string;
	timestamp: number;
	gasLimit: number;
	beneficiary: string;
	gasUsed: number;
	totalScore: number;
	txsRoot: string;
	txsFeatures: number;
	stateRoot: string;
	receiptsRoot: string;
	com: boolean;
	signer: string;
	isTrunk: boolean;
	isFinalized: boolean;
	transactions: string[];
}

/**
 * Transaction information response
 */
export interface TransactionInfo {
	id: string;
	chainTag: number;
	blockRef: string;
	expiration: number;
	clauses: Clause[];
	gasPriceCoef: number;
	gas: number;
	origin: string;
	delegator: string | null;
	nonce: string;
	dependsOn: string | null;
	size: number;
	meta: {
		blockID: string;
		blockNumber: number;
		blockTimestamp: number;
	};
}

/**
 * Transaction receipt response
 */
export interface TransactionReceipt {
	gasUsed: number;
	gasPayer: string;
	paid: string;
	reward: string;
	reverted: boolean;
	meta: {
		blockID: string;
		blockNumber: number;
		blockTimestamp: number;
		txID: string;
		txOrigin: string;
	};
	outputs: {
		contractAddress: string | null;
		events: EventLog[];
		transfers: TransferLog[];
	}[];
}

/**
 * Event log structure
 */
export interface EventLog {
	address: string;
	topics: string[];
	data: string;
}

/**
 * Transfer log structure
 */
export interface TransferLog {
	sender: string;
	recipient: string;
	amount: string;
}

/**
 * Transaction body for sending
 */
export interface TransactionBody {
	chainTag: number;
	blockRef: string;
	expiration: number;
	clauses: Clause[];
	gasPriceCoef: number;
	gas: number;
	dependsOn: string | null;
	nonce: string;
	reserved?: {
		features?: number;
	};
}

/**
 * Event filter criteria
 */
export interface EventFilter {
	address?: string;
	topic0?: string;
	topic1?: string;
	topic2?: string;
	topic3?: string;
	topic4?: string;
}

/**
 * Event filter options
 */
export interface EventFilterOptions {
	range?: {
		unit: 'block' | 'time';
		from: number;
		to: number;
	};
	options?: {
		offset: number;
		limit: number;
	};
	criteriaSet: EventFilter[];
	order?: 'asc' | 'desc';
}

/**
 * Thor Client class
 */
export class ThorClient {
	private client: AxiosInstance;
	private network: string;
	private chainTag: number;
	
	constructor(network: string, customUrl?: string) {
		this.network = network;
		this.chainTag = network === 'custom' ? 0 : getChainTag(network);
		
		const baseURL = getNodeUrl(network, customUrl);
		this.client = axios.create({
			baseURL,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
	
	/**
	 * Get account information
	 */
	async getAccount(address: string, revision?: string): Promise<AccountInfo> {
		const url = `/accounts/${address}${revision ? `?revision=${revision}` : ''}`;
		const response = await this.client.get(url);
		return response.data;
	}
	
	/**
	 * Get account code (for contracts)
	 */
	async getAccountCode(address: string): Promise<string> {
		const response = await this.client.get(`/accounts/${address}/code`);
		return response.data?.code || '0x';
	}
	
	/**
	 * Get account storage at key
	 */
	async getAccountStorage(address: string, key: string): Promise<string> {
		const response = await this.client.get(`/accounts/${address}/storage/${key}`);
		return response.data?.value || '0x';
	}
	
	/**
	 * Call a contract method (read-only) - batch version
	 */
	async callBatch(
		clauses: Clause[],
		caller?: string,
		gas?: number,
		revision?: string,
	): Promise<{ data: string; events: EventLog[]; transfers: TransferLog[]; gasUsed: number; reverted: boolean; vmError: string }[]> {
		const body: Record<string, unknown> = { clauses };
		if (caller) body.caller = caller;
		if (gas) body.gas = gas;
		
		const url = `/accounts/*${revision ? `?revision=${revision}` : ''}`;
		const response = await this.client.post(url, body);
		return response.data;
	}
	
	/**
	 * Call a single contract method (read-only)
	 */
	async call(
		clause: Clause | { to: string; value: string; data: string },
		caller?: string,
		gas?: number,
		revision?: string,
	): Promise<{ data: string; events: EventLog[]; transfers: TransferLog[]; gasUsed: number; reverted: boolean; vmError: string; revertReason?: string }> {
		const clauses = [clause];
		const body: Record<string, unknown> = { clauses };
		if (caller) body.caller = caller;
		if (gas) body.gas = gas;
		
		const url = `/accounts/*${revision ? `?revision=${revision}` : ''}`;
		const response = await this.client.post(url, body);
		return response.data[0];
	}
	
	/**
	 * Get block by number or ID
	 */
	async getBlock(revision: string | number = 'best'): Promise<BlockInfo> {
		const response = await this.client.get(`/blocks/${revision}`);
		return response.data;
	}
	
	/**
	 * Get best block
	 */
	async getBestBlock(): Promise<BlockInfo> {
		return this.getBlock('best');
	}
	
	/**
	 * Get finalized block
	 */
	async getFinalizedBlock(): Promise<BlockInfo> {
		return this.getBlock('finalized');
	}
	
	/**
	 * Get transaction by ID
	 */
	async getTransaction(txId: string, head?: string): Promise<TransactionInfo | null> {
		try {
			const url = `/transactions/${txId}${head ? `?head=${head}` : ''}`;
			const response = await this.client.get(url);
			return response.data;
		} catch (error) {
			if ((error as AxiosError).response?.status === 404) {
				return null;
			}
			throw error;
		}
	}
	
	/**
	 * Get transaction receipt
	 */
	async getTransactionReceipt(txId: string, head?: string): Promise<TransactionReceipt | null> {
		try {
			const url = `/transactions/${txId}/receipt${head ? `?head=${head}` : ''}`;
			const response = await this.client.get(url);
			return response.data;
		} catch (error) {
			if ((error as AxiosError).response?.status === 404) {
				return null;
			}
			throw error;
		}
	}
	
	/**
	 * Send raw transaction
	 */
	async sendTransaction(raw: string): Promise<{ id: string }> {
		const response = await this.client.post('/transactions', { raw });
		return response.data;
	}
	
	/**
	 * Filter events
	 */
	async filterEvents(options: EventFilterOptions): Promise<{
		address: string;
		topics: string[];
		data: string;
		meta: {
			blockID: string;
			blockNumber: number;
			blockTimestamp: number;
			txID: string;
			txOrigin: string;
			clauseIndex: number;
		};
	}[]> {
		const response = await this.client.post('/logs/event', options);
		return response.data;
	}
	
	/**
	 * Filter transfers
	 */
	async filterTransfers(options: {
		range?: { unit: 'block' | 'time'; from: number; to: number };
		options?: { offset: number; limit: number };
		criteriaSet: { txOrigin?: string; sender?: string; recipient?: string }[];
		order?: 'asc' | 'desc';
	}): Promise<{
		sender: string;
		recipient: string;
		amount: string;
		meta: {
			blockID: string;
			blockNumber: number;
			blockTimestamp: number;
			txID: string;
			txOrigin: string;
			clauseIndex: number;
		};
	}[]> {
		const response = await this.client.post('/logs/transfer', options);
		return response.data;
	}
	
	/**
	 * Get chain tag
	 */
	getChainTag(): number {
		return this.chainTag;
	}
	
	/**
	 * Get network name
	 */
	getNetwork(): string {
		return this.network;
	}
	
	/**
	 * Create block ref from block ID
	 */
	static createBlockRef(blockId: string): string {
		return blockId.slice(0, 18);
	}
	
	/**
	 * Generate random nonce
	 */
	static generateNonce(): string {
		return '0x' + ethers.hexlify(ethers.randomBytes(8)).slice(2);
	}
	
	/**
	 * Estimate gas for clauses
	 */
	async estimateGas(
		clauses: Clause[] | { to: string; value: string; data: string }[],
		caller?: string,
	): Promise<{ gasUsed: number; reverted: boolean; vmError: string }[]> {
		const results = await this.callBatch(clauses as Clause[], caller, 10000000);
		return results.map(r => ({
			gasUsed: r.gasUsed,
			reverted: r.reverted,
			vmError: r.vmError,
		}));
	}
	
	/**
	 * Check if address is a contract
	 */
	async isContract(address: string): Promise<boolean> {
		const account = await this.getAccount(address);
		return account.hasCode;
	}
	
	/**
	 * Get pending transactions (if supported by node)
	 */
	async getPendingTransactions(): Promise<string[]> {
		try {
			const response = await this.client.get('/transactions/pending');
			return response.data;
		} catch {
			// Not all nodes support this endpoint
			return [];
		}
	}
	
	/**
	 * Simulate transaction
	 */
	async simulateTransaction(
		clauses: Clause[],
		caller?: string,
		gas?: number,
		gasPrice?: number,
	): Promise<{
		data: string;
		events: EventLog[];
		transfers: TransferLog[];
		gasUsed: number;
		reverted: boolean;
		vmError: string;
	}[]> {
		const body: Record<string, unknown> = { clauses };
		if (caller) body.caller = caller;
		if (gas) body.gas = gas;
		if (gasPrice) body.gasPrice = gasPrice;
		
		const response = await this.client.post('/accounts/*', body);
		return response.data;
	}
	
	/**
	 * Get transfers (wrapper for filterTransfers)
	 */
	async getTransfers(options: {
		range?: { unit: 'block' | 'time'; from: number; to: number };
		options?: { offset: number; limit: number };
		criteriaSet?: { txOrigin?: string; sender?: string; recipient?: string }[];
		order?: 'asc' | 'desc';
	}): Promise<{
		sender: string;
		recipient: string;
		amount: string;
		meta: {
			blockID: string;
			blockNumber: number;
			blockTimestamp: number;
			txID: string;
			txOrigin: string;
			clauseIndex: number;
		};
	}[]> {
		return this.filterTransfers({
			...options,
			criteriaSet: options.criteriaSet || [{}],
		});
	}
	
	/**
	 * Get events (wrapper for filterEvents)
	 */
	async getEvents(options: {
		range?: { unit: 'block' | 'time'; from: number; to: number };
		options?: { offset: number; limit: number };
		criteriaSet?: EventFilter[];
		order?: 'asc' | 'desc';
	}): Promise<{
		address: string;
		topics: string[];
		data: string;
		meta: {
			blockID: string;
			blockNumber: number;
			blockTimestamp: number;
			txID: string;
			txOrigin: string;
			clauseIndex: number;
		};
	}[]> {
		return this.filterEvents({
			...options,
			criteriaSet: options.criteriaSet || [{}],
		});
	}
}

/**
 * Create a Thor client instance
 */
export function createThorClient(network: string, customUrl?: string): ThorClient {
	return new ThorClient(network, customUrl);
}
