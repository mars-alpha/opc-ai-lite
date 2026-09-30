# COURSE_PRODUCTION_WORKFLOW_V1.md — Stable Course Production Workflow

Status: **STABLE_WORKFLOW_V1**

本文件只定义课程生产生命周期和 Gate，不复制课程内容规则。

## 1. Stable Workflow

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

只有新增 / 删除 Gate、改变 Gate 顺序或打破稳定 Contract，才升级 Workflow version。

## 2. Bootstrap Sources

每次开始先读取：

- `docs/learning/COURSE_BUILD_START_HERE.md`
- `docs/CURRENT_SYSTEM_FACTS.md`

它们用于恢复当前状态与入口，不是课程规则正文 owner。

## 3. Rule Sources

`COURSE_PRODUCTION_RULE_SOURCES` 当前只包含：

- `docs/learning/FORMAL_CURRICULUM_V1.md`
- `docs/learning/COURSE_BUILD_STANDARD_V1.md`
- `docs/learning/UNIFIED_LESSON_SHELL_V1.md`

每次运行都 read-latest。

Workflow 不复制规则正文，不绑定 Track、不绑定历史 Formal Brief、不绑定具体 Course Builder version。

## 4. Course Context

如果产品负责人显式重新开启课程生产，进入 Course Builder 前必须解析：

- 当前 Track Catalog / Context owner；
- 上一课 → 本课 → 下一课连续性；
- 当前 Formal Brief；
- 必要 Grounding / Evidence；
- 当前 Deferred / Supporting Boundary（若任务需要）。

Context 未准备好时：
`courseContextReady=false`

Workflow 必须停在 `PREPARE_FORMAL_BRIEF`。

当前 Track 01～05 已冻结，因此普通开发任务不创建新的 Formal Brief。

## 5. Course Builder

当前 Skill 只通过：

`skills/course-builder/index.ts`

解析。

Workflow 不 import historical Skill version。

Course Builder 输出：
- Draft；
- structured candidate；
- validation input。

它不拥有：
- Published 状态；
- Runtime completion；
- Access；
- Catalog availability。

## 6. Deterministic Validators

对 Workflow 只暴露：

```text
PASS
FAIL + issues[]
```

长期 Gate 至少包括：
- Step 1 / 2 overlap；
- Step 5 knowledge coverage；
- learner language；
- internal ID boundary；
- batch template drift；
- cross-lesson knowledge overlap；
- LessonSpec / Completion Gate；
- Preview authority boundary。

具体规则正文来自 `COURSE_BUILD_STANDARD_V1.md`。

## 7. Human Review

标准状态：

```text
PENDING
PASS
REVISE
REJECT
```

只有 PASS 可以进入 LessonSpec Registry。

Human Review 判断语义质量，不能被技术 PASS 替代。

## 8. Runtime

Human Review PASS 后：

```text
REGISTER_LESSON_SPEC
→ PROVISION_RUNTIME
→ RUN_RUNTIME_ACCEPTANCE
→ MARK_AVAILABLE
```

必须确认：
- LessonSpec 已进入正式 Registry；
- 正式 Runtime 使用统一 Shell；
- Check / Practice authority 在服务端；
- Completion Gate 正确；
- Access 正确；
- Preview 不写正式 Progress / Completion。

## 9. Track Switch

固定：

> Track switch = Context switch, not Workflow fork and not Skill fork.

切换 Track 只改变 Context references。

## 10. Rule Update

以下变化不升级 Workflow：
- Course Builder Skill 内部优化；
- Validator 增减；
- Human Review checklist 细化；
- COURSE_BUILD_STANDARD 内容优化；
- Grounding 策略优化。

以下变化必须升级 Workflow：
- 新增 / 删除正式 Gate；
- Gate 顺序改变；
- Course Builder Contract breaking change；
- AVAILABLE 准入条件结构性改变。

## 11. Preflight

课程治理任务运行：

```bash
npm run learning:course-current-state:check
npm run learning:course-build-entry:check
npm run learning:course-governance:check
npm run scripts:current:check
```

任一失败先修复事实漂移。

## 12. Historical Boundary

固定：**历史生产过程通过 Git 追溯，不作为 current Workflow source。**

已完成 Track / Batch 的：
- Formal Brief；
- Draft validation；
- Human Review file；
- provisioning script；
- acceptance script；

不属于 current Workflow source。

需要追溯时使用 Git commit，不把历史文件重新复制回 current tree。