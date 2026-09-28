# Track 03 Six-step Knowledge Point Audit v1

Status: **PASS / 15 KEEP / DIRECTORY_APPROVED_V1**
Task: **TRACK03-SIX-STEP-AUDIT-001**

Owner: docs/learning/TRACK03_CATALOG_CONTEXT_V1.md

## 1. Audit gate

每个候选必须同时通过：

1. PRIMARY：有独立、稳定、可迁移的核心判断；
2. EXPLAIN：零编程背景学习者能建立直觉；
3. EXAMPLE：能用 OPC / 自媒体真实业务例子讲透；
4. CHECK：可通过判断题 / 选择题检验关键边界；
5. PRACTICE：能在现有 Lesson Shell 中产出可检查业务产物；
6. REVIEW：能回答 AI 适合做什么 / 不应该替人做什么；
7. CAPABILITY：有现实触发场景和可自证能力；
8. CONTINUITY：复用 Track 02，不抢 Track 04/05；
9. UI FIT：不需要新增 UI / Renderer / CSS。

Disposition：KEEP / MERGE / SPLIT / SUPPORTING_KNOWLEDGE / DEFER / REMOVE。

## 2. Audit summary

| ID | Primary Knowledge Home | Disposition | Why |
| --- | --- | --- | --- |
| T3-01 | ICP / Audience Business Fit | KEEP | “面向谁”是业务定位判断，不等于 T2 的表达对象适配 |
| T3-02 | Use Case / Problem-Situation Fit | KEEP | 真实触发场景与需求强度独立于 ICP |
| T3-03 | Value Proposition / Message Hierarchy | KEEP | 价值信息优先级是内容与转化共同前置 |
| T3-04 | Topic Opportunity / Content Research | KEEP | 选题要连接对象、需求、证据与时机，不等于一般 Research |
| T3-05 | Content Pillars / Series Planning | KEEP | 从单篇升级为持续内容系统，是独立规划能力 |
| T3-06 | Multimodal Content Repurposing | KEEP | 核心是跨媒介保真重组，不是多模态工程 |
| T3-07 | Channel Role / Platform Adaptation | KEEP | 先理解渠道角色再适配内容，不是平台按钮教学 |
| T3-08 | Conversion Path / CTA / Landing Logic | KEEP | 曝光到下一步行动需要独立转化路径判断 |
| T3-09 | Lead Capture / Qualification / Priority | KEEP | 线索需要字段、价值与优先级判断，不等于收到消息 |
| T3-10 | Customer Context / Need Extraction | KEEP | 销售推进前必须提取当前需求与未知项 |
| T3-11 | Sales Follow-up / Objection Handling | KEEP | 跟进与异议处理需要下一步行动、证据与人工确认 |
| T3-12 | Knowledge-grounded Service Response | KEEP | 客服答复核心是以可信知识为依据，不是自由生成 |
| T3-13 | Service Boundary / Escalation / Risk | KEEP | 何时停止回答并转人工是独立风险判断闭环 |
| T3-14 | Operations Metric Tree / Funnel Review | KEEP | Track 02 教会看数据；本课决定业务链该看哪些指标 |
| T3-15 | Feedback Loop / Growth Review | KEEP | 从结果形成下一轮改动，是 Track 03 → 04 的收口能力 |

Disposition total：**15 KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE**。

## 3. Key anti-repeat decisions

### T3-01 ≠ T2-04
T2-04 是“已知对象后如何表达”；T3-01 是“业务上应该优先服务哪个对象”。

### T3-04 ≠ T2-01 Research
T2-01 教如何把问题变成可研究问题；T3-04 教如何用受众、问题、时机和证据判断一个选题是否值得做。

### T3-06 ≠ AI 写作课 / 多模态工程课
它复用 T2 Source-to-Deliverable 与 T1 Multimodal capability map，Primary 是“同一核心信息如何跨媒介保真重组”。

### T3-08 ≠ Landing Page 工具课
Landing Page 只是例子。Primary 是“用户看到内容后，下一步行动如何被清晰设计并可衡量”。

### T3-09 ≠ CRM 软件课
CRM 是可能的记录位置。Primary 是 Lead 的捕获字段、判断标准与跟进优先级。

### T3-12 ≠ RAG 原理课
RAG 已在 Track 01 建立概念、Track 02 建立 Source Governance。此处 Primary 是客服答复必须 grounding 于可信知识。

### T3-14 ≠ T2-12 Data Analysis
T2-12 回答“如何从数据得到可信判断”；T3-14 回答“内容→线索→销售→客服这条业务链，应该看哪些数字以及它们如何连接”。

### T3-15 ≠ Track 04 Workflow
T3-15 只形成人工复盘后的下一轮改动，并标记哪些重复链路已验证；不设计 Trigger / State / Retry / Automation。

## 4. Six-step feasibility notes

