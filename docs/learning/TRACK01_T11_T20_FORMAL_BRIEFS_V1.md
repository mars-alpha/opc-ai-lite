# Track 01 T1-11～T1-20 Formal Brief Batch v1

Status: **FORMAL_BRIEF_APPROVED / RUNTIME_AVAILABLE**
Course: **AI 基础认知：先学会和 AI 协作**
Scope: **T1-11～T1-20**
UI boundary: **USE_EXISTING_UNIFIED_LESSON_SHELL_ONLY**
CSS boundary: **NO_CSS_CHANGE**
Deferred ledger: **docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md**

## 1. Batch production rule

本 Batch 一次性启动 T1-11～T1-20，但不代表十节课一次性进入 Runtime。

固定顺序：

```text
Frozen Catalog
→ T1-11～T1-20 Formal Brief Batch
→ Current Course Builder Skill
→ Deterministic Validation
→ Human Review
→ 分批进入 LessonSpec / Runtime
```

当前执行结果：本 Formal Brief Batch 已完成后续 Course Production Workflow、Deterministic Validation 与 10/10 Human Review；T1-11～T1-20 随后已完成 LessonSpec Registry、Runtime Provisioning 与 Runtime Acceptance，并全部进入 AVAILABLE。当前 Runtime 状态以 `docs/CURRENT_SYSTEM_FACTS.md` 为唯一事实源。

强制边界：

- 不新增 UI；
- 不新增专属 Renderer；
- 不调整 CSS；
- 不为单课增加新的交互控件；
- 只使用现有 EXPLAIN / EXAMPLE / CHECK / PRACTICE / REVIEW / CAPABILITY；
- 当前 Shell 无法自然表达的知识，不通过 UI 扩展解决，而是进入 Deferred Knowledge Ledger；
- 初学主路径只讲“形成判断与最小动作”所需内容，不把工程实现细节提前塞进 Track 01。

---

## 2. Phase 4 — 理解 AI 如何连接外部世界

### T1-11 — 应用程序编程接口（API）：AI 产品怎样和其他系统交换信息

**Type:** CONCEPT
**Primary Knowledge Point:** API / Request-Response Boundary
**Prerequisite:** T1-06

**上一课连接**

T1-10 已经让学习者知道：AI 可以先检索证据再回答。T1-11 开始回答更基础的系统问题：两个软件到底怎样交换请求和结果。

**本课只解决**

> 当一个 AI 产品需要向另一个系统要数据或提交动作时，“接口”到底在解决什么问题？

**必须教清**

- 应用程序编程接口（API）是系统之间约定好的通信边界；
- 最小直觉：请求（Request）→ 接口 → 响应（Response）；
- 请求要说明“我要什么 / 给你什么输入”；
- 响应返回“结果 / 状态 / 错误”；
- API 不是 AI 专属，AI 只是其中一个调用者或被调用者；
- 接口边界意味着双方不需要知道对方内部怎么实现。

**不得展开**

HTTP 方法、状态码体系、OAuth、API Key 安全细节、Rate Limit、Webhook、SDK、REST/GraphQL、网络协议与部署。

**六步设计**

1. EXPLAIN：为什么两个系统不能“直接互相懂”，而需要明确接口。
2. EXAMPLE：AI 客服向订单系统查询订单状态；对比“让 AI 猜”与“通过接口请求订单数据”。
3. CHECK：判断什么属于请求、响应和接口边界。
4. PRACTICE：把一个真实系统交互写成“请求什么 / 提供什么输入 / 希望返回什么”。
5. REVIEW：AI适合通过明确接口取得系统数据；AI不应绕过接口规则猜测系统状态。
6. CAPABILITY：看到跨系统需求时，能先找“接口边界”而不是先讨论 AI 提示词。

**下一课**

T1-12 继续解决：响应如果只是自由文本，系统怎样稳定接收。

---

### T1-12 — 结构化输出（Structured Output）与模式（Schema）：怎样让系统稳定接收 AI 结果

**Type:** APPLICATION
**Primary Knowledge Point:** Structured Output / Schema
**Prerequisite:** T1-11

**本课只解决**

> AI 给出的答案如果要交给程序继续处理，为什么不能只要求“写得清楚”，而要约定字段和结构？

**必须教清**

