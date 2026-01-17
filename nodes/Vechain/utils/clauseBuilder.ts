/**
 * VeChain Clause Builder Utility
 * 
 * VeChain supports multi-clause transactions, allowing multiple operations
 * in a single transaction. This is powerful for:
 * - Batch transfers to multiple addresses
 * - Multiple contract calls in one transaction
 * - Atomic operations across contracts
 * - Gas efficiency (shared base cost)
 * 
 * Each clause contains:
 * - to: recipient address
 * - value: VET amount in wei
 * - data: encoded data for contract calls
 */

import { VIP180_ABI, VIP181_ABI } from '../constants/abis';
import { ethers } from 'ethers';

/**
 * Clause structure
 */
export interface Clause {
	to: string | null;
	value: string;
	data: string;
}

/**
 * Clause with metadata for tracking
 */
export interface ClauseWithMeta extends Clause {
	comment?: string;
	gasEstimate?: number;
}

/**
 * Clause builder class
 */
export class ClauseBuilder {
	private clauses: ClauseWithMeta[] = [];
	
	/**
	 * Add a VET transfer clause
	 */
	addVetTransfer(to: string, amount: string, comment?: string): this {
		this.clauses.push({
			to,
			value: amount,
			data: '0x',
			comment: comment || `Transfer ${amount} wei VET to ${to}`,
			gasEstimate: 21000,
		});
		return this;
	}
	
	/**
	 * Add a VIP-180 token transfer clause
	 */
	addTokenTransfer(
		tokenAddress: string,
		to: string,
		amount: string,
		comment?: string,
	): this {
		const iface = new ethers.Interface(VIP180_ABI);
		const data = iface.encodeFunctionData('transfer', [to, amount]);
		
		this.clauses.push({
			to: tokenAddress,
			value: '0',
			data,
			comment: comment || `Transfer ${amount} tokens to ${to}`,
			gasEstimate: 60000,
		});
		return this;
	}
	
	/**
	 * Add a VIP-180 token approval clause
	 */
	addTokenApproval(
		tokenAddress: string,
		spender: string,
		amount: string,
		comment?: string,
	): this {
		const iface = new ethers.Interface(VIP180_ABI);
		const data = iface.encodeFunctionData('approve', [spender, amount]);
		
		this.clauses.push({
			to: tokenAddress,
			value: '0',
			data,
			comment: comment || `Approve ${spender} to spend ${amount} tokens`,
			gasEstimate: 50000,
		});
		return this;
	}
	
	/**
	 * Add a VIP-181 NFT transfer clause
	 */
	addNftTransfer(
		nftAddress: string,
		from: string,
		to: string,
		tokenId: string,
		comment?: string,
	): this {
		const iface = new ethers.Interface(VIP181_ABI);
		const data = iface.encodeFunctionData('transferFrom', [from, to, tokenId]);
		
		this.clauses.push({
			to: nftAddress,
			value: '0',
			data,
			comment: comment || `Transfer NFT #${tokenId} from ${from} to ${to}`,
			gasEstimate: 100000,
		});
		return this;
	}
	
	/**
	 * Add a VIP-181 NFT safe transfer clause
	 */
	addNftSafeTransfer(
		nftAddress: string,
		from: string,
		to: string,
		tokenId: string,
		comment?: string,
	): this {
		const iface = new ethers.Interface(VIP181_ABI);
		const data = iface.encodeFunctionData('safeTransferFrom(address,address,uint256)', [from, to, tokenId]);
		
		this.clauses.push({
			to: nftAddress,
			value: '0',
			data,
			comment: comment || `Safe transfer NFT #${tokenId} from ${from} to ${to}`,
			gasEstimate: 120000,
		});
		return this;
	}
	
	/**
	 * Add a contract call clause
	 */
	addContractCall(
		contractAddress: string,
		abi: ethers.InterfaceAbi,
		functionName: string,
		args: unknown[],
		value: string = '0',
		comment?: string,
	): this {
		const iface = new ethers.Interface(abi);
		const data = iface.encodeFunctionData(functionName, args);
		
		this.clauses.push({
			to: contractAddress,
			value,
			data,
			comment: comment || `Call ${functionName} on ${contractAddress}`,
			gasEstimate: 100000,
		});
		return this;
	}
	
