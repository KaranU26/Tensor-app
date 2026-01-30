import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';

export default function RoutineCompleteScreen() {
  const { routineName, duration, stretchCount } = useLocalSearchParams<{
    routineName: string;
    duration: string;
    stretchCount: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={[styles.title, isDark && styles.textLight]}>Great Work!</Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          You completed {routineName}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.textLight]}>
              {formatDuration(parseInt(duration || '0'))}
            </Text>
            <Text style={[styles.statLabel, isDark && styles.subtitleDark]}>Duration</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isDark && styles.textLight]}>{stretchCount}</Text>
            <Text style={[styles.statLabel, isDark && styles.subtitleDark]}>Stretches</Text>
          </View>
        </View>

        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>5 Day Streak!</Text>
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)/stretching')}
        >
          <Text style={styles.primaryButtonText}>Done</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)/progress')}
        >
          <Text style={styles.secondaryButtonText}>View Progress</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#0d0d1a',
  },
  textLight: {
    color: '#ffffff',
  },
  subtitleDark: {
    color: '#888',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  streakEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
  },
  buttons: {
    paddingBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '500',
  },
});
