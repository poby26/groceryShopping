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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { AppHeader } from '../components/ui/AppHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
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

export default function CreateListScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const existingList = useGroceryStore((s) =>
    id ? s.lists.find((l) => l.id === id) : undefined
  );
  const createList = useGroceryStore((s) => s.createList);
  const updateList = useGroceryStore((s) => s.updateList);
  const startShopping = useGroceryStore((s) => s.startShopping);

  const isEditMode = Boolean(existingList);

  const [title, setTitle] = useState(existingList?.title ?? '');
  const [items, setItems] = useState<ShoppingItem[]>(existingList?.items ?? []);

  // 품목 추가 폼 상태
  const [itemName, setItemName] = useState('');
  const [itemPriceText, setItemPriceText] = useState('');
  const [itemQty, setItemQty] = useState(1);

  const totalEstimated = useMemo(
    () => items.reduce((sum, item) => sum + getItemEstimatedTotal(item), 0),
    [items]
  );

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

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

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
      startShopping(targetId);
      router.replace(`/shopping/${targetId}`);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader
        mode="task"
        title={isEditMode ? '장보기 목록 수정' : '장보기 목록 작성'}
        badgeLabel={isEditMode ? '목록 수정' : '신규 작성'}
        badgeTone="neutral"
        onBack={() => router.back()}
      />

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
          {/* List Title Input */}
          <Card>
            <InputField
              label="장보기 이름"
              placeholder="예: 주말 마트 장보기"
              hint="마트 이름이나 목적을 적어두면 히스토리에서 찾기 쉬워요"
              value={title}
              onChangeText={setTitle}
            />
          </Card>

          {/* Add Item Form */}
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

          {/* Added Items List */}
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
              <Card style={styles.emptyCard}>
                <Text style={[typography.bodyMd, styles.mutedText]}>
                  아직 추가된 품목이 없어요. 위에서 구매할 품목을 입력해 보세요.
                </Text>
              </Card>
            ) : (
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

        {/* Bottom Summary & Action Bar */}
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
    minWidth: 28,
    textAlign: 'center',
    color: theme.onSurface,
  },
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
