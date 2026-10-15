# 自动采集质量反馈 Implementation Plan

> **For agentic workers:** 按任务顺序执行；实现时使用 `superpowers:executing-plans`。本文件是一次性执行清单，当前规则正文只归采集合同；完成后执行清单退出 current tree，由 Git 追溯。不得将本计划视为已实施或已获 UI 审核。

**Goal:** 移除热点追踪现有“补充证据／继续观察／忽略／采用”的旧行为，提供新的人工正向“采用”和负向“忽略”采集质量标签，保存可用于后续回测的样本，同时保持自动发现和 SYSTEM 采集连续运行。

**Architecture:** 新标签写入独立的追加式样本表，与旧 `content_candidate_decisions`、`content_events.discoveryStatus` 隔离。动态只展示当前有效标签，历史样本、来源关联和反馈当时的自动判断独立保存。自动发现、采集、证据刷新、热度/精选/实践计算不读取新标签。

**Tech Stack:** Next.js 15、TypeScript、React、PostgreSQL/Drizzle、现有管理员鉴权/审计与 SYSTEM timer。

**Spec:** 产品规则唯一 owner 为 `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md`；实现路径 owner 为 `docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md`；Decision Brief 和执行状态为 `TASKS.md`。

## 需求

1. 热点追踪动态提供新“采用”和“忽略”。采用表示管理员认为该采集信息准确、有用；忽略表示有明显采集质量问题。两者均只形成评价样本。
2. 负向原因单选、可跳过：不相关、重复、过时、正文缺失或截断、事实不准确、其他。可附简短备注。正向一键操作，不引入评分或多步审核。
3. 支持改选和撤销当前评价，保留每次有效操作记录；同一评价重复请求不得重复计样本。
4. 自动发现形成的同一 Event 可能有多个 Source。单来源动态可默认关联该来源；多来源动态允许选择具体来源，不选择则记为 Event 层评价。Event 层负评不得自动归咎所有来源。
5. 来源管理在现有 Source 详情中显示最近30日已评价数、负向数和主要问题原因；管理员可查看有限条负向样本。未评价样本不算负例，页面不输出“全量采集准确率”。
6. 热点追踪在现有列表中提供未评价／已采用／已忽略筛选；操作后仅反馈状态变化，动态仍按原自动规则展示。
7. 每条有效评价保存反馈当时的 Event、Source/Raw/Observation/Run 关联、原文URL、事件时间、自动分类/栏目判断、相关规则版本、采集状态及评价人/时间。拿不到的字段记 null/UNKNOWN，不猜测；不保存 Secret 或完整原文副本。
8. 清除旧四操作及其下游作用：人工补证据入口、WATCH/SHORTLISTED 操作、旧 IGNORE 隐藏、旧 ADOPT 进入内容工作台或触发评论分析。旧数据库历史只保留审计，不纳入新样本。

## 边界

- 不修改 Source 发现、注册、Qualification、采集路由、Raw/Observation 写入、SYSTEM timer、自动 Event Expansion、Momentum、Curation、Practice 四条件和课程。
- 新标签不写 Event 状态、评分、验证结果、栏目资格或正式内容；不触发 AI、评论挖、草稿、发布、Source 启停或采集重试。
- 不新增主菜单、人工采集工作台、质量评分、自动调权/停源或批量审核。收集到足够样本后再单独规划来源优化、内容工作台与评论分析。
- 内容工作台兼容页只清除对旧 ADOPT/WATCH/IGNORE 的按钮、跳转、筛选和文案；现役独立的 Draft/Review/Publish 功能如仍有真实调用方，保持可运行，后续另立任务规划。
- 评论分析只清除对旧决策表的读取和 `EVENT_ADOPTED` 触发条件；既有热点、优先 Creator、评论增长、管理员显式触发逻辑按其本身合同保留，不把新评价接入触发。
- 旧 `content_candidate_decisions` 和 `discoveryStatus` 历史数据不批量改写、不删除。新服务不再写旧决策；旧 IGNORE 的可见性过滤退役后，处于当前窗口且满足其他资格的历史 Event 可重新出现。
- 学习洞察等其它领域的“继续观察”、研究建议中的 WATCH 及仅用于历史审计的枚举不属于删除范围。
- 人工补证据 POST 的两个现役调用点都要退出：热点追踪卡片及 Expansion Output Review。自动 `refreshSourceManagedEventExpansion` 仍由 SYSTEM 路径调用。相关审核页的其它独立能力按调用审计决定保留，不为这次功能重建它。
- 反馈仅覆盖管理员看见并评价过的样本；可用于回测这些样本的自动判断，不可直接推断未展示内容的召回率或全部 Source 的总体准确率。

