import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useTaskManager } from '@/hooks/use-task-manager';
import { SymbolIcon } from '@/components/symbol-icon';
import { createAppStyles } from '@/constants/styles';

/**
 * SettingsScreen allowing users to customize their profile settings.
 * Reuses global shared styles to minimize duplicate declarations and code size.
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { shared: sharedStyles, settings: styles } = createAppStyles(theme);
  const { profile, updateUserProfileName, loaded } = useTaskManager();

  const [name, setName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'completed'>('idle');

  useEffect(() => {
    if (loaded && profile) {
      setName(profile.getName());
    }
  }, [loaded, profile]);

  const handleSave = () => {
    if (!name.trim()) return;

    setSaveStatus('saving');
    setTimeout(async () => {
      await updateUserProfileName(name);
      setSaveStatus('completed');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  return (
    <View style={sharedStyles.container}>
      <View style={[sharedStyles.header, { paddingTop: insets.top, height: 64 + insets.top }]}>
        <View style={sharedStyles.headerContent}>
          <View style={sharedStyles.headerTitleContainer}>
            <SymbolIcon name="task_alt" color={theme.primary} size={28} style={sharedStyles.logoIcon} />
            <Text style={sharedStyles.headerTitle}>Configuración</Text>
          </View>
        </View>
      </View>

      <ScrollView style={sharedStyles.scrollView} contentContainerStyle={sharedStyles.scrollContent}>
        <SafeAreaView style={sharedStyles.safeArea} edges={['left', 'right']}>
          <View style={[styles.card, { backgroundColor: theme.surfaceContainerLowest, borderColor: theme.surfaceVariant }]}>
            {/* Header info */}
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, { backgroundColor: theme.primaryContainer }]}>
                <Text style={[styles.avatarText, { color: theme.onPrimaryContainer }]}>
                  {name ? name.substring(0, 2).toUpperCase() : 'U'}
                </Text>
              </View>
              <View style={styles.cardHeaderTitle}>
                <Text style={[styles.cardTitle, { color: theme.onSurface }]}>Tu Perfil</Text>
                <Text style={[styles.cardSubtitle, { color: theme.onSurfaceVariant }]}>
                  Personaliza cómo te ves en Taskly
                </Text>
              </View>
            </View>

            {/* Input Form */}
            <View style={styles.form}>
              <View style={sharedStyles.inputGroup}>
                <Text style={sharedStyles.label}>Nombre</Text>
                <TextInput
                  style={sharedStyles.input}
                  placeholder="Deyver"
                  placeholderTextColor={theme.outlineVariant}
                  value={name}
                  onChangeText={setName}
                  editable={saveStatus === 'idle'}
                />
              </View>

              {/* Save Button */}
              <View style={styles.btnRow}>
                <Pressable
                  style={({ pressed }) => [
                    sharedStyles.primaryButton,
                    { backgroundColor: saveStatus === 'completed' ? theme.secondary : theme.primary },
                    pressed && sharedStyles.primaryButtonPressed,
                  ]}
                  onPress={handleSave}
                  disabled={saveStatus !== 'idle'}
                >
                  <SymbolIcon name={saveStatus === 'completed' ? 'task_alt' : 'save'} color={theme.onPrimary} size={18} />
                  <Text style={sharedStyles.primaryButtonText}>
                    {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'completed' ? '¡Guardado!' : 'Guardar cambios'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
