export interface MigrationEvent {
  type: 'step-start' | 'step-done' | 'step-error' | 'complete' | 'error';
  name?: string;
  message?: string;
  success?: boolean;
}

export function streamMigration(
  hospitalId: string,
  onEvent: (event: MigrationEvent) => void,
): AbortController {
  const controller = new AbortController();

  (async () => {
    let res: Response;
    try {
      res = await fetch('/api/insert/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospitalId }),
        signal: controller.signal,
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      onEvent({ type: 'error', message: err instanceof Error ? err.message : '연결 오류' });
      return;
    }

    if (!res.body) {
      onEvent({ type: 'error', message: '응답 스트림을 받을 수 없습니다.' });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';

        for (const chunk of chunks) {
          const line = chunk.replace(/^data:\s*/, '').trim();
          if (!line) continue;
          try {
            onEvent(JSON.parse(line) as MigrationEvent);
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        onEvent({ type: 'error', message: err.message });
      }
    }
  })();

  return controller;
}
