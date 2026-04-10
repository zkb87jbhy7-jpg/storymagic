import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type {
  ChildProfile,
  IllustrationStyle,
  MoodSetting,
  BookCreate,
} from 'shared-types';
import type { RootStackParamList, MainTabScreenProps } from '../navigation/types';
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
import { ILLUSTRATION_STYLE_LABELS, MOOD_LABELS } from '../utils/constants';

const STYLES: { value: IllustrationStyle; label: string }[] = [
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'comic_book', label: 'Comic Book' },
  { value: '3d_pixar', label: '3D Pixar' },
  { value: 'classic_storybook', label: 'Classic Storybook' },
  { value: 'whimsical', label: 'Whimsical' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'manga', label: 'Manga' },
  { value: 'minimalist', label: 'Minimalist' },
];

const MOODS: { value: MoodSetting; label: string }[] = [
  { value: 'adventurous', label: 'Adventurous' },
  { value: 'calm', label: 'Calm' },
  { value: 'funny', label: 'Funny' },
  { value: 'bedtime', label: 'Bedtime' },
  { value: 'educational', label: 'Educational' },
  { value: 'empowering', label: 'Empowering' },
];

export function CreateBookScreen({}: MainTabScreenProps<'Create'>) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<IllustrationStyle>('watercolor');
  const [mood, setMood] = useState<MoodSetting>('adventurous');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    api.getChildren().then(setChildren).catch(() => {});
  }, []);

  function toggleChild(childId: string) {
    setSelectedChildIds((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId],
    );
  }

  const canCreate = selectedChildIds.length > 0 && prompt.trim().length > 0;

  async function handleCreate() {
    if (!canCreate || isCreating) return;
    setIsCreating(true);

    try {
      const bookData: BookCreate = {
        child_profile_ids: selectedChildIds,
        free_prompt: prompt.trim(),
        illustration_style: style,
        mood_setting: mood,
        creation_method: 'free_prompt',
      };
      const book = await api.createBook(bookData);
      Alert.alert(
        'Book Created!',
        'Your book is being generated. We will notify you when it is ready.',
        [
          {
            text: 'View Book',
            onPress: () => navigation.navigate('BookReader', { bookId: book.id }),
          },
          { text: 'OK', style: 'cancel' },
        ],
      );
      // Reset form
      setPrompt('');
      setSelectedChildIds([]);
    } catch (err) {
      const message =
        err instanceof api.ApiError ? err.message : 'Failed to create book. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <LoadingOverlay visible={isCreating} message="Creating your book..." />

      {/* Section: Select Child */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Child</Text>
        <Text style={styles.sectionDescription}>
          Choose which child this story is for
        </Text>
        {children.length === 0 ? (
          <TouchableOpacity
            style={styles.addChildButton}
            onPress={() => navigation.navigate('ChildProfile', {})}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Add a child profile first"
          >
            <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            <Text style={styles.addChildText}>Add a child profile first</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.childGrid}>
            {children.map((child) => {
              const isSelected = selectedChildIds.includes(child.id);
              return (
                <TouchableOpacity
                  key={child.id}
                  style={[styles.childCard, isSelected && styles.childCardSelected]}
                  onPress={() => toggleChild(child.id)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityLabel={child.name}
                  accessibilityState={{ checked: isSelected }}
                >
                  <ChildAvatar name={child.name} size={40} />
                  <Text
                    style={[
                      styles.childCardName,
                      isSelected && styles.childCardNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {child.name}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.primary}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Section: Story Prompt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Story Idea</Text>
        <Text style={styles.sectionDescription}>
          Describe the story you'd like to create
        </Text>
        <TextInput
          style={styles.promptInput}
          value={prompt}
          onChangeText={setPrompt}
          placeholder="e.g., A magical adventure where my child finds a dragon egg in the garden..."
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
          accessibilityLabel="Story prompt"
        />
        <Text style={styles.charCount}>{prompt.length}/500</Text>
      </View>

      {/* Section: Illustration Style */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Illustration Style</Text>
        <View style={styles.optionGrid}>
          {STYLES.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[
                styles.optionChip,
                style === s.value && styles.optionChipSelected,
              ]}
              onPress={() => setStyle(s.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={s.label}
              accessibilityState={{ selected: style === s.value }}
            >
              <Text
                style={[
                  styles.optionChipText,
                  style === s.value && styles.optionChipTextSelected,
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section: Mood */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Story Mood</Text>
        <View style={styles.optionGrid}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.optionChip,
                mood === m.value && styles.optionChipSelected,
              ]}
              onPress={() => setMood(m.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityLabel={m.label}
              accessibilityState={{ selected: mood === m.value }}
            >
              <Text
                style={[
                  styles.optionChipText,
                  mood === m.value && styles.optionChipTextSelected,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={[styles.createButton, !canCreate && styles.createButtonDisabled]}
        onPress={handleCreate}
        disabled={!canCreate || isCreating}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Create book"
        accessibilityState={{ disabled: !canCreate || isCreating }}
      >
        <Ionicons name="sparkles" size={20} color={colors.white} />
        <Text style={styles.createButtonText}>Create Book</Text>
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
    padding: spacing.base,
    paddingBottom: spacing['4xl'],
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryBg,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    minHeight: touchTargets.comfortable,
  },
  addChildText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  childGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: touchTargets.comfortable,
    ...shadows.sm,
  },
  childCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  childCardName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  childCardNameSelected: {
    color: colors.primary,
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  promptInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    minHeight: 120,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.base,
    minHeight: touchTargets.minimum,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  optionChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  optionChipTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    minHeight: touchTargets.large,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
