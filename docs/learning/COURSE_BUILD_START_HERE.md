# COURSE_BUILD_START_HERE.md — 正式课程构建唯一入口

> Status: **ACTIVE / REQUIRED**
>
> Scope: OPC AI 正式课程构建、重构、续建与新开对话恢复上下文。
>
> 本文件只负责“从哪里开始、按什么顺序恢复当前事实、进入哪条正式构建链路”。
> 具体课程规则仍由各自事实源负责，本文件不复制它们的完整正文。

---

## 1. 唯一入口规则

任何正式课程任务，只要属于以下任一情况，都必须先读取本文件：

- 新建正式课程；
- 继续上一节课之后的新课程；
- 新开 Chat / Agent / Codex 对话继续课程建设；
- 重构正式课程内容；
- 修复课程 Runtime / LessonSpec / Presentation 接入问题；
- 审计某节课是否符合当前课程构建基线。

**不要直接从历史聊天、旧测试课程、task-result、legacy fixture 或旧页面开始推断当前课程规则。**

新开对话恢复课程生产进度时，必须先读取 `docs/CURRENT_SYSTEM_FACTS.md` 的 **Current Course Production Snapshot**。
历史 task-result 只用于解释当时发生过什么；一旦标记为 `SUPERSEDED / HISTORICAL_ONLY`，不得再用于恢复当前阶段、Next Gate 或当前 Skill。

启动原则：

```text
新对话 / 新任务
→ COURSE_BUILD_START_HERE.md
→ 当前事实源
→ Stable Course Production Workflow
→ 当前课程连续性
→ Formal Brief / Knowledge Boundary
→ Current Course Builder Skill
→ Deterministic Validators
→ Human Review Gate
→ LessonSpec Registry
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE
```

---

## 2. Required Reads

读取顺序固定如下。

### A. 仓库与当前系统事实

1. `AGENTS.md`
2. `docs/CURRENT_SYSTEM_FACTS.md`

用途：

- 确认当前开发治理规则；
- 确认正式 Runtime、Access、数据库与现行主链；
- 确认哪些 legacy 已经废止或仅作为历史资产保留。

### B. 正式课程事实源

3. `docs/learning/FORMAL_CURRICULUM_V1.md`
4. `docs/learning/LESSON_OUTPUT_CONTRACT_V1.md`
5. `docs/learning/UNIFIED_LESSON_SHELL_V1.md`
6. `docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md`
7. `lib/learning/course-production-contract.ts`
8. `skills/course-builder/index.ts`

用途：

- Formal Curriculum：确定课程在整体课程体系中的位置、前后依赖和知识归属；
- Lesson Output Contract：确定六步教学责任与输出要求；
- Unified Lesson Shell：确定正式课程统一 UI / Renderer / Runtime 展示边界；
- Course Production Workflow：确定稳定生命周期、Gate 顺序和 Required Rule Sources；
- Course Production Contract：确定 Skill / Orchestrator / Validator / Human Review Gate 的稳定接口；
- Current Course Builder Skill Registry：解析当前 Course Builder Skill，不在 Workflow 中写死具体版本。

### C. 当前 Track / 当前课程 Context

必须先从 `docs/CURRENT_SYSTEM_FACTS.md` 与 `FORMAL_CURRICULUM_V1.md` 解析“当前正在生产哪个 Track / Batch”，再读取该 Track 自己的 current owner；不得默认从 Track 01 恢复。

当前 Context 至少包括：

- 当前 Track / Board 的唯一目录或课程上下文 owner；
- 当前已批准目录 / Phase / Primary Knowledge Home 状态；
- `FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md` 中与当前课有关的上一课 → 本课 → 下一课连续性；
- 当前 Formal Brief / Formal Brief Batch owner；
- `DEFERRED_KNOWLEDGE_LEDGER_V1.md` 中与当前 Track 有关的 Deferred / Supporting Boundary；
- 当前课需要的 Grounding / Research Packet；
- 进入 Runtime 阶段后，再读取 `lib/learning/course-runtime-boundaries.ts`、`lib/learning/lesson-spec-registry.ts` 与当前 Track 对应的 runtime / provisioning / validator 文件。

当前 owner 示例：

- Track 01：`docs/learning/TRACK01_CATALOG_METADATA_V2.md`
- Track 02：`docs/learning/TRACK02_CATALOG_CONTEXT_V1.md`
- Track 03：`docs/learning/TRACK03_CATALOG_CONTEXT_V1.md`
- Track 04：`docs/learning/TRACK04_CATALOG_CONTEXT_V1.md`

当前 Formal Brief / Batch **不在本入口维护状态清单**。必须从 `docs/CURRENT_SYSTEM_FACTS.md` + current Track owner 解析当前 Brief 路径与 Gate，再读取该 Brief。本入口不得写死任何当前 Track 的 Batch / Brief 路径，避免完成批次后旧状态继续污染新课程。

