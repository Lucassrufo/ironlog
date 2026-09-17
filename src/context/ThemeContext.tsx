import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { createNavigationTheme, ThemeMode, themes } from '../theme/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: typeof themes.dark;
  navigationTheme: ReturnType<typeof createNavigationTheme>;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const theme = themes[mode];
  const navigationTheme = useMemo(() => createNavigationTheme(theme), [theme]);

  const value = useMemo(
    () => ({
      mode,
      theme,
      navigationTheme,
      toggleTheme: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [mode, navigationTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
