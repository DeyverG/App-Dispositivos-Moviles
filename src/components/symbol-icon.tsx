import React from 'react';
import { Platform, Text, StyleSheet } from 'react-native';
import { SymbolView } from 'expo-symbols';

// Type representing the icon names used in our Taskly application
export type IconName =
  | 'smart_toy'
  | 'add'
  | 'task_alt'
  | 'settings'
  | 'flag'
  | 'schedule'
  | 'delete'
  | 'close'
  | 'save';

interface SymbolIconProps {
  name: IconName;
  size?: number;
  color: string;
  style?: any;
}

/**
 * Reusable icon component that resolves icon designs across iOS, Android, and Web.
 * Encapsulates platform-specific mappings to provide a consistent appearance.
 */
export function SymbolIcon({ name, size = 24, color, style }: SymbolIconProps) {
  // Map our abstract icon names to iOS SF Symbols, Android Material icons, and Web text characters
  const mapping = {
    smart_toy: {
      ios: 'sparkles',
      android: 'smart_toy',
      web: '🤖',
    },
    add: {
      ios: 'plus',
      android: 'add',
      web: '+',
    },
    task_alt: {
      ios: 'checkmark.circle.fill',
      android: 'task_alt',
      web: '✓',
    },
    settings: {
      ios: 'gearshape.fill',
      android: 'settings',
      web: '⚙',
    },
    flag: {
      ios: 'flag.fill',
      android: 'flag',
      web: '🚩',
    },
    schedule: {
      ios: 'clock.fill',
      android: 'schedule',
      web: '🕒',
    },
    delete: {
      ios: 'trash.fill',
      android: 'delete',
      web: '🗑',
    },
    close: {
      ios: 'xmark',
      android: 'close',
      web: '✕',
    },
    save: {
      ios: 'square.and.arrow.down.fill',
      android: 'save',
      web: '💾',
    },
  };

  const currentMap = mapping[name];

  if (Platform.OS === 'web') {
    // Render text fallback on Web
    return (
      <Text style={[styles.webIcon, { fontSize: size, color }, style]}>
        {currentMap.web}
      </Text>
    );
  }

  // Render native Expo SymbolView on iOS and Android
  return (
    <SymbolView
      name={{
        ios: currentMap.ios as any,
        android: currentMap.android as any,
        web: currentMap.web as any,
      }}
      size={size}
      tintColor={color}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  webIcon: {
    fontFamily: 'sans-serif',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
