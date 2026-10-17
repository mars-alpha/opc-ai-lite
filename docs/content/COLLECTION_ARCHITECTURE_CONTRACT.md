# COLLECTION_ARCHITECTURE_CONTRACT.md

## 实践主题与汇总内容边界

- 作者站与其视频使用同一Creator Source；视频URL规范化后复用Raw/Observation，短链、列表及分享参数不能制造副本。已发现作者参考关联creatorSourceId，不重复核验。无发布日期历史材料只入Raw/Observation，不伪造当前Event。

- 已确认作者的公开材料可走固定Deno Provider：Pixaroma目录仅JSON解析、排除comingSoon；每次最多30集元数据、3个≤128KB工作流包，共享公开步骤单独标注。腾讯云只在内存校验ZIP与ComfyUI节点JSON，不解压落盘、不执行工作流。未下载/未运行/未取得字幕必须分开记录，不能声称全文或实践成功。

- 热点主体必须是单一事件。明确的早报、新闻汇总或至少两条不同主体独立发布拼接内容不进入热点（同主体补充、指代续句和搭建汇总工具教程不因此排除），其Raw也不作为独立热度参与者；保留全部动态与历史，不归档合法Source。汇总中的新闻必须取得独立原文再按既有条件评估。
- 实践主题的定向搜索复用Event Expansion，BILIBILI_SEARCH/YOUTUBE_SEARCH与BRAVE_SEARCH的就绪/主备规则见P3A/P3B；仅由来源管理中ACTIVE/enabled/currentPortfolio、AUTO_READY或CONDITIONAL、有明确且服务器可执行SEARCH_DISCOVERY Route、collectionConfig.practiceExpansionEnabled=true的Source承载。可在原逻辑Source附加搜索Route并用practiceExpansionProvider指定搜索Provider，不覆盖原采集Provider或复制Source。未知、停用或无路由失败关闭，不调用ensureExpansionSource创建隐藏来源。
- 搜索补资料与正式栏目资格分开：共享原文发布者集合（不回退纯热度参与者），两位独立发布者即使尚无分析/应用也可搜索；重要且已官方确认的单源AI事件也可搜索，不降低练习栏目门槛。Event.metadata.practiceDiscovery独立记录PRACTICAL_MATERIAL_DISCOVERY目的、来源与尝试时间，成功冷却6小时、失败1小时、RUNNING租约15分钟；无效/未来时间失败关闭，普通证据刷新不改变该水位。已有可操作实践证据则停止搜索。
- 实践搜索按下文P3A持久查询规则运行：每SYSTEM周期至多一个主题，现役主来源与至多一个不同Provider备用共用最多3次查询，每次最多5条；实测/教程/应用是互补角度。先对完整7日活动候选按优先级与等待时长排序，再限制名额。无健康受管来源时纯搜索候选不占证据刷新名额；零查询仅能报告明确的预算/租约/计划停止原因，不能冒充已成功联网。复用既有受管路由，不持续全网扫描。实现与开关状态见CURRENT_SYSTEM_FACTS。
- 搜索结果沿用污染、相关性、去重与Evidence校验。新作者内容是参考候选，不自动注册长期Source、不自动授予Fact或实践资格；正文不足不声称完整实操。搜索失败不得阻断已有Raw的证据刷新；缺少可用搜索Source返回NO_READY_MANAGED_SEARCH_SOURCE。搜索失败计入周期失败，不能以证据刷新成功覆盖该失败。
- 页面读取不调用AI；独立的SYSTEM材料理解与关系建议阶段分别见下文P2/P4C规则。常驻重新读取按钮退出；页面初始化和操作后自动读，首读完成前显示读取态，不把未加载数据显示为0。来源目录与热点快照在页面可见时每5分钟重读，切回页面且距上次请求至少1分钟时追赶；后台重读不清除已加载历史、筛选或来源编辑输入。仅快照请求失败提供重试。该界面刷新行为已获产品负责人体验批准。

Status: CURRENT / APPROVED PRODUCT BASELINE
Rule: 本文件只描述当前架构。历史 Phase、已删除 Owner 与旧实验方案由 Git 追溯，不在 current contract 中保留。

## 1. Product Boundary

受管搜索登记由来源管理的`managed-practice-search.ts`提供：必须先获得服务器真实样本，事务写入Source与Audit，仅CONDITIONAL；`sourceRegistry.executionScope=EVENT_EXPANSION`明确限定为定向补证，不进入持续Source采集列表。既有归档来源不恢复。作者身份随Raw保存，状态PENDING_SOURCE_REVIEW，不自动注册长期作者；视频简介只能视为DESCRIPTION_ONLY。查询语言沿providerQueryPlan，通用搜索复用事件语义计划。

当前后台内容链只保留三个产品 Owner：

- 热点追踪（Hot Tracking）：正式生产闭环固定为 Source Management → SYSTEM Collection → Event → Discovery Expansion（仅消费 current Source 已采 Raw）→ Practical Evidence → AI Hotspot Practice / Topic Momentum / Curation → Radar Snapshot；页面保持既有排版和 CSS。
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

SYSTEM 的 Raw、Observation 与 Run 的 `metadata.rawItemIds` 归属在同一事务提交，失败收尾保留已提交归属；历史无归属记录不推断补写。正式 Source Run 重访已存在 Raw 时，仅在该 Raw 缺少 Event 关联且非无发布日期历史材料的情况下续接 Event Seed，并沿现有 Event 策略刷新；普通重复轮询不重复刷新。Event Seed 与 Raw 关联同事务提交，Event 扩展证据替换在同一事务内完成。管理员事件列表 API 只读，不提供独立 Event 写入口。

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

Qualification 必须使用当前checkpoint内的 `recent N runs first`。先按当前runtime/checkpoint、SYSTEM、SUCCEEDED/FAILED、非qualificationOnly、非排除型staleRecovery及180日内/非未来过滤，再排名或截取；旧Route、测试与未来记录不得占取样名额。业务成熟度只看最近最多5条合格Run；数据库每Source最多读取12条Run payload，运行退化取最近最多6条。180d仅为query safety fallback，不存在30天业务/查询硬截止；低频官方Source的合格Run可跨30天。P3E修复选择顺序；部署事实见CURRENT_SYSTEM_FACTS。

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
Event Seed 与后续 Event Cluster 候选均覆盖完整 72h 时间窗口并排除归档 Event，不允许无序固定条数截断；不同标题可用共享实体、明确同类事实及金额/主题锚点做确定性归并。实体冲突、不同金额或不同主题不得仅凭标题相似合并。既有热点 Momentum 门槛保持独立，历史 Event 不因规则升级自动改写。

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
→ bounded material understanding（P2，受开关控制）
→ Radar snapshot refresh

无 due Source 时必须 NO_SOURCE_DUE，不得回退为 25 Source 全量运行。

自动周期使用私有数据库连接的 session advisory lock 排除同库并发周期；争锁返回 SKIPPED，不伪报已执行。onclose 与 5s heartbeat（10s 超时，校验 backend PID / pg_locks，不重复抢锁）检测到失锁即非零终止 CLI；正常释放须验证 unlock=true。网络分区中已提交的 SQL 仍可能完成，不宣称严格 fencing / exactly-once。生产入口必须同时通过 Database Environment / database name 校验与 `--confirm=SERVER-NATIVE-COLLECTION-PRODUCTION`。任一来源或扩展失败时周期报告 PARTIAL 并非零退出，其余阶段继续尝试。

