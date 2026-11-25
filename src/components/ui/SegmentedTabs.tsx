import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, theme, typography } from '../../theme/tokens';

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
            style={[styles.tab, selected && styles.tabSelected]}
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
    backgroundColor: theme.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  tabSelected: {
    backgroundColor: theme.surfaceContainerLowest,
  },
  labelSelected: {
    color: theme.primary,
  },
  labelDefault: {
    color: theme.onSurfaceVariant,
  },
});
