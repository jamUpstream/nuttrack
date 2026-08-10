import React, {
  createContext, useContext, useEffect, useMemo, useState, useCallback,
} from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buildColors, shadowAmbient, shadowInteractive,
  type AccentId, type Colors,
} from './tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeValue {
  colors: Colors;
  dark: boolean;
  mode: ThemeMode;
  accent: AccentId;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentId) => void;
  ambient: ReturnType<typeof shadowAmbient>;
  interactive: ReturnType<typeof shadowInteractive>;
  loaded: boolean;
}

const MODE_KEY = 'nuttrack.themeMode';
const ACCENT_KEY = 'nuttrack.accent';

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState<AccentId>('forest');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, a] = await Promise.all([
        AsyncStorage.getItem(MODE_KEY),
        AsyncStorage.getItem(ACCENT_KEY),
      ]);
      if (m) setModeState(m as ThemeMode);
      if (a) setAccentState(a as AccentId);
      setLoaded(true);
    })();
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m).catch(() => {});
  }, []);

  const setAccent = useCallback((a: AccentId) => {
    setAccentState(a);
    AsyncStorage.setItem(ACCENT_KEY, a).catch(() => {});
  }, []);

  const dark = mode === 'system' ? system === 'dark' : mode === 'dark';

  const value = useMemo<ThemeValue>(() => {
    const colors = buildColors(accent, dark);
    return {
      colors,
      dark,
      mode,
      accent,
      setMode,
      setAccent,
      ambient: shadowAmbient(colors, dark),
      interactive: shadowInteractive(colors, dark),
      loaded,
    };
  }, [accent, dark, mode, setMode, setAccent, loaded]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

/**
 * Styles depend on the palette, so they can't live at module scope any more.
 * Pass a factory; it re-runs only when the theme actually changes.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (t: ThemeValue) => T
): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
