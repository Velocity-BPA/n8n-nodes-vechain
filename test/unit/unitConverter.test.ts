/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  vetToWei,
  weiToVet,
  vthoToWei,
  weiToVtho,
} from '../../nodes/Vechain/utils/unitConverter';

describe('Unit Converter', () => {
  describe('VET Conversions', () => {
    it('should convert VET to wei correctly', () => {
      expect(vetToWei('1')).toBe('1000000000000000000');
      expect(vetToWei('100')).toBe('100000000000000000000');
      expect(vetToWei('0.5')).toBe('500000000000000000');
    });

    it('should convert wei to VET correctly', () => {
      expect(weiToVet('1000000000000000000')).toBe('1');
      expect(weiToVet('100000000000000000000')).toBe('100');
      expect(weiToVet('500000000000000000')).toBe('0.5');
    });

    it('should handle zero values', () => {
      expect(vetToWei('0')).toBe('0');
      expect(weiToVet('0')).toBe('0');
    });

    it('should handle large values', () => {
      expect(vetToWei('1000000')).toBe('1000000000000000000000000');
      expect(weiToVet('1000000000000000000000000')).toBe('1000000');
    });
  });

  describe('VTHO Conversions', () => {
    it('should convert VTHO to wei correctly', () => {
      expect(vthoToWei('1')).toBe('1000000000000000000');
      expect(vthoToWei('100')).toBe('100000000000000000000');
    });

    it('should convert wei to VTHO correctly', () => {
      expect(weiToVtho('1000000000000000000')).toBe('1');
      expect(weiToVtho('100000000000000000000')).toBe('100');
    });
  });
});
