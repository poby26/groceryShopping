/**
 * @file index.tsx
 * @description 앱 루트(`/`) 진입점입니다.
 * 앱 최초 실행 시 또는 웹에서 루트 URL로 접근했을 때 메인 탭 홈(`ROUTES.HOME`)으로 리다이렉트합니다.
 */
import React from 'react';
import { Redirect } from 'expo-router';
import { ROUTES } from '../navigation/routes';

export default function AppEntry() {
  return <Redirect href={ROUTES.HOME} />;
}
