# COLLECTION_ARCHITECTURE_CONTRACT.md

## 实践主题与汇总内容边界

- 已确认作者的公开材料可走固定Deno Provider：Pixaroma目录仅JSON解析、排除comingSoon；每次最多30集元数据、3个≤128KB工作流包，共享公开步骤单独标注。腾讯云只在内存校验ZIP与ComfyUI节点JSON，不解压落盘、不执行工作流。未下载/未运行/未取得字幕必须分开记录，不能声称全文或实践成功。
- 作者站与其视频使用同一Creator Source；内容使用规范视频URL复用Raw/Observation，短链、列表及分享参数不能制造副本。已发现作者参考关联creatorSourceId，不再重复作者核验。无发布日期的历史材料只入Raw/Observation，不以采集时间生成当前Event；可供后续定向研究，不自动授予热点/精选/今日值得做资格。

- 热点主体必须是单一事件。明确的早报、新闻汇总或至少两条不同主体独立发布拼接内容不进入热点（同主体补充、指代续句和搭建汇总工具教程不因此排除），其Raw也不作为独立热度参与者；保留全部动态与历史，不归档合法Source。汇总中的新闻必须取得独立原文再按既有条件评估。
- 今日值得做主体必须是具体操作主题：教程/实操意图、明确操作信息和任务目标同时存在；模型发布即使挂有多个教程也不因此成为实践主体。从formal actionable原文证据按明确工具身份＋操作目标归并，标题/入口取自真实教程；保留parentEventIds，不改Event事实。来源、证据和类型数量按主题重新计算，不能继承父新闻计数。无法明确工具或目标时保持候选，不猜测归并。保留两条可执行证据、两个独立来源、两类实践门槛；不以AI分析AVAILABLE状态作为入栏前置。精选事实门槛与评分权重保持。
- 实践主题的定向搜索复用Event Expansion，当前仅BILIBILI_SEARCH和YOUTUBE_SEARCH（YouTube复用Relay/配额）；仅由来源管理中ACTIVE/enabled/currentPortfolio、AUTO_READY或CONDITIONAL、有明确且服务器可执行SEARCH_DISCOVERY Route、collectionConfig.practiceExpansionEnabled=true且Provider健康的Source承载。可在原逻辑Source附加搜索Route并用practiceExpansionProvider指定搜索Provider，不覆盖原采集Provider或复制Source。未知、停用或无路由失败关闭，不调用ensureExpansionSource创建隐藏来源。
- 触发需实践主体和至少两个独立参与者；同Event搜索至少间隔六小时（失败也计入），每SYSTEM周期至多一个主题、一个Provider、两次查询，每次最多五条，七日窗口。查询复用工具/版本锚点和教程/使用案例意图，不进行持续全网关键词扫描。
- 搜索结果沿用污染、相关性、去重与Evidence校验。新作者内容是参考候选，不自动注册长期Source、不自动授予Fact或实践资格；正文不足不声称完整实操。搜索失败不得阻断已有Raw的证据刷新；缺少可用搜索Source返回NO_READY_MANAGED_SEARCH_SOURCE。
- 不自动调用AI。常驻重新读取按钮退出，页面初始化和操作后自动读；仅快照请求失败提供重试。页面仍需人工体验确认。

Status: CURRENT / APPROVED PRODUCT BASELINE
Task: COLLECTION-ARCHITECTURE-REALIGNMENT-001 + SOURCE-QUALIFICATION-GOVERNANCE-011
Rule: 本文件只描述当前架构。历史 Phase、已删除 Owner 与旧实验方案由 Git 追溯，不在 current contract 中保留。

## 1. Product Boundary

受管搜索登记由来源管理的`managed-practice-search.ts`提供：必须先获得服务器真实样本，事务写入Source与Audit，仅CONDITIONAL；`sourceRegistry.executionScope=EVENT_EXPANSION`明确限定为定向补证，不进入持续Source采集列表。既有归档来源不恢复。作者身份随Raw保存，状态PENDING_SOURCE_REVIEW，不自动注册长期作者；视频简介只能视为DESCRIPTION_ONLY。语言按B站中文、YouTube英文查询规划。

当前后台内容链只保留三个产品 Owner：

