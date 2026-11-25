/**
 * @file SegmentedTabs.tsx
 * @description 홈(주간/월간/연간) 및 히스토리(전체/주간/월간/연간) 화면에서 기간 필터를 전환하는
 * 공통 세그먼트 탭 컴포넌트입니다.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, theme, typography } from '../../theme/tokens';

/** 세그먼트 탭의 개별 항목 정의 */
export interface TabOption<T extends string> {
  key: T;
  label: string;
}

interface SegmentedTabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<T>) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
      {options.map((opt) => {
        const selected = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.tab,
              selected ? styles.tabSelected : styles.tabDefault,
              pressed && !selected && styles.tabPressed,
            ]}
          >
            <Text
              style={[
                typography.labelLg,
                selected ? styles.labelSelected : styles.labelDefault,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  tabDefault: {
    backgroundColor: 'transparent',
  },
  tabSelected: {
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
  },
  tabPressed: {
    backgroundColor: theme.surfaceContainerLow,
  },
  labelSelected: {
    color: theme.primary,
  },
  labelDefault: {
    color: theme.onSurfaceVariant,
  },
});
