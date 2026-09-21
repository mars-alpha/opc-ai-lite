# Foundation Knowledge Map v1

Status: **DEFINED_V1**  
Task: **CURRICULUM-002 — Foundation Knowledge Map & Lesson Briefs**  
Scope: **Track 01 / AI 基础认知**

## 1. Purpose

本文件把 `FORMAL_CURRICULUM_V1.md` 中的 AI 基础认知 7 个学习阶段展开成完整 Lesson 级知识地图。

目标不是一次性写完所有课程，而是先把以下内容锁清楚：

- 每个核心概念的 Primary Knowledge Home；
- 每节课真正负责教什么；
- 哪些概念只做辅助说明；
- 前置依赖；
- Lesson Type；
- Completion Gate；
- Grounding Requirement；
- 与相邻课程的去重边界；
- 现有测试资产如何迁移。

**完整基础课共 28 个 Lesson Brief。**  
28 只是当前 v1 的知识地图数量，不等于必须一次上线 28 节。正式内容继续按 3–5 节一个 Production Batch 分批生产。

---

# 2. Foundation Stage 1 — 先认识 AI 怎么用

目标：完全零基础的学习者先知道 AI 能帮什么、为什么结果会变化、为什么会犯错，以及自己正在使用的是一个完整 AI 软件。

| ID | Lesson | Type | Gate | Primary Knowledge Home | Prerequisite | Grounding | Learner outcome | Anti-overlap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F1-01 | AI 到底能帮我做什么 | APPLICATION | CHECK+PRACTICE | Everyday AI use cases | 无 | REVIEWED_KNOWLEDGE · MEDIUM_FRESHNESS | 能从日常工作中识别适合 AI 协助的任务 | 不讲 AI/ML taxonomy、LLM、Training、Token |
| F1-02 | 为什么同一个 AI，有时好用、有时不好用 | APPLICATION | CHECK+PRACTICE | Input quality → result quality intuition | F1-01 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 理解任务信息是否清楚会直接影响结果 | Prompt 正式结构交给 F2-01；不讲 Context Window |
| F1-03 | AI 为什么会说错，而且还说得很像真的 | CONCEPT | CHECK | Hallucination / verification intuition | F1-01 | RESEARCH_PACKET · HIGH_FRESHNESS | 知道事实、数字、最新信息需要核实 | 不讲 next-token prediction、Retrieval 架构、Evaluation 指标 |
| F1-04 | AI 软件里的模型、搜索、文件和记忆是什么关系 | CONCEPT | CHECK | AI product capability map | F1-01,F1-03 | RESEARCH_PACKET · HIGH_FRESHNESS | 建立“核心模型 + 产品能力”的简单地图 | 不讲 API、Tool、RAG、模型参数或内部架构 |

Stage 1 原则：
- 示例先于定义；
- 每节最多 1–2 个必须记住的新术语；
- 不要求解释 Machine Learning、Inference、Deterministic Logic 等技术术语。

---

# 3. Foundation Stage 2 — 学会和 AI 基本协作

目标：在已有使用直觉上，学会把任务说清楚、把必要信息给够、逐轮改进，并知道什么时候必须检查。

| ID | Lesson | Type | Gate | Primary Knowledge Home | Prerequisite | Grounding | Learner outcome | Anti-overlap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F2-01 | Prompt：怎样把想做的事情说清楚 | APPLICATION | CHECK+PRACTICE | Prompt foundations | F1-01,F1-02 | RESEARCH_PACKET · MEDIUM_FRESHNESS | 能把模糊要求变成清楚、可执行的任务说明 | 不讲万能 Prompt、System Prompt、Prompt Engineering |
| F2-02 | Context：AI 只知道你这次给它看到的东西 | CONCEPT | CHECK | Task Context | F2-01 | REVIEWED_KNOWLEDGE · MEDIUM_FRESHNESS | 知道什么时候需要补背景、资料、历史信息 | 不讲 Token mechanics、Context Window 数字、Context Engineering |
| F2-03 | 第一次结果不对，怎样继续让 AI 改好 | APPLICATION | CHECK+PRACTICE | Iteration / clarification | F2-01,F2-02 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 能指出偏差、补信息、给示例或让 AI 先提问 | 不讲 Workflow loop / Agent self-correction |
| F2-04 | AI 的结果什么时候能直接用，什么时候一定要检查 | APPLICATION | CHECK+PRACTICE | Basic reliability judgment | F1-03,F2-03 | REVIEWED_KNOWLEDGE · MEDIUM_FRESHNESS | 能按事实性、风险、可验证性决定是否复核 | 正式 Evaluation Framework 留到 Stage 7 / Track 04 |

