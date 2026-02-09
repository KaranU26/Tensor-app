import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
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
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { Card, Button } from '@/components/ui';
import { playHaptic } from '@/lib/sounds';
import { PremiumButton } from '@/components/PremiumButton';
import { getDashboardStats, type DashboardStats } from '@/lib/api/strength';
import { Skeleton } from '@/components/AnimatedComponents';

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
  const [isDark, setIsDark] = React.useState(true); // Dark mode is default
  
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
  const { isPro } = useSubscriptionStore();
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getDashboardStats()
        .then(setDashStats)
        .catch((e) => console.log('Failed to fetch profile stats:', e));
    }
  }, [isAuthenticated]);

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
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      <ScrollView bounces={false} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          entering={FadeInUp.delay(50).duration(250)}
          style={styles.header}
        >
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account & preferences</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(250)}>
          <Card style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarRing}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarEmoji}>😊</Text>
                </View>
              </LinearGradient>
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

        {!isPro && (
          <Animated.View entering={FadeInUp.delay(130).duration(250)}>
            <Pressable onPress={() => router.push('/paywall')}>
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.proCard}
              >
                <View style={styles.proCardTop}>
                  <Text style={styles.proBadge}>TENSOR PRO</Text>
                  <Text style={styles.proTitle}>Unlock advanced analytics</Text>
                  <Text style={styles.proSubtitle}>
                    Track ROM progress, recovery insights, and unlimited routines.
                  </Text>
                </View>
                <PremiumButton
                  title="Upgrade to Pro"
                  onPress={() => router.push('/paywall')}
                  size="sm"
                  variant="secondary"
                  fullWidth
                  style={styles.proButton}
                />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* Quick Stats */}
        {isAuthenticated && (
          <View style={styles.statsRow}>
            <Animated.View entering={FadeInUp.delay(150).duration(250)} style={{ flex: 1 }}>
              <Card style={styles.statCard}>
                {dashStats ? (
                  <Text style={styles.statValue}>{dashStats.totalWorkouts}</Text>
                ) : (
                  <Skeleton width={32} height={24} borderRadius={6} />
                )}
                <Text style={styles.statLabel}>Workouts</Text>
              </Card>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(200).duration(250)} style={{ flex: 1 }}>
              <Card style={styles.statCard}>
                {dashStats ? (
                  <Text style={styles.statValue}>{dashStats.currentStreak}</Text>
                ) : (
                  <Skeleton width={24} height={24} borderRadius={6} />
                )}
                <Text style={styles.statLabel}>Day Streak</Text>
              </Card>
            </Animated.View>
            <Animated.View entering={FadeInUp.delay(250).duration(250)} style={{ flex: 1 }}>
              <Card style={styles.statCard}>
                {dashStats ? (
                  <Text style={styles.statValue}>{dashStats.personalRecords}</Text>
                ) : (
                  <Skeleton width={24} height={24} borderRadius={6} />
                )}
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
            onPress={() => router.push('/settings')}
            delay={350}
          />
          <SettingRow
            icon="🎯"
            title="Goals"
            subtitle="Fitness targets"
            onPress={() => router.push('/goals')}
            delay={400}
          />
          <SettingRow
            icon="📊"
            title="Body Metrics"
            subtitle="Weight, measurements"
            onPress={() => router.push('/body-metrics')}
            delay={450}
          />
          <SettingRow
            icon="🔔"
            title="Notifications"
            subtitle="Reminders, rest alerts"
            onPress={() => router.push('/notifications')}
            delay={500}
          />
          <SettingRow
            icon="📳"
            title="Haptics & Sounds"
            subtitle="Tactile feedback"
            onPress={() => router.push('/settings')}
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
            onPress={() => router.push('/settings')}
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
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  proCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  proCardTop: {
    marginBottom: spacing.md,
  },
  proBadge: {
    ...typography.caption1,
    color: colors.textInverse,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  proTitle: {
    ...typography.title3,
    color: colors.textInverse,
  },
  proSubtitle: {
    ...typography.subhead,
    color: colors.textInverse,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  proButton: {
    marginTop: spacing.sm,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    color: colors.accent,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '14',
    borderWidth: 1,
    borderColor: colors.primary + '33',
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
