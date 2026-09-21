# Foundation Batch A Briefs v1

> **PEDAGOGY_REJECTED / RETIRED AS FAILED DRAFT REFERENCE**
> 2026-09 Human Review 判定本 Batch 对零基础学习者理论过重、逻辑混乱。本文仅保留历史证据，不再代表当前 Foundation 开场课程。新的 Beginner Foundation 以 `docs/learning/BEGINNER_FOUNDATION_REFRAME_V1.md` 为准。旧 F1-01～F1-04 不得继续正式化或切换 AVAILABLE。

Status: **BRIEF_READY_V1**  
Task: **CURRICULUM-003 — Foundation Batch A Brief Finalization**  
Scope: F1-01 → F1-04

## 1. Batch intent

Batch A 负责建立最基础的 AI 世界模型：

```text
AI 是什么
→ Model 是什么
→ Training / Inference 是什么
→ Generation / Retrieval / Deterministic Logic 有什么区别
```

四节课完成后，学习者应能理解：
- AI 产品背后存在 Model；
- Model 不是数据库，也不是传统规则程序；
- Training 和实际使用时的 Inference 是不同阶段；
- “生成答案”“查资料”“按规则计算”是三种不同机制；
- 后续 Prompt / Context / RAG / Tool / Agent 都建立在这些概念之上。

Batch A 只建立基础认知，不提前教授 Prompt、RAG、API、Tool、Agent 的完整定义。

---

# 2. Catalog Display Contract

未来 Formal Curriculum Catalog UI 使用统一最小字段：

| Field | Meaning |
| --- | --- |
| lessonId | 稳定课程 ID |
| title | 正式课程标题 |
| subtitle | 一句话说明“这节解决什么问题” |
| learnerOutcome | 学完后能做到什么 |
| lessonType | CONCEPT / APPLICATION / PRACTICE / PROJECT |
| estimatedMinutes | 预计学习时长；允许后续 Human Review 调整 |
| curriculumStatus | PLANNED / BRIEF_READY / IN_PRODUCTION / AVAILABLE |
| availability | LOCKED / COMING_SOON / AVAILABLE |
| stageId | Foundation Stage |
| moduleId | 所属 Module |
| order | 正式学习顺序 |
| prerequisites | 推荐前置课程 |
| badge | 可选，如“基础必修”“应用”“项目” |

规则：

- `curriculumStatus` 表示课程生产状态；
- `availability` 表示用户是否可以进入课程；
- **BRIEF_READY 不等于 AVAILABLE**；
- PLANNED / BRIEF_READY / IN_PRODUCTION 可以在目录展示，但不能跳转到空课程页；
- 只有 AVAILABLE 才允许进入正式 Lesson Runtime；
- 前端不得用“是否存在标题”推断课程是否已经发布；
- Catalog 展示完整 Curriculum，Lesson Runtime 只承载正式可用课程。

Batch A 当前：
- F1-01～F1-04 = `BRIEF_READY`
- availability = `COMING_SOON`
- 后续 Foundation = `PLANNED`

---

# 3. F1-01 — AI、机器学习与生成式 AI 到底是什么

## Catalog

- lessonId: `foundation-ai-ml-generative-ai`
- stageId: `foundation-1`
- moduleId: `ai-world-model`
- order: 1
- title: **AI、机器学习与生成式 AI 到底是什么**
- subtitle: **先分清 AI、机器学习和生成式 AI，不把所有“智能功能”都当成同一种东西。**
- learnerOutcome: **能够判断一个常见产品能力属于规则程序、机器学习还是生成式 AI，并说出三者的核心区别。**
- lessonType: `CONCEPT`
- estimatedMinutes: 12
- curriculumStatus: `BRIEF_READY`
- availability: `COMING_SOON`
- badge: `基础必修`
- prerequisites: 无
- completionGates: `CHECK`

## Learning objectives

1. 用自己的话解释 AI 是一个大范围概念，而不是某一个聊天产品。
2. 理解 Machine Learning 是让系统从数据中学习模式的一类方法。
3. 理解 Generative AI 的核心特征是生成新的文字、图片、声音等内容。
4. 能用真实例子区分规则程序、预测/分类型机器学习和生成式 AI。

