# Learning Insight Deterministic Validator Contract

Status: **ACTIVE / CURRENT OWNER**

本文件是学习洞察 V2 所有确定性 Gate 与 Fail-Closed 规则的唯一 owner。

原则：

> Code 决定“能不能继续”，AI 只提供语义 Proposal。

## V2 Validation Direction Revision — Course First

Validator 需要同时验证课程聚合链路，而不是只验证单个 Issue。

新增固定检查：

- Learning Issue 必须关联有效课程 identity；
- 课程累计问题数量、最老未处理时间、状态与排序必须由 Code 计算；
- 默认风险排序固定为红 > 黄 > 绿；同颜色只允许 oldest_open_issue_at 升序，问题数量、学员影响、最近更新时间不得参与默认排序；
- AI 输入必须包含经过聚合后的课程上下文；
- AI 不得绕过课程范围直接生成更新；
- Preview Diff 必须基于真实 Course Snapshot；
- Apply 前必须再次验证当前课程 baseline 未变化。

固定链路：

```text
Issue Evidence
→ Course Aggregation
→ AI Diagnosis
→ Preview Diff
→ Human Acceptance
→ Course Maintenance DRAFT
```

任何 Validator FAIL 都不得自动应用部分结果。

## 1. Validator 分层

固定分为：

```text
V0_INPUT
V1_TASK_A_SCHEMA
V2_TASK_A_SEMANTIC_REFERENCES
V3_HUMAN_SCOPE
V4_TASK_B_SCHEMA
V5_PATCH_SCOPE
V6_PATCH_BASELINE
V7_PATCH_SAFETY
V8_HUMAN_ACCEPTANCE
V9_APPLY_PRECONDITION
```

## 2. V0 — AI 输入校验

Task A 前检查：

- issue_id 存在；
- current_course_id 存在于 Formal Curriculum；
- evidence_catalog 非空；
- evidence_ref 唯一；
- 无 userId / email / Secret；
- Human Gate 1 已明确授权；
- prompt_version 正确；
- schema_version 正确。

Task B 前额外检查：

- Task A 已通过；
- Human Gate 2 已产生 approved_course_ids；
- 当前 approved_course_id 在其中；
- 一次只允许一个 approved_course_id；
- mutable_path_catalog 来自当前最新 AdminCourseSnapshot；
- mutable_path_catalog 只含允许的字符串叶子。

## 3. V1 — Task A JSON / Schema

必须：

- 可解析为单一 JSON object；
- schema_version = learning_issue_diagnosis_v2；
- 没有额外顶层字段；
- decision 合法；
- root_causes / courses / targets 为数组；
- 数量上限合法；
- 所有必填字段类型正确；
- 不允许 Markdown fence 或前后解释文字。

Fail code 示例：

```text
AI_OUTPUT_NOT_JSON
TASK_A_SCHEMA_VERSION_INVALID
TASK_A_ENUM_INVALID
TASK_A_EXTRA_FIELD
TASK_A_LIMIT_EXCEEDED
```

## 4. V2 — Task A 引用与课程校验

逐项检查：

- evidence_refs 全部存在于输入 evidence_catalog；
- 不允许空 evidence_refs 的 root_cause；
- course_id 存在于 Formal Curriculum；
- course_id 不重复；
- target.course_id 必须出现在 courses；
- target.step 只能 1～6；
- decision = NO_CHANGE_NEEDED 时不得同时存在 MODIFY；
- decision = INSUFFICIENT_EVIDENCE 时不得输出具体修改 Patch；
- Task A 输出中不得出现 current_value / proposed_value / patch_id。

Fail code：

```text
UNKNOWN_EVIDENCE_REF
UNKNOWN_COURSE_ID
DUPLICATE_COURSE_ID
TARGET_COURSE_NOT_DECLARED
INVALID_STEP_NUMBER
TASK_A_PATCH_CONTENT_FORBIDDEN
DECISION_CONTRADICTION
```

## 5. V3 — Human Scope

Human Gate 2 后检查：

- approved_course_ids 只能从 Task A courses 中选择；
- Human 可以批准 AI 标记 MODIFY 或 REVIEW_ONLY 的课程；
- AI 标记 NOT_RELEVANT 的课程若 Human 强制选择，必须记录 explicit_override；
- approved_course_ids 去重；
- 最多 5 门；
- 每门课程 Task B 独立调用。

Human Scope 是 Core 事实，不能接受 AI 自报。

## 6. V4 — Task B JSON / Schema

必须：

- schema_version = course_change_patch_v2；
- course_id = 当前唯一 approved_course_id；
- decision 合法；
- changes ≤ 20；
- patch_id 唯一；
- action 只能 REPLACE；
- manual_structure_reason 与 decision 逻辑一致。

规则：

**PATCH_PROPOSED**
- changes 至少 1 项；
- manual_structure_reason 必须为空。

**NO_CHANGE_NEEDED**
- changes 必须为空。

**REQUIRES_MANUAL_STRUCTURE_CHANGE**
- changes 必须为空；
- manual_structure_reason 必须非空。

## 7. V5 — Patch Scope

每项 Patch：

- path 必须存在于本次 mutable_path_catalog；
- path 必须属于 approved_course_id；
- path 必须指向字符串叶子；
- path 不得命中 permanent denylist；
- proposed_value 非空；
- proposed_value 与 current_value 不同；
- reason 非空；
- evidence_refs 非空且全部存在。

