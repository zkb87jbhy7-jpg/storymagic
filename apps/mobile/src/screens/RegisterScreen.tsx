import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AuthScreenProps } from '../navigation/types';
import { AuthContext } from '../../App';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  touchTargets,
} from '../utils/theme';
import { LANGUAGE_LABELS } from '../utils/constants';

const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_LABELS);

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const auth = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8;

  async function handleRegister() {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await auth.register({
        name: name.trim(),
        email: email.trim(),
        password,
        language_preference: language,
      });
    } catch {
      Alert.alert(
        'Registration Failed',
        auth.error || 'Please check your information and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join StoryMagic and create amazing personalized stories
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
                accessibilityLabel="Full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                textContentType="emailAddress"
                returnKeyType="next"
                accessibilityLabel="Email address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 characters"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="next"
                accessibilityLabel="Password, minimum 8 characters"
              />
              {password.length > 0 && password.length < 8 && (
                <Text style={styles.validationHint}>
                  Password must be at least 8 characters
                </Text>
              )}
            </View>

            {/* Language Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Preferred Language</Text>
              <View style={styles.languageGrid}>
                {LANGUAGE_OPTIONS.map(([code, label]) => (
                  <TouchableOpacity
                    key={code}
                    style={[
                      styles.languageOption,
                      language === code && styles.languageOptionSelected,
                    ]}
                    onPress={() => setLanguage(code)}
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

            <TouchableOpacity
              style={[
                styles.registerButton,
                !isFormValid && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!isFormValid || isSubmitting}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Create account"
              accessibilityState={{ disabled: !isFormValid || isSubmitting }}
            >
              <Text style={styles.registerButtonText}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="link"
              accessibilityLabel="Go to login"
              style={styles.linkTouchable}
            >
              <Text style={styles.linkText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  form: {
    marginBottom: spacing['2xl'],
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    minHeight: touchTargets.comfortable,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  validationHint: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
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
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    minHeight: touchTargets.comfortable,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  linkTouchable: {
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  linkText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
