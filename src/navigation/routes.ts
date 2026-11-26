/**
 * @file routes.ts
 * @description 앱 전체의 Expo Router 경로 상수와 하단 탭 메뉴 구성을 단일 위치에서 정의합니다.
 * 라우트 구조나 탭 순서/라벨/아이콘을 변경할 때 이 파일만 수정하면 전체 화면과 레이아웃에 일관되게 반영됩니다.
 */
import { MaterialIcons } from '@expo/vector-icons';

/** 하단 탭 네비게이터에 등록된 탭 라우트 파일명 키 */
export type TabKey = 'index' | 'history';

/** 하단 탭 1개의 메타데이터 정의 */
export interface TabDefinition {
  /** `src/app/tabs/` 하위의 라우트 파일명 (`index` 또는 `history`) */
  name: TabKey;
  /** 탭 바에 표시할 한글 이름 */
  title: string;
  /** MaterialIcons 아이콘 이름 */
  icon: keyof typeof MaterialIcons.glyphMap;
  /** 탭의 전체 URL 경로 */
  href: '/tabs' | '/tabs/history';
}

/** 앱 내 모든 화면의 정적/동적 경로 상수 */
export const ROUTES = {
  ROOT: '/',
  TABS_GROUP: 'tabs',
  HOME: '/tabs',
  HISTORY: '/tabs/history',
  CREATE_LIST: '/create',
  SHOPPING: '/shopping/[id]',
  HISTORY_DETAIL: '/history/[id]',
} as const;

/** `src/app/tabs/_layout.tsx`에서 순회하여 렌더링하는 하단 탭 목록 */
export const TAB_ITEMS: TabDefinition[] = [
  {
    name: 'index',
    title: '홈',
    icon: 'home',
    href: ROUTES.HOME,
  },
  {
    name: 'history',
    title: '히스토리',
    icon: 'receipt-long',
    href: ROUTES.HISTORY,
  },
];
