/**
 * @file tabs/index.tsx
 * @description '홈 - 오늘장보기' 메인 화면입니다.
 * - 주간/월간/연간 지출 및 할인 절약액 요약 카드
 * - 새 장보기 작성 CTA 버튼
 * - 예정된/진행 중인 장보기 목록 카드 (목록 수정, 장보기 시작/이어하기)
 */
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { BadgeTone, StatusBadge } from '../../components/ui/StatusBadge';
import { useAppFlow } from '../../navigation/useAppFlow';
import { useGroceryStore } from '../../store/useGroceryStore';
import { commonStyles } from '../../theme/commonStyles';
import { radius, spacing, tabularNums, theme, typography } from '../../theme/tokens';
import { ShoppingList, ShoppingStatus, SummaryPeriod } from '../../types/grocery';
import { showConfirm } from '../../utils/alert';
import {
  computePeriodSummary,
  getListEstimatedTotal,
} from '../../utils/calculations';
import {
  formatKRW,
  formatKoreanDateShort,
  formatSignedDiffKRW,
} from '../../utils/format';

const PERIOD_OPTIONS: { key: SummaryPeriod; label: string }[] = [
  { key: 'weekly', label: '주간' },
  { key: 'monthly', label: '월간' },
  { key: 'yearly', label: '연간' },
];

/** 장보기 상태별 배지 라벨 및 톤 매핑 */
function getStatusBadge(status: ShoppingStatus): {
  label: string;
  tone: BadgeTone;
} {
  switch (status) {
    case 'shopping':
      return { label: '장보는 중', tone: 'secondary' };
    case 'ready':
      return { label: '준비됨', tone: 'primary' };
    case 'draft':
    default:
      return { label: '작성 중', tone: 'neutral' };
  }
}

