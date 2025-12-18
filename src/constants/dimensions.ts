// Canvas dimensions
export const CANVAS_WIDTH = 1600;
export const CANVAS_HEIGHT = 900;

// Ball dimensions (relative to canvas width)
export const BALL_DIAMETER_RATIO = 0.015; // 1.5% of canvas width
export const BALL_DIAMETER = CANVAS_WIDTH * BALL_DIAMETER_RATIO; // ~24px

// Line thickness (relative to canvas width) - matches endpoint circles for flush fit
export const LINE_THICKNESS_RATIO = 0.0125; // 1.25% of canvas width
export const LINE_THICKNESS = CANVAS_WIDTH * LINE_THICKNESS_RATIO; // ~20px

// Endpoint dot diameter for lines - same as line thickness so they're flush
export const ENDPOINT_DOT_DIAMETER = LINE_THICKNESS;

// Spawn position
export const SPAWN_X_RATIO = 0.25; // 25% from left edge
export const SPAWN_X = CANVAS_WIDTH * SPAWN_X_RATIO; // ~400px
export const SPAWN_Y = 0; // At top edge

// Physics constants
export const GRAVITY = 1;
export const BOUNCE_COEFFICIENT = 0.8;
export const FRICTION = 0;
export const AIR_FRICTION = 0;

// Helper function to get pixel dimensions from ratio
export function ratioToPixels(ratio: number): number {
  return CANVAS_WIDTH * ratio;
}
