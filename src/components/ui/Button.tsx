/**
 * @file Button.tsx
 * @description Stitch 디자인 시스템의 버튼 변형(Primary, Secondary, Outline, Subtle)을 구현한 공통 버튼 컴포넌트입니다.
 *
 * - Primary: 핵심 액션(테라코타 오렌지 채움 배경, 흰색 텍스트)
 * - Secondary: 보조 강조 액션(흰색 배경 + 테라코타 오렌지 테두리/텍스트)
 * - Outline: 일반 취소/보조 액션(흰색 배경 + 저대비 외곽선)
 * - Subtle: 약한 강조 액션(연한 민트 그레이 채움 배경)
 *
 * 모바일 한 손 조작성을 위해 기본 높이 최소 48px(sm: 44px) 터치 영역을 보장합니다.
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

/** 버튼 시각적 위계 변형 타입 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'subtle';

/** Button 컴포넌트 Props */
interface ButtonProps {
  /** 버튼 내부에 표시할 텍스트 라벨 */
  label: string;
  /** 버튼 클릭/터치 시 실행할 콜백 함수 */
  onPress: () => void;
  /** 버튼 시각적 스타일 변형 (기본값: 'primary') */
  variant?: ButtonVariant;
  /** 라벨 좌측에 함께 표시할 MaterialIcons 아이콘 이름 */
  icon?: keyof typeof MaterialIcons.glyphMap;
  /** true일 경우 터치 비활성화 및 불투명도(0.4) 적용 */
  disabled?: boolean;
  /** true일 경우 부모 컨테이너 너비에 맞게 100% 확장 */
  fullWidth?: boolean;
  /** 버튼 높이/패딩 크기 규격 (기본값: 'md') */
  size?: 'md' | 'sm';
  /** 외부에서 추가/덮어쓸 컨테이너 스타일 */
  style?: ViewStyle;
  /** 외부에서 추가/덮어쓸 라벨 텍스트 스타일 */
  textStyle?: TextStyle;
}

/**
 * 앱 전역에서 사용하는 공통 버튼 컴포넌트
 * Pressable의 `pressed` 상태를 활용해 미세한 축소(scale: 0.99)와 투명도 피드백을 제공합니다.
 */
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
  // 배경색 대비에 맞춰 아이콘 색상 결정 (텍스트 색상과 동일하게 유지)
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
        // 비활성 상태에서는 눌림 피드백을 적용하지 않음
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
  // --- 공통 베이스 및 크기 규격 ---
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
  },
  sizeMd: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sizeSm: {
    minHeight: 44, // 최소 터치 권장 높이(44px) 보장
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },

  // --- 변형별 배경/테두리 스타일 ---
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

  // --- 변형별 텍스트 색상 ---
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

  // --- 상태 피드백 스타일 ---
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});
