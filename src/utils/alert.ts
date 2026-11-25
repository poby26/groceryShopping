/**
 * @file alert.ts
 * @description 모바일(Android/iOS)과 웹(react-native-web) 모두에서 동일하게 동작하는 알림/확인 다이얼로그 유틸리티입니다.
 * `react-native`의 `Alert.alert`는 웹 브라우저 환경에서 무동작(no-op)이므로 플랫폼을 분기 처리합니다.
 */
import { Alert, Platform } from 'react-native';

/** 단순 안내 메시지를 표시합니다. */
export function showAlert(title: string, message: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${title}\n\n${message}`);
    }
    return;
  }
  Alert.alert(title, message);
}

/** 사용자의 확인/취소 선택이 필요한 확인 창을 표시합니다. */
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = '확인'
): void {
  if (Platform.OS === 'web') {
    if (
      typeof window !== 'undefined' &&
      typeof window.confirm === 'function' &&
      window.confirm(`${title}\n\n${message}`)
    ) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: '취소', style: 'cancel' },
    { text: confirmLabel, onPress: onConfirm },
  ]);
}
