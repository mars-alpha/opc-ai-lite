# COURSE-BUILDER-SKILL-003-A — Real PRACTICE Lesson Acceptance

Status: TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING

## Goal

验证第三种真实 Lesson Type：PRACTICE。

主题：

把会议记录整理成可执行行动清单

## Positioning

这是课程体系中的 PRACTICE Lesson，用于验证统一 Lesson Shell 下的实操型课程。

它不替代独立 Practice / 进阶练习领域实体，也不改变后续“知 → 学 → 用”产品分工。

## Experience

继续复用统一六步：

EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY

重点：

- Step 1：短场景，区分“摘要”和“行动清单”。
- Step 2：把一段会议讨论改成可执行行动项。
- Step 3：判断哪一条是真正可执行的行动项。
- Step 4：从给定会议记录中亲手填写行动 / 负责人 / 截止时间 / 未决问题。
- 本地确定性规则检查，不调用 AI。
- 未通过时继续使用 Hint → 参考答案 → 一键填充。
- Step 5：形成四问题检查框架。
- Step 6：明确会议、项目、客户沟通中的真实应用场景。

## Lesson Type / Gate

- lessonType=PRACTICE
- practiceMode=INDEPENDENT
- completionGates=[CHECK, PRACTICE]
- realAiOperation=NONE
- realAiEvidence=NONE

没有新增 REAL_AI Gate。

## Practice Schema

四字段：

- action
- owner
- deadline
- openIssue

Rubric 对应四字段，passScore=70。

参考答案仅用于教学辅助；一键填充不自动提交、不自动通过。

## Grounding

使用 APPROVED_KNOWLEDGE：

- OPC Reviewed Knowledge：会议行动项结构
- OPC Reviewed Knowledge：任务可执行性检查

课程只训练“行动 / 负责人 / 时间 / 未决问题”最小结构，不扩展复杂项目管理理论。

## Six-Step Responsibility Contract

PRACTICE Draft 完整携带：

- EXPLAIN
- EXAMPLE
- CHECK
- PRACTICE
- REVIEW
- CAPABILITY

并遵守 COURSE-BUILDER-SKILL-002-C 固化的 purpose / include / avoid 责任。

## Preview

/course-builder/preview/meeting-action-list

只读 Preview，不写正式 Progress / Completion / PostgreSQL。

## Validation

- npm run course-builder:check PASS
- npm run course-builder:accept PASS
- npm run course-builder:accept:application PASS
- npm run course-builder:accept:practice PASS
- npm run typecheck PASS
- npm run build PASS
- 33 static pages generated
- git diff --check PASS

## Boundary

未进入正式课程目录。
未注册正式 Runtime。
未写数据库。
未连接 AI Provider。
未改变独立 Practice 领域。
未新增专用 Lesson Template。

## Next

Human Review：体验 /course-builder/preview/meeting-action-list，重点判断第 4 步是否真的像完成一个工作任务，而不是填教学表格。