---

# 4. Foundation Stage 3 — 再理解 AI 背后的基本机制

目标：用户已经会基本使用 AI 之后，再补“为什么 AI 会这样工作”的机制知识。

| ID | Lesson | Type | Gate | Primary Knowledge Home | Prerequisite | Grounding | Learner outcome | Anti-overlap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F3-01 | 大语言模型是什么：Model 不等于 AI 软件 | CONCEPT | CHECK | LLM / Model vs Product | F1-04 | RESEARCH_PACKET · MEDIUM_FRESHNESS | 能区分核心模型与完整 AI 产品 | 不讲 API / Tool；F1-04 只给简单地图，本课再补正式概念 |
| F3-02 | Training 与 Inference：模型怎样学会、又怎样被使用 | CONCEPT | CHECK | Training / Inference | F3-01 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 理解训练与当前使用不是同一过程 | 不展开 Fine-tuning 工程实现 |
| F3-03 | Token 与概率生成：AI 为什么不是在查一条固定答案 | CONCEPT | CHECK | Token / generation intuition | F3-01,F3-02 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 理解模型按模式逐步生成的直觉 | 不重复教授 F1-03 的“必须核实”结论 |
| F3-04 | Context Window：AI 一次能看到的信息为什么有限 | CONCEPT | CHECK | Context Window | F2-02,F3-03 | REVIEWED_KNOWLEDGE · MEDIUM_FRESHNESS | 理解上下文容量有限、资料过多会有取舍 | 不重复教授 Prompt / Task Context |

Existing asset:
- `prompt-foundations` → 迁入 F2-01，需按新手规则重写而不是直接正式化；
- `task-brief` → MERGE 到 F2-01；
- `context-token` → Task Context 归 F2-02；Token / Window 后移 F3-03 / F3-04；
- COURSE-PRODUCTION-001 四个旧 Draft → **PEDAGOGY_REJECTED / RETIRE_AS_FAILED_DRAFT_REFERENCE**。

---

# 5. Foundation Stage 4 — 理解 AI 的记忆与知识

目标：讲清“对话历史、Memory、Search、Knowledge Base、RAG、Source of Truth”各自解决什么问题。

| ID | Lesson | Type | Gate | Primary Knowledge Home | Prerequisite | Grounding | Learner outcome | Anti-overlap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F4-01 | Conversation History 与 Memory：AI 的“记住”有几种 | CONCEPT | CHECK | History / Memory | F3-02 | REVIEWED_KNOWLEDGE · MEDIUM_FRESHNESS | 区分当前对话历史与长期 Memory | 不把 Knowledge Base 当 Memory |
| F4-02 | Knowledge Base 与 Source of Truth：AI 应该相信哪份资料 | CONCEPT | CHECK | Knowledge Base / Source of Truth | F4-01 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 能为事实指定稳定来源 | 不展开企业知识治理流程 |
| F4-03 | Search 与 RAG：AI 怎样先找资料再回答 | CONCEPT | CHECK | Search / RAG | F4-02,F2-03 | RESEARCH_PACKET · HIGH_FRESHNESS | 理解 Retrieval → Context → Answer | 不讲向量库参数和 Pipeline |
| F4-04 | Embedding 与 Vector Search：为什么系统能“按意思”找资料 | CONCEPT | CHECK | Embedding / semantic retrieval intuition | F4-03 | RESEARCH_PACKET · MEDIUM_FRESHNESS | 理解语义检索直觉及其局限 | Chunking / vector DB tuning 进入 Technical Track |

Existing asset:
- `memory-rag` → **REWRITE/SPLIT**：Memory 主体进入 F4-01；RAG 主体进入 F4-03；
- 旧课程里的 Source of Truth 内容迁入 F4-02。

---

# 6. Foundation Stage 5 — 理解 AI 如何连接外部世界

目标：解释模型如何通过标准数据格式、API、Function Calling、Tool、MCP 与真实系统交互。

