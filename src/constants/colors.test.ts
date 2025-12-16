import { describe, it, expect } from 'vitest';
import { SHAPE_COLORS, BALL_COLORS, getRandomBallColor, getShapeColor } from './colors';

describe('colors', () => {
  describe('SHAPE_COLORS', () => {
    it('should have colors for both themes', () => {
      expect(SHAPE_COLORS.light).toBeDefined();
      expect(SHAPE_COLORS.dark).toBeDefined();
    });

    it('should have colors for all shape types', () => {
      const shapeTypes = ['shortLine', 'mediumLine', 'longLine', 'smallSquare', 'largeSquare'] as const;

      shapeTypes.forEach((type) => {
        expect(SHAPE_COLORS.light[type]).toBeDefined();
        expect(SHAPE_COLORS.dark[type]).toBeDefined();
        expect(SHAPE_COLORS.light[type]).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(SHAPE_COLORS.dark[type]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    it('should have unique colors for each shape type within a theme', () => {
      const lightColors = Object.values(SHAPE_COLORS.light);
      const darkColors = Object.values(SHAPE_COLORS.dark);

      expect(new Set(lightColors).size).toBe(lightColors.length);
      expect(new Set(darkColors).size).toBe(darkColors.length);
    });
  });

  describe('BALL_COLORS', () => {
    it('should have colors for both themes', () => {
      expect(BALL_COLORS.light).toBeDefined();
      expect(BALL_COLORS.dark).toBeDefined();
    });

    it('should have at least 16 colors per theme (spec requirement)', () => {
      expect(BALL_COLORS.light.length).toBeGreaterThanOrEqual(16);
      expect(BALL_COLORS.dark.length).toBeGreaterThanOrEqual(16);
    });

    it('should have valid hex color formats', () => {
      BALL_COLORS.light.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
      BALL_COLORS.dark.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('getRandomBallColor', () => {
    it('should return a color from the light theme palette', () => {
      const color = getRandomBallColor('light');
      expect(BALL_COLORS.light).toContain(color);
    });

    it('should return a color from the dark theme palette', () => {
      const color = getRandomBallColor('dark');
      expect(BALL_COLORS.dark).toContain(color);
    });

    it('should return different colors over multiple calls (randomness)', () => {
      const colors = new Set<string>();
      for (let i = 0; i < 50; i++) {
        colors.add(getRandomBallColor('light'));
      }
      // With 50 calls and 20 colors, we should get at least a few different ones
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe('getShapeColor', () => {
    it('should return correct color for light theme', () => {
      expect(getShapeColor('shortLine', 'light')).toBe(SHAPE_COLORS.light.shortLine);
      expect(getShapeColor('largeSquare', 'light')).toBe(SHAPE_COLORS.light.largeSquare);
    });

    it('should return correct color for dark theme', () => {
      expect(getShapeColor('shortLine', 'dark')).toBe(SHAPE_COLORS.dark.shortLine);
      expect(getShapeColor('largeSquare', 'dark')).toBe(SHAPE_COLORS.dark.largeSquare);
    });
  });
});
