/**
 * @file history/[id].tsx
 * @description '장보기 상세' 영수증 화면입니다.
 * 완료된 장보기의 예상 금액·할인 금액·최종 결제금액 요약과 구매 완료/미구매 품목 내역을 표시합니다.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppHeader } from '../../components/ui/AppHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppFlow } from '../../navigation/useAppFlow';
import { useGroceryStore } from '../../store/useGroceryStore';
import { commonStyles } from '../../theme/commonStyles';
import { spacing, tabularNums, theme, typography } from '../../theme/tokens';
import {
  getItemEstimatedTotal,
  getItemFinalPrice,
  getListEstimatedTotal,
  getListFinalDiscount,
  getListFinalPaid,
} from '../../utils/calculations';
import {
  formatDiscountKRW,
  formatDotDateTime,
  formatKRW,
} from '../../utils/format';

export default function HistoryDetailScreen() {
  const flow = useAppFlow();
  const { id } = useLocalSearchParams<{ id: string }>();

  const list = useGroceryStore((s) => s.lists.find((l) => l.id === id));

  if (!list) {
    return (
      <SafeAreaView style={commonStyles.screen} edges={['top', 'bottom']}>
        <AppHeader mode="task" title="장보기 상세" onBack={flow.goBack} />
        <View style={commonStyles.centeredEmpty}>
          <Text style={[typography.bodyLg, commonStyles.textMuted]}>
            장보기 기록을 찾을 수 없어요.
          </Text>
          <Button
            label="히스토리로 돌아가기"
            onPress={flow.recoverToHistory}
          />
        </View>
      </SafeAreaView>
    );
  }

  const estimatedTotal = getListEstimatedTotal(list);
  const finalPaid = getListFinalPaid(list);
  const finalDiscount = getListFinalDiscount(list);
  const purchasedCount = list.items.filter((i) => i.checked).length;

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      header={{
        mode: 'task',
        title: '장보기 상세',
        badgeLabel: '완료',
        badgeTone: 'primary',
        onBack: flow.goBack,
      }}
    >
      {/* 영수증 요약 카드 */}
      <Card style={styles.receiptCard}>
        <View style={styles.receiptHeader}>
          <View style={styles.receiptTitleWrap}>
            <Text style={[typography.headlineMd, commonStyles.textOnSurface]}>
              {list.title}
            </Text>
            <Text style={[typography.bodyMd, tabularNums, commonStyles.textMuted]}>
              {formatDotDateTime(list.completedAt ?? list.updatedAt)}
            </Text>
          </View>
          <StatusBadge label={`${list.items.length}개 품목`} tone="primary" />
        </View>

        <View style={[styles.summaryRows, commonStyles.rowBorder]}>
          <View style={styles.summaryRow}>
            <Text style={[typography.bodyMd, commonStyles.textMuted]}>
              예상 금액
            </Text>
            <Text
              style={[
                typography.bodyLg,
                tabularNums,
                commonStyles.textOnSurface,
              ]}
            >
              {formatKRW(estimatedTotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[typography.bodyMd, commonStyles.textMuted]}>
              할인 금액
            </Text>
            <Text
              style={[
                typography.bodyLg,
                tabularNums,
                commonStyles.textSecondary,
              ]}
            >
              {formatDiscountKRW(finalDiscount)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.finalRow, commonStyles.rowBorder]}>
            <Text style={[typography.titleMd, commonStyles.textOnSurface]}>
              최종 결제금액
            </Text>
            <Text
              style={[
                typography.headlineMd,
                tabularNums,
                commonStyles.textPrimary,
              ]}
            >
              {formatKRW(finalPaid)}
            </Text>
          </View>
        </View>
      </Card>

      {/* 구매 품목 및 미구매 품목 상세 내역 */}
      <View style={commonStyles.section}>
        <SectionHeader
          title="구매 품목 내역"
          rightText={`${list.items.length}개 중 ${purchasedCount}개 구매`}
        />

        <Card padded={false}>
          {list.items.map((item, idx) => {
            const displayPrice = item.checked
              ? getItemFinalPrice(item)
              : getItemEstimatedTotal(item);

            return (
              <View
                key={item.id}
                style={[styles.itemRow, idx > 0 && commonStyles.rowBorder]}
              >
                <View style={styles.itemLeft}>
                  <MaterialIcons
                    name={
                      item.checked ? 'check-circle' : 'radio-button-unchecked'
                    }
                    size={20}
                    color={item.checked ? theme.primary : theme.outline}
                  />
                  <View style={styles.itemTextWrap}>
                    <Text
                      style={[
                        typography.bodyLg,
                        item.checked
                          ? commonStyles.textOnSurface
                          : styles.unpurchasedText,
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        typography.labelSm,
                        tabularNums,
                        commonStyles.textMuted,
                      ]}
                    >
                      {item.checked
                        ? `${formatKRW(item.estimatedUnitPrice)} × ${item.quantity}개`
                        : '미구매'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    typography.titleMd,
                    tabularNums,
                    item.checked
                      ? commonStyles.textOnSurface
                      : styles.unpurchasedPrice,
                  ]}
                >
                  {formatKRW(displayPrice)}
                </Text>
              </View>
            );
          })}
        </Card>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  receiptCard: {
    gap: spacing.md,
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  receiptTitleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryRows: {
    paddingTop: spacing.sm + 4,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  finalRow: {
    paddingTop: spacing.sm + 2,
    marginTop: spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  itemTextWrap: {
    flex: 1,
    gap: 2,
  },
  unpurchasedText: {
    color: theme.outline,
    textDecorationLine: 'line-through',
  },
  unpurchasedPrice: {
    color: theme.outline,
  },
});