旧单课 / 旧 Batch Formal Brief 可以保留为历史课程证据，但除非 Current Facts / current Track owner 明确把它指定为当前 Brief，否则不得从其中的旧 Step 写法、卡片数量、`固定回答` 等措辞推导新课程规则。新课程只读 current Formal Brief + Required Rule Sources。

**只读取与当前课程连续性和实现有关的文件，不默认加载所有历史课程与全部 task-result。**

---

## 3. 冲突时的事实优先级

课程构建中出现冲突时，按以下顺序判断：

```text
当前代码 / Schema / Runtime
↓
docs/CURRENT_SYSTEM_FACTS.md
↓
COURSE_BUILD_START_HERE.md（只决定启动与读取顺序）
↓
FORMAL_CURRICULUM_V1.md
↓
当前 Track / Board 唯一 Catalog / Context Owner
↓
FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md
↓
当前 Formal Brief / Formal Brief Batch
↓
LESSON_OUTPUT_CONTRACT_V1.md
↓
UNIFIED_LESSON_SHELL_V1.md
↓
Course Builder Skill 当前版本
↓
历史 task-result / legacy fixture / 旧测试课程
↓
历史聊天记录
```

注意：

- 本文件不是课程内容规则的第二份副本；
- 当具体 Contract / Shell / Skill 规则升级时，应修改它们各自的 owner 文件；
- 本文件只需要在“入口、文件路径、启动顺序、正式构建链路”变化时更新。
- Workflow 不复制 Rule owner 正文；每次课程生产按 `COURSE_PRODUCTION_RULE_SOURCES` 读取这些 owner 文件的最新内容。
- Skill / Orchestrator / Validator / Human Review Policy 内部升级，只要 Stable Contract 与 Gate 语义不 breaking，Workflow 主流程保持不变。

---

## 4. 正式课程不可绕过的 Runtime 主链

### 4.1 三类课程代码必须先分类

开始实现前先判断当前文件属于哪一类：

FORMAL_RUNTIME：正式课程 route → FormalGuidedLessonView → AsyncLessonRuntimeShell → GenericLessonRuntimePanel。

