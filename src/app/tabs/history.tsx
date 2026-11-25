/**
 * @file tabs/history.tsx
 * @description '장보기 이력' 화면입니다.
 * 전체 / 주간 / 월간 / 연간 필터 탭에 따라 완료된 장보기 요약과 목록(연간 탭은 월별 집계)을 보여줍니다.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AppHeader } from '../../components/ui/AppHeader';
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
import { HistoryFilter, ShoppingList } from '../../types/grocery';
import {
  computePeriodSummary,
  filterCompletedListsByPeriod,
  getListFinalDiscount,
  getListFinalPaid,
  groupCompletedListsByMonth,
} from '../../utils/calculations';
import {
  formatDiscountKRW,
  formatDotDate,
  formatKRW,
  formatKoreanDateShort,
} from '../../utils/format';

const FILTER_OPTIONS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'weekly', label: '주간' },
  { key: 'monthly', label: '월간' },
  { key: 'yearly', label: '연간' },
];

export default function HistoryScreen() {
  const flow = useAppFlow();
  const lists = useGroceryStore((s) => s.lists);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const now = useMemo(() => new Date(), []);

  // 전체 탭 요약 카드 및 주간/월간/연간 KPI 카드용 통계 계산
  const weeklySummary = useMemo(
    () => computePeriodSummary(lists, 'weekly', now),
    [lists, now]
  );
  const monthlySummary = useMemo(
    () => computePeriodSummary(lists, 'monthly', now),
    [lists, now]
  );
  const yearlySummary = useMemo(
    () => computePeriodSummary(lists, 'yearly', now),
    [lists, now]
  );

  // 선택된 필터에 해당하는 완료 이력 목록
  const filteredCompleted = useMemo(
    () => filterCompletedListsByPeriod(lists, filter, now),
    [lists, filter, now]
  );

  // 연간 탭에서 사용하는 올해 월별 집계 목록
  const monthlyGroups = useMemo(
    () => groupCompletedListsByMonth(lists, now.getFullYear()),
    [lists, now]
  );

  /** 완료된 장보기 1건 카드 렌더링 (탭 시 영수증 상세 화면으로 이동) */
  const renderHistoryItemCard = (item: ShoppingList) => {
    const paid = getListFinalPaid(item);
    const discount = getListFinalDiscount(item);
    const dateIso = item.completedAt ?? item.updatedAt;

    return (
      <Pressable
        key={item.id}
        onPress={() => flow.openHistoryDetail(item.id)}
        style={({ pressed }) => [
          styles.historyCard,
          pressed && styles.historyCardPressed,
        ]}
      >
        <View style={styles.historyLeft}>
          <Text style={[typography.titleMd, styles.cardTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[typography.bodyMd, tabularNums, styles.cardMeta]}>
            {formatDotDate(dateIso)} · {item.items.length}개 품목
          </Text>
        </View>
        <View style={styles.historyRight}>
          <View style={styles.amountCol}>
            <Text style={[typography.titleMd, tabularNums, styles.cardTitle]}>
              {formatKRW(paid)}
            </Text>
            {discount > 0 ? (
              <Text
                style={[typography.labelSm, tabularNums, styles.discountText]}
              >
                할인 {formatDiscountKRW(discount)}
              </Text>
            ) : null}
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.outline} />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AppHeader
        mode="brand"
        title="장보기 이력"
        dateLabel={formatKoreanDateShort(now)}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SegmentedTabs
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />

        {/* 전체 탭: 주간·월간·연간 비교 요약 + 전체 완료 목록 */}
        {filter === 'all' ? (
          <>
            <Card style={styles.allSummaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={[typography.titleMd, styles.cardTitle]}>
                  기간별 장보기 요약
                </Text>
                <Text style={[typography.labelSm, styles.cardMeta]}>
                  횟수 · 결제금액
                </Text>
              </View>
              <View style={styles.periodRows}>
                {[
                  { label: '주간', stats: weeklySummary },
                  { label: '월간', stats: monthlySummary },
                  { label: '연간', stats: yearlySummary },
                ].map((row, idx) => (
                  <View
                    key={row.label}
                    style={[
                      styles.periodRow,
                      idx > 0 && styles.periodRowBorder,
                    ]}
                  >
                    <View style={styles.periodRowLeft}>
                      <Text style={[typography.labelLg, styles.cardTitle]}>
                        {row.label}
                      </Text>
                      <View style={styles.smallPill}>
                        <Text
                          style={[
                            typography.labelSm,
                            tabularNums,
                            styles.smallPillText,
                          ]}
                        >
                          {row.stats.tripCount}회
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[typography.titleMd, tabularNums, styles.cardTitle]}
                    >
                      {formatKRW(row.stats.totalSpent)}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[typography.titleLg, styles.sectionTitle]}>
                  전체 장보기 목록
                </Text>
                <Text style={[typography.labelSm, tabularNums, styles.cardMeta]}>
                  {filteredCompleted.length}건
                </Text>
              </View>

              {filteredCompleted.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Text style={[typography.bodyMd, styles.cardMeta]}>
                    아직 완료된 장보기 기록이 없어요.
                  </Text>
                </Card>
              ) : (
                <View style={styles.listStack}>
                  {filteredCompleted.map(renderHistoryItemCard)}
                </View>
              )}
            </View>
          </>
        ) : null}

        {/* 주간 / 월간 탭: 3열 KPI 요약 + 해당 기간 완료 목록 */}
        {filter === 'weekly' || filter === 'monthly' ? (
          <>
            <Card style={styles.kpiRowCard}>
              <View style={styles.kpiItem}>
                <Text style={[typography.labelSm, styles.cardMeta]}>
                  {filter === 'weekly'
                    ? '이번 주 지출'
                    : `${now.getMonth() + 1}월 지출`}
                </Text>
                <Text
                  style={[typography.titleMd, tabularNums, styles.cardTitle]}
                >
                  {formatKRW(
                    filter === 'weekly'
                      ? weeklySummary.totalSpent
                      : monthlySummary.totalSpent
                  )}
                </Text>
              </View>
              <View style={styles.kpiDivider} />
              <View style={styles.kpiItem}>
                <Text style={[typography.labelSm, styles.cardMeta]}>
                  총 할인
                </Text>
                <Text
                  style={[
                    typography.titleMd,
                    tabularNums,
                    styles.discountText,
                  ]}
                >
                  {formatKRW(
                    filter === 'weekly'
                      ? weeklySummary.totalDiscount
                      : monthlySummary.totalDiscount
                  )}
                </Text>
              </View>
              <View style={styles.kpiDivider} />
              <View style={styles.kpiItem}>
                <Text style={[typography.labelSm, styles.cardMeta]}>
                  완료 횟수
                </Text>
                <Text
                  style={[typography.titleMd, tabularNums, styles.primaryText]}
                >
                  {filter === 'weekly'
                    ? weeklySummary.tripCount
                    : monthlySummary.tripCount}
                  회
                </Text>
              </View>
            </Card>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[typography.titleLg, styles.sectionTitle]}>
                  {filter === 'weekly' ? '주간 장보기 목록' : '월간 장보기 목록'}
                </Text>
                <Text style={[typography.labelSm, tabularNums, styles.cardMeta]}>
                  {filteredCompleted.length}건
                </Text>
              </View>

              {filteredCompleted.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Text style={[typography.bodyMd, styles.cardMeta]}>
                    해당 기간의 완료된 장보기 기록이 없어요.
                  </Text>
                </Card>
              ) : (
                <View style={styles.listStack}>
                  {filteredCompleted.map(renderHistoryItemCard)}
                </View>
              )}
            </View>
          </>
        ) : null}

        {/* 연간 탭: 올해 누적 KPI + 월별 집계 목록 */}
        {filter === 'yearly' ? (
          <>
            <Card style={styles.kpiRowCard}>
              <View style={styles.kpiItem}>
                <Text style={[typography.labelSm, styles.cardMeta]}>
                  {now.getFullYear()}년 지출
                </Text>
                <Text
                  style={[typography.titleMd, tabularNums, styles.cardTitle]}
                >
                  {formatKRW(yearlySummary.totalSpent)}
                </Text>
              </View>
              <View style={styles.kpiDivider} />
              <View style={styles.kpiItem}>
                <Text style={[typography.labelSm, styles.cardMeta]}>
                  총 할인
                </Text>
                <Text
                  style={[
                    typography.titleMd,
                    tabularNums,
                    styles.discountText,
                  ]}
                >
                  {formatKRW(yearlySummary.totalDiscount)}
                </Text>
              </View>
              <View style={styles.kpiDivider} />
              <View style={styles.kpiItem}>
                <Text style={[typography.labelSm, styles.cardMeta]}>
                  완료 횟수
                </Text>
                <Text
                  style={[typography.titleMd, tabularNums, styles.primaryText]}
                >
                  {yearlySummary.tripCount}회
                </Text>
              </View>
            </Card>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[typography.titleLg, styles.sectionTitle]}>
                  연간 장보기 목록
                </Text>
                <Text style={[typography.labelSm, tabularNums, styles.cardMeta]}>
                  {now.getFullYear()}년
                </Text>
              </View>

              {monthlyGroups.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Text style={[typography.bodyMd, styles.cardMeta]}>
                    올해 완료된 장보기 기록이 없어요.
                  </Text>
                </Card>
              ) : (
                <View style={styles.listStack}>
                  {monthlyGroups.map((group) => (
                    <Pressable
                      key={`${group.year}-${group.month}`}
                      onPress={() =>
                        flow.openHistoryDetail(group.latestListId)
                      }
                      style={({ pressed }) => [
                        styles.historyCard,
                        pressed && styles.historyCardPressed,
                      ]}
                    >
                      <View style={styles.historyLeft}>
                        <Text style={[typography.titleMd, styles.cardTitle]}>
                          {group.label}
                        </Text>
                        <Text
                          style={[
                            typography.bodyMd,
                            tabularNums,
                            styles.cardMeta,
                          ]}
                        >
                          총 {group.tripCount}회 완료
                        </Text>
                      </View>
                      <View style={styles.historyRight}>
                        <View style={styles.amountCol}>
                          <Text
                            style={[
                              typography.titleMd,
                              tabularNums,
                              styles.cardTitle,
                            ]}
                          >
                            {formatKRW(group.totalSpent)}
                          </Text>
                          {group.totalDiscount > 0 ? (
                            <Text
                              style={[
                                typography.labelSm,
                                tabularNums,
                                styles.discountText,
                              ]}
                            >
                              할인 {formatDiscountKRW(group.totalDiscount)}
                            </Text>
                          ) : null}
                        </View>
                        <MaterialIcons
                          name="chevron-right"
                          size={20}
                          color={theme.outline}
                        />
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
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
  allSummaryCard: {
    gap: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodRows: {
    gap: 0,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  periodRowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
  },
  periodRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  smallPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
  },
  smallPillText: {
    color: theme.primary,
  },
  kpiRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  kpiDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.outlineVariant,
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
  listStack: {
    gap: spacing.sm + 2,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: theme.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  historyCardPressed: {
    backgroundColor: theme.surfaceContainerLow,
  },
  historyLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  amountCol: {
    alignItems: 'flex-end',
    gap: 2,
  },
  cardTitle: {
    color: theme.onSurface,
  },
  cardMeta: {
    color: theme.onSurfaceVariant,
  },
  discountText: {
    color: theme.secondary,
  },
  primaryText: {
    color: theme.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
});
