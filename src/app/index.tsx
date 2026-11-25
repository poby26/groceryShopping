/**
 * @file index.tsx
 * @description 앱 루트(`/`) 진입점입니다.
 * 앱 최초 실행 시 또는 웹에서 루트 URL로 접근했을 때 메인 탭 홈(`ROUTES.HOME`)으로 즉시 리다이렉트합니다.
 * (`src/app/tabs`가 URL 세그먼트를 갖는 일반 디렉터리이므로 루트 진입 시 명시적 리다이렉트가 필요합니다.)
 */
import React from 'react';
import { Redirect } from 'expo-router';
import { ROUTES } from '../navigation/routes';

/**
 * 루트 경로('/') 접속 시 홈 탭 화면으로 리다이렉트하는 엔트리 컴포넌트
 */
export default function AppEntry() {
  return <Redirect href={ROUTES.HOME} />;
}