- 热点追踪（Hot Tracking）：正式生产闭环固定为 Source Management → SYSTEM Collection → Event → Discovery Expansion（仅消费 current Source 已采 Raw）→ Practical Evidence → Worth Practicing / Topic Momentum / Curation → Radar Snapshot；页面保持既有排版和 CSS。
- 来源管理（Source Management）：唯一拥有 Source / Creator / Platform / Qualification / Acquisition Route。
- 内容工作台：只消费 Adopt 后的 Event / Evidence，不修补上游采集缺口。

不再存在独立“人工采集”产品 Owner，也不再存在独立 Automatic Collection workbench。

兼容入口只允许：
- /admin/manual-collection → redirect /admin/sources
- /api/admin/manual-collection → 410 MANUAL_COLLECTION_PRODUCT_RETIRED

兼容入口不得创建、运行、审核或拥有任何采集任务。

## 2. Current Owner Map

每个事实只允许一个 Owner。

| Domain | Current owner |
| --- | --- |
| Source identity / operator-added Source | source-management.ts + source-onboarding.ts |
| Source target classification | source-target.ts |
| Acquisition route plan / runtime adapters | source-acquisition-plan.ts + source-acquisition-runtime-adapters.ts |
| Runtime qualification | source-qualification.ts + source-qualification-runtime.ts |
| Adapter qualification evidence | adapter-qualification.ts |
| Formal collection execution | collection-runner.ts |
| Default SYSTEM portfolio | source-portfolio-runtime.ts + radar-source-portfolio.ts |
| Fixed tick / cadence execution | run-server-native-automatic-cycle.ts + source-runtime-governance-execution.ts |
| Cheap + full relevance | discovery-filter.ts |
| Pollution / syndication / deterministic quality | pollution-syndication-gate.ts |
| Raw identity / layered dedup | discovery.ts + raw-relevance-dedup.ts |
| Event seed / clustering | event-seed-clustering.ts + event-clustering.ts |
| Event policy / relevance | event-policy.ts + event-relevance-gate.ts |
| Event expansion | collection-expansion.ts |
| Creator coverage | creator-coverage-qualification.ts |
| Topic Momentum | topic-momentum.ts + topic-momentum-runtime.ts |
| Chinese presentation | presentation-enrichment.ts + review-localization.ts |
| Runtime utility | source-runtime-utility.ts |
| Governance | source-runtime-governance.ts |
| Runtime operations read model | source-runtime-operations.ts |
| Radar read model | intelligence-read-model.ts + radar-snapshot.ts |
| Comment demand | comment-insight.ts |

任何新功能必须扩展这些 Owner；禁止新建同义并行 Owner。

## 3. Unified Collection — SYSTEM Runtime

正式执行链固定为：

Source Management / Source Onboarding
→ Source Identity
→ Acquisition Routing
→ Runtime Qualification
→ SYSTEM Collection
→ Cheap Relevance
→ Full Relevance / Entity Resolution
→ Raw / Observation
→ Raw Identity Dedup
→ Event Seed / Event Semantic Cluster
→ Evidence
→ Event Expansion
→ Creator Coverage / Topic Momentum
→ Presentation Enrichment
→ Today Intelligence

SYSTEM Collection Runtime 是唯一采集执行基准。
Current Collection Core 只允许 `origin=SYSTEM`。历史 MANUAL provenance/schema 可为审计兼容保留，但不得再进入 `runSourceCollection` 执行分支；未发现可维护 Acquisition Route 的新来源必须保持 UNRESOLVED，不得回退成 Manual runtime。

Operator-added Source 必须完成：
Discover → Check → Preview → Register → Qualify → SYSTEM Collection

不得从内容工作台、热点追踪或旧 Manual 路径直接创建第二条采集链。

## 4. Source Identity vs Acquisition Route

Source Identity 与 Acquisition Route 永久分离。

一个 Source 可以有 Primary Route、Fallback Route(s)、Route Kind、Route Cost、Route Health、Last Success、Fallback Reason。

Current Acquisition 优先级：
1. 原生 RSS / Atom
2. Sitemap
3. 官方 / 公开 API、Public JSON、稳定 Generated Feed / Feed Bridge
4. bounded Reader / parser / 已验收 server-native adapter

交互登录、Browser Session、人工续期 Cookie/OAuth Session 不属于 current Acquisition Route。

