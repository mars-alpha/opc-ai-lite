# OPC Formal Curriculum v1

Status: **DEFINED_V1**  
Task: **CURRICULUM-001 — Formal Curriculum Definition**

## 1. Curriculum goal

OPC 第一版正式课程采用一条清晰主线：

```text
01 AI 基础认知
→ 02 AI 工作应用
→ 03 AI 推广运营与业务增长
→ 04 AI Workflow 与自动化
→ 05 FDE / AI 解决方案落地
```

这五大板块是长期课程主线。**完整目录设计与内容生产批次必须分开**：课程知识体系先完整设计，内容再按 3–5 节一个 Production Batch 分批制作；任何单次 MVP 批次数量都不得被解释成完整课程范围。

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

固定治理规则：**每个核心概念只能有一个 Primary Knowledge Home（主知识归属）**。后续阶段允许应用、深化、工程化和业务化，但不得重新从定义开始重复教学。

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

## Stage 1 — AI 基础认知｜完整基础课

目标：真正把 AI 讲明白，让学习者形成完整 AI 世界模型，而不是只记住 Prompt、RAG、Agent 等名词。

基础课内部固定按 **7 个学习阶段** 组织。这里的“阶段”用于组织认知，不代表每一个知识点都必须独立成一节课：

1. **先认识 AI 怎么用**：从真实工作场景理解 AI 能帮什么、为什么结果会变化、为什么会出错，以及 AI 软件的基本能力地图。
2. **学会和 AI 基本协作**：Prompt、Task Context、Iteration、Clarification 与基础结果检查。
3. **再理解 AI 背后的基本机制**：LLM / Model、Training 与 Inference、Token / 概率生成、Context Window。
4. **理解 AI 的记忆与知识**：Conversation History、Memory、Knowledge Base、Search、RAG、Source of Truth、Embedding / Vector Search 的直觉。
5. **理解 AI 如何连接外部世界**：API、Structured Output、Function Calling、Tool、MCP、Schema 与权限边界。
6. **理解 AI 的复用与执行方式**：Prompt / Skill / Workflow / Automation / Agent、State、Stop Rule、Failure Handling、Human-in-the-loop。
7. **理解现代 AI 能力与边界**：Multimodal、图像/语音/视频、Coding、Browser/Research、Computer Use、隐私、安全、Evaluation 基础与高风险动作边界。

基础课不要求编程。SDK、MCP Server、Agent Runtime、Vector DB 调优等工程实现进入 Advanced / Optional Track。

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

目标：把 Stage 1 的概念变成每天可以直接使用的工作能力。这里不重新解释 Prompt、RAG、Skill、Workflow 的定义，而是直接应用。

### Module 2.1 — 搜索、研究与信息判断

课程方向：
- AI 搜索与可验证问题
- 行业 / 市场 / 竞品研究
- 来源、日期与适用范围
- 事实 / 分析 / 推断
- 多来源比较与冲突处理
- 从答案到证据

### Module 2.2 — 写作与内容工作

课程方向：
- 邮件与沟通
- 方案 / 报告 / 汇报
- 内容改写与风格转换
- 长内容压缩与结构化
- 从资料到成品，而不是让 AI 凭空补事实

### Module 2.3 — 文件与办公

课程方向：
- PDF / 长文档阅读
- 多文件比较
- 会议记录
- 决策 / Action / Owner / Deadline
- 报告 / 合同结构化提取
- PPT 内容规划

当前 `meeting-action-list` acceptance fixture 可作为这一模块的 PRACTICE 候选，但仍需正式 Course Builder + Human Review。

### Module 2.4 — 数据与表格

课程方向：
- 字段与指标口径
- Excel / Spreadsheet 辅助
- 数据清洗思路
- 公式 / SQL / Python 的辅助生成
- 图表与解释
- 关键数字复核

普通路径不要求先会编程。

### Module 2.5 — 个人知识与信息管理

