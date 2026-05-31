# Focusdo — 작업 시간 트래킹 생산성 툴

> 무언가를 준비하는 상태로 지내고 있을 때, 할 일에 실제로 얼마나 시간을 쓰는지 기록하고 돌아볼 수 있는 툴이 있으면 좋겠다는 생각에서 시작한 프로젝트입니다.
> React 학습을 목적으로 시작했지만, 직접 실사용하며 기능을 발전시키고 있습니다.

**배포 링크**: https://toy-todo-nine.vercel.app/  
**개발 기간**: 2026.01 ~ 진행 중

---

## 주요 기능

- **Quick 할 일 추가** — 빠르게 할 일을 등록
- **상세 할 일 추가** — 할 일 이름과 목표 시간을 함께 설정
- **작업 시간 스톱워치** — 할 일을 선택, 스톱워치를 실행해 소요 시간 기록
- **작업 시간 타이머** — 할 일을 선택, 타이머를 설정하여 뽀모도로 타이머처럼 활용 가능.(일시정지/종료 시점 소요시간 자동 기록)
- **대시보드** — Todo별 소요 시간 랭킹 및 비중을 차트로 시각화
- **Todo 상세 보기 및 수정** — 대시보드에서 항목 클릭 시 상세 정보 확인 및 데이터 수정 가능
- **드래그 앤 드롭 정렬** — Todo 목록을 드래그로 순서 변경 가능
- 데이터는 브라우저 LocalStorage에 저장

---

## 기술 스택

| 분류           | 기술              |
| -------------- | ----------------- |
| Framework      | Next.js, React    |
| Language       | TypeScript        |
| Styling        | TailwindCSS       |
| 상태 관리      | Zustand           |
| 서버 상태 관리 | TanStack Query    |
| DB             | Supabase (도입중) |
| 배포           | Vercel            |

---

## 프로젝트 구조

```
├── api/          # LocalStorage 기반 API 레이어 (TanStack Query 연동)
├── app/          # Next.js App Router 페이지
├── components/   # UI 컴포넌트
├── hooks/        # 커스텀 훅
├── store/        # Zustand 전역 상태
├── types/        # TypeScript 타입 정의
├── utils/        # 유틸리티 함수
└── constants/    # 상수 정의
```

---

## 주요 구현 내용

- **컴포넌트 분리 기준**: 코드 가독성과 재사용성을 기준으로 독립적으로 동작 가능한 단위로 분리
- **상태 관리 구조**: Props drilling 문제를 Zustand로 해소, TanStack Query 도입을 위해 LocalStorage 호출을 API 레이어로 분리
- **TanStack Query 도입**: LocalStorage 호출을 API 함수로 추상화하고, `useQuery` / `useMutation`을 적용해 데이터 페칭 구조 학습
- **타이머 구현**: `setInterval` 기반의 작업 시간 측정 로직 구현
