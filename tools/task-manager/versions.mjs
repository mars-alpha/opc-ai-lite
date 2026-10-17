import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
export function releaseMap(facts) {
  const line = pattern => facts.split(/\r?\n/).find(l => pattern.test(l)) || '未登记';
  const sha = pattern => facts.match(pattern)?.[1] || null;
  return {
    current: { gitSha: sha(/线上Git提交[：:]\s*`?([a-f0-9]{7,40})\b/i), evidence: line(/采集部署[：:]/), status: '文档记载当前部署，未实时探测' },
    rollback: { gitSha: sha(/回退Git提交[：:]\s*`?([a-f0-9]{7,40})\b/i), web: facts.match(/同版回退为`?([\w-]+)/)?.[1] || '未登记', system: facts.match(/同版回退为[^\n]*?releases\/([\w-]+)/)?.[1] || '未登记', relay: facts.match(/Relay前版revision为\s*`?([\w-]+)/)?.[1] || '未登记', evidence: line(/同版回退为/), status: '已登记前版回退资产；当前可恢复性未重新演练' }
  };
}
export async function readVersionHistory(root, facts) {
  const git = async args => (await exec('git', args, { cwd: root, encoding: 'utf8', timeout: 15000, maxBuffer: 4 * 1024 * 1024 })).stdout.trim();
  const [log, workingNames, untrackedNames] = await Promise.all([git(['log', '-12', '--format=%H%x09%h%x09%cI%x09%s']), git(['diff', '--name-only', '-z', 'HEAD', '--']), git(['ls-files', '--others', '--exclude-standard', '-z'])]);
  const releases = releaseMap(facts);
  const commits = log.split(/\r?\n/).filter(Boolean).map(row => {
    const [sha, short, date, ...title] = row.split('\t');
    return { sha, short, date, title: title.join('\t'), deployment: releases.current.gitSha && sha.startsWith(releases.current.gitSha) ? 'current' : releases.rollback.gitSha && sha.startsWith(releases.rollback.gitSha) ? 'previous' : 'unknown', recoverability: '本地Git对象存在；生产回退兼容性待验' };
  });
  const comparisons = await Promise.all(commits.map(async commit => {
    const [names, stats] = await Promise.all([git(['diff', '--name-only', '-z', commit.sha, '--']), git(['diff', '--shortstat', commit.sha, '--'])]);
    const paths = names.split('\0').filter(Boolean);
    return { sha: commit.sha, changedFiles: paths.length, stats: stats || '已跟踪内容无差异', areas: Object.entries(paths.reduce((all, p) => { const key = p.includes('/') ? p.split('/')[0] : '根目录'; all[key] = (all[key] || 0) + 1; return all; }, {})).map(([area, count]) => ({ area, count })), commitsAfter: commits.slice(0, commits.findIndex(c => c.sha === commit.sha)).map(c => ({ sha: c.sha, title: c.title })), scope: '基线提交 → 当前工作区（含暂存及未暂存），未跟踪文件单列' };
  }));
  return { commits, comparisons, releases, working: { tracked: workingNames.split('\0').filter(Boolean).length, untracked: untrackedNames.split('\0').filter(Boolean).length }, warning: '提交主题是Git记录，不等于功能验收；Git提交与部署release无明确绑定时均标记待核实。' };
}