- 自由文本适合人读，不一定适合程序稳定处理；
- 结构化输出（Structured Output）把结果拆成明确字段；
- 模式（Schema）定义“有哪些字段、字段代表什么、基本类型/是否必填”；
- Schema 是输出契约，不保证字段里的事实本身正确；
- 最小验证：字段是否存在、格式是否符合要求、必要值是否为空。

**不得展开**

完整 JSON Schema 标准、复杂嵌套类型、正则校验、类型生成、ORM、数据库 Schema、Schema migration、代码生成框架。

**六步设计**

1. EXPLAIN：同一句自然语言答案对程序来说为什么不稳定。
2. EXAMPLE：从“客户姓名/意向/下一步”自由描述，改成固定三个字段。
3. CHECK：判断哪些要求属于结构、哪些属于内容质量。
4. PRACTICE：把一个自由文本结果改成 3～5 个自然字段及最小规则。
5. REVIEW：AI适合按结构返回结果；AI不应因为“格式正确”就被当作“事实正确”。
6. CAPABILITY：能把“给我一段答案”改成系统可接收的输出契约。

**下一课**

T1-13 继续解决：系统不仅接收结果，还希望 AI 主动调用外部能力。

---

### T1-13 — 函数调用（Function Calling）与工具使用（Tool Use）：AI 怎样调用外部能力

**Type:** CONCEPT
**Primary Knowledge Point:** Function Calling / Tool Use
**Prerequisite:** T1-11, T1-12

**本课只解决**

> 什么时候 AI 应该停止“自己回答”，转而调用一个外部工具？

**必须教清**

- 工具（Tool）是模型之外可执行的能力；
- Function Calling 是模型按约定结构提出“要调用哪个能力、给什么参数”的方式之一；
- 最小链路：理解任务 → 选择工具 → 生成参数 → 系统执行 → 把结果交回模型；
- 模型“决定调用”不等于它自己直接拥有权限；
- Tool 输入与输出需要明确边界；
- 查真实数据、执行外部动作时，应优先使用对应工具而不是让模型猜。

**不得展开**

Tool registry 工程实现、重试、超时、幂等、并发、工具选择评分、工具沙箱、权限系统实现、供应商具体 Function Calling API。

**六步设计**

1. EXPLAIN：为什么“知道答案”和“有能力执行动作”不是一回事。
2. EXAMPLE：查询实时库存；对比模型猜库存与调用库存工具。
3. CHECK：判断何时应回答、何时应调用工具。
4. PRACTICE：为一个真实任务写出“工具用途 / 必要输入 / 应返回结果 / 禁止动作”。
5. REVIEW：AI适合选择并请求工具；AI不应获得超出任务需要的权限。
6. CAPABILITY：能把“让 AI 做事”拆成模型判断 + 工具执行。

**下一课**

T1-14 继续解决：工具和资源越来越多时，怎样避免每个 AI 产品都做一套专属连接。

---

### T1-14 — 模型上下文协议（MCP）：为什么 AI 需要统一连接工具与资源

**Type:** CONCEPT
**Primary Knowledge Point:** MCP
**Prerequisite:** T1-13

**本课只解决**

> 当 AI 要接很多工具、数据和资源时，为什么会需要一套统一的连接协议？

**必须教清**

- 模型上下文协议（MCP）解决的是“AI 应用如何用较统一方式发现和连接外部资源/工具”的问题；
- 直接 API 关注两个系统如何通信，Tool 关注模型可调用的能力，MCP 关注连接这些能力与资源时的统一约定；
- MCP 不会自动让工具安全，也不会自动授予权限；
- MCP 不等于 Agent，也不等于 API 的替代品；
- Beginner 只需要理解“统一连接层”的价值。

**不得展开**

MCP transport、Server/Client SDK、stdio/SSE/HTTP transport 细节、Resources/Prompts/Tools 完整协议对象、部署拓扑、认证实现、Server 开发。

**六步设计**

1. EXPLAIN：每接一个工具都写一套专属连接为什么会越来越复杂。
2. EXAMPLE：同一个 AI 工作台需要接文件、知识库和业务工具；对比三套专属接法与统一连接约定。
3. CHECK：区分 API / Tool / MCP 的职责。
4. PRACTICE：给一个 AI 工作台列出“需要连接的资源/工具 + 为什么适合统一接入”。
5. REVIEW：AI适合通过标准连接发现能力；AI不应把“接上 MCP”理解成“自动拥有所有权限”。
6. CAPABILITY：能解释什么时候是在讨论接口、工具，什么时候是在讨论统一连接层。

**下一课**