COURSE_BUILDER_PREVIEW：/course-builder/preview/* 仅用于 Human Review / acceptance，必须使用 previewMode，不写正式 Progress / Completion。

LEGACY_STATIC：ai-literacy / chatgpt-worker 只允许进入 components/legacy-learning/*；这些资产仅因历史 Entitlement / DB seed / acceptance 依赖暂存，不得作为新课程模板。`ai-workflow` 已属于 FORMAL_RUNTIME，不得再按 legacy 恢复。

正式/legacy slug 的唯一边界文件是 `lib/learning/course-runtime-boundaries.ts`。新正式课程不能通过增加 fallback 进入页面，必须显式进入 Formal Runtime 主链。

所有被 `lib/learning/course-runtime-boundaries.ts` 标记为 `FORMAL_RUNTIME` 的课程都只允许：

```text
Course Builder Draft
→ LessonSpec
→ LessonSpec Registry
→ Runtime Plan
→ FormalGuidedLessonView
→ AsyncLessonRuntimeShell
→ Database Runtime hydration
→ GenericLessonRuntimePanel
→ Completion / Rating / 下一课
```

禁止：

- 旧 static renderer 作为正式课程 fallback；
- 正式课程 import `components/legacy-learning/*`；
- 从 `LegacyStaticLessonView` / legacy fixture 复制新课程交互；
- 把 Course Builder Preview route 当成正式 Runtime route；
- `RUNTIME_FALLBACK`；
- `localInteractiveFallback`；
- 因 LessonSpec / Runtime 漏注册而静默切换另一套 UI；
- 为单节正式课程新增专属 Renderer；
- 按 lesson slug 写 Renderer / CSS 特判；
- 因课程内容任务顺便修改已确认 Unified Lesson Shell。

正式课程缺少以下任一项时，必须直接暴露配置错误并修复：

- LessonSpec；
- Presentation；
- Runtime registration / provisioning。

**不能用另一套页面“先显示出来再说”。**

交互架构变更后必须至少运行：`npm run learning:course-interaction:check`、`npm run learning:runtime-perf003:check`、`npm run learning:sidebar-ux:check`、`npm run typecheck`。

---

## 5. 每节新课程开始前必须先完成的四个判断

在写 Draft 或代码之前，先输出并确认：

### 5.1 上一课 → 本课 → 下一课

明确：

- 上一课已经让学习者会什么；
- 本课只解决什么新问题；
- 下一课将继续解决什么；
- 本课不能提前把哪些下一课知识讲掉。

### 5.2 Primary Knowledge Point

一节课只确定一个主知识点 / 主判断。

必须能用一句话回答：

> 学员学完这一课，最重要的新判断是什么？

### 5.3 Main Learner Question

必须是普通初学者真实会问的问题，不是专业术语定义题。

### 5.4 Deferred Boundaries

明确本课不讲什么。

后续课程术语、机制、工程细节如果不是当前 Primary Knowledge Home，必须延后，不因“顺便解释完整”提前塞入本课。

---

## 6. 六步职责

正式课程固定使用：

```text
EXPLAIN
→ EXAMPLE
→ CHECK
→ PRACTICE
→ REVIEW
→ CAPABILITY
```

六步固定的是**教学责任**，不是固定版式、固定句式或固定字段形状；若某一步存在明确最低结构要求（例如 Step 5 主 Review 至少 2 张），只以 `LESSON_OUTPUT_CONTRACT_V1.md` 为准。

具体规则以：

`docs/learning/LESSON_OUTPUT_CONTRACT_V1.md`

为唯一规范性事实源。

UI / Shell 规则以：

`docs/learning/UNIFIED_LESSON_SHELL_V1.md`

为唯一规范性事实源。

---

## 7. 统一输出与验收入口

第 1～5 板块共用同一条 Course Production Workflow。每次构建先从当前板块的目录、知识边界、Formal Brief 和 Grounding 决定本课要教什么，再由 Course Builder 输出 Draft；不得从历史课程文案或 UI 数据形状反推教学内容。

六步教学、学习建议、进度卡片和 Step 1 底部说明统一按 `LESSON_OUTPUT_CONTRACT_V1.md` 生产；零基础课另按 `BEGINNER_LESSON_QUALITY_STANDARD_V1.md` 控制认知负担；Shell 的展示位置与交互按 `UNIFIED_LESSON_SHELL_V1.md`。进入正式 Runtime 前通过 Deterministic Validators 和 Human Review，规则变化由 Workflow 下次运行读取最新 owner 文件，不复制一份规则到本入口。

已确认的课程前端界面与交互冻结；后续第 3～5 板块的普通内容任务不新增 UI、不调整 CSS。

---

## 8. 新开对话禁止从这些内容恢复现行规则

以下内容可以作为历史证据或素材，但**不能单独作为当前课程构建依据**：

- `docs/task-results/*`
- `lib/courses.ts` 中早期 static 课程；
- `ai-literacy`
- `chatgpt-worker`
- `ai-workflow`
- 已废止的 `memory-rag` 等旧测试课程；
- 历史聊天里已经被当前 Contract / Curriculum 覆盖的旧规则；
- 旧 fallback / compatibility 实现；
- 已删除的旧 pilot / `course-builder:accept:*` / foundation trial 脚本不得恢复；`scripts/_historical-*` 只保留旧单课增量脚本与已经 AVAILABLE 批次的历史生产/恢复证据，不得作为当前 Workflow 入口。
- `skills/course-builder/_historical-*` 只保留旧 Skill provenance；当前课程生产只能从 `skills/course-builder/index.ts` 解析 current Skill。

如历史资料与当前事实源冲突，按第 3 节优先级处理。

当前课程规则只允许由 `COURSE_PRODUCTION_RULE_SOURCES` 中的 owner 文件 + Current Track Context + 当前 Formal Brief 共同决定。历史 validator 若包含某批课程特定数量或结构，只能约束该历史资产，不能被新 Workflow 当成通用规则。
脚本入口以 `scripts/README.md` 与 `package.json` 为准；正常开发不得直接从 scripts 目录猜测该运行哪个文件。

---

## 9. 构建后的最低验证

正式课程接入后至少执行：

```bash
npm run learning:course-current-state:check
npm run learning:course-governance:check
npm run scripts:current:check
npm run learning:formal-registry:check
npm run typecheck
```

同时运行当前课程自己的 Draft validator。

涉及 Runtime provisioning 时，还必须验证：

```text
Course Builder Draft
→ Runtime Definition
→ Database
→ actual course page
```

不能只验证 fixture 或 TypeScript PASS。

---

## 10. 新开对话推荐启动指令

以后新开对话只需要给出：

 > 读取 `docs/learning/COURSE_BUILD_START_HERE.md`，先以 `docs/CURRENT_SYSTEM_FACTS.md` 恢复当前 Track / Batch 状态，解析当前 Track owner、continuity、Formal Brief、Deferred Boundary 与 Grounding，并运行 `npm run learning:course-current-state:check`；按照当前正式课程构建基线继续 **当前 Lesson / Batch**。不要从 legacy / historical task-result 恢复旧阶段，不修改已确认 Unified Lesson Shell。

如果当前课程方向已经在同一对话确认，也可以直接说：

> 读取 `docs/learning/COURSE_BUILD_START_HERE.md`，按 Current Facts 解析当前 Track / Batch Context，继续构建当前已批准 Lesson / Batch。

---

## 11. Done Definition

一次正式课程构建不能只以“页面能打开”作为完成。

最低 Done：

```text
知识边界正确
+ 六步教学职责通过
+ Course Builder validation PASS
+ LessonSpec registered
+ Runtime registered / provisioned
+ Formal registry check PASS
+ Typecheck PASS
+ 实际课程页使用统一 Shell
+ Human Review / 实际体验无结构漂移
```

如果课程页面能够打开，但没有进入统一正式 Runtime，应视为**构建失败**，不得通过 fallback 掩盖。
