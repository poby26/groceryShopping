/**
 * @file ItemPriceModal.tsx
 * @description 장보기 진행 화면에서 품목을 체크하거나 가격을 탭할 때 열리는 '구매 금액 확인' 모달입니다.
 * 실제 판매금액과 할인금액을 수정하면 최종 구매금액(`판매금액 - 할인금액`)이 자동으로 재계산되며,
 * 필요 시 최종 구매금액 입력칸을 직접 수정해 덮어쓸 수도 있습니다.
 */
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { InputField } from '../ui/InputField';
import {
  radius,
  spacing,
  tabularNums,
  theme,
  typography,
} from '../../theme/tokens';
import { ShoppingItem } from '../../types/grocery';
import {
  getItemDiscount,
  getItemEstimatedTotal,
  getItemFinalPrice,
  getItemSalePrice,
} from '../../utils/calculations';
import { formatKRW, parseNumericInput } from '../../utils/format';

/** ItemPriceModal 컴포넌트 Props */
interface ItemPriceModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 금액을 확인·수정할 대상 품목 (`null`이면 모달을 렌더링하지 않음) */
  item: ShoppingItem | null;
  /** 모달 닫기(배경 터치, 닫기/취소 버튼, 안드로이드 백버튼) 콜백 */
  onClose: () => void;
  /** '확인' 버튼 클릭 시 확정된 실제 판매가·할인가·최종 구매가를 부모에 전달하는 콜백 */
  onConfirm: (payload: {
    actualSalePrice: number;
    discountAmount: number;
    finalPurchasePrice: number;
  }) => void;
}

/**
 * 품목 체크 및 실구매가/할인가 정산을 위한 모달 컴포넌트
 */
export function ItemPriceModal({
  visible,
  item,
  onClose,
  onConfirm,
}: ItemPriceModalProps) {
  // 문자열 상태로 입력값을 관리 (빈 문자열·콤마 입력 중 UX 유지, 계산 시 parseNumericInput으로 정규화)
  const [saleText, setSaleText] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [finalText, setFinalText] = useState('');

  // 모달이 열리거나 대상 품목이 바뀔 때마다 기존 확정 금액(없으면 예상 금액 기준)으로 입력 필드 초기화
  useEffect(() => {
    if (visible && item) {
      const sale = getItemSalePrice(item);
      const discount = getItemDiscount(item);
      const finalPrice = getItemFinalPrice(item);
      setSaleText(String(sale));
      setDiscountText(String(discount));
      setFinalText(String(finalPrice));
    }
  }, [visible, item]);

  /**
   * 실제 판매금액 입력 변경 핸들러
   * 판매금액이 변경되면 현재 할인금액을 차감한 값(최소 0원)으로 최종 구매금액을 자동 갱신합니다.
   */
  const handleSaleChange = (text: string) => {
    setSaleText(text);
    const sale = parseNumericInput(text);
    const discount = parseNumericInput(discountText);
    setFinalText(String(Math.max(0, sale - discount)));
  };

  /**
   * 할인금액 입력 변경 핸들러
   * 할인금액이 변경되면 현재 판매금액에서 차감한 값(최소 0원)으로 최종 구매금액을 자동 갱신합니다.
   */
  const handleDiscountChange = (text: string) => {
    setDiscountText(text);
    const sale = parseNumericInput(saleText);
    const discount = parseNumericInput(text);
    setFinalText(String(Math.max(0, sale - discount)));
  };

  /**
   * '확인' 버튼 클릭 핸들러
   * 3개 필드의 문자열을 숫자로 파싱하여 부모(`shopping/[id].tsx`)의 체크/정산 액션으로 전달합니다.
   */
  const handleConfirm = () => {
    const actualSalePrice = parseNumericInput(saleText);
    const discountAmount = parseNumericInput(discountText);
    const finalPurchasePrice = parseNumericInput(finalText);
    onConfirm({
      actualSalePrice,
      discountAmount,
      finalPurchasePrice,
    });
  };

  // 대상 품목이 지정되지 않은 경우 모달 트리를 렌더링하지 않음
  if (!item) return null;

  const estimatedTotal = getItemEstimatedTotal(item);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* iOS 키보드가 입력창을 가리지 않도록 padding 보정 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        {/* 반투명 배경 터치 시 모달 닫기 */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* 모달 본문 시트 */}
        <View style={styles.sheet}>
          {/* 상단 헤더: 품목명, 수량·예상 총액 요약, 닫기 버튼 */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[typography.labelSm, styles.eyebrow]}>
                구매 금액 확인
              </Text>
              <Text style={[typography.headlineMd, styles.title]}>
                {item.name}
              </Text>
              <Text style={[typography.bodyMd, tabularNums, styles.meta]}>
                {item.quantity}개 · 예상 {formatKRW(estimatedTotal)}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityLabel="팝업 닫기"
              style={styles.closeBtn}
            >
              <MaterialIcons name="close" size={20} color={theme.onSurface} />
            </Pressable>
          </View>

          {/* 금액 입력 영역: 실제 판매금액, 할인금액, 최종 구매금액(직접 수정 가능) */}
          <View style={styles.fields}>
            <InputField
              label="실제 판매금액"
              numeric
              suffix="원"
              value={saleText}
              onChangeText={handleSaleChange}
              placeholder="0"
            />
            <InputField
              label="할인금액"
              numeric
              suffix="원"
              value={discountText}
              onChangeText={handleDiscountChange}
              placeholder="0"
            />
            <InputField
              label="구매금액 (최종)"
              numeric
              suffix="원"
              value={finalText}
              onChangeText={setFinalText}
              placeholder="0"
            />
          </View>

          {/* 하단 액션 버튼 영역 */}
          <View style={styles.footer}>
            <Button
              label="취소"
              variant="outline"
              onPress={onClose}
              style={styles.footerBtn}
            />
            <Button
              label="확인"
              variant="primary"
              onPress={handleConfirm}
              style={styles.footerBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // --- 모달 배경 및 시트 컨테이너 ---
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 29, 25, 0.45)',
    justifyContent: 'center',
    padding: spacing.pageMargin,
  },
  sheet: {
    backgroundColor: theme.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    padding: spacing.lg,
    gap: spacing.lg,
  },

  // --- 상단 헤더 영역 ---
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: theme.primary,
  },
  title: {
    color: theme.onSurface,
  },
  meta: {
    color: theme.onSurfaceVariant,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- 입력 필드 및 하단 버튼 영역 ---
  fields: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerBtn: {
    flex: 1,
  },
});
