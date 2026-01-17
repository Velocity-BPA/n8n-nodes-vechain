/**
 * VeChain Network Configurations
 * 
 * VeChain operates on multiple networks:
 * - Mainnet: Production network with real value
 * - Testnet: Testing network with test tokens
 * - Solo: Local development node
 */

export interface NetworkConfig {
	name: string;
	chainTag: number;
	genesisId: string;
	nodeUrls: string[];
	explorerUrl: string;
	faucetUrl?: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
	mainnet: {
		name: 'VeChain Mainnet',
		chainTag: 0x4a,  // 74 in decimal
		genesisId: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
		nodeUrls: [
			'https://mainnet.veblocks.net',
			'https://mainnet.vechain.org',
			'https://sync-mainnet.vechain.org',
			'https://vethor-node.vechain.com',
		],
		explorerUrl: 'https://explore.vechain.org',
	},
	testnet: {
		name: 'VeChain Testnet',
		chainTag: 0x27,  // 39 in decimal
		genesisId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
		nodeUrls: [
			'https://testnet.veblocks.net',
			'https://testnet.vechain.org',
			'https://sync-testnet.vechain.org',
		],
		explorerUrl: 'https://explore-testnet.vechain.org',
		faucetUrl: 'https://faucet.vecha.in',
	},
	solo: {
		name: 'Thor Solo (Local)',
		chainTag: 0xf6,  // 246 in decimal
		genesisId: '0x00000000c05a20fbca2bf6ae3affba6af4a74b800b585bf7a4988aba7aea69f6',
		nodeUrls: [
			'http://localhost:8669',
			'http://127.0.0.1:8669',
		],
		explorerUrl: 'http://localhost:8080',
	},
};

/**
 * Get node URL for a network
 */
export function getNodeUrl(network: string, customUrl?: string): string {
	if (network === 'custom' && customUrl) {
		return customUrl;
	}
	const config = NETWORKS[network];
	if (!config) {
		throw new Error(`Unknown network: ${network}`);
	}
	return config.nodeUrls[0];
}

/**
 * Get chain tag for a network
 */
export function getChainTag(network: string): number {
	const config = NETWORKS[network];
	if (!config) {
		throw new Error(`Unknown network: ${network}`);
	}
	return config.chainTag;
}

/**
 * Get genesis ID for a network
 */
export function getGenesisId(network: string): string {
	const config = NETWORKS[network];
	if (!config) {
		throw new Error(`Unknown network: ${network}`);
	}
	return config.genesisId;
}

/**
 * Block time in VeChain (approximately 10 seconds)
 */
export const BLOCK_TIME_MS = 10000;

/**
 * VTHO generation rate
 * 1 VET generates 0.000432 VTHO per day
 * This equals 5e-9 VTHO per second per VET
 */
export const VTHO_GENERATION_RATE = 5e-9;

/**
 * Gas price coefficient (used for priority)
 * Default is 0, max is 255
 */
export const DEFAULT_GAS_PRICE_COEF = 0;

/**
 * Default gas limit for simple VET transfer
 */
export const DEFAULT_VET_TRANSFER_GAS = 21000;

/**
 * Default gas limit for VTHO transfer (VIP-180 token transfer)
 */
export const DEFAULT_TOKEN_TRANSFER_GAS = 60000;

/**
 * Authority masternode count on mainnet
 */
export const AUTHORITY_MASTERNODE_COUNT = 101;
