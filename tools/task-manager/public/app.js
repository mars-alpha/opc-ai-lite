const $ = selector => document.querySelector(selector);
const labels = { active: '进行中', blocked: '已阻塞', review: '待体验审核', observing: '持续观察', planned: '计划中', done: '已完成记录', not_deployed: '明确未部署', deployed: '已有部署记录', mixed: '部分部署 / 混合记录', unknown: '部署待核实' };
const storageKey = 'opc-independent-task-manager-v1';
let data, busy = false, view = 'tasks', local = { notes: {}, hidden: [] }, toastTimer;
try { const value = JSON.parse(localStorage.getItem(storageKey)); if (value && typeof value.notes === 'object' && value.notes !== null && Array.isArray(value.hidden)) local = value; } catch { /* Storage may be disabled; the read model still works. */ }
function el(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
function toast(text) { $('#toast').textContent = text; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 3000); }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(local)); return true; } catch { toast('浏览器存储不可用，本次补充仅在当前页面保留'); return false; } }
function badge(value) { return el('span', labels[value] || value, 'badge ' + value); }
function time(value) { return value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) + ' 北京时间' : '未知'; }
function empty(target, text) { target.append(el('div', text, 'empty')); }
function openSource(path) { setView('sources'); const item = [...$('#sources').children].find(n => n.dataset.path === path); if (item) { item.querySelector('details').open = true; item.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }
function setView(next) { view = next; for (const key of ['tasks', 'ai', 'governance', 'sources']) $('#' + key + '-view').hidden = key !== view; document.querySelectorAll('[data-view]').forEach(n => { n.classList.toggle('active', n.dataset.view === view); n.setAttribute('aria-current', n.dataset.view === view ? 'page' : 'false'); }); if (view === 'ai') loadAnalysis(); }
function renderTasks() {
  const target = $('#tasks'); target.replaceChildren();
  const query = $('#search').value.trim().toLocaleLowerCase();
  const tasks = data.tasks.filter(t => (!query || (t.text + t.next + (local.notes[t.id] || '')).toLocaleLowerCase().includes(query)) && (!$('#section').value || t.section === $('#section').value) && (!$('#status').value || t.status === $('#status').value) && (!$('#deployment').value || t.deployment === $('#deployment').value));
  $('#task-count').textContent = tasks.length + '/' + data.tasks.length;
  for (const task of tasks) {
    const card = el('article', undefined, 'task'); card.dataset.status = task.status;
    const inner = el('div', undefined, 'task-inner'), top = el('div', undefined, 'task-top');
    top.append(el('span', task.section, 'scope'), badge(task.status), badge(task.deployment));
    inner.append(top, el('h3', task.title), el('p', task.text, 'excerpt'));
    if (task.blockers.length) inner.append(el('p', '阻塞 / 待补：' + task.blockers.join('；'), 'blocker'));
    const next = el('div', undefined, 'next'); next.append(el('b', '下一步建议 · 辅助提示'), el('span', task.next)); inner.append(next);
    const detail = el('details'), summary = el('summary', '进度证据、原文与补充'); detail.append(summary);
    if (task.milestones.length) { const list = el('ul'); task.milestones.forEach(text => list.append(el('li', text))); detail.append(list); }
    detail.append(el('pre', task.text), el('p', '责任归属：' + task.owner));
    task.links.forEach(path => detail.append(el('p', '关联证据：' + path)));
    const note = el('div', undefined, 'note'), input = el('textarea'); input.value = local.notes[task.id] || ''; input.maxLength = 5000; input.id = 'note-' + task.id;
    const label = el('label', '本地补充 / 下一步提醒（不改正式任务）'); label.htmlFor = input.id;
    const button = el('button', '保存补充'); button.onclick = () => { local.notes[task.id] = input.value; if (save()) toast('补充已保存在当前浏览器'); };
    const clear = el('button', '清除补充'); clear.onclick = () => { delete local.notes[task.id]; input.value = ''; save(); toast('本地补充已清除'); };
    note.append(label, input, button, clear); detail.append(note); inner.append(detail); card.append(inner);
    const bottom = el('div', undefined, 'task-bottom'), source = el('button', task.source + ':' + task.line, 'source-button'); source.onclick = () => openSource(task.source); bottom.append(source, el('span', '按原文推导 · 无完成率估算')); card.append(bottom); target.append(card);
  }
  if (!tasks.length) empty(target, '没有匹配任务，尝试调整搜索或筛选条件。');
}
function renderGovernance() {
  const target = $('#governance'); target.replaceChildren(); const all = $('#show-hidden').checked;
  const hints = data.governance.filter(h => all || !local.hidden.includes(h.id));
  $('#hint-count').textContent = data.governance.filter(h => !local.hidden.includes(h.id)).length;
  for (const hint of hints) {
    const hidden = local.hidden.includes(hint.id), card = el('article', undefined, 'hint' + (hidden ? ' hidden-hint' : '')), head = el('div', undefined, 'hint-head'), title = el('div');
    title.append(el('span', hint.kind + (hidden ? ' · 已隐藏' : ''), 'eyebrow'), el('h3', hint.path));
    const button = el('button', hidden ? '恢复提示' : '清除此提示'); button.onclick = () => { local.hidden = hidden ? local.hidden.filter(id => id !== hint.id) : [...new Set([...local.hidden, hint.id])]; save(); renderGovernance(); }; head.append(title, button);
    card.append(head, el('p', '理由：' + hint.reason), el('p', '建议：' + hint.action));
    const detail = el('details'); detail.append(el('summary', '风险、引用与验证步骤'), el('p', hint.risk), el('p', hint.validation), el('p', '已找到引用：' + (hint.references.join('、') || '本次文本扫描未找到；不等于没有外部调用'))); card.append(detail); target.append(card);
  }
  if (!hints.length) empty(target, data.governance.length ? '提示已清除，可通过“恢复全部提示”重新查看。' : '本次扫描没有产生治理候选；不代表全仓库没有历史资产。');
}
function render() {
  const metrics = $('#metrics'); metrics.replaceChildren();
  for (const [label, status] of [['全部任务', ''], ['进行中', 'active'], ['已阻塞', 'blocked'], ['待体验审核', 'review'], ['持续观察', 'observing'], ['明确未部署', 'not_deployed']]) {
    const button = el('button', undefined, 'metric'); button.dataset.status = status; button.append(el('span', label), el('strong', status ? data.tasks.filter(t => t.status === status || t.deployment === status).length : data.tasks.length));
    button.onclick = () => { $('#status').value = status === 'not_deployed' ? '' : status; $('#deployment').value = status === 'not_deployed' ? status : ''; $('#section').value = ''; $('#search').value = ''; setView('tasks'); renderTasks(); }; metrics.append(button);
  }
  const target = $('#versions'), versions = data.versions; target.replaceChildren();
  for (const [key, title] of [['development', '01 / 当前开发'], ['candidate', '02 / 待部署候选'], ['web', '03 / 线上 Web'], ['system', '04 / 线上 SYSTEM'], ['relay', '05 / 线上 Relay']]) {
    const value = versions[key], item = el('div', undefined, 'version'); item.append(el('div', title, 'version-label'), el('strong', key === 'development' ? value.commit : value.value));
    if (key === 'development') item.append(el('small', value.branch + ' · ' + (value.dirty ? value.changes + ' 项未提交变化' : '工作区干净')));
    if (key === 'relay') item.append(el('small', 'revision ' + versions.relayRevision));
    item.append(el('small', value.verification));
    if (value.evidence) { const details = el('details'); details.append(el('summary', '查看记录证据'), el('p', value.evidence)); item.append(details); }
    target.append(item);
  }
  $('#updated').textContent = '读取于 ' + time(data.generatedAt); $('#scan').textContent = '已核对 ' + data.scan.files + ' 个文本文件'; $('#scan-scope').textContent = data.scan.scope + '；跳过 ' + data.scan.skipped + ' 个大文件或不可读路径。';
  const sources = $('#sources'); sources.replaceChildren();
  for (const source of data.sources) { const item = el('article', undefined, 'source-item'); item.dataset.path = source.path; item.append(el('h3', source.path), el('small', source.available ? '文件修改时间：' + time(source.modifiedAt) : '事实源不可用')); const detail = el('details'); detail.append(el('summary', '展开当前原文'), el('pre', data.documents[source.path])); item.append(detail); sources.append(item); }
  renderVersionComparison(); renderTasks(); renderGovernance();
}
let baselineSha = '';
function renderVersionComparison() {
  let explorer = $('#version-explorer');
  if (!explorer) { explorer = el('div'); explorer.id = 'version-explorer'; $('.version-panel').append(explorer); }
  explorer.replaceChildren();
  const history = data.versionHistory;
  if (!history?.commits.length) { empty(explorer, 'Git版本历史暂不可用。'); return; }
  const current = history.commits[0];
  if (!history.commits.some(c => c.sha === baselineSha)) baselineSha = (history.commits[1] || current).sha;
  const baseline = history.commits.find(c => c.sha === baselineSha), comparison = history.comparisons.find(c => c.sha === baselineSha);
  explorer.append(el('h3', 'Git 版本时间线 / 可恢复提交'), el('p', '选择一个提交作为对比基线。仅查看，不切换分支或执行回退。', 'explain'));
  const timeline = el('div', undefined, 'git-timeline');
  history.commits.forEach((commit, index) => {
    const button = el('button', undefined, 'git-node' + (commit.sha === baselineSha ? ' selected' : ''));
    button.setAttribute('aria-pressed', String(commit.sha === baselineSha));
    button.append(el('strong', commit.short + (index === 0 ? ' · HEAD' : '')), el('span', commit.date.slice(0, 10)), el('span', commit.title), el('small', commit.deployment === 'current' ? '当前已部署（文档绑定）' : commit.deployment === 'previous' ? '前版部署（文档绑定）' : '是否曾部署：待核实'));
    button.onclick = () => { baselineSha = commit.sha; renderVersionComparison(); }; timeline.append(button);
  });
  explorer.append(timeline);
  const head = el('div', undefined, 'compare-head'), label = el('label', '选择对比基线 '), select = el('select'); select.id = 'version-baseline'; select.setAttribute('aria-label', '选择对比基线');
  history.commits.forEach(commit => { const option = el('option', commit.short + ' · ' + commit.title); option.value = commit.sha; select.append(option); });
  select.value = baselineSha; select.onchange = () => { baselineSha = select.value; renderVersionComparison(); }; label.append(select); head.append(el('h3', '基线 → 当前工作区'), label); explorer.append(head);
  const table = el('table', undefined, 'compare-table'), thead = el('thead'), tr = el('tr'); ['比较项', '基线 Git 版本', '当前开发版本'].forEach(text => tr.append(el('th', text))); thead.append(tr); table.append(thead);
  const body = el('tbody');
  const deploymentText = commit => commit.deployment === 'current' ? '当前已部署（文档绑定）' : commit.deployment === 'previous' ? '前版已部署（文档绑定）' : 'UNKNOWN · 未登记Git与release绑定';
  for (const row of [
    ['Git提交', baseline.sha, current.sha],
    ['记录时间', time(baseline.date), time(current.date)],
    ['是否部署上线', deploymentText(baseline), deploymentText(current)],
    ['本次提交主题', baseline.title, current.title],
    ['相对基线差异', '已提交快照', comparison.changedFiles + ' 个已跟踪文件变化；另有 ' + history.working.untracked + ' 个未跟踪文件'],
    ['工作区增量', '不包含当前未提交内容', history.working.tracked + ' 个已跟踪文件未提交；' + comparison.stats],
    ['可恢复性', baseline.recoverability, 'HEAD不包含未提交变化；需保留工作区与数据库审计']
  ]) { const rowEl = el('tr'); row.forEach(text => rowEl.append(el('td', text))); body.append(rowEl); }
  table.append(body); const scroll = el('div', undefined, 'table-scroll'); scroll.append(table); explorer.append(scroll);
  const delta = el('div', undefined, 'version-delta');
  const themes = el('section'); themes.append(el('h4', '基线之后新增 / 优化主题（Git记录）'));
  const list = el('ul'); comparison.commitsAfter.forEach(commit => list.append(el('li', commit.sha.slice(0, 7) + ' · ' + commit.title))); if (!comparison.commitsAfter.length) list.append(el('li', '与HEAD相同；差异仅来自当前未提交内容。')); themes.append(list);
  const areas = el('section'); areas.append(el('h4', '变化涉及范围')); comparison.areas.forEach(area => { const meter = el('div', undefined, 'area-meter'); const bar = el('span'); bar.style.setProperty('--area-width', Math.max(2, Math.round(area.count / Math.max(1, comparison.changedFiles) * 100)) + '%'); meter.append(el('span', area.area + ' · ' + area.count), bar); areas.append(meter); }); delta.append(themes, areas); explorer.append(delta);
  const release = history.releases, releaseGrid = el('div', undefined, 'release-pair');
  for (const [title, value] of [['当前线上记录', release.current], ['生产回退记录', release.rollback]]) {
    const card = el('section', undefined, 'release-record'); card.append(el('h4', title), el('strong', 'Git SHA：' + (value.gitSha || 'UNKNOWN · 待登记')), el('p', value.status));
    if (value.web) card.append(el('p', 'Web：' + value.web), el('p', 'SYSTEM：' + value.system), el('p', 'Relay revision：' + value.relay));
    const detail = el('details'); detail.append(el('summary', '查看部署 / 回退原文'), el('p', value.evidence)); card.append(detail); releaseGrid.append(card);
  }
  explorer.append(releaseGrid);
  const functions = el('details', undefined, 'version-functions'); functions.append(el('summary', '当前已开发功能 / 优化及上线差异（任务原文）'));
  const features = data.tasks.filter(t => t.milestones.length || t.deployment === 'not_deployed');
  features.forEach(task => { const item = el('div', undefined, 'feature-row'); item.append(badge(task.deployment), el('span', task.title), el('small', task.source + ':' + task.line)); functions.append(item); });
  explorer.append(functions, el('p', comparison.scope + '。' + history.warning, 'explain'));
}
async function refresh(automatic = false) {
  if (busy || (automatic && (document.activeElement?.tagName === 'TEXTAREA' || document.querySelector('.task details[open]')))) return;
  busy = true; $('#refresh').disabled = true;
  try { const response = await fetch('/api/snapshot', { signal: AbortSignal.timeout(30000) }); if (!response.ok) throw new Error('HTTP ' + response.status); const snapshot = await response.json(); data = snapshot; render(); $('#error').hidden = !data.errors.length; $('#error').textContent = data.errors.join('；'); }
  catch { $('#error').hidden = false; $('#error').textContent = '读取失败，已保留上次数据。请检查工具进程与仓库路径后点击刷新。'; }
  finally { busy = false; $('#refresh').disabled = false; }
}
$('#refresh').onclick = () => refresh();
$('#reset').onclick = () => { ['search', 'section', 'status', 'deployment'].forEach(id => { $('#' + id).value = ''; }); if (data) renderTasks(); };
['search', 'section', 'status', 'deployment'].forEach(id => { $('#' + id).addEventListener(id === 'search' ? 'input' : 'change', () => { if (data) renderTasks(); }); });
document.querySelectorAll('[data-view]').forEach(button => { button.onclick = () => setView(button.dataset.view); });
$('#show-hidden').onchange = () => { if (data) renderGovernance(); };
$('#restore').onclick = () => { local.hidden = []; save(); if (data) renderGovernance(); toast('已恢复全部治理提示'); };
$('#export').onclick = () => { if (!data) return toast('请等待数据读取完成'); const blob = new Blob([JSON.stringify({ ...data, localSupplements: local, notice: '快照仅为读取时记录；本地补充不是正式事实' }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob), anchor = el('a'); anchor.href = url; anchor.download = 'opc-task-snapshot-' + data.generatedAt.slice(0, 10) + '.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
setInterval(() => { if ($('#auto').checked && !document.hidden) refresh(true); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && $('#auto').checked) refresh(true); });
const aiMessages = { AI_PLAN_INVALID: '模型未完整列出需求、边界、验收与自检修正计划，本次结果未采纳。', AI_OUTPUT_TRUNCATED: '模型输出达到上限，本次结果不完整，未采纳。', AI_NETWORK_FAILED: '无法连接现有 DeepSeek 服务，本次未生成结果；请稍后重试。', AI_ANALYSIS_INVALID_JSON: '模型返回的内容不是完整 JSON，本次结果未采纳。', AI_BUSY: '已有分析正在进行，请等待本轮结果。', AI_COOLDOWN: '请等待15秒后再发起新的分析。', AI_NOT_CONFIGURED: '现有 DeepSeek 配置不可用，请检查服务端 OPC_AI_ANALYSIS 配置。', AI_SOURCE_UNAVAILABLE: '当前任务事实源不可用，已停止分析。', AI_INPUT_TOO_LARGE: '任务输入超出单次分析范围，请先治理任务正文。', AI_TIMEOUT: '模型请求超时，本次未生成结果；可稍后手动重试。', AI_ANALYSIS_PROVIDER_FAILED: '现有模型服务调用失败，请检查连接、额度与服务端配置。', AI_EVIDENCE_INVALID: '模型引文与原文不一致，本次结果未采纳。', AI_COVERAGE_INVALID: '模型未完整覆盖当前任务，本次结果未采纳。', AI_DEPENDENCY_CYCLE: '模型给出了循环依赖，本次结果未采纳。', AI_SECRET_REJECTED: '检测到敏感配置风险，本次输入或输出已拒绝。' };
let aiState, aiTimer, aiLoading = false, renderedReport = '', renderedStale;
async function copyPrompt(text, button) {
  try { await navigator.clipboard.writeText(text); toast('Codex Prompt 已复制'); }
  catch { const container = button.closest('article,section,div.panel') || $('#ai-result'); const area = container.querySelector('textarea'); if (area) { area.closest('details').open = true; area.focus(); area.select(); } toast('浏览器未允许自动复制，请在展开的 Prompt 中按 Ctrl+C'); }
}
function renderAnalysis() {
  if (!aiState) return;
  const state = aiState, report = state.report;
  $('#ai-config').textContent = state.configured ? '已接入现有配置 · ' + state.provider + ' / ' + state.model : '现有 DeepSeek 配置尚不可用；密钥始终只留在服务端。';
  const button = $('#analyze'); button.disabled = !state.configured || state.status === 'running'; button.textContent = state.status === 'running' ? 'AI 分析中…' : report ? '重新分析当前任务' : '开始 AI 分析';
  let message = state.status === 'running' ? '正在分析任务、部署差异和治理证据，已等待 ' + Math.max(0, Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000)) + ' 秒；不会自动重试或执行任务。' : state.status === 'failed' ? (aiMessages[state.error] || '模型结果未通过校验或调用失败，请手动重试。') + (report ? ' 下方保留上次有效结果。' : '') : report ? '分析完成。生成于 ' + time(report.createdAt) + '；以下为建议，不改变正式任务或部署状态。' : '尚未进行 AI 分析。';
  if (state.stale) message += ' 当前事实已变化，旧结果仅供回看，请重新分析后再复制 Prompt。';
  if (!state.saved) message += ' 本次结果未能保存至本机缓存，重启后可能丢失。';
  $('#ai-status').textContent = message; $('#ai-status').classList.toggle('ai-warning', state.stale || state.status === 'failed');
  $('#ai-result').querySelectorAll('button').forEach(control => { control.disabled = state.stale || state.status === 'running'; });
  const signature = report ? report.createdAt + report.inputFingerprint : '';
  if (renderedReport === signature && renderedStale === state.stale) return;
  renderedReport = signature; renderedStale = state.stale;
  const target = $('#ai-result'); target.replaceChildren();
  if (!report) { empty(target, '点击“开始 AI 分析”，生成处理优先级、原因说明与 Codex Prompt。'); return; }
  const summary = el('section', undefined, 'panel ai-summary'); summary.append(el('h2', '整体推进建议'), el('p', report.summary));
  const usage = report.usage; summary.append(el('p', '分析模型：' + report.model + ' · 用量：' + (usage?.totalTokens !== null && usage?.totalTokens !== undefined ? usage.totalTokens + ' tokens（Provider回报）' : 'Provider 未报告'), 'explain'));
  const copy = el('button', '复制整体 Codex Prompt'); copy.disabled = state.stale || state.status === 'running'; copy.onclick = () => copyPrompt(report.codexPrompt, copy); summary.append(copy);
  function promptDetails(text) { const details = el('details', undefined, 'prompt-detail'), area = el('textarea'); area.value = text; area.readOnly = true; area.setAttribute('aria-label', '可复制的 Codex Prompt'); details.append(el('summary', '查看 / 手动复制 Codex Prompt'), area); return details; }
  summary.append(promptDetails(report.codexPrompt)); target.append(summary);
  if (report.nextPlan?.length) {
    const plans = el('section', undefined, 'next-plans'); plans.append(el('h2', '下一步计划 · 阻塞驱动的执行清单'));
    const planLabels = { requirements: '需求清单', boundaries: '范围与边界', acceptance: '验收标准', governance: '治理项', steps: '推进步骤', selfCheck: '自我检查', correction: '失败修正与重验' };
    report.nextPlan.forEach((plan, index) => {
      const card = el('article', undefined, 'panel ai-plan'); card.append(el('span', 'NEXT ' + (index + 1) + ' · ' + plan.priority, 'eyebrow'), el('h3', plan.title), el('p', '阻塞梳理：' + plan.blockerAnalysis));
      const copyPlan = el('button', '复制下一步推进 Prompt'); copyPlan.disabled = state.stale || state.status === 'running'; copyPlan.onclick = () => copyPrompt(plan.codexPrompt, copyPlan); card.append(copyPlan);
      const groups = el('div', undefined, 'plan-groups');
      Object.entries(planLabels).forEach(([field, label]) => { const group = el('section'); group.append(el('h4', label)); const list = el(field === 'steps' ? 'ol' : 'ul'); plan[field].forEach(text => list.append(el('li', text))); group.append(list); groups.append(group); });
      card.append(groups, promptDetails(plan.codexPrompt)); plans.append(card);
    }); target.append(plans);
  }
  const list = el('div', undefined, 'ai-list');
  for (const item of report.items) {
    const card = el('article', undefined, 'panel ai-item'), head = el('div', undefined, 'ai-item-head'), text = el('div');
    text.append(el('span', '#' + item.rank + ' · ' + item.priority + ' · ' + (item.kind === 'governance' ? '项目治理' : '开发任务'), 'eyebrow'), el('h3', item.title));
    const copyOne = el('button', '复制此项 Prompt'); copyOne.disabled = state.stale || state.status === 'running'; copyOne.onclick = () => copyPrompt(item.codexPrompt, copyOne); head.append(text, copyOne); card.append(head);
    card.append(el('p', '优先理由：' + item.reason), el('p', '推荐下一步：' + item.recommendation), el('p', '未部署原因：' + item.undeployedReason), el('p', '治理原因：' + item.governanceReason));
    if (item.dependsOn.length) card.append(el('p', '先行依赖：' + item.dependsOn.map(id => report.items.find(i => i.id === id)?.title || id).join('；')));
    const evidence = el('details'); evidence.append(el('summary', '依据与原文引述'), el('p', '来源：' + item.source)); item.evidence.forEach(e => evidence.append(el('p', (report.items.find(i => i.id === e.id)?.source || e.id) + '「' + e.quote + '」'))); card.append(evidence, promptDetails(item.codexPrompt)); list.append(card);
  }
  target.append(list);
}
async function loadAnalysis() {
  if (aiLoading) return; aiLoading = true;
  try { const response = await fetch('/api/analysis', { signal: AbortSignal.timeout(30000) }); if (!response.ok) throw new Error(); aiState = await response.json(); renderAnalysis(); clearTimeout(aiTimer); if (aiState.status === 'running') aiTimer = setTimeout(loadAnalysis, 2500); }
  catch { $('#ai-status').textContent = 'AI 状态暂时读取失败，请刷新页面重试。'; }
  finally { aiLoading = false; }
}
$('#analyze').onclick = async () => {
  $('#analyze').disabled = true;
  try { const response = await fetch('/api/analysis', { method: 'POST', headers: { 'content-type': 'application/json', 'x-task-manager-action': 'analyze' }, body: '{}', signal: AbortSignal.timeout(30000) }); const result = await response.json(); if (!response.ok) { toast(aiMessages[result.error] || '无法开始分析，请检查现有配置或稍后重试'); } await loadAnalysis(); }
  catch { toast('请求失败，请读取状态确认是否已开始，避免重复触发'); await loadAnalysis(); }
};
setInterval(() => { if (view === 'ai' && !document.hidden) loadAnalysis(); }, 15000);
refresh(); loadAnalysis();
