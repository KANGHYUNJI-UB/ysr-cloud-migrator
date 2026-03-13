import type { MigrationFormData } from '../types';

interface Props {
  formData: MigrationFormData;
  elapsedMs: number;
  onClose: () => void;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}초`;
  return `${min}분 ${sec}초`;
}

export function CompletionModal({ formData, elapsedMs, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-6 flex flex-col items-center text-center"
          style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' }}
        >
          {/* Check circle */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M6 16.5L12 22.5L26 9"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3
            className="text-white text-lg font-bold mb-1"
            style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            데이터 이관 완료
          </h3>
          <p
            className="text-sm"
            style={{ color: 'rgba(167,243,208,0.9)', fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            모든 데이터가 성공적으로 이관되었습니다.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Info rows */}
          <div
            className="rounded-xl overflow-hidden mb-5"
            style={{ border: '1px solid #e2e8f0' }}
          >
            {[
              { label: '병원명', value: formData.hospitalName },
              { label: '담당자', value: formData.userName },
              { label: '병원 ID', value: formData.hospitalId, mono: true },
              { label: '총 소요 시간', value: formatElapsed(elapsedMs), mono: true },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className="flex items-center px-4 py-3"
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: i % 2 === 0 ? '#fafafa' : '#ffffff',
                }}
              >
                <span
                  className="text-xs w-24 flex-shrink-0"
                  style={{ color: '#94a3b8', fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                  {row.label}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: '#0f172a',
                    fontFamily: row.mono ? "'DM Mono', monospace" : "'Noto Sans KR', sans-serif",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Completion time */}
          <p
            className="text-xs text-center mb-5"
            style={{ color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}
          >
            완료 시각: {new Date().toLocaleString('ko-KR')}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              fontFamily: "'Noto Sans KR', sans-serif",
              boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
              cursor: 'pointer',
              border: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(5,150,105,0.35)';
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
