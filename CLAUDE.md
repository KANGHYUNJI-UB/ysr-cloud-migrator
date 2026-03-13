# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

이 프로젝트는 병원 데이터 마이그레이션을 지원하는 웹 기반 도구입니다.  
Claude Code가 코드 수정, 기능 추가, 버그 수정 시 **프로젝트 구조와 핵심 동작 방식을 이해할 수 있도록 컨텍스트를 제공합니다.**

---

# Project Overview

이 시스템은 병원 데이터베이스의 데이터를 다른 시스템으로 이관하는 과정을 시각적으로 관리하는 **데이터 마이그레이션 UI**입니다.

핵심 특징

- 병원 데이터 이관 진행 상황을 UI로 표시
- 실제 API 호출과 UI 시뮬레이션을 병렬 실행
- DB 자격증명을 프론트엔드에서 숨기기 위한 BFF 구조 사용

시스템 구성

```
Frontend (Vite + React)
        ↓
BFF Proxy Server (Express)
        ↓
Migration API
        ↓
Database
```

---

# Commands

```bash
npm run dev       # 프론트(Vite :5173) + 프록시 서버(Express :3001) 동시 실행
npm run build     # 타입 체크 후 프로덕션 빌드
npm run server    # 프록시 서버만 단독 실행
```

타입 체크만 실행

```bash
npx tsc -p tsconfig.app.json --noEmit   # 프론트엔드
npx tsc -p tsconfig.node.json --noEmit  # 서버
```

---

# Architecture

## BFF Proxy Pattern

이 프로젝트는 **BFF(Backend For Frontend) 프록시 패턴**을 사용합니다.

브라우저는 다음 데이터만 전송합니다.

```
hospitalId
```

프록시 서버

```
server/proxy.ts
```

가 다음 역할을 수행합니다.

1. DB 자격증명 추가
2. 실제 API 서버로 요청 전달

```
http://localhost:3000/insert/all
```

이 구조의 목적

- DB 크리덴셜 보호
- 프론트엔드 보안 강화
- API 구조 단순화

프론트에는 **DB 인증 정보가 절대 노출되지 않습니다.**

---

## Vite Development Proxy

개발 환경에서는 Vite proxy가 자동으로 API 요청을 프록시합니다.

설정 위치

```
vite.config.ts
```

프록시 동작

```
/api/* → http://localhost:3001
```

프로덕션 환경에서는 별도의 **reverse proxy (nginx 등)** 설정이 필요합니다.

---

# Migration State Machine

마이그레이션 진행 상태는 다음 상태 머신으로 관리됩니다.

파일

```
src/hooks/useMigration.ts
```

상태 흐름

```
idle
  ↓
running
  ↓
success | error
```

특징

- API 요청과 UI 시뮬레이션이 동시에 실행됩니다.
- API 응답 전까지 UI는 **2.5초 간격으로 단계 진행**
- API가 먼저 완료되면 **남은 단계를 0.4초 간격으로 빠르게 마무리**

다음 조건을 통해 시뮬레이션 종료 상태를 감지합니다.

```
stepTimerRef.current === null
```

이 상태는

```
"시뮬레이션 완료 + API 미완료"
```

상황을 의미합니다.

---

# Migration Step Order

마이그레이션 단계는 다음 순서로 진행됩니다.

정의 위치

```
STEP_LABELS
src/hooks/useMigration.ts
```

순서

```
1. 처방
2. 의약품·재료
3. 용법 코드
4. 템플릿 코드
5. 묶음 항목
6. 묶음 항목 상세
7. 환자
8. 접수
9. 예약
10. 상병
11. 오더
12. 활력징후
13. 수납·정산·결제
```

총 **13단계**

이 순서는 실제 API의 작업 순서와 동일합니다.

```
insertTasks
```

---

# API Payload

API 요청은 다음 파일에서 생성됩니다.

```
server/proxy.ts
```

전송 데이터

```
hospitalId
source DB credentials
target DB credentials
```

주의 사항

```
hospitalId
```

는 반드시 다음과 같이 변환됩니다.

```
Number(hospitalId)
```

---

# Key Conventions

## Tailwind v4

Tailwind v4 사용 시 다음 문법을 사용합니다.

```
@import "tailwindcss"
```

위치

```
src/index.css
```

다음 문법은 사용할 수 없습니다.

```
@tailwind base
@tailwind components
@tailwind utilities
```

---

## Font Usage

한국어 UI

```
Noto Sans KR
```

기술 값 / ID 표시

```
DM Mono
```

Google Fonts는 다음 파일에서 로드됩니다.

```
index.html
```

---

## Styling Strategy

스타일링 전략

Tailwind

- 레이아웃
- 간격
- 정렬

Inline Style

- 동적 색상
- 그림자
- 그라디언트

혼합 사용합니다.

---

## Animation Classes

다음 애니메이션 클래스는 `src/index.css`에 정의되어 있습니다.

```
animate-spin-step
animate-fade-in
animate-slide-up
```

UI 진행 상태 표시 시 사용됩니다.

---

# Development Notes

Claude Code가 코드 수정 시 다음 규칙을 유지해야 합니다.

### Migration Step Order 변경 금지

STEP_LABELS 순서는 실제 데이터 이관 순서와 동일합니다.

임의 변경 시 데이터 이관 문제가 발생할 수 있습니다.

---

### BFF Proxy 구조 유지

프론트엔드에서 DB 인증 정보가 직접 노출되면 안 됩니다.

모든 DB 요청은 반드시

```
server/proxy.ts
```

를 통해 전달해야 합니다.

---

### UI Simulation Logic 유지

useMigration 훅의

```
stepTimerRef
```

기반 시뮬레이션 로직은 사용자 경험을 위한 핵심 기능입니다.

---

# Future Improvements

향후 확장 가능 영역

- 마이그레이션 로그 저장
- 실패 단계 자동 재시도
- 병렬 이관 처리
- 진행률 기반 ETA 계산
- 관리자 인증 시스템