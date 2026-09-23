# T1-07 Formal Brief v1 — 词元（Token）与概率（Probability）生成：为什么同一个任务会得到不同答案

Status: **HUMAN_REVIEW_PASS**
Task: **TRACK01-T1-07-REBUILD-001 — Token / Probability Lesson Six-Step Rebuild**
Curriculum source: `TRACK01_CATALOG_METADATA_V2.md`
Output contract: `LESSON_OUTPUT_CONTRACT_V1.md`

## 1. Lesson identity

ID: **T1-07**
Type: **CONCEPT**
Primary Knowledge Point: **Token / Probability Generation**
Supporting Knowledge: **Context Window intuition**
Prerequisite: **T1-06**
Planned Gate: **CHECK**

## 2. Learner Question

为什么我把差不多的问题问同一个 AI 两次，答案可能不完全一样？这种变化是不是说明 AI 不稳定、不可靠，还是生成式 AI 本来就这样工作？

## 3. Inherited Capability / Context

学习者已经能够：

- 判断任务是否适合 AI；
- 把任务说清楚并提供必要 Context；
- 通过 Iteration 改进结果；
- 判断什么时候必须核验；
- 区分 Model 与完整 AI Product；
- 理解当前使用模型产生输出属于 Inference。

本课不重新教学 Prompt / Context / Iteration / Reliability，也不重新解释 Model vs AI Product。

## 4. Current Learner Job

面对同一个生成任务的多次不同输出，学习者需要判断：

1. 为什么答案可能变化；
2. 哪些变化属于正常的生成机制；
3. 怎样通过更清楚的上下文、要求和约束减少不必要的波动；
4. 哪些任务仍然不能依赖“多问几次得到相似答案”来代替核验。

## 5. New Capability

完成本课后，学习者能够：

- 用直观语言解释 **Token（词元）** 是模型生成内容时逐步处理 / 产生的基本单位；
- 理解模型不是从数据库里取出一条固定完整答案，而是在当前输入与上下文下，逐步选择更可能继续出现的 Token；
- 理解“概率生成”意味着同一任务可能产生多个合理但不完全相同的表达；
- 区分“正常表达波动”和“事实错误 / 需要核验”；
- 在需要稳定输出时，主动补充上下文、格式、范围、示例或明确约束。

## 6. Core Rule

Beginner 层固定使用以下判断：

> **生成式 AI 不是先找到一条完整固定答案再原样返回，而是在当前输入和上下文下，一步一步生成后续 Token。每一步都有多个可能的继续方向，因此同一个任务可以产生不同但都合理的表达。**

管理波动的最低行动原则：

> **想让结果更稳定，不是要求 AI“永远一模一样”，而是把任务、上下文、边界和输出要求说得更明确，并对重要事实继续核验。**

## 7. Minimum Concept Map

本课只建立以下最小结构：

```text
Current Input + Context
        ↓
Model Inference
        ↓
possible next Tokens
        ↓
probability-weighted continuation
        ↓
next Token
        ↓
repeat
        ↓
complete response
```

只建立三个直觉：

1. **Token**：生成过程中的基本文本单位，不要求学习者掌握 tokenizer 细节。
2. **Probability**：每一步存在多个可能继续方向，不是只有唯一固定答案。
3. **Context affects probability**：当前输入、上下文和约束会改变后续生成倾向。

Context Window 在本课只作为 supporting intuition：

> 模型当前只能基于这次实际可见的上下文继续生成；“能看到多少”存在容量边界，但具体容量、截断策略与工程治理不在本课展开。

## 8. Common Misconceptions

本课需要纠正：

1. **“同一个问题应该永远得到一模一样的答案。”**
   不对。生成式任务可以有多个合理表达。

2. **“答案变化就说明模型坏了或在乱猜。”**
   不对。变化本身可以来自正常概率生成；是否可靠仍要看内容是否满足任务与事实要求。

3. **“模型是在数据库里找到一段最匹配文字然后复制出来。”**
   不对。基础生成机制是根据当前上下文逐步生成。

4. **“多问几次，如果答案差不多，就等于事实已经验证。”**
   不对。重复生成不能替代外部证据和事实核验。

