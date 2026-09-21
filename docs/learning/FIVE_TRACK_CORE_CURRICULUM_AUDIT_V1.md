# Five-Track Core Curriculum & Knowledge Point Audit v1

Status: **COMPLETE_AUDITED_V1**  
Task: **CURRICULUM-SIX-STEP-AUDIT-001 — Five-Track Core Curriculum & Knowledge Point Audit**  
Scope: **Track 01–05 Core Curriculum**

## 1. Audit decision

OPC 五大长期板块继续保持不变，但课程目录不再按“专业名词 = 一节课”生成。

固定设计链：

```text
Capability Map
→ Knowledge Map
→ Six-step Knowledge Point Audit
→ Core Course Directory
→ Formal Brief
→ Course Builder
```

每个候选知识点只允许：KEEP / MERGE / SPLIT / SUPPORTING_KNOWLEDGE / DEFER / REMOVE。

Fact-drift correction: `FOUNDATION_KNOWLEDGE_MAP_V1.md` historically states “28 Lesson Brief”, but the actual candidate tables enumerate 32 IDs: F1–F5 each 4, F6–F7 each 6. This audit treats the enumerated 32 candidates as authoritative input and records the old 28 count as a superseded planning-count error.

独立 Lesson 必须同时拥有：
1. 一个真实学习者问题；
2. 一个不可由相邻课替代的核心规律；
3. 可通过真实判断验证的理解；
4. 一个最小可执行动作 / 产物；
5. 2–4 个可复用判断；
6. 一个能被后续继续调用的新能力。

## 2. Five-track capability map

| Track | Exit capability | Core artifact |
| --- | --- | --- |
| 01 AI 基础认知 | 能正确与 AI 协作、理解关键 AI 概念、判断结果与边界 | 一个经过任务说明、Context、迭代与核验的真实产物 |
| 02 AI 工作应用 | 能把基础协作方法用于研究、写作、文件、数据与知识工作 | 一组可交付工作产物 |
| 03 推广运营与业务增长 | 能把工作产物转成内容、流量、线索、销售与客服机会 | 内容资产、Lead、跟进 / 客服方案、运营复盘 |
| 04 AI Workflow 与自动化 | 能把已验证方法设计成可重复、可控、可评估的流程 | Workflow 方案 / Prototype |
| 05 FDE / AI 解决方案落地 | 能发现真实业务问题、设计方案、验证价值并推动采用 | AI Solution Package |

## 3. Track 01 — AI 基础认知

### 3.1 Audited core directory

| ID | Core lesson | Primary knowledge | Decision |
| --- | --- | --- | --- |
| T1-01 | AI 能帮什么，不能帮什么 | Everyday AI use cases + product capability map | KEEP / MERGE F1-01 + F1-04 部分 |
| T1-02 | Prompt：把任务说清楚 | Input quality + Prompt foundations | KEEP / MERGE F1-02 → F2-01 |
| T1-03 | Context：给 AI 足够但不过量的信息 | Task Context + context limit intuition | KEEP / MERGE F3-04 为 supporting |
| T1-04 | Iteration：把第一版结果改到可用 | Iteration / clarification | KEEP |
| T1-05 | 结果检查：什么时候必须核实 | Hallucination intuition + basic reliability judgment | KEEP / MERGE F1-03 + F2-04 + F7-05 basic |
| T1-06 | 模型与 AI 产品：AI 软件背后是什么 | LLM / Model vs Product + Training/Inference intuition | KEEP / MERGE F3-02 |
| T1-07 | 生成机制：为什么答案会变化 | Token / probability generation intuition | KEEP |
| T1-08 | 对话、Memory 与知识库：AI 到底“记住”什么 | History / Memory / Knowledge Base / Source of Truth | KEEP / MERGE F4-01 + F4-02 |
| T1-09 | RAG：AI 怎样先找资料再回答 | Search / RAG | KEEP |
| T1-10 | API 与结构化数据：AI 怎样接入系统 | API + Structured Output / Schema | KEEP / MERGE F5-02 |
| T1-11 | Tool Use：AI 怎样调用外部能力 | Function Calling / Tool | KEEP |
| T1-12 | MCP：为什么需要统一连接工具与资源 | MCP | KEEP |
| T1-13 | Skill：把可复用方法交给 AI | Skill vs Prompt / Tool | KEEP |
| T1-14 | Workflow：把一次任务变成可重复流程 | Workflow + automation intuition | KEEP |
| T1-15 | Agent：什么时候需要动态决策循环 | Agent + Workflow boundary | KEEP / MERGE F6-05 |
| T1-16 | 多模态与操作能力：AI 不只是文字聊天 | Multimodal + Coding / Browser / Computer Use capability map | KEEP / MERGE F7-01 + F7-02 + F7-03 |
| T1-17 | 隐私、权限与高风险动作 | Privacy / Security / Permissions + HITL + high-impact boundary | KEEP / MERGE F6-06 + F7-04 + F7-06 |

