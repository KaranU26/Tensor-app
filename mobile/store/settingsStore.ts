import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UnitSystem = 'imperial' | 'metric';
export type WeekStart = 'Mon' | 'Sun';

export interface Preferences {
  unitSystem: UnitSystem;
  weekStart: WeekStart;
  preferredWorkoutTime: 'morning' | 'afternoon' | 'evening';
  restTimerSeconds: number;
  autoRestTimer: boolean;
  autoStretchPrompt: boolean;
  hapticsEnabled: boolean;
  soundsEnabled: boolean;
  offlineMode: boolean;
  syncOverCellular: boolean;
}

export interface NotificationSettings {
  notificationsEnabled: boolean;
  stretchReminders: boolean;
  workoutReminders: boolean;
  streakNotifications: boolean;
  goalNotifications: boolean;
  socialNotifications: boolean;
  recoverySuggestions: boolean;
  inactivityNudges: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  stretchReminderTime: string;
  workoutReminderTime: string;
  reminderDays: string[];
  maxDailyNotifications: number;
}

interface SettingsState {
  preferences: Preferences;
  notifications: NotificationSettings;
  updatePreferences: (updates: Partial<Preferences>) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  toggleReminderDay: (day: string) => void;
  resetSettings: () => void;
}

const defaultPreferences: Preferences = {
  unitSystem: 'imperial',
  weekStart: 'Mon',
  preferredWorkoutTime: 'evening',
  restTimerSeconds: 90,
  autoRestTimer: true,
  autoStretchPrompt: true,
  hapticsEnabled: true,
  soundsEnabled: false,
  offlineMode: true,
  syncOverCellular: false,
};

const defaultNotifications: NotificationSettings = {
  notificationsEnabled: true,
  stretchReminders: true,
  workoutReminders: true,
  streakNotifications: true,
  goalNotifications: true,
  socialNotifications: false,
  recoverySuggestions: true,
  inactivityNudges: false,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  stretchReminderTime: '18:30',
  workoutReminderTime: '17:00',
  reminderDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  maxDailyNotifications: 3,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      notifications: defaultNotifications,
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...updates,
          },
        })),
      updateNotifications: (updates) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...updates,
          },
        })),
      toggleReminderDay: (day) =>
        set((state) => {
          const exists = state.notifications.reminderDays.includes(day);
          const reminderDays = exists
            ? state.notifications.reminderDays.filter((d) => d !== day)
            : [...state.notifications.reminderDays, day];
          return {
            notifications: {
              ...state.notifications,
              reminderDays,
            },
          };
        }),
      resetSettings: () =>
        set({
          preferences: defaultPreferences,
          notifications: defaultNotifications,
        }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
