# Track 01 — 20-Lesson Canonical Realignment v1

Status: **COMPLETE_REALIGNED_V1**  
Task: **CURRICULUM-AUDIT-REALIGN-001-R1 — Track 01 20-Lesson Canonical Realignment**  
Canonical audit: `TRACK01_28_CANDIDATE_SIX_STEP_AUDIT_V1.md`

## 1. Canonical identity rule

从本任务完成后，Track 01 唯一允许用于新 Formal Brief / Course Builder / Catalog planning / production provenance 的课程身份为：

`T1-01` ～ `T1-20`

旧 `F1-01`、`F2-01`、`F3-01`… 只保留为历史 alias / evidence locator，不再是新课程生产 identity。

历史 Runtime / UX 测试资产 `task-brief`、`memory-rag`、`writing-files`、`task-decomposition` 不属于 Track 01 canonical identity。

## 2. Canonical 20-lesson directory

| ID | Title | Type | Curriculum status | Availability |
| --- | --- | --- | --- | --- |
| T1-01 | AI 能帮什么，不能帮什么 | APPLICATION | BRIEF_READY | COMING_SOON |
| T1-02 | Prompt：把任务说清楚 | APPLICATION | BRIEF_READY | COMING_SOON |
| T1-03 | Context：给 AI 足够但不过量的信息 | APPLICATION | BRIEF_READY | COMING_SOON |
| T1-04 | Iteration：把第一版结果改到可用 | APPLICATION | BRIEF_READY | COMING_SOON |
| T1-05 | 结果可靠性：什么时候必须核验 | APPLICATION | BRIEF_READY | COMING_SOON |
| T1-06 | 模型与 AI 产品：你使用的到底是什么 | CONCEPT | PLANNED | COMING_SOON |
| T1-07 | Token 与概率生成：为什么 AI 每次答案会变化 | CONCEPT | PLANNED | COMING_SOON |
| T1-08 | Conversation History 与 Memory：AI 到底“记住”什么 | CONCEPT | PLANNED | COMING_SOON |
| T1-09 | Knowledge Base 与 Source of Truth：AI 应该相信哪份资料 | CONCEPT | PLANNED | COMING_SOON |
| T1-10 | Search 与 RAG：AI 怎样先找证据再回答 | CONCEPT | PLANNED | COMING_SOON |
| T1-11 | API：AI 产品怎样和其他系统交换信息 | CONCEPT | PLANNED | COMING_SOON |
| T1-12 | Structured Output 与 Schema：怎样让系统稳定接收 AI 结果 | APPLICATION | PLANNED | COMING_SOON |
| T1-13 | Function Calling 与 Tool Use：AI 怎样调用外部能力 | CONCEPT | PLANNED | COMING_SOON |
| T1-14 | MCP：为什么 AI 需要统一连接工具与资源 | CONCEPT | PLANNED | COMING_SOON |
| T1-15 | Skill：把可复用的方法交给 AI | CONCEPT | PLANNED | COMING_SOON |
| T1-16 | Workflow 与 Automation：把一次方法变成可重复流程 | APPLICATION | PLANNED | COMING_SOON |
| T1-17 | Agent：什么时候才需要动态决策 | APPLICATION | PLANNED | COMING_SOON |
| T1-18 | Multimodal：文字、图片、语音、视频怎样一起工作 | APPLICATION | PLANNED | COMING_SOON |
| T1-19 | Coding、Browser 与 Computer Use：AI 怎样从回答走向操作 | CONCEPT | PLANNED | COMING_SOON |
| T1-20 | Privacy、Permissions 与 Human-in-the-loop：什么不能直接交给 AI | APPLICATION | PLANNED | COMING_SOON |

规则：
- 只有 T1-01～T1-05 本轮完成 Formal Brief，因此为 `BRIEF_READY`；
- T1-06～T1-20 只有 canonical curriculum identity，不批量 Formalize；
- 本任务不把任何课程标记为 `AVAILABLE`；
- 本任务不改变 Runtime / Shell / Schema / UI。

## 3. Historical F identity → canonical T1 mapping

| Historical identity / knowledge home | Canonical home | Migration rule |
| --- | --- | --- |
| F1-01 Everyday AI use cases | T1-01 | 可迁移场景、任务分类与 first-use 经验 |
| F1-02 Input quality → result quality | T1-02 | 只作为 Prompt 的解释性 supporting，不保留独立 identity |
| F1-03 Hallucination / verification intuition | T1-05 | 迁移“流畅不等于正确”与风险标记思路 |
| F1-04 AI product capability map | T1-01 + T1-06 | 使用场景部分归 T1-01；模型/产品边界归 T1-06 |
| F2-01 Prompt foundations | T1-02 | 主体可迁移，需按新 Brief 重组 |
| F2-02 Task Context | T1-03 | 主体可迁移 |
| F2-03 Iteration / clarification | T1-04 | 主体可迁移 |
| F2-04 Basic reliability judgment | T1-05 | 主体可迁移 |
| F3-01 Model vs Product | T1-06 | 历史 alias |
| F3-02 Training / Inference | T1-06 supporting | 不再独立成课 |
| F3-03 Token / generation intuition | T1-07 | 历史 alias |
| F3-04 Context Window | T1-03 + T1-07 supporting | 不再独立成课 |
| F4-01 History / Memory | T1-08 | 历史 alias |
| F4-02 Knowledge Base / Source of Truth | T1-09 | 历史 alias |
| F4-03 Search / RAG | T1-10 | 历史 alias |
| F4-04 Embedding / Vector Search | Technical RAG | Track 01 只在 T1-10 保留最低直觉 |
| F5-01 API | T1-11 | 历史 alias |
| F5-02 Structured Output / Schema | T1-12 | 历史 alias |
| F5-03 Function Calling / Tool | T1-13 | 历史 alias |
| F5-04 MCP | T1-14 | 历史 alias |
| F6-01 Skill | T1-15 | 历史 alias |
| F6-02 Workflow | T1-16 | 与 Automation 合并成基础能力闭环 |
| F6-03 Automation | T1-16 | 不再独立 identity |
| F6-04 Agent | T1-17 | 与 Workflow-vs-Agent judgment 合并 |
| F6-05 Workflow vs Agent | T1-17 | 不再独立 identity |
| F6-06 HITL | T1-20 | 与 Permission / high-risk boundary 合并 |
| F7-01 Multimodal | T1-18 | 与 media capability judgment 合并 |
| F7-02 Media Capabilities | T1-18 | 不再独立 identity |
| F7-03 Coding / Browser / Computer Use | T1-19 | 保留独立 capability |
| F7-04 Privacy / Security / Permissions | T1-20 | 主体保留 |
| F7-05 Evaluation basics | T1-05 supporting | 基础结果验收并入 reliability；正式 Evaluation 深化到 Track 04 |
| F7-06 High-impact decision boundary | T1-20 | 并入安全与 HITL |