课程方向：
- 资料分类
- AI 笔记
- Knowledge Base
- 个人知识问答
- Source of Truth
- 从临时聊天到长期知识资产

### Module 2.6 — 重复工作优化

课程方向：
- 找出重复任务
- 把 Prompt 变成模板
- 把稳定方法沉淀成 Skill
- 判断什么时候需要 Workflow
- 从个人方法变成团队可复用方法

代表性 PRACTICE：
- 把会议记录整理成可执行行动清单
- 把一个重复任务沉淀成 Skill
- 把复杂任务拆成最小 Workflow

---

## Stage 3 — AI 推广运营与业务增长｜业务应用

目标：把 AI 从个人效率推进到真实获客、内容、销售、客服和运营流程。这里不是“教 AI 写文案”，而是训练完整业务链路。

### Module 3.1 — 内容运营

课程方向：
- 选题与 Research
- 内容策划与栏目体系
- 文案、图片、视频协作
- 审核与事实检查
- 多渠道分发
- 一份核心内容多次再利用
- 数据复盘与下一轮选题

标准链路：`选题 → Research → 策划 → 内容 → 多模态素材 → 审核 → 发布 → 数据复盘 → 二次利用`。

### Module 3.2 — 推广与获客

课程方向：
- 目标用户与使用场景
- 营销信息设计
- 活动方案
- 广告 / 素材方向
- Landing Page
- 私域承接
- Lead（线索）整理与分类
- 从“写一条广告”升级为设计获客流程

### Module 3.3 — 销售

课程方向：
- 客户资料整理与需求提取
- 沟通历史总结
- 跟进优先级
- 跟进草稿
- 异议分类
- CRM 信息整理
- 销售复盘
- 人工确认后发送

代表性流程：`客户长期未回复 → 汇总背景 → AI 草拟跟进 → 销售确认 → 发送 → 记录下一次跟进`。

### Module 3.4 — 客服

课程方向：
- FAQ 与标准知识
- RAG 客服
- 意图识别
- 回复草稿
- 答复边界
- 找不到证据时的处理
- 转人工
- 投诉 / 高风险场景
- 客服质量 Evaluation

### Module 3.5 — 运营分析

课程方向：
- AI 日报 / 周报
- 用户反馈分类
- 评论 / 舆情整理
- 内容 / 活动 / 销售数据分析
- 异常发现
- 从指标形成下一步行动

### Module 3.6 — 渠道实战

微信、公众号、小程序、网站聊天框、抖音私信、阿里旺旺、企业微信、飞书、小红书、B站、视频号等属于高频变化的 Channel Practice。核心课程教业务方法，平台课负责当前界面与渠道落地。

---

## Stage 4 — AI Workflow 与自动化｜系统化进阶

目标：从“会用 AI 做业务”进一步升级成“会设计可控、可重复、可评估的 AI 工作系统”。

### Module 4.1 — Workflow Design

- Task Decomposition
- Input / Process / Decision / Output / Check
- 节点设计
- State / Stop Rule / Failure Handling
- 最小闭环

### Module 4.2 — Context Engineering

基础 Context 已在 Stage 1 学过，这里只深化：
- Minimum Sufficient Context
- Must Know / Nice to Know / Do Not Load
- Canonical Source
- 节点级 Context
- 长期运行中的上下文治理

### Module 4.3 — Responsibility Architecture

固定判断框架：

```text
确定性逻辑 → Code
语义理解 / 生成 → Skill / Model
外部能力 → Tool
受控多步流程 → Workflow
动态决策循环 → Agent
最终写库 / 权限 / 发布 / 状态 → Core System
```

OPC 架构认知固定为：`Code = Truth, Skill = Intelligence, Workflow = Controlled Bridge, Core System = Authority`。

### Module 4.4 — Integration

- API Integration
- Tool Integration
- MCP Integration
- Structured Input / Output
- Schema
- 数据流与权限

普通学习路径理解设计；真正代码实现进入 Technical Track。

### Module 4.5 — Automation 与 Human-in-the-loop

