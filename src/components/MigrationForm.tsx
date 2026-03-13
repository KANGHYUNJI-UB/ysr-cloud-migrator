import { useState } from 'react';
import type { MigrationFormData, MigrationStatus } from '../types';

interface Props {
  onSubmit: (data: MigrationFormData) => void;
  status: MigrationStatus;
}

interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  mono?: boolean;
  required?: boolean;
}

function Field({ id, label, placeholder, value, onChange, disabled, mono, required }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium"
        style={{ color: '#334155', fontFamily: "'Noto Sans KR', sans-serif" }}
      >
        {label}
        {required && <span className="text-blue-600 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          fontFamily: mono ? "'DM Mono', monospace" : "'Noto Sans KR', sans-serif",
          background: disabled ? '#f8fafc' : '#ffffff',
          border: '1.5px solid #e2e8f0',
          color: '#0f172a',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        onFocus={e => {
          if (!disabled) {
            e.currentTarget.style.border = '1.5px solid #2563eb';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
          }
        }}
        onBlur={e => {
          e.currentTarget.style.border = '1.5px solid #e2e8f0';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export function MigrationForm({ onSubmit, status }: Props) {
  const [form, setForm] = useState<MigrationFormData>({
    hospitalName: '',
    userName: '',
    hospitalId: '',
  });
  const [touched, setTouched] = useState(false);

  const disabled = status === 'running';
  const isValid = form.hospitalName.trim() && form.userName.trim() && form.hospitalId.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit(form);
  };

  return (
    <div
      className="rounded-2xl p-8 animate-fade-in"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.04)',
      }}
    >
      {/* Section header */}
      <div className="mb-6 pb-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#eff6ff' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L2 4v6l5 3 5-3V4L7 1Z" stroke="#2563eb" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M7 1v12M2 4l5 3 5-3" stroke="#2563eb" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            className="text-base font-semibold"
            style={{ color: '#0f172a', fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            이관 정보 입력
          </h2>
        </div>
        <p className="text-xs ml-8.5" style={{ color: '#94a3b8', fontFamily: "'Noto Sans KR', sans-serif" }}>
          데이터 이관을 진행할 병원 정보를 입력해 주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-5">
          <Field
            id="hospitalName"
            label="병원명"
            placeholder="예: 서울중앙병원"
            value={form.hospitalName}
            onChange={v => setForm(f => ({ ...f, hospitalName: v }))}
            disabled={disabled}
            required
          />
          <Field
            id="userName"
            label="담당자 성함"
            placeholder="예: 홍길동"
            value={form.userName}
            onChange={v => setForm(f => ({ ...f, userName: v }))}
            disabled={disabled}
            required
          />
          <Field
            id="hospitalId"
            label="병원 ID"
            placeholder="예: 1"
            value={form.hospitalId}
            onChange={v => setForm(f => ({ ...f, hospitalId: v }))}
            disabled={disabled}
            required
          />
        </div>

        {/* Validation message */}
        {touched && !isValid && (
          <p
            className="mt-3 text-xs flex items-center gap-1.5 animate-fade-in"
            style={{ color: '#dc2626', fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" stroke="#dc2626" />
              <path d="M6 3.5v3M6 8.5h.01" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            모든 항목을 입력해 주세요.
          </p>
        )}

        {/* Divider */}
        <div className="my-6" style={{ height: '1px', background: '#f1f5f9' }} />

        {/* Info notice */}
        <div
          className="rounded-xl px-4 py-3 mb-5 flex gap-3"
          style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}
        >
          <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#0284c7" strokeWidth="1.2" />
            <path d="M8 5.5v.5M8 7.5v3" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-xs leading-relaxed" style={{ color: '#0369a1', fontFamily: "'Noto Sans KR', sans-serif" }}>
            이관 작업은 평균 10~30분 소요됩니다. 작업 중에는 브라우저를 닫지 마세요.
          </p>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: disabled
              ? '#94a3b8'
              : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: "'Noto Sans KR', sans-serif",
            boxShadow: disabled ? 'none' : '0 4px 14px rgba(37,99,235,0.35)',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => {
            if (!disabled) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)';
            }
          }}
          onMouseLeave={e => {
            if (!disabled) {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35)';
            }
          }}
        >
          {disabled ? (
            <>
              <svg className="animate-spin-step" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              이관 진행 중...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a6 6 0 0 1 6 6H8V2Z" fill="rgba(255,255,255,0.8)" />
                <path d="M3 8a5 5 0 0 1 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8 14a6 6 0 0 0 0-12" stroke="white" strokeWidth="1.5" />
                <path d="M11 10l2 2-2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              데이터 이관 시작
            </>
          )}
        </button>
      </form>
    </div>
  );
}
