# Track 02 Catalog & Course Context v1

Status: **DIRECTORY_APPROVED_V1 / BATCH_A_BRIEF_READY_V1**
Task: **TRACK02-CURRICULUM-CONTEXT-001 — Track 02 Capability, Knowledge & Course Context Freeze**

## 1. Authority

本文件是 Track 02「AI 工作应用」当前唯一的课程上下文 owner，负责：

- Exit Capability；
- 15 个候选 Primary Knowledge Home 与顺序；
- Track 01 → Track 02 → Track 03/04/05 的能力连续性；
- 18 个 Knowledge Candidate 到 15 个教学闭环的映射；
- Anti-repeat / Deferred / Supporting Knowledge Boundary；
- Artifact Thread；
- Track 02 前端与 Runtime 边界。

T2-01～T2-15 已完成 Six-step Knowledge Point Audit 并全部 KEEP。若未来 Human Review / Practice Evidence 发现 Exit Capability 缺口，必须重新开启 Curriculum Audit；目录变化只修改本 owner，并同步 affected continuity，不在其他文件复制第二份目录。

### 1.1 Related-file authority map

Track 02 关联文件只允许按以下职责读取，禁止多文件共同拥有当前目录：

| File | Role | May define current Track 02 directory? |
| --- | --- | --- |
| `docs/learning/TRACK02_CATALOG_CONTEXT_V1.md` | **CURRENT OWNER**：Exit Capability、Phase、Candidate、Primary Knowledge Home、顺序、跨 Track Boundary、Artifact Thread、UI Boundary | **YES — only owner** |
| `docs/learning/FORMAL_CURRICULUM_V1.md` | 五轨总课程主线 + 指向当前 Track owner | NO |
| `docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md` | 跨课 / 跨 Track continuity contract | NO |
| `docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md` | Deferred / Supporting 输入及后续归属记录 | NO |
| `docs/learning/COURSE_BUILD_START_HERE.md` + Course Production Workflow | 课程生产入口、Context 解析与生产 Gate | NO |
| `docs/learning/TRACK02_BATCH_A_T2_01_T2_03_FORMAL_BRIEFS_V1.md` | 当前 T2-01～T2-03 Formal Brief Batch owner | NO — lesson boundary only |
| `docs/CURRENT_SYSTEM_FACTS.md` | 当前事实与阶段状态 | NO |
| `PROJECT_STATUS.md` / `TASKS.md` | 当前阶段 / 任务状态 | NO |

恢复 Track 02 上下文时固定读取顺序：

```text
COURSE_BUILD_START_HERE
→ FORMAL_CURRICULUM_V1
→ TRACK02_CATALOG_CONTEXT_V1
→ FIVE_TRACK_CAPABILITY_CONTINUITY_V1
→ DEFERRED_KNOWLEDGE_LEDGER_V1
→ current Formal Brief / Formal Brief Batch
→ current Grounding / Research Packet（如需要）
```

历史 task-result 不属于 Track 02 恢复链；已完成阶段只在 TASKS 中保留必要摘要，不要求独立 result 文件持续存在。

## 2. Learner promise & exit capability

面向第一次真正把 AI 用进工作的人，Track 02 的用户承诺是：

> **知道怎么用 AI，也知道工作遇到问题时该怎么问、怎么检查、怎么继续。**

Track 02 Exit Capability：

> 面对一个真实工作任务，学习者能够明确自己要解决的问题，找到和判断可信资料，把资料加工成可交付成果，处理长文件与多份资料，看懂并核验基础业务数据，把有价值的信息沉淀为可复用知识，并把一次成功做法提炼为下次可以直接复用的方法；当 AI 结果不理想时，能够判断问题出在哪里并提出下一步有效要求。

Track 02 结束时，学习者应从「会与 AI 基本协作」升级为「能稳定完成日常 AI-assisted Knowledge Work」。

## 3. Inherited capability from Track 01

Track 02 默认直接调用、不得从定义重新教学：