| ID | Lesson | Type | Gate | Primary Knowledge Home | Prerequisite | Grounding | Learner outcome | Anti-overlap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F5-01 | API：AI 产品怎样和其他系统交换信息 | CONCEPT | CHECK | API | F1-02,F3-02 | REVIEWED_KNOWLEDGE · MEDIUM_FRESHNESS | 理解 request/response 与“模型不等于系统” | 不写 SDK 代码 |
| F5-02 | Structured Output 与 Schema：为什么系统不能只接收一段自然语言 | CONCEPT | CHECK | Structured Output / Schema | F5-01 | RESEARCH_PACKET · HIGH_FRESHNESS | 理解结构化输出、字段、验证 | JSON 语法只做示例 |
| F5-03 | Function Calling 与 Tool Use：AI 怎样调用外部能力 | CONCEPT | CHECK | Function Calling / Tool | F5-01,F5-02 | RESEARCH_PACKET · HIGH_FRESHNESS | 区分“模型生成文字”和“调用 Tool” | Agent 只作为后续概念引用 |
| F5-04 | MCP：为什么 AI 需要统一连接工具与资源 | CONCEPT | CHECK | MCP | F5-03 | RESEARCH_PACKET · HIGH_FRESHNESS | 能解释 MCP 与 API/Tool 的关系 | 不搭 MCP Server/Client |

Existing asset:
- 旧 `api-agent` → **RETIRE AS FORMAL LESSON / SPLIT**；
- API/Tool 内容迁入 F5-01/F5-03；
- Agent 内容迁入 F6-04；
- MCP 新建独立主课 F5-04。

---

# 7. Foundation Stage 6 — 理解 AI 的复用与执行方式

目标：彻底讲清 Prompt、Skill、Workflow、Automation、Agent 与 Human-in-the-loop 的职责差异。

| ID | Lesson | Type | Gate | Primary Knowledge Home | Prerequisite | Grounding | Learner outcome | Anti-overlap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F6-01 | Skill：把可复用的方法交给 AI | CONCEPT | CHECK | Skill | F3-01,F5-03 | RESEARCH_PACKET · MEDIUM_FRESHNESS | 区分 Prompt / Skill / Tool | 不教 Skill 平台实现 |
| F6-02 | Workflow：从一次任务变成可重复流程 | CONCEPT | CHECK | Workflow | F6-01,F5-03 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 理解固定步骤、输入输出和检查点 | Task Decomposition 深化在 Track 04 |
| F6-03 | Automation：什么值得自动，什么不应该自动 | APPLICATION | CHECK+PRACTICE | Automation decision | F6-02,F2-04 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 能按规则稳定性、可逆性、风险判断自动化 | 不设计复杂 approval workflow |
| F6-04 | Agent：从固定流程到动态决策循环 | CONCEPT | CHECK | Agent | F5-03,F6-01,F6-02 | RESEARCH_PACKET · HIGH_FRESHNESS | 理解 Goal/State/Observe/Decide/Act/Stop | 不写 Agent Runtime |
| F6-05 | Workflow 与 Agent：什么时候用固定流程，什么时候需要动态决策 | APPLICATION | CHECK+PRACTICE | Workflow vs Agent boundary | F6-02,F6-04 | REVIEWED_KNOWLEDGE · MEDIUM_FRESHNESS | 能对真实任务选择 Workflow 或 Agent | 不重复定义 Skill/Tool |
| F6-06 | Human-in-the-loop：为什么成熟 AI 系统不是“全自动” | CONCEPT | CHECK | HITL foundations | F6-03,F6-04 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 理解人工确认、停止、异常升级的必要性 | 正式权限/回退设计在 Track 04 |

Existing asset:
- `skill-foundations` → **REUSE + FORMALIZE** 为 F6-01 主候选；
- `task-decomposition` → **KEEP AS LATER PRACTICE**，不作为基础定义课；
- `ai-workflow-project` → **KEEP FOR TRACK 04 PROJECT**，不进入基础课。

---

# 8. Foundation Stage 7 — 理解现代 AI 能力与边界

目标：让学习者理解现代 AI 已经不只是文字聊天，同时建立安全、隐私、权限和结果验证意识。

