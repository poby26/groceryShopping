/**
 * @file _layout.tsx
 * @description 앱 최상위 루트 레이아웃입니다.
 * - Noto Sans KR 및 Red Hat Mono 폰트를 비동기로 로드한 뒤 스플래시 화면을 숨깁니다.
 * - SafeAreaProvider, StatusBar 및 전체 화면 스택(tabs, create-list, shopping/[id], history/[id])을 정의합니다.
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

// 폰트 로딩이 완료될 때까지 스플래시 화면이 자동으로 닫히지 않도록 유지
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_600SemiBold,
    NotoSansKR_700Bold,
    RedHatMono_500Medium,
  });

  // 폰트 로드 성공 또는 실패 시 스플래시 화면 해제
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.surface },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name={ROUTES.TABS_GROUP} />
        <Stack.Screen name="create-list" />
        <Stack.Screen name="shopping/[id]" />
        <Stack.Screen name="history/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
