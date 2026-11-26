/**
 * @file commonStyles.ts
 * @description 여러 화면과 컴포넌트에서 반복 사용되는 레이아웃, 구분선, 텍스트 색상 등 공통 스타일 모음입니다.
 * 화면별 `StyleSheet.create`의 중복 선언을 줄이고 디자인 토큰 일관성을 유지하기 위해 사용합니다.
 */
import { StyleSheet } from 'react-native';
import { spacing, theme } from './tokens';

export const commonStyles = StyleSheet.create({
  /** 전체 화면 기본 컨테이너 (SafeAreaView) */
  screen: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  /** 가변 남은 공간 채우기 */
  flex1: {
    flex: 1,
  },
  /** ScrollView 내부 공통 여백 및 섹션 간격 */
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.pageMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  /** 섹션 단위 수직 간격 */
  section: {
    gap: spacing.sm + 4,
  },
  /** 섹션 헤더(제목 + 우측 액션/배지) 가로 정렬 */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  /** 리스트 행 상단 1px 구분선 */
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
  },
  /** 빈 상태 / 미발견 안내 중앙 정렬 컨테이너 */
  centeredEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  /** 빈 상태 카드 내부 여백 */
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  /** 하단 고정 액션/요약 바 */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pageMargin,
    paddingVertical: spacing.sm + 4,
    backgroundColor: theme.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
    gap: spacing.sm + 4,
  },
  /** 기본 본문/제목 텍스트 색상 */
  textOnSurface: {
    color: theme.onSurface,
  },
  /** 보조 설명/메타 텍스트 색상 */
  textMuted: {
    color: theme.onSurfaceVariant,
  },
  /** 브랜드 그린 강조 텍스트 색상 */
  textPrimary: {
    color: theme.primary,
  },
  /** 테라코타 오렌지 강조(할인/진행) 텍스트 색상 */
  textSecondary: {
    color: theme.secondary,
  },
});
