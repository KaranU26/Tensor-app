/**
 * Sound System
 * Premium audio feedback for app interactions
 * 
 * Implements "Sonic Identity" from premium UX research:
 * - Organic sounds (glass, wood, metal) rather than synthesized beeps
 * - Synchronized with haptics for multi-sensory coherence
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Sound effect types
export type SoundEffect = 
  | 'tap'           // Subtle wood tap - button presses
  | 'success'       // Glass ping - set completion
  | 'complete'      // Triumphant - workout complete
  | 'error'         // Low thud - errors
  | 'delete'        // Heavy thud - destructive actions
  | 'notification'  // Gentle chime - alerts
  | 'rest_complete' // Rising chime - rest timer done
  | 'pr'            // Fanfare - personal record
  | 'toggle';       // Click - toggles/switches

// Sound configuration
interface SoundConfig {
  // Using built-in system sounds initially
  // Can be replaced with custom audio files
  haptic: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType | null;
  volume: number;
  pitch?: number;
}

const SOUND_CONFIG: Record<SoundEffect, SoundConfig> = {
  tap: {
    haptic: Haptics.ImpactFeedbackStyle.Light,
    volume: 0.3,
  },
  success: {
    haptic: Haptics.NotificationFeedbackType.Success,
    volume: 0.5,
  },
  complete: {
    haptic: Haptics.NotificationFeedbackType.Success,
    volume: 0.7,
  },
  error: {
    haptic: Haptics.NotificationFeedbackType.Error,
    volume: 0.4,
  },
  delete: {
    haptic: Haptics.ImpactFeedbackStyle.Heavy,
    volume: 0.5,
  },
  notification: {
    haptic: Haptics.ImpactFeedbackStyle.Medium,
    volume: 0.4,
  },
  rest_complete: {
    haptic: Haptics.NotificationFeedbackType.Warning,
    volume: 0.6,
  },
  pr: {
    haptic: Haptics.NotificationFeedbackType.Success,
    volume: 0.8,
  },
  toggle: {
    haptic: Haptics.ImpactFeedbackStyle.Light,
    volume: 0.2,
  },
};

// Audio cache
const soundCache: Map<string, Audio.Sound> = new Map();
let audioEnabled = true;
let hapticsEnabled = true;

/**
 * Initialize the audio system
 */
export async function initAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false, // Respect silent mode
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (error) {
    console.warn('[Sound] Failed to initialize audio:', error);
  }
}

/**
 * Play a sound effect with synchronized haptics
 */
export async function playSound(effect: SoundEffect): Promise<void> {
  const config = SOUND_CONFIG[effect];
  
  // Play haptic first (synchronous feel)
  if (hapticsEnabled && config.haptic !== null && Platform.OS !== 'web') {
    try {
      if (typeof config.haptic === 'string' && config.haptic.includes('Notification')) {
        await Haptics.notificationAsync(config.haptic as Haptics.NotificationFeedbackType);
      } else {
        await Haptics.impactAsync(config.haptic as Haptics.ImpactFeedbackStyle);
      }
    } catch (e) {
      // Haptics may not be available
    }
  }
  
  // Audio would be played here if we had sound files
  // For now, haptics provide the feedback
  // TODO: Add actual sound files to assets/sounds/
}

/**
 * Play haptic only (no sound)
 */
export function playHaptic(
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'
): void {
  if (!hapticsEnabled || Platform.OS === 'web') return;
  
  try {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
    }
  } catch (e) {
    // Haptics not available
  }
}

/**
 * Rich haptic patterns for premium interactions
 */
export async function playRichHaptic(pattern: 'double_tap' | 'success_burst' | 'error_shake' | 'celebration'): Promise<void> {
  if (!hapticsEnabled || Platform.OS === 'web') return;
  
  try {
    switch (pattern) {
      case 'double_tap':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await new Promise(r => setTimeout(r, 100));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
        
      case 'success_burst':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await new Promise(r => setTimeout(r, 50));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await new Promise(r => setTimeout(r, 50));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
        
      case 'error_shake':
        for (let i = 0; i < 3; i++) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          await new Promise(r => setTimeout(r, 80));
        }
        break;
        
      case 'celebration':
        // PR achieved pattern
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise(r => setTimeout(r, 100));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await new Promise(r => setTimeout(r, 80));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await new Promise(r => setTimeout(r, 150));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
    }
  } catch (e) {
    // Haptics not available
  }
}

/**
 * Enable/disable audio
 */
export function setAudioEnabled(enabled: boolean): void {
  audioEnabled = enabled;
}

/**
 * Enable/disable haptics
 */
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

/**
 * Clean up audio resources
 */
export async function cleanup(): Promise<void> {
  for (const sound of soundCache.values()) {
    try {
      await sound.unloadAsync();
    } catch (e) {
      // Ignore cleanup errors
    }
  }
  soundCache.clear();
}

export default {
  initAudio,
  playSound,
  playHaptic,
  playRichHaptic,
  setAudioEnabled,
  setHapticsEnabled,
  cleanup,
};
