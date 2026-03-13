import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMigration } from './useMigration';
import * as apiModule from '../services/api';
import type { MigrationEvent } from '../services/api';

// streamMigration 을 mock — onEvent 콜백을 테스트에서 직접 호출 가능하게
let capturedOnEvent: ((e: MigrationEvent) => void) | null = null;

beforeEach(() => {
  capturedOnEvent = null;
  vi.spyOn(apiModule, 'streamMigration').mockImplementation((_hospitalId, onEvent) => {
    capturedOnEvent = onEvent;
    return new AbortController();
  });
});

// onEvent 를 act 안에서 안전하게 호출하는 헬퍼
function emit(event: MigrationEvent) {
  act(() => { capturedOnEvent!(event); });
}

describe('초기 상태', () => {
  it('status 가 idle 이다', () => {
    const { result } = renderHook(() => useMigration());
    expect(result.current.state.status).toBe('idle');
  });

  it('steps 가 16개이다', () => {
    const { result } = renderHook(() => useMigration());
    expect(result.current.state.steps).toHaveLength(16);
  });

  it('모든 step 의 초기 status 가 pending 이다', () => {
    const { result } = renderHook(() => useMigration());
    result.current.state.steps.forEach(s => expect(s.status).toBe('pending'));
  });

  it('첫 번째 단계 레이블이 DB 연결 초기화 이다', () => {
    const { result } = renderHook(() => useMigration());
    expect(result.current.state.steps[0].label).toBe('DB 연결 초기화');
  });

  it('마지막 단계 레이블이 수납·정산·결제 정보 이다', () => {
    const { result } = renderHook(() => useMigration());
    expect(result.current.state.steps[15].label).toBe('수납·정산·결제 정보');
  });
});

describe('startMigration', () => {
  it('status 가 running 으로 전환된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    expect(result.current.state.status).toBe('running');
  });

  it('streamMigration 이 hospitalId 와 함께 호출된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    expect(apiModule.streamMigration).toHaveBeenCalledWith('HOSP_001', expect.any(Function));
  });
});

describe('SSE 이벤트 처리', () => {
  it('step-start 이벤트가 오면 해당 단계가 running 이 된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'step-start', name: 'init' });
    expect(result.current.state.steps[0].status).toBe('running');
  });

  it('step-done 이벤트가 오면 해당 단계가 done 이 된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'step-start', name: 'init' });
    emit({ type: 'step-done', name: 'init' });
    expect(result.current.state.steps[0].status).toBe('done');
  });

  it('step-error 이벤트가 오면 해당 단계가 error 가 된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'step-start', name: 'prescription' });
    emit({ type: 'step-error', name: 'prescription', message: 'DB 오류' });
    expect(result.current.state.steps[3].status).toBe('error');
  });

  it('step-start 이벤트 시 이전 단계들이 모두 done 이 된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'step-start', name: 'delete-all' }); // index 1
    expect(result.current.state.steps[0].status).toBe('done');
    expect(result.current.state.steps[1].status).toBe('running');
    expect(result.current.state.steps[2].status).toBe('pending');
  });

  it('complete success 이벤트가 오면 status 가 success 가 된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'complete', success: true });
    expect(result.current.state.status).toBe('success');
  });

  it('complete failure 이벤트가 오면 status 가 error 가 된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'complete', success: false });
    expect(result.current.state.status).toBe('error');
  });

  it('error 이벤트가 오면 status 가 error 이고 errorMessage 가 설정된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'error', message: '연결 실패' });
    expect(result.current.state.status).toBe('error');
    expect(result.current.state.errorMessage).toBe('연결 실패');
  });

  it('알 수 없는 step name 은 무시된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    const before = result.current.state.steps.map(s => s.status);
    emit({ type: 'step-start', name: 'unknown-step' });
    const after = result.current.state.steps.map(s => s.status);
    expect(after).toEqual(before);
  });
});

describe('reset', () => {
  it('reset 하면 status 가 idle 로 돌아온다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'complete', success: true });
    act(() => result.current.reset());
    expect(result.current.state.status).toBe('idle');
  });

  it('reset 하면 모든 step 이 pending 이 된다', () => {
    const { result } = renderHook(() => useMigration());
    act(() => result.current.startMigration('HOSP_001'));
    emit({ type: 'step-done', name: 'delete-all' });
    act(() => result.current.reset());
    result.current.state.steps.forEach(s => expect(s.status).toBe('pending'));
  });
});
