import { useState } from 'react';
import { Header } from './components/Header';
import { MigrationForm } from './components/MigrationForm';
import { ProgressModal } from './components/ProgressModal';
import { CompletionModal } from './components/CompletionModal';
import { useMigration } from './hooks/useMigration';
import type { MigrationFormData } from './types';

function App() {
  const { state, startMigration, reset } = useMigration();
  const [lastFormData, setLastFormData] = useState<MigrationFormData | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (data: MigrationFormData) => {
    setLastFormData(data);
    setShowResult(false);
    startMigration(data.hospitalId);
  };

  const handleResultClose = () => {
    setShowResult(false);
    reset();
    setLastFormData(null);
  };

  // 성공 또는 실패 상태가 되면 결과창 표시
  if ((state.status === 'success' || state.status === 'error') && !showResult) {
    setShowResult(true);
  }

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      <Header />

      <main className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-6">
        <MigrationForm
          onSubmit={handleSubmit}
          status={state.status}
        />

        <footer className="text-center pb-4">
          <p
            className="text-xs"
            style={{ color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}
          >
            © 2026 의사랑 · 클라우드 전환 시스템 v1.0
          </p>
        </footer>
      </main>

      {/* 진행 모달 */}
      {state.status === 'running' && (
        <ProgressModal steps={state.steps} />
      )}

      {/* 결과 모달 (성공/실패 공통) */}
      {showResult && lastFormData && state.elapsedMs !== undefined && (
        <CompletionModal
          success={state.status === 'success'}
          formData={lastFormData}
          elapsedMs={state.elapsedMs}
          errorMessage={state.errorMessage}
          onClose={handleResultClose}
        />
      )}
    </div>
  );
}

export default App;
