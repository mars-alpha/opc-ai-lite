# COURSE-BUILDER-SKILL-V1-WORKFLOW-001 — Stable Course Production Workflow

Status: **COMPLETE_ARCHITECTURE_ACCEPTANCE_PASS**

## Result

正式课程生产已收敛为稳定 Contract + 稳定 Workflow + 可持续演进组件：

- Stable Course Production Contract
- Course Builder Skill v1
- Course Production Orchestrator
- Deterministic Validators
- Human Review Gate
- Runtime / Publication pipeline

当前 Course Builder 由 `skills/course-builder/index.ts` 解析，Current Skill = `course-builder@1.0.0`。v0.1 / v0.2 继续保留历史 provenance，不改写 T1-01～T1-10 历史生成记录。

## Stable workflow

固定生命周期：

```text
LOAD_CURRENT_RULE_SOURCES
→ PREPARE_GROUNDING
→ PREPARE_FORMAL_BRIEF
→ RUN_COURSE_BUILDER
→ RUN_DETERMINISTIC_VALIDATORS
→ HUMAN_REVIEW_GATE
→ REGISTER_LESSON_SPEC
→ PROVISION_RUNTIME
→ RUN_RUNTIME_ACCEPTANCE
→ MARK_AVAILABLE
```

Workflow 不直接 import 具体 Course Builder Skill version。

Skill / Orchestrator / Validator / Human Review Policy 可以独立升级；只要 Stable Contract 与标准 Gate 语义不发生 breaking change，Workflow 主流程不变。

只有以下情况升级 Workflow version：
- 正式 Gate 增删；
- Gate 顺序变化；
- Stable Contract breaking change；
- AVAILABLE 准入结构性改变。

## Rule source synchronization

`COURSE_PRODUCTION_RULE_SOURCES` 是 Workflow 的 Required Rule Sources。

Orchestrator 通过 `loadCourseProductionRuleSources(readLatest)` 在每次生产运行开始读取 owner 文件当前内容。Workflow 不复制 owner 文件正文。

因此后续以下规则文件发生变化时，下一次课程生产自动消费最新版本：
- COURSE_BUILD_START_HERE
- CURRENT_SYSTEM_FACTS
- FORMAL_CURRICULUM
- TRACK01 Catalog owner
- LESSON_OUTPUT_CONTRACT
- BEGINNER_LESSON_QUALITY_STANDARD
- COURSE_PRODUCTION_GOVERNANCE
- UNIFIED_LESSON_SHELL

## Created

- `lib/learning/course-production-contract.ts`
- `lib/learning/course-production-workflow.ts`
- `lib/learning/course-production-orchestrator.ts`
- `lib/learning/course-human-review-gate.ts`
- `skills/course-builder/v1.ts`
- `skills/course-builder/index.ts`
- `docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md`
- `scripts/validate-course-production-workflow.ts`

## Current gate contracts

Deterministic Validator:
- PASS
- FAIL + issues

Human Review:
- PENDING
- PASS
- REVISE
- REJECT

Runtime Acceptance:
- PENDING
- PASS
- FAIL

Only Human Review PASS can enter Runtime. AVAILABLE still requires Runtime Acceptance PASS.

## Validation

- `learning:course-production-workflow:check`
- `learning:course-build-entry:check`
- `typecheck`
- Formal Registry regression
- Production build
