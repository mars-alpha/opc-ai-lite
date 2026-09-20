# DATA.md — Event、Analytics、Feedback 与 Course Insight

## 1. 原则

只采集当前产品决策真正需要的数据。

不因为“未来可能分析”提前建设大数据体系，也不允许前端直接声明服务端业务结果。

---

## 2. 正式 MVP-009 数据实体

```text
learning_events
learning_feedback
course_insights
course_update_candidates
```

Migration：

```text
drizzle/0004_dapper_night_thrasher.sql
```

---

## 3. Learning Event

最小字段：

```text
id
user_id
lesson_id
event_name
target_type
target_id
properties JSONB
created_at
```

Event 分两类：

### 客户端允许写入的低风险行为

只允许 API 白名单中的行为事件。服务端必须校验 eventName / target / payload，不接受任意字符串事件。

### 服务端结果事件

以下类型只能由正式业务逻辑产生，不能由前端伪造：

```text
practice_passed
practice_needs_revision
evaluation_completed
evaluation_failed
lesson_completed
```

Runtime 已验证：前端伪造 `practice_passed` 返回 400。

---

## 4. Feedback

正式字段包括：

```text
user_id
lesson_id
target_type
target_id
issue_type
issue_key
resolution_status
helpfulness
reasons JSONB
comment
related_lesson_id
quality_risk
review_status
```

Feedback 不能直接修改正式课程。

已有课程可以回答的问题，应优先返回已有课程入口，不调用 AI。

---

## 5. Feedback → Course Insight 聚合

聚合主键：

```text
lesson_id + issue_key
```

使用独立用户数而不是反馈条数，避免单一用户重复提交放大问题。

当前规则：

```text
0–2 位独立用户      → OPEN
3+ 位独立用户       → ANALYSIS_READY
5+ 位独立用户       → HIGH priority
quality_risk = true → REVIEW_REQUIRED / HIGH priority
```

Runtime 已验证：

```text
3 个独立用户同类反馈 → ANALYSIS_READY
单个“内容可能过时”反馈 → REVIEW_REQUIRED
```

---

## 6. Course Insight

核心字段：

```text
lesson_id
issue_key
issue_category
status
distinct_user_count
evidence JSONB
diagnosis JSONB nullable
analysis_mode
```

规则聚合阶段：

```text
analysis_mode = RULE
```

只有真实模型成功产生结构化诊断后，才可以记录 AI Diagnosis。

当前开发环境没有真实 Provider 配置，因此 `ANALYSIS_READY` 不等于“已完成 AI 分析”。

---

## 7. AI Analysis 边界

Provider 配置：

```text
OPC_AI_ANALYSIS_BASE_URL
OPC_AI_ANALYSIS_API_KEY
OPC_AI_ANALYSIS_MODEL
```

当前开发环境未配置以上变量。

真实链路代码已接通：

```text
ANALYSIS_READY
→ AI Analysis
→ Course Coverage Check
→ Course Update Candidate
```

Provider 不可用或调用失败时：

```text
保持 ANALYSIS_READY
记录 aiAnalysisError
不生成虚假 AI Diagnosis
```

---

## 8. Knowledge Provenance

Knowledge 的主来源兼容字段继续保留：

```text
knowledge_items.source_content_id
= Primary Source shortcut
```

正式多来源关系：

```text
knowledge_source_links
knowledge_id
content_id
role = PRIMARY | SUPPORTING
created_at

UNIQUE(knowledge_id, content_id)
```

规则：

```text
1 Knowledge
→ 0/1 Primary Source
→ 0..N Supporting Sources
```

0007 migration 会把所有已有 `knowledge_items.source_content_id` 回填成 PRIMARY link。

Content → Knowledge 查询必须同时识别 Primary 与 Supporting link，避免同一 Content 因成为 Supporting Source 后又重复创建第二个 Knowledge。

当前不增加通用 asset_relations；Practice 与 Course Candidate 继续使用各自明确的 `sourceKnowledgeId`。

---

## 9. Knowledge Deep Resource / Feishu Bridge

Deep Resource 是 Knowledge-owned 的外部深度研究引用，不复用 `lesson_resources`。

```text
knowledge_deep_resources
id
knowledge_id required
lesson_id nullable
practice_id nullable
provider = FEISHU
title
summary nullable
resource_ref nullable
url
status = DRAFT | REVIEW | PUBLISHED | ARCHIVED
created_at
updated_at

UNIQUE(knowledge_id, url)
```

规则：

```text
Knowledge = canonical business source
Feishu Deep Resource = external deep research / practice carrier

PUBLISHED Deep Resource
→ requires Knowledge.status = PUBLISHED

Lesson / Practice
→ optional secondary relation
→ never required ownership
```

当前只提供 Admin 人工引用维护；没有 Feishu API 自动发布、同步或用户侧 Reader。

---

## 10. Course Update Candidate

Candidate 只是 Proposal，目前支持两种真实来源：

```text
lesson_id
source_type = LEARNING_INSIGHT | KNOWLEDGE
insight_id nullable
source_knowledge_id nullable
disposition
proposal JSONB
status = PENDING_REVIEW
reviewed_by
reviewed_at
```

来源约束：

```text
LEARNING_INSIGHT → insight_id required, source_knowledge_id empty
KNOWLEDGE        → source_knowledge_id required, insight_id empty
```

AI、规则或 Knowledge 都不能直接改 Published Lesson。

正式流程：

```text
Learning Insight ─┐
                  ├→ Course Update Candidate
Published Knowledge┘
→ Human Review
→ APPROVED / NEEDS_REVISION / DISMISSED
→ 后续人工课程更新任务
```

Insight 来源审核可以同步 Course Insight 状态；Knowledge 来源审核只更新 Candidate，不反向修改 Knowledge。

---

## 11. 行为信号

Interactive Lesson 可从真实行为刷新 Insight，例如：

```text
CHECK
PRACTICE
HINT
HELPFULNESS
```

行为信号必须先达到最小样本阈值再进入分析，避免少量用户行为直接触发课程更新。

---

## 12. 当前不建设

```text
大型 BI
通用埋点平台
用户画像评分系统
前端自定义任意 Event
AI 自动发布课程
AI 自动修改 Published
```