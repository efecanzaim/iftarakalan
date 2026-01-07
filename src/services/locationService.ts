import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

/**
 * Konum iznini kontrol eder ve ister
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      console.log('Foreground location permission denied');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
}

/**
 * Mevcut konumu alır
 */
export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.log('Location permission not granted');
      return null;
    }

    // Konum servislerinin açık olup olmadığını kontrol et
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      console.log('Location services are disabled');
      return null;
    }

    // Önce son bilinen konumu dene (daha hızlı)
    let location = await Location.getLastKnownPositionAsync();
    
    // Son bilinen konum yoksa veya çok eskiyse, güncel konum al
    if (!location) {
      console.log('No last known position, getting current position...');
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Emülatörde daha güvenilir
        timeInterval: 5000,
        mayShowUserSettingsDialog: true,
      });
    }

    if (!location) {
      console.log('Could not get location');
      return null;
    }

    const { latitude, longitude } = location.coords;
    console.log('Location obtained:', latitude, longitude);

    // Reverse geocoding ile şehir bilgisi al
    let city: string | undefined;
    let country: string | undefined;

    try {
      const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode) {
        city = geocode.city || geocode.subregion || undefined;
        country = geocode.country || undefined;
      }
    } catch (geocodeError) {
      console.warn('Reverse geocoding failed:', geocodeError);
    }

    return {
      latitude,
      longitude,
      city,
      country,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Konum izni durumunu kontrol eder
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
}

/**
 * Konum servislerinin etkin olup olmadığını kontrol eder
 */
export async function isLocationServicesEnabled(): Promise<boolean> {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.error('Error checking location services:', error);
    return false;
  }
}
