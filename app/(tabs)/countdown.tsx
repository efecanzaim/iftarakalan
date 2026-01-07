import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { usePrayerTimes } from '../../src/hooks/usePrayerTimes';
import { useCountdown } from '../../src/hooks/useCountdown';
import { CountdownTimer } from '../../src/components/CountdownTimer';
import { formatDateTurkish } from '../../src/utils/timeUtils';

export default function CountdownScreen() {
  const { prayerTimes, iftarTime, imsakTime, location } = usePrayerTimes();

  const iftarCountdown = useCountdown({
    targetTime: iftarTime,
    showNotification: true,
    onComplete: () => {
      console.log('İftar vakti geldi!');
    },
  });

  // İftar geçtiyse sahura kalan süreyi göster
  const imsakCountdown = useCountdown({
    targetTime: imsakTime,
  });

  const maghribTime = prayerTimes?.Maghrib;
  const fajrTime = prayerTimes?.Fajr;

  return (
    <ScrollView
      className="flex-1 bg-gray-100 dark:bg-gray-900"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Üst Gradient Arka Plan */}
      <View className="bg-primary-500 pt-8 pb-16 px-4 rounded-b-[40px]">
        <Text className="text-white/80 text-center text-sm mb-1">
          {formatDateTurkish(new Date())}
        </Text>
        <Text className="text-white text-center text-lg font-medium mb-2">
          📍 {location?.city || 'Konum bekleniyor...'}
        </Text>

        {/* Ana Geri Sayım */}
        <View className="items-center mt-6">
          <CountdownTimer
            hours={iftarCountdown.hours}
            minutes={iftarCountdown.minutes}
            seconds={iftarCountdown.seconds}
            label="İftara Kalan Süre"
            size="large"
          />
        </View>
      </View>

      {/* İftar ve Sahur Bilgileri */}
      <View className="px-4 -mt-8">
        <View className="flex-row gap-3">
          {/* İftar Kartı */}
          <View
            className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="items-center">
              <View className="w-14 h-14 bg-gold-100 dark:bg-gold-900/30 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🌅</Text>
              </View>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">İftar</Text>
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {maghribTime || '--:--'}
              </Text>
            </View>
          </View>

          {/* Sahur Kartı */}
          <View
            className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="items-center">
              <View className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🌙</Text>
              </View>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">İmsak</Text>
              <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {fajrTime || '--:--'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sahura Kalan (İftar geçtiyse) */}
        {iftarCountdown.isComplete && imsakTime && (
          <View className="mt-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4">
            <Text className="text-primary-600 dark:text-primary-400 text-center font-medium mb-2">
              Sahura Kalan Süre
            </Text>
            <View className="items-center">
              <CountdownTimer
                hours={imsakCountdown.hours}
                minutes={imsakCountdown.minutes}
                seconds={imsakCountdown.seconds}
                size="medium"
              />
            </View>
          </View>
        )}

        {/* Motivasyon Mesajı */}
        <View className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-5">
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
            Hayırlı Ramazanlar 🌙
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center leading-6">
            {iftarCountdown.isComplete
              ? 'Afiyet olsun! Allah kabul etsin.'
              : 'Sabrınız için dua ediyoruz. Orucunuz kabul olsun.'}
          </Text>
        </View>

        {/* İpucu */}
        <View className="mt-4 mb-8 flex-row items-start bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <Text className="text-xl mr-3">💡</Text>
          <View className="flex-1">
            <Text className="text-blue-700 dark:text-blue-300 font-medium mb-1">
              Bildirim İpucu
            </Text>
            <Text className="text-blue-600 dark:text-blue-400 text-sm">
              Geri sayım bildirimi açıkken, uygulama kapalı olsa bile ekranınızda
              iftara kalan süreyi görebilirsiniz.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
