/**
 * @file AppHeader.tsx
 * @description 화면 유형에 따라 두 가지 모드를 제공하는 공통 상단 헤더 컴포넌트입니다.
 * - `brand` 모드: 최상위 탭 화면(홈, 히스토리)용 브랜드 아이콘 + 제목 + 오늘 날짜 표시
 * - `task` 모드: 작업 흐름 화면(작성, 장보기 진행, 상세)용 뒤로가기 버튼 + 제목/부제목 + 상태 배지
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../../theme/commonStyles';
import { radius, spacing, tabularNums, theme, typography } from '../../theme/tokens';
import { BadgeTone, StatusBadge } from './StatusBadge';

interface BrandHeaderProps {
  mode: 'brand';
  title: string;
  dateLabel: string;
}

interface TaskHeaderProps {
  mode: 'task';
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeTone?: BadgeTone;
  onBack: () => void;
}

export type AppHeaderProps = BrandHeaderProps | TaskHeaderProps;

export function AppHeader(props: AppHeaderProps) {
  if (props.mode === 'brand') {
    return (
      <View style={styles.header}>
        <View style={styles.leftRow}>
          <View style={styles.brandIconWrap}>
            <MaterialIcons
              name="shopping-basket"
              size={20}
              color={theme.primary}
            />
          </View>
          <Text style={[typography.headlineMd, commonStyles.textOnSurface]}>
            {props.title}
          </Text>
        </View>
        <Text style={[typography.labelSm, tabularNums, commonStyles.textMuted]}>
          {props.dateLabel}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <View style={styles.leftRow}>
        <Pressable
          onPress={props.onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <MaterialIcons name="arrow-back" size={20} color={theme.onSurface} />
        </Pressable>
        <View style={styles.taskTitleWrap}>
          <Text
            style={[typography.titleLg, commonStyles.textOnSurface]}
            numberOfLines={1}
          >
            {props.title}
          </Text>
          {props.subtitle ? (
            <Text style={[typography.labelSm, tabularNums, commonStyles.textMuted]}>
              {props.subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {props.badgeLabel ? (
        <StatusBadge label={props.badgeLabel} tone={props.badgeTone ?? 'neutral'} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pageMargin,
    paddingVertical: spacing.sm + 4,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.outlineVariant,
    gap: spacing.sm,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    flex: 1,
  },
  brandIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.default,
    backgroundColor: theme.surfaceContainerLow,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: theme.surfaceContainerLow,
  },
  taskTitleWrap: {
    flex: 1,
    gap: 2,
  },
});