说明：上表用于 historical lookup，不重新宣称所有 F 行都是“28 个产品候选”。产品候选边界仍以 28-candidate audit 为准。

## 4. Continuity realignment

Track 01 开场能力链固定为：

```text
T1-01
真实任务 + AI First Draft
↓
T1-02
Clear Task Brief + Prompt-improved Draft
↓
T1-03
Minimum Context Pack + Context-enriched Draft
↓
T1-04
Iteration Notes + Iterated Draft
↓
T1-05
Verification Record + Verified Publishable Draft
```

这一条链替代旧 F1-01～F2-04 的八课 Artifact Thread，目标不变：

**让零基础学习者第一次把一个真实 AI 任务从“试一下”做到“可用、可核验”。**

T1-06 以后开始补必要世界观和现代 AI 能力，不重新教授 T1-01～T1-05 已形成的协作方法。

## 5. Existing Continuity Trial asset migration

| Existing Trial / asset | Decision | New use |
| --- | --- | --- |
| `beginner-ai-use-cases` / old F1-01 Trial | MIGRATE_AS_REFERENCE | T1-01 的真实任务开场、first draft、任务分类体验可迁移；旧 lesson identity / Check 不直接复用 |
| `beginner-ai-result-quality` / old F1-02 Trial | SUPPORTING_REFERENCE | “只改一个关键变量做 Before/After”迁入 T1-02 Example；不保留独立课程 |
| `beginner-prompt` / old F2-01 Trial | MIGRATE_AS_REFERENCE | T1-02 的 Prompt 结构、Practice 交互与学习者语言可迁移；需按 T1-02 Brief 重建 Check/Review/Capability |
| `beginner-context` / old F2-02 Trial | MIGRATE_AS_REFERENCE | T1-03 的 Context Pack、MINI_TASK、Reference Answer 支撑可迁移；旧 F2 identity 作废 |
| `beginner-iteration` / old F2-03 Trial | MIGRATE_AS_REFERENCE | T1-04 的两轮改稿、偏差定位与 Iteration Notes 可迁移；需重建当前版三题 Mastery |
| old F1-03 content / verification flags | MIGRATE_AS_REFERENCE | 并入 T1-05 的 hallucination intuition / risk marking |
| old F2-04 reliability/check material | MIGRATE_AS_REFERENCE | T1-05 的 Verification Plan / Record 主参考 |
| `memory-rag` | REFERENCE_ONLY_TEST_ASSET | Generic Runtime / CONCEPT UX 证据；不是 T1-08/T1-10 正式课程 |
| `task-brief` | REFERENCE_ONLY_TEST_ASSET | Guided Shell / APPLICATION UX 证据；不是 T1-02 identity |
| `writing-files` | REFERENCE_ONLY_TEST_ASSET | APPLICATION UX/Runtime blocker 证据；属于 Track 02 方向 |
| `task-decomposition` | REFERENCE_ONLY_TEST_ASSET | PRACTICE / Workflow Runtime 证据；属于 Track 04 |

迁移规则：
- 可以迁移教学方法、案例节奏、已验证交互模式、learner-facing language；
- 不允许直接继承旧 `lessonId`、旧 Check、旧 Practice payload、旧 Review、旧 Capability；
- 新 Draft 必须以 T1 Formal Brief 为事实源重新生成和验证六步内容。

## 6. Catalog realignment contract

新的 planning Catalog 必须按 T1-01～T1-20 展示。

旧 `FOUNDATION_CATALOG_METADATA_V1.md` 降级为 **LEGACY_F_ID_CATALOG_REFERENCE**；它记录历史 F identity 和旧 UI metadata，但不再决定新课程数量、顺序、prerequisite 或 production status。

真实 UI / typed catalog bridge 的代码迁移属于下一独立 implementation task；本 realignment 不修改前端代码。

## 7. Production boundary

当前允许进入下一生产 Gate 的只有：
- T1-01
- T1-02
- T1-03
- T1-04
- T1-05

Formal Brief source:
- `TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md`

T1-06～T1-20 保持 PLANNED，直到后续小批次 Brief task。

下一步建议：
**COURSE-PRODUCTION-TRACK01-A-001 — T1-01～T1-05 Course Builder Production**
但正式开始前仍需产品负责人确认本轮 Formal Brief。
