import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { useTaskManager } from '@/hooks/use-task-manager';
import { SymbolIcon } from '@/components/symbol-icon';
import { Spacing } from '@/constants/theme';

export default function AuthScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useTaskManager();

  // Animation values
  const [flipAnim] = useState(() => new Animated.Value(0));

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // General state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Trigger flip animation to register
  const flipToRegister = () => {
    setError(null);
    setIsRegistering(true);
    Animated.spring(flipAnim, {
      toValue: 180,
      friction: 8,
      tension: 10,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  // Trigger flip animation to login
  const flipToLogin = () => {
    setError(null);
    setIsRegistering(false);
    Animated.spring(flipAnim, {
      toValue: 0,
      friction: 8,
      tension: 10,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  // Interpolate rotation values
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Interpolate opacity so components on the back side don't bleed through on Android/Web
  const frontOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  // Form handlers
  const handleLogin = async () => {
    const trimmedEmail = loginEmail.trim();
    const trimmedPassword = loginPassword.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('El formato del correo electrónico es inválido.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signIn(trimmedEmail, trimmedPassword);
    } catch (e: any) {
      let errorMsg = 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') {
        errorMsg = 'Correo o contraseña incorrectos.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'El formato del correo es inválido.';
      } else if (e.code === 'auth/network-request-failed') {
        errorMsg = 'Error de conexión. Revisa tu acceso a internet.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const trimmedName = registerName.trim();
    const trimmedEmail = registerEmail.trim();
    const password = registerPassword;

    if (!trimmedName || !trimmedEmail || !password) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    // Name validation: letters, spaces, hyphens, accents (prevents script/HTML injection)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/;
    if (!nameRegex.test(trimmedName)) {
      setError('El nombre solo puede contener letras, espacios y guiones.');
      return;
    }

    if (trimmedName.length > 50) {
      setError('El nombre no puede superar los 50 caracteres.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('El formato del correo electrónico es inválido.');
      return;
    }

    // Password validation (8+ chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#\-_/\\:;=()[\]{}~+,^$|])[A-Za-z\d@$!%*?&.#\-_/\\:;=()[\]{}~+,^$|]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres y contener una mayúscula, una minúscula, un número y un carácter especial.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUp(trimmedName, trimmedEmail, password);
    } catch (e: any) {
      let errorMsg = 'Error al registrar usuario. Por favor, inténtalo de nuevo.';
      if (e.code === 'auth/email-already-in-use') {
        errorMsg = 'Este correo electrónico ya está registrado.';
      } else if (e.code === 'auth/invalid-email') {
        errorMsg = 'El formato del correo es inválido.';
      } else if (e.code === 'auth/weak-password') {
        errorMsg = 'La contraseña es muy débil (mínimo 6 caracteres).';
      } else if (e.code === 'auth/network-request-failed') {
        errorMsg = 'Error de conexión. Revisa tu acceso a internet.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.four }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header App Brand */}
        <View style={styles.header}>
          <SymbolIcon name="smart_toy" color={theme.primary} size={48} style={styles.logoIcon} />
          <Text style={[styles.appName, { color: theme.primary }]}>Taskly</Text>
          <Text style={[styles.appSubtitle, { color: theme.onSurfaceVariant }]}>
            Organiza tus tareas en tiempo real
          </Text>
        </View>

        {/* Card Container for 3D flip animation */}
        <View style={styles.cardContainer}>
          {/* FRONT CARD: Login */}
          <Animated.View
            pointerEvents={isRegistering ? 'none' : 'auto'}
            style={[
              styles.card,
              {
                backgroundColor: theme.surfaceContainerLowest,
                borderColor: theme.surfaceVariant,
                transform: [{ perspective: 1000 }, { rotateY: frontRotateY }],
                opacity: frontOpacity,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.onSurface }]}>¡Hola de nuevo!</Text>
            <Text style={[styles.cardSubtitleText, { color: theme.onSurfaceVariant }]}>
              Inicia sesión para continuar
            </Text>

            {error && !isRegistering && (
              <View style={[styles.errorContainer, { backgroundColor: theme.errorContainer }]}>
                <SymbolIcon name="error" color={theme.error} size={16} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>Correo Electrónico</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.surfaceVariant, color: theme.onSurface, backgroundColor: theme.surfaceContainerLow }]}
                  placeholder="usuario@correo.com"
                  placeholderTextColor={theme.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>Contraseña</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.surfaceVariant, color: theme.onSurface, backgroundColor: theme.surfaceContainerLow }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.outlineVariant}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  editable={!loading}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.primary },
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.onPrimary} size="small" />
                ) : (
                  <>
                    <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>Iniciar Sesión</Text>
                    <SymbolIcon name="arrow_forward" color={theme.onPrimary} size={18} />
                  </>
                )}
              </Pressable>

              <View style={styles.footerLinkContainer}>
                <Text style={[styles.footerText, { color: theme.onSurfaceVariant }]}>¿No tienes cuenta? </Text>
                <Pressable onPress={flipToRegister} disabled={loading}>
                  <Text style={[styles.footerLink, { color: theme.primary }]}>Regístrate</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* BACK CARD: Register */}
          <Animated.View
            pointerEvents={isRegistering ? 'auto' : 'none'}
            style={[
              styles.card,
              styles.backCard,
              {
                backgroundColor: theme.surfaceContainerLowest,
                borderColor: theme.surfaceVariant,
                transform: [{ perspective: 1000 }, { rotateY: backRotateY }],
                opacity: backOpacity,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.onSurface }]}>Crear Cuenta</Text>
            <Text style={[styles.cardSubtitleText, { color: theme.onSurfaceVariant }]}>
              Regístrate para comenzar a organizar
            </Text>

            {error && isRegistering && (
              <View style={[styles.errorContainer, { backgroundColor: theme.errorContainer }]}>
                <SymbolIcon name="error" color={theme.error} size={16} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>Nombre Completo</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.surfaceVariant, color: theme.onSurface, backgroundColor: theme.surfaceContainerLow }]}
                  placeholder="Tu nombre"
                  placeholderTextColor={theme.outlineVariant}
                  autoCapitalize="words"
                  value={registerName}
                  onChangeText={setRegisterName}
                  editable={!loading}
                />
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>Correo Electrónico</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.surfaceVariant, color: theme.onSurface, backgroundColor: theme.surfaceContainerLow }]}
                  placeholder="usuario@correo.com"
                  placeholderTextColor={theme.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={registerEmail}
                  onChangeText={setRegisterEmail}
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>Contraseña</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.surfaceVariant, color: theme.onSurface, backgroundColor: theme.surfaceContainerLow }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={theme.outlineVariant}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={registerPassword}
                  onChangeText={setRegisterPassword}
                  editable={!loading}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.secondary },
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.onPrimary} size="small" />
                ) : (
                  <>
                    <Text style={[styles.primaryButtonText, { color: theme.onPrimary }]}>Registrarse</Text>
                    <SymbolIcon name="how_to_reg" color={theme.onPrimary} size={18} />
                  </>
                )}
              </Pressable>

              <View style={styles.footerLinkContainer}>
                <Text style={[styles.footerText, { color: theme.onSurfaceVariant }]}>¿Ya tienes cuenta? </Text>
                <Pressable onPress={flipToLogin} disabled={loading}>
                  <Text style={[styles.footerLink, { color: theme.primary }]}>Inicia Sesión</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  logoIcon: {
    marginBottom: Spacing.one,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Quicksand',
  },
  appSubtitle: {
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
    textAlign: 'center',
    marginTop: 2,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    height: 480,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: Spacing.four,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2c694e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        backfaceVisibility: 'hidden',
        boxShadow: '0 4px 20px rgba(44,105,78,0.1)',
      },
    }),
  },
  backCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Quicksand',
  },
  cardSubtitleText: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
    marginTop: 2,
    marginBottom: Spacing.three,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: 8,
    marginBottom: Spacing.three,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Plus Jakarta Sans',
    fontWeight: '600',
    flex: 1,
  },
  form: {
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Plus Jakarta Sans',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 44,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    fontFamily: 'Plus Jakarta Sans',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 48,
    borderRadius: 24,
    marginTop: Spacing.two,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
  footerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  footerText: {
    fontSize: 13,
    fontFamily: 'Plus Jakarta Sans',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Plus Jakarta Sans',
  },
});
