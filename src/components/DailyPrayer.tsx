import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface DailyPrayerProps {
  title: string;
  arabic: string;
  turkish: string;
  meaning: string;
  onPress?: () => void;
}

export function DailyPrayer({ title, arabic, turkish, meaning, onPress }: DailyPrayerProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Başlık */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full items-center justify-center mr-3">
          <Text className="text-xl">📿</Text>
        </View>
        <Text className="text-lg font-bold text-primary-600 dark:text-primary-400">
          {title}
        </Text>
      </View>

      {/* Arapça metin */}
      <View className="bg-primary-50 dark:bg-gray-700 rounded-xl p-4 mb-3">
        <Text
          className="text-2xl text-gray-800 dark:text-gray-100 text-right leading-10"
          style={{ fontFamily: 'System' }}
        >
          {arabic}
        </Text>
      </View>

      {/* Okunuş */}
      <Text className="text-base text-primary-600 dark:text-primary-400 mb-2 italic">
        {turkish}
      </Text>

      {/* Anlam */}
      <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5">
        {meaning}
      </Text>
    </TouchableOpacity>
  );
}
