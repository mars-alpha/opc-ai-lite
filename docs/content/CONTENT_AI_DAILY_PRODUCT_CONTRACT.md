# CONTENT_AI_DAILY_PRODUCT_CONTRACT.md

Status: **CURRENT**  
Task: CONTENT-AI-DAILY-CONTRACT-001  
Owner scope: OPC AI 官方内容 / AI 日报  

## 1. Product Decision

AI 日报内容生产继续只服务 **AI 日报**。

采集发现与来源能力的产品边界已由 `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md` 接管。独立人工采集产品已退役；AI 日报生产合同不拥有采集策略、Source 或 Hotspot 判定。

当前关系固定为：

```text
来源管理 → SYSTEM 自动采集 → 热点追踪
→ 统一 Event / Source / Evidence
→ Topic Diagnosis
→ 内容工作台
```

内容工作台不再承担通用内容工厂职责，不再以公众号、小红书、知乎、视频脚本、配音、剪映草稿或多平台分发为当前产品目标。

当前唯一正式内容生产链：

> Current runtime gate：该链只消费 Source Management + SYSTEM Collection Runtime + Hot Tracking 形成并经人工采用的 Event / Evidence。热点追踪的 ADOPT 当前只记录 Event 采用意图，不自动跳过 Topic Diagnosis / Evidence Pack / Draft。

```text
Source / Raw Item / Event
→ Topic Diagnosis
→ Human Gate 1: ADOPT / WATCH / IGNORE
→ Evidence Pack
→ Outline
→ Draft
→ Formatted Draft
→ Human Gate 2: APPROVE & PUBLISH / RETURN
→ AI Daily
```

## 2. Product Boundary

### In Scope

- AI 日报候选事件的选题诊断。
- Adopt 后的证据整理。
- 基于证据生成提纲。
- 基于证据与提纲生成正文。
- 中文写作自然化，但不得改变受保护事实。
- 正文的结构排版与媒体规划。
- AI 日报首图、正文插图、知识卡片、后续动画的 Asset 槽位。
- 最终人工审核与发布。
- 全链路来源追溯、版本、审计和可重跑。

### Out of Scope

- 通用公众号内容工厂。
- 小红书、知乎、抖音、B站等平台专用生产链。
- 自动社媒分发。
- 配音、剪映草稿、视频流水线。
- COS 正式接入。
- Remotion 正式接入。
- 用户个人 AI 工作台。
- AI 自动发布。
- Skill 直接写数据库。

## 3. Stage Responsibilities

### Topic Diagnosis

回答：**这件事值不值得进入 OPC AI 日报生产？**

允许：
- 判断读者价值、时效、差异化空间、重复风险和证据缺口。
- 给出建议写作角度。

禁止：
- 生成正文。
- 修改 Event 事实。
- 自动 Adopt。
- 将模型推测写成观测事实。

### Evidence Pack

回答：**我们真正知道什么，证据来自哪里，还有什么不知道？**

必须：
- 每个关键事实可追溯到 Source。
- 明确时间线、关键数字、冲突信息和不确定项。
- 明确哪些事实属于 Locked Facts。

禁止：
- 使用模型常识补足缺失事实。
- 将无来源判断升级为事实。

### Outline

回答：**文章按什么逻辑写，每一段使用哪些证据？**

必须：
- 每一节绑定 Evidence Fact。
- 明确段落目的。
- 可标记视觉机会，但不生成最终媒体。

### Draft

回答：**基于已确认事实和提纲，文章具体怎么写？**

唯一事实输入：

```text
Topic Diagnosis + Evidence Pack + Outline
```

写作 Skill 不得在此阶段自行新增网络事实。

中文自然化可作为 Draft 内部处理步骤，但不得形成第二套业务状态。

### Formatted Draft

回答：**最终内容如何呈现？**

负责：
- 标题层级。
- 段落、列表、引用、重点标记。
- Asset 插入位置。
- 首图 / 插图 / 卡片 / 时间线 / 对比 / 动画槽位。

不负责：
- 改变文章核心观点。
- 改写 Locked Facts。
- 重新生成未验证事实。

