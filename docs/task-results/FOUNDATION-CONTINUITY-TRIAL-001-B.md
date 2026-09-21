# FOUNDATION-CONTINUITY-TRIAL-001-B — Six-Step Content Integrity

Status: **TECHNICAL_PASS_TARGETED_HUMAN_REVIEW_PENDING**

## Trigger

Human Review found two structural issues in the five Continuity Trial lessons:

1. Step 3 still showed mastery questions inherited from superseded Drafts instead of the current Continuity lesson version.
2. beginner-context had a PRACTICE step in the six-step shell but no meaningful learner action in Step 4.

## Root cause

This was not a one-off visual demo issue.

The Continuity Trial drafts were created by spreading historical Draft objects and overriding selected fields. lessonSpec/content/practice were updated, but checkSequence was not explicitly rebuilt, so old mastery content survived. For CONCEPT, practice=null is correct for gate policy, but the participation contract/UI did not guarantee an actionable non-gated Step 4.

Therefore the risk would recur in later course production unless production governance and acceptance were strengthened.

## Fix

- Rebuilt Step 3 checkSequence for all five trial lessons using current Continuity content/case/artifact logic.
- Added deterministic acceptance that all current trial question IDs are continuity_* and all five lessons have a fresh three-question mastery sequence.
- Changed beginner-context participation to MINI_TASK with a concrete prompt.
- Generic preview now renders non-COPY participation with a learner textarea and local completion action.
- CONCEPT remains CHECK-only for Completion Gate; Step 4 participation is learning activity, not formal Practice Gate.
- Added Six-step Content Integrity rules to Beginner Lesson Quality Standard and Course Production Governance.

## Runtime boundary

Preview support is now correct. Formal Runtime still needs a production data/rendering path for non-gated CONCEPT Step 4 participation. Until that is provisioned and accepted, such lessons must not be marked RUNTIME_READY.

## Validation

PASS:
- course-builder:accept:continuity-trial
- SIX_STEP_CONTENT_INTEGRITY
- CONCEPT_STEP4_ACTIONABLE
- course-builder:check
- beginner-quality
- unified shell
- typecheck
- build
- git diff --check

Production build: 51 pages.

## Human Review next

Only targeted re-review is needed:
- Step 3 of all five Trial lessons;
- Step 4 of beginner-context.