声明requiresLogin / requiresHuman / requiresFollow / requiresBrowserSession的Route失败关闭；显式Route和旧kind声明均不能绕过。关注、私信或人工领取操作材料的条目不进入可执行实践证据。作者正式注册须分别具备服务器持续Route、足够历史样本、可追溯作者归属与完整操作材料；视频copyright自报原创仅SELF_DECLARED，不能证明原创。搜索描述不等于正文，公开字幕未验证完整性时只能保存PARTIAL，不自动全文翻译。当前第三方YouTube owner授权字幕不属于可选自动路径。
Primary 失败才允许进入已声明且同样 server-runnable 的 Fallback；Primary 返回合法空结果不自动升级高成本 Route。

## 5. Qualification

Qualification 回答“能不能稳定采”，不回答“值不值得长期维护”。

四态：AUTO_READY / CONDITIONAL / MANUAL_ONLY / DISABLED。

AUTO_READY 必须有真实运行证据。Evidence Sufficiency 固定为：
- INSUFFICIENT：最近生产证据不足
- EARLY：至少 2 次 SYSTEM production Run 且至少 1 次成功
- MATURE：最近最多 5 次 SYSTEM production Run 中已有 5 次 Run 且至少 4 次成功

只有 MATURE 才能进入 AUTO_READY；AUTO_READY 同时要求稳定身份、时间语义、SYSTEM provenance、dedupe、failure isolation、capability output、rerunnable acceptance 与 continuous runtime。

Qualification 必须使用 `recent N runs first`。业务成熟度只看最近最多 5 条 SYSTEM production Run；读取时每 Source 最多保留 12 条候选，时间窗口仅作为 query safety fallback（current=180d）防止无限历史扫描。不存在 30 天业务/查询硬截止；低频官方 Source 的最近 Run 可跨 30 天。

每次正式 SYSTEM Collection Run 必须写 `collectionRuntimeVersion` 与 `qualificationCheckpoint`。当前 Runtime Contract 为 `system-collection-runtime-v2`。

Qualification checkpoint 绑定 Source Identity + Acquisition Route(s) + Runtime Contract/Adapter Version + Source Schema。route、runtime contract 或 schema 变化后旧证据不得沿用；checkpoint 禁止读取 qualification result 自身 version，避免认证结果使自身 checkpoint 自失效。

声明 capability 不等于已通过 Qualification；只有 current runtime/checkpoint 的 bounded live evidence 才能提供自动运行资格。

Runtime downgrade / recovery：
- 3 次连续失败 → CONDITIONAL
- 6 次连续失败 → DISABLED
- current baseline 重新达到 AUTO_READY 且同 checkpoint 已无连续失败时，可从 CONDITIONAL 自动恢复
- DISABLED 在同 checkpoint 下保持 recertification gate
- Acquisition Route / Runtime Contract / Schema 改变导致 checkpoint 变化后，旧 Route 的 degrade 状态不得跨 checkpoint 继承

Source Asset Cleanup：
- Source Identity dedup 优先 exact canonical / providerRef / 明确 Creator identity，不以品牌名称相同强行合并不同 Feed
- 退役 Source 只 ARCHIVE + enabled=false；Raw / Observation / Event / Evidence / Run 历史不得删除
- 有高置信 current owner 时可记录 mergedIntoSourceId；没有明确 owner 时只归档，不伪造 alias

Preview 必须 bounded，并拒绝未声明 host、path escape、protocol escape、private/internal target 越界。

Qualification-only run 不写正式 Event / Cluster。

## 6. Collection Gates

昂贵解析/AI 之前必须先过：

Cheap Relevance → Pollution Gate + Deterministic Quality Gate → Entity / Full Relevance

Cheap Relevance 只做高置信 deterministic 排除：stale、非内容页、明显广告/招聘/股票噪声、明确 keyword reject。模糊项保留给 Full Relevance。

Collector 默认只返回引用、文本、metrics、metadata；不拥有长期下载保存媒体的权限。

## 7. Raw / Observation and Dedup

Raw 保存 original title / excerpt / URL / author / publishedAt / platform / provenance。
Presentation / localization 不得覆盖 Raw 原文。
Presentation / 中文审核翻译不得阻塞 SYSTEM Collection；Collection Runner 必须先完成 Raw / Observation / Event / Evidence 事实链。展示翻译缺失时允许 Presentation Enrichment 回退原文，不允许为了中文展示延迟或卡住采集 Run。
Event Relevance 在 SYSTEM Collection 关键路径中只允许 deterministic classification / fail-safe；不确定 Event 记录 `AI_RELEVANCE_DEFERRED_FROM_COLLECTION` 并保留事实，不在单个 Source Run 内串行等待 AI。需要 AI 深判断时由管理员显式启动 Event 分析，扩展只补证据，未验证前不得进入正式精选。

