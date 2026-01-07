import { KAABA_COORDINATES } from './constants';

/**
 * Derece -> Radyan dönüşümü
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Radyan -> Derece dönüşümü
 */
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Kıble yönünü hesaplar
 * @param latitude Kullanıcının enlemi
 * @param longitude Kullanıcının boylamı
 * @returns Kıble açısı (derece, kuzeyden saat yönünde)
 */
export function calculateQiblaDirection(latitude: number, longitude: number): number {
  const userLatRad = toRadians(latitude);
  const userLonRad = toRadians(longitude);
  const kaabaLatRad = toRadians(KAABA_COORDINATES.latitude);
  const kaabaLonRad = toRadians(KAABA_COORDINATES.longitude);

  const lonDiff = kaabaLonRad - userLonRad;

  const x = Math.sin(lonDiff);
  const y = Math.cos(userLatRad) * Math.tan(kaabaLatRad) - Math.sin(userLatRad) * Math.cos(lonDiff);

  let qiblaAngle = toDegrees(Math.atan2(x, y));

  // Açıyı 0-360 aralığına normalize et
  if (qiblaAngle < 0) {
    qiblaAngle += 360;
  }

  return qiblaAngle;
}

/**
 * Pusula açısını normalize eder (0-360)
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * İki açı arasındaki en kısa farkı hesaplar
 */
export function getAngleDifference(angle1: number, angle2: number): number {
  let diff = ((angle2 - angle1 + 180) % 360) - 180;
  return diff < -180 ? diff + 360 : diff;
}

/**
 * Kabe'ye olan mesafeyi kilometre cinsinden hesaplar (Haversine formülü)
 */
export function calculateDistanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371; // Dünya'nın yarıçapı (km)

  const lat1Rad = toRadians(latitude);
  const lat2Rad = toRadians(KAABA_COORDINATES.latitude);
  const latDiffRad = toRadians(KAABA_COORDINATES.latitude - latitude);
  const lonDiffRad = toRadians(KAABA_COORDINATES.longitude - longitude);

  const a =
    Math.sin(latDiffRad / 2) * Math.sin(latDiffRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiffRad / 2) * Math.sin(lonDiffRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
