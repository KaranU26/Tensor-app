/**
 * ShareCard Component
 * Generates a shareable workout summary card for Instagram Stories
 */

import React, { forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const CARD_HEIGHT = CARD_WIDTH * 1.5; // 2:3 ratio for Stories

export interface ShareCardData {
  workoutName: string;
  date: Date;
  duration: number; // minutes
  exerciseCount: number;
  setCount: number;
  totalVolume: number; // lbs
  caloriesBurned?: number;
  personalRecords?: number;
  userPhoto?: string;
}

interface ShareCardProps {
  data: ShareCardData;
}

export const ShareCard = forwardRef<View, ShareCardProps>(({ data }, ref) => {
  const formattedDate = data.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View ref={ref} style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.gradientBg}>
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appBrand}>💪 TRAINING</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>

        {/* Workout Title */}
        <View style={styles.titleSection}>
          <Text style={styles.workoutName}>{data.workoutName}</Text>
          <Text style={styles.completedText}>WORKOUT COMPLETED</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.duration}</Text>
            <Text style={styles.statLabel}>MINUTES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.exerciseCount}</Text>
            <Text style={styles.statLabel}>EXERCISES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.setCount}</Text>
            <Text style={styles.statLabel}>SETS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{data.totalVolume.toLocaleString()}</Text>
            <Text style={styles.statLabel}>LBS MOVED</Text>
          </View>
        </View>

        {/* Extra stats */}
        {(data.caloriesBurned || data.personalRecords) && (
          <View style={styles.extraStats}>
            {data.caloriesBurned && (
              <View style={styles.extraStatItem}>
                <Text style={styles.extraEmoji}>🔥</Text>
                <Text style={styles.extraValue}>{data.caloriesBurned} cal</Text>
              </View>
            )}
            {data.personalRecords && data.personalRecords > 0 && (
              <View style={styles.extraStatItem}>
                <Text style={styles.extraEmoji}>🏆</Text>
                <Text style={styles.extraValue}>{data.personalRecords} PRs</Text>
              </View>
            )}
          </View>
        )}

        {/* User photo placeholder */}
        {data.userPhoto && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: data.userPhoto }} style={styles.userPhoto} />
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🏋️</Text>
            <Text style={styles.appName}>Training App</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#16213e',
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBrand: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  workoutName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  completedText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    letterSpacing: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statBox: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: spacing.xs,
  },
  extraStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
  },
  extraStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  extraEmoji: {
    fontSize: 18,
  },
  extraValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  photoContainer: {
    alignItems: 'center',
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  footer: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logo: {
    fontSize: 20,
  },
  appName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
});

export default ShareCard;
