/**
 * Push Notification Service
 * Sends push notifications via Expo Push API
 *
 * Requires: npm install expo-server-sdk
 * For now, uses direct HTTP calls to Expo Push API
 */

import { prisma } from './prisma.js';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  badge?: number;
  channelId?: string;
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Send a push notification to a single user
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { expoPushToken: true },
    });

    if (!user?.expoPushToken) {
      console.log(`[Push] No push token for user ${userId}`);
      return false;
    }

    const message: PushMessage = {
      to: user.expoPushToken,
      title,
      body,
      data,
      sound: 'default',
    };

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error(`[Push] Failed to send: ${response.status}`);
      return false;
    }

    const result = await response.json() as { data?: { status?: string; message?: string } };
    if (result.data?.status === 'error') {
      console.error(`[Push] Error: ${result.data?.message}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Push] Send error:', error);
    return false;
  }
}

/**
 * Send push notifications to multiple users
 */
export async function sendBulkPushNotifications(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<number> {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, expoPushToken: { not: null } },
    select: { expoPushToken: true },
  });

  if (users.length === 0) return 0;

  const messages: PushMessage[] = users
    .filter((u) => u.expoPushToken)
    .map((u) => ({
      to: u.expoPushToken!,
      title,
      body,
      data,
      sound: 'default',
    }));

  // Expo accepts batches of up to 100 messages
  let sentCount = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100);
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (response.ok) {
        sentCount += batch.length;
      }
    } catch (error) {
      console.error('[Push] Batch send error:', error);
    }
  }

  return sentCount;
}

/**
 * Send streak-at-risk notification to users who haven't worked out today
 */
export async function sendStreakReminders(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find users with active streaks who haven't logged anything today
  const usersWithTokens = await prisma.user.findMany({
    where: {
      expoPushToken: { not: null },
      notificationPrefs: {
        streakNotifications: true,
        notificationsEnabled: true,
      },
    },
    select: {
      id: true,
      expoPushToken: true,
      strengthWorkouts: {
        where: { startedAt: { gte: today } },
        select: { id: true },
        take: 1,
      },
      stretchingSessions: {
        where: { startedAt: { gte: today } },
        select: { id: true },
        take: 1,
      },
    },
  });

  const inactiveUsers = usersWithTokens.filter(
    (u) => u.strengthWorkouts.length === 0 && u.stretchingSessions.length === 0
  );

  if (inactiveUsers.length === 0) return 0;

  return sendBulkPushNotifications(
    inactiveUsers.map((u) => u.id),
    '🔥 Don\'t break your streak!',
    'You haven\'t logged a workout today. Keep your streak alive!',
    { type: 'streak_reminder' }
  );
}
