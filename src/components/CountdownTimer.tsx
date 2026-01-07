import React from 'react';
import { View, Text } from 'react-native';

interface CountdownTimerProps {
  hours: number;
  minutes: number;
  seconds: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export function CountdownTimer({
  hours,
  minutes,
  seconds,
  label = "İftara Kalan Süre",
  size = 'large',
}: CountdownTimerProps) {
  const timeBlockStyles = {
    small: 'w-14 h-14',
    medium: 'w-20 h-20',
    large: 'w-24 h-24',
  };

  const numberStyles = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-4xl',
  };

  const labelStyles = {
    small: 'text-[10px]',
    medium: 'text-xs',
    large: 'text-sm',
  };

  const TimeBlock = ({ value, unit }: { value: number; unit: string }) => (
    <View className="items-center">
      <View
        className={`${timeBlockStyles[size]} bg-primary-500 rounded-2xl items-center justify-center`}
        style={{
          shadowColor: '#1a5f4a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text className={`${numberStyles[size]} font-bold text-white`}>
          {value.toString().padStart(2, '0')}
        </Text>
      </View>
      <Text className={`${labelStyles[size]} text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-wide`}>
        {unit}
      </Text>
    </View>
  );

  const Separator = () => (
    <Text className={`${numberStyles[size]} font-bold text-primary-500 mx-1`}>:</Text>
  );

  return (
    <View className="items-center">
      {label && (
        <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {label}
        </Text>
      )}
      <View className="flex-row items-center">
        <TimeBlock value={hours} unit="Saat" />
        <Separator />
        <TimeBlock value={minutes} unit="Dakika" />
        <Separator />
        <TimeBlock value={seconds} unit="Saniye" />
      </View>
    </View>
  );
}
