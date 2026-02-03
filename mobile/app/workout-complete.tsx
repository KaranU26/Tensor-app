/**
 * Workout Complete Modal Screen
 * Shows workout summary with share and health sync options
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeInUp,
} from 'react-native-reanimated';

import { ShareCard, type ShareCardData } from '@/components/ShareCard';
import { Button, Card } from '@/components/ui';
import { shareWorkoutCard, generateShareCaption } from '@/lib/shareToInstagram';
import { syncWorkoutToHealth, type WorkoutHealthData, requestHealthPermissions } from '@/lib/healthSync';
import { notifyWorkoutComplete } from '@/lib/notifications';
import { colors, typography, spacing, borderRadius } from '@/config/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WorkoutCompleteScreen() {
  const router = useRouter();
  const shareCardRef = useRef<View>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [healthSynced, setHealthSynced] = useState(false);

  // Get workout data from params (or use mock data)
  const params = useLocalSearchParams();
  
  const workoutData: ShareCardData = {
    workoutName: (params.name as string) || 'Push Day',
    date: new Date(),
    duration: Number(params.duration) || 45,
    exerciseCount: Number(params.exercises) || 5,
    setCount: Number(params.sets) || 18,
    totalVolume: Number(params.volume) || 12500,
    caloriesBurned: Number(params.calories) || 320,
    personalRecords: Number(params.prs) || 2,
  };

  // Animation values
  const celebrationScale = useSharedValue(0);
  
  useEffect(() => {
    // Trigger celebration animation
    celebrationScale.value = withDelay(
      200,
      withSpring(1, { damping: 8, stiffness: 150 })
    );
    
    // Send notification
    notifyWorkoutComplete(
      workoutData.workoutName,
      workoutData.duration,
      workoutData.totalVolume
    ).catch(console.error);
  }, []);

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationScale.value,
  }));

  const handleShare = async (platform: 'instagram' | 'twitter' | 'general') => {
    setIsSharing(true);
    try {
      const caption = generateShareCaption({
        workoutName: workoutData.workoutName,
        duration: workoutData.duration,
        totalVolume: workoutData.totalVolume,
        personalRecords: workoutData.personalRecords,
      });
      
      await shareWorkoutCard(shareCardRef, {
        platform,
        caption,
      });
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Share Failed', 'Unable to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleHealthSync = async () => {
    setIsSyncing(true);
    try {
      // Request permissions first
      const status = await requestHealthPermissions();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant health access to sync your workouts.'
        );
        setIsSyncing(false);
        return;
      }

      const healthData: WorkoutHealthData = {
        name: workoutData.workoutName,
        startDate: new Date(Date.now() - workoutData.duration * 60 * 1000),
        endDate: new Date(),
        caloriesBurned: workoutData.caloriesBurned || 0,
        duration: workoutData.duration,
        exerciseCount: workoutData.exerciseCount,
        totalVolume: workoutData.totalVolume,
      };

      const success = await syncWorkoutToHealth(healthData);
      if (success) {
        setHealthSynced(true);
        Alert.alert('Success', 'Workout synced to Health!');
      }
    } catch (error) {
      console.error('Health sync failed:', error);
      Alert.alert('Sync Failed', 'Unable to sync to Health. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header */}
        <Animated.View style={[styles.celebration, celebrationStyle]}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>Workout Complete!</Text>
          <Text style={styles.celebrationSubtitle}>Great job crushing it today</Text>
        </Animated.View>

        {/* Share Card Preview */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(400)}
          style={styles.cardContainer}
        >
          <ShareCard ref={shareCardRef} data={workoutData} />
        </Animated.View>

        {/* Share Options */}
        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <Card style={styles.shareCard}>
            <Text style={styles.sectionTitle}>Share Your Workout</Text>
            
            <View style={styles.shareButtons}>
              <AnimatedPressable
                style={[styles.shareButton, styles.instagramButton]}
                onPress={() => handleShare('instagram')}
                disabled={isSharing}
              >
                <Text style={styles.shareButtonEmoji}>📸</Text>
                <Text style={styles.shareButtonText}>Instagram</Text>
              </AnimatedPressable>
              
              <AnimatedPressable
                style={[styles.shareButton, styles.twitterButton]}
                onPress={() => handleShare('twitter')}
                disabled={isSharing}
              >
                <Text style={styles.shareButtonEmoji}>𝕏</Text>
                <Text style={styles.shareButtonText}>Twitter</Text>
              </AnimatedPressable>
              
              <AnimatedPressable
                style={[styles.shareButton, styles.moreButton]}
                onPress={() => handleShare('general')}
                disabled={isSharing}
              >
                <Text style={styles.shareButtonEmoji}>⋯</Text>
                <Text style={styles.shareButtonText}>More</Text>
              </AnimatedPressable>
            </View>
          </Card>
        </Animated.View>

        {/* Health Sync */}
        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <Card style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Text style={styles.healthEmoji}>❤️</Text>
              <View style={styles.healthTextContainer}>
                <Text style={styles.sectionTitle}>Sync to Health</Text>
                <Text style={styles.healthSubtitle}>
                  Save to Apple Health or Google Fit
                </Text>
              </View>
            </View>
            
            <Button
              title={healthSynced ? '✓ Synced' : 'Sync Now'}
              onPress={handleHealthSync}
              loading={isSyncing}
              disabled={healthSynced || isSyncing}
              variant={healthSynced ? 'secondary' : 'primary'}
            />
          </Card>
        </Animated.View>

        {/* Done Button */}
        <View style={styles.doneContainer}>
          <Button
            title="Done"
            onPress={handleDone}
            variant="secondary"
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  celebration: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  celebrationTitle: {
    ...typography.largeTitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  celebrationSubtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  shareCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.accent,
    marginBottom: spacing.md,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  shareButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  instagramButton: {
    backgroundColor: colors.primary + '12',
    borderColor: colors.primary + '33',
  },
  twitterButton: {
    backgroundColor: colors.accent + '12',
    borderColor: colors.accent + '33',
  },
  moreButton: {
    backgroundColor: colors.surface,
  },
  shareButtonEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  shareButtonText: {
    ...typography.caption1,
    color: colors.text,
    fontWeight: '600',
  },
  healthCard: {
    marginBottom: spacing.xl,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  healthEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  healthTextContainer: {
    flex: 1,
  },
  healthSubtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  doneContainer: {
    marginTop: spacing.md,
  },
});
