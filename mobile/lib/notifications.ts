/**
 * Push Notification Service
 * Handles workout reminders, rest timer alerts, and social notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('workout-reminders', {
      name: 'Workout Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
    
    await Notifications.setNotificationChannelAsync('rest-timer', {
      name: 'Rest Timer',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500],
      lightColor: '#3B82F6',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function getExpoPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
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
): Promise<string> {
  // Cancel any existing timer
  if (restTimerNotificationId) {
    await cancelRestTimerNotification();
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏱️ Rest Complete!',
      body: 'Time to start your next set',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: durationSeconds,
    },
  });
  
  restTimerNotificationId = id;
  return id;
}

export async function cancelRestTimerNotification(): Promise<void> {
  if (restTimerNotificationId) {
    await Notifications.cancelScheduledNotificationAsync(restTimerNotificationId);
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
  const notificationIds: string[] = [];
  
  // Cancel existing reminders
  await cancelAllWorkoutReminders();
  
  for (const weekday of weekdays) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💪 Time to Train!',
        body: "Don't skip your workout today",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
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
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    // Check if it's a workout reminder by title
    if (notification.content.title?.includes('Time to Train')) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
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
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Immediate
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
// Notification Listeners
// ============================================

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// ============================================
// Badge Management
// ============================================

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

export default {
  requestNotificationPermission,
  getExpoPushToken,
  scheduleRestTimerNotification,
  cancelRestTimerNotification,
  scheduleWorkoutReminder,
  cancelAllWorkoutReminders,
  sendLocalNotification,
  notifyWorkoutComplete,
  notifyPR,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  setBadgeCount,
  clearBadge,
};
