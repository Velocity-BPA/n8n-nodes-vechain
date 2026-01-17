/**
 * VeChain Authority (PoA 2.0) Constants
 * 
 * VeChain uses Proof of Authority (PoA) consensus where selected
 * Authority Masternodes produce blocks. This provides:
 * - High throughput (10,000+ TPS)
 * - Fast finality (~20 seconds)
 * - Low energy consumption
 * - Enterprise-grade reliability
 */

/**
 * Authority Masternode configuration
 */
export const AUTHORITY_CONFIG = {
	// Total number of authority masternodes on mainnet
	totalMasternodes: 101,
	// Minimum endorsors required
	minEndorsors: 2,
	// Block production interval (ms)
	blockInterval: 10000,
	// Rounds per epoch
	roundsPerEpoch: 101,
	// Blocks per round
	blocksPerRound: 10,
};

/**
 * PoA 2.0 Finality configuration
 * VeChain uses a two-phase commit mechanism for finality
 */
export const FINALITY_CONFIG = {
	// Blocks required for finality
	blocksToFinality: 12,
	// Time to finality (approximately)
	timeToFinalityMs: 120000,
	// BFT threshold
	bftThreshold: 67, // 2/3 + 1 of nodes
};

/**
 * Endorsement requirements
 */
export const ENDORSEMENT_CONFIG = {
	// Minimum VET required to endorse a masternode
	minEndorsementVet: '25000000', // 25 million VET
	// Minimum endorsors per masternode
	minEndorsors: 2,
	// Maximum endorsors per masternode
	maxEndorsors: 100,
};

/**
 * Known authority masternode addresses (partial list for reference)
 * These are public addresses of some authority masternodes
 */
export const KNOWN_AUTHORITY_NODES: { name: string; address: string; identity: string }[] = [
	{
		name: 'Foundation Node 1',
		address: '0x...',
		identity: 'vechain-foundation-1',
	},
	// Add more known nodes here
];

/**
 * Block signer selection algorithm parameters
 */
export const SIGNER_SELECTION = {
	// Random seed source
	randomSeedBlocks: 10,
	// Selection window
	selectionWindow: 5,
};

/**
 * Rewards configuration
 * Note: VeChain doesn't have block rewards for masternodes in the traditional sense
 * VTHO is generated from VET holdings
 */
export const REWARDS_CONFIG = {
	// Transaction fee distribution
	transactionFeeBurn: 70, // 70% of VTHO is burned
	transactionFeeReward: 30, // 30% goes to masternode
};

/**
 * Authority events
 */
export const AUTHORITY_EVENTS = {
	// Candidate added
	candidateAdded: 'CandidateAdded',
	// Candidate removed
	candidateRemoved: 'CandidateRemoved',
	// Endorsor added
	endorsorAdded: 'EndorsorAdded',
	// Endorsor removed
	endorsorRemoved: 'EndorsorRemoved',
	// Master changed
	masterChanged: 'MasterChanged',
};
