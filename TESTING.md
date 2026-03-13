# TESTING.md

# Testing Strategy

이 문서는 **의사랑 클라우드 전환 헬퍼** 프로젝트의 테스트 전략과 코드 품질 검증 방식을 설명합니다.

본 프로젝트는 병원 데이터 마이그레이션을 수행하는 내부 운영 도구로,  
데이터 이관 순서의 정확성과 시스템 안정성이 매우 중요합니다.

따라서 다음 영역에 대한 테스트 전략을 정의합니다.

---

# 1. Testing Goals

테스트의 주요 목적은 다음과 같습니다.

- 데이터 이관 단계 순서 검증
- SSE 기반 이벤트 스트리밍 정상 동작 확인
- Proxy 서버 요청 흐름 검증
- UI 상태 전이 정상 동작 확인

---

# 2. Test Scope

본 프로젝트에서 테스트 대상은 다음과 같습니다.

| 영역 | 테스트 대상 |
|-----|-------------|
| Domain Logic | migration state machine |
| API Layer | proxy request forwarding |
| Streaming | SSE event handling |
| UI | migration progress rendering |
| Integration | 전체 데이터 이관 흐름 |

---

# 3. Unit Tests

Unit Test는 핵심 로직을 검증합니다.

주요 테스트 대상

```
src/hooks/useMigration.ts
```

검증 항목

### 상태 머신 검증

상태 전이

```
idle → running → success
idle → running → error
```

정상적인 상태 흐름을 유지해야 합니다.

---

### Migration Step Logic

이관 단계 순서 검증

```
STEP_LABELS
```

정의된 15단계가 올바른 순서로 실행되는지 확인합니다.

예

```
처방 → 의약품 → 용법 → 템플릿 → 환자 → 접수 ...
```

---

# 4. SSE Streaming Tests

본 프로젝트는 **SSE(Server-Sent Events)** 기반으로 진행 상태를 전달합니다.

테스트 대상

```
src/services/api.ts
```

검증 항목

- 이벤트 수신 정상 동작
- 단계 시작 이벤트 처리
- 단계 완료 이벤트 처리
- 오류 이벤트 처리

예시 이벤트

```json
{
  "type": "step_start",
  "step": "patient_insert"
}
```

---

# 5. Proxy Server Tests

Proxy 서버는 보안 계층 역할을 수행합니다.

테스트 대상

```
server/proxy.ts
```

검증 항목

- hospitalId 전달 확인
- DB credentials 서버 처리 확인
- API 서버 요청 정상 전달

요청 흐름

```
Frontend
   ↓
Proxy Server
   ↓
Migration API
```

---

# 6. API Integration Tests

Integration Test는 전체 데이터 흐름을 검증합니다.

테스트 흐름

```
MigrationForm
   ↓
API Request
   ↓
Proxy Server
   ↓
Migration API
   ↓
SSE Events
   ↓
UI Update
```

검증 항목

- 요청 성공 여부
- SSE 이벤트 수신
- UI 상태 변경

---

# 7. UI Tests

UI 테스트는 사용자 인터페이스 동작을 검증합니다.

검증 대상

- MigrationForm 입력
- ProgressModal 표시
- 단계 진행 UI 업데이트
- CompletionModal 표시
- ResultBanner 오류 표시

---

# 8. Manual Test Scenarios

다음 시나리오를 기준으로 수동 테스트를 수행합니다.

### 정상 이관

1. 병원 ID 입력
2. 이관 시작
3. 15단계 진행 확인
4. 완료 모달 표시

---

### 오류 발생

1. API 서버 오류 발생
2. 진행 중 오류 이벤트 발생
3. ResultBanner 표시

---

### 네트워크 지연

1. API 응답 지연
2. UI 진행 상태 유지
3. SSE 이벤트 도착 후 UI 업데이트

---

# 9. CI/CD Strategy

코드 품질을 유지하기 위해 CI/CD 파이프라인에서 다음 검증을 수행합니다.

```
Install Dependencies
        ↓
Type Check
        ↓
Lint
        ↓
Build
```

예시 GitHub Actions

```
name: CI

on:
  push:
    branches: [main]

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: install
        run: npm install

      - name: type check
        run: npx tsc --noEmit

      - name: build
        run: npm run build
```

---

# 10. Test Coverage Goals

권장 테스트 커버리지

```
80% 이상
```

특히 다음 영역은 높은 커버리지가 필요합니다.

- migration state machine
- SSE event handler
- proxy request forwarding

---

# 11. Future Testing Improvements

향후 다음 테스트를 추가할 수 있습니다.

### E2E Testing

도구

```
Playwright
Cypress
```

---

### Load Testing

대규모 병원 데이터 이관 테스트

---

### API Mock Testing

Migration API 의존성 제거

---

# 12. Summary

본 프로젝트의 테스트 전략은 다음을 목표로 합니다.

- 데이터 이관 단계 정확성 보장
- 실시간 이벤트 처리 안정성 확보
- Proxy 기반 보안 구조 검증
- 사용자 UI 상태 흐름 검증