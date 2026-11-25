# 📋 [오늘장보기] 프로젝트 인수인계 및 진행 내역 지침서 (PROGRESS.md)

> **문서 버전**: v1.0.0  
> **최종 갱신일**: 2026년 11월 25일  
> **프로젝트 경로**: `c:\dev\workspace\groceryShopping`  
> **Git 원격 저장소**: `https://github.com/poby26/groceryShopping.git` (기본 브랜치: `master`, 로그인 계정: `poby26`)  
> **문서 목적**: 사무실, 자택 등 서로 다른 PC의 **Antigravity 에이전트**가 프로젝트 컨텍스트를 즉시 100% 복원하여 끊김 없이 작업을 이어가도록 안내하며, **사용자**가 프로젝트 진행 현황과 아키텍처를 한눈에 확인할 수 있도록 지원합니다.

---

## 📌 1. 프로젝트 개요 (Project Overview)

- **앱 명칭**: **오늘장보기 (스마트 장보기 플래너)**
- **서비스 성격**: 장보러 가기 전 구매할 품목과 예상 금액을 정리하고, 마트에서 실시간으로 품목을 체크하며 실제 판매가·할인가·결제 금액을 기록·관리하는 React Native(Expo) 모바일 앱 (Android / iOS / Web 크로스 플랫폼 지원)
- **기술 스택**:
  - **Core**: Expo SDK 58 (`~58.0.26`), React 19.3, React Native 0.88.1, TypeScript `~6.0.3`
  - **Navigation**: Expo Router (`~58.0.32`) + 중앙 흐름·탭 관리 모듈(`src/navigation/`)
  - **State & Storage**: Zustand (`^5.1.0`) + `@react-native-async-storage/async-storage` (`2.2.0`)
  - **Typography & Icons**: `@expo-google-fonts/noto-sans-kr`, `@expo-google-fonts/red-hat-mono`, `@expo/vector-icons` (MaterialIcons)
  - **Web Support**: `react-native-web`, `react-dom` (Metro 번들러 기반 웹 실행 지원)
- **개발 디렉터리 구조**:
  ```text
  groceryShopping/
  ├── AGENTS.md                            # Antigravity 에이전트 프로젝트 규칙 (한국어)
  ├── README.md                            # 프로젝트 소개 및 설치/실행 가이드
  ├── app.json                             # Expo 앱 설정 (오늘장보기, Android/iOS/Web)
  ├── package.json                         # 의존성 및 실행 스크립트 (main: expo-router/entry)
  ├── docs/
  │   └── PROGRESS.md                      # [본 문서] 프로젝트 인수인계 및 진행 내역서
  └── src/
      ├── navigation/                      # 프로그램 흐름 및 탭·라우트 중앙 관리
      │   ├── routes.ts                    # ROUTES 상수 및 TAB_ITEMS(홈/히스토리) 정의
      │   └── useAppFlow.ts                # 화면 전환·탭 이동·장보기 시작/완료 흐름 제어 훅
      ├── app/                             # Expo Router 화면 라우트 (UI 렌더링 전담)
      │   ├── index.tsx                    # 루트('/') 진입 → ROUTES.HOME('/tabs') 리다이렉트
      │   ├── _layout.tsx                  # 루트 레이아웃 (폰트 로드, SplashScreen, Stack 정의)
      │   ├── tabs/                        # 하단 탭 그룹
      │   │   ├── _layout.tsx              # TAB_ITEMS 기반 하단 탭 바 구성
      │   │   ├── index.tsx                # 홈 화면 (지출 요약, 새 장보기 작성, 예정 목록)
      │   │   └── history.tsx              # 장보기 이력 화면 (전체/주간/월간/연간 필터)
      │   ├── create-list.tsx              # 장보기 목록 작성 / 수정 화면
      │   ├── shopping/[id].tsx            # 장보기 진행 화면 (체크리스트, 정산 기록)
      │   └── history/[id].tsx             # 장보기 상세 영수증 화면
      ├── components/
      │   ├── ui/                          # 공통 UI 컴포넌트 (Button, Card, InputField, SegmentedTabs, AppHeader)
      │   └── shopping/                    # 장보기 진행 모달 (ItemPriceModal, AddItemModal)
      ├── data/
      │   └── seedData.ts                  # 개발 확인용 샘플 데이터 (배포 전 제거 예정, 격리 관리)
      ├── store/
      │   └── useGroceryStore.ts           # Zustand + AsyncStorage 영속화 스토어
      ├── theme/
      │   └── tokens.ts                    # Stitch 디자인 시스템 토큰 (컬러, 타이포, 간격, 라운드)
      ├── types/
      │   └── grocery.ts                   # 도메인 모델 (ShoppingList, ShoppingItem, 통계 인터페이스)
      └── utils/
          ├── alert.ts                     # 모바일(Alert.alert) / 웹(window.alert·confirm) 공용 알림 유틸
          ├── calculations.ts              # 예상/실제 금액, 체크 합계, 주간/월간/연간 통계 계산
          └── format.ts                    # 원화, 할인, 한국어 날짜/시간, 숫자 파싱 유틸
  ```

