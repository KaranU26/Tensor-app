import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, gradients, shadows } from '@/config/theme';
import { getErrorMessage, type ErrorType } from '@/lib/errorMessages';

interface ErrorBannerProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  emoji?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function ErrorBanner({
  type = 'unknown',
  title,
  message,
  emoji,
  actionLabel,
  onAction,
  style,
}: ErrorBannerProps) {
  const defaults = getErrorMessage(type);
  const displayTitle = title ?? defaults.title;
  const displayMessage = message ?? defaults.message;
  const displayEmoji = emoji ?? defaults.emoji ?? '⚠️';
  const displayAction = actionLabel ?? defaults.action;

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.accent}
      />
      <View style={styles.content}>
        <Text style={styles.emoji}>{displayEmoji}</Text>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{displayTitle}</Text>
          <Text style={styles.message}>{displayMessage}</Text>
        </View>
      </View>
      {displayAction && onAction && (
        <Pressable style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{displayAction}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    ...shadows.sm,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 20,
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 2,
  },
  message: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  action: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.accent + '12',
    borderWidth: 1,
    borderColor: colors.accent + '33',
  },
  actionText: {
    ...typography.caption2,
    color: colors.accent,
  },
});

export default ErrorBanner;
