# T1-06 Formal Brief v1 — 模型与 AI 产品：你使用的到底是什么

Status: **HUMAN_REVIEW_PASS**
Task: **TRACK01-PHASE2-T1-06-001 — T1-06 Formal Brief**
Curriculum source: `TRACK01_CATALOG_METADATA_V2.md`
Output contract: `LESSON_OUTPUT_CONTRACT_V1.md`

## 1. Lesson identity

ID: **T1-06**
Type: **CONCEPT**
Primary Knowledge Point: **Model vs AI Product**
Supporting Knowledge: **Training / Inference intuition**
Prerequisite: **T1-05**
Planned Gate: **CHECK**
Step 4 Participation: **required learning action, non-gating**

## 2. Learner Question

我每天都在“用 AI”，但我用的到底是模型，还是一个 AI 产品？为什么不同 AI 软件看起来都能聊天，实际能力却不一样？

## 3. Inherited Capability / Context

学习者已经完成一次真实 AI 协作链：

- 能判断任务是否适合 AI；
- 能把任务说清楚；
- 能提供必要 Context；
- 能对结果做定向 Iteration；
- 能判断哪些内容必须核验。

因此本课不再重新教授 Prompt / Context / Iteration / Reliability，而是用学习者已经发生过的真实使用体验，解释“这些体验背后哪些来自模型，哪些来自产品层”。

## 4. Current Learner Job

面对一个自己正在使用或课程给定的 AI 产品，识别：

1. 哪一部分是模型提供的核心生成 / 理解能力；
2. 哪些体验来自产品额外叠加的界面、搜索、文件、记忆、工具、权限或其他系统能力；
3. 为什么“换一个 AI 产品”不一定等于“只换了一个模型”。

本课只要求建立可用的分层判断，不要求学习者知道底层工程实现。

## 5. New Capability

完成本课后，学习者能够：

- 用自己的话区分 **模型（Model）** 与 **AI 产品（AI Product）**；
- 面对一个 AI 功能时，先判断它主要来自模型本身，还是产品在模型之外叠加的系统能力；
- 理解 **训练（Training）** 发生在模型能力形成阶段，**推理（Inference）** 是当前使用已训练模型产生结果的过程；
- 遇到不同 AI 产品表现差异时，不再把所有差异都简单归因于“模型聪不聪明”。

## 6. Core Rule

Beginner 层固定使用以下判断：

> **模型是产生理解 / 生成能力的核心引擎；AI 产品通常把一个或多个模型，与界面、Context 管理、搜索、文件、记忆、工具、权限等产品层能力组织成完整体验。**

Supporting intuition：

> **Training 决定模型能力如何形成；Inference 是用户当前调用已训练模型得到结果。**

这两句话必须服务于 Model vs Product 判断，不能扩展成模型训练技术课。

## 7. Minimum Concept Map

本课只建立以下最小结构：

```text
AI Product
├─ Model
│  └─ 当前 Inference：根据输入 / Context 产生输出
├─ Product Context / Session handling
├─ Search / Retrieval（只点名，不教学 RAG）
├─ File / Data handling（只点名）
├─ Memory（只点名，不教学机制）
├─ Tools / Actions（只点名，不教学 Function Calling）
├─ UI / Workflow
└─ Permissions / Safety controls
```

Training 只作为“模型在被使用之前如何形成能力”的 supporting explanation，不进入独立流程图细节。

## 8. Artifact Action / Output

### Learner Action

课程给出一个普通 AI 产品场景，例如：

- 可以直接对话生成文字；
- 可以上传文件后提问；
- 可以联网查找最新资料；
- 可以记住部分长期偏好；
- 可以调用外部工具完成动作。

学习者把这些能力按本课已经教授的判断分成两层：

1. **模型核心能力**
2. **产品额外组织 / 连接的能力**

对边界不确定的项目允许标记“需要进一步确认”，不要求把复杂产品架构猜成唯一正确答案。

### Natural Output

**一份最小 AI 产品能力拆解**

它用于证明学习者已经能把“模型能力”和“产品能力”分开看，不要求作为下一课的强制 Artifact。

## 9. Six-step Intent

### Step 1 — EXPLAIN

从学习者日常使用 AI 产品的体验进入：聊天、搜索、文件、记忆、工具看起来都发生在一个软件里，但这些能力并不一定都来自模型本身。

本步只建立三个判断：
- 模型是完整 AI 产品中的核心能力之一；
- 产品还会组合搜索、文件、记忆、工具、权限等其他能力；
- 仅凭界面看到一个功能，不能直接反推内部实现。

术语只引入本课真正需要的模型（Model）与 AI 产品（AI Product）；Training / Inference 只作为支持理解，不扩展为模型工程课。

### Step 2 — EXAMPLE

使用一个行业中立的信息查询场景：两个 AI 产品都能回答问题，但其中一个会先搜索最新公开资料，再把资料交给模型生成结果。

