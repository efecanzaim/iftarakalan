import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { Magnetometer, MagnetometerMeasurement } from 'expo-sensors';
import { calculateQiblaDirection, normalizeAngle, calculateDistanceToKaaba } from '../utils/qiblaCalculator';
import { usePrayerStore } from '../stores/prayerStore';

interface QiblaData {
  compassHeading: number; // Pusula yönü (kuzeyden)
  qiblaDirection: number; // Kıble açısı
  qiblaAngle: number; // Pusula üzerinde kıble yönü
  distanceToKaaba: number; // Kabe'ye uzaklık (km)
  isCalibrated: boolean;
  error: string | null;
}

export function useQibla() {
  const { location } = usePrayerStore();
  const [qiblaData, setQiblaData] = useState<QiblaData>({
    compassHeading: 0,
    qiblaDirection: 0,
    qiblaAngle: 0,
    distanceToKaaba: 0,
    isCalibrated: false,
    error: null,
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [subscription, setSubscription] = useState<ReturnType<typeof Magnetometer.addListener> | null>(null);

  // Kıble yönünü hesapla (konum değiştiğinde)
  useEffect(() => {
    if (location) {
      const qiblaDirection = calculateQiblaDirection(location.latitude, location.longitude);
      const distanceToKaaba = calculateDistanceToKaaba(location.latitude, location.longitude);

      setQiblaData((prev) => ({
        ...prev,
        qiblaDirection,
        distanceToKaaba,
      }));
    }
  }, [location]);

  // Magnetometer verilerini işle
  const processData = useCallback(
    (data: MagnetometerMeasurement) => {
      const { x, y } = data;

      // Pusula açısını hesapla
      let heading = Math.atan2(y, x) * (180 / Math.PI);

      // iOS için düzeltme
      if (Platform.OS === 'ios') {
        heading = heading >= 0 ? heading : heading + 360;
      } else {
        // Android için düzeltme
        heading = heading >= 0 ? heading : heading + 360;
      }

      heading = normalizeAngle(heading);

      // Kıble açısını pusula üzerinde hesapla
      const { qiblaDirection } = qiblaData;
      const qiblaAngle = normalizeAngle(qiblaDirection - heading);

      setQiblaData((prev) => ({
        ...prev,
        compassHeading: heading,
        qiblaAngle,
        isCalibrated: true,
      }));
    },
    [qiblaData.qiblaDirection]
  );

  // Sensörü başlat
  const startCompass = useCallback(async () => {
    try {
      const available = await Magnetometer.isAvailableAsync();
      setIsAvailable(available);

      if (!available) {
        setQiblaData((prev) => ({
          ...prev,
          error: 'Pusula sensörü bu cihazda kullanılamıyor.',
        }));
        return;
      }

      // Güncelleme aralığını ayarla
      Magnetometer.setUpdateInterval(100);

      // Listener ekle
      const sub = Magnetometer.addListener(processData);
      setSubscription(sub);

      setQiblaData((prev) => ({
        ...prev,
        error: null,
      }));
    } catch (error) {
      setQiblaData((prev) => ({
        ...prev,
        error: 'Pusula başlatılamadı.',
      }));
    }
  }, [processData]);

  // Sensörü durdur
  const stopCompass = useCallback(() => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  }, [subscription]);

  // Component mount/unmount
  useEffect(() => {
    startCompass();

    return () => {
      stopCompass();
    };
  }, []);

  // processData değiştiğinde subscription'ı güncelle
  useEffect(() => {
    if (subscription && isAvailable) {
      subscription.remove();
      const newSub = Magnetometer.addListener(processData);
      setSubscription(newSub);
    }
  }, [processData, isAvailable]);

  return {
    ...qiblaData,
    isAvailable,
    hasLocation: !!location,
    startCompass,
    stopCompass,
  };
}
