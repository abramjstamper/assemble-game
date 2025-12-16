export const lightTheme = {
  name: 'light' as const,

  // Background
  background: '#F5F5F5',
  canvasBackground: '#FAFAFA',

  // UI Elements (Windows XP style)
  toolbar: {
    background: 'linear-gradient(180deg, #ECE9D8 0%, #D4D0C8 100%)',
    border: '#ACA899',
    buttonBackground: 'linear-gradient(180deg, #FFFFFF 0%, #ECE9D8 50%, #D4D0C8 100%)',
    buttonBorder: '#ACA899',
    buttonBorderLight: '#FFFFFF',
    buttonBorderDark: '#706F64',
    buttonHover: 'linear-gradient(180deg, #FFF8E1 0%, #ECE9D8 50%, #D4D0C8 100%)',
    buttonActive: 'linear-gradient(180deg, #D4D0C8 0%, #ECE9D8 100%)',
    buttonText: '#000000',
    separator: '#ACA899',
  },

  statsBar: {
    background: 'linear-gradient(180deg, #ECE9D8 0%, #D4D0C8 100%)',
    border: '#ACA899',
    text: '#000000',
    textSecondary: '#666666',
  },

  // Overlays
  overlay: {
    background: 'rgba(0, 0, 0, 0.5)',
    panel: '#FAFAFA',
    panelBorder: '#ACA899',
    title: '#333333',
    text: '#666666',
    inputBackground: '#FFFFFF',
    inputBorder: '#CCCCCC',
    buttonPrimary: 'linear-gradient(180deg, #4A90D9 0%, #3A7BC8 100%)',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: 'linear-gradient(180deg, #FFFFFF 0%, #ECE9D8 100%)',
    buttonSecondaryText: '#333333',
  },

  // Game elements
  walls: {
    color: '#CCCCCC',
    borderColor: '#999999',
  },

  // Shape styling
  shapes: {
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    outlineLight: 'rgba(255, 255, 255, 0.5)',
    outlineDark: 'rgba(0, 0, 0, 0.2)',
    endpointDotOpacity: 0.7,
  },

  // Ball styling
  balls: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowBlur: 3,
  },
};