Dedup 分层：
1. canonical URL / content hash
2. same-source externalId / normalized title
3. entity + action + version + time
4. semantic Event cluster

相同 canonical URL 可共享 Raw，但 Observation 必须保留“被哪些 Source 发现”。
跨 Source 同标题但 URL 不同不得仅因标题相同合并 Raw。

## 8. Evidence / Fact / Signal Boundary

Fact Evidence 与 Signal 永久分离。

GitHub / Trend / Platform Metrics：
- Official Release / Changelog → Fact / Primary Evidence
- README / examples → Context / Practical Evidence
- stars / forks / issues / engagement → Adoption Signal
- Trending / rank → Discovery Signal

Trending、播放、点赞、评论、收藏、粉丝均不得直接提升 Fact Authority。

Event Evidence 必须先 relevance，再 independence。
同 canonical publisher、同母机构、共享作者同故事、镜像或声明 syndicatedFrom 的来源共享独立 Origin。

syndication 不贡献 Evidence Count。

## 9. Event Expansion and Budget

Event Expansion 只扩展已存在 Event 的 Evidence，不创建第二套发现系统。
窗口 bounded，默认最大 168h。

预算按 query / provider / result limit 明确限制，并使用边际效用停止条件：
- Coverage 已满足
- 最近窗口边际效用过低
- Budget exhausted

Expansion 同样复用 Pollution Gate + Deterministic Quality Gate、relevance、independence。

## 10. Topic Momentum current rule

Current Hot 不使用旧 Rising Score；Topic Momentum 仅拥有展示排序权，不能改变 Fact Authority。榜单统计过去 168h，同一 Event 的独立账号/机构按 origin/source 去重，同机构多渠道合并，重复采集只算一次；每个参与者按 72h half-life 衰减。它衡量讨论活跃度，不是报道质量。

Event Momentum current rule：
- 0–24h：RISING，允许多独立 Source / 多 Creator / Practical Evidence 形成早期升温信号
- 24–168h：SUSTAINED，要求至少 2 个独立 Source、2 个活跃日，并出现 Creator / 跨平台 / Practical Evidence 之一
- 同一独立来源重复文章只贡献一次 Source coverage
- Practical Evidence：体验 / 教程 / 用例 / 工作影响
- Engagement 只作旁证，不直接授予事实权力

Topic Momentum authority 固定为 PRESENTATION_ONLY。
Topic Momentum 不提升 Verification、Fact Authority、Official News eligibility。

Rising / Formal Rising 已物理退出 current runtime、API、UI 与 Read Model。

## 11. Creator / Platform / Server-native Boundary

Creator 是 Source Identity 的一种，不是独立产品。

新增 Source 一律 capability-first：
- 先识别 URL / Creator target
- 只使用无需用户交互登录、可由服务器持续运行的 Route 做 bounded live Check / Probe
- 必须得到真实样本 Preview，确认 Route 当前可采
- 再检查 identity/provider duplicate
- 只有 Check PASS + sampleCount >= 1 才允许 Register
- “平台理论支持”“浏览器能打开”“账号已经登录”“以后可以开发 Adapter”都不能作为入库依据
- 没有 server-runnable public Route 的目标必须 fail-closed，不先注册占位

国内热点发现优先复用 AI HOT / DailyHot / current Trend Discovery provider；微博 / 抖音 / 知乎不得再创建第二套 Trend Source。X / 小红书 Login / Browser / Connection 不属于 current acquisition。

Source Universe 与 AUTO 永久分离，来源按能力分两层：
- Direct Evidence Source：官方 / 专业媒体 / 研究 / 合格 Creator 的直接 RSS、Atom、Sitemap、公开 API；必须 live probe 成功后才可进入 current baseline，事实权限按 Source Role 决定。
- Discovery Aggregator：DailyHotApi、AI HOT、Search、Trend Provider、综合门户热榜；只负责发现候选与 Signal，不得单独确认事实，不因覆盖平台多而拆成大量 Source Identity。

