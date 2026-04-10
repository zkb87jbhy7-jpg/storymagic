import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { colors, typography, spacing } from '../utils/theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

/**
 * Full-screen loading spinner with optional message.
 * Renders as a transparent modal overlay.
 */
export function LoadingOverlay({
  visible,
  message = 'Loading...',
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing['2xl'],
    alignItems: 'center',
    minWidth: 160,
  },
  message: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
