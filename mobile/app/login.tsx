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
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { useAuthStore } from '@/store/authStore';
import { colors, typography, spacing, borderRadius } from '@/config/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, register } = useAuthStore();
  const buttonScale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
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
      router.replace('/(tabs)');
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
          locations={[0.2, 0.5, 1]}
          style={styles.gradient}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Your personal{'\n'}fitness coach
              </Text>
              <Text style={styles.subtitle}>
                —anytime, anywhere.
              </Text>
              <Text style={styles.description}>
                Personalized plans, real-time tracking,{'\n'}and results that last.
              </Text>
            </View>

            <View style={styles.formContainer}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <AnimatedPressable
                style={[styles.button, animatedButtonStyle]}
                onPress={handleSubmit}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text} />
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
                    : "Already have an account? "}
                  <Text style={styles.switchTextBold}>
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </Text>
                </Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text,
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
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    color: colors.error,
    ...typography.footnote,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    ...typography.body,
    color: colors.textInverse,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  button: {
    backgroundColor: colors.textInverse,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    ...typography.headline,
    color: colors.text,
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
});
