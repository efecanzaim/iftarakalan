import { useEffect, useMemo } from 'react';
import { usePrayerStore } from '../stores/prayerStore';
import { findNextPrayer, getIftarTime, getImsakTime, getTodayDateString } from '../utils/timeUtils';
import { PRAYER_NAMES } from '../utils/constants';

export function usePrayerTimes() {
  const {
    location,
    prayerTimes,
    hijriDate,
    lastFetchDate,
    isLoadingLocation,
    isLoadingPrayerTimes,
    locationError,
    prayerTimesError,
    fetchLocation,
    fetchPrayerTimes,
    refreshAll,
    clearErrors,
  } = usePrayerStore();

  // İlk yüklemede veya günlük güncelleme gerekiyorsa veri çek
  useEffect(() => {
    const today = getTodayDateString();
    const needsRefresh = !lastFetchDate || lastFetchDate !== today;

    if (!location && !isLoadingLocation && !locationError) {
      fetchLocation();
    } else if (location && needsRefresh && !isLoadingPrayerTimes) {
      fetchPrayerTimes();
    }
  }, [location, lastFetchDate]);

  // Bir sonraki namaz vaktini hesapla
  const nextPrayer = useMemo(() => {
    if (!prayerTimes) return null;
    return findNextPrayer(prayerTimes);
  }, [prayerTimes]);

  // İftar vaktini hesapla
  const iftarTime = useMemo(() => {
    if (!prayerTimes) return null;
    return getIftarTime(prayerTimes);
  }, [prayerTimes]);

  // İmsak vaktini hesapla
  const imsakTime = useMemo(() => {
    if (!prayerTimes) return null;
    return getImsakTime(prayerTimes);
  }, [prayerTimes]);

  // Türkçe namaz isimleri ile vakitler
  const prayerTimesWithNames = useMemo(() => {
    if (!prayerTimes) return null;

    return Object.entries(prayerTimes).map(([key, time]) => ({
      key,
      name: PRAYER_NAMES[key] || key,
      time,
    }));
  }, [prayerTimes]);

  return {
    location,
    prayerTimes,
    prayerTimesWithNames,
    hijriDate,
    nextPrayer: nextPrayer
      ? {
          ...nextPrayer,
          nameTr: PRAYER_NAMES[nextPrayer.name] || nextPrayer.name,
        }
      : null,
    iftarTime,
    imsakTime,
    isLoading: isLoadingLocation || isLoadingPrayerTimes,
    error: locationError || prayerTimesError,
    refresh: refreshAll,
    clearErrors,
  };
}
