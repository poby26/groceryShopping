/**
 * @file create-list.tsx
 * @description '장보기 목록 작성 / 수정' 화면입니다.
 * - 라우트 파라미터 `id` 존재 여부에 따라 신규 작성 모드와 기존 목록 수정 모드로 분기됩니다.
 * - 장보기 이름, 상단 품목 추가 폼(품목명·예상 단가·수량 스테퍼), 담을 품목 삭제, 하단 총 예상 금액 실시간 계산을 지원합니다.
 * - 저장 전까지 변경 사항을 로컬 상태로 보관하며, '저장하기' 또는 '장보기 시작' 시 Zustand 스토어에 반영합니다.
 */
import React, { useMemo, useState } from 'react';
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
import { AppHeader } from '../components/ui/AppHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import { useAppFlow } from '../navigation/useAppFlow';
import { useGroceryStore } from '../store/useGroceryStore';
import {
  radius,
  spacing,
  tabularNums,
  theme,
  typography,
} from '../theme/tokens';
import { ShoppingItem } from '../types/grocery';
import { getItemEstimatedTotal } from '../utils/calculations';
import { showAlert } from '../utils/alert';
import { formatKRW, parseNumericInput } from '../utils/format';

/**
 * 장보기 목록 작성 및 수정 화면 컴포넌트
 */
