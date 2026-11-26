/**
 * @file _layout.tsx
 * @description 앱 최상위 루트 레이아웃입니다.
 * - Noto Sans KR 및 Red Hat Mono 폰트를 비동기로 로드한 뒤 스플래시 화면을 숨깁니다.
 * - React Navigation ThemeProvider에 앱 컬러를 연결해 기본 회색(#F2F2F2) 배경 노출을 방지합니다.
 * - SafeAreaProvider, StatusBar 및 전체 화면 스택(tabs, create-list, shopping/[id], history/[id])을 정의합니다.
 */
import React, { useEffect } from 'react';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
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
import { ROUTES } from '../navigation/routes';
import { commonStyles } from '../theme/commonStyles';
import { theme } from '../theme/tokens';

// 폰트 로딩이 완료될 때까지 스플래시 화면이 자동으로 닫히지 않도록 유지
SplashScreen.preventAutoHideAsync().catch(() => { });

// React Navigation 기본 회색(#F2F2F2) 대신 앱 표면색(#F4FBF4)을 사용하는 네비게이션 테마
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.primary,
    background: theme.surface,
    card: theme.surfaceContainerLowest,
    text: theme.onSurface,
    border: theme.outlineVariant,
    notification: theme.secondary,
  },
};

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
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider style={commonStyles.screen}>
      <ThemeProvider value={navigationTheme}>
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
          <Stack.Screen name="create" />
          <Stack.Screen name="shopping/[id]" />
          <Stack.Screen name="history/[id]" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
