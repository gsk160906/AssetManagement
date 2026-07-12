export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export type AppTheme = typeof THEMES[keyof typeof THEMES];
