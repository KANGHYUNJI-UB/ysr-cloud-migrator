# ARCHITECTURE.md

# Hospital Data Migration Tool - System Architecture

이 문서는 병원 데이터 마이그레이션 도구의 전체 시스템 구조, 데이터 흐름, 핵심 모듈 책임, 설계 원칙을 설명합니다.

본 프로젝트는 병원 데이터 이관 작업을 안전하게 실행하고,  
사용자가 진행 상황을 시각적으로 확인할 수 있도록 설계된 **웹 기반 마이그레이션 시스템**입니다.

---

# 1. Architecture Overview

시스템은 다음 4개 계층으로 구성됩니다.

```text
Frontend UI (Vite + React)
        ↓
BFF Proxy Server (Express)
        ↓
Migration API
        ↓
Database
```

각 계층은 역할이 분리되어 있으며,  
프론트엔드는 사용자 경험과 상태 표시를 담당하고,  
프록시 서버는 보안 및 요청 중계를 담당하며,  
실제 데이터 이관은 API 서버에서 수행됩니다.

---

# 2. Layered Architecture

## 2.1 Presentation Layer

사용자와 직접 상호작용하는 화면 계층입니다.

구성 기술

- React
- Vite
- TypeScript
- Tailwind CSS

주요 역할

- 병원 ID 입력
- 이관 시작 액션 처리
- 단계별 진행 상황 표시
- 성공 / 실패 상태 표시
- 애니메이션 기반 사용자 경험 제공

---

## 2.2 State Management Layer

프론트엔드 내부 상태 전이와 마이그레이션 진행 UI를 관리합니다.

주요 파일

```text
src/hooks/useMigration.ts
```

주요 역할

- 상태 머신 관리
- 진행 단계 제어
- API 호출과 UI 시뮬레이션 동기화
- 완료 / 실패 상태 반영

상태 흐름

```text
idle
  ↓
running
  ↓
success | error
```

---

## 2.3 BFF Proxy Layer

프론트엔드와 실제 API 사이의 보안 계층입니다.

주요 파일

```text
server/proxy.ts
```

주요 역할

- 브라우저 요청 수신
- DB 인증 정보 주입
- 실제 마이그레이션 API로 포워딩
- 프론트엔드와 백엔드 사이의 인터페이스 단순화

이 계층을 통해 프론트엔드는 오직 `hospitalId`만 전송하며,  
DB 접속 정보는 서버에서만 처리됩니다.

---

## 2.4 Migration Execution Layer

실제 데이터 이관이 수행되는 계층입니다.

```text
http://localhost:3000/insert/all
```

주요 역할

- source DB 조회
- target DB 삽입
- 단계별 insert task 수행
- 오류 발생 시 실패 응답 반환

이 계층은 현재 레포 바깥의 실제 마이그레이션 API와 연결됩니다.

---

# 3. Data Flow

전체 요청 흐름은 다음과 같습니다.

```text
User Action
   ↓
React UI
   ↓
useMigration Hook
   ↓
POST /api/...
   ↓
Express Proxy Server
   ↓
Migration API (/insert/all)
   ↓
Database
   ↓
API Response
   ↓
UI State Update
```

---

# 4. Request Flow Detail

## 4.1 사용자 입력

사용자는 화면에서 병원 ID를 입력하고 마이그레이션을 시작합니다.

입력값

```text
hospitalId
```

---

## 4.2 프론트엔드 요청 생성

프론트엔드는 입력값을 기반으로 API 요청을 생성합니다.

주의 사항

- 프론트엔드는 DB 자격증명을 포함하지 않습니다.
- 프론트엔드는 병원 ID만 전달합니다.

---

## 4.3 Proxy 서버 처리

프록시 서버는 다음 작업을 수행합니다.

- `hospitalId`를 `Number()`로 변환
- source DB 정보 추가
- target DB 정보 추가
- 실제 이관 API에 요청 전달

---

## 4.4 실제 이관 API 실행

API 서버는 정의된 순서대로 데이터를 이관합니다.

실행 순서

