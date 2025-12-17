import { describe, it, expect } from 'vitest';
import {
  MAX_BALLS,
  MAX_SHAPES,
  MIN_SPAWN_RATE,
  MAX_SPAWN_RATE,
  DEFAULT_SPAWN_RATE,
} from './game';

describe('game constants', () => {
  it('should have correct max balls limit (spec: 1024)', () => {
    expect(MAX_BALLS).toBe(1024);
  });

  it('should have correct max shapes limit (spec: 256)', () => {
    expect(MAX_SHAPES).toBe(256);
  });

  describe('spawn rate limits', () => {
    it('should have minimum spawn rate of 0.1 seconds (spec)', () => {
      expect(MIN_SPAWN_RATE).toBe(0.1);
    });

    it('should have maximum spawn rate of 10 seconds (spec)', () => {
      expect(MAX_SPAWN_RATE).toBe(10);
    });

    it('should have default spawn rate within valid range', () => {
      expect(DEFAULT_SPAWN_RATE).toBeGreaterThanOrEqual(MIN_SPAWN_RATE);
      expect(DEFAULT_SPAWN_RATE).toBeLessThanOrEqual(MAX_SPAWN_RATE);
    });
  });
});
