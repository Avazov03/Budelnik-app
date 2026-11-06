import { router } from 'expo-router';

export function leaveScreen(fallback: '/' | '/alarms' | '/calendar') {
  router.replace(fallback);
}
