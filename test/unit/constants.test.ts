/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  NETWORKS,
  BLOCK_TIME_MS,
  DEFAULT_VET_TRANSFER_GAS,
} from '../../nodes/Vechain/constants/networks';

import {
  VTHO_CONTRACT_ADDRESS,
  WEI_PER_VET,
} from '../../nodes/Vechain/constants/tokens';

describe('VeChain Constants', () => {
  describe('Networks', () => {
    it('should have mainnet configuration', () => {
      expect(NETWORKS.mainnet).toBeDefined();
      expect(NETWORKS.mainnet.name).toBe('VeChain Mainnet');
      expect(NETWORKS.mainnet.chainTag).toBe(0x4a);
    });

    it('should have testnet configuration', () => {
      expect(NETWORKS.testnet).toBeDefined();
      expect(NETWORKS.testnet.name).toBe('VeChain Testnet');
      expect(NETWORKS.testnet.chainTag).toBe(0x27);
    });

    it('should have correct chain tags', () => {
      expect(NETWORKS.mainnet.chainTag).toBe(0x4a); // 74
      expect(NETWORKS.testnet.chainTag).toBe(0x27); // 39
    });

    it('should have correct block time', () => {
      expect(BLOCK_TIME_MS).toBe(10000);
    });

    it('should have correct default gas values', () => {
      expect(DEFAULT_VET_TRANSFER_GAS).toBe(21000);
    });
  });

  describe('Contract Addresses', () => {
    it('should have valid VTHO contract address', () => {
      expect(VTHO_CONTRACT_ADDRESS.toLowerCase()).toBe('0x0000000000000000000000000000456e65726779');
      expect(VTHO_CONTRACT_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should have correct WEI_PER_VET value', () => {
      expect(WEI_PER_VET).toBe(BigInt('1000000000000000000'));
    });
  });
});
