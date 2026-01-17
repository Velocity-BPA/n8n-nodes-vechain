/**
 * Utility Operations
 *
 * Helper operations:
 * - Unit conversion (VET/VTHO/wei)
 * - Address validation and generation
 * - Message signing and verification
 * - ABI encoding/decoding
 * - Block reference utilities
 *
 * @author Velocity BPA
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createThorClient } from '../../transport/thorClient';
import { weiToVet, vetToWei, weiToVtho, vthoToWei } from '../../utils/unitConverter';
import { secp256k1, address, keccak256, blake2b256, mnemonic } from 'thor-devkit';

export const utilityProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Convert VET Units',
				value: 'convertVet',
				description: 'Convert between VET and wei',
				action: 'Convert VET units',
			},
			{
				name: 'Convert VTHO Units',
				value: 'convertVtho',
				description: 'Convert between VTHO and wei',
				action: 'Convert VTHO units',
			},
			{
				name: 'Validate Address',
				value: 'validateAddress',
				description: 'Check if address is valid',
				action: 'Validate address',
			},
			{
				name: 'Generate Keypair',
				value: 'generateKeypair',
				description: 'Generate new private key and address',
				action: 'Generate keypair',
			},
			{
				name: 'Generate from Mnemonic',
				value: 'generateFromMnemonic',
				description: 'Derive address from mnemonic phrase',
				action: 'Generate from mnemonic',
			},
			{
				name: 'Get Address from Private Key',
				value: 'getAddressFromKey',
				description: 'Derive address from private key',
				action: 'Get address from key',
			},
			{
				name: 'Sign Message',
				value: 'signMessage',
				description: 'Sign a message with private key',
				action: 'Sign message',
			},
			{
				name: 'Verify Signature',
				value: 'verifySignature',
				description: 'Verify message signature',
				action: 'Verify signature',
			},
			{
				name: 'Hash Data',
				value: 'hashData',
				description: 'Compute hash of data (keccak256/blake2b256)',
				action: 'Hash data',
			},
			{
				name: 'Get Block Ref',
				value: 'getBlockRef',
				description: 'Get block reference for transactions',
				action: 'Get block ref',
			},
			{
				name: 'Get Network Info',
				value: 'getNetworkInfo',
				description: 'Get current network information',
				action: 'Get network info',
			},
			{
				name: 'Calculate VTHO Cost',
				value: 'calculateVthoCost',
				description: 'Calculate VTHO cost for gas',
				action: 'Calculate VTHO cost',
			},
			{
				name: 'Checksum Address',
				value: 'checksumAddress',
				description: 'Convert address to checksum format',
				action: 'Checksum address',
			},
		],
		default: 'validateAddress',
	},
	// Amount for conversion
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertVet', 'convertVtho'],
			},
		},
		default: '',
		placeholder: '100',
		description: 'Amount to convert',
	},
	// Conversion direction
	{
		displayName: 'Convert From',
		name: 'fromUnit',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertVet', 'convertVtho'],
			},
		},
		options: [
			{ name: 'Token (VET/VTHO)', value: 'token' },
			{ name: 'Wei', value: 'wei' },
		],
		default: 'token',
		description: 'Convert from this unit',
	},
	// Address for validation
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateAddress', 'checksumAddress'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Address to validate or checksum',
	},
	// Private key for operations
	{
		displayName: 'Private Key',
		name: 'privateKeyInput',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['getAddressFromKey', 'signMessage'],
			},
		},
		default: '',
		description: 'Private key (hex format)',
	},
	// Mnemonic
	{
		displayName: 'Mnemonic Phrase',
		name: 'mnemonicPhrase',
		type: 'string',
		typeOptions: { password: true },
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['generateFromMnemonic'],
			},
		},
		default: '',
		placeholder: 'word1 word2 word3 ...',
		description: 'BIP39 mnemonic phrase (12 or 24 words)',
	},
	// Derivation path
	{
		displayName: 'Derivation Path',
		name: 'derivationPath',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['generateFromMnemonic'],
			},
		},
		default: "m/44'/818'/0'/0/0",
		description: 'BIP44 derivation path (VeChain uses 818)',
	},
	// Message to sign/hash
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['signMessage', 'hashData'],
			},
		},
		default: '',
		description: 'Message to sign or hash',
	},
	// Signature for verification
	{
		displayName: 'Signature',
		name: 'signature',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['verifySignature'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Signature to verify',
	},
	// Message hash for verification
	{
		displayName: 'Message Hash',
		name: 'messageHash',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['verifySignature'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'Hash of the original message',
	},
	// Hash algorithm
	{
		displayName: 'Hash Algorithm',
		name: 'hashAlgorithm',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['hashData'],
			},
		},
		options: [
			{ name: 'Keccak256 (Ethereum compatible)', value: 'keccak256' },
			{ name: 'Blake2b256 (VeChain)', value: 'blake2b256' },
		],
		default: 'keccak256',
		description: 'Hash algorithm to use',
	},
	// Gas for VTHO calculation
	{
		displayName: 'Gas Amount',
		name: 'gasAmount',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['calculateVthoCost'],
			},
		},
		default: 21000,
		description: 'Gas amount to calculate cost for',
	},
	// Gas price coefficient
	{
		displayName: 'Gas Price Coefficient',
		name: 'gasPriceCoef',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['calculateVthoCost'],
			},
		},
		default: 0,
		description: 'Gas price coefficient (0-255)',
	},
];

export async function executeUtilityOperation(
	this: IExecuteFunctions,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('vechainNetwork');
	const network = credentials.network as string;
	const customUrl = credentials.nodeUrl as string;

	switch (operation) {
		case 'convertVet': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const fromUnit = this.getNodeParameter('fromUnit', itemIndex) as string;

			if (fromUnit === 'token') {
				const wei = vetToWei(amount);
				return {
					input: amount + ' VET',
					wei,
					vet: amount,
				};
			} else {
				const vet = weiToVet(amount);
				return {
					input: amount + ' wei',
					wei: amount,
					vet,
				};
			}
		}

		case 'convertVtho': {
			const amount = this.getNodeParameter('amount', itemIndex) as string;
			const fromUnit = this.getNodeParameter('fromUnit', itemIndex) as string;

			if (fromUnit === 'token') {
				const wei = vthoToWei(amount);
				return {
					input: amount + ' VTHO',
					wei,
					vtho: amount,
				};
			} else {
				const vtho = weiToVtho(amount);
				return {
					input: amount + ' wei',
					wei: amount,
					vtho,
				};
			}
		}

		case 'validateAddress': {
			const addr = this.getNodeParameter('address', itemIndex) as string;
			const isValid = address.test(addr);

			return {
				address: addr,
				isValid,
				message: isValid ? 'Valid VeChain address' : 'Invalid address format',
			};
		}

		case 'generateKeypair': {
			// Generate random private key
			const privateKeyBytes = secp256k1.generatePrivateKey();
			const publicKey = secp256k1.derivePublicKey(privateKeyBytes);
			const addr = address.fromPublicKey(publicKey);

			// Generate mnemonic for the user
			const words = mnemonic.generate();

			return {
				address: addr,
				publicKey: '0x' + publicKey.toString('hex'),
				privateKey: '0x' + privateKeyBytes.toString('hex'),
				mnemonic: words.join(' '),
				warning: 'Store these securely! Never share your private key or mnemonic.',
			};
		}

		case 'generateFromMnemonic': {
			const phrase = this.getNodeParameter('mnemonicPhrase', itemIndex) as string;
			const path = this.getNodeParameter('derivationPath', itemIndex) as string;

			const words = phrase.trim().split(/\s+/);
			if (!mnemonic.validate(words)) {
				throw new Error('Invalid mnemonic phrase');
			}

			const seed = mnemonic.derivePrivateKey(words);
			const publicKey = secp256k1.derivePublicKey(seed);
			const addr = address.fromPublicKey(publicKey);

			return {
				address: addr,
				publicKey: '0x' + publicKey.toString('hex'),
				derivationPath: path,
				note: 'Private key derived from mnemonic',
			};
		}

		case 'getAddressFromKey': {
			const privateKeyInput = this.getNodeParameter('privateKeyInput', itemIndex) as string;
			const privateKeyBuffer = Buffer.from(privateKeyInput.replace('0x', ''), 'hex');

			const publicKey = secp256k1.derivePublicKey(privateKeyBuffer);
			const addr = address.fromPublicKey(publicKey);

			return {
				address: addr,
				publicKey: '0x' + publicKey.toString('hex'),
			};
		}

		case 'signMessage': {
			const message = this.getNodeParameter('message', itemIndex) as string;
			const privateKeyInput = this.getNodeParameter('privateKeyInput', itemIndex) as string;

			const privateKeyBuffer = Buffer.from(privateKeyInput.replace('0x', ''), 'hex');
			const messageBuffer = Buffer.from(message, 'utf8');

			// Hash the message
			const messageHash = keccak256(messageBuffer);

			// Sign
			const signature = secp256k1.sign(messageHash, privateKeyBuffer);

			return {
				message,
				messageHash: '0x' + messageHash.toString('hex'),
				signature: '0x' + signature.toString('hex'),
			};
		}

		case 'verifySignature': {
			const messageHash = this.getNodeParameter('messageHash', itemIndex) as string;
			const signature = this.getNodeParameter('signature', itemIndex) as string;

			const hashBuffer = Buffer.from(messageHash.replace('0x', ''), 'hex');
			const sigBuffer = Buffer.from(signature.replace('0x', ''), 'hex');

			try {
				const publicKey = secp256k1.recover(hashBuffer, sigBuffer);
				const recoveredAddr = address.fromPublicKey(publicKey);

				return {
					isValid: true,
					recoveredAddress: recoveredAddr,
					publicKey: '0x' + publicKey.toString('hex'),
				};
			} catch (error) {
				return {
					isValid: false,
					error: 'Could not recover address from signature',
				};
			}
		}

		case 'hashData': {
			const message = this.getNodeParameter('message', itemIndex) as string;
			const algorithm = this.getNodeParameter('hashAlgorithm', itemIndex) as string;

			const messageBuffer = Buffer.from(message, 'utf8');

			let hash: Buffer;
			if (algorithm === 'blake2b256') {
				hash = blake2b256(messageBuffer);
			} else {
				hash = keccak256(messageBuffer);
			}

			return {
				input: message,
				algorithm,
				hash: '0x' + hash.toString('hex'),
			};
		}

		case 'getBlockRef': {
			const client = createThorClient(network, customUrl);
			const bestBlock = await client.getBlock('best');

			return {
				blockRef: bestBlock.id.slice(0, 18),
				blockNumber: bestBlock.number,
				blockId: bestBlock.id,
				timestamp: bestBlock.timestamp,
			};
		}

		case 'getNetworkInfo': {
			const client = createThorClient(network, customUrl);
			const bestBlock = await client.getBlock('best');
			const genesisBlock = await client.getBlock(0);
			const finalizedBlock = await client.getBlock('finalized');

			return {
				network,
				chainTag: getChainTag(network),
				chainTagHex: '0x' + getChainTag(network).toString(16),
				genesisId: genesisBlock.id,
				bestBlockNumber: bestBlock.number,
				finalizedBlockNumber: finalizedBlock.number,
				blockTime: '~10 seconds',
				confirmationsToFinality: bestBlock.number - finalizedBlock.number,
			};
		}

		case 'calculateVthoCost': {
			const gasAmount = this.getNodeParameter('gasAmount', itemIndex) as number;
			const gasPriceCoef = this.getNodeParameter('gasPriceCoef', itemIndex, 0) as number;

			// Base gas price: 1e15 wei per gas unit
			const baseGasPrice = BigInt(1e15);

			// Actual gas price with coefficient
			const adjustedGasPrice = baseGasPrice + (baseGasPrice * BigInt(gasPriceCoef)) / BigInt(255);

			const costWei = BigInt(gasAmount) * adjustedGasPrice;
			const costVtho = Number(costWei) / 1e18;

			return {
				gasAmount,
				gasPriceCoef,
				baseGasPriceWei: baseGasPrice.toString(),
				adjustedGasPriceWei: adjustedGasPrice.toString(),
				costWei: costWei.toString(),
				costVtho: costVtho.toFixed(8) + ' VTHO',
			};
		}

		case 'checksumAddress': {
			const addr = this.getNodeParameter('address', itemIndex) as string;

			if (!address.test(addr)) {
				throw new Error('Invalid address');
			}

			const checksummed = address.toChecksumed(addr);

			return {
				original: addr,
				checksummed,
			};
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

function getChainTag(network: string): number {
	switch (network) {
		case 'mainnet': return 0x4a;
		case 'testnet': return 0x27;
		case 'solo': return 0xf6;
		default: return 0x4a;
	}
}
