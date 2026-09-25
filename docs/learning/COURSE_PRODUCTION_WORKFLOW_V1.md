# Course Production Workflow v1

Status: **STABLE_WORKFLOW_V1**

## 1. Purpose

课程生产采用：

```text
Stable Course Production Contract
→ Course Production Orchestrator
→ Course Builder Skill
→ Deterministic Validators
→ Human Review Gate
→ LessonSpec Registry
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE
```

Workflow 是稳定生命周期骨架，不绑定某个 Course Builder Skill 具体版本。

### Preflight anti-drift

每次新对话或重新进入课程生产前，先运行：

```bash
npm run learning:course-current-state:check
npm run learning:course-governance:check
npm run scripts:current:check
```

第一项确认 Current Facts / Current Workflow Batch / Human Review Gate 是否一致；第二项确认当前 Rule Owners、Course Builder Skill、Track 当前 Validators 与 Preview/Runtime 映射没有重新引入已废止规则；第三项确认 scripts 根目录只有明确 package entrypoint 或 `_historical-*` 归档脚本，且已退役 pilot / acceptance 不会重新暴露。三者都不新增生命周期 Stage。任一检查失败时不得从历史 task-result、旧 acceptance、legacy fixture 或脚本文件名猜测当前规则继续生产。

## 2. Stable Workflow

固定阶段：

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

只有新增 / 删除正式生命周期 Gate 或改变稳定 Contract，才需要升级 Workflow version。

Skill 文案质量提升、Orchestrator 内部判断优化、Validator 增减规则、Human Review 标准细化，不改变 Workflow 阶段语义。

## 3. Rule-source synchronization

Workflow 不复制课程规则正文。

每次运行开始必须先读取 Bootstrap Sources：`COURSE_BUILD_START_HERE.md` 与 `CURRENT_SYSTEM_FACTS.md`，用于恢复入口顺序、当前 Track / Batch / Gate 与运行时事实；它们**不是课程规则正文 owner**。

随后读取 `COURSE_PRODUCTION_RULE_SOURCES` 当前内容：

- `docs/learning/FORMAL_CURRICULUM_V1.md`
- `docs/learning/LESSON_OUTPUT_CONTRACT_V1.md`
- `docs/learning/BEGINNER_LESSON_QUALITY_STANDARD_V1.md`
- `docs/learning/COURSE_PRODUCTION_GOVERNANCE_V1.md`
- `docs/learning/UNIFIED_LESSON_SHELL_V1.md`

因此真正的规范 owner 后续发生变化时，Workflow 下一次运行自动消费最新规则，不需要把规则正文再次复制到 Workflow、Current Facts 或 Start Here。全局 Rule Sources 只能放跨板块长期规范，不得写死 Track 01 或任何单一板块的 Catalog、Formal Brief、Batch、Fixture 或 Deferred Ledger。

历史 acceptance / fixture / task-result 可以保留用于解释或回归当时资产，但不属于 Rule Sources。它们内部若保留某批课程的固定数量、旧 handoff 或旧 Capability 文案，不得被 Orchestrator、Current Skill 或新课程 validator 继承为通用规则。

每次运行还必须解析当前课程 Context，但这些 Context 不属于全局 Rule Sources。Context 必须按“current owner reference + read-latest”解析，而不是把某个 Track 文本复制进 Workflow：

- 当前 Track / Board 的唯一 Catalog / Context owner + current directory status；
- 上一课 → 本课 → 下一课连续性；
- 当前 Lesson Formal Brief / Formal Brief Batch owner + brief status；
- 当前 Track 的 Deferred / Supporting Knowledge Boundary；
- 当前课程必要的 Grounding / Research Packet；
- 进入 Runtime 后需要的当前 Track runtime / provisioning / validator references。