| ID | Lesson | Type | Gate | Primary Knowledge Home | Prerequisite | Grounding | Learner outcome | Anti-overlap |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F7-01 | Multimodal：文字、图片、语音、视频怎样进入同一个 AI 系统 | CONCEPT | CHECK | Multimodal | F1-02,F3-02 | RESEARCH_PACKET · HIGH_FRESHNESS | 理解多模态输入/输出与能力差异 | 具体创作工具进入 Optional Track |
| F7-02 | AI 图像、语音与视频：生成与理解分别能做什么 | APPLICATION | CHECK+PRACTICE | Media capability judgment | F7-01 | RESEARCH_PACKET · HIGH_FRESHNESS | 能为真实任务选择文字/图像/语音/视频能力 | 不教 ComfyUI/具体平台按钮 |
| F7-03 | Coding、Browser 与 Computer Use：AI 怎样从回答走向操作 | CONCEPT | CHECK | Coding/Browser/Computer Use capability | F5-03,F7-01 | RESEARCH_PACKET · HIGH_FRESHNESS | 理解“生成代码”“浏览网页”“操作界面”是不同能力 | 不教 Agent Runtime / browser automation implementation |
| F7-04 | Privacy、Security 与 Permissions：哪些数据和动作不能随便交给 AI | CONCEPT | CHECK | Privacy / Security / Permission foundations | F5-01,F6-06 | RESEARCH_PACKET · HIGH_FRESHNESS | 能识别敏感数据、高风险权限和外部动作 | 企业 RBAC 实现不进入基础课 |
| F7-05 | Evaluation 基础：怎样知道 AI 结果真的可用 | APPLICATION | CHECK+PRACTICE | Evaluation foundations | F2-04,F6-03 | REVIEWED_KNOWLEDGE · MEDIUM_FRESHNESS | 能用事实正确性、任务完成度、可复用性做基础验收 | Baseline/Test Set/Regression 深化在 Track 04 |
| F7-06 | AI 决策边界：什么事情不应该直接交给 AI 自动决定 | APPLICATION | CHECK+PRACTICE | High-impact action boundary | F6-06,F7-04,F7-05 | REVIEWED_KNOWLEDGE · LOW_FRESHNESS | 能识别资金、权限、发布、承诺等需要 Core/人工控制的动作 | 不重复 HITL 定义 |

---

# 9. Global Primary Knowledge Home matrix

| Core concept | Primary home | Supporting lessons | Explicitly not owned by |
| --- | --- | --- | --- |
| AI / ML / Generative AI | F1-01 | F1-04 | 后续业务课 |
| LLM / Model | F1-02 | F1-03,F2 | API/Agent 课 |
| Training / Inference | F1-03 | F2 | Technical Track |
| Generation vs Retrieval | F1-04 | F4-03 | RAG 工程课 |
| Token | F2-01 | F2-02 | Prompt |
| Context Window | F2-02 | F3-02 | Context Engineering |
| Hallucination | F2-03 | F2-04,F7-05 | RAG |
| Reliability judgment | F2-04 | F7-05 | Track 04 Evaluation |
| Prompt | F3-01 | F3-03,F3-04 | Skill |
| Task Context | F3-02 | F3-03 | Context Engineering |
| Example / Iteration | F3-03/F3-04 | 工作应用 | Prompt 主定义之外不重复 |
| Conversation History | F4-01 | F3-02 | Knowledge Base |
| Memory | F4-01 | F4-02 | RAG |
| Knowledge Base | F4-02 | Track 02 knowledge work | Memory |
| Source of Truth | F4-02 | Track 04/FDE | Context Engineering |
| Search / RAG | F4-03 | 业务客服等 | Memory |
| Embedding / Vector Search | F4-04 | Technical RAG | 基础 RAG 之外 |
| API | F5-01 | Track 04 Integration | Agent |
| Structured Output / Schema | F5-02 | Track 04 Integration | Prompt formatting |
| Function Calling / Tool | F5-03 | Agent | MCP |
| MCP | F5-04 | Track 04 Integration | API |
| Skill | F6-01 | Track 02 practice | Prompt / Agent |
| Workflow | F6-02 | F6-05,Track 04 | Agent |
| Automation | F6-03 | Track 04 | Workflow definition |
| Agent | F6-04 | F6-05 | Tool |
| Workflow vs Agent | F6-05 | Track 04 | 各自定义课 |
| HITL | F6-06 | Track 04/FDE | Permissions |
| Multimodal | F7-01 | F7-02 | Media tool tutorials |
| Coding / Browser / Computer Use | F7-03 | Optional Technical Track | Agent definition |
| Privacy / Security / Permissions | F7-04 | F7-06,Track 04 | HITL |
| Evaluation | F7-05 | Track 04/FDE | Reliability judgment |
| High-impact boundary | F7-06 | F6-06,F7-04 | 企业权限实现 |

