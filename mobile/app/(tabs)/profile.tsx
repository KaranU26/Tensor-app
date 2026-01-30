import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { useAuthStore } from '@/store/authStore';
import { Card, Button } from '@/components/ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingRow({ icon, title, subtitle, onPress, danger }: SettingRowProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.settingRow, animatedStyle]}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.settingEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.settingArrow}>›</Text>
    </AnimatedPressable>
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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
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

        {/* Quick Stats */}
        {isAuthenticated && (
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>PRs</Text>
            </Card>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <SettingRow
            icon="⚙️"
            title="Preferences"
            subtitle="Units, notifications"
            onPress={() => {}}
          />
          <SettingRow
            icon="🎯"
            title="Goals"
            subtitle="Fitness targets"
            onPress={() => {}}
          />
          <SettingRow
            icon="📊"
            title="Body Metrics"
            subtitle="Weight, measurements"
            onPress={() => {}}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingRow
            icon="❓"
            title="Help Center"
            onPress={() => {}}
          />
          <SettingRow
            icon="💬"
            title="Send Feedback"
            onPress={() => {}}
          />
          <SettingRow
            icon="⭐"
            title="Rate the App"
            onPress={() => {}}
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
            />
            <SettingRow
              icon="🚪"
              title="Log Out"
              onPress={handleLogout}
              danger
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
    flex: 1,
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
