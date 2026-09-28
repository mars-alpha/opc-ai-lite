# Track 04 Catalog & Course Context v1

Status: **DIRECTORY_APPROVED_V1 / 15 KEEP / T4-01～T4-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS**
Task: **TRACK04-CURRICULUM-CONTEXT-001 — Track 04 Capability, Knowledge & Course Context Planning**

## 1. Authority

本文件是 Track 04「AI Workflow 与自动化」当前唯一课程上下文 owner，负责 Exit Capability、15 个 Primary Knowledge Home、顺序、Track 03 → 04 → 05 连续性、Anti-repeat / Deferred Boundary、Artifact Thread 与 Production Batch。

Batch A Formal Brief：`docs/learning/TRACK04_BATCH_A_T4_01_T4_03_FORMAL_BRIEFS_V1.md`（RELEASED / AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS）。
Batch B Formal Brief：`docs/learning/TRACK04_BATCH_B_T4_04_T4_06_FORMAL_BRIEFS_V1.md`（RELEASED / AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS）。
Batch C Formal Brief：`docs/learning/TRACK04_BATCH_C_T4_07_T4_09_FORMAL_BRIEFS_V1.md`（RELEASED / AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS）。
Batch D Formal Brief：`docs/learning/TRACK04_BATCH_D_T4_10_T4_13_FORMAL_BRIEFS_V1.md`（RELEASED / AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS）。
Batch E Formal Brief：`docs/learning/TRACK04_BATCH_E_T4_14_T4_15_FORMAL_BRIEFS_V1.md`（RELEASED / AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS）。

目录已由产品负责人确认并完成全量发布。T4-01～T4-15 统一由 `lib/learning/track04-runtime.ts` / `track04-specs.ts` 作为正式 Runtime / Registry owner；Batch A～E 文档仅保留课程知识边界与 provenance，不再作为独立 Runtime 或 current Gate。

## 2. Learner promise & exit capability

统一入口：

> **前面的流程已经人工跑通，现在把重复、稳定、值得复用的部分系统化。**

Track 04 Exit Capability：

> 面对一条已经人工验证过的真实业务流程，学习者能够判断哪些环节值得系统化，把流程拆成清楚的输入、处理、判断、输出与检查步骤，设计触发、状态、上下文、职责分工、外部连接、异常恢复、人工确认和评估方式，并形成一份可以交给技术实现或后续 FDE 使用的 Workflow 设计蓝图。

Track 04 不等于“学某个自动化平台”，也不是代码开发课。核心能力链：

人工验证过的业务链
→ 判断是否值得系统化
→ 拆清步骤与边界
→ 设计状态与上下文
→ 分配 AI / Code / Tool / 人的责任
→ 连接外部能力
→ 处理失败与人工确认
→ 评估是否稳定有效
→ Workflow 设计蓝图

## 3. Inherited capability

Track 04 默认调用、不重新从定义教学：

- Track 01：Prompt、Context、Structured Output、API、Tool、MCP、Skill、Workflow、Agent、可靠性与安全直觉；
- Track 02：研究、交付物、复杂资料、数据、知识沉淀、模板/清单/轻量流程；
- Track 03：已经人工跑通且可复盘的内容、线索、销售、客服、运营链路；
- Track 03 最终产物：真实业务流程、负责人、输入输出、人工判断点、结果数据和下一轮改进动作。

## 4. Approved capability phases

### 阶段 1：先判断什么值得系统化
回答：不是所有重复工作都应该自动化，先选对对象。

### 阶段 2：把人工流程拆清楚
回答：系统到底按什么顺序做、什么时候开始、什么时候结束。

### 阶段 3：让每一步拿到正确的信息
回答：每一步需要什么上下文、输出什么结构、由谁负责。

### 阶段 4：把外部能力接进流程
回答：什么时候调用 Tool、API、MCP 或浏览器/电脑执行能力，怎样保持输入输出清楚。

### 阶段 5：让流程出错时仍然可控
回答：失败、重试、重复执行、高风险动作和人工接管怎么处理。

### 阶段 6：判断这套系统是否真的值得长期使用
回答：如何测试、观察、比较并持续改进整个流程。

阶段课程归属固定为：
- 阶段 1：T4-01
- 阶段 2：T4-02～T4-05
- 阶段 3：T4-06～T4-08
- 阶段 4：T4-09
- 阶段 5：T4-10～T4-13
- 阶段 6：T4-14～T4-15

学员界面展示规则：学习路径和正式课程左侧阶段卡片只显示阶段名称本身，不显示“阶段：”“阶段 1：”～“阶段 6：”等前序。阶段编号只用于内部课程归属与治理，不进入 learner-facing 标题。

