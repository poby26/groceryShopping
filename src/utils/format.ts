const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function formatNumber(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return safe.toLocaleString('ko-KR');
}

export function formatKRW(amount: number): string {
  return `${formatNumber(amount)}원`;
}

export function formatSignedDiffKRW(diff: number): string {
  const rounded = Math.round(diff);
  if (rounded === 0) return '0원';
  return rounded > 0 ? `+${formatNumber(rounded)}원` : `-${formatNumber(Math.abs(rounded))}원`;
}

export function formatDiscountKRW(discount: number): string {
  const safe = Math.max(0, Math.round(discount));
  if (safe === 0) return '0원';
  return `-${formatNumber(safe)}원`;
}

export function formatKoreanDateShort(date: Date = new Date()): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS_KO[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

export function formatDotDate(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekday = WEEKDAYS_KO[d.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
}

export function formatDotDateTime(isoString: string): string {
  const d = new Date(isoString);
  const datePart = formatDotDate(isoString);
  const hours24 = d.getHours();
  const period = hours24 < 12 ? '오전' : '오후';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${datePart} ${period} ${hours12}:${minutes}`;
}

export function parseNumericInput(text: string): number {
  const digits = text.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}
