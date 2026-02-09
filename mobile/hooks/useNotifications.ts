/**
 * useNotifications Hook
 * Manages notification permissions and listeners
 */

import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermission } from '@/lib/notifications';

interface NotificationState {
  hasPermission: boolean;
  isLoading: boolean;
  lastNotification: Notifications.Notification | null;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    hasPermission: false,
    isLoading: true,
    lastNotification: null,
  });
  
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Request permission on mount
    requestNotificationPermission().then((granted) => {
      setState((prev) => ({
        ...prev,
        hasPermission: granted,
        isLoading: false,
      }));
    });

    // Listen for notifications while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        setState((prev) => ({
          ...prev,
          lastNotification: notification,
        }));
      }
    );

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      if (data?.type === 'workout_complete') {
        // Navigate to workout history
      } else if (data?.type === 'personal_record') {
        // Navigate to exercise history
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    ...state,
    requestPermission: requestNotificationPermission,
  };
}

export default useNotifications;
