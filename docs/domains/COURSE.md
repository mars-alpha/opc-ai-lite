# COURSE.md — 课程领域规则 V4

## 1. 课程目标

课程不是工具目录。

课程围绕用户能力成长组织：

```text
看懂 AI
↓
用好 AI
↓
建立 AI Workflow 认知
↓
AI 运营与增长
↓
AI Solution Builder
↓
FDE 落地
```

工具、模型和热门 GitHub 项目只作为当前案例或实操素材挂载。

---

## 2. 课程结构与 Canonical Schema

```text
Learning Path
↓
Stage
↓
Module
↓
Lesson
↓
Stage Project（用户侧：实操项目）
```

所有正式实体使用稳定 ID。课程结构事实最终以数据库 Schema / Migration / Types 为准；本节只固定 V1 领域字段边界，避免前端、后台和文档各自发明结构。

### Stage

```text
id
slug
title
summary
order
status
```

### Module

```text
id
stage_id
title
summary
order
status
```

### Lesson

```text
id
module_id
title
summary
body / content
order
status
version
updated_at
```

### Lesson Read Model（当前 MVP 已验证）

当前 Lesson UI 已验证以下教学内容层级：

```text
plain_explanation       一句人话解释
why_it_matters          为什么要学
learning_points[]       学习目标
core_content[]          核心内容
example                 真实例子 / 前后对比
guide_blocks[]          Prompt / Template / Steps / Checklist
common_mistakes[]       常见错误
related_knowledge[]     相关知识 / 下一步
```

其中 `guide_blocks` 中适合直接使用的 Prompt / Template 支持复制到用户自己的 AI 工具。

这些字段代表 **Lesson Read Model / Content Payload**，不要求全部一一冻结为数据库列。当前 Lesson 已进入 PostgreSQL，并使用结构化 JSONB 承载正文 Payload；后续增加互动学习实体时仍必须保留稳定 Lesson ID、版本与可迁移性。

当前 Lesson 正文仍带有 Practice 内容 Payload；MVP-008 起逐步把“可提交、可检查、可重试”的互动 Practice 状态从 Course Content 分离，通过独立学习实体 / Read Model 组合给 Lesson 页面，避免把用户提交状态混入课程正文。

### Practice / Project Canonical Model（MVP-010 已验证）

Practice 已从 Lesson 正文中的静态练习 Payload 正式分离为统一业务模型：

```text
Practice
├─ type
│  ├─ LESSON_PRACTICE
│  ├─ STAGE_PROJECT
│  └─ LATEST_PRACTICE
├─ access_tier: INHERIT / FREE / MEMBER
├─ lesson_id nullable
├─ stage_id nullable
├─ source_content_id nullable
├─ source_knowledge_id nullable
├─ title / goal / instructions / hints / rubric
├─ submission_schema
├─ pass_score / required / status
└─ created_at / updated_at
```

Ownership 规则：

```text
LESSON_PRACTICE → lesson_id required
STAGE_PROJECT   → stage_id required
LATEST_PRACTICE→ source_content_id OR source_knowledge_id required
```

三类 Practice 全部共用：

```text
practice_submissions
practice_evaluations
```

不建立 `stage_project_submissions` 或 `latest_practice_submissions` 平行体系。

当前正式 Submission Schema：

```text
TASK_BRIEF_V1
→ Goal / Context / Input / Constraint / Output
```

当前 Evaluation Runtime 状态：

```text
SUBMITTED
NEEDS_REVISION
PASSED
EVALUATION_FAILED
```

### Stage Project（用户侧名称：实操项目）

Stage Project 不再是独立数据系统，而是：

```text
Practice.type = STAGE_PROJECT
```

它遵守 Stage prerequisite，并可通过 `access_tier = MEMBER` 复用统一 OPC Membership Policy。

### Latest Practice

Latest Practice 使用：

```text
Practice.type = LATEST_PRACTICE
```

必须关联至少一个 Published Content / Knowledge Source，并继续使用同一 Submission / Evaluation / Event 闭环。

### Progress 边界

学习进度不属于课程内容本体，不放进 Course Canonical Content。Progress 由独立 Learning / Progress 领域记录用户状态，并通过稳定的 `user_id + lesson_id / course_id` 关联课程实体。

---

## 3. 主 Stage

### Stage 1 — AI Literacy

建立 AI 世界模型：

```text
模型
上下文
Token
Memory
幻觉
Search / RAG / Knowledge
API
Tool
MCP
Skill
Agent
AI Coding
数据与安全
```

同时建立：

```text
技术可行 ≠ 用户会用 ≠ 产生价值
```

### Stage 2 — AI Worker

按任务而不是工具学习：

```text
搜索与研究
文件
写作
数据
表格
PPT
图片 / 视频
办公
```

### Stage 3 — AI Workflow

