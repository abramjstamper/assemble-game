import type { ShapeType } from '../types/shapes';
import type { Theme } from '../types/game';

// Shape colors by type - different for each theme
export const SHAPE_COLORS: Record<Theme, Record<ShapeType, string>> = {
  light: {
    shortLine: '#E57373', // Soft red
    mediumLine: '#81C784', // Soft green
    longLine: '#64B5F6', // Soft blue
    smallSquare: '#FFB74D', // Soft orange
    largeSquare: '#BA68C8', // Soft purple
  },
  dark: {
    shortLine: '#FF6B6B', // Neon red
    mediumLine: '#4ECDC4', // Neon teal
    longLine: '#45B7D1', // Neon cyan
    smallSquare: '#F7DC6F', // Neon yellow
    largeSquare: '#BB8FCE', // Neon purple
  },
};

// Ball colors - 20 colors per theme that contrast well with background
export const BALL_COLORS: Record<Theme, string[]> = {
  light: [
    '#D32F2F', // Red
    '#C2185B', // Pink
    '#7B1FA2', // Purple
    '#512DA8', // Deep purple
    '#303F9F', // Indigo
    '#1976D2', // Blue
    '#0288D1', // Light blue
    '#0097A7', // Cyan
    '#00796B', // Teal
    '#388E3C', // Green
    '#689F38', // Light green
    '#AFB42B', // Lime
    '#FBC02D', // Yellow
    '#FFA000', // Amber
    '#F57C00', // Orange
    '#E64A19', // Deep orange
    '#5D4037', // Brown
    '#616161', // Grey
    '#455A64', // Blue grey
    '#8D6E63', // Light brown
  ],
  dark: [
    '#FF5252', // Neon red
    '#FF4081', // Neon pink
    '#E040FB', // Neon magenta
    '#7C4DFF', // Neon purple
    '#536DFE', // Neon indigo
    '#448AFF', // Neon blue
    '#40C4FF', // Neon light blue
    '#18FFFF', // Neon cyan
    '#64FFDA', // Neon teal
    '#69F0AE', // Neon green
    '#B2FF59', // Neon light green
    '#EEFF41', // Neon lime
    '#FFFF00', // Neon yellow
    '#FFD740', // Neon amber
    '#FFAB40', // Neon orange
    '#FF6E40', // Neon deep orange
    '#FF80AB', // Neon rose
    '#EA80FC', // Neon lavender
    '#8C9EFF', // Neon periwinkle
    '#80D8FF', // Neon sky
  ],
};

// Get a random ball color for the current theme
export function getRandomBallColor(theme: Theme): string {
  const colors = BALL_COLORS[theme];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get shape color for the current theme
export function getShapeColor(type: ShapeType, theme: Theme): string {
  return SHAPE_COLORS[theme][type];
}
