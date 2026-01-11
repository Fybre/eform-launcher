import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export function useThemeColors() {
  const { effectiveColorScheme } = useTheme();
  return Colors[effectiveColorScheme];
}
