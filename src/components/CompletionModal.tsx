import type { MigrationFormData } from '../types';

interface Props {
  success: boolean;
  formData: MigrationFormData;
  elapsedMs: number;
  errorMessage?: string;
  onClose: () => void;
}

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}초`;
  return `${min}분 ${sec}초`;
}

export function CompletionModal({ success, formData, elapsedMs, errorMessage, onClose }: Props) {
  const accent = success
    ? { bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', sub: 'rgba(167,243,208,0.9)', btn: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', btnShadow: 'rgba(5,150,105,0.35)', btnShadowHover: 'rgba(5,150,105,0.45)' }
    : { bg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', sub: 'rgba(254,202,202,0.9)', btn: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', btnShadow: 'rgba(220,38,38,0.35)', btnShadowHover: 'rgba(220,38,38,0.45)' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#ffffff', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-6 flex flex-col items-center text-center"
          style={{ background: accent.bg }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
          >
            {success ? (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 16.5L12 22.5L26 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M8 8L24 24M24 8L8 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <h3
            className="text-white text-lg font-bold mb-1"
            style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            {success ? '데이터 이관 완료' : '데이터 이관 실패'}
          </h3>
          <p className="text-sm" style={{ color: accent.sub, fontFamily: "'Noto Sans KR', sans-serif" }}>
            {success ? '모든 데이터가 성공적으로 이관되었습니다.' : '이관 중 오류가 발생했습니다.'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* 그룹박스 */}
          <div
            className="rounded-xl overflow-hidden mb-5"
            style={{ border: '1px solid #e2e8f0' }}
          >
            {/* 그룹박스 타이틀 */}
            <div
              className="px-4 py-2.5"
              style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
            >
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: '#64748b', fontFamily: "'DM Mono', monospace" }}
              >
                이관 결과 요약
              </span>
            </div>

            {/* 항목 rows */}
            {[
              { label: '이관 결과', value: success ? '성공' : '실패', highlight: true, success },
              { label: '전체 수행 시간', value: formatElapsed(elapsedMs), mono: true },
              { label: '병원명', value: formData.hospitalName },
              { label: '담당자', value: formData.userName },
              { label: '병원 ID', value: formData.hospitalId, mono: true },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className="flex items-center px-4 py-3"
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: i % 2 === 0 ? '#ffffff' : '#fafafa',
                }}
              >
                <span
                  className="text-xs w-28 flex-shrink-0"
                  style={{ color: '#94a3b8', fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                  {row.label}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{
                    fontFamily: row.mono ? "'DM Mono', monospace" : "'Noto Sans KR', sans-serif",
                    color: row.highlight
                      ? (row.success ? '#059669' : '#dc2626')
                      : '#0f172a',
                    fontWeight: row.highlight ? 700 : 500,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}

            {/* 실패 시 오류 메시지 */}
            {!success && errorMessage && (
              <div
                className="px-4 py-3"
                style={{ borderTop: '1px solid #f1f5f9', background: '#fef2f2' }}
              >
                <p
                  className="text-xs mb-1"
                  style={{ color: '#94a3b8', fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                  오류 내용
                </p>
                <p
                  className="text-xs break-all"
                  style={{ color: '#dc2626', fontFamily: "'DM Mono', monospace", lineHeight: '1.6' }}
                >
                  {errorMessage}
                </p>
              </div>
            )}
          </div>

          {/* 완료 시각 */}
          <p
            className="text-xs text-center mb-5"
            style={{ color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}
          >
            {success ? '완료' : '실패'} 시각: {new Date().toLocaleString('ko-KR')}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200"
            style={{
              background: accent.btn,
              fontFamily: "'Noto Sans KR', sans-serif",
              boxShadow: `0 4px 14px ${accent.btnShadow}`,
              cursor: 'pointer',
              border: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 6px 20px ${accent.btnShadowHover}`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = `0 4px 14px ${accent.btnShadow}`;
            }}
          >
            {success ? '확인' : '닫기'}
          </button>
        </div>
      </div>
    </div>
  );
}
