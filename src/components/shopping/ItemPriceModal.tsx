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

  const handleSaleChange = (text: string) => {
    setSaleText(text);
    const sale = parseNumericInput(text);
    const discount = parseNumericInput(discountText);
    setFinalText(String(Math.max(0, sale - discount)));
  };

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
