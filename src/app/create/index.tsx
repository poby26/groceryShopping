/**
 * @file create/index.tsx
 * @description '장보기 목록 작성 / 수정' 화면입니다.
 * - 라우트 파라미터 `id` 유무에 따라 신규 작성 모드와 기존 목록 수정 모드로 동작합니다.
 * - 장보기 이름, 품목 추가(품목명·예상 단가·수량 스테퍼), 담을 품목 삭제, 총 예상 금액 실시간 계산을 지원합니다.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { QuantityStepper } from '../../components/ui/QuantityStepper';
import { ScreenLayout } from '../../components/ui/ScreenLayout';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAppFlow } from '../../navigation/useAppFlow';
import { useGroceryStore } from '../../store/useGroceryStore';
import { commonStyles } from '../../theme/commonStyles';
import {
  radius,
  spacing,
  tabularNums,
  theme,
  typography,
} from '../../theme/tokens';
import { ShoppingItem } from '../../types/grocery';
import { showAlert } from '../../utils/alert';
import { getItemEstimatedTotal } from '../../utils/calculations';
import { formatKRW, parseNumericInput } from '../../utils/format';

export default function CreateListScreen() {
  const flow = useAppFlow();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const existingList = useGroceryStore((s) =>
    id ? s.lists.find((l) => l.id === id) : undefined
  );
  const createList = useGroceryStore((s) => s.createList);
  const updateList = useGroceryStore((s) => s.updateList);

  const isEditMode = Boolean(existingList);

  // 편집 중인 목록 제목과 품목 배열 (저장 전까지는 로컬 상태로 관리)
  const [title, setTitle] = useState(existingList?.title ?? '');
  const [items, setItems] = useState<ShoppingItem[]>(existingList?.items ?? []);

  // 상단 품목 추가 폼 상태
  const [itemName, setItemName] = useState('');
  const [itemPriceText, setItemPriceText] = useState('');
  const [itemQty, setItemQty] = useState(1);

  // 담긴 모든 품목의 총 예상 금액 계산
  const totalEstimated = useMemo(
    () => items.reduce((sum, item) => sum + getItemEstimatedTotal(item), 0),
    [items]
  );

  /** 품목 추가 폼의 입력값을 임시 목록에 추가하고 폼을 초기화합니다. */
  const handleAddItem = () => {
    const trimmed = itemName.trim();
    if (!trimmed) return;

    const newItem: ShoppingItem = {
      id: `draft-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      estimatedUnitPrice: parseNumericInput(itemPriceText),
      quantity: itemQty,
      checked: false,
    };

    setItems((prev) => [...prev, newItem]);
    setItemName('');
    setItemPriceText('');
    setItemQty(1);
  };

  /** 담을 품목 리스트에서 특정 품목을 제거합니다. */
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  /**
   * 목록을 스토어에 저장한 뒤, `shouldStartShopping` 여부에 따라
   * 장보기 진행 화면으로 바로 이동하거나 이전 화면으로 돌아갑니다.
   */
  const saveAndNavigate = (shouldStartShopping: boolean) => {
    const trimmedTitle = title.trim() || '새 장보기';
    if (shouldStartShopping && items.length === 0) {
      showAlert(
        '품목을 추가해 주세요',
        '장보기를 시작하려면 최소 1개 이상의 품목이 필요해요.'
      );
      return;
    }

    let targetId: string;
    if (existingList) {
      updateList(existingList.id, {
        title: trimmedTitle,
        items,
        status: shouldStartShopping
          ? 'shopping'
          : items.length > 0
            ? 'ready'
            : 'draft',
      });
      targetId = existingList.id;
    } else {
      targetId = createList({
        title: trimmedTitle,
        items: items.map((i) => ({
          name: i.name,
          estimatedUnitPrice: i.estimatedUnitPrice,
          quantity: i.quantity,
        })),
        status: shouldStartShopping
          ? 'shopping'
          : items.length > 0
            ? 'ready'
            : 'draft',
      });
    }

    if (shouldStartShopping) {
      flow.startShoppingFlow(targetId, { replace: true });
    } else {
      flow.goBack();
    }
  };

  return (
    <ScreenLayout
      edges={['top', 'bottom']}
      keyboardAvoiding
      header={{
        mode: 'task',
        title: isEditMode ? '장보기 목록 수정' : '장보기 목록 작성',
        badgeLabel: isEditMode ? '목록 수정' : '신규 작성',
        badgeTone: 'neutral',
        onBack: flow.goBack,
      }}
      footer={
        <View style={commonStyles.bottomBar}>
          <View style={styles.bottomSummary}>
            <Text style={[typography.labelSm, commonStyles.textMuted]}>
              총 예상 금액
            </Text>
            <Text
              style={[
                typography.headlineMd,
                tabularNums,
                commonStyles.textOnSurface,
              ]}
            >
              {formatKRW(totalEstimated)}
            </Text>
          </View>
          <View style={styles.bottomActions}>
            <Button
              label="저장하기"
              variant="secondary"
              size="sm"
              onPress={() => saveAndNavigate(false)}
            />
            <Button
              label="장보기 시작"
              variant="primary"
              size="sm"
              onPress={() => saveAndNavigate(true)}
            />
          </View>
        </View>
      }
    >
      {/* 장보기 이름 입력 */}
      <Card>
        <InputField
          label="장보기 이름"
          placeholder="예: 주말 마트 장보기"
          hint="마트 이름이나 목적을 적어두면 히스토리에서 찾기 쉬워요"
          value={title}
          onChangeText={setTitle}
        />
      </Card>

      {/* 품목 추가 입력 폼 */}
      <View style={commonStyles.section}>
        <SectionHeader title="품목 추가" />
        <Card style={styles.formCard}>
          <InputField
            label="품목명"
            placeholder="예: 서울우유 1L, 방울토마토"
            value={itemName}
            onChangeText={setItemName}
          />

          <View style={styles.priceQtyRow}>
            <InputField
              label="예상 단가"
              numeric
              suffix="원"
              placeholder="0"
              value={itemPriceText}
              onChangeText={setItemPriceText}
              containerStyle={styles.priceField}
            />
            <QuantityStepper value={itemQty} onChange={setItemQty} />
          </View>

          <Button
            label="목록에 품목 추가"
            icon="add"
            variant="secondary"
            disabled={itemName.trim().length === 0}
            fullWidth
            onPress={handleAddItem}
          />
        </Card>
      </View>

      {/* 추가된 품목 리스트 */}
      <View style={commonStyles.section}>
        <SectionHeader
          title="담을 품목"
          badgeLabel={`총 ${items.length}개`}
          badgeTone="primary"
        />

        {items.length === 0 ? (
          <Card style={commonStyles.emptyCard}>
            <Text style={[typography.bodyMd, commonStyles.textMuted]}>
              아직 추가된 품목이 없어요. 위에서 구매할 품목을 입력해 보세요.
            </Text>
          </Card>
        ) : (
          <Card padded={false}>
            {items.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.itemRow, idx > 0 && commonStyles.rowBorder]}
              >
                <View style={styles.itemLeft}>
                  <Text style={[typography.bodyLg, commonStyles.textOnSurface]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      typography.labelSm,
                      tabularNums,
                      commonStyles.textMuted,
                    ]}
                  >
                    {formatKRW(item.estimatedUnitPrice)} × {item.quantity}개
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <Text
                    style={[
                      typography.titleMd,
                      tabularNums,
                      commonStyles.textOnSurface,
                    ]}
                  >
                    {formatKRW(getItemEstimatedTotal(item))}
                  </Text>
                  <Pressable
                    onPress={() => handleRemoveItem(item.id)}
                    accessibilityLabel={`${item.name} 삭제`}
                    hitSlop={8}
                    style={styles.removeBtn}
                  >
                    <MaterialIcons
                      name="close"
                      size={18}
                      color={theme.outline}
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: spacing.md,
  },
  priceQtyRow: {
    flexDirection: 'row',
    gap: spacing.sm + 4,
    alignItems: 'flex-end',
  },
  priceField: {
    flex: 1,
    minWidth: 0,
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
    gap: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSummary: {
    gap: 2,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
