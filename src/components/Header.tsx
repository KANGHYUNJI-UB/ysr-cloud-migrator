export function Header() {
  return (
    <header
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)',
      }}
      className="relative overflow-hidden"
    >
      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 10% 50%, #3b82f6 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 py-10 flex items-center gap-6">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              {/* Cloud shape */}
              <path
                d="M28 22a6 6 0 0 0-1.5-11.8A9 9 0 0 0 9 16a5 5 0 0 0 0 10h19Z"
                fill="rgba(255,255,255,0.9)"
              />
              {/* Cross on cloud */}
              <rect x="15.5" y="19" width="5" height="1.5" rx="0.75" fill="#1d4ed8" />
              <rect x="17.5" y="17" width="1.5" height="5" rx="0.75" fill="#1d4ed8" />
              {/* Arrow up into cloud */}
              <path
                d="M18 30v-4M15.5 28.5L18 26l2.5 2.5"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Title group */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1
              className="text-white text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Noto Sans KR', sans-serif", letterSpacing: '-0.02em' }}
            >
              의사랑 클라우드 전환
            </h1>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(59,130,246,0.3)',
                border: '1px solid rgba(96,165,250,0.4)',
                color: '#93c5fd',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '0.05em',
              }}
            >
              v1.0
            </span>
          </div>
          <p
            className="text-sm"
            style={{ color: 'rgba(148,163,184,0.9)', fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            병원 데이터 이관 서비스
          </p>
        </div>

        {/* Right side status indicator */}
        <div className="ml-auto hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs" style={{ color: 'rgba(148,163,184,0.7)', fontFamily: "'DM Mono', monospace" }}>
            SYSTEM READY
          </span>
        </div>
      </div>

      {/* Bottom edge accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)' }}
      />
    </header>
  );
}
