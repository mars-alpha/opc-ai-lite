# Track 05 Catalog & Course Context v1

Status: **DIRECTORY_APPROVED_V1 / T5-01～T5-16 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS / 6 BATCHES**
Task: **TRACK05-CURRICULUM-001 — FDE Core Curriculum Planning**

## 1. Authority

本文件是 Track 05「FDE / AI 解决方案落地」当前唯一课程上下文 owner，负责 Exit Capability、Primary Knowledge Home、Track 04 → 05 continuity、Deferred / Technical boundary、Artifact Thread 与候选 Course Directory。

目录已完成产品负责人 Human Review：T5-01～T5-15 为 15 个独立 Primary Knowledge Home，T5-16 为 Capstone Integration Lesson。Production Batching 固定为 6 个按 Phase 对齐的批次。Batch A～F 全部完成 Formal Brief → Course Builder Draft → Deterministic Validation → Human Review → LessonSpec Registry → Runtime Provisioning → authenticated Runtime Acceptance → AVAILABLE；正式 owner 为 `lib/learning/track05-runtime.ts` / `lib/learning/track05-specs.ts`。正式 Runtime 与课程 Sidebar 均为 6 个阶段，课数分布 3 / 3 / 3 / 3 / 3 / 1。上线前 Preview 已退出 current path。

## 2. Learner promise & exit capability

统一入口：

> **现在不再只优化一个任务，而是解决一个完整业务问题。**

Track 05 Exit Capability：

> 面对一个真实业务问题，学习者能够进入业务现场，识别真正值得解决的问题与关键角色，建立当前状态和价值基线，定义目标与约束，把已有 AI / Workflow 能力组合成可行方案，设计最小原型与真实 Pilot，用业务证据判断是否继续投入，并推动方案被真实团队采用、交接和持续改进。

最终产物不是 Demo，而是一份可执行的 **AI Solution Package**：

Problem Discovery
→ Current-State Baseline
→ Problem / Target / Value Brief
→ Solution Option & Feasibility
→ Prototype
→ Pilot
→ Evaluation Decision
→ Adoption / Rollout Plan
→ FDE Solution Package

## 3. Inherited capability from Track 01～04

Track 05 默认直接调用，不重新从定义教学：

- Prompt / Context / Reliability / RAG / API / Tool / MCP / Skill / Agent 基础认知；
- Research / Writing / File / Data / Knowledge 工作能力；
- Audience / Content / Lead / Sales / Service / Operations 业务方法；
- Workflow suitability、decomposition、trigger/state/exit、node context、responsibility、structured handoff、external integration、failure recovery、idempotency、human approval、Workflow-vs-Agent、Workflow evaluation。

Track 04 已经回答“这条流程怎样被设计成稳定、可控、可检查的系统”。
Track 05 新增的是：

**业务问题是否值得解决 → 谁会用/负责/批准 → 价值与约束是什么 → 什么方案最合适 → 怎么小步试点 → 证据是否支持继续 → 怎么真正被采用。**

## 4. Capability map

学习者结果型能力链：

**看清真实问题 → 定义价值与目标 → 设计可落地方案 → 用最小 Pilot 验证 → 用证据决定投入 → 推动真实采用 → 完成交付**

内部能力域：

Problem Discovery
→ Stakeholder & Current State
→ Problem Definition / Target State / Value
→ Solution Options / Feasibility / Scope
→ Prototype / Pilot
→ Evaluation / Decision
→ Adoption / Rollout / Ownership
→ Capstone Delivery

## 5. Approved directory

