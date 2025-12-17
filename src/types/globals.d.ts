import type { Shape } from './shapes';

// Global window function types for game controls
declare global {
  interface Window {
    __gameUndo?: () => void;
    __gameRedo?: () => void;
    __gameClearBalls?: () => void;
    __gameReset?: () => void;
    __gameLoadState?: (saveData: { shapes?: Shape[]; spawnRate?: number; mode?: string }) => void;
  }
}

export {};