## 5. Approved directory

| Order | ID | 学员看到的课程标题 | Primary Knowledge Home | 继承 | 下一步复用 | Audit |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | T4-01 | 哪些重复工作值得系统化，哪些反而不该动 | 自动化价值判断（Automation Suitability） | T3-15；T2-15 | T4-02～15 | KEEP |
| 2 | T4-02 | 一条人工流程，怎么拆成系统真正能执行的步骤 | 流程拆解 / 输入-处理-判断-输出-检查 | T4-01；T1-16 | T4-03～15 | KEEP |
| 3 | T4-03 | 系统什么时候开始做，什么条件下才应该启动 | 触发条件（Trigger）与启动边界 | T4-02 | T4-04～05 | KEEP |
| 4 | T4-04 | 流程跑到哪一步了，系统怎么知道当前状态 | 状态（State）与进度 | T4-02～03 | T4-05～06 | KEEP |
| 5 | T4-05 | 什么时候继续、停止，什么时候算失败 | 停止条件 / 失败分支 | T4-03～04 | T4-10～12 | KEEP |
| 6 | T4-06 | 每一步到底需要看到哪些信息 | 节点级上下文（Context）治理 | T1 Context；T4-02～05 | T4-07～09 | KEEP |
| 7 | T4-07 | 哪些事交给 AI，哪些必须用确定规则 | 责任架构：Code / AI / Tool / Workflow / Core System | T1-13～17；T4-06 | T4-08～13 | KEEP |
| 8 | T4-08 | 上一步的结果，怎么稳定交给下一步继续用 | 结构化输入输出 / 数据契约（Schema） | T1-12；T4-06～07 | T4-09～10 | KEEP |
| 9 | T4-09 | 要连接外部系统时，接口、工具和模型上下文协议（MCP）怎么选 | 外部能力连接设计 | T1-11～14；T4-07～08 | T4-10～13 | KEEP |
| 10 | T4-10 | 外部调用超时或失败，流程应该怎么处理 | 超时 / 重试 / 失败恢复 | T4-05；T4-09 | T4-11～12 | KEEP |
| 11 | T4-11 | 同一个动作执行两次，怎么避免造成两份结果 | 幂等（Idempotency）与重复执行保护 | T4-08～10 | T4-12～15 | KEEP |
| 12 | T4-12 | 哪些动作可以自动做，哪些必须先让人确认 | 人工确认（Human-in-the-loop）/ 审批 / 回退 | T3-13；T4-05/10/11 | T4-13～15 | KEEP |
| 13 | T4-13 | 固定流程不够用时，什么时候才需要智能体（Agent） | Workflow 与 Agent 的动态性边界 | T1-17；T4-02～12 | T4-14～15 | KEEP |
| 14 | T4-14 | 怎么知道自动化不是“能跑”，而是真的稳定有效 | Workflow 评估 / 测试集 / 回归 | T2 Data；T3-14/15 | T4-15；Track 05 | KEEP |
| 15 | T4-15 | 把一条真实业务链整理成完整工作流设计蓝图 | 工作流设计蓝图 | T4-01～14；Track 03 artifacts | Track 05 Solution / Pilot input | KEEP |

## 6. Why 15 lessons

当前 15 节不是因为沿用上一 Track 数量，而是 Six-step Knowledge Point Gate + 产品负责人目录 Human Review 的批准结果：

- 自动化价值判断与流程拆解不是同一能力；
- Trigger / State / Stop-Failure 分别解决启动、持续状态和退出边界，不能压成一课后只剩术语浏览；
- Context / Responsibility / Data Contract 分别解决“看什么、谁负责、怎么交接”；
- Integration / Retry / Idempotency / HITL 是可靠 Workflow 的四个不同风险面；
- Workflow vs Agent 需要单独建立动态性边界，避免“所有自动化都做 Agent”；
- Evaluation 必须独立，否则 Workflow 只停在“能运行”；
- 最后一课只形成设计蓝图，不引入新的系统概念。

目录现已批准为 15 KEEP。后续若 Human Review 发现具体 Formal Brief 无法形成清晰能力闭环，仍需回到本 owner 重新审计，不得在 Draft 阶段静默改目录。

## 7. Longitudinal artifact thread

Track 03 已验证业务链
→ Automation Candidate Card
→ Human Workflow Map
→ Trigger / State / Stop-Failure Rules
→ Node Context Map
→ Responsibility Map
→ Input / Output Contract
→ Integration Map
→ Failure / Retry / Duplicate-protection Rules
→ Human Approval Map
→ Workflow-vs-Agent Decision
→ Evaluation Plan
→ Workflow Design Blueprint
→ Track 05 Solution Design / Prototype / Pilot 输入

