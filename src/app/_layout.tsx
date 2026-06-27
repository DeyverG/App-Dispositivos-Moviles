import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import AuthScreen from '@/components/auth-screen';
import { useTaskManager } from '@/hooks/use-task-manager';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, authLoaded } = useTaskManager();

  let content;
  if (!authLoaded) {
    content = (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#191c1c' : '#f8faf9' }}>
        <ActivityIndicator size="large" color="#006a60" />
      </View>
    );
  } else if (user) {
    content = <AppTabs />;
  } else {
    content = <AuthScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {content}
    </ThemeProvider>
  );
}
