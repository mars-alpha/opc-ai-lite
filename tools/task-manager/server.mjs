import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readSnapshot } from './model.mjs';
import { createAnalysisService } from './analysis-service.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const port = Number(process.argv.find(x => x.startsWith('--port='))?.split('=')[1] || 4317);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('端口必须在1024–65535之间');
const assets = { '/': ['index.html', 'text/html'], '/app.js': ['app.js', 'text/javascript'], '/style.css': ['style.css', 'text/css'] };
let cached, pending, cacheTime = 0;
async function getSnapshot(force = false) {
  if (force || !cached || Date.now() - cacheTime > 10000) {
    pending ||= readSnapshot(root).then(value => { cached = value; cacheTime = Date.now(); }).finally(() => { pending = null; });
    await pending;
  }
  return cached;
}
const analysis = createAnalysisService(root, getSnapshot);
export const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  const host = req.headers.host;
  if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) { res.writeHead(403); res.end('Forbidden host'); return; }
  if (req.method !== 'GET' && !(req.method === 'POST' && req.url === '/api/analysis')) { res.writeHead(405); res.end('Read only'); return; }
  try {
    if (req.url === '/api/analysis') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (req.method === 'GET') { res.end(JSON.stringify(await analysis.get())); return; }
      if (req.headers.origin !== 'http://' + host || req.headers['x-task-manager-action'] !== 'analyze' || req.headers['sec-fetch-site'] === 'cross-site' || !req.headers['content-type']?.startsWith('application/json')) { res.writeHead(403); res.end(JSON.stringify({ error: 'AI_ORIGIN_REQUIRED' })); return; }
      let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 1024) { res.writeHead(413); res.end(JSON.stringify({ error: 'AI_BODY_TOO_LARGE' })); return; } }
      if (body.trim() !== '{}') { res.writeHead(400); res.end(JSON.stringify({ error: 'AI_BODY_INVALID' })); return; }
      try { const state = await analysis.start(); res.writeHead(202); res.end(JSON.stringify(state)); }
      catch (error) { const known = ['AI_BUSY', 'AI_COOLDOWN', 'AI_NOT_CONFIGURED', 'AI_SOURCE_UNAVAILABLE', 'AI_INPUT_TOO_LARGE', 'AI_SECRET_REJECTED']; const code = known.includes(error.message) ? error.message : 'AI_REQUEST_FAILED'; res.writeHead(code === 'AI_BUSY' || code === 'AI_COOLDOWN' ? 409 : 422); res.end(JSON.stringify({ error: code })); }
      return;
    }
    if (req.url === '/api/snapshot') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(await getSnapshot())); return;
    }
    const asset = assets[req.url];
    if (!asset) { res.writeHead(404); res.end('Not found'); return; }
    res.setHeader('Content-Type', asset[1] + '; charset=utf-8'); res.end(await readFile(new URL('public/' + asset[0], import.meta.url)));
  } catch { res.writeHead(500); res.end('读取失败，请检查仓库文件与Git状态后重试。'); }
});
server.listen(port, '127.0.0.1', () => console.log(`独立任务管理器 http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? '端口已占用，请使用 --port=4318' : '任务管理器启动失败'); process.exitCode = 1; });
