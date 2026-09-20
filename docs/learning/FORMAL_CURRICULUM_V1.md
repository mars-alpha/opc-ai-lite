# OPC Formal Curriculum v1

Status: **DEFINED_V1**  
Task: **CURRICULUM-001 — Formal Curriculum Definition**

## 1. Curriculum goal

OPC 第一版正式课程采用一条清晰主线：

```text
看懂 AI
→ 用好 AI
→ 建立可重复工作流
→ 用 AI 做业务
→ FDE / AI 解决方案落地
```

课程优先服务没有编程背景、希望真正把 AI 用到工作和业务中的学习者。

本文件定义“教什么、按什么顺序、哪些是必修/进阶/项目”。它不是 Published Course 数据，不替代 PostgreSQL，也不代表当前 `lib/courses.ts` 已经完成迁移。

## 2. Curriculum design rules

### 2.1 Stable core first

第一层先建立稳定的 AI 世界模型。以下概念属于长期核心，不因具体 AI 产品变化而删除：

- Generative AI / Model
- Prompt
- Context / Token
- Memory / RAG
- API / Tool
- MCP
- Skill
- Agent
- Multimodal

这些概念可以随着技术发展更新例子，但不依赖某一个产品按钮作为课程骨架。

### 2.2 Avoid duplicate teaching

同一个核心概念只保留一个主要归属：

- Prompt：正式归入“把任务说清楚”，不再另建重复的 task-brief 核心课。
- Context / Token：独立讲模型当前能看到什么、信息如何进入任务；后续 Context Engineering 只讲工作流级上下文治理。
- Memory / RAG：讲“记住状态”和“检索外部知识”的区别。
- API / Tool：讲系统如何提供能力；Agent 课不重新从头解释 API。
- MCP：独立讲标准化连接资源/工具的作用，不和 API/Tool/Agent 挤在一节。
- Skill：独立讲可复用方法；与 Prompt、Tool、Agent 做边界比较。
- Agent：在学生已经理解 Model / Tool / MCP / Skill 后再讲多步决策和执行循环。

### 2.3 Learn concepts before implementation

基础必修课不要求编程。课程先让学生判断：

```text
这是什么
→ 为什么需要
→ 什么时候使用
→ 和相邻概念有什么区别
→ 能不能在真实任务中判断
```

代码、SDK、搭 MCP Server、写 Agent 等实现内容进入 Advanced / Optional，不阻塞主学习路径。

### 2.4 One curriculum, multiple lesson types

所有正式课继续使用 Unified Lesson Shell v1。

Lesson Type 只表达学习目标：

- CONCEPT：建立概念和判断能力；
- APPLICATION：把概念用于一个真实任务；
- PRACTICE：独立完成可检查任务；
- PROJECT：整合多节能力完成真实方案。

不按 Lesson Type 建立不同页面产品。

---

# 3. Formal Learning Path v1

## Stage 1 — AI 基础认知｜必修

目标：让学习者真正看懂 AI、知道主要组件之间的关系，不把工具名当知识。

### Module 1.1 — 模型、提示与上下文

| # | Formal Lesson | Type | Classification | Prerequisite | Core outcome |
| --- | --- | --- | --- | --- | --- |
| 1 | 什么是生成式 AI：模型会什么、不会什么 | CONCEPT | REQUIRED | 无 | 理解生成、概率性、模型能力与产品功能的区别 |
| 2 | Prompt（提示词）：怎样把任务说清楚 | APPLICATION | REQUIRED | 1 | 用任务、背景、输入/资料、限制、结果要求减少 AI 猜测 |
| 3 | Context 与 Token：AI 当前到底看到了什么 | CONCEPT | REQUIRED | 1–2 | 理解上下文、历史/文件/系统信息、Token 与“信息越多不等于越好” |

**合并决策：**
- 当前 `prompt-foundations` 是 Lesson 2 的主要样板。
- 旧 `task-brief` 的 Goal / Context / Input / Constraint / Output 方法吸收进 Lesson 2，不再作为另一节重复正式核心课。
- 当前 `context-token` 保留主题，但移除其中重复教授 Prompt 结构的部分。

