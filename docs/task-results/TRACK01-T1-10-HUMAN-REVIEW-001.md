# TRACK01-T1-10-HUMAN-REVIEW-001 — Human Review

Status: **HUMAN_REVIEW_PASS**

Lesson: **T1-10 — 搜索（Search）与检索增强生成（RAG）**
Lesson ID: `t1-10-search-rag`
Reviewed Draft: **1.0.2-track01-t110-terminology**

## Review result

T1-10 Human Review **PASS**。

本轮按真实前台六步责任逐项审核，重点不是“结构齐不齐”，而是初学者能否真正理解：

**资料很多时，回答前先找到与当前问题相关的证据，再让 AI 基于这些证据回答。**

Human Review 过程中发现原 Draft 虽技术正确，但 Step 1 同时显式强调 Search / Retrieval / RAG / Context，存在术语密度偏高的问题。最终修订为“先看懂动作，再给动作命名”，不把 Context 当作额外核心术语要求学习者记忆。

## Six-step review

### Step 1 — EXPLAIN

PASS。

主问题自然：

**资料明明很多，为什么 AI 回答前还要先找证据？**

最终表达顺序：

1. 先让学习者理解“回答前先找到相关证据”这一动作；
2. 再说明这个找相关信息的动作属于搜索（Search）和检索（Retrieval）；
3. 最后说明“先检索证据，再让模型基于证据回答”就是RAG 的核心。

没有要求学习者先记住 Context 等额外术语。

### Step 2 — EXAMPLE

PASS。

案例使用“企业版当前退款条件”：

- 公司已有退款政策、帮助中心、合同模板、FAQ、培训资料和更新说明；
- 原来的做法：完全不查公司资料，或把全部资料一次性交给 AI；
- 调整后的做法：先找到与“企业版 + 当前退款条件”直接相关的当前政策证据，再让 AI 基于证据回答；
- 找不到关键证据时明确说明证据不足。

案例直接证明 Step 1，没有提前教授向量检索等工程机制。

### Step 3 — CHECK

PASS。

三题分别验证：

1. BEST_JUDGMENT：大量资料时最合理的回答流程；
2. MISCONCEPTION：RAG 是否等于把知识库永久写进模型；
3. BOUNDARY_CONDITIONS：哪些任务更需要先检索外部证据。

三题均只检查 Step 1–2 已教学内容，不考技术名词背诵。

### Step 4 — PRACTICE

PASS。

最小真实动作：

**把一个真实问题改成“先找证据，再回答”的任务。**

字段为：

1. 当前问题；
2. 检索范围；
3. 必须找到的证据；
4. 回答规则。

四个字段组合后形成自然、完整、可直接使用的检索任务，不包含 Embedding、Vector Search、Chunk、Top-K 等技术配置。

Reference Fill 与 Reference Answer 语义一致；Reference Answer 是纯任务正文，不重复字段标题。

本课为 CONCEPT，因此 Practice 不属于 Completion Gate，但仍保留真实练习动作。

### Step 5 — REVIEW

PASS。

本课最终留下两组互补判断：

- AI 适合先从允许使用的资料中找与当前问题真正相关的证据，再基于证据整理回答；
- AI 不应该把“检索到了内容”直接当成“已经得到可靠事实”；
- 证据不足时应明确指出缺口并继续寻找；
- AI 不应该用模型记忆、猜测或无关资料补上关键证据。

Review 没有退化成“RAG 定义复述”。

### Step 6 — CAPABILITY

PASS。

能力获得明确：

- 能判断什么时候需要先检索外部证据；
- 能说清要找什么证据；
- 能写出最小检索任务；
- 能识别“检索到资料”和“得到可靠答案”不是同一件事。

现实触发成立：

当任务涉及大量公司资料、最新政策、内部知识或必须有依据的回答时，先问：

**AI 这一次回答真的拿到了与问题相关的证据吗？**

这个触发不依赖课程编号或下一课信息，可以独立用于真实工作。

## Frontend language review

PASS。

- 标题使用搜索（Search）与检索增强生成（RAG）；RAG 使用“中文解释（缩写）”形式，即“检索增强生成（RAG）”，不展开英文全称；
- 检索（Retrieval）作为动作解释，不作为额外独立理论层；
- 不再强迫学习者显式记忆 Context；
- 不出现内部 lessonId / schema / artifact 名；
- Step 标题均使用自然中文；
- Step 4 不暴露技术参数；
- 未泄漏 Embedding / Vector Search / Vector Database / Chunk / Top-K / Reranking / Tool Use / Function Calling / MCP / Agent。

## Targeted revisions made during Human Review

1. Step 1 从“四个术语并列”改为“先理解动作，再给动作命名”。
2. 将 learner-facing 的“当前上下文”改为更自然的“这一次回答可用的信息 / 交给 AI 的证据”。
3. 将 Step 1 objective 中纯英文 Search / Retrieval / RAG 改为中文（English）表达。
4. 退款案例中的“资料都可信”改为“资料都已经准备好”，避免与 T1-09 的权威等级概念混淆。
5. Check 选项和反馈减少抽象“上下文”措辞，直接回到“证据是否先被找到并交给 AI”。
6. Draft version 已在术语可读性修正后更新为 `1.0.2-track01-t110-terminology`。
7. Validator 不再把 Context 作为 Beginner 必学术语，而验证真实动作链。

## Gate decision

**HUMAN_REVIEW_PASS**

允许进入：

`LessonSpec Registry → Runtime Definition → Runtime Provisioning → Runtime Acceptance`

Human Review PASS 不等于 AVAILABLE；正式发布仍需 Runtime Provisioning 与 authenticated Runtime Acceptance。
