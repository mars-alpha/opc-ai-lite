# AGENTS.md — OPC AI 开发治理基线

本文件是本仓库所有后续开发任务的默认执行规则。

## 1. 核心原则

优先级固定为：

```text
系统可运行
→ 当前事实正确
→ 当前任务闭环
→ 再增加功能
```

禁止为了“顺便完善”扩大任务范围。新增抽象、表、模块、自动化、兼容层之前，必须能说明它是当前任务闭环所必需。

### 1.1 MVP 旧代码 / 重构优先规则

当任务触及旧实现、历史兼容、fallback、重复状态或多轮补丁时，默认先判断当前任务最终产品行为与完整主链，再决定是否复用旧代码；禁止从“怎样最小修改旧代码”作为默认起点。

固定顺序：

先定义最终行为与唯一事实源 → 审计旧代码是否仍服务当前目标 → 能清晰复用则保留 → 重复 / 冲突 / 仅为旧方案兜底则删除或重写 → 收敛为一条主链 → 做端到端整体验证 → 最后处理少量残余 Bug。

MVP 阶段特别禁止通过连续叠加以下内容来“修好一个点”：

- 新的临时状态变量；
- 新的 fallback / compatibility branch；
- 同一业务状态的第二事实源；
- 只为绕过旧实现而新增的临时 API；
- 隐式排队、乐观完成、前端假状态或其他与正式 Runtime 不一致的捷径。

如果一个功能需要越来越多特殊判断才能维持，应优先判断现有状态流 / 模块边界是否需要收敛或重写，而不是继续补条件。允许在 MVP 未正式稳定前删除阻塞主线的 legacy 实现，只保留必要的数据兼容与清晰接口。

目标固定为：整体正确优先、代码简洁优先、单一事实源优先、端到端验收优先；修 Bug 为辅。

## 2. 每个任务开始前必须读取

先确认：

```text
git status
git log -1
AGENTS.md
docs/CURRENT_SYSTEM_FACTS.md
PROJECT_STATUS.md
TASKS.md
```

然后只读取当前任务真正相关的：

```text
docs/ARCHITECTURE.md
docs/domains/*
受影响 app / components / lib / drizzle 文件
与当前问题直接相关的历史 task-result
```

不要默认加载全部历史 task-result。历史结果用于追溯证据，不是当前事实源。

如果任务会修改某模块，必须先读取该模块的现有实现、调用方、Schema / API / UI 边界，不能仅根据聊天记录开发。

## 3. 事实源优先级

发生冲突时按以下顺序判断：

```text
当前 Git HEAD + 实际代码 / Schema / Migration
↓
docs/CURRENT_SYSTEM_FACTS.md
↓
PROJECT_STATUS.md
↓
docs/ARCHITECTURE.md / docs/domains/*
↓
TASKS.md
↓
docs/task-results/*（历史证据）
↓
聊天中的旧规划
```

如果代码事实与当前文档不一致，任务中应同步修正文档，不能让漂移继续累积。

## 4. 上下文控制

每个任务先区分：

```text
Must Know
Nice to Know
Do Not Load
```

只加载会改变当前设计或验收结果的信息。禁止因为长期项目历史很多，就把全部规划、全部 task-result、整个仓库内容重复塞入每一次任务上下文。

## 5. 开发范围

每个任务必须有明确：

```text
Goal
In Scope
Out of Scope
Required Reads
Validation
Done
```

执行期间发现缺口时：

- 若缺口是当前任务闭环必需：允许补充，并同步对应事实文件；
- 若只是未来优化：记录到 TASKS / Backlog，不顺手实现；
- 若发现当前系统不能稳定运行：先处理运行阻塞，再继续新增功能。

## 6. 运行与验证优先

业务代码变更至少执行：

```text
npm run typecheck
npm run build
```

涉及数据库时还要检查 Schema、Migration、当前数据库目标，以及是否需要 Runtime smoke。