### Module 1.2 — 知识、记忆与能力连接

| # | Formal Lesson | Type | Classification | Prerequisite | Core outcome |
| --- | --- | --- | --- | --- | --- |
| 4 | Memory 与 RAG：记住你，还是查资料 | CONCEPT | REQUIRED | 3 | 区分长期状态/偏好与外部知识检索，理解证据和 Source of Truth |
| 5 | Model、API 与 Tool：AI 怎样获得外部能力 | CONCEPT | REQUIRED | 1–3 | 看懂模型、API、Tool 三层关系，知道调用能力不等于 Agent |
| 6 | MCP：为什么 AI 需要统一连接方式 | CONCEPT | REQUIRED | 5 | 理解 MCP 解决“资源/工具如何标准接入”的问题，不把 MCP 等同 API/Tool |
| 7 | Skill（技能）：把可复用方法交给 AI | CONCEPT | REQUIRED | 2,5 | 区分 Prompt / Skill / Tool / Agent，判断什么时候值得沉淀 Skill |
| 8 | Agent（智能体）：从一次回答到多步完成任务 | CONCEPT | REQUIRED | 4–7 | 理解目标、状态、Tool Use、观察、继续/停止、人工确认 |
| 9 | Multimodal（多模态）：文字之外的图像、语音与视频 | APPLICATION | REQUIRED | 1–3 | 理解多模态输入/输出、能力边界和真实业务使用方式 |

说明：
- Agent、RAG、MCP、Skill 均保留独立核心课，不压缩成一节。
- Model / API / Tool 合并为一节，因为三者需要一起建立“模型如何获得能力”的基础关系；真正的 API 调用代码放 Advanced。
- Multimodal 保留为基础必修，因为它已经是普通用户使用 AI 的基本能力，而不是纯高级技术。

---

## Stage 2 — AI 工作应用｜必修

目标：把 Stage 1 的概念变成日常可复用工作能力。

### Module 2.1 — 研究与信息处理

| # | Formal Lesson | Type | Classification | Prerequisite | Core outcome |
| --- | --- | --- | --- | --- | --- |
| 10 | 搜索与研究：从答案到证据 | APPLICATION | REQUIRED | 2–4 | 提出可验证问题、找来源、区分事实/分析/推断 |
| 11 | 文件处理：先抽取事实，再生成成品 | APPLICATION | REQUIRED | 2–4 | 对会议、报告、长文档做可追溯提取与生成 |
| 12 | 数据与表格：先定义口径，再让 AI 计算 | APPLICATION | REQUIRED | 2–3 | 定义字段/公式/范围，验证 AI 辅助计算结果 |

### Module 2.2 — 把方法变成能力

| # | Formal Lesson | Type | Classification | Prerequisite | Core outcome |
| --- | --- | --- | --- | --- | --- |
| 13 | 把会议记录整理成可执行行动清单 | PRACTICE | REQUIRED | 11 | 从真实材料中提取 Action / Owner / Deadline / Open Issue |
| 14 | 把重复任务沉淀成可复用 Skill | PRACTICE | REQUIRED | 7,10–12 | 把经过验证的方法整理成可重复步骤、规则和输出要求 |

当前 `meeting-action-list` acceptance fixture 可作为 Lesson 13 的候选内容基础，但仍需经过正式 Course Builder + Human Review，不能直接视为 Published Course。

---

## Stage 3 — AI Workflow｜必修进阶

目标：从“会使用 AI”升级成“会设计 AI 工作方式”。

### Module 3.1 — 工作流设计

| # | Formal Lesson | Type | Classification | Prerequisite | Core outcome |
| --- | --- | --- | --- | --- | --- |
| 15 | 任务拆解：把大任务变成可检查节点 | PRACTICE | REQUIRED_ADVANCED | Stage 1–2 | 拆分 Input / Process / Decision / Output / Check |
| 16 | Context Engineering：每一步只给需要的信息 | APPLICATION | REQUIRED_ADVANCED | 3,15 | 管理 Must Know / Nice to Know / Do Not Load / Canonical Source |
| 17 | Code、Skill、Tool、Agent：怎样分工 | APPLICATION | REQUIRED_ADVANCED | 5–8,15 | 判断确定性规则、语义能力、工具调用和 Agent 的责任边界 |

