import type { PrayerCityId } from '@/types/prayer';

export type PrayerCity = {
  id: PrayerCityId;
  label: string;
  apiCity: string;
  latitude: number;
  longitude: number;
};

export const UZ_CITIES: PrayerCity[] = [
  { id: 'tashkent', label: 'Toshkent', apiCity: 'Tashkent', latitude: 41.2995, longitude: 69.2401 },
  { id: 'samarkand', label: 'Samarqand', apiCity: 'Samarkand', latitude: 39.6542, longitude: 66.9597 },
  { id: 'bukhara', label: 'Buxoro', apiCity: 'Bukhara', latitude: 39.7681, longitude: 64.4556 },
  { id: 'andijan', label: 'Andijon', apiCity: 'Andijan', latitude: 40.7821, longitude: 72.3442 },
  { id: 'fergana', label: 'Farg‘ona', apiCity: 'Fergana', latitude: 40.3842, longitude: 71.7843 },
  { id: 'namangan', label: 'Namangan', apiCity: 'Namangan', latitude: 40.9983, longitude: 71.6726 },
  { id: 'nukus', label: 'Nukus', apiCity: 'Nukus', latitude: 42.4531, longitude: 59.6103 },
  { id: 'karshi', label: 'Qarshi', apiCity: 'Karshi', latitude: 38.8606, longitude: 65.7891 },
  { id: 'termiz', label: 'Termiz', apiCity: 'Termez', latitude: 37.2242, longitude: 67.2783 },
  { id: 'jizzakh', label: 'Jizzax', apiCity: 'Jizzakh', latitude: 40.1158, longitude: 67.8422 },
  { id: 'navoi', label: 'Navoiy', apiCity: 'Navoiy', latitude: 40.1039, longitude: 65.3686 },
  { id: 'gulistan', label: 'Guliston', apiCity: 'Guliston', latitude: 40.4897, longitude: 68.7842 },
  { id: 'urgench', label: 'Urganch', apiCity: 'Urgench', latitude: 41.55, longitude: 60.6333 },
];

export function cityById(id: PrayerCityId): PrayerCity {
  return UZ_CITIES.find((city) => city.id === id) ?? UZ_CITIES[0];
}
