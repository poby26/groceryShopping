/**
 * @file shopping/[id].tsx
 * @description '장보기 진행' 화면입니다.
 * - 마트에서 이동하며 구매 품목을 체크하고, 미체크 항목을 탭하면 '구매 금액 확인 모달(`ItemPriceModal`)'을 열어
 *   실제 판매가·할인가·최종 구매가를 확정합니다.
 * - 장보는 중 현장에서 품목을 즉시 추가('새 품목 입력 모달(`AddItemModal`)')할 수 있습니다.
 * - 하단 '결제 정산 기록' 영역은 체크된 품목 합계와 자동 동기화되며, 필요 시 사용자가 최종 결제액/할인액을 수동 보정할 수 있습니다.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AddItemModal } from '../../components/shopping/AddItemModal';
import { ItemPriceModal } from '../../components/shopping/ItemPriceModal';
import { AppHeader } from '../../components/ui/AppHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { useAppFlow } from '../../navigation/useAppFlow';
import { useGroceryStore } from '../../store/useGroceryStore';
import {
  radius,
  spacing,
  tabularNums,
  theme,
  typography,
} from '../../theme/tokens';
import { ShoppingItem } from '../../types/grocery';
import {
  getCheckedItemsSummary,
  getItemDiscount,
  getItemEstimatedTotal,
  getItemFinalPrice,
  getItemSalePrice,
  getListEstimatedTotal,
} from '../../utils/calculations';
import { showConfirm } from '../../utils/alert';
import {
  formatDiscountKRW,
  formatKRW,
  parseNumericInput,
} from '../../utils/format';

/**
 * 장보기 진행 화면 컴포넌트
 */
