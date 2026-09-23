# Track 01 Canonical Catalog Metadata v2

Status: **FROZEN_CORE_PATH_V1**
Task: **TRACK01-PHASE2-CURRICULUM-001 — Core Learning Path Freeze**
Curriculum owner: **this file**

## 1. Ownership rule

本文件是 Track 01 课程目录、顺序、Phase、Lesson Type、Primary Knowledge Point 与 prerequisite 的唯一当前 owner。

后续 Formal Brief / Course Builder / Lesson Production 必须从本文件读取 Track 01 目录，不再从旧 F-ID Catalog、历史 Trial 或 Runtime 测试资产反推课程结构。

以下内容不由本文件维护：
- Runtime 是否已部署 / AVAILABLE；
- Access / Membership；
- currentStep / Completion / Resume；
- Formal Brief 的具体六步教学内容；
- Course Builder Draft。

这些事实分别由 Current System Facts、Access/Runtime、Formal Brief 与 Lesson Output Contract 负责。

## 2. Frozen learning-path structure

Track 01 当前冻结基线为 **20 节 / 6 个 Phase**。**20 节不是数量上限**：若后续 Formal Brief、Human Review、真实学习测试或跨 Track continuity 证明现有课程不足以让学习者形成必要理解 / 判断 / 动作，可以新增 Lesson；新增必须补一个明确能力缺口，而不是因为“这个知识也重要”就扩课。6 个 Phase 当前作为稳定能力分组，只有在新增能力无法自然归入现有 Phase 时才允许调整。

### Phase 1 — 先真正会用 AI

目标：零基础学习者先把一个真实 AI 任务从“试一下”做到“可用、可核验”。

| order | ID | title | type | Primary Knowledge Point | Core capability | prerequisite |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | T1-01 | AI 能帮什么，不能帮什么 | APPLICATION | AI Task Fit / Use-case Boundary | 能判断真实任务是否适合 AI、哪些需要核验、哪些不应直接交给 AI | none |
| 2 | T1-02 | Prompt：把任务说清楚 | APPLICATION | Prompt / Task Instruction | 能把模糊需求变成清楚、可执行、可检查的任务说明 | T1-01 |
| 3 | T1-03 | Context：给 AI 足够但不过量的信息 | APPLICATION | Context / Minimum Sufficient Context | 能为当前任务准备足够但不过量的信息 | T1-02 |
| 4 | T1-04 | Iteration：把第一版结果改到可用 | APPLICATION | Purposeful Revision / Iteration | 能针对明确偏差提出具体修改要求并逐轮改进 | T1-03 |
| 5 | T1-05 | 结果可靠性：什么时候必须核验 | APPLICATION | Reliability Judgment / Verification | 能按事实性、时效性、可验证性与错误后果决定何时必须核验 | T1-04 |

### Phase 2 — 理解 AI 为什么这样工作

目标：在已有真实使用体验后建立最小必要的模型世界观。

| order | ID | title | type | Primary Knowledge Point | Core capability | prerequisite |
| ---: | --- | --- | --- | --- | --- | --- |
| 6 | T1-06 | 模型与 AI 产品：你使用的到底是什么 | CONCEPT | Model vs AI Product | 能区分 Model 与 AI Product，并理解 Training / Inference 的基本关系 | T1-05 |
| 7 | T1-07 | Token 与概率生成：为什么 AI 每次答案会变化 | CONCEPT | Token / Probability Generation | 能解释非固定输出，并用上下文与约束管理结果波动 | T1-06 |

### Phase 3 — 理解 AI 的记忆与知识

目标：分清临时上下文、长期记忆、权威资料与检索证据各自的职责。

