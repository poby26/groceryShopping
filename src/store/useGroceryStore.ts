/**
 * @file useGroceryStore.ts
 * @description Zustand + AsyncStorage 기반의 앱 전역 장보기 상태 저장소입니다.
 * - 모든 장보기 목록(`lists`)을 기기 로컬 저장소(`oneul-jangbogi-storage-v1`)에 자동 영속화합니다.
 * - 목록 생성/수정/삭제, 장보기 시작, 품목 체크 및 실제 금액 확정, 완료 정산 액션을 제공합니다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getInitialSeedLists } from '../data/seedData';
import { ShoppingItem, ShoppingList, ShoppingStatus } from '../types/grocery';

/** 타임스탬프와 난수를 조합해 충돌 없는 고유 ID를 생성합니다. */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 새 품목 추가 시 입력받는 최소 데이터 구조 */
export interface NewItemInput {
  name: string;
  estimatedUnitPrice: number;
  quantity: number;
}

interface GroceryState {
  /** 예정·진행 중·완료된 모든 장보기 목록 배열 */
  lists: ShoppingList[];
  /** AsyncStorage에서 초기 데이터 복원(Hydration)이 완료되었는지 여부 */
  hasHydrated: boolean;

  setHasHydrated: (hydrated: boolean) => void;
  getListById: (id: string) => ShoppingList | undefined;

  /** 새 장보기 목록을 생성하고 생성된 목록 ID를 반환합니다. */
  createList: (params: {
    title: string;
    items: NewItemInput[];
    status?: ShoppingStatus;
  }) => string;

  /** 기존 장보기 목록의 제목·품목·상태를 수정합니다. */
  updateList: (
    id: string,
    params: {
      title: string;
      items: ShoppingItem[];
      status?: ShoppingStatus;
    }
  ) => void;

  /** 지정한 ID의 장보기 목록을 삭제합니다. */
  deleteList: (id: string) => void;

  /** 장보기 상태를 `shopping`(장보는 중)으로 전환합니다. */
  startShopping: (id: string) => void;

  /** 진행 중인 장보기 목록에 새 품목을 즉시 추가합니다. */
  addItemToList: (listId: string, item: NewItemInput) => void;

  /** 품목 체크 시 구매 금액 확인 모달에서 입력한 실제 판매가·할인가·최종 구매가를 저장합니다. */
  confirmItemPurchase: (
    listId: string,
    itemId: string,
    payload: {
      actualSalePrice: number;
      discountAmount: number;
      finalPurchasePrice: number;
    }
  ) => void;

  /** 체크된 품목을 미구매 상태로 되돌립니다 (기존 입력 금액 기록은 유지하여 재체크 시 복원). */
  uncheckItem: (listId: string, itemId: string) => void;

  /** 결제 정산 섹션의 실제 결제금액/할인금액을 중간 저장합니다. */
  updateSettlement: (
    listId: string,
    payload: {
      actualPaidTotal: number;
      actualDiscountTotal: number;
    }
  ) => void;

  /** 장보기를 완료(`completed`) 처리하고 최종 결제/할인 금액과 완료 시각을 기록합니다. */
  completeShopping: (
    listId: string,
    payload: {
      actualPaidTotal: number;
      actualDiscountTotal: number;
    }
  ) => void;

  /** 저장된 모든 장보기 목록을 비웁니다 (초기화 용도). */
  clearAllLists: () => void;
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set, get) => ({
      // 최초 실행 시 AsyncStorage에 값이 없으면 seedData에서 초기 목록을 불러옵니다.
      lists: getInitialSeedLists(),
      hasHydrated: false,

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

      getListById: (id) => get().lists.find((l) => l.id === id),

      createList: ({ title, items, status }) => {
        const now = new Date().toISOString();
        const id = generateId('list');
        const builtItems: ShoppingItem[] = items.map((item) => ({
          id: generateId('item'),
          name: item.name.trim(),
          estimatedUnitPrice: Math.max(0, item.estimatedUnitPrice),
          quantity: Math.max(1, item.quantity),
          checked: false,
        }));

        // 품목이 1개 이상이면 'ready'(준비됨), 비어 있으면 'draft'(작성 중)로 기본 설정
        const nextStatus: ShoppingStatus =
          status ?? (builtItems.length > 0 ? 'ready' : 'draft');

        const newList: ShoppingList = {
          id,
          title: title.trim() || '새 장보기',
          status: nextStatus,
          items: builtItems,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          lists: [newList, ...state.lists],
        }));

        return id;
      },

      updateList: (id, { title, items, status }) => {
        const now = new Date().toISOString();
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id !== id) return list;
            const nextStatus: ShoppingStatus =
              status ?? (items.length > 0 ? 'ready' : 'draft');
            return {
              ...list,
              title: title.trim() || list.title,
              items,
              // 이미 완료된 이력은 상태를 되돌리지 않도록 보호
              status: list.status === 'completed' ? 'completed' : nextStatus,
              updatedAt: now,
            };
          }),
        }));
      },

      deleteList: (id) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== id),
        }));
      },

      startShopping: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === id && list.status !== 'completed'
              ? { ...list, status: 'shopping', updatedAt: now }
              : list
          ),
        }));
      },

      addItemToList: (listId, item) => {
        const now = new Date().toISOString();
        const newItem: ShoppingItem = {
          id: generateId('item'),
          name: item.name.trim(),
          estimatedUnitPrice: Math.max(0, item.estimatedUnitPrice),
          quantity: Math.max(1, item.quantity),
          checked: false,
        };

        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: [...list.items, newItem],
                  updatedAt: now,
                }
              : list
          ),
        }));
      },

      confirmItemPurchase: (listId, itemId, payload) => {
        const now = new Date().toISOString();
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id !== listId) return list;
            return {
              ...list,
              updatedAt: now,
              items: list.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      checked: true,
                      actualSalePrice: Math.max(0, payload.actualSalePrice),
                      discountAmount: Math.max(0, payload.discountAmount),
                      finalPurchasePrice: Math.max(0, payload.finalPurchasePrice),
                    }
                  : item
              ),
            };
          }),
        }));
      },

      uncheckItem: (listId, itemId) => {
        const now = new Date().toISOString();
        set((state) => ({
          lists: state.lists.map((list) => {
            if (list.id !== listId) return list;
            return {
              ...list,
              updatedAt: now,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, checked: false } : item
              ),
            };
          }),
        }));
      },

      updateSettlement: (listId, payload) => {
        const now = new Date().toISOString();
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  actualPaidTotal: Math.max(0, payload.actualPaidTotal),
                  actualDiscountTotal: Math.max(0, payload.actualDiscountTotal),
                  updatedAt: now,
                }
              : list
          ),
        }));
      },

      completeShopping: (listId, payload) => {
        const now = new Date().toISOString();
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  status: 'completed',
                  actualPaidTotal: Math.max(0, payload.actualPaidTotal),
                  actualDiscountTotal: Math.max(0, payload.actualDiscountTotal),
                  completedAt: now,
                  updatedAt: now,
                }
              : list
          ),
        }));
      },

      clearAllLists: () => set({ lists: [] }),
    }),
    {
      name: 'oneul-jangbogi-storage-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // 런타임 플래그(hasHydrated)는 제외하고 lists만 디스크에 저장
      partialize: (state) => ({ lists: state.lists }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
