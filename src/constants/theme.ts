/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#191c1c',
    background: '#f8faf9',
    backgroundElement: '#f2f4f3',
    backgroundSelected: '#e6e9e8',
    textSecondary: '#3c4a47',
    primary: '#006a60',
    onPrimary: '#ffffff',
    primaryContainer: '#00bdab',
    onPrimaryContainer: '#00463e',
    secondary: '#2c694e',
    secondaryContainer: '#aeeecb',
    onSecondaryContainer: '#316e52',
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    surface: '#f8faf9',
    onSurface: '#191c1c',
    surfaceVariant: '#e1e3e2',
    onSurfaceVariant: '#3c4a47',
    outline: '#6c7a77',
    outlineVariant: '#bbcac6',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f2f4f3',
    surfaceContainer: '#eceeed',
    surfaceContainerHigh: '#e6e9e8',
    surfaceContainerHighest: '#e1e3e2',
    surfaceBright: '#f8faf9',
    surfaceDim: '#d8dada',
  },
  dark: {
    text: '#e1e3e2',
    background: '#191c1c',
    backgroundElement: '#1b1f1e',
    backgroundSelected: '#252928',
    textSecondary: '#bbcac6',
    primary: '#69f9e5',
    onPrimary: '#003731',
    primaryContainer: '#005048',
    onPrimaryContainer: '#8ef2df',
    secondary: '#95d4b3',
    onSecondary: '#003823',
    secondaryContainer: '#0e5138',
    onSecondaryContainer: '#b1f0ce',
    error: '#ffb4ab',
    errorContainer: '#93000a',
    surface: '#191c1c',
    onSurface: '#e1e3e2',
    surfaceVariant: '#3c4a47',
    onSurfaceVariant: '#bbcac6',
    outline: '#859591',
    outlineVariant: '#3c4a47',
    surfaceContainerLowest: '#0e1111',
    surfaceContainerLow: '#171b1a',
    surfaceContainer: '#1b1f1e',
    surfaceContainerHigh: '#252928',
    surfaceContainerHighest: '#303433',
    surfaceBright: '#343a39',
    surfaceDim: '#111414',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
