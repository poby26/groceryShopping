/**
 * @file useAppFlow.ts
 * @description 앱 전체의 화면 전환, 탭 이동, 장보기 시작/완료 흐름을 중앙에서 관리하는 메인 흐름 훅입니다.
 * 개별 화면 컴포넌트는 `useRouter`나 경로 문자열을 직접 다루지 않고, 이 훅이 제공하는 의미 있는 액션만 호출합니다.
 */
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useGroceryStore } from '../store/useGroceryStore';
import { ROUTES, TabKey } from './routes';

export function useAppFlow() {
  const router = useRouter();
  const startShopping = useGroceryStore((s) => s.startShopping);
  const completeShopping = useGroceryStore((s) => s.completeShopping);

  /** 지정한 탭 키(`index` | `history`)에 해당하는 탭으로 이동합니다. */
  const switchTab = useCallback(
    (tab: TabKey) => {
      const target = tab === 'index' ? ROUTES.HOME : ROUTES.HISTORY;
      router.push(target);
    },
    [router]
  );

  /** 홈 탭으로 이동합니다. */
  const goHomeTab = useCallback(() => {
    router.push(ROUTES.HOME);
  }, [router]);

  /** 히스토리 탭으로 이동합니다. */
  const goHistoryTab = useCallback(() => {
    router.push(ROUTES.HISTORY);
  }, [router]);

  /** 새 장보기 목록 작성 화면으로 이동합니다. */
  const openCreateList = useCallback(() => {
    router.push(ROUTES.CREATE_LIST);
  }, [router]);

  /** 기존 장보기 목록 수정 화면으로 이동합니다. */
  const openEditList = useCallback(
    (listId: string) => {
      router.push({
        pathname: ROUTES.CREATE_LIST,
        params: { id: listId },
      });
    },
    [router]
  );

  /**
   * 장보기 상태를 `shopping`으로 전환한 뒤 장보기 진행 화면으로 이동합니다.
   * 목록 작성 화면에서 바로 시작할 때는 `replace: true`로 작성 화면을 스택에서 대체합니다.
   */
  const startShoppingFlow = useCallback(
    (listId: string, options?: { replace?: boolean }) => {
      startShopping(listId);
      if (options?.replace) {
        router.replace({
          pathname: ROUTES.SHOPPING,
          params: { id: listId },
        });
      } else {
        router.push({
          pathname: ROUTES.SHOPPING,
          params: { id: listId },
        });
      }
    },
    [router, startShopping]
  );

  /**
   * 장보기를 완료(`completed`) 상태로 저장한 뒤 영수증 상세 화면으로 전환합니다.
   * 뒤로가기 시 다시 진행 화면으로 돌아가지 않도록 `replace`로 이동합니다.
   */
  const completeShoppingFlow = useCallback(
    (
      listId: string,
      payload: { actualPaidTotal: number; actualDiscountTotal: number }
    ) => {
      completeShopping(listId, payload);
      router.replace({
        pathname: ROUTES.HISTORY_DETAIL,
        params: { id: listId },
      });
    },
    [completeShopping, router]
  );

  /** 완료된 장보기의 영수증 상세 화면으로 이동합니다. */
  const openHistoryDetail = useCallback(
    (listId: string) => {
      router.push({
        pathname: ROUTES.HISTORY_DETAIL,
        params: { id: listId },
      });
    },
    [router]
  );

  /** 이전 화면으로 돌아갑니다. */
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  /** 유효하지 않은 ID 접근 등 예외 상황에서 홈 탭으로 안전하게 복구합니다. */
  const recoverToHome = useCallback(() => {
    router.replace(ROUTES.HOME);
  }, [router]);

  /** 유효하지 않은 ID 접근 등 예외 상황에서 히스토리 탭으로 안전하게 복구합니다. */
  const recoverToHistory = useCallback(() => {
    router.replace(ROUTES.HISTORY);
  }, [router]);

  return {
    switchTab,
    goHomeTab,
    goHistoryTab,
    openCreateList,
    openEditList,
    startShoppingFlow,
    completeShoppingFlow,
    openHistoryDetail,
    goBack,
    recoverToHome,
    recoverToHistory,
  };
}
