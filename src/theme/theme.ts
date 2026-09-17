import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';

export type ThemeMode = 'dark' | 'light';

const palette = {
  blue: '#1684FF',
  blueSoft: '#63B3FF',
  black: '#05070B',
  white: '#F7FBFF',
  slate: '#121822',
  slateSoft: '#202A38',
  gray: '#8D99A8',
  line: '#2B3544',
};

export const themes = {
  dark: {
    mode: 'dark' as ThemeMode,
    colors: {
      background: palette.black,
      surface: palette.slate,
      surfaceElevated: palette.slateSoft,
      primary: palette.blue,
      primarySoft: palette.blueSoft,
      text: palette.white,
      textMuted: '#AEB8C6',
      border: palette.line,
      input: '#0B1018',
      success: '#36D399',
      danger: '#FF5A70',
    },
  },
  light: {
    mode: 'light' as ThemeMode,
    colors: {
      background: '#F4F8FC',
      surface: palette.white,
      surfaceElevated: '#EAF2FB',
      primary: palette.blue,
      primarySoft: '#D8ECFF',
      text: '#07111F',
      textMuted: '#5D6B7C',
      border: '#D3DEEA',
      input: palette.white,
      success: '#0E9F6E',
      danger: '#E11D48',
    },
  },
};

export type AppTheme = typeof themes.dark;

export function createNavigationTheme(theme: AppTheme): NavigationTheme {
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      primary: theme.colors.primary,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };
}
