/**
 * @file StatusBadge.tsx
 * @description 상태, 건수, 완료 횟수 등을 표시하는 알약형(pill) 배지 컴포넌트입니다.
 * `primary`(그린), `secondary`(오렌지), `neutral`(중립) 3가지 톤을 지원합니다.
 */
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { radius, spacing, tabularNums, theme, typography } from '../../theme/tokens';

export type BadgeTone = 'primary' | 'secondary' | 'neutral';

interface StatusBadgeProps {
  /** 배지에 표시할 텍스트 */
  label: string;
  /** 시각적 톤 (기본값: 'neutral') */
  tone?: BadgeTone;
  /** 작은 여백 컴팩트 크기 여부 */
  compact?: boolean;
  style?: ViewStyle;
}

export function StatusBadge({
  label,
  tone = 'neutral',
  compact = false,
  style,
}: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        tone === 'primary' && styles.primaryBg,
        tone === 'secondary' && styles.secondaryBg,
        tone === 'neutral' && styles.neutralBg,
        style,
      ]}
    >
      <Text
        style={[
          typography.labelSm,
          tabularNums,
          tone === 'primary' && styles.primaryText,
          tone === 'secondary' && styles.secondaryText,
          tone === 'neutral' && styles.neutralText,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeCompact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  primaryBg: {
    backgroundColor: theme.surfaceContainerLow,
  },
  secondaryBg: {
    backgroundColor: theme.surfaceContainer,
  },
  neutralBg: {
    backgroundColor: theme.surfaceContainer,
  },
  primaryText: {
    color: theme.primary,
  },
  secondaryText: {
    color: theme.secondary,
  },
  neutralText: {
    color: theme.onSurfaceVariant,
  },
});
