import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAnalysisInput, analysisFingerprint, validateAnalysis, createReport } from './analysis.mjs';

export function runAnalysisWorker(root, input, configOnly = false) {
  return new Promise((resolveWorker, reject) => {
    const envFile = resolve(root, '.env.local');
    const args = [...(existsSync(envFile) ? ['--env-file=' + envFile] : []), '--conditions=react-server', '--import', 'tsx', fileURLToPath(new URL('./analysis-worker.mjs', import.meta.url)), ...(configOnly ? ['--config-only'] : [])];
    const child = spawn(process.execPath, args, { cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'] });
    let output = '', ended = false;
    const fail = code => { if (ended) return; ended = true; clearTimeout(timer); child.kill(); reject(new Error(code)); };
    const timer = setTimeout(() => fail('AI_TIMEOUT'), configOnly ? 15000 : 195000);
    child.on('error', () => fail('AI_WORKER_FAILED'));
    child.stdin.on('error', () => {});
    child.stdout.on('data', chunk => { output += chunk; if (output.length > 300000) fail('AI_OUTPUT_TOO_LARGE'); });
    child.on('close', () => { if (ended) return; ended = true; clearTimeout(timer); try { const value = JSON.parse(output); if (value.error) reject(new Error(value.error)); else resolveWorker(value); } catch { reject(new Error('AI_WORKER_FAILED')); } });
    child.stdin.end(configOnly ? '' : JSON.stringify(input));
  });
}

export function createAnalysisService(root, getSnapshot, { worker = runAnalysisWorker } = {}) {
  const file = resolve(root, '.runtime/task-manager/ai-analysis.json');
  let status = 'idle', error = '', report = null, startedAt = null, saved = true, lastStarted = 0, starting = false;
  const config = worker(root, null, true).catch(() => ({ configured: false, model: '', provider: '' }));
  const loaded = readFile(file, 'utf8').then(text => { const cached = JSON.parse(text); report = createReport(validateAnalysis(cached.analysis, cached.input), cached.input, cached.metadata); status = 'succeeded'; }).catch(() => {});
  return {
    async get() { await loaded; const snapshot = await getSnapshot(); let fingerprint = ''; try { fingerprint = analysisFingerprint(snapshot); } catch {} return { status, error, startedAt, saved, report, ...(await config), stale: !!report && report.inputFingerprint !== fingerprint, currentFingerprint: fingerprint }; },
    async start() {
      await loaded;
      if (status === 'running' || starting) throw new Error('AI_BUSY');
      if (Date.now() - lastStarted < 15000) throw new Error('AI_COOLDOWN');
      starting = true;
      try {
      if (!(await config).configured) throw new Error('AI_NOT_CONFIGURED');
      const snapshot = await getSnapshot(true), input = buildAnalysisInput(snapshot);
      status = 'running'; error = ''; startedAt = new Date().toISOString(); lastStarted = Date.now();
      // One explicit action produces one provider call. No automatic retry or scheduling.
      worker(root, input).then(async result => {
        const analysis = validateAnalysis(result.analysis, input);
        const metadata = { model: result.model, provider: result.provider, usage: result.usage, createdAt: new Date().toISOString() };
        report = createReport(analysis, input, metadata); saved = true;
        try { await mkdir(resolve(root, '.runtime/task-manager'), { recursive: true }); await writeFile(file + '.tmp', JSON.stringify({ input, analysis, metadata }), { mode: 0o600 }); await rename(file + '.tmp', file); } catch { saved = false; }
        status = 'succeeded';
      }).catch(reason => { status = 'failed'; error = reason.message; });
      return { status, startedAt };
      } finally { starting = false; }
    }
  };
}
