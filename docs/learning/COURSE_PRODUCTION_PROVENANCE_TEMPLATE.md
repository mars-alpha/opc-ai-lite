# Course Production Provenance Template

Status: **TEMPLATE_V1**

本模板用于课程生产任务记录，不是 Runtime DB Schema。

```text
Canonical Lesson ID:
Curriculum Source:
Curriculum Version:
Brief Source:
Brief Version:
Production Batch ID:

Skill Decision:
Selected Skill ID:
Selected Skill Version:

Quality Standard:
Quality Profile:
Grounding Source:

Draft Version:
Code Validation:
Preview Route:

Human Review Status:
Human Review Reference:
Human Review Notes:

Runtime Contract / Version:
Runtime Readiness:
Runtime Mapping:

Catalog curriculumStatus:
Catalog availability:

Blocking Gaps:
Publication Decision:
```

规则：
- 每次 generation attempt 只能填写一个 Selected Skill Version；
- Human Review 失败时 Draft Version 递增，但 Canonical Lesson ID 不变；
- 未经过 Runtime Acceptance 时 Runtime Readiness 不得填写 READY；
- 未经过发布动作时 availability 不得填写 AVAILABLE。