```text
任务拆解
上下文基础
Context Engineering / 上下文治理
最小充分上下文
事实源与知识治理
Knowledge Base
Workflow
Automation
Agent
MCP / Skill
Human-in-the-loop
Evaluation
MVD
```

其中“上下文治理”是必修模块，核心包括：

```text
AI 当前看到了什么
为什么上下文越多不一定越好
Canonical Source / Source of Truth
Global / Task / On-demand Context
Minimum Sufficient Context
Must Know / Nice to Know / Do Not Load
任务边界与 Stop Rule
长期项目如何避免历史污染与规则冲突
```

关键区分：

```text
Knowledge Base = 有什么知识
Context Engineering = 当前任务应该给 AI 哪些知识
```

### Stage 4 — AI Growth

```text
市场研究
用户研究
内容
流量
销售
客服
留存
数据复盘
```

### Stage 5 — AI Solution Builder

```text
Problem
Requirement
Data
Workflow
Prototype
Evaluation
Deployment
```

AI Coding 工具属于实现手段，不成为课程骨架。

### Stage 6 — FDE

```text
现场观察
问题筛选 / PSF
价值基线
MVD
集成
激活 / Adoption
价值度量
复盘
复用 / 产品化
```

---

## 4. OPC 四问

任何 AI 项目或实操优先回答：

```text
1. 谁真的在痛？
2. 值不值得解决？
3. AI 能不能解决？
4. 怎么证明有效？
```

这四问贯穿 Stage 2～6。

---

## 5. 内容类型

```text
CORE_LESSON
KNOWLEDGE_CAPSULE
PRACTICE
FIELD_PROJECT
```

`DAILY_ITEM` 属于 Content Domain，不属于正式课程节点。

---

## 6. Lesson 模板

核心 Lesson 推荐结构：

```text
一句人话解释
↓
为什么需要知道
↓
核心内容
↓
真实例子
↓
5～20 分钟自己动手
↓
常见错误
↓
相关知识 / 最新变化
```

当前 Lesson 已具备解释、例子、Guide、Practice 与验收内容。下一阶段的重点不是继续增加卡片，而是把课程交付升级为最小互动学习闭环。

原则：

```text
一个 Lesson 只承担一个主要学习目标
概念解释优先使用普通人能理解的语言
实操优先使用真实任务，不虚构无意义练习
相关知识和最新变化作为补充，不抢占主学习路径
```

避免单纯堆概念。

### 6.1 Interactive Lesson 交付方向（MVP-008）

用户侧学习目标从“看完一课”升级为“完成一次能力变化”。

第一版只验证：

```text
理解检查
↓
需要时获取提示 / 跟做
↓
使用自己的真实输入完成一次
↓
提交
↓
Rubric / 规则检查
↓
反馈
↓
修改后重试
↓
PASSED
```

原则：

```text
提示优先于直接给答案
单次任务可以评分，但暂不建立“用户 AI 能力总分”
重要 Lesson 可以要求提交一次
不同课程可采用选择/判断、结构提交、结果提交、过程提交等不同验证方式
不建设通用 AI Chat；互动按钮必须绑定当前 Lesson / Practice 上下文
```

MVP-008 先选择一节现有 Lesson 试点，验证闭环后再扩展题型和自动化深度。

---

## 7. Practice 模板

实操应尽量描述任务结果：

```text
目标
输入
步骤
验收结果
常见失败
使用的当前工具
```

不要把工具名作为长期课程身份。

### 7.1 当前实操分层

```text
基础 Practice
= Lesson / 单能力的短实操

实操项目
= 学习路径中的课程综合应用验证

最新技术实操
= 由 AI Daily / PRACTICE_CANDIDATE 进入进阶练习的新技术实操
```

三者可以共享 Practice / Project 基础领域能力，但用户侧来源和用途必须区分。最新技术实操属于 Content → Practice 的动态入口，不等同于课程 Stage Project。

### 7.2 MVP 当前完成规则

当前 MVP 固定以下产品规则：

```text
Lesson required Practice
→ 可以作为 Lesson Completion Gate

Stage Project
→ 当前为可选综合项目
→ PASSED 会保存 Submission / Evaluation / Event
→ 不阻塞进入下一 Stage

/practice 的 Basic Practice
→ 自主练习示例
→ 不写入正式 Practice / Submission / Evaluation
```

未来如果要让某些 Stage Project 成为升级条件，应新增明确的 `required` / completion policy 设计并单独验收；不要直接复用现有 Lesson Gate 隐式阻塞 Stage progression。

---

## 8. Field Project

综合项目必须尽量体现：

```text
真实问题
真实数据
Baseline
成功标准
最小部署
人工审核边界
结果度量
复盘
```

例如 AI 客服项目，不以“机器人跑起来”为完成，而以真实问题测试和价值指标为完成。

---

## 9. 发布状态

```text
DRAFT
REVIEW
PUBLISHED
ARCHIVED
```

普通用户只读取 PUBLISHED。

