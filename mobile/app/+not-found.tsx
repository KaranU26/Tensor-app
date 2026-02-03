import { StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui';
import { colors, spacing } from '@/config/theme';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.content}>
        <EmptyState
          type="search"
          customTitle="This screen doesn't exist"
          customMessage="The page you’re looking for moved or never existed."
          customEmoji="🧭"
        />
        <Button
          title="Go Home"
          onPress={() => router.replace('/')}
          fullWidth
          style={styles.button}
        />
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  button: {
    marginTop: spacing.lg,
  },
});
