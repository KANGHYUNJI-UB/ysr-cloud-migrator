import { useState } from 'react';
import { Header } from './components/Header';
import { MigrationForm } from './components/MigrationForm';
import { ProgressModal } from './components/ProgressModal';
import { CompletionModal } from './components/CompletionModal';
import { ResultBanner } from './components/ResultBanner';
import { useMigration } from './hooks/useMigration';
import type { MigrationFormData } from './types';

function App() {
  const { state, startMigration, reset } = useMigration();
  const [lastFormData, setLastFormData] = useState<MigrationFormData | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const handleSubmit = (data: MigrationFormData) => {
    setLastFormData(data);
    setShowCompletion(false);
    startMigration(data.hospitalId);
  };

  const handleCompletionClose = () => {
    setShowCompletion(false);
    reset();
    setLastFormData(null);
  };

  // 성공 상태로 전환될 때 완료 모달 표시
  if (state.status === 'success' && !showCompletion) {
    setShowCompletion(true);
  }

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      <Header />

      <main className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-6">
        {/* 오류 배너 */}
        {state.status === 'error' && (
          <ResultBanner
            success={false}
            errorMessage={state.errorMessage}
            onReset={() => { reset(); setLastFormData(null); }}
          />
        )}

        <MigrationForm
          onSubmit={handleSubmit}
          status={state.status}
        />

        <footer className="text-center pb-4">
          <p
            className="text-xs"
            style={{ color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}
          >
            © 2025 의사랑 · 클라우드 전환 시스템 v1.0
          </p>
        </footer>
      </main>

      {/* 진행 모달 */}
      {state.status === 'running' && (
        <ProgressModal steps={state.steps} />
      )}

      {/* 완료 모달 */}
      {showCompletion && lastFormData && state.elapsedMs !== undefined && (
        <CompletionModal
          formData={lastFormData}
          elapsedMs={state.elapsedMs}
          onClose={handleCompletionClose}
        />
      )}
    </div>
  );
}

export default App;
