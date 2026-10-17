# 来源管理→热点追踪审计修复 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 仓库或用户未要求多代理时，按单人逐项执行。

**Goal:** 让每条展示数据可追溯到受管来源与采集运行，让运行状态、热点依据和页面数据一致，并在现有 2C2G 服务器上稳定、低成本地长期运行。

**Architecture:** 保留 Source Management、唯一 SYSTEM Collection timer 和持久化 Radar Snapshot。先建立只读证据基线并验证 Event 匹配，再分别修复历史来源呈现、快照读取、运行状态与解释链；人工质量评价只积累回测样本，不改自动栏目资格。

**Tech Stack:** Next.js 15 App Router、React 19、TypeScript、Drizzle/PostgreSQL 14、Node 20、PM2、systemd、Deno Relay（仅受管海外获取）。

**Spec:** `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md`、`docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md`；开发规则见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`，当前事实见 `docs/CURRENT_SYSTEM_FACTS.md`。

## Global Constraints

- 产品面固定为 `/admin/sources` 与 `/admin/intelligence`；不得恢复旧人工采集、独立自动采集工作台或第二个 scheduler。
- Source Identity 与 Acquisition Route 分离；历史 `source_runtime_trend_*` 保留 Raw、Observation、Run 审计；不得批量复制 AI HOT 原发布者为新 Source。
- 采集质量正负评价不影响采集、资格、Event、热点、精选或 AI 热点练习。
- Topic Momentum 只拥有展示排序权，不提升 Fact Authority；精选和 AI 热点练习维持各自合同。
- 自动周期不调用模型。可视化页面改变后必须提供可体验版本，取得产品负责人明确批准后才能标记 `USER_APPROVED` 并进入依赖该界面的发布阶段。
- 当前规则正文只修改现有 owner；本计划是一次性执行清单，完成后退出 current tree，由 Git 历史追溯。

## Decision Brief

- **Task ID / Goal:** `COLLECTION-AUDIT-REMEDIATION-20261016`；审计并修复来源管理→热点追踪的数据血缘、性能、状态和解释缺口。
- **User Role / Product Surface:** 管理员；来源管理与热点追踪。
- **Problem / Why Now:** 生产 64 个 Source 中只有 42 个在当前管理索引，22 个历史来源仍支撑历史数据；快照约 20.2MB 且页面每 5 分钟重取；热点实践依据未完整呈现；过期主要靠页面被动提示。
- **In Scope:** 只读生产基线、抽样回测、历史来源只读治理、快照瘦身、热点解释、运行告警、状态/交互/无障碍、安全及抓取合规核对。
- **Out of Scope:** 新采集主链、批量新增来源、无证据地调整热点/精选门槛、自动依据人工评价改规则、课程和内容工作台改造。
- **Code / AI / Skill / Workflow / Human:** Code 负责确定性查询、状态、校验和告警；AI/Skill 不决定业务状态且本次无需接入；Workflow 沿用唯一 SYSTEM timer；Human 负责样本标注、争议事件判定和 UI 审核。
- **Data Read / Write:** 审计先只读 Source/Route/Run/Raw/Observation/Event/Evidence/Snapshot/Label；修复只写经验证所需的 Source 状态或快照派生数据，不删除历史。任何迁移须单独备份及回滚方案。
- **Entitlement / External Side Effect:** 保持管理员鉴权；仅已受管 Route 访问外部站点；生产告警接入现有运维渠道前不得把外部发送作为默认行为。
- **Options:** A：基于现有主链局部治理；B：重做来源与热点系统；C：直接降热点门槛。推荐 A，因为 B 引入第二套状态和迁移风险，C 无法解决血缘、误合并、负载和状态缺口。
- **Acceptance / Deterministic Validation / Human Review / Rollback:** 见各任务及最终 Gate。Web/SYSTEM 分别保留前一同版 release；数据库变更先备份，必要时按迁移回退方案恢复。UI 变更必须重新走可视化人工审核。
- **Owner Files:** 采集规则 `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md`；实现映射 `docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md`；事实 `docs/CURRENT_SYSTEM_FACTS.md`；任务状态 `TASKS.md`。

## Review Focus

1. **同新闻不同标题/语言与相似但不同新闻：** Task 1 样本回测必须同时发现漏合并和误合并，不以热点数量代替匹配质量。
2. **聚合源原发布者与逻辑 Source：** Task 2 测试历史来源和 AI HOT 的血缘显示，原发布者不得变成虚假的受管 Source。
3. **快照跨周期更新：** Task 3 验证旧响应不能覆盖新快照或管理员刚提交的评价，列表、计数和详情来自同一版本。
4. **采集成功但没有新内容/采集停止：** Task 4 验证最近 Run、内容新鲜度和快照新鲜度分别显示并触发告警。
5. **未标注样本与访问依赖材料：** Task 5 验证未评价不算负例，登录/关注/材料不完整不能宣称已获得完整内容。

---

### Task 1：建立可复核的生产基线与事件匹配回测（P1，1–2 人日）

**Files:** 读取 `lib/server/db/schema.ts`、`lib/server/content/event-seed-clustering.ts`、`lib/server/content/topic-momentum.ts`、`lib/server/content/intelligence-read-model.ts`；必要时只在 `scripts/` 增加可重复执行的只读审计命令，结果不作为新的 current facts 文件。

**Interfaces:** 输入指定北京时间窗口、只读 DB 连接；输出同一时间点的 Source→Run→Raw→Observation→Event→Evidence→Snapshot 计数和异常 ID 清单，以及经人工判定的回测样本。

- [ ] 固定生产只读快照：核对 64=42+22、历史来源关联 Raw/Observation/Event、七日 Event ID 唯一性、列表总数/分类/日期计数、热点/精选/练习数量；记录查询时间和快照 `generatedAt`。
- [ ] 从过去七日抽取至少 100 组配对样本，覆盖同新闻不同标题、中英报道、同名产品不同版本、不同金额/主题、聚合转载与独立报道；记录预期 `SAME_EVENT` / `DIFFERENT_EVENT` 及实际结果。样本不足的层如实记录，不补造数据。
- [ ] 对所有当前热点及随机精选、普通事件核验每条参与者与实践 Evidence 的原文 URL、原发布者、Source、Route、采集 Run；特别复核当前热点“4 类实践、详情链接 0”的差异。
- [ ] 运行 `npm run content:event-seed-clustering:check`、`npm run content:event-seed-recall:check`、`npm run content:topic-momentum:check`、`npm run content:ai-hotspot-practice:check`；发现真实误合并时先固定失败 fixture，再修匹配规则。没有回测证据时不改门槛。

**Gate:** 形成可复现问题 ID、反例、预期与实际；确认是否存在物理断链、误合并或仅为展示断裂。热点门槛是否需要调整在此 Gate 后单独决定。

### Task 2：历史来源血缘及管理状态治理（P1，2–4 人日）

**Files:** 修改 `lib/server/content/source-management.ts`、`app/api/admin/content/source-management/route.ts`、`components/AdminSourceManagementWorkspace.tsx`；扩充 `scripts/validate-source-management-console-018.ts` 或同职责验证脚本。若需数据库状态修正，先拟独立迁移和回滚 SQL。

**Interfaces:** 当前索引继续只返回现役可管理 Source；新增有界的历史只读查询或详情字段，明确 `CURRENT` / `HISTORICAL`、`lastRunAt`、承接关系和原发布者身份，不赋予历史项操作权限。

- [ ] 写失败验证：22 条旧来源不能被误称为当前 ACTIVE；其历史 Raw/Run/Event 仍可追溯；AI HOT 的 `originPublisher` 不能被显示为已注册 Source；历史项不进入 SYSTEM due selection。
- [ ] 逐一核对 22 条旧记录是否已由当前逻辑 Source 承接；以受管映射或只读历史视图呈现。只对证实退役的状态做审计式修正；不得删除或重建历史证据。
- [ ] 执行来源管理验证、`npm run content:source-portfolio:check`，对历史与当前各抽样 10 条做 API/页面核对。

**Gate:** 64 条 Source 各有可解释身份与生命周期；42 个当前目录项目的调度组合不因展示治理而改变。界面变化标记 `IMPLEMENTED`，待用户体验批准后才能标记 `USER_APPROVED`。

### Task 3：快照读取瘦身及一致性修复（P1，2–4 人日）

**Files:** 修改 `lib/server/content/radar-snapshot.ts`、`app/api/admin/content/intelligence/route.ts`、`components/AdminIntelligenceWorkspace.tsx`；在 `scripts/validate-radar-read-path.ts` 增加契约校验。只在确有必要时新增按 Event 读取的受权 API。

**Interfaces:** 列表返回当前快照版本 `generatedAt`、必要摘要和计数；较长正文、完整证据与诊断按 Event 按需加载；条件请求或版本判断避免未变快照整包重取。

- [ ] 先记录 1、3、10 个可见后台页的压缩后传输量、响应 p50/p95、DB 耗时、Node/浏览器峰值内存；保留当前约 20.2MB JSON 作为基线。
- [ ] 写失败契约：轻量响应和完整快照的 Event ID/计数/栏目一致；展开详情能取回原文证据；旧请求不能覆盖较新的 `generatedAt` 或刚保存的人工评价；无更新时不重复传送大 payload。
- [ ] 实现轻量投影、按需详情与条件重取；保持首次读取态、可见页 5 分钟检查和切回追赶语义。
- [ ] 运行 `npm run content:radar-read-path:check`、`npm run content:hot-tracking-ui:check`、类型检查和构建；重复性能测量。

**Gate:** 建议目标为常用列表响应体减少至少 80%、2C2G 条件下 p95 首屏低于 2 秒，且全窗口总数与列表/详情同源。目标无法达到时提交测量与瓶颈证据，不以删减事件掩盖负载。UI 变化需重新批准。

### Task 4：运行状态、抓取质量与主动告警（P1/P2，2–4 人日）

**Files:** 修改 `lib/server/content/source-management.ts`、`lib/server/content/radar-snapshot.ts`、`deploy/systemd/opc-collection.service` 或既有运维监测配置；扩充 `scripts/validate-collection-operations.ts`。抓取缺口只改对应受管 Route/Adapter，不能增加通用任意 URL 代理。

**Interfaces:** 分别输出 `lastRunStatus`、`lastSuccessAt`、`contentFreshness`、`nextDueAt`、`snapshotFreshness`；告警只针对真实超时/失败，不因来源无更新而误报停机。

- [ ] 写失败验证：历史成功但超过有效频率的来源不得继续显示 `HEALTHY`；“Run 成功但零新内容”与“Run 未执行”分开；快照 >30 分钟、非法或未来时间触发异常。
- [ ] 审计最近 14 天各 Route 的请求量、字节、成功率、304、失败退避、重复率、正文完整度与主/备路由；复核本次观察到的 6 个恢复失败，优先检查海外 Feed 和动态正文缺口。
- [ ] 在唯一 SYSTEM 链加入轻量新鲜度探针/失败通知，做一次可控超时、一次恢复演练；不创建第二个采集 scheduler。
- [ ] 运行 `npm run content:source-portfolio:check`、`npm run content:radar-read-path:check`、`npm run content:topic-momentum:check`，记录 2C2G 周期用时和资源峰值。

**Gate:** 断采、数据过期和页面快照过期在一个采集周期内可被区分；快照超过 30 分钟后运维能获主动告警。告警目标与通知策略须在接入外部渠道前确认。

### Task 5：热点解释、状态交互、可访问性与安全/内容合规（P2，2–4 人日，加样本观察期）

**Files:** 修改 `lib/server/content/intelligence-read-model.ts`、`lib/server/content/topic-momentum.ts`（仅证据确认的错误）、`components/AdminIntelligenceWorkspace.tsx`、`components/AdminSourceManagementWorkspace.tsx`、`app/api/admin/content/source-management/route.ts`；扩充各自现有 validator。合同变更仅写 `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md`。

**Interfaces:** 每个热点提供可核对的参与者、实践证据类型及可用原文链接；来源详情刷新与索引使用一致版本；管理员 API 返回稳定安全错误码。

- [ ] 写失败验证：热点所用实践证据与展开详情同源；无 URL 的证据不得呈现为可点击原文；精选/热点/AI 练习保留各自解释与状态，不互相同步资格。
- [ ] 实测首次加载、停留、切回、筛选、点开来源、评价和撤销；修复索引更新而详情陈旧的问题，避免详情全量轮询。
- [ ] 为来源搜索、筛选和新增条件输入补可访问名称；完成键盘焦点、屏幕阅读器与移动视口检查。只修缺陷，不重排已批准布局。
- [ ] 审计管理员鉴权、错误脱敏、URL/重定向校验、密钥/日志；按来源登记抓取许可、署名、全文保存及保留条件。对权利或可访问性不明的材料标记待核实，不宣称合规或完整。
- [ ] 开始 7–14 天分层人工正负样本观察，覆盖不同来源、语言和内容类型；未评价不得算负例，样本占比不得称为全量准确率。运行 `npm run content:quality-feedback:check` 与相关热点/来源验证。

**Gate:** 页面关键操作可仅用键盘完成；热点依据可从 Event 追到原文；错误响应不含内部异常文本；人工评价可导出可回测样本。UI 必须实际体验并获得明确批准。

## 最终集成、发布与回退 Gate

- [ ] 按顺序完成 Task 1 的证据门槛，再分别发布可独立回退的 Task 2–5；不将所有改动捆成一次不可定位的大发布。
- [ ] 每批运行 `npm run typecheck`、`npm run build`、受影响的 `content:*:check`；全链完成后做七日窗口读模型、来源管理、热点/精选/AI 练习、质量评价的端到端只读核对，并执行 `git diff --check`。
- [ ] 比较发布前后 Source/Run/Raw/Observation/Event/Evidence 数量及独立参与者分布；任何异常先暂停发布或回退，而不是调低热点门槛。
- [ ] UI 批次本机或预发布真实体验，记录 `IMPLEMENTED` 与 `USER_APPROVED`；未获明确批准不生产发布该 UI。
- [ ] 先备份数据库并保留同版 Web/SYSTEM 上一 release；按 Web→SYSTEM 的版本兼容顺序部署、观察完整自动周期和快照刷新；失败时分别回退 Web/SYSTEM，数据迁移按预定回滚 SQL 或备份恢复。
- [ ] 更新唯一事实 owner `docs/CURRENT_SYSTEM_FACTS.md`、任务状态 `TASKS.md` 与实现映射；删除本一次性计划的 current-tree 副本，历史由 Git 保留。

**工期口径：** 各 Task 的人日是传统人工开发与审计的保守工作量，不等于 AI 协作的日历天数。在无重大误合并、数据库迁移或上游抓取阻塞的前提下，AI 辅助的 P1 审计与修复预计 2–4 个工作日；完成全部 P1/P2 代码、回归和生产验证预计 4–7 个工作日。UI 体验审批和第三方抓取/授权核查可能延长日历时间。人工质量样本仍须真实运行 7–14 天；它可以与修复并行，不能靠加速编码压缩，也不阻塞已验证的 P1 修复上线。若 Task 1 证实系统性误合并或需数据迁移，应基于实际样本与迁移方案重新估算，不沿用上述区间。