远程数据库 migration、部署、外部 Provider 调用等有真实副作用的动作，不因“验证方便”擅自执行；必须有明确授权或既定执行窗口。

文档-only 任务不要求为了形式重复跑 build，但必须 review diff。

## 7. 数据与领域边界

- PostgreSQL / OPC Production Data 是正式业务 Source of Truth；
- Content = 外部动态信息进入系统后的运营对象；
- Knowledge = 人工审核后的 OPC 核心知识资产；
- Feishu Deep Resource = 深度研究 / 实践载体，不取代核心事实源；
- Obsidian = 筛选后的长期个人知识沉淀；
- Practice = 可执行、可提交、可评价的训练对象；
- Course = 系统学习路径；
- Skill = 可版本化、可迭代的方法 / Prompt / SOP / Structured Output 资产；
- AI 永远不能直接覆盖 Published Course / Knowledge / Practice。

第一个真实需要 Skill 的任务出现时，先做最小 Skill v0.x 并落盘版本化，再用真实结果迭代；不提前建设空的通用 Skill Platform。

### 7.1 Core / Skill 六条固定规则

所有新功能在设计前必须先判断属于 Deterministic Core、Skill Runtime，还是连接两者的 Workflow。

固定规则：

```text
Rule 1
能确定性实现 → Code First

Rule 2
需要语义理解 / 生成 / 推理 → Skill

Rule 3
Skill 不直接拥有核心业务状态

Rule 4
Skill 输出必须结构化

Rule 5
最终写库、发布、权限、状态变化 → Core System

Rule 6
Skill 挂掉，核心系统仍可运行
```

架构职责固定为：

```text
Code = Truth
Skill = Intelligence
Workflow = Controlled Bridge
Core System = Authority
```

具体边界：

- DB / Auth / Access / State / CRUD / Schema / Validation 属于 Deterministic Core；
- 权限判断必须由 Core System 确定执行，禁止交给 Skill 猜测；
- Skill 负责 Summarize / Analyze / Classify / Generate / Synthesize 等语义任务；
- 系统负责决定 Skill 允许读取哪些 Context，并将受控 Context 传给 Skill；Skill 不默认拥有任意数据库 / 文件 / API 访问权；
- Skill 只能返回 Structured Draft / Proposal / Candidate 等结构化候选；
- Skill 输出必须经过 Code Validation，必要时再进入 Human Review / Rules；
- 最终 Production Data 写入、发布、权限结果、状态流转只能由 Core System 执行；
- Skill timeout / Provider failure / invalid output 时，核心系统仍必须可运行；按任务允许使用 RULE fallback / NEEDS_REVIEW / no generation，不得让 Skill failure 破坏 Auth、Access、Course、Knowledge、Practice 等核心 Runtime。

标准执行链：

```text
Deterministic Core
DB / Auth / Access
State / CRUD / Schema
Validation / Workflow
        ↓
Skill Runtime
Summarize / Analyze / Classify
Generate / Synthesize
        ↓
Structured Draft
Proposal / Candidate
        ↓
Code Validation
        ↓
Human / Rules
        ↓
Production Data
```

### 7.2 Skill Responsibility & Orchestration Gate

后续所有开发任务在实现前必须先判断：

```text
CODE_ONLY
→ 普通代码可以确定性完成，不创建 Skill

EXISTING_SKILL
→ 已有 Skill 的职责与输入输出已覆盖，复用现有版本

NEW_SKILL_NEEDED
→ 需要新的独立语义能力
```

当结论为 `NEW_SKILL_NEEDED` 时，不得直接进入完整业务开发。必须先与产品负责人讨论一个最小 `Mini Skill Proposal`，至少明确：

```text
Skill ID / Proposed Version
Single Responsibility
Primary Output
Input Schema
Output Schema
Forbidden Actions
Acceptance Criteria
Failure Strategy
Human Review Requirement
Called By Workflow
Why Code Is Not Enough
Why Existing Skill Cannot Be Reused
```

固定 Skill 治理规则：