- Prompt / Task Instruction；
- Context / Minimum Sufficient Context；
- Iteration；
- Reliability / Verification；
- Search / RAG / Source of Truth；
- Structured Output / Schema 直觉；
- Multimodal 能力地图；
- Skill / Workflow / Automation / Agent 的基本边界；
- Privacy / Permissions / HITL。

固定 Anti-repeat：

> Track 01 负责“认识并正确协作”；Track 02 负责“把这些能力用于真实工作”。后续课程只能在真实任务中调用上述能力，不能换标题重新讲定义。

## 4. Six learner-facing phases

一级结构使用结果型表达；内部 Knowledge Domain 只用于 Curriculum / Brief，不要求原样展示给学习者。

| Phase | Learner-facing result | Internal domain | Phase exit |
| --- | --- | --- | --- |
| 1 | **会找答案** — 需要资料时，知道怎么找、怎么判断 | Research / Evidence | 能把模糊问题变成可研究问题，并用来源与多源证据形成可信结论 |
| 2 | **会做成品** — 有资料时，知道怎么变成能交付的结果 | Writing / Communication | 能按对象与目的把资料做成成品，并诊断、修改不理想结果 |
| 3 | **会处理复杂资料** — 文件再长、信息再多，也知道怎么处理 | Document / File Work | 能定向阅读、比较多份资料并提取决策与行动 |
| 4 | **会看数据** — 面对表格和数字，知道怎么问、怎么判断 | Data / Spreadsheet Work | 能定义口径、识别数据质量问题并形成可核验分析结论 |
| 5 | **会积累知识** — 用过一次的资料和经验，不再每次从头开始 | Knowledge Work | 能判断什么值得沉淀，并保持知识可找、可信、可更新 |
| 6 | **会复用方法** — 做成功一次以后，把方法留下来继续用 | Reusable Work Method | 能把一次成功任务提炼成模板、Checklist 或轻量 SOP |

## 5. Fifteen-lesson candidate directory

当前 15 节已通过 `TRACK02-SIX-STEP-AUDIT-001`，成为 **Core Baseline v1 approved directory**。后续 Human Review / Practice Evidence 若发现 Track Exit Capability 缺口，仍可通过新的 Curriculum Audit 调整，不以课数作为永久上限。