export default function ActiveShoppingScreen() {
  const flow = useAppFlow();
  // URL 동적 세그먼트에서 장보기 목록 ID 추출
  const { id } = useLocalSearchParams<{ id: string }>();

  // 스토어에서 대상 목록과 품목 추가/체크 확정/체크 해제 액션 구독
  const list = useGroceryStore((s) => s.lists.find((l) => l.id === id));
  const addItemToList = useGroceryStore((s) => s.addItemToList);
  const confirmItemPurchase = useGroceryStore((s) => s.confirmItemPurchase);
  const uncheckItem = useGroceryStore((s) => s.uncheckItem);

  // 모달 제어 상태: priceModalItem이 null이 아니면 구매 금액 확인 모달 표시
  const [priceModalItem, setPriceModalItem] = useState<ShoppingItem | null>(
    null
  );
  const [addModalOpen, setAddModalOpen] = useState(false);

  // 현재까지 체크된 품목 개수 및 합산 금액(최종 구매가 합계, 할인액 합계) 계산
  const summary = useMemo(
    () =>
      list
        ? getCheckedItemsSummary(list)
        : {
          checkedCount: 0,
          totalCount: 0,
          checkedSubtotal: 0,
          checkedDiscountTotal: 0,
        },
    [list]
  );

  // 계획 당시 기준 전체 품목 예상 총액
  const estimatedTotal = useMemo(
    () => (list ? getListEstimatedTotal(list) : 0),
    [list]
  );

  // 결제 정산 입력값 상태
  // manualOverride가 false인 동안에는 품목 체크/가격 수정 시 합계 금액이 자동으로 동기화됩니다.
  const [manualOverride, setManualOverride] = useState(false);
  const [paidText, setPaidText] = useState(String(summary.checkedSubtotal));
  const [discountText, setDiscountText] = useState(
    String(summary.checkedDiscountTotal)
  );

  // 수동 보정 모드가 아닐 때 체크된 품목 합계 변화에 맞춰 정산 입력창 자동 갱신
  useEffect(() => {
    if (!manualOverride) {
      setPaidText(String(summary.checkedSubtotal));
      setDiscountText(String(summary.checkedDiscountTotal));
    }
  }, [summary.checkedSubtotal, summary.checkedDiscountTotal, manualOverride]);

  // 잘못된 ID 접근 또는 삭제된 목록일 경우 복구 안내 화면 표시
  if (!list) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <AppHeader
          mode="task"
          title="장보기 진행"
          onBack={flow.goBack}
        />
        <View style={styles.notFound}>
          <Text style={[typography.bodyLg, styles.mutedText]}>
            장보기 목록을 찾을 수 없어요.
          </Text>
          <Button label="홈으로 돌아가기" onPress={flow.recoverToHome} />
        </View>
      </SafeAreaView>
    );
  }

  // 하단 정산 바 및 완료 확인 다이얼로그에 사용할 숫자 파싱 값
  const finalPaidNum = parseNumericInput(paidText);
  const finalDiscountNum = parseNumericInput(discountText);

  /**
   * 좌측 체크박스 탭 핸들러
   * - 이미 체크된 품목: 확인 모달 없이 즉시 체크 해제
   * - 미체크 품목: 구매 금액 확인 모달을 열어 실구매가/할인가 입력 후 체크 확정
   */
  const handleCheckboxPress = (item: ShoppingItem) => {
    if (item.checked) {
      uncheckItem(list.id, item.id);
    } else {
      setPriceModalItem(item);
    }
  };

  /**
   * '장보기 완료' 버튼 클릭 핸들러
   * 모바일/웹 공용 확인 다이얼로그(`showConfirm`)로 최종 결제·할인 금액을 확인한 뒤 완료 처리합니다.
   */
  const handleConfirmComplete = () => {
    showConfirm(
      '장보기를 완료할까요?',
      `최종 결제금액 ${formatKRW(finalPaidNum)} (할인 ${formatKRW(finalDiscountNum)})으로 히스토리에 저장됩니다.`,
      () => {
        flow.completeShoppingFlow(list.id, {
          actualPaidTotal: finalPaidNum,
          actualDiscountTotal: finalDiscountNum,
        });
      },
      '완료 및 저장'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* 상단 태스크 헤더: 장보기 제목, 담긴 품목 진행률, '장보는 중' 배지 */}
      <AppHeader
        mode="task"
        title={list.title}
        subtitle={`${summary.totalCount}개 중 ${summary.checkedCount}개 담음`}
        badgeLabel="장보는 중"
        badgeTone="secondary"
        onBack={flow.goBack}
      />

      {/* iOS 키보드가 정산 입력 필드를 가리지 않도록 padding 보정 */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 1. 장보는 중 즉석 품목 추가 버튼 */}
          <Button
            label="품목 추가"
            icon="add"
            variant="primary"
            fullWidth
            onPress={() => setAddModalOpen(true)}
          />

          {/* 2. 구매 품목 체크리스트 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.titleLg, styles.sectionTitle]}>
                구매 품목 체크
              </Text>
              <Text
                style={[typography.labelLg, tabularNums, styles.primaryText]}
              >
                담은 금액 {formatKRW(summary.checkedSubtotal)}
              </Text>
            </View>

            <Card padded={false}>
              {list.items.map((item, idx) => {
                const est = getItemEstimatedTotal(item);
                const sale = getItemSalePrice(item);
                const discount = getItemDiscount(item);
                // 체크된 품목은 확정된 최종 구매가를, 미체크 품목은 예상 총액을 표시
                const finalPrice = item.checked ? getItemFinalPrice(item) : est;

                // 품목명 아래 보조 설명 텍스트 (체크 상태 및 할인 여부에 따라 분기)
                const subMeta = item.checked
                  ? discount > 0
                    ? `판매 ${formatKRW(sale)} · 할인 ${formatDiscountKRW(discount)}`
                    : `판매 ${formatKRW(sale)}`
                  : `${item.quantity}개 · 예상 ${formatKRW(est)}`;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.checkRow,
                      idx > 0 && styles.rowBorder,
                      item.checked && styles.checkRowChecked,
                    ]}
                  >
                    {/* 좌측: 체크박스 토글 영역 */}
                    <Pressable
                      onPress={() => handleCheckboxPress(item)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: item.checked }}
                      style={styles.checkboxHit}
                    >
                      <View
                        style={[
                          styles.checkboxBox,
                          item.checked && styles.checkboxBoxChecked,
                        ]}
                      >
                        {item.checked ? (
                          <MaterialIcons
                            name="check"
                            size={16}
                            color={theme.onPrimary}
                          />
                        ) : null}
                      </View>
                    </Pressable>

                    {/* 중앙: 품목명/메타 정보 (탭 시 구매 금액 확인 모달 열림) */}
                    <Pressable
                      onPress={() => setPriceModalItem(item)}
                      style={styles.checkContent}
                    >
                      <Text
                        style={[
                          typography.bodyLg,
                          styles.itemName,
                          item.checked && styles.itemNameChecked,
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          typography.labelSm,
                          tabularNums,
                          discount > 0 && item.checked
                            ? styles.secondaryText
                            : styles.mutedText,
                        ]}
                      >
                        {subMeta}
                      </Text>
                    </Pressable>

                    {/* 우측: 표시 금액 (탭 시 구매 금액 확인 모달 열림) */}
                    <Pressable
                      onPress={() => setPriceModalItem(item)}
                      style={styles.priceHit}
                    >
                      <Text
                        style={[
                          typography.titleMd,
                          tabularNums,
                          item.checked
                            ? styles.primaryText
                            : styles.itemPriceDefault,
                        ]}
                      >
                        {formatKRW(finalPrice)}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </Card>
          </View>

          {/* 3. 결제 정산 기록 섹션 (장바구니 합산 자동 반영 + 필요 시 수동 수정 가능) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.titleLg, styles.sectionTitle]}>
                결제 정산 기록
              </Text>
              <Text style={[typography.labelSm, tabularNums, styles.mutedText]}>
                예상 총액 {formatKRW(estimatedTotal)}
              </Text>
            </View>

            <Card style={styles.settlementCard}>
              <View style={styles.settlementRow}>
                <InputField
                  label="실제 결제금액"
                  leftIcon="payments"
                  numeric
                  suffix="원"
                  value={paidText}
                  onChangeText={(text) => {
                    setManualOverride(true);
                    setPaidText(text);
                  }}
                  containerStyle={styles.flex}
                />
                <InputField
                  label="할인금액"
                  numeric
                  suffix="원"
                  value={discountText}
                  onChangeText={(text) => {
                    setManualOverride(true);
                    setDiscountText(text);
                  }}
                  containerStyle={styles.flex}
                />
              </View>

              {/* 수동 입력으로 합계가 어긋난 경우 자동 합계로 되돌리는 복원 링크 제공 */}
              {manualOverride ? (
                <Pressable
                  onPress={() => setManualOverride(false)}
                  style={styles.resetLink}
                >
                  <Text style={[typography.labelSm, styles.primaryText]}>
                    체크된 품목 합계로 다시 맞추기
                  </Text>
                </Pressable>
              ) : null}
            </Card>
          </View>
        </ScrollView>

        {/* 하단 고정 완료 정산 바 */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomSummary}>
            <View style={styles.bottomMetaRow}>
              <Text style={[typography.labelSm, styles.mutedText]}>
                최종 결제 ·{' '}
              </Text>
              <Text
                style={[typography.labelSm, tabularNums, styles.secondaryText]}
              >
                할인 {formatKRW(finalDiscountNum)}
              </Text>
            </View>
            <Text
              style={[typography.headlineMd, tabularNums, styles.totalText]}
            >
              {formatKRW(finalPaidNum)}
            </Text>
          </View>
          <Button
            label="장보기 완료"
            variant="primary"
            onPress={handleConfirmComplete}
          />
        </View>
      </KeyboardAvoidingView>

      {/* 구매 금액 확인 모달 (체크 및 단가·할인 수정) */}
      <ItemPriceModal
        visible={priceModalItem !== null}
        item={priceModalItem}
        onClose={() => setPriceModalItem(null)}
        onConfirm={(payload) => {
          if (priceModalItem) {
            confirmItemPurchase(list.id, priceModalItem.id, payload);
          }
          setPriceModalItem(null);
        }}
      />

      {/* 장보는 중 새 품목 추가 모달 */}
      <AddItemModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={(item) => addItemToList(list.id, item)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- 화면 레이아웃 및 미존재 안내 ---
  safeArea: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  flex: {
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

  // --- 구매 품목 체크리스트 행 ---
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm + 2,
    minHeight: 60,
  },
  checkRowChecked: {
    backgroundColor: theme.surfaceContainerLow,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
  },
  checkboxHit: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: theme.outline,
    backgroundColor: theme.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkContent: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    color: theme.onSurface,
  },
  itemNameChecked: {
    color: theme.onSurfaceVariant,
    textDecorationLine: 'line-through',
  },
  priceHit: {
    paddingLeft: spacing.xs,
  },
  itemPriceDefault: {
    color: theme.onSurface,
  },

  // --- 텍스트 강조 색상 ---
  primaryText: {
    color: theme.primary,
  },
  secondaryText: {
    color: theme.secondary,
  },
  mutedText: {
    color: theme.onSurfaceVariant,
  },

  // --- 결제 정산 기록 카드 및 하단 고정 바 ---
  settlementCard: {
    gap: spacing.sm,
  },
  settlementRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
  },
  resetLink: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pageMargin,
    paddingVertical: spacing.sm + 4,
    backgroundColor: theme.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
    gap: spacing.md,
  },
  bottomSummary: {
    gap: 2,
  },
  bottomMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    color: theme.onSurface,
  },
});
