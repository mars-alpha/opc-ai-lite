# CONTEXT_GOVERNANCE.md — 上下文治理

## 1. 目标

任何新 Chat / Agent / Skill 不加载项目历史，也能通过少量 current owners 恢复正确状态；AI 输出必须可追溯、可验证、可回滚。

## 2. Repository Context

### Layer A — Bootstrap
- AGENTS.md
- docs/CURRENT_SYSTEM_FACTS.md
- PROJECT_STATUS.md
- TASKS.md
- docs/DEVELOPMENT_OPERATING_MANUAL.md

### Layer B — Domain Owner
只读取当前任务涉及的：
- docs/ARCHITECTURE.md
- docs/domains/*
- docs/learning/* current owner
- docs/learning-insight/* current owner
- docs/content/* current owner
- 当前代码 / Schema / API

### Layer C — Task Evidence
只有出现具体问题时才读取 Git history 或旧 commit。

历史生产文件不保留在 current tree 作为“备用上下文”。

课程内容代码与课程规则必须分开：
- `docs/learning/*` current owners = 课程规则与 Curriculum；
- `lib/learning/course-content/*` = 已冻结的正式课程生产内容，只在具体课程实现/Runtime 问题中按需读取；
- `fixtures/*` = Validator / Acceptance 测试数据，不得承载正式生产课程；
- `git-history:...` = 历史 provenance 标签，只用于追溯，永远不是 current owner。

当前专项 owner 同样按任务按需加载：
- `docs/learning-insight/*` = 学习洞察 current contracts；
- `docs/content/*` = 内容采集与 AI 日报 current contracts；当前目录只允许六份 owner：两份 `COLLECTION_*` 负责采集架构 / implementation mapping，四份 `CONTENT_AI_DAILY_*` 负责 Adopt 后 AI 日报生产链；
- 未列入 current owner 集合的历史 Brief / Result / Proposal 不得作为新任务默认上下文。

## 3. Owner Rule

一个事实只有一个 owner。其他地方只写：
`状态 + owner 路径`

禁止把同一规则正文复制到 AGENTS / Current Facts / Workflow / Skill / Task / Validator 注释并要求同步维护。

Validator 可以断言规则存在，但不能成为规则正文 owner。

## 4. AI Context Pack

未来 AI 任务不得直接拼接“大 Prompt + 全知识库”。

一次调用拆成：

```text
Task
+ Rule Pack
+ Evidence Pack
+ Approved Knowledge Pack
+ Output Schema
```

每个 Pack 应有：
- id；
- version；
- owner；
- scope；
- status；
- source / evidence；
- last_verified_at；
- valid_from / valid_until（需要时）。

## 5. Known / Unknown

Context Assembly 必须区分：
- KNOWN：有 Evidence；
- APPROVED：有人审通过；
- UNKNOWN：当前没有可靠信息。

UNKNOWN 不允许模型自行补全为事实。

## 6. AI Run Provenance

每次 AI Run 至少记录：

```text
run_id
task_type
model_provider
model
skill_version
prompt_version
rule_pack_versions
context_ids
evidence_ids
input_hash
raw_output
validator_result
human_review_result
created_at
```

目标：任何正式内容都能回答“为什么当时这样生成”。

## 7. Skill Governance

Skill 是版本化资产，不是隐式 Prompt。

每个 Skill：
- purpose；
- input_schema；
- output_schema；
- rule_pack；
- context_policy；
- model_profile；
- validator；
- human_review_policy。

Stable version 不覆盖修改。新优化创建新 version，通过 Golden Dataset / Human Review 后再切 current。

## 8. Workflow Governance

Workflow 由系统编排，AI 不自己决定状态流。

Skill 只返回结构化结果；写库、发布、权限、状态变化由 Core 完成。

## 9. Golden Dataset

内容系统从 0 数据开始时：
- 先人工积累 100～300 个高质量审核案例；
- 保存 AI 初判、人工结论、修改理由；
- 用同一 Dataset 比较模型、Prompt、Skill；
- 优先比较事实错误率、漏项、人工修改量和成本。

## 10. Context Budget

每次任务先限制：
- 最大 Source 数；
- 最大 Knowledge Item 数；
- 最大 Rule Pack 数；
- 时间窗口；
- 主题范围。

召回越多不代表越准确。

## 11. 安全

- Secret 永远不进入 Context Pack。
- 用户 BYOK Key 不成为 Skill input，不写 AI Run，不进入数据库明文字段。
- 任何 Provider Key 都不得写日志、错误正文或分析事件。

## 12. Human Review Boundary

Repository 级可视化审核规则由 `AGENTS.md` 的 `VISUAL_HUMAN_REVIEW_GATE` 唯一拥有。

Context / Task 状态必须区分：
- `UI_IMPLEMENTED`：代码已经完成；
- `REVIEW_BLOCKED`：尚不具备真实体验条件；
- `AWAITING_USER_REVIEW`：已可体验，等待产品负责人确认；
- `USER_APPROVED`：产品负责人已明确审核确认。

不得把 Build PASS、截图、自动化视觉检查或 Agent 自评替代产品负责人的真实体验确认。
