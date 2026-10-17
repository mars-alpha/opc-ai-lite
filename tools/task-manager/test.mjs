import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { fileURLToPath } from 'node:url';

test('独立任务读取器存在', () => {
  assert.ok(existsSync(new URL('./model.mjs', import.meta.url)), '需要实现独立任务读取器');
});

test('显式未部署及质量阻塞不能被开发通过覆盖', async () => {
  const { parseTasks } = await import('./model.mjs');
  const tasks = parseTasks('# NOW\n\n5B开发验收通过，尚未部署；质量NOT_ACCEPTED / RELEASE_NOT_READY。下一步补正例。\n\n# NEXT\n\n- 继续观察72小时。');
  assert.equal(tasks[0].status, 'blocked');
  assert.equal(tasks[0].deployment, 'not_deployed');
  assert.match(tasks[0].next, /补正例/);
  assert.equal(tasks[1].status, 'planned');
  assert.equal(tasks[0].line, 3);
});

test('审核、未知和稳定ID', async () => {
  const { parseTasks } = await import('./model.mjs');
  const source = '# NOW\n\n- 算法菜单已实现，UI_NOT_REVIEWED，未部署。\n- 调研新版解析器。';
  const a = parseTasks(source);
  assert.equal(a[0].status, 'review');
  assert.equal(a[1].deployment, 'unknown');
  assert.equal(a[0].id, parseTasks('\n' + source)[0].id);
  assert.equal(parseTasks('# NOW\n\n来源传输已发布，长期观察未完成。')[0].status, 'observing');
});

test('版本区分开发与生产记录，不将package版本当部署版本', async () => {
  const { parseVersions } = await import('./model.mjs');
  const v = parseVersions('current指向/opt/releases/20261016-p3-gap-fix；Web为/opt/opc-admin-web-p3-gap-fix-20261016；Deno生产为`relay-feed-transport-v16`（revision `0rmfttv53pc6`）。', { commit: 'abc123', dirty: true });
  assert.equal(v.development.commit, 'abc123');
  assert.equal(v.system.value, '20261016-p3-gap-fix');
  assert.equal(v.relay.value, 'relay-feed-transport-v16');
  assert.equal(v.candidate.value, '未登记候选发布版本');
  assert.equal(parseVersions('', {}).system.value, '待核实');
});

test('治理只给出复核提示，不把新文件或validator当成可删除', async () => {
  const { governanceHints } = await import('./model.mjs');
  const files = ['scripts/seed-batch-old.ts', 'scripts/check.ts', 'scripts/new.ts', 'docs/old.md'];
  const hints = governanceHints(files, { 'scripts/seed-batch-old.ts': 'once', 'scripts/check.ts': 'test', 'scripts/new.ts': 'new', 'docs/old.md': 'archive' }, new Set(['scripts/new.ts']));
  assert.ok(hints.some(h => h.path === 'scripts/seed-batch-old.ts'));
  assert.ok(!hints.some(h => h.path === 'scripts/new.ts'));
  assert.ok(hints.every(h => h.action !== '自动删除' && h.reason && h.validation));
  assert.equal(governanceHints(['scripts/check.ts', 'package.json'], { 'scripts/check.ts': '', 'package.json': 'node scripts/check.ts' }, new Set()).length, 0);
});

test('有现役入口的一次性脚本提示保留入口并复核，不能声称无引用', async () => {
  const { governanceHints } = await import('./model.mjs');
  const hints = governanceHints(['scripts/seed-visual.ts', 'package.json'], { 'scripts/seed-visual.ts': 'seed', 'package.json': 'node scripts/seed-visual.ts' });
  assert.equal(hints.length, 1);
  assert.match(hints[0].reason, /现役引用/);
  assert.equal(hints[0].references[0], 'package.json');
});

test('复合段落拆出5H和5J，混合发布记录不能作为全部已部署', async () => {
  const { parseTasks } = await import('./model.mjs');
  const source = '# NOW\n\n5G' + '工程说明'.repeat(130) + '；5H材料修复未部署。5I查询通过未部署。5J证据未完成。';
  const tasks = parseTasks(source);
  assert.ok(tasks.some(t => t.title.startsWith('5J')));
  assert.equal(parseTasks('# NOW\n\nP2已发布；P4未部署。')[0].deployment, 'mixed');
});

test('明确质量未验收显示阻塞；未来规划不冒充进行中', async () => {
  const { parseTasks } = await import('./model.mjs');
  assert.equal(parseTasks('# NOW\n\n工程通过，质量未验收。')[0].status, 'blocked');
  assert.equal(parseTasks('# NOW\n\n后续内容工作台另行规划。')[0].status, 'planned');
});

test('真实HTTP：只读、固定资源、Host限制与事实投影', { timeout: 30000 }, async t => {
  const port = 45000 + process.pid % 10000;
  const child = spawn(process.execPath, [fileURLToPath(new URL('./server.mjs', import.meta.url)), '--port=' + port], { stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('测试服务启动超时')), 10000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error('测试服务退出：' + code)); });
  });
  const url = 'http://127.0.0.1:' + port;
  const page = await fetch(url);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /default-src 'self'/);
  assert.match(await page.text(), /独立项目控制台/);
  assert.equal((await fetch(url + '/api/snapshot', { method: 'POST' })).status, 405);
  assert.equal((await fetch(url + '/.env.local')).status, 404);
  assert.equal((await fetch(url + '/api/analysis', { method: 'POST', body: '{}' })).status, 403);
  assert.equal((await fetch(url + '/api/analysis', { method: 'POST', headers: { origin: 'https://unexpected.example', 'content-type': 'application/json', 'x-task-manager-action': 'analyze' }, body: '{}' })).status, 403);
  const aiStatus = await (await fetch(url + '/api/analysis')).json();
  assert.equal(typeof aiStatus.configured, 'boolean');
  assert.ok(!JSON.stringify(aiStatus).includes('apiKey'));
  const rejectedHost = await new Promise((resolve, reject) => { const req = request(url, { headers: { host: 'unexpected.example' } }, res => { res.resume(); resolve(res.statusCode); }); req.on('error', reject); req.end(); });
  assert.equal(rejectedHost, 403);
  const snapshot = await (await fetch(url + '/api/snapshot')).json();
  assert.ok(snapshot.tasks.length > 0);
  assert.equal(Object.keys(snapshot.documents).length, 3);
  assert.ok(!JSON.stringify(snapshot).includes('DATABASE_URL='));
});
