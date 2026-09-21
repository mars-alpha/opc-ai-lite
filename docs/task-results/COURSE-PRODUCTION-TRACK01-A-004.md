# COURSE-PRODUCTION-TRACK01-A-004 — T1-04 Purposeful Iteration Pilot

Status: **TECHNICAL_ACCEPTANCE_PASS / HUMAN_REVIEW_PENDING**

## Scope

- Produce only T1-04 `迭代（Iteration）：把第一版结果改到可用`.
- Reuse `course-builder@0.2.0` + `BEGINNER_QUALITY_V1` + `LESSON_OUTPUT_CONTRACT_V1`.
- Keep T1-01～T1-03 unchanged.
- Do not produce T1-05.
- No Runtime / Schema expansion and no remote migrations.

## Canonical lesson

- Canonical ID: `T1-04`
- Draft lessonId: `t1-04-purposeful-iteration`
- Preview: `/course-builder/preview/track01-batch-a/t1-04`
- Type: APPLICATION
- Gate: CHECK + PRACTICE
- Case Thread: OPC / 自媒体 AI 内容任务

## Beginner boundary

This pilot intentionally does **not** ask a beginner to independently diagnose “哪里不对”.

The course directly provides the practice problem:

> 第 2 个要点太抽象，普通用户看完不知道怎么做。

The learner practices only:

1. `我希望改成什么样`
2. `这次的具体要求`

The goal is one purposeful revision, not multi-round iteration notes or open-ended diagnosis.

## Six-step implementation

1. EXPLAIN — 第一版不满意，不等于整份内容都要重写。
2. EXAMPLE — 对比“重新写好一点”和“只改第 2 个要点 + 明确标准”。
3. CHECK — 只检查模糊重写与具体定向修改的判断。
4. PRACTICE — 问题由课程给定；学员只填写两个字段，并 COPY_TO_AI。
5. REVIEW — 当前按知识密度使用 2 张卡，继续固定 `AI 适合做什么 / AI 不应该替你做什么` 上下对比。
6. CAPABILITY — 能在问题明确时写出一次具体、可检查的定向修改要求。

## Step 4 reference answer

One-click fill forms a complete directly testable OPC / self-media revision request:

- 只修改 OPC AI 学习站自媒体内容的第 2 个要点；
- 改成 AI 初学者能马上理解的具体日常工作场景；
- 使用一个真实使用情境；
- 控制在 2 句话以内；
- 标题与第 1、3 个要点保持不变；
- 不夸大 AI 能力，不补充未经确认的事实。

Clipboard behavior continues to use the global values-only COPY_TO_AI rule.

## Deferred

- Workflow / automatic iteration
- Agent self-correction
- Evaluation Engineering
- Chain-of-Thought
- complex Prompt Engineering
- open-ended complex result diagnosis

## Validation

- `npm run course-builder:accept:track01-a` — PASS
- `npm run typecheck` — PASS
- `npm run course-builder:accept:beginner-quality` — PASS
- `npm run course-builder:check` — PASS
- `npm run build` — PASS

## Human Review focus

1. Step 1 是否足够直观地解释“第一版不好 ≠ 全部重写”。
2. Step 2 的 OPC / 自媒体案例是否让“定向修改”差异一眼可见。
3. Step 3 是否没有把复杂诊断提前给初学者。
4. Step 4 是否真的只要求两个容易填写的动作。
5. Reference Answer 是否能直接复制验证。
6. Step 5 的 2 张卡是否来自本课真实知识密度，而非固定模板。
