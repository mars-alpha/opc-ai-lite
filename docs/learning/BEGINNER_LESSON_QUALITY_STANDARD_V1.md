# Beginner Lesson Quality Standard v1

Status: **QUALITY_BASELINE_V1**

适用范围：Foundation Beginner Lesson，以及后续面向零基础学习者的入门课。

## 1. 核心目标

一节 Beginner Lesson 的质量，不以“讲了多少知识”为标准，而以这三个结果为标准：

1. 学习者在第一屏就知道“这和我有什么关系”；
2. 学习过程中始终只解决一个主问题；
3. 学完后能说出“我现在会做什么”。

## 2. Cognitive Load Budget

每节课固定预算：

- 1 个主问题；
- 1 个主概念或判断；
- 最多 1–2 个新核心术语；
- 1 个主要案例；
- Step 1 bottomDetails 最多 2 条；
- Step 2 knowledgeDepth.example 最多 2 条；
- Step 5 主 Review 最多 3 条；
- Step 5 knowledgeDepth.review 最多 2 条；
- 不在第一屏或 Check 里提前出现后续课程才需要的专业术语。

如果内容超出预算，优先后移，不通过“再加一张卡片”解决。

## 2.1 Learner-facing Language

面向零基础学习者的课程文案固定遵守：

- 中文表达优先；
- AI 专业术语第一次有意义地出现时使用“中文（English）”，例如：提示词（Prompt）、上下文（Context）、迭代（Iteration）；
- 首次说明后优先继续使用中文，不反复堆叠英文；
- 内部工程 / Schema / Artifact 名称不直接作为学习者主要文案，例如 Task Brief 应显示为“任务说明”，Context Pack 应显示为“上下文资料包”；
- 默认 OPC / 自媒体 / 内容运营可以继续作为课程背后的 Case Thread，但除非业务语境确有必要，不在学习者正文反复凸显品牌或行业标签；
- 学习者看到的是可迁移的真实任务，教学设计层保留业务连续性。

固定原则：**内部工程语言 ≠ 学习者界面语言；Case Logic 可以稳定，前台表达必须自然、通用。**

## 3. Six-step quality bar

### Step 1 — 建立直觉

固定节奏：

真实场景 → 两种做法/一个冲突 → 一句核心结论 → 最多两条补充说明。

第一屏不承担完整知识解释。

### Step 2 — 讲透方法

只制造一个“原来如此”时刻。

推荐结构：

Before → 只改变一个关键变量 → After → 为什么变化。

不把 Step 2 变成第二章理论课。

### Step 3 — 检查理解

三题 Mastery 保持：

1. SINGLE_CHOICE / BEST_JUDGMENT
2. TRUE_FALSE / MISCONCEPTION
3. MULTI_SELECT / BOUNDARY_CONDITIONS

题目必须像真实判断，不考术语定义。

### Step 4 — 动手实操

APPLICATION：

- 一个很小、可以完成的真实任务；
- 卡住可看 Hint；
- 可查看/填充参考；
- 适合时允许 COPY_TO_AI 做真实结果比较；
- Practice 不首次引入新核心知识。

CONCEPT：

- 只做轻量分类 / 判断 / 反思；
- 不新增 Completion Gate。

### Step 5 — 复盘框架

只保留以后真的会用到的 2–3 条判断规则。

避免再次复述整节课。

### Step 6 — 能力获得

必须写成：

“我现在能……”

而不是：

“我理解了……”

并用一句话说明下一节课为什么值得继续。

## 4. Forbidden beginner drift

除非该课就是对应 Primary Knowledge Home，否则 Beginner opening 不得顺手引入：

- Training / Inference
- Token mechanics
- Embedding / Vector Search
- API / Tool / MCP
- Agent internals
- Deterministic Logic taxonomy
- Evaluation engineering

“以后会学”也优先用中文自然语言描述，不提前堆专业名词。

## 5. Production rule

Course Builder 生产 Beginner Lesson 时必须同时通过：

Curriculum Brief
→ Beginner Cognitive Load Budget
→ Six-step quality bar
→ Automated structural acceptance
→ Human Review

技术 PASS 不等于教学 PASS。