---

# 10. Grounding policy

## REVIEWED_KNOWLEDGE

适用于长期稳定原理：
- AI taxonomy
- Training / Inference intuition
- Prompt / Context 基础
- Workflow 基本思想
- Source of Truth
- Automation/HITL 基础

更新频率：低到中。

## RESEARCH_PACKET

适用于快速变化领域：
- 模型能力边界
- Hallucination / current product capability examples
- RAG 实现趋势
- API / Function Calling / Tool
- MCP
- Agent
- Multimodal
- Browser / Computer Use
- Privacy/security product practices

要求：
- 优先官方/一手资料；
- 标注来源日期；
- 区分 Stable Principle 与 Current Implementation；
- Course Builder 不 live-browse，只接收 Reviewed Packet。

---

# 11. Existing asset disposition

| Existing asset | Decision | Target |
| --- | --- | --- |
| `what-is-genai` | REWRITE | F1-01/F1-02 范围拆分 |
| `prompt-foundations` | REUSE + FORMALIZE | F3-01 |
| `task-brief` | MERGE | F3-01；不再独立正式课程 |
| `context-token` | SPLIT + REWRITE | Token→F2-01；Context Window→F2-02；Task Context→F3-02 |
| `memory-rag` | SPLIT + REWRITE | Memory→F4-01；RAG→F4-03 |
| `api-agent` | RETIRE AS SINGLE FORMAL LESSON | API→F5-01；Tool→F5-03；Agent→F6-04 |
| `skill-foundations` | REUSE + FORMALIZE | F6-01 |
| `writing-files` | KEEP OUTSIDE FOUNDATION | Track 02 |
| `meeting-action-list` | KEEP OUTSIDE FOUNDATION | Track 02 PRACTICE |
| `task-decomposition` | KEEP OUTSIDE FOUNDATION | Track 04 |
| `context-engineering` | KEEP OUTSIDE FOUNDATION | Track 04 |
| `hitl` | FOUNDATION CONCEPT ONLY / DEEPER LATER | F6-06 + Track 04 |
| `evaluation` | FOUNDATION CONCEPT ONLY / DEEPER LATER | F7-05 + Track 04 |
| `ai-workflow-project` | KEEP OUTSIDE FOUNDATION | Track 04 PROJECT |

Acceptance fixture 仍然不是 Published Course Source of Truth。

---

# 12. Production readiness

## Batch A — AI 世界模型
- F1-01
- F1-02
- F1-03
- F1-04

## Batch B — 模型工作与可靠性
- F2-01
- F2-02
- F2-03
- F2-04

## Batch C — 与 AI 沟通
- F3-01
- F3-02
- F3-03
- F3-04

其中 F3-01 已有最成熟 Human Review 样板，可优先正式化，但不改变 curriculum 顺序。

## Batch D — Memory / Knowledge / RAG
- F4-01
- F4-02
- F4-03
- F4-04

## Batch E — API / Tool / MCP
- F5-01
- F5-02
- F5-03
- F5-04

## Batch F — Skill / Workflow / Agent
- F6-01
- F6-02
- F6-03
- F6-04
- F6-05
- F6-06

建议拆成两个 3 课 Batch。

## Batch G — Multimodal / Boundaries
- F7-01
- F7-02
- F7-03
- F7-04
- F7-05
- F7-06

建议拆成两个 3 课 Batch。

**Batch 只是开发顺序，不改变 28 节 Foundation Map 的完整范围。**

---

# 13. Planning completion gates

规划层默认：
- CONCEPT → `CHECK`
- APPLICATION → `CHECK + PRACTICE`
- Foundation 暂不使用 PROJECT
- Foundation 不要求 `REAL_AI` 作为正式 Completion Gate，除非后续可信证据链另行完成
- ARTIFACT / DELIVERABLE 不进入 Foundation v1

所有新课程 Step 3 继续使用 Unified Lesson Shell v1 的 Three-Question Mastery Sequence。

---

# 14. Next task

**CURRICULUM-003 — Foundation Batch A Brief Finalization**

目标：
- 把 F1-01～F1-04 从 Planning Brief 升级为 Course Builder 可直接消费的正式 Brief；
- 为每节确定 learning objectives、knowledge points、典型误区、Scenario、Grounding source list；
- 不直接生成完整课程正文；
- 完成后再启动第一批 Course Builder Draft。
