/**
 * VeChain Certificate Utilities
 * 
 * Certificates in VeChain are used for:
 * - Identity verification
 * - DApp authentication
 * - Proving ownership without sending transactions
 * - Supply chain certifications
 * 
 * Certificate structure follows VIP-192 standard
 */

import { ethers } from 'ethers';

/**
 * Certificate purpose types
 */
export enum CertificatePurpose {
	IDENTIFICATION = 'identification',
	AGREEMENT = 'agreement',
}

/**
 * Certificate payload structure
 */
export interface CertificatePayload {
	purpose: CertificatePurpose;
	payload: {
		type: string;
		content: string;
	};
}

/**
 * Signed certificate structure
 */
export interface Certificate {
	purpose: CertificatePurpose;
	payload: {
		type: string;
		content: string;
	};
	domain: string;
	timestamp: number;
	signer: string;
	signature?: string;
}

/**
 * Create a certificate for signing
 */
export function createCertificate(
	purpose: CertificatePurpose,
	payloadType: string,
	content: string,
	domain: string,
	signer: string,
): Certificate {
	return {
		purpose,
		payload: {
			type: payloadType,
			content,
		},
		domain,
		timestamp: Math.floor(Date.now() / 1000),
		signer,
	};
}

/**
 * Encode certificate for signing
 */
export function encodeCertificate(cert: Certificate): string {
	const message = {
		purpose: cert.purpose,
		payload: cert.payload,
		domain: cert.domain,
		timestamp: cert.timestamp,
		signer: cert.signer,
	};
	return JSON.stringify(message);
}

/**
 * Hash certificate message
 */
export function hashCertificate(cert: Certificate): string {
	const encoded = encodeCertificate(cert);
	return ethers.keccak256(ethers.toUtf8Bytes(encoded));
}

/**
 * Sign certificate with private key
 */
export async function signCertificate(
	cert: Certificate,
	privateKey: string,
): Promise<Certificate> {
	const hash = hashCertificate(cert);
	const wallet = new ethers.Wallet(privateKey);
	const signature = await wallet.signMessage(ethers.getBytes(hash));
	
	return {
		...cert,
		signature,
	};
}

/**
 * Verify certificate signature
 */
export function verifyCertificate(cert: Certificate): {
	valid: boolean;
	recoveredAddress?: string;
	error?: string;
} {
	if (!cert.signature) {
		return { valid: false, error: 'No signature found' };
	}
	
	try {
		const hash = hashCertificate(cert);
		const recoveredAddress = ethers.verifyMessage(ethers.getBytes(hash), cert.signature);
		
		if (recoveredAddress.toLowerCase() !== cert.signer.toLowerCase()) {
			return {
				valid: false,
				recoveredAddress,
				error: 'Signature does not match signer',
			};
		}
		
		return { valid: true, recoveredAddress };
	} catch (error) {
		return { valid: false, error: `Verification failed: ${error}` };
	}
}

/**
 * Check if certificate is expired
 */
export function isCertificateExpired(
	cert: Certificate,
	maxAgeSeconds: number = 300,
): boolean {
	const now = Math.floor(Date.now() / 1000);
	return now - cert.timestamp > maxAgeSeconds;
}

/**
 * Create identification certificate
 */
export function createIdentificationCertificate(
	domain: string,
	signer: string,
	customContent?: string,
): Certificate {
	return createCertificate(
		CertificatePurpose.IDENTIFICATION,
		'text',
		customContent || `Identification for ${domain}`,
		domain,
		signer,
	);
}

/**
 * Create agreement certificate
 */
export function createAgreementCertificate(
	domain: string,
	signer: string,
	agreementContent: string,
): Certificate {
	return createCertificate(
		CertificatePurpose.AGREEMENT,
		'text',
		agreementContent,
		domain,
		signer,
	);
}

/**
 * Supply chain certificate payload
 */
export interface SupplyChainCertPayload {
	productId: string;
	certType: 'origin' | 'quality' | 'authenticity' | 'custom';
	issuer: string;
	data: Record<string, unknown>;
	validUntil?: number;
}

/**
 * Create supply chain certificate content
 */
export function createSupplyChainCertContent(
	payload: SupplyChainCertPayload,
): string {
	return JSON.stringify(payload);
}

/**
 * Parse supply chain certificate content
 */
export function parseSupplyChainCertContent(
	content: string,
): SupplyChainCertPayload | null {
	try {
		return JSON.parse(content) as SupplyChainCertPayload;
	} catch {
		return null;
	}
}

/**
 * Validate supply chain certificate
 */
export function validateSupplyChainCert(
	cert: Certificate,
): { valid: boolean; payload?: SupplyChainCertPayload; errors: string[] } {
	const errors: string[] = [];
	
	// Verify signature
	const signatureResult = verifyCertificate(cert);
	if (!signatureResult.valid) {
		errors.push(signatureResult.error || 'Invalid signature');
	}
	
	// Parse payload
	const payload = parseSupplyChainCertContent(cert.payload.content);
	if (!payload) {
		errors.push('Invalid payload format');
		return { valid: false, errors };
	}
	
	// Check expiration
	if (payload.validUntil && payload.validUntil < Date.now() / 1000) {
		errors.push('Certificate has expired');
	}
	
	return {
		valid: errors.length === 0,
		payload,
		errors,
	};
}