## Canonical knowledge points

- AI 是一个广义能力集合，不等于 LLM。
- Machine Learning 是 AI 的重要实现方式之一。
- Generative AI 是机器学习体系中的一类生成型能力。
- 同一个产品可以同时组合普通代码、机器学习和生成式 AI。
- “用了 AI”不意味着所有功能都由模型直接完成。

## Supporting concepts

- Rules / deterministic software
- Prediction / classification
- Generative output
- Data-driven behavior

## Misconceptions to correct

- “AI 就是 ChatGPT 一类聊天机器人。”
- “只要软件会自动化，就是 AI。”
- “机器学习和生成式 AI 是完全一样的东西。”
- “一个 AI 产品里的所有功能都由大模型直接完成。”

## Scenario direction

场景使用“邮箱垃圾邮件过滤、地图路线规则、AI 写邮件”三个日常功能做对比。

目的不是背分类，而是让学生看到：
- 有些系统按明确规则执行；
- 有些系统根据数据识别模式；
- 有些模型根据输入生成新内容。

## Six-step brief

### Step 1 — EXPLAIN / 建立直觉

Intuition target:
**“AI 不是一种单一技术，而是一整类让机器完成原本需要人类判断/生成任务的方法。”**

通过三个熟悉功能建立差异感，不先堆定义。

### Step 2 — EXAMPLE / 讲透方法

Depth target:
建立包含关系：

```text
AI
└─ Machine Learning
   └─ Generative AI（其中一类）
```

同时强调真实产品通常是“代码 + 模型 + 数据 + UI”的组合。

### Step 3 — CHECK / 检查理解

Three-question focus:
- SINGLE_CHOICE / BEST_JUDGMENT：判断真实场景主要属于规则 / ML / Generative AI。
- TRUE_FALSE / MISCONCEPTION：纠正“所有 AI 功能都是生成式 AI”。
- MULTI_SELECT / BOUNDARY_CONDITIONS：识别 Generative AI 常见输出特征。

### Step 4 — PRACTICE

CONCEPT Lesson，不设置正式 PRACTICE Gate。

允许非 Gate participation：
给 4 个常见产品功能，让学习者自己分类，并解释理由。

### Step 5 — REVIEW / 复盘框架

Reusable framework:

```text
先问：
1. 它是在按固定规则执行吗？
2. 它是在从数据中判断/预测吗？
3. 它是在生成新的内容吗？
```

### Step 6 — CAPABILITY / 能力获得

Capability:
**看到一个“AI 功能”时，不再只看产品宣传词，而能先判断它大概属于哪类能力。**

Next:
进入 F1-02，理解“大语言模型”和“AI 产品”为什么不是同一个东西。

## Grounding

sourceKind: `APPROVED_KNOWLEDGE`

Requirements:
- AI / ML / Generative AI 的通用定义；
- 优先稳定、长期有效的基础资料；
- 可以引用主流机构公开定义，但课程不绑定具体公司产品；
- freshness: LOW。

## Anti-overlap

本课不负责：
- LLM 结构和能力 → F1-02；
- Training / Inference → F1-03；
- Token / next-token prediction → F2-01；
- Prompt → F3-01。

---

# 4. F1-02 — 大语言模型是什么：Model 不等于 AI 产品

## Catalog

- lessonId: `foundation-llm-model-vs-product`
- stageId: `foundation-1`
- moduleId: `ai-world-model`
- order: 2
- title: **大语言模型是什么：Model 不等于 AI 产品**
- subtitle: **理解你正在使用的是一个 AI 产品，而真正负责语言生成的只是其中的 Model。**
- learnerOutcome: **能够区分 Model、AI App 和平台功能，不再把“产品”与“模型”混成同一个概念。**
- lessonType: `CONCEPT`
- estimatedMinutes: 12
- curriculumStatus: `BRIEF_READY`
- availability: `COMING_SOON`
- badge: `基础必修`
- prerequisites: F1-01
- completionGates: `CHECK`

## Learning objectives