### 3.2 Six-step knowledge-point audit

| Lesson | 1 Why | 2 Core rule | 3 Check | 4 Minimum action | 5 Reusable review | 6 Capability |
| --- | --- | --- | --- | --- | --- | --- |
| T1-01 | 不知道 AI 适合做什么会误用 | 任务类型与产品能力要匹配 | 判断任务是否适合 AI / 需要哪类能力 | 给自己的 3 个任务分类 | 适合协助 / 需核验 / 不应交给 AI | 能选择合适 AI 使用场景 |
| T1-02 | 模糊要求直接导致差结果 | 目标、对象、要求、输出要清楚 | 比较模糊与清晰任务说明 | 重写一个真实 Prompt | 目标清楚、信息够、输出明确 | 能把模糊需求变成可执行任务 |
| T1-03 | AI 不知道未提供的业务背景 | Context 只放当前任务必要信息 | 判断缺什么 / 什么不该塞入 | 组一个最小 Context Pack | Must Know / Nice to Know / Do Not Load | 能为任务准备足够上下文 |
| T1-04 | 第一版通常不是最终版 | 指出偏差、补信息、给标准、让 AI 澄清 | 判断下一轮应改什么 | 对真实初稿做 2 轮迭代 | 偏差、补充、示例、澄清 | 能把 AI 初稿迭代到可用 |
| T1-05 | AI 会自信地给出错误内容 | 事实性、时效性、风险决定核验强度 | 判断哪些结果必须查证 | 标出一份结果中的核验点 | 事实 / 来源 / 日期 / 风险 | 能决定结果何时可用、何时必须核验 |
| T1-06 | 不理解模型会把产品功能混成一件事 | Model 是核心生成能力，产品还叠加搜索、文件、工具等 | 区分 Model 与 Product 能力 | 拆解一个常用 AI 产品 | 模型、产品能力、训练、推理 | 能建立基础 AI 世界模型 |
| T1-07 | 同问不同答不是“随机坏掉” | 模型按上下文逐步概率生成 | 判断哪些变化来自生成机制 | 比较同一任务多次输出 | Token、概率、非固定答案、约束 | 能解释并管理输出波动 |
| T1-08 | Memory、聊天记录、知识库常被混淆 | 临时上下文、长期记忆、权威资料职责不同 | 为不同信息选择正确归属 | 给一个业务信息集分类 | History / Memory / KB / Source of Truth | 能决定信息应该放在哪里 |
| T1-09 | 仅靠模型内部知识不适合最新或私有事实 | Retrieval → Context → Answer | 判断何时需要 Search/RAG | 为一个问答任务设计资料检索链 | 找资料、带证据、再回答、无证据不猜 | 能判断并解释 RAG 使用场景 |
| T1-10 | 系统不能只靠自然语言随意交换信息 | API 负责交换，Schema 负责约束数据 | 判断文本回答与结构化输出的差异 | 画一个 request → response 数据例 | 输入、输出、字段、验证 | 能理解 AI 如何接入业务系统 |
| T1-11 | AI 要执行动作必须通过外部能力 | 模型提出调用，Tool 执行受控动作 | 判断“回答”还是“调用工具” | 为任务列出需要的 Tool | 能力、参数、结果、权限 | 能为任务识别外部工具能力 |
| T1-12 | 工具越来越多时逐个私有接法不可维护 | MCP 提供统一的连接协议与发现方式 | 判断 MCP 与直接 API / Tool 的关系 | 画一个 Host–MCP–Tool/Resource 连接图 | 协议、能力发现、资源、权限边界 | 能解释 MCP 何时有价值 |
| T1-13 | 好方法反复复制 Prompt 难维护 | Skill 封装可复用语义方法，但不拥有核心状态 | 判断 Prompt / Skill / Tool 的职责 | 把一个重复方法写成 Skill Brief | 单一职责、输入、输出、禁止动作 | 能识别什么值得沉淀成 Skill |
| T1-14 | 手工重复流程无法稳定复用 | Workflow 固定输入、步骤、检查点与输出 | 判断哪些步骤可固化 | 把熟悉任务拆成最小 Workflow | 输入、步骤、检查、异常、输出 | 能把已验证方法设计成重复流程 |
| T1-15 | 有些任务不能事先写死每一步 | Agent 在目标、状态、观察、决策、动作、停止间循环 | 判断 Workflow 或 Agent | 为真实任务选择固定流程或动态决策 | Goal / State / Observe / Decide / Act / Stop | 能判断何时需要 Agent |
| T1-16 | 现代 AI 能读图、听音、生成媒体并操作环境 | 模态与操作能力按任务输入 / 输出选择 | 为任务选择文本、图像、语音、视频或操作能力 | 设计一个多模态任务 | 输入模态、输出模态、操作能力、限制 | 能为任务选择合适现代 AI 能力 |
| T1-17 | 把敏感数据和高风险动作交给 AI 会产生真实损失 | 权限最小化，高风险动作保留人 / Core authority | 判断哪些动作必须人工确认 | 给一个流程标出风险与审批点 | 数据敏感度、权限、可逆性、人工确认 | 能识别 AI 使用安全边界 |

