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
1. 必须知道
2. 有帮助但非必须
3. 暂时不要放
4. 从“必须知道”中整理最小信息包

Step 4 is self-contained and does not require external AI reply pasteback.

Step 5 uses three review cards and the fixed vertical contrast:
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
4. Step 4 三类信息 + 最小信息包是否自然、容易填写、自包含。
5. Step 5 是否严格上下对比，且不与补充解释 / 误区重复。
6. Step 6 是否证明学员真的能准备足够但不过量的信息。
