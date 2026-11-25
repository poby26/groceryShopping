import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { radius, spacing, theme } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function Card({ children, style, padded = true }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    borderRadius: radius.lg,
  },
  padded: {
    padding: spacing.md,
  },
});