| Order | ID | Learner result / working title | Primary Knowledge Home | Inherit | Next reuse | Audit |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | T2-01 | 问题太大，怎么把它变成 AI 能查的问题 | Research Question / Scope | Prompt, Context | T2-02；Track 03 市场/选题研究；Track 05 Problem Discovery | KEEP |
| 2 | T2-02 | AI 给的答案，怎么判断它靠不靠谱 | Source Quality / Evidence Judgment | Reliability, Search, Source of Truth | T2-03；Track 03 内容/市场事实核验 | KEEP |
| 3 | T2-03 | 几个答案不一样，怎么判断差异 | Multi-source Synthesis / Conflict Handling | T2-01, T2-02 | Track 03 竞品/市场研究；Track 05 Discovery evidence | KEEP |
| 4 | T2-04 | 同样的信息，怎么针对不同人表达 | Audience / Purpose Fit | Prompt, Context | T2-05；Track 03 内容/推广/销售/客服 | KEEP |
| 5 | T2-05 | 一堆资料，怎么变成能交付的成品 | Source-to-Deliverable Transformation | T2-04, Structured Output | T2-06；Track 03 Content Assets | KEEP |
| 6 | T2-06 | AI 已经写出来了，但“不好”，到底怎么改 | Editorial Diagnosis / Revision | Iteration, Reliability | Track 03 内容质量/销售沟通/客服审核 | KEEP |
| 7 | T2-07 | 文件太长，怎么快速找到真正需要的信息 | Targeted Document Reading | Context, Multimodal capability map | T2-08；Track 03 客户/运营资料 | KEEP |
| 8 | T2-08 | 多份文件怎么比较，差异在哪里 | Cross-document Comparison | T2-07, Structured Output | T2-09；Track 03 竞品/方案比较 | KEEP |
| 9 | T2-09 | 看完资料以后，下一步到底该做什么 | Information-to-Action Extraction | T2-07, T2-08 | Track 03 运营执行；Track 04 已验证流程输入 | KEEP |
| 10 | T2-10 | 一个数字到底是什么意思，先把口径搞清楚 | Metric Definition / Data Semantics | Reliability | T2-11, T2-12；Track 03 Operations Metrics；Track 05 Value | KEEP |
| 11 | T2-11 | 数据很乱，先别急着让 AI 分析 | Data Quality / Cleaning Judgment | T2-10 | T2-12；Track 03 运营分析 | KEEP |
| 12 | T2-12 | 怎么从数据里得到一个可信的判断 | Analytical Question → Calculation → Interpretation → Verification | T2-10, T2-11 | Track 03 Data Review；Track 05 Evaluation | KEEP |
| 13 | T2-13 | 哪些东西值得留下来，哪些不用存 | Knowledge Capture / Knowledge Value | Memory, Knowledge Base | T2-14；Track 03 FAQ/销售/内容资产 | KEEP |
| 14 | T2-14 | 怎么让知识以后找得到，而且知道哪份可信 | Knowledge Organization + Maintenance / Source Governance | T2-13, Source of Truth | Track 03 客服知识；Track 04 Context Engineering；Track 05 Solution Design | KEEP |
| 15 | T2-15 | 这次做得不错，怎么让下次不用重新来 | Reusable Work Method / Template / Checklist / SOP-lite | Skill/Workflow boundary only | Track 04：识别值得系统化的稳定重复方法 | KEEP |

Lesson Type、Formal Brief、Step 4 Completion Gate 在 Six-step Audit 后确认；不得为了预设 Lesson Type 反推课程内容。

## 6. Eighteen knowledge candidates → fifteen teaching loops

18 个 Knowledge Candidate 继续作为完整性检查，不要求 18 节课。

| Knowledge candidate | Teaching home |
| --- | --- |
| Research Question / Scope | T2-01 |
| Source Quality / Evidence | T2-02 |
| Multi-source Synthesis | T2-03 |
| Audience / Purpose | T2-04 |
| Source-to-Deliverable | T2-05 |
| Editorial Revision | T2-06 |
| Targeted Document Reading | T2-07 |
| Cross-document Comparison | T2-08 |
| Information-to-Action | T2-09 |
| Metric Definition | T2-10 |
| Data Cleaning / Quality | T2-11 |
| Analytical Question / Interpretation | T2-12 |
| Visualization / Numerical Verification | Supporting in T2-12；不独立成图表课 |
| Knowledge Capture | T2-13 |
| Knowledge Organization | T2-14 |
| Knowledge Maintenance / Source Governance | T2-14 |
| Reusable Method Extraction | T2-15 |
| Template / Checklist / SOP-lite | T2-15 |

## 7. Track 02 recurring learner behavior

Track 02 每节课都必须训练：

1. 正常情况下，怎样让 AI 完成当前最小真实工作；
2. AI 没做好时，学习者怎样判断卡点并提出下一步有效要求。

允许反复调用的 Supporting Framework：

- 目标不清 → 先明确目标；
- 信息不足 → 补必要资料；
- 结果不对 → 先判断错在事实、结构、口径、表达还是边界；
- 事实不确定 → 找来源和证据；
- 答案冲突 → 对齐来源、定义、日期与适用范围；
- 任务太大 → 拆成更小、可验证的工作动作；
- 不知道怎么问 → 先说明希望得到的结果和用途。

该 Framework 不独立成课，不升级为第二 Primary Knowledge Point。

## 8. Artifact thread

Track 02 不强制 15 节共用一个永久文件，但必须形成连续 Artifact Thread：

