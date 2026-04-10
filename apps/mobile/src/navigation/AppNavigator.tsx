import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import type {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
} from './types';
import { colors, typography } from '../utils/theme';

// ─── Screens ───
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CreateBookScreen } from '../screens/CreateBookScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { BookReaderScreen } from '../screens/BookReaderScreen';
import { ChildProfileScreen } from '../screens/ChildProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// ─── Navigators ───

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// ─── Auth Stack ───

function AuthStack() {
  return (
    <AuthStackNav.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: styles.authContent,
        animation: 'slide_from_right',
      }}
    >
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    </AuthStackNav.Navigator>
  );
}

// ─── Tab Icon Mapping ───

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof MainTabParamList, { focused: IoniconsName; unfocused: IoniconsName }> = {
  Dashboard: { focused: 'home', unfocused: 'home-outline' },
  Create: { focused: 'add-circle', unfocused: 'add-circle-outline' },
  Library: { focused: 'library', unfocused: 'library-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

// ─── Main Tabs ───

function MainTabs() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: colors.textPrimary,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <MainTab.Screen
        name="Create"
        component={CreateBookScreen}
        options={{ title: 'Create Book' }}
      />
      <MainTab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: 'Library' }}
      />
      <MainTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </MainTab.Navigator>
  );
}

// ─── Root Navigator ───

interface AppNavigatorProps {
  isAuthenticated: boolean;
}

export function AppNavigator({ isAuthenticated }: AppNavigatorProps) {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {isAuthenticated ? (
        <>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen
            name="BookReader"
            component={BookReaderScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerTransparent: true,
              headerTintColor: colors.white,
              animation: 'slide_from_bottom',
              presentation: 'fullScreenModal',
            }}
          />
          <RootStack.Screen
            name="ChildProfile"
            component={ChildProfileScreen}
            options={{
              headerShown: true,
              headerTitle: 'Child Profile',
              headerStyle: styles.header,
              headerTitleStyle: styles.headerTitle,
              headerTintColor: colors.textPrimary,
              presentation: Platform.OS === 'ios' ? 'modal' : 'card',
            }}
          />
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  authContent: {
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 88 : 64,
  },
  tabBarLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