- 一个 Skill 只承担一个可独立验收的职责，并只有一个主要输出；
- 两个输出若可以分别验收、分别失败、分别优化，默认拆成两个 Skill；
- Skill 只属于 Content / Intelligence Layer，必须 Architecture-neutral；
- Skill 可以消费现有 Contract，但不得自行修改 Schema / API / Runtime / DB / Workflow / Permission / Publish / Progress / Completion；
- 架构能力不足时，Skill 只能返回 Proposal / Unsupported，由独立工程任务处理；
- Skill 默认不得直接调用另一个 Skill，多 Skill 串联统一由 Workflow 编排；
- 输入输出优先 Schema First，不依赖 Skill 之间的隐式状态；
- Skill 必须版本化落盘，依据真实输出独立迭代，不静默覆盖旧版本；
- 已实现 Skill / Version 必须登记到 `skills/REGISTRY.md`；
- 自动化程度提高不改变 Human Review 与 Core System Authority。

完整规范见 `docs/SKILL_GOVERNANCE.md`。

### 7.3 Course Production Governance Gate

正式课程生产任务开始实现前必须明确：

```text
Canonical Lesson IDs
Formal Brief Source
Production Batch
Skill Decision
Selected Skill ID / Version
Quality Standard / Profile
Grounding Source
Target Preview
Human Review Required
Runtime Scope
Out of Scope
Acceptance
```

课程生产固定链路：

```text
Curriculum / Knowledge Map
→ Formal Lesson Brief
→ Course Builder
→ Code Validation
→ Draft Preview
→ Human Review
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE
```

固定边界：

- `curriculumStatus` 与 `availability` 保持独立；
- Preview 不写正式 Progress / Completion；
- Human Review PASS 不等于 Runtime Ready；
- Runtime Ready 不等于自动发布；
- 只有 Human Review PASS + Runtime Acceptance PASS 后，才允许进入正式发布动作；
- 一次 generation attempt 只能使用一个明确 Skill Version，不允许 v0.1 + v0.2 复合使用；
- 当前新 Beginner 课程默认使用 `course-builder@0.2.0`，v0.1 只保留历史 provenance / legacy compatibility；
- Human Review FAIL 回到 IN_PRODUCTION 重做，canonical lesson identity 不变；
- Skill 本身的问题单独升级 Skill Version，不在课程任务中静默改 Prompt；
- Runtime / Shell / Schema 不支持时另开工程任务，不允许 Course Skill 自行扩架构。

完整规范见 `docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md`。

## 8. 任务完成后的固定收口

固定流程：

```text
Implementation
↓
Validation
↓
必要的 Runtime / Acceptance Check
↓
同步 CURRENT_SYSTEM_FACTS（仅事实发生变化时）
↓
同步 PROJECT_STATUS
↓
同步 TASKS
↓
同步相关 domain / architecture / task-result（确有需要时）
↓
Git Diff Review
↓
Atomic Commit
↓
git status clean
↓
重新读取 git log -1 / 当前事实
↓
再讨论下一阶段
```

## 9. 文档降噪

- `docs/CURRENT_SYSTEM_FACTS.md`：只写当前实现事实、已知阻塞、当前边界；
- `PROJECT_STATUS.md`：只写当前阶段、当前健康状态、下一步；
- `TASKS.md`：写任务状态和未来顺序；
- `docs/ARCHITECTURE.md` / `docs/domains/*`：写稳定长期规则；
- `docs/task-results/*`：保留历史证据，不作为当前状态总表。

不要把同一段历史在多个文件反复复制。

## 10. Legacy / Fallback

根目录旧静态原型：

```text
index.html
learning-path.html
ai-daily.html
practice.html
styles.css
script.js
```

不是当前正式 Runtime。当前正式 Runtime 是 Next.js App Router。

静态 fallback（如 `lib/courses.ts`、`lib/contentDemo.ts`、local progress fallback）只能按现有明确用途保留；新增功能不得把 fallback 重新当成 Production Source of Truth。