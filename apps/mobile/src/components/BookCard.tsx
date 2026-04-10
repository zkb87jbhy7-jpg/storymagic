import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import type { GeneratedBook } from 'shared-types';
import { colors, typography, borderRadius, shadows, spacing } from '../utils/theme';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.base * 3) / 2;
const COVER_ASPECT_RATIO = 4 / 3;

interface BookCardProps {
  book: GeneratedBook;
  onPress: (book: GeneratedBook) => void;
}

export function BookCard({ book, onPress }: BookCardProps) {
  const coverUrl = book.illustrations?.[0]?.thumbnail_url;
  const title = book.title || 'Untitled Book';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(book)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Open book: ${title}`}
    >
      <View style={styles.coverContainer}>
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={styles.cover}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderEmoji} accessibilityLabel="Book icon">
              {'\uD83D\uDCD6'}
            </Text>
          </View>
        )}
        {book.status === 'generating' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Creating...</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {book.illustration_style && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {book.illustration_style.replace(/_/g, ' ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: spacing.base,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
    ...shadows.md,
  },
  coverContainer: {
    width: '100%',
    height: CARD_WIDTH * COVER_ASPECT_RATIO,
    backgroundColor: colors.primaryBg,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  info: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
});
