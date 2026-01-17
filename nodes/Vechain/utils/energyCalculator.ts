/**
 * VeChain Energy (VTHO) Calculator Utility
 * 
 * VeChain's dual-token model means VET generates VTHO over time:
 * - VTHO is used to pay for transaction fees (gas)
 * - 1 VET generates 0.000432 VTHO per day
 * - This equals 5e-9 VTHO per second per VET
 * 
 * VTHO Generation Formula:
 * vtho = vet * 5e-9 * seconds
 */

/**
 * VTHO generation rate per VET per second
 * 5e-9 VTHO per second = 0.000432 VTHO per day
 */
export const VTHO_GENERATION_RATE_PER_SECOND = 5e-9;
export const VTHO_PER_VET_PER_SECOND = VTHO_GENERATION_RATE_PER_SECOND; // alias

/**
 * VTHO generation rate per VET per day
 */
export const VTHO_GENERATION_RATE_PER_DAY = 0.000432;

/**
 * Seconds in a day
 */
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_YEAR = 365.25 * SECONDS_PER_DAY;

/**
 * Calculate VTHO generated from VET holdings over time
 */
export function calculateVthoGenerated(
	vetAmount: string | number | bigint,
	seconds: number,
): string {
	const vetBigInt = BigInt(vetAmount.toString());
	// Use high precision calculation
	// vtho = vet * 5e-9 * seconds
	// To avoid floating point, multiply by 1e18 first, then divide
	const vthoWei = (vetBigInt * BigInt(Math.floor(seconds * 5))) / BigInt(1e9);
	return vthoWei.toString();
}

/**
 * Calculate VTHO generated per day
 */
export function calculateVthoPerDay(vetAmount: string | number | bigint): string {
	return calculateVthoGenerated(vetAmount, SECONDS_PER_DAY);
}

/**
 * Calculate VTHO generated per hour
 */
export function calculateVthoPerHour(vetAmount: string | number | bigint): string {
	return calculateVthoGenerated(vetAmount, SECONDS_PER_HOUR);
}

/**
 * Calculate VTHO generated per year
 */
export function calculateVthoPerYear(vetAmount: string | number | bigint): string {
	return calculateVthoGenerated(vetAmount, SECONDS_PER_YEAR);
}

/**
 * Calculate time required to generate a specific amount of VTHO
 */
export function calculateTimeToGenerateVtho(
	vetAmount: string | number | bigint,
	targetVtho: string | number | bigint,
): { seconds: number; formatted: string } {
	const vet = Number(vetAmount);
	const vtho = Number(targetVtho);
	
	if (vet <= 0) {
		return { seconds: Infinity, formatted: 'Infinite (no VET holdings)' };
	}
	
	// time = vtho / (vet * rate)
	const seconds = vtho / (vet * VTHO_GENERATION_RATE_PER_SECOND);
	
	return {
		seconds,
		formatted: formatDuration(seconds),
	};
}

/**
 * Estimate transaction cost in VTHO
 */
export function estimateTransactionCost(
	gasUsed: number,
	gasPriceCoef: number = 0,
): string {
	// Base gas price in VTHO (1e15 wei per gas unit)
	const baseGasPrice = BigInt('1000000000000000');
	// Apply gas price coefficient (0-255)
	const multiplier = BigInt(128 + gasPriceCoef);
	const adjustedGasPrice = (baseGasPrice * multiplier) / BigInt(128);
	const cost = adjustedGasPrice * BigInt(gasUsed);
	return cost.toString();
}

/**
 * Calculate VET needed to generate target VTHO over time
 */
export function calculateVetNeededForVtho(
	targetVthoPerDay: string | number,
): string {
	// VET = VTHO_per_day / 0.000432
	const vtho = Number(targetVthoPerDay);
	const vet = vtho / VTHO_GENERATION_RATE_PER_DAY;
	return Math.ceil(vet).toString();
}

/**
 * Calculate effective APY from VTHO generation
 * This depends on the VET/VTHO price ratio
 */
export function calculateEffectiveApy(
	vetPriceUsd: number,
	vthoPriceUsd: number,
): number {
	// VTHO generated per VET per year
	const vthoPerYear = VTHO_GENERATION_RATE_PER_DAY * 365.25;
	// Value of VTHO generated
	const valueGenerated = vthoPerYear * vthoPriceUsd;
	// APY = value generated / VET price
	const apy = (valueGenerated / vetPriceUsd) * 100;
	return apy;
}

/**
 * Format duration in human-readable format
 */
function formatDuration(seconds: number): string {
	if (!isFinite(seconds)) {
		return 'Infinite';
	}
	
	if (seconds < 60) {
		return `${Math.round(seconds)} seconds`;
	}
	
	if (seconds < 3600) {
		const minutes = Math.round(seconds / 60);
		return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
	}
	
	if (seconds < SECONDS_PER_DAY) {
		const hours = Math.round(seconds / 3600);
		return `${hours} hour${hours !== 1 ? 's' : ''}`;
	}
	
	if (seconds < SECONDS_PER_DAY * 30) {
		const days = Math.round(seconds / SECONDS_PER_DAY);
		return `${days} day${days !== 1 ? 's' : ''}`;
	}
	
	if (seconds < SECONDS_PER_YEAR) {
		const months = Math.round(seconds / (SECONDS_PER_DAY * 30));
		return `${months} month${months !== 1 ? 's' : ''}`;
	}
	
	const years = (seconds / SECONDS_PER_YEAR).toFixed(1);
	return `${years} years`;
}

/**
 * Get current VTHO balance including generated amount
 */
export function getCurrentVthoBalance(
	baseVthoBalance: string | bigint,
	vetBalance: string | bigint,
	lastBlockTimestamp: number,
	currentTimestamp: number = Date.now() / 1000,
): string {
	const secondsElapsed = currentTimestamp - lastBlockTimestamp;
	const generated = calculateVthoGenerated(vetBalance, secondsElapsed);
	const total = BigInt(baseVthoBalance) + BigInt(generated);
	return total.toString();
}
