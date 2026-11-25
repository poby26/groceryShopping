/**
 * @file history/[id].tsx
 * @description '장보기 상세' 영수증 화면입니다.
 * 완료된 장보기 1건의 예상 금액·할인 금액·최종 결제금액 요약 카드와
 * 구매 완료 품목 / 미구매 품목의 상세 내역을 영수증 형태로 표시합니다.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppHeader } from '../../components/ui/AppHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAppFlow } from '../../navigation/useAppFlow';
import { useGroceryStore } from '../../store/useGroceryStore';
import {
  radius,
  spacing,
  tabularNums,
  theme,
  typography,
} from '../../theme/tokens';
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

/**
 * 장보기 상세 영수증 화면 컴포넌트
 */
export default function HistoryDetailScreen() {
  const flow = useAppFlow();
  // URL 동적 세그먼트에서 이력 목록 ID 추출
  const { id } = useLocalSearchParams<{ id: string }>();

  const list = useGroceryStore((s) => s.lists.find((l) => l.id === id));

  // 존재하지 않거나 삭제된 기록 ID로 진입한 경우 히스토리 복구 화면 표시
  if (!list) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader
          mode="task"
          title="장보기 상세"
          onBack={flow.goBack}
        />
        <View style={styles.notFound}>
          <Text style={[typography.bodyLg, styles.mutedText]}>
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

  // 영수증 요약 수치 및 실제 구매 완료 품목 수 계산
  const estimatedTotal = getListEstimatedTotal(list);
  const finalPaid = getListFinalPaid(list);
  const finalDiscount = getListFinalDiscount(list);
  const purchasedCount = list.items.filter((i) => i.checked).length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* 상단 태스크 헤더 */}
      <AppHeader
        mode="task"
        title="장보기 상세"
        badgeLabel="완료"
        badgeTone="primary"
        onBack={flow.goBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. 영수증 요약 카드 (장보기명, 완료 일시, 예상/할인/최종 결제금액) */}
        <Card style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <View style={styles.receiptTitleWrap}>
              <Text style={[typography.headlineMd, styles.titleText]}>
                {list.title}
              </Text>
              <Text style={[typography.bodyMd, tabularNums, styles.mutedText]}>
                {formatDotDateTime(list.completedAt ?? list.updatedAt)}
              </Text>
            </View>
            <View style={styles.countPill}>
              <Text style={[typography.labelSm, tabularNums, styles.primaryText]}>
                {list.items.length}개 품목
              </Text>
            </View>
          </View>

          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <Text style={[typography.bodyMd, styles.mutedText]}>
                예상 금액
              </Text>
              <Text style={[typography.bodyLg, tabularNums, styles.titleText]}>
                {formatKRW(estimatedTotal)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[typography.bodyMd, styles.mutedText]}>
                할인 금액
              </Text>
              <Text
                style={[typography.bodyLg, tabularNums, styles.secondaryText]}
              >
                {formatDiscountKRW(finalDiscount)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.finalRow]}>
              <Text style={[typography.titleMd, styles.titleText]}>
                최종 결제금액
              </Text>
              <Text
                style={[
                  typography.headlineMd,
                  tabularNums,
                  styles.primaryText,
                ]}
              >
                {formatKRW(finalPaid)}
              </Text>
            </View>
          </View>
        </Card>

        {/* 2. 구매 품목 및 미구매 품목 상세 내역 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.titleLg, styles.titleText]}>
              구매 품목 내역
            </Text>
            <Text style={[typography.labelSm, tabularNums, styles.mutedText]}>
              {list.items.length}개 중 {purchasedCount}개 구매
            </Text>
          </View>

          <Card padded={false}>
            {list.items.map((item, idx) => {
              // 구매한 품목은 실제 확정 금액, 미구매 품목은 당시 예상 금액 표시
              const displayPrice = item.checked
                ? getItemFinalPrice(item)
                : getItemEstimatedTotal(item);

              return (
                <View
                  key={item.id}
                  style={[styles.itemRow, idx > 0 && styles.itemRowBorder]}
                >
                  <View style={styles.itemLeft}>
                    <MaterialIcons
                      name={
                        item.checked
                          ? 'check-circle'
                          : 'radio-button-unchecked'
                      }
                      size={20}
                      color={item.checked ? theme.primary : theme.outline}
                    />
                    <View style={styles.itemTextWrap}>
                      <Text
                        style={[
                          typography.bodyLg,
                          item.checked ? styles.titleText : styles.unpurchasedText,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          typography.labelSm,
                          tabularNums,
                          styles.mutedText,
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
                      item.checked ? styles.titleText : styles.unpurchasedPrice,
                    ]}
                  >
                    {formatKRW(displayPrice)}
                  </Text>
                </View>
              );
            })}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- 화면 레이아웃 및 미존재 안내 ---
  safeArea: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  scroll: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  content: {
    paddingHorizontal: spacing.pageMargin,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },

  // --- 영수증 요약 카드 ---
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
  countPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
  },
  summaryRows: {
    paddingTop: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
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
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
  },

  // --- 품목별 상세 내역 행 ---
  section: {
    gap: spacing.sm + 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
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

  // --- 텍스트 색상 및 미구매 취소선 ---
  titleText: {
    color: theme.onSurface,
  },
  mutedText: {
    color: theme.onSurfaceVariant,
  },
  primaryText: {
    color: theme.primary,
  },
  secondaryText: {
    color: theme.secondary,
  },
  unpurchasedText: {
    color: theme.outline,
    textDecorationLine: 'line-through',
  },
  unpurchasedPrice: {
    color: theme.outline,
  },
});
