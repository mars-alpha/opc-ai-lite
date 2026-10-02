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
- `WATCHING / DISMISSED / REVIEWED` 不属于当前未处理问题，必须退出 open_issue_count；
- 同一 Issue 关闭/观察/发布后必须记录 Issue Cycle baseline，历史样本不得直接把下一周期重新判红；
- 学员反馈类新周期阈值固定为处理基线后新增 3 位独立学员；学习行为类固定为新增 10 位样本；
- 新周期开启后 oldest_open_issue_at 必须使用本周期 openedAt，而不是历史首次 createdAt；
- AI 输入必须包含经过聚合后的课程上下文；
- AI 不得绕过课程范围直接生成更新；
- Preview Diff 必须基于真实 Course Snapshot；
- Apply 前必须再次验证当前课程 baseline 未变化。

固定链路：

```text
Issue Evidence
→ Effective Evidence Set
→ Course Aggregation
→ AI Diagnosis + Change Proposal
→ Student-facing Preview Diff
→ Human Final Edit + Confirmation
→ Direct Formal Publish
→ Course Maintenance Version History
```

任何 Validator FAIL 都不得自动应用部分结果。

模型输出通过 Schema 但未通过 path / semantic / expansion 等确定性校验时，Task A / Task B 最多允许一次**自动校验重试**。第二次请求必须携带上一轮 Validator fail code，只允许修正导致失败的局部输出，禁止扩大范围；第二次仍失败则本次 AI Run 正式 FAILED，不允许要求 Human 通过重复点击绕过 Validator。

## 1. Validator 分层

固定分为：