### Module 3.2 — 自动化、风险与评估

| # | Formal Lesson | Type | Classification | Prerequisite | Core outcome |
| --- | --- | --- | --- | --- | --- |
| 18 | Automation 与 Human-in-the-loop | APPLICATION | REQUIRED_ADVANCED | 15–17 | 判断哪些步骤自动化、哪些动作必须人工确认 |
| 19 | Evaluation：怎样知道 AI 工作流真的有效 | APPLICATION | REQUIRED_ADVANCED | 15–18 | 建立质量、效率、稳定性、业务价值基线 |
| 20 | 完成一份 AI 工作流方案 | PROJECT | PROJECT | 15–19 | 整合目标、触发输入、步骤、人工确认和成功指标 |

当前 `ai-workflow-project` 是 Lesson 20 的候选项目样板。正式 PROJECT 发布仍受 Deliverable Runtime 未完成影响，因此 Curriculum Definition 不代表它现在可以正式完成/结算。

---

## Stage 4 — AI 业务增长与运营｜业务应用

目标：把 AI 能力从个人效率推进到获客、内容、销售、客服和运营流程。

Stage 4 在 v1 中确定能力方向和模块边界，但不在本任务展开全部 Lesson 内容。

### Module 4.1 — 内容与推广运营

Planned lessons:
- AI 内容生产：研究 → 草稿 → 审核 → 多渠道分发（APPLICATION）
- 内容再利用：一份核心内容转图文 / 短视频 / 社媒素材（APPLICATION）
- 运营工作流：选题、审核、发布、复盘（PROJECT / later）

### Module 4.2 — 客户、销售与客服

Planned lessons:
- AI 客户沟通：信息整理、跟进草稿与人工确认（APPLICATION）
- AI 客服知识库：RAG + 答复边界 + 转人工（APPLICATION）
- 客户跟进工作流（PROJECT）

渠道实战（微信、公众号、网站聊天框、抖音私信、阿里旺旺、企业微信/飞书等）属于后续 Channel Practice，不把具体平台按钮写进长期核心课程。

### Module 4.3 — 运营数据与决策

Planned lessons:
- 业务数据口径与 AI 分析（APPLICATION）
- 运营复盘与 Evaluation（PRACTICE）
- 从指标到下一步行动（PRACTICE）

---

## Stage 5 — FDE / AI 解决方案落地｜进阶

目标：学习者能从真实业务问题出发，设计和推进一个可落地 AI 方案，而不仅是会操作工具。

### Module 5.1 — Problem Discovery

- 找出真正值得 AI 介入的问题（APPLICATION）
- 现状流程、用户、约束和风险调查（PRACTICE）
- 价值假设与成功指标（APPLICATION）

### Module 5.2 — Solution Design

- AI / Code / Skill / Workflow / Core Authority 方案分工（APPLICATION）
- 数据与系统集成边界（CONCEPT / APPLICATION）
- Prototype → Pilot → Production 的最小路径（APPLICATION）

### Module 5.3 — Delivery & Adoption

- Evaluation 与失败案例闭环（PRACTICE）
- Human Review / 权限 / 风险控制（APPLICATION）
- Adoption：让真实团队愿意持续使用（APPLICATION）
- FDE Capstone：完成一份真实 AI 解决方案（PROJECT）

FDE 不要求所有学习者成为传统程序员；需要写代码的实现部分进入 Advanced Technical Track，由普通业务路径按需选修。

---

# 4. Advanced / Optional tracks

这些内容有价值，但不阻塞主路径：

## Technical Implementation

- Model API 实战
- Structured Output / Function Calling
- Tool 开发
- MCP Server / Client 实战
- Agent Runtime
- RAG Pipeline / Embedding / Vector Store
- Observability / Evaluation Engineering
- Python / TypeScript for AI Automation

## Multimodal Creation

