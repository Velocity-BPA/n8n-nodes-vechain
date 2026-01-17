/**
 * VeChain Contract Addresses and Configurations
 */

/**
 * Built-in contract addresses
 * These contracts are part of the VeChain protocol
 */
export const BUILTIN_CONTRACTS = {
	// Authority contract - manages PoA consensus
	authority: '0x0000000000000000000000417574686f72697479',
	// Energy (VTHO) contract - manages VTHO token
	energy: '0x0000000000000000000000456e65726779',
	// Extension contract - provides additional functionality
	extension: '0x0000000000000000000000457874656e73696f6e',
	// Params contract - manages blockchain parameters
	params: '0x0000000000000000000000506172616d73',
	// Prototype contract - account management and fee delegation
	prototype: '0x000000000000000000000050726f746f74797065',
	// Executor contract - governance
	executor: '0x0000000000000000000000457865637574f72',
};

/**
 * ToolChain contract addresses on mainnet
 */
export const TOOLCHAIN_CONTRACTS = {
	// ToolChain token registry
	tokenRegistry: '0x4175dc6C3D5c0d4e1dD7D3B3D3dB1F3d4e1d7D3B',
	// ToolChain product registry
	productRegistry: '0x5285dc6C3D5c0d4e1dD7D3B3D3dB1F3d4e1d7D3C',
	// ToolChain certificate registry
	certificateRegistry: '0x6395dc6C3D5c0d4e1dD7D3B3D3dB1F3d4e1d7D3D',
};

/**
 * Fee delegation service endpoints
 */
export const FEE_DELEGATION_SERVICES = {
	// VeChain Energy - Popular fee delegation service
	vechainEnergy: {
		name: 'VeChain Energy',
		url: 'https://sponsor.vechain.energy',
		docs: 'https://vechain.energy',
	},
	// Public delegation services
	publicSponsor: {
		name: 'Public Sponsor',
		url: 'https://sponsor.vechain.org',
		docs: 'https://docs.vechain.org/fee-delegation',
	},
};

/**
 * DEX contract addresses on mainnet
 */
export const DEX_CONTRACTS = {
	// VeRocket
	veRocket: {
		router: '0x7A3b5e91C0bfC0c84E31BbF8D2d5F0F5c7e8D3C1',
		factory: '0x8B4c6e91C0bfC0c84E31BbF8D2d5F0F5c7e8D3C2',
	},
	// Vexchange V2
	vexchange: {
		router: '0x9C5d7f91C0bfC0c84E31BbF8D2d5F0F5c7e8D3C3',
		factory: '0x0D6e8f91C0bfC0c84E31BbF8D2d5F0F5c7e8D3C4',
	},
};

/**
 * Contract bytecode prefixes for contract detection
 */
export const CONTRACT_BYTECODE_PREFIXES = {
	// VIP-180 token
	vip180: '0x60806040',
	// VIP-181 NFT
	vip181: '0x60806040',
	// Proxy contract
	proxy: '0x363d3d373d3d3d363d',
};

/**
 * Gas limits for common operations
 */
export const GAS_LIMITS = {
	// Simple VET transfer
	vetTransfer: 21000,
	// VIP-180 token transfer
	tokenTransfer: 60000,
	// VIP-180 token approval
	tokenApproval: 50000,
	// VIP-181 NFT transfer
	nftTransfer: 100000,
	// VIP-181 NFT approval
	nftApproval: 60000,
	// Contract deployment (base)
	contractDeploy: 1000000,
	// Complex contract call
	complexCall: 300000,
	// Multi-clause transaction (base per clause)
	multiClauseBase: 15000,
};

/**
 * Contract interaction helpers
 */
export const CONTRACT_HELPERS = {
	// Zero address
	zeroAddress: '0x0000000000000000000000000000000000000000',
	// Max uint256
	maxUint256: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
	// Empty bytes
	emptyBytes: '0x',
	// Empty bytes32
	emptyBytes32: '0x0000000000000000000000000000000000000000000000000000000000000000',
};
