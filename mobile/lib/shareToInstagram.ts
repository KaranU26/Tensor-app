/**
 * Share to Instagram Service
 * Generates workout summary images and shares to Instagram Stories
 */

import { Platform, Linking, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export interface ShareOptions {
  platform?: 'instagram' | 'twitter' | 'general';
  includeCaption?: boolean;
  caption?: string;
}

/**
 * Capture a view as an image
 */
export async function captureViewAsImage(
  viewRef: RefObject<View | null>,
  filename: string = 'workout-share'
): Promise<string | null> {
  if (!viewRef.current) {
    console.error('[Share] No view ref provided');
    return null;
  }

  try {
    // Capture the view as a PNG
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    console.log('[Share] Image captured:', uri);
    return uri;
  } catch (error) {
    console.error('[Share] Failed to capture view:', error);
    return null;
  }
}

/**
 * Share image to Instagram Stories
 */
export async function shareToInstagramStories(imageUri: string): Promise<boolean> {
  try {
    // Check if Instagram is installed
    const instagramUrl = 'instagram://';
    const canOpen = await Linking.canOpenURL(instagramUrl);

    if (!canOpen) {
      Alert.alert(
        'Instagram Not Found',
        'Please install Instagram to share your workout.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (Platform.OS === 'ios') {
      // iOS: Use Instagram's URL scheme for Stories
      // Move file to a sharable location
      const filename = `workout-${Date.now()}.png`;
      const newPath = `${FileSystem.documentDirectory || ''}${filename}`;
      
      await FileSystem.copyAsync({
        from: imageUri,
        to: newPath,
      });

      // For iOS, we need to use the pasteboard approach
      // This is a simplified version - full implementation needs native module
      const shareUrl = `instagram-stories://share?source_application=com.trainingapp`;
      
      const canShareToStories = await Linking.canOpenURL(shareUrl);
      if (canShareToStories) {
        await Linking.openURL(shareUrl);
        return true;
      } else {
        // Fallback to general share
        return shareGeneral(newPath);
      }
    } else {
      // Android: Use sharing intent
      return shareGeneral(imageUri);
    }
  } catch (error) {
    console.error('[Share] Instagram share failed:', error);
    return false;
  }
}

/**
 * Share using the system share sheet
 */
export async function shareGeneral(imageUri: string, message?: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      Alert.alert('Sharing Not Available', 'Sharing is not available on this device.');
      return false;
    }

    await Sharing.shareAsync(imageUri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your workout!',
      UTI: 'public.png',
    });

    return true;
  } catch (error) {
    console.error('[Share] General share failed:', error);
    return false;
  }
}

/**
 * Share to Twitter/X
 */
export async function shareToTwitter(imageUri: string, text: string = ''): Promise<boolean> {
  try {
    // First share the image, then open Twitter with text
    const encoded = encodeURIComponent(text);
    const twitterUrl = `twitter://post?message=${encoded}`;
    const webUrl = `https://twitter.com/intent/tweet?text=${encoded}`;

    // Share the image first
    await shareGeneral(imageUri);

    // Then try to open Twitter with pre-filled text
    const canOpenTwitter = await Linking.canOpenURL(twitterUrl);
    if (canOpenTwitter) {
      await Linking.openURL(twitterUrl);
    } else {
      await Linking.openURL(webUrl);
    }

    return true;
  } catch (error) {
    console.error('[Share] Twitter share failed:', error);
    return false;
  }
}

/**
 * Create share caption
 */
export function generateShareCaption(data: {
  workoutName: string;
  duration: number;
  totalVolume: number;
  personalRecords?: number;
}): string {
  let caption = `💪 Just crushed ${data.workoutName}!\n`;
  caption += `⏱️ ${data.duration} min | 🏋️ ${data.totalVolume.toLocaleString()} lbs\n`;
  
  if (data.personalRecords && data.personalRecords > 0) {
    caption += `🏆 ${data.personalRecords} new PR${data.personalRecords > 1 ? 's' : ''}!\n`;
  }
  
  caption += '\n#TrainingApp #Fitness #GymLife';
  
  return caption;
}

/**
 * Complete share flow: capture view and share
 */
export async function shareWorkoutCard(
  viewRef: RefObject<View | null>,
  options: ShareOptions = {}
): Promise<boolean> {
  const { platform = 'general' } = options;

  // Capture the card
  const imageUri = await captureViewAsImage(viewRef);
  if (!imageUri) {
    Alert.alert('Error', 'Failed to create share image. Please try again.');
    return false;
  }

  // Share based on platform
  switch (platform) {
    case 'instagram':
      return shareToInstagramStories(imageUri);
    case 'twitter':
      return shareToTwitter(imageUri, options.caption);
    default:
      return shareGeneral(imageUri);
  }
}

export default {
  captureViewAsImage,
  shareToInstagramStories,
  shareGeneral,
  shareToTwitter,
  generateShareCaption,
  shareWorkoutCard,
};
