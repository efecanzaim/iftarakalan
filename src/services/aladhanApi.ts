import axios from 'axios';
import { formatDateForApi } from '../utils/timeUtils';
import { CALCULATION_METHODS } from '../utils/constants';

const BASE_URL = 'https://api.aladhan.com/v1';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimings;
    date: {
      readable: string;
      timestamp: string;
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: { en: string };
        month: { number: number; en: string };
        year: string;
      };
      hijri: {
        date: string;
        format: string;
        day: string;
        weekday: { en: string; ar: string };
        month: { number: number; en: string; ar: string };
        year: string;
        designation: { abbreviated: string; expanded: string };
        holidays: string[];
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
      };
    };
  };
}

export interface MonthlyPrayerTimesResponse {
  code: number;
  status: string;
  data: Array<{
    timings: PrayerTimings;
    date: {
      readable: string;
      gregorian: { date: string };
      hijri: {
        date: string;
        month: { number: number; en: string; ar: string };
        year: string;
      };
    };
  }>;
}

/**
 * Belirli bir gün için namaz vakitlerini alır
 */
export async function getPrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  method: number = CALCULATION_METHODS.DIYANET
): Promise<PrayerTimesResponse | null> {
  try {
    const dateStr = formatDateForApi(date);
    const response = await axios.get<PrayerTimesResponse>(`${BASE_URL}/timings/${dateStr}`, {
      params: {
        latitude,
        longitude,
        method,
      },
    });

    if (response.data.code === 200) {
      return response.data;
    }

    console.error('Aladhan API error:', response.data.status);
    return null;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
}

/**
 * Bir ay için namaz vakitlerini alır
 */
export async function getMonthlyPrayerTimes(
  latitude: number,
  longitude: number,
  year: number = new Date().getFullYear(),
  month: number = new Date().getMonth() + 1,
  method: number = CALCULATION_METHODS.DIYANET
): Promise<MonthlyPrayerTimesResponse | null> {
  try {
    const response = await axios.get<MonthlyPrayerTimesResponse>(`${BASE_URL}/calendar/${year}/${month}`, {
      params: {
        latitude,
        longitude,
        method,
      },
    });

    if (response.data.code === 200) {
      return response.data;
    }

    console.error('Aladhan API error:', response.data.status);
    return null;
  } catch (error) {
    console.error('Error fetching monthly prayer times:', error);
    return null;
  }
}

/**
 * Sadece temel namaz vakitlerini döndürür (format temizlenmiş)
 */
export function extractMainPrayerTimes(timings: PrayerTimings): Record<string, string> {
  // Saat bilgilerinden timezone kısmını temizle (örn: "05:30 (+03)" -> "05:30")
  const cleanTime = (time: string): string => {
    return time.split(' ')[0];
  };

  return {
    Fajr: cleanTime(timings.Fajr),
    Sunrise: cleanTime(timings.Sunrise),
    Dhuhr: cleanTime(timings.Dhuhr),
    Asr: cleanTime(timings.Asr),
    Maghrib: cleanTime(timings.Maghrib),
    Isha: cleanTime(timings.Isha),
  };
}
