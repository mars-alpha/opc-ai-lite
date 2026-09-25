# Scripts — Current Entrypoints

Status: **ACTIVE / GOVERNED**

## Rule

正常开发、课程生产、Runtime 验证只使用 `package.json > scripts` 暴露的命令。

- 根目录普通 `.ts` 脚本必须有明确 package script 入口。
- `_historical-*` 只保留旧单课增量脚本，以及已经 AVAILABLE 批次的历史 Draft / Workflow / Registration / 恢复证据，默认禁止在新开发任务中运行。
- 已删除的 pilot / legacy Course Builder acceptance 不得恢复为当前入口。
- 新课程不得从脚本文件名猜流程；先走 `COURSE_BUILD_START_HERE.md` 和 Current Facts。

## 当前优先入口

课程生产 / 防漂移：

- `npm run learning:course-current-state:check`
- `npm run learning:course-governance:check`
- `npm run learning:course-production-workflow:check`
- `npm run learning:course-build-entry:check`
- `npm run learning:formal-registry:check`
- `npm run scripts:current:check`

当前 Track 02 Batch C：

- `npm run learning:track02-batch-c:draft-check`
- `npm run learning:track02-batch-c:workflow`
- `npm run learning:track02-batch-c:review-check`

正式 Runtime / UI 架构回归：

- `npm run learning:course-interaction:check`
- `npm run learning:runtime-perf003:check`
- `npm run learning:sidebar-ux:check`
- `npm run learning:track01-baseline:check`
- `npm run learning:track02-context:check`
- `npm run learning:track02-path-access:check`

Provision / Acceptance 命令具有数据库或真实 Runtime 副作用，只能在明确进入对应 Workflow Gate 后运行。

## 历史脚本

`scripts/_historical-*` 包含两类历史资产：T1-06～T1-10 逐课建设时期留下的单课 provision / acceptance / draft validator，以及已正式 AVAILABLE 的 Track 01 T11～T20、Track 02 Batch A/B 旧 Draft / Workflow / Registration 生产脚本。

它们：
- 不属于当前 Workflow；
- 不出现在 package scripts；
- 不参与自动验证；
- 仅在需要追溯或恢复旧增量迁移时人工阅读后使用。

若未来已有统一 Track 01 全量重建脚本，或历史 Batch 不再需要追溯恢复，可继续删除对应 `_historical-*` 文件。