5. **“把 Prompt 写得更严格，就能保证任何时候完全一致。”**
   不对。更清楚的约束可以减少不必要波动，但不等于把生成式模型变成绝对确定系统。

## 9. Six-step lesson intent

### Step 1 — EXPLAIN

从一个不需要业务背景就能理解的常见现象进入，并把现象先演出来：

> 你把同一个任务连续交给 AI 两次。第一次，它给出一种写法；第二次，内容意思差不多，但用词和句子顺序不一样。

让学习者自然产生疑问：

> “我明明给的是同一个任务，为什么 AI 两次给出的答案不完全一样？是不是其中一次错了？”

先直接回答：

> 其实，不一定。

只补理解答案所需的最少机制解释：

- 生成式 AI 不是从一个固定答案里直接复制内容；
- 它会根据当前输入，一步一步生成后续词元（Token）；
- 词元（Token）是逐步处理和生成内容的基本单位之一；
- 概率（Probability）可以先理解为：下一步通常存在多个可能继续方向；
- 所以，同一个开放任务可能出现不同但都合理的表达。

最后把判断重点收束清楚：

> 真正需要关注的，不是“两次是不是每个字都一样？”，而是“关键事实、要求和结果有没有发生不该发生的变化？”

具体哪些变化可以接受、哪些事实和边界必须稳定，再放到 Step 2 的完整案例中展开。

### Step 2 — EXAMPLE

使用同一个具体业务场景：

> “根据一份服务信息，为第一次了解这项服务的普通用户写一段简短介绍。”

两次结果用词、句式和信息顺序不同，但服务时间、首次咨询免费和原始服务内容都保持一致。

Before → Key Change → After：

- **Before**：看到两次文字不同，就认为结果不稳定，继续重新生成；
- **Key Change**：先检查时间、数字、服务范围和其他明确事实有没有变化；
- **After**：允许不影响任务结果的自然表达变化；只有关键事实漂移时，才补充更明确的事实边界和输出要求。

这一部让学习者直接看懂：

> 不追求每个字都一样，真正要稳定的是关键事实和任务边界。

### Step 3 — CHECK

保持三题 Mastery Sequence。

#### Check 1 — SINGLE_CHOICE / BEST_JUDGMENT

场景：

同一份服务信息，两次生成的介绍措辞和顺序不同，但都保留原始事实并满足任务要求。最合理的判断是什么？

正确判断：

> 两次都可能合理。生成式模型允许多个符合当前要求的表达。

#### Check 2 — TRUE_FALSE / MISCONCEPTION

判断：

> “同一个事实问题连续问三次都得到相似答案，就可以当成已经核验。”

正确答案：**False**

反馈强调：

> 生成结果彼此一致，不等于获得了外部证据。

#### Check 3 — MULTI_SELECT / BOUNDARY_CONDITIONS

仍然沿用 Step 2 的同一份服务介绍，只检查已经教过的边界：

- 只是换一种说法，但事实含义不变 → 可以接受；
- 只是调整信息顺序，但内容完整 → 可以接受；
- 把明确服务时间改成其他时间 → 需要处理；
- 漏掉“首次咨询免费”这一明确事实 → 需要处理。

这道题不再额外考新的 Prompt / Context / Structure 知识，避免 Check 超出 Step 1–2 已教学内容。

### Step 4 — PRACTICE

沿用 Step 2 的业务场景，让学习者亲手组织一份完整、可直接运行的 AI 任务。

练习字段由这次任务真正需要的信息决定，当前拆为：

1. **任务和原始信息**：写清 AI 要完成什么，并给足它完成任务所需的真实信息；
2. **必须保持的事实和边界**：写清哪些事实必须保留、哪些内容不能自行新增或改变；
3. **输出和比较要求**：写清长度、表达方式、输出形式，以及使用完全相同提示词运行两次进行比较的要求。

三个字段按顺序组合后，必须已经是一份逻辑完整、描述准确、无需补充说明就能直接交给 AI 运行的提示词。

学员完成后：

1. 使用“检查我的结果”检查任务是否完整；
2. 点击“复制我的提示词”；
3. 在自己常用的 AI 中用完全相同的提示词运行两次；
4. 比较两次表达变化，同时检查关键事实是否保持一致。

这一步的 AI 负责真正执行任务并给出结果，不负责批改学员答案。

