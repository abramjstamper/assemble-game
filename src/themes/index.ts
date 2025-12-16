import { lightTheme } from './light';
import { darkTheme } from './dark';
import type { Theme } from '../types/game';

export interface ThemeConfig {
  name: string;
  background: string;
  canvasBackground: string;
  toolbar: {
    background: string;
    border: string;
    buttonBackground: string;
    buttonBorder: string;
    buttonBorderLight: string;
    buttonBorderDark: string;
    buttonHover: string;
    buttonActive: string;
    buttonText: string;
    separator: string;
  };
  statsBar: {
    background: string;
    border: string;
    text: string;
    textSecondary: string;
  };
  overlay: {
    background: string;
    panel: string;
    panelBorder: string;
    title: string;
    text: string;
    inputBackground: string;
    inputBorder: string;
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
  };
  walls: {
    color: string;
    borderColor: string;
  };
  shapes: {
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    outlineLight: string;
    outlineDark: string;
    endpointDotOpacity: number;
    glowColor?: string;
    glowBlur?: number;
  };
  balls: {
    shadowColor: string;
    shadowBlur: number;
    glowColor?: string;
  };
}

export const themes: Record<Theme, ThemeConfig> = {
  light: lightTheme as ThemeConfig,
  dark: darkTheme as ThemeConfig,
};

export function getTheme(theme: Theme): ThemeConfig {
  return themes[theme];
}

export { lightTheme, darkTheme };
