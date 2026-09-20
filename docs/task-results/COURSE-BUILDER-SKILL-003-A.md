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

## Human Review Refinement

评分规则修复：

- 旧 RULE evaluator 主要按文字长度评分，导致“负责人：小林”这种短但正确的答案得分过低。
- `owner` 现在按语义判断：一个明确负责人即可拿满该项；“大家 / 相关同事 / 待定”等模糊责任人不会满分。
- `deadline` 现在检查是否包含可以判断逾期的时间表达。
- acceptance 使用真实参考答案回归，要求只有一个负责人“小林”时仍然整份通过且 owner 满分。

课程内容扩充：

- Step 1：增加“记录很多但仍没人执行”的原因和“不凭空补信息”原则。
- Step 2：增加“讨论 vs 行动”“负责人 vs 未决问题”两条知识深化。
- Step 3：明确解释 A / C 为什么失败，而不只说明 B 正确。
- Step 4：增加找证据、一个负责人即可、缺失信息不能编造等分层提示。
- Step 5：增加“行动 → 负责人 → 时间 → 未决问题”的诊断顺序和证据边界。
- Step 6：扩展到项目周会、客户跟进、需求评审、团队协作等场景。

同时 Generic Lesson Preview 只在 `COPY_TO_AI` participation 下显示 AI 软件测试区；本 PRACTICE 的 `MINI_TASK` 不再错误继承 Prompt 课交互。

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

Human Review：重新体验 /course-builder/preview/meeting-action-list，重点检查一个负责人是否能正常得分，以及六步知识扩充后是否仍然保持“实操为主”。
