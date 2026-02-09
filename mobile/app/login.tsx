import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { ErrorBanner } from '@/components/ui';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  const { login, register } = useAuthStore();
  const buttonScale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (!isLogin && password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');
      if (!hasOnboarded) {
        router.replace('/onboarding/setup-wizard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };
  
  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handleReset = async () => {
    if (!validateEmail(resetEmail)) {
      setResetStatus('idle');
      return;
    }
    setResetStatus('sending');
    setTimeout(() => {
      setResetStatus('sent');
    }, 900);
  };

  const handleSocial = (provider: 'Apple' | 'Google') => {
    setError(`${provider} sign-in is coming soon.`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(26, 18, 38, 0.2)', 'rgba(26, 18, 38, 0.85)', 'rgba(26, 18, 38, 0.95)']}
          locations={[0.1, 0.55, 1]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Tensor Training
              </Text>
              <Text style={styles.subtitle}>
                Strength, mobility, recovery.
              </Text>
              <Text style={styles.description}>
                Your complete training companion—{"\n"}track workouts and flexibility in one place.
              </Text>
            </View>

            <View style={styles.formContainer}>
              {error ? (
                <ErrorBanner
                  title="Couldn't sign in"
                  message={error}
                  actionLabel="Dismiss"
                  onAction={() => setError('')}
                />
              ) : null}

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

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Pressable style={styles.forgotButton} onPress={() => setResetVisible(true)}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <AnimatedPressable
                style={[styles.button, animatedButtonStyle]}
                onPress={handleSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
              >
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                />
                {loading ? (
                  <ActivityIndicator color={colors.textInverse} />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Get Started' : 'Create Account'}
                  </Text>
                )}
              </AnimatedPressable>

              <Pressable 
                style={styles.switchButton}
                onPress={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
                <Text style={styles.switchText}>
                  {isLogin 
                    ? "Don't have an account? " 
                    : 'Already have an account? '}
                  <Text style={styles.switchTextBold}>
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </Text>
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>

      <Modal
        visible={resetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResetVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>We’ll send a reset link to your email.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              placeholderTextColor={colors.textTertiary}
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {resetStatus === 'sent' && (
              <Text style={styles.modalSuccess}>Reset link sent. Check your inbox.</Text>
            )}
            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondary} onPress={() => setResetVisible(false)}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalPrimary} onPress={handleReset}>
                {resetStatus === 'sending' ? (
                  <ActivityIndicator color={colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Send</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: SCREEN_HEIGHT,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  textContainer: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.largeTitle,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.title1,
    color: colors.textInverse,
    marginBottom: spacing.lg,
  },
  description: {
    ...typography.body,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
  },
  formContainer: {
    gap: spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  socialIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    color: colors.textInverse,
  },
  socialText: {
    ...typography.subhead,
    color: colors.textInverse,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    ...typography.body,
    color: colors.textInverse,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    ...typography.caption1,
    color: 'rgba(255,255,255,0.7)',
  },
  button: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    overflow: 'hidden',
    ...shadows.glow,
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonText: {
    ...typography.headline,
    color: colors.textInverse,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  switchText: {
    ...typography.subhead,
    color: 'rgba(255,255,255,0.7)',
  },
  switchTextBold: {
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: colors.textInverse,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...typography.body,
    color: colors.text,
  },
  modalSuccess: {
    ...typography.caption1,
    color: colors.success,
    marginTop: spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  modalSecondary: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalSecondaryText: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  modalPrimary: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  modalPrimaryText: {
    ...typography.subhead,
    color: colors.textInverse,
  },
});