Source Run、Discovery Expansion、Topic Momentum follow-up 均不调用模型，不以AI结果作为Raw、Observation、Evidence持久化前提。唯一SYSTEM自动周期在机械采集/补证之后增加有界材料理解阶段（P2，受开关控制）；该阶段只辅助展示与抽取，不启动Event分析/翻译/改写或改变业务状态。Event深度分析继续保留既有管理员入口。

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
- 精选：通过事实硬门禁后按可解释编辑分排序。
- 全部动态：通过基础 AI relevance / Event 聚类后的唯一主 Event。默认一次完整读取北京时间今天及前六个自然日，区间为首日00:00至快照asOf（半开区间）；以eventAt、缺失时firstSeenAt确定日期，排除未来、归档及不合格事件。删除120条首批规则。服务器窗口中的今天默认展开，其余日期默认折叠，默认七日空日保留。加载更多每次取得此前最近一个有合格内容的日期全天，跳过历史空日；无更早可见事件时显示“已经到底”。不得以已排除的数据库旧记录判断hasMore，不追加历史空日期行。日期游标固定asOf、按事件时间及ID稳定排序；历史不改变七日总量。旧 `discoveryStatus=IGNORED` 不再过滤动态；新质量标签也不参与可见性判断。
- 统计窗口：北京时间今日、近七个自然日、最近100次SYSTEM正式运行分别标注起止时间。成功Run记录返回条次、过滤保留、后置排除、入库批量排除、Raw新增/重复、Event新建/归并及无日期历史材料；排除原因复用Run元数据。失败/进行中可能部分写入，不混入成功漏斗；旧Run未记录的阶段显示未知，不反推。七日可见Event是按事件时间计量的当前存量，与按运行时间计量的采集漏斗不是同一队列，不计算伪转化率。
- 一致性：完整七日窗口在REPEATABLE READ只读事务中生成；items、分类总量及Event索引同源，唯一ID数=总量=分类合计=逐日合计。逐日历史请求独立读事务，asOf只固定日期上界和入库截止，不提供历史状态版本；归档即时生效，跨请求发生状态变化以重新读取的当前快照为准，不宣称时间旅行快照。人工质量标签不改变可见性。
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


## 17. Trigger-based Comment Collection

评论挖需是 Event 后续能力，不是常驻全网评论爬取。

Trigger-based Comment Collection 仅在明确 Event / Creator / Raw 触发后运行，预算 bounded。

输出 Demand Cluster：QUESTION / PAIN_POINT / REQUEST / OPINION。

Demand Cluster 不贡献 Fact Evidence、Verification 或 Hotspot Authority。

## 18. Human Gates

按当前用户授权，固定公开Relay自动准入的网站参考来源不再逐项人工确认；规则见下文“机器来源准入”。其他既有手动登记来源保留当前治理流程。

必须人工确认：
- 未纳入机器准入范围的Source首次进入长期AUTO
- 非自动准入来源的PAUSE / DISABLE治理建议
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

- 原生HTTP Feed支持ETag/Last-Modified条件请求；304为NOT_MODIFIED，合法空Feed为NO_NEW_ITEMS，不启用备用路由。HTML错误页、真实DTD/实体声明和不完整条目失败关闭。CDATA、注释和处理指令按同一词法边界等长遮蔽后定位真实条目，再按偏移恢复原文；正文中的示例标签不得占解析上限，未闭合词法块失败关闭，不执行样式或实体。解析上限或部分条目无法解析标记truncated，不提交validator；不宣称完整历史。固定Relay使用source-conditional-http-v1协议（PUBLIC_SOURCE_DOCUMENT/DEEPMIND_FEED），部署事实见CURRENT_SYSTEM_FACTS；旧Relay无条件回执仍全量读取，不虚构304节省。
- Feed validator按route ID与URL隔离。只在Raw/Observation持久化及事件刷新成功后，与成功Run/Source时间戳在同一PG事务提交；回填与资格预览不推进日常checkpoint，容量排除或解析截断也不推进。
- 条件头仅允许ETag/Last-Modified，双端校验长度与控制字符，不转发任意Header。重定向后不发送初始URI的validator，也不把目标响应的validator绑定回初始URI；跨URI或未发送条件的304失败关闭。Relay的304必须有显式协议、匹配URI与空正文；非法状态类型失败关闭，旧200回执仍兼容。网络超时预算沿Node→Relay→上游传递，Relay不拥有PG checkpoint。
- AIHOT现有固定JSON快照的条件请求使用独立apiCheckpoints，复用相同成功Run/Source事务及Route隔离。合法items=[]为NO_NEW_ITEMS，非法JSON或缺items数组失败；最多处理120条，超出或hasNext=true标记truncated并保留旧水位。字符串/安全非负整数ID保持稳定，缺ID才使用原始URL。API Run的BOUNDED_SNAPSHOT_NO_CURSOR表示本适配器尚未消费cursor，不表示上游不存在分页；当前官方v1文档已有滚动窗口cursor及精选snapshot/changes协议，后续须显式适配，不猜旧接口参数，不承诺历史或全量覆盖。AIHOT仍为辅助发现，取消采集阶段评分<60硬过滤，栏目资格保持；更多API逐项验证其自身协议。
- GitHub Release仅由Source显式PUBLIC_JSON_API/GITHUB_RELEASES Route消费固定仓库名单；趋势搜索不授予Release覆盖。每页30、每轮最多3页/30秒，每轮重扫首页及续页前一页；成功处理后在githubReleaseCheckpoints按Route/URL存下一页，Raw/事件处理与成功Run提交前不推进。该位置是有界遍历进度，不是published_at水位；未验证时间排序，不按旧发布日期提前停止，不发送虚构since参数。
- Release分页遇短/空页且无next后复位续页为2；达到1000页上限也复位并明确pageLimitReached，不能解释为历史扫完。Link仅接受相同仓库命名路径或核验过的固定数字ID别名、相邻页码及固定参数；只提取页码并重建白名单URL，不跟随Link或HTTP重定向。分页变动/短时大量新增仍可能漏报，始终标记BOUNDED_PAGES_NO_ARCHIVE_GUARANTEE；本轮未到底不伪造空白历史。
- Release以稳定数字ID去重，保留prerelease标记，排除draft，发布时间只取原发布值；非法结构/时间/外站链接失败，不猜日期。429/403与网络错误交还现有Source退避，无即时循环重试。资格预览/回填从头读取但不推进日常进度；新API不使用首页ETag替代后续页检查。API入口需Relay及OPC_COLLECTION_GITHUB_RELEASES=v1，否则明确不可用；不自动恢复归档来源或取得Fact Authority。固定名单和部署顺序见实现映射与Relay部署owner。
- 公开材料补全按到期等待时间优先、站点轮转分配名额；7日窗口分页扫描，不能在到期过滤前截取固定500条。扫描使用只读一致性事务，每页500、最多100页，超过预算显式PUBLIC_CONTENT_QUEUE_SCAN_LIMIT，不能假报空队列。跨站点失败退避保持独立，来源归属/材料资格不因排队改变。

- Discovered / fetchable / retained / factual / hot / practical are separate judgments. Keyword recall does not certify topic coverage; a successful response does not prove useful body content or originality.
- Each normalized item records title, published time, author, original-link presence and body character/level in `metadata.collectionQuality`. Prefer Feed content over its short summary when available, capped by the existing parser limit. Long excerpt is not verified full text; missing body cannot authorize a full translation. Unknown originality remains UNKNOWN rather than being inferred from publisher type.
- Source retention uses recent SYSTEM run success, received/new/duplicate counts, topic usefulness and update cadence as separate review inputs. Low yield or one network failure alone cannot trigger archive. Legacy Manual/Login/Browser acquisition may be archived with reason and preserved Raw/Event/Evidence history; unavailable but legitimate sources remain explicit health failures. Exact source identity and alternate routes must not be multiplied into separate sources.
- Backfill is an explicit operation of the same SYSTEM collector and lock, not another scheduler. The requested interval is <=168h, ends no later than now, and is checked against original item time before ranking-signal exemptions. Missing/invalid time and out-of-window items are excluded and counted. Current Feed/API result caps cannot prove complete seven-day history; report AVAILABLE_WINDOW_ONLY_NO_ARCHIVE_GUARANTEE and per-source failures/gaps. Do not synthesize old articles, timestamps, measurements or daily coverage.
- Three output dimensions may overlap for one Event; none implies another:
  - Hotspot: existing Event Momentum RISING0–24h/SUSTAINED24–168h, independent participation/active days/cross-platform/practice/engagement and current thresholds; ranking never grants Fact Authority.
  - Curated dynamics: existing Bole Gate requires AI relevance, <=72h, confirmed official/media and MAJOR/NORMAL; FEATURED score>=66, TOP_PICK>=78 plus its independent evidence/value gate. A single-source official update may be curated without being hot or practical.
