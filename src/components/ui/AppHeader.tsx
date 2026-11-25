import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, spacing, tabularNums, theme, typography } from '../../theme/tokens';

interface BrandHeaderProps {
  mode: 'brand';
  title: string;
  dateLabel: string;
}

interface TaskHeaderProps {
  mode: 'task';
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeTone?: 'primary' | 'secondary' | 'neutral';
  onBack: () => void;
}

type AppHeaderProps = BrandHeaderProps | TaskHeaderProps;

export function AppHeader(props: AppHeaderProps) {
  if (props.mode === 'brand') {
    return (
      <View style={styles.header}>
        <View style={styles.leftRow}>
          <View style={styles.brandIconWrap}>
            <MaterialIcons
              name="shopping-basket"
              size={20}
              color={theme.primary}
            />
          </View>
          <Text style={[typography.headlineMd, styles.title]}>
            {props.title}
          </Text>
        </View>
        <Text style={[typography.labelSm, tabularNums, styles.dateLabel]}>
          {props.dateLabel}
        </Text>
      </View>
    );
  }

  const badgeTone = props.badgeTone ?? 'neutral';

  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        <Pressable
          onPress={props.onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </Pressable>
        <View style={styles.taskTitleWrap}>
          <Text
            style={[typography.titleLg, styles.title]}
            numberOfLines={1}
          >
            {props.title}
          </Text>
          {props.subtitle ? (
            <Text style={[typography.labelSm, tabularNums, styles.subtitle]}>
              {props.subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {props.badgeLabel ? (
        <View
          style={[
            styles.badge,
            badgeTone === 'primary' && styles.badgePrimary,
            badgeTone === 'secondary' && styles.badgeSecondary,
            badgeTone === 'neutral' && styles.badgeNeutral,
          ]}
        >
          <Text
            style={[
              typography.labelSm,
              badgeTone === 'primary' && styles.badgePrimaryText,
              badgeTone === 'secondary' && styles.badgeSecondaryText,
              badgeTone === 'neutral' && styles.badgeNeutralText,
            ]}
          >
            {props.badgeLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pageMargin,
    paddingVertical: spacing.sm + 4,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.outlineVariant,
    gap: spacing.sm,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    flex: 1,
  },
  brandIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.default,
    backgroundColor: theme.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: theme.surfaceContainerLow,
  },
  taskTitleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.onSurface,
  },
  subtitle: {
    color: theme.onSurfaceVariant,
  },
  dateLabel: {
    color: theme.onSurfaceVariant,
  },
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgePrimary: {
    backgroundColor: theme.surfaceContainerLow,
  },
  badgePrimaryText: {
    color: theme.primary,
  },
  badgeSecondary: {
    backgroundColor: theme.surfaceContainer,
  },
  badgeSecondaryText: {
    color: theme.secondary,
  },
  badgeNeutral: {
    backgroundColor: theme.surfaceContainer,
  },
  badgeNeutralText: {
    color: theme.onSurfaceVariant,
  },
});
