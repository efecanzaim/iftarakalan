import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePrayerTimes } from '../../src/hooks/usePrayerTimes';
import { PrayerTimeCard } from '../../src/components/PrayerTimeCard';
import { CountdownTimer } from '../../src/components/CountdownTimer';
import { useCountdown } from '../../src/hooks/useCountdown';
import { formatDateTurkish } from '../../src/utils/timeUtils';

export default function HomeScreen() {
  const router = useRouter();
  const {
    location,
    prayerTimesWithNames,
    hijriDate,
    nextPrayer,
    iftarTime,
    isLoading,
    error,
    refresh,
  } = usePrayerTimes();

  const { hours, minutes, seconds } = useCountdown({
    targetTime: iftarTime,
    showNotification: true,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (isLoading && !prayerTimesWithNames) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#1a5f4a" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          Namaz vakitleri yükleniyor...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
        <Text className="text-5xl mb-4">📍</Text>
        <Text className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center mb-2">
          Konum Gerekli
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {error}
        </Text>
        <TouchableOpacity
          onPress={refresh}
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
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a5f4a']} />
      }
    >
      {/* Konum ve Tarih Kartı */}
      <View className="bg-primary-500 rounded-2xl p-5 mb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-white/80 text-sm">📍 </Text>
              <Text className="text-white/80 text-sm">
                {location?.city || 'Konum alınıyor...'}
              </Text>
            </View>
            <Text className="text-white text-lg font-semibold">
              {formatDateTurkish(new Date())}
            </Text>
            {hijriDate && (
              <Text className="text-white/80 text-sm mt-1">
                {hijriDate.day} {hijriDate.month} {hijriDate.year} H.
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            className="bg-white/20 p-2 rounded-lg"
          >
            <Text className="text-xl">⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* İftar Geri Sayımı Mini */}
      {iftarTime && (
        <TouchableOpacity
          onPress={() => router.push('/countdown')}
          activeOpacity={0.9}
        >
          <View className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-gold-600 dark:text-gold-400 text-sm font-medium">
                  İftara Kalan
                </Text>
                <Text className="text-2xl font-bold text-gold-700 dark:text-gold-300">
                  {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
                  {seconds.toString().padStart(2, '0')}
                </Text>
              </View>
              <Text className="text-4xl">🌙</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Sıradaki Namaz */}
      {nextPrayer && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 ml-1">
            Sıradaki Namaz
          </Text>
          <PrayerTimeCard
            name={nextPrayer.nameTr}
            nameKey={nextPrayer.name}
            time={nextPrayer.time.toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            isNext
          />
        </View>
      )}

      {/* Tüm Namaz Vakitleri */}
      <View>
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 ml-1">
          Günün Vakitleri
        </Text>
        {prayerTimesWithNames?.map((prayer) => (
          <PrayerTimeCard
            key={prayer.key}
            name={prayer.name}
            nameKey={prayer.key}
            time={prayer.time}
            isNext={nextPrayer?.name === prayer.key}
          />
        ))}
      </View>

      {/* Alt boşluk */}
      <View className="h-4" />
    </ScrollView>
  );
}
