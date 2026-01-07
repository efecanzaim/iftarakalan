import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { getTimeRemaining, formatTimeRemaining, TimeRemaining } from '../utils/timeUtils';
import { updateCountdownNotification, dismissCountdownNotification } from '../services/notificationService';
import { useSettingsStore } from '../stores/settingsStore';

interface UseCountdownOptions {
  targetTime: Date | null;
  onComplete?: () => void;
  showNotification?: boolean;
}

export function useCountdown({ targetTime, onComplete, showNotification = false }: UseCountdownOptions) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCompleteRef = useRef(false);
  const { countdownNotification } = useSettingsStore();

  const updateTime = useCallback(() => {
    if (!targetTime) {
      setTimeRemaining(null);
      return;
    }

    const remaining = getTimeRemaining(targetTime);

    if (remaining.isNegative && !isCompleteRef.current) {
      isCompleteRef.current = true;
      setIsComplete(true);
      onComplete?.();
      dismissCountdownNotification();
    } else if (!remaining.isNegative) {
      setTimeRemaining(remaining);
      if (isCompleteRef.current) {
        isCompleteRef.current = false;
        setIsComplete(false);
      }

      // Bildirim güncelle (Android)
      if (showNotification && countdownNotification) {
        updateCountdownNotification(remaining.hours, remaining.minutes, remaining.seconds);
      }
    }
  }, [targetTime, onComplete, showNotification, countdownNotification]);

  useEffect(() => {
    // İlk güncelleme
    updateTime();

    // Her saniye güncelle
    intervalRef.current = setInterval(updateTime, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateTime]);

  // App state değişikliklerini dinle
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateTime();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [updateTime]);

  // Bildirim temizliği
  useEffect(() => {
    return () => {
      if (showNotification) {
        dismissCountdownNotification();
      }
    };
  }, [showNotification]);

  const formattedTime = timeRemaining ? formatTimeRemaining(timeRemaining) : '--:--:--';

  return {
    timeRemaining,
    formattedTime,
    isComplete,
    hours: timeRemaining?.hours ?? 0,
    minutes: timeRemaining?.minutes ?? 0,
    seconds: timeRemaining?.seconds ?? 0,
  };
}
