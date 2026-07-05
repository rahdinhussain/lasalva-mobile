import { useTheme } from '@/context/ThemeContext';
import type { ColorScheme, ThemeColors } from '@/constants/colors';

/**
 * Reactive access to the active theme's color tokens for inline/imperative
 * props (lucide icon `color`, `placeholderTextColor`, `tintColor`, StatusBar,
 * etc.) that Tailwind `dark:` classes can't reach. Re-renders on theme change.
 */
export function useThemeColors(): ThemeColors & { scheme: ColorScheme } {
  const { colors, scheme } = useTheme();
  return { ...colors, scheme };
}