```text
V0_INPUT
V1_TASK_A_SCHEMA
V2_TASK_A_SEMANTIC_REFERENCES
V3_COURSE_SCOPE
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

## 2.1 Effective Evidence Gate

Task A 在 V0_INPUT 前必须先经过 Effective Evidence Gate。

生产固定规则：
- 正式调用只允许 `mode=PRODUCTION`；
- issueKey / evidence / event properties 含 Acceptance / Simulation / Human Review / Visual Review / Demo / Test 标记时 fail-closed 排除；
- 学习者原始行只接受 ACTIVE / USER 且具有正式 identity 的用户；
- 学习反馈同一用户 / issue 只取最新记录；非帮助度文本反馈至少 3 个独立用户才可进入 AI；
- Check：至少 10 个独立用户；错误率 >=35% 为 VALID，否则足样本数据只可 SUPPORTING_ONLY；
- Practice：至少 10 个独立用户；首次通过率 <50% 为 VALID，否则足样本数据只可 SUPPORTING_ONLY；
- Hint：至少 10 个实操用户；使用率 >=50% 为 VALID，否则足样本数据只可 SUPPORTING_ONLY；
- Helpfulness：每用户只取最新一次，至少 10 人；NOT_HELPFUL >=25% 为 VALID，否则足样本数据只可 SUPPORTING_ONLY；
- `still_confused` / `real_ai_evidence_recorded` 只在至少 3 个独立用户时作为 SUPPORTING_ONLY；
- learningEvents 只允许 `hint_revealed / still_confused / real_ai_evidence_recorded` 三类进入 AI Evidence；
- INSUFFICIENT_SAMPLE / EXCLUDED / UNAVAILABLE 不进入 `evidence_catalog`；
- available_fields 必须依据“有效数据真实存在”计算，禁止把空集合标为 available。

正式 Task A 源码不得直接查询原始 courseInsights / learningFeedback 作为 AI Evidence；唯一入口为 `buildEffectiveLearningEvidenceSet(courseKey)`。

Fail code / 治理原因至少包含：
`NON_PRODUCTION_ORIGIN / INELIGIBLE_USER / INSUFFICIENT_SAMPLE / EVENT_NOT_ALLOWED / EMPTY_CONTENT`。

Task B 前额外检查：

- Task A 已通过；
- 当前 Task A 对当前 course_id 的 action = MODIFY；
- Task B course_id 必须等于当前管理员正在处理的 course_id；
- 一次只允许一个 course_id；
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

## 5. V3 — Course Scope

不再存在额外 Human Gate 2。管理员在当前课程点击一次“AI分析”后，Orchestrator 可以在 Task A 成功且当前课程 action=MODIFY 时自动进入 Task B。

Core 必须确认：
- Task B 只处理当前管理员正在查看的 course_id；
- Task A 必须明确该课程为 MODIFY；
- REVIEW_ONLY / NOT_RELEVANT / INSUFFICIENT_EVIDENCE 不得自动进入文本 Patch；
- Task B 一次只处理一门课程；
- AI 不能把前置 / 后续课程诊断结果自动扩张为修改范围。

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

在 Human Final Preview Gate 之后、真正 publish 前，再次读取最新正式课程 baseline：

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
- AI 输出或 Patch 自带发布动作；
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

## 10. V8 — Human Final Preview Gate

Core 必须确认：
- Preview 的 Before 来自当前正式 Snapshot；
- After 来自同一 Snapshot + validated AI Patch；
- 左右两侧使用同一学员 Runtime Presentation；
- AI 改动位置有确定性标记；
- Human 可修改 proposed text，但不能修改 path、ID、结构字段；
- Human 最终编辑值必须再次经过 V5 / V6 / V7；
- Human 明确点击“确认并发布”前不得改正式课程；
- final values、AI original proposed values、Human actor 写入审计。

## 11. V9 — Direct Publish Preconditions

正式发布前必须：

1. 当前课程仍存在；
2. 当前正式 baseline 与 Preview Before 完全一致；
3. 当前课程不存在活动人工 DRAFT / REVIEW；
4. 所有最终 Human 文本重新通过 V5 / V6 / V7；
5. 通过现有 Course Maintenance 发布事务生成新的正式课程版本；
6. 正式 Runtime 读取新版本后才算发布成功；
7. 同一次 publish 操作写入 Course Maintenance PUBLISHED 历史记录；
8. history.updateReason 固定为“课程反馈更新”；
9. history sourceContext 记录 Learning Insight / Task A / Task B / evidence refs / Human actor；
10. START / SAVE / SUBMIT 任一步失败时，自动取消本次 Learning Insight 新建的候选；不得触碰任务开始前已存在的人工候选；
11. publish 失败时正式课程与 PUBLISHED 历史不得部分成功，本次候选进入失败清理。

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
→ keep formal course/version history unchanged
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
- Human Gate 1 / Human Final Preview Gate；
- Task A / Task B；
- Task B 单课程；
- evidence_ref；
- mutable_path_catalog；
- permanent denylist；
- current_value baseline；
- Fail Closed；
- student-facing Before / After Preview；
- Human editable proposed text；
- direct publish only after Human confirmation；
- Course Maintenance PUBLISHED history；
- updateReason = 课程反馈更新；
- Course Builder Workflow untouched。

## 16. Runtime / DB Acceptance

实现阶段必须有可重跑测试覆盖：

1. Code 阈值不依赖 AI；
2. Human Gate 1 前 AI 不调用；
3. Task A 伪造 evidence_ref 被拒；
4. Task A 非法 course_id 被拒；
5. Task B 只能处理 Task A 标记 MODIFY 的当前课程；
6. Task B 越权 path 被拒；
7. current_value 过期被拒；
8. correctValues / passScore 修改被拒；
9. 数组长度变化被拒；
10. Human 在 After 预览中修改文字后再次通过 Validator；
11. 未点击确认发布前正式课程不变；
12. 点击确认后，现有 Course Maintenance publish 操作保证正式版本与 PUBLISHED 历史一致；
13. START / SAVE / SUBMIT / publish 中途失败时，本次 Learning Insight 创建的临时候选被清理，已有人工候选不受影响；
14. 历史 updateReason = 课程反馈更新；
15. sourceContext 可追溯；
16. 测试数据自动清理。

## Task A Provider / Validator Failure Audit

- Task A 整课输入允许显式使用更长模型请求超时；当前实现为 120 秒，其他通用 AI 调用继续使用 Adapter 默认超时；
- Provider 成功返回但 Structured Output Validator 失败时，ai_runs.status 必须为 FAILED；
- 失败 ai_runs 必须保存 rawOutput 供内部审计，但 rawOutput 不得进入正式诊断 UI、Candidate 或 Course Maintenance；
- Validator 通过前不得创建 Course Candidate，不得改变 Learning Issue 业务状态；
- 模型输出顶层必须严格只有 learning_issue_diagnosis_v2 定义的 7 个字段，额外字段一律拒绝。
