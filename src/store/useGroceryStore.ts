import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getInitialSeedLists } from '../data/seedData';
import { ShoppingItem, ShoppingList, ShoppingStatus } from '../types/grocery';

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface NewItemInput {
  name: string;
  estimatedUnitPrice: number;
  quantity: number;
}

interface GroceryState {
  lists: ShoppingList[];
  hasHydrated: boolean;

  setHasHydrated: (hydrated: boolean) => void;
  getListById: (id: string) => ShoppingList | undefined;

  createList: (params: {
    title: string;
    items: NewItemInput[];
    status?: ShoppingStatus;
  }) => string;

  updateList: (
    id: string,
    params: {
      title: string;
      items: ShoppingItem[];
      status?: ShoppingStatus;
    }
  ) => void;

  deleteList: (id: string) => void;

  startShopping: (id: string) => void;

  addItemToList: (listId: string, item: NewItemInput) => void;

  confirmItemPurchase: (
    listId: string,
    itemId: string,
    payload: {
      actualSalePrice: number;
      discountAmount: number;
      finalPurchasePrice: number;
    }
  ) => void;

  uncheckItem: (listId: string, itemId: string) => void;

  updateSettlement: (
    listId: string,
    payload: {
      actualPaidTotal: number;
      actualDiscountTotal: number;
    }
  ) => void;

  completeShopping: (
    listId: string,
    payload: {
      actualPaidTotal: number;
      actualDiscountTotal: number;
    }
  ) => void;

  clearAllLists: () => void;
}

export const useGroceryStore = create<GroceryState>()(
  persist(
    (set, get) => ({
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
      partialize: (state) => ({ lists: state.lists }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
