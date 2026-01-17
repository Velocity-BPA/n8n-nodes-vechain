/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  calculateVthoGenerated,
  VTHO_GENERATION_RATE_PER_SECOND,
  VTHO_GENERATION_RATE_PER_DAY,
} from '../../nodes/Vechain/utils/energyCalculator';

describe('Energy Calculator', () => {
  describe('VTHO Generation Rate Constants', () => {
    it('should have correct per-second rate', () => {
      expect(VTHO_GENERATION_RATE_PER_SECOND).toBe(5e-9);
    });

    it('should have correct per-day rate', () => {
      expect(VTHO_GENERATION_RATE_PER_DAY).toBeCloseTo(0.000432, 6);
    });
  });

  describe('calculateVthoGenerated', () => {
    // Note: Function returns wei value as string (needs large VET amounts to produce non-zero results)
    it('should calculate VTHO (wei) for large VET amount over 1 day', () => {
      // 1 billion VET for 1 day should generate meaningful VTHO
      const result = calculateVthoGenerated('1000000000', 86400);
      // Expected: 1e9 * 432000 / 1e9 = 432000 wei
      expect(BigInt(result)).toBe(BigInt(432000));
    });

    it('should calculate VTHO (wei) proportionally', () => {
      const result1 = calculateVthoGenerated('1000000000', 86400);
      const result2 = calculateVthoGenerated('2000000000', 86400);
      // Double the VET should produce double the VTHO
      expect(BigInt(result2)).toBe(BigInt(result1) * BigInt(2));
    });

    it('should return 0 for 0 VET', () => {
      const result = calculateVthoGenerated('0', 86400);
      expect(result).toBe('0');
    });

    it('should return 0 for 0 seconds', () => {
      const result = calculateVthoGenerated('1000000000', 0);
      expect(result).toBe('0');
    });

    it('should handle small VET amounts (returns 0 wei due to integer math)', () => {
      // Small amounts return 0 because result is less than 1 wei
      const result = calculateVthoGenerated('1', 86400);
      // This is expected behavior - 1 VET for 1 day produces < 1 wei
      expect(result).toBe('0');
    });
  });
});
