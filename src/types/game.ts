import type { Shape } from './shapes';

export type GameMode = 'creative' | 'challenge';
export type Theme = 'light' | 'dark';
export type ToolMode = 'select' | 'delete' | ShapeToolMode;
export type ShapeToolMode = 'shortLine' | 'mediumLine' | 'longLine' | 'smallSquare' | 'largeSquare';

export interface Ball {
  id: string;
  matterBodyId: number;
  color: string;
}

export interface SessionStats {
  ballsDropped: number;
  ballsDelivered: number;
  shapesPlaced: number;
}

export interface LifetimeStats {
  totalPlayTime: number; // in milliseconds
  totalBallsDropped: number;
  totalBallsDelivered: number;
  totalShapesPlaced: number;
}

export interface PlayerData {
  name: string;
  hasCompletedOnboarding: boolean;
}

export interface GameState {
  // Player
  player: PlayerData;

  // Game settings
  mode: GameMode;
  theme: Theme;
  isPaused: boolean;
  spawnRate: number; // seconds between spawns

  // Tool state
  currentTool: ToolMode;
  selectedShapeId: string | null;

  // Game objects
  shapes: Shape[];
  balls: Ball[];

  // Statistics
  sessionStats: SessionStats;
  lifetimeStats: LifetimeStats;

  // UI state
  showSettings: boolean;
  showOnboarding: boolean;
}

export interface UndoState {
  shapes: Shape[];
}

export const MAX_BALLS = 1024;
export const MAX_SHAPES = 256;
export const MIN_SPAWN_RATE = 0.1; // seconds
export const MAX_SPAWN_RATE = 10; // seconds
export const DEFAULT_SPAWN_RATE = 1.5; // seconds
