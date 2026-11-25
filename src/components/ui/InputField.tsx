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
  label?: string;
  hint?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  suffix?: string;
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
    minHeight: 44,
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