```text
Research Question
→ Evidence Pack
→ Multi-source Synthesis
→ Audience / Purpose Brief
→ Deliverable Draft
→ Reviewed Deliverable
→ Document Findings
→ Comparison / Action List
→ Metric Definitions
→ Data Quality Notes
→ Analysis / Decision
→ Knowledge Capture Set
→ Maintained Knowledge Pack
→ Reusable Work Template / Checklist
```

Artifact 必须自然产生；不得为了下一课强行增加当前课不自然的字段。

Track 03 默认复用这些资产，把「工作产物」升级成「业务动作与业务结果」。

## 9. Cross-track boundary

### Track 02 owns

- 研究问题、来源与证据、多源综合；
- 面向对象与目的的工作表达；
- Source → Deliverable；
- 成品诊断与修改；
- 定向文件阅读、多文件比较、信息转行动；
- 指标口径、数据质量、基础分析与数字核验；
- 知识捕获、组织与维护；
- 一次成功工作方法的模板化 / Checklist 化。

### Track 03 owns later

- Audience / ICP 的业务定位；
- Content System / Distribution / Conversion / Lead / Funnel；
- Sales / CRM / Customer Lifecycle；
- Customer Service business loop；
- Operations Metrics / Feedback Loop；
- 渠道实战。

Track 02 可以产生研究、内容、数据与知识资产，但不教授完整推广/销售/客服业务链。

### Track 04 owns later

- Workflow decomposition / node design；
- Trigger / State / Stop / Failure；
- Retry / Timeout / Idempotency / Compensation；
- Context Engineering；
- Code / Model / Skill / Tool / Workflow / Agent / Core System responsibility architecture；
- API / Tool / MCP integration design；
- Automation / Approval / HITL architecture；
- Workflow Evaluation / Regression。

Track 02 的 T2-15 只做到「发现并保存可复用方法」，不设计自动化 Workflow。

### Track 05 owns later

- Problem Discovery / Stakeholder / Current State；
- Problem Definition / Target State / Constraints / Risk；
- Value Hypothesis / Success Metrics；
- Solution Design / Build vs Buy；
- Prototype / Pilot；
- Business Evaluation；
- Adoption / Change Management / Owner / Rollout。

Track 02 不把业务问题定义、解决方案架构或企业落地前移。

## 10. Deferred / supporting resolution

读取 `DEFERRED_KNOWLEDGE_LEDGER_V1.md` 后，Track 02 当前处理如下：

- OCR / ASR / TTS：可作为「AI 可以把图片/音频/视频转成可处理信息」的真实使用场景，但 **pipeline 实现不是 Track 02 Primary Knowledge Home**；
- 文件上传、解析器、媒体预处理、帧采样、压缩：不进入 Track 02 Core；
- Formula / SQL / Python：可作为 AI 辅助生成的案例结果，不要求普通路径掌握语言本身；
- Skill packaging / registry、Workflow engineering、API/MCP engineering、Agent engineering：继续 Deferred 至 Track 04 / Advanced Technical；
- IAM / RBAC / Secrets / Sandbox / Deployment：继续 Deferred 至 Advanced Technical / 企业扩展；
- 渠道营销、多模态内容生产：由 Track 03 结合业务场景决定是否形成课程。

Deferred 条目登记过不等于自动升级为正式 Lesson。

## 11. Frozen UI / Runtime constraint

Track 02 Core Lesson 必须适配当前 **Unified Lesson Shell v1**。

默认禁止：

- 新增 Renderer；
- 新增课程专属 Component；
- 新增 UI；
- 调整 CSS；
- 为单课增加专属交互类型；
- 因文件课新增文件上传器；
- 因数据课新增 Spreadsheet / 图表编辑器；
- 因知识课新增 Knowledge Base / Obsidian 编辑器。

正式教学继续使用现有六步：

```text
EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY
```

真实文件、表格、知识、图片、音频等在课程中优先作为 Sample Input / Practice Context / COPY_TO_AI 场景表达。若某候选知识只有新增 UI 才能成立，必须先回到 Curriculum 判断其 Primary Knowledge Home、范围或 Track 归属，而不是先扩前端。

