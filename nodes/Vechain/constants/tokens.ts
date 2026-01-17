/**
 * VeChain Token Configurations
 * 
 * VeChain's Dual Token Model:
 * - VET (VeChain Token): Main value token, generates VTHO
 * - VTHO (VeThor Token): Energy/gas token, used to pay for transactions
 * 
 * Token Standards:
 * - VIP-180: Fungible token standard (similar to ERC-20)
 * - VIP-181: Non-fungible token standard (similar to ERC-721)
 */

export interface TokenInfo {
	name: string;
	symbol: string;
	decimals: number;
	address: string;
	type: 'native' | 'vip180' | 'vip181';
}

/**
 * Native tokens
 */
export const NATIVE_TOKENS: Record<string, TokenInfo> = {
	VET: {
		name: 'VeChain',
		symbol: 'VET',
		decimals: 18,
		address: '0x0000000000000000000000000000000000000000',
		type: 'native',
	},
	VTHO: {
		name: 'VeThor',
		symbol: 'VTHO',
		decimals: 18,
		address: '0x0000000000000000000000456e65726779',
		type: 'native',
	},
};

/**
 * VTHO Energy Contract Address
 * This is the built-in contract that manages VTHO
 */
export const VTHO_CONTRACT_ADDRESS = '0x0000000000000000000000000000456e65726779';

/**
 * Common VIP-180 tokens on mainnet
 * These are the most commonly used fungible tokens
 */
export const COMMON_VIP180_TOKENS: Record<string, TokenInfo> = {
	// VeChain Official Tokens
	VTHO: {
		name: 'VeThor',
		symbol: 'VTHO',
		decimals: 18,
		address: '0x0000000000000000000000000000456e65726779',
		type: 'vip180',
	},
	// VeUSD Stablecoin
	VEUSD: {
		name: 'VeUSD',
		symbol: 'VEUSD',
		decimals: 18,
		address: '0x0CE6661b4ba86a0EA7cA2Bd86a0De87b0B860F14',
		type: 'vip180',
	},
	// VeBank
	VB: {
		name: 'VeBank',
		symbol: 'VB',
		decimals: 18,
		address: '0x25D9C4C40d0F8FB58dA9A7e74D86Dcf2C4f39c80',
		type: 'vip180',
	},
	// SHA (Safe Haven)
	SHA: {
		name: 'Safe Haven',
		symbol: 'SHA',
		decimals: 18,
		address: '0x5db3C8A942333f6468176a870dB36eEf120a34DC',
		type: 'vip180',
	},
	// DBET (DecentBet)
	DBET: {
		name: 'DecentBet',
		symbol: 'DBET',
		decimals: 18,
		address: '0x1b8EC6C2A45ccA481Da6F243Df0d7A5744aFc1f8',
		type: 'vip180',
	},
	// PLA (PlayTable)
	PLA: {
		name: 'PlayTable',
		symbol: 'PLA',
		decimals: 18,
		address: '0x89827F7bB951Fd8A56f8eF13C5bFEE38522F2E1F',
		type: 'vip180',
	},
	// HAI (HackenAI)
	HAI: {
		name: 'HackenAI',
		symbol: 'HAI',
		decimals: 8,
		address: '0xAcC280010B2eE0efc770BCE34774376656D8ce14',
		type: 'vip180',
	},
	// OCE (OceanEx Token)
	OCE: {
		name: 'OceanEx Token',
		symbol: 'OCE',
		decimals: 18,
		address: '0x0CE6661b4ba86a0EA7cA2Bd86a0De87b0B860F14',
		type: 'vip180',
	},
	// JUR
	JUR: {
		name: 'Jur Token',
		symbol: 'JUR',
		decimals: 18,
		address: '0x46209D5e5a49C1D403F4Ee3a0A88c3a27E29E58D',
		type: 'vip180',
	},
	// YEET (Yeet Token)
	YEET: {
		name: 'Yeet Token',
		symbol: 'YEET',
		decimals: 18,
		address: '0xAE4C53b120cba91a44832f875107cbc8FBee185C',
		type: 'vip180',
	},
	// WoV (World of V)
	WOV: {
		name: 'World of V',
		symbol: 'WOV',
		decimals: 18,
		address: '0x170F4BA8e7ACF6510f55dB26047C83D13498AF8A',
		type: 'vip180',
	},
	// VPU (VPunks Token)
	VPU: {
		name: 'VPunks Token',
		symbol: 'VPU',
		decimals: 18,
		address: '0x9Eb12Ed75a991D8239A326c6BDB7E4930FA8F900',
		type: 'vip180',
	},
	// MVG (Mad Viking Games)
	MVG: {
		name: 'Mad Viking Games',
		symbol: 'MVG',
		decimals: 18,
		address: '0x99763494A7B5A6B36396dD97D57B9ee5D2C8497A',
		type: 'vip180',
	},
};

/**
 * Common VIP-181 NFT collections on mainnet
 */
export const COMMON_VIP181_COLLECTIONS: Record<string, { name: string; address: string }> = {
	// World of V NFTs
	WoV: {
		name: 'World of V',
		address: '0x5E6265680087520DC022d75f4C45F9CCD712BA97',
	},
	// VPunks
	VPunks: {
		name: 'VPunks',
		address: '0xa4081c45C4a30F6e6a5F1Ea83a0b58Ea8A9c7d3e',
	},
	// MadVikings
	MadVikings: {
		name: 'Mad Vikings Genesis',
		address: '0xC11f09dF6CC13E53f6C66E7440d85B13D9234c7b',
	},
	// VeKings
	VeKings: {
		name: 'VeKings',
		address: '0x8Be4E8Fe4e84Af0f7c9E12A13F3FE4a1e8E1b8E1',
	},
};

/**
 * Token decimals helper
 */
export const TOKEN_DECIMALS = {
	VET: 18,
	VTHO: 18,
	DEFAULT_VIP180: 18,
};

/**
 * Wei conversion constants
 * 1 VET = 10^18 wei
 * 1 VTHO = 10^18 wei
 */
export const WEI_PER_VET = BigInt('1000000000000000000');
export const WEI_PER_VTHO = BigInt('1000000000000000000');
