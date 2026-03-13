import { useCallback, useRef, useState } from 'react';
import type { MigrationState, MigrationStep } from '../types';
import type { MigrationEvent } from '../services/api';
import { streamMigration } from '../services/api';

const STEP_LABELS = [
  '기존 데이터 삭제',
  '스테이징 생성',
  '처방 정보',
  '의약품·재료 정보',
  '용법 코드 정보',
  '템플릿 코드 정보',
  '묶음 항목 정보',
  '묶음 항목 상세 정보',
  '환자 정보',
  '접수 정보',
  '예약 정보',
  '상병 정보',
  '오더 정보',
  '활력징후 정보',
  '수납·정산·결제 정보',
];

// 백엔드 step name → 스텝 인덱스
const STEP_NAME_TO_INDEX: Record<string, number> = {
  'delete-all': 0,
  'stage-create': 1,
  'prescription': 2,
  'medical-drug-material': 3,
  'usage-code': 4,
  'template-code': 5,
  'bundle-item': 6,
  'bundle-item-detail': 7,
  'patient': 8,
  'registration': 9,
  'appointment': 10,
  'disease': 11,
  'order': 12,
  'vital': 13,
  'receipt-settlement-payment': 14,
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

  const handleEvent = useCallback((event: MigrationEvent) => {
    if (event.type === 'step-start') {
      const idx = event.name !== undefined ? (STEP_NAME_TO_INDEX[event.name] ?? -1) : -1;
      if (idx === -1) return;
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
      setState(prev => ({
        ...prev,
        steps: prev.steps.map((s, i) =>
          i === idx ? { ...s, status: event.type === 'step-done' ? 'done' : 'error' } : s
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
