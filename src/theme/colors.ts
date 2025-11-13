/**
 * Paleta de colores de la aplicación
 * Basada en el diseño original con mejoras de contraste y accesibilidad
 */

export const colors = {
  // Colores primarios
  primary: {
    main: '#3a86ff',
    light: '#6ba3ff',
    dark: '#0060ff',
    contrastText: '#ffffff',
  },
  
  // Colores secundarios
  secondary: {
    main: '#ff6b35',
    light: '#ff9466',
    dark: '#c43d06',
    contrastText: '#ffffff',
  },
  
  // Estados
  success: {
    main: '#06d6a0',
    light: '#38e4b3',
    dark: '#04a37a',
    contrastText: '#ffffff',
  },
  
  warning: {
    main: '#ffd60a',
    light: '#ffdf3b',
    dark: '#ccab00',
    contrastText: '#000000',
  },
  
  error: {
    main: '#ef476f',
    light: '#f26f8f',
    dark: '#d82651',
    contrastText: '#ffffff',
  },
  
  info: {
    main: '#118ab2',
    light: '#3fa1c1',
    dark: '#0d6d8e',
    contrastText: '#ffffff',
  },
  
  // Grises
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Backgrounds
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    dark: '#f5f5f5',
  },
  
  // Text
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  
  // Dividers
  divider: 'rgba(0, 0, 0, 0.12)',
} as const;
