import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, useColorScheme } from 'react-native';
import { useSettingsStore } from '../../src/stores/settingsStore';

function TabBarIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View className={`items-center justify-center ${focused ? 'scale-110' : ''}`}>
      <Text style={{ fontSize: 24 }}>{icon}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { darkMode } = useSettingsStore();
  const isDark = darkMode || colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1a5f4a',
        tabBarInactiveTintColor: isDark ? '#9ca3af' : '#6b7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
        },
        headerTintColor: isDark ? '#ffffff' : '#1a5f4a',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Namaz',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="🕌" focused={focused} />,
          headerTitle: 'Namaz Vakitleri',
        }}
      />
      <Tabs.Screen
        name="countdown"
        options={{
          title: 'İftar',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="🌙" focused={focused} />,
          headerTitle: 'İftar Geri Sayımı',
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'Kıble',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="🧭" focused={focused} />,
          headerTitle: 'Kıble Pusulası',
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: 'Dualar',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="📿" focused={focused} />,
          headerTitle: 'Günlük Dualar',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Asistan',
          tabBarIcon: ({ focused }) => <TabBarIcon icon="🤖" focused={focused} />,
          headerTitle: 'Ramazan Asistanı',
        }}
      />
    </Tabs>
  );
}