### 3.3 Foundation legacy 28-candidate disposition

| Legacy | Decision | New home |
| --- | --- | --- |
| F1-01 | KEEP | T1-01 |
| F1-02 | MERGE | T1-02 |
| F1-03 | MERGE | T1-05 |
| F1-04 | MERGE | T1-01 / T1-06 |
| F2-01 | KEEP | T1-02 |
| F2-02 | KEEP | T1-03 |
| F2-03 | KEEP | T1-04 |
| F2-04 | KEEP | T1-05 |
| F3-01 | KEEP | T1-06 |
| F3-02 | MERGE | T1-06 |
| F3-03 | KEEP | T1-07 |
| F3-04 | SUPPORTING_KNOWLEDGE | T1-03 / T1-07 |
| F4-01 | KEEP | T1-08 |
| F4-02 | MERGE | T1-08 |
| F4-03 | KEEP | T1-09 |
| F4-04 | DEFER | Technical RAG / Retrieval |
| F5-01 | KEEP | T1-10 |
| F5-02 | MERGE | T1-10 |
| F5-03 | KEEP | T1-11 |
| F5-04 | KEEP | T1-12 |
| F6-01 | KEEP | T1-13 |
| F6-02 | KEEP | T1-14 |
| F6-03 | SUPPORTING_KNOWLEDGE | T1-14 / Track 04 |
| F6-04 | KEEP | T1-15 |
| F6-05 | MERGE | T1-15 |
| F6-06 | MERGE | T1-17 / Track 04 |
| F7-01 | KEEP | T1-16 |
| F7-02 | MERGE | T1-16 |
| F7-03 | MERGE | T1-16 / T1-11 |
| F7-04 | KEEP | T1-17 |
| F7-05 | MERGE | T1-05 / Track 04 Evaluation |
| F7-06 | MERGE | T1-17 |

Result: the legacy map text claimed 28 candidates, but its actual F1-01～F7-06 tables enumerate **32 candidates (4+4+4+4+4+6+6)**. This audit uses the enumerated source items and reduces those 32 candidates to **17 Track-01 core lessons**. Existing Continuity Trial pages remain valid pedagogy evidence, but their old lesson IDs are not automatically canonical production identities after this audit.

