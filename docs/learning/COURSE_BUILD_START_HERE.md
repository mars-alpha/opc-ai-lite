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

Track 02 当前已批准的首批 Formal Brief：

- `docs/learning/TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md`

这些路径只是“当前事实示例”，不是 Workflow 的硬编码 Rule Sources。切换 Track / Batch 时必须从 Current Facts 重新解析 current owner。

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

LEGACY_STATIC：ai-literacy / chatgpt-worker / ai-workflow 只允许进入 components/legacy-learning/*；这些资产仅因历史 Entitlement / DB seed / acceptance 依赖暂存，不得作为新课程模板。

正式/legacy slug 的唯一边界文件是 `lib/learning/course-runtime-boundaries.ts`。新正式课程不能通过增加 fallback 进入页面，必须显式进入 Formal Runtime 主链。

当前 `foundation-ai` 正式课程只允许：

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

六步固定的是**教学责任**，不是固定卡片数量、固定句式或固定字段数量。

具体规则以：

`docs/learning/LESSON_OUTPUT_CONTRACT_V1.md`

为唯一规范性事实源。

UI / Shell 规则以：

`docs/learning/UNIFIED_LESSON_SHELL_V1.md`

为唯一规范性事实源。

---

## 7. 当前必须长期保持的构建原则

这些原则用于启动判断，不取代 Contract 正文：

- Topic first, responsibility fixed, representation flexible。
- Step 3 只检查 Step 1–2 已经教过的内容。
- Step 4 是最小真实动作；字段数量由当前任务决定。只要提供“复制到 AI / 一键填充参考答案”，字段值按顺序组合后就必须是一份可直接交给 AI 执行并得到课程目标输出的完整任务；不能只是字段说明或零散短句。
- Step 5 上方主卡片固定围绕“AI适合做什么 / AI不应该替你做什么”两个核心复盘方向回答；不能删除这两个方向。主卡片数量不固定，每张都必须有本课具体回答正文。主卡片下方保留按“明确命题 + 回答/解释”组织的说明层，数量同样不固定，用于解释原因、边界、使用条件和易混淆判断；上下两层不得机械重复。
- Step 6 必须把“现实触发场景”和“下一步为什么继续”分开：触发场景写学员未来会遇到的具体问题，不得用“下一课继续……”替代。
- 初学课程先建立直觉，再解释概念，不堆专业术语。
- 学员可见 AI / 技术术语首次出现默认使用 **中文（English）**；RAG、API、MCP 等行业常用技术缩写使用“中文解释（缩写）”。只有已经成为本课核心、行业通用的 AI / 技术术语才保留英文或缩写；`Beginner`、`Schema`、`Goal / Observe / Decide / Act / Stop` 等普通说明词或内部表达默认直接翻成自然中文。
- 标题、Step 标题、学习路径课程名和阶段说明同样遵守该规则：普通术语使用中文（English），行业常用技术缩写使用“中文解释（缩写）”。
- 新课程不能从上一课 UI 数据形状反推内容；先确定知识点，再适配统一 Shell。
- 已确认的课程 UI 是冻结资产；普通课程内容任务不得重新设计 Shell。

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
- 旧 fallback / compatibility 实现。

如历史资料与当前事实源冲突，按第 3 节优先级处理。

---

## 9. 构建后的最低验证

正式课程接入后至少执行：

```bash
npm run learning:course-current-state:check
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
