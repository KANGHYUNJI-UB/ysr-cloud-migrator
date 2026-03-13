import type { MigrationStep, StepStatus } from '../types';

interface Props {
  steps: MigrationStep[];
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: '#ecfdf5', border: '2px solid #10b981' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7.5L5.5 10.5L11.5 4" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (status === 'running') {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-ring"
        style={{ background: '#eff6ff', border: '2px solid #2563eb' }}
      >
        <svg className="animate-spin-step" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="5.5" stroke="rgba(37,99,235,0.25)" strokeWidth="2.5" />
          <path d="M8 2.5A5.5 5.5 0 0 1 13.5 8" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: '#fef2f2', border: '2px solid #ef4444' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3L11 11M11 3L3 11" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // pending
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: '#f8fafc', border: '2px solid #e2e8f0' }}
    >
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#cbd5e1' }} />
    </div>
  );
}

function StepLabel({ label, status }: { label: string; status: StepStatus }) {
  const colorMap: Record<StepStatus, string> = {
    pending: '#94a3b8',
    running: '#1d4ed8',
    done: '#059669',
    error: '#dc2626',
  };
  const weightMap: Record<StepStatus, string> = {
    pending: '400',
    running: '600',
    done: '500',
    error: '600',
  };

  return (
    <span
      className="text-sm transition-all duration-300"
      style={{
        color: colorMap[status],
        fontWeight: weightMap[status],
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      {label}
    </span>
  );
}

function ElapsedBadge({ elapsedMs }: { elapsedMs?: number }) {
  if (elapsedMs === undefined) return null;
  const text = elapsedMs >= 1000
    ? `${(elapsedMs / 1000).toFixed(1)}s`
    : `${elapsedMs}ms`;
  return (
    <span
      className="text-xs"
      style={{ color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}
    >
      {text}
    </span>
  );
}

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === 'running') {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: '#eff6ff',
          color: '#2563eb',
          fontFamily: "'DM Mono', monospace",
          border: '1px solid #bfdbfe',
        }}
      >
        진행 중
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: '#ecfdf5',
          color: '#059669',
          fontFamily: "'DM Mono', monospace",
          border: '1px solid #a7f3d0',
        }}
      >
        완료
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: '#fef2f2',
          color: '#dc2626',
          fontFamily: "'DM Mono', monospace",
          border: '1px solid #fecaca',
        }}
      >
        오류
      </span>
    );
  }
  return null;
}

export function ProgressModal({ steps }: Props) {
  const doneCount = steps.filter(s => s.status === 'done').length;
  const total = steps.length;
  const progressPct = Math.round((doneCount / total) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up flex flex-col"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)',
          maxHeight: '90vh',
        }}
      >
        {/* Modal header */}
        <div
          className="px-6 py-5"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(96,165,250,0.3)' }}
            >
              <svg className="animate-spin-step" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="rgba(96,165,250,0.3)" strokeWidth="2.5" />
                <path d="M9 2A7 7 0 0 1 16 9" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3
                className="text-white font-semibold text-base"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                데이터 이관 진행 중
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'rgba(148,163,184,0.8)', fontFamily: "'DM Mono', monospace" }}
              >
                {doneCount} / {total} 단계 완료
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                }}
              />
            </div>
            <p
              className="text-right text-xs mt-1"
              style={{ color: 'rgba(148,163,184,0.6)', fontFamily: "'DM Mono', monospace" }}
            >
              {progressPct}%
            </p>
          </div>
        </div>

        {/* Steps list */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <div className="flex flex-col gap-0">
            {steps.map((step, index) => (
              <div key={step.id}>
                <div className="flex items-center gap-3 py-1.5">
                  <StepIcon status={step.status} />

                  {/* Connector line area */}
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs w-5 text-right"
                        style={{
                          color: '#cbd5e1',
                          fontFamily: "'DM Mono', monospace",
                          flexShrink: 0,
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <StepLabel label={step.label} status={step.status} />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <ElapsedBadge elapsedMs={step.elapsedMs} />
                      <StatusBadge status={step.status} />
                    </div>
                  </div>
                </div>

                {/* Vertical connector between steps */}
                {index < steps.length - 1 && (
                  <div
                    className="ml-4 w-px h-3"
                    style={{
                      background: step.status === 'done'
                        ? '#a7f3d0'
                        : 'linear-gradient(to bottom, #e2e8f0, transparent)',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center gap-2"
          style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#94a3b8" strokeWidth="1.2" />
            <path d="M7 4.5v.5M7 6.5v3" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <p
            className="text-xs"
            style={{ color: '#94a3b8', fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            작업이 완료될 때까지 브라우저를 닫지 마세요.
          </p>
        </div>
      </div>
    </div>
  );
}
