import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('模型失败只返回脱敏分类，并区分截断、网络与超时', async () => {
  const { classifyAiFailure } = await import('./analysis.mjs');
  assert.equal(classifyAiFailure(new SyntaxError('sensitive payload'), 'length'), 'AI_OUTPUT_TRUNCATED');
  assert.equal(classifyAiFailure(new SyntaxError('sensitive payload')), 'AI_ANALYSIS_INVALID_JSON');
  assert.equal(classifyAiFailure(new TypeError('secret endpoint')), 'AI_NETWORK_FAILED');
  assert.equal(classifyAiFailure({ name: 'TimeoutError', message: 'secret' }), 'AI_TIMEOUT');
  assert.equal(classifyAiFailure(new Error('secret')), 'AI_REQUEST_FAILED');
});

const snapshot = { tasks: [{ id: 'a', title: '修复输入', text: '输入修复通过，尚未部署。', section: 'NOW', status: 'active', deployment: 'not_deployed', source: 'TASKS.md', line: 7, links: [] }], governance: [{ id: 'b', path: 'scripts/seed-old.ts', reason: '仍有现役引用', action: '保留入口复核', risk: '外部调用未知', validation: '核对引用后验证', references: ['package.json'] }], versions: { development: { commit: 'abc', dirty: true, changes: 2 }, candidate: { value: '待核实' }, web: { value: 'v1' }, system: { value: 'v1' }, relay: { value: 'v2' } }, sources: [{ path: 'TASKS.md', available: true }], errors: [] };
const result = { summary: '先补发布证据，再治理', items: [{ id: 'task:a', priority: 'P1', reason: '开发通过但尚未上线', undeployedReason: '原文只说明未部署，具体原因UNKNOWN', governanceReason: '不适用', recommendation: '核对候选清单与发布门槛', dependsOn: [], evidence: [{ id: 'task:a', quote: '尚未部署' }] }, { id: 'governance:b', priority: 'P3', reason: '现役入口需保留', undeployedReason: '不适用', governanceReason: '用途结束与否未知', recommendation: '核对生命周期与外部调用', dependsOn: ['task:a'], evidence: [{ id: 'governance:b', quote: '仍有现役引用' }] }] };

result.nextPlan = [{ id: 'task:a', blockerAnalysis: '缺少发布条件核验', requirements: ['核对输入修复结果'], boundaries: ['不部署'], acceptance: ['相关回归通过'], governance: ['保留现役脚本'], steps: ['读取事实并核对阻塞', '验证最小修复'], selfCheck: ['核对差异和证据'], correction: ['失败先定位原因，修复并重测'] }];

test('近期计划必须列需求边界验收治理自检与修正，Prompt包含具体计划', async () => {
  const { buildAnalysisInput, validateAnalysis, createReport } = await import('./analysis.mjs');
  const input = buildAnalysisInput(snapshot), copy = structuredClone(result);
  for (const field of ['requirements', 'boundaries', 'acceptance', 'governance', 'steps', 'selfCheck', 'correction']) {
    const broken = structuredClone(copy); delete broken.nextPlan[0][field]; assert.throws(() => validateAnalysis(broken, input));
  }
  const report = createReport(validateAnalysis(copy, input), input);
  assert.match(report.nextPlan[0].codexPrompt, /核对输入修复结果/);
  assert.match(report.codexPrompt, /自我检查/);
  assert.match(report.codexPrompt, /失败先定位原因/);
  copy.nextPlan.unshift({ ...structuredClone(copy.nextPlan[0]), id: 'governance:b' });
  assert.equal(createReport(validateAnalysis(copy, input), input).nextPlan[0].id, 'task:a');
});

test('AI输入只有任务和版本/治理证据，不带文档全文或配置', async () => {
  const { buildAnalysisInput } = await import('./analysis.mjs');
  const input = buildAnalysisInput({ ...snapshot, documents: { '.env.local': 'API_KEY=do-not-send' } });
  assert.equal(input.contractVersion, 'dev-task-analysis-v2');
  assert.equal(input.units.length, 2);
  assert.ok(!JSON.stringify(input).includes('do-not-send'));
});

