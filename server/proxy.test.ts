import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from './proxy';

// SSE 응답 텍스트에서 이벤트 배열 추출 헬퍼
function parseSSE(text: string): object[] {
  return text
    .split('\n\n')
    .map(chunk => chunk.replace(/^data:\s*/, '').trim())
    .filter(Boolean)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean) as object[];
}

// 모든 step 요청에 대해 success: true 를 반환하는 mock fetch
function mockAllSuccess() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true }),
  }));
}

// 특정 URL 에서 실패하는 mock fetch
function mockFailAt(failUrl: string) {
  vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
    if ((url as string).includes(failUrl)) {
      return Promise.resolve({ json: () => Promise.resolve({ success: false, error: '테스트 오류' }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({ success: true }) });
  }));
}

beforeEach(() => {
  process.env['NODE_ENV'] = 'test';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// SSE 응답을 버퍼로 수집하는 supertest 요청 헬퍼
async function postMigration(hospitalId?: string) {
  const body = hospitalId !== undefined ? { hospitalId } : {};
  const res = await (request(app)
    .post('/api/insert/all')
    .set('Content-Type', 'application/json')
    .send(body)
    .buffer(true)
    .parse((res, fn) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => fn(null, data));
    }) as unknown as Promise<{ status: number; text: string; body: string }>);
  return res;
}

describe('GET /health', () => {
  it('200 과 ok status 를 반환한다', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/insert/all — 입력 검증', () => {
  it('hospitalId 가 없으면 400 을 반환한다', async () => {
    const res = await request(app)
      .post('/api/insert/all')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('hospitalId');
  });
});

describe('POST /api/insert/all — SSE 헤더', () => {
  it('Content-Type 이 text/event-stream 이다', async () => {
    mockAllSuccess();
    const res = await postMigration('1');
    expect((res as any).headers?.['content-type']).toMatch(/text\/event-stream/);
  });
});

describe('POST /api/insert/all — 정상 이관', () => {
  it('모든 단계가 step-start → step-done 순서로 전달된다', async () => {
    mockAllSuccess();
    const res = await postMigration('1');
    const events = parseSSE(res.body as unknown as string) as Array<{ type: string; name?: string }>;

    const stepStarts = events.filter(e => e.type === 'step-start').map(e => e.name);
    const stepDones  = events.filter(e => e.type === 'step-done').map(e => e.name);

    expect(stepStarts).toEqual(stepDones); // 시작된 단계는 모두 완료
  });

  it('complete 이벤트가 마지막에 오고 success 가 true 이다', async () => {
    mockAllSuccess();
    const res = await postMigration('1');
    const events = parseSSE(res.body as unknown as string) as Array<{ type: string; success?: boolean }>;
    const last = events[events.length - 1];

    expect(last).toEqual({ type: 'complete', success: true });
  });

  it('총 16단계 + complete 로 총 33개 이벤트가 전송된다 (step-start 16 + step-done 16 + complete 1)', async () => {
    mockAllSuccess();
    const res = await postMigration('1');
    const events = parseSSE(res.body as unknown as string);

    expect(events).toHaveLength(33);
  });

  it('init 이 첫 번째 단계이다', async () => {
    mockAllSuccess();
    const res = await postMigration('1');
    const events = parseSSE(res.body as unknown as string) as Array<{ type: string; name?: string }>;

    expect(events[0]).toEqual({ type: 'step-start', name: 'init' });
  });

  it('receipt-settlement-payment 가 마지막 삽입 단계이다', async () => {
    mockAllSuccess();
    const res = await postMigration('1');
    const events = parseSSE(res.body as unknown as string) as Array<{ type: string; name?: string }>;
    const dones = events.filter(e => e.type === 'step-done');

    expect(dones[dones.length - 1].name).toBe('receipt-settlement-payment');
  });
});

describe('POST /api/insert/all — 단계 실패', () => {
  it('단계 실패 시 step-error 이벤트가 전송된다', async () => {
    mockFailAt('/patient/insert');
    const res = await postMigration('1');
    const events = parseSSE(res.body as unknown as string) as Array<{ type: string; name?: string; message?: string }>;

    const errorEvent = events.find(e => e.type === 'step-error' && e.name === 'patient');
    expect(errorEvent).toBeDefined();
    expect(errorEvent?.message).toBe('테스트 오류');
  });

  it('단계 실패 시 complete 이벤트의 success 가 false 이다', async () => {
    mockFailAt('/stage/create');
    const res = await postMigration('1');
    const events = parseSSE(res.body as unknown as string) as Array<{ type: string; success?: boolean }>;
    const complete = events.find(e => e.type === 'complete');

    expect(complete?.success).toBe(false);
  });

  it('fetch 예외 발생 시 step-error 이벤트가 전송된다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));
    const res = await postMigration('1');
    const events = parseSSE(res.body as unknown as string) as Array<{ type: string; message?: string }>;

    const errorEvent = events.find(e => e.type === 'step-error');
    expect(errorEvent?.message).toContain('Connection refused');
  });
});
