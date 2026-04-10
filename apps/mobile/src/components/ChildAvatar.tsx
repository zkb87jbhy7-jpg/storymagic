import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../utils/theme';

interface ChildAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
}

/**
 * Circular avatar showing child photo or initials.
 * Adapts display size via the `size` prop.
 */
export function ChildAvatar({ name, photoUrl, size = 48 }: ChildAvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.4);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[styles.image, containerStyle]}
        accessibilityLabel={`Photo of ${name}`}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={[styles.initialsContainer, containerStyle]}
      accessibilityLabel={`Avatar for ${name}`}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  initialsContainer: {
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
});
