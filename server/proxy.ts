import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const BASE_URL = 'http://localhost:3000';

const DB_SOURCE = { host: '192.168.245.77', port: 5435, user: 'edba', password: 'ubcare1!', database: 'ysr2000' };
const DB_TARGET = { host: '4.230.53.122', port: 5432, user: 'nextemr', password: 'ubcare1!', database: 'emr_db' };

// 삽입 단계 목록 (hospitalId 독립적인 것들)
const INSERT_STEPS = [
  { name: 'prescription',               path: '/prescription/insert',               method: 'POST' },
  { name: 'medical-drug-material',      path: '/medical-drug-material/insert',      method: 'POST' },
  { name: 'usage-code',                 path: '/usage-code/insert',                 method: 'POST' },
  { name: 'template-code',              path: '/template-code/insert',              method: 'POST' },
  { name: 'bundle-item',                path: '/bundle-item/insert',                method: 'POST' },
  { name: 'bundle-item-detail',         path: '/bundle-item-detail/insert',         method: 'POST' },
  { name: 'patient',                    path: '/patient/insert',                    method: 'POST' },
  { name: 'registration',               path: '/registration/insert',               method: 'POST' },
  { name: 'appointment',                path: '/appointment/insert',                method: 'POST' },
  { name: 'disease',                    path: '/disease/insert',                    method: 'POST' },
  { name: 'order',                      path: '/order/insert',                      method: 'POST' },
  { name: 'vital',                      path: '/vital/insert',                      method: 'POST' },
  { name: 'receipt-settlement-payment', path: '/receipt-settlement-payment/insert', method: 'POST' },
] as const;

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SSE 이관 엔드포인트 — 각 단계를 순서대로 개별 호출
app.post('/api/insert/all', async (req, res) => {
  const { hospitalId } = req.body as { hospitalId?: string };

  if (!hospitalId) {
    res.status(400).json({ message: 'hospitalId 가 누락되었습니다.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const hospitalIdNum = Number(hospitalId);
  const body = JSON.stringify({ source: DB_SOURCE, target: DB_TARGET, hospitalId: hospitalIdNum });

  type StepResult = { success: boolean; error?: string };

  async function runStep(name: string, path: string, method: string, stepBody?: string) {
    send({ type: 'step-start', name });
    await new Promise(r => setTimeout(r, 50)); // step-start가 클라이언트에 먼저 도달하도록 flush
    console.log(`[proxy] 시작: ${method} ${path}`);
    try {
      const upstream = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(method !== 'DELETE' && { body: stepBody }),
      });
      const result = await upstream.json() as StepResult;
      console.log(`[proxy] 완료: ${path} → success=${result.success}`);
      if (result.success) {
        send({ type: 'step-done', name });
        return true;
      } else {
        send({ type: 'step-error', name, message: result.error ?? '오류 발생' });
        return false;
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error(`[proxy] 실패: ${path}`, detail);
      send({ type: 'step-error', name, message: detail });
      return false;
    }
  }

  let overallSuccess = true;

  // 1. DB 연결 초기화
  if (!await runStep('init', '/init', 'POST', body)) overallSuccess = false;

  // 2. 기존 데이터 삭제
  if (!await runStep('delete-all', `/delete/all/${hospitalIdNum}`, 'DELETE')) overallSuccess = false;

  // 3. 스테이징 생성
  if (!await runStep('stage-create', '/stage/create', 'POST', body)) overallSuccess = false;

  // 4. 단계별 삽입
  for (const step of INSERT_STEPS) {
    if (!await runStep(step.name, step.path, step.method, body)) overallSuccess = false;
  }

  send({ type: 'complete', success: overallSuccess });
  res.end();
});

export { app };

if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => {
    console.log(`[proxy] 서버 시작 → http://localhost:${PORT}`);
  });
}
