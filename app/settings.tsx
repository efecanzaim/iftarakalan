import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../src/stores/settingsStore';
import { usePrayerStore } from '../src/stores/prayerStore';
import { cancelAllScheduledNotifications } from '../src/services/notificationService';
import { CALCULATION_METHODS } from '../src/utils/constants';

const CALCULATION_METHOD_NAMES: Record<number, string> = {
  [CALCULATION_METHODS.DIYANET]: 'Türkiye Diyanet',
  [CALCULATION_METHODS.MWL]: 'Muslim World League',
  [CALCULATION_METHODS.ISNA]: 'ISNA (Kuzey Amerika)',
  [CALCULATION_METHODS.EGYPT]: 'Mısır Genel Müftülüğü',
  [CALCULATION_METHODS.MAKKAH]: 'Ümmül Kura (Mekke)',
  [CALCULATION_METHODS.KARACHI]: 'Karaçi Üniversitesi',
};

export default function SettingsScreen() {
  const router = useRouter();
  const {
    calculationMethod,
    notificationsBefore,
    iftarNotification,
    imsakNotification,
    prayerNotifications,
    countdownNotification,
    geminiApiKey,
    darkMode,
    setCalculationMethod,
    setNotificationsBefore,
    toggleIftarNotification,
    toggleImsakNotification,
    togglePrayerNotifications,
    toggleCountdownNotification,
    setGeminiApiKey,
    toggleDarkMode,
    resetSettings,
  } = useSettingsStore();

  const { location, refreshAll } = usePrayerStore();

  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(geminiApiKey);
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  const handleSaveApiKey = () => {
    setGeminiApiKey(tempApiKey);
    setShowApiKeyInput(false);
    Alert.alert('Başarılı', 'API anahtarı kaydedildi.');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Ayarları Sıfırla',
      'Tüm ayarlar varsayılana döndürülecek. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            resetSettings();
            cancelAllScheduledNotifications();
            Alert.alert('Başarılı', 'Ayarlar sıfırlandı.');
          },
        },
      ]
    );
  };

  const handleMethodChange = async (method: number) => {
    setCalculationMethod(method);
    setShowMethodPicker(false);
    // Yeni metoda göre namaz vakitlerini yeniden çek
    await refreshAll();
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      {/* Konum Bilgisi */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-2xl p-4">
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          KONUM
        </Text>
        <View className="flex-row items-center">
          <Text className="text-2xl mr-3">📍</Text>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {location?.city || 'Konum alınamadı'}
            </Text>
            {location && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={refreshAll}
            className="bg-primary-100 dark:bg-primary-900/30 px-3 py-2 rounded-lg"
          >
            <Text className="text-primary-600 dark:text-primary-400 text-sm">Güncelle</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hesaplama Metodu */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-2xl p-4">
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          NAMAZ VAKİTLERİ
        </Text>
        <TouchableOpacity
          onPress={() => setShowMethodPicker(!showMethodPicker)}
          className="flex-row items-center justify-between py-2"
        >
          <Text className="text-gray-800 dark:text-gray-100">Hesaplama Metodu</Text>
          <View className="flex-row items-center">
            <Text className="text-primary-600 dark:text-primary-400 mr-2">
              {CALCULATION_METHOD_NAMES[calculationMethod]}
            </Text>
            <Text className="text-gray-400">{showMethodPicker ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {showMethodPicker && (
          <View className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
            {Object.entries(CALCULATION_METHOD_NAMES).map(([method, name]) => (
              <TouchableOpacity
                key={method}
                onPress={() => handleMethodChange(Number(method))}
                className={`py-3 px-2 rounded-lg ${
                  calculationMethod === Number(method)
                    ? 'bg-primary-100 dark:bg-primary-900/30'
                    : ''
                }`}
              >
                <Text
                  className={`${
                    calculationMethod === Number(method)
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Bildirim Ayarları */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-2xl p-4">
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          BİLDİRİMLER
        </Text>

        <SettingRow
          title="İftar Hatırlatması"
          subtitle={`${notificationsBefore} dakika önce`}
          value={iftarNotification}
          onToggle={toggleIftarNotification}
        />

        <SettingRow
          title="İmsak Hatırlatması"
          subtitle={`${notificationsBefore} dakika önce`}
          value={imsakNotification}
          onToggle={toggleImsakNotification}
        />

        <SettingRow
          title="Namaz Vakti Bildirimleri"
          subtitle="Her namaz vaktinde bildirim"
          value={prayerNotifications}
          onToggle={togglePrayerNotifications}
        />

        <SettingRow
          title="Geri Sayım Bildirimi"
          subtitle="Kalıcı iftar geri sayımı (Android)"
          value={countdownNotification}
          onToggle={toggleCountdownNotification}
        />

        <View className="flex-row items-center justify-between py-3 border-t border-gray-200 dark:border-gray-700 mt-2">
          <Text className="text-gray-800 dark:text-gray-100">Hatırlatma Süresi</Text>
          <View className="flex-row items-center">
            {[15, 30, 60].map((mins) => (
              <TouchableOpacity
                key={mins}
                onPress={() => setNotificationsBefore(mins)}
                className={`px-3 py-1 rounded-lg ml-2 ${
                  notificationsBefore === mins
                    ? 'bg-primary-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <Text
                  className={`text-sm ${
                    notificationsBefore === mins
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {mins}dk
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* AI Ayarları */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-2xl p-4">
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          AI ASİSTAN
        </Text>

        <TouchableOpacity
          onPress={() => setShowApiKeyInput(!showApiKeyInput)}
          className="flex-row items-center justify-between py-2"
        >
          <View className="flex-1">
            <Text className="text-gray-800 dark:text-gray-100">Gemini API Anahtarı</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {geminiApiKey ? '••••••••••••' + geminiApiKey.slice(-4) : 'Yapılandırılmamış'}
            </Text>
          </View>
          <Text className="text-primary-600 dark:text-primary-400">
            {showApiKeyInput ? 'Kapat' : 'Düzenle'}
          </Text>
        </TouchableOpacity>

        {showApiKeyInput && (
          <View className="mt-3">
            <TextInput
              value={tempApiKey}
              onChangeText={setTempApiKey}
              placeholder="API anahtarınızı yapıştırın"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              className="bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100"
            />
            <View className="flex-row mt-3 gap-2">
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL('https://aistudio.google.com/apikey')
                }
                className="flex-1 bg-gray-200 dark:bg-gray-700 py-3 rounded-xl"
              >
                <Text className="text-center text-gray-700 dark:text-gray-300">
                  Anahtar Al
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveApiKey}
                className="flex-1 bg-primary-500 py-3 rounded-xl"
              >
                <Text className="text-center text-white font-semibold">Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Görünüm */}
      <View className="bg-white dark:bg-gray-800 mx-4 mt-4 rounded-2xl p-4">
        <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          GÖRÜNÜM
        </Text>
        <SettingRow
          title="Karanlık Tema"
          subtitle="Koyu renk arayüz"
          value={darkMode}
          onToggle={toggleDarkMode}
        />
      </View>

      {/* Sıfırla */}
      <TouchableOpacity
        onPress={handleResetSettings}
        className="mx-4 mt-4 mb-8 bg-red-50 dark:bg-red-900/20 rounded-2xl p-4"
      >
        <Text className="text-red-600 dark:text-red-400 text-center font-medium">
          Ayarları Sıfırla
        </Text>
      </TouchableOpacity>

      {/* Versiyon */}
      <Text className="text-center text-gray-400 dark:text-gray-600 text-sm mb-8">
        Ramazan App v1.0.0
      </Text>
    </ScrollView>
  );
}

interface SettingRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onToggle: () => void;
}

function SettingRow({ title, subtitle, value, onToggle }: SettingRowProps) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
      <View className="flex-1">
        <Text className="text-gray-800 dark:text-gray-100">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d5db', true: '#86efac' }}
        thumbColor={value ? '#1a5f4a' : '#f4f4f5'}
      />
    </View>
  );
}
