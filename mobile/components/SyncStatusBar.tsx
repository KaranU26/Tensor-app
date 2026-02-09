/**
 * SyncStatusBar
 * Compact indicator showing offline/sync status
 */

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/config/theme';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export function SyncStatusBar() {
  const { status, pendingCount, isOnline, triggerSync, hasPendingChanges } = useOfflineSync();

  // Don't show anything when everything is fine
  if (isOnline && !hasPendingChanges && status !== 'error') {
    return null;
  }

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        text: 'Offline — changes will sync when connected',
        bgColor: colors.warning + '14',
        borderColor: colors.warning + '33',
        textColor: colors.warning,
        emoji: '📴',
      };
    }
    if (status === 'syncing') {
      return {
        text: 'Syncing...',
        bgColor: colors.primary + '14',
        borderColor: colors.primary + '33',
        textColor: colors.primary,
        emoji: '🔄',
      };
    }
    if (status === 'error') {
      return {
        text: 'Sync failed — tap to retry',
        bgColor: colors.error + '14',
        borderColor: colors.error + '33',
        textColor: colors.error,
        emoji: '⚠️',
      };
    }
    if (hasPendingChanges) {
      return {
        text: `${pendingCount} pending change${pendingCount !== 1 ? 's' : ''}`,
        bgColor: colors.accent + '14',
        borderColor: colors.accent + '33',
        textColor: colors.accent,
        emoji: '📤',
      };
    }
    return null;
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutUp.duration(200)}>
      <Pressable
        onPress={status === 'error' || hasPendingChanges ? triggerSync : undefined}
        style={[
          styles.container,
          { backgroundColor: config.bgColor, borderColor: config.borderColor },
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.text, { color: config.textColor }]}>{config.text}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 14,
  },
  text: {
    ...typography.caption1,
    flex: 1,
  },
});
