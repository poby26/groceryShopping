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
import { parseNumericInput } from '../../utils/format';

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
                장보기 목록에 추가
              </Text>
              <Text style={[typography.headlineMd, styles.title]}>
                새 품목 입력
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

              <View style={styles.qtyWrap}>
                <Text style={[typography.labelSm, styles.qtyLabel]}>수량</Text>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    accessibilityLabel="수량 감소"
                    style={styles.stepBtn}
                  >
                    <MaterialIcons
                      name="remove"
                      size={18}
                      color={theme.onSurface}
                    />
                  </Pressable>
                  <Text
                    style={[typography.titleMd, tabularNums, styles.qtyValue]}
                  >
                    {quantity}
                  </Text>
                  <Pressable
                    onPress={() => setQuantity((q) => q + 1)}
                    accessibilityLabel="수량 증가"
                    style={styles.stepBtn}
                  >
                    <MaterialIcons
                      name="add"
                      size={18}
                      color={theme.onSurface}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              label="취소"
              variant="outline"
              onPress={onClose}
              style={styles.footerBtn}
            />
            <Button
              label="추가하기"
              variant="primary"
              disabled={!canSubmit}
              onPress={handleSubmit}
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    alignItems: 'flex-end',
  },
  priceField: {
    flex: 1,
  },
  qtyWrap: {
    gap: spacing.xs,
  },
  qtyLabel: {
    color: theme.onSurfaceVariant,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.default,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    backgroundColor: theme.surfaceContainerLowest,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: theme.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    minWidth: 26,
    textAlign: 'center',
    color: theme.onSurface,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerBtn: {
    flex: 1,
  },
});
