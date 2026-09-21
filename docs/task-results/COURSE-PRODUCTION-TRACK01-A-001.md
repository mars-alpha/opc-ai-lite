# COURSE-PRODUCTION-TRACK01-A-001 — T1-01 Pilot Production

Status: **T1-01 TECHNICAL_ACCEPTANCE_PASS / HUMAN_REVIEW_PENDING**

Canonical Lesson: **T1-01 — AI 能帮什么，不能帮什么**  
Formal Brief: **TRACK01_BATCH_A_T1_01_T1_05_FORMAL_BRIEFS_V1.md**  
Skill Decision: **EXISTING_SKILL**  
Selected Skill: **course-builder@0.2.0**  
Quality Profile: **BEGINNER_QUALITY_V1**  
Draft Version: **1.0.0-track01-a**  
Grounding: **REVIEWED_KNOWLEDGE**  
Runtime Scope: **Preview only / no formal Progress or Completion writes**

Pilot-first rule: T1-01 technical acceptance + Human Review must complete before T1-02～T1-05 are expanded.

Preview:
`/course-builder/preview/track01-batch-a/t1-01`

## Technical acceptance

- `npm run course-builder:accept:track01-a` — PASS
- `npm run course-builder:accept:beginner-quality` — PASS
- `npm run course-builder:check` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS
- Next.js build includes `/course-builder/preview/track01-batch-a/t1-01`

During acceptance, a deterministic validator drift was found and corrected: `BEGINNER_QUALITY_V1` still limited Step 5 Review to 3 items, while the approved quality standard allows 2–4. Validator now permits 4 and rejects 5; regression acceptance covers both cases. No Runtime / Schema / UI expansion was required.

## Human Review focus

1. T1-01 是否真正教会“AI 应该帮到什么程度”，而不是功能清单；
2. 三题 Check 是否像真实判断；
3. Step 4 是否能自然完成 3-task classification + selected goal + AI First Draft；
4. Step 5 四个判断是否清楚且没有提前进入 T1-05 / T1-20；
5. 第一版是否值得直接带入 T1-02。

## Human Review refinement 1

只按产品负责人反馈修改三项：

1. **简单任务先行**：T1-01 第一屏不再同时抛出三类抽象判断，而从 OPC / 自媒体默认案例开始——“看到一个值得分享的 AI 新变化，先把几句零散想法整理成 3 个清楚重点”。完成第一次简单成功体验后，再逐步扩展到可协助 / 需谨慎核验 / 人负责最终决定。
2. **清理 Reference Fill**：Reference Answer、rubric example 与一键填充字段只保留学习者应真实产出的内容；移除“下一课继续使用”“下一课检查”等内部 Artifact orchestration 文案。
3. **锁定 Batch A 默认 Case Thread**：Formal Brief 正式写明 T1-01～T1-05 默认连续案例为 `OPC / 自媒体 AI 内容任务`；方法层仍行业中立，学员可替换为房地产、电商、教育、企业服务等真实任务。

新增专项 acceptance：
- `TRACK01_T101_SIMPLE_FIRST_TASK=PASS`
- `TRACK01_T101_REFERENCE_FILL_CLEAN=PASS`
- `TRACK01_T101_OPC_DEFAULT_CASE_THREAD=PASS`
- `npm run typecheck` — PASS
- `npm run build` — PASS

T1-01 保持 **HUMAN_REVIEW_PENDING**；T1-02～T1-05 仍未扩产。

## Human Review refinement 2 — Step 4 system boundary

第二轮反馈确认，课程系统并不会消费或处理外部 AI 的回复，因此 Step 4 不应要求学习者把 AI 输出再粘贴回课程。已重新划清边界：

- Step 4 课程内只保留两个学习者自己的输入：`我的 3 个真实任务` + `我选中的任务`；
- 第二栏用一句话写清“希望 AI 先帮我完成什么”，供 T1-02 继续加工；
- 外部 AI 操作只作为可选体验，不回填、不评分、不成为课程 Artifact；
- 原 `AI 给出的第一版 / draft` 字段彻底移除；
- Reference Answer / 一键填充只包含上述两个字段的直接示例值，不混入解释、教学理由、下一课 handoff 或内部术语；
- Artifact 改为 `TASK_FIT_NOTE_WITH_SELECTED_TASK_GOAL`，T1-02 不再依赖 AI First Draft。

新增 acceptance：`TRACK01_T101_STEP4_NO_EXTERNAL_AI_REPLY_FIELD`、`TRACK01_T101_REFERENCE_FILL_PURE_VALUES`。状态继续保持 **HUMAN_REVIEW_PENDING**。

## Human Review refinement 3 — restore v0.2 teaching flow

第三轮反馈确认问题不在 Shell / 字段能力，而在课程构建偏离了已批准的 `course-builder@0.2.0`：案例与 Practice 被 Artifact continuity 反向驱动，导致 Step 2 和 Step 4 都不自然。此次不改框架、不改 Skill、不新增交互，而是直接恢复仓库中已验证过的 Beginner-first 构建方式：

- EXPLAIN 保留 Beginner-first 逻辑，但案例层继续遵守已锁定的 `OPC / 自媒体 AI 内容任务` Case Thread，从做一条真实内容开始；
- EXAMPLE 围绕同一条内容使用三个直观步骤：想标题、整理已有资料、列内容角度；
- CHECK 继续验证“哪些工作适合先让 AI 协助 / 最终判断不能直接交出去”；
- PRACTICE 沿用现有填写字段，但只要求 `我原本要做的事` + `AI 先帮哪一步`，不再要求 3-task classification、任务分类或额外任务目标；
- Reference Fill 使用 OPC / 自媒体直接示例：`做一条介绍某个 AI 工具实际用途的内容` + `先根据我已有的资料列 3 个标题方向`；
- T1-01 Artifact 收敛为 `TASK_FIT_NOTE`。T1-02 可以复用，但不得反向要求 T1-01 为后续课生产额外字段。

新增专项 acceptance：`TRACK01_T101_BEGINNER_OBVIOUS_EXAMPLE`、`TRACK01_T101_STEP4_NATURAL_PRACTICE`。状态继续保持 **HUMAN_REVIEW_PENDING**，T1-02～T1-05 不扩产。
