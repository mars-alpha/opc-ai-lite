# TRACK01-PHASE1-RUNTIME-001 — T1-01～T1-05 Runtime Provisioning & Acceptance

Status: **FRONTEND_ALIGNED / PROVISIONING_BLOCKED_DB_SCHEMA_0010_0011**

## Goal

将已经通过 Human Review 的 T1-01～T1-05 接入正式 Generic Lesson Runtime，并通过真实 Runtime Acceptance 证明五节课可以完整学习。

## Human Review baseline

T1-01～T1-05 均为 **HUMAN_REVIEW_PASS**。

本任务没有生产 T1-06，也没有修改课程教学内容或 Course Builder。

## Runtime implementation

新增 approved runtime bridge：

- `lib/learning/track01-phase1-runtime.ts`
- canonical Runtime course: `foundation-ai`
- module: `phase1`
- lessons:
  - `t1-01-ai-task-fit`
  - `t1-02-clear-prompt`
  - `t1-03-minimum-context`
  - `t1-04-purposeful-iteration`
  - `t1-05-reliability-verification`

该 bridge 直接复用 Human Review PASS Draft，派生：

- 正式 Course / Lesson 静态内容
- LessonSpec
- 每课 3 道 CHECK seed
- 每课 1 个 required Practice seed
- Reference Fill
- 已批准 Step 1 / Step 4 / Step 5 / Step 6 presentation

不复制第二套课程正文。

## Formal presentation parity

正式 Runtime 不再丢失 Preview 已验收体验：

- Step 1 approved scenario / comparison
- Step 4 Practice + COPY_TO_AI
- Reference Answer / Reference Fill
- Step 5 Review cards + knowledge depth + pitfalls
- Step 6 Self Assessment

正式 DB Runtime provisioning 完成后继续使用真实 DB/API Check、Practice、Progress 和 Completion。当前 schema blocker 期间，正式 `/courses/foundation-ai/...` 页面使用受控本地互动回退复用同一套已验收 Check / Practice / Reference Fill / COPY_TO_AI / Review；页面明确提示该互动暂不保存正式进度，Completion 继续锁定，不会把本地状态伪造成 Runtime PASS。

新增 `buildPracticeCopyText()`，COPY_TO_AI 默认 values-only，可确定性测试字段标题不会进入剪贴板。

## Backward compatibility

- 旧 `ai-literacy` 数据和直达兼容入口仍保留，不删除历史进度
- `foundation-ai` 成为当前主学习入口，并在课程列表中前置
- 首页 / Header 的“继续学习”不再选择 legacy `ai-literacy`
- `foundation-ai` 不继承 legacy course-array prerequisite，避免被旧课程错误锁定
- 旧 Runtime registry 项保持不变

## Learning Path / frontend alignment

- 学习路径从旧 28 课草案切换到已批准的 Track 01 canonical 20 课；
- 当前目录为 6 个学习阶段；
- T1-01～T1-05 从学习路径可直接进入 `/courses/foundation-ai/lessons/...`；
- T1-06～T1-20 只显示规划状态，不进入空页面；
- Phase 1 在正式 DB Runtime 尚未 provisioning 前显示“可体验”，不计入正式持久化完成进度；
- 正式课程页在 schema blocker 期间仍保留已验收的六步课程交互。

## Provisioning tooling

新增：

- `scripts/provision-track01-phase1-runtime.ts`
- `npm run learning:runtime:track01-phase1`

默认 CHECK-only。

只有：

```text
--apply --confirm=TRACK01-PHASE1-RUNTIME-001
```

才允许写入。

目标写入：

- 1 Stage
- 1 Module
- 5 Published Lessons
- 15 Published required Checks
- 5 Published required Practices

不运行全量 `db:seed`，不执行 migration。

## Acceptance tooling

新增：

- `scripts/accept-track01-phase1-runtime.ts`
- `npm run learning:runtime:accept:track01-phase1`

设计为使用一次性测试用户通过真实 HTTP 验证每课：

1. Runtime registered / configurationReady / enforcementActive
2. 3 required Checks
3. 未过 Check → Completion 被 `CHECK_REQUIRED` 阻断
4. 三题答对
5. 未过 Practice → Completion 被 `PRACTICE_REQUIRED` 阻断
6. Reference Fill 提交并 Rule PASS
7. Check / Practice gates PASS
8. Lesson completion 200
9. `lesson_progress=COMPLETED`
10. 正式 Lesson Page 保留 approved presentation
11. 下一课导航正确
12. T1-05 最终阶段导航正确
13. COPY_TO_AI values-only
14. 测试用户 cascade cleanup

## Database precheck / blocker

只读 precheck：

```text
MODE=CHECK
BEFORE={"databaseConfigured":true,"courseSlug":"foundation-ai","lessons":[]}
AFTER={"databaseConfigured":true,"courseSlug":"foundation-ai","lessons":[]}
TRACK01_PHASE1_PRECHECK=PASS
```

第一次 provisioning 尝试在事务内写第一条 `lesson_checks` 时失败；事务回滚后再次 precheck 确认：

```text
foundation-ai lessons = []
```

没有留下部分 Runtime 数据。

随后 provisioning 工具增加写前 schema gate。当前目标数据库明确返回：

```text
TRACK01_PHASE1_DB_SCHEMA_REQUIRES_0010_0011
```

因此正式 provisioning / HTTP Runtime Acceptance 当前被数据库 schema 阻塞。

所需已有 migration：

- `0010_famous_blockbuster.sql` — `lesson_checks.correct_answers`
- `0011_milky_sharon_carter.sql` — `lesson_checks.incorrect_explanation`

本任务明确不执行远程 migration，因此没有越权升级数据库。

## Current acceptance status

Code / bridge:
- Human Review content preservation — PASS
- TypeScript — PASS
- Track01 content regression — PASS
- existing Learning Runtime regression — PASS
- provisioning dry precheck — PASS
- failed transaction rollback — PASS
- schema blocker fail-fast — PASS

Pending due database blocker:
- formal DB provisioning
- real HTTP T1-01～T1-05 Runtime Acceptance
- Runtime Ready
- AVAILABLE / publish decision

## Runtime stabilization decision

Phase 1 的多轮前端体验验证暴露出一个明确工程风险：旧 Runtime 状态、局部 React 状态、历史兼容与恢复逻辑叠加后，继续按单点 Bug 方式修复会快速增加状态分支并降低可维护性。

因此后续固定为：先看完整学习主链，再决定旧实现是否保留；必要时删除 / 重写冲突代码，以更少状态、更少 fallback、更少兼容分支重新形成单一主链，然后做端到端整体验证。

后续状态流收敛任务记为 TRACK01-PHASE1-RUNTIME-001-B。该任务以 MVP 简洁性和可维护性为目标，不建设通用状态框架，不扩课程内容。

## Out of scope

- No T1-06
- No Course Builder redesign
- No remote migration
- No deploy
- No deletion of legacy `ai-literacy` data or historical progress
- No T1-06+ lesson production
