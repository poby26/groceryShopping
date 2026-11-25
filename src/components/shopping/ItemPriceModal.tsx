/**
 * @file ItemPriceModal.tsx
 * @description 장보기 진행 화면에서 품목을 체크하거나 가격을 탭할 때 열리는 '구매 금액 확인' 모달입니다.
 * 실제 판매금액과 할인금액을 수정하면 최종 구매금액이 자동으로 재계산되며, 최종 금액을 직접 덮어쓸 수도 있습니다.
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

interface ItemPriceModalProps {
  visible: boolean;
  /** 금액을 확인/수정할 대상 품목 (null이면 모달 비활성) */
  item: ShoppingItem | null;
  onClose: () => void;
  onConfirm: (payload: {
    actualSalePrice: number;
    discountAmount: number;
    finalPurchasePrice: number;
  }) => void;
}

export function ItemPriceModal({
  visible,
  item,
  onClose,
  onConfirm,
}: ItemPriceModalProps) {
  const [saleText, setSaleText] = useState('');
  const [discountText, setDiscountText] = useState('');
  const [finalText, setFinalText] = useState('');

  // 모달이 열릴 때마다 해당 품목의 기존 실구매가 또는 예상 금액으로 입력값 초기화
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

  // 실제 판매금액 변경 시: 판매금액 - 할인금액으로 최종 구매금액 자동 갱신
  const handleSaleChange = (text: string) => {
    setSaleText(text);
    const sale = parseNumericInput(text);
    const discount = parseNumericInput(discountText);
    setFinalText(String(Math.max(0, sale - discount)));
  };

  // 할인금액 변경 시: 판매금액 - 할인금액으로 최종 구매금액 자동 갱신
  const handleDiscountChange = (text: string) => {
    setDiscountText(text);
    const sale = parseNumericInput(saleText);
    const discount = parseNumericInput(text);
    setFinalText(String(Math.max(0, sale - discount)));
  };

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

  if (!item) return null;

  const estimatedTotal = getItemEstimatedTotal(item);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
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
