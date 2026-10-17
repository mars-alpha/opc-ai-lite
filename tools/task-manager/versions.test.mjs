import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

test('部署回退与Git提交不能凭release名字或审计SHA推断', async () => {
  const { releaseMap } = await import('./versions.mjs');
  const map = releaseMap('现役e61b380审计；同版回退为opc-admin-web-old和releases/old，Relay前版revision为abc（v15）。');
  assert.equal(map.current.gitSha, null);
  assert.equal(map.rollback.gitSha, null);
  assert.equal(map.rollback.web, 'opc-admin-web-old');
  assert.equal(map.rollback.system, 'old');
});

test('真实Git基线比较含工作区和未跟踪文件，不运行切换/回退', async t => {
  const { readVersionHistory } = await import('./versions.mjs');
  const root = await mkdtemp(join(tmpdir(), 'opc-version-')); t.after(() => rm(root, { recursive: true, force: true }));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git(['init', '-q']); git(['config', 'user.email', 'test@example.invalid']); git(['config', 'user.name', 'test']);
  await writeFile(join(root, 'core.ts'), 'v1\n'); git(['add', '.']); git(['commit', '-qm', 'feat: initial']);
  await writeFile(join(root, 'core.ts'), 'v2\n'); git(['commit', '-qam', 'fix: optimized']);
  await writeFile(join(root, 'core.ts'), 'local\n'); await writeFile(join(root, 'extra.ts'), 'new');
  const before = git(['rev-parse', 'HEAD']);
  const result = await readVersionHistory(root, '');
  assert.equal(result.commits.length, 2);
  assert.equal(result.comparisons[1].changedFiles, 1);
  assert.equal(result.working.untracked, 1);
  assert.equal(result.commits[0].deployment, 'unknown');
  assert.equal(git(['rev-parse', 'HEAD']), before);
});
