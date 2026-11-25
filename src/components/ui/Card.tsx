/**
 * @file Card.tsx
 * @description 그림자(elevation/shadow)나 블러 대신 톤 계층(`#FFFFFF`)과 1px 저대비 외곽선(`outlineVariant`)으로
 * 시각적 깊이를 표현하는 Stitch 디자인 시스템의 기본 카드 컨테이너입니다.
 */
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { radius, spacing, theme } from '../../theme/tokens';

/** Card 컴포넌트 Props */
interface CardProps {
  /** 카드 내부에 렌더링할 자식 요소 */
  children: React.ReactNode;
  /** 외부에서 추가하거나 재정의할 뷰 스타일 */
  style?: StyleProp<ViewStyle>;
  /** 내부 기본 여백(16px) 적용 여부. 구분선으로 나뉘는 리스트형 카드는 false로 지정합니다. (기본값: true) */
  padded?: boolean;
}

/**
 * 요약 정보, 목록 아이템, 영수증 섹션 등을 감싸는 공통 카드 컴포넌트
 */
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