搬运站、镜像站、低质量聚合、无独立 Origin 的转载不得因为“可采”而进入事实 Source；可采只是必要条件，不是充分条件。

## 12. Source Runtime Utility and Governance

Runtime Qualification：能不能稳定采？
Runtime Utility：持续采是否产生有效信息？
Governance：在不破坏覆盖的前提下，当前应该以什么 cadence 运行？

Utility 只输出运行维护建议，不写 Source enabled/status。

Governance 四态：
KEEP_CADENCE / REDUCE_CADENCE / PAUSE_AUTO_REVIEW / DISABLE_REVIEW_REQUIRED

PAUSE / DISABLE 必须 Human Review。
Coverage-critical Source 禁止自动停用。

所有读取必须 bounded：时间窗口、Run 数量、Observation 数量、Event 数量。
禁止随着历史增长做无界 Node 全表读取。

## 13. Cadence Execution

唯一 scheduler owner 是现有 server-native automatic cycle。

fixed global tick
→ current SYSTEM source discovery（baseline + Source Management）
→ Governance due selection
→ only due source IDs
→ runSystemSourcePortfolio
→ qualification reconcile
→ bounded Source-managed Discovery Expansion（current SYSTEM Raw only）
→ Practical Evidence（只关联证据，AI 分析由管理员显式触发）
→ bounded Topic Momentum due follow-up
→ Radar snapshot refresh

无 due Source 时必须 NO_SOURCE_DUE，不得回退为 25 Source 全量运行。

自动周期使用私有数据库连接的 session advisory lock 排除同库并发周期；争锁返回 SKIPPED，不伪报已执行。onclose 与 5s heartbeat（10s 超时，校验 backend PID / pg_locks，不重复抢锁）检测到失锁即非零终止 CLI；正常释放须验证 unlock=true。网络分区中已提交的 SQL 仍可能完成，不宣称严格 fencing / exactly-once。生产入口必须同时通过 Database Environment / database name 校验与 `--confirm=SERVER-NATIVE-COLLECTION-PRODUCTION`。任一来源或扩展失败时周期报告 PARTIAL 并非零退出，其余阶段继续尝试。

自动周期、Source Run、Discovery Expansion、Topic Momentum follow-up 均不调用模型。AI 分析/翻译/改写只保留人工授权入口，不作为 Raw、Observation、Evidence 持久化前提。

默认 base cadence 15min；KEEP=1x，REDUCE=2x。
PAUSE / DISABLE 在 Human Gate 确认前不自动改变 enabled/status。
禁止新增第二 cron / systemd / app scheduler。
部署预检只读检查运行所需表/列、角色表权限与管理员身份，不代替真实采集、索引/类型/RLS 审计或 Safe Migration Gate；缺失结构不得由 App Role 自动补建。队列登记与到期执行须遵守相同已确认资格，明确不相关/不可执行的 Event 不消耗扩展配额。
Topic Momentum 不拥有独立生产 scheduler；其 Day 1–7 `nextFollowUpAt` 由同一 fixed tick 检查，每轮最多处理 bounded due Events。独立 Topic Momentum systemd service/timer 已退出 current tree。

## 14. Source Runtime Operations

来源运行健康只由 source-runtime-operations.ts 聚合展示：latest run、success/failure、acquisition route、runtime support、qualification、bounded utility metrics。

它是 read model，不是第二执行器。
不存在 /admin/automatic-collection 产品页面或对应 current API。

## 15. Presentation

Presentation Enrichment 只能产生 displayTitleZh / displaySummaryZh / whyItMattersZh / translation status / fallback。

原文与原链接必须保留。
URL、version、percentage、date 为 protected tokens；被翻译改写时该条 fail-soft 回原文。

Presentation authority = PRESENTATION_ONLY。

## 16. Hot Tracking / 热点追踪

热点追踪只消费 Source Management → SYSTEM Collection → Raw / Observation → Dedup → Event / Evidence 的正式主线。Discovery Expansion证据刷新owner为 `refreshSourceManagedEventExpansion`：不创建隐藏 Source，在168h窗口内从已采Raw补Practical Evidence；成功Event 6h cooldown、失败Event 1h retry。SYSTEM的实践定向搜索前置条件与预算见本合同“实践主题与汇总内容边界”，其结果仍写同一Raw/Evidence主链；不维护第二套来源池。有实践证据时仅标记HUMAN_TRIGGER_REQUIRED，AI分析由管理员显式启动。热点追踪不拥有第二套采集入口。

