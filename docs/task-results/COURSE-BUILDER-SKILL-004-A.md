# COURSE-BUILDER-SKILL-004-A — Real PROJECT Lesson Acceptance

Status: TECHNICAL_ACCEPTANCE_PASS_RUNTIME_BLOCKED_HUMAN_REVIEW_PENDING

## Goal

验证第四种 Lesson Type：PROJECT。

主题：完成一份 AI 客户跟进工作流方案。

## Experience

继续复用统一六步：EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY。

项目草稿包含五个部分：项目目标、触发与输入、工作流步骤、人工确认、成功指标。

## Lesson Type / Gate

- lessonType=PROJECT
- practiceMode=PROJECT
- completionGates=[CHECK, DELIVERABLE]
- realAiOperation=NONE
- realAiEvidence=NONE

## Deliverable Runtime Boundary

Lesson Spec 要求 PROJECT 必须以 DELIVERABLE 作为 Completion Gate。当前正式 Runtime 原本只显式支持 CHECK / PRACTICE / REAL_AI。本任务新增 `requiresDeliverable` 运行计划事实，使 Preview 能识别该正式要求。

当前只允许：

- 本地检查项目草稿质量；
- 草稿 PASS 后继续体验后续 Step；
- 明确显示 DELIVERABLE_RUNTIME_NOT_SUPPORTED；
- 不把 Draft PASS 当作正式 Deliverable Completion；
- 不写正式 Progress / Completion。

因此：PROJECT UX / Draft Acceptance = PASS；Formal Deliverable Runtime = BLOCKED。

## Pedagogy

- Step 1：区分临时使用 AI 和先设计可重复工作流。
- Step 2：展开 Code / AI / Human-in-the-loop 的职责边界。
- Step 3：判断方案是否包含触发、输入、AI、人工确认和结果观察。
- Step 4：完成五部分项目草稿，并使用 Hint / 参考项目 / 一键填充辅助。
- Step 5：形成目标 → 触发输入 → 步骤 → 人工确认 → 成功指标的项目检查框架。
- Step 6：明确可以迁移到销售、客服、内容运营和内部协作。

## Human Review Refinement

Step 1 底部价值说明已加厚：

- 解释临时 AI 使用会造成 Prompt / 输入 / 交接不一致，流程依赖个人记忆；
- 解释工作流如何把个人方法变成可交接、可检查、可改进、可逐步自动化的过程；
- 明确这一步是从“会用 AI”到“用 AI 建工作方式”的能力跃迁。

通过通用 `bottomDetails` 数据驱动，不增加新交互、不改变其他 Step 或 Gate。

## Preview

/course-builder/preview/ai-workflow-project

## Validation

- course-builder:check PASS
- CONCEPT regression PASS
- APPLICATION regression PASS
- PRACTICE regression PASS
- PROJECT acceptance PASS
- typecheck PASS
- build PASS
- 34 static pages generated
- git diff --check PASS

## Boundary

未发布课程；未进入正式 catalog；未写数据库；未连接真实 AI Provider；未伪造 Deliverable Completion；未新增独立 PROJECT 页面产品。
