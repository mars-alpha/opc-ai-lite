# Foundation Continuity Trial v1

Status: **TECHNICAL_PASS_LANGUAGE_REVISED_HUMAN_REVIEW_PENDING**
Task: **FOUNDATION-CONTINUITY-TRIAL-001**

## Trial scope

Representative lessons:

1. F1-01 `beginner-ai-use-cases`
2. F1-02 `beginner-ai-result-quality`
3. F2-01 `beginner-prompt`
4. F2-02 `beginner-context`
5. F2-03 `beginner-iteration`

Selected Skill: **course-builder@0.2.0**  
Quality Profile: **BEGINNER_QUALITY_V1**  
Formal Brief: **FOUNDATION_STAGE1_STAGE2_CONTINUITY_BRIEFS_V1.md**

No Skill code was modified.

## Learner-facing language refinement

FOUNDATION-CONTINUITY-TRIAL-001-A keeps the same trial architecture but revises visible copy:

- Chinese first;
- AI professional terms first appear as 中文（English）;
- internal Artifact labels are translated to natural Chinese for learner UI;
- internal OPC/self-media Case Thread remains in metadata/grounding, but learner copy uses neutral real-content scenarios and does not repeatedly expose OPC / 自媒体.

The acceptance now separately verifies hidden Case Thread continuity and learner-facing case neutralization.

## Trial design

Historical production Drafts remain untouched.

This trial uses:

- `fixtures/course-builder/foundation-continuity-trial.ts`
- independent `version=1.1.0-continuity-trial`
- explicit trial metadata for:
  - inheritedArtifact
  - artifactOutput
  - nextReuse
  - caseThread
  - doNotReteach

This metadata is controlled production context outside the current v0.2 Skill schema; it does not expand Skill authority.

## Artifact chain proven in trial

```text
REAL_TASK_SEED
→ AI_FIRST_DRAFT
→ SELECTED_BETTER_DRAFT_WITH_COMPARISON_NOTE

PREPARED_DRAFT_WITH_SOURCE_PLAN
→ CLEAR_TASK_BRIEF_WITH_NEW_DRAFT
→ CONTEXT_PACK_WITH_CONTEXT_ENRICHED_DRAFT
→ ITERATION_NOTES_WITH_ITERATED_DRAFT
```

The trial intentionally samples both Stage 1 and Stage 2 rather than reworking all eight lessons before evidence exists.

## Key continuity results

### F1-01

Creates and preserves **AI First Draft** from one OPC / self-media AI topic.

Does not teach Prompt / Context formally.

### F1-02

Continues the exact same Draft.

Only performs a **single-variable comparison** and produces Better Draft + Comparison Note.

Does not become an early Prompt lesson.

### F2-01

Does not re-prove that clearer input improves output.

It formalizes prior experience into **Clear Task Brief**.

### F2-02

Does not re-teach “you know != AI knows” as the lesson.

It produces a **Context Pack** for the same Artifact.

### F2-03

Does not switch to an unrelated customer-message case.

It modifies the same Context-enriched Draft and produces **Iterated Draft**.

## Validation

PASS:

- `npm run course-builder:accept:continuity-trial`
- `npm run course-builder:check`
- `npm run course-builder:accept:beginner-quality`
- `npm run learning:shell:accept`
- `npm run typecheck`
- `npm run build`

Production build: **51 pages**.

The first trial acceptance run correctly caught F1-02 because its main visible body did not explicitly preserve the OPC / self-media case thread. The Draft was corrected; the acceptance rule was not weakened.

## Course Builder v0.2 decision

Current evidence:

**v0.2 is technically sufficient for the current Continuity Brief trial.**

The trial shows Continuity can currently be controlled through:

```text
Canonical Curriculum / Formal Brief
+ course-builder@0.2.0
+ controlled trial metadata
+ deterministic acceptance
+ Human Review
```

Therefore:

- do NOT implement course-builder@0.3.0 now;
- do NOT create COURSE-BUILDER-SKILL-006 now;
- keep v0.3 Continuity Profile as a future candidate only.

This is not a permanent rejection of v0.3.

A Skill upgrade becomes justified only if Human Review / later production shows repeated structural failures that cannot be reasonably controlled by Formal Brief + validation.

## Human Review

Preview routes:

- `/course-builder/preview/continuity-trial/beginner-ai-use-cases`
- `/course-builder/preview/continuity-trial/beginner-ai-result-quality`
- `/course-builder/preview/continuity-trial/beginner-prompt`
- `/course-builder/preview/continuity-trial/beginner-context`
- `/course-builder/preview/continuity-trial/beginner-iteration`

Human Review should judge:

1. Does F1-01 actually feel like the start of one real task?
2. Does F1-02 feel like continuation rather than repeated Prompt teaching?
3. Does F2-01 feel like formalizing prior experience rather than repeating Stage 1?
4. Does F2-02 feel like building materials for the same task?
5. Does F2-03 visibly continue the same Artifact?
6. Does the same real-content task stay continuous without unnecessary OPC / self-media wording?
7. Do professional AI terms appear naturally as 中文（English） and then return to Chinese-first wording?

## Boundary

Current Foundation status remains:

- `IN_PRODUCTION + COMING_SOON`
- Runtime paused
- no AVAILABLE
- no formal Progress / Completion writes

The remaining F1-03 / F1-04 / F2-04 are not yet reworked as trial Drafts.
