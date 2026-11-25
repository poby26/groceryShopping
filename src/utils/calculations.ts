import type {
  HistoryFilter,
  MonthlyGroupSummary,
  PeriodSummaryStats,
  ShoppingItem,
  ShoppingList,
  SummaryPeriod,
} from '../types/grocery';

export function getItemEstimatedTotal(item: ShoppingItem): number {
  return Math.max(0, item.estimatedUnitPrice) * Math.max(1, item.quantity);
}

export function getItemSalePrice(item: ShoppingItem): number {
  if (typeof item.actualSalePrice === 'number') {
    return Math.max(0, item.actualSalePrice);
  }
  return getItemEstimatedTotal(item);
}

export function getItemDiscount(item: ShoppingItem): number {
  return Math.max(0, item.discountAmount ?? 0);
}

export function getItemFinalPrice(item: ShoppingItem): number {
  if (typeof item.finalPurchasePrice === 'number') {
    return Math.max(0, item.finalPurchasePrice);
  }
  return Math.max(0, getItemSalePrice(item) - getItemDiscount(item));
}

export function getListEstimatedTotal(list: ShoppingList): number {
  return list.items.reduce((sum, item) => sum + getItemEstimatedTotal(item), 0);
}

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

export function getListFinalPaid(list: ShoppingList): number {
  if (typeof list.actualPaidTotal === 'number') {
    return Math.max(0, list.actualPaidTotal);
  }
  return getCheckedItemsSummary(list).checkedSubtotal;
}

export function getListFinalDiscount(list: ShoppingList): number {
  if (typeof list.actualDiscountTotal === 'number') {
    return Math.max(0, list.actualDiscountTotal);
  }
  return getCheckedItemsSummary(list).checkedDiscountTotal;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // 월요일을 주의 시작으로 계산
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getCompletedDate(list: ShoppingList): Date {
  return new Date(list.completedAt ?? list.updatedAt ?? list.createdAt);
}

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

  // 지난달 대비 (monthly용)
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

  // 월 평균 지출 (yearly용)
  const monthsElapsed = Math.max(1, now.getMonth() + 1);
  const monthlyAverage = Math.round(totalSpent / monthsElapsed);

  // 최다 방문 장보기 장소/이름 (yearly용)
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
