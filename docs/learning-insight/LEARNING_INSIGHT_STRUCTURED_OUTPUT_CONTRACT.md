# Learning Insight Structured Output Contract

Status: **ACTIVE / CURRENT OWNER**

本文件定义学习洞察 V2 的 AI 输出结构。Prompt 见 `LEARNING_INSIGHT_AI_PROMPT_CONTRACT.md`。

所有 AI 输出必须是纯 JSON，不接受 Markdown、不接受“JSON + 解释文字”。

## V2 Structured Output Direction Revision — Course Context

AI 输出需要支持课程级判断，而不是孤立 Issue 判断。

Task A 输出必须能够表达：

```text
问题
↓
课程影响范围
↓
上下游课程关系
↓
建议关注的 Step
```

新增要求：

- 所有课程判断必须关联 course_id；
- 所有根因必须引用 evidence_ref；
- 不允许只输出“表达不清”等无法执行的问题描述；
- 修改建议必须能够进入 Course Maintenance Preview；
- Before / After 对照所需信息必须来自真实 snapshot，不由 AI 虚构。

## 1. 通用规则

- schema_version 必填；
- enum 必须严格匹配；
- 未定义字段拒绝；
- evidence_ref 必须来自输入 evidence_catalog；
- course_id 必须来自 Formal Curriculum；
- AI 不返回数据库状态写入指令；
- AI 不返回 publish / approve 命令；
- 字符串默认去首尾空格后仍不能为空；
- 不接受 NaN / Infinity / undefined；
- 不接受自由格式 path。

## 2. Task A 输出：learning_issue_diagnosis_v2

顶层：

```json
{
  "schema_version": "learning_issue_diagnosis_v2",
  "decision": "CHANGE_RECOMMENDED",
  "problem_summary": "学员理解了要补上下文，但无法区分目标、背景和输出要求。",
  "root_causes": [],
  "courses": [],
  "targets": [],
  "observation_note": null
}
```

### 2.1 decision

允许：

```text
CHANGE_RECOMMENDED
CONTINUE_OBSERVING
NO_CHANGE_NEEDED
INSUFFICIENT_EVIDENCE
```

### 2.2 root_causes

每项：

```json
{
  "type": "EXPLANATION_GAP",
  "description": "Step 2 缺少目标、背景、输出要求之间的直接对照。",
  "evidence_refs": ["feedback:1", "check:2"]
}
```

允许 type：

```text
EXPLANATION_GAP
EXAMPLE_GAP
BOUNDARY_CONFUSION
PRACTICE_INSTRUCTION_GAP
ASSESSMENT_WORDING_PROBLEM
CONTENT_OUTDATED
CONTENT_POSSIBLY_INCORRECT
PREREQUISITE_GAP
COURSE_OVERLAP
OTHER
```

约束：
- 0～5 项；
- 每项至少 1 个 evidence_ref；
- description 必须具体说明问题，不得只写“表达不清”。

### 2.3 courses

每项：

```json
{
  "course_id": "T1-02",
  "action": "MODIFY",
  "reason": "问题直接发生在本课核心知识点。",
  "evidence_refs": ["feedback:1", "check:2"]
}
```

action：

```text
MODIFY
REVIEW_ONLY
NOT_RELEVANT
```

约束：
- 最多 5 门；
- course_id 唯一；
- MODIFY 只是 AI 建议，不是 Human 授权；
- MODIFY / REVIEW_ONLY 至少 1 个 evidence_ref。

### 2.4 targets

每项：

```json
{
  "course_id": "T1-02",
  "step": 2,
  "area": "example.knowledgeDepth",
  "problem": "目标、背景、输出要求缺少对照。",
  "change_goal": "让学员能够区分三类信息。",
  "evidence_refs": ["feedback:1", "feedback:4"]
}
```

约束：
- 最多 12 项；
- step 只能 1～6；
- area 是人类可读区域提示，不是最终 Patch path；
- Task A 不允许输出 current_value / proposed_value。

### 2.5 observation_note

只在以下 decision 推荐填写：
- CONTINUE_OBSERVING
- INSUFFICIENT_EVIDENCE

说明还缺什么事实，不能要求 AI 自己补证据。

## 3. Task B 输出：course_change_patch_v2

Task B 每次只针对一门课程。

顶层：

```json
{
  "schema_version": "course_change_patch_v2",
  "course_id": "T1-02",
  "decision": "PATCH_PROPOSED",
  "changes": [],
  "manual_structure_reason": null
}
```

### 3.1 decision

允许：

```text
PATCH_PROPOSED
NO_CHANGE_NEEDED
REQUIRES_MANUAL_STRUCTURE_CHANGE
```

### 3.2 changes

每项：

```json
{
  "patch_id": "p1",
  "action": "REPLACE",
  "path": "example.knowledgeDepth[1].text",
  "current_value": "上下文应该尽量说清楚。",
  "proposed_value": "先区分三类信息：目标回答要完成什么，背景回答 AI 需要知道什么，输出要求回答结果应该长什么样。",
  "reason": "反馈显示学员无法区分目标、背景和输出要求。",
  "evidence_refs": ["feedback:1", "feedback:4", "check:2"]
}
```