## 数据与接口

### 新表 `content_collection_quality_labels`

- `id bigint GENERATED ALWAYS AS IDENTITY PK`；`event_id uuid NOT NULL`（逻辑引用，删除 Event 后样本仍保存）；`source_id text NULL`（逻辑引用，删除 Source 后样本仍保存）；`label POSITIVE | NEGATIVE | CLEAR`；`reason nullable`；`note nullable`；`actor_id nullable`；`created_at timestamptz`；`request_id uuid UNIQUE`；`request_hash text NOT NULL`；`sample_context jsonb NOT NULL`；`schema_version='collection-quality-label-v1'`。
- 索引 `(event_id, source_id, id DESC)`、`(source_id, created_at DESC)`。`source_id=null` 是 Event 层，不属于任何 Source 统计。
- 写入时先锁定 Event 行，使同一 Event 的操作串行；以 `(event_id, source_id)` 分组取最大 `id` 作为当前评价。`CLEAR` 是撤销当前有效标签，历史保留。
- `request_id` 由客户端一次操作生成，超时重试复用；同 ID 同 `request_hash` 返回首个结果，同 ID 不同载荷返回 409。对当前标签、原因、备注完全相同的新请求返回 `changed=false`，不追加新样本。无变化请求仅返回当前状态，不需要回测标签。
- `sample_context` 固定版本、字段和长度上限：当时 event title/URL/time 与 ID、选中 Source/Raw/Observation/Run ID、Raw 原文URL、自动相关性/事实状态/热点/精选/今日值得做判断及分数、相关规则版本、快照 asOf。无法可靠定位 Run 时 null；上下文由服务端读取，不信任客户端提交。
- 写入验证：管理员身份、Event 存在、Source 若指定须通过该 Event 的 Raw 或 Observation 证明关联、原因只用于 NEGATIVE、备注最长500字；同一事务写标签与已有 content audit。未经选择的多来源 Event 只写 Event 层。
- 当前状态读取和来源聚合只使用新表，绝不把旧 `content_candidate_decisions` 当作新样本。30日窗口按评价时间；来源样本按 `(Event, Source)` 当前非 CLEAR 标签去重。历史回测按标签记录的 `sample_context`，而非事后变化的分数。

### API

- 新 `POST /api/admin/content/discovery/events/[eventId]/quality-feedback`：`{label:'POSITIVE'|'NEGATIVE'|'CLEAR',sourceId?:string|null,reason?:string,note?:string,requestId:string}`；返回 `{changed,currentLabel,sourceId,labelId}`。旧 `/decision` POST 退役，不把旧请求映射成新标签。
- 新 `GET` 只读接口复用热点追踪读路径批量附加当前标签与可选来源；来源管理 API 提供 `sourceId/from/to/cursor/limit` 的有界负向明细和汇总。默认30日，上限90日、每页最多100条。
- 所有读写仍只对管理员开放；非法关联来源拒绝、不写行；同一请求幂等；异步 UI 使用现有 readEpoch 或等价机制避免旧响应覆盖新标签。

## 文件职责