永久 denylist 至少包括：

```text
id
kind
questionType
masteryRole
correctValues
correctAnswer
passScore
maxScore
minScore
status
version
reviewedBy
reviewedAt
publishedVersion
sourceContext
```

## 8. V6 — Baseline / Stale Protection

这是应用安全的核心。

在 Task B 输出校验时：

```text
patch.current_value === mutable_path_catalog[path].current_value
```

在 Human Gate 3 之后、真正 apply 前，再次读取最新 Course Maintenance baseline：

```text
latest_current_value === patch.current_value
```

只要不一致：

```text
PATCH_BASELINE_CONFLICT
```

整项 Patch 不得应用。

如果同一课程在 AI 生成后已经被其它流程更新，不允许“尽量套用”。

## 9. V7 — Safety / Structure

Validator 必须阻止：

- 六步数量变化；
- Step 顺序变化；
- 数组长度变化；
- 新增 / 删除卡片；
- 新增 / 删除 Check；
- 新增 / 删除 Practice；
- ID 变化；
- 正确答案变化；
- passScore / 分值变化；
- 课程 identity 变化；
- 状态变化；
- 发布动作；
- Course Builder Workflow 改动。

V2 Patch apply 前后对 snapshot 做结构 fingerprint：

至少包含：
- step IDs + kinds；
- intro approaches count；
- bottomDetails count；
- knowledgeDepth counts；
- check IDs + questionTypes + option value keys；
- practice ID + instruction keys + rubric keys；
- review array lengths；
- capability array lengths。

只要 fingerprint 变化：

```text
PATCH_STRUCTURE_DRIFT
```

整次 apply 失败。

## 10. V8 — Human Gate 3

Core 必须确认：

- accepted_patch_ids 全部存在于 validated Task B output；
- rejected_patch_ids 与 accepted_patch_ids 不重叠；
- 未明确 accepted 的 Patch 默认不应用；
- Human 不能通过手工填写任意 path 绕过 Validator；
- accepted_patch_ids 写入审计。

## 11. V9 — Apply Preconditions

写 Course Maintenance DRAFT 前必须：

1. 当前课程仍存在；
2. 当前课程没有冲突的活动 Candidate，或当前 Issue 已明确绑定到同一个 Candidate；
3. 所有 accepted Patch 重新通过 V5 / V6 / V7；
4. Course Maintenance Candidate 状态为 DRAFT；
5. sourceContext 记录 Learning Issue / AI Run / accepted patch IDs；
6. apply 事务失败时不修改正式课程；
7. 不调用 publish；
8. 不自动 submit review。

## 12. Fail-Closed

以下任何情况：

```text
INVALID_JSON
SCHEMA_INVALID
UNKNOWN_EVIDENCE_REF
UNKNOWN_COURSE_ID
SCOPE_VIOLATION
PATH_NOT_ALLOWED
BASELINE_CONFLICT
STRUCTURE_DRIFT
ACTIVE_CANDIDATE_CONFLICT
```

固定行为：

```text
STOP
→ record validation failure
→ keep issue/candidate unchanged
→ show Human-readable error
```

禁止：
- 自动删掉非法 Patch 后继续；
- 猜测合法 path；
- 自动把错误 enum 映射成最近似值；
- 部分应用；
- AI 自我批准。

## 13. 中文 UI 映射

Validator / DB 可保留英文 enum，但 UI 必须通过确定性映射显示中文。

例如：

```text
DONT_UNDERSTAND → 理解困难
PRACTICE_DIFFICULTY → 实操困难
CONTENT_OUTDATED → 内容待更新核查
UNDER_REVIEW → 待处理
ANALYSIS_READY → 待分析
AI → AI 分析
RULE → 系统识别
PENDING_REVIEW → 待审核
CONTENT_CLARIFICATION → 内容表达优化
```

禁止把内部 enum 直接作为管理员主界面文案。

## 14. Evidence Privacy Validator

API 返回给管理页面前必须确保：

- 不返回 userId；
- 不返回 email；
- 不返回 session token；
- 不返回内部绝对路径；
- 不返回数据库连接字段；
- feedback 原文可返回，但不附用户身份；
- 外部引用显示 human_readable_source。

## 15. Contract Validator 必检规则

项目 validator 至少检查四份 contract 同时存在，并包含：

- Code First；
- Human Gate 1 / 2 / 3；
- Task A / Task B；
- Task B 单课程；
- evidence_ref；
- mutable_path_catalog；
- permanent denylist；
- current_value baseline；
- Fail Closed；
- Course Maintenance DRAFT；
- no direct publish；
- Course Builder Workflow untouched。

## 16. Runtime / DB Acceptance

实现阶段必须有可重跑测试覆盖：

1. Code 阈值不依赖 AI；
2. Human Gate 1 前 AI 不调用；
3. Task A 伪造 evidence_ref 被拒；
4. Task A 非法 course_id 被拒；
5. Human Gate 2 限制 Task B course；
6. Task B 越权 path 被拒；
7. current_value 过期被拒；
8. correctValues / passScore 修改被拒；
9. 数组长度变化被拒；
10. Human 只采纳部分 Patch 时只应用采纳项；
11. apply 后正式课程未直接发布；
12. sourceContext 可追溯；
13. 测试数据自动清理。