| Order | ID | Learner result / working title | Knowledge Home / Lesson Role | Inherit | Next reuse | Audit |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | T5-01 | 别急着想“用什么 AI”，先确认业务到底哪里出了问题 | Problem Discovery / Symptom vs Root Problem | T3/04 business + workflow evidence | T5-02～06 | AVAILABLE |
| 2 | T5-02 | 谁在用、谁受影响、谁决定这件事能不能上线 | Stakeholder / User / Owner / Approver Map | T5-01 | T5-03～16 | AVAILABLE |
| 3 | T5-03 | 现在到底有多慢、多贵、多容易出错 | Current-State Baseline / Cost-of-Problem | T2 Data + T4 evaluation evidence | T5-04～06 / T5-13 | AVAILABLE |
| 4 | T5-04 | 把模糊抱怨变成一个真正能解决的问题 | Problem Statement / Scope / Constraints | T5-01～03 | T5-05～09 | AVAILABLE / FORMAL_RUNTIME |
| 5 | T5-05 | 做完以后，业务应该具体变成什么样 | Target State / Success Condition | T5-04 | T5-06 / T5-11 / T5-13 | AVAILABLE / FORMAL_RUNTIME |
| 6 | T5-06 | 这件事值得投入多少时间和成本 | Value Hypothesis / Business Case / Prioritization | T5-03～05 | T5-07～13 | AVAILABLE / FORMAL_RUNTIME |
| 7 | T5-07 | 不是所有问题都要“自己做系统”：先比较解决路径 | Solution Options / Build-Buy-Configure-Manual | T5-04～06 + T4 blueprint | T5-08～09 | AVAILABLE / FORMAL_RUNTIME |
| 8 | T5-08 | 数据、权限和依赖不具备，再好的方案也落不了地 | Solution Readiness / Data / Access / Dependency / Risk | T4 context/integration/control | T5-09～12 | AVAILABLE / FORMAL_RUNTIME |
| 9 | T5-09 | 把想法收敛成一份可以开始做的解决方案 | Solution Scope / Architecture-at-decision-level / Delivery Plan | T5-07～08 + T4 blueprint | T5-10～12 | AVAILABLE / FORMAL_RUNTIME |
| 10 | T5-10 | 原型不是“小号正式系统”，只验证最关键假设 | Prototype Hypothesis / Minimum Proof | T5-09 | T5-11 | AVAILABLE / FORMAL_RUNTIME |
| 11 | T5-11 | 试点应该找谁试、试什么、什么情况下立即停 | Pilot Design / Users / Scenario / Guardrails / Stop Rule | T5-05 / 08 / 10 | T5-12～13 | AVAILABLE / FORMAL_RUNTIME |
| 12 | T5-12 | 试点出问题时，先改方案还是先改使用方式 | Pilot Learning / Failure Classification / Iteration Decision | T5-11 + T4 failure evidence | T5-13～14 | AVAILABLE / FORMAL_RUNTIME |
| 13 | T5-13 | 试点结束后，怎么判断继续、调整还是停止 | Evaluation Decision / Baseline-to-Outcome / Investment Gate | T5-03 / 05 / 06 / 11～12 | T5-14～16 | AVAILABLE / FORMAL_RUNTIME |
| 14 | T5-14 | 方案明明有效，为什么团队还是不用 | Adoption / Trust / Workflow Friction / Enablement | T5-02 / 13 | T5-15～16 | AVAILABLE / FORMAL_RUNTIME |
| 15 | T5-15 | 从“有人试用”变成真正的工作方式，需要谁长期负责 | Rollout / Ownership / Operating Model / Feedback Loop | T5-14 | T5-16 | AVAILABLE / FORMAL_RUNTIME |
| 16 | T5-16 | 把一个真实业务问题交付成完整 AI 解决方案 | CAPSTONE INTEGRATION / Solution Package / Handoff | T5-01～15 | Real Project | APPROVED_CAPSTONE |

## 6. Human Review decision — why 16 lessons

Human Review 结论：保留 16 节，但分类为 **15 个 Primary Knowledge Home + 1 个 Capstone Integration Lesson**。16 不是沿用前一 Track 数量，而是 Capability-first + Six-step 审查的结果：

- “问题是什么”与“谁参与并承担责任”是两个不同判断；
- Current-State Baseline 不能塞进 Problem Statement，否则学习者没有事实基线；
- Target State 与 Value Hypothesis 分开：前者回答“变成什么”，后者回答“值不值得投入”；
- Solution Options、Readiness、Solution Scope 分别回答“选哪条路 / 能不能落 / 具体先做什么”，不能压成一节泛化“Solution Design”；
- Prototype 与 Pilot 分开：原型验证关键假设，Pilot 验证真实使用；
- Pilot Learning 与最终 Evaluation Decision 分开：前者指导快速修改，后者决定投资；
- Adoption 与 Rollout/Ownership 分开：解决“为什么不用”与“谁长期负责”；
- T5-16 Capstone 只整合已有判断，不伪装成新的 Primary Knowledge Home；它的 Six-step 以“能否把前面判断整合成可交付 Solution Package”为综合能力闭环。

Human Review 未发现需要合并、拆分、删除或调序的 Core 课程。目录保持 16 节；后续 Formal Brief 若发现某一课无法形成独立判断与 Practice，仍必须回到本 owner 修正，不得为了保持课数保留弱课程。

## 7. Phase grouping

### Phase 1 — 看清真实问题
T5-01～T5-03

### Phase 2 — 定义目标与价值
T5-04～T5-06