- **新增** `lib/server/content/collection-quality-feedback.ts`：校验、追加、当前值、来源汇总；`lib/content/collection-quality-feedback-contract.ts`：前后端类型和原因枚举；新 API route；增量 Drizzle migration；针对行为的专项 validator/开发库验收。
- **修改** `lib/server/db/schema.ts`、`components/AdminIntelligenceWorkspace.tsx`、`components/AdminSourceManagementWorkspace.tsx`、`lib/server/content/intelligence-read-model.ts`、`lib/server/content/radar-snapshot.ts`、`lib/server/content/comment-insight.ts`、`components/AdminPlatformContentWorkspace.tsx`、`components/AdminEventExpansionOutputReview.tsx`、`app/api/admin/content/discovery/events/[eventId]/expansion/route.ts`、相关 API/脚本/合同。
- **删除** 不再有调用方的 `app/api/admin/content/discovery/events/[eventId]/decision/route.ts`、旧候选决策写入函数及其专属 contract/export、人工 expansion POST 及旧操作 CSS/描述。原 route 的 GET 若仍有合法证据诊断用途，保留 GET；其它路径只在确认无调用方后删除。
- `content_candidate_decisions` 表和历史 migration 作为审计保留；不继续由新代码写入。`discoveryStatus` 其它历史或内容数据引用按依赖审计处理，不为本任务直接 DROP 列。

## 实施步骤

### 1. 固定基线和退役清单

- [ ] 执行并记录 `git status`、`git log -1`；读取仓库规定的 5 份 current 文件、采集/AI 日报合同、相关 Schema/API/调用代码。保护当前其他任务未提交文件，不重置、不混合提交。
- [ ] 用 `rg` 列出四旧操作的所有 UI、API、服务、read model、validator、文档调用，重点核对内容工作台兼容页、Expansion Output Review、评论分析和 SYSTEM 调度。输出“删/改/保留”的明确清单。
- [ ] 专门审查仍以旧行为为验收目标的 `scripts/accept-collection-operations.ts`、`scripts/validate-collection-operations.ts`、`scripts/validate-content-discovery-foundation.ts`；将其断言改为新样本和自动链保护，或删除无调用的旧脚本，不保留误导后续任务的旧验收入口。
- [ ] 在 `TASKS.md` 更新本任务 Decision Brief，使产品目的、数据读写、副作用与本计划一致；采集合同先写新规则，删除旧规则正文。

### 2. 定义并保存新样本

- [ ] 先写有意义的失败验收：Event 层标签不计 Source；多来源须显式选择；非法 Source 关联拒绝；撤销/改选后只算最新有效样本；重复请求不增加历史；样本上下文记录反馈当时自动状态。
- [ ] 新增表、索引和 append-only Core；生成增量 migration，不修改已执行 migration，不改旧决策表。开发库迁移通过现有 `npm run db:target:check` 与 `npm run db:migrate -- --confirm=development` Safe Gate。
- [ ] 新增 admin-only POST/GET；用开发库证明同事务审计、请求重试幂等、并发最终当前值及历史可读。

### 3. 断开旧副作用、保护自动链

- [ ] 删除旧 decision POST 与 `recordCandidateDecision` 写入链；新标签不写 `discoveryStatus`。清除读模型、快照、兼容内容工作台中旧 `IGNORED` 隐藏/`ADOPTED` 入口/`SHORTLISTED` 操作假设；重新计算当前窗口合格 Event，而不因历史忽略继续隐藏。
- [ ] 从 `comment-insight.ts` 移除旧决策表查询和 `EVENT_ADOPTED` 触发；保留与标签无关的触发路径，验证新 POSITIVE/NEGATIVE 不会触发评论抓取。
- [ ] 从热点追踪与 Expansion Output Review 清除人工补证据按钮/调用；删除 expansion API POST，按调用结果保留或移除 GET。`topic-momentum-runtime.ts` 与 SYSTEM 内的自动刷新调用保持，验证自动证据仍落库。
- [ ] 对所有旧操作引用逐一完成代码、脚本和文案清理；旧表/历史字段仅保留为审计，不再成为产品入口。

### 4. 最小界面和来源汇总