- User-facing topics (REA/ComfyUI/Skills/MCP/ad creation/writing/images/animation/editing/assistants/work management) describe discovery coverage, not the three publication dimensions. Add sources only after bounded live capability check and preview. Generic news/trends cannot stand in for persistent original practical sources.
- Production acceptance requires its own schema, runtime grants, source inventory, route probes, backfill and three-output checks. Development success is not production acceptance, and healthy results from an earlier cycle do not erase a current failure.

## 22. Operations consistency

- 旧 Event 决策写入与忽略后退出列表已退役；新采集质量标签只写独立样本、不改变 Event/Source/栏目状态。生产运行事实见 `docs/CURRENT_SYSTEM_FACTS.md`。
- 单来源可默认归因该来源；多来源可选具体关联来源，未选则只记Event层，不能把Event层负评分摊给全部来源。写入时验证Event与Source关联，保存反馈时的原文URL、Raw/Observation、可确定的Run、自动判断与规则版本；不可确定字段为null，不推测，不保存完整原文或Secret。旧 `content_candidate_decisions` 仅用于历史审计，不导入新标签。
- 来源管理只展示最近30日当前有效且归因该来源的已评价数、负向数、主要原因和有界样本；未评价不算负例，不把已评价样本占比称为全量采集准确率。热点追踪评价筛选只改变列表显示，不影响自动采集与栏目资格。
- Radar基础快照和完整窗口轻量索引继续同源生成榜单与计数，不用首屏计数冒充全窗口；只读覆盖归档状态，不读取采集质量标签。
- Snapshot generatedAt超过30分钟为STALE，非法/未来时间为异常；读取旧数据不自动全量重建。SYSTEM仍是周期刷新唯一owner；首次缺失或Schema不兼容允许一次初始化。客户端慢请求不能覆盖之后已提交的运营动作。
- Source启停、operator归档/恢复、规则保存和资格阶段更新与其审计同事务，包含actor、reason、before/after。归档恢复保持禁用，退役路径禁止恢复；不删除历史。
- QUALIFIED只代表真实AUTO_READY；成功探测仅PROBED，有正式Run但未合格为OBSERVING；qualificationOnly不计成熟度。来源禁用/归档时有效资格必须显示DISABLED，不复用过时AUTO_READY标签。

### 独立作者检索与评测资料池

- Web事件补资料沿原请求账本按中英意图队列轮转，平台专用检索仍使用对应语言。只改变发现覆盖，不新增热点权重、来源身份或栏目授权。
- 评测池先收集多路径原作者/官方资料，再按URL和作者去重，保留抓取途径、日期、引用、工具/实现差异及逐栏目正负/UNKNOWN理由。编辑判断与被测运行分数分离，未判定不作负例；探索性分析标签不冒充盲评人工金标。
- 同作者多URL只有一个发布者；同协议/工具的不同实现和不同版本仅作关联候选，不自动合并发布事件。研究工具可读不证明Deno出口、持续Source资格、附件可用或实际执行成功；历史教程不填充当前讨论度。

### 逐篇公开材料获取边界

- 待补正文队列按独立词边界覆盖Skill、单数/复数Agent与已支持工具名称，中文教程/实操词保留；入队不授予AI相关性、事实或练习资格。直接原文与扩展资料均携带各自材料校验结果，不借用其他URL的资格。
- 编号架构标题、产品名和泛化扩展建议不能证明操作步骤，冒号散文不能证明配置。真实打开工具并配置/执行的步骤保留；必需API凭据仍需人工申请/审批时拒绝即时实践资格，可选依赖仅豁免该依赖，不能因无关optional文案绕过。

- SYSTEM列表过滤后每源每轮最多补2篇固定白名单详情；合格材料复用7日，不足材料/失败至少间隔1小时。详情失败保留列表结果；重复Raw只升级与原始URL精确绑定的材料字段，不覆盖事实和人工决策。
- Comfy官方教程经Deno的PUBLIC_PRACTICE_DOCUMENT获取公开Markdown；B站只尝试匿名公开字幕API，无字幕明确不可用，无登录/Cookie回退。Pixaroma只从该集已下载ZIP读取人类README/HOW-TO-USE，不把模型提示词文件或共享安装说明冒充逐篇步骤。
- 凭证包含原文URL、实际获取URL、匿名/服务器获取状态、HTTP状态、时间、完整性、正文/字幕SHA256。字幕保存全部返回cue并验证顺序/时间；这证明取得完整公开字幕文件，不证明字幕覆盖视频每一秒。
- 工作流小文件保存实际下载哈希；大型模型允许固定官方公开仓库的发布者文件清单证明（PUBLIC_PUBLISHER_MANIFEST_ONLY），单独记录清单URL、公开/非gated状态、发布者哈希及文件大小，不声称下载模型或运行工作流。任一已声明必需材料仍未验证则阻断。材料可获得不等同实际执行成功。

### 来源输入与规则执行