---

## 10. 知识有效性

课程关联知识可以标记：

```text
NEW
ACTIVE
WATCH
OUTDATED
DEPRECATED
```

新知识进入后，如果影响现有课程，应产生 Course Update Proposal，而不是直接改 Published。

---

## 11. 课程更新

流程：

```text
New Knowledge
↓
Impact Analysis
↓
Affected Lessons
↓
Update Proposal
↓
Human Review
↓
Publish New Version
```

重要更新应记录：

```text
来源
原因
影响范围
更新时间
```

---

## 12. Source of Truth

正式课程：PostgreSQL / OPC Production Data。

Obsidian：研究、来源、草稿、修改依据。

课程正文变化原则上不要求重新部署程序。

---

## 13. 课程评估机制

课程不是发布后永久不变。每个核心 Lesson、Practice、Field Project 都应允许定期评估。

评估优先回答五类问题：

```text
A. Accuracy     内容是否仍然正确？
B. Freshness    是否已经过时？
C. Clarity      普通用户是否能理解？
D. Practice     实操是否还能完成、结果是否可验证？
E. Structure    内容是否仍放在正确的 Stage / Module？
```

建议证据来源：

```text
官方更新
GitHub / 行业变化
课程引用来源
用户学习反馈
高频客服 unresolved 问题
实操失败记录
课程完成 / 跳出等基础数据
人工课程 Review
```

评估结果不要直接修改 Published 内容，先形成：

```text
Course Review Finding
或
Course Update Proposal
```

再由后台人工审核决定是否修改。

---

## 14. 课程问题分类

发现课程问题后，先分类，再决定修补方式。

```text
CONTENT_OUTDATED
旧事实、旧版本、旧流程

CLARITY_ISSUE
事实没错，但用户学不清楚

STRUCTURE_ISSUE
顺序、前置知识或课程位置不合理

KNOWLEDGE_CONFLICT
课程与正式知识库 / 新事实发生冲突

PRACTICE_BROKEN
实操步骤、链接、工具、环境已经失效

SCOPE_DRIFT
课程逐渐变成工具百科或超出原能力目标

DUPLICATION
多节课重复解释同一核心知识
```

---

## 15. 课程修补策略

课程修复统一使用：

```text
PATCH
REFACTOR
REBUILD
```

### PATCH

用于：

```text
局部事实过时
链接失效
小范围示例更新
术语解释不清
少量步骤修正
```

不改变 Lesson 的主要学习目标和结构。

### REFACTOR

用于：

```text
内容仍有价值，但结构混乱
前置知识顺序错误
重复内容较多
一节课承担太多目标
实操与概念脱节
```

允许重新组织 Lesson / Module 内部内容，但不擅自改变 Learning Path。

### REBUILD

用于：

```text
核心知识已经失效
旧实现长期阻碍当前学习目标
课程依赖大量过时工具或兼容说明
继续 PATCH 的成本高于重写
```

当课程核心已经失效或持续修补成本过高时，允许直接 REBUILD，不为了历史结构持续堆补丁。

---

## 16. Course Patch Budget

同一 Lesson / Module 如果连续出现 2～3 次结构性修补，不继续叠加 workaround。

必须执行一次 Course Root Cause Review，并给出：

```text
KEEP
REFACTOR
REBUILD
```

评估重点：

```text
学习目标是否仍成立
知识是否仍有效
是否存在重复事实源
用户是否真的学得懂
实操是否仍能完成
维护成本是否开始高于重建成本
```

---

## 17. 课程 Stable Baseline

重要课程阶段完成一次较大更新后，记录：

```text
课程版本 / Updated At
影响的 Lesson / Module
主要变更原因
知识状态
验证结果
Known Issues
下一次 Review 条件
```

目标不是制造大量文档，而是确保未来能知道“哪一版课程是经过确认的稳定版本”。


---

## 8. MVP-009 Learning Feedback / Course Insight 边界

课程内容与用户学习反馈必须分离。

正式关系：

```text
Lesson / Practice
↓
Learning Event / Feedback
↓
Course Insight
↓
Course Update Candidate
↓
Human Review
↓
人工课程更新
```

课程正文不直接存储用户反馈聚合状态。

Feedback 不能直接修改 Lesson；Course Insight 只是对真实用户证据的聚合；Course Update Candidate 只是 Proposal。

当前触发规则：

```text
3 位独立用户同类问题 → ANALYSIS_READY
quality risk          → REVIEW_REQUIRED
```

已有课程能够回答的问题优先返回课程入口，不调用 AI。

真实 AI Provider 尚未配置，因此当前 `ANALYSIS_READY` 只表示“达到分析条件”，不代表已经产生 AI Diagnosis。

MVP-010 起，Practice / Stage Project / Latest Practice 将逐步统一到同一 Practice / Submission / Evaluation 体系；不为三种入口重复建设业务模型。

