/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
import { ButtonColor } from '@/types/eform';

const tintColorLight = '#007AFF';
const tintColorDark = '#0A84FF';

export const ButtonColors = {
  light: {
    blue: '#007AFF',
    green: '#34C759',
    purple: '#AF52DE',
    orange: '#FF9500',
    red: '#FF3B30',
    pink: '#FF2D55',
    teal: '#5AC8FA',
  },
  dark: {
    blue: '#0A84FF',
    green: '#30D158',
    purple: '#BF5AF2',
    orange: '#FF9F0A',
    red: '#FF453A',
    pink: '#FF375F',
    teal: '#64D2FF',
  },
} as const;

export function getButtonColor(color: ButtonColor | undefined, colorScheme: 'light' | 'dark'): string {
  if (!color) {
    return ButtonColors[colorScheme].blue;
  }
  return ButtonColors[colorScheme][color];
}

export const Colors = {
  light: {
    text: '#000000',
    textSecondary: '#6B7280',
    background: '#F9FAFB',
    backgroundSecondary: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    border: '#E5E7EB',
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    danger: '#EF4444',
    success: '#10B981',
    primary: '#007AFF',
    primaryText: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    border: '#374151',
    card: '#1C1C1E',
    cardBorder: '#374151',
    danger: '#F87171',
    success: '#34D399',
    primary: '#0A84FF',
    primaryText: '#FFFFFF',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
