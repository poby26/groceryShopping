/**
 * @file InputField.tsx
 * @description 상단 라벨, 좌측 아이콘, 우측 단위 접미사('원'), 하단 힌트 텍스트 및
 * 숫자 입력 전용 정렬(`tabular-nums` + 우측 정렬)을 지원하는 공통 입력 필드 컴포넌트입니다.
 */
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  radius,
  spacing,
  tabularNums,
  theme,
  typography,
} from '../../theme/tokens';

/** InputField 컴포넌트 Props (TextInputProps의 style은 containerStyle과 충돌 방지를 위해 제외) */
interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  /** 입력 필드 상단에 표시할 라벨 텍스트 */
  label?: string;
  /** 입력 필드 하단에 표시할 안내/보조 문구 */
  hint?: string;
  /** 입력 박스 좌측에 표시할 MaterialIcons 아이콘 이름 */
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  /** 입력 박스 우측 끝에 표시할 단위 접미사 (예: '원', '개') */
  suffix?: string;
  /** true일 경우 숫자 키패드(number-pad), 우측 정렬, 고정폭 숫자(tabular-nums)를 자동 적용 */
  numeric?: boolean;
  /** 전체 입력 필드 래퍼에 적용할 외부 컨테이너 스타일 */
  containerStyle?: ViewStyle;
}

/**
 * 포커스 상태에 따라 외곽선 색상을 강조(`outlineVariant` → `primary`)하는 공통 입력 필드
 */
export function InputField({
  label,
  hint,
  leftIcon,
  suffix,
  numeric = false,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: InputFieldProps) {
  // 입력창 포커스 여부 추적 (포커스 시 테두리 색상을 primary로 전환)
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* 상단 라벨 */}
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* 입력 박스 컨테이너 (아이콘 + TextInput + 접미사) */}
      <View
        style={[
          styles.inputBox,
          focused && styles.inputBoxFocused,
        ]}
      >
        {leftIcon ? (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={theme.outline}
            style={styles.leftIcon}
          />
        ) : null}

        <TextInput
          placeholderTextColor={theme.outline}
          keyboardType={numeric ? 'number-pad' : rest.keyboardType}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            numeric && styles.numericInput,
            // 웹 브라우저 기본 포커스 아웃라인이 커스텀 테두리와 겹치지 않도록 제거
            Platform.OS === 'web' && ({ outlineStyle: 'none', outlineWidth: 0 } as unknown as TextStyle),
          ]}
          {...rest}
        />

        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>

      {/* 하단 힌트 문구 */}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    ...typography.labelSm,
    color: theme.onSurfaceVariant,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.default,
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    overflow: 'hidden',
  },
  inputBoxFocused: {
    borderColor: theme.primary,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    minWidth: 0, // 웹/Flex 환경에서 긴 텍스트가 컨테이너 밖으로 넘치지 않도록 최소 너비 0 지정
    ...typography.bodyMd,
    color: theme.onSurface,
    paddingVertical: spacing.sm,
  },
  numericInput: {
    ...tabularNums,
    textAlign: 'right',
  },
  suffix: {
    ...typography.bodyMd,
    color: theme.onSurfaceVariant,
    marginLeft: spacing.xs,
  },
  hint: {
    ...typography.labelSm,
    color: theme.outline,
  },
});
