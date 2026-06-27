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
  | 'save'
  | 'logout'
  | 'error'
  | 'arrow_forward'
  | 'how_to_reg'
  | 'place';

interface SymbolIconProps {
  name: IconName;
  size?: number;
  color: string;
  style?: any;
}

// Map our abstract icon names to iOS SF Symbols, Android Material icons, and Web text characters
const mapping = new Map<IconName, { ios: string; android: string; web: string }>([
  ['smart_toy', { ios: 'sparkles', android: 'smart_toy', web: '🤖' }],
  ['add', { ios: 'plus', android: 'add', web: '+' }],
  ['task_alt', { ios: 'checkmark.circle.fill', android: 'task_alt', web: '✓' }],
  ['settings', { ios: 'gearshape.fill', android: 'settings', web: '⚙' }],
  ['flag', { ios: 'flag.fill', android: 'flag', web: '🚩' }],
  ['schedule', { ios: 'clock.fill', android: 'schedule', web: '🕒' }],
  ['delete', { ios: 'trash.fill', android: 'delete', web: '🗑' }],
  ['close', { ios: 'xmark', android: 'close', web: '✕' }],
  ['save', { ios: 'square.and.arrow.down.fill', android: 'save', web: '💾' }],
  ['logout', { ios: 'arrow.left.square.fill', android: 'logout', web: '🚪' }],
  ['error', { ios: 'exclamationmark.triangle.fill', android: 'error', web: '⚠️' }],
  ['arrow_forward', { ios: 'arrow.right.circle.fill', android: 'arrow_forward', web: '➔' }],
  ['how_to_reg', { ios: 'person.badge.plus.fill', android: 'how_to_reg', web: '👤+' }],
  ['place', { ios: 'mappin.and.ellipse', android: 'place', web: '📍' }],
]);

export function SymbolIcon({ name, size = 24, color, style }: SymbolIconProps) {
  const currentMap = mapping.get(name);
  if (!currentMap) return null;

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
