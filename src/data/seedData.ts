/**
 * @file seedData.ts
 * @description 초기 개발 및 UI 동작 확인용 샘플 데이터를 제공합니다.
 *
 * [샘플 데이터 완전 제거 방법]
 *   - 방법 1) 아래 `ENABLE_SEED_DATA` 상수를 `false`로 변경
 *   - 방법 2) 이 파일(`src/data/seedData.ts`)을 삭제한 뒤,
 *             `src/store/useGroceryStore.ts`에서 `getInitialSeedLists` import를 제거하고
 *             초기 `lists` 상태를 `[]`로 설정
 */
import type { ShoppingList } from '../types/grocery';

/** 샘플 데이터 활성화 여부 플래그 (배포 전 false로 변경 또는 파일 삭제) */
export const ENABLE_SEED_DATA = true;

/** 현재 시각 기준으로 N일 전의 ISO 타임스탬프를 생성합니다. */
function daysAgoIso(daysAgo: number, hour = 16, minute = 20): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** 지난달 특정 일자의 ISO 타임스탬프를 생성합니다 (전월 대비 지출 비교 확인용). */
function lastMonthIso(day: number, hour = 15, minute = 10): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setDate(day);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/**
 * 스토어 최초 초기화 시 사용할 샘플 장보기 목록을 반환합니다.
 * AsyncStorage에 이미 저장된 데이터가 있으면 Zustand persist가 저장된 값을 우선 복원합니다.
 */
