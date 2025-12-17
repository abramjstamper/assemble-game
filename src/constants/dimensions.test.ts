import { describe, it, expect } from 'vitest';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BALL_DIAMETER_RATIO,
  BALL_DIAMETER,
  LINE_THICKNESS_RATIO,
  LINE_THICKNESS,
  ENDPOINT_DOT_RATIO,
  ENDPOINT_DOT_DIAMETER,
  SPAWN_X_RATIO,
  SPAWN_X,
  SPAWN_Y,
  GRAVITY,
  BOUNCE_COEFFICIENT,
  FRICTION,
  AIR_FRICTION,
  ratioToPixels,
} from './dimensions';

describe('dimensions', () => {
  describe('canvas dimensions', () => {
    it('should have correct canvas size (spec: 1600x900)', () => {
      expect(CANVAS_WIDTH).toBe(1600);
      expect(CANVAS_HEIGHT).toBe(900);
    });
  });

  describe('ball dimensions', () => {
    it('should have ball diameter as 1.5% of canvas width (spec)', () => {
      expect(BALL_DIAMETER_RATIO).toBe(0.015);
      expect(BALL_DIAMETER).toBe(CANVAS_WIDTH * BALL_DIAMETER_RATIO);
      expect(BALL_DIAMETER).toBeCloseTo(24);
    });
  });

  describe('line dimensions', () => {
    it('should have line thickness as 0.5% of canvas width (spec)', () => {
      expect(LINE_THICKNESS_RATIO).toBe(0.005);
      expect(LINE_THICKNESS).toBe(CANVAS_WIDTH * LINE_THICKNESS_RATIO);
      expect(LINE_THICKNESS).toBeCloseTo(8);
    });

    it('should have endpoint dot as 1% of canvas width (spec)', () => {
      expect(ENDPOINT_DOT_RATIO).toBe(0.01);
      expect(ENDPOINT_DOT_DIAMETER).toBe(CANVAS_WIDTH * ENDPOINT_DOT_RATIO);
      expect(ENDPOINT_DOT_DIAMETER).toBeCloseTo(16);
    });
  });

  describe('spawn position', () => {
    it('should spawn at 25% from left edge (spec)', () => {
      expect(SPAWN_X_RATIO).toBe(0.25);
      expect(SPAWN_X).toBe(CANVAS_WIDTH * SPAWN_X_RATIO);
      expect(SPAWN_X).toBeCloseTo(400);
    });

    it('should spawn at top edge', () => {
      expect(SPAWN_Y).toBe(0);
    });
  });

  describe('physics constants', () => {
    it('should have gravity value', () => {
      expect(GRAVITY).toBe(1);
    });

    it('should have bounce coefficient of 0.8 (spec: loses 20% velocity)', () => {
      expect(BOUNCE_COEFFICIENT).toBe(0.8);
    });

    it('should have no friction (spec: frictionless)', () => {
      expect(FRICTION).toBe(0);
      expect(AIR_FRICTION).toBe(0);
    });
  });

  describe('ratioToPixels', () => {
    it('should convert ratio to pixels based on canvas width', () => {
      expect(ratioToPixels(0.1)).toBe(160);
      expect(ratioToPixels(0.5)).toBe(800);
      expect(ratioToPixels(1)).toBe(1600);
    });

    it('should handle decimal ratios', () => {
      expect(ratioToPixels(0.015)).toBeCloseTo(24);
      expect(ratioToPixels(0.005)).toBeCloseTo(8);
    });
  });
});
