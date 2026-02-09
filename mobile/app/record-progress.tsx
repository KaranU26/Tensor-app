/**
 * Record Progress Screen
 * Capture video/photo of flexibility progress for ROM tracking
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Href } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, typography, spacing, borderRadius, shadows } from '@/config/theme';
import { Card, Button } from '@/components/ui';
import { playHaptic } from '@/lib/sounds';
import { fetchWithAuth } from '@/lib/api/fetchWithAuth';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function RecordProgressScreen() {
  const { goalId, goalName } = useLocalSearchParams<{ goalId: string; goalName?: string }>();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [uploading, setUploading] = useState(false);

  const pickFromCamera = async (type: 'video' | 'image') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to record progress.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: type === 'video'
        ? ImagePicker.MediaTypeOptions.Videos
        : ImagePicker.MediaTypeOptions.Images,
      videoMaxDuration: 30,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(type);
      playHaptic('success');
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
      playHaptic('success');
    }
  };

  const handleUpload = async () => {
    if (!mediaUri || !goalId) return;

    setUploading(true);
    try {
      // For MVP, save the local URI reference
      // In production, upload to cloud storage (S3/GCS) first
      const response = await fetchWithAuth(`/flexibility-goals/${goalId}/videos`, {
        method: 'POST',
        body: JSON.stringify({ videoUrl: mediaUri }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress video');
      }

      playHaptic('success');
      Alert.alert(
        'Progress Saved!',
        'Your progress video has been recorded. Compare it with earlier recordings to see your improvement.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      playHaptic('error');
      Alert.alert('Upload Failed', error.message || 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <Animated.View entering={FadeInUp.delay(50).duration(250)}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>Record Progress</Text>
          {goalName && <Text style={styles.subtitle}>{goalName}</Text>}
        </View>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {mediaUri ? (
          // Preview
          <Animated.View entering={FadeInUp.delay(100).duration(250)}>
            <View style={styles.previewContainer}>
              <Card style={styles.previewCard}>
                {mediaType === 'image' ? (
                  <Image source={{ uri: mediaUri }} style={styles.preview} resizeMode="cover" />
                ) : (
                  <View style={styles.videoPreview}>
                    <Text style={styles.videoEmoji}>🎬</Text>
                    <Text style={styles.videoLabel}>Video recorded</Text>
                    <Text style={styles.videoSub}>Tap to re-record</Text>
                  </View>
                )}
              </Card>
              <Pressable
                onPress={() => { setMediaUri(null); playHaptic('light'); }}
                style={styles.retakeBtn}
              >
                <Text style={styles.retakeBtnText}>Re-record</Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          // Capture options
          <View style={styles.captureOptions}>
            <Animated.View entering={FadeInUp.delay(100).duration(250)}>
              <LinearGradient
                colors={gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.guideCard}
              >
                <Text style={styles.guideTitle}>Tips for best results</Text>
                <Text style={styles.guideText}>
                  1. Stand sideways to the camera{'\n'}
                  2. Perform the full range of motion slowly{'\n'}
                  3. Record for 15–30 seconds{'\n'}
                  4. Use consistent positioning each time
                </Text>
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(250)}>
              <View style={styles.captureRow}>
                <Pressable
                  onPress={() => { playHaptic('selection'); pickFromCamera('video'); }}
                  style={styles.captureCard}
                >
                  <Text style={styles.captureEmoji}>🎥</Text>
                  <Text style={styles.captureLabel}>Record Video</Text>
                  <Text style={styles.captureSub}>30 sec max</Text>
                </Pressable>

                <Pressable
                  onPress={() => { playHaptic('selection'); pickFromCamera('image'); }}
                  style={styles.captureCard}
                >
                  <Text style={styles.captureEmoji}>📸</Text>
                  <Text style={styles.captureLabel}>Take Photo</Text>
                  <Text style={styles.captureSub}>Quick snapshot</Text>
                </Pressable>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(250).duration(250)}>
              <Pressable
                onPress={() => { playHaptic('light'); pickFromGallery(); }}
                style={styles.galleryBtn}
              >
                <Text style={styles.galleryBtnText}>Choose from gallery</Text>
              </Pressable>
            </Animated.View>
          </View>
        )}
      </View>

      {/* Footer */}
      {mediaUri && (
        <Animated.View entering={FadeInUp.delay(200).duration(250)}>
          <View style={styles.footer}>
            <Button
              title={uploading ? 'Saving...' : 'Save Progress'}
              onPress={handleUpload}
              size="lg"
              fullWidth
              disabled={uploading}
            />
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  title: {
    ...typography.title1,
    color: colors.text,
  },
  subtitle: {
    ...typography.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  // Capture options
  captureOptions: {
    flex: 1,
  },
  guideCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  guideTitle: {
    ...typography.headline,
    color: colors.textInverse,
    marginBottom: spacing.sm,
  },
  guideText: {
    ...typography.subhead,
    color: colors.textInverse,
    opacity: 0.9,
    lineHeight: 22,
  },
  captureRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  captureCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  captureEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  captureLabel: {
    ...typography.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  captureSub: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  galleryBtn: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
  },
  galleryBtnText: {
    ...typography.callout,
    color: colors.accent,
  },
  // Preview
  previewContainer: {
    flex: 1,
    alignItems: 'center',
  },
  previewCard: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 400,
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  videoPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  videoEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  videoLabel: {
    ...typography.headline,
    color: colors.text,
  },
  videoSub: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  retakeBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.full,
  },
  retakeBtnText: {
    ...typography.callout,
    color: colors.accent,
  },
  // Footer
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
