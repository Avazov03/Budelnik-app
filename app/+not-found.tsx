import { Link, Stack } from 'expo-router';

import { ScreenContainer } from '@/components/Screen';
import { useAppTheme } from '@/theme/ThemeProvider';
import { Text } from 'react-native';

export default function NotFoundScreen() {
  const { colors } = useAppTheme();
  return (
    <ScreenContainer>
      <Stack.Screen options={{ title: 'Topilmadi' }} />
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>Bu sahifa yo‘q.</Text>
      <Link href="/" style={{ marginTop: 12 }}>
        <Text style={{ color: colors.accent, fontWeight: '700' }}>Bosh sahifaga qaytish</Text>
      </Link>
    </ScreenContainer>
  );
}
