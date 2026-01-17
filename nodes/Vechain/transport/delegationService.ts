/**
 * VeChain Fee Delegation Service
 * 
 * Fee delegation (VIP-191) allows a third party to pay transaction fees.
 * This is useful for:
 * - Onboarding new users without VTHO
 * - Enterprise applications where company pays fees
 * - DApps providing gasless transactions
 * 
 * The delegation service signs the transaction as the fee payer.
 */

import axios, { AxiosInstance } from 'axios';
import { ethers } from 'ethers';
import { TransactionBody } from './thorClient';

/**
 * Delegation request structure
 */
export interface DelegationRequest {
	raw: string;
	origin: string;
}

/**
 * Delegation response structure
 */
export interface DelegationResponse {
	signature: string;
	error?: string;
}

/**
 * Sponsor info response
 */
export interface SponsorInfo {
	address: string;
	credit: string;
	creditUsed: string;
	whitelist: string[];
	active: boolean;
}

/**
 * Fee Delegation Service class
 */
export class DelegationService {
	private client: AxiosInstance;
	private sponsorPrivateKey?: string;
	private sponsorAddress?: string;
	
	constructor(
		delegatorUrl: string,
		sponsorPrivateKey?: string,
	) {
		this.client = axios.create({
			baseURL: delegatorUrl,
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
			},
		});
		
		if (sponsorPrivateKey) {
			this.sponsorPrivateKey = sponsorPrivateKey;
			const wallet = new ethers.Wallet(sponsorPrivateKey);
			this.sponsorAddress = wallet.address;
		}
	}
	
	/**
	 * Request delegation signature from service
	 */
	async requestDelegation(
		rawTransaction: string,
		origin: string,
	): Promise<DelegationResponse> {
		try {
			const response = await this.client.post('/delegate', {
				raw: rawTransaction,
				origin,
			});
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return {
					signature: '',
					error: error.response.data?.error || 'Delegation request failed',
				};
			}
			throw error;
		}
	}
	
	/**
	 * Self-sponsor a transaction (sign as delegator locally)
	 */
	async selfSponsor(
		transactionHash: string,
	): Promise<string> {
		if (!this.sponsorPrivateKey) {
			throw new Error('Sponsor private key not configured');
		}
		
		const wallet = new ethers.Wallet(this.sponsorPrivateKey);
		const signature = await wallet.signMessage(ethers.getBytes(transactionHash));
		return signature;
	}
	
	/**
	 * Get sponsor information
	 */
	async getSponsorInfo(): Promise<SponsorInfo | null> {
		try {
			const response = await this.client.get('/info');
			return response.data;
		} catch {
			return null;
		}
	}
	
	/**
	 * Check if address is whitelisted
	 */
	async isWhitelisted(address: string): Promise<boolean> {
		try {
			const response = await this.client.get(`/whitelist/${address}`);
			return response.data?.whitelisted === true;
		} catch {
			return false;
		}
	}
	
	/**
	 * Add address to whitelist (if authorized)
	 */
	async addToWhitelist(address: string): Promise<boolean> {
		try {
			await this.client.post('/whitelist', { address });
			return true;
		} catch {
			return false;
		}
	}
	
	/**
	 * Remove address from whitelist (if authorized)
	 */
	async removeFromWhitelist(address: string): Promise<boolean> {
		try {
			await this.client.delete(`/whitelist/${address}`);
			return true;
		} catch {
			return false;
		}
	}
	
	/**
	 * Get sponsor address
	 */
	getSponsorAddress(): string | undefined {
		return this.sponsorAddress;
	}
	
	/**
	 * Check if self-sponsoring is enabled
	 */
	canSelfSponsor(): boolean {
		return !!this.sponsorPrivateKey;
	}
}

/**
 * Prepare transaction body for delegation
 */
export function prepareForDelegation(txBody: TransactionBody): TransactionBody {
	return {
		...txBody,
		reserved: {
			...txBody.reserved,
			features: 1, // Enable delegation feature
		},
	};
}

/**
 * VeChain Energy delegation service helper
 */
export class VeChainEnergyDelegation {
	private apiKey: string;
	private client: AxiosInstance;
	
	constructor(apiKey: string) {
		this.apiKey = apiKey;
		this.client = axios.create({
			baseURL: 'https://sponsor.vechain.energy',
			timeout: 30000,
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': apiKey,
			},
		});
	}
	
	/**
	 * Request sponsorship for a transaction
	 */
	async sponsor(
		rawTransaction: string,
		origin: string,
	): Promise<DelegationResponse> {
		try {
			const response = await this.client.post('/by/' + this.apiKey, {
				raw: rawTransaction,
				origin,
			});
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				return {
					signature: '',
					error: error.response.data?.error || 'Sponsorship request failed',
				};
			}
			throw error;
		}
	}
	
	/**
	 * Get sponsorship status
	 */
	async getStatus(): Promise<{
		balance: string;
		transactions: number;
		active: boolean;
	} | null> {
		try {
			const response = await this.client.get('/status/' + this.apiKey);
			return response.data;
		} catch {
			return null;
		}
	}
}

/**
 * Create a delegation service instance
 */
export function createDelegationService(
	delegatorUrl: string,
	sponsorPrivateKey?: string,
): DelegationService {
	return new DelegationService(delegatorUrl, sponsorPrivateKey);
}

/**
 * Create VeChain Energy delegation instance
 */
export function createVeChainEnergyDelegation(
	apiKey: string,
): VeChainEnergyDelegation {
	return new VeChainEnergyDelegation(apiKey);
}