案例只需要让学习者看见：
- 两个产品都使用模型完成理解与生成；
- 搜索与资料组织属于完整产品额外提供的能力；
- “产品能查最新信息”不等于“模型本身实时知道所有最新信息”。

不要求固定 Before / After，也不展示生产标签。

### Step 3 — CHECK

使用三题 Mastery Sequence，只检查 Step 1–2 已经教过的判断：
- 能否识别完整产品能力不等于模型本身能力；
- 能否理解同一个模型在不同产品里仍可能有不同体验；
- 能否区分核心生成与搜索、文件、权限等额外产品能力。

不检查 Token / Probability / RAG / MCP 等后续知识。

### Step 4 — PRACTICE

让学习者拆解一个自己熟悉的 AI 产品功能，判断哪些更接近模型核心理解 / 生成，哪些明显还需要产品层额外能力；证据不足时允许写“不确定”。

当前练习使用三个判断区，是因为本课需要表达“模型核心 / 产品层 / 暂时不能确定”三个不同判断，不把三个字段升级成全局模板。

学习顺序保持“自己先判断 → 再用 AI 对照分析”，避免让 AI 替学习者完成第一次判断。

### Step 5 — REVIEW

本课保留三个真正值得长期复用的判断：
- 模型不是完整 AI 产品；
- 比较 AI 产品要看完整能力组合；
- 证据不足时可以保留不确定。

数量来自本课知识本身，不因为 UI 卡片数量而固定，也不要求使用“AI 适合做什么 / AI 不应该替你做什么”的上下对比结构。

### Step 6 — CAPABILITY

学习者应能回答：
- **我现在会做什么？** 能把一个 AI 产品拆成模型核心能力与产品层能力来看。
- **我怎样知道自己会了？** 看到搜索、文件、记忆、工具和权限时，不会把它们全部直接归因于模型。
- **遇到什么情况，我应该想到这节课？** 比较两个 AI 产品、看到新功能，或想判断某项能力到底来自模型还是完整产品时。
- **下一课为什么值得继续？** 已经知道模型处在产品中的位置，下一课继续理解模型为什么会逐步生成并出现不同表达。

## 10. Next Reuse

T1-07 只继承两个最低前提：

1. 学习者知道 Model 是 AI Product 中的核心生成能力之一；
2. 学习者知道当前使用模型产生输出属于 Inference。

T1-07 再正式教学 Token / Probability Generation / non-deterministic output intuition。

本课不为 T1-07 强制生产 Artifact。

## 11. Anti-repeat / Deferred

本课明确不教授：

- Prompt / Context / Iteration / Reliability（T1-02～T1-05 已完成）；
- Token / Probability Generation（T1-07）；
- Context Window 数字与机制（T1-07 supporting）；
- Memory 机制（T1-08）；
- Knowledge Base / Source of Truth（T1-09）；
- Search / RAG 原理（T1-10）；
- API / Schema（T1-11～T1-12）；
- Function Calling / Tool Use（T1-13）；
- MCP（T1-14）；
- Skill / Workflow / Agent（T1-15～T1-17）；
- Multimodal 原理与选择（T1-18）；
- Coding / Browser / Computer Use（T1-19）；
- Permissions / HITL / Core Authority（T1-20）；
- Transformer、Attention、Weights、Parameters、Fine-tuning 等模型工程细节。

产品能力可以在 Example 中点名，但不得在本课解释其后续正式概念。

## 12. Grounding Rule

正式 Draft 默认使用稳定知识层，不依赖某一具体 AI 产品当前按钮或套餐。

若 Example 使用具体产品或当前功能：
- 必须在生产时重新核对新鲜度；
- 具体功能只作为案例，不进入 Stable Method Layer；
- 不允许把厂商营销名称当成课程核心概念。

## 13. Human Review Checklist

进入 Course Builder 前必须确认：

- [x] Primary Knowledge Point 始终只有 Model vs AI Product；
- [x] Training / Inference 只作为 supporting intuition；
- [x] Step 1 从真实产品体验进入，而不是模型定义堆砌；
- [x] Step 2 能真正说明“同样是 AI 回答，产品层可能做了不同事情”；
- [x] Step 3 不偷教 Token / RAG / Tool / MCP；
- [x] Step 4 是自然的能力拆解判断，而不是架构考试；
- [x] 允许“不确定”，不鼓励学习者猜真实产品内部实现；
- [x] Step 5 只保留本课真正需要长期复用的判断，数量与表现形式不由 UI 固定；Knowledge Depth / Pitfalls 不重复；
- [x] Step 6 形成可执行的产品判断能力；
- [x] T1-07 的 Token / Probability 边界保持完整。

Human Review decision: **PASS**. T1-06 Formal Brief 已具备进入 Current Course Builder Skill 的条件；当前 Runtime 状态以 Current Facts 为准。
