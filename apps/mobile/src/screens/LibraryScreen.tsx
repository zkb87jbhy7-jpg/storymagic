import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { GeneratedBook } from 'shared-types';
import type { RootStackParamList, MainTabScreenProps } from '../navigation/types';
import { BookCard } from '../components/BookCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingOverlay } from '../components/LoadingOverlay';
import * as api from '../services/api';
import { colors, spacing, typography } from '../utils/theme';

export function LibraryScreen({}: MainTabScreenProps<'Library'>) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [books, setBooks] = useState<GeneratedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadBooks = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const response = await api.getBooks(pageNum, 20);
      if (replace) {
        setBooks(response.data);
      } else {
        setBooks((prev) => [...prev, ...response.data]);
      }
      setHasMore(response.has_next);
      setPage(pageNum);
    } catch {
      // Silently handle -- user can pull to refresh
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks(1, true);
  }, [loadBooks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBooks(1, true);
    setRefreshing(false);
  }, [loadBooks]);

  const onEndReached = useCallback(() => {
    if (hasMore && !isLoading) {
      loadBooks(page + 1, false);
    }
  }, [hasMore, isLoading, page, loadBooks]);

  function handleBookPress(book: GeneratedBook) {
    navigation.navigate('BookReader', { bookId: book.id });
  }

  function handleCreateBook() {
    navigation.navigate('Main', { screen: 'Create' });
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading && books.length === 0} message="Loading your library..." />
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.bookRow}
        renderItem={({ item }) => (
          <BookCard book={item} onPress={handleBookPress} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="library-outline"
              title="Your Library is Empty"
              description="Start creating personalized storybooks and they will appear here."
              ctaLabel="Create Your First Book"
              onCtaPress={handleCreateBook}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing['2xl'],
    flexGrow: 1,
  },
  bookRow: {
    justifyContent: 'space-between',
  },
});