Current views：
- 今日值得做：复用 Worth Practicing，但必须存在真实可执行实践证据；Practical Evidence 的标题/摘要需包含明确教程、步骤、配置、操作、实测、工作流、使用案例或等价操作语义，并至少来自 2 个独立实践来源。`suggestedContentTypes` 仅作 AI 分析建议，不是产品入场门槛。纯新闻、泛分析、仅 whyItMatters 不进入；中文证据优先，英文只做中文化交付。
- 精选：通过事实硬门禁后按可解释编辑分排序。
- 全部动态：通过基础 AI relevance / Event 聚类后的唯一主 Event。默认一次完整读取北京时间今天及前六个自然日，区间为首日00:00至快照asOf（半开区间）；以eventAt、缺失时firstSeenAt确定日期，排除未来、归档、忽略及不合格事件。删除120条首批规则。服务器窗口中的今天默认展开，其余日期默认折叠，默认七日空日保留。加载更多每次取得此前最近一个有合格内容的日期全天，跳过历史空日；无更早可见事件时显示“已经到底”。不得以已排除的数据库旧记录判断hasMore，不追加历史空日期行。日期游标固定asOf、按事件时间及ID稳定排序；历史不改变七日总量。
- 统计窗口：北京时间今日、近七个自然日、最近100次SYSTEM正式运行分别标注起止时间。成功Run记录返回条次、过滤保留、后置排除、入库批量排除、Raw新增/重复、Event新建/归并及无日期历史材料；排除原因复用Run元数据。失败/进行中可能部分写入，不混入成功漏斗；旧Run未记录的阶段显示未知，不反推。七日可见Event是按事件时间计量的当前存量，与按运行时间计量的采集漏斗不是同一队列，不计算伪转化率。
- 一致性：完整七日窗口在REPEATABLE READ只读事务中生成；items、分类总量及Event索引同源，唯一ID数=总量=分类合计=逐日合计。逐日历史请求独立读事务，asOf只固定日期上界和入库截止，不提供历史状态版本；运营忽略/归档即时生效，跨请求发生状态变化以重新读取的当前快照为准，不宣称时间旅行快照。
- 当前热点：按 Event 而不是文章排名；同一独立账号/机构只贡献一次参与，AI HOT / DailyHot 等 Aggregator 只贡献 Discovery/Hot Signal，不能因聚合转载与直连原站重复计数。公开报道信源与热度参与者分开：公开信源只列可阅读报道；参与者可包含仅计入热度的账号/机构。同机构多渠道可合并，所以参与者数不保证大于公开信源数。
- Event合并只收拢展示，不丢掉报道：同Event/Cluster的全部SYSTEM原文共同作为热度输入，多独立来源报道增加参与广度；同原发布者的重复轮询/聚合转载不反复增加参与者。内容测试清理只针对可证明的夹具，不以“通过验收采集”判定真实原文是假数据，不删除真实历史来制造干净统计。

“精选”采用三层规则：
1. Hard Gate：AI relevance、≤72h freshness、CONFIRMED_OFFICIAL / CONFIRMED_MEDIA、change magnitude 明确为 MAJOR / NORMAL。未知变化等级、MINOR、未验证内容不得通过。
2. Editorial Score：freshness 23% / evidence quality 28% / importance 32% / practical evidence 7% / independent origins 7% / fact corroboration 3%。Practical Evidence 是加分项，不再是所有 NORMAL Event 的强制入场条件，避免刚发布的官方模型/API/产品更新因尚无教程而被漏掉。
3. Tier：FEATURED score≥66；TOP_PICK score≥78，且需 MAJOR 或 Practical Evidence≥2，同时满足多独立 Origin / 多 Fact Source，或官方 + Practical Evidence。单一官方重大更新可以 FEATURED，但不会只因官方身份自动 TOP_PICK。
4. Featured Re-ranking 仍仅改变已精选集合的展示顺序；soft diversity cap 不改变 Fact Verification、Source Qualification、score 或 eligibility。

