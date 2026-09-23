# T1-10 Research Packet v1 — 搜索（Search）与检索增强生成（RAG）

Status: **REVIEWED_KNOWLEDGE_PACKET**
Course: **AI 基础认知：先学会和 AI 协作**
Canonical lesson: **T1-10**
Freshness: **HIGH**

## 1. Research purpose

本 Research Packet 只为 Beginner 课程 T1-10 提供高层、可迁移、厂商无关的知识 grounding。

本课不负责教授 RAG 工程实现，也不把某一家产品架构当成通用定义。

## 2. Cross-source consensus

Google Cloud、Microsoft Learn 与 AWS 当前官方资料在 Beginner 所需的高层结构上保持一致：

1. 模型仅靠预训练知识并不总能获得当前、专有或任务所需的外部信息。
2. 检索（Retrieval）先根据用户问题从外部资料中找到相关内容。
3. 被找到的相关内容作为额外上下文（Context）提供给模型。
4. 模型再基于“问题 + 检索到的上下文”生成回答。
5. RAG 的价值来自外部证据 grounding，而不是重新训练模型。
6. 检索质量本身很重要；如果找到的是不相关或错误内容，生成结果仍可能偏题或错误。

因此本课可以用最小链路表达：

```text
问题
→ 检索相关证据
→ 把证据加入当前上下文
→ 基于证据生成回答
```

## 3. Beginner-safe definitions

### 搜索（Search）

面向学习者的直观定义：

**从大量外部资料里，根据当前问题找到最相关的候选信息。**

本课不区分 keyword search / semantic search / hybrid search 的工程差异。

### 检索（Retrieval）

面向学习者的直观定义：

**把当前问题真正需要的那部分信息取回来，准备交给模型使用。**

Search 与 Retrieval 在 Beginner 层可以连在同一动作链中理解；不要在本课制造不必要的术语差异。

### RAG

面向学习者的直观定义：

**模型回答前，系统先检索与当前问题相关的外部证据，再把这些证据作为当前上下文交给模型生成回答。**

RAG 不等于“一个更聪明的模型”，也不等于“把整个知识库塞进 Prompt”。

## 4. Important boundary

T1-09 已经解决：
- 哪些资料可用；
- 哪个来源拥有最终权威；
- 资料冲突时以谁为准。

T1-10 只继续解决：

**可信资料很多时，怎样先把与当前问题相关的证据找出来，再交给 AI 回答。**

本课不重新教授 Source of Truth，也不把“找到相关资料”和“资料本身是否权威”混成同一个问题。

## 5. Reliability boundary

RAG 可以帮助模型使用更新、专有或任务相关的信息，但不能保证结果自动正确。

最低要让学习者知道：
- 找错资料，回答仍可能错；
- 没找到关键证据，回答可能不完整；
- 检索到的资料仍要服从 T1-09 已定义的事实源与冲突规则；
- 最终高风险事实仍可能需要 T1-05 的核验。

## 6. Deferred engineering terms

本课不展开：
- 嵌入（Embedding）
- 向量搜索（Vector Search）
- 向量数据库（Vector Database）
- 分块（Chunk / Chunking）
- Top-K
- Reranking
- Hybrid Search
- Query Rewrite / Query Transformation
- Index / Indexing
- RAG Pipeline
- API
- Tool Use
- MCP
- Agent

这些内容属于后续更具体的技术理解或 Technical Track。

## 7. Approved research sources

- Google Cloud — What is Retrieval-Augmented Generation (RAG)?
- Google Cloud Generative AI Glossary — retrieval-augmented generation
- Microsoft Learn — Introduction to retrieval-augmented generation concepts
- Microsoft Foundry — RAG evaluators / document retrieval
- AWS Prescriptive Guidance — Understanding Retrieval Augmented Generation

## 8. Course-builder grounding summary

允许进入 T1-10 Draft 的核心事实只有：

- RAG 使用外部检索结果来增强当前生成上下文。
- 最小概念链是 Retrieval → Context → Answer。
- RAG 适用于模型需要当前、专有或大量外部资料中的相关信息时。
- RAG 不需要学习者先理解 Embedding、Vector Search 或 Vector Database。
- 检索质量直接影响最终回答质量。
- Source of Truth 属于 T1-09；Verification 属于 T1-05；两者只作为已有能力被调用，不重新展开。