T1-15 从“连接能力”转向“复用方法”：哪些做法值得沉淀成 Skill。

---

## 3. Phase 5 — 理解 AI 的复用与执行

### T1-15 — 技能（Skill）：把可复用的方法交给 AI

**Type:** CONCEPT
**Primary Knowledge Point:** Skill / Reusable Semantic Method
**Prerequisite:** T1-02, T1-13

**本课只解决**

> 一个反复成功的方法，什么时候值得从“每次重新告诉 AI”变成可复用 Skill？

**必须教清**

- Skill 是可复用的语义方法/能力边界，而不是任意一段长提示词；
- 一个 Skill 应有单一职责；
- 最小定义：何时使用、需要什么输入、输出什么、哪些动作禁止；
- 适合沉淀的是“反复出现且判断逻辑相对稳定的方法”；
- 不稳定、一次性、没有明确验收的做法不急着做 Skill；
- Skill 不拥有发布、权限和生产数据修改权，除非系统显式授权。

**不得展开**

Skill packaging 格式、版本发布机制、Skill marketplace、Skill-to-Skill 调用、自动评测系统、厂商特定 Skill SDK。

**六步设计**

1. EXPLAIN：为什么重复粘贴一大段方法说明不是长期复用方案。
2. EXAMPLE：反复把会议记录整理成行动项；对比每次重新解释与沉淀成单一职责 Skill。
3. CHECK：判断什么值得做 Skill，什么只是一次性任务。
4. PRACTICE：定义一个 Skill 的使用条件、输入、输出和禁止动作。
5. REVIEW：AI适合复用稳定方法；AI不应把模糊职责封装成万能 Skill。
6. CAPABILITY：能判断一个方法是否已经成熟到值得复用。

**下一课**

T1-16 继续解决：一个 Skill 只是一个能力，多个固定步骤怎样组成可重复 Workflow。

---

### T1-16 — 工作流（Workflow）与自动化（Automation）：把一次方法变成可重复流程

**Type:** APPLICATION
**Primary Knowledge Point:** Workflow / Automation
**Prerequisite:** T1-15

**本课只解决**

> 一个已经验证有效的做法，怎样拆成稳定步骤，并判断哪些步骤适合自动运行？

**必须教清**

- Workflow 是有明确顺序、输入输出和条件的步骤链；
- Automation 是让适合的步骤按规则自动执行；
- 先证明流程，再自动化；不把错误流程更快地自动执行；
- 能用普通代码/规则确定完成的步骤，优先 deterministic code；
- 需要语义理解、灵活判断的步骤再交给 AI；
- 每个关键步骤都应有清楚的输入、输出和失败边界。

**不得展开**

队列、Cron、事件总线、状态机实现、重试策略、补偿事务、幂等键、分布式调度、BPMN。

**六步设计**

1. EXPLAIN：为什么“自动化”不是先找 AI，而是先找重复流程。
2. EXAMPLE：内容发布前的资料整理→生成→检查→确认；对比全交 AI 与按职责拆节点。
3. CHECK：判断哪些节点适合规则代码、AI、人工确认。
4. PRACTICE：把一个重复任务拆成 3～6 个节点，标记输入/输出/执行者。
5. REVIEW：AI适合承担语义节点；AI不应接管本可确定执行且高风险的核心控制。
6. CAPABILITY：能画出最小 Workflow，并识别自动化候选节点。

**下一课**

T1-17 继续解决：固定 Workflow 不够时，什么时候才值得引入 Agent 的动态决策。

---

### T1-17 — 智能体（Agent）：什么时候才需要动态决策

**Type:** APPLICATION
**Primary Knowledge Point:** Agent / Workflow Boundary
**Prerequisite:** T1-13, T1-16

**本课只解决**

> 什么时候固定 Workflow 已经够用，什么时候任务真的需要 AI 在运行中观察、选择下一步并决定何时停止？

**必须教清**

- Agent 的关键不是“能调用工具”，而是运行中根据状态动态决定下一步；
- 最小循环：Goal → State → Observe → Decide → Act → Stop；
- 固定步骤可预先确定时，Workflow 通常更简单、更稳定；
- 需要根据中间结果选择下一步时，才考虑 Agent；
- Agent 必须有停止条件和权限边界；
- 动态决策越多，验证与风险控制越重要。

**不得展开**

Planning 算法、Tree Search、Reflection、Multi-Agent、Agent memory engineering、Agent framework 对比、长程自治系统。

