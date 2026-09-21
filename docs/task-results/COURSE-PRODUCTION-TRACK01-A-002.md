# COURSE-PRODUCTION-TRACK01-A-002 — T1-01 Human Review Closure & T1-02 Prompt Pilot

Status: **T1-01 HUMAN_REVIEW_PASS / T1-02 TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING**

## Scope

- Close T1-01 Human Review based on the final approved learner experience.
- Produce only T1-02 `Prompt：把任务说清楚`.
- Reuse `course-builder@0.2.0` + `BEGINNER_QUALITY_V1` + `LESSON_OUTPUT_CONTRACT_V1`.
- Keep T1-03～T1-05 out of production.
- No Runtime / Schema expansion and no remote migrations.

## T1-01 closure

T1-01 remains canonical lesson `t1-01-ai-task-fit`.

Human Review PASS confirms:
- Beginner-first OPC / 自媒体 content case thread is understandable.
- Step 4 keeps the existing fill-field shell and only asks `我原本要做的事` + `AI 先帮哪一步`.
- Hint numbering is owned by UI.
- Step 5 boundary cards use top / bottom contrast: `AI 适合做什么` / `AI 不应该替你做什么`.
- Review cards, explanation and pitfalls have separate responsibilities.
- T1-01 naturally retains `TASK_FIT_NOTE`; it does not fabricate downstream fields.

Human Review PASS does **not** mean Runtime Ready or AVAILABLE.

## T1-02 pilot

Canonical lesson: **T1-02 — Prompt：把任务说清楚**  
Draft lessonId: `t1-02-clear-prompt`  
Preview: `/course-builder/preview/track01-batch-a/t1-02`

Permanent boundary:
- Prompt = Task Instruction / AI 要做什么.
- T1-02 does not formally teach Context.
- Background facts / references / source material are deferred to T1-03.

Core method:
1. 任务目标
2. 使用对象
3. 关键要求 / 限制
4. 输出形式

Step 4 keeps only these four natural learner fields and forms `CLEAR_TASK_BRIEF`.
Copying the brief to an external AI is optional experience; AI replies are not pasted back and are not course artifacts.

Step 5 uses four review cards because the knowledge naturally has four judgments. It does not reuse T1-01's boundary-card template mechanically.

## Validation

- `npm run course-builder:accept:track01-a` — PASS
- `npm run course-builder:accept:beginner-quality` — PASS
- `npm run course-builder:check` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS

## Human Review focus for T1-02

1. Step 1 是否让学员立即明白“问题是任务没说清，而不是 Prompt 不够长”。
2. Step 2 是否只通过四项变化讲透核心方法。
3. Step 3 是否检查真实任务判断，而不是 Prompt 术语。
4. Step 4 四字段是否自然、容易填写，没有提前混入下一课资料方法。
5. Step 5 四卡是否互补，不和解释 / pitfalls 重复。
6. Step 6 是否证明学习者真的能独立写出 Clear Task Brief。
