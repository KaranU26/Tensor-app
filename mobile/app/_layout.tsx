import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { initializeApp } from '@/lib/init';
import { requestNotificationPermission } from '@/lib/notifications';
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
  const hapticsEnabled = useSettingsStore((state) => state.preferences.hapticsEnabled);
  const soundsEnabled = useSettingsStore((state) => state.preferences.soundsEnabled);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Initialize app (database, sync engine, notifications)
      const init = async () => {
        try {
          await loadStoredAuth();
        } catch (e) {
          console.warn('[Layout] Auth load failed:', e);
        }
        
        try {
          await initializeApp();
        } catch (e) {
          console.warn('[Layout] App init failed:', e);
        }
        
        try {
          await requestNotificationPermission();
        } catch (e) {
          console.warn('[Layout] Notifications failed (OK in Expo Go):', e);
        }
        
        setAppReady(true);
        SplashScreen.hideAsync();
      };
      
      init();
    }
  }, [loaded]);

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
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="signup" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen 
          name="player" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom'
          }} 
        />
        <Stack.Screen 
          name="routine-complete" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal'
          }} 
        />
        <Stack.Screen 
          name="workout-complete" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'fade'
          }} 
        />
        <Stack.Screen name="goals" options={{ headerShown: false }} />
        <Stack.Screen name="goal-create" options={{ headerShown: false }} />
        <Stack.Screen name="goal-checkin" options={{ headerShown: false }} />
        <Stack.Screen name="body-metrics" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
