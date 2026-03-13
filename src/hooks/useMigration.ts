import { useCallback, useRef, useState } from 'react';
import type { MigrationState, MigrationStep } from '../types';
import type { MigrationEvent } from '../services/api';
import { streamMigration } from '../services/api';

const STEP_LABELS = [
  'DB 연결 초기화',
  '기존 데이터 삭제',
  '임시 데이터저장소 생성',
  '처방 정보',
  '의약품·재료 정보',
  '용법 정보',
  '상용구(증상) 정보',
  '묶음 항목 정보',
  '묶음 항목 상세 정보',
  '환자 정보',
  '접수 정보',
  '예약 정보',
  '상병 정보',
  '오더 정보',
  '바이탈 정보',
  '수납·정산·결제 정보',
];

// 백엔드 step name → 스텝 인덱스
const STEP_NAME_TO_INDEX: Record<string, number> = {
  'init': 0,
  'delete-all': 1,
  'stage-create': 2,
  'prescription': 3,
  'medical-drug-material': 4,
  'usage-code': 5,
  'template-code': 6,
  'bundle-item': 7,
  'bundle-item-detail': 8,
  'patient': 9,
  'registration': 10,
  'appointment': 11,
  'disease': 12,
  'order': 13,
  'vital': 14,
  'receipt-settlement-payment': 15,
};

function buildInitialSteps(): MigrationStep[] {
  return STEP_LABELS.map((label, i) => ({
    id: `step-${i}`,
    label,
    status: 'pending',
  }));
}

function buildInitialState(): MigrationState {
  return { status: 'idle', steps: buildInitialSteps(), currentStepIndex: -1 };
}

export function useMigration() {
  const [state, setState] = useState<MigrationState>(buildInitialState);

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef(0);
  const stepStartTimeRef = useRef<Record<number, number>>({});

  const handleEvent = useCallback((event: MigrationEvent) => {
    if (event.type === 'step-start') {
      const idx = event.name !== undefined ? (STEP_NAME_TO_INDEX[event.name] ?? -1) : -1;
      if (idx === -1) return;
      stepStartTimeRef.current[idx] = Date.now();
      setState(prev => ({
        ...prev,
        currentStepIndex: idx,
        steps: prev.steps.map((s, i) => ({
          ...s,
          status: i < idx ? 'done' : i === idx ? 'running' : 'pending',
        })),
      }));

    } else if (event.type === 'step-done' || event.type === 'step-error') {
      const idx = event.name !== undefined ? (STEP_NAME_TO_INDEX[event.name] ?? -1) : -1;
      if (idx === -1) return;
      const stepElapsedMs = stepStartTimeRef.current[idx] !== undefined
        ? Date.now() - stepStartTimeRef.current[idx]
        : undefined;
      setState(prev => ({
        ...prev,
        steps: prev.steps.map((s, i) =>
          i === idx ? { ...s, status: event.type === 'step-done' ? 'done' : 'error', elapsedMs: stepElapsedMs } : s
        ),
      }));

    } else if (event.type === 'complete') {
      const elapsedMs = Date.now() - startTimeRef.current;
      setState(prev => ({
        ...prev,
        status: event.success ? 'success' : 'error',
        elapsedMs,
        errorMessage: event.success ? undefined : '일부 단계에서 오류가 발생했습니다.',
      }));

    } else if (event.type === 'error') {
      const elapsedMs = Date.now() - startTimeRef.current;
      setState(prev => ({
        ...prev,
        status: 'error',
        elapsedMs,
        errorMessage: event.message,
      }));
    }
  }, []);

  const startMigration = useCallback((hospitalId: string) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    startTimeRef.current = Date.now();
    setState({ status: 'running', steps: buildInitialSteps(), currentStepIndex: -1 });
    abortControllerRef.current = streamMigration(hospitalId, handleEvent);
  }, [handleEvent]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setState(buildInitialState());
  }, []);

  return { state, startMigration, reset };
}