Artifact 必须自然产生，不为下一课强行增加字段。

## 8. Default case thread

默认使用 OPC / 自媒体真实业务链，但方法层必须可迁移。

优先案例：
- AI 日报：热点来源 → 筛选 → 观点整理 → 审核 → 排版/发布；
- 内容复用：核心文章 → 图文 / 视频脚本 / 口播稿；
- 线索承接：内容 → 行动引导 → 私信/表单 → 人工判断 → 跟进；
- 客服：问题 → 找可信依据 → 草拟回复 → 高风险转人工；
- 增长复盘：业务数据 → 指标计算 → 异常判断 → 下一轮动作。

禁止拿课程生产、课程页面、Course Builder 或内部开发流程作为主要教学案例。

## 9. Track 04 owns

- Automation Suitability；
- Workflow decomposition / node design；
- Trigger / State / Stop / Failure；
- Context Engineering at node/workflow level；
- Code / AI / Tool / Workflow / Agent / Core System responsibility boundary；
- Structured Input / Output contract；
- API / Tool / MCP integration design；
- Timeout / Retry / Idempotency / controlled recovery；
- Approval / Human-in-the-loop；
- Workflow vs Agent boundary；
- Workflow Evaluation / Test Set / Regression；
- Workflow Blueprint。

## 10. Track 04 does not own

### 不重教 Track 01～03
- Prompt 基础、Context 基础、RAG 原理、API/Tool/MCP 基础定义；
- 普通研究、写作、文件处理、数据分析、知识整理；
- ICP、内容运营、渠道、线索、销售、客服和增长方法本身。

### 留给 Track 05 / Technical / Enterprise
- OAuth / Secrets / IAM / RBAC / ABAC；
- 生产级 Tool Sandbox / Code Sandbox；
- MCP Transport / Auth / Deployment；
- ORM / 类型生成 / 完整 JSON Schema 工程；
- Queue / Event Bus / Scheduler 的具体框架实现；
- Playwright / Selenium selector 编程；
- Multi-Agent orchestration framework；
- 企业审计日志、安全与法规架构；
- 完整 Build vs Buy、原型、Pilot、Adoption、Rollout；
- 具体代码实现与部署运维。

Track 04 普通路径学“系统设计判断”，不是把学习者训练成自动化平台工程师。

## 11. Deferred Ledger resolution draft

建议吸收为 Track 04 Core：
- Workflow queue/scheduler/event/state 的**概念责任** → T4-03～05；具体框架实现不教；
- retry / idempotency → T4-10～11；
- Agent long-running state 的基础设计边界 → T4-04 / T4-13；
- API / Tool / MCP integration design → T4-09；
- audit / approval workflow 的审批判断 → T4-12；企业审计系统留 Track 05；
- Browser / Computer Use reliability → 可作为 T4-09/10 supporting case，不独立成平台工具课。

继续 Deferred：
- OAuth / Token / Secrets / Rate Limit 安全工程；
- Tool sandbox / permission resolver；
- MCP transport/auth/deployment；
- Skill packaging/version registry 的完整生命周期；
- Multi-Agent framework；
- Code execution isolation；
- IAM / RBAC / ABAC；
- 法规专项。

## 12. Frozen UI / Runtime constraint

Track 04 Core Lesson 继续适配现有 Unified Lesson Shell。

规划阶段默认禁止：
- 新增 Workflow Builder；
- 新增节点拖拽画布；
- 新增自动化平台模拟器；
- 新增 API/MCP 配置 UI；
- 新增代码编辑器；
- 新增课程专属 Renderer / interaction type；
- 修改课程 CSS。

真实流程通过 Sample Input、结构化文本、现有 Check + Practice、COPY_TO_AI 表达。若某知识必须依赖新 UI 才能教清楚，先重新判断它是否属于 Core Lesson。

## 13. Approved production batching

目录已确认，生产批次固定为：
- Batch A：T4-01～T4-03 — 值不值得做 / 流程拆解 / 触发；
- Batch B：T4-04～T4-06 — 状态 / 停止失败 / 上下文；
- Batch C：T4-07～T4-09 — 责任 / 数据契约 / 外部连接；
- Batch D：T4-10～T4-12 — 失败恢复 / 重复执行 / 人工确认；
- Batch E：T4-13～T4-15 — Agent 边界 / 评估 / Workflow 蓝图。

当前 Gate：

**T4-01～T4-15 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS → TRACK 05 CURRICULUM PLANNING**

Track 04 不再维护 Batch 级 current Gate；恢复当前实现时以本 owner + `lib/learning/track04-runtime.ts` + Current Facts 为准。
