import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamMigration } from './api';
import type { MigrationEvent } from './api';

// ReadableStream 으로 SSE 텍스트를 흘려주는 mock fetch 헬퍼
function mockFetchWithSSE(events: object[]) {
  const text = events.map(e => `data: ${JSON.stringify(e)}\n\n`).join('');
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: stream }));
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('streamMigration — SSE 이벤트 파싱', () => {
  it('step-start 이벤트를 파싱하여 onEvent 를 호출한다', async () => {
    const events: MigrationEvent[] = [{ type: 'step-start', name: 'delete-all' }];
    mockFetchWithSSE(events);

    const received: MigrationEvent[] = [];
    const controller = streamMigration('1', e => received.push(e));

    await new Promise(r => setTimeout(r, 50));
    controller.abort();

    expect(received).toContainEqual({ type: 'step-start', name: 'delete-all' });
  });

  it('step-done 이벤트를 파싱한다', async () => {
    mockFetchWithSSE([{ type: 'step-done', name: 'prescription' }]);

    const received: MigrationEvent[] = [];
    streamMigration('1', e => received.push(e));
    await new Promise(r => setTimeout(r, 50));

    expect(received[0]).toEqual({ type: 'step-done', name: 'prescription' });
  });

  it('step-error 이벤트와 message 를 파싱한다', async () => {
    mockFetchWithSSE([{ type: 'step-error', name: 'patient', message: 'DB 오류' }]);

    const received: MigrationEvent[] = [];
    streamMigration('1', e => received.push(e));
    await new Promise(r => setTimeout(r, 50));

    expect(received[0]).toEqual({ type: 'step-error', name: 'patient', message: 'DB 오류' });
  });

  it('complete 이벤트를 파싱한다', async () => {
    mockFetchWithSSE([{ type: 'complete', success: true }]);

    const received: MigrationEvent[] = [];
    streamMigration('1', e => received.push(e));
    await new Promise(r => setTimeout(r, 50));

    expect(received[0]).toEqual({ type: 'complete', success: true });
  });

  it('한 청크에 여러 이벤트가 있을 때 모두 파싱한다', async () => {
    mockFetchWithSSE([
      { type: 'step-start', name: 'delete-all' },
      { type: 'step-done',  name: 'delete-all' },
      { type: 'step-start', name: 'stage-create' },
    ]);

    const received: MigrationEvent[] = [];
    streamMigration('1', e => received.push(e));
    await new Promise(r => setTimeout(r, 50));

    expect(received).toHaveLength(3);
    expect(received[0].type).toBe('step-start');
    expect(received[1].type).toBe('step-done');
    expect(received[2].name).toBe('stage-create');
  });

  it('잘못된 JSON 라인은 조용히 무시한다', async () => {
    const text = `data: {invalid json}\n\ndata: ${JSON.stringify({ type: 'complete', success: true })}\n\n`;
    const stream = new ReadableStream({
      start(c) { c.enqueue(new TextEncoder().encode(text)); c.close(); },
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: stream }));

    const received: MigrationEvent[] = [];
    streamMigration('1', e => received.push(e));
    await new Promise(r => setTimeout(r, 50));

    // 잘못된 JSON 은 무시되고 complete 이벤트만 수신
    expect(received).toHaveLength(1);
    expect(received[0].type).toBe('complete');
  });

  it('fetch 실패 시 error 이벤트를 발생시킨다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network Error')));

    const received: MigrationEvent[] = [];
    streamMigration('1', e => received.push(e));
    await new Promise(r => setTimeout(r, 50));

    expect(received[0]).toEqual({ type: 'error', message: 'Network Error' });
  });

  it('AbortController 로 취소하면 onEvent 가 더 이상 호출되지 않는다', async () => {
    // 스트림을 열어두고 abort
    const stream = new ReadableStream({ start() {} }); // 데이터 없이 열린 상태 유지
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, body: stream }));

    const received: MigrationEvent[] = [];
    const controller = streamMigration('1', e => received.push(e));
    controller.abort();

    await new Promise(r => setTimeout(r, 50));
    expect(received).toHaveLength(0);
  });

  it('hospitalId 를 body 에 담아 POST /api/insert/all 을 호출한다', async () => {
    mockFetchWithSSE([]);
    streamMigration('HOSP_999', () => {});
    await new Promise(r => setTimeout(r, 50));

    expect(fetch).toHaveBeenCalledWith(
      '/api/insert/all',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ hospitalId: 'HOSP_999' }),
      }),
    );
  });
});