热点采用 Event Momentum，不使用文章数量直接累加：
- 热点窗口固定 0–168h；参与者贡献使用 72h half-life。早期 RISING 与持续 SUSTAINED 仍作为状态，但 score 由独立参与者的衰减活动量为主。
- 趋势线只允许比较持续覆盖的同一组信源 cohort；没有可比历史时不得绘制趋势线。
- Momentum score 只由独立来源、Creator、活跃日、跨平台/实践多样性和真实互动组成；authority=PRESENTATION_ONLY，不能提升 Fact Verification。
- 平台 rank、点赞、评论、播放、粉丝、velocity 只能作为注意力旁证，不能绕过 Trust Gate。

Radar snapshot 必须从同一 canonical Event timeline 派生 items / currentHot / worthPracticing，并叠加 source runtime operations；不得为「今日值得做」再执行第二套全量 read-model 查询。内容工作台只消费 Adopt 后内容，不承担 Source / Collection 修复。

## 17. Trigger-based Comment Collection

评论挖需是 Event 后续能力，不是常驻全网评论爬取。

Trigger-based Comment Collection 仅在明确 Event / Creator / Raw 触发后运行，预算 bounded。

输出 Demand Cluster：QUESTION / PAIN_POINT / REQUEST / OPINION。

Demand Cluster 不贡献 Fact Evidence、Verification 或 Hotspot Authority。

## 18. Human Gates

必须人工确认：
- Source 首次进入长期 AUTO
- PAUSE / DISABLE 治理建议
- Coverage-critical Source 退出
- 高维护 Browser / Session 路线成为长期依赖
- 内容发布

不得通过自动阈值直接删除 Coverage-critical Source。

## 19. Validation Contract

任何发现/采集重构至少通过：
- script entrypoint governance
- Source Management / Onboarding
- Acquisition Routing
- Adapter / Runtime Qualification
- Collection Runner
- Collection Quality Gates
- Cheap Relevance
- Raw Dedup
- Event Cluster / Policy
- Creator Coverage / Topic Momentum
- Presentation
- Runtime Utility / Governance / Cadence
- Intelligence Read Model / Radar
- Manual retirement guard
- Typecheck
- Build

Development DB 可用时，再执行真实 SYSTEM cadence smoke。

Production acceptance 必须 fail-closed：current Source 的真实 SYSTEM Run 只要出现失败，整轮 Platform → Source → Route production acceptance 不得报告 PASS。Source 自身可以真实记录 FAILED Run，但 UI/验收不得用“已尝试/已分类”替代“本轮生产成功”。

## 20. Current Retirement Rules

以下能力已经退出 current code，禁止恢复：
- 独立 Manual Collection Core
- 独立 Automatic Collection workbench
- Media Discovery 独立 runtime
- Research Discovery 独立 runtime
- Real Trend 独立 runtime
- Manual Event Candidate 独立 owner
- Rising Score / Rising Shadow runtime
- 按 MEDIA / RESEARCH / TREND 分裂的 parallel automatic cycle
- 旧 Phase 022B / 022C runtime entrypoints

历史方案需要查看 Git，不在 current files 维持兼容副本。

## 21. Collection quality, backfill and presentation acceptance