```text
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

---

## 4.5 응답 처리

API 응답에 따라 프론트엔드는 다음 상태로 전환됩니다.

- success
- error

동시에 UI 시뮬레이션이 남아 있으면 빠르게 마무리됩니다.

---

# 5. UI Simulation Architecture

본 프로젝트의 특징 중 하나는 **실제 API 요청과 UI 진행 애니메이션이 병렬로 동작**한다는 점입니다.

주요 목적

- 사용자에게 현재 작업이 진행 중임을 명확히 전달
- 긴 대기 시간을 단순 로딩 스피너 대신 단계 진행으로 표현
- 작업 체감 신뢰도 향상

동작 방식

- API 미완료 상태: 2.5초 간격으로 단계 진행
- API 선완료 상태: 남은 단계 0.4초 간격으로 빠르게 완료

핵심 조건

```text
stepTimerRef.current === null
```

이 값은 시뮬레이션 완료 여부 판단에 사용됩니다.

---

# 6. Security Architecture

이 프로젝트는 DB 인증 정보를 보호하기 위해 BFF 패턴을 사용합니다.

보안 원칙

- DB 크리덴셜은 브라우저에 노출되지 않음
- 프론트엔드는 직접 DB 접근 불가
- API 호출은 반드시 프록시 서버를 거침

브라우저가 보내는 값

```text
hospitalId
```

서버가 추가하는 값

```text
source DB credentials
target DB credentials
```

이 구조는 프론트엔드 노출 영역을 최소화하고 보안 위험을 줄입니다.

---

# 7. Project Structure

프로젝트 주요 구조는 다음과 같습니다.

```text
src
 ├ components
 ├ hooks
 │   └ useMigration.ts
 ├ index.css
 ├ main.tsx
 └ app related files

server
 └ proxy.ts
```

모듈 책임

| 경로 | 역할 |
|---|---|
| `src/hooks/useMigration.ts` | 상태 머신, 단계 시뮬레이션, API 호출 제어 |
| `server/proxy.ts` | BFF 프록시, 보안 데이터 주입, API 전달 |
| `src/index.css` | Tailwind v4 설정, 애니메이션 정의 |
| `index.html` | 폰트 로드 및 기본 HTML 엔트리 |

---

# 8. Design Principles

## 8.1 Separation of Concerns

책임을 다음과 같이 분리합니다.

- UI 표시
- 상태 제어
- 보안 프록시
- 실제 데이터 이관

각 모듈은 하나의 핵심 책임에 집중합니다.

---

## 8.2 Security First

프론트엔드에서 민감한 정보가 노출되지 않도록 설계합니다.

---

## 8.3 Predictable State Flow

상태는 `idle → running → success | error` 흐름을 따르며  
예측 가능한 UI 동작을 유지합니다.

---

## 8.4 UX-Oriented Feedback

긴 작업 시간 동안 사용자에게 단계별 진행 상황을 제공하여  
단순 로딩보다 신뢰감 있는 경험을 제공합니다.

---

# 9. Scalability

향후 다음 확장이 가능합니다.

## 9.1 Migration Log Storage

마이그레이션 이력 및 결과 저장

---

## 9.2 Retry by Failed Step

실패한 단계만 재시도

---

## 9.3 Multi-Hospital Queue

여러 병원 이관 작업 큐 처리

---

## 9.4 Authentication / Authorization

관리자 인증 및 권한 제어

---

## 9.5 Monitoring Dashboard

이관 성공률, 실패 단계, 처리 시간 시각화

---

# 10. Production Considerations

운영 환경에서는 다음 사항이 필요합니다.

- Reverse Proxy 설정
- 환경 변수 분리
- API 서버 주소 외부화
- 로깅 / 에러 추적 시스템 연동
- 인증 및 접근 제어 도입

현재 개발 환경에서는 Vite dev proxy를 사용하지만,  
운영 환경에서는 nginx 또는 별도 게이트웨이 설정이 필요합니다.

---

# 11. Summary

본 프로젝트의 아키텍처 핵심은 다음과 같습니다.

- 프론트엔드와 보안 계층의 명확한 분리
- BFF 패턴을 통한 DB 인증 보호
- 상태 머신 기반 진행 제어
- 실제 이관 API와 UI 시뮬레이션의 병렬 처리
- 확장 가능한 구조

이 구조를 통해 병원 데이터 마이그레이션 과정을  
보다 안전하고, 명확하고, 사용자 친화적으로 관리할 수 있습니다.