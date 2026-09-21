# COURSE-BUILDER-CONTINUITY-AUDIT-001

Status: **V02_TRIAL_TECHNICALLY_SUFFICIENT_V03_DEFERRED**

## Decision

Skill Decision: **EXISTING_SKILL / POSSIBLE_VERSION_UPGRADE**.

不创建新 Skill。

跨课程 Continuity 属于 Curriculum / Production Workflow；Course Builder 不得决定五大板块顺序。

但 course-builder v0.2 缺少显式 continuity context，因此单节生成时容易：
- 重复上一课已经讲过的知识；
- 每节重新开案例；
- 只预告下一课，不复用当前产物；
- “能力获得”与长期业务链脱节。

这些问题仍属于 Course Builder 原有单一职责：把受控课程上下文生成高质量 Lesson Draft。

因此确认 v0.3 有明确升级理由，但本任务不立即升级。先把 Continuity Contract 落到 Stage 1 / Stage 2 Formal Brief，并用真实课程再次验证 v0.2；只有仍出现系统性重复、案例断裂或 Artifact 断裂时，再启动独立 `COURSE-BUILDER-SKILL-006`。

## Proposed v0.3 continuity input — NOT IMPLEMENTED

```text
continuityProfile:
  inheritedCapabilities[]
  inheritedArtifact
  currentLearnerJob
  newCapability
  artifactAction
  artifactOutput
  nextReuse
  antiRepeat[]
  caseThread
```

v0.3 不：
- 排课程顺序；
- 修改 Curriculum；
- 决定 prerequisite；
- 创建跨课程 Workflow；
- 发布课程。

额外边界：
- 不修改 Runtime / DB / Schema；
- 不直接生成图片、视频、PPT；
- 未来若需要图文进阶课，只输出 `visualNeed / diagramBrief / screenshotNeed / codeExampleNeed` 等教学设计需求，真正媒体生成由独立 Media Skill / Workflow 负责。

## Evidence required before v0.3 implementation

至少需要：
- Stage 1 + Stage 2 新 Formal Brief 已包含 Continuity Contract；
- 用 v0.2 对 3–5 个真实 Lesson Draft 验证；
- Human Review 明确指出 Continuity 仍无法稳定保持；
- 能证明缺口属于 Course Builder 原有教学设计职责，而不是 Curriculum / Runtime 问题。

满足后再批准 `COURSE-BUILDER-SKILL-006 — Capability Continuity Alignment`。

Update after FOUNDATION-CONTINUITY-TRIAL-001: five representative v0.2 Drafts passed Continuity / Beginner Quality / Contract / Shell / typecheck / build validation. Current evidence therefore does not justify implementing v0.3 now. Human Review remains required; v0.3 stays a candidate only if later real use shows recurring structural failures that Formal Brief + deterministic acceptance cannot reasonably control.

## Candidate Acceptance

v0.3 新课程应验证：
- continuityProfile required；
- inherited/new capability 不为空；
- artifactAction / artifactOutput / nextReuse 明确；
- antiRepeat 至少 1 条；
- lesson capability / nextLessonValue 与 continuity profile 一致；
- 不改变 v0.1/v0.2 legacy compatibility。
