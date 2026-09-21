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
