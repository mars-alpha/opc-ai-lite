# Learning Insight AI Prompt Contract

Status: **ACTIVE / CURRENT OWNER**

本文件定义学习洞察 V2 两个 AI Task 的固定 Prompt Contract。产品流程见 `LEARNING_INSIGHT_WORKBENCH_V2_PRODUCT_CONTRACT.md`。

AI 只在 Human 授权后运行。机械统计、阈值、状态、写库、发布不属于 AI。

## V2 Prompt Direction Revision — Course Level Analysis

AI 分析对象调整为课程级上下文。

Task A 不再只回答“这个 Issue 是否需要修改”，而需要结合：

```text
课程完整内容
+
该课程累计问题
+
问题时间线
+
学习证据
+
上下游课程关系
```

判断：

- 问题是否属于当前课程；
- 是否由前置课程造成；
- 是否影响后续课程理解；
- 修改需要影响哪些 Step。

Task B 生成修改 Proposal 时，必须基于完整课程上下文生成，并为 Human 提供改前 / 改后对照基础。

AI 不直接输出正式课程更新，只生成进入 Course Maintenance Preview 的候选变更。

## 1. Prompt 总原则

所有 Prompt 必须满足：

- 固定版本；
- 由 Code 组装，不允许前端任意自由拼 Prompt；
- 输入只包含经过确定性整理的事实、Evidence Catalog、允许读取的课程内容和 Human 授权范围；
- 不把数据库状态控制交给 AI；
- 不要求 AI 返回自然语言文章；
- 只返回 Structured Output Contract 定义的 JSON；
- 不允许输出 Markdown code fence；
- 不允许生成输入中不存在的证据；
- 不允许推断学员身份、心理或能力；
- 不允许因为少量证据扩大结论；
- 证据不足时必须选择继续观察或证据不足。

Prompt owner 版本：

```text
learning-issue-diagnosis@2
course-change-generator@2
```

## 1.1 Effective Evidence Set

Task A 的正式数据入口固定为 `buildEffectiveLearningEvidenceSet(courseKey)`。

生产模式固定规则：
- mode = PRODUCTION；
- Acceptance / Human Review / Simulation / Demo / Test 数据不得进入正式 `evidence_catalog`；
- 学习者数据只允许 ACTIVE / USER 且存在正式 identity 的账号进入；
- 学习反馈先去重，再按确定性最小样本规则决定是否可进入 AI；
- Check / Practice / Hint / Helpfulness 使用既有确定性阈值；
- `still_confused` 与 `real_ai_evidence_recorded` 当前只能作为 SUPPORTING_ONLY，不能自行生成已确认根因；
- 只有 VALID / SUPPORTING_ONLY 能进入 AI 的 `evidence_catalog`；
- INSUFFICIENT_SAMPLE / EXCLUDED / UNAVAILABLE 只进入治理审计，不进入 AI 事实证据；
- `data_availability` 必须反映真实有效数据是否存在，字段结构存在不等于 available；
- 正式 Task A 不得绕过 Effective Evidence Set 直接读取 courseInsights / learningFeedback / Evidence Detail 原始行。

Acceptance 模式只允许由内部测试代码显式调用，正式 API 不暴露 mode 参数。Acceptance AI Run 必须与 Production Run 隔离。

## 2. Task A — Learning Issue Diagnosis

### 2.1 调用前置条件

Code 必须确认：

- 当前 Course 已存在至少 1 个真实 Learning Issue；
- Human Gate 1 = “交给 AI 分析”；
- `course_issue_bundle` 只能来自 PRODUCTION Effective Evidence Set，不为空；
- evidence_catalog 只能包含 Effective Evidence Set 判定为 VALID / SUPPORTING_ONLY 的证据，且非空；
- current_course_snapshot 已从现有 AdminCourseSnapshot 读取；
- curriculum_catalog 已从 Formal Curriculum 读取；
- adjacent_course_summaries 只能来自现有课程目录 / Snapshot，可为空但不得由 AI 补写；
- 每个输入字段都能追溯到真实数据 owner；
- 不包含直接身份信息。

如果某项数据当前系统不存在，Code 必须显式标记 unavailable 或省略可选字段；不得为了满足 Prompt 而构造假数据。

### 2.2 Task A 输入

固定输入字段：

```text
course_issue_bundle
course_issue_timeline
deterministic_metrics
evidence_catalog
current_course_snapshot
curriculum_catalog
adjacent_course_summaries
data_availability
prompt_version
output_schema_version
```

其中：

**course_issue_bundle**
- current_course_id
- current_course_title
- issue_count
- open_issue_count
- issues[]
- 每个 issue 至少包含 issue_id / issue_type / occurred_at / evidence_refs

Task A 必须一次分析当前课程授权范围内的累计问题，不得只挑其中一个 Issue 作为主输入。

**course_issue_timeline**
- 按 occurred_at / updated_at 排序；
- 只包含当前真实存在的 Issue；
- 用于判断问题是偶发、持续还是近期集中出现。

**deterministic_metrics**
只允许放当前真实存在且已由 Code 计算的指标，例如：
- distinct_users
- check_incorrect_rate
- practice_first_pass_rate
- hint_usage_rate
- not_helpful_rate

