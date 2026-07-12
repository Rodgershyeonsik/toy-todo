# Focusdo — 작업 시간 트래킹 생산성 툴

> 무언가를 준비하는 상태로 지내고 있을 때, 할 일에 실제로 얼마나 시간을 쓰는지 기록하고 돌아볼 수 있는 툴이 있으면 좋겠다는 생각에서 시작한 프로젝트입니다.
> React 학습을 목적으로 시작해 실사용하며 기능을 발전시키고 있습니다.

**배포 링크**: https://toy-todo-nine.vercel.app  
**개발 기간**: 2026.01 ~ 진행 중

---

## 주요 기능

- **Quick 할 일 추가** — 빠르게 할 일을 등록
- **상세 할 일 추가** — 할 일 이름과 목표 시간을 함께 설정하여 등록
- **작업 시간 스톱워치** — 스톱워치를 실행해 작업 시간 기록
- **작업 시간 타이머** — 타이머를 설정하여 뽀모도로 타이머처럼 활용 가능. 일시정지/정지/종료 시점 소요시간 저장
- **대시보드** — 총 작업 시간, Todo별 작업 시간 랭킹 및 비중을 차트로 시각화
- **Todo 상세 보기 및 수정** — 대시보드에서 항목 클릭 시 상세 정보 확인 및 데이터 수정 가능
- **드래그 앤 드롭 정렬** — Todo 목록을 드래그로 순서 변경 가능
- **주/월/년 통계 분석(업데이트 예정)** — 하루 단위로 작업 시간을 기록·누적해 주·월·년 단위 통계 데이터 제공(로그인 유저 제공 서비스)

---

## 기술 스택

| 분류           | 기술                         |
| -------------- | ---------------------------- |
| Framework      | Next.js, React               |
| Language       | TypeScript                   |
| Styling        | TailwindCSS                  |
| 상태 관리      | Zustand                      |
| 서버 상태 관리 | TanStack Query               |
| ORM            | Prisma                       |
| DB             | Supabase (PostgreSQL)        |
| 인증           | Supabase Auth + Google OAuth |
| 테스트         | Vitest                       |
| 배포           | Vercel                       |

---

## 프로젝트 구조

```
├── api/                      # localStorage 기반 데이터 접근 (비로그인 사용자)
├── actions/                  # Server Actions (로그인 사용자 · DB 접근)
│   ├── todoActions.ts
│   └── dailyLogActions.ts
├── app/                      # Next.js App Router
│   ├── auth/callback/        # OAuth 콜백 처리
│   └── ...
├── components/
│   ├── common/               # 공통 UI 컴포넌트 (Modal 등)
│   └── features/             # 기능별 컴포넌트
│       ├── TaskPlayer/       # 스톱워치/타이머 플레이어
│       ├── Dashboard.tsx     # 소요 시간 랭킹/비중 시각화
│       └── ...
├── hooks/                    # 커스텀 훅 (useTodos, useDailyLogs, useAuth 등)
├── lib/                      # 외부 서비스 연동 클라이언트
│   ├── prisma.ts             # Prisma 클라이언트
│   └── supabase/             # Supabase 클라이언트 (client / server)
├── prisma/                   # DB 스키마 (Todo, DailyLog, User)
├── store/                    # Zustand 전역 상태 (todo / user / modal)
├── types/                    # TypeScript 타입 정의
├── utils/                    # 유틸리티 함수 (시간 포맷/계산 등)
└── constants/                # 상수 정의
```

---

## 주요 구현 내용

- **컴포넌트 분리 기준**: 코드 가독성과 재사용성을 기준으로 독립적으로 동작 가능한 단위로 분리
- **스톱워치 / 타이머 구현**: `Date.now()` 기준 경과 시간 측정으로 `setInterval`의 누적 오차를 보정하고, 종료/일시정지 시점에 소요 시간을 자동 저장
- **클라이언트 상태 관리 (Zustand)**: 타이머 상태·선택된 Todo·모달 등 여러 컴포넌트가 공유하는 UI 상태에서 Props drilling을 해결하기 위해 Zustand를 도입, 전역 상태를 분리해 컴포넌트 간 의존도를 낮추고 낙관적 업데이트 시 화면에 즉시 반영되는 기준 상태로 활용
- **서버 상태 관리 (TanStack Query)**: 서버 상태를 캐싱·동기화 관점에서 분리해 관리
  - **초기**: 실제 백엔드가 없던 단계에서 TanStack Query 패턴을 학습하기 위해, LocalStorage 접근 로직을 의도적으로 api 레이어로 추상화하고 useQuery/useMutation에 연결 — 향후 실제 API로 교체하기 쉬운 구조를 목표로 설계
  - **현재**: 통계 기능을 위해 실제 서버 통신을 하는 server actions를 구현하고, queryFn/mutationFn을 LocalStorage 함수에서 server actions로 교체 — user 유무에 따라 데이터 소스만 스왑하고 훅 인터페이스는 그대로 유지. 초기의 추상화 설계가 실제 백엔드 전환 비용을 낮췄음을 검증
- **유저 인증 (Supabase Auth + Google OAuth)**: 클라이언트에서 `onAuthStateChange`로 세션 변화를 구독하고, 전역 `user` 상태(Zustand)에 반영. 모든 DB 접근 서버 액션은 `supabase.auth.getUser()`로 사용자를 재확인, 본인 소유 데이터만 접근/수정하도록 `userId` 조건과 소유권 체크(`Forbidden`)를 둠
- **이중 저장 구조**: 로그인 상태를 단일 분기점으로, 비로그인=localStorage / 로그인=DB로 읽기·쓰기 경로를 분기
- **통계용 데이터 모델링**: "todo × 하루" 단위의 `DailyLog`로 날짜 기반 집계의 토대 마련

---

## 테스트

- **도구 선택**: 프로젝트가 TS + ESM 구성이라 설정이 간단하고, Jest와 API가 호환되는 Vitest를 선택
- **테스트 대상**: 시간 포맷팅(`formatTime`), 완료율 계산(`getCompletionRate`) 등 입출력이 명확한 순수 함수부터 시작
- **환경 구성**: 현재는 순수 함수를 node 환경에서 테스트하며, 컴포넌트 테스트는 파일 단위 jsdom 환경으로 확장 예정

### 실행 방법

```bash
npm test          # watch 모드 (개발 중 파일 저장 시 자동 재실행)
npm run test:run  # 1회 실행 (CI/커밋 전 검사용)
```