- Image generation workflow
- Video generation workflow
- Audio / Voice workflow
- ComfyUI / local generation（按实际产品与成本更新）

## Platform-specific Practice

- ChatGPT / Claude / Gemini / DeepSeek 等产品实战
- 微信 / 公众号 / 小程序
- 企业微信 / 飞书
- 网站客服
- 抖音 / 小红书 / B站等内容平台

平台课程是易变层，不取代稳定 Core Curriculum。

---

# 5. First production batch

CURRICULUM-001 完成后，不批量制作 20 节课。第一批只正式建设 5 节：

1. **什么是生成式 AI：模型会什么、不会什么** — CONCEPT
2. **Prompt：怎样把任务说清楚** — APPLICATION
3. **Context 与 Token：AI 当前到底看到了什么** — CONCEPT
4. **Memory 与 RAG：记住你，还是查资料** — CONCEPT
5. **Model、API 与 Tool：AI 怎样获得外部能力** — CONCEPT

选择原因：
- 形成最小连续认知链；
- Prompt 样板已经经过最多 Human Review；
- Memory/RAG 已有 Runtime pilot 基础；
- 做完前 5 节后，可以继续自然进入 MCP → Skill → Agent，而无需改课程架构。

第二批建议：
6 MCP → 7 Skill → 8 Agent → 9 Multimodal。

---

# 6. Existing assets disposition

| Existing asset | v1 decision |
| --- | --- |
| `what-is-genai` | 保留主题，重写为正式 Lesson 1 |
| `prompt-foundations` | 作为正式 Lesson 2 的主要候选样板 |
| `task-brief` | 不再独立成为正式核心课；核心方法并入 Prompt Lesson |
| `context-token` | 保留为 Lesson 3，但移除与 Prompt 重复部分 |
| `memory-rag` | 保留主题，升级为正式 Lesson 4 |
| `api-agent` | 拆分；API/Tool → Lesson 5，MCP → Lesson 6，Agent → Lesson 8 |
| `skill-foundations` | 保留为 Lesson 7 候选样板 |
| `writing-files` | 进入 Stage 2 文件处理；当前 Runtime blockers 不改变课程定位 |
| `meeting-action-list` | 进入 Stage 2 PRACTICE 候选 |
| `task-decomposition` | 进入 Stage 3 PRACTICE |
| `context-engineering` | 进入 Stage 3，不与基础 Context 重复 |
| `hitl` | 进入 Stage 3 |
| `evaluation` | 进入 Stage 3 |
| `ai-workflow-project` | 进入 Stage 3 PROJECT 候选；等待 Deliverable Runtime |

当前 `lib/courses.ts` 继续视为 static/fallback，不因为本文件而升级成正式 Curriculum Source of Truth。

---

# 7. Governance

正式课程长期流程：

```text
Reviewed Knowledge / Research Packet
→ Course Builder Draft
→ Code Validation
→ Human Review
→ Approved Formal Course
→ Published Course
```

固定规则：
- AI Daily 可以发现需要更新的知识、案例和选修主题；
- Knowledge 系统可以提出 Course Update Candidate；
- Course Builder 只能生成 Draft / Proposal；
- AI / Skill 不可直接覆盖 Published Course；
- Stable Core 只有核心概念发生真实变化时才修改；
- 工具界面、模型版本、平台功能等高频变化优先放案例、资料或选修课；
- 每次正式 Curriculum 结构变化必须显式版本化，不通过普通课程内容任务偷偷改目录。

---

# 8. Boundary after CURRICULUM-001

本任务只定义 Formal Curriculum v1。

尚未完成：
- Curriculum 写入 Production DB；
- 第一批正式课程内容建设；
- Published 状态；
- 旧 `lib/courses.ts` 迁移/删除；
- PROJECT Deliverable Runtime；
- 0010 / 0011 remote migration；
- AI Provider 连接。

推荐下一任务：

**CURRICULUM-002 — First Production Batch Planning**

只为前 5 节正式课程建立 lesson brief、grounding requirement、Lesson Type / Gate、依赖关系和 Course Builder 输入，不直接一次生成全部课程。
