# FOUNDATION-CONTINUITY-TRIAL-001-C — Six-Step Pedagogy Refinement

Status: **TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING**

## Goal

Refine the learner-facing responsibilities of Step 4 / Step 5 / Step 6 without changing Lesson IDs, Lesson Types, Completion Gates, Course Builder Skill version, Catalog state, or Runtime publication status.

## Decisions

- Course Builder v0.2 schema is not upgraded in this task.
- Existing fields are clarified before adding new Skill schema.
- Step 5 `review` becomes the primary reusable knowledge/judgment framework.
- `mistakes` becomes supporting correction, not the main review content.
- Review framework uses 2–3 items as needed, not a fixed three-card rule.
- Each review item must contain a clear conclusion plus explanation.
- Step 6 combines capabilityGain + selfAssessment + nextLessonValue to answer: what I can do, how I know I can do it, where I can use it, and why the next lesson matters.
- CONCEPT Step 4 remains non-gated but must provide actionable learning support.

## beginner-context

- Step 4 remains MINI_TASK and CHECK-only completion policy.
- Added a concrete reference answer.
- Non-gated preview activity now supports learner input, copy-my-work, one-click reference fill, and copy reference answer.
- Hints remain available.

## Validation

PASS:
- course-builder:accept:continuity-trial
- REVIEW_FRAMEWORK
- CAPABILITY_EVIDENCE
- GUIDED_SUPPORT
- course-builder:check
- beginner-quality
- unified shell
- typecheck
- build
- git diff --check

Production build: 51 pages.

## Human Review

Targeted review should focus on:
- Step 5 of the five trial lessons;
- Step 6 of the five trial lessons;
- Step 4 support flow in beginner-context.