当前没有确定性聚合的数据不得伪装成指标。例如 `still_confused` 目前虽有事件采集，但在聚合规则实现前只能作为 Evidence，不得当作已确认的“理解困难次数指标”。

**evidence_catalog**
每条都有：
- evidence_ref
- source_type
- human_readable_source
- evidence_status = VALID / SUPPORTING_ONLY
- content / metric
- occurred_at（如适用）
- source_owner

该数组已经由 Effective Evidence Set 过滤；AI 不接触被排除的原始行。

**curriculum_catalog**
包含前台当前已部署的 81 节正式课程；来源必须是当前确定性 Formal Registry / 正式课程目录，不允许从历史 Draft 或测试课程补齐：
- course_id
- title
- track
- short_capability

**data_availability**
由 Code 生成，明确：
- available_fields[]
- unavailable_fields[]
- source_owners{}
- evidence_governance：mode / eligible_evidence_count / excluded_evidence_count / exclusions / 当前确定性阈值

只有存在有效数据的字段才允许进入 available_fields。AI 必须把 unavailable 当作未知，不得补全。

### 2.3 Task A System Prompt

以下语义为固定 contract，不得在业务实现中弱化：

```text
你是 OPC AI 的 Learning Issue Diagnosis Skill。

系统已经把当前课程累计的真实 Learning Issue、问题时间线和证据整理完成，并且 Human 已明确授权你分析这门课程。
你不是问题检测器，不负责阈值，不负责业务状态，不负责发布，也不能直接修改课程。你必须同时考虑本次输入中的全部累计问题，不得只基于单个 Issue 下结论。

你只能使用输入中提供的：
1. 确定性学习指标；
2. evidence_catalog；
3. 当前正式课程内容；
4. 课程目录与必要的相邻课程摘要。

你的任务：
1. 说明证据实际支持什么问题；
2. 判断最可能的根因；
3. 判断问题主要属于当前课程、前置课程、后续课程，还是证据不足；
4. 列出需要关注的课程，并明确区分 MODIFY / REVIEW_ONLY / NOT_RELEVANT；
5. 指出可能需要修改的 Step 和具体字段区域；
6. 所有根因和课程判断必须引用输入中存在的 evidence_ref；
7. 如果证据不足，返回 INSUFFICIENT_EVIDENCE 或 CONTINUE_OBSERVING；
8. 不得为了给出答案而强行建议修改；
9. 不得输出“优化表达、加强案例、说得更清楚”这类不可执行结论，必须说明具体哪里不清楚、缺什么；
10. 不得生成修改后的课程正文。本阶段只诊断和确定候选课程范围。
11. 所有会直接显示给运营人员的诊断文案必须使用中文人话，描述“学员发生了什么、课程哪里有问题、建议改成什么”，不得直接暴露内部枚举、Schema、Evidence Set、source owner、数据库字段、文件路径或系统文件名。
12. 内部证据代码只能存在于结构化字段与校验链中，不能混入 problem_summary、root_causes.description、courses.reason、targets.problem、targets.change_goal。

禁止：
- 编造证据；
- 引用输入中不存在的文件、网页、ID；
- 推断具体学员身份或能力；
- 自动选择最终修改课程；
- 创建 Candidate；
- 改数据库状态；
- 输出 Markdown。

严格按 learning_issue_diagnosis_v2 JSON Schema 返回。
```

### 2.4 Task A User Prompt Assembly

Code 使用固定区块，不使用自由叙事：

```text
[COURSE_ISSUE_BUNDLE]
...

[COURSE_ISSUE_TIMELINE]
...

[DATA_AVAILABILITY]
...

[DETERMINISTIC_METRICS]
...

[EVIDENCE_CATALOG]
...

[CURRENT_COURSE]
...

[CURRICULUM_CATALOG]
...

[ADJACENT_COURSES]
...

[OUTPUT_REQUIREMENT]
Return JSON only.
Schema: learning_issue_diagnosis_v2.
Code 必须同时提供：
- allowed_top_level_fields；
- decision enum；
- root cause type enum；
- course action enum；
- exact_shape。
模型不得返回 Contract 未定义字段。
```

## 3. Task A → Task B Orchestration

不再设置独立 Human Gate 2。

管理员对当前课程点击一次“AI分析”后：
- Task A 先完成整课诊断；
- 若 Task A 对当前课程返回 MODIFY，Core 可自动继续 Task B；
- 若返回 REVIEW_ONLY / NOT_RELEVANT / CONTINUE_OBSERVING / INSUFFICIENT_EVIDENCE，则不得自动生成文本 Patch；
- Task B 只能处理当前管理员正在处理的这一门课程，不能因为 Task A 提到前置/后续课程而自动修改其它课程。

Human 的下一次明确 Gate 发生在真实学员界面 Before / After Preview。

## 4. Task B — Course Change Generator

### 4.1 调用粒度

Task B **每次只允许一门课程**。

如果 Human 批准 3 门课程：

