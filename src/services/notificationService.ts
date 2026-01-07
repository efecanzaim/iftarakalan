import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';
const COUNTDOWN_NOTIFICATION_ID = 'iftar-countdown';

// Expo Go'da mı çalışıyoruz kontrol et
const isExpoGo = Constants.appOwnership === 'expo';

// Bildirim davranışını ayarla (sadece Expo Go dışında)
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
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
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
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
  await Notifications.setNotificationChannelAsync('prayer-times', {
    name: 'Namaz Vakitleri',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1a5f4a',
    sound: 'default',
  });

  await Notifications.setNotificationChannelAsync('iftar-countdown', {
    name: 'İftar Geri Sayımı',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [0],
    lightColor: '#c9a227',
    sound: undefined,
  });

  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'Hatırlatmalar',
    importance: Notifications.AndroidImportance.HIGH,
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
    const notificationTime = new Date(prayerTime);
    notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);

    // Geçmiş zamanlı bildirimleri atla
    if (notificationTime <= new Date()) {
      return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: minutesBefore > 0 ? `${prayerName} vaktine ${minutesBefore} dakika` : `${prayerName} vakti girdi`,
        body: minutesBefore > 0
          ? `${prayerName} vakti yaklaşıyor, hazırlanın.`
          : `${prayerName} vakti girdi. Hayırlı ibadetler!`,
        sound: 'default',
        data: { type: 'prayer', prayer: prayerName },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
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
    const notificationTime = new Date(time);
    notificationTime.setMinutes(notificationTime.getMinutes() - minutesBefore);

    if (notificationTime <= new Date()) {
      return null;
    }

    const title = type === 'iftar' ? 'İftar Hatırlatması' : 'İmsak Hatırlatması';
    const body = type === 'iftar'
      ? `İftar vaktine ${minutesBefore} dakika kaldı!`
      : `İmsak vaktine ${minutesBefore} dakika kaldı, sahura kalkmayı unutmayın!`;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { type: 'reminder', reminderType: type },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
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
    // Önce mevcut bildirim varsa iptal et
    await Notifications.dismissNotificationAsync(COUNTDOWN_NOTIFICATION_ID);

    await Notifications.scheduleNotificationAsync({
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
    await Notifications.dismissNotificationAsync(COUNTDOWN_NOTIFICATION_ID);
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
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Bildirim listener'ları ayarla
 */
export function setupNotificationListeners(
  onReceived?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  if (isExpoGo) {
    return () => {}; // Boş cleanup fonksiyonu
  }

  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    onReceived?.(notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    onResponse?.(response);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
