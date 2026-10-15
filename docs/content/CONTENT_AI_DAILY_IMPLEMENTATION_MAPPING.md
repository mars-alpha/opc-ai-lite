# CONTENT_AI_DAILY_IMPLEMENTATION_MAPPING.md

Status: **CURRENT**  
Task: CONTENT-AI-DAILY-CONTRACT-001  

## 1. Purpose

把现有内容生产兼容代码映射到 AI 日报下游阶段；采集质量反馈的入口、状态和历史隔离由采集合同及 `TASKS.md` 管理。本文件不定义热点追踪人工 Gate。

本文件只做 Mapping，不授权本轮修改数据库、业务代码或 UI。

## 2. Current System Facts

当前采集入口已经按 Collection Contract 收敛：

```text
/admin/sources
→ Source / Creator / Qualification / Route / Collection Conditions 唯一配置面；认证仅作为需要登录的 Route dependency

SYSTEM Collection Runtime
→ 所有已启用来源的统一自动采集 → Raw / Observation

/admin/intelligence
→ 热点追踪：沿用既有排版（当前热点 / 今日值得做 / 精选 / 全部动态），数据来自统一 Event / Evidence / Momentum / Curation 闭环

/admin/manual-collection
→ RETIRED：仅保留兼容重定向 /admin/sources；旧 Manual Core 与 Runner 依赖已退出 current runtime

/admin/content
→ 现有内容工作台兼容入口仍在运行；其中旧 Event 决策控件列入 `SOURCE-QUALITY-FEEDBACK` 清理
→ 内容选题与五阶段生产入口待后续独立规划，不消费热点追踪质量标签
```

Current architecture 不再建立 SYSTEM / MANUAL 两套产品链。管理员操作只是在 Source Management 中建立或调整 Source/Creator/Connection；正常采集统一由 SYSTEM Runtime 执行。历史 MANUAL provenance / Task / Result 仅用于兼容与审计，不再作为未来数据 Owner。

当前已确认实现：

- `lib/content/intelligence-policy.ts`
- `lib/server/content/source-policy.ts`
- `lib/server/content/entity-registry.ts`
- `lib/server/content/entity-resolution.ts`
- `lib/server/content/collection-runner.ts`
- `lib/server/content/search-discovery.ts`
- `lib/server/content/discovery.ts`
- `lib/server/content/event-seed-clustering.ts`
- `lib/server/content/event-clustering.ts`
- `lib/server/content/event-signal.ts`
- `lib/server/content/collection-expansion.ts`
- `lib/server/content/intelligence-read-model.ts`（PRE-026：confirmed / unverified Secondary Discovery Candidate）
- `lib/server/content/event-ai-analysis.ts`（PRE-026：Expansion Evidence reference context + strict validated OPC Analysis）
- `lib/server/content/comment-insight.ts`（Phase 025：Trigger-based Demand Signal only）
- `lib/server/content/workbench-contract.ts`
- `lib/server/content/workbench.ts`
- UI owner: `AdminContentStudioWorkspace`

现有主链：

```text
Source Identity
→ Acquisition Route（Primary / Fallback / Cost / Health）
→ Raw Item / Observation（original text + originalUrl 保留）
→ Cheap Relevance Gate
→ Layered Dedup / Entity Resolution
→ Event / Evidence
→ Bounded Secondary Discovery（confirmed + unverified；Expansion=REFERENCE_ONLY）
→ Event AI Analysis（实践 Evidence 只作 reference context；OPC Value 仍由真实 Analysis 产生）
→ Triggered Comment Demand Mining（QUESTION / PAIN_POINT / REQUEST / OPINION；不取得事实权力）
→ Event Momentum v2（0–24h RISING / 24–168h SUSTAINED；PRESENTATION_ONLY；6/12/24h adaptive follow-up budget）
→ Presentation Enrichment（中文标题 / 摘要 / why-it-matters；不覆盖原始来源）
→ STOP：上游 Source Management / SYSTEM Runtime / Radar / Runtime Quality Gate
→ Content 选题入口与 DRAFT / Evidence Pack / Workbench / Review / Publish 后续独立规划
```

## 3. Keep / Rewrite / Exit

### CURRENT ROADMAP GATE

内容工作台的选题入口和五阶段实现不在当前采集质量反馈任务中推进。采集侧当前事实见 `docs/CURRENT_SYSTEM_FACTS.md`，后续开发顺序只见 `TASKS.md`；本文件不复述已完成 Phase，也不把旧 Event 决策当 Human Gate。


