/**
 * VeChain ToolChain API
 * 
 * ToolChain is VeChain's enterprise blockchain toolkit providing:
 * - Product traceability and supply chain management
 * - Data certification and verification
 * - Identity management
 * - Carbon footprint tracking
 * 
 * Used by enterprises like Walmart, LVMH, BMW, and others.
 */

import axios, { AxiosInstance } from 'axios';

/**
 * Product record structure
 */
export interface ProductRecord {
	id: string;
	type: string;
	name: string;
	description?: string;
	data: Record<string, unknown>;
	metadata: {
		createdAt: number;
		updatedAt: number;
		createdBy: string;
		txId?: string;
		blockNumber?: number;
	};
}

/**
 * Supply chain event structure
 */
export interface SupplyChainEvent {
	id: string;
	productId: string;
	eventType: string;
	location?: {
		latitude: number;
		longitude: number;
		name?: string;
	};
	timestamp: number;
	data: Record<string, unknown>;
	signatures?: string[];
}

/**
 * Certificate structure
 */
export interface ToolChainCertificate {
	id: string;
	productId?: string;
	type: string;
	issuer: string;
	issuedAt: number;
	validUntil?: number;
	data: Record<string, unknown>;
	signature: string;
	revoked: boolean;
}

/**
 * ToolChain API client
 */
export class ToolChainApi {
	private client: AxiosInstance;
	
	constructor(
		apiUrl: string,
		apiKey: string,
		appId: string,
		secret?: string,
	) {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'X-API-Key': apiKey,
			'X-App-Id': appId,
		};
		
		if (secret) {
			// Generate authentication signature
			headers['X-App-Secret'] = secret;
		}
		
		this.client = axios.create({
			baseURL: apiUrl,
			timeout: 30000,
			headers,
		});
	}
	
	/**
	 * Create a new product record
	 */
	async createProduct(
		type: string,
		name: string,
		data: Record<string, unknown>,
		description?: string,
	): Promise<ProductRecord> {
		const response = await this.client.post('/products', {
			type,
			name,
			description,
			data,
		});
		return response.data;
	}
	
	/**
	 * Get product by ID
	 */
	async getProduct(productId: string): Promise<ProductRecord | null> {
		try {
			const response = await this.client.get(`/products/${productId}`);
			return response.data;
		} catch {
			return null;
		}
	}
	
	/**
	 * Update product data
	 */
	async updateProduct(
		productId: string,
		data: Record<string, unknown>,
	): Promise<ProductRecord> {
		const response = await this.client.put(`/products/${productId}`, { data });
		return response.data;
	}
	
	/**
	 * Get products by type
	 */
	async getProductsByType(
		type: string,
		limit: number = 100,
		offset: number = 0,
	): Promise<ProductRecord[]> {
		const response = await this.client.get('/products', {
			params: { type, limit, offset },
		});
		return response.data;
	}
	
	/**
	 * Add supply chain event
	 */
	async addEvent(
		productId: string,
		eventType: string,
		data: Record<string, unknown>,
		location?: { latitude: number; longitude: number; name?: string },
	): Promise<SupplyChainEvent> {
		const response = await this.client.post(`/products/${productId}/events`, {
			eventType,
			data,
			location,
			timestamp: Date.now(),
		});
		return response.data;
	}
	
	/**
	 * Get events for a product
	 */
	async getProductEvents(
		productId: string,
		limit: number = 100,
		offset: number = 0,
	): Promise<SupplyChainEvent[]> {
		const response = await this.client.get(`/products/${productId}/events`, {
			params: { limit, offset },
		});
		return response.data;
	}
	
	/**
	 * Get product traceability chain
	 */
	async getTraceability(productId: string): Promise<{
		product: ProductRecord;
		events: SupplyChainEvent[];
		certificates: ToolChainCertificate[];
	}> {
		const response = await this.client.get(`/products/${productId}/traceability`);
		return response.data;
	}
	
	/**
	 * Issue a certificate
	 */
	async issueCertificate(
		productId: string | null,
		type: string,
		data: Record<string, unknown>,
		validUntil?: number,
	): Promise<ToolChainCertificate> {
		const response = await this.client.post('/certificates', {
			productId,
			type,
			data,
			validUntil,
		});
		return response.data;
	}
	
	/**
	 * Get certificate by ID
	 */
	async getCertificate(certId: string): Promise<ToolChainCertificate | null> {
		try {
			const response = await this.client.get(`/certificates/${certId}`);
			return response.data;
		} catch {
			return null;
		}
	}
	
	/**
	 * Verify a certificate
	 */
	async verifyCertificate(certId: string): Promise<{
		valid: boolean;
		certificate?: ToolChainCertificate;
		errors?: string[];
	}> {
		const response = await this.client.get(`/certificates/${certId}/verify`);
		return response.data;
	}
	
	/**
	 * Revoke a certificate
	 */
	async revokeCertificate(certId: string, reason?: string): Promise<boolean> {
		try {
			await this.client.post(`/certificates/${certId}/revoke`, { reason });
			return true;
		} catch {
			return false;
		}
	}
	
	/**
	 * Get certificates for a product
	 */
	async getProductCertificates(productId: string): Promise<ToolChainCertificate[]> {
		const response = await this.client.get(`/products/${productId}/certificates`);
		return response.data;
	}
	
	/**
	 * Transfer product ownership
	 */
	async transferOwnership(
		productId: string,
		newOwner: string,
		data?: Record<string, unknown>,
	): Promise<{
		success: boolean;
		event?: SupplyChainEvent;
	}> {
		const response = await this.client.post(`/products/${productId}/transfer`, {
			newOwner,
			data,
		});
		return response.data;
	}
	
	/**
	 * Add quality check record
	 */
	async addQualityCheck(
		productId: string,
		checkType: string,
		result: 'pass' | 'fail' | 'warning',
		data: Record<string, unknown>,
	): Promise<SupplyChainEvent> {
		return this.addEvent(productId, 'quality_check', {
			checkType,
			result,
			...data,
		});
	}
	
	/**
	 * Get quality records for a product
	 */
	async getQualityRecords(productId: string): Promise<SupplyChainEvent[]> {
		const events = await this.getProductEvents(productId);
		return events.filter(e => e.eventType === 'quality_check');
	}
	
	/**
	 * Verify product authenticity
	 */
	async verifyAuthenticity(productId: string): Promise<{
		authentic: boolean;
		confidence: number;
		verificationData: Record<string, unknown>;
	}> {
		const response = await this.client.get(`/products/${productId}/authenticity`);
		return response.data;
	}
	
	/**
	 * Get app info
	 */
	async getAppInfo(): Promise<{
		appId: string;
		name: string;
		status: string;
		features: string[];
	} | null> {
		try {
			const response = await this.client.get('/app/info');
			return response.data;
		} catch {
			return null;
		}
	}
}

/**
 * Create ToolChain API client
 */
export function createToolChainApi(
	apiUrl: string,
	apiKey: string,
	appId: string,
	secret?: string,
): ToolChainApi {
	return new ToolChainApi(apiUrl, apiKey, appId, secret);
}

/**
 * Default ToolChain API endpoints
 */
export const TOOLCHAIN_ENDPOINTS = {
	mainnet: 'https://api.vechain.tools',
	testnet: 'https://api-testnet.vechain.tools',
};
