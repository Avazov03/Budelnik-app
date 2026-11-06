import * as Location from 'expo-location';

export type GpsFix = {
  latitude: number;
  longitude: number;
  label: string;
};

export async function readGpsFix(): Promise<GpsFix> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Joylashuv ruxsati berilmadi.');
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  let label = 'GPS joy';
  try {
    const places = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
    const first = places[0];
    if (first) {
      label = [first.city || first.subregion || first.region, first.country].filter(Boolean).join(', ') || label;
    }
  } catch {
    // Coordinates alone are enough for prayer math.
  }
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    label,
  };
}
