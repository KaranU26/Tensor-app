import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  FadeInUp,
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows, gradients } from '@/config/theme';
import { useAuthStore } from '@/store/authStore';
import { Card, Button } from '@/components/ui';
import { GlassCard } from '@/components/GlassCard';
import { playHaptic } from '@/lib/sounds';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
  delay?: number;
}

function SettingRow({ icon, title, subtitle, onPress, danger, rightElement, delay = 0 }: SettingRowProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (onPress) {
      playHaptic('light');
      onPress();
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.settingRow, animatedStyle]}
        disabled={!onPress}
      >
        <View style={styles.settingIcon}>
          <Text style={styles.settingEmoji}>{icon}</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {rightElement || (onPress && <Text style={styles.settingArrow}>›</Text>)}
      </AnimatedPressable>
    </Animated.View>
  );
}

// Theme Toggle Component
interface ThemeToggleRowProps {
  delay?: number;
}

function ThemeToggleRow({ delay = 0 }: ThemeToggleRowProps) {
  const [isDark, setIsDark] = React.useState(false); // Will be controlled by ThemeContext
  
  const handleToggle = (value: boolean) => {
    playHaptic('selection');
    setIsDark(value);
    // TODO: When ThemeContext is wired up in _layout.tsx:
    // const { setMode } = useTheme();
    // setMode(value ? 'dark' : 'light');
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)}>
      <View style={styles.settingRow}>
        <View style={styles.settingIcon}>
          <Text style={styles.settingEmoji}>{isDark ? '🌙' : '☀️'}</Text>
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>Dark Mode</Text>
          <Text style={styles.settingSubtitle}>
            {isDark ? 'Dark theme active' : 'Light theme active'}
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={handleToggle}
          trackColor={{ 
            false: colors.border, 
            true: colors.primary 
          }}
          thumbColor={'#FFFFFF'}
        />
      </View>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            playHaptic('heavy');
            await logout();
            router.replace('/login');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView bounces={false} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.delay(50).duration(250)}
          style={styles.header}
        >
          <Text style={styles.title}>Profile</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(250)}>
          <Card style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>😊</Text>
              </View>
            </View>
            <Text style={styles.userName}>
              {isAuthenticated ? (user?.username || user?.email?.split('@')[0]) : 'Guest'}
            </Text>
            <Text style={styles.userEmail}>
              {isAuthenticated ? user?.email : 'Sign in to sync your data'}
            </Text>
            
            {!isAuthenticated && (
              <Button
                title="Sign In"
                onPress={() => router.push('/login')}
                style={{ marginTop: spacing.lg }}
                fullWidth
              />
            )}
          </Card>
        </Animated.View>

        {/* Quick Stats */}
        {isAuthenticated && (
          <View style={styles.statsRow}>
            <Animated.View entering={FadeInUp.delay(150).duration(250)} style={{ flex: 1 }}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </Card>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(200).duration(250)} style={{ flex: 1 }}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>5</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </Card>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(250).duration(250)} style={{ flex: 1 }}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>PRs</Text>
              </Card>
            </Animated.View>
          </View>
        )}

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <ThemeToggleRow delay={300} />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <SettingRow
            icon="⚙️"
            title="Preferences"
            subtitle="Units, notifications"
            onPress={() => {}}
            delay={350}
          />
          <SettingRow
            icon="🎯"
            title="Goals"
            subtitle="Fitness targets"
            onPress={() => {}}
            delay={400}
          />
          <SettingRow
            icon="📊"
            title="Body Metrics"
            subtitle="Weight, measurements"
            onPress={() => {}}
            delay={450}
          />
          <SettingRow
            icon="🔔"
            title="Notifications"
            subtitle="Reminders, rest alerts"
            onPress={() => {}}
            delay={500}
          />
          <SettingRow
            icon="📳"
            title="Haptics & Sounds"
            subtitle="Tactile feedback"
            onPress={() => {}}
            delay={550}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingRow
            icon="❓"
            title="Help Center"
            onPress={() => {}}
            delay={600}
          />
          <SettingRow
            icon="💬"
            title="Send Feedback"
            onPress={() => {}}
            delay={650}
          />
          <SettingRow
            icon="⭐"
            title="Rate the App"
            onPress={() => {}}
            delay={700}
          />
        </View>

        {/* Account */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <SettingRow
              icon="🔒"
              title="Privacy"
              onPress={() => {}}
              delay={750}
            />
            <SettingRow
              icon="🚪"
              title="Log Out"
              onPress={handleLogout}
              danger
              delay={800}
            />
          </View>
        )}

        <Text style={styles.version}>Version 1.0.0</Text>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  userName: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    ...typography.title2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingEmoji: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.headline,
    color: colors.text,
  },
  settingSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingArrow: {
    ...typography.title2,
    color: colors.textTertiary,
  },
  dangerText: {
    color: colors.error,
  },
  version: {
    ...typography.caption1,
    color: colors.textTertiary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  bottomSpacer: {
    height: 100,
  },
});

