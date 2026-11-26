/**
 * @file AddItemModal.tsx
 * @description 장보기 진행 중 현장에서 목록에 없던 품목을 즉시 추가할 때 사용하는 모달입니다.
 * 품목명, 예상 단가, 수량 스테퍼를 입력받아 현재 장보기 목록에 추가합니다.
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';
import { spacing } from '../../theme/tokens';
import { parseNumericInput } from '../../utils/format';
import { Button } from '../ui/Button';
import { InputField } from '../ui/InputField';
import { ModalSheet } from '../ui/ModalSheet';
import { QuantityStepper } from '../ui/QuantityStepper';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    estimatedUnitPrice: number;
    quantity: number;
  }) => void;
}

export function AddItemModal({ visible, onClose, onAdd }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [quantity, setQuantity] = useState(1);

  // 모달이 새로 열릴 때마다 입력 폼 초기화
  useEffect(() => {
    if (visible) {
      setName('');
      setPriceText('');
      setQuantity(1);
    }
  }, [visible]);

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      name: name.trim(),
      estimatedUnitPrice: parseNumericInput(priceText),
      quantity,
    });
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      eyebrow="장보기 목록에 추가"
      title="새 품목 입력"
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
            label="추가하기"
            variant="primary"
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={commonStyles.flex1}
          />
        </>
      }
    >
      <InputField
        label="품목명"
        placeholder="예: 바나나 1송이"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.row}>
        <InputField
          label="예상 단가"
          numeric
          suffix="원"
          placeholder="0"
          value={priceText}
          onChangeText={setPriceText}
          containerStyle={styles.priceField}
        />
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    alignItems: 'flex-end',
  },
  priceField: {
    flex: 1,
    minWidth: 0,
  },
});
