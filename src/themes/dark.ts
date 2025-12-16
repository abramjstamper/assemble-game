export const darkTheme = {
  name: 'dark' as const,

  // Background
  background: '#1A1A2E',
  canvasBackground: '#16213E',

  // UI Elements (Blacklight/Neon style)
  toolbar: {
    background: 'linear-gradient(180deg, #2D2D44 0%, #1A1A2E 100%)',
    border: '#4A4A6A',
    buttonBackground: 'linear-gradient(180deg, #3D3D5C 0%, #2D2D44 50%, #1A1A2E 100%)',
    buttonBorder: '#4A4A6A',
    buttonBorderLight: '#5A5A7A',
    buttonBorderDark: '#0A0A1E',
    buttonHover: 'linear-gradient(180deg, #4D4D6C 0%, #3D3D5C 50%, #2D2D44 100%)',
    buttonActive: 'linear-gradient(180deg, #1A1A2E 0%, #2D2D44 100%)',
    buttonText: '#E0E0FF',
    separator: '#4A4A6A',
  },

  statsBar: {
    background: 'linear-gradient(180deg, #2D2D44 0%, #1A1A2E 100%)',
    border: '#4A4A6A',
    text: '#E0E0FF',
    textSecondary: '#9090B0',
  },

  // Overlays
  overlay: {
    background: 'rgba(0, 0, 0, 0.7)',
    panel: '#1A1A2E',
    panelBorder: '#4A4A6A',
    title: '#E0E0FF',
    text: '#9090B0',
    inputBackground: '#2D2D44',
    inputBorder: '#4A4A6A',
    buttonPrimary: 'linear-gradient(180deg, #FF6B6B 0%, #E05555 100%)',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: 'linear-gradient(180deg, #3D3D5C 0%, #2D2D44 100%)',
    buttonSecondaryText: '#E0E0FF',
  },

  // Game elements
  walls: {
    color: '#4A4A6A',
    borderColor: '#6A6A8A',
  },

  // Shape styling (neon glow effects)
  shapes: {
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowBlur: 8,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    outlineLight: 'rgba(255, 255, 255, 0.3)',
    outlineDark: 'rgba(0, 0, 0, 0.5)',
    endpointDotOpacity: 0.9,
    glowColor: 'rgba(255, 255, 255, 0.5)',
    glowBlur: 10,
  },

  // Ball styling (neon glow)
  balls: {
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowBlur: 8,
    glowColor: 'rgba(255, 255, 255, 0.3)',
  },
};