- [ ] 现有动态卡片替换为新“采用/忽略”标签动作；负向原因可选，单来源默认归因，多来源可以选具体来源或“仅评价这条动态”；支持改选和撤销。
- [ ] 现有页面增加未评价/采用/忽略筛选，不改变栏目排序、资格和布局。来源管理现有详情显示30日样本数、负向数与原因，允许打开有界负向明细。
- [ ] Typecheck、build、确定性检查通过后提供可实际操作的本地/预发布界面；记录 `UI_IMPLEMENTED / USER_REVIEW_PENDING`。用户明确审核后再记 `USER_APPROVED`。

### 5. 回归、发布和观察

- [ ] 更新旧验证器中“忽略必须隐藏、采用进入工作台、WATCH存在、人工补证据 POST存在”等断言；保留 SYSTEM 自动发现、采集、证据刷新、来源筛选、七日历、实践四条件等回归。
- [ ] 至少运行 `npm run typecheck`、`npm run build`、`npm run content:workspace-responsibility:check`、`npm run content:collection-architecture:check`、`npm run content:discovery-collection:regression -- --quick`、`npm run content:radar-calendar:check`、新专项验收及 `git diff --check`。按 runner 内容避免无意义重复运行。
- [ ] 开发库以真实 Event、多 Source 和 Source 运行数据验收；前后比较 Source 数、Source Run、Raw、Observation、Event、Expansion Evidence、快照与唯一 timer 状态，说明自然采集波动，不用绝对数量不变代替回归判断。
- [ ] 生产发布前核对备份、增量 migration 权限和 UI 审核。Web/SYSTEM 同版部署，migration 只通过 Safe Gate；确认 PM2 实际 cwd 和唯一 timer，跑只读自动链健康核验及少量可撤销的人工标签操作。
- [ ] 发布后观察自动周期成功/失败、Raw/Observation新增、证据刷新和快照时效；新标签统计只记录样本数和问题原因，7–14天后另立任务研究规则优化。

## 验收标准

| 类别 | 必须看到的结果 |
| --- | --- |
| 旧功能退役 | 四个旧按钮的旧行为不可用；旧决策 API 和人工 expansion POST 不再执行；兼容内容页无旧入口；评论分析不再读取旧决策或由采用触发。 |
| 自动链保护 | 自动发现、Source qualification、SYSTEM采集、Raw/Observation、Event/Expansion Evidence、快照刷新仍走现有唯一链；新标签代码不进入自动任务调用图。 |
| 反馈副作用 | 新采用/忽略不改 Event状态/可见性/三个栏目/来源资格/分数，不调用AI、不创建内容、不启动评论采集。 |
| 归因 | 非关联 Source 被拒绝；多来源未选 Source 的问题只属于 Event；单来源可清楚显示归因；删除/归档 Source 后历史仍可追溯。 |
| 样本质量 | 每次有效操作持久化操作者、原因、时间、来源/Raw/Observation/Run引用、当时自动判断及版本；不可得字段明确为空；旧决策不混入新样本。 |
| 当前评价 | 相同重试不重复计数；改选/撤销保留历史；每个(Event,Source)最多一条当前有效评价；来源统计显示样本量与原因。 |
| 页面 | 热点追踪和来源管理可真实操作；筛选、详情、刷新及跨进程读回一致；得到产品负责人明确 USER_APPROVED 才声称 UI 通过。 |
| 工程 | 类型检查、构建、内容域确定性/真实库验收、文档引用与 `git diff --check` 通过；只改当前任务文件。 |

## 回退与风险

- 新表只增不删；回退保留样本和旧审计。若 Web 回退至旧代码，必须关闭旧 decision/人工 expansion 写入口，防止“旧忽略隐藏”重新生效；SYSTEM 使用匹配快照版本。
- 历史 IGNORED Event 在旧可见性过滤解除后，满足当前窗口/其它资格时可能重现；这是旧状态退出的明确行为，验收必须计入。
- 反馈是人工选择后的标注样本，有选择偏差。它能用于回测“已看到的结果是否值得保留”，不能单独证明全量召回或客观事实准确率。
- 内容工作台兼容功能及评论挖其它触发路径清理后，如果独立功能确实需要新的选题入口，应后续单独规划；不得复用新采集质量标签直接触发。
