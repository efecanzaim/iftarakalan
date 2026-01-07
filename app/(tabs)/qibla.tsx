import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQibla } from '../../src/hooks/useQibla';
import { QiblaCompass } from '../../src/components/QiblaCompass';
import { usePrayerStore } from '../../src/stores/prayerStore';

export default function QiblaScreen() {
  const {
    compassHeading,
    qiblaDirection,
    qiblaAngle,
    distanceToKaaba,
    isCalibrated,
    isAvailable,
    hasLocation,
    error,
    startCompass,
  } = useQibla();

  const { fetchLocation, isLoadingLocation } = usePrayerStore();

  if (!hasLocation) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
        <Text className="text-5xl mb-4">📍</Text>
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">
          Konum Gerekli
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
          Kıble yönünü belirlemek için konum bilginiz gereklidir.
        </Text>
        <TouchableOpacity
          onPress={fetchLocation}
          disabled={isLoadingLocation}
          className="bg-primary-500 px-6 py-3 rounded-xl"
        >
          {isLoadingLocation ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Konum Al</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAvailable) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
        <Text className="text-5xl mb-4">🧭</Text>
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">
          Pusula Kullanılamıyor
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center">
          Bu cihazda pusula sensörü bulunamadı veya erişilemiyor.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
        <Text className="text-5xl mb-4">⚠️</Text>
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">
          Hata
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {error}
        </Text>
        <TouchableOpacity
          onPress={startCompass}
          className="bg-primary-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100 dark:bg-gray-900"
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
    >
      {/* Kabe bilgisi */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 flex-row items-center">
        <Text className="text-3xl mr-3">🕋</Text>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Kabe'ye Uzaklık
          </Text>
          <Text className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {distanceToKaaba.toFixed(0)} km
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Kıble Açısı</Text>
          <Text className="text-xl font-bold text-primary-500">
            {qiblaDirection.toFixed(1)}°
          </Text>
        </View>
      </View>

      {/* Pusula */}
      <View className="items-center justify-center flex-1 py-8">
        <QiblaCompass
          qiblaAngle={qiblaAngle}
          compassHeading={compassHeading}
          isCalibrated={isCalibrated}
        />
      </View>

      {/* Yön Bilgisi */}
      <View className="bg-primary-500 rounded-2xl p-4 mt-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white/80 text-sm">Mevcut Yön</Text>
            <Text className="text-white text-xl font-bold">
              {compassHeading.toFixed(0)}° {getDirectionName(compassHeading)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-white/80 text-sm">Kıble'ye Dön</Text>
            <Text className="text-white text-xl font-bold">
              {getRotationDirection(qiblaAngle)}
            </Text>
          </View>
        </View>
      </View>

      {/* Kullanım İpucu */}
      <View className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
        <Text className="text-blue-700 dark:text-blue-300 text-center text-sm">
          💡 Altın ok ve 🕋 simgesi Kıble yönünü gösterir. Telefonu yere paralel
          tutarak dönerek oku yukarı hizalayın.
        </Text>
      </View>
    </ScrollView>
  );
}

function getDirectionName(angle: number): string {
  const directions = ['Kuzey', 'KD', 'Doğu', 'GD', 'Güney', 'GB', 'Batı', 'KB'];
  const index = Math.round(angle / 45) % 8;
  return directions[index];
}

function getRotationDirection(angle: number): string {
  if (Math.abs(angle) < 10 || Math.abs(angle - 360) < 10) {
    return '✓ Doğru yön';
  }
  if (angle > 180) {
    return `← ${(360 - angle).toFixed(0)}° sola`;
  }
  return `→ ${angle.toFixed(0)}° sağa`;
}
