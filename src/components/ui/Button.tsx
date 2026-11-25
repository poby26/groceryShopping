/**
 * @file Button.tsx
 * @description Stitch 디자인 시스템의 버튼 변형(Primary, Secondary, Outline, Subtle)을 구현한 공통 버튼 컴포넌트입니다.
 * 한 손 조작성을 위해 기본 높이 최소 44px(sm: 40px) 터치 영역을 보장합니다.
 */
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, spacing, theme, typography } from '../../theme/tokens';

/** 버튼 시각적 위계 변형 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'subtle';

interface ButtonProps {
  /** 버튼에 표시할 텍스트 */
  label: string;
  /** 클릭/터치 시 실행할 핸들러 */
  onPress: () => void;
  variant?: ButtonVariant;
  /** 좌측에 표시할 MaterialIcons 아이콘 이름 */
  icon?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  /** true일 경우 부모 너비에 맞게 100% 확장 */
  fullWidth?: boolean;
  size?: 'md' | 'sm';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  fullWidth = false,
  size = 'md',
  style,
  textStyle,
}: ButtonProps) {
  // 버튼 배경 대비에 맞춰 아이콘 색상 결정
  const iconColor =
    variant === 'primary'
      ? theme.onSecondary
      : variant === 'secondary'
        ? theme.secondary
        : theme.onSurface;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'subtle' && styles.subtle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon ? (
        <MaterialIcons name={icon} size={20} color={iconColor} />
      ) : null}
      <Text
        style={[
          typography.labelLg,
          variant === 'primary' && styles.primaryText,
          variant === 'secondary' && styles.secondaryText,
          variant === 'outline' && styles.outlineText,
          variant === 'subtle' && styles.subtleText,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
  },
  sizeMd: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sizeSm: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: theme.secondary,
  },
  secondary: {
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.secondary,
  },
  outline: {
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
  },
  subtle: {
    backgroundColor: theme.surfaceContainerLow,
  },
  primaryText: {
    color: theme.onSecondary,
  },
  secondaryText: {
    color: theme.secondary,
  },
  outlineText: {
    color: theme.onSurface,
  },
  subtleText: {
    color: theme.onSurfaceVariant,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
