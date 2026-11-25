export type ShoppingStatus = 'draft' | 'ready' | 'shopping' | 'completed';

export interface ShoppingItem {
  id: string;
  name: string;
  estimatedUnitPrice: number;
  quantity: number;
  checked: boolean;
  /** 마트에서 확인한 실제 판매금액(총액) */
  actualSalePrice?: number;
  /** 품목별 할인금액 */
  discountAmount?: number;
  /** 최종 구매금액 (실제 판매금액 - 할인금액, 또는 사용자 직접 입력) */
  finalPurchasePrice?: number;
}

export interface ShoppingList {
  id: string;
  title: string;
  status: ShoppingStatus;
  items: ShoppingItem[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  completedAt?: string; // ISO string
  /** 결제 정산 시 최종 결제금액 (미입력 시 체크된 품목 합계 사용) */
  actualPaidTotal?: number;
  /** 결제 정산 시 총 할인금액 (미입력 시 체크된 품목 할인 합계 사용) */
  actualDiscountTotal?: number;
}

export type SummaryPeriod = 'weekly' | 'monthly' | 'yearly';
export type HistoryFilter = 'all' | 'weekly' | 'monthly' | 'yearly';

export interface PeriodSummaryStats {
  totalSpent: number;
  totalDiscount: number;
  tripCount: number;
  averagePerTrip: number;
  plannedCount: number;
  diffFromLastMonth: number | null;
  monthlyAverage: number;
  topStoreName: string | null;
}

export interface MonthlyGroupSummary {
  year: number;
  month: number; // 1 ~ 12
  label: string;
  tripCount: number;
  totalSpent: number;
  totalDiscount: number;
  latestListId: string;
}
