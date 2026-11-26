/**
 * @file QuantityStepper.tsx
 * @description 품목 수량을 1 이상으로 증감시키는 공통 스테퍼 컴포넌트입니다.
 * 목록 작성 화면(`create/index.tsx`)과 새 품목 추가 모달(`AddItemModal.tsx`)에서 공용으로 사용합니다.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, spacing, tabularNums, theme, typography } from '../../theme/tokens';

interface QuantityStepperProps {
  /** 라벨 텍스트 (기본값: '수량') */
  label?: string;
  /** 현재 수량 (1 이상) */
  value: number;
  /** 수량 변경 콜백 */
  onChange: (nextValue: number) => void;
  min?: number;
}

export function QuantityStepper({
  label = '수량',
  value,
  onChange,
  min = 1,
}: QuantityStepperProps) {
  return (
    <View style={styles.wrap}>
      <Text style={[typography.labelSm, styles.label]}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          accessibilityLabel="수량 감소"
          style={styles.stepBtn}
        >
          <MaterialIcons name="remove" size={18} color={theme.onSurface} />
        </Pressable>
        <Text style={[typography.titleMd, tabularNums, styles.valueText]}>
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(value + 1)}
          accessibilityLabel="수량 증가"
          style={styles.stepBtn}
        >
          <MaterialIcons name="add" size={18} color={theme.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: theme.onSurfaceVariant,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.default,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    backgroundColor: theme.surfaceContainerLowest,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: theme.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    minWidth: 28,
    textAlign: 'center',
    color: theme.onSurface,
  },
});