1. 理解 Large Language Model（LLM）主要负责理解和生成语言模式。
2. 区分 Model 与用户实际操作的 AI Product / App。
3. 理解一个 AI 产品通常还包含 UI、Memory、Search、Tool、Safety、Code 等其他系统能力。
4. 知道同一个产品可能切换或组合多个模型。

## Canonical knowledge points

- Model 是计算能力核心之一，不是完整产品。
- AI Product = Model + Code + Data + Tools + UI + Policies + Runtime 等组合。
- 产品功能变化不一定代表基础模型本身发生变化。
- 同一个 Model 可以被不同产品调用。
- 同一个产品也可能使用多个 Model。

## Supporting concepts

- LLM
- Model family
- App / product layer
- Runtime
- System orchestration（只做直觉说明）

## Misconceptions

- “ChatGPT / Claude / Gemini 这样的产品名就是模型本身。”
- “模型知道我所有账户信息。”
- “产品能搜索网页，所以模型本身天然连接互联网。”
- “换了界面功能就一定是换了模型。”

## Scenario direction

用“发动机 vs 汽车整车”的类比，但明确这只是帮助理解，不是严格技术对应。

再用真实 AI 产品结构说明：

```text
用户界面
→ 产品系统
→ Model
+ Search / Memory / Tool / File / Safety 等
```

## Six-step brief

### Step 1

Intuition target:
**“你使用的是一个完整 AI 产品；Model 只是其中负责核心理解/生成的一部分。”**

### Step 2

Depth target:
讲清 Model / Product / Capability 三层，不进入 API 工程细节。

### Step 3

Mastery focus:
- BEST_JUDGMENT：一个产品新增网页搜索，最合理解释是什么？
- MISCONCEPTION：判断“模型 = AI 软件全部功能”。
- BOUNDARY_CONDITIONS：识别哪些能力可能来自产品层而非 Model 本身。

### Step 4

非 Gate participation：
给出一个 AI 产品功能列表，让学习者把“可能由 Model 负责”和“明显需要产品系统配合”的能力分开。

### Step 5

Review framework:

```text
看到一个 AI 功能时先问：
Model 负责什么？
产品系统又额外做了什么？
```

### Step 6

Capability:
**理解后续 Memory、RAG、Tool、MCP、Agent 时，知道这些并不等于“模型本体”。**

## Grounding

sourceKind: `RESEARCH_PACKET`

Requirements:
- Stable definition of LLM；
- 至少包含当前主流 AI 产品架构的一手公开说明；
- 资料必须区分 Model capability 与 Product feature；
- freshness: MEDIUM。

## Anti-overlap

不负责：
- Training / Inference → F1-03；
- Token / generation mechanism → F2-01；
- API → F5-01；
- Tool → F5-03；
- Memory / RAG → F4。

---

# 5. F1-03 — Training 与 Inference：模型是怎样“学会”再“使用”的

## Catalog

- lessonId: `foundation-training-inference`
- stageId: `foundation-1`
- moduleId: `ai-world-model`
- order: 3
- title: **Training 与 Inference：模型是怎样“学会”再“使用”的**
- subtitle: **把“模型训练时学到什么”和“你现在问它问题时发生什么”分清楚。**
- learnerOutcome: **能够解释 Training 与 Inference 的区别，并理解聊天时模型通常不是现场重新训练。**
- lessonType: `CONCEPT`
- estimatedMinutes: 12
- curriculumStatus: `BRIEF_READY`
- availability: `COMING_SOON`
- badge: `基础必修`
- prerequisites: F1-01,F1-02
- completionGates: `CHECK`

## Learning objectives

1. 理解 Training 是模型从大量数据中调整参数、学习模式的阶段。
2. 理解 Inference 是使用已训练模型根据当前输入生成结果的阶段。
3. 能区分“提供 Context”与“重新训练模型”。
4. 知道 Fine-tuning / continued training 存在，但不把它与普通对话混为一谈。

## Canonical knowledge points

- Training 与 Inference 是两个不同阶段。
- 普通对话主要发生在 Inference 阶段。
- 将文件、Prompt、History 放入 Context 不等于重新训练模型。
- 模型参数与当前会话 Context 是两类不同信息载体。
- Fine-tuning 是额外训练方式，但不是普通用户每次聊天都会发生。

