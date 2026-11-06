import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText, useAppTheme } from '@/theme/ThemeProvider';

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = 'accent',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'accent' | 'danger' | 'ghost';
}) {
  const { colors } = useAppTheme();
  const background = tone === 'danger' ? colors.danger : tone === 'ghost' ? 'transparent' : colors.accent;
  const foreground = tone === 'ghost' ? colors.text : tone === 'danger' ? '#FFFFFF' : colors.onAccent;
  const borderColor = tone === 'ghost' ? colors.border : background;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor,
          opacity: disabled ? 0.4 : pressed ? 0.88 : 1,
        },
      ]}
    >
      <AppText tone="bodyBold" style={[styles.label, { color: foreground }]}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function TextLinkButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.link}>
      <AppText tone="bodyMedium" style={{ color: colors.accent, fontSize: 15 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText tone="display" style={{ color: colors.text, fontSize: 24 }}>
            {title}
          </AppText>
          <AppText tone="body" style={{ color: colors.textMuted, fontSize: 15, lineHeight: 22 }}>
            {message}
          </AppText>
          <View style={styles.row}>
            <PrimaryButton label="Bekor qilish" onPress={onCancel} tone="ghost" />
            <PrimaryButton label={confirmLabel} onPress={onConfirm} tone="danger" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 16, letterSpacing: 0.2 },
  link: { minHeight: 40, justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(8,12,10,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 420, borderWidth: StyleSheet.hairlineWidth, padding: 22, gap: 14 },
  row: { flexDirection: 'row', gap: 10 },
});
