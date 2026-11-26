/**
 * @file tabs/history.tsx
 * @description '장보기 이력' 화면입니다.
 * 전체 / 주간 / 월간 / 연간 필터 탭에 따라 완료된 장보기 요약과 목록(연간 탭은 월별 집계)을 보여줍니다.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppFlow } from '../../navigation/useAppFlow';
import { useGroceryStore } from '../../store/useGroceryStore';
import { commonStyles } from '../../theme/commonStyles';
import { radius, spacing, tabularNums, theme, typography } from '../../theme/tokens';
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

  const filteredCompleted = useMemo(
    () => filterCompletedListsByPeriod(lists, filter, now),
    [lists, filter, now]
  );

  const monthlyGroups = useMemo(
    () => groupCompletedListsByMonth(lists, now.getFullYear()),
    [lists, now]
  );

  /** 완료된 장보기 1건 카드 (탭 시 영수증 상세 화면으로 이동) */
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
          <Text
            style={[typography.titleMd, commonStyles.textOnSurface]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[typography.bodyMd, tabularNums, commonStyles.textMuted]}>
            {formatDotDate(dateIso)} · {item.items.length}개 품목
          </Text>
        </View>
        <View style={styles.historyRight}>
          <View style={styles.amountCol}>
            <Text
              style={[
                typography.titleMd,
                tabularNums,
                commonStyles.textOnSurface,
              ]}
            >
              {formatKRW(paid)}
            </Text>
            {discount > 0 ? (
              <Text
                style={[
                  typography.labelSm,
                  tabularNums,
                  commonStyles.textSecondary,
                ]}
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

  // 주간/월간/연간 탭에서 공용으로 사용하는 3열 KPI 요약 카드 렌더링
  const activeStats =
    filter === 'weekly'
      ? weeklySummary
      : filter === 'monthly'
        ? monthlySummary
        : yearlySummary;

  const kpiLabel =
    filter === 'weekly'
      ? '이번 주 지출'
      : filter === 'monthly'
        ? `${now.getMonth() + 1}월 지출`
        : `${now.getFullYear()}년 지출`;

  return (
    <ScreenLayout
      header={{
        mode: 'brand',
        title: '장보기 이력',
        dateLabel: formatKoreanDateShort(now),
      }}
    >
      <SegmentedTabs
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
      />

      {filter === 'all' ? (
        <>
          <Card style={styles.summaryCard}>
            <SectionHeader title="기간별 장보기 요약" rightText="횟수 · 결제금액" />
            <View>
              {[
                { label: '주간', stats: weeklySummary },
                { label: '월간', stats: monthlySummary },
                { label: '연간', stats: yearlySummary },
              ].map((row, idx) => (
                <View
                  key={row.label}
                  style={[styles.periodRow, idx > 0 && commonStyles.rowBorder]}
                >
                  <View style={styles.periodRowLeft}>
                    <Text style={[typography.labelLg, commonStyles.textOnSurface]}>
                      {row.label}
                    </Text>
                    <StatusBadge
                      label={`${row.stats.tripCount}회`}
                      tone="primary"
                      compact
                    />
                  </View>
                  <Text
                    style={[
                      typography.titleMd,
                      tabularNums,
                      commonStyles.textOnSurface,
                    ]}
                  >
                    {formatKRW(row.stats.totalSpent)}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          <View style={commonStyles.section}>
            <SectionHeader
              title="전체 장보기 목록"
              rightText={`${filteredCompleted.length}건`}
            />
            {filteredCompleted.length === 0 ? (
              <Card style={commonStyles.emptyCard}>
                <Text style={[typography.bodyMd, commonStyles.textMuted]}>
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
      ) : (
        <>
          <Card style={styles.kpiRowCard}>
            <View style={styles.kpiItem}>
              <Text style={[typography.labelSm, commonStyles.textMuted]}>
                {kpiLabel}
              </Text>
              <Text
                style={[
                  typography.titleMd,
                  tabularNums,
                  commonStyles.textOnSurface,
                ]}
              >
                {formatKRW(activeStats.totalSpent)}
              </Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={[typography.labelSm, commonStyles.textMuted]}>
                총 할인
              </Text>
              <Text
                style={[
                  typography.titleMd,
                  tabularNums,
                  commonStyles.textSecondary,
                ]}
              >
                {formatKRW(activeStats.totalDiscount)}
              </Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={[typography.labelSm, commonStyles.textMuted]}>
                완료 횟수
              </Text>
              <Text
                style={[
                  typography.titleMd,
                  tabularNums,
                  commonStyles.textPrimary,
                ]}
              >
                {activeStats.tripCount}회
              </Text>
            </View>
          </Card>

          <View style={commonStyles.section}>
            <SectionHeader
              title={
                filter === 'weekly'
                  ? '주간 장보기 목록'
                  : filter === 'monthly'
                    ? '월간 장보기 목록'
                    : '연간 장보기 목록'
              }
              rightText={
                filter === 'yearly'
                  ? `${now.getFullYear()}년`
                  : `${filteredCompleted.length}건`
              }
            />

            {filter === 'yearly' ? (
              monthlyGroups.length === 0 ? (
                <Card style={commonStyles.emptyCard}>
                  <Text style={[typography.bodyMd, commonStyles.textMuted]}>
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
                        <Text
                          style={[typography.titleMd, commonStyles.textOnSurface]}
                        >
                          {group.label}
                        </Text>
                        <Text
                          style={[
                            typography.bodyMd,
                            tabularNums,
                            commonStyles.textMuted,
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
                              commonStyles.textOnSurface,
                            ]}
                          >
                            {formatKRW(group.totalSpent)}
                          </Text>
                          {group.totalDiscount > 0 ? (
                            <Text
                              style={[
                                typography.labelSm,
                                tabularNums,
                                commonStyles.textSecondary,
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
              )
            ) : filteredCompleted.length === 0 ? (
              <Card style={commonStyles.emptyCard}>
                <Text style={[typography.bodyMd, commonStyles.textMuted]}>
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
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: spacing.md,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
  },
  periodRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
});
