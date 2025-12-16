import { describe, it, expect } from 'vitest';
import { SHAPE_CONFIGS } from './shapes';

describe('shapes', () => {
  describe('SHAPE_CONFIGS', () => {
    it('should have configs for all 5 shape types', () => {
      expect(Object.keys(SHAPE_CONFIGS)).toHaveLength(5);
      expect(SHAPE_CONFIGS.shortLine).toBeDefined();
      expect(SHAPE_CONFIGS.mediumLine).toBeDefined();
      expect(SHAPE_CONFIGS.longLine).toBeDefined();
      expect(SHAPE_CONFIGS.smallSquare).toBeDefined();
      expect(SHAPE_CONFIGS.largeSquare).toBeDefined();
    });

    describe('line shapes', () => {
      it('should have correct dimensions for short line (6% width)', () => {
        expect(SHAPE_CONFIGS.shortLine.width).toBe(0.06);
        expect(SHAPE_CONFIGS.shortLine.height).toBe(0.005);
        expect(SHAPE_CONFIGS.shortLine.isLine).toBe(true);
      });

      it('should have correct dimensions for medium line (12% width)', () => {
        expect(SHAPE_CONFIGS.mediumLine.width).toBe(0.12);
        expect(SHAPE_CONFIGS.mediumLine.height).toBe(0.005);
        expect(SHAPE_CONFIGS.mediumLine.isLine).toBe(true);
      });

      it('should have correct dimensions for long line (20% width)', () => {
        expect(SHAPE_CONFIGS.longLine.width).toBe(0.20);
        expect(SHAPE_CONFIGS.longLine.height).toBe(0.005);
        expect(SHAPE_CONFIGS.longLine.isLine).toBe(true);
      });
    });

    describe('square shapes', () => {
      it('should have correct dimensions for small square (3% width)', () => {
        expect(SHAPE_CONFIGS.smallSquare.width).toBe(0.03);
        expect(SHAPE_CONFIGS.smallSquare.height).toBe(0.03);
        expect(SHAPE_CONFIGS.smallSquare.isLine).toBe(false);
      });

      it('should have correct dimensions for large square (6% width)', () => {
        expect(SHAPE_CONFIGS.largeSquare.width).toBe(0.06);
        expect(SHAPE_CONFIGS.largeSquare.height).toBe(0.06);
        expect(SHAPE_CONFIGS.largeSquare.isLine).toBe(false);
      });
    });

    it('should have tooltips for all shapes', () => {
      Object.values(SHAPE_CONFIGS).forEach((config) => {
        expect(config.tooltip).toBeDefined();
        expect(config.tooltip.length).toBeGreaterThan(0);
      });
    });

    it('should have labels for all shapes', () => {
      Object.values(SHAPE_CONFIGS).forEach((config) => {
        expect(config.label).toBeDefined();
        expect(config.label.length).toBeGreaterThan(0);
      });
    });
  });
});
