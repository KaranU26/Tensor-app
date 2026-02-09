import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { ErrorBanner } from '@/components/ui';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const register = useAuthStore((state) => state.register);

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const passwordStrength = () => {
    if (!password) return 'Enter a password';
    if (password.length < 8) return 'Too short';
    if (password.length < 12) return 'Good';
    return 'Strong';
  };

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await register(email.trim(), password, username.trim() || undefined);
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      if (!hasOnboarded) {
        router.replace('/onboarding/setup-wizard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setError(error.message || 'Signup failed. Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = (provider: 'Apple' | 'Google') => {
    setError(`${provider} sign-up is coming soon.`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(50).duration(250)}>
            <View style={styles.header}>
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoRing}
              >
                <Text style={styles.logo}>🧘‍♂️</Text>
              </LinearGradient>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Start your fitness journey today
              </Text>
            </View>
          </Animated.View>

          {error ? (
            <ErrorBanner
              title="Couldn't sign up"
              message={error}
              actionLabel="Dismiss"
              onAction={() => setError('')}
              style={styles.errorBanner}
            />
          ) : null}

          <Animated.View entering={FadeInUp.delay(100).duration(250)}>
          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton} onPress={() => handleSocial('Apple')}>
              <Text style={styles.socialIcon}></Text>
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
            <Pressable style={styles.socialButton} onPress={() => handleSocial('Google')}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
          </View>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.delay(150).duration(250)}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="fitnessuser"
                placeholderTextColor={colors.textTertiary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
              <Text style={styles.helperText}>{passwordStrength()}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              />
              {isLoading ? (
                <ActivityIndicator color={colors.textInverse} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </Pressable>
          </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeInUp.delay(200).duration(250)}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
            </Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text style={styles.link}>Sign In</Text>
              </Pressable>
            </Link>
          </View>
          </Animated.View>

          {/* Terms */}
          <Animated.View entering={FadeInUp.delay(250).duration(250)}>
          <Text style={styles.terms}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 40,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorBanner: {
    marginBottom: spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  socialIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    color: colors.text,
  },
  socialText: {
    ...typography.subhead,
    color: colors.text,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.borderLight,
    color: colors.text,
  },
  helperText: {
    ...typography.caption2,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  button: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    overflow: 'hidden',
    ...shadows.glow,
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...typography.headline,
    color: colors.textInverse,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  footerText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  link: {
    ...typography.subhead,
    color: colors.accent,
    fontWeight: '600',
  },
  terms: {
    ...typography.caption2,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