| order | ID | title | type | Primary Knowledge Point | Core capability | prerequisite |
| ---: | --- | --- | --- | --- | --- | --- |
| 8 | T1-08 | Conversation History 与 Memory：AI 到底“记住”什么 | CONCEPT | Conversation History / Memory | 能决定什么属于当前对话、什么适合长期记忆 | T1-03, T1-06 |
| 9 | T1-09 | Knowledge Base 与 Source of Truth：AI 应该相信哪份资料 | CONCEPT | Knowledge Base / Source of Truth | 能为业务事实指定稳定、权威、可更新的来源 | T1-08 |
| 10 | T1-10 | Search 与 RAG：AI 怎样先找证据再回答 | CONCEPT | Search / RAG | 能判断何时需要检索，并理解 Retrieval → Context → Answer | T1-05, T1-09 |

### Phase 4 — 理解 AI 如何连接外部世界

目标：理解 AI 从生成文本走向结构化数据和外部工具调用的基本连接方式。

| order | ID | title | type | Primary Knowledge Point | Core capability | prerequisite |
| ---: | --- | --- | --- | --- | --- | --- |
| 11 | T1-11 | API：AI 产品怎样和其他系统交换信息 | CONCEPT | API / Request-Response Boundary | 能理解系统间 Request / Response 与接口边界 | T1-06 |
| 12 | T1-12 | Structured Output 与 Schema：怎样让系统稳定接收 AI 结果 | APPLICATION | Structured Output / Schema | 能把自由文本要求转成稳定字段、结构与基础验证规则 | T1-11 |
| 13 | T1-13 | Function Calling 与 Tool Use：AI 怎样调用外部能力 | CONCEPT | Function Calling / Tool Use | 能判断何时应调用 Tool，并识别输入、输出与权限 | T1-11, T1-12 |
| 14 | T1-14 | MCP：为什么 AI 需要统一连接工具与资源 | CONCEPT | Model Context Protocol (MCP) | 能解释 MCP 与直接 API / Tool 的区别及使用价值 | T1-13 |

### Phase 5 — 理解 AI 的复用与执行

目标：从一次有效方法进入可复用、可重复、可动态决策的执行方式。

| order | ID | title | type | Primary Knowledge Point | Core capability | prerequisite |
| ---: | --- | --- | --- | --- | --- | --- |
| 15 | T1-15 | Skill：把可复用的方法交给 AI | CONCEPT | Skill / Reusable Semantic Method | 能判断什么值得沉淀成 Skill，并定义单一职责、输入、输出与禁止动作 | T1-02, T1-13 |
| 16 | T1-16 | Workflow 与 Automation：把一次方法变成可重复流程 | APPLICATION | Workflow / Automation | 能把已验证方法拆成最小 Workflow，并判断哪些节点适合自动化 | T1-15 |
| 17 | T1-17 | Agent：什么时候才需要动态决策 | APPLICATION | Agent / Workflow Boundary | 能用 Goal / State / Observe / Decide / Act / Stop 判断何时需要 Agent | T1-13, T1-16 |

### Phase 6 — 理解现代 AI 能力与安全边界

目标：理解现代 AI 的多模态与操作能力，同时建立权限、隐私和人工确认边界。

| order | ID | title | type | Primary Knowledge Point | Core capability | prerequisite |
| ---: | --- | --- | --- | --- | --- | --- |
| 18 | T1-18 | Multimodal：文字、图片、语音、视频怎样一起工作 | APPLICATION | Multimodal / Media Capabilities | 能为真实任务选择合适输入与输出模态 | T1-06 |
| 19 | T1-19 | Coding、Browser 与 Computer Use：AI 怎样从回答走向操作 | CONCEPT | Coding / Browser / Computer Use Capability Map | 能区分代码生成、浏览研究与界面操作的能力和风险 | T1-13, T1-18 |
| 20 | T1-20 | Privacy、Permissions 与 Human-in-the-loop：什么不能直接交给 AI | APPLICATION | Privacy / Permissions / HITL / High-impact Boundary | 能识别敏感数据、高权限和高风险动作，并设置人工确认与 Core Authority | T1-05, T1-17, T1-19 |

## 3. Frozen knowledge-boundary rules

以下规则随 Core Learning Path 一起冻结：