```text
Orchestrator
→ Task B(course A)
→ validate
→ Task B(course B)
→ validate
→ Task B(course C)
→ validate
```

禁止一次让 AI 跨课程批量生成 Patch。

### 4.2 Task B 输入

固定输入：

```text
confirmed_issue
task_a_diagnosis
current_course_id
evidence_catalog
current_course_snapshot
mutable_path_catalog
system_scope
prompt_version
output_schema_version
```

**mutable_path_catalog** 必须由 Code 从当前 AdminCourseSnapshot 生成，仅包含 V2 允许替换的字符串叶子路径及 current_value。

AI 不得自行发明 path。

### 4.3 Task B System Prompt

```text
你是 OPC AI 的 Course Change Generator。

Human 已确认：
1. 这个学习问题值得处理；
2. 当前这门课程允许你生成修改 Proposal。

你只负责为当前这一门 current_course_id 生成候选文本 Patch。
你不负责发布、不负责业务状态、不负责修改其它课程。

你的工作原则：
1. 只修改 evidence 能支持的问题；
2. 只使用 mutable_path_catalog 中存在的 path；
3. 每项修改必须包含 current_value、proposed_value、reason、evidence_refs；
4. current_value 必须原样来自输入；
5. proposed_value 必须可以直接替换该现有字符串字段；
6. 保留原本正确内容，不为了产生修改而修改；
7. 如果某字段不需要改，不输出 Patch；
8. 不允许整课重写；
9. 不允许新增或删除 Step、卡片、Check、Practice；
10. 不允许修改 ID、questionType、correctValues、correctAnswer、passScore、分值、权限、状态、版本；
11. 不允许修改未授权课程；
12. 如果真正解决问题必须改变结构，返回 REQUIRES_MANUAL_STRUCTURE_CHANGE，不要伪造字符串 Patch；
13. 每个 Patch 都必须由至少一个 evidence_ref 支持；
14. 不能使用输入中不存在的 evidence_ref；
15. 不得输出 Markdown。

禁止模糊建议，例如：
- 优化这里
- 加强案例
- 更清楚一些
- 调整措辞

必须给出可以直接进入 Human Review 的具体 proposed_value。

严格按 course_change_patch_v2 JSON Schema 返回。
```

### 4.4 Task B User Prompt Assembly

```text
[CONFIRMED_ISSUE]
...

[TASK_A_DIAGNOSIS]
...

[CURRENT_COURSE_ID]
...

[EVIDENCE_CATALOG]
...

[CURRENT_COURSE_SNAPSHOT]
...

[MUTABLE_PATH_CATALOG]
...

[SYSTEM_SCOPE]
...

[OUTPUT_REQUIREMENT]
Return JSON only. Schema: course_change_patch_v2.
```

## 5. Prompt 输入裁剪

为了避免上下文膨胀：

Task A：
- 当前课程给完整 snapshot；
- 其它课程默认只给 catalog + capability summary；
- AI 判断需要检查的相邻课程可以在下一轮由 Code 补充摘要，但不得自动扩大为修改范围。

Task B：
- 只给一门 Human 批准课程的完整 snapshot；
- 只给与该问题有关的 evidence；
- 只给 mutable_path_catalog；
- 不给其它课程全文。

## 6. Prompt 禁止内容

不得写入 Prompt：
- API Key；
- Secret；
- 学员邮箱；
- userId；
- Session Token；
- 数据库连接信息；
- 无关的全部历史聊天；
- 当前正在处理课程以外、且本次诊断不需要的其它课程全文；
- Production 内部 Secret；
- 内部绝对文件路径。

## 7. 失败与重试

AI 返回失败时：

```text
MODEL_ERROR
INVALID_JSON
SCHEMA_INVALID
EVIDENCE_REFERENCE_INVALID
SCOPE_VIOLATION
```

都必须由 Core 标记失败。

固定规则：
- 不静默修正 AI JSON；
- 不自动猜 enum；
- 不自动删除非法 Patch 后继续；
- 不自动应用“部分看起来能用”的结果；
- Human 可以重新发起 AI 分析；
- 每次重跑产生新的 AI Run provenance。

## 8. Provenance

每次调用至少保存：
- task_type；
- prompt_version；
- output_schema_version；
- provider；
- model；
- input evidence_ref 列表；
- current_course_id（Task B）；
- started_at / completed_at；
- raw output hash；
- validated output hash；
- validation result。

raw Prompt 中不得长期保存 Secret。

## 9. Prompt 验收

必须测试：

1. 无 Human Gate 1 时不能调用 Task A；
2. Task A 对证据不足场景会返回继续观察；
3. Task A 不能生成课程正文 Patch；
4. Task A 引用不存在 evidence_ref 必须被拒绝；
5. Task A 未对当前课程返回 MODIFY 时不能调用 Task B；
6. Task B 每次只能当前这一门课程；
7. Task B 不能使用 mutable_path_catalog 之外的 path；
8. Task B 不能修改 correctAnswer / passScore / ID；
9. Task B 能生成明确 current_value → proposed_value；
10. 结构变化需求必须返回 REQUIRES_MANUAL_STRUCTURE_CHANGE。
