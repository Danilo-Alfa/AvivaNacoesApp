export const colors = {
  light: {
    primary: '#1e3a5f',
    primaryForeground: '#ffffff',
    accent: '#d4922a',
    accentForeground: '#ffffff',
    background: '#ffffff',
    foreground: '#1e293b',
    card: '#ffffff',
    cardForeground: '#1e293b',
    muted: '#f1f3f5',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
  },
  dark: {
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    accent: '#d4922a',
    accentForeground: '#ffffff',
    background: '#0f172a',
    foreground: '#f1f5f9',
    card: '#1e293b',
    cardForeground: '#f1f5f9',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    border: '#334155',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
  },
};

export type ColorScheme = keyof typeof colors;
export type ThemeColors = typeof colors.light;