**六步设计**

1. EXPLAIN：为什么“用了 Tool”不等于 Agent。
2. EXAMPLE：固定资料整理 Workflow vs 根据搜索结果决定继续查哪里、何时停止的研究任务。
3. CHECK：判断 Workflow / Agent 边界。
4. PRACTICE：把一个任务写成 Goal / Observe / Decide / Act / Stop 五个最小元素。
5. REVIEW：AI适合在明确边界内动态决策；AI不应在没有停止条件和权限限制下自主行动。
6. CAPABILITY：能拒绝不必要的 Agent，也能识别真正需要动态决策的任务。

**下一课**

T1-18 转向现代 AI 的输入输出能力：不同媒体怎样组合使用。

---

## 4. Phase 6 — 理解现代 AI 能力与安全边界

### T1-18 — 多模态（Multimodal）：文字、图片、语音、视频怎样一起工作

**Type:** APPLICATION
**Primary Knowledge Point:** Multimodal / Media Capabilities
**Prerequisite:** T1-06

**本课只解决**

> 同一个任务可以给 AI 文字、图片、语音或视频时，应该怎样选择最有信息价值的输入与输出方式？

**必须教清**

- 多模态（Multimodal）表示 AI 可以处理或生成不止一种信息形式；
- 模态不是越多越好，应选择最能表达任务信息的输入；
- 图片适合视觉结构，语音适合声音/口述，视频同时包含时间变化与画面；
- 多模态仍需要 Context、任务说明和结果核验；
- 模型是否支持某种媒体能力取决于具体产品/模型。

**不得展开**

OCR Pipeline、ASR/TTS 工程、视觉编码器、音视频切片、帧采样、媒体压缩、Embedding、生成模型训练。

**六步设计**

1. EXPLAIN：为什么把所有信息转成文字有时会损失关键内容。
2. EXAMPLE：门店陈列检查；对比只文字描述与图片+目标说明。
3. CHECK：为真实任务选择合适模态。
4. PRACTICE：为一个任务选择输入模态、说明原因、定义希望得到的输出。
5. REVIEW：AI适合处理对任务有价值的媒体信息；AI不应因为“看过图片/视频”就被认为完全理解真实世界。
6. CAPABILITY：能根据任务信息类型选择文本/图像/语音/视频，而不是追求“多模态越多越高级”。

**下一课**

T1-19 继续解决：AI 不只回答，还可以写代码、浏览网页甚至操作界面时，各能力边界是什么。

---

### T1-19 — 编码（Coding）、浏览器（Browser）与计算机操作（Computer Use）：AI 怎样从回答走向操作

**Type:** CONCEPT
**Primary Knowledge Point:** Coding / Browser / Computer Use Capability Map
**Prerequisite:** T1-13, T1-18

**本课只解决**

> AI “会写代码”“会浏览网页”“会操作电脑”看起来都像能做事，它们到底有什么不同？

**必须教清**

- Coding：生成、修改或运行代码来完成任务；
- Browser：读取/搜索/导航网页信息；
- Computer Use：像用户一样与图形界面交互；
- 三者可以组合，但风险和可验证性不同；
- 能用 API / 代码稳定完成时，不应默认选择脆弱的界面点击；
- 涉及外部动作时必须考虑权限与后果；
- “能操作”不等于“应该自动执行”。

**不得展开**

浏览器自动化框架、DOM/Selector、Playwright/Selenium、Sandbox 架构、代码执行隔离、桌面 RPA、Computer Use 模型内部机制。

**六步设计**

1. EXPLAIN：为什么“帮我完成这个网站任务”可能有三种完全不同的实现方式。
2. EXAMPLE：收集公开网页数据并生成表格；对比代码/API、浏览器读取、直接界面操作。
3. CHECK：选择更适合的能力类型，并识别风险。
4. PRACTICE：为一个真实任务选择 Coding / Browser / Computer Use，并写出理由与人工确认点。
5. REVIEW：AI适合选择更稳定、可验证的执行方式；AI不应为了“像人操作”而绕过更可靠的接口或权限。
6. CAPABILITY：能看懂现代 AI 执行能力地图，并为任务选择最低风险的实现方式。

**下一课**

T1-20 收束整个 Track 01：哪些数据、权限和高影响动作必须保留人工确认。

---

### T1-20 — 隐私（Privacy）、权限（Permissions）与人在回路（Human-in-the-loop）：什么不能直接交给 AI

