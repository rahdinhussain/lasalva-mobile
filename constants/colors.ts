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

export const statusColors = {
  PENDING: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    color: colors.amber[500],
  },
  CONFIRMED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    color: colors.emerald[500],
  },
  CANCELLED: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    color: colors.slate[500],
  },
  NO_SHOW: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    color: colors.rose[500],
  },
  COMPLETED: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
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
