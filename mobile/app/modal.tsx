import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card, Button } from '@/components/ui';
import { colors, typography, spacing } from '@/config/theme';

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Coming Soon</Text>
          <Text style={styles.subtitle}>
            We’re polishing this feature. It’ll land shortly.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="secondary"
            fullWidth
            style={styles.button}
          />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.sm,
  },
});
