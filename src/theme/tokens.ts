/**
 * @file tokens.ts
 * @description Stitch '오늘장보기 Design System'을 React Native 스타일 객체로 1:1 매핑한 디자인 토큰 모음입니다.
 * - 디자인 컨셉: Modern Utility + Warm Botanical Minimalism
 * - 그림자/블러 대신 톤 계층(Surface Tiers)과 1px 저대비 외곽선으로 깊이를 표현합니다.
 */
import { TextStyle } from 'react-native';

/** 브랜드 및 시맨틱 컬러 팔레트 */
export const colors = {
  success: '#196B4A',
  warning: '#C05914',
  light: {
    /** 선택된 탭, 완료 체크박스, 진행률 등 브랜드 핵심 포인트 (보태니컬 그린) */
    primary: '#005639',
    onPrimary: '#FFFFFF',
    primaryContainer: '#1E6F4E',
    onPrimaryContainer: '#A0EFC5',
    /** 주요 CTA 버튼, 할인 금액, 장보는 중 상태 강조 (테라코타 오렌지) */
    secondary: '#9E4300',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FF8843',
    onSecondaryContainer: '#692B00',
    tertiary: '#7A3536',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#974C4C',
    onTertiaryContainer: '#FFD5D3',
    error: '#BA1A1A',
    onError: '#FFFFFF',
    errorContainer: '#FFDAD6',
    onErrorContainer: '#93000A',
    /** 눈이 편안한 미세한 그린 틴트 오프화이트 기본 배경 */
    background: '#F4FBF4',
    onBackground: '#161D19',
    surface: '#F4FBF4',
    surfaceDim: '#D5DCD5',
    surfaceBright: '#F4FBF4',
    /** 카드/입력창/하단 바 등 최상위 밝기 표면 */
    surfaceContainerLowest: '#FFFFFF',
    /** 체크된 행, 보조 배지 등에 사용하는 한 단계 낮은 표면 */
    surfaceContainerLow: '#EFF5EF',
    surfaceContainer: '#E9F0E9',
    surfaceContainerHigh: '#E3EAE3',
    surfaceContainerHighest: '#DDE4DE',
    onSurface: '#161D19',
    surfaceVariant: '#DBE5DC',
    onSurfaceVariant: '#3F4943',
    outline: '#6F7A72',
    /** 카드 및 구분선 기본 1px 보더 색상 */
    outlineVariant: '#BFC9C1',
    inverseSurface: '#2B322E',
    inverseOnSurface: '#ECF2EC',
    inversePrimary: '#89D6AE',
  },
  dark: {
    primary: '#89D6AE',
    onPrimary: '#003824',
    primaryContainer: '#1E6F4E',
    onPrimaryContainer: '#A0EFC5',
    secondary: '#FFB690',
    onSecondary: '#552100',
    secondaryContainer: '#AD4B00',
    onSecondaryContainer: '#FFE2D5',
    tertiary: '#FFB3B1',
    onTertiary: '#581C1E',
    tertiaryContainer: '#974C4C',
    onTertiaryContainer: '#FFD5D3',
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    background: '#0E1511',
    onBackground: '#DDE4DE',
    surface: '#0E1511',
    surfaceDim: '#0E1511',
    surfaceBright: '#343B36',
    surfaceContainerLowest: '#09100C',
    surfaceContainerLow: '#161D19',
    surfaceContainer: '#1A211D',
    surfaceContainerHigh: '#252B27',
    surfaceContainerHighest: '#303632',
    onSurface: '#DDE4DE',
    surfaceVariant: '#3F4943',
    onSurfaceVariant: '#BFC9C1',
    outline: '#89938B',
    outlineVariant: '#3F4943',
    inverseSurface: '#DDE4DE',
    inverseOnSurface: '#2B322E',
    inversePrimary: '#196B4A',
  },
} as const;

/** 현재 앱 기본 테마 (라이트 모드 중심 설계) */
export const theme = colors.light;

/** `_layout.tsx`에서 로드하는 Google Fonts 패밀리 키 */
export const fontFamilies = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  semiBold: 'NotoSansKR_600SemiBold',
  bold: 'NotoSansKR_700Bold',
  monoMedium: 'RedHatMono_500Medium',
} as const;

/** 텍스트 위계별 타이포그래피 스타일 프리셋 */
export const typography: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: fontFamilies.bold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  displayLgMobile: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  headlineLg: {
    fontFamily: fontFamilies.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  headlineMd: {
    fontFamily: fontFamilies.bold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  titleLg: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.1,
  },
  titleMd: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyLg: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0,
  },
  bodyMd: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelLg: {
    fontFamily: fontFamilies.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelSm: {
    fontFamily: fontFamilies.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  monoMd: {
    fontFamily: fontFamilies.monoMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
};

/** 금액·수량·날짜 열 정렬이 흔들리지 않도록 고정폭 숫자를 적용하는 유틸 스타일 */
export const tabularNums: TextStyle = {
  fontVariant: ['tabular-nums'],
};

/** 4px 기본 단위 배수 기반 여백 토큰 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  section: 40,
  pageMargin: 16,
} as const;

/** 모서리 둥글기(Border Radius) 토큰 */
export const radius = {
  sm: 6,
  default: 10,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