### Phase 3 — 设计可落地方案
T5-07～T5-09

### Phase 4 — 用最小试点验证
T5-10～T5-12

### Phase 5 — 用证据决定并推动采用
T5-13～T5-15

### Phase 6 — 完成解决方案落地交付
T5-16

Learner-facing 阶段标题只显示阶段名称本身，不显示“阶段 1：”等前序。

## 8. Longitudinal artifact thread

Track 04 Workflow Design Blueprint
→ Problem Observation Notes
→ Stakeholder Map
→ Current-State Baseline
→ Problem / Target / Value Brief
→ Solution Option Matrix
→ Readiness Checklist
→ Solution Scope Brief
→ Prototype Hypothesis
→ Pilot Plan
→ Pilot Learning Log
→ Evaluation Decision
→ Adoption Plan
→ Rollout / Ownership Plan
→ FDE Solution Package

Artifact 必须自然产生；不为下一课强行填字段。

## 9. Default case thread

默认继续 OPC / 一人公司真实业务，但 FDE 必须表现“解决完整业务问题”，不能只优化单个 Prompt 或节点。

优先案例：
- AI 日报：信息采集成本高、审核负担、发布时间不稳定；
- 内容生产：一人业务内容链中资料、写作、复用、审核、发布协作问题；
- 线索跟进：线索来源分散、背景不完整、跟进不稳定；
- 客服：重复问题多、知识分散、高风险问题需人工；
- 运营复盘：数据存在但无法稳定转成决策与下一步动作。

方法层必须可迁移到企业服务、教育、电商、房地产等场景。

禁止以 Course Builder、课程开发或本项目内部工程流程作为主要学员案例。

## 10. Anti-repeat boundary

### Track 05 owns

- Problem Discovery / Root Problem；
- Stakeholder / User / Owner / Approver；
- Current-State Baseline / Cost-of-Problem；
- Problem / Scope / Constraints；
- Target State；
- Value Hypothesis / Business Case；
- Solution Option / Build-vs-Buy-vs-Configure-vs-Manual；
- Solution Readiness；
- Solution Scope / Delivery Plan；
- Prototype Hypothesis；
- Pilot Design / Pilot Learning（T5-12 只处理 Pilot 阶段可观察的方案、数据、流程与使用摩擦，不提前重讲 T5-14 Adoption）；
- Investment / Continue-Adjust-Stop Decision；
- Adoption / Change / Enablement；
- Rollout / Ownership / Operating Model；
- End-to-end FDE Solution Package。

### Track 05 does not reteach Track 04

- Workflow decomposition；
- trigger / state / stop / failure；
- node context；
- AI / code / tool / human responsibility；
- structured handoff；
- API / Tool / MCP integration design；
- retry / idempotency；
- human approval architecture；
- Workflow vs Agent；
- Workflow evaluation test mechanics。

这些作为已有 Solution Building Blocks 被调用。

### Technical / Enterprise stays optional

以下知识可以影响 FDE 的 Readiness / Risk 判断，但不升级为普通 FDE Core engineering lesson：

- OAuth / Token / Secrets 实现；
- IAM / RBAC / ABAC 配置；
- MCP transport / server deployment；
-完整 JSON Schema / ORM / type generation；
- Tool / Code sandbox 实现；
- Queue / Event Bus / Scheduler 框架；
- Multi-Agent orchestration framework；
- Playwright / Selenium selector 编程；
- production deployment / observability engineering；
- GDPR / PDPA / PIPL 法规专项。

普通 FDE 路径只要求学习者能识别“这是一个依赖 / 权限 / 安全 / 合规阻塞点，需要对应专业实现或审批”。

## 11. Six-step planning rule

T5-01～T5-15 每个 Primary Knowledge Home 必须单独回答；T5-16 Capstone 使用同一 Six-step Shell，但以综合交付能力而非新增知识点作为主线：

1. Step 1：学习者必须建立什么新的业务判断？
2. Step 2：什么真实案例能显示正确/错误做法的差异？
3. Step 3：什么判断题能区分“懂了”和“听过”？
4. Step 4：学习者能在自己的真实问题上做什么？
5. Step 5：AI适合做什么 / AI不应该替你做什么，以及本课特有误区是什么？
6. Step 6：遇到什么真实场景，学习者应该想到这项能力？

任何一课如果只能重复前课产物、无法形成新的判断和 Practice，必须 MERGE / SUPPORTING / DEFER。

## 12. Frozen UI / Runtime constraint

Track 05 Core Lesson 默认继续使用 Unified Lesson Shell。

