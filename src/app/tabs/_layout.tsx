/**
 * @file tabs/_layout.tsx
 * @description 하단 탭 네비게이션 바를 구성하는 레이아웃입니다.
 * `src/navigation/routes.ts`의 `TAB_ITEMS` 정의를 순회해 탭(홈, 장보기 이력)을 일관되게 렌더링합니다.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TAB_ITEMS } from '../../navigation/routes';
import { fontFamilies, theme } from '../../theme/tokens';

/**
 * 하단 탭 네비게이터 레이아웃 컴포넌트
 * - Stitch 디자인 시스템에 따라 그림자 없이 상단 1px 외곽선(outlineVariant)으로 본문과 구분합니다.
 * - 상향된 폰트(13px) 가독성을 위해 탭 바 높이를 68px로 설정했습니다.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.surface },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.outline,
        // Stitch 디자인 시스템: 그림자(elevation/shadow) 없이 상단 1px 외곽선으로 영역 분리
        tabBarStyle: {
          backgroundColor: theme.surfaceContainerLowest,
          borderTopWidth: 1,
          borderTopColor: theme.outlineVariant,
          elevation: 0,
          shadowOpacity: 0,
          height: 68,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamilies.medium,
          fontSize: 13,
          lineHeight: 18,
        },
      }}
    >
      {/* 중앙 탭 정의 배열(TAB_ITEMS)을 순회해 탭 스크린 동적 등록 */}
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons
                name={tab.icon}
                size={size}
                color={typeof color === 'string' ? color : theme.primary}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
