# T1-10 Formal Brief v1 — 搜索（Search）与检索增强生成（RAG）

Status: **HUMAN_REVIEW_PASS**
Course: **AI 基础认知：先学会和 AI 协作**
Stage: **理解 AI 的记忆与知识**
Grounding: **TRACK01_T1_10_RESEARCH_PACKET_V1.md**
Reviewed Draft: **1.0.2-track01-t110-terminology**

## 1. Continuity first

### 上一课 T1-09 已经让学习者会什么

T1-09 已经让学习者理解：
- 知识库（Knowledge Base）里可以有很多资料；
- 事实源（Source of Truth）决定资料冲突时谁拥有最终权威；
- 价格、政策、状态等重要业务事实不能让 AI 自己猜“哪份算正式”。

### 本课只解决什么新问题

T1-10 只解决：

**当可信资料很多时，系统怎样先找到与当前问题真正相关的证据，再把证据交给 AI 回答。**

### 下一课 T1-11 将继续解决什么

T1-11 进入应用程序编程接口（API）：

**AI 产品怎样与其他系统交换信息。**

### 本课不能提前讲掉什么

不得展开：
- API 的 Request / Response；
- Tool Use / Function Calling；
- MCP；
- Agent；
- Embedding / Vector Search / Vector Database；
- Chunk / Top-K / Reranking；
- RAG 工程 Pipeline 和参数调优。

## 2. Primary Knowledge Point

学习者必须建立一个可操作的基本判断：

**当模型需要使用大量、当前或专有的外部资料回答问题时，不是把所有资料一次性交给它，而是先根据当前问题检索相关证据，再把这些证据放进当前上下文，让模型基于证据生成答案。这个“先找证据，再回答”的基本链路就是RAG 的核心直觉。**

最小链路：

```text
问题
→ 检索相关证据
→ 加入当前上下文
→ 基于证据回答
```

## 3. Main Learner Question

> 公司已经有一大堆可信资料了，AI 为什么不能直接全部读完再回答？RAG 到底多做了哪一步？

## 4. Learning Objectives

完成本课后，学习者应该能够：

1. 用 Beginner 语言解释搜索（Search）、检索（Retrieval）与RAG的关系。
2. 说清 RAG 的最小链路：Retrieval → Context → Answer。
3. 判断什么时候应该先从外部资料找证据，而不是只依赖模型原有知识或一次性塞入大量资料。
4. 理解“有 RAG”不代表答案自动正确：检索错、漏掉关键证据，结果仍可能出错。
5. 为一个真实问题写出“问题 + 应检索什么证据 + 回答约束”的最小检索任务。

## 5. Knowledge Boundary

### 本课必须教清

- 搜索（Search）：从大量外部资料中，根据当前问题找到更相关的候选信息。
- 检索（Retrieval）：把当前问题真正需要的相关信息取回来，准备交给模型使用。
- RAG：回答前先检索相关外部证据，再把证据加入当前上下文，让模型基于这些证据生成回答。
- RAG 的核心价值不是“让模型记住更多”，而是回答当前问题时临时获得更相关的外部证据。
- 当资料量很大、信息会变化、知识属于公司内部或问题必须有证据支撑时，应优先考虑先检索再回答。
- 检索质量会影响生成质量；找到无关资料、漏掉关键证据，都可能让最终回答不可靠。
- T1-09 的事实源规则继续有效：RAG 负责“找什么”，事实源负责“谁说了算”。

### 本课不展开

- Embedding
- Vector Search
- Vector Database
- Chunk / Chunking
- Top-K
- Reranking
- Hybrid Search
- Query Rewrite / Query Transformation
- Index / Indexing
- RAG Pipeline 工程实现
- API
- Tool Use
- Function Calling
- MCP
- Agent
- 模型厂商特定的 File Search / Knowledge Base 产品

## 6. Six-step Teaching Design

### Step 1 — EXPLAIN

主问题：

**资料明明很多，为什么 AI 回答前还要先“找证据”？**

