/**
 * @file calculations.ts
 * @description 품목별 예상/실제 금액 계산, 체크 합산, 주간·월간·연간 통계 및 월별 그룹 집계를 담당합니다.
 * 순수 함수로 구성되어 UI와 독립적으로 테스트 및 재사용이 가능합니다.
 */
import type {
  HistoryFilter,
  MonthlyGroupSummary,
  PeriodSummaryStats,
  ShoppingItem,
  ShoppingList,
  SummaryPeriod,
} from '../types/grocery';

/** 품목의 예상 합계 금액(예상 단가 × 수량)을 계산합니다. */
export function getItemEstimatedTotal(item: ShoppingItem): number {
  return Math.max(0, item.estimatedUnitPrice) * Math.max(1, item.quantity);
}

/** 품목의 실제 판매금액을 반환합니다 (미입력 시 예상 합계로 폴백). */
export function getItemSalePrice(item: ShoppingItem): number {
  if (typeof item.actualSalePrice === 'number') {
    return Math.max(0, item.actualSalePrice);
  }
  return getItemEstimatedTotal(item);
}

/** 품목의 할인금액을 반환합니다 (미입력 시 0). */
export function getItemDiscount(item: ShoppingItem): number {
  return Math.max(0, item.discountAmount ?? 0);
}

/** 품목의 최종 구매금액을 반환합니다 (직접 입력값이 없으면 판매금액 - 할인금액). */
export function getItemFinalPrice(item: ShoppingItem): number {
  if (typeof item.finalPurchasePrice === 'number') {
    return Math.max(0, item.finalPurchasePrice);
  }
  return Math.max(0, getItemSalePrice(item) - getItemDiscount(item));
}

/** 목록 내 모든 품목의 총 예상 금액을 합산합니다. */
export function getListEstimatedTotal(list: ShoppingList): number {
  return list.items.reduce((sum, item) => sum + getItemEstimatedTotal(item), 0);
}

/**
 * 장보기 진행 화면에서 현재까지 체크된 품목의 개수, 구매 합계, 할인 합계를 집계합니다.
 */
export function getCheckedItemsSummary(list: ShoppingList) {
  let checkedCount = 0;
  let checkedSubtotal = 0;
  let checkedDiscountTotal = 0;

  for (const item of list.items) {
    if (item.checked) {
      checkedCount += 1;
      checkedSubtotal += getItemFinalPrice(item);
      checkedDiscountTotal += getItemDiscount(item);
    }
  }

  return {
    checkedCount,
    totalCount: list.items.length,
    checkedSubtotal,
    checkedDiscountTotal,
  };
}

/** 목록의 최종 결제금액을 반환합니다 (정산 입력값이 우선, 없으면 체크된 품목 합계). */
export function getListFinalPaid(list: ShoppingList): number {
  if (typeof list.actualPaidTotal === 'number') {
    return Math.max(0, list.actualPaidTotal);
  }
  return getCheckedItemsSummary(list).checkedSubtotal;
}

/** 목록의 최종 할인금액을 반환합니다 (정산 입력값이 우선, 없으면 체크된 품목 할인 합계). */
export function getListFinalDiscount(list: ShoppingList): number {
  if (typeof list.actualDiscountTotal === 'number') {
    return Math.max(0, list.actualDiscountTotal);
  }
  return getCheckedItemsSummary(list).checkedDiscountTotal;
}

/**
 * 주어진 날짜가 속한 주의 시작(월요일 00:00:00) 시각을 계산합니다.
 * 국내 주간 소비 통계 관례에 맞춰 일요일(0)이 아닌 월요일을 한 주의 시작으로 둡니다.
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 완료 이력 기준 날짜를 추출합니다 (`completedAt` 우선, 없으면 `updatedAt`/`createdAt`). */
function getCompletedDate(list: ShoppingList): Date {
  return new Date(list.completedAt ?? list.updatedAt ?? list.createdAt);
}

/** 장보기 이력이 기준일(`now`)의 주간/월간/연간 범위에 포함되는지 판별합니다. */
export function isInPeriod(
  list: ShoppingList,
  period: SummaryPeriod,
  now: Date = new Date()
): boolean {
  const target = getCompletedDate(list);
  if (period === 'weekly') {
    const start = getWeekStart(now);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return target >= start && target < end;
  }
  if (period === 'monthly') {
    return (
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth()
    );
  }
  return target.getFullYear() === now.getFullYear();
}