### KEEP

以下能力与新合同方向一致，应优先复用：

- Source Policy / Source Registry 分离。
- 通用 Acquisition Family 的当前能力与限制由采集合同负责；内容工作台不拥有 Collector 或新的采集生命周期。
- REFERENCE_ONLY 媒体边界。
- canonical URL/content hash 作为 Raw 第一级去重；Event 继续使用 title/entity-action-version/semantic 聚类。
- Observation 多来源发现事实。
- Event Seed / Expansion / Cluster / Signal。
- Source-managed Expansion 只通过现有 SYSTEM 及采集合同约束运行，不取得 Verification/Hotspot authority。
- 旧 Event 决策表仅保留历史审计；新质量标签不会驱动内容生产。
- 既有 Adoption/Content Draft 能力仅按真实调用链保留，不作为新采集任务扩展入口。
- DRAFT / REVIEW / PUBLISHED 基础发布能力。
- Source / Event / Evidence 可追溯基础。

### REWRITE / EXTEND

- Content Brief Enrichment：
  - 当前只补核心观点 / 受众 / 目的 / 标签；
  - 目标应被 Topic Diagnosis + Evidence Pack + Outline 等正式 Artifact 取代或吸收。

- Workbench Contract：
  - 当前面向通用内容工作台；
  - 目标应明确只服务 AI Daily。

- Workbench：
  - 当前生成、编辑、输出结构需重新映射五阶段。

### EXIT FROM CURRENT PRODUCT SCOPE

- 小红书 / 知乎等平台输出。
- 视频脚本作为内容采集当前正式输出。
- 配音 / 剪映。
- 通用文章改写。
- “内容采集 = 多平台内容工厂”的描述。

退出 current scope 不等于立即删除所有兼容代码；实现阶段先做引用审计，再决定删除或迁移，禁止盲删。

## 4. Target Mapping

| Target Stage | Current Input | Current Reuse | Target Addition |
| --- | --- | --- | --- |
| Topic Diagnosis | Event / Signal / Sources | Event Discovery, Signal | New Artifact + Adapter |
| Evidence Pack | 独立内容选题确认后的 Event + Sources | Evidence link, Expansion | New structured Artifact；选题入口后续规划 |
| Outline | Evidence Pack | none as formal owner | New Artifact |
| Draft | Outline + Evidence | Workbench draft concepts | New lineage contract |
| Formatted Draft | Draft + Assets | Workbench presentation | New structured blocks |

## 5. Skill Mapping

Skill 不直接成为数据模型。

候选映射：

```text
Discovery adjunct
→ qianjin-trending-hunter

Topic Diagnosis
→ dbskill

Evidence Pack
→ content-research-writer

Outline
→ content-research-writer

Draft raw writing
→ content-research-writer

Draft language naturalization
→ Humanizer-zh

Formatted Draft / Assets
→ ian-xiaohei-illustrations
→ guizang-social-card-skill
→ html-anything
→ future Remotion Runner
```

说明：
- qianjin-trending-hunter 只作为 Discovery 辅助，不替代 Collector。
- dbskill verdict 只提供建议，不自动 Adopt。
- content-research-writer 必须按三个不同阶段调用，不能一步直接越过 Evidence/Outline 生成最终稿。
- Humanizer-zh 不拥有独立业务状态。
- 视觉 Skill 在第一轮数据库 / Workflow 实现中可继续暂缓。

## 6. Required Adapter Boundary

目标：

```text
Business Workflow
→ OPC Skill Adapter
→ Skill
→ Structured Output
→ Validator
→ Core Persist
```

Adapter 至少负责：
- 输入裁剪。
- Skill version。
- Model profile。
- timeout / retry policy。
- 输出解析。
- 不允许 Skill 获得数据库写权限。

## 7. Proposed Data Direction — Not Yet Implemented

数据库设计阶段优先评估：

```text
content_artifacts
  artifact_type
  schema_version
  version
  parent_artifact_id(s)
  payload JSONB

content_assets
  asset metadata
```

同时保留关系型核心 owner：
- Event。
- Content。
- Source。
- Workflow / Publish status。
- Audit。