## Supporting concepts

- Parameters（直觉）
- Training data
- Context
- Fine-tuning（知道存在即可）

## Misconceptions

- “我和 AI 多聊几次，它就会立刻重新训练自己。”
- “上传文件就是把文件训练进模型。”
- “Memory 和 Training 是同一回事。”
- “Prompt 写得好是在修改模型参数。”

## Scenario direction

用“已经学会语言的人参加一次会议”作为直觉：
- Training 类似长期学习形成能力；
- Inference 类似现在根据眼前资料完成任务；
- 当前会议资料并不会重写这个人的全部长期知识。

避免把类比讲成技术事实。

## Six-step brief

### Step 1

Intuition target:
**“模型先被训练，再被使用；你现在的 Prompt 通常是在使用模型，不是在重新训练模型。”**

### Step 2

Depth target:
建立两层：

```text
Training → 改变模型参数
Inference → 使用参数 + 当前 Context 生成结果
```

只解释参数直觉，不讲梯度下降等数学。

### Step 3

Mastery focus:
- BEST_JUDGMENT：上传 PDF 后模型能回答 PDF 内容，这属于 Training 还是 Context/Inference？
- MISCONCEPTION：纠正“每次聊天都会训练模型”。
- BOUNDARY_CONDITIONS：识别哪些场景更接近 Training / Fine-tuning，哪些只是 Inference。

### Step 4

非 Gate participation：
把“上传文件、聊天、Fine-tuning、调用模型生成摘要”分类。

### Step 5

Review framework:

```text
先问：
它是在改变模型长期参数，
还是只是在当前任务里给模型更多信息？
```

### Step 6

Capability:
**以后看到 Memory、RAG、Context、Fine-tuning 时，不会再把它们全部理解成“训练 AI”。**

## Grounding

sourceKind: `APPROVED_KNOWLEDGE`

Requirements:
- Stable foundational materials on training/inference；
- 不进入训练算法数学；
- 若使用 Fine-tuning 示例，需明确这是辅助概念；
- freshness: LOW。

## Anti-overlap

不负责：
- Token prediction → F2-01；
- Context Window → F2-02；
- Memory → F4-01；
- RAG → F4-03；
- Fine-tuning implementation → Technical Track。

---

# 6. F1-04 — AI 为什么不是数据库：生成、检索与确定性规则的区别

## Catalog

- lessonId: `foundation-generation-retrieval-rules`
- stageId: `foundation-1`
- moduleId: `ai-world-model`
- order: 4
- title: **AI 为什么不是数据库：生成、检索与确定性规则的区别**
- subtitle: **学会判断一个答案应该让模型生成、从资料中查找，还是交给普通程序计算。**
- learnerOutcome: **能够针对真实任务判断 Generation、Retrieval、Deterministic Logic 哪一种机制更适合。**
- lessonType: `CONCEPT`
- estimatedMinutes: 15
- curriculumStatus: `BRIEF_READY`
- availability: `COMING_SOON`
- badge: `基础必修`
- prerequisites: F1-01,F1-02,F1-03
- completionGates: `CHECK`

## Learning objectives

1. 理解 Generation 的优势是语言理解、组合和生成，而不是保证事实精确。
2. 理解 Retrieval 的目标是从已有资料中找到相关信息。
3. 理解 Deterministic Logic 更适合公式、权限、状态、明确业务规则。
4. 能判断真实任务应由一种机制处理还是组合处理。
5. 为后续 RAG / Tool / Workflow 建立正确基础。

## Canonical knowledge points

- Model generation 是基于模式生成，不是直接读取内部数据库记录。
- Retrieval 负责“找到已有信息”，Generation 负责“理解和组织表达”。
- 确定性规则适合需要完全稳定、一致、可审计的逻辑。
- 成熟 AI 产品经常组合三者，而不是只依靠模型。
- “AI 能回答”不代表应该让 AI 独立决定最终事实、权限或数字。

## Supporting concepts

- Retrieval
- Search
- Deterministic code
- Source
- Calculation / validation

## Misconceptions