export default function CreateListScreen() {
  const flow = useAppFlow();
  // 수정 모드 진입 시 전달되는 목록 ID (신규 작성 시 undefined)
  const { id } = useLocalSearchParams<{ id?: string }>();

  // 스토어에서 기존 목록 조회 및 생성/수정 액션 구독
  const existingList = useGroceryStore((s) =>
    id ? s.lists.find((l) => l.id === id) : undefined
  );
  const createList = useGroceryStore((s) => s.createList);
  const updateList = useGroceryStore((s) => s.updateList);

  const isEditMode = Boolean(existingList);

  // 편집 중인 목록 제목과 품목 배열 (저장 버튼 누르기 전까지는 로컬 상태로만 관리)
  const [title, setTitle] = useState(existingList?.title ?? '');
  const [items, setItems] = useState<ShoppingItem[]>(existingList?.items ?? []);

  // 상단 '품목 추가' 폼 상태
  const [itemName, setItemName] = useState('');
  const [itemPriceText, setItemPriceText] = useState('');
  const [itemQty, setItemQty] = useState(1);

  // 담긴 모든 품목의 예상 금액 합계 (단가 × 수량의 누적)
  const totalEstimated = useMemo(
    () => items.reduce((sum, item) => sum + getItemEstimatedTotal(item), 0),
    [items]
  );

  /**
   * 상단 폼에 입력된 품목을 임시 목록(`items`)에 추가하고 입력 필드를 초기화합니다.
   * 품목명이 비어 있으면 동작하지 않습니다.
   */
  const handleAddItem = () => {
    const trimmed = itemName.trim();
    if (!trimmed) return;

    const newItem: ShoppingItem = {
      // 저장 전 임시 식별자 생성 (스토어 저장 시에도 고유 ID로 유지 가능)
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
   * 현재 편집 중인 목록을 스토어에 저장(생성 또는 수정)한 뒤 후속 화면으로 이동합니다.
   * - `shouldStartShopping === true`: 품목이 최소 1개 이상 있는지 검증 후 'shopping' 상태로 저장하고 장보기 진행 화면으로 전환(replace)합니다.
   * - `shouldStartShopping === false`: 품목 존재 여부에 따라 'ready' 또는 'draft' 상태로 저장하고 이전 화면으로 복귀합니다.
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
      // 목록 작성 화면이 히스토리 스택에 남지 않도록 replace 옵션으로 장보기 진행 화면 진입
      flow.startShoppingFlow(targetId, { replace: true });
    } else {
      flow.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* 상단 태스크 헤더: 모드(수정/신규)에 따라 제목과 배지 표시 */}
      <AppHeader
        mode="task"
        title={isEditMode ? '장보기 목록 수정' : '장보기 목록 작성'}
        badgeLabel={isEditMode ? '목록 수정' : '신규 작성'}
        badgeTone="neutral"
        onBack={flow.goBack}
      />

      {/* iOS에서 키보드가 하단 고정 바 및 입력 필드를 가리지 않도록 padding 보정 */}
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
          {/* 1. 장보기 이름 입력 카드 */}
          <Card>
            <InputField
              label="장보기 이름"
              placeholder="예: 주말 마트 장보기"
              hint="마트 이름이나 목적을 적어두면 히스토리에서 찾기 쉬워요"
              value={title}
              onChangeText={setTitle}
            />
          </Card>

          {/* 2. 품목 추가 입력 폼 섹션 */}
          <View style={styles.section}>
            <Text style={[typography.titleLg, styles.sectionTitle]}>
              품목 추가
            </Text>
            <Card style={styles.formCard}>
              <InputField
                label="품목명"
                placeholder="예: 서울우유 1L, 방울토마토"
                value={itemName}
                onChangeText={setItemName}
              />

              {/* 예상 단가 입력 + 수량 스테퍼 가로 배치 */}
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

                <View style={styles.qtyWrap}>
                  <Text style={[typography.labelSm, styles.qtyLabel]}>
                    수량
                  </Text>
                  <View style={styles.stepper}>
                    <Pressable
                      onPress={() => setItemQty((q) => Math.max(1, q - 1))}
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
                      {itemQty}
                    </Text>
                    <Pressable
                      onPress={() => setItemQty((q) => q + 1)}
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

          {/* 3. 추가된 품목 리스트 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.titleLg, styles.sectionTitle]}>
                담을 품목
              </Text>
              <View style={styles.countBadge}>
                <Text
                  style={[typography.labelSm, tabularNums, styles.countText]}
                >
                  총 {items.length}개
                </Text>
              </View>
            </View>

            {items.length === 0 ? (
              /* 품목이 없을 때의 안내 카드 */
              <Card style={styles.emptyCard}>
                <Text style={[typography.bodyMd, styles.mutedText]}>
                  아직 추가된 품목이 없어요. 위에서 구매할 품목을 입력해 보세요.
                </Text>
              </Card>
            ) : (
              /* 구분선으로 연결된 품목 목록 카드 (padded=false) */
              <Card padded={false}>
                {items.map((item, idx) => {
                  const subtotal = getItemEstimatedTotal(item);
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.itemRow,
                        idx > 0 && styles.itemRowBorder,
                      ]}
                    >
                      <View style={styles.itemLeft}>
                        <Text style={[typography.bodyLg, styles.itemName]}>
                          {item.name}
                        </Text>
                        <Text
                          style={[
                            typography.labelSm,
                            tabularNums,
                            styles.mutedText,
                          ]}
                        >
                          {formatKRW(item.estimatedUnitPrice)} × {item.quantity}
                          개
                        </Text>
                      </View>
                      <View style={styles.itemRight}>
                        <Text
                          style={[
                            typography.titleMd,
                            tabularNums,
                            styles.itemPrice,
                          ]}
                        >
                          {formatKRW(subtotal)}
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
                  );
                })}
              </Card>
            )}
          </View>
        </ScrollView>

        {/* 하단 고정 요약 및 저장/시작 액션 바 */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomSummary}>
            <Text style={[typography.labelSm, styles.mutedText]}>
              총 예상 금액
            </Text>
            <Text
              style={[typography.headlineMd, tabularNums, styles.totalText]}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- 화면 레이아웃 및 스크롤 영역 ---
  safeArea: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  flex: {
    flex: 1,
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

  // --- 품목 추가 폼 및 수량 스테퍼 ---
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
    minWidth: 28,
    textAlign: 'center',
    color: theme.onSurface,
  },

  // --- 담을 품목 리스트 ---
  countBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
  },
  countText: {
    color: theme.primary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
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
    gap: 2,
  },
  itemName: {
    color: theme.onSurface,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemPrice: {
    color: theme.onSurface,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedText: {
    color: theme.onSurfaceVariant,
  },

  // --- 하단 고정 정산·액션 바 ---
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.pageMargin,
    paddingVertical: spacing.sm + 4,
    backgroundColor: theme.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.outlineVariant,
    gap: spacing.sm,
  },
  bottomSummary: {
    gap: 2,
  },
  totalText: {
    color: theme.onSurface,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
