/**
 * @file ItemPriceModal.tsx
 * @description 장보기 진행 화면에서 품목을 체크하거나 가격을 탭할 때 열리는 '구매 금액 확인' 모달입니다.
 * 실제 판매금액과 할인금액을 수정하면 최종 구매금액이 자동으로 재계산되며, 최종 금액을 직접 덮어쓸 수도 있습니다.
 */
import React, { useEffect, useState } from 'react';
import { commonStyles } from '../../theme/commonStyles';
import { ShoppingItem } from '../../types/grocery';
import {
  getItemDiscount,
  getItemEstimatedTotal,
  getItemFinalPrice,
  getItemSalePrice,
} from '../../utils/calculations';
import { formatKRW, parseNumericInput } from '../../utils/format';
import { Button } from '../ui/Button';
import { InputField } from '../ui/InputField';
import { ModalSheet } from '../ui/ModalSheet';

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
      setSaleText(String(getItemSalePrice(item)));
      setDiscountText(String(getItemDiscount(item)));
      setFinalText(String(getItemFinalPrice(item)));
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
    onConfirm({
      actualSalePrice: parseNumericInput(saleText),
      discountAmount: parseNumericInput(discountText),
      finalPurchasePrice: parseNumericInput(finalText),
    });
  };

  if (!item) return null;

  return (
    <ModalSheet
      visible={visible}
      eyebrow="구매 금액 확인"
      title={item.name}
      subtitle={`${item.quantity}개 · 예상 ${formatKRW(getItemEstimatedTotal(item))}`}
      onClose={onClose}
      footer={
        <>
          <Button
            label="취소"
            variant="outline"
            onPress={onClose}
            style={commonStyles.flex1}
          />
          <Button
            label="확인"
            variant="primary"
            onPress={handleConfirm}
            style={commonStyles.flex1}
          />
        </>
      }
    >
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
    </ModalSheet>
  );
}
