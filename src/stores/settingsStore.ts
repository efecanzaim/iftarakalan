import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CALCULATION_METHODS, DEFAULT_SETTINGS } from '../utils/constants';
import { initializeGemini } from '../services/geminiApi';

interface SettingsState {
  // Hesaplama ayarları
  calculationMethod: number;

  // Bildirim ayarları
  notificationsBefore: number; // dakika
  iftarNotification: boolean;
  imsakNotification: boolean;
  prayerNotifications: boolean;
  countdownNotification: boolean;

  // AI ayarları
  geminiApiKey: string;

  // Tema
  darkMode: boolean;

  // Actions
  setCalculationMethod: (method: number) => void;
  setNotificationsBefore: (minutes: number) => void;
  toggleIftarNotification: () => void;
  toggleImsakNotification: () => void;
  togglePrayerNotifications: () => void;
  toggleCountdownNotification: () => void;
  setGeminiApiKey: (key: string) => void;
  toggleDarkMode: () => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Initial state
      calculationMethod: DEFAULT_SETTINGS.calculationMethod,
      notificationsBefore: DEFAULT_SETTINGS.notificationsBefore,
      iftarNotification: DEFAULT_SETTINGS.iftarNotification,
      imsakNotification: DEFAULT_SETTINGS.imsakNotification,
      prayerNotifications: DEFAULT_SETTINGS.prayerNotifications,
      countdownNotification: true,
      geminiApiKey: '',
      darkMode: false,

      // Actions
      setCalculationMethod: (method) => set({ calculationMethod: method }),

      setNotificationsBefore: (minutes) => set({ notificationsBefore: minutes }),

      toggleIftarNotification: () =>
        set((state) => ({ iftarNotification: !state.iftarNotification })),

      toggleImsakNotification: () =>
        set((state) => ({ imsakNotification: !state.imsakNotification })),

      togglePrayerNotifications: () =>
        set((state) => ({ prayerNotifications: !state.prayerNotifications })),

      toggleCountdownNotification: () =>
        set((state) => ({ countdownNotification: !state.countdownNotification })),

      setGeminiApiKey: (key) => {
        set({ geminiApiKey: key });
        if (key) {
          initializeGemini(key);
        }
      },

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      resetSettings: () =>
        set({
          calculationMethod: DEFAULT_SETTINGS.calculationMethod,
          notificationsBefore: DEFAULT_SETTINGS.notificationsBefore,
          iftarNotification: DEFAULT_SETTINGS.iftarNotification,
          imsakNotification: DEFAULT_SETTINGS.imsakNotification,
          prayerNotifications: DEFAULT_SETTINGS.prayerNotifications,
          countdownNotification: true,
          darkMode: false,
        }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Uygulama başladığında API key'i yükle
        if (state?.geminiApiKey) {
          initializeGemini(state.geminiApiKey);
        }
      },
    }
  )
);
