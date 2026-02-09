/**
 * Push Notification Service
 * Handles workout reminders, rest timer alerts, and social notifications
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { fetchWithAuth } from './api/fetchWithAuth';

type NotificationsModule = typeof import('expo-notifications');

let Notifications: NotificationsModule | null = null;
let handlerConfigured = false;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  // Expo Go no longer supports expo-notifications on Android.
  if (Constants.appOwnership === 'expo') {
    return null;
  }

  if (Notifications) {
    return Notifications;
  }

  try {
    Notifications = await import('expo-notifications');
    if (!handlerConfigured && Notifications) {
      try {
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        handlerConfigured = true;
      } catch (error) {
        console.warn('[Notifications] Handler setup failed:', error);
      }
    }
    return Notifications;
  } catch (error) {
    console.warn('[Notifications] Module unavailable:', error);
    return null;
  }
}

export interface NotificationSettings {
  workoutReminders: boolean;
  restTimerAlerts: boolean;
  socialNotifications: boolean;
  reminderTime: string; // "09:00"
}

// ============================================
// Permission Handling
// ============================================

export async function requestNotificationPermission(): Promise<boolean> {
  const module = await getNotificationsModule();
  if (!module) return false;

  if (Platform.OS === 'android') {
    await module.setNotificationChannelAsync('workout-reminders', {
      name: 'Workout Reminders',
      importance: module.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });

    await module.setNotificationChannelAsync('rest-timer', {
      name: 'Rest Timer',
      importance: module.AndroidImportance.MAX,
      vibrationPattern: [0, 500],
      lightColor: '#3B82F6',
    });
  }

  const { status: existingStatus } = await module.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await module.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  const module = await getNotificationsModule();
  if (!module) return null;

  try {
    const token = await module.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with actual Expo project ID
    });
    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

// ============================================
// Rest Timer Notifications
// ============================================

let restTimerNotificationId: string | null = null;

export async function scheduleRestTimerNotification(
  durationSeconds: number
): Promise<string | null> {
  const module = await getNotificationsModule();
  if (!module) return null;

  // Cancel any existing timer
  if (restTimerNotificationId) {
    await cancelRestTimerNotification();
  }

  const id = await module.scheduleNotificationAsync({
    content: {
      title: '⏱️ Rest Complete!',
      body: 'Time to start your next set',
      sound: true,
    },
    trigger: {
      type: module.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: durationSeconds,
    },
  });

  restTimerNotificationId = id;
  return id;
}

export async function cancelRestTimerNotification(): Promise<void> {
  const module = await getNotificationsModule();
  if (!module) return;

  if (restTimerNotificationId) {
    await module.cancelScheduledNotificationAsync(restTimerNotificationId);
    restTimerNotificationId = null;
  }
}

// ============================================
// Workout Reminders
// ============================================

export async function scheduleWorkoutReminder(
  hour: number,
  minute: number,
  weekdays: number[] = [1, 2, 3, 4, 5] // Mon-Fri
): Promise<string[]> {
  const module = await getNotificationsModule();
  if (!module) return [];

  const notificationIds: string[] = [];

  // Cancel existing reminders
  await cancelAllWorkoutReminders();

  for (const weekday of weekdays) {
    const id = await module.scheduleNotificationAsync({
      content: {
        title: '💪 Time to Train!',
        body: "Don't skip your workout today",
        sound: true,
      },
      trigger: {
        type: module.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
    notificationIds.push(id);
  }

  return notificationIds;
}

export async function cancelAllWorkoutReminders(): Promise<void> {
  const module = await getNotificationsModule();
  if (!module) return;

  const scheduledNotifications = await module.getAllScheduledNotificationsAsync();

  for (const notification of scheduledNotifications) {
    if (notification.content.title?.includes('Time to Train')) {
      await module.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
}

// ============================================
// Instant Notifications
// ============================================

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<string | null> {
  const module = await getNotificationsModule();
  if (!module) return null;

  return module.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null,
  });
}

export async function notifyWorkoutComplete(
  workoutName: string,
  duration: number,
  totalVolume: number
): Promise<void> {
  await sendLocalNotification(
    '🎉 Workout Complete!',
    `${workoutName} • ${duration} min • ${totalVolume.toLocaleString()} lbs moved`,
    { type: 'workout_complete' }
  );
}

export async function notifyPR(
  exerciseName: string,
  weight: number,
  reps: number
): Promise<void> {
  await sendLocalNotification(
    '🏆 New Personal Record!',
    `${exerciseName}: ${weight} lbs × ${reps} reps`,
    { type: 'personal_record' }
  );
}

// ============================================
// Push Token Registration
// ============================================

export async function registerPushToken(): Promise<void> {
  const token = await getExpoPushToken();
  if (!token) return;

  try {
    await fetchWithAuth('/user/push-token', {
      method: 'PUT',
      body: JSON.stringify({ pushToken: token }),
    });
  } catch (error) {
    console.warn('[Notifications] Failed to register push token:', error);
  }
}
