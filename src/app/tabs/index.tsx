/**
 * @file tabs/index.tsx
 * @description '홈 - 오늘장보기' 메인 화면입니다.
 * - 주간/월간/연간 지출 및 할인 절약액 요약 카드
 * - 새 장보기 작성 CTA 버튼
 * - 예정된/진행 중인 장보기 목록 카드 (목록 수정, 장보기 시작/이어하기)
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/ui/AppHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { useAppFlow } from '../../navigation/useAppFlow';
import { useGroceryStore } from '../../store/useGroceryStore';
import {
  radius,
  spacing,
  tabularNums,
  theme,
  typography,
} from '../../theme/tokens';
import { ShoppingStatus, SummaryPeriod } from '../../types/grocery';
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
  tone: 'primary' | 'secondary' | 'neutral';
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

  const [period, setPeriod] = useState<SummaryPeriod>('weekly');
  const now = useMemo(() => new Date(), []);

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

  const handleStartShopping = (id: string) => {
    flow.startShoppingFlow(id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        mode="brand"
        title="오늘장보기"
        dateLabel={formatKoreanDateShort(now)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 기간별 장보기 지출 요약 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.titleLg, styles.sectionTitle]}>
              장보기 요약
            </Text>
            <Pressable
              onPress={flow.goHistoryTab}
              hitSlop={8}
            >
              <Text style={[typography.labelLg, styles.linkText]}>
                전체 보기
              </Text>
            </Pressable>
          </View>

          <SegmentedTabs
            options={PERIOD_OPTIONS}
            value={period}
            onChange={setPeriod}
          />

          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={[typography.titleMd, styles.cardTitle]}>
                {summaryTitle}
              </Text>
              <View style={styles.tripCountPill}>
                <Text
                  style={[typography.labelSm, tabularNums, styles.tripCountText]}
                >
                  총 {summary.tripCount}회
                </Text>
              </View>
            </View>

            <View style={styles.summaryMain}>
              <Text
                style={[
                  typography.displayLgMobile,
                  tabularNums,
                  styles.totalSpentText,
                ]}
              >
                {formatKRW(summary.totalSpent)}
              </Text>
              <Text style={[typography.bodyMd, styles.discountNote]}>
                {period === 'yearly' ? '올해 총 ' : '할인 혜택으로 '}
                <Text style={[typography.labelLg, tabularNums, styles.discountHighlight]}>
                  {formatKRW(summary.totalDiscount)}
                </Text>
                {period === 'yearly' ? ' 할인받았어요' : ' 아꼈어요'}
              </Text>
            </View>

            {/* 하단 보조 지표 2열 (기간별 맞춤형 지표 표시) */}
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={[typography.labelSm, styles.metricLabel]}>
                  {period === 'yearly' ? '월 평균 지출' : '회당 평균'}
                </Text>
                <Text
                  style={[typography.titleMd, tabularNums, styles.metricValue]}
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
                <Text style={[typography.labelSm, styles.metricLabel]}>
                  {period === 'weekly'
                    ? '예정된 장보기'
                    : period === 'monthly'
                      ? '지난달 대비'
                      : '최다 방문'}
                </Text>
                <Text
                  style={[typography.titleMd, tabularNums, styles.metricValue]}
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.titleLg, styles.sectionTitle]}>
              예정된 장보기
            </Text>
            <View style={styles.countBadge}>
              <Text style={[typography.labelSm, tabularNums, styles.countText]}>
                {plannedLists.length}건
              </Text>
            </View>
          </View>

          {plannedLists.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={[typography.titleMd, styles.emptyTitle]}>
                아직 예정된 장보기가 없어요
              </Text>
              <Text style={[typography.bodyMd, styles.emptySubtitle]}>
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
                const estimatedTotal = getListEstimatedTotal(list);
                const badge = getStatusBadge(list.status);
                return (
                  <Card key={list.id} style={styles.planCard}>
                    <View style={styles.planHeader}>
                      <View style={styles.planInfo}>
                        <Text style={[typography.titleMd, styles.cardTitle]}>
                          {list.title}
                        </Text>
                        <Text
                          style={[
                            typography.bodyMd,
                            tabularNums,
                            styles.planMeta,
                          ]}
                        >
                          품목 {list.items.length}개 · 예상{' '}
                          {formatKRW(estimatedTotal)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          badge.tone === 'primary' && styles.statusPillPrimary,
                          badge.tone === 'secondary' &&
                          styles.statusPillSecondary,
                          badge.tone === 'neutral' && styles.statusPillNeutral,
                        ]}
                      >
                        <Text
                          style={[
                            typography.labelSm,
                            badge.tone === 'primary' && styles.statusTextPrimary,
                            badge.tone === 'secondary' &&
                            styles.statusTextSecondary,
                            badge.tone === 'neutral' && styles.statusTextNeutral,
                          ]}
                        >
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.planFooter}>
                      <Button
                        label="목록 수정"
                        variant="outline"
                        size="sm"
                        onPress={() => flow.openEditList(list.id)}
                        style={styles.footerBtn}
                      />
                      <Button
                        label={
                          list.status === 'shopping'
                            ? '장보기 이어하기'
                            : '장보기 시작'
                        }
                        variant="primary"
                        size="sm"
                        onPress={() => handleStartShopping(list.id)}
                        style={styles.footerBtn}
                      />
                    </View>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.pageMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm + 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: theme.onSurface,
  },
  linkText: {
    color: theme.primary,
  },
  summaryCard: {
    gap: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    color: theme.onSurface,
  },
  tripCountPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
  },
  tripCountText: {
    color: theme.primary,
  },
  summaryMain: {
    gap: spacing.xs,
  },
  totalSpentText: {
    color: theme.onSurface,
  },
  discountNote: {
    color: theme.onSurfaceVariant,
  },
  discountHighlight: {
    color: theme.secondary,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
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
  metricLabel: {
    color: theme.onSurfaceVariant,
  },
  metricValue: {
    color: theme.onSurface,
  },
  countBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainer,
  },
  countText: {
    color: theme.onSurfaceVariant,
  },
  listStack: {
    gap: spacing.sm + 4,
  },
  planCard: {
    gap: spacing.md,
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
  planMeta: {
    color: theme.onSurfaceVariant,
  },
  statusPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusPillPrimary: {
    backgroundColor: theme.surfaceContainerLow,
  },
  statusPillSecondary: {
    backgroundColor: theme.surfaceContainer,
  },
  statusPillNeutral: {
    backgroundColor: theme.surfaceContainer,
  },
  statusTextPrimary: {
    color: theme.primary,
  },
  statusTextSecondary: {
    color: theme.secondary,
  },
  statusTextNeutral: {
    color: theme.onSurfaceVariant,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
  },
  footerBtn: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: theme.onSurface,
  },
  emptySubtitle: {
    color: theme.onSurfaceVariant,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: spacing.xs,
  },
});