test('校验完整覆盖、有效ID、真实引文与依赖环', async () => {
  const { buildAnalysisInput, validateAnalysis } = await import('./analysis.mjs');
  const input = buildAnalysisInput(snapshot);
  assert.equal(validateAnalysis(result, input).items.length, 2);
  for (const mutate of [r => r.items.pop(), r => { r.items[0].id = 'invented'; }, r => { r.items[0].evidence[0].quote = '已经批准发布'; }, r => { r.items[0].dependsOn = ['governance:b']; }]) {
    const copy = structuredClone(result); mutate(copy); assert.throws(() => validateAnalysis(copy, input));
  }
});

test('排序与Codex Prompt由Core生成，保留当前事实核验和发布/删除边界', async () => {
  const { buildAnalysisInput, validateAnalysis, createReport } = await import('./analysis.mjs');
  const input = buildAnalysisInput(snapshot);
  const report = createReport(validateAnalysis(result, input), input, { model: 'test', usage: {} });
  assert.equal(report.items[0].rank, 1);
  assert.match(report.codexPrompt, /TASKS.md:7/);
  assert.match(report.codexPrompt, /未经.*批准.*部署/);
  assert.match(report.codexPrompt, /先核对/);
  assert.match(report.items[1].codexPrompt, /现役引用/);
});

test('指纹忽略读取时间，但任务/版本/治理变化使结果失效', async () => {
  const { analysisFingerprint } = await import('./analysis.mjs');
  const first = analysisFingerprint(snapshot);
  assert.equal(analysisFingerprint({ ...snapshot, generatedAt: 'new' }), first);
  const other = structuredClone(snapshot); other.tasks[0].text += ' 新阻塞';
  assert.notEqual(analysisFingerprint(other), first);
});

test('密钥反射、伪造优先级以及缺少理由必须拒绝', async () => {
  const { buildAnalysisInput, validateAnalysis, assertNoSecrets } = await import('./analysis.mjs');
  assert.throws(() => assertNoSecrets('test-sensitive-key', ['test-sensitive-key']));
  const input = buildAnalysisInput(snapshot), copy = structuredClone(result); copy.items[0].priority = 'APPROVED';
  assert.throws(() => validateAnalysis(copy, input));
  copy.items[0].priority = 'P1'; copy.items[0].reason = '';
  assert.throws(() => validateAnalysis(copy, input));
});

test('推进顺序先满足依赖，再按P0-P3选择可执行项', async () => {
  const { buildAnalysisInput, validateAnalysis, createReport } = await import('./analysis.mjs');
  const input = buildAnalysisInput(snapshot), copy = structuredClone(result);
  copy.items[0].dependsOn = ['governance:b']; copy.items[1].dependsOn = [];
  const report = createReport(validateAnalysis(copy, input), input);
  assert.equal(report.items[0].id, 'governance:b');
});

test('两个并发分析只允许一次Provider调用，缓存重载不调用模型', async t => {
  const { createAnalysisService } = await import('./analysis-service.mjs');
  const root = await mkdtemp(join(tmpdir(), 'opc-task-ai-')); t.after(() => rm(root, { recursive: true, force: true }));
  let calls = 0, finish;
  const worker = async (_root, _input, configOnly) => configOnly ? { configured: true, model: 'mock', provider: 'mock' } : (calls++, new Promise(resolve => { finish = resolve; }));
  const service = createAnalysisService(root, async () => snapshot, { worker });
  const attempts = await Promise.allSettled([service.start(), service.start()]);
  assert.equal(attempts.filter(a => a.status === 'fulfilled').length, 1);
  assert.equal(calls, 1);
  finish({ analysis: result, model: 'mock', provider: 'mock', usage: {} });
  for (let i = 0; i < 100 && (await service.get()).status === 'running'; i++) await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal((await service.get()).status, 'succeeded');
  const reloaded = createAnalysisService(root, async () => snapshot, { worker });
  assert.equal((await reloaded.get()).report.items.length, 2);
  assert.equal(calls, 1);
});
