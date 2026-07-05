export const colors = {
  // Primary
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
  },
  // Secondary gradients
  purple: {
    500: '#a855f7',
    600: '#9333ea',
  },
  // Backgrounds
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Status colors
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
  },
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  cyan: {
    500: '#06b6d4',
  },
  violet: {
    500: '#8b5cf6',
  },
  orange: {
    500: '#f97316',
  },
  teal: {
    500: '#14b8a6',
  },
  pink: {
    500: '#ec4899',
  },
  sky: {
    500: '#0ea5e9',
  },
  // Appointment colors palette
  appointmentPalette: [
    '#6366f1', // indigo
    '#10b981', // emerald
    '#f43f5e', // rose
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#f97316', // orange
    '#14b8a6', // teal
    '#ec4899', // pink
    '#0ea5e9', // sky
  ],
} as const;

/**
 * Semantic color tokens resolved per color scheme. Used for inline props that
 * cannot use NativeWind `dark:` classes (e.g. lucide icon `color`, RN
 * `placeholderTextColor`, `tintColor`, StatusBar, navigation tint).
 *
 * `className` styling should still prefer Tailwind `dark:` variants; these
 * tokens exist for the imperative props that Tailwind can't reach.
 */
export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  /** Screen background (matches bg-slate-50 / dark:bg-slate-900). */
  background: string;
  /** Card / elevated surface (matches bg-white / dark:bg-slate-800). */
  surface: string;
  /** Secondary surface (matches bg-slate-100 / dark:bg-slate-800). */
  surfaceMuted: string;
  /** Hairline borders. */
  border: string;
  /** Primary text. */
  text: string;
  /** Secondary text / muted labels. */
  textMuted: string;
  /** Neutral icon color (default for non-accent icons). */
  icon: string;
  /** Low-emphasis icon / placeholder. */
  iconMuted: string;
  /** Brand accent (buttons, active tab, links, spinners). */
  primary: string;
  /** Placeholder text for inputs. */
  placeholder: string;
}

export const lightColors: ThemeColors = {
  background: colors.slate[50],
  surface: '#ffffff',
  surfaceMuted: colors.slate[100],
  border: colors.slate[200],
  text: colors.slate[900],
  textMuted: colors.slate[500],
  icon: colors.slate[700],
  iconMuted: colors.slate[400],
  primary: colors.indigo[600],
  placeholder: colors.slate[400],
};

export const darkColors: ThemeColors = {
  background: colors.slate[900],
  surface: colors.slate[800],
  surfaceMuted: colors.slate[700],
  border: colors.slate[700],
  text: colors.slate[50],
  textMuted: colors.slate[400],
  icon: colors.slate[300],
  iconMuted: colors.slate[500],
  primary: colors.indigo[400],
  placeholder: colors.slate[500],
};

export function getThemeColors(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? darkColors : lightColors;
}

export const statusColors = {
  PENDING: {
    bg: 'bg-amber-50 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/40',
    color: colors.amber[500],
  },
  CONFIRMED: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/40',
    color: colors.emerald[500],
  },
  CANCELLED: {
    bg: 'bg-slate-100 dark:bg-slate-700',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-600',
    color: colors.slate[500],
  },
  NO_SHOW: {
    bg: 'bg-rose-50 dark:bg-rose-500/20',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/40',
    color: colors.rose[500],
  },
  COMPLETED: {
    bg: 'bg-indigo-50 dark:bg-indigo-500/20',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-500/40',
    color: colors.indigo[500],
  },
} as const;

// Get color for appointment based on ID hash
export function getAppointmentColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const index = Math.abs(hash) % colors.appointmentPalette.length;
  return colors.appointmentPalette[index];
}
