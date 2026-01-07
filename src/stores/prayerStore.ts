import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPrayerTimes, extractMainPrayerTimes, PrayerTimesResponse } from '../services/aladhanApi';
import { getCurrentLocation, LocationData } from '../services/locationService';
import { getTodayDateString } from '../utils/timeUtils';

interface PrayerState {
  // Data
  location: LocationData | null;
  prayerTimes: Record<string, string> | null;
  hijriDate: {
    day: string;
    month: string;
    year: string;
  } | null;
  lastFetchDate: string | null;

  // Loading states
  isLoadingLocation: boolean;
  isLoadingPrayerTimes: boolean;

  // Error states
  locationError: string | null;
  prayerTimesError: string | null;

  // Actions
  fetchLocation: () => Promise<void>;
  fetchPrayerTimes: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearErrors: () => void;
}

export const usePrayerStore = create<PrayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      location: null,
      prayerTimes: null,
      hijriDate: null,
      lastFetchDate: null,
      isLoadingLocation: false,
      isLoadingPrayerTimes: false,
      locationError: null,
      prayerTimesError: null,

      fetchLocation: async () => {
        set({ isLoadingLocation: true, locationError: null });

        try {
          const locationData = await getCurrentLocation();

          if (locationData) {
            set({
              location: locationData,
              isLoadingLocation: false,
            });
          } else {
            set({
              locationError: 'Konum alınamadı. Lütfen konum izinlerini kontrol edin.',
              isLoadingLocation: false,
            });
          }
        } catch (error) {
          set({
            locationError: 'Konum alınırken bir hata oluştu.',
            isLoadingLocation: false,
          });
        }
      },

      fetchPrayerTimes: async () => {
        const { location } = get();

        if (!location) {
          set({ prayerTimesError: 'Önce konum bilgisi gerekli.' });
          return;
        }

        set({ isLoadingPrayerTimes: true, prayerTimesError: null });

        try {
          const response = await getPrayerTimes(location.latitude, location.longitude);

          if (response && response.data) {
            const mainTimes = extractMainPrayerTimes(response.data.timings);
            const hijri = response.data.date.hijri;

            set({
              prayerTimes: mainTimes,
              hijriDate: {
                day: hijri.day,
                month: hijri.month.ar,
                year: hijri.year,
              },
              lastFetchDate: getTodayDateString(),
              isLoadingPrayerTimes: false,
            });
          } else {
            set({
              prayerTimesError: 'Namaz vakitleri alınamadı.',
              isLoadingPrayerTimes: false,
            });
          }
        } catch (error) {
          set({
            prayerTimesError: 'Namaz vakitleri alınırken bir hata oluştu.',
            isLoadingPrayerTimes: false,
          });
        }
      },

      refreshAll: async () => {
        const { fetchLocation, fetchPrayerTimes } = get();
        await fetchLocation();
        await fetchPrayerTimes();
      },

      clearErrors: () => {
        set({
          locationError: null,
          prayerTimesError: null,
        });
      },
    }),
    {
      name: 'prayer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        location: state.location,
        prayerTimes: state.prayerTimes,
        hijriDate: state.hijriDate,
        lastFetchDate: state.lastFetchDate,
      }),
    }
  )
);
