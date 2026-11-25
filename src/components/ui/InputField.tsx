/**
 * @file InputField.tsx
 * @description 라벨, 좌측 아이콘, 우측 단위 접미사('원'), 힌트 텍스트 및 숫자 입력 정렬(`tabular-nums` + 우측 정렬)을
 * 지원하는 공통 입력 필드 컴포넌트입니다.
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
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

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  /** 입력 필드 상단 라벨 */
  label?: string;
  /** 입력 필드 하단 안내 문구 */
  hint?: string;
  /** 좌측에 표시할 MaterialIcons 아이콘 이름 */
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  /** 우측 단위 접미사 (예: '원') */
  suffix?: string;
  /** true일 경우 숫자 키패드, 우측 정렬, 고정폭 숫자(tabular-nums)를 적용 */
  numeric?: boolean;
  containerStyle?: ViewStyle;
}

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
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
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
          ]}
          {...rest}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
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
  },
  inputBoxFocused: {
    borderColor: theme.primary,
    borderWidth: 1.5,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
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
