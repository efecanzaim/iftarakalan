import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { requestNotificationPermission, setupNotificationListeners } from '../src/services/notificationService';
import { useSettingsStore } from '../src/stores/settingsStore';
import '../global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { darkMode } = useSettingsStore();

  useEffect(() => {
    // Bildirim iznini iste
    requestNotificationPermission();

    // Bildirim listener'larını ayarla
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Notification received:', notification);
      },
      (response) => {
        console.log('Notification response:', response);
      }
    );

    return cleanup;
  }, []);

  const isDark = darkMode || colorScheme === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
          },
          headerTintColor: isDark ? '#ffffff' : '#1a5f4a',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: isDark ? '#111827' : '#f3f4f6',
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Ayarlar',
            presentation: 'modal',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