Formatted Draft 必须以 Draft 为内容源，优先通过结构引用和样式指令组织正文，而不是重新生成一篇新文章。

## 4. Human Gates

AI Daily 只保留两个正式内容 Human Gate；全局采集侧 Gate 1“Raw/Observation → Event Candidate”由 Collection Contract 持有，不在本合同重复编号。

### Content Gate — Event Adoption

```text
ADOPT
WATCH
IGNORE
```

只有经过 Collection Gate 1 成为正式 Event，并在这里 ADOPT，才能进入 Evidence Pack。

### Final Review Gate

管理员看到：
- 最终正文；
- 关键来源；
- 视觉资产；
- 风险 / 不确定项；
- 发布去向。

通过后由 Core 执行正式发布。

不再增加“审核通过后再点一次无信息增量发布”的重复 Gate。

## 5. Code / AI / Skill / Human Split

### Code

负责：
- Source / Raw Item / Event。
- 去重、聚类、状态机。
- Artifact 版本与 lineage。
- Schema 校验。
- Source / Fact 引用完整性校验。
- 权限与审计。
- Asset Registry。
- Publish。

### AI / Skill

负责：
- 选题判断建议。
- 多来源语义整理。
- 提纲。
- 写作。
- 中文表达优化。
- 视觉规划。
- 媒体生成建议。

Skill 必须：
- 版本化。
- 经 OPC Skill Adapter 调用。
- 返回结构化结果。
- 不拥有正式业务状态。
- 不直接写数据库。
- 不拥有发布权限。

### Human

负责：
- 选题最终采用。
- 必要时修改 Evidence / Outline / Draft。
- 最终内容责任和发布确认。

## 6. Discovery Boundary

热点发现不属于五阶段正文生产合同。

```text
Collector
→ Raw Item
→ Event
→ Discovery / Trend Analysis
→ Topic Diagnosis
```

例如 qianjin-trending-hunter 可作为 Discovery 辅助，用于发现遗漏热点、跨来源趋势和候选角度；其热度评分、生命周期等属于 AI 分析信号，不得冒充平台真实指标。

## 7. Media Boundary

媒体属于 AI 日报 Asset，不属于独立内容产品。

当前合同只预留：

```text
COVER
IMAGE
ILLUSTRATION
HTML_CARD
VIDEO
ANIMATION
```

当前阶段不决定具体 COS、Remotion 或图片 Provider。

外部原始媒体继续遵守 REFERENCE_ONLY：默认只保存引用与 metadata，不做长期下载归档。

## 8. Workflow State

业务状态建议保持简洁：

```text
CANDIDATE
→ DIAGNOSED
→ ADOPTED
→ EVIDENCE_READY
→ OUTLINE_READY
→ DRAFT_READY
→ FORMATTED
→ PUBLISHED
```

WATCH / IGNORE 属于 Event Decision，不伪装成 Content Draft。

各 Artifact 自身使用版本，不通过无限增加业务状态表达编辑历史。

## 9. Non-Negotiable Invariants

1. 没有 Source 的关键事实不能成为 Locked Fact。
2. AI 输出不能覆盖原始 Source / Event。
3. Evidence Pack 是正文事实的唯一证据入口。
4. Outline 不得引用 Evidence Pack 外事实。
5. Draft 不得自行扩展事实集。
6. Humanizer 不得修改 Locked Facts。
7. Formatted Draft 不得成为第二篇独立改写文章。
8. Skill 不直接写库，不直接发布。
9. 发布必须经过最终 Human Gate。
10. 任一 AI Skill 不可用时，Core 数据和已有 Artifact 必须仍可读取与人工编辑。

## 10. Current Acceptance

以下产品事实已经确认并成为 current baseline：

- 内容采集只服务 AI 日报。
- 五阶段顺序固定。
- 两个 Human Gate 固定。
- 多平台通用生产退出 current scope。
- Skill / Code / Human 边界固定。
- COS / Remotion 仅预留、不进入当前实现。

下一阶段只能从现有 Schema / API / Workbench 的 Current → Target 审计开始；不得绕过合同直接做 migration 或 UI。

