import { format, parse, differenceInSeconds, isAfter, isBefore } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isNegative: boolean;
}

/**
 * "HH:mm" formatındaki string'i Date objesine çevirir
 */
export function parseTimeString(timeStr: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * İki zaman arasındaki farkı hesaplar
 */
export function getTimeRemaining(targetTime: Date, currentTime: Date = new Date()): TimeRemaining {
  const totalSeconds = differenceInSeconds(targetTime, currentTime);
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isNegative,
  };
}

/**
 * Kalan süreyi "HH:MM:SS" formatında döndürür
 */
export function formatTimeRemaining(remaining: TimeRemaining): string {
  const { hours, minutes, seconds } = remaining;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Tarihi Türkçe format ile döndürür
 */
export function formatDateTurkish(date: Date): string {
  return format(date, 'd MMMM yyyy, EEEE', { locale: tr });
}

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndürür
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Belirli bir tarihi DD-MM-YYYY formatında döndürür (Aladhan API için)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'dd-MM-yyyy');
}

/**
 * Bir sonraki namaz vaktini bulur
 */
export function findNextPrayer(
  prayerTimes: Record<string, string>,
  prayerOrder: string[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
): { name: string; time: Date } | null {
  const now = new Date();

  for (const prayer of prayerOrder) {
    const timeStr = prayerTimes[prayer];
    if (timeStr) {
      const prayerDate = parseTimeString(timeStr);
      if (isAfter(prayerDate, now)) {
        return { name: prayer, time: prayerDate };
      }
    }
  }

  // Tüm namazlar geçtiyse, yarının ilk namazını döndür
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const firstPrayer = prayerOrder[0];
  const timeStr = prayerTimes[firstPrayer];
  if (timeStr) {
    const prayerDate = parseTimeString(timeStr, tomorrow);
    return { name: firstPrayer, time: prayerDate };
  }

  return null;
}

/**
 * İftar vaktini (Maghrib) bulur
 */
export function getIftarTime(prayerTimes: Record<string, string>): Date | null {
  const maghribTime = prayerTimes['Maghrib'];
  if (!maghribTime) return null;

  const iftarDate = parseTimeString(maghribTime);
  const now = new Date();

  // İftar geçtiyse yarının iftarını döndür
  if (isAfter(now, iftarDate)) {
    iftarDate.setDate(iftarDate.getDate() + 1);
  }

  return iftarDate;
}

/**
 * İmsak vaktini bulur
 */
export function getImsakTime(prayerTimes: Record<string, string>): Date | null {
  const fajrTime = prayerTimes['Fajr'];
  if (!fajrTime) return null;
  return parseTimeString(fajrTime);
}
