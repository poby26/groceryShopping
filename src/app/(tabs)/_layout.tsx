import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { fontFamilies, theme } from '../../theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.outline,
        tabBarStyle: {
          backgroundColor: theme.surfaceContainerLowest,
          borderTopWidth: 1,
          borderTopColor: theme.outlineVariant,
          elevation: 0,
          shadowOpacity: 0,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamilies.medium,
          fontSize: 12,
          lineHeight: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="home"
              size={size}
              color={typeof color === 'string' ? color : theme.primary}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '히스토리',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="receipt-long"
              size={size}
              color={typeof color === 'string' ? color : theme.primary}
            />
          ),
        }}
      />
    </Tabs>
  );
}