为什么优先评估 Artifact + JSONB：
- AI 输出结构会继续迭代。
- 五阶段 lineage 比大量固定 column 更重要。
- 不把 Skill-specific 字段扩散进主业务表。

这只是目标方向；必须先做现有 Schema 审计后才能决定 migration。

## 8. Target UI — Not Yet Implemented

内容工作台未来只展示业务动作：

```text
选题诊断
资料
提纲
正文
排版
```

Skill 名称不进入主 UI。

“AI 排版”：
- 位置：生成结果区域右上方。
- 蓝底白字。
- 输入必须是当前 Draft。
- 输出 Formatted Draft。
- UI 实现完成后必须进入 VISUAL_HUMAN_REVIEW_GATE。

当前合同阶段不得修改 UI。

## 9. Implementation Order After Contract Approval

### Phase 1 — Existing Schema / Code Audit

只审计：
- content_* schema。
- workbench contract。
- adoption / evidence / review / publish。
- 当前 API。

输出 Current → Target field mapping。

### Phase 2 — Validator First

先实现：
- Artifact Schema。
- deterministic validators。
- fixtures。

旧实现应先出现明确 RED。

### Phase 3 — Minimal Data Model

再做：
- migration。
- artifact lineage。
- asset metadata。

必须使用 Safe Migration Gate。

### Phase 4 — Core Workflow

```text
Event
→ Content Selection（后续单独规划）
→ Diagnosis
→ Evidence
→ Outline
→ Draft
→ Formatted
→ Publish
```

先用 deterministic fixtures / mock Adapter。

### Phase 5 — Skill Adapters

优先：
1. Topic Diagnosis。
2. Evidence / Outline / Draft。
3. Humanizer。

视觉 Skill 后置。

### Phase 6 — UI

最后调整工作台，并暂停等待人工体验审核。

## 10. Explicit Stop Point

CONTENT-AI-DAILY-CONTRACT-001 到此阶段只允许：

- 四份合同。
- 文档引用治理。
- 文档 validator / Git diff 检查。

不允许：
- migration。
- schema 变更。
- lib/server/content 业务代码修改。
- app/admin/content UI 修改。
- COS。
- Remotion。
- 第三方 Skill 正式接入。

旧 Contract Stop Point 和旧 Phase 026→027 顺序已经退出 current roadmap，不得再阻断非可视化采集修复。当前阶段及阻塞只见 TASKS.md / PROJECT_STATUS.md；涉及新界面的任务仍遵守 VISUAL_HUMAN_REVIEW_GATE。Content Workbench 从合格 Event/Evidence 之后开始，继续按独立任务规划。

## 11. Contract-Level Acceptance

- Current implementation 已有明确 Keep / Rewrite / Exit。
- 五阶段和现有代码有清晰 Mapping。
- Skill 通过 Adapter，不直接写库。
- 数据方向只作为待审计目标，不偷跑 migration。
- UI 目标明确但未实施。
- 有明确 STOP POINT。

## 12. Collection Boundary

采集发现、Source / Entity / Event Policy、SYSTEM / MANUAL 边界与真实来源能力不再由本文件维护。
当前唯一 owner：
- `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md`
- `docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md`
- `lib/content/intelligence-policy.ts`

AI Daily 从已通过 Collection Policy 的 Event / Evidence 开始，只负责 `Topic Diagnosis → Evidence Pack → Outline → Draft → Formatted Draft`。历史 Discovery Strategy / Collection Strategy / 平台热榜 / Media Candidate 审计已退出本文件，历史通过 Git 追溯，禁止作为 current implementation 依据。

## 13. EVENT-EXPANSION-OUTPUT-014 Implementation Mapping

- event-expansion-output.ts：Event fact Raw + Expansion Evidence → 六栏目派生 Read Model。
- event-expansion-output-synthesis.ts：可选 AI 中文表达层 + deterministic validator。
- accept-event-expansion-output.ts：FACT/REFERENCE_ONLY、0 Evidence、跨栏去重、未知引用、空栏补写、数字防护。
- accept-event-expansion-output-db.ts：Development 真 DB 临时 Event/fact/Expansion Evidence → 六栏目 → fixture 清理。
- 复用现有 content_event_raw_items / content_event_expansion_evidence；不新增表和 migration，不把派生视图当正式 Evidence Pack。
- AI synthesis 仅写 ai_runs；不拥有 Event/Content/Artifact/Publish 状态。下一 Gate 为真实 Event Human Review。