	/**
	 * Add a raw clause with custom data
	 */
	addRawClause(
		to: string | null,
		value: string,
		data: string,
		comment?: string,
		gasEstimate?: number,
	): this {
		this.clauses.push({
			to,
			value,
			data,
			comment,
			gasEstimate,
		});
		return this;
	}
	
	/**
	 * Add a contract deployment clause
	 */
	addContractDeploy(
		bytecode: string,
		constructorArgs: string = '',
		value: string = '0',
		comment?: string,
	): this {
		const data = bytecode + constructorArgs.replace('0x', '');
		
		this.clauses.push({
			to: null,
			value,
			data,
			comment: comment || 'Deploy contract',
			gasEstimate: 1000000,
		});
		return this;
	}
	
	/**
	 * Get all clauses
	 */
	getClauses(): Clause[] {
		return this.clauses.map(({ to, value, data }) => ({ to, value, data }));
	}
	
	/**
	 * Get clauses with metadata
	 */
	getClausesWithMeta(): ClauseWithMeta[] {
		return [...this.clauses];
	}
	
	/**
	 * Get total estimated gas
	 */
	getTotalGasEstimate(): number {
		// Base transaction gas
		let total = 5000;
		// Add clause gas
		for (const clause of this.clauses) {
			total += clause.gasEstimate || 21000;
		}
		return total;
	}
	
	/**
	 * Get clause count
	 */
	getClauseCount(): number {
		return this.clauses.length;
	}
	
	/**
	 * Clear all clauses
	 */
	clear(): this {
		this.clauses = [];
		return this;
	}
	
	/**
	 * Remove clause at index
	 */
	removeClause(index: number): this {
		this.clauses.splice(index, 1);
		return this;
	}
	
	/**
	 * Validate clauses
	 */
	validate(): { valid: boolean; errors: string[] } {
		const errors: string[] = [];
		
		if (this.clauses.length === 0) {
			errors.push('No clauses added');
		}
		
		for (let i = 0; i < this.clauses.length; i++) {
			const clause = this.clauses[i];
			
			// Check to address (null is allowed for contract deployment)
			if (clause.to !== null && !isValidAddress(clause.to)) {
				errors.push(`Clause ${i}: Invalid 'to' address`);
			}
			
			// Check value
			try {
				BigInt(clause.value);
			} catch {
				errors.push(`Clause ${i}: Invalid 'value'`);
			}
			
			// Check data
			if (!clause.data.startsWith('0x')) {
				errors.push(`Clause ${i}: Data must start with 0x`);
			}
		}
		
		return {
			valid: errors.length === 0,
			errors,
		};
	}
}

/**
 * Create a simple VET transfer clause
 */
export function createVetTransferClause(to: string, amount: string): Clause {
	return {
		to,
		value: amount,
		data: '0x',
	};
}

/**
 * Create a token transfer clause
 */
export function createTokenTransferClause(
	tokenAddress: string,
	to: string,
	amount: string,
): Clause {
	const iface = new ethers.Interface(VIP180_ABI);
	const data = iface.encodeFunctionData('transfer', [to, amount]);
	
	return {
		to: tokenAddress,
		value: '0',
		data,
	};
}

/**
 * Create a contract call clause
 */
export function createContractCallClause(
	contractAddress: string,
	abi: ethers.InterfaceAbi,
	functionName: string,
	args: unknown[],
	value: string = '0',
): Clause {
	const iface = new ethers.Interface(abi);
	const data = iface.encodeFunctionData(functionName, args);
	
	return {
		to: contractAddress,
		value,
		data,
	};
}

/**
 * Validate address format
 */
function isValidAddress(address: string): boolean {
	return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Batch VET transfers helper
 */
export function createBatchVetTransfers(
	transfers: { to: string; amount: string }[],
): Clause[] {
	return transfers.map(({ to, amount }) => createVetTransferClause(to, amount));
}

/**
 * Batch token transfers helper
 */
export function createBatchTokenTransfers(
	tokenAddress: string,
	transfers: { to: string; amount: string }[],
): Clause[] {
	return transfers.map(({ to, amount }) =>
		createTokenTransferClause(tokenAddress, to, amount),
	);
}
