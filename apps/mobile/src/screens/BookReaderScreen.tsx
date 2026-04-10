import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { GeneratedBook, BookIllustrationEntry } from 'shared-types';
import type { RootStackScreenProps } from '../navigation/types';
import * as api from '../services/api';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  touchTargets,
} from '../utils/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BookPage {
  pageNumber: number;
  text: string;
  illustration: BookIllustrationEntry | null;
}

export function BookReaderScreen({
  route,
  navigation,
}: RootStackScreenProps<'BookReader'>) {
  const { bookId } = route.params;
  const [book, setBook] = useState<GeneratedBook | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const flatListRef = useRef<FlatList<BookPage>>(null);

  useEffect(() => {
    loadBook();
  }, [bookId]);

  async function loadBook() {
    try {
      const bookData = await api.getBookDetail(bookId);
      setBook(bookData);

      // Build pages from the book data
      const storyPages = buildPages(bookData);
      setPages(storyPages);
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  }

  function buildPages(bookData: GeneratedBook): BookPage[] {
    const story = bookData.generated_story as Record<string, unknown> | null;
    const illustrations = bookData.illustrations;
    const result: BookPage[] = [];

    // If we have structured story data, iterate pages
    if (story && typeof story === 'object') {
      const pageTexts = (story.pages as Array<{ text?: string }>) || [];
      for (let i = 0; i < pageTexts.length; i++) {
        result.push({
          pageNumber: i + 1,
          text: pageTexts[i]?.text || '',
          illustration: illustrations?.[i] || null,
        });
      }
    }

    // If no structured data, create a single page from the title
    if (result.length === 0) {
      result.push({
        pageNumber: 1,
        text: bookData.title || 'Your story is being created...',
        illustration: illustrations?.[0] || null,
      });
    }

    return result;
  }

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPage(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  function handleAudioToggle() {
    setIsPlaying(!isPlaying);
    // Audio playback would be implemented with expo-av
  }

  function goToPage(index: number) {
    if (index >= 0 && index < pages.length) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.white} />
        <Text style={styles.loadingText}>Loading your book...</Text>
      </View>
    );
  }

  const renderPage = ({ item }: { item: BookPage }) => (
    <View style={styles.page}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        {item.illustration?.url ? (
          <Image
            source={{ uri: item.illustration.url }}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityLabel={`Illustration for page ${item.pageNumber}`}
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.placeholderIllustration}>
            <Ionicons name="image-outline" size={48} color={colors.textTertiary} />
          </View>
        )}
      </View>

      {/* Text */}
      <View style={styles.textContainer}>
        <Text style={styles.pageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Page Swiper */}
      <FlatList
        ref={flatListRef}
        data={pages}
        keyExtractor={(item) => String(item.pageNumber)}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Page Navigation */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => goToPage(currentPage - 1)}
          disabled={currentPage === 0}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Previous page"
          accessibilityState={{ disabled: currentPage === 0 }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentPage === 0 ? colors.textTertiary : colors.white}
          />
        </TouchableOpacity>

        {/* Page Indicator */}
        <Text style={styles.pageIndicator}>
          {currentPage + 1} / {pages.length}
        </Text>

        {/* Audio Button */}
        {book?.voice_narration_url && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={handleAudioToggle}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>
        )}

        {/* Next Page */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => goToPage(currentPage + 1)}
          disabled={currentPage === pages.length - 1}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Next page"
          accessibilityState={{ disabled: currentPage === pages.length - 1 }}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={
              currentPage === pages.length - 1
                ? colors.textTertiary
                : colors.white
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.white,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
  },
  illustrationContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  illustration: {
    width: SCREEN_WIDTH - spacing.base * 2,
    height: '100%',
  },
  placeholderIllustration: {
    width: SCREEN_WIDTH - spacing.base * 2,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    justifyContent: 'center',
  },
  pageText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.normal,
    color: colors.white,
    textAlign: 'center',
    lineHeight: typography.fontSize.xl * typography.lineHeight.relaxed,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    paddingBottom: spacing['2xl'],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  navButton: {
    width: touchTargets.comfortable,
    height: touchTargets.comfortable,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: touchTargets.comfortable / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pageIndicator: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.white,
  },
  audioButton: {
    width: touchTargets.comfortable,
    height: touchTargets.comfortable,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: touchTargets.comfortable / 2,
    backgroundColor: colors.primary,
  },
});
