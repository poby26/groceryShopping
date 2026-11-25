/**
 * @file AddItemModal.tsx
 * @description 장보기 진행 중 현장에서 목록에 없던 품목을 즉시 추가할 때 사용하는 모달입니다.
 * 품목명, 예상 단가, 수량 스테퍼를 입력받아 현재 장보기 목록에 추가하고 모달을 닫습니다.
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
import { parseNumericInput } from '../../utils/format';

/** AddItemModal 컴포넌트 Props */
interface AddItemModalProps {
  /** 모달 표시 여부 */
  visible: boolean;
  /** 모달 닫기(배경 터치, 닫기/취소 버튼, 안드로이드 백버튼) 시 호출되는 콜백 */
  onClose: () => void;
  /** 유효한 품목 입력 후 '추가하기' 클릭 시 부모로 새 품목 데이터를 전달하는 콜백 */
  onAdd: (item: {
    name: string;
    estimatedUnitPrice: number;
    quantity: number;
  }) => void;
}

/**
 * 장보기 진행 화면(`shopping/[id].tsx`)에서 사용하는 '새 품목 입력' 모달
 */
export function AddItemModal({ visible, onClose, onAdd }: AddItemModalProps) {
  // 폼 입력 상태: 품목명, 예상 단가(문자열로 관리 후 제출 시 숫자 파싱), 수량(최소 1)
  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [quantity, setQuantity] = useState(1);

  // 모달이 새로 열릴 때마다 이전 입력 잔여값이 남지 않도록 폼 상태 초기화
  useEffect(() => {
    if (visible) {
      setName('');
      setPriceText('');
      setQuantity(1);
    }
  }, [visible]);

  // 품목명이 공백 제외 1자 이상 입력된 경우에만 추가 버튼 활성화
  const canSubmit = name.trim().length > 0;

  /** 입력값을 정규화해 부모 콜백으로 전달하고 모달을 닫습니다. */
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
      {/* iOS 키보드가 입력 모달을 가리지 않도록 padding 보정 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        {/* 반투명 배경 영역 터치 시 모달 닫기 */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* 모달 본문 시트 */}
        <View style={styles.sheet}>
          {/* 상단 헤더: 보조 라벨, 제목, 우측 닫기 버튼 */}
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

          {/* 입력 폼 영역: 품목명 + (예상 단가 / 수량 스테퍼) */}
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

              {/* 수량 스테퍼 (최소 1개 유지) */}
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

          {/* 하단 액션 버튼 영역 */}
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // --- 입력 필드 및 수량 스테퍼 영역 ---
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
    minWidth: 0,
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
    height: 48,
    borderRadius: radius.default,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    backgroundColor: theme.surfaceContainerLowest,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  stepBtn: {
    width: 36,
    height: 36,
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

  // --- 하단 버튼 영역 ---
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerBtn: {
    flex: 1,
  },
});
