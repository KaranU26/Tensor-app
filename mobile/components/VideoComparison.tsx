/**
 * VideoComparison
 * Side-by-side or swipe comparison of two progress recordings
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Pressable, Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { playHaptic } from '@/lib/sounds';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProgressVideo {
  id: string;
  videoUrl: string;
  uploadedAt: string;
}

interface VideoComparisonProps {
  videos: ProgressVideo[];
  onClose?: () => void;
}

export function VideoComparison({ videos, onClose }: VideoComparisonProps) {
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(Math.min(1, videos.length - 1));

  if (videos.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyTitle}>Not enough recordings</Text>
        <Text style={styles.emptyText}>
          Record at least 2 progress videos to compare your improvement.
        </Text>
      </View>
    );
  }

  const leftVideo = videos[leftIndex];
  const rightVideo = videos[rightIndex];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const selectVideo = (side: 'left' | 'right', direction: 'prev' | 'next') => {
    playHaptic('light');
    if (side === 'left') {
      setLeftIndex((prev) => {
        const next = direction === 'prev' ? prev - 1 : prev + 1;
        return Math.max(0, Math.min(videos.length - 1, next));
      });
    } else {
      setRightIndex((prev) => {
        const next = direction === 'prev' ? prev - 1 : prev + 1;
        return Math.max(0, Math.min(videos.length - 1, next));
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress Comparison</Text>
        {onClose && (
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
        )}
      </View>

      {/* Side by side */}
      <View style={styles.comparisonRow}>
        {/* Left (older) */}
        <View style={styles.videoSide}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateLabel}>Before</Text>
            <Text style={styles.dateText}>{formatDate(leftVideo.uploadedAt)}</Text>
          </View>
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: leftVideo.videoUrl }}
              style={styles.media}
              resizeMode="cover"
            />
          </View>
          <View style={styles.navRow}>
            <Pressable
              onPress={() => selectVideo('left', 'prev')}
              disabled={leftIndex === 0}
              style={[styles.navBtn, leftIndex === 0 && styles.navBtnDisabled]}
            >
              <Text style={styles.navBtnText}>‹</Text>
            </Pressable>
            <Text style={styles.navLabel}>{leftIndex + 1}/{videos.length}</Text>
            <Pressable
              onPress={() => selectVideo('left', 'next')}
              disabled={leftIndex >= videos.length - 1}
              style={[styles.navBtn, leftIndex >= videos.length - 1 && styles.navBtnDisabled]}
            >
              <Text style={styles.navBtnText}>›</Text>
            </Pressable>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Right (newer) */}
        <View style={styles.videoSide}>
          <View style={[styles.dateBadge, styles.dateBadgeCurrent]}>
            <Text style={styles.dateLabel}>After</Text>
            <Text style={styles.dateText}>{formatDate(rightVideo.uploadedAt)}</Text>
          </View>
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: rightVideo.videoUrl }}
              style={styles.media}
              resizeMode="cover"
            />
          </View>
          <View style={styles.navRow}>
            <Pressable
              onPress={() => selectVideo('right', 'prev')}
              disabled={rightIndex === 0}
              style={[styles.navBtn, rightIndex === 0 && styles.navBtnDisabled]}
            >
              <Text style={styles.navBtnText}>‹</Text>
            </Pressable>
            <Text style={styles.navLabel}>{rightIndex + 1}/{videos.length}</Text>
            <Pressable
              onPress={() => selectVideo('right', 'next')}
              disabled={rightIndex >= videos.length - 1}
              style={[styles.navBtn, rightIndex >= videos.length - 1 && styles.navBtnDisabled]}
            >
              <Text style={styles.navBtnText}>›</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const SIDE_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title3,
    color: colors.text,
  },
  closeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.full,
  },
  closeBtnText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  videoSide: {
    flex: 1,
  },
  dateBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  dateBadgeCurrent: {
    backgroundColor: colors.accent + '14',
    borderColor: colors.accent + '33',
  },
  dateLabel: {
    ...typography.caption2,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateText: {
    ...typography.caption1,
    color: colors.text,
    marginTop: 1,
  },
  mediaContainer: {
    aspectRatio: 9 / 16,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navBtnText: {
    ...typography.title3,
    color: colors.textSecondary,
  },
  navLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default VideoComparison;
