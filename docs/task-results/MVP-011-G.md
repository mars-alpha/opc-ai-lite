# MVP-011-G — Knowledge → Course Impact Analysis

Status: COMPLETE

## Goal

让 Published / active Knowledge 先分析是否影响现有课程，再由管理员确认后复用现有 Course Update Candidate；AI / RULE 不得直接修改课程。

## Audit decision

现有 `course_update_candidates` 已具备 Knowledge 来源、Lesson 定位、Knowledge+Lesson 幂等与人工审核，因此 G 不新增 Candidate 表，也不新增 Analysis 表。影响分析结果只作为 Admin 当前会话中的临时建议。

## Analysis flow

```text
Published + active Knowledge
↓
Published Stage / Module / Lesson catalog
↓
AI (configured) / conservative RULE
↓
Transient Impact Suggestions
├─ lessonId
├─ disposition
├─ affectedArea
├─ proposedChange
├─ rationale
└─ confidence
↓
Admin click Apply + manual edit
↓
existing Knowledge → Course Update Candidate API
↓
PENDING_REVIEW
```

分析服务不会自动创建 Candidate；管理员必须明确采用建议并再次提交 Candidate 表单。

## RULE behavior

当前环境：

```text
AI_PROVIDER_CONFIGURED=NO
```

因此真实验证路径是 conservative RULE：

- Knowledge 有 `lessonId`：只建议该 Lesson；
- Knowledge 无 `lessonId` 但有 `stageId`：最多建议该 Stage 前 3 个 Published Lesson；
- Knowledge 没有任何课程关联：返回空 suggestions；
- 不会随机挑选全站 Lesson 制造噪音。

RULE 响应明确返回 `generationMode=RULE` 和 `generationError=AI_PROVIDER_NOT_CONFIGURED`。

## AI behavior

Provider 配置存在时复用：

```text
OPC_AI_ANALYSIS_BASE_URL
OPC_AI_ANALYSIS_API_KEY
OPC_AI_ANALYSIS_MODEL
```

AI 只能从服务端给定的 Published Lesson catalog 选择 lessonId；最多返回 5 条建议。服务端重新校验 lessonId、disposition 和文本字段。

AI 返回明确空 suggestions 时视为“未发现明确课程影响”；不会强行回退为随机 Candidate。若 AI 结果格式非法或 Provider 失败，才回退 conservative RULE，并记录错误。

## Admin API / UI

新增：

```text
POST /api/admin/knowledge/items/:itemId/course-impact
```

现有 `KnowledgeCourseCandidatePanel` 增加“分析课程影响”。分析结果可点击“采用”填入已有 Candidate 表单，但管理员仍可修改 lessonId / disposition / proposal / rationale / affectedArea。

正式 Candidate 仍由原 API 创建：

```text
POST /api/admin/knowledge/items/:itemId/course-candidate
```

已有 Knowledge + Lesson Candidate 时继续返回现有记录，不重复创建。

## Persistence

本阶段没有 Schema 变化，没有生成 0010 migration。

```text
Impact Analysis = transient
Course Update Candidate = persisted business review object
```

避免 Analysis 与 Candidate 形成双事实源。

## Safety / human review boundary

```text
AI / RULE
≠ Candidate approval
≠ Lesson mutation
≠ Course publish
```

Candidate 创建后固定进入 `PENDING_REVIEW`；后续 APPROVED 仍只是人工课程更新任务，不自动覆盖 Published Lesson。

## Explicitly out of scope

```text
Feishu 内容抓取
Obsidian
新 Skill 平台
Media Asset
Membership / Payment
自动课程修改 / 发布
```

## Validation

```text
npm run typecheck  PASS
npm run build      PASS
AI_PROVIDER_CONFIGURED=NO
```

Production build 已包含 `/api/admin/knowledge/items/[itemId]/course-impact`。

## Next

不自动开启下一功能任务。先基于最新系统事实重新讨论产品主线优先级，再决定 Obsidian Sync、Skill v0.1 真实迭代、Access Policy 或其它任务。
