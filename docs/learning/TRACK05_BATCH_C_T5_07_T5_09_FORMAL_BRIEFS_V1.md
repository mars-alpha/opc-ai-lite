# Track 05 Batch C — T5-07～T5-09 Formal Briefs v1

Status: **FORMAL_BRIEF_APPROVED_V1 / READY_FOR_COURSE_BUILDER**
Scope: **比较解决路径 → 检查落地条件 → 收敛方案范围**
Boundary: **NO NEW UI / NO CSS / NO IMPLEMENTATION ENGINEERING**

## Batch goal
Batch B 已得到问题、目标、价值 Brief。Batch C 负责决定“走哪条路、现在能不能落、先做到哪里”，不进入具体系统实现。
Batch output: **Solution Option Matrix + Readiness Checklist + Solution Scope Brief**。

## T5-07 — 不是所有问题都要“自己做系统”：先比较解决路径
Primary Knowledge Home: **Solution Options / Build-Buy-Configure-Manual**
Core judgment: 同一个问题可能通过保持手工、优化流程、配置现有工具、购买产品、轻量集成或自建解决；路径选择应由价值、复杂度、依赖、控制需求和学习速度共同决定。
Must-retain judgments:
- “能用 AI 做”不等于“应该自建”；
- 最低成本路径也可能是先不自动化；
- 比较选项必须用同一组判断维度；
- 决策可先选择可逆、可学习的路径。
Practice: 学员自己的解决路径比较；字段包括问题/目标、当前做法、候选路径、最在意的比较维度、已知约束、希望 AI 帮我比较什么。
Do not teach: 详细 API/MCP 实现、readiness 深挖、正式 architecture。

## T5-08 — 数据、权限和依赖不具备，再好的方案也落不了地
Primary Knowledge Home: **Solution Readiness / Data / Access / Dependency / Risk**
Core judgment: 方案在纸面上合理，不代表具备落地条件；必须逐项确认数据、权限、系统依赖、责任与风险是否真实具备。
Must-retain judgments:
- “理论上能接”不等于“现在有权限/数据可用”；
- 未确认依赖必须标记阻塞/待确认；
- Readiness 只识别工程或合规阻塞点，不教授其技术实现；
- 高风险项可以让方案降级、延后或改变路径。
Practice: 学员自己的 Readiness 检查；字段包括选定路径、所需数据、权限、外部依赖、人工责任、风险/合规、希望 AI 帮我找缺口什么。
Do not teach: OAuth/IAM 配置、MCP transport、完整安全架构。

## T5-09 — 把想法收敛成一份可以开始做的解决方案
Primary Knowledge Home: **Solution Scope / Decision-level Architecture / Delivery Plan**
Core judgment: 可启动方案必须把目标、边界、主要组成、输入输出、依赖、人工责任和第一阶段交付物说清楚；不是把所有可能功能写进路线图。
Must-retain judgments:
- Scope 必须回答“第一阶段做什么/不做什么”；
- 只画决策级组成关系，不重教 Workflow Blueprint；
- 依赖和 Owner 要进入方案范围；
- 第一阶段应支持后续 Prototype/Pilot，而非追求完整。
Practice: 学员自己的 Solution Scope Brief；字段包括选定路径、第一阶段目标、包含/不包含、主要组成与责任、关键依赖、第一交付物、希望 AI 帮我检查什么。
Do not teach: 原型实验设计、Pilot 用户与停止条件。

## Cross-lesson acceptance
T5-07 选路，T5-08 检查能不能走，T5-09 定义先走到哪里。不得把三课压成一节“方案设计”。