### T3-01
- EXPLAIN：不是用户越多越好，而是先明确最值得服务的一类对象。
- PRACTICE：形成 ICP Card：对象、场景、问题、证据、排除项。
- REVIEW：AI 可整理候选特征；不能替用户凭空判断谁最值得投入。
- CAPABILITY：面对“内容到底写给谁”时，先完成业务对象选择。

### T3-02
- PRACTICE：形成 Use-case Card：触发情境、现有做法、痛点、期望结果、未确认项。
- CAPABILITY：从“用户画像”进一步判断“什么时候他会真的需要”。

### T3-03
- PRACTICE：形成 Message Hierarchy：核心价值、支持证据、具体下一步。
- CAPABILITY：避免把功能列表当价值表达。

### T3-04
- PRACTICE：用已有 Research 生成并筛选 Topic Backlog。
- CAPABILITY：选题能说明为什么是这个对象、这个问题、现在值得做。

### T3-05
- PRACTICE：把零散 Topic 归入内容支柱、系列与更新节奏。
- CAPABILITY：从“每次想一篇”升级为持续内容体系。

### T3-06
- PRACTICE：把一份 Verified Core Content 重组为文字 / 图文 / 短视频脚本资产。
- REVIEW：AI 可改写媒介结构；不能改变核心事实与业务承诺。
- UI FIT：不新增媒体上传/编辑器。

### T3-07
- PRACTICE：为同一内容定义不同渠道的角色、受众状态、表达结构与 CTA。
- CAPABILITY：不再“一稿多发”。

### T3-08
- PRACTICE：设计 Content → CTA → Landing/DM/Form → Next Step 的人工转化路径。
- REVIEW：不把转化率承诺交给 AI。
- CONTINUITY：不进入自动触发或编排。

### T3-09
- PRACTICE：定义 Lead fields + qualification rules + priority。
- REVIEW：AI 可分类线索；不能虚构预算、意向或授权。
- UI FIT：不新增 CRM。

### T3-10
- PRACTICE：从客户资料 / 对话记录提取 Customer Context Brief。
- CAPABILITY：分清已知需求、推测与待确认问题。

### T3-11
- PRACTICE：针对长期未回复 / 异议场景制定跟进目标、草稿、证据与下一步。
- REVIEW：最终发送与承诺由人确认。

### T3-12
- PRACTICE：用 Maintained Knowledge Pack 生成带依据的客服答复。
- CAPABILITY：回答前先找可信依据；缺证据时明确不足。

### T3-13
- PRACTICE：对退款、投诉、敏感信息、权限、未知答案定义“继续答 / 澄清 / 转人工”。
- CONTINUITY：只形成业务规则，不设计 HITL Workflow architecture。

### T3-14
- PRACTICE：建立最小业务 Metric Tree：曝光 → 行动 → Lead → 跟进 → 成交/服务。
- REVIEW：AI 可计算与解释；不能替业务定义成功标准。
- UI FIT：不新增 Dashboard editor。

### T3-15
- PRACTICE：形成 Growth Review：发生什么、为什么、下一轮保留/修改/停止什么、哪些流程值得系统化。
- CAPABILITY：把“看数据”推进到“改变下一轮业务动作”。
- Next reuse：把已验证重复链交给 Track 04。

## 5. Supporting knowledge that must not become extra Core lessons

广告投放后台、公众号/小红书/抖音/B站具体按钮、CRM 软件操作、Landing Page Builder、社群工具、自动发布、SEO 专项、高级广告竞价、OCR/ASR/TTS pipeline、Media preprocessing engineering、Workflow/Agent/Automation、企业级权限/合规架构，都不扩成 Track 03 Core 第 16+ 课。

## 6. Approved directory after audit

Phase 1 找对业务对象
T3-01 ICP / Audience Business Fit
T3-02 Use Case / Problem-Situation Fit
T3-03 Value Proposition / Message Hierarchy

Phase 2 做成内容资产
T3-04 Topic Opportunity / Content Research
T3-05 Content Pillars / Series Planning
T3-06 Multimodal Content Repurposing

Phase 3 发布并承接线索
T3-07 Channel Role / Platform Adaptation
T3-08 Conversion Path / CTA
T3-09 Lead Capture / Qualification / Priority

Phase 4 推进销售
T3-10 Customer Context / Need Extraction
T3-11 Sales Follow-up / Objection Handling

Phase 5 做好客服
T3-12 Knowledge-grounded Service Response
T3-13 Service Boundary / Escalation / Risk

Phase 6 用数据复盘增长
T3-14 Operations Metric Tree / Funnel Review
T3-15 Feedback Loop / Growth Review

## 7. Production decision

Track 03 Six-step Audit 结果：

**PASS / 15 KEEP / DIRECTORY_APPROVED_V1**

下一步不直接生成 15 节 Lesson Draft。先进入：

T3-01～T3-03 Formal Brief → Workflow Draft → Deterministic Validation → Human Review Gate
