/**
 * VeChain Standard ABIs
 * 
 * Contains ABIs for:
 * - VIP-180 (Fungible Token Standard)
 * - VIP-181 (Non-Fungible Token Standard)
 * - Built-in contracts (Energy, Authority, etc.)
 */

/**
 * VIP-180 Token Standard ABI (Fungible Token - similar to ERC-20)
 */
export const VIP180_ABI = [
	// Read Functions
	{
		constant: true,
		inputs: [],
		name: 'name',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'symbol',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'decimals',
		outputs: [{ name: '', type: 'uint8' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'totalSupply',
		outputs: [{ name: '', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'owner', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: 'balance', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{ name: 'owner', type: 'address' },
			{ name: 'spender', type: 'address' },
		],
		name: 'allowance',
		outputs: [{ name: 'remaining', type: 'uint256' }],
		type: 'function',
	},
	// Write Functions
	{
		constant: false,
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'value', type: 'uint256' },
		],
		name: 'transfer',
		outputs: [{ name: 'success', type: 'bool' }],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'spender', type: 'address' },
			{ name: 'value', type: 'uint256' },
		],
		name: 'approve',
		outputs: [{ name: 'success', type: 'bool' }],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'value', type: 'uint256' },
		],
		name: 'transferFrom',
		outputs: [{ name: 'success', type: 'bool' }],
		type: 'function',
	},
	// Events
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'from', type: 'address' },
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: false, name: 'value', type: 'uint256' },
		],
		name: 'Transfer',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'owner', type: 'address' },
			{ indexed: true, name: 'spender', type: 'address' },
			{ indexed: false, name: 'value', type: 'uint256' },
		],
		name: 'Approval',
		type: 'event',
	},
];

/**
 * VIP-181 NFT Standard ABI (Non-Fungible Token - similar to ERC-721)
 */
export const VIP181_ABI = [
	// Read Functions
	{
		constant: true,
		inputs: [],
		name: 'name',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'symbol',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'totalSupply',
		outputs: [{ name: '', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'tokenId', type: 'uint256' }],
		name: 'tokenURI',
		outputs: [{ name: '', type: 'string' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'owner', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: 'balance', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'tokenId', type: 'uint256' }],
		name: 'ownerOf',
		outputs: [{ name: 'owner', type: 'address' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'tokenId', type: 'uint256' }],
		name: 'getApproved',
		outputs: [{ name: 'operator', type: 'address' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{ name: 'owner', type: 'address' },
			{ name: 'operator', type: 'address' },
		],
		name: 'isApprovedForAll',
		outputs: [{ name: '', type: 'bool' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{ name: 'owner', type: 'address' },
			{ name: 'index', type: 'uint256' },
		],
		name: 'tokenOfOwnerByIndex',
		outputs: [{ name: 'tokenId', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'index', type: 'uint256' }],
		name: 'tokenByIndex',
		outputs: [{ name: 'tokenId', type: 'uint256' }],
		type: 'function',
	},
	// Write Functions
	{
		constant: false,
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'tokenId', type: 'uint256' },
		],
		name: 'approve',
		outputs: [],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'operator', type: 'address' },
			{ name: 'approved', type: 'bool' },
		],
		name: 'setApprovalForAll',
		outputs: [],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'tokenId', type: 'uint256' },
		],
		name: 'transferFrom',
		outputs: [],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'tokenId', type: 'uint256' },
		],
		name: 'safeTransferFrom',
		outputs: [],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'tokenId', type: 'uint256' },
			{ name: 'data', type: 'bytes' },
		],
		name: 'safeTransferFrom',
		outputs: [],
		type: 'function',
	},
	// Events
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'from', type: 'address' },
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: true, name: 'tokenId', type: 'uint256' },
		],
		name: 'Transfer',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'owner', type: 'address' },
			{ indexed: true, name: 'approved', type: 'address' },
			{ indexed: true, name: 'tokenId', type: 'uint256' },
		],
		name: 'Approval',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'owner', type: 'address' },
			{ indexed: true, name: 'operator', type: 'address' },
			{ indexed: false, name: 'approved', type: 'bool' },
		],
		name: 'ApprovalForAll',
		type: 'event',
	},
];

/**
 * Energy (VTHO) Contract ABI
 */
