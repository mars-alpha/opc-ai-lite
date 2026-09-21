# Foundation Stage 2 Formal Briefs v1

Status: **SUPERSEDED_BY_CONTINUITY_BRIEF_V1**
Batch: **FOUNDATION-STAGE2-BATCH-A**
Selected Skill: **course-builder@0.2.0**
Quality: **BEGINNER_LESSON_QUALITY_STANDARD_V1 / BEGINNER_QUALITY_V1**

This file records the pre-continuity Stage 2 production brief used by COURSE-PRODUCTION-003. New Stage 1 / Stage 2 production must use `FOUNDATION_STAGE1_STAGE2_CONTINUITY_BRIEFS_V1.md`; do not use this file as current Course Builder input.

## Batch intent

Stage 2 只训练“怎样和 AI 基本协作”，不进入 Stage 3 模型机制，也不进入 Workflow / Agent / Evaluation 工程。

固定顺序：

1. F2-01 `beginner-prompt` — Prompt：怎样把想做的事情说清楚 — APPLICATION
2. F2-02 `beginner-context` — Context：AI 只知道你这次给它看到的东西 — CONCEPT
3. F2-03 `beginner-iteration` — 第一次结果不对，怎样继续让 AI 改好 — APPLICATION
4. F2-04 `beginner-result-check` — AI 的结果什么时候能直接用，什么时候一定要检查 — APPLICATION

## F2-01 Prompt

Learner question: 怎样把我想让 AI 做的事情说清楚？

Primary Knowledge Home: Prompt.

Outcome: 能把模糊要求改成包含任务、必要背景、结果要求的可执行说明。

Anti-overlap:
- 不教万能 Prompt 模板；
- 不教 System Prompt；
- 不教 Context Window；
- 不把 Task Context 的定义全部提前讲完。

Gate: CHECK + PRACTICE.

## F2-02 Context

Learner question: AI 为什么不知道我明明已经知道的背景？

Primary Knowledge Home: Task Context.

Outcome: 能判断 AI 当前任务缺哪些必要信息。

Anti-overlap:
- 不教 Token；
- 不教 Context Window 容量；
- 不教 Context Engineering；
- 不把 Memory 当 Context。

Gate: CHECK.

## F2-03 Iteration

Learner question: 第一次结果不对，我应该怎么继续？

Primary Knowledge Home: Iteration / Clarification.

Outcome: 能指出偏差、补信息、给参考，必要时让 AI 先提出澄清问题。

Anti-overlap:
- 不教 Workflow loop；
- 不教 Agent self-correction；
- 不把“再来一个”当有效迭代。

Gate: CHECK + PRACTICE.

## F2-04 Result Check

Learner question: AI 的结果什么时候可以先参考，什么时候必须核实？

Primary Knowledge Home: Basic reliability judgment.

Outcome: 能按事实性、错误代价和可验证性决定检查力度。

Anti-overlap:
- 不教 Evaluation Framework；
- 不教 Test Set / Regression；
- 不重复 F1-03“AI 会说错”的定义，而是训练使用判断。

Gate: CHECK + PRACTICE.

## Production boundary

本 Batch 只进入：
Formal Brief → course-builder@0.2.0 → Code Validation → Draft Preview → Human Review.

本任务不执行 Runtime Provisioning，不发布，不写正式 Progress / Completion，不将任何 Lesson 切为 AVAILABLE。
