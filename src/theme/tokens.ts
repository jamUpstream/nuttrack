// Static tokens (type, spacing, radius, shadows) + the color palette builder.
// Colors are no longer a fixed export: they depend on accent + light/dark,
// so components read them from useTheme() instead of importing them.

export type AccentId =
  | 'forest' | 'ocean' | 'violet' | 'ember' | 'rose' | 'teal' | 'graphite';

export interface Accent {
  id: AccentId;
  name: string;
  /** swatch shown in Settings */
  swatch: string;
  light: { primary: string; primaryContainer: string; onPrimary: string };
  dark: { primary: string; primaryContainer: string; onPrimary: string };
}

export const ACCENTS: Accent[] = [
  {
    id: 'forest', name: 'Forest', swatch: '#22c55e',
    light: { primary: '#006e2f', primaryContainer: '#22c55e', onPrimary: '#ffffff' },
    dark:  { primary: '#4ae176', primaryContainer: '#1ea34e', onPrimary: '#ffffff' },
  },
  {
    id: 'ocean', name: 'Ocean', swatch: '#3b82f6',
    light: { primary: '#0b4fc4', primaryContainer: '#3b82f6', onPrimary: '#ffffff' },
    dark:  { primary: '#8ab4ff', primaryContainer: '#2f6fe0', onPrimary: '#ffffff' },
  },
  {
    id: 'violet', name: 'Violet', swatch: '#8b5cf6',
    light: { primary: '#5b21b6', primaryContainer: '#8b5cf6', onPrimary: '#ffffff' },
    dark:  { primary: '#c4a6ff', primaryContainer: '#7c4ded', onPrimary: '#ffffff' },
  },
  {
    id: 'ember', name: 'Ember', swatch: '#f59e0b',
    light: { primary: '#a15c07', primaryContainer: '#f59e0b', onPrimary: '#301a00' },
    dark:  { primary: '#fbc02d', primaryContainer: '#d98806', onPrimary: '#301a00' },
  },
  {
    id: 'rose', name: 'Rose', swatch: '#e11d6b',
    light: { primary: '#a1104c', primaryContainer: '#e11d6b', onPrimary: '#ffffff' },
    dark:  { primary: '#ff9dc0', primaryContainer: '#c2185b', onPrimary: '#ffffff' },
  },
  {
    id: 'teal', name: 'Teal', swatch: '#14b8a6',
    light: { primary: '#0b6b62', primaryContainer: '#14b8a6', onPrimary: '#ffffff' },
    dark:  { primary: '#5eead4', primaryContainer: '#0f9c8d', onPrimary: '#00312c' },
  },
  {
    id: 'graphite', name: 'Graphite', swatch: '#64748b',
    light: { primary: '#334155', primaryContainer: '#64748b', onPrimary: '#ffffff' },
    dark:  { primary: '#cbd5e1', primaryContainer: '#5a6b83', onPrimary: '#ffffff' },
  },
];

export function accentById(id: AccentId): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

/** Neutrals, kept identical to the original mockups in light mode. */
const LIGHT_NEUTRALS = {
  background: '#f7f9fb',
  surface: '#f7f9fb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  surfaceVariant: '#e0e3e5',
  onBackground: '#191c1e',
  onSurface: '#191c1e',
  onSurfaceVariant: '#3d4a3d',
  outline: '#6d7b6c',
  outlineVariant: '#bccbb9',
  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  scrim: 'rgba(25,28,30,0.4)',
  shadowColor: '#0f172a',
};

const DARK_NEUTRALS = {
  background: '#101416',
  surface: '#101416',
  surfaceContainerLowest: '#171b1d',
  surfaceContainerLow: '#1c2022',
  surfaceContainer: '#212527',
  surfaceContainerHigh: '#2b2f31',
  surfaceContainerHighest: '#363a3c',
  surfaceVariant: '#3f4547',
  onBackground: '#e3e5e6',
  onSurface: '#e3e5e6',
  onSurfaceVariant: '#c0c8c0',
  outline: '#8b9a8a',
  outlineVariant: '#454b46',
  inverseSurface: '#e3e5e6',
  inverseOnSurface: '#191c1e',
  error: '#ff8f86',
  onError: '#5f0000',
  errorContainer: '#5c0f0f',
  onErrorContainer: '#ffdad6',
  scrim: 'rgba(0,0,0,0.6)',
  shadowColor: '#000000',
};

export function buildColors(accentId: AccentId, dark: boolean) {
  const accent = accentById(accentId);
  const tone = dark ? accent.dark : accent.light;
  const neutrals = dark ? DARK_NEUTRALS : LIGHT_NEUTRALS;
  return {
    ...neutrals,
    primary: tone.primary,
    primaryContainer: tone.primaryContainer,
    onPrimary: tone.onPrimary,
    onPrimaryContainer: dark ? '#ffffff' : '#ffffff',
    /** Accent at low opacity, for glows and tinted chips. */
    primaryTint: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    tertiary: dark ? '#a8b0c4' : '#565e74',
  };
}

export type Colors = ReturnType<typeof buildColors>;

export const type = {
  displayStreak: { fontSize: 48, lineHeight: 56, letterSpacing: -1, fontWeight: '700' as const },
  headlineLg: { fontSize: 30, lineHeight: 36, letterSpacing: -0.3, fontWeight: '700' as const },
  headlineLgMobile: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  headlineMd: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  labelCaps: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6, fontWeight: '600' as const },
  statLabel: { fontSize: 12, lineHeight: 14, fontWeight: '500' as const },
};

export const space = {
  cardPadding: 20,
  stackSm: 8,
  stackMd: 16,
  sectionGap: 32,
  containerMargin: 24,
  gutter: 16,
};

export const radius = {
  sm: 4,
  lg: 8,
  xl: 12,
  /** cards, sheets */
  xxl: 24,
  /** primary action buttons — Clean / Relapse / Save */
  button: 20,
  full: 9999,
};

export function shadowAmbient(c: Colors, dark: boolean) {
  return {
    shadowColor: c.shadowColor,
    shadowOpacity: dark ? 0.4 : 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  };
}

export function shadowInteractive(c: Colors, dark: boolean) {
  return {
    shadowColor: c.shadowColor,
    shadowOpacity: dark ? 0.5 : 0.1,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  };
}
