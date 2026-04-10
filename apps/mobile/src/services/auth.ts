import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

// ─── Token Management ───
// Uses AsyncStorage for secure token persistence on the device.

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/**
 * Store authentication tokens after login/register.
 */
export async function storeTokens(tokens: AuthTokens): Promise<void> {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token],
    [STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token],
  ]);
}

/**
 * Retrieve the current access token.
 * Returns null if not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Retrieve the current refresh token.
 */
export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Check whether the user has stored tokens.
 * Does NOT validate token expiry -- the API client handles 401 refresh.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

/**
 * Clear all auth tokens and user data (logout).
 */
export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER_DATA,
  ]);
}

/**
 * Store serialized user data for offline access.
 */
export async function storeUserData(data: unknown): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
}

/**
 * Retrieve cached user data.
 */
export async function getUserData<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