- 自动化价值判断
- 可逆 / 不可逆动作
- Approval / 权限
- 超时 / 异常 / 回退
- 人工确认
- 高风险动作边界

### Module 4.6 — Evaluation

- Baseline / Test Set
- Quality / Efficiency / Stability
- Business Value
- Failure Cases
- Human Edits
- Regression

### Module 4.7 — Workflow Project

完成一个真实业务 AI Workflow，包括目标、触发、输入、节点、AI/Code/人分工、人工确认、异常和成功指标。

当前 `ai-workflow-project` 是候选项目样板；正式 PROJECT 仍受 Deliverable Runtime 未完成影响。

---

## Stage 5 — FDE / AI 解决方案落地｜进阶

目标：学习者能够进入一个真实业务，发现问题、设计 AI 方案、验证价值并推动真实使用。FDE 在 OPC 中不是“纯工程师编程课”，而是 AI 解决方案能力。

### Module 5.1 — Problem Discovery

课程方向：
- 业务流程观察
- 用户与角色
- 重复工作与时间成本
- 错误成本与信息断点
- 哪些问题值得 AI 解决
- 哪些问题不该用 AI

### Module 5.2 — Problem Definition & Value

课程方向：
- Problem Statement
- Current State
- Target State
- Constraints
- Risks
- Value Hypothesis
- Success Metrics

### Module 5.3 — Solution Design

课程方向：
- AI / Code / Skill / Workflow / Agent 分工
- 数据来源与 Source of Truth
- 系统集成
- 权限
- Human Review
- Failure / Fallback
- Build vs Buy

### Module 5.4 — Prototype & Pilot

课程方向：
- 最小原型
- 最小真实场景
- Pilot 用户
- 小样本验证
- 失败案例
- 快速修改
- 不提前建设完整系统

### Module 5.5 — Evaluation

课程方向：
- 业务 Baseline
- 时间 / 成本 / 质量
- 人工修改量
- Error / Risk
- 用户行为
- 业务指标
- 是否值得继续投入

### Module 5.6 — Adoption

课程方向：
- 为什么用户不用
- Trust
- Workflow friction
- Training
- Feedback loop
- Change management
- Champion / Owner
- 从 Pilot 变成真实工作方式

### Module 5.7 — FDE Capstone

选择一个真实业务问题，例如内容运营、客户跟进、AI 客服、内部知识库、数据分析、销售运营或研究流程。

最终交付：

```text
Problem
→ Current Workflow
→ Proposed AI Workflow
→ Prototype
→ Pilot
→ Evaluation
→ Adoption Plan
```

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

# 5. Production sequencing

**完整 Curriculum 先设计，内容按 Batch 生产。**

正式顺序：

```text
完整知识地图
→ 明确 Primary Knowledge Home 与前置关系
→ 建立 Lesson Brief
→ 选 3–5 节为一个 Production Batch
→ Course Builder Draft
→ Code Validation
→ Human Review
→ Approved Formal Course
→ Published Course
```

第一批 3–5 节只代表开发批次，不代表基础课只有 3–5 节。正式批量生产前，必须先完成 Stage 1 七个基础阶段的完整 Lesson 级目录和去重检查。

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
| `task-decomposition` | 进入 Stage 4 Workflow Design |
| `context-engineering` | 进入 Stage 4 Context Engineering，不与基础 Context 重复 |
| `hitl` | 进入 Stage 4 Automation & Human-in-the-loop |
| `evaluation` | 进入 Stage 4 Evaluation |
| `ai-workflow-project` | 进入 Stage 4 Workflow Project 候选；等待 Deliverable Runtime |

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

**CURRICULUM-002 — Foundation Knowledge Map & Lesson Briefs**

先把 Stage 1 七个基础阶段展开为完整 Lesson 目录，为每节课定义主知识点、辅助知识点、前置依赖、Lesson Type、Completion Gate、Grounding Requirement，并做全局去重检查；完成后再确定具体 Production Batch。
