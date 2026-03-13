# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # 프론트(Vite :5173) + 프록시 서버(Express :3001) 동시 실행
npm run build     # 타입 체크 후 프로덕션 빌드
npm run server    # 프록시 서버만 단독 실행
```

타입 체크만 실행:
```bash
npx tsc -p tsconfig.app.json --noEmit   # 프론트엔드
npx tsc -p tsconfig.node.json --noEmit  # 서버
```

## Architecture

**BFF 프록시 패턴**: 브라우저는 `hospitalId`만 전송 → `server/proxy.ts`(포트 3001)가 DB 자격증명을 페이로드에 조합하여 실제 API(`http://localhost:3000/insert/all`)로 포워딩. DB 크리덴셜은 프론트에 절대 노출되지 않는다.

**Vite dev proxy**: `/api/*` 요청은 Vite가 자동으로 `:3001`로 프록시(`vite.config.ts`). 프로덕션에서는 별도 리버스 프록시 설정 필요.

**상태 머신** (`src/hooks/useMigration.ts`):
- `idle → running → success | error`
- API 호출과 UI 시뮬레이션이 병렬로 진행됨. API 응답 전까지 2.5초 간격으로 단계를 하나씩 진행, API가 먼저 끝나면 남은 단계를 0.4초씩 빠르게 마무리.
- `stepTimerRef.current === null` 체크로 "시뮬레이션 완료 후 API 미완료" 상태를 감지.

**이관 단계 순서** (`STEP_LABELS` in `useMigration.ts`): 처방 → 의약품·재료 → 용법 코드 → 템플릿 코드 → 묶음 항목 → 묶음 항목 상세 → 환자 → 접수 → 예약 → 상병 → 오더 → 활력징후 → 수납·정산·결제 (총 13단계, 실제 API `insertTasks` 순서와 동일)

**API 페이로드** (`server/proxy.ts`): source/target DB 정보는 코드에 하드코딩되어 있음. `hospitalId`는 `Number()`로 변환하여 전송.

## Key Conventions

- Tailwind v4: `@import "tailwindcss"` 사용 (`src/index.css`). `@tailwind base/components/utilities` 구문 사용 불가.
- 폰트: 한국어 UI → `Noto Sans KR`, ID/기술값 → `DM Mono` (index.html에서 Google Fonts 로드).
- 인라인 스타일과 Tailwind 혼용: 동적 색상·그림자·그라디언트는 인라인 스타일, 레이아웃·간격은 Tailwind 클래스.
- 애니메이션 클래스(`animate-spin-step`, `animate-fade-in`, `animate-slide-up` 등)는 `src/index.css`에 정의.
