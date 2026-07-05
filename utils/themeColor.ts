import { colorScheme } from 'nativewind';
import { getThemeColors, type ThemeColors } from '@/constants/colors';

/**
 * Non-hook access to the active theme's color tokens, for inline props (lucide
 * icon `color`, `placeholderTextColor`, etc.) in components where adding the
 * `useTheme` hook would be noisy.
 *
 * Reactivity: this reads NativeWind's current color scheme at call time. It does
 * not itself subscribe, but every screen using it also renders `dark:` Tailwind
 * classes, whose cssInterop subscription re-renders the component when the
 * scheme flips — at which point this re-resolves to the new colors. Prefer
 * `useThemeColors()` in components that have no `dark:` classes of their own.
 */
export function themeColor(): ThemeColors {
  return getThemeColors(colorScheme.get() === 'dark' ? 'dark' : 'light');
}
