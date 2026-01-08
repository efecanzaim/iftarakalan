import { Platform } from 'react-native';
import Constants from 'expo-constants';

const COUNTDOWN_NOTIFICATION_ID = 'iftar-countdown';

// Expo Go'da mı çalışıyoruz kontrol et
const isExpoGo = Constants.executionEnvironment === 'storeClient';

// Notifications modülünü lazy load et
type NotificationsModule = typeof import('expo-notifications');
let notificationsModule: NotificationsModule | null = null;
let isInitialized = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (isExpoGo) return null;

  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');

    if (!isInitialized) {
      // Bildirim davranışını ayarla
      notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      isInitialized = true;
    }
  }
  return notificationsModule;
}

/**
 * Bildirim iznini iste
 */
export async function requestNotificationPermission(): Promise<boolean> {
  // Expo Go'da notification desteklenmiyor
  if (isExpoGo) {
    console.log('Push notifications are not supported in Expo Go. Use a development build for full functionality.');
    return false;
  }

  try {
    const notif = await getNotifications();
    if (!notif) return false;

    const { status: existingStatus } = await notif.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notif.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Android için notification channel oluştur
    if (Platform.OS === 'android') {
      await createNotificationChannels();
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Android için bildirim kanallarını oluştur
 */
async function createNotificationChannels(): Promise<void> {
  const notif = await getNotifications();
  if (!notif) return;

  await notif.setNotificationChannelAsync('prayer-times', {
    name: 'Namaz Vakitleri',
    importance: notif.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1a5f4a',
    sound: 'default',
  });

  await notif.setNotificationChannelAsync('iftar-countdown', {
    name: 'İftar Geri Sayımı',
    importance: notif.AndroidImportance.LOW,
    vibrationPattern: [0],
    lightColor: '#c9a227',
    sound: undefined,
  });

  await notif.setNotificationChannelAsync('reminders', {
    name: 'Hatırlatmalar',
    importance: notif.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1a5f4a',
    sound: 'default',
  });
}

/**
 * Namaz vakti bildirimi zamanla
 */
export async function schedulePrayerNotification(
  prayerName: string,
  prayerTime: Date,
  minutesBefore: number = 0
): Promise<string | null> {
  if (isExpoGo) return null;

  try {
    const notif = await getNotifications();
    if (!notif) return null;

    const notificationTime = new Date(prayerTime);
    notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);

    // Geçmiş zamanlı bildirimleri atla
    if (notificationTime <= new Date()) {
      return null;
    }

    const identifier = await notif.scheduleNotificationAsync({
      content: {
        title: minutesBefore > 0 ? `${prayerName} vaktine ${minutesBefore} dakika` : `${prayerName} vakti girdi`,
        body: minutesBefore > 0
          ? `${prayerName} vakti yaklaşıyor, hazırlanın.`
          : `${prayerName} vakti girdi. Hayırlı ibadetler!`,
        sound: 'default',
        data: { type: 'prayer', prayer: prayerName },
      },
      trigger: {
        type: notif.SchedulableTriggerInputTypes.DATE,
        date: notificationTime,
        channelId: 'prayer-times',
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling prayer notification:', error);
    return null;
  }
}

/**
 * İftar/İmsak hatırlatıcısı zamanla
 */
export async function scheduleReminderNotification(
  type: 'iftar' | 'imsak',
  time: Date,
  minutesBefore: number
): Promise<string | null> {
  if (isExpoGo) return null;

  try {
    const notif = await getNotifications();
    if (!notif) return null;

    const notificationTime = new Date(time);
    notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);

    if (notificationTime <= new Date()) {
      return null;
    }

    const title = type === 'iftar' ? 'İftar Hatırlatması' : 'İmsak Hatırlatması';
    const body = type === 'iftar'
      ? `İftar vaktine ${minutesBefore} dakika kaldı!`
      : `İmsak vaktine ${minutesBefore} dakika kaldı, sahura kalkmayı unutmayın!`;

    const identifier = await notif.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { type: 'reminder', reminderType: type },
      },
      trigger: {
        type: notif.SchedulableTriggerInputTypes.DATE,
        date: notificationTime,
        channelId: 'reminders',
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling reminder notification:', error);
    return null;
  }
}

/**
 * Kalıcı geri sayım bildirimi göster (Android)
 */
export async function showCountdownNotification(
  title: string,
  body: string
): Promise<void> {
  if (isExpoGo) return;

  try {
    const notif = await getNotifications();
    if (!notif) return;

    // Önce mevcut bildirim varsa iptal et
    await notif.dismissNotificationAsync(COUNTDOWN_NOTIFICATION_ID);

    await notif.scheduleNotificationAsync({
      identifier: COUNTDOWN_NOTIFICATION_ID,
      content: {
        title,
        body,
        sticky: true,
        autoDismiss: false,
        data: { type: 'countdown' },
      },
      trigger: null, // Hemen göster
    });
  } catch (error) {
    console.error('Error showing countdown notification:', error);
  }
}

/**
 * Geri sayım bildirimini güncelle
 */
export async function updateCountdownNotification(
  hours: number,
  minutes: number,
  seconds: number
): Promise<void> {
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  await showCountdownNotification('İftara Kalan Süre', timeStr);
}

/**
 * Geri sayım bildirimini kaldır
 */
export async function dismissCountdownNotification(): Promise<void> {
  if (isExpoGo) return;

  try {
    const notif = await getNotifications();
    if (!notif) return;

    await notif.dismissNotificationAsync(COUNTDOWN_NOTIFICATION_ID);
  } catch (error) {
    console.error('Error dismissing countdown notification:', error);
  }
}

/**
 * Tüm zamanlanmış bildirimleri iptal et
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (isExpoGo) return;

  try {
    const notif = await getNotifications();
    if (!notif) return;

    await notif.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Bildirim listener'ları ayarla
 */
export function setupNotificationListeners(
  onReceived?: (notification: any) => void,
  onResponse?: (response: any) => void
): () => void {
  if (isExpoGo) {
    return () => {}; // Boş cleanup fonksiyonu
  }

  let receivedSubscription: { remove: () => void } | null = null;
  let responseSubscription: { remove: () => void } | null = null;

  // Async olarak listener'ları ayarla
  getNotifications().then((notif) => {
    if (!notif) return;

    receivedSubscription = notif.addNotificationReceivedListener((notification) => {
      onReceived?.(notification);
    });

    responseSubscription = notif.addNotificationResponseReceivedListener((response) => {
      onResponse?.(response);
    });
  });

  return () => {
    receivedSubscription?.remove();
    responseSubscription?.remove();
  };
}
