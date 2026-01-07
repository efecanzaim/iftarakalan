import React from 'react';
import { View, Text } from 'react-native';
import { PRAYER_ICONS } from '../utils/constants';

interface PrayerTimeCardProps {
  name: string;
  nameKey: string;
  time: string;
  isNext?: boolean;
}

export function PrayerTimeCard({ name, nameKey, time, isNext = false }: PrayerTimeCardProps) {
  const icon = PRAYER_ICONS[nameKey] || '🕌';

  return (
    <View
      className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
        isNext ? 'bg-primary-500' : 'bg-white dark:bg-gray-800'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">{icon}</Text>
        <Text
          className={`text-lg font-semibold ${
            isNext ? 'text-white' : 'text-gray-800 dark:text-gray-100'
          }`}
        >
          {name}
        </Text>
      </View>
      <Text
        className={`text-xl font-bold ${
          isNext ? 'text-white' : 'text-primary-500 dark:text-primary-400'
        }`}
      >
        {time}
      </Text>
    </View>
  );
}
