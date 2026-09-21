# COURSE-PRODUCTION-TRACK01-A-003 — T1-02 Human Review Closure & T1-03 Context Pilot

Status: **T1-02 HUMAN_REVIEW_PASS / T1-03 TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING**

## Scope

- Close T1-02 Human Review after the final learner-copy, Step 4 and Step 5 corrections.
- Produce only T1-03 `上下文（Context）：给 AI 足够但不过量的信息`.
- Reuse `course-builder@0.2.0` + `BEGINNER_QUALITY_V1` + `LESSON_OUTPUT_CONTRACT_V1`.
- Keep T1-04～T1-05 out of production.
- No Runtime / Schema expansion and no remote migrations.

## T1-02 closure

T1-02 remains canonical lesson `t1-02-clear-prompt`.

Human Review PASS confirms:
- learner-facing copy is Chinese-first;
- `Clear Task Brief` is not exposed to learners;
- common AI terminology uses Chinese-first wording such as `提示词（Prompt）`;
- Step 4 is self-contained and does not expose internal lesson IDs;
- Step 5 uses the fixed vertical contrast UI: `AI 适合做什么` / `AI 不应该替你做什么`;
- internal artifact identity remains `CLEAR_TASK_BRIEF`, but it is not learner-facing.

Human Review PASS does **not** mean Runtime Ready or AVAILABLE.

## T1-03 pilot

Canonical lesson: **T1-03 — 上下文（Context）：给 AI 足够但不过量的信息**  
Draft lessonId: `t1-03-minimum-context`  
Preview: `/course-builder/preview/track01-batch-a/t1-03`

Permanent boundary:
- 提示词 = AI 要做什么；
- 上下文（Context） = AI 为了完成当前任务需要知道什么；
- 本课不教授 Knowledge Base / Source of Truth / Memory / RAG / Context Engineering；
- 本课不重新教授提示词措辞。

Core method:
1. 判断当前任务必须知道什么
2. 判断哪些信息这次可以先不放
3. 从必要信息中整理最小信息包

Step 4 is self-contained and reduced to two learner fields: `我要 AI 完成的任务` + `这次提供给 AI 的必要信息`. The existing copy affordance combines them into learner-visible content that can be pasted directly into the learner's own AI for immediate verification. AI reply pasteback is not required.
T1-03 Preview uses value-only copy for this action: the form labels remain visible in the course, but clipboard content contains only the learner-entered task and necessary information. T1-01 / T1-02 keep their existing copy behavior.

Step 5 card count is **not fixed**. It follows the global 2–4 rule based on the lesson's concrete reusable judgments. T1-03 currently uses **2 cards**: 必要信息、够用就停. The fixed vertical contrast remains:
- upper: `AI 适合做什么` = core judgment;
- lower: `AI 不应该替你做什么` = boundary understanding.

## Validation

- `npm run course-builder:accept:track01-a` — PASS
- `npm run course-builder:accept:beginner-quality` — PASS
- `npm run course-builder:check` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS

## Human Review focus for T1-03

1. Step 1 是否让学员自然理解“任务说清楚 ≠ AI 已经知道必要信息”。
2. Step 2 是否把“太少 / 太多 / 刚好够用”讲清楚。
3. Step 3 是否只检查信息取舍，不提前教授后续知识。
4. Step 4 的“任务 + 必要信息”两个字段是否足够轻，并能形成可直接复制到自己的 AI 软件里验证的内容。
5. Step 5 卡片数量是否来自本课真正需要总结的判断，而不是预设数量；并保持上下对比、不与补充解释 / 误区重复。
6. Step 6 是否证明学员真的能准备足够但不过量的信息。
