import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

// ─── Push Notification Setup ───
// Uses expo-notifications for cross-platform push notification handling.
// Registers for push tokens and stores them for the backend to use.

/**
 * Configure how notifications appear when the app is in the foreground.
 */
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Register for push notifications and return the Expo push token.
 * Returns null if permissions are denied or the device is a simulator.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications only work on physical devices
    return null;
  }

  // Check existing permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Get the push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const token = tokenData.data;

  // Store locally
  await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });

    await Notifications.setNotificationChannelAsync('book-ready', {
      name: 'Book Ready',
      description: 'Notifies when your book is ready to read',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      description: 'Weekly reading reminders and book of the week',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return token;
}

/**
 * Get the stored push token.
 */
export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
}

/**
 * Add a listener for received notifications (foreground).
 */
export function onNotificationReceived(
  callback: (notification: Notifications.Notification) => void,
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add a listener for notification responses (user tapped notification).
 */
export function onNotificationResponse(
  callback: (response: Notifications.NotificationResponse) => void,
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Schedule a local notification (e.g., reading reminder).
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerSeconds: number,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: triggerSeconds,
    },
  });
}

/**
 * Cancel all pending local notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
