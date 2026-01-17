/**
 * VeChain Unit Converter Utility
 * 
 * VeChain uses the same unit system as Ethereum:
 * - 1 VET = 10^18 wei
 * - 1 VTHO = 10^18 wei
 * 
 * Common units:
 * - wei: smallest unit
 * - kwei: 10^3 wei
 * - mwei: 10^6 wei
 * - gwei: 10^9 wei
 * - ether/VET/VTHO: 10^18 wei
 */

/**
 * Unit multipliers
 */
const UNIT_MULTIPLIERS: Record<string, bigint> = {
	wei: BigInt(1),
	kwei: BigInt('1000'),
	mwei: BigInt('1000000'),
	gwei: BigInt('1000000000'),
	microvet: BigInt('1000000000000'),
	millivet: BigInt('1000000000000000'),
	vet: BigInt('1000000000000000000'),
	vtho: BigInt('1000000000000000000'),
	ether: BigInt('1000000000000000000'),
};

/**
 * Convert from one unit to another
 */
export function convertUnits(value: string | number | bigint, fromUnit: string, toUnit: string): string {
	const normalizedFrom = fromUnit.toLowerCase();
	const normalizedTo = toUnit.toLowerCase();
	
	const fromMultiplier = UNIT_MULTIPLIERS[normalizedFrom];
	const toMultiplier = UNIT_MULTIPLIERS[normalizedTo];
	
	if (!fromMultiplier) {
		throw new Error(`Unknown unit: ${fromUnit}`);
	}
	if (!toMultiplier) {
		throw new Error(`Unknown unit: ${toUnit}`);
	}
	
	// Convert to wei first
	let valueInWei: bigint;
	if (typeof value === 'string' && value.includes('.')) {
		// Handle decimal values
		const [whole, decimal] = value.split('.');
		const decimals = decimal.length;
		const combined = whole + decimal;
		valueInWei = BigInt(combined) * fromMultiplier / BigInt(10 ** decimals);
	} else {
		valueInWei = BigInt(value) * fromMultiplier;
	}
	
	// Convert from wei to target unit
	const result = valueInWei / toMultiplier;
	const remainder = valueInWei % toMultiplier;
	
	if (remainder === BigInt(0)) {
		return result.toString();
	}
	
	// Handle decimals for the result
	const decimalPlaces = 18;
	const multiplier = BigInt(10 ** decimalPlaces);
	const decimalPart = (remainder * multiplier) / toMultiplier;
	const decimalStr = decimalPart.toString().padStart(decimalPlaces, '0').replace(/0+$/, '');
	
	if (decimalStr === '') {
		return result.toString();
	}
	
	return `${result}.${decimalStr}`;
}

/**
 * Convert wei to VET
 */
export function weiToVet(wei: string | bigint): string {
	return convertUnits(wei, 'wei', 'vet');
}

/**
 * Convert VET to wei
 */
export function vetToWei(vet: string | number): string {
	return convertUnits(vet, 'vet', 'wei');
}

/**
 * Convert wei to VTHO
 */
export function weiToVtho(wei: string | bigint): string {
	return convertUnits(wei, 'wei', 'vtho');
}

/**
 * Convert VTHO to wei
 */
export function vthoToWei(vtho: string | number): string {
	return convertUnits(vtho, 'vtho', 'wei');
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: string | bigint, decimals: number): string {
	const amountBigInt = BigInt(amount);
	const divisor = BigInt(10 ** decimals);
	const wholePart = amountBigInt / divisor;
	const decimalPart = amountBigInt % divisor;
	
	if (decimalPart === BigInt(0)) {
		return wholePart.toString();
	}
	
	const decimalStr = decimalPart.toString().padStart(decimals, '0').replace(/0+$/, '');
	return `${wholePart}.${decimalStr}`;
}

/**
 * Parse token amount with decimals
 */
export function parseTokenAmount(amount: string | number, decimals: number): string {
	const amountStr = amount.toString();
	
	if (!amountStr.includes('.')) {
		return (BigInt(amountStr) * BigInt(10 ** decimals)).toString();
	}
	
	const [whole, decimal] = amountStr.split('.');
	const paddedDecimal = decimal.padEnd(decimals, '0').slice(0, decimals);
	const combined = whole + paddedDecimal;
	
	return BigInt(combined).toString();
}

/**
 * Format VET amount for display
 */
export function formatVet(wei: string | bigint, precision: number = 4): string {
	const vet = weiToVet(wei);
	if (!vet.includes('.')) {
		return vet + ' VET';
	}
	const [whole, decimal] = vet.split('.');
	return `${whole}.${decimal.slice(0, precision)} VET`;
}

/**
 * Format VTHO amount for display
 */
export function formatVtho(wei: string | bigint, precision: number = 4): string {
	const vtho = weiToVtho(wei);
	if (!vtho.includes('.')) {
		return vtho + ' VTHO';
	}
	const [whole, decimal] = vtho.split('.');
	return `${whole}.${decimal.slice(0, precision)} VTHO`;
}

/**
 * Add commas to large numbers for readability
 */
export function addCommas(value: string): string {
	const [whole, decimal] = value.split('.');
	const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return decimal ? `${withCommas}.${decimal}` : withCommas;
}
