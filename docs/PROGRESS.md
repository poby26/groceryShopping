# 프로젝트 진행 내역 및 핸드오프 문서 (오늘장보기)

> **문서 목적**: 다른 PC의 Antigravity IDE에서 Git 저장소를 복제(clone)한 뒤, 이전 작업 맥락·기획 연계 정보·구현 현황·남은 과제를 즉시 파악하고 이어서 개발하기 위한 기준 문서입니다.
>
> **최종 업데이트**: 2026-11-25

---

## 1. 프로젝트 개요 및 기획 연계 (Stitch MCP)

- **앱 이름**: `오늘장보기` (Stitch 프로젝트명: `스마트 장보기 플래너`)
- **목표**: 장보러 가기 전 구매 목록과 예상 금액을 작성하고, 마트에서 실시간으로 품목을 체크하며 실제 판매가·할인가·결제 금액을 기록/관리하는 Android·iOS용 React Native 모바일 앱
- **Stitch 프로젝트 연계 정보**:
  - **Project ID**: `projects/1286837208810951354`
  - **디자인 시스템**: `오늘장보기 - Design System` (`assets/canvas_node_node_16672908794440105585`)
  - **화면 매핑 (총 5개 화면)**:
    1. `홈 - 오늘장보기` (`node_15236273331104572632`) → `src/app/(tabs)/index.tsx`
    2. `장보기 목록 작성` (`node_12967649652847261007`) → `src/app/create-list.tsx`
    3. `장보기 진행` (`node_8595984325034494641`) → `src/app/shopping/[id].tsx`
    4. `장보기 이력` (`node_11714906081935503311`) → `src/app/(tabs)/history.tsx`
    5. `장보기 상세` (`node_1249847352511554731`) → `src/app/history/[id].tsx`

---

## 2. 주요 설계 및 아키텍처 결정 사항

1. **프레임워크**: **Expo (SDK 58) + React Native + TypeScript + Expo Router**
   - 추후 Android APK/AAB 및 iOS IPA 배포 시 EAS Build 또는 `expo prebuild`로 확장 예정
   - 웹 브라우저 테스트를 위해 `react-native-web`, `react-dom` 및 `app.json` 내 `web.bundler: "metro"` 설정 완료
2. **디자인 시스템 1:1 이식 (`src/theme/tokens.ts`)**:
   - 스타일: Modern Utility + Warm Botanical Minimalism (라이트 모드 중심, 그림자/블러 대신 톤 계층 + 1px 외곽선)
   - 주요 컬러: Primary `#005639` (보태니컬 그린), Secondary `#9E4300` (테라코타 오렌지), Background `#F4FBF4`, Surface Lowest `#FFFFFF`, Outline Variant `#BFC9C1`
   - 폰트: `Noto Sans KR` (기본), `Red Hat Mono` (보조 수치), 금액·수량·날짜에 `tabular-nums` 적용
3. **데이터 저장 방식**:
   - 기기 내 **로컬 저장소(`AsyncStorage`) + `Zustand` (`persist` 미들웨어)** 사용 (`oneul-jangbogi-storage-v1`)
   - 서버 동기화 기능은 추후 별도 검토 예정
4. **샘플 데이터 격리 정책 (`src/data/seedData.ts`)**:
   - 초기 동작 확인용 샘플 데이터는 단일 파일(`src/data/seedData.ts`)과 단일 플래그(`ENABLE_SEED_DATA = true`)로 격리함
   - 개발 진행 상태 확인 후 최종 배포 전 **완전 제거 예정**
5. **모바일/웹 호환 처리 (`src/utils/alert.ts`)**:
   - `react-native-web`에서 `Alert.alert`가 동작하지 않는 문제를 해결하기 위해 `showAlert`, `showConfirm` 유틸로 플랫폼 분기 처리

---

## 3. 현재까지 완료된 작업 (완료 체크리스트)

- [x] Stitch MCP 연동 확인 및 `스마트 장보기 플래너` 디자인 시스템/5개 화면 상세 분석
- [x] Expo SDK 58 TypeScript 프로젝트 초기화 및 Expo Router 설정 (`app.json`, `package.json`)
- [x] 디자인 토큰(`src/theme/tokens.ts`) 및 공통 UI 컴포넌트 5종 구축 (`Button`, `Card`, `InputField`, `SegmentedTabs`, `AppHeader`)
- [x] 도메인 모델(`src/types/grocery.ts`), 로컬 저장소 스토어(`src/store/useGroceryStore.ts`), 정산·기간별 통계 계산(`src/utils/calculations.ts`), 포맷팅(`src/utils/format.ts`) 구현
- [x] 격리된 초기 샘플 데이터(`src/data/seedData.ts`) 적용
- [x] 5개 핵심 화면 + 2개 모달(`ItemPriceModal`, `AddItemModal`) 구현 완료
- [x] 웹 실행 지원 패키지(`react-native-web`, `react-dom`) 설치 및 웹 호환 알림 처리
- [x] 검증 완료:
  - `npx tsc --noEmit` (타입 에러 0건)
  - 정산·기간별 집계·포맷팅 단위 로직 검증 통과
  - `npx expo export --platform android` (Android Hermes 번들 정상 빌드)
  - `npx expo export --platform web` (웹 번들 정상 빌드)

---

## 4. 앞으로 진행할 작업 (백로그 / 다음 단계)

- [ ] **UI/UX 실사용 점검 및 피드백 반영**: 웹 및 모바일(Expo Go)에서 전체 흐름(작성 → 장보기 진행 → 완료 → 이력/상세) 확인 후 디테일 보완
- [ ] **추가 편의 기능 검토**:
  - 예정된 장보기 삭제 기능
  - 완료된 장보기 이력 삭제/수정 또는 "다시 장보기(복제)" 기능
  - 품목 카테고리/정렬 또는 자주 사는 품목 자동완성
- [ ] **샘플 데이터 완전 제거**: 기능 확인 완료 후 `src/data/seedData.ts` 제거 및 빈 상태 UX 점검
- [ ] **Android / iOS 앱 빌드 준비**: 앱 아이콘·스플래시 이미지 커스터마이징, 실기기 테스트, EAS Build 프로필(`eas.json`) 구성
- [ ] **추후 검토 과제**: 서버/클라우드 동기화 및 백업 기능 도입 여부 결정

---

## 5. 다른 PC의 Antigravity IDE에서 이어서 작업하는 방법

1. Git 저장소를 복제하고 `npm install`을 실행합니다.
2. Antigravity IDE에서 이 워크스페이스를 열면 `AGENTS.md` 규칙에 따라 에이전트가 자동으로 프로젝트 규칙과 본 문서를 참조합니다.
3. 새 대화를 시작할 때 아래와 같이 요청하시면 바로 이어서 작업할 수 있습니다:
   > "`docs/PROGRESS.md`를 확인하고 현재 진행 상태를 파악한 뒤, 다음 작업(예: UI 수정 / 기능 추가 / 샘플 데이터 제거)을 진행하자."