---

## 🎨 1-1. 화면 기획 및 UI 생성 파이프라인 (Google Stitch & MCP Workflow)

본 프로젝트는 기획부터 컴포넌트 설계, 화면 구현까지 **Google Stitch**와 **MCP(Model Context Protocol)** 연동을 기반으로 구축되었습니다.

- **Stitch 프로젝트**: `스마트 장보기 플래너` (`projects/1286837208810951354`)
- **디자인 시스템**: `오늘장보기 - Design System` (`assets/canvas_node_node_16672908794440105585`)
  - **디자인 스타일**: *Modern Utility + Warm Botanical Minimalism* (라이트 모드 중심, 그림자/블러 없이 톤 계층 + 1px 저대비 외곽선)
  - **핵심 컬러**: Primary `#005639` (보태니컬 그린), Secondary `#9E4300` (테라코타 오렌지), Surface `#F4FBF4`, Surface Lowest `#FFFFFF`, Outline Variant `#BFC9C1`
  - **타이포그래피**: `Noto Sans KR` (기본) + `Red Hat Mono` (보조 수치), 모든 금액·수량·날짜에 `tabular-nums` 적용
- **Stitch 화면 ↔ 앱 라우트 매핑 (5개 화면 + 2개 모달)**:

| Stitch 화면명 | Screen ID | 앱 라우트 파일 | 주요 역할 |
| :--- | :--- | :--- | :--- |
| `홈 - 오늘장보기` | `node_15236273331104572632` | [`src/app/tabs/index.tsx`](file:///c:/dev/workspace/groceryShopping/src/app/tabs/index.tsx) | 주간/월간/연간 요약, 새 장보기 작성, 예정 목록 |
| `장보기 목록 작성` | `node_12967649652847261007` | [`src/app/create-list.tsx`](file:///c:/dev/workspace/groceryShopping/src/app/create-list.tsx) | 장보기 이름, 품목 추가/삭제, 예상 총액 |
| `장보기 진행` | `node_8595984325034494641` | [`src/app/shopping/[id].tsx`](file:///c:/dev/workspace/groceryShopping/src/app/shopping/[id].tsx) | 체크리스트, 실구매가/새 품목 모달, 결제 정산 |
| `장보기 이력` | `node_11714906081935503311` | [`src/app/tabs/history.tsx`](file:///c:/dev/workspace/groceryShopping/src/app/tabs/history.tsx) | 전체/주간/월간/연간(월별) 완료 이력 조회 |
| `장보기 상세` | `node_1249847352511554731` | [`src/app/history/[id].tsx`](file:///c:/dev/workspace/groceryShopping/src/app/history/[id].tsx) | 영수증 요약 및 구매/미구매 품목 상세 |

- **향후 신규 화면 추가 및 디자인 수정 시 표준 워크플로우**:
  1. Google Stitch에서 화면/컴포넌트 기획 및 디자인 스펙 확인 (MCP `get_screen`, `download_file` 활용)
  2. [`src/theme/tokens.ts`](file:///c:/dev/workspace/groceryShopping/src/theme/tokens.ts) 토큰과 [`src/components/ui/`](file:///c:/dev/workspace/groceryShopping/src/components/ui) 공통 컴포넌트를 우선 재사용하여 구현
  3. 화면 이동은 반드시 [`src/navigation/routes.ts`](file:///c:/dev/workspace/groceryShopping/src/navigation/routes.ts) 및 [`src/navigation/useAppFlow.ts`](file:///c:/dev/workspace/groceryShopping/src/navigation/useAppFlow.ts)를 통해 연결
  4. `npx tsc --noEmit` 및 웹/모바일 번들 빌드 검증 후 `docs/PROGRESS.md` 갱신

---

## 🚨 2. 에이전트 핵심 행동 수칙 (Agent Core Rules)

다른 PC의 Antigravity 에이전트는 작업을 시작할 때 **다음 규칙을 반드시 준수**해야 합니다:

1. **사전 계획 제시 및 사용자 승인 필수 (Work Protocol & Planning)**
   - 실제 파일 수정이나 코드 변경에 착수하기 전에, **어떻게 작업을 진행할 것인지에 대한 구체적인 계획을 먼저 한국어로 제시**하고 사용자의 확인 및 승인을 받은 뒤에 진행합니다.
2. **기본 언어는 한국어 유지 (Language & Communication)**
   - 모든 대화, 설명, 코드 주석, 문서는 **한국어(Korean)**를 기본으로 유지합니다.
3. **중앙 흐름 및 라우팅 원칙 준수**
   - 화면 컴포넌트 내부에서 `useRouter()`나 경로 문자열(`'/tabs/...'`)을 직접 호출하지 않고, 반드시 [`useAppFlow`](file:///c:/dev/workspace/groceryShopping/src/navigation/useAppFlow.ts)를 통해 화면 전환 및 탭 이동을 처리합니다.
4. **Expo 공식 권장 방식 및 샘플 데이터 격리 유지**
   - 패키지 추가 시 `npx expo install <package>`를 사용하며, `ios/`·`android/` 폴더를 수동 생성하지 않습니다.
   - [`src/data/seedData.ts`](file:///c:/dev/workspace/groceryShopping/src/data/seedData.ts)의 샘플 데이터는 비즈니스 로직과 결합하지 않고 격리 상태를 유지합니다.
5. **작업 완료 전 타입 및 빌드 검증 필수**
   - 코드 변경 후에는 반드시 `npx tsc --noEmit` 및 관련 번들(`web` / `android`) 검증을 수행해 오류가 0건임을 확인합니다.

---

## ⚙️ 3. 핵심 아키텍처 및 기술 규격 (Architecture & Decisions)

| 영역 | 구현 방식 및 설계 의도 | 관련 파일 |
| :--- | :--- | :--- |
| **중앙 흐름 & 탭 관리** | `ROUTES` 상수와 `TAB_ITEMS` 배열을 분리하고, `useAppFlow()` 훅이 탭 전환(`switchTab`, `goHomeTab`, `goHistoryTab`)과 주요 흐름(`startShoppingFlow`, `completeShoppingFlow`)을 전담 | [`routes.ts`](file:///c:/dev/workspace/groceryShopping/src/navigation/routes.ts), [`useAppFlow.ts`](file:///c:/dev/workspace/groceryShopping/src/navigation/useAppFlow.ts) |
| **로컬 저장소 영속화** | 서버 동기화 전 단계로 기기 내 오프라인 동작을 보장하기 위해 `Zustand` + `AsyncStorage` (`oneul-jangbogi-storage-v1`) 적용 | [`useGroceryStore.ts`](file:///c:/dev/workspace/groceryShopping/src/store/useGroceryStore.ts) |
| **정산 & 통계 계산** | 주간(월요일 00:00 시작)·월간·연간 기간 판정, 체크 품목 합산, 전월 대비 증감, 최다 방문 장소, 연간 월별 그룹핑을 순수 함수로 분리 | [`calculations.ts`](file:///c:/dev/workspace/groceryShopping/src/utils/calculations.ts) |
| **모바일 / 웹 Alert 호환** | `react-native-web`에서 `Alert.alert`가 동작하지 않는 문제를 해결하기 위해 `Platform.OS === 'web'`일 때 `window.alert`/`window.confirm`으로 자동 분기 | [`alert.ts`](file:///c:/dev/workspace/groceryShopping/src/utils/alert.ts) |
| **샘플 데이터 격리** | 초기 확인용 예시 데이터(`ENABLE_SEED_DATA = true`)를 단일 파일로 격리. 제거 시 플래그를 `false`로 바꾸거나 파일 삭제 후 스토어 초기값을 `[]`로 변경 | [`seedData.ts`](file:///c:/dev/workspace/groceryShopping/src/data/seedData.ts) |

---

## 🏆 4. 현재까지 완료된 작업 상세 내역 (Completed Progress)

### ✅ [1단계] Stitch MCP 분석 및 Expo TypeScript 프로젝트 초기 세팅 완료
- Stitch MCP로 `스마트 장보기 플래너` 디자인 시스템 및 5개 화면 스펙을 추출·분석했습니다.
- Expo SDK 58 (`blank-typescript`) 템플릿 초기화 후 `expo-router`, `zustand`, `@react-native-async-storage/async-storage`, `@expo/vector-icons`, `@expo-google-fonts/noto-sans-kr`, `@expo-google-fonts/red-hat-mono`를 설치했습니다.
- [`app.json`](file:///c:/dev/workspace/groceryShopping/app.json)에 앱명(`오늘장보기`), Android/iOS 패키지 식별자(`com.oneuljangbogi.app`), 라이트 모드 배경색(`#F4FBF4`)을 설정했습니다.

### ✅ [2단계] 디자인 시스템 토큰 및 공통 UI 컴포넌트 5종 구축 완료
- [`src/theme/tokens.ts`](file:///c:/dev/workspace/groceryShopping/src/theme/tokens.ts)에 Stitch 컬러, `Noto Sans KR`/`Red Hat Mono` 타이포그래피, `tabular-nums`, 4px 배수 `spacing`, `radius` 토큰을 구축했습니다.
- 공통 UI 컴포넌트 [`Button.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/ui/Button.tsx), [`Card.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/ui/Card.tsx), [`InputField.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/ui/InputField.tsx), [`SegmentedTabs.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/ui/SegmentedTabs.tsx), [`AppHeader.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/ui/AppHeader.tsx)를 구현했습니다.

### ✅ [3단계] 도메인 모델, 로컬 저장소, 정산·통계 로직 및 샘플 데이터 구축 완료
- [`src/types/grocery.ts`](file:///c:/dev/workspace/groceryShopping/src/types/grocery.ts)에 `draft` → `ready` → `shopping` → `completed` 상태 모델과 통계 인터페이스를 정의했습니다.
- [`src/store/useGroceryStore.ts`](file:///c:/dev/workspace/groceryShopping/src/store/useGroceryStore.ts)에 목록 CRUD, 품목 추가, 실구매가 확정, 체크 해제, 정산 완료 및 `AsyncStorage` 영속화를 구현했습니다.
- [`src/utils/calculations.ts`](file:///c:/dev/workspace/groceryShopping/src/utils/calculations.ts) 및 [`src/utils/format.ts`](file:///c:/dev/workspace/groceryShopping/src/utils/format.ts)를 구현하고 단위 로직 검증을 통과했습니다.
- [`src/data/seedData.ts`](file:///c:/dev/workspace/groceryShopping/src/data/seedData.ts)에 격리된 초기 샘플 데이터를 적용했습니다.

### ✅ [4단계] 5개 핵심 화면 + 2개 모달 구현 완료
- **홈 / 이력 / 목록 작성·수정 / 장보기 진행 / 장보기 상세** 5개 화면을 구현했습니다.
- 장보기 진행 중 사용하는 [`ItemPriceModal.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/shopping/ItemPriceModal.tsx)(실제 판매가·할인가 입력 시 최종 구매가 자동 계산) 및 [`AddItemModal.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/shopping/AddItemModal.tsx)(즉석 품목 추가)를 구현했습니다.

### ✅ [5단계] 웹 브라우저 실행 지원 및 크로스 플랫폼 알림 보완 완료
- `react-native-web`, `react-dom`을 설치하고 [`app.json`](file:///c:/dev/workspace/groceryShopping/app.json)에 `"bundler": "metro"`를 추가하여 `npm run web` 실행 문제를 해결했습니다.
- [`src/utils/alert.ts`](file:///c:/dev/workspace/groceryShopping/src/utils/alert.ts)를 도입해 웹에서도 확인/안내 다이얼로그가 정상 동작하도록 보완했습니다.

### ✅ [6단계] 메인 흐름·탭 관리 모듈 분리 및 `(tabs)` → `tabs` 구조 개편 완료
- [`src/navigation/routes.ts`](file:///c:/dev/workspace/groceryShopping/src/navigation/routes.ts)와 [`src/navigation/useAppFlow.ts`](file:///c:/dev/workspace/groceryShopping/src/navigation/useAppFlow.ts)를 신설하여 화면 전환과 탭 이동을 중앙에서 관리하도록 리팩토링했습니다.
- `src/app/(tabs)` 폴더를 `src/app/tabs`로 변경하고, 루트 진입점 [`src/app/index.tsx`](file:///c:/dev/workspace/groceryShopping/src/app/index.tsx)(`<Redirect href={ROUTES.HOME} />`)를 추가했습니다.

### ✅ [7단계] 전체 소스 파일(24개) 한국어 상세 주석 작성 및 빌드 검증 완료
- `src/` 하위 전체 24개 파일에 파일 상단 `@file`/`@description`, JSDoc, 핵심 비즈니스 로직 인라인 주석을 한국어로 작성했습니다.
- `npx tsc --noEmit` (타입 에러 0건), `npx expo export --platform web` (933 modules), `npx expo export --platform android` (1,259 modules) 모두 정상 통과를 확인했습니다.

### ✅ [8단계] 모바일 가독성 개선을 위한 전역 글자 크기 상향 완료
- [`src/theme/tokens.ts`](file:///c:/dev/workspace/groceryShopping/src/theme/tokens.ts)의 `typography` 전체 토큰을 상향하여 최소 글자 크기를 `14px` 이상(`labelSm` 14px, `bodyMd`/`labelLg` 16px, `bodyLg` 17px, `titleMd` 18px, `titleLg` 20px, `headlineMd` 22px, `displayLgMobile` 32px)으로 키웠습니다.
- 커진 폰트에 맞춰 하단 탭 바([`tabs/_layout.tsx`](file:///c:/dev/workspace/groceryShopping/src/app/tabs/_layout.tsx), 라벨 13px / 높이 68px), [`Button.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/ui/Button.tsx), [`InputField.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/ui/InputField.tsx), [`SegmentedTabs.tsx`](file:///c:/dev/workspace/groceryShopping/src/components/ui/SegmentedTabs.tsx)의 최소 높이를 함께 보정했습니다.

---

## 🚀 5. 앞으로 남은 작업 로드맵 (Upcoming Roadmap)

사용자와 합의된 다음 우선순위 작업입니다. **에이전트는 작업 착수 전 반드시 사전 계획을 제시하고 승인을 받은 뒤 진행**해야 합니다.

### 🎯 [1순위] 실사용 UI/UX 점검 및 목록·이력 관리 기능 보완
- 웹(`npm run web`) 및 모바일(Expo Go) 실화면 테스트 결과에 따른 여백·폰트·인터랙션 디테일 조정
- 예정된 장보기 목록 **삭제 기능** 추가 (현재 스토어 `deleteList` 액션은 구현되어 있으며 UI 버튼 연결 필요)
- 완료된 장보기 이력 **삭제** 또는 **"다시 장보기(목록 복제)"** 편의 기능 검토

### 🎯 [2순위] 샘플 데이터(`seedData.ts`) 완전 제거
- 기능 동작 검증이 끝난 뒤 [`src/data/seedData.ts`](file:///c:/dev/workspace/groceryShopping/src/data/seedData.ts)를 제거(또는 `ENABLE_SEED_DATA = false`)하고, 최초 빈 상태(Empty State) UX 점검

### 🎯 [3순위] Android / iOS 실기기 테스트 및 배포 빌드 준비
- `assets/` 내 공식 앱 아이콘(`icon.png`, `android-icon-*`) 및 스플래시 이미지 커스터마이징
- `eas.json` 구성 및 EAS Build(`npx eas-cli@latest build`)를 통한 Android APK/AAB·iOS 빌드 검증

### 🎯 [4순위] 서버/클라우드 동기화 기능 검토 (추후 과제)
- 기기 간 장보기 목록·지출 이력 동기화 및 백업이 필요해질 경우 백엔드 API 또는 클라우드 DB 연동 설계

---

## 🛠️ 6. 개발 환경 구동 및 빌드 검증 가이드

### 1) 다른 PC에서 초기 세팅
```bash
git clone https://github.com/poby26/groceryShopping.git
cd groceryShopping
npm install
```

### 2) 개발 서버 실행
```bash
# Expo 개발 서버 실행 (Expo Go QR 스캔 또는 플랫폼 선택)
npm start

# 웹 브라우저에서 바로 확인 (개발자 도구 F12 → 390px 모바일 뷰 권장)
npm run web

# Android / iOS 실행
npm run android
npm run ios
```

### 3) 타입 체크 및 번들 검증 (작업 완료 시 필수)
```bash
npx tsc --noEmit
npx expo export --platform web --output-dir .expo-verify-web
npx expo export --platform android --output-dir .expo-verify-and
```

### 4) Git 작업 흐름
```bash
git status
git add -A
git commit -m "feat: [작업 요약 내용 기술]"
git push origin master
```

---

## 💡 7. 다른 PC의 안티그래비티 에이전트 작업 시작 프롬프트 예시

새로운 PC에서 작업을 이어갈 때, 아래와 같이 에이전트에게 요청하면 맥락을 즉시 복원해 작업을 이어갈 수 있습니다:

> *"저장소의 `docs/PROGRESS.md`와 `AGENTS.md`를 먼저 읽고 현재 프로젝트 구조와 진행 내역을 파악한 뒤, 다음 작업(예: 예정된 장보기 삭제 기능 추가 / UI 수정 / 샘플 데이터 제거)에 대한 구체적인 작업 계획을 한국어로 제시해줘."*
