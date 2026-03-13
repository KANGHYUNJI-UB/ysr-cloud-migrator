interface Props {
  success: boolean;
  hospitalName?: string;
  errorMessage?: string;
  onReset: () => void;
}

export function ResultBanner({ success, hospitalName, errorMessage, onReset }: Props) {
  if (success) {
    return (
      <div
        className="rounded-2xl overflow-hidden animate-fade-in"
        style={{
          border: '1px solid #a7f3d0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(5,150,105,0.08)',
        }}
      >
        {/* Top accent stripe */}
        <div
          className="h-1.5"
          style={{ background: 'linear-gradient(90deg, #059669, #10b981, #34d399)' }}
        />

        <div className="p-7" style={{ background: '#f0fdf4' }}>
          <div className="flex items-start gap-4">
            {/* Success icon */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: '#ecfdf5',
                border: '2px solid #10b981',
                boxShadow: '0 0 0 4px rgba(16,185,129,0.1)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M4 11.5L8.5 16L18 7"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="flex-1">
              <h3
                className="text-base font-bold mb-1"
                style={{ color: '#065f46', fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                이관 완료
              </h3>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: '#047857', fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                {hospitalName
                  ? <><strong>{hospitalName}</strong>의 데이터가 클라우드로 성공적으로 이관되었습니다.</>
                  : '데이터가 클라우드로 성공적으로 이관되었습니다.'
                }
              </p>

              {/* Stats row */}
              <div className="flex gap-4 mb-5">
                {[
                  { label: '상태', value: '성공' },
                  { label: '완료 시각', value: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) },
                ].map(item => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-0.5 px-3 py-2 rounded-lg"
                    style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: '#15803d', fontFamily: "'DM Mono', monospace" }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: '#166534', fontFamily: "'Noto Sans KR', sans-serif" }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={onReset}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #10b981',
                  color: '#059669',
                  fontFamily: "'Noto Sans KR', sans-serif",
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#ecfdf5';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.transform = '';
                }}
              >
                새 이관 시작
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div
      className="rounded-2xl overflow-hidden animate-fade-in"
      style={{
        border: '1px solid #fecaca',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(220,38,38,0.08)',
      }}
    >
      {/* Top accent stripe */}
      <div
        className="h-1.5"
        style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444, #f87171)' }}
      />

      <div className="p-7" style={{ background: '#fff5f5' }}>
        <div className="flex items-start gap-4">
          {/* Error icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: '#fef2f2',
              border: '2px solid #ef4444',
              boxShadow: '0 0 0 4px rgba(239,68,68,0.1)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M5 5L17 17M17 5L5 17" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex-1">
            <h3
              className="text-base font-bold mb-1"
              style={{ color: '#7f1d1d', fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              이관 실패
            </h3>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: '#991b1b', fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              데이터 이관 중 오류가 발생했습니다. 아래 내용을 확인하세요.
            </p>

            {errorMessage && (
              <div
                className="rounded-xl px-4 py-3 mb-5 text-sm"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontFamily: "'DM Mono', monospace",
                  lineHeight: '1.6',
                  wordBreak: 'break-all',
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              onClick={onReset}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                background: '#ffffff',
                border: '1.5px solid #ef4444',
                color: '#dc2626',
                fontFamily: "'Noto Sans KR', sans-serif",
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.transform = '';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7a5 5 0 1 1 5 5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M5 4L2 7l3 3" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              다시 시도
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
