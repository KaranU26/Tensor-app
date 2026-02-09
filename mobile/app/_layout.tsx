import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import {
  Manrope_400Regular,
  Manrope_500Medium,
} from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';


import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { initializeApp } from '@/lib/init';
import { requestNotificationPermission, registerPushToken } from '@/lib/notifications';
import { configureRevenueCat, loginRevenueCat } from '@/lib/revenuecat';
import { colors } from '@/config/theme';
import { setAudioEnabled, setHapticsEnabled } from '@/lib/sounds';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    ...FontAwesome.font,
  });
  const [appReady, setAppReady] = useState(false);

  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);
  const user = useAuthStore((state) => state.user);
  const checkEntitlements = useSubscriptionStore((state) => state.checkEntitlements);
  const setupCustomerInfoListener = useSubscriptionStore((state) => state.setupCustomerInfoListener);
  const hapticsEnabled = useSettingsStore((state) => state.preferences.hapticsEnabled);
  const soundsEnabled = useSettingsStore((state) => state.preferences.soundsEnabled);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      const init = async () => {
        // 1. Configure RevenueCat first (before any entitlement checks)
        try {
          await configureRevenueCat();
        } catch (e) {
          console.warn('[Layout] RevenueCat configure failed:', e);
        }

        // 2. Load stored auth
        try {
          await loadStoredAuth();
        } catch (e) {
          console.warn('[Layout] Auth load failed:', e);
        }

        // 3. Check entitlements via RevenueCat
        try {
          await checkEntitlements();
        } catch (e) {
          console.warn('[Layout] Subscription check failed:', e);
        }

        // 4. Initialize app (database, sync engine)
        try {
          await initializeApp();
        } catch (e) {
          console.warn('[Layout] App init failed:', e);
        }

        // 5. Set up notifications
        try {
          await requestNotificationPermission();
          await registerPushToken();
        } catch (e) {
          console.warn('[Layout] Notifications failed (OK in Expo Go):', e);
        }

        setAppReady(true);
        SplashScreen.hideAsync();
      };

      init();
    }
  }, [loaded]);

  // Identify user with RevenueCat when auth state changes
  useEffect(() => {
    if (user?.id) {
      loginRevenueCat(user.id).catch((e) =>
        console.warn('[Layout] RevenueCat login failed:', e)
      );
    }
  }, [user?.id]);

  // Listen for real-time subscription changes from RevenueCat
  useEffect(() => {
    const removeListener = setupCustomerInfoListener();
    return removeListener;
  }, []);

  useEffect(() => {
    setHapticsEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  useEffect(() => {
    setAudioEnabled(soundsEnabled);
  }, [soundsEnabled]);

  if (!loaded || !appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="signup" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen
          name="player"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="routine-complete"
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade'
          }}
        />
        <Stack.Screen
          name="workout-complete"
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade'
          }}
        />
        <Stack.Screen name="goals" />
        <Stack.Screen name="goal-create" />
        <Stack.Screen name="goal-checkin" />
        <Stack.Screen name="body-metrics" />
        <Stack.Screen name="create-routine" />
        <Stack.Screen name="record-progress" />
        <Stack.Screen name="routine" />
        <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </ThemeProvider>
  );
}