/** 완료된(`completed`) 장보기 목록만 추려 최신순으로 정렬한 뒤 기간 필터를 적용합니다. */
export function filterCompletedListsByPeriod(
  lists: ShoppingList[],
  filter: HistoryFilter,
  now: Date = new Date()
): ShoppingList[] {
  const completed = lists
    .filter((l) => l.status === 'completed')
    .sort(
      (a, b) =>
        getCompletedDate(b).getTime() - getCompletedDate(a).getTime()
    );

  if (filter === 'all') return completed;
  return completed.filter((l) => isInPeriod(l, filter, now));
}

/**
 * 홈 및 히스토리 요약 카드에 표시할 기간별 지출·할인·평균·전월 대비·최다 방문 통계를 계산합니다.
 */
export function computePeriodSummary(
  lists: ShoppingList[],
  period: SummaryPeriod,
  now: Date = new Date()
): PeriodSummaryStats {
  const plannedCount = lists.filter((l) => l.status !== 'completed').length;
  const completedInPeriod = filterCompletedListsByPeriod(lists, period, now);

  const totalSpent = completedInPeriod.reduce(
    (sum, l) => sum + getListFinalPaid(l),
    0
  );
  const totalDiscount = completedInPeriod.reduce(
    (sum, l) => sum + getListFinalDiscount(l),
    0
  );
  const tripCount = completedInPeriod.length;
  const averagePerTrip = tripCount > 0 ? Math.round(totalSpent / tripCount) : 0;

  // 월간 요약 시 지난달 지출 총액과의 차이를 계산
  let diffFromLastMonth: number | null = null;
  if (period === 'monthly') {
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthLists = lists.filter(
      (l) =>
        l.status === 'completed' &&
        getCompletedDate(l).getFullYear() === lastMonthDate.getFullYear() &&
        getCompletedDate(l).getMonth() === lastMonthDate.getMonth()
    );
    if (lastMonthLists.length > 0) {
      const lastMonthSpent = lastMonthLists.reduce(
        (sum, l) => sum + getListFinalPaid(l),
        0
      );
      diffFromLastMonth = totalSpent - lastMonthSpent;
    }
  }

  // 연간 요약 시 올해 경과 개월 수로 나눈 월 평균 지출 계산
  const monthsElapsed = Math.max(1, now.getMonth() + 1);
  const monthlyAverage = Math.round(totalSpent / monthsElapsed);

  // 연간 요약 시 가장 빈도가 높은 장보기 제목(마트명 등) 추출
  const freqMap = new Map<string, number>();
  for (const l of completedInPeriod) {
    const key = l.title.trim();
    if (!key) continue;
    freqMap.set(key, (freqMap.get(key) ?? 0) + 1);
  }
  let topStoreName: string | null = null;
  let maxFreq = 0;
  for (const [name, count] of freqMap.entries()) {
    if (count > maxFreq) {
      maxFreq = count;
      topStoreName = name;
    }
  }

  return {
    totalSpent,
    totalDiscount,
    tripCount,
    averagePerTrip,
    plannedCount,
    diffFromLastMonth,
    monthlyAverage,
    topStoreName,
  };
}

/**
 * 연간 히스토리 탭용으로 특정 연도의 완료된 장보기 목록을 월별(내림차순)로 그룹핑합니다.
 */
export function groupCompletedListsByMonth(
  lists: ShoppingList[],
  year: number = new Date().getFullYear()
): MonthlyGroupSummary[] {
  const yearLists = lists
    .filter(
      (l) =>
        l.status === 'completed' && getCompletedDate(l).getFullYear() === year
    )
    .sort(
      (a, b) =>
        getCompletedDate(b).getTime() - getCompletedDate(a).getTime()
    );

  const map = new Map<number, MonthlyGroupSummary>();

  for (const list of yearLists) {
    const month = getCompletedDate(list).getMonth() + 1;
    const existing = map.get(month);
    const paid = getListFinalPaid(list);
    const discount = getListFinalDiscount(list);

    if (existing) {
      existing.tripCount += 1;
      existing.totalSpent += paid;
      existing.totalDiscount += discount;
    } else {
      map.set(month, {
        year,
        month,
        label: `${year}년 ${month}월 장보기`,
        tripCount: 1,
        totalSpent: paid,
        totalDiscount: discount,
        latestListId: list.id,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.month - a.month);
}
