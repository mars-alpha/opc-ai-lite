# COURSE_BUILD_START_HERE.md — 正式课程构建唯一入口

Status: **ACTIVE / REQUIRED**

本文件只负责：
- 从哪里开始；
- 读取哪些 current owners；
- 什么时候允许进入课程生产；
- 哪些历史内容不得作为 current context。

具体课程规则只在 `COURSE_BUILD_STANDARD_V1.md` 维护。

## 1. 当前状态

Track 01～05 已正式上线并冻结。

默认：
- 不新建课程；
- 不重做课程内容；
- 不重新执行历史 provisioning / acceptance；
- 不恢复历史 Batch / Preview。

只有以下两类任务允许进入课程主链：
1. 明确线上阻断，需要修复；
2. 产品负责人显式重新开启课程生产 / 重构。

## 2. 启动顺序

任何课程任务：

```text
AGENTS.md
→ docs/CURRENT_SYSTEM_FACTS.md
→ PROJECT_STATUS.md
→ 本文件
→ Current Rule Owners
→ Current Track Context
→ 实际代码 / Runtime
```

禁止从：
- 旧聊天；
- Git 历史中的 Formal Brief；
- 已删除 Batch 文件；
- 旧 acceptance；
- legacy static 课程；
恢复现行规则。

## 3. Current Rule Owners

必读：

1. `docs/learning/FORMAL_CURRICULUM_V1.md`
2. `docs/learning/COURSE_BUILD_STANDARD_V1.md`
3. `docs/learning/UNIFIED_LESSON_SHELL_V1.md`
4. `docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md`
5. `lib/learning/course-production-contract.ts`
6. `skills/course-builder/index.ts`

如果任务涉及具体 Track，再读取对应 owner：

- Track 01～05 当前目录：`TRACK_CONTEXTS_V1.md`
- 跨 Track 连续性：`FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md`

如果任务涉及已上线课程的具体实现或 Runtime，才按 lessonId 定位 `lib/learning/course-content/*`；该目录是冻结生产内容源，不是规则 owner，不得从其中历史 provenance 反推现行规则。

## 4. 重新开启课程生产时

只有产品明确重新开启后，才创建新的：
- Grounding；
- Formal Brief；
- Draft；
- Human Review evidence。

新的 Formal Brief 只描述当前知识点、边界和 must-retain judgments，不复制全局课程规则。

当前 Rule Owners 读取完成后再进入：

```text
PREPARE_GROUNDING
→ PREPARE_FORMAL_BRIEF
→ RUN_COURSE_BUILDER
→ RUN_DETERMINISTIC_VALIDATORS
→ HUMAN_REVIEW_GATE
→ REGISTER_LESSON_SPEC
→ PROVISION_RUNTIME
→ RUN_RUNTIME_ACCEPTANCE
→ MARK_AVAILABLE
```

## 5. Runtime 主链

正式课程只能走：

```text
LessonSpec Registry
→ FormalGuidedLessonView
→ AsyncLessonRuntimeShell
→ Database Runtime hydration
→ GenericLessonRuntimePanel
→ Completion / Rating / Next Lesson
```

禁止：
- static fallback；
- lesson-specific renderer；
- 为单课新增临时 Runtime；
- Preview 写正式 Progress / Completion。

## 6. Skill 边界

当前 Course Builder 只能从：

`skills/course-builder/index.ts`

解析。

Workflow 不 import 具体 historical version。

Skill 输出是候选 Draft；只有 Core / Human Review 可以推进正式状态。

## 7. Validation

课程任务至少执行：

```bash
npm run learning:course-current-state:check
npm run learning:course-build-entry:check
npm run learning:course-governance:check
npm run learning:course-production-workflow:check
npm run learning:formal-registry:check
npm run scripts:current:check
npm run typecheck
npm run build
```

如果任一 current-state / governance Gate 失败，先修复事实漂移，不从历史文件猜规则继续做。

## 8. Context Boundary

课程任务只加载：
- Current Facts；
- Current Rule Owners；
- 当前 Track owner；
- 当前代码。

历史生产过程通过 Git 精确定位，不进入默认上下文。
冻结课程源码中的 `git-history:...` 只表示当时生产 provenance；它不能触发读取旧 Brief / Audit / Research，也不能覆盖 Current Rule Owners。

固定原则：

> Track switch = Context switch, not Workflow fork and not Skill fork.

> Rule owner changes = read latest owner, not duplicate text.