这些 Context 在 `PREPARE_GROUNDING` / `PREPARE_FORMAL_BRIEF` 阶段解析，并由 `CourseProductionSnapshot.courseContextReady` 形成硬 Gate。只有 current Track owner、current continuity、current Formal Brief、Deferred Boundary 与所需 Grounding 都已解析，才允许 `courseContextReady=true`；否则 Orchestrator 必须停在 `PREPARE_FORMAL_BRIEF`，禁止进入 Course Builder。

换到 Track 02～05 或未来新板块时，只替换 Context references，不复制或改写 Workflow，也不创建 Track-specific Course Builder Skill。Track 02 当前就是该规则的第一条非 Track 01 正式验证路径。

第 3～5 板块进入生产时，仍按本 Workflow 依次使用 current Course Builder、正式课程展示文案校验、内容校验和 Human Review。学习建议、六步进度卡片、Step 1 底部说明的质量标准从最新 `LESSON_OUTPUT_CONTRACT_V1.md` 读取；正式 LessonSpec 在 Registry 校验中检查六步文案与学习建议。若本课使用 intro comparison，Preview / Human Review 核对底部说明已实际显示。此要求不增加 Workflow Stage，不改变现有前端 UI、交互或 CSS。

固定原则：

> **Rule owner changes are synchronized by reference + read-latest, not by duplicated text.**

> **Track switch = Context switch, not Workflow fork and not Skill fork.**

## 4. Component update boundary

以下更新不要求修改 Workflow：

- Course Builder Skill v1.0 → v1.x / v2；
- Orchestrator 内部判断优化；
- Deterministic Validator 增加 / 收紧规则；
- Human Review checklist 优化；
- Research / grounding 策略优化；
- Beginner Quality / Lesson Output Contract 规则更新。

前提：组件继续遵守 Stable Contract 与标准 Gate 状态。

以下变化必须升级 Workflow：

- 新增或删除正式生命周期 Gate；
- 改变 Gate 顺序；
- Course Builder 输入 / 输出 Contract 出现 breaking change；
- AVAILABLE 准入条件发生结构性改变。

## 5. Version binding

Workflow 只依赖：

- `lib/learning/course-production-contract.ts`
- 标准 Gate 状态
- Required Rule Sources

Workflow **不得直接 import 任意具体 Course Builder Skill version 文件**。

当前 Skill 只能通过 `skills/course-builder/index.ts` registry 选择；历史 Skill version 只保留 provenance，不进入 current Workflow。

## 6. Human Review Gate

标准状态：

```text
PENDING
PASS
REVISE
REJECT
```

只有 `PASS` 允许进入 LessonSpec Registry / Runtime。

Human Review 标准可以持续更新，但 Gate 状态 Contract 保持稳定。

## 7. Deterministic Validators

Validator 可以持续增加、减少或重构内部规则，但对 Workflow 只暴露：

```text
PASS
FAIL + issues[]
```

Workflow 不关心 validator 数量和具体实现。

当前课程类 Deterministic Validators 至少要覆盖两类长期防漂移检查：1）`STEP_1_2_OVERLAP_FAIL`，防止 Step 1 直接复用或由 Step 2 example 自动派生；2）Step 5 先检查主卡片不少于 2 张，再用 `STEP5_KNOWLEDGE_COVERAGE_FAIL` 按 current Formal Brief 的 must-retain judgments 检查是否讲完整。两张是最低要求，上限不固定；超过两张只为提升当前课程知识清晰度，不按固定范围验收。语义自然度仍由 Human Review 最终确认，但明显字段复用、主卡片不足、缺失判断和旧模板自动派生必须在 Code Validation 阶段直接 FAIL。

## 8. Current implementation

```text
Stable Contract
lib/learning/course-production-contract.ts

Workflow
lib/learning/course-production-workflow.ts

Orchestrator
lib/learning/course-production-orchestrator.ts

Human Review Gate
lib/learning/course-human-review-gate.ts

Current Course Builder
skills/course-builder/index.ts
→ Course Builder Skill v1

Workflow Anti-drift Validator
scripts/validate-course-production-workflow.ts
```
