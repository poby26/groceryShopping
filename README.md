# 오늘장보기 (스마트 장보기 플래너)

장보러 가기 전 구매할 품목과 예상 금액을 정리하고, 마트에서 장을 보며 품목을 체크하고 실제 결제·할인 금액을 기록·관리하는 React Native(Expo) 모바일 앱입니다.

---

## 주요 기능

- **홈 (지출 요약 & 예정된 장보기)**: 주간 / 월간 / 연간 지출 및 할인 절약액 요약, 예정된 장보기 목록 관리
- **장보기 목록 작성 / 수정**: 장보기 이름, 품목명, 예상 단가, 수량 스테퍼 입력 및 총 예상 금액 자동 계산
- **장보기 진행 (실시간 체크 & 정산)**:
  - 품목 체크 시 **구매 금액 확인 모달**에서 실제 판매금액·할인금액·최종 구매금액 기록
  - 장보는 중 즉석 **새 품목 추가 모달** 지원
  - 결제 정산 기록(체크 합계 자동 연동 + 수동 보정 가능) 및 장보기 완료 저장
- **장보기 이력 & 상세**: 전체 / 주간 / 월간 / 연간(월별 집계) 필터 및 영수증 형태의 구매/미구매 품목 상세 내역

---

## 기술 스택

- **프레임워크**: React Native + Expo (SDK 58, TypeScript)
- **라우팅**: Expo Router (`src/app/` 파일 기반 라우팅)
- **상태 관리 & 로컬 저장소**: Zustand + `@react-native-async-storage/async-storage` (기기 내 오프라인 영속화)
- **폰트 & 아이콘**: `@expo-google-fonts/noto-sans-kr`, `@expo-google-fonts/red-hat-mono`, `@expo/vector-icons` (MaterialIcons)
- **웹 미리보기**: `react-native-web`, `react-dom`

---

## 다른 PC에서 프로젝트 이어받기 (설치 및 실행)

### 1. 저장소 복제 및 의존성 설치

```bash
git clone <원격_저장소_URL>
cd groceryShopping
npm install
```

### 2. 개발 서버 실행

```bash
# Expo 개발 서버 실행 (QR 코드로 Expo Go 앱 연결 또는 키보드로 플랫폼 선택)
npm start

# 웹 브라우저에서 바로 확인
npm run web

# Android 에뮬레이터 / 기기 실행
npm run android

# iOS 시뮬레이터 실행 (macOS 환경)
npm run ios
```

> **팁**: 웹 브라우저에서 모바일 비율로 확인하려면 개발자 도구(`F12`)의 모바일 기기 툴바에서 너비를 `390px`로 맞추면 기획 화면과 동일한 비율로 확인할 수 있습니다.

### 3. 타입 체크

```bash
npx tsc --noEmit
```

---

## 디렉터리 구조

```text
groceryShopping/
├── AGENTS.md                        # Antigravity IDE 에이전트 프로젝트 지침 (한국어)
├── README.md                        # 프로젝트 소개 및 실행 가이드
├── app.json                         # Expo 앱 설정 (Android/iOS/Web)
├── docs/
│   └── PROGRESS.md                  # 프로젝트 진행 내역 및 핸드오프 문서
└── src/
    ├── app/                         # Expo Router 화면 라우트
    │   ├── _layout.tsx              # 루트 레이아웃 (폰트 로드, Stack 네비게이터)
    │   ├── (tabs)/
    │   │   ├── _layout.tsx          # 하단 탭 네비게이션 (홈 / 히스토리)
    │   │   ├── index.tsx            # 홈 화면
    │   │   └── history.tsx          # 장보기 이력 화면
    │   ├── create-list.tsx          # 장보기 목록 작성 / 수정 화면
    │   ├── shopping/[id].tsx        # 장보기 진행 화면
    │   └── history/[id].tsx         # 장보기 상세 화면
    ├── components/
    │   ├── ui/                      # 공통 UI 컴포넌트 (Button, Card, InputField 등)
    │   └── shopping/                # 장보기 진행 모달 (구매 금액 확인, 새 품목 입력)
    ├── data/
    │   └── seedData.ts              # 개발 확인용 샘플 데이터 (쉽게 제거 가능)
    ├── store/
    │   └── useGroceryStore.ts       # Zustand + AsyncStorage 상태/영속화 스토어
    ├── theme/
    │   └── tokens.ts                # Stitch 디자인 시스템 토큰
    ├── types/
    │   └── grocery.ts               # 도메인 타입 정의
    └── utils/
        ├── alert.ts                 # 모바일/웹 공용 알림 유틸
        ├── calculations.ts          # 금액·할인·기간별 통계 계산 유틸
        └── format.ts                # 원화·날짜·숫자 포맷팅 유틸
```

---

## 샘플 데이터 제거 방법

초기 동작 확인을 위해 `src/data/seedData.ts`에 예시 데이터가 분리되어 있습니다. 개발 확인 후 샘플 데이터를 완전히 제거하려면 아래 방법 중 하나를 사용하세요.

1. **간편 비활성화**: `src/data/seedData.ts` 상단의 `ENABLE_SEED_DATA = true`를 `false`로 변경
2. **완전 삭제**: `src/data/seedData.ts` 파일을 삭제하고, `src/store/useGroceryStore.ts`에서 `getInitialSeedLists` import를 제거한 뒤 초기 `lists`를 `[]`로 변경

---

## 상세 진행 내역

다른 PC의 Antigravity IDE에서 작업을 이어받을 때는 [`docs/PROGRESS.md`](docs/PROGRESS.md) 문서를 참고해 주세요.
