/**
 * @file AppHeader.tsx
 * @description 화면 성격에 따라 두 가지 레이아웃 모드를 제공하는 공통 상단 헤더 컴포넌트입니다.
 *
 * - `brand` 모드: 최상위 탭 화면(홈, 장보기 이력)에서 사용하며, 브랜드 아이콘·앱/화면 제목·오늘 날짜를 표시합니다.
 * - `task` 모드: 세부 작업 화면(목록 작성/수정, 장보기 진행, 상세 영수증)에서 사용하며,
 *   원형 뒤로가기 버튼·제목/부제목·우측 상태 배지를 표시합니다.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { radius, spacing, tabularNums, theme, typography } from '../../theme/tokens';

/** 최상위 탭 화면용 브랜드 헤더 Props */
interface BrandHeaderProps {
  /** 헤더 모드 구분자 ('brand' 고정) */
  mode: 'brand';
  /** 좌측 브랜드 아이콘 옆에 표시할 화면/앱 제목 */
  title: string;
  /** 우측에 고정폭 숫자(tabular-nums)로 표시할 날짜 문자열 (예: '11월 25일 (수)') */
  dateLabel: string;
}

/** 작업·상세 화면용 태스크 헤더 Props */
interface TaskHeaderProps {
  /** 헤더 모드 구분자 ('task' 고정) */
  mode: 'task';
  /** 헤더 중앙 좌측에 한 줄(numberOfLines=1)로 표시할 화면 제목 */
  title: string;
  /** 제목 아래에 보조 정보(예: 장보기 날짜·장소)를 표시할 선택적 부제목 */
  subtitle?: string;
  /** 우측 끝에 알약(pill) 형태로 표시할 상태 배지 텍스트 (예: '장보는 중', '완료') */
  badgeLabel?: string;
  /** 상태 배지의 시각적 강조 톤 (기본값: 'neutral') */
  badgeTone?: 'primary' | 'secondary' | 'neutral';
  /** 좌측 뒤로가기 버튼 클릭 시 호출되는 콜백 */
  onBack: () => void;
}

/** mode 값에 따라 BrandHeaderProps 또는 TaskHeaderProps로 좁혀지는 유니온 Props */
type AppHeaderProps = BrandHeaderProps | TaskHeaderProps;

/**
 * 앱 전역에서 재사용되는 상단 헤더 컴포넌트
 * - SafeAreaView 내부 상단에 배치하여 하단 1px 외곽선(outlineVariant)으로 본문과 영역을 구분합니다.
 */
export function AppHeader(props: AppHeaderProps) {
  // 1) 최상위 탭 화면용 브랜드 헤더 렌더링 분기
  if (props.mode === 'brand') {
    return (
      <View style={styles.header}>
        {/* 좌측: 브랜드 아이콘 박스 + 화면 제목 */}
        <View style={styles.leftRow}>
          <View style={styles.brandIconWrap}>
            <MaterialIcons
              name="shopping-basket"
              size={20}
              color={theme.primary}
            />
          </View>
          <Text style={[typography.headlineMd, styles.title]}>
            {props.title}
          </Text>
        </View>

        {/* 우측: 오늘 날짜 표시 (tabular-nums 적용으로 숫자 너비 흔들림 방지) */}
        <Text style={[typography.labelSm, tabularNums, styles.dateLabel]}>
          {props.dateLabel}
        </Text>
      </View>
    );
  }

  // 2) 세부 작업/상세 화면용 태스크 헤더 렌더링 분기
  const badgeTone = props.badgeTone ?? 'neutral';

  return (
    <View style={styles.header}>
      {/* 좌측: 뒤로가기 버튼 + 제목/부제목 텍스트 그룹 */}
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

        {/* 제목이 길어질 경우 우측 배지를 밀어내지 않도록 flex: 1 + numberOfLines=1 적용 */}
        <View style={styles.taskTitleWrap}>
          <Text
            style={[typography.titleLg, styles.title]}
            numberOfLines={1}
          >
            {props.title}
          </Text>
          {props.subtitle ? (
            <Text style={[typography.labelSm, tabularNums, styles.subtitle]}>
              {props.subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {/* 우측: 상태 배지 (전달된 경우에만 렌더링, tone에 따라 배경/텍스트 색상 분기) */}
      {props.badgeLabel ? (
        <View
          style={[
            styles.badge,
            badgeTone === 'primary' && styles.badgePrimary,
            badgeTone === 'secondary' && styles.badgeSecondary,
            badgeTone === 'neutral' && styles.badgeNeutral,
          ]}
        >
          <Text
            style={[
              typography.labelSm,
              badgeTone === 'primary' && styles.badgePrimaryText,
              badgeTone === 'secondary' && styles.badgeSecondaryText,
              badgeTone === 'neutral' && styles.badgeNeutralText,
            ]}
          >
            {props.badgeLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // --- 공통 헤더 컨테이너 ---
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

  // --- 브랜드 모드 전용 스타일 ---
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
  dateLabel: {
    color: theme.onSurfaceVariant,
  },

  // --- 태스크 모드 전용 스타일 ---
  backButton: {
    width: 44, // 모바일 터치 최소 권장 영역(44x44px) 준수
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
  title: {
    color: theme.onSurface,
  },
  subtitle: {
    color: theme.onSurfaceVariant,
  },

  // --- 상태 배지 스타일 (primary / secondary / neutral) ---
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgePrimary: {
    backgroundColor: theme.surfaceContainerLow,
  },
  badgePrimaryText: {
    color: theme.primary,
  },
  badgeSecondary: {
    backgroundColor: theme.surfaceContainer,
  },
  badgeSecondaryText: {
    color: theme.secondary,
  },
  badgeNeutral: {
    backgroundColor: theme.surfaceContainer,
  },
  badgeNeutralText: {
    color: theme.onSurfaceVariant,
  },
});
