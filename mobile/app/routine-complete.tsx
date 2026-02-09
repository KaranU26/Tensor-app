import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Button, Card } from '@/components/ui';
import { colors, gradients, typography, spacing, borderRadius } from '@/config/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function RoutineCompleteScreen() {
  const { routineName, duration, stretchCount, streak } = useLocalSearchParams<{
    routineName: string;
    duration: string;
    stretchCount: string;
    streak: string;
  }>();

  const streakDays = parseInt(streak || '0');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100).duration(350)} style={{ alignItems: 'center' }}>
          <Text style={styles.emoji}>🎉</Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(250).duration(250)}>
          <Text style={styles.title}>Great Work!</Text>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(350).duration(250)}>
          <Text style={styles.subtitle}>You completed {routineName}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(250)} style={{ width: '100%' }}>
          <Card style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatDuration(parseInt(duration || '0'))}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stretchCount}</Text>
              <Text style={styles.statLabel}>Stretches</Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(550).duration(250)}>
          {streakDays > 0 && (
            <View style={styles.streakCard}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{streakDays} Day Streak!</Text>
            </View>
          )}
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(650).duration(250)}>
        <View style={styles.buttons}>
          <Button
            title="Done"
            onPress={() => router.replace('/(tabs)/stretching')}
            size="lg"
            fullWidth
          />
          <Button
            title="View Progress"
            onPress={() => router.replace('/(tabs)/progress')}
            variant="secondary"
            size="lg"
            fullWidth
            style={{ marginTop: spacing.md }}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '14',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '33',
  },
  streakEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  streakText: {
    ...typography.subhead,
    color: colors.accent,
  },
  buttons: {
    paddingBottom: spacing.xl,
  },
});
