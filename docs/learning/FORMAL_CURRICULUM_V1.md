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

跨板块能力承接、Artifact Thread、Do-Not-Reteach 与默认业务 Case Thread 统一以 `docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md` 为 canonical continuity baseline。五大板块必须表现为一条连续能力链，而不是五套独立课程。

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

Track 01 当前按 **20 节 / 6 个 Phase** 组织，Phase 只承担能力分组，完整顺序与知识归属以 Track 01 owner 为准：

1. **先真正会用 AI**：任务适配 → Prompt → Context → Iteration → Reliability。
2. **理解 AI 为什么这样工作**：Model vs Product、Token / Probability Generation；Training / Inference 与 Context Window 只做 supporting。
3. **理解 AI 的记忆与知识**：Conversation History / Memory、Knowledge Base / Source of Truth、Search / RAG。
4. **理解 AI 如何连接外部世界**：API、Structured Output / Schema、Function Calling / Tool Use、MCP。
5. **理解 AI 的复用与执行**：Skill、Workflow / Automation、Agent。
6. **理解现代 AI 能力与安全边界**：Multimodal、Coding / Browser / Computer Use、Privacy / Permissions / HITL。

基础课不要求编程。SDK、MCP Server、Agent Runtime、Vector DB 调优等工程实现进入 Advanced / Optional Track。

### Stage 1 lesson-level canonical source

CURRICULUM-005 已废弃早期“先讲模型机制”的 9 课开场。当前 Foundation 不再使用本文件早期的 Module 1.1 / 1.2 旧编号作为 Lesson 定义。

Track 01 当前课程目录唯一 owner：

- `docs/learning/TRACK01_CATALOG_METADATA_V2.md` — **FROZEN_CORE_PATH_V1**

该文件唯一负责 T1-01～T1-20 的顺序、Phase、Lesson Type、Primary Knowledge Point 与 prerequisite。后续 Formal Brief / Course Builder / Lesson Production 必须读取该 owner，不再从 audit、legacy F-ID catalog 或历史 Trial 反推课程结构。

其他文件只承担各自职责：Six-step audit 保存课程取舍证据；canonical realignment 保存历史 ID 映射；Five-Track continuity 保存跨课/跨 Track 连续性规则；Formal Brief 保存单批课程教学边界。它们不再与 Catalog 共同拥有当前 Track 01 目录。

课程生产 / Runtime 当前状态不在本节维护，以 `docs/CURRENT_SYSTEM_FACTS.md` 与对应 Task 状态为准。

---

## Stage 2 — AI 工作应用｜必修

目标：把 Track 01 已掌握的 AI 协作与世界观转成每天可以直接调用的真实工作能力。这里不重新解释 Prompt、Context、RAG、Structured Output、Skill、Workflow、Agent 等定义，而是让学习者形成“知道怎么用，也知道工作遇到问题时该怎么问、怎么检查、怎么继续”的稳定工作习惯。

Track 02 当前课程上下文唯一 owner：

- `docs/learning/TRACK02_CATALOG_CONTEXT_V1.md` — **DIRECTORY_APPROVED_V1**

当前一级能力结构：

```text
会找答案
→ 会做成品
→ 会处理复杂资料
→ 会看数据
→ 会积累知识
→ 会复用方法
```

T2-01～T2-15 已通过 `TRACK02-SIX-STEP-AUDIT-001`，结果为 **15 KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE**。18→15 Knowledge Mapping、Artifact Thread、跨 Track Anti-repeat / Deferred Boundary 与“严格复用现有 Unified Lesson Shell、不新增 UI、不调整 CSS”的约束均由 Track 02 owner 维护。本文件不复制第二份 Lesson Directory。

T2-01～T2-03「会找答案」已开放，Formal Brief owner 为 `docs/learning/TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md`。

T2-04～T2-06「会做成品」已有待人工审阅 Draft，Formal Brief owner 为 `docs/learning/TRACK02_BATCH_B_T2_04_T2_06_FORMAL_BRIEFS_V1.md`。T2-07～T2-15 仍只在批准目录中。

课程生产状态仍以 `docs/CURRENT_SYSTEM_FACTS.md` 为准。

早期 Module 2.1～2.6 只是本次重构的历史输入，不再在 Current Curriculum 中保留第二套 Track 02 课程方向，避免后续 Course Builder / Brief 从旧模块反推目录。

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
→ 建立 Formal Lesson Brief
→ 选 3–5 节为一个 Production Batch
→ 选择单一明确 Course Builder Skill Version
→ Code Validation
→ Draft Preview
→ Human Review
→ Runtime Provisioning
→ Runtime Acceptance
→ Core / Admin Publication
→ AVAILABLE
```

第一批 3–5 节只代表开发批次，不代表基础课只有 3–5 节。Preview / Human Review、Runtime Ready、AVAILABLE 是不同阶段，不得互相替代。完整生产 Gate 以 `COURSE_PRODUCTION_GOVERNANCE_V1.md` 为准。

---

# 6. Existing assets disposition

| Existing asset | current decision |
| --- | --- |
| `what-is-genai` | 历史参考；只允许提取直觉，不直接作为当前正式 Lesson |
| `prompt-foundations` | F2-01 UX / 内容参考；按 Beginner Quality v1 重新生产 |
| `task-brief` | 并入 F2-01，不再独立正式课程 |
| `context-token` | 拆分：Task Context → F2-02；Token → F3-03；Context Window → F3-04 |
| `memory-rag` | 拆分：Memory → F4-01；RAG → F4-03 |
| `api-agent` | 退出单一正式课；API → F5-01，Tool → F5-03，Agent → F6-04 |
| `skill-foundations` | F6-01 候选参考，不直接等于正式课 |
| `writing-files` | 进入 Track 02 文件处理 |
| `meeting-action-list` | 进入 Track 02 PRACTICE 候选 |
| `task-decomposition` | 进入 Track 04 Workflow Design |
| `context-engineering` | 进入 Track 04 Context Engineering，不与 F2-02 重复 |
| `hitl` | Foundation F6-06 建立概念，Track 04 深化 |
| `evaluation` | Foundation F7-05 建立基础，Track 04 深化 |
| `ai-workflow-project` | Track 04 Workflow Project 候选；等待可信 Deliverable Runtime |

当前 `lib/courses.ts` 中仍有早期 static 课程数据，仅作为显式 legacy 数据保留，不得作为正式课程的 fallback renderer 或 Curriculum Source of Truth。正式 `foundation-ai` 课程必须完整进入 LessonSpec Registry → Runtime Plan → GenericLessonRuntimePanel；缺少任一环节必须直接失败，不得静默回退旧 UI。

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