## 4. Track 02 — AI 工作应用

| ID | Core lesson | Primary knowledge | Six-step minimum proof |
| --- | --- | --- | --- |
| T2-01 | AI 搜索与证据研究 | Evidence-first research | 对真实问题搜集来源、日期、适用范围并形成 evidence note |
| T2-02 | 多来源比较与冲突处理 | Source comparison / conflict | 对两到三份资料识别一致、冲突与不确定项 |
| T2-03 | 从资料到专业写作 | Grounded writing | 基于给定资料完成邮件 / 报告 / 方案，禁止凭空补事实 |
| T2-04 | 长文档与多文件阅读 | Document synthesis | 从 PDF / 多文件提取事实、差异、结论与引用位置 |
| T2-05 | 会议记录到行动清单 | Action extraction | 产出 Decision / Action / Owner / Deadline |
| T2-06 | 数据与表格分析 | Metric / data reasoning | 定义口径、清洗、分析、图表解释并复核关键数字 |
| T2-07 | 个人知识与 Source of Truth | Knowledge organization | 将临时资料归档成可检索、可追溯的长期知识 |
| T2-08 | 重复工作沉淀成可复用方法 | Reusable work method | 把重复任务整理成模板 / Skill Brief，并判断是否需要 Workflow |

Audit notes:
- “邮件”“报告”“改写”“压缩”不是四节独立核心课，统一归入 T2-03 的写作能力，再由 Practice 变体承载不同产物。
- “PDF”“会议记录”“合同提取”“PPT 规划”不是按文件格式拆课；只有拥有不同判断方法时才独立。
- 公式 / SQL / Python 为 T2-06 的辅助生成能力，不要求普通路径先学编程。

## 5. Track 03 — AI 推广运营与业务增长

| ID | Core lesson | Primary knowledge | Six-step minimum proof |
| --- | --- | --- | --- |
| T3-01 | 内容选题与 Research | Audience/problem-led topic selection | 从用户问题和证据形成可验证选题 |
| T3-02 | 内容生产与多模态素材 | Content production system | 把核心观点转成文字 / 图片 / 视频素材包 |
| T3-03 | 多平台适配、分发与内容复用 | Distribution / repurposing | 将一份核心内容改成不同渠道版本并保留核心信息 |
| T3-04 | 推广与获客流程 | Acquisition funnel | 从目标用户 → 信息 → CTA → Landing / 私域 → Lead 设计获客链 |
| T3-05 | 销售跟进与 Lead 运营 | Sales follow-up | 汇总客户背景、判断优先级、生成待确认跟进并记录下一步 |
| T3-06 | AI 客服与人工升级 | Customer service boundary | 基于知识源生成回复，处理无证据、投诉、高风险与转人工 |
| T3-07 | 运营分析与下一步行动 | Operations review | 从内容 / 活动 / 销售 / 客服数据形成异常、洞察与行动 |

Audit notes:
- 微信、公众号、小程序、抖音、小红书、B站、视频号、阿里旺旺、企业微信、飞书等全部 **DEFER 为 Channel Practice**，不进入稳定核心目录。
- “写广告”“写私信”“写客服话术”都只是场景 Practice，不能替代完整业务链路。

## 6. Track 04 — AI Workflow 与自动化

| ID | Core lesson | Primary knowledge | Six-step minimum proof |
| --- | --- | --- | --- |
| T4-01 | Task Decomposition 与最小闭环 | Workflow decomposition | 把已人工跑通任务拆成 Input / Process / Decision / Output / Check |
| T4-02 | Context Engineering | Context governance | 为不同节点定义 Must Know / Nice to Know / Do Not Load / Canonical Source |
| T4-03 | Code / Skill / Tool / Workflow / Agent 职责架构 | Responsibility architecture | 对真实需求分配确定性逻辑、语义智能、外部能力和动态决策 |
| T4-04 | Integration 与结构化数据流 | API / Tool / MCP integration | 画出输入输出、Schema、Tool/MCP、权限与数据流 |
| T4-05 | Automation、HITL 与 Failure Handling | Controlled automation | 标出可逆性、审批、超时、回退、停止与人工确认 |
| T4-06 | Evaluation 与 Regression | System evaluation | 建 Baseline / Test Set，比较质量、效率、稳定性、失败案例与人工修改 |
| T4-07 | Workflow Project | Integrated workflow design | 交付一个含目标、触发、节点、分工、人工确认、异常、指标的真实 Workflow |

