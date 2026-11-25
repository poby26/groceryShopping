/**
 * @file SegmentedTabs.tsx
 * @description 홈 화면(주간/월간/연간) 및 장보기 이력 화면(전체/주간/월간/연간)에서
 * 기간 필터를 전환하는 공통 세그먼트 탭 컨트롤 컴포넌트입니다.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, theme, typography } from '../../theme/tokens';

/** 세그먼트 탭의 개별 옵션 정의 */
export interface TabOption<T extends string> {
  /** 선택 시 onChange로 전달될 고유 키 값 */
  key: T;
  /** 탭 버튼에 표시할 사용자용 라벨 */
  label: string;
}

/** SegmentedTabs 컴포넌트 Props */
interface SegmentedTabsProps<T extends string> {
  /** 렌더링할 탭 옵션 배열 */
  options: TabOption<T>[];
  /** 현재 선택된 탭의 키 값 */
  value: T;
  /** 다른 탭을 눌렀을 때 호출되는 콜백 */
  onChange: (value: T) => void;
}

/**
 * 제네릭 키 타입 `T`를 지원하는 세그먼트 탭 컴포넌트
 * 선택된 탭은 흰색 배경 + 외곽선 + Primary 텍스트로 강조됩니다.
 */
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
              // 미선택 탭을 누르는 순간에만 눌림 배경 표시
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
