# 프로젝트 에이전트 지침 (오늘장보기 - Expo / React Native)

이 프로젝트는 **Expo / React Native** 기반 모바일 애플리케이션(**오늘장보기**)입니다. 모바일 우선(Mobile-first) 패턴, 성능, 그리고 Android·iOS·Web 크로스 플랫폼 호환성을 최우선으로 고려합니다.

---

## 프로젝트 진행 내역 및 핸드오프 참조

- 다른 PC나 새 세션에서 작업을 이어받을 때는 반드시 **[`docs/PROGRESS.md`](docs/PROGRESS.md)**를 먼저 읽어 현재 구현 현황, Stitch 기획 연계 정보, 아키텍처 결정 사항, 남은 백로그를 파악합니다.
- 의미 있는 기능 추가·변경이나 단계가 완료되면 `docs/PROGRESS.md`의 진행 내역을 최신 상태로 함께 업데이트합니다.
- 모든 대화, 주석(필요 시), 문서 작성은 **한국어**를 기본으로 하며, 파일 수정·생성 전에는 반드시 구체적인 작업 계획을 제시하고 사용자의 승인을 받은 뒤 진행합니다.

---

## Expo 버전 및 공식 문서 확인 원칙

Expo는 SDK 메이저 릴리스마다 API 변경(이름 변경, 이동, 제거)이 발생하므로, 학습 데이터에만 의존하지 않습니다. Expo, EAS, React Native API를 다루는 코드를 작성하기 전에 아래 절차를 따릅니다.

1. `package.json`에서 `expo` 패키지의 메이저 버전을 확인합니다. (현재: SDK 58)
2. 해당 버전에 맞는 공식 문서를 확인합니다: `https://docs.expo.dev/versions/v<major>.0.0/`
3. 기타 세부 사항은 `https://docs.expo.dev/llms.txt` 인덱스에서 관련 문서 링크를 확인합니다.

---

## 주요 명령어

```bash
npx expo install <package>  # npm/yarn/pnpm/bun add 대신 항상 사용 (SDK 호환 버전 자동 해석)
npx expo start              # 개발 서버 실행 (또는 npm start)
npx expo lint               # 린트 검사
npx tsc --noEmit            # TypeScript 타입 체크
npx expo-doctor             # 의존성 및 설정 진단
npx expo install --fix      # 호환되지 않는 패키지 버전 자동 수정
```

작업을 완료하기 전에는 반드시 타입 체크(`npx tsc --noEmit`) 및 관련 빌드/동작 검증을 수행합니다.

---

## 네비게이션 및 라우팅

- 모든 화면 이동은 **Expo Router**를 사용합니다.
- 라우트 파일은 `src/app/` 하위에 위치하며, `_layout.tsx`가 네비게이터를 정의합니다.
- 화면이 아닌 코드(컴포넌트, 스토어, 유틸, 테마, 타입 등)는 `src/app/` 외부(`src/components/`, `src/store/`, `src/utils/` 등)에 분리합니다.
- `Link`, `router`, `useLocalSearchParams`는 `expo-router`에서 import합니다.

---

## EAS 빌드 안내

로컬 Xcode나 Android Studio 없이 클라우드에서 Android/iOS 앱을 빌드·서명·배포하려면 EAS(`npx eas-cli@latest build`, `submit`, `update`)를 사용합니다.
- 공식 문서: `https://docs.expo.dev/eas/index.md`

---

## 개발 규칙

- `ios/` 및 `android/` 폴더는 CNG(Continuous Native Generation)로 자동 생성되므로 수동으로 생성하거나 직접 편집하지 않습니다. 네이티브 설정은 `app.json`과 config plugin으로 관리합니다.
- Expo Go에는 기본 번들 네이티브 모듈만 포함되어 있으므로, 별도 네이티브 코드가 포함된 라이브러리를 추가할 경우 개발 빌드(`npx expo run:android|ios` 또는 `eas build --profile development`)가 필요합니다.
- 서드파티 라이브러리보다 Expo 공식 권장 모듈을 우선 사용합니다.
- 초기 개발 확인용 샘플 데이터는 `src/data/seedData.ts`에 격리되어 있으므로, 실제 비즈니스 로직과 강하게 결합하지 않도록 유지합니다.
