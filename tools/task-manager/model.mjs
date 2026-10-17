import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { readVersionHistory } from './versions.mjs';

const exec = promisify(execFile);
const hash = text => createHash('sha256').update(text).digest('hex').slice(0, 16);
export const owners = ['TASKS.md', 'PROJECT_STATUS.md', 'docs/CURRENT_SYSTEM_FACTS.md'];
const clean = text => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*]/g, '').trim();

export function parseTasks(markdown) {
  let section = '', buffer = [], start = 0;
  const tasks = [];
  function flush() {
    const raw = buffer.join(' ').replace(/^-\s+/, '').trim();
    buffer = [];
    if (!raw || !section) return;
    const parts = raw.length > 500 ? raw.split(/[；。](?=(?:5[A-Z]|P[0-9]|下一步|完整质量|独立发现))/) : [raw];
    for (const part of parts) {
      const text = clean(part);
      let status = section === 'NOW' ? 'active' : 'planned';
      const blocked = /NOT_ACCEPTED|RELEASE_NOT_READY|REVIEW_BLOCKED|阻塞|仍不足|仍未通过|质量(?:仍)?未验收/.test(text);
      if (section === 'NOW' && /观察|长期|持续覆盖/.test(text)) status = 'observing';
      if (section === 'NOW' && /已闭环|已完成|已发布|已上线/.test(text) && !/未完成|未验收|未部署|尚未|观察/.test(text)) status = 'done';
      if (/UI_NOT_REVIEWED|待体验|UI体验批准单独|待审核/.test(text)) status = 'review';
      if (/另行规划|后续.*单独规划/.test(text)) status = 'planned';
      if (blocked) status = 'blocked';
      const notDeployed = /未部署|尚未部署|暂不发布|未发布|NOT_DEPLOYED/.test(text), deployed = /已发布|已上线|已同版发布|已同版上线/.test(text);
      const deployment = notDeployed && deployed ? 'mixed' : notDeployed ? 'not_deployed' : deployed ? 'deployed' : 'unknown';
      const clauses = text.split(/[。；]/).map(x => x.trim()).filter(Boolean);
      const blockers = clauses.filter(x => /未完成|不足|UNKNOWN|未验收|NOT_ACCEPTED|RELEASE_NOT_READY|缺口|超时|阻塞|待验证|未通过/.test(x));
      const next = clauses.find(x => /下一步|继续核验|后续|待后续|待真实|^(?:继续补|补齐|补充)/.test(x)) || (status === 'blocked' ? '补齐阻塞项所需证据，重跑对应验收；通过前保持未就绪。' : status === 'review' ? '提供独立可体验界面，记录实际体验反馈与审核状态。' : deployment === 'not_deployed' ? '核对候选清单、验收与回退点，再按当前发布规则推进。' : status === 'observing' ? '累计真实周期与样本，记录异常；不要把单轮成功当持续稳定。' : '按原任务补充下一步和验收证据。');
      tasks.push({ id: hash(section + part), section, title: text.replace(/^当前增量任务[：:]\s*/, '').split(/[。；]/)[0].slice(0, 90), text, status, deployment, blockers, next, line: start, source: 'TASKS.md', links: [...part.matchAll(/\[[^\]]+\]\((docs\/[^)#]+\.md)(?:#[^)]*)?\)/g)].map(m => m[1]), milestones: clauses.filter(x => /通过|已实现|已完成|已发布|尚未|未部署|未验收/.test(x)), owner: '原任务未单独指定负责人' });
    }
  }
  markdown.split(/\r?\n/).forEach((line, index) => {
    if (/^#/.test(line)) { flush(); const match = line.match(/^#+\s+(NOW|NEXT|BACKLOG)\b/); section = match?.[1] || ''; }
    else if (!line.trim()) flush();
    else if (section && !line.startsWith('>')) { if (/^-\s/.test(line)) flush(); if (!buffer.length) start = index + 1; buffer.push(line); }
  });
  flush();
  return tasks;
}

export function parseVersions(facts, git) {
  const record = (value, pattern) => ({ value: value || '待核实', evidence: facts.split(/\r?\n/).find(line => pattern.test(line)) || '未找到明确版本记录', source: 'docs/CURRENT_SYSTEM_FACTS.md', verification: '文档记录，未实时探测生产' });
  return {
    development: { ...git, label: '当前本地开发', verification: '本机 Git 实时读取；提交号不包含未提交改动' },
    candidate: { value: '未登记候选发布版本', verification: '本地改动和构建通过不能代替候选发布清单' },
    web: record(facts.match(/Web为[^；\n]*\/([^/；\s，]+)/)?.[1], /Web为/),
    system: record(facts.match(/current指向[^；\n]*\/([^/；\s，]+)/)?.[1], /current指向/),
    relay: record(facts.match(/Deno生产为`([^`]+)`/)?.[1], /Deno生产为/),
    relayRevision: facts.match(/Deno生产为[^\n]*?revision\s+`([^`]+)`/)?.[1] || '待核实'
  };
}

export function governanceHints(files, contents, untracked = new Set()) {
  const hints = [];
  for (const path of files) {
    if (untracked.has(path) || !contents[path] || path.startsWith('tools/task-manager/')) continue;
    const script = /^scripts\/.*\.(ts|js|mjs|cjs)$/.test(path);
    const historical = /(?:batch|pilot|provision|seed-|legacy|retired|task-result)/i.test(path);
    if (!script && !(/^docs\//.test(path) && historical)) continue;
    // References by full path OR stem: zero matches is a review clue, never deletion proof.
    const stem = path.split('/').pop().replace(/\.[^.]+$/, '');
    const references = Object.keys(contents).filter(other => other !== path && (contents[other].includes(path) || contents[other].includes(stem)));
    const oneShot = /^scripts\/(?:seed-|provision-)/.test(path);
    if (references.length && !oneShot) continue;
    hints.push({ id: hash(path + contents[path]), path, kind: references.length ? '一次性工具生命周期复核' : historical ? '历史用途待复核' : '脚本入口待核实', action: references.length ? '保留现役入口；核实用途结束后再退役' : '人工复核后清理或补入口', reason: references.length ? '初始化或视觉测试工具仍有现役引用；建议补用途、运行环境、幂等保护与退役条件。未确认用途结束前应保留。' : historical ? '名称带一次性或历史用途信号，在本次可读取文本中未找到其他引用；需核实是否已完成并被现役主链替代。' : '本次可读取文本中未找到其他引用，可能是直接运行脚本、运维入口或遗漏接线，不能直接判断为废弃。', risk: '未检查远端定时器、外部文档及动态拼接引用；文件年龄不作为删除依据。', validation: '核对 package / import / 部署与外部调用；确认 Git 已保存；删除后跑 scripts:current:check、相关领域校验和 build。', references });
  }
  return hints;
}

const readable = path => !/(^|\/)(?:\.env[^/]*|node_modules|\.git|\.next|\.runtime|\.data|logs|\.scratch)(\/|$)/.test(path) && !/secret|credential|private.key/i.test(path) && /\.(?:md|ts|tsx|js|mjs|cjs|json|ya?ml|sh|ps1)$/.test(path) && !/lock\.json$/.test(path);
export async function readSnapshot(root) {
  const errors = [];
  async function git(args) { try { return (await exec('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024, encoding: 'utf8', timeout: 15000 })).stdout.trim(); } catch { errors.push('Git 信息不可用：请在完整 Git 仓库运行'); return ''; } }
  const [listed, loose, status, commit, branch] = await Promise.all([git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']), git(['ls-files', '-z', '--others', '--exclude-standard']), git(['status', '--porcelain']), git(['log', '-1', '--format=%h %s']), git(['branch', '--show-current'])]);
  const files = [...new Set(listed.split('\0').filter(Boolean))].filter(readable);
  const contents = {};
  let skipped = 0;
  for (let index = 0; index < files.length; index += 40) await Promise.all(files.slice(index, index + 40).map(async path => {
    try { if ((await stat(resolve(root, path))).size > 512000) { skipped++; return; } contents[path] = await readFile(resolve(root, path), 'utf8'); } catch { skipped++; }
  }));
  const sources = await Promise.all(owners.map(async path => {
    try { return { path, modifiedAt: (await stat(resolve(root, path))).mtime.toISOString(), available: true }; } catch { errors.push('事实源不可用：' + path); return { path, available: false }; }
  }));
  const changes = status ? status.split(/\r?\n/).length : 0;
  const tasks = parseTasks(contents['TASKS.md'] || '');
  let versionHistory = null;
  try { versionHistory = await readVersionHistory(root, contents['docs/CURRENT_SYSTEM_FACTS.md'] || ''); } catch { errors.push('Git版本比较不可用'); }
  return { generatedAt: new Date().toISOString(), tasks, versionHistory, versions: parseVersions(contents['docs/CURRENT_SYSTEM_FACTS.md'] || '', { commit: commit || '待核实', branch: branch || '待核实', dirty: changes > 0, changes }), governance: governanceHints(files, contents, new Set(loose.split('\0'))), scan: { files: Object.keys(contents).length, skipped, scope: 'Git 非忽略文本，单文件≤512KB；不含远端和动态引用；零引用不等于可删除' }, sources, errors, documents: Object.fromEntries(owners.map(path => [path, contents[path] || '事实源不可用'])) };
}
