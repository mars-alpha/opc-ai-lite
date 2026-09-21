# TRACK01-PHASE1-RUNTIME-001 — T1-01～T1-05 Runtime Provisioning & Acceptance

Status: **IMPLEMENTATION_READY / PROVISIONING_BLOCKED_DB_SCHEMA_0010_0011**

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

`previewMode=false` 时仍使用正式 DB/API Check、Practice、Progress 和 Completion，不会把 Preview 本地状态当成正式完成状态。

新增 `buildPracticeCopyText()`，COPY_TO_AI 默认 values-only，可确定性测试字段标题不会进入剪贴板。

## Backward compatibility

- 不替换旧 `ai-literacy`
- `foundation-ai` 作为新的 canonical Track01 Runtime course 独立注册
- 旧课程数组顺序不改变
- `foundation-ai` 不继承 legacy course-array prerequisite，避免被旧课程错误锁定
- 旧 Runtime registry 项保持不变

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

## Out of scope

- No T1-06
- No Course Builder redesign
- No remote migration
- No deploy
- No legacy `ai-literacy` replacement
- No full Track01 Catalog UI migration
