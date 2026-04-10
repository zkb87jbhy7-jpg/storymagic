import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { GeneratedBook, ChildProfile } from 'shared-types';
import type { RootStackParamList, MainTabScreenProps } from '../navigation/types';
import { AuthContext } from '../../App';
import { BookCard } from '../components/BookCard';
import { ChildAvatar } from '../components/ChildAvatar';
import { EmptyState } from '../components/EmptyState';
import * as api from '../services/api';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  touchTargets,
  getFlexDirection,
} from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function DashboardScreen({}: MainTabScreenProps<'Dashboard'>) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const auth = useContext(AuthContext);
  const [books, setBooks] = useState<GeneratedBook[]>([]);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [booksRes, childrenRes] = await Promise.all([
        api.getBooks(1, 6),
        api.getChildren(),
      ]);
      setBooks(booksRes.data);
      setChildren(childrenRes);
    } catch {
      // Silently fail -- user can pull to refresh
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  function handleBookPress(book: GeneratedBook) {
    navigation.navigate('BookReader', { bookId: book.id });
  }

  function handleCreateBook() {
    navigation.navigate('Main', { screen: 'Create' });
  }

  function handleAddChild() {
    navigation.navigate('ChildProfile', {});
  }

  const userName = auth.user?.name?.split(' ')[0] || 'there';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
        ListHeaderComponent={
          <>
            {/* Welcome Banner */}
            <View style={styles.welcomeBanner}>
              <Text style={styles.welcomeText}>Hello, {userName}!</Text>
              <Text style={styles.welcomeSubtext}>
                Ready to create a new adventure?
              </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleCreateBook}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Create a new book"
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name="book" size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Create Book</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleAddChild}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Add a child profile"
              >
                <View style={[styles.actionIcon, { backgroundColor: colors.successLight }]}>
                  <Ionicons name="person-add" size={24} color={colors.success} />
                </View>
                <Text style={styles.actionText}>Add Child</Text>
              </TouchableOpacity>
            </View>

            {/* Children Profiles */}
            {children.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Children</Text>
                <FlatList
                  data={children}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.childrenList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.childItem}
                      onPress={() => navigation.navigate('ChildProfile', { childId: item.id })}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit profile for ${item.name}`}
                    >
                      <ChildAvatar name={item.name} size={56} />
                      <Text style={styles.childName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Recent Books Header */}
            {books.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Books</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="book-outline"
              title="No Books Yet"
              description="Create your first personalized storybook for your child!"
              ctaLabel="Create Your First Book"
              onCtaPress={handleCreateBook}
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['2xl'],
  },
  bookRow: {
    justifyContent: 'space-between',
  },
  welcomeBanner: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    marginTop: spacing.base,
  },
  welcomeText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  welcomeSubtext: {
    fontSize: typography.fontSize.base,
    color: colors.primaryLight,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    alignItems: 'center',
    minHeight: touchTargets.large,
    justifyContent: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  childrenList: {
    paddingRight: spacing.base,
    gap: spacing.base,
  },
  childItem: {
    alignItems: 'center',
    width: 72,
  },
  childName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
