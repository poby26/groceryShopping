/**
 * @file Card.tsx
 * @description 그림자 대신 톤 계층(`#FFFFFF`)과 1px 저대비 외곽선(`outlineVariant`)으로
 * 깊이를 표현하는 Stitch 디자인 시스템 기본 카드 컨테이너입니다.
 */
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { radius, spacing, theme } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 내부 여백(16px) 적용 여부. 구분선으로 나뉘는 리스트형 카드는 false로 지정 */
  padded?: boolean;
}

export function Card({ children, style, padded = true }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    borderRadius: radius.lg,
  },
  padded: {
    padding: spacing.md,
  },
});
