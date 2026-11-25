/**
 * @file grocery.ts
 * @description '오늘장보기' 앱의 핵심 도메인 모델, 필터 타입 및 통계 집계 인터페이스를 정의합니다.
 */

/**
 * 장보기 목록의 진행 상태
 * - `draft`: 품목이 아직 비어 있거나 작성 중인 상태
 * - `ready`: 1개 이상 품목이 담겨 장을 볼 준비가 된 상태
 * - `shopping`: 마트에서 장보기를 진행 중인 상태
 * - `completed`: 결제 정산까지 마치고 이력에 저장된 상태
 */
export type ShoppingStatus = 'draft' | 'ready' | 'shopping' | 'completed';

/**
 * 장보기 목록에 포함되는 개별 품목 정보
 */
export interface ShoppingItem {
  id: string;
  /** 품목 이름 (예: 서울우유 1L) */
  name: string;
  /** 계획 단계에서 입력한 예상 단가 (원) */
  estimatedUnitPrice: number;
  /** 구매 예정 수량 (최소 1) */
  quantity: number;
  /** 마트에서 장바구니에 담았는지(구매 완료) 여부 */
  checked: boolean;
  /** 마트에서 확인한 실제 판매금액 총액 (체크 시 입력) */
  actualSalePrice?: number;
  /** 해당 품목에 적용된 할인금액 (원) */
  discountAmount?: number;
  /** 최종 구매금액 (기본값: 실제 판매금액 - 할인금액, 수동 보정 가능) */
  finalPurchasePrice?: number;
}

/**
 * 하나의 장보기 세션(목록 또는 완료된 영수증)을 나타내는 엔티티
 */
export interface ShoppingList {
  id: string;
  /** 장보기 제목 (예: 주말 트레이더스 장보기, 이마트 성수점) */
  title: string;
  /** 현재 장보기 진행 상태 */
  status: ShoppingStatus;
  /** 포함된 품목 배열 */
  items: ShoppingItem[];
  /** 목록 최초 생성 시각 (ISO 8601 문자열) */
  createdAt: string;
  /** 마지막 수정 시각 (ISO 8601 문자열) */
  updatedAt: string;
  /** 장보기 완료(정산) 시각 (ISO 8601 문자열, 완료 상태일 때 설정) */
  completedAt?: string;
  /** 결제 정산 시 사용자가 확정한 최종 결제금액 (미입력 시 체크된 품목 합계 사용) */
  actualPaidTotal?: number;
  /** 결제 정산 시 사용자가 확정한 총 할인금액 (미입력 시 체크된 품목 할인 합계 사용) */
  actualDiscountTotal?: number;
}

/** 홈 화면 요약 카드에서 선택하는 기간 단위 */
export type SummaryPeriod = 'weekly' | 'monthly' | 'yearly';

/** 히스토리 화면에서 사용하는 기간 필터 단위 */
export type HistoryFilter = 'all' | 'weekly' | 'monthly' | 'yearly';

/**
 * 특정 기간(주간/월간/연간)에 대한 장보기 지출 및 통계 요약 결과
 */
export interface PeriodSummaryStats {
  /** 해당 기간 내 완료된 장보기의 총 결제금액 */
  totalSpent: number;
  /** 해당 기간 내 절약한 총 할인금액 */
  totalDiscount: number;
  /** 해당 기간 내 완료 횟수 */
  tripCount: number;
  /** 1회 장보기당 평균 결제금액 (완료 횟수가 0이면 0) */
  averagePerTrip: number;
  /** 현재 완료되지 않은(작성 중/준비됨/장보는 중) 목록 건수 */
  plannedCount: number;
  /** 지난달 총 지출 대비 증감액 (월간 요약 전용, 지난달 기록이 없으면 null) */
  diffFromLastMonth: number | null;
  /** 올해 경과 월 기준 월 평균 지출액 (연간 요약 전용) */
  monthlyAverage: number;
  /** 가장 자주 방문/기록된 장보기 제목 (연간 요약 전용, 기록이 없으면 null) */
  topStoreName: string | null;
}

/**
 * 연간 히스토리 탭에서 월별로 묶어 보여주기 위한 집계 정보
 */
export interface MonthlyGroupSummary {
  year: number;
  /** 월 (1 ~ 12) */
  month: number;
  /** 화면 표시용 라벨 (예: 2026년 11월 장보기) */
  label: string;
  /** 해당 월의 완료 횟수 */
  tripCount: number;
  /** 해당 월의 총 결제금액 */
  totalSpent: number;
  /** 해당 월의 총 할인금액 */
  totalDiscount: number;
  /** 월별 카드 탭 시 상세 화면으로 이동할 대표(최신) 장보기 ID */
  latestListId: string;
}
