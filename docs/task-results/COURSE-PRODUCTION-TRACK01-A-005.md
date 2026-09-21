# COURSE-PRODUCTION-TRACK01-A-005 — T1-04 Closure & T1-05 Reliability Pilot

Status: **T1-04 HUMAN_REVIEW_PASS / T1-05 HUMAN_REVIEW_PASS**

## Scope

- Close T1-04 Human Review after explicit user acceptance.
- Produce only T1-05 `结果可靠性：什么时候必须核验`.
- Reuse `course-builder@0.2.0` + `BEGINNER_QUALITY_V1` + `LESSON_OUTPUT_CONTRACT_V1`.
- No Runtime / Schema expansion and no remote migrations.

## T1-04 closure

T1-04 `迭代（Iteration）：把第一版结果改到可用` is **HUMAN_REVIEW_PASS**.

This does not imply Runtime Provisioning, Runtime Acceptance, AVAILABLE, or publication.

## T1-05 canonical lesson

- Canonical ID: `T1-05`
- Draft lessonId: `t1-05-reliability-verification`
- Preview: `/course-builder/preview/track01-batch-a/t1-05`
- Type: APPLICATION
- Gate: CHECK + PRACTICE
- Case Thread: OPC / 自媒体 AI 内容任务

## Beginner boundary

T1-05 teaches only the minimum reliability judgment:

- 可查证的事实、数字、日期、功能、来源要先核验；
- 会随时间变化的信息要核对最新状态；
- 错误后果越明显，核验优先级越高。

Hallucination appears only as supporting explanation.

Deferred:
- HITL / Permissions / Approval / Core Authority
- Evaluation Engineering
- RAG / Source of Truth / evidence pipelines
- Agent / Workflow
- complex source research and conflict resolution

## Step 4

The learner does not need to complete complex research.

The course provides an OPC / self-media draft containing current-feature and numeric claims. Learner fills only:

1. `我准备核验的内容`
2. `我会去核对什么`

COPY_TO_AI may organize those values into a checklist, but the learner-facing prompt explicitly says AI must not decide truth or falsity.

## Reference answer

One-click fill produces a complete verification checklist around:
- “某 AI 工具本月已向所有免费用户开放文件分析”
- “官方数据显示使用该功能后效率提升 40%”

Verification directions:
- current official feature description + publication date;
- original official data/report + scope/conditions.

## Step 5

Current content density resolves to 3 review cards:
1. factual/verifiable claims;
2. freshness/current-state claims;
3. consequence-if-wrong priority.

Each uses the fixed vertical contrast:
- AI 适合做什么
- AI 不应该替你做什么

## Validation

- `npm run course-builder:accept:track01-a` — PASS
- `npm run typecheck` — PASS
- `npm run course-builder:accept:beginner-quality` — PASS
- `npm run course-builder:check` — PASS
- `npm run build` — PASS

## Human Review focus

1. Step 1 是否让“写得像真的 ≠ 已核实”足够直观。
2. Step 2 是否清楚区分创意表达与事实 / 最新信息。
3. Step 3 是否只检查最低可靠性判断。
4. Step 4 是否足够轻，不把复杂研究工作提前交给 Beginner。
5. COPY_TO_AI 是否清楚限定为“整理清单”，而不是让 AI 自证事实。
6. Step 5 的 3 张卡是否来自真实知识密度。

## Human Review closure

User explicitly accepted T1-05. T1-05 is **HUMAN_REVIEW_PASS**. Runtime readiness is tracked separately by `TRACK01-PHASE1-RUNTIME-001`.
