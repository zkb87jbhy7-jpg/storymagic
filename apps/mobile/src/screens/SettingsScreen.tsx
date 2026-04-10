import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  I18nManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { MainTabScreenProps } from '../navigation/types';
import { AuthContext } from '../../App';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  touchTargets,
} from '../utils/theme';
import { LANGUAGE_LABELS } from '../utils/constants';

export function SettingsScreen({}: MainTabScreenProps<'Settings'>) {
  const auth = useContext(AuthContext);
  const [dyslexiaMode, setDyslexiaMode] = useState(
    auth.user?.accessibility_prefs?.dyslexia_mode ?? false,
  );
  const [highContrast, setHighContrast] = useState(
    auth.user?.accessibility_prefs?.high_contrast ?? false,
  );
  const [reducedMotion, setReducedMotion] = useState(
    auth.user?.accessibility_prefs?.reduced_motion ?? false,
  );
  const [language, setLanguage] = useState(
    auth.user?.language_preference || 'en',
  );

  function handleLogout() {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => auth.logout(),
        },
      ],
    );
  }

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    // Apply RTL if needed
    const needsRTL = lang === 'he' || lang === 'ar';
    if (I18nManager.isRTL !== needsRTL) {
      I18nManager.forceRTL(needsRTL);
      Alert.alert(
        'Restart Required',
        'Please restart the app to apply the language change.',
      );
    }
  }

  const subscriptionTier = auth.user?.subscription_tier || 'free';
  const subscriptionLabel =
    subscriptionTier === 'free'
      ? 'Free Plan'
      : subscriptionTier === 'monthly'
        ? 'Monthly Subscription'
        : 'Yearly Subscription';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {auth.user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {auth.user?.name || 'User'}
            </Text>
            <Text style={styles.profileEmail}>
              {auth.user?.email || ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="star" size={20} color={colors.accent} />
            <Text style={styles.rowLabel}>{subscriptionLabel}</Text>
          </View>
          {subscriptionTier === 'free' && (
            <TouchableOpacity
              style={styles.upgradeButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Upgrade subscription"
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Language Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        <View style={styles.languageGrid}>
          {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.languageOption,
                language === code && styles.languageOptionSelected,
              ]}
              onPress={() => handleLanguageChange(code)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={label}
              accessibilityState={{ selected: language === code }}
            >
              <Text
                style={[
                  styles.languageOptionText,
                  language === code && styles.languageOptionTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Accessibility Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="text" size={20} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Dyslexia-Friendly Font</Text>
            </View>
            <Switch
              value={dyslexiaMode}
              onValueChange={setDyslexiaMode}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={dyslexiaMode ? colors.primary : colors.surfaceSecondary}
              accessibilityLabel="Toggle dyslexia-friendly font"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="contrast" size={20} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>High Contrast</Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={highContrast ? colors.primary : colors.surfaceSecondary}
              accessibilityLabel="Toggle high contrast mode"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons name="pause" size={20} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Reduced Motion</Text>
            </View>
            <Switch
              value={reducedMotion}
              onValueChange={setReducedMotion}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={reducedMotion ? colors.primary : colors.surfaceSecondary}
              accessibilityLabel="Toggle reduced motion"
            />
          </View>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Log out"
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.version}>StoryMagic v0.1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    ...shadows.sm,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  upgradeButton: {
    marginTop: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageOption: {
    paddingHorizontal: spacing.base,
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  languageOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  languageOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  languageOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchTargets.comfortable,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  toggleLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: touchTargets.comfortable,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.lg,
    marginTop: spacing.base,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
});