固定规则：
- action V2 只允许 REPLACE；
- patch_id 在单次输出中唯一；
- path 必须精确存在于输入 mutable_path_catalog；
- path 指向字符串叶子；
- current_value 必须与输入 path 当前值完全一致；
- proposed_value 必须与 current_value 不同；
- proposed_value 不得为空；
- reason 必须解释“为什么这项具体替换解决证据反映的问题”；
- evidence_refs 至少 1 个；
- changes 最大 20 项；
- 单次输出所有 changes 必须属于同一 course_id。

### 3.3 V2 path allowlist

由 Code 从当前 AdminCourseSnapshot 动态生成。

允许类型示例：

```text
courseHeader.title
courseHeader.catalogTitle
courseHeader.catalogSubtitle
courseHeader.lessonPageLead

stepMeta[n].title
stepMeta[n].objective
stepMeta[n].navigationDescription

intro.title
intro.situation
intro.approaches[n].label
intro.approaches[n].text
intro.takeaway
intro.bottomDetails[n].title
intro.bottomDetails[n].text

example.title
example.situation
example.before
example.after
example.result
example.knowledgeDepth[n].title
example.knowledgeDepth[n].text

checks[n].question
checks[n].options[m].label
checks[n].explanation
checks[n].correctFeedback
checks[n].incorrectFeedback

practice.title
practice.goal
practice.instructions[n].label
practice.instructions[n].prompt
practice.hints[n]
practice.rubric[n].label
practice.rubric[n].example
practice.activity.title
practice.activity.instruction
practice.activity.prompt
practice.activity.reflection
practice.referenceAnswer
practice.referenceFill.<existing_key>

review.items[n]
review.labels.primary
review.labels.secondary
review.knowledgeDepth[n].title
review.knowledgeDepth[n].text
review.mistakes[n]
review.related[n]

capability.title
capability.gain[n]
capability.selfAssessment[n]
capability.triggerScenario
capability.nextLessonValue
```

注意：allowlist 不是静态让 AI 自己构造，而是每次由 Code 根据真实 snapshot 枚举。

## 4. 永久禁止的 Patch path

无论 Prompt 是否要求，以下字段永远禁止 AI Patch：

```text
*.id
stepMeta[n].id
stepMeta[n].kind
checks[n].id
checks[n].questionType
checks[n].masteryRole
checks[n].correctValues
practice.id
practice.passScore
practice.rubric[n].maxScore
practice.rubric[n].minScore
courseSlug
lessonSlug
version
status
reviewedBy
reviewedAt
publishedVersion
sourceContext
```

任何涉及：
- 权限；
- 状态；
- 版本；
- ID；
- 正确答案；
- 分值；
- 六步结构；
都必须 Validator FAIL。

## 5. Manual Structure Change

如果 AI 判断必须：
- 新增 / 删除 Step；
- 新增 / 删除卡片；
- 新增 / 删除题目；
- 新增 / 删除实操；
- 改正确答案；
- 改 passScore；
- 改数据结构；

必须返回：

```json
{
  "schema_version": "course_change_patch_v2",
  "course_id": "T1-02",
  "decision": "REQUIRES_MANUAL_STRUCTURE_CHANGE",
  "changes": [],
  "manual_structure_reason": "当前问题需要新增一张对照卡片，V2 字符串替换无法安全表达。"
}
```

系统不得将其转换成近似 Patch。

## 6. Persisted Envelope

AI 原始 JSON 通过 Validator 后，Core 才可以包装成持久化 envelope：

```json
{
  "run_id": "system-generated",
  "task_type": "COURSE_CHANGE_GENERATOR",
  "prompt_version": "course-change-generator@2",
  "schema_version": "course_change_patch_v2",
  "provider": "system-recorded",
  "model": "system-recorded",
  "input_evidence_refs": [],
  "approved_course_id": "T1-02",
  "validated_output": {},
  "validated_at": "system-generated"
}
```

这些 provenance 字段由 Core 添加，不让 AI 自报。

## 7. Human Gate 3 数据

Human 逐项审核后，Core 生成：

```json
{
  "accepted_patch_ids": ["p1", "p3"],
  "rejected_patch_ids": ["p2"]
}
```

只有 accepted_patch_ids 可以进入 apply。

AI 不决定 accepted_patch_ids。

## 8. 输出验收样例

### 合格

- evidence_ref 全部存在；
- course_id 合法；
- path 来自 mutable_path_catalog；
- current_value 与当前 snapshot 一致；
- proposed_value 明确具体；
- 不改变结构。

### 不合格

```json
{
  "path": "steps[2].cards.push",
  "proposed_value": "新增一个案例"
}
```

原因：结构修改。

```json
{
  "path": "checks[0].correctValues",
  "proposed_value": ["B"]
}
```

原因：正确答案属于永久禁止字段。

```json
{
  "path": "example.before",
  "current_value": "模型自己猜的旧内容",
  "proposed_value": "新内容"
}
```

原因：baseline 不匹配。
