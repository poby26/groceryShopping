/**
 * @file SectionHeader.tsx
 * @description 각 섹션 상단의 제목과 우측 보조 요소(링크 버튼, 상태 배지, 또는 요약 텍스트)를
 * 일관되게 배치하는 공통 섹션 헤더 컴포넌트입니다.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';
import { tabularNums, typography } from '../../theme/tokens';
import { BadgeTone, StatusBadge } from './StatusBadge';

interface SectionHeaderProps {
  /** 섹션 제목 */
  title: string;
  /** 우측에 표시할 보조 텍스트 (배지나 링크가 아닐 때 사용) */
  rightText?: string;
  /** 우측 보조 텍스트 강조 톤 */
  rightTextTone?: 'muted' | 'primary';
  /** 우측에 알약형 배지로 표시할 텍스트 */
  badgeLabel?: string;
  badgeTone?: BadgeTone;
  /** 우측 링크 버튼 라벨 (예: '전체 보기') */
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({
  title,
  rightText,
  rightTextTone = 'muted',
  badgeLabel,
  badgeTone = 'neutral',
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={commonStyles.sectionHeader}>
      <Text style={[typography.titleLg, commonStyles.textOnSurface]}>
        {title}
      </Text>

      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <Text style={[typography.labelLg, commonStyles.textPrimary]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : badgeLabel ? (
        <StatusBadge label={badgeLabel} tone={badgeTone} />
      ) : rightText ? (
        <Text
          style={[
            rightTextTone === 'primary' ? typography.labelLg : typography.labelSm,
            tabularNums,
            rightTextTone === 'primary'
              ? commonStyles.textPrimary
              : commonStyles.textMuted,
          ]}
        >
          {rightText}
        </Text>
      ) : null}
    </View>
  );
}