T4-03 的固定判断继续保持：
```text
确定性逻辑 → Code
语义理解 / 生成 → Skill / Model
外部能力 → Tool
受控多步流程 → Workflow
动态决策循环 → Agent
最终写库 / 权限 / 发布 / 状态 → Core System
```

## 7. Track 05 — FDE / AI 解决方案落地

| ID | Core lesson | Primary knowledge | Six-step minimum proof |
| --- | --- | --- | --- |
| T5-01 | 发现值得解决的业务问题 | Problem Discovery | 观察流程、角色、重复工作、错误成本、信息断点并筛问题 |
| T5-02 | Problem Definition 与价值假设 | Problem / Value | 写出 Current State / Target State / Constraints / Risks / Metrics |
| T5-03 | AI Solution Design | Solution architecture | 设计 AI / Code / Skill / Workflow / Agent / Data / Human 分工 |
| T5-04 | Prototype 与 Pilot | MVD / Pilot | 用最小真实场景、真实用户和小样本快速验证 |
| T5-05 | 价值 Evaluation | Business evaluation | 比较时间、成本、质量、人工修改、错误与业务指标 |
| T5-06 | Adoption 与 Change Management | Adoption | 识别 Trust / Friction / Training / Feedback / Owner 并制定采用计划 |
| T5-07 | FDE Capstone | End-to-end solution delivery | 交付 Problem → Workflow → Prototype → Pilot → Evaluation → Adoption Plan |

Audit decision: Track 05 原 7 个 Module 均 **KEEP**。它们不是术语拆课，而是完整解决方案生命周期中的七个不同可执行能力。

## 8. Supporting / deferred knowledge

以下内容重要，但不阻塞普通核心路径：

- Embedding / Vector Search / Chunking / Vector DB tuning → Technical RAG；
- SDK / Model API 编程 → Technical Implementation；
- JSON / Schema 代码细节 → Technical Implementation；
- MCP Server / Client 搭建 → Technical Implementation；
- Agent Runtime / orchestration framework → Technical Implementation；
- Python / SQL / automation code → 按需 Technical Practice；
- 具体平台按钮与渠道操作 → Channel Practice；
- 具体图像 / 视频工具教程 → Media Practice；
- Fine-tuning / model training engineering → Advanced Model Track。

## 9. Production consequences

1. `FOUNDATION_KNOWLEDGE_MAP_V1.md` 保留为 pre-audit candidate map，不再是正式 Course Directory。
2. 本文件成为五大板块课程粒度的 **canonical audit baseline**。
3. 旧 F1/F2 Continuity Trial 继续作为 Six-step UX / pedagogy evidence，不自动代表审计后正式 Lesson identity。
4. 审计完成后仍禁止直接批量生成全部课程；下一步先对 Track 01 做 canonical ID / Formal Brief realignment。
5. 正式 Course Builder 只能消费已通过本审计且有 Formal Brief 的知识点。
6. 每次 Production Batch 仍建议 3–5 节，并继续要求 Continuity + Six-step 双 Gate。

## 10. Next task

**CURRICULUM-AUDIT-REALIGN-001 — Track 01 Canonical IDs & Formal Brief Realignment**

目标：
- 将旧 F1/F2/F3…候选 identity 映射到 T1-01～T1-17；
- 先完成 T1-01～T1-05 的 Formal Brief；
- 明确哪些现有 Continuity Trial 内容可迁移、哪些只保留为参考；
- 不修改 Unified Lesson Shell；
- 不批量生成 T1-06+ 正式内容；
- 完成后再启动第一批审计后正式课程生产。
