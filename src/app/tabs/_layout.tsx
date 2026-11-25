/**
 * @file tabs/_layout.tsx
 * @description 하단 탭 네비게이션 바를 구성하는 레이아웃입니다.
 * `src/navigation/routes.ts`의 `TAB_ITEMS` 정의를 순회해 탭(홈, 히스토리)을 일관되게 렌더링합니다.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TAB_ITEMS } from '../../navigation/routes';
import { fontFamilies, theme } from '../../theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.surface },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.outline,
        // Stitch 디자인 시스템: 그림자 없이 상단 1px 외곽선(outlineVariant)으로 분리
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