最低解释：
- 模型当前回答时真正能利用的是被带进当前回答上下文的信息。
- 当资料很多时，关键不是把全部资料都塞进去，而是先找到与当前问题最相关的部分。
- RAG 的核心直觉就是：先检索相关证据，再把证据交给模型回答。
- 最小链路必须可见：问题 → Retrieval → Context → Answer。

### Step 2 — EXAMPLE

案例：客服需要回答“当前企业版退款条件是什么”。

可信资料已经很多：
- 产品帮助中心；
- 当前退款政策；
- 历史 FAQ；
- 销售培训资料；
- 合同模板；
- 产品更新说明。

错误做法：
- 把整套资料全部塞给 AI，让它自己从大量内容里找重点；
- 或完全不查资料，只凭模型原有知识回答。

调整后：
- 先用当前问题去检索“企业版 + 当前退款条件”相关证据；
- 只把命中的当前政策片段和必要上下文交给模型；
- 模型再基于这些证据回答；
- 如果检索结果没有关键政策，就不假装已经有答案。

结果：
学习者看见 RAG 多出的不是“模型重新学习”，而是**回答前的检索与上下文增强步骤**。

### Step 3 — CHECK

Mastery Sequence：

1. SINGLE_CHOICE / BEST_JUDGMENT：大量可信资料下，回答当前政策问题最合理的流程是什么。
2. TRUE_FALSE / MISCONCEPTION：RAG 是否等于把整个知识库永久记进模型。
3. MULTI_SELECT / BOUNDARY_CONDITIONS：哪些任务更适合先检索外部证据再回答。

只考 Step 1–2 已教内容。

### Step 4 — PRACTICE

最小真实动作：

**把一个真实业务问题改写成“先找什么证据，再回答什么”的检索任务。**

建议四个自然字段：
1. 当前问题
2. 检索范围
3. 必须找到的证据
4. 回答规则

四个字段组合后必须形成一条可以直接交给支持检索能力的 AI / 系统使用的任务，不写任何 Vector / Embedding 技术参数。

### Step 5 — REVIEW

固定回答：
- AI适合做什么
- AI不应该替你做什么

本课要留下的长期判断：
- AI 适合先从已经允许使用的资料里找与当前问题相关的证据，再整理成答案。
- AI 不应该因为“用了 RAG”就把任何检索结果都当成正确事实。
- 没找到关键证据时，不应该用模型自己的猜测填补证据缺口。

### Step 6 — CAPABILITY

学习者最终能力：
- 能看到一个真实问题后，判断是否需要先检索外部资料；
- 能说清要找哪类证据；
- 能区分“检索到了资料”和“已经得到可靠答案”不是一回事。

现实触发：

> 当你准备让 AI 回答一个涉及大量公司资料、最新政策、内部知识或必须引用证据的问题时，先问：“它现在到底拿到了与这个问题相关的证据吗？”

如果没有，就应该先解决检索，而不是继续修改回答措辞。

## 7. Acceptance

T1-10 Draft 必须满足：

- 标题使用搜索（Search）与检索增强生成（RAG）；RAG 使用“中文解释（缩写）”形式，即“检索增强生成（RAG）”，不展开英文全称。
- Step 1 明确出现“问题 → 检索相关证据 → 加入当前上下文 → 基于证据回答”的最小链路。
- Step 2 必须让学习者看见“不检索 / 全量塞资料”与“先检索相关证据”的真实差异。
- Step 3 只考 Step 1–2 已教内容。
- Step 4 不出现 Embedding / Vector / Chunk / Top-K / Reranking 参数。
- Step 5 同时回答“AI适合做什么 / AI不应该替你做什么”。
- Step 6 触发情境必须脱离课程编排仍然成立。
- 必须明确 RAG ≠ 永久记忆、RAG ≠ 自动正确、RAG ≠ 整个知识库塞进 Prompt。
- 不提前教授 API / Tool Use / Function Calling / MCP / Agent。
