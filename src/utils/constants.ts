// Aladhan API calculation methods
export const CALCULATION_METHODS = {
  DIYANET: 13, // Turkey Diyanet
  MWL: 3, // Muslim World League
  ISNA: 2, // Islamic Society of North America
  EGYPT: 5, // Egyptian General Authority of Survey
  MAKKAH: 4, // Umm Al-Qura University, Makkah
  KARACHI: 1, // University of Islamic Sciences, Karachi
} as const;

// Kabe koordinatları
export const KAABA_COORDINATES = {
  latitude: 21.4225,
  longitude: 39.8262,
};

// Namaz isimleri Türkçe
export const PRAYER_NAMES: Record<string, string> = {
  Fajr: 'İmsak',
  Sunrise: 'Güneş',
  Dhuhr: 'Öğle',
  Asr: 'İkindi',
  Maghrib: 'Akşam',
  Isha: 'Yatsı',
};

// Namaz ikonları
export const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌙',
  Sunrise: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌇',
  Isha: '🌃',
};

// Varsayılan ayarlar
export const DEFAULT_SETTINGS = {
  calculationMethod: CALCULATION_METHODS.DIYANET,
  notificationsBefore: 15, // dakika
  iftarNotification: true,
  imsakNotification: true,
  prayerNotifications: true,
};

// Cache süreleri (milisaniye)
export const CACHE_DURATIONS = {
  PRAYER_TIMES: 24 * 60 * 60 * 1000, // 1 gün
  LOCATION: 60 * 60 * 1000, // 1 saat
};
