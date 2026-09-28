# Track 05 Batch B — T5-04～T5-06 Formal Briefs v1

Status: **FORMAL_BRIEF_APPROVED_V1 / READY_FOR_COURSE_BUILDER**
Track Owner: `docs/learning/TRACK05_CATALOG_CONTEXT_V1.md`
Scope: **问题定义 → 目标状态 → 价值判断**
Boundary: **USE_EXISTING_UNIFIED_LESSON_SHELL_ONLY / NO NEW UI / NO CSS**

## Batch goal
Batch A 已留下问题观察、关键角色和当前状态基线。Batch B 不再继续“发现问题”，而是把这些事实收敛成可以进入方案决策的三件事：
1. T5-04：把抱怨收敛成对象、场景、影响、范围和约束清楚的问题定义；
2. T5-05：定义做成之后业务具体要变成什么，而不是先描述功能；
3. T5-06：判断这件事是否值得继续投入，以及投入判断还缺哪些证据。

Batch output: **Problem / Target / Value Brief**。

## T5-04 — 把模糊抱怨变成一个真正能解决的问题
Primary Knowledge Home: **Problem Statement / Scope / Constraints**
Core judgment: 一个可解决的问题定义必须说清“谁在什么场景遇到什么问题、造成什么影响、当前范围是什么、哪些约束不能忽略”，而不是把原因猜测或解决方案写进问题本身。
Must-retain judgments:
- Problem Statement 只写已确认的问题与范围，不把方案写进去；
- Scope 必须明确“这次先解决什么 / 暂不解决什么”；
- Constraint 是现实边界，不是功能愿望；
- 未确认的根因继续保留为待验证，不强行写成确定事实。
Practice: 学员自己的问题定义；字段围绕“我想解决的问题、谁受影响、发生场景、已确认影响、这次范围、必须遵守的约束、希望 AI 帮我检查什么”。
COPY_TO_AI: 让 AI 检查是否混入方案、范围是否过大、约束是否缺失，并优化成清楚 Problem Brief。
Do not teach: Target State / ROI / solution option / architecture。

## T5-05 — 做完以后，业务应该具体变成什么样
Primary Knowledge Home: **Target State / Success Condition**
Core judgment: Target State 描述“业务以后如何运行、什么结果算改善”，不是“要做哪些功能”。
Must-retain judgments:
- 目标状态要从现状基线出发；
- 成功条件应可观察、可比较，但不知道具体阈值时可以先写方向与待确认；
- 功能列表不等于业务目标；
- 目标不能脱离 Owner/User 的真实工作方式。
Practice: 学员自己的目标状态；字段围绕“当前问题、希望以后怎样运作、希望哪些结果改变、哪些必须保持、目前还不知道的成功阈值、希望 AI 帮我检查什么”。
COPY_TO_AI: 让 AI 区分目标状态与功能愿望，指出不可观察或无法比较的表述，并优化 Target Brief。
Do not teach: Business Case / solution path / Pilot design。

## T5-06 — 这件事值得投入多少时间和成本
Primary Knowledge Home: **Value Hypothesis / Business Case / Prioritization**
Core judgment: “问题存在”不等于“值得马上投资”；投入判断必须把问题成本、潜在价值、实现成本/风险和证据不确定性放在一起。
Must-retain judgments:
- 当前问题成本必须来自 Baseline 或明确估算来源；
- Value Hypothesis 是待验证假设，不是承诺；
- 不用伪精确 ROI 掩盖缺失数据；
- 当价值不清楚时，最合理动作可能是先补证据，而不是立项。
Practice: 学员自己的投入判断；字段围绕“问题当前成本/影响、目标改善、可能价值、预计投入与风险、仍缺证据、希望 AI 帮我判断什么”。
COPY_TO_AI: 让 AI 帮助区分事实/估算/假设，指出最影响投入判断的未知，并形成 Continue / Evidence First / Deprioritize 的初步建议依据，不替业务负责人最终拍板。
Do not teach: Build vs Buy / readiness / final post-Pilot investment gate。

## Cross-lesson acceptance
T5-04 回答“到底解决什么”；T5-05 回答“做成后变成什么”；T5-06 回答“值不值得继续投入”。三课不得互相替代。
Step 4 必须以学习者自己的真实问题为主体；Reference Fill 只示范写法。
Step 5 固定覆盖 **AI适合做什么 / AI不应该替你做什么**，并用 knowledgeDepth 解释边界。
