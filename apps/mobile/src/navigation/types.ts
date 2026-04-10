import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ─── Auth Stack ───

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ─── Main Tab Navigator ───

export type MainTabParamList = {
  Dashboard: undefined;
  Create: undefined;
  Library: undefined;
  Settings: undefined;
};

// ─── Root Stack (wraps Auth + Main + modals) ───

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  BookReader: { bookId: string };
  ChildProfile: { childId?: string };
};

// ─── Screen Props Helpers ───

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

// ─── Global declaration for useNavigation/useRoute typing ───

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