export const ENERGY_ABI = [
	{
		constant: true,
		inputs: [{ name: 'owner', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: 'balance', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'totalSupply',
		outputs: [{ name: '', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'totalBurned',
		outputs: [{ name: '', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'value', type: 'uint256' },
		],
		name: 'transfer',
		outputs: [{ name: 'success', type: 'bool' }],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'spender', type: 'address' },
			{ name: 'value', type: 'uint256' },
		],
		name: 'approve',
		outputs: [{ name: 'success', type: 'bool' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{ name: 'owner', type: 'address' },
			{ name: 'spender', type: 'address' },
		],
		name: 'allowance',
		outputs: [{ name: 'remaining', type: 'uint256' }],
		type: 'function',
	},
];

/**
 * Authority Contract ABI
 */
export const AUTHORITY_ABI = [
	{
		constant: true,
		inputs: [],
		name: 'first',
		outputs: [{ name: '', type: 'address' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'nodeMaster', type: 'address' }],
		name: 'next',
		outputs: [{ name: '', type: 'address' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'nodeMaster', type: 'address' }],
		name: 'get',
		outputs: [
			{ name: 'listed', type: 'bool' },
			{ name: 'endorsor', type: 'address' },
			{ name: 'identity', type: 'bytes32' },
			{ name: 'active', type: 'bool' },
		],
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'executor',
		outputs: [{ name: '', type: 'address' }],
		type: 'function',
	},
];

/**
 * Prototype Contract ABI (Account management)
 */
export const PROTOTYPE_ABI = [
	{
		constant: true,
		inputs: [{ name: 'self', type: 'address' }],
		name: 'master',
		outputs: [{ name: '', type: 'address' }],
		type: 'function',
	},
	{
		constant: false,
		inputs: [{ name: 'newMaster', type: 'address' }],
		name: 'setMaster',
		outputs: [],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'self', type: 'address' }],
		name: 'balance',
		outputs: [
			{ name: '', type: 'uint256' },
			{ name: '', type: 'uint256' },
		],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'self', type: 'address' }],
		name: 'energy',
		outputs: [{ name: '', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{ name: 'self', type: 'address' },
			{ name: 'user', type: 'address' },
		],
		name: 'isUser',
		outputs: [{ name: '', type: 'bool' }],
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{ name: 'self', type: 'address' },
			{ name: 'user', type: 'address' },
		],
		name: 'userCredit',
		outputs: [{ name: '', type: 'uint256' }],
		type: 'function',
	},
	{
		constant: false,
		inputs: [{ name: 'user', type: 'address' }],
		name: 'addUser',
		outputs: [],
		type: 'function',
	},
	{
		constant: false,
		inputs: [{ name: 'user', type: 'address' }],
		name: 'removeUser',
		outputs: [],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'self', type: 'address' }],
		name: 'creditPlan',
		outputs: [
			{ name: 'credit', type: 'uint256' },
			{ name: 'recoveryRate', type: 'uint256' },
		],
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{ name: 'credit', type: 'uint256' },
			{ name: 'recoveryRate', type: 'uint256' },
		],
		name: 'setCreditPlan',
		outputs: [],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'self', type: 'address' }],
		name: 'sponsor',
		outputs: [
			{ name: '', type: 'bool' },
			{ name: '', type: 'address' },
		],
		type: 'function',
	},
	{
		constant: false,
		inputs: [],
		name: 'sponsor',
		outputs: [],
		type: 'function',
	},
	{
		constant: false,
		inputs: [],
		name: 'unsponsor',
		outputs: [],
		type: 'function',
	},
	{
		constant: false,
		inputs: [{ name: 'yesOrNo', type: 'bool' }],
		name: 'selectSponsor',
		outputs: [],
		type: 'function',
	},
	{
		constant: true,
		inputs: [{ name: 'self', type: 'address' }],
		name: 'currentSponsor',
		outputs: [{ name: '', type: 'address' }],
		type: 'function',
	},
];

/**
 * Event signatures for filtering
 */
export const EVENT_SIGNATURES = {
	// VIP-180 Transfer event
	Transfer: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
	// VIP-180 Approval event
	Approval: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
	// VIP-181 ApprovalForAll event
	ApprovalForAll: '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
};

/**
 * Function selectors for common operations
 */
export const FUNCTION_SELECTORS = {
	// VIP-180
	transfer: '0xa9059cbb',
	approve: '0x095ea7b3',
	transferFrom: '0x23b872dd',
	balanceOf: '0x70a08231',
	allowance: '0xdd62ed3e',
	// VIP-181
	ownerOf: '0x6352211e',
	safeTransferFrom: '0x42842e0e',
	tokenURI: '0xc87b56dd',
};