### 11.1 Multi-Track Learning Map / Access interaction baseline

`TRACK02-LEARNING-PATH-ACCESS-001` 已冻结并实现以下产品交互；这些规则属于 Track 02 Runtime 接入前置边界，不改变六步 Lesson Shell：

- `/learning-path` 继续作为唯一学习地图；T1 / T2 使用 `?track=foundation-ai` / `?track=ai-work` 切换，不复制第二套学习路径页面；
- 最近一次主动选择的 T1 / T2 使用轻量 Track preference 记忆；再次从全站入口进入 `/learning-path` 时恢复该板块，显式 query 仍优先；
- T2 学习地图始终展示批准的 15 节完整 Curriculum；Delivery State 独立显示。当前 T2-01～T2-03 已通过 Runtime Acceptance 并显示为 AVAILABLE；T2-04～T2-15 仍显示“即将开放”，不得因目录已批准而伪造 Runtime；
- 每个 Track 独立统计正式已开放课程的 Progress；未开放课不制造假进度；
- 学习顺序与访问权限分离：T1 是 T2 的推荐基础，不是 OPC_MEMBER 的硬性 Access prerequisite；
- `ai-work` 的正式 Runtime 访问由 Membership / Entitlement 决定；完成 T1 不会自动获得 T2 权益，未完成 T1 也不会阻止有效会员进入 T2；
- prerequisite 只产生学习建议，不阻断有效会员继续学习当前 T2 课程；
- 从 T2 课程返回学习地图必须回到 `?track=ai-work`；
- T2-01 的上一项固定为 `← 学习地图`，不得反向连接 T1-20；
- T1-20 完成后的跨 Track Continue 只有在 `ai-work` 真实 Runtime 已存在时才显示；当前已真实指向 T2-01，且仍受“完成本课后继续”的 Completion 行为约束；
- Lesson Sidebar 只显示当前 Track / Course，不把 T1 与 T2 目录堆在同一 Sidebar；
- 复用现有组件与 CSS class，不新增课程专属 Renderer，不调整六步 Lesson Shell。

## 12. Six-step audit entry criteria

`TRACK02-SIX-STEP-AUDIT-001` 已完成逐课审计，详细证据见 `docs/learning/TRACK02_SIX_STEP_AUDIT_V1.md`。后续 Formal Brief 必须继续回答：

- Step 1：学习者现实中遇到的独立问题是什么；
- Step 2：不可被相邻课程替代的核心规律是什么；
- Step 3：能否用真实判断题证明理解；
- Step 4：现有 Shell 内能完成什么最小真实动作，COPY_TO_AI 的完整任务是什么；
- Step 5：AI 适合做什么 / AI 不应该替你做什么，以及需要保留的具体边界；
- Step 6：获得什么能力、如何自证、什么现实情况会触发调用、下一步如何复用。

15 个 Primary Knowledge Home 已全部通过 Six-step Audit；Batch A（T2-01～T2-03）现已完成至 AVAILABLE。后续新 Batch 进入 Formal Brief 时，仍不允许未经 Curriculum Audit 改变 Primary Knowledge Home 或新增第 16 课。

## 13. Production boundary

本任务之后的固定顺序：

```text
TRACK02_CATALOG_CONTEXT_V1
→ TRACK02-SIX-STEP-AUDIT-001 [PASS: 15 KEEP]
→ approved Track 02 directory v1
→ small Formal Brief batch
→ Course Production Workflow
→ Current Course Builder Skill
→ Deterministic Validators
→ Human Review Gate
→ LessonSpec Registry
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE
```

本 owner 的原始 Context Freeze 不负责生成 Lesson Draft 或 Provision Runtime。后续经批准的 Learning Path / Access 交互统一以上述 11.1 基线为准；课程正文仍不得借此新增专属 UI / CSS。