- “模型知道答案就等于数据库里存着一条答案。”
- “AI 能计算，所以财务公式都应该直接交给模型。”
- “有了 RAG 就不需要模型。”
- “有了模型就不需要普通程序和数据库。”

## Scenario direction

使用四个真实任务：
- 写一封客户跟进邮件；
- 查员工最新年假政策；
- 计算订单折扣；
- 根据找到的政策解释用户是否符合条件。

引导学生看到不同任务对应不同机制，以及组合方式。

## Six-step brief

### Step 1

Intuition target:
**“不是所有问题都应该让模型直接回答；有些应该查，有些应该算，有些才适合生成。”**

### Step 2

Depth target:
形成三类责任：

```text
Generation → 理解 / 组织 / 生成
Retrieval → 查找已有事实
Deterministic Logic → 稳定规则 / 公式 / 权限
```

再补充：
真实系统往往是三者组合。

### Step 3

Mastery focus:
- BEST_JUDGMENT：订单金额折扣应该优先交给哪种机制？
- MISCONCEPTION：纠正“模型输出就是事实查询结果”。
- BOUNDARY_CONDITIONS：多选哪些任务需要 Retrieval / deterministic check / generation 组合。

### Step 4

CONCEPT，无正式 PRACTICE Gate。

非 Gate participation：
对 6 个日常任务进行“生成 / 检索 / 规则 / 组合”分类。

### Step 5

Review framework:

```text
遇到任务先问：
1. 需要创造/理解表达吗？→ Generation
2. 需要从已有资料找到事实吗？→ Retrieval
3. 结果必须稳定、精确、可审计吗？→ Deterministic Logic
4. 是否需要组合？
```

### Step 6

Capability:
**以后学习 RAG、Tool、Workflow、Agent 时，会先判断每一步到底应该由模型、检索还是普通程序负责。**

## Grounding

sourceKind: `APPROVED_KNOWLEDGE`

Requirements:
- generation/retrieval/deterministic software stable concepts；
- 可使用数据库、计算、知识检索的生活化例子；
- 不提前深入 RAG architecture；
- freshness: LOW。

## Anti-overlap

不负责：
- Search / RAG 原理 → F4-03；
- Source of Truth → F4-02；
- Tool calling → F5-03；
- Code/Skill/Workflow responsibility architecture → Track 04。

---

# 7. Course Builder handoff contract

Batch A 进入 Course Builder 时，每节 Brief 必须转换为：

- grounding.status = REVIEWED
- grounding.sourceKind = APPROVED_KNOWLEDGE 或 RESEARCH_PACKET，严格按本文件
- pedagogy.audience = BEGINNER
- pedagogy.languagePolicy = TERM_READABILITY
- pedagogy.aiToolNeutral = true
- pedagogy.conceptMasteryBeforePractice = true
- pedagogy.sixStepResponsibilities = Unified Contract
- lessonSpec.lessonType = 本文件指定类型
- completionGates = 本文件指定 Gate
- checkSequence = Three-Question Mastery Sequence
- 不得引入 Brief 未定义的新 Primary Knowledge Home

Course Builder 可以：
- 生成场景表达；
- 生成示例；
- 生成 Check 题目；
- 生成 Review / Capability 文案。

Course Builder 不可以：
- 改课程顺序；
- 合并或拆分 Primary Knowledge Home；
- 把后续知识提前讲成主知识；
- 自动把 Draft 标为 Published；
- 改 Catalog availability。

---

# 8. Front-end handoff

完成本任务后，目录 UI 已具备足够的规划数据契约。

下一任务：

**LEARNING-CATALOG-001 — Formal Curriculum Catalog UI**

第一版 UI 应：
- 展示完整 7 Stage / 28 Lesson Foundation Map；
- F1-01～F1-04 显示“即将开放 / Brief Ready”；
- F1-05 以后不存在；其余 Foundation Lessons 按 Map 显示 PLANNED；
- PLANNED / BRIEF_READY 项目不可进入空 Lesson 页面；
- AVAILABLE 才允许进入 Runtime；
- 不从 `lib/courses.ts` 推导正式 Catalog；
- 先建立规划数据 bridge，再展示，不迁移 Production DB。