规划阶段禁止：
- 新增 FDE Canvas / Solution Builder；
- 新增 Stakeholder Map 编辑器；
- 新增 Prototype Builder；
- 新增 Pilot Dashboard；
- 新增课程专属 Renderer / interaction type；
- 修改课程 CSS。

真实 FDE 训练通过 Sample Input、结构化文本、现有 Check + Practice、COPY_TO_AI 表达。需要真实代码、部署或工具操作的内容进入 Technical Practice，不反向改变 Core Lesson Shell。

## 13. Current Gate

**DIRECTORY_APPROVED_V1 / HUMAN_REVIEW_PASS**

Human Review 结论：
- T5-01～T5-15：15 个 Primary Knowledge Home，一课一责；
- T5-16：Capstone Integration Lesson，不作为第 16 个新知识点；
- 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE / 0 REORDER；
- 未发现缺失且必须新增独立课程的 FDE Core 能力；
- Phase grouping 符合真实 FDE 工作顺序；
- Track 04 → 05 边界保持清晰；
- T5-12 不提前教授 Adoption，T5-14 继续拥有 Adoption / Trust / Enablement 主知识归属。

Next Gate：**Track 05 COMPLETE / Ready for Git Commit**。

## 14. Production batching — approved v1

批次不按“每批数量平均”切分，而按完整能力阶段与 artifact handoff 切分。每批恰好对应一个 Phase，避免跨阶段同时生成导致 prerequisite、知识边界和纵向产物漂移。

| Batch | Lessons | Production purpose | Required input | Batch output / handoff |
| --- | --- | --- | --- | --- |
| A | T5-01～T5-03 | 看清真实问题并建立事实基线 | Track 03 真实业务上下文 + Track 04 Workflow Design Blueprint / evaluation evidence | Problem Observation Notes + Stakeholder Map + Current-State Baseline |
| B | T5-04～T5-06 | 把问题收敛成目标、约束与价值判断 | Batch A 全部产物 | Problem / Target / Value Brief |
| C | T5-07～T5-09 | 从多种解决路径收敛到可启动方案 | Batch B Brief + Track 04 Solution Building Blocks | Solution Option Matrix + Readiness Checklist + Solution Scope Brief |
| D | T5-10～T5-12 | 用最小原型和真实 Pilot 学习 | Batch C Solution Scope | Prototype Hypothesis + Pilot Plan + Pilot Learning Log |
| E | T5-13～T5-15 | 用证据决定投入并推动采用与长期负责 | Batch A Baseline + Batch B Success/Value + Batch D Pilot evidence | Evaluation Decision + Adoption Plan + Rollout / Ownership Plan |
| F | T5-16 | 将前 15 课整合为完整 FDE 交付 | Batch A～E 全部关键产物 | FDE Solution Package / Handoff |

### 14.1 Formal Brief production order

Formal Brief 按 **A → B → C → D → E → F** 顺序推进。每批内部仍按课程编号顺序定义 previous → current → next continuity；允许一次编写同一批的多个 Formal Brief，但后课 Brief 必须显式消费前课已定义能力与 artifact，不得把后课知识提前塞入前课。

固定顺序：

```text
Batch A  T5-01 → T5-02 → T5-03
Batch B  T5-04 → T5-05 → T5-06
Batch C  T5-07 → T5-08 → T5-09
Batch D  T5-10 → T5-11 → T5-12
Batch E  T5-13 → T5-14 → T5-15
Batch F  T5-16 Capstone
```

### 14.2 Batch gates

每个 Batch 进入 Course Builder 前必须具备：
- 当前三课（或 Capstone）的 Formal Brief；
- previous → current → next continuity；
- inherited capability 与不得重教的前置知识；
- longitudinal artifact input / output；
- Deferred / Technical / Enterprise boundary；
- 适合现有 Unified Lesson Shell 的 Practice 定义。

上一批不要求先正式上线才能撰写下一批 Formal Brief，但下一批不得在其 prerequisite / artifact handoff 尚未明确时进入 Course Builder Draft。T5-16 必须最后生产，不允许与 Batch E 并行生成新知识内容。

### 14.3 Current production gate

**T5-01～T5-16 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS → READY FOR GIT COMMIT**

Track 05 全 16 课已完成 Formal Brief、Draft、Deterministic Validation、Human Review、LessonSpec Registry、Runtime Provisioning 与 authenticated Runtime Acceptance。16/16 已进入 AVAILABLE；治理清场与最终事实收敛已完成，当前只待统一 Git commit。