export default function HomeScreen() {
  const flow = useAppFlow();
  const lists = useGroceryStore((s) => s.lists);
  const deleteList = useGroceryStore((s) => s.deleteList);

  const [period, setPeriod] = useState<SummaryPeriod>('weekly');
  const now = useMemo(() => new Date(), []);

  /** 예정된 장보기 삭제 확인 후 스토어에서 제거 */
  const handleDeleteList = (list: ShoppingList) => {
    showConfirm(
      '장보기 목록을 삭제할까요?',
      `'${list.title}' 목록과 담은 품목이 모두 삭제됩니다.`,
      () => deleteList(list.id),
      '삭제'
    );
  };

  // 선택된 기간(주간/월간/연간)에 따른 지출·할인·평균 통계 계산
  const summary = useMemo(
    () => computePeriodSummary(lists, period, now),
    [lists, period, now]
  );

  // 아직 완료되지 않은 예정/진행 중 장보기 목록 필터링
  const plannedLists = useMemo(
    () => lists.filter((l) => l.status !== 'completed'),
    [lists]
  );

  const summaryTitle =
    period === 'weekly'
      ? '이번 주 장보기 지출'
      : period === 'monthly'
        ? `${now.getMonth() + 1}월 장보기 지출`
        : `${now.getFullYear()}년 누적 지출`;

  return (
    <ScreenLayout
      header={{
        mode: 'brand',
        title: '오늘장보기',
        dateLabel: formatKoreanDateShort(now),
      }}
    >
      {/* 기간별 장보기 지출 요약 섹션 */}
      <View style={commonStyles.section}>
        <SectionHeader
          title="장보기 요약"
          actionLabel="전체 보기"
          onActionPress={flow.goHistoryTab}
        />

        <SegmentedTabs
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
        />

        <Card style={styles.cardGap}>
          <View style={commonStyles.sectionHeader}>
            <Text style={[typography.titleMd, commonStyles.textOnSurface]}>
              {summaryTitle}
            </Text>
            <StatusBadge label={`총 ${summary.tripCount}회`} tone="primary" />
          </View>

          <View style={styles.summaryMain}>
            <Text
              style={[
                typography.displayLgMobile,
                tabularNums,
                commonStyles.textOnSurface,
              ]}
            >
              {formatKRW(summary.totalSpent)}
            </Text>
            <Text style={[typography.bodyMd, commonStyles.textMuted]}>
              {period === 'yearly' ? '올해 총 ' : '할인 혜택으로 '}
              <Text
                style={[
                  typography.labelLg,
                  tabularNums,
                  commonStyles.textSecondary,
                ]}
              >
                {formatKRW(summary.totalDiscount)}
              </Text>
              {period === 'yearly' ? ' 할인받았어요' : ' 아꼈어요'}
            </Text>
          </View>

          {/* 하단 보조 지표 2열 */}
          <View style={[styles.metricsRow, commonStyles.rowBorder]}>
            <View style={styles.metricBox}>
              <Text style={[typography.labelSm, commonStyles.textMuted]}>
                {period === 'yearly' ? '월 평균 지출' : '회당 평균'}
              </Text>
              <Text
                style={[
                  typography.titleMd,
                  tabularNums,
                  commonStyles.textOnSurface,
                ]}
              >
                {formatKRW(
                  period === 'yearly'
                    ? summary.monthlyAverage
                    : summary.averagePerTrip
                )}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricBox}>
              <Text style={[typography.labelSm, commonStyles.textMuted]}>
                {period === 'weekly'
                  ? '예정된 장보기'
                  : period === 'monthly'
                    ? '지난달 대비'
                    : '최다 방문'}
              </Text>
              <Text
                style={[
                  typography.titleMd,
                  tabularNums,
                  commonStyles.textOnSurface,
                ]}
                numberOfLines={1}
              >
                {period === 'weekly'
                  ? `${summary.plannedCount}건`
                  : period === 'monthly'
                    ? summary.diffFromLastMonth === null
                      ? '기록 없음'
                      : formatSignedDiffKRW(summary.diffFromLastMonth)
                    : summary.topStoreName ?? '기록 없음'}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* 주요 CTA: 새 장보기 목록 작성 */}
      <Button
        label="새 장보기 작성"
        icon="add-shopping-cart"
        variant="primary"
        fullWidth
        onPress={flow.openCreateList}
      />

      {/* 예정된 장보기 목록 섹션 */}
      <View style={commonStyles.section}>
        <SectionHeader
          title="예정된 장보기"
          badgeLabel={`${plannedLists.length}건`}
        />

        {plannedLists.length === 0 ? (
          <Card style={commonStyles.emptyCard}>
            <Text style={[typography.titleMd, commonStyles.textOnSurface]}>
              아직 예정된 장보기가 없어요
            </Text>
            <Text
              style={[
                typography.bodyMd,
                commonStyles.textMuted,
                styles.emptySubtitle,
              ]}
            >
              장보러 가기 전에 필요한 품목과 예상 금액을 정리해 보세요.
            </Text>
            <Button
              label="새 장보기 작성"
              icon="add-shopping-cart"
              variant="secondary"
              size="sm"
              onPress={flow.openCreateList}
              style={styles.emptyBtn}
            />
          </Card>
        ) : (
          <View style={styles.listStack}>
            {plannedLists.map((list) => {
              const badge = getStatusBadge(list.status);
              return (
                <Card key={list.id} style={styles.cardGap}>
                  <View style={styles.planHeader}>
                    <View style={styles.planInfo}>
                      <Text
                        style={[typography.titleMd, commonStyles.textOnSurface]}
                      >
                        {list.title}
                      </Text>
                      <Text
                        style={[
                          typography.bodyMd,
                          tabularNums,
                          commonStyles.textMuted,
                        ]}
                      >
                        품목 {list.items.length}개 · 예상{' '}
                        {formatKRW(getListEstimatedTotal(list))}
                      </Text>
                    </View>
                    <View style={styles.planHeaderActions}>
                      <StatusBadge label={badge.label} tone={badge.tone} />
                      <Pressable
                        onPress={() => handleDeleteList(list)}
                        accessibilityRole="button"
                        accessibilityLabel={`${list.title} 삭제`}
                        hitSlop={6}
                        style={({ pressed }) => [
                          styles.deleteBtn,
                          pressed && styles.deleteBtnPressed,
                        ]}
                      >
                        {({ pressed }) => (
                          <MaterialIcons
                            name="delete-outline"
                            size={20}
                            color={pressed ? theme.error : theme.outline}
                          />
                        )}
                      </Pressable>
                    </View>
                  </View>

                  <View style={[styles.planFooter, commonStyles.rowBorder]}>
                    <Button
                      label="목록 수정"
                      variant="outline"
                      size="sm"
                      onPress={() => flow.openEditList(list.id)}
                      style={commonStyles.flex1}
                      disabled={list.status !== 'shopping' ? false : true}
                    />
                    <Button
                      label={
                        list.status === 'shopping'
                          ? '장보기 이어하기'
                          : '장보기 시작'
                      }
                      variant="primary"
                      size="sm"
                      onPress={() => flow.startShoppingFlow(list.id)}
                      style={commonStyles.flex1}
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardGap: {
    gap: spacing.md,
  },
  summaryMain: {
    gap: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm + 4,
  },
  metricBox: {
    flex: 1,
    gap: spacing.xs,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.outlineVariant,
    marginHorizontal: spacing.md,
  },
  listStack: {
    gap: spacing.sm + 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  planInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  planHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    backgroundColor: theme.errorContainer,
  },
  planFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm + 4,
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: spacing.xs,
  },
});
