# Track 05 Six-step Curriculum Audit v1

Status: **HUMAN_REVIEW_PASS / DIRECTORY_APPROVED_V1**

## 1. Audit question

Track 05 的目录不按“FDE 有哪些专业名词”生成，而按：

> 学习者要把一个真实业务问题推进到 AI 方案落地，途中必须掌握哪些不可缺少、可独立练习的判断？

每个候选必须同时满足：
- New Judgment：比 Track 04 新增一个清晰判断；
- Practice：能在真实业务问题上完成动作；
- Artifact：产生后续会继续使用的结果；
- Six-step：六步都能围绕同一个 Primary Knowledge Home；
- Anti-repeat：不重新教授 Track 01～04；
- Shell fit：不新增课程 UI 才能教清楚。

## 2. Candidate audit

| ID | Primary Knowledge Home | New judgment | Practice output | Six-step | Anti-repeat | Result |
| --- | --- | --- | --- | --- | --- | --- |
| T5-01 | Root Problem Discovery | 症状不等于根问题；先找业务断点再谈 AI | Problem Observation Notes | PASS | 不重复 Workflow suitability | KEEP |
| T5-02 | Stakeholder Map | 使用者、受影响者、Owner、Approver 不是同一角色 | Stakeholder Map | PASS | Track 03 audience ≠ internal stakeholder | KEEP |
| T5-03 | Current-State Baseline | 没有当前时间/成本/质量/风险基线就不能判断价值 | Baseline | PASS | 不重复 T4 evaluation test mechanics | KEEP |
| T5-04 | Problem Statement | 把抱怨收敛成对象、场景、影响、范围和约束 | Problem Brief | PASS | 不重复 T3 use case | KEEP |
| T5-05 | Target State | 先定义业务应变成什么，再谈解决方案 | Target-State Brief | PASS | 不重复 Workflow output | KEEP |
| T5-06 | Value Hypothesis | “能做”不等于“值得投入” | Value / Business Case | PASS | 不重复 T4 automation suitability | KEEP |
| T5-07 | Solution Options | 先比较手工/配置/购买/自建等路径，不默认造系统 | Option Matrix | PASS | 调用 T4 building blocks | KEEP |
| T5-08 | Solution Readiness | 数据、权限、依赖、风险是落地前置条件 | Readiness Checklist | PASS | 不教 OAuth/IAM 实现 | KEEP |
| T5-09 | Solution Scope | 把选定路径收敛成边界、交付物、依赖和计划 | Solution Scope Brief | PASS | 不重新画 Workflow Blueprint | KEEP |
| T5-10 | Prototype Hypothesis | 原型只证明最关键未知，不追求完整 | Prototype Hypothesis | PASS | 不教系统实现 | KEEP |
| T5-11 | Pilot Design | Pilot 必须定义真实用户/场景/证据/停止条件 | Pilot Plan | PASS | 停止条件用于 Pilot，不重教 T4 failure | KEEP |
| T5-12 | Pilot Learning | Pilot 失败要区分方案问题、数据问题、流程问题和使用摩擦 | Learning Log / Iteration Decision | PASS | 不重复 T4 retry；不提前重讲 Adoption | KEEP |
| T5-13 | Evaluation Decision | 用 Baseline→Outcome 决定继续、调整或停止投资 | Evaluation Decision | PASS | 不重教测试集/回归技术 | KEEP |
| T5-14 | Adoption | 有效 ≠ 会被用；识别信任、摩擦、训练与激励 | Adoption Plan | PASS | 新增组织采用问题 | KEEP |
| T5-15 | Rollout / Ownership | Pilot 成功后需要 Owner、支持、反馈和版本责任 | Operating Plan | PASS | 不重复 Human Approval | KEEP |
| T5-16 | FDE Capstone | 把问题、价值、方案、Pilot、证据与采用计划整合成交付 | AI Solution Package | PASS | Capstone integration，不声明新 Primary Knowledge Home | KEEP_CAPSTONE |

Human Review result: **15 PRIMARY KNOWLEDGE HOMES KEEP + 1 CAPSTONE KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE / 0 REORDER**。

## 3. Cross-lesson overlap audit

高风险相邻组合：

### T5-01 vs T5-04
- T5-01：发现“真正的问题在哪里”；
- T5-04：把已经确认的问题写成可执行 Problem Statement；
- 不得在 T5-04 重讲现场观察方法。

### T5-03 vs T5-06 vs T5-13
- T5-03：建立当前 Baseline；
- T5-06：基于 Baseline 提出价值假设与投入判断；
- T5-13：用 Pilot 后真实 Outcome 对比 Baseline 做最终决策。

### T5-07 vs T5-09
- T5-07：比较解决路径；
- T5-09：对已经选中的路径定义交付范围。
- T5-09 不重新讨论“买还是做”。

### T5-10 vs T5-11
- T5-10：最小原型验证关键假设；
- T5-11：把方案放进真实用户与真实业务场景 Pilot。

### T5-12 vs T5-13
- T5-12：Pilot 过程中如何学习和改，只识别方案、数据、流程与使用摩擦；
- T5-13：Pilot 结束后是否继续投入；
- T5-12 不提前教授 T5-14 的 Adoption / Trust / Enablement 方法。

### T5-14 vs T5-15
- T5-14：为什么用户不用、怎样降低采用阻力；
- T5-15：谁长期负责、怎样扩大和持续运营。

## 4. Track 04 separation audit

Track 05 不新增以下 Primary Knowledge Home：
API / MCP / Agent / Retry / Idempotency / HITL / Workflow State / Structured Handoff / Node Context / Workflow Evaluation。

它们可以出现在解决方案案例里，但只能作为“已学能力/已有设计块”。

若某课的 Step 2～5 主要在重新解释这些主题，判定：
**CROSS_TRACK_KNOWLEDGE_OVERLAP_FAIL**。

## 5. Deferred knowledge resolution

进入 Track 05 Core 的不是工程实现，而是工程事实对方案可行性的影响：

- OAuth / Secrets / IAM → T5-08 的“访问与权限是否具备”；
- Data / Source of Truth → T5-08 的数据准备度；
- Sandbox / deployment / transport → T5-08 的依赖与风险项；
- audit / compliance → T5-08 supporting risk / T5-15 operating responsibility；
- 技术选型 → T5-07 option comparison supporting input。

完整代码、配置和平台工程继续 Technical / Enterprise。

## 6. UI / production audit

T5-01～T5-15 与 T5-16 Capstone 都能通过现有 Unified Lesson Shell 教学：
- EXPLAIN / EXAMPLE 用真实业务材料；
- CHECK 用业务判断；
- PRACTICE 用结构化文本形成真实产物；
- REVIEW 建立 AI 使用边界；
- CAPABILITY 用现实 FDE 场景。

不需要新 UI / CSS / Renderer。

## 7. Human Review conclusion & next gate

**DIRECTORY_APPROVED_V1 / HUMAN_REVIEW_PASS**

结论：课程数量与顺序保持不变；T5-01～T5-15 为独立 Primary Knowledge Home，T5-16 为综合交付 Capstone。未发现必须新增独立课程的 FDE Core 缺口，也未发现需要合并或拆分的相邻课程。

Next Gate：**Production Batching → T5 Formal Brief**。
