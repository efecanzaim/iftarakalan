import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { DailyPrayer } from '../../src/components/DailyPrayer';
import prayersData from '../../src/data/prayers.json';

type TabType = 'daily' | 'dhikr';

export default function PrayersScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('daily');

  // Günün duasını rastgele seç (her gün aynı dua için tarih bazlı seed)
  const todaysPrayer = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = dayOfYear % prayersData.dailyPrayers.length;
    return prayersData.dailyPrayers[index];
  }, []);

  return (
    <View className="flex-1 bg-gray-100 dark:bg-gray-900">
      {/* Tab Seçici */}
      <View className="flex-row p-4 gap-2">
        <TouchableOpacity
          onPress={() => setActiveTab('daily')}
          className={`flex-1 py-3 rounded-xl ${
            activeTab === 'daily'
              ? 'bg-primary-500'
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'daily'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Günün Duası
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('dhikr')}
          className={`flex-1 py-3 rounded-xl ${
            activeTab === 'dhikr'
              ? 'bg-primary-500'
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === 'dhikr'
                ? 'text-white'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Tesbih & Zikirler
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'daily' ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        >
          {/* Günün Duası Öne Çıkan */}
          <View className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-2">⭐</Text>
              <Text className="text-lg font-bold text-gold-700 dark:text-gold-400">
                Günün Duası
              </Text>
            </View>
            <DailyPrayer
              title={todaysPrayer.title}
              arabic={todaysPrayer.arabic}
              turkish={todaysPrayer.turkish}
              meaning={todaysPrayer.meaning}
            />
          </View>

          {/* Tüm Dualar */}
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
            Tüm Dualar
          </Text>
          {prayersData.dailyPrayers.map((prayer) => (
            <DailyPrayer
              key={prayer.id}
              title={prayer.title}
              arabic={prayer.arabic}
              turkish={prayer.turkish}
              meaning={prayer.meaning}
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        >
          {/* Namaz Sonrası Tesbihat */}
          <View className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-4 mb-4">
            <Text className="text-lg font-bold text-primary-700 dark:text-primary-300 mb-2">
              Namaz Sonrası Tesbihat
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Her namazın ardından 33'er kere okunur
            </Text>

            {prayersData.dhikr.map((dhikr, index) => (
              <DhikrCard
                key={dhikr.id}
                arabic={dhikr.arabic}
                turkish={dhikr.turkish}
                meaning={dhikr.meaning}
                count={dhikr.count}
                index={index}
              />
            ))}
          </View>

          {/* Günlük Zikirler */}
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
            Günlük Zikirler
          </Text>

          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4">
            <ZikirItem
              title="İstiğfar"
              arabic="أَسْتَغْفِرُ اللَّهَ"
              turkish="Estağfirullah"
              meaning="Allah'tan bağışlanma dilerim"
              recommendedCount={100}
            />
            <View className="h-px bg-gray-200 dark:bg-gray-700 my-3" />
            <ZikirItem
              title="Salavat"
              arabic="اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ"
              turkish="Allahümme salli ala Muhammed"
              meaning="Allah'ım! Muhammed'e salat eyle"
              recommendedCount={100}
            />
            <View className="h-px bg-gray-200 dark:bg-gray-700 my-3" />
            <ZikirItem
              title="La İlahe İllallah"
              arabic="لَا إِلَهَ إِلَّا اللَّهُ"
              turkish="La ilahe illallah"
              meaning="Allah'tan başka ilah yoktur"
              recommendedCount={100}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

interface DhikrCardProps {
  arabic: string;
  turkish: string;
  meaning: string;
  count: number;
  index: number;
}

function DhikrCard({ arabic, turkish, meaning, count, index }: DhikrCardProps) {
  const [currentCount, setCurrentCount] = useState(0);

  const colors = [
    'bg-blue-100 dark:bg-blue-900/30',
    'bg-green-100 dark:bg-green-900/30',
    'bg-purple-100 dark:bg-purple-900/30',
  ];

  return (
    <TouchableOpacity
      onPress={() => setCurrentCount((c) => (c < count ? c + 1 : 0))}
      activeOpacity={0.8}
      className={`${colors[index % 3]} rounded-xl p-4 mb-3`}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-xl text-gray-800 dark:text-gray-100 text-right mb-2">
            {arabic}
          </Text>
          <Text className="text-sm text-primary-600 dark:text-primary-400 italic">
            {turkish}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {meaning}
          </Text>
        </View>
        <View className="ml-4 items-center">
          <View className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 items-center justify-center border-2 border-primary-500">
            <Text className="text-lg font-bold text-primary-600">{currentCount}</Text>
          </View>
          <Text className="text-xs text-gray-500 mt-1">/ {count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface ZikirItemProps {
  title: string;
  arabic: string;
  turkish: string;
  meaning: string;
  recommendedCount: number;
}

function ZikirItem({ title, arabic, turkish, meaning, recommendedCount }: ZikirItemProps) {
  return (
    <View>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="font-semibold text-gray-800 dark:text-gray-100">{title}</Text>
        <Text className="text-xs text-gray-500">Günde {recommendedCount}x</Text>
      </View>
      <Text className="text-lg text-gray-800 dark:text-gray-100 text-right mb-1">
        {arabic}
      </Text>
      <Text className="text-sm text-primary-600 dark:text-primary-400 italic mb-1">
        {turkish}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400">{meaning}</Text>
    </View>
  );
}