Reference Fill 提供每个字段的标准直接值，按字段顺序组合后就是完整标准提示词。

Reference Answer 是同一份标准提示词的纯正文：**不带“任务和原始信息”“必须保持的事实和边界”“输出和比较要求”等字段主标题**，页面展示与“复制参考答案”都直接使用这份可运行正文。

本课 Practice 不进入参数调优。

### Step 5 — REVIEW

收束成两个可以直接带走的判断：

Review 固定回答两个问题，卡片数量不做额外限制：

- **AI适合做什么**：根据同一个开放任务生成不同但合理的表达候选；在明确事实边界后生成可比较结果，帮助观察哪些内容稳定、哪些内容漂移。
- **AI不应该替你做什么**：不要替你决定“表达不同就等于错误”；也不要把多次相似回答当成事实证据，重要事实仍需要独立核验。

### Step 6 — CAPABILITY

学习者应能明确回答：

- **我现在会做什么？**
  我能解释为什么同一个生成任务可以出现不同但合理的表达。

- **我怎样知道自己会了？**
  我能先检查关键内容有没有变化，再判断是否需要处理。

- **遇到什么情况，我应该想到这节课？**
  当你用同一份或非常接近的任务重新生成，发现两次结果不完全一样；或者发现关键事实、数字和任务边界开始出现波动时。

- **下一步能做什么？**
  当关键内容不稳定时，我能写出一条明确、可检查的稳定要求；下一课再继续理解当前对话、历史记录与长期 Memory 的区别。

## 10. Next Reuse

T1-08 可继承：

1. 学习者知道当前回答依赖模型当前实际可见的输入 / Context；
2. 学习者知道模型是在 Inference 中逐步生成结果；
3. 学习者不会把输出变化自动解释成“AI 记忆改变了”。

T1-08 再正式教学 Conversation History / Memory。

本课不为 T1-08 强制生产 Artifact。

## 11. Anti-repeat / Deferred

本课明确不重新教授：

- Prompt 基础与 Task Instruction（T1-02）；
- Minimum Sufficient Context（T1-03）；
- Iteration；
- Reliability / Verification（T1-05）；
- Model vs AI Product / Training / Inference（T1-06）。

本课明确不展开：

- tokenizer / BPE / subword 算法；
- logits；
- softmax 公式；
- Temperature；
- Top-p / Top-k；
- Seed；
- Sampling algorithm；
- Transformer / Attention / Parameters；
- Context Window 具体容量、截断策略与 Context Engineering；
- Conversation History / Memory（T1-08）；
- Knowledge Base / Source of Truth（T1-09）；
- Search / RAG（T1-10）；
- API / Structured Output / Tool / MCP；
- Evaluation Engineering。

这些内容可在需要时点名，但不得升级成本课第二 Primary Knowledge Point。

## 12. Grounding Rule

正式 Draft 使用稳定机制直觉，不绑定具体 AI 产品、具体模型或具体参数值。

若 Example 使用具体产品：
- 仅作为体验案例；
- 不把当前按钮、套餐或参数面板当成课程核心知识；
- 不把某个产品是否支持 Seed / Temperature 等工程能力引入基础正文。

## 13. Human Review Checklist

进入 Course Builder 前必须确认：

- [x] Primary Knowledge Point 始终只有 Token / Probability Generation；
- [x] Token 只讲到 beginner 需要的生成单位直觉；
- [x] Probability 只讲“存在多个合理继续方向”的生成直觉；
- [x] Step 2 能让学习者看懂“不同表达不等于错误”；
- [x] Step 3 能区分正常生成变化与事实核验；
- [x] Step 4 能真正练习“管理输出波动”，而不是做术语填空；
- [x] Context Window 只作为 supporting intuition；
- [x] 不进入 Temperature / Top-p / Seed / Sampling 调参课；
- [x] 不提前教学 Conversation History / Memory；
- [x] 不重复 T1-02～T1-06；
- [x] Step 5 能形成可迁移判断；
- [x] Step 6 能形成真实可用能力。

Human Review decision: **PASS**. T1-07 Formal Brief 可以进入 Course Builder v0.2 Draft Production；本结论不代表 Draft / Runtime 已完成。