**Type:** APPLICATION
**Primary Knowledge Point:** Privacy / Permissions / HITL / High-impact Boundary
**Prerequisite:** T1-05, T1-17, T1-19

**本课只解决**

> 当 AI 已经能读取数据、调用工具并执行动作时，哪些事情必须限制权限、保护数据或要求人工确认？

**必须教清**

- 隐私（Privacy）关注不该暴露或不该超范围使用的数据；
- 权限（Permissions）决定 AI 可以读取什么、调用什么、修改什么；
- 人在回路（Human-in-the-loop）是在关键决策/动作前保留人工确认；
- 最小权限原则：只给完成当前任务所需权限；
- 高影响、不可逆、涉及金钱/账户/正式发布/敏感数据的动作，应设置人工确认；
- Core Authority 必须由系统/业务规则掌握，不能仅凭模型输出决定；
- 审核点应该放在真正高风险的动作之前，而不是所有步骤都人工点击。

**不得展开**

法律合规条文、GDPR/PDPA/PIPL 逐条解释、企业 IAM、RBAC/ABAC 实现、Secret management、Audit log 架构、审批系统工程设计。

**六步设计**

1. EXPLAIN：为什么 AI 能做某件事，不代表应该拥有执行权。
2. EXAMPLE：AI 生成退款建议 vs 自动执行高额退款；对比最小权限和人工批准。
3. CHECK：识别敏感数据、高权限动作、高影响动作和必要人工确认点。
4. PRACTICE：为一个 AI 执行流程标出“可自动 / 需确认 / 禁止自动”的动作。
5. REVIEW：AI适合在受控权限内辅助判断和执行低风险步骤；AI不应替代人或核心系统做高影响最终授权。
6. CAPABILITY：能为一个 AI 工作流加上最小权限、敏感数据和人工确认边界。

**Track 01 收束**

完成 T1-20 后，学习者已经具备进入后续板块的基础判断：

- 会用 AI；
- 理解模型、记忆、知识与检索；
- 理解 API / Schema / Tool / MCP；
- 理解 Skill / Workflow / Agent；
- 理解 Multimodal / Coding / Browser / Computer Use；
- 理解 Privacy / Permissions / HITL。

后续 Track 不再重复解释这些概念本身，而是在真实业务、自动化和 FDE 场景中深化工程能力。

---

## 7. Runtime Learning Experience Rework — 2026-09-23

本节是 T1-11～T1-20 Formal Brief 的**后续体验修正规则**。若前文六步示例与本节冲突，以当前 `LESSON_OUTPUT_CONTRACT_V1.md`、`BEGINNER_LESSON_QUALITY_STANDARD_V1.md` 与本节为准；不因旧 Brief 示例继续保留已经被体验验证为不合适的表达。

1. **学员可见语言中文优先**：只有本课必须掌握且行业通用的 AI / 技术术语保留中文（English）或中文解释（缩写）。`Beginner`、`Schema`、`Goal / Observe / Decide / Act / Stop` 等普通说明词不作为学员端必学术语时，直接使用自然中文。
2. **Step 4 以“直接复制给 AI 就能得到本课目标输出”为验收原则**：Practice 字段只是帮助学员逐步思考；Reference Fill 按顺序组合后必须成为完整任务。需要具体输入材料的课程必须提供示例材料，不能只有“目标 / 输入 / 返回”等抽象字段说明。只有课程目标本身是澄清需求时，才允许主要使用反问。
3. **Step 5 使用当前全局规则**：上方主卡片固定围绕 `AI适合做什么 / AI不应该替你做什么` 两个核心方向回答，主卡片至少 2 张、上限不固定；超过两张只在能让本课知识更清晰时增加。下方说明层继续按“明确命题 + 回答/解释”讲清原因、边界、使用条件和易混淆判断。具体最低结构与知识覆盖验收以当前 `LESSON_OUTPUT_CONTRACT_V1.md` 为准，本历史 Brief 不再单独维护数量规则。
4. **Step 6 触发场景与下一课价值分离**：`遇到什么情况，我应该想到这节课？` 必须写具体、现实、可识别的工作场景；`Next Lesson Value` 只解释后续学习价值，禁止互相替代。
5. **T1-11～T1-20 当前 Draft / Runtime Presentation 必须通过对应 Deterministic Validator 后才能作为后续课程参考**；不得再从本文件旧的两句 REVIEW 示例、旧字段名或旧英文标签反推新的课程模板。
