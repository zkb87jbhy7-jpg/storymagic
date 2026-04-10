import React, { createContext, useEffect } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuth, type AuthState } from './src/hooks/useAuth';
import {
  configureNotifications,
  registerForPushNotifications,
} from './src/services/notifications';
import { colors, typography, spacing } from './src/utils/theme';

// ─── Auth Context ───
// Provides auth state to all screens without prop drilling.

const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
};

export const AuthContext = createContext<AuthState>(defaultAuthState);

// ─── Root App ───

export default function App() {
  const auth = useAuth();

  // Configure push notifications on mount
  useEffect(() => {
    configureNotifications();
  }, []);

  // Register for push notifications once authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      registerForPushNotifications().catch(() => {
        // Non-critical failure -- push notifications are optional
      });
    }
  }, [auth.isAuthenticated]);

  // Show splash / loading state while checking auth
  if (auth.isLoading && !auth.isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>SM</Text>
        </View>
        <Text style={styles.loadingBrand}>StoryMagic</Text>
        <ActivityIndicator
          size="large"
          color={colors.white}
          style={styles.spinner}
        />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar
            barStyle={auth.isAuthenticated ? 'dark-content' : 'dark-content'}
            backgroundColor={colors.background}
          />
          <AppNavigator isAuthenticated={auth.isAuthenticated} />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  logoText: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  loadingBrand: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing['2xl'],
  },
  spinner: {
    marginTop: spacing.base,
  },
});
