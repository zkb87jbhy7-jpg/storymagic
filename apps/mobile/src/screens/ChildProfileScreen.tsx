import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Gender, ChildProfile, ChildProfileCreate } from 'shared-types';
import type { RootStackScreenProps } from '../navigation/types';
import { ChildAvatar } from '../components/ChildAvatar';
import { LoadingOverlay } from '../components/LoadingOverlay';
import * as api from '../services/api';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  touchTargets,
} from '../utils/theme';
import { GENDER_LABELS, MIN_CHILD_AGE, MAX_CHILD_AGE } from '../utils/constants';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'boy', label: 'Boy' },
  { value: 'girl', label: 'Girl' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function ChildProfileScreen({
  route,
  navigation,
}: RootStackScreenProps<'ChildProfile'>) {
  const childId = route.params?.childId;
  const isEditing = Boolean(childId);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (childId) {
      loadChild(childId);
    }
  }, [childId]);

  async function loadChild(id: string) {
    setIsLoading(true);
    try {
      const child = await api.getChild(id);
      setName(child.name);
      setGender(child.gender);
      if (child.birth_date) {
        const birthYear = new Date(child.birth_date).getFullYear();
        const currentYear = new Date().getFullYear();
        setAge(String(currentYear - birthYear));
      }
    } catch {
      Alert.alert('Error', 'Failed to load child profile.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = name.trim().length > 0;

  function getBirthDateFromAge(ageStr: string): string | undefined {
    const ageNum = parseInt(ageStr, 10);
    if (isNaN(ageNum) || ageNum < MIN_CHILD_AGE || ageNum > MAX_CHILD_AGE) {
      return undefined;
    }
    const now = new Date();
    const birthYear = now.getFullYear() - ageNum;
    return `${birthYear}-01-01`;
  }

  async function handleSave() {
    if (!isFormValid || isSaving) return;
    setIsSaving(true);

    try {
      const birthDate = getBirthDateFromAge(age);

      if (isEditing && childId) {
        await api.updateChild(childId, {
          name: name.trim(),
          gender: gender || undefined,
          birth_date: birthDate,
        });
        Alert.alert('Success', 'Child profile updated.');
      } else {
        const data: ChildProfileCreate = {
          name: name.trim(),
          gender: gender || undefined,
          birth_date: birthDate,
        };
        await api.createChild(data);
        Alert.alert('Success', 'Child profile created!');
      }
      navigation.goBack();
    } catch (err) {
      const message =
        err instanceof api.ApiError
          ? err.message
          : 'Failed to save. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTakePhoto() {
    // Camera integration would use expo-camera
    Alert.alert(
      'Camera',
      'Photo capture will be available in the next update. For now, photos can be added from the web app.',
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <LoadingOverlay
        visible={isLoading}
        message="Loading profile..."
      />
      <LoadingOverlay
        visible={isSaving}
        message="Saving..."
      />

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <ChildAvatar name={name || '?'} size={96} />
        <TouchableOpacity
          style={styles.photoButton}
          onPress={handleTakePhoto}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Take or upload a photo"
        >
          <Ionicons name="camera-outline" size={18} color={colors.primary} />
          <Text style={styles.photoButtonText}>
            {isEditing ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Child's Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter child's name"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="words"
          returnKeyType="next"
          accessibilityLabel="Child's name"
        />
      </View>

      {/* Age */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Age ({MIN_CHILD_AGE}-{MAX_CHILD_AGE})
        </Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder={`${MIN_CHILD_AGE} - ${MAX_CHILD_AGE}`}
          placeholderTextColor={colors.textTertiary}
          keyboardType="number-pad"
          maxLength={2}
          returnKeyType="done"
          accessibilityLabel={`Child's age, between ${MIN_CHILD_AGE} and ${MAX_CHILD_AGE}`}
        />
      </View>

      {/* Gender */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderOptions}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderOption,
                gender === option.value && styles.genderOptionSelected,
              ]}
              onPress={() => setGender(option.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: gender === option.value }}
            >
              <Text
                style={[
                  styles.genderOptionText,
                  gender === option.value && styles.genderOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!isFormValid || isSaving}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isEditing ? 'Update profile' : 'Create profile'}
        accessibilityState={{ disabled: !isFormValid || isSaving }}
      >
        <Text style={styles.saveButtonText}>
          {isEditing ? 'Update Profile' : 'Create Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.base,
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
  },
  photoButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  inputGroup: {
    marginBottom: spacing.lg,
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
  genderOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderOption: {
    flex: 1,
    minHeight: touchTargets.comfortable,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  genderOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  genderOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  genderOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    minHeight: touchTargets.comfortable,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
