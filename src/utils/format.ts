/**
 * @file format.ts
 * @description 원화 금액, 할인 표기, 한국어 날짜/시간 포맷팅 및 숫자 입력 파싱 유틸리티입니다.
 */

const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

/** 숫자를 반올림하여 천 단위 쉼표가 포함된 문자열로 변환합니다 (예: `42,800`). */
export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return safe.toLocaleString('ko-KR');
}

/** 원화 금액 문자열로 변환합니다 (예: `42,800원`). */
export function formatKRW(amount: number): string {
  return `${formatNumber(amount)}원`;
}

/** 전월 대비 등 증감 금액을 부호 포함 문자열로 변환합니다 (예: `+12,000원`, `-18,200원`). */
export function formatSignedDiffKRW(diff: number): string {
  const rounded = Math.round(diff);
  if (rounded === 0) return '0원';
  return rounded > 0 ? `+${formatNumber(rounded)}원` : `-${formatNumber(Math.abs(rounded))}원`;
}

/** 할인 금액을 음수 부호와 함께 표기합니다 (0원이면 `0원`, 그 외 `-3,500원`). */
export function formatDiscountKRW(discount: number): string {
  const safe = Math.max(0, Math.round(discount));
  if (safe === 0) return '0원';
  return `-${formatNumber(safe)}원`;
}

/** 상단 브랜드 헤더용 짧은 날짜 문자열을 반환합니다 (예: `11월 24일 (화)`). */
export function formatKoreanDateShort(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS_KO[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

/** 이력 카드용 점 구분 날짜 문자열을 반환합니다 (예: `2026.11.24 (화)`). */
export function formatDotDate(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekday = WEEKDAYS_KO[d.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

/** 영수증 상세 카드용 날짜+오전/오후 시간 문자열을 반환합니다 (예: `2026.11.21 (토) 오후 4:20`). */
export function formatDotDateTime(isoString: string): string {
  const d = new Date(isoString);
  const datePart = formatDotDate(isoString);
  const hours24 = d.getHours();
  const period = hours24 < 12 ? '오전' : '오후';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${datePart} ${period} ${hours12}:${minutes}`;
}

/** 사용자 텍스트 입력에서 숫자만 추출해 0 이상의 정수로 변환합니다. */
export function parseNumericInput(text: string): number {
  const digits = text.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}
