export type ShapeType = 'shortLine' | 'mediumLine' | 'longLine' | 'smallSquare' | 'largeSquare';

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation: number; // in radians
  matterBodyId?: number; // Matter.js body ID
}

export interface ShapeConfig {
  type: ShapeType;
  label: string;
  tooltip: string;
  // Dimensions as percentage of canvas width
  width: number;
  height: number;
  isLine: boolean;
}

export const SHAPE_CONFIGS: Record<ShapeType, ShapeConfig> = {
  shortLine: {
    type: 'shortLine',
    label: 'Short Line',
    tooltip: 'Short ramp - click to place',
    width: 0.06, // 6% of canvas width
    height: 0.005, // 0.5% of canvas width
    isLine: true,
  },
  mediumLine: {
    type: 'mediumLine',
    label: 'Medium Line',
    tooltip: 'Medium ramp - click to place',
    width: 0.12, // 12% of canvas width
    height: 0.005,
    isLine: true,
  },
  longLine: {
    type: 'longLine',
    label: 'Long Line',
    tooltip: 'Long ramp - click to place',
    width: 0.20, // 20% of canvas width
    height: 0.005,
    isLine: true,
  },
  smallSquare: {
    type: 'smallSquare',
    label: 'Small Square',
    tooltip: 'Small block - click to place',
    width: 0.03, // 3% of canvas width
    height: 0.03,
    isLine: false,
  },
  largeSquare: {
    type: 'largeSquare',
    label: 'Large Square',
    tooltip: 'Large block - click to place',
    width: 0.06, // 6% of canvas width
    height: 0.06,
    isLine: false,
  },
};
