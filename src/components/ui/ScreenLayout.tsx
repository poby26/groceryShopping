/**
 * @file ScreenLayout.tsx
 * @description SafeAreaView + AppHeader + ScrollView(및 선택적 KeyboardAvoidingView, 하단 고정 바)를
 * 하나로 묶어 모든 화면의 보일러플레이트 레이아웃과 스타일 중복을 제거하는 공통 셸 컴포넌트입니다.
 */
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles } from '../../theme/commonStyles';
import { AppHeader, AppHeaderProps } from './AppHeader';

interface ScreenLayoutProps {
  /** 상단 헤더 설정 (`brand` 또는 `task` 모드) */
  header: AppHeaderProps;
  /** SafeArea 적용 모서리 (기본값: ['top']) */
  edges?: Edge[];
  /** 입력 폼 화면에서 키보드 회피 및 탭 유지 여부 */
  keyboardAvoiding?: boolean;
  /** 화면 하단에 고정할 액션/요약 바 */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function ScreenLayout({
  header,
  edges = ['top'],
  keyboardAvoiding = false,
  footer,
  children,
}: ScreenLayoutProps) {
  const scrollBody = (
    <>
      <ScrollView
        style={commonStyles.screen}
        contentContainerStyle={commonStyles.scrollContent}
        keyboardShouldPersistTaps={keyboardAvoiding ? 'handled' : 'never'}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer}
    </>
  );

  return (
    <SafeAreaView style={commonStyles.screen} edges={edges}>
      <AppHeader {...header} />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={commonStyles.flex1}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {scrollBody}
        </KeyboardAvoidingView>
      ) : (
        scrollBody
      )}
    </SafeAreaView>
  );
}