1. 每节课只有一个 Primary Knowledge Point；Supporting Knowledge 不得升级成第二主知识点。
2. T1-01～T1-05 负责“先会用 AI”，不提前教学后续系统概念。
3. T1-06～T1-20 负责补世界观与能力边界，不重新从头教授 Prompt / Context / Iteration / Reliability。
4. Training / Inference 只作为 T1-06 supporting；不独立成课。
5. Context Window 只作为 T1-03 / T1-07 supporting；不独立成课。
6. Embedding / Vector Search 在 T1-10 只保留最低语义检索直觉；工程实现进入 Technical RAG / Advanced。
7. Evaluation basics 中“结果是否可用”归 T1-05；正式 Evaluation Engineering 进入 Track 04。
8. HITL / Permissions / Approval / Core Authority 的 Primary Home 固定为 T1-20。
9. Coding / Browser / Computer Use 不并入 Multimodal，继续保持 T1-19 独立能力课。
10. Knowledge Base / Source of Truth 不并入 Memory，继续保持 T1-09 独立能力课。
11. Structured Output / Schema 不并入 API，继续保持 T1-12 独立能力课。
12. SDK、MCP Server、Agent Runtime、Vector DB 调优等工程实现不进入 Track 01 基础必修。

## 3.1 Elastic curriculum rule

“冻结”冻结的是**当前已确认的能力结构与知识归属**，不是永久锁死课程数量。

新增 Track 01 Lesson 必须同时满足：

1. **Learner Gap**：能指出现有课程学完后，学习者仍会在哪个关键理解 / 判断 / 动作上失败；
2. **Independent Knowledge Home**：该缺口不能自然并入已有 Primary Knowledge Point；
3. **Six-step Pass**：新增知识能自然完成 EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY；
4. **Continuity Value**：新增能力会被 Track 02～05 中至少一个后续板块真实复用；
5. **Anti-repeat**：不会把已学 Prompt / Context / Reliability / Tool / Workflow 等内容重新换皮教授；
6. **Placement**：能明确它应插入哪个 Phase、前置课与 Next Reuse；
7. **Human Review**：产品负责人确认“增加一课比并入现有课程更容易学懂”。

如果只满足“概念重要”，但没有独立学习动作、没有后续复用、或会造成重复，应作为 Supporting Knowledge / Deep Resource / Advanced Track，而不是新增基础必修课。

因此当前 T1-01～T1-20 是 **Core Baseline v1**，未来允许形成 T1-21+ 或在明确治理下插入新 Lesson；任何变化都必须只修改本文件这一 curriculum owner，并同步重新检查 affected prerequisite / continuity，不在其他文档复制第二份目录。


## 4. Six-step and continuity gate

20 节课全部受两条强制轴控制：

```text
EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY
```

以及：

```text
Inherited Capability / Context
→ Current Learner Job
→ New Capability
→ Natural Artifact / Output
→ Next Reuse
→ Anti-repeat Boundary
```

Lesson Type 只改变 Step 4 深度与 Completion Gate，不改变六步结构。

## 5. Production rule after freeze

冻结目录 ≠ 一次性生产 20 节。

固定生产方式：

```text
Frozen Curriculum
→ Small Formal-Brief Batch
→ Human Review
→ Course Builder v0.2
→ Lesson Output Contract v1
→ Runtime Provisioning
→ Runtime Acceptance
```

当前已完成生产链的课程事实不在本文件维护；以 `docs/CURRENT_SYSTEM_FACTS.md` 为准。

T1-06～T1-20 后续必须按小批次 Formal Brief 推进，禁止直接批量生成正文。

## 6. Historical / supporting sources

以下文件保留为审计证据，不再与本文件共同拥有 Track 01 当前目录：

- `TRACK01_28_CANDIDATE_SIX_STEP_AUDIT_V1.md`：解释为什么 28 candidates 最终收敛为 20 课；
- `FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md`：跨 Track continuity 规则；
- `TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md`：T1-01～T1-05 已批准 Formal Brief；

旧 Runtime / UX 测试资产 `task-brief`、`memory-rag`、`writing-files`、`task-decomposition` 不属于 Track 01 curriculum identity。