export function getInitialSeedLists(): ShoppingList[] {
  if (!ENABLE_SEED_DATA) return [];

  return [
    // 예정된 장보기 1 (준비됨: 일부 품목이 미리 체크된 장보기 진행 테스트용)
    {
      id: 'seed-plan-1',
      title: '주말 트레이더스 장보기',
      status: 'ready',
      createdAt: daysAgoIso(1, 10, 0),
      updatedAt: daysAgoIso(1, 10, 30),
      items: [
        {
          id: 'seed-p1-i1',
          name: '국내산 삼겹살 600g',
          estimatedUnitPrice: 12900,
          quantity: 1,
          checked: true,
          actualSalePrice: 12900,
          discountAmount: 0,
          finalPurchasePrice: 12900,
        },
        {
          id: 'seed-p1-i2',
          name: '서울우유 1L',
          estimatedUnitPrice: 4800,
          quantity: 2,
          checked: true,
          actualSalePrice: 9600,
          discountAmount: 0,
          finalPurchasePrice: 9600,
        },
        {
          id: 'seed-p1-i3',
          name: '동물복지 유정란 15구',
          estimatedUnitPrice: 7900,
          quantity: 1,
          checked: true,
          actualSalePrice: 6500,
          discountAmount: 500,
          finalPurchasePrice: 6000,
        },
        {
          id: 'seed-p1-i4',
          name: '대추방울토마토 500g',
          estimatedUnitPrice: 6500,
          quantity: 2,
          checked: false,
        },
        {
          id: 'seed-p1-i5',
          name: '올리브오일 500ml',
          estimatedUnitPrice: 11200,
          quantity: 1,
          checked: false,
        },
        {
          id: 'seed-p1-i6',
          name: '냉동 블루베리 1kg',
          estimatedUnitPrice: 9900,
          quantity: 1,
          checked: false,
        },
      ],
    },
    // 예정된 장보기 2 (작성 중)
    {
      id: 'seed-plan-2',
      title: '평일 저녁 반찬 장보기',
      status: 'draft',
      createdAt: daysAgoIso(0, 9, 15),
      updatedAt: daysAgoIso(0, 9, 20),
      items: [
        {
          id: 'seed-p2-i1',
          name: '국산콩 두부 300g',
          estimatedUnitPrice: 3200,
          quantity: 2,
          checked: false,
        },
        {
          id: 'seed-p2-i2',
          name: '애호박',
          estimatedUnitPrice: 2400,
          quantity: 2,
          checked: false,
        },
        {
          id: 'seed-p2-i3',
          name: '콩나물 300g',
          estimatedUnitPrice: 1800,
          quantity: 1,
          checked: false,
        },
        {
          id: 'seed-p2-i4',
          name: '돼지고기 다짐육 400g',
          estimatedUnitPrice: 10800,
          quantity: 1,
          checked: false,
        },
      ],
    },
    // 완료된 이력 1 (이번 주, 미구매 품목 1건 포함)
    {
      id: 'seed-hist-1',
      title: '이마트 성수점',
      status: 'completed',
      createdAt: daysAgoIso(1, 15, 0),
      updatedAt: daysAgoIso(1, 16, 20),
      completedAt: daysAgoIso(1, 16, 20),
      actualPaidTotal: 48300,
      actualDiscountTotal: 4200,
      items: [
        {
          id: 'seed-h1-i1',
          name: '한돈 앞다리살 800g',
          estimatedUnitPrice: 10800,
          quantity: 1,
          checked: true,
          actualSalePrice: 10800,
          discountAmount: 0,
          finalPurchasePrice: 10800,
        },
        {
          id: 'seed-h1-i2',
          name: '연세우유 900ml',
          estimatedUnitPrice: 2950,
          quantity: 2,
          checked: true,
          actualSalePrice: 5900,
          discountAmount: 0,
          finalPurchasePrice: 5900,
        },
        {
          id: 'seed-h1-i3',
          name: '풀무원 국산콩 두부',
          estimatedUnitPrice: 3200,
          quantity: 2,
          checked: true,
          actualSalePrice: 6400,
          discountAmount: 0,
          finalPurchasePrice: 6400,
        },
        {
          id: 'seed-h1-i4',
          name: '청송 세척사과 1.5kg',
          estimatedUnitPrice: 11900,
          quantity: 1,
          checked: true,
          actualSalePrice: 11900,
          discountAmount: 0,
          finalPurchasePrice: 11900,
        },
        {
          id: 'seed-h1-i5',
          name: '그릭요거트 450g',
          estimatedUnitPrice: 5500,
          quantity: 1,
          checked: true,
          actualSalePrice: 5500,
          discountAmount: 0,
          finalPurchasePrice: 5500,
        },
        {
          id: 'seed-h1-i6',
          name: '양파 1망 (5입)',
          estimatedUnitPrice: 3800,
          quantity: 1,
          checked: true,
          actualSalePrice: 3800,
          discountAmount: 0,
          finalPurchasePrice: 3800,
        },
        {
          id: 'seed-h1-i7',
          name: '대파 1단',
          estimatedUnitPrice: 4000,
          quantity: 1,
          checked: true,
          actualSalePrice: 4000,
          discountAmount: 0,
          finalPurchasePrice: 4000,
        },
        {
          id: 'seed-h1-i8',
          name: '바질 페스토 190g',
          estimatedUnitPrice: 4200,
          quantity: 1,
          checked: false,
        },
      ],
    },
    // 완료된 이력 2 (이번 주)
    {
      id: 'seed-hist-2',
      title: '동네 하나로마트',
      status: 'completed',
      createdAt: daysAgoIso(2, 18, 0),
      updatedAt: daysAgoIso(2, 18, 45),
      completedAt: daysAgoIso(2, 18, 45),
      actualPaidTotal: 29400,
      actualDiscountTotal: 1500,
      items: [
        {
          id: 'seed-h2-i1',
          name: '감자 1kg',
          estimatedUnitPrice: 5500,
          quantity: 1,
          checked: true,
          actualSalePrice: 5500,
          discountAmount: 500,
          finalPurchasePrice: 5000,
        },
        {
          id: 'seed-h2-i2',
          name: '시금치 1단',
          estimatedUnitPrice: 3900,
          quantity: 2,
          checked: true,
          actualSalePrice: 7800,
          discountAmount: 0,
          finalPurchasePrice: 7800,
        },
        {
          id: 'seed-h2-i3',
          name: '국산 표고버섯',
          estimatedUnitPrice: 6600,
          quantity: 1,
          checked: true,
          actualSalePrice: 6600,
          discountAmount: 1000,
          finalPurchasePrice: 5600,
        },
        {
          id: 'seed-h2-i4',
          name: '소고기 국거리 300g',
          estimatedUnitPrice: 11000,
          quantity: 1,
          checked: true,
          actualSalePrice: 11000,
          discountAmount: 0,
          finalPurchasePrice: 11000,
        },
      ],
    },
    // 완료된 이력 3 (이번 달)
    {
      id: 'seed-hist-3',
      title: '쿠팡 로켓프레시',
      status: 'completed',
      createdAt: daysAgoIso(9, 11, 0),
      updatedAt: daysAgoIso(9, 11, 30),
      completedAt: daysAgoIso(9, 11, 30),
      actualPaidTotal: 54900,
      actualDiscountTotal: 5000,
      items: [
        {
          id: 'seed-h3-i1',
          name: '무항생제 닭가슴살 1kg',
          estimatedUnitPrice: 14900,
          quantity: 2,
          checked: true,
          actualSalePrice: 29800,
          discountAmount: 3000,
          finalPurchasePrice: 26800,
        },
        {
          id: 'seed-h3-i2',
          name: '유기농 현미 4kg',
          estimatedUnitPrice: 19900,
          quantity: 1,
          checked: true,
          actualSalePrice: 19900,
          discountAmount: 2000,
          finalPurchasePrice: 17900,
        },
        {
          id: 'seed-h3-i3',
          name: '아보카도 4입',
          estimatedUnitPrice: 10200,
          quantity: 1,
          checked: true,
          actualSalePrice: 10200,
          discountAmount: 0,
          finalPurchasePrice: 10200,
        },
      ],
    },
    // 완료된 이력 4 (지난달 비교용)
    {
      id: 'seed-hist-4',
      title: '이마트 성수점',
      status: 'completed',
      createdAt: lastMonthIso(18, 14, 0),
      updatedAt: lastMonthIso(18, 15, 10),
      completedAt: lastMonthIso(18, 15, 10),
      actualPaidTotal: 150800,
      actualDiscountTotal: 12400,
      items: [
        {
          id: 'seed-h4-i1',
          name: '주간 식재료 일괄 구매',
          estimatedUnitPrice: 163200,
          quantity: 1,
          checked: true,
          actualSalePrice: 163200,
          discountAmount: 12400,
          finalPurchasePrice: 150800,
        },
      ],
    },
  ];
}
