/**
 * @file _layout.tsx
 * @description 앱 최상위 루트 레이아웃입니다.
 * - Noto Sans KR(400/500/600/700) 및 Red Hat Mono(500) 웹/네이티브 폰트를 비동기로 로드한 뒤 스플래시 화면을 해제합니다.
 * - SafeAreaProvider, StatusBar 및 앱 전체 화면 스택(index, tabs, create-list, shopping/[id], history/[id])을 정의합니다.
 */
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_600SemiBold,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';
import { RedHatMono_500Medium } from '@expo-google-fonts/red-hat-mono';
import { theme } from '../theme/tokens';
import { ROUTES } from '../navigation/routes';

// 폰트 로딩이 완료되기 전에 스플래시 화면이 자동으로 닫혀 시스템 기본 폰트가 깜빡이는 현상 방지
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * Expo Router 루트 레이아웃 컴포넌트
 */
export default function RootLayout() {
  // 앱 전역 타이포그래피 토큰에서 사용하는 커스텀 폰트 일괄 로드
  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
    RedHatMono_500Medium,
  });

  // 폰트 로드 성공 또는 실패 시 스플래시 화면을 숨겨 앱 진입 허용
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // 폰트 로딩 중에는 빈 화면 유지 (스플래시 화면이 위에 표시됨)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {/* 라이트 모드 기반 표면(#F4FBF4)에 맞춰 상태바 아이콘을 어두운 색으로 고정 */}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          // 각 화면에서 커스텀 AppHeader를 사용하므로 네이티브 기본 헤더 비활성화
          headerShown: false,
          contentStyle: { backgroundColor: theme.surface },
          animation: 'slide_from_right',
        }}
      >
        {/* 루트('/') 리다이렉트 진입점 */}
        <Stack.Screen name="index" />
        {/* 하단 탭 그룹 (홈, 장보기 이력) */}
        <Stack.Screen name={ROUTES.TABS_GROUP} />
        {/* 장보기 목록 작성 / 수정 화면 */}
        <Stack.Screen name="create-list" />
        {/* 장보기 진행 화면 (동적 라우트: 목록 ID) */}
        <Stack.Screen name="shopping/[id]" />
        {/* 장보기 상세 영수증 화면 (동적 라우트: 이력 ID) */}
        <Stack.Screen name="history/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