- 筛选规则只有一份持久化Owner：source-ai-relevance-policy-v1。所有SYSTEM候选在Raw写入前消费同一份规则；每次Run记录实际消费的版本和更新时间。新增词扩展标题相关性召回，不替代已有确定性识别，不绕过时效、质量、Source内容类型或栏目Gate；排除词匹配标题/摘要并优先拒绝。修改从后续采集读取，不追删历史Raw/Event；单源keywordPolicy继续叠加。
- 网站/作者主页先解析标准HTML `link rel=alternate` 的RSS/Atom声明（含相对地址、实体转义），复用已下载Feed；再尝试有限固定备用路径及同站Sitemap。不递归全网爬取，不使用登录/关注/本机Browser。每次检测30秒网络取消预算，Feed阶段20秒，为Sitemap预留预算；请求仍受原公共URL、重定向及响应大小检查约束。
- 公开网络路径可运行及有样本才可注册。注册/旧登记接管与审计同事务，按canonicalUrl/providerRef再次检查重复；并发注册串行。可采性不授予Fact Authority或AUTO_READY；网站与Creator都从参考来源开始，资格按现有真实Run观察。
- PUBLIC_SOURCE_DOCUMENT是Deno固定白名单获取能力，原simonwillison.net、til.simonwillison.net、blog.comfy.org行为保持，P3F新增Hamel固定范围见下文；不是通用代理。其他海外源仍需独立验证并配置受管路由，不宣称任意主页可采。无明确路径/超时/登录墙必须失败关闭。
- 成熟依据：[WHATWG alternate订阅链接](https://html.spec.whatwg.org/dev/links.html#link-type-alternate)、[RSS Autodiscovery](https://www.rssboard.org/rss-autodiscovery)。HTML由[htmlparser2](https://github.com/fb55/htmlparser2)解析，既有RSS/Sitemap/SYSTEM主链继续复用，不引入AI判断。

### 机器来源准入（实现协议）

- 仅处理现役SYSTEM来源下最近7日收集的Raw，原文URL限已启用的PUBLIC_SOURCE_DOCUMENT固定范围。必须从实际返回的原文HTML观察到同源根主页链接或下文已验证的固定首页别名，再探测同源原生Feed；不猜主页、不把文章当Source，不扩展任意HTTP/Sitemap或登录路线。网站身份不等于作者或官方身份；不满足持续作者/完整材料条件时不授予实践作者资格。
- 复用onboarding事务锁，对canonical身份、providerRef和实际Route URL去重。匹配已归档、禁用、历史或身份歧义的记录时停止，不恢复；合法现役来源只复用。新Source与审计同事务，初始为AUTOMATIC登记的CONDITIONAL参考来源，不授予Fact Authority。
- Raw.sourceAdmission唯一保存输入revision、jobId租约、实际主页、结果与重试时间。注册提交和回执写入均验证当前任务与输入，旧任务不得借新租约注册或覆盖；同输入终态不重复探测，输入变化可重新评估。失败指数退避1/2/4小时至24小时，RUNNING租约15分钟。
- 复用唯一SYSTEM锁，SOURCE_AUTO_ADMISSION阶段每周期最多2条、65秒；剩余不足35秒不开新探测，网络取消预算传递到探测。新Source后续周期才进入采集；缺Relay配置返回DEFERRED_RELAY_UNAVAILABLE。OPC_COLLECTION_SOURCE_ADMISSION=off停止新增准入，保留已注册来源与审计。
- 成熟资格与运行退化按前述Qualification证据取样规则，不借用旧Route或Qualification探测记录。自动登记来源的暂停/禁用建议改为有界降频观察，不新增人工队列、不擅自禁用Source；同checkpoint的既有DISABLED资格仍须满足recertification规则，不绕过资格判定。
- 本机开发库验收使用模拟Relay及真实PG事务，验证回滚、并发去重、幂等、租约、退避、预算和归档保护；不代表真实上游或生产验收。API游标、更多站点及完整watchlist覆盖仍待实现；固定Relay条件请求的本机实现见增量规则。

### Watchlist覆盖诊断与固定Feed出口

- 官方/产品、开源/研究、媒体/作者、实测/教程四组只引用Source现有身份、配置和既有current判定；输出MISSING_SOURCE、INACTIVE_EXISTING、IDENTITY_AMBIGUOUS或TRACKED_NOT_PROBED。期待对象不自动登记、恢复历史Source、合并身份或授予官方性；GitHub趋势不代表Release覆盖。
- 配置诊断输出CONFIGURATION_ONLY_NOT_LIVE_ACCEPTANCE；runtimeReady最多为未知或明确不可用，不将URL存在当作连通/质量证明。SYSTEM只读报告复用唯一周期，不新增调度/产品面。
- WATCHLIST_FEED仅接受固定白名单中12个已有Source的13个HTTPS Feed URL，拒绝任何重定向及未列出的路径/参数；Source配置仍是身份与Acquisition Plan唯一owner，白名单仅限制传输。海外请求经Relay，复用正文解析/条件回执/事务checkpoint，不扩大三个固定域名的自动来源准入范围。
- 新Feed路径要求已配置Relay及OPC_COLLECTION_WATCHLIST_FEEDS=v1；未就绪明确失败关闭，不自动改走宿主机HTTP。该路由优先级对这些URL生效，缺开关会使对应采集不可用；上线前必须先部署验证Relay能力，再同步Node与开关。关闭开关停止新出口；恢复旧采集行为需要同版代码回退。部署操作唯一见services/overseas-collector-relay/DEPLOYMENT.md。
- portfolio seed不重新启用停用/归档/managementDisabled/currentPortfolio=false的来源；数据库写入条件再次检查，防止读后发生的运营停用被覆盖，metadata原子合并保留其他字段。不以此删除历史审计或自动修复重复身份。
- 只读探测有界、无数据库业务写入；本地handler+真实上游、模拟链路+真实PG、远端Relay及生产SYSTEM分别验收。截断Feed不推进validator，不宣称完整覆盖；探测失败继续作为缺口。登记或传输配置不改变热点/精选/练习门槛。

## 23. AI热点练习

- 消费 canonical Event 及合格原发布者报道。用户2026-10-17确认栏目聚焦 Skill / MCP / Agent / 工作流等可实操工具；纯模型发布、权重开放、平台上架不进入练习。以原始标题和分类判断，不由AI改写结果授予资格。
- 初次触发须有明确工具主题、至少两个带原文链接的独立发布者、实质分析/评测/应用/操作讨论，以及至少一个已由共享材料能力验证 eligible 的可操作资料链接。教程可以与报道使用不同URL；材料不额外制造讨论发布者。精选、Fact Authority、AI分析AVAILABLE与是否进入热点Top10不是入场条件，触发不授予Fact或自动生成练习。
- 报道输入包含Event直接Raw与相关SYSTEM扩展Raw。AIHOT仅限固定来源、ai-hot采集器、NEWS_ARTICLE且有明确非聚合原发布者；CREATOR仅限真实WEB Feed报道。纯趋势/互动Signal、无原作者聚合器不计人数，同机构/作者跨平台、同站别名与转载不重复；多新闻汇总排除。Source的signalOnly/referenceOnly和Fact Authority保持不变。
- 扩展报道复核相关性分类，再要求标题覆盖至少75%的事件specific anchors，并满足至少两个匹配、带字母数字的版本锚点或非通用长名称。仅同品牌、通用词或摘要提及不够；历史扩展保留审计。
- 多独立原发布者的实质讨论同时用于 Event Momentum v8：保留0–24h RISING / 24–168h SUSTAINED、42分门槛和时间衰减；合格原文讨论达到两个独立发布者时无需再强制跨平台或跨日。热度与事实核实分离；不以聚合榜单数量、同站作者别名或纯转载充人数，不以数量目标降低阈值。
- 首次命中保存Event.metadata.aiHotspotPractice，保留时间、原始标题、分类、依据、参与者及链接。超过七日或热度衰减不撤销合法工具历史触发；读取时按当前工具主题/已验证材料边界过滤旧记录，模型新闻和无合格材料记录保留审计但不展示。全部有效成员归档/删除退出，质量标签不授予或撤销资格。
- SYSTEM复用唯一周期记录触发/刷新快照；EVENT_CLUSTER_RECONCILIATION在扩展后、AI关系与Momentum之前按现行规则版本有界补历史聚类（默认20候选、45秒调度预算，同锁、失败保留重试）；不删原始Event、不新增调度器。API读取不触发聚类、网络采集或模型调用，旧快照同样复查工具资格。
- 前端现有布局与交互保持，不受全部/精选/分类筛选控制，无4/8项截断。compact传输仅裁剪界面未使用的内部/重复字段，不修改持久快照、可见正文、来源链接与审计；任何后续可视化改动仍需重新体验批准。

### P2 持久异步材料理解（实现协议）

- 唯一SYSTEM周期先完成采集、补证与Momentum，再处理CONTENT_UNDERSTANDING，最后刷新Radar Snapshot；独立失败记录为周期PARTIAL，不跳过快照。无新timer/服务/Schema。页面读取不发起模型请求，栏目资格与Event状态不消费此阶段的AI判断。
- 仅选现役server-runtime Source下最近7日收集的SYSTEM Raw；到期候选按收集时间/ID先后处理，SQL先过滤已完成/退避记录再限20条。每轮最多2条、65秒，剩余不足45秒不开新任务。这是运行资源边界，不设月度金额硬停；有积压不等于全量已理解。相同实际模型输入但未选用正文变化时同步观测revision，保留退避/租约，避免持续堵住候选窗口。
- Raw.metadata.contentUnderstandingJob是唯一持久任务状态：版本、jobId、inputHash、模型键、材料revision、attempts与nextRetryAt；RUNNING租约15分钟，FAILED指数退避1/2/4/8/16/24小时。同输入SUCCEEDED不重调；原文、来源语义、模型/endpoint/提示/Schema版本变化可重算，密钥轮换不触发重算。过期RUNNING对应旧ai_run记ABANDONED/PROVIDER_OUTCOME_UNKNOWN；不宣称远端调用exactly-once或超时不计费。
- Core在短事务中领取，再在事务外调用Provider，提交前再次锁定Raw/Source并比较jobId/输入hash/现役状态；旧租约、原文变化或来源退出标STALE，不写理解。只原子写job与理解JSON路径，保留并发其他metadata；AI不拥有Source资格、Event事实权、排序/栏目Gate或发布权。
- 版本化理解输出：中文标题、答案先行摘要、阅读价值/推荐理由、分类标签、可逐字核对的事实候选与不确定项。正文最多12000字符；无正文明确EXCERPT_ONLY/TITLE_ONLY，截断标FULL_TEXT_PARTIAL。不全文翻译，fullTextZh=null、fullTextTranslationStatus=NOT_REQUESTED；旧v2结果只兼容读取。v3展示必须匹配当前材料指纹，真实读模型传完整Raw，失效回退原文。
- 复用现有Model Gateway，temperature=0、显式关闭思考、max_tokens=1800，每次至多20秒；语义校验失败最多修复1次，最多2次请求；网络/Provider/非法JSON失败进入任务退避，不即时循环。机械校验包括标签白名单、实体/数字/版本保护、文章类型和推荐理由；这些校验不等于事实真值验证。
- 缺既有Provider配置返回DEFERRED_MODEL_UNCONFIGURED；新非密钥配置OPC_AI_ANALYSIS_THINKING_CONTROL仅接受enable_thinking/thinking/reasoning_effort之一，由运营先核对所配置模型支持的协议再设置，不按厂商猜测。未设置则DEFERRED_THINKING_CONTROL_UNCONFIGURED，不调用模型。其他Gateway调用不传新增参数时维持原行为；不建立独立厂商调用链。
- ai_runs记录版本、输入hash、任务结果、每次requestAttempts与Provider实际usage（含缓存/推理字段，缺失为null）。校验/解析失败也保留已返回usage；网络/超时等无回执请求使整体usageStatus=UNKNOWN，不能以0或已知部分冒充总成本。未配置单价不估算金额，不保存密钥/Provider错误正文到审计；真实模型质量、实际费用与生产72小时稳定性另验收。
- 关闭OPC_COLLECTION_CONTENT_UNDERSTANDING=off停止自动理解，保留Raw/任务/ai_runs审计；同版回退可恢复原运行版本。开发库验收使用SYSTEM同锁、独有临时夹具和mock模型，结束清理；不代表真实Provider兼容/计费或生产内容效果。无可视化改动；部署与开关事实见CURRENT_SYSTEM_FACTS。

### P3A 受管实践搜索持久计划（实现协议）

- 受管搜索须明确Route、opt-in、currentPortfolio、ACTIVE/enabled及CONDITIONAL/AUTO_READY。支持BILIBILI_SEARCH/YOUTUBE_SEARCH，以及下节P3B的条件Brave路由；最多一个主来源和一个不同Provider备用，不创建隐藏Source、不恢复历史身份。原文路由、推送、ORIGINAL/INDEPENDENT及AI查询改写仍未实施。
- Event行锁内重新核对事件≤168h/非未来/非归档与Source就绪、查询账本，再插入RUNNING ExpansionRun，网络在事务外执行。该Run是查询尝试槽位唯一账本，失败/未知/RUNNING均占滚动24h最多6次预算，跨Source/计划版本/重启不重置；领取后崩溃可能未实际发送，也保守占位，不等于已计费。单位为一次逻辑查询，Provider内部详情/指标请求仍遵原Adapter边界，不把查询数当作HTTP请求数或计费次数。
- 同计划键含版本、事件语义、请求类型、原窗口小时数及现有六小时发现冷却对应的generation；成功完成的同Provider/规范化query不重查。最近两个同计划完成查询createdCount均为0，则PLAN_NO_NEW_REFERENCES，停止本generation原计划；新generation可重新发现后出的资料，但保留全局日请求界限、租约与失败退避。这是“无新增已接受参考”，不是已验证独立事实或可操作材料的效果指标。新计划可重新判断，但不能绕过日上限。旧计划历史不参与新计划停止；预算只看24h，避免累计历史永久禁用。
- 活跃RUNNING请求租约15分钟阻止并发领取；未知结果到期可在预算内重试，不宣称exactly-once。Provider失败至少退避1小时，主源实时失败或持久退避时才尝试一个备用，仍共享当轮3次；成功空结果不fanout。主源本轮失败不会被备用成功掩盖，周期仍PARTIAL；可解释的到期/去重/预算停止不伪造成功请求。
- B站响应必须code=0且具有result数组，否则记录失败，不能把风控/错误HTML类响应记为无新增。所有结果继续走访问、污染、相关性、去重和Evidence校验；snippet不等于正文，新增参考不授予Source/Fact/热点/精选/练习资格。
- OPC_COLLECTION_MANAGED_SEARCH=off停止自动搜索，原有采集/材料补全/证据刷新继续；同版回退保留Raw/Run审计。开发库真实PG事务与模拟上游夹具验收已通过，结束清理；这不代表真实上游或生产效果，不宣称已增加生产来源或改善召回。
### P3B 通用网页搜索（实现协议）

- BRAVE_SEARCH只用于已登记Source下的Event实践参考扩展，不加入持续关键词Collector或默认隐藏Provider池。登记复用来源管理Core与审计，先保护停用/归档意图，再作有界现场探测；仅返回样本不代表持续健康。经探测登记为CONDITIONAL参考来源，authorityScore=0，不授予原创作者或Fact资格。
- Node须既有Relay连接和OPC_COLLECTION_BRAVE_SEARCH=v1才允许尝试；Deno须持BRAVE_SEARCH_API_KEY，否则无上游请求并明确503。配置就绪不是实时健康证明；真实失败写现役查询账本/退避。已登记且允许尝试的通用搜索优先为主来源，其他Provider保持稳定ID顺序选一个备用；关闭Brave后沿用平台搜索次序。成功空不fanout，P3A每轮3次/每Event滚动24h六次和停止规则保持。
- 上游仅固定GET https://api.search.brave.com/res/v1/web/search，Key只通过Header发送；禁止重定向，单页offset=0、count≤5、freshness=pw、12秒且流式250KB上限。不把调用者URL用作上游目标，不自动重试/翻页。缺web.results、畸形结果或错误结构记录失败；显式空数组才视为合法空结果。
- pw仅为上游发现过滤，不证明原文发布日期/完整七日覆盖；age/page_age等字段不转publishedAt，始终null。共享解析只保留经验证的HTTPS公开域名引用、标题与片段，去重并排除凭证/端口/IP/本地域名。片段标SEARCH_SNIPPET_ONLY、referenceOnly=true、factualSource=false；搜索Provider不抓正文，后续材料补全见P3C，不将搜索结果直接变成事实证据/完整练习材料。
- 开发库使用真实PG+模拟上游，覆盖登记审计、空结果持久停止、非空结果经既有Gate入Raw、停用保护及finally清理；未使用真实Key或付费调用。尚未登记生产Source、部署或验证真实质量/时效/费用/覆盖。关闭Brave开关或同版回退停止新增请求，保留审计；配置操作唯一见Relay部署手册。

### P3C 固定源头正文与无日期参考补证（实现协议）

- 复用SYSTEM的PRACTICE_MATERIALS阶段与现有Raw，不新建Source/Raw/Event。保留原有北京时间七日已发布日期队列；新增无日期分支仅接受最近168h收集且非未来的SYSTEM referenceOnly参考、practiceDiscovery.status=PENDING_SOURCE_REVIEW，并关联到最近168h、非未来/非归档Event。无关联/非法ID/过期/非待审不入队；不把收集日或正文页面元数据写成发布日期，不产生当前事件或改Source/Fact权威。
- 固定PUBLIC_PRACTICE_DOCUMENT共享路径包含Hugging Face的/blog/slug或/blog/namespace/slug、Simon日期文章、TIL分类/文章，以及下文P3F的Hamel单文章；当前协议版本见部署手册。托管博客namespace不等于官方作者身份。仅HTTPS精确域名、限定路径、无凭证/端口/query/hash；沿用禁重定向、流式1.5MB/8秒单次和Relay16秒总预算。拒绝API/目录/Feed路径，不扩展任意URL或登录浏览器。
- 正文复用静态DOM/Readability，不执行脚本。真实正文收据包含原始URL、hash、观察时间与提取方式，按原材料规则复用；搜索片段不作收据。正文缺失/受限/过大仍失败；有正文但附件未验证，继续REQUIRED_ARTIFACTS_UNVERIFIED，不冒充可复现练习。原有站点公平轮转、退避和SYSTEM默认每周期2条保持。
- 网络在事务外；提交锁Raw与Source，比较sourceId/originalUrl/contentHash并重新核对当前候选条件。输入变更返回RAW_CHANGED，来源退出返回SOURCE_NO_LONGER_CURRENT，关联资格变化返回CANDIDATE_NO_LONGER_ELIGIBLE，均不写旧材料。合法提交仅合并材料字段与Attempt/Audit，保留其他metadata、日期和事实边界。rawItemIds只限定既有管理员操作/验收范围，不绕过选择与资格条件。
- 开发库真实PG+模拟上游验收与纯协议检查通过；公开只读小样及其网络/提取差异见执行计划，不作为远端Deno/生产覆盖证明。不凭静态样本登记/恢复来源，不承诺新增内容量、全站/附件/字幕覆盖；同版回退保留Raw/Audit。

### P3D 现役Feed固定迁移出口（实现协议）

- watchlist-fixed-feeds-v2只声明已核实的LangChain和宝玉旧Feed→固定新Feed映射，实际URL以共享watchlist-feeds为准；直接请求新目标并禁止重定向，未知迁移继续失败。映射仅为传输规则，不覆盖Source身份、配置、状态或资格，不创建来源；同上游别名不计作独立备用。
- Node与Deno均丢弃跨URI条件Header。旧地址请求必须收到v2映射声明、匹配的requestedUrl、固定有效URI与200；跨URI304和旧Relay回执拒绝。旧Route checkpoint不持久化新URI的ETag/Last-Modified；显式新URI的Route独立保留条件请求和304，合法空Feed不fanout。
- 原有SYSTEM、Route隔离及成功Raw/Run事务checkpoint保持；失败不推进。旧地址每轮无条件读取是当前保守成本；需要条件请求可通过同一Source显式配置新URI，不自动覆盖operator意图。开发库真实PG+模拟上游通过，不证明远端Relay可达、真实上游支持304或其他源已具独立备用。上线与回退只见Relay部署手册。

### P3F 固定作者Feed与源头准入（实现协议）

- PUBLIC_SOURCE_DOCUMENT共享路径策略新增hamel.dev的根主页、/index.html、/index.xml及/blog/posts/单slug/（可带index.html）；无query/hash/凭证/端口/编码路径，不提供任意该站文件。新路径经过Node显式开关与严格协议回执，逐跳验证；涉及新作者的重定向必须保持原origin，不能借旧域名路由跨入新作者绕过开关。既有条件请求/URI作用域和流式容量保持。
- 只有原文HTML实际观察到的hamel.dev/index.html才可按固定别名归一为根主页。注册匹配既有Source时也使用该固定身份别名，归档/停用/历史来源仍阻断，不创建第二身份或改写旧记录；不把其他站点index.html泛化为主页。
- 唯一SYSTEM的Raw候选SQL与领取复核随新开关使用同一已启用域名集合，关闭时不占该作者探测名额或发请求。复用既有首页声明Feed发现、机器准入、审计、租约/退避及初始CONDITIONAL参考资格；不强制seed作者，没有已采Raw时不会凭空登记。
- Hamel正文仅复用静态HTML/Readability及现有长度、附件、练习Gate；过长FAQ仍失败，不截短冒充全文或授予可复现实践。开发库独有夹具+模拟上游通过不代表远端可达或持续作者资格，真实小样记录见执行计划；当前未增加生产Source。

### P3G Eugene固定Feed声明与文章别名（实现协议）

- 同一作者Family增加eugeneyan.com根主页、/rss/、/writing/单slug/。在该精确根主页实际观察到指向固定/rss/的普通anchor时才接受为订阅声明；按HTML base解析后校验，外域/非法base不产生声明。不泛化RSS文字、任意anchor抓取或新增猜测路径。
- 仅该站已核实的//writing/单slug/归一为标准/writing/单slug/；共享规则用于Feed原文链接、Raw canonical身份、固定Source与Practice传输。Feed日期不变，不泛化其他站点/路径或回写历史Raw。原始引用可保留别名，材料收据区分original URL与实际fetched URL。
- Deno直接请求规范地址，Node与Deno均不发送别名URI validator，目标validator不绑定回别名；跨URI304拒绝。新作者仍使用既有开关、版本回执、同origin重定向和静态正文边界；旧协议不能冒充新增路径支持。
- 自动登记复用P3F的真实Raw、观察主页、Feed探测、初始CONDITIONAL参考身份及停用保护；没有Raw不seed。开发库PG+mock与静态公开小样均不证明远端Deno/Tencent可达、持续作者资格或当前热点增量。当前未登记生产Source。

### P3H 收尾：分组源头与上游发现线索（实现协议）

- 用户指定39个对象由requested-source-targets唯一列举，24个EDITORIAL_CANDIDATE与15个DISCUSSION_SIGNAL仅表示发现优先级；不授予精选、Fact或Hotspot权威。只读watchlist按精确URL匹配已有身份，分别报告现役、停用、重复、缺少和身份未核实；不按显示名/域名后缀猜身份，不seed或恢复停用Source。广域媒体仍需AI关注条件；Hugging Face托管博客不等于全站官方团队。
- 五个已实际声明并返回有日期Feed的发布者：PyTorch、Modal、Apple ML、Together和vLLM。精确主页/列表/Feed及单slug文章范围唯一见共享curated-publisher-feeds；只对该固定主页/列表追加已验证Feed候选，仍限总尝试，不爬任意anchor或全站路径。Feed/目录不得作为正文；原生正文仍受现有静态提取、长度/附件与实践Gate约束。vLLM采用实际新站vllm.ai，不为旧域名猜迁移。
- 自动登记的身份查重将这五站已声明的主页、博客列表和Feed视为同一发布者；仅归一固定URL与尾斜杠，不按同域泛化文章或其他路径。复用既有Source而不改其Route/状态/资格；归档、停用、历史与多匹配保护先于复用，不能因发现新Feed再建第二逻辑身份。传输白名单与身份归一分别由原共享声明和source-publisher-identity负责，不增加Relay权限。
- 新域名复用既有作者开关、版本回执、同origin重定向、条件请求及Raw驱动机器准入。关闭作者开关不领取新域名；新Relay协议就绪后才启用匹配Node/SYSTEM，无第二调度、默认HTTP或新Schema。公开原站200及开发库mock均不等于远端持续采集健康。
- AIHOT既有两条适配器共享有界提示元数据：上游评分、分类、是否精选、推荐理由、AIHOT单条归属及合法story链接；不把分数写为平台互动，不据此合并事件或增加独立参与者，不重复调用AI生成理由。未知分类保留为提示，非法分数为null，理由限1000字符，引用限已知AIHOT域名及固定路径；不执行正文中的指令。缺真实published值保持null，不借created/discovered补造发布日期。
- 官方hot-topics API输出rank和来源/参与者计数，不输出网页heat；其48h/24h半衰期与本项目热度窗口不同，当前只研究引用结构，不新增自动热点入口或替换算法。现行对外商业使用条款须书面授权，本批不新增公开再分发。原站独立采集仍按本项目资格链执行；发布/回退唯一见Relay部署手册，生产健康差额唯一见CURRENT_SYSTEM_FACTS。

### P4B canonical事件与成员证据（实现协议）

- 复用既有Event/Cluster/Member，不以AI展示标题判定身份。canonical ID沿用存储的primaryEventId；主成员归档、过期或不满足投影条件时，选择有效成员承载展示，原Event与原练习记录保留。全部成员无效不展示，不因聚合复活人工归档记录。
- event-cluster-v7-versioned-release在原Muse规则上补充明确模型家族、数值版本及命名变体的发布/渠道开放匹配；价格变动、安全事故、独立功能更新、教程评测与不同变体/版本保持分离，不把有限确定性识别声称为所有模型语义归一。其他模糊关系留给版本化Skill。归并要求所有跨簇成员对均通过当前规则、整体首次观察跨度≤72小时、总成员≤100；无版本桥接不能绕过冲突。聚类、policy持久刷新、练习触发使用同一事务advisory lock协调并发。
- Radar先解析候选簇全部成员，排除归档、未来创建/首次观察/事件日期及不满足现有资格者；有168小时内有效成员时，不让过期主成员决定当前时间线或证据。历史窗口保留全部过期组的查询能力。代表成员可变，canonical身份不随标题或时间线变动。
- 直接Raw、Observation及全部成员Expansion按Raw/扩展类型去重并按asOf排除未来证据。使用共享确定性policy重新计算事实确认、独立来源、准备状态与栏目输入，不沿用旧主成员的计数。referenceOnly/signalOnly不获得事实权；SYSTEM观察必须对应实际事实Raw。同组织弱报道不能遮蔽官方事实，但独立来源仍按origin去重；实践热度仅消费合格实践证据，不降低精选/热点Gate。
- 历史练习只读归一为一个canonical条目，取最早首次触发、最晚命中并合并所有发布者与原文链接，保留原始记录和材料状态。主成员归档后新触发写入有效成员，再按同一身份聚合；无有效成员不写。历史练习不受七日窗口清除，未来成员不回流历史投影。
- 无新Schema、Source、调度、AI调用或UI改动；开发验收不等于生产部署。回退本批代码恢复旧读模型与规则，保留原始Event/Raw/练习审计；AI关系建议、事件中文表达与完整发现质量仍由后续任务验收。

### P4C AI关系建议（实现协议）

- 唯一SYSTEM在Discovery Expansion后、Momentum/材料理解/快照前执行EVENT_RELATION；仅OPC_COLLECTION_EVENT_RELATION=v1启用，默认关闭。页面读取不调用模型。缺既有Gateway配置或关闭思考协议时明确DEFERRED；失败记周期PARTIAL，其他阶段和快照继续。无新Provider、服务、调度或Schema。
- Core在168h活动、非未来/归档Event中选择有共享实体且确定性评分尚未归并的模糊候选。每轮最多10个anchor、每anchor一页40候选；无实体者不占anchor，anchor扫描冷却15分钟，按最久未扫描排序。候选按UUID持久游标推进，走完回绕，不永久卡在前40条；资源上限不是完整覆盖或P95达标证明。
- 每组全部成员均须有效，合计最多8成员；每成员取至多3条有明确SYSTEM Raw及Observation、现役Source、非referenceOnly、非未来的直接原文，文本每条≤2000字符。AI不补采未知链接，不授予Fact/Source资格；输入原文缺日期或跨原发72小时的正向关系不能应用，不用首次收集时间代替原发日期。超限、缺有效成员证据时不截断簇强行判断。
- event-relation@1.0.0独立Skill只输出每一跨组对的SAME_EVENT/SUPPORTING_REPORT/RELATED_EVENT/UNRELATED/UNKNOWN、置信度、具体对象名称、双方Raw/Event引用、逐字片段及理由。Core拒绝漏对/重复/虚构ID或引文、仅品牌/通用词的对象和低置信度；全部跨对为正向且≥0.98才可能应用。UNKNOWN及非合并关系保留审计，不强制归并。
- Core分别检查Event标题及全部输入原文中的对象、版本、独立后续动作和时间。语义路径的显式版本集合存在差异即失败关闭，共用依赖版本不能遮蔽目标版本冲突；此保守规则可能拒绝合法语义合并，不声称完整对象解析。单对建议不能通过传递链吞并互相冲突的簇。关系与逐对引用保存ai_runs，成员归并审计关联run/hash；不覆盖原Event标题、Raw或历史练习。
- ai_runs以任务类型/输入hash作为持久账本，hash包含全部组成员、选用证据、Skill/Prompt/Schema及模型/endpoint/思考协议，排除密钥和扫描水位。组方向稳定、同输入SUCCEEDED（含UNKNOWN/拒绝合并）不重复调用；输入实质变化可重算。聚类同一advisory lock内领取，RUNNING租约15分钟阻止并发；到期记ABANDONED/PROVIDER_OUTCOME_UNKNOWN再重领，失败指数退避1/2/4/8/16/24小时，不能保证供应商exactly-once。
- 事务外单次Gateway请求，temperature=0、关闭思考、max_tokens=2500、≤20秒，无即时修复重试；每周期至多2组、65秒，剩余不足22秒不开新组，无累计金额硬停。调用前落attempt，已返回usage在语义验证前留存；异常/超时无回执保持UNKNOWN，不当作免费或零费用。真实Provider兼容性、精度、资源与费用另行验收。
- 提交重新锁定任务、成员/Event/Raw/Observation/Source，重建完整输入hash并核对租约与开关；标题、证据、成员、来源退出、归档等变更均STALE，不写旧关系。只有Core在同事务中应用映射；原有canonical读模型自行汇总证据/练习，不改变栏目门槛。归并前簇/成员快照保存在run结果供恢复。
- 回退关闭语义开关停止新增请求/归并，保留原记录与审计；已应用映射不会因关闭开关自动拆簇，须根据前映射审计/备份在独立恢复操作中还原。本批未提供自动拆簇命令，不把停开关当成撤销。无UI变更；事件级中文表达见P4D，生产启用事实仅见CURRENT_SYSTEM_FACTS。

### SYSTEM 首次发现时间

- Observation的observedAt仍是最新观察时间；Core独立写入版本化systemDiscoveryReceipt，保存追踪起点、首次SYSTEM观察、可用的Collection Run ID及历史覆盖范围。上游同名字段不能覆盖Core值；冲突更新以数据库当前行保留首次回执，与Raw/Run归属事务一致。
- 新Observation从创建起追踪；旧未追踪记录只记录升级后首次已知观察，首次SYSTEM发现保持UNKNOWN，不从publishedAt/collectedAt/createdAt/最后Observation倒推。一个Raw或同URL的任一来源历史未知时，新来源自己的首次不能消除全系统UNKNOWN。
- 只读漏斗使用可证明首次回执计算时延；重访不能推进首次时间，晚于asOf的重访不抹去先前已知回执。无法证明时不纳入24h时延/召回分母的完整性断言，当前状态与历史asOf配置差异仍明确标注。

### P4E 完整漏斗诊断与输入归属

- 完整漏斗为只读运维诊断，复用现役read-model；参考URL→Raw/明确SYSTEM Observation→直接或扩展Event关联→canonical→可见性→精选/热点/练习→持久快照。扩展关联须通过当前相关性与SYSTEM权限；无关原文不能借同事件其他证据取得入选资格。快照主成员归档但仍有有效成员时保留canonical卡片，全部成员无效才隐藏。
- 同一Source内先逐Raw过滤相关性，再聚合事实权限；SYSTEM Observation必须属于实际事实Raw，不能借另一篇无关文章确认。规则门槛不变，不覆盖原始数据或增加Source身份。
- 冻结参考区分OBSERVED_ONLY和INDEPENDENT；无独立分母/正负标签/完整时间时召回与精度保持UNKNOWN。24h观察未成熟单列，未来资料及负延迟不进入有效时延；Run成功不证明某篇已获取，无Raw且无拒绝回执为ACQUISITION_UNKNOWN。
- 诊断最多500条、31天，单一repeatable-read只读事务与45秒statement timeout；Raw/Run超过读取上限明确失败，不静默截断。当前配置投影不能还原历史状态，也不证明代码已部署。快照缺失可能是排名/容量/刷新，过期单列，不自动判漏报。同样本比较强制参考、标签与asOf一致，不把报道数当独立事件数。
- 不新增UI、Schema、调度、模型调用或人工逐条Gate。发现优质源缺口仍走原Source准入链；诊断不能注册Source、放宽栏目门槛或授予Fact权威。生产启用及质量达标另行验收。

### P4F 整体验收与发布准备

- 工程回归、发布条件和真实内容质量分别判定；开发PG/mock、冻结工程关系对或持久旧快照不能替代独立发现/栏目标签、真实模型语义质量和资源/连续运行验收。完整阈值与观察窗口仍由优化规格负责，不复制到新规则表。
- 候选必须覆盖未跟踪的新模块/Skill与构建输入；Web/SYSTEM同版，海外Relay按实际协议/代码差异决定是否更新，不因Node变更盲目重发。保护生产Secret与现有唯一timer；准备包不包含环境文件、数据库凭据或构建缓存，不自动启用语义开关。
- 运行账号不因预检需要扩大权限；迁移历史不可读时单列受阻，必要的历史核对使用专用维护连接和只读事务。发布前保留可恢复数据库、配置/PM2与当前release；停止新增AI请求和回退代码均不等于撤销已归并映射或已缓存表达，数据恢复须依据原始审计独立处理。

### P4D canonical事件表达（实现协议）

- event-expression v1为独立版本化Skill，只有titleZh、答案先行summaryZh、whyItMatters、evidenceIds、uncertainties及逐字段原文引用的建议权。Core仍拥有事实、身份、栏目和实践状态；不覆盖Event/Raw原文、不用AI标题聚类、不翻译全文。热点/精选卡片与历史练习只投影同一canonical表达，逐篇报道继续各自展示，原始数据保留。
- SYSTEM在EVENT_RELATION、Momentum、CONTENT_UNDERSTANDING后、RADAR_SNAPSHOT前运行EVENT_EXPRESSION；仅OPC_COLLECTION_EVENT_EXPRESSION=v1启用，默认关闭。每轮扫描最多20锚点，15分钟水位轮转，最多2次调用、65秒阶段、20秒单次、2000输出token、关闭思考；不足22秒不开请求。无新增调度或金额硬停，失败不阻断快照。
- 输入与读取共用同一确定性函数：有效canonical成员的直接Raw，当前启用且由Source Management管理的Source、明确SYSTEM Raw和同Source且不在未来的SYSTEM Observation、当前Source规则为FACT且有确认范围。排除referenceOnly/signalOnly/未知权限；评论及榜单不作事实。沿用168小时有效成员选择，归档primary可保存有效成员的表达，但不复活归档Event。
- 每条最多4000字符、最多8条去重资料；相同文本/权威/范围复述保留最早收集材料及原发布时间，不因重复文章的新发布时间重复调用。不同措辞未做额外语义去重，不承诺同事实所有改写均免调用。完整去重集合指纹覆盖窗口外变化，选用超限时标partial并要求不确定性；输入有传言或无PRIMARY也要求摘要显式待核实。只读投影使用当前事实指纹，不发起AI或写库。
- Core验证Schema、逐字段真实引用、ID精确集合、长度/中文/答案先行、数字与Latin专名、已登记实体、中文金额与常见事件动作、显式v版本保留、教程/实践/官方/传言越权及夸张措辞。传言检测依据被引用材料完整输入片段，不能靠裁剪引用变成已发布。上述有界保护不是任意自然语言语义证明，未知中文专名、复杂否定/矛盾或关系依旧需要真实模型样本评价；未验真实语义质量时不能声称事实正确率达标。
- ai_runs任务EVENT_EXPRESSION的hash包含事实指纹、Skill/Prompt/Schema、模型/endpoint/思考协议，不含密钥。共享聚类事务锁内领取、15分钟租约及1/2/4/8/16/24小时退避，过期RUNNING记ABANDONED。Provider在事务外运行；attempt/usage先记账，缺真实回执为UNKNOWN。提交重新加载成员、原文、Source与Observation，核对canonical身份、成员/标题revision、事实指纹、租约及开关；旧结果记STALE。成功缓存必须重新校验并可恢复当前表达，支持A→B→A且不重调模型。
- 读取只接受当前事实指纹且通过当前Validator的表达，失效/缺失明确ORIGINAL_FALLBACK、GENERATED仅指校验后的AI措辞，不代表事实已认证。回退原始标题/摘要，不借代表文章的旧AI文案冒充事件表达；练习保留originalTitle/originalSummary及原触发状态。关闭开关只停止新请求，当前有效缓存仍可展示；清除表达元数据后重启会复用合法历史缓存，紧急禁显需同版代码回退/独立受控操作，账本保留。


### 栏目算法配置与来源采集观测

- 来源管理「筛选规则」后增加「栏目算法」；复用既有PG配置存储模式，`radar-algorithm-policy-v1`为唯一配置键。默认参数保持当前热点、精选和练习行为；算法实现与参数配置分离，不允许配置任意代码、正则或AI提示改变业务权限。
- 可调整项：热度半衰期、各贡献系数/上限、升温/持续/讨论阈值、持续发布者/活跃日门槛；精选分数、时效与六项总和100%的权重；练习独立发布者数量（不得低于2）；三栏各自正向必要词与排除词。正向词为空不额外限制，非空至少命中一个，排除词优先；拉丁单词按词边界匹配。栏目词表不改变采集入口筛选与已存Raw。
- 七日窗口、事实/来源权威、事件关联、工具主题及共享材料验证继续为固定Core边界；配置不能关闭这些要求。完整评分的固定分项由现有算法计算，不宣称全部逻辑均可任意编辑。
- 管理员保存必须通过完整Schema、范围、权重及版本校验；事务锁+expectedRevision拒绝并发旧版本覆盖，同事务保存前后配置及审计。恢复默认属于新的配置版本，不删除原始数据或审计。不新增逐源/事件人工Gate。
- 同一Radar快照读取同一不可变配置版本，热点/精选/练习判定和快照记录algorithmRevision；历史诊断使用当前配置时必须记录版本，不冒充历史配置回放。保存不在HTTP请求中启动采集或AI；下一次SYSTEM快照生效，管理页区分保存版本与最近快照版本。
- 来源→采集图表置于发现覆盖/来源目录双栏下方；7/14/30天按北京时间归日，截至实际asOf，今日为未结束日。统计当前目录正式SYSTEM运行（含停用来源过去运行），排除资格探测、回填、非SYSTEM与已排除的过期恢复；不包含已归档/退出目录来源，不冒充全部历史源。
- 接收、新增Raw、重复为运行账本计数；成功率分母为已结束Run，运行中独列；耗时为有有效finishedAt的运行平均值。逐日趋势、来源贡献、失败代码与原始汇总来自同一只读事务，零分母为未知；不是独立事件转化漏斗、全局去重率、全网发现召回率或栏目质量验收。
- 页面与API沿用管理员权限，无模型调用、Provider采购、新调度或生产自动发布。新增界面完成后须真实体验及明确用户确认；工程通过与USER_APPROVED分开记录。

配置生效边界：保存只写配置，不调用采集、AI或HTTP快照重算；实时诊断读模型使用已保存配置，热点追踪CURRENT快照在下一次SYSTEM刷新时整体采用同一revision。配置页明确区分保存版本与最近快照版本。热点正负词只扫描七日内且未被多新闻汇总Gate排除的原文，过期或不合格汇总不得影响当前词表资格。

### 来源采集频率

来源管理「栏目算法」后提供「采集频率」，单来源或批量修改当前目录来源，基础间隔5–1440整数分钟。Source.metadata.collectionSchedule为运营覆盖值唯一owner（版本、revision、intervalMinutes、updatedAt），优先于既有legacy间隔；没有覆盖时保持原默认/配置解析。批量只修改提交中的当前来源，不改变未来新来源默认值。配置不修改身份、Route、启用或资格；seed与Runner必须保留该覆盖字段。

保存按Source ID固定顺序锁行，完整批次先校验目标/Schema/expectedRevision，再同事务写覆盖值和逐Source审计；并发旧版本返回409，批量任一失败全部回滚。SYSTEM后续到期查询直接读取覆盖值，不缓存、不要求Web重启、不由HTTP触发采集。新间隔从最近正式SYSTEM Run.startedAt重新计算，调短后已到期将在下一周期入选；调长后继续等待，当前任务不取消。

频率是最短基础间隔，治理降频/配额/未完成周期仍可延后。页面展示基础间隔、有效间隔、正式最近Run及预计到期，停用来源不自动恢复。频率水位仅SYSTEM正式Run：排除资格探测（含历史SOURCE_QUALIFICATION及冒号后缀runKind）、回填、非SYSTEM、已排除的过期恢复与未来开始时间；探测/回填意图在RUNNING创建时即持久化，失败也不得污染正式水位。

唯一opc-collection.timer候选模板使用每分钟calendar tick与1秒精度，现有SYSTEM锁和两路有限并发不变；周期未结束时不启动并行副本，到期在后续tick追赶，不补跑每个错过的间隔。实际运行配置以CURRENT_SYSTEM_FACTS为准；本轮未发布生产，不把候选模板宣称为生产生效。配置页刷新不是调度器，不新增浏览器定时采集或第二任务主链。

### Radar列表与完整详情读取边界

- 页面快照及历史列表使用listing投影：复用compact事件引用去重，去除未在列表消费的story/内部诊断，保留搜索摘要、来源链接、证据与列表展示字段。完整持久快照及原API不被改写。
- 展开事件后按eventId读取完整story与报道时间线；管理员鉴权、非法ID400、不存在404，历史day/asOf沿用七日校验。详情按快照generatedAt隔离缓存，同事件请求合并；刷新时已展开事件重新读取，失败可重试。
- 同一机构Source的不同署名不增加独立参与者；Creator保留原作者身份，聚合转发继续按原发布者归一。负载和响应耗时仅记录实际观测，不承诺未经测量的P95。