- Discovered / fetchable / retained / factual / hot / practical are separate judgments. Keyword recall does not certify topic coverage; a successful response does not prove useful body content or originality.
- Each normalized item records title, published time, author, original-link presence and body character/level in `metadata.collectionQuality`. Prefer Feed content over its short summary when available, capped by the existing parser limit. Long excerpt is not verified full text; missing body cannot authorize a full translation. Unknown originality remains UNKNOWN rather than being inferred from publisher type.
- Source retention uses recent SYSTEM run success, received/new/duplicate counts, topic usefulness and update cadence as separate review inputs. Low yield or one network failure alone cannot trigger archive. Legacy Manual/Login/Browser acquisition may be archived with reason and preserved Raw/Event/Evidence history; unavailable but legitimate sources remain explicit health failures. Exact source identity and alternate routes must not be multiplied into separate sources.
- Backfill is an explicit operation of the same SYSTEM collector and lock, not another scheduler. The requested interval is <=168h, ends no later than now, and is checked against original item time before ranking-signal exemptions. Missing/invalid time and out-of-window items are excluded and counted. Current Feed/API result caps cannot prove complete seven-day history; report AVAILABLE_WINDOW_ONLY_NO_ARCHIVE_GUARANTEE and per-source failures/gaps. Do not synthesize old articles, timestamps, measurements or daily coverage.
- Three output dimensions may overlap for one Event; none implies another:
  - Hotspot: existing Event Momentum RISING0–24h/SUSTAINED24–168h, independent participation/active days/cross-platform/practice/engagement and current thresholds; ranking never grants Fact Authority.
  - Curated dynamics: existing Bole Gate requires AI relevance, <=72h, confirmed official/media and MAJOR/NORMAL; FEATURED score>=66, TOP_PICK>=78 plus its independent evidence/value gate. A single-source official update may be curated without being hot or practical.
  - Worth Practicing: 具体工具与任务主题，>=2逐篇合格实践证据、>=2独立来源、>=2实践类型；不以AI AVAILABLE状态为前置。practice-materials.ts要求与原文URL绑定的匿名服务器获取回执及完整正文/字幕、编号步骤、输入与输出，或逐篇验证工作流与operationSteps；共享安装说明不能代替逐篇操作材料。正文声明依赖工作流/模板/素材下载时，所需附件必须具有服务器公开下载回执与SHA256，否则REQUIRED_ARTIFACTS_UNVERIFIED。短摘要、未知/截断正文、登录关注材料失败关闭。intelligence-read-model返回practiceAssessment逐证据缺口和聚合数量阻断，管理员practice-diagnostics按工具+任务主题返回独立数量原因；不为历史Raw补造认证。
- User-facing topics (REA/ComfyUI/Skills/MCP/ad creation/writing/images/animation/editing/assistants/work management) describe discovery coverage, not the three publication dimensions. Add sources only after bounded live capability check and preview. Generic news/trends cannot stand in for persistent original practical sources.
- Production acceptance requires its own schema, runtime grants, source inventory, route probes, backfill and three-output checks. Development success is not production acceptance, and healthy results from an earlier cycle do not erase a current failure.

## 22. Operations consistency

- Event决策、Event运营状态与审计在同一事务提交；同一Event决策串行锁定，返回已提交discoveryStatus。忽略保留历史Raw/Evidence，仅退出热点追踪消费。
- Radar缓存基础榜单，每次读取用当前Event状态覆盖所有榜单；不缓存运营覆盖结果。完整窗口轻量索引负责计数，不能用首屏计数冒充全窗口。分页继续读取当前Event状态。
- Snapshot generatedAt超过30分钟为STALE，非法/未来时间为异常；读取旧数据不自动全量重建。SYSTEM仍是周期刷新唯一owner；首次缺失或Schema不兼容允许一次初始化。客户端慢请求不能覆盖之后已提交的运营动作。
- Source启停、operator归档/恢复、规则保存和资格阶段更新与其审计同事务，包含actor、reason、before/after。归档恢复保持禁用，退役路径禁止恢复；不删除历史。
- QUALIFIED只代表真实AUTO_READY；成功探测仅PROBED，有正式Run但未合格为OBSERVING；qualificationOnly不计成熟度。来源禁用/归档时有效资格必须显示DISABLED，不复用过时AUTO_READY标签。

### 逐篇公开材料获取边界

- SYSTEM列表过滤后每源每轮最多补2篇固定白名单详情；合格材料复用7日，不足材料/失败至少间隔1小时。详情失败保留列表结果；重复Raw只升级与原始URL精确绑定的材料字段，不覆盖事实和人工决策。
- Comfy官方教程经Deno的PUBLIC_PRACTICE_DOCUMENT获取公开Markdown；B站只尝试匿名公开字幕API，无字幕明确不可用，无登录/Cookie回退。Pixaroma只从该集已下载ZIP读取人类README/HOW-TO-USE，不把模型提示词文件或共享安装说明冒充逐篇步骤。
- 凭证包含原文URL、实际获取URL、匿名/服务器获取状态、HTTP状态、时间、完整性、正文/字幕SHA256。字幕保存全部返回cue并验证顺序/时间；这证明取得完整公开字幕文件，不证明字幕覆盖视频每一秒。
- 工作流小文件保存实际下载哈希；大型模型允许固定官方公开仓库的发布者文件清单证明（PUBLIC_PUBLISHER_MANIFEST_ONLY），单独记录清单URL、公开/非gated状态、发布者哈希及文件大小，不声称下载模型或运行工作流。任一已声明必需材料仍未验证则阻断。材料可获得不等同实际执行成功。
