# Source → Radar Autonomous Development Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按已认可规格修复发现缺口，并在唯一 SYSTEM 中逐步加入机器准入与关键节点 AI。

**Architecture:** Source/Core 拥有身份、路由和状态，材料确定性落库后进行异步辅助。依次完成可独立验证的 P0–P4，不降低栏目资格、不改变已批准 UI。

**Tech Stack:** Next.js 15 / Node 20 / TypeScript / Drizzle / PostgreSQL / Deno Relay。

**Spec:** [优化规格](../research/2026-10-16-source-hot-tracking-autonomous-optimization.md)。用户已于本轮明确开始开发；沿用无需额外确认的授权，在本会话执行，不部署生产。

## Global Constraints

- 唯一 SYSTEM timer、PG 和 Source Owner；保留工作区原有快照压缩改动。
- 不做全文翻译；不设金额硬上限；请求范围、并发、超时、失败退避仍有界。
- AI不授予事实/热点/精选/练习资格，不发布正式内容；UI与课程保持冻结。
- 各阶段先行为测试 RED，再实现 GREEN；完成后 typecheck/build/相关全回归。

## Review Focus

- 缺教程的事件不能依赖已有练习资格才搜索；单源官方种子不等于多人热点。
- 纯Signal与原始发布者资格分开，显式空发布者集合不能回退热度集合。
- 普通扩展不能刷新实践搜索冷却；失败和成功冷却不同，未来/无效时间失败关闭。
- 重复轮询/重启/旧AI结果不能制造重复调用或覆盖新revision。
- 所有暂时故障有明确原因，其他来源与快照继续，整体不伪报成功。

## Decision Brief

Task ID: SOURCE-RADAR-AUTONOMOUS-DEVELOPMENT-20261016。
Role/Surface: 管理员，来源管理→热点追踪；UI KEEP。
Problem/Why Now: 用户已授权按规格开发，已定位搜索自锁、身份口径及冷却污染。
Scope: P0补证修复→P1来源增量→P2异步AI→P3发现增强→P4模糊聚类。
Code/AI/Skill/Workflow/Human: 分工见规格§1/6；当前P0纯代码，后续语义任务必须Schema和原文依据，运营无逐项审批。
Data: Source/Raw/Event/ExpansionRun及各自metadata；必要Schema先审计再最小迁移。
Entitlement: 仅SYSTEM/现有管理员Core；不扩大普通用户权限。
Side Effects: 本地开发/测试；未授权本轮自动部署/采购。
Options/Recommendation: 修复现有主链；不另建服务，不放宽栏目门槛。
Validation/Acceptance: 各任务行为断言、相关回归、typecheck/build；效果指标另需固定真值集与持续观察，不能用单测代替。
Rollback: 代码阶段可独立回退；metadata增量可忽略，保留原始数据与审计。
Owners: 原采集合同、实现映射、PROJECT_STATUS/TASKS；不写入虚假的生产事实。

## Task 1 — P0 发布者、补证入口与冷却

Files: `ai-hotspot-practice.ts`、`intelligence-read-model.ts`、`collection-expansion.ts`、新增同领域 `practice-discovery-policy.ts`、`scripts/validate-practice-discovery-policy.ts`、相关合同与回归入口。
Interfaces: `aiHotspotPracticePublishers(candidate)`；`practiceDiscoveryDecision(candidate, checkpoint, now)`；搜索checkpoint独立存Event.metadata，search run记录purpose。

- [x] 写行为测试：两报道无教程仍可搜索；单源重要官方可搜索但不进入练习；空原文发布者集合不回退；同机构别名去重；材料齐备停止；成功6h/失败1h/运行lease冷却；普通扩展不影响搜索；aging公平。
- [x] 运行新增测试确认RED；实现共享身份/独立搜索决策。
- [x] 接入候选读取、SYSTEM执行、持久checkpoint和Run metadata；保留来源opt-in与未知route失败关闭。
- [x] 跑相关行为/边界回归，修正旧约束说明；不将真实效果指标标为已通过。

## Task 2 — P1 来源与增量

Files: `collection-runner.ts`、`source-acquisition-runtime-adapters.ts`、`source-onboarding.ts`、`source-qualification*.ts`、现有Source配置/材料补全owner；必要的新小模块归这些owner。
Interfaces: 条件请求回执和成功提交后checkpoint；机器准入仅CONDITIONAL，成熟资格仍复用现有checkpoint。

- [x] 原生Feed：审计fetch/Relay和持久化路径；304/空Feed/HTML200/DTD/畸形条目/101条截断行为测试；开发库Raw提交失败不推进ETag、304持久化通过。
- [x] 公平材料队列：到期FIFO+站点轮转+分页扫描+跨页站点退避，第一页500条不可处理不挡后续材料。
- [ ] API游标/有界重叠回扫及watchlist覆盖；Relay与AIHOT快照条件请求/稳定ID边界已完成Task2C，无覆盖出口不假装已可采。
- [ ] 完成机器准入/可逆治理；写归档不复活/未知route失败关闭测试，补真实watchlist缺口。
- [x] 运行Source/Runner/Qualification/材料回归（仅证明本批实现，不代表机器准入已实现）。

### Task 2B — Machine admission Decision Brief（2026-10-16）

Task ID: SOURCE-AUTOMATIC-ADMISSION-P1。角色/产品面：SYSTEM actor，来源管理；UI KEEP。
目标：真实Raw原文页面中已观察到的同站主页链接→固定公开Relay探测→复用onboarding条件注册；无逐项人工审批。Source仍唯一拥有身份与资格，Raw只保存其发现链/尝试状态。
Must Know：onboarding、Raw/Source Schema、固定Relay能力、资格checkpoint和SYSTEM锁；不加载课程/日报生成/UI历史。
本批范围：自动准入Core、Raw持久checkpoint/重试/租约、有界SYSTEM阶段；已支持Relay站点先启用，其他站点明确ROUTE_UNAVAILABLE，不开放任意HTTP/代理。网站身份与作者身份不混认，不把文章路径当长期Source。
分工：Code校验真实链接、日期、可执行Route、去重、写库/审计与成熟资格；AI/Skill不参与准入；现有SYSTEM串行领取；Human不新增审批。
输入/写入：现役Source下7日Raw原文URL/元数据；仅更新Raw.sourceAdmission、登记Source/审计。无Schema迁移、无采购、无生产部署。
推荐：复用既有onboarding事务锁与Qualification，自动模式禁止恢复任何归档/禁用/旧人工记录；明确Feed Route重复同一Source。修复当前资格窗口混用旧checkpoint Run的缺陷后才允许自然成熟。
技术边界：每周期最多2条Raw、65秒阶段预算，剩余不足35秒不开新探测；单次探测沿30秒网络预算，租约15分钟，失败指数退避至24小时。固定Relay无能力时只记缺口。
验收：真实链接/同域主页/日期/未知路由/归档/并发重复/旧checkpoint/失败重试/时间片行为用例；开发库事务查重与审计/状态持久化；相关回归、typecheck/build。模拟上游验收与真实上游可达分开记录。
回滚：OPC_COLLECTION_SOURCE_ADMISSION=off停新准入，保留已注册Source与审计；不删除事实。Owner：采集合同与实现映射；生产事实不变。

- [x] RED→GREEN：页面真实主页链接、候选时间、拒绝直接文章注册、未知Relay、不恢复禁用Source、重试/租约/预算。
- [x] 复用onboarding自动模式、原子去重/审计；Raw持久尝试与唯一SYSTEM接入。
- [x] current checkpoint Run独立计算成熟资格，不能以1条新Run借4条旧Run晋级。
- [x] 开发库集成、独立复核、相关回归/typecheck/build、owner同步。

### Task 2C — Relay/API incremental Decision Brief（2026-10-16）

Task ID: SOURCE-INCREMENTAL-TRANSPORT-P1。角色/产品面：SYSTEM / 来源管理；UI KEEP。
Must Know：固定Relay请求/响应、Feed checkpoint提交、AIHOT Adapter与Source Route；不加载课程或内容发布历史。
目标/推荐：打通现有固定Relay Feed的ETag/Last-Modified及304；为已有AIHOT JSON快照提供条件请求与稳定ID验收。无分页协议的API不伪造cursor；GitHub趋势不是Release历史水位。
分工：Core确定性校验Header、响应、Route身份、容量及事务checkpoint；Workflow仍为唯一SYSTEM；AI/Skill/Human不参与新增审批。
边界：不新增Provider/任意代理/调度/Schema，不联网收费或部署；Relay向后兼容旧200回执，只有显式条件协议才接受304。重定向后不转发初始URL的validator。
写入：已有Source/Run的route隔离Feed/API checkpoint；只在材料持久化和成功Run事务提交后推进，截断/回填/qualification不推进。API仍为有界快照，保留覆盖缺口。
验收：Node→真实Relay handler→模拟上游的200/304闭环、非法validator/意外304/跳转/超时/旧Relay兼容；JSON空列表/非法格式/稳定ID/截断；开发库事务回滚、304持久化、相关回归/typecheck/build和独立复核。
回滚：回退同版Node/Relay；保留checkpoint与原始审计。Owner：采集合同/实现映射；生产事实不变。

- [x] Relay条件回执RED→GREEN与Node集成。
- [x] 既有AIHOT API条件快照、稳定ID与容量边界RED→GREEN。
- [x] 开发库事务验收、独立复核、回归/typecheck/build及owner同步。

### Task 2D — Watchlist / fixed Feed routes Decision Brief（2026-10-16）

Task ID: SOURCE-WATCHLIST-FIXED-ROUTES-P1。管理员/SYSTEM，来源管理→热点追踪；UI KEEP。
Must Know：现役Source目录、portfolio、固定Relay、身份/Route边界、seed与资格；不加载课程/发布历史。
目标：四组watchlist只引用现有Source，报告未覆盖对象；给重要现役Feed补固定海外出口，不新建第二Source或调度。修复seed重新启用停用/归档记录的风险。
分工：Core匹配身份/Route、目录只读诊断、白名单与状态保护；Relay仅获取；AI/Skill不参与；不新增Human审批。
边界：本批不把候选自动变成官方Source、不授予资格、不部署；不开放任意域/任意路径或跨域重定向。新出口只匹配明确Feed URL，Deno能力开关须先验证；无凭据/旧版本明确不可用，不偷偷直连。
方案/理由：同一Source通过传输策略使用Relay，Feed正文/条件请求继续复用；watchlist分组是Source配置投影，缺口与采集健康分开，配置存在不等于可达。
Validation/Acceptance：四组分类/重复身份/停用保护/精确URL与重定向边界RED→GREEN；开发库只读目录诊断与临时夹具；Node→Relay→上游mock及有界真实公开Feed探测分别记录，失败不冒充覆盖；回归/typecheck/build和独立复核。
Rollback：关闭OPC_COLLECTION_WATCHLIST_FEEDS=v1即可停止新出口（新出口失败关闭）；回退同版代码，无需删除Raw/审计；旧固定文档路由保持。Owner：采集合同/映射、TASKS与PROJECT_STATUS。

- [x] watchlist/seed保护与固定Feed出口RED→GREEN。
- [x] 目录诊断、可重复探测、运行与回滚边界接入。
- [x] 独立复核、66项quick回归/typecheck、build、Owner同步；真实线上效果未验收。

### Task 2E — GitHub Release pagination Decision Brief（2026-10-16）

Task ID: SOURCE-GITHUB-RELEASE-PAGINATION-P1。Goal：为明确仓库Release补可持续有界分页，避免Atom网络缺口和单页截断。Role/Surface：SYSTEM/来源管理→热点追踪，UI KEEP。
Must Know：已有Acquisition Plan、Runner/Raw去重、Source checkpoint、Deno固定出口；Nice to Know：实时源样本；Do Not Load：课程/旧Manual/历史发布过程。
In Scope：固定仓库Release API白名单、显式GITHUB_RELEASES Route适配器、首页重扫/前页重叠/持久续页及Raw成功后提交、完整性回执/限流错误；Out of Scope：恢复归档Source、授予官方权威、通用GitHub代理/搜索、修改AIHOT分页假设、生产部署。
分工：Core拥有URL校验、分页计划、Schema/归一、持久水位与状态；Relay只fetch；AI/Skill不参与；Human无需新增审批。唯一SYSTEM/PG/现有Source权限保持。
Data：读取Source显式Route与分页checkpoint，写现有Raw/Observation/Run及Source.metadata；无Schema迁移。External Side Effect仅公开GET/开发库独有验收夹具，不采购或发布。
Options：纯单页不能覆盖；按published_at提前停止无排序保证；选择每轮首页+上一页重叠+有界向后续页，稳定Release ID去重。GitHub官方文档确认page/per_page，未声明since，不能伪造时间游标：https://docs.github.com/en/rest/releases/releases#list-releases 。页码变动仍不能证明历史完整，回执明确该限制。
Acceptance：固定仓库/路径/页码/重定向拒绝、首轮多页/重启续页/新头部插入/重复ID/空页/非法结构/Link/429/超时/页限、Run失败不推进、回填/资格不推进及route隔离；纯测试RED→GREEN，开发库模拟链路与真实公开小样分开，完整采集回归/typecheck/build与独立review。
Rollback：移除显式GITHUB_RELEASES Route或关闭OPC_COLLECTION_GITHUB_RELEASES=v1停止新API；同版代码回退，保留Raw/审计，其他Source不变。Owner：采集合同/映射、Relay部署说明、TASKS/PROJECT_STATUS。

- [x] 固定API与分页策略/归一RED→GREEN。
- [x] 接入Relay/Runner/事务checkpoint，开发库与有界公开样本验证。
- [x] 67项quick回归/typecheck、build/独立复核与owner同步；不宣称生产覆盖。

## Task 3 — P2 异步材料理解

Decision Brief：SOURCE-MATERIAL-UNDERSTANDING-P2，SYSTEM/管理员，来源管理→热点追踪；UI KEEP。P1剩余不可用Feed/其他API保留缺口，不阻塞独立的材料理解能力；本批不声称P1完整覆盖。
Goal/Why：复用现有理解Validator，去除实际全文翻译调用，并将同步重写metadata改为持久任务/租约/原文revision保护。Must Know：Raw/Source、ai_runs、理解Validator与共享Gateway、SYSTEM锁；不加载课程内容/历史Manual。
In Scope：现有Raw.metadata的版本化job、inputHash含材料/来源/模型/提示版本、失败退避/租约、ai_runs用量、有限修复与原子提交；Out of Scope：全文翻译、AI事实权/栏目晋级、发布、UI/Schema迁移或生产部署。
分工：Core负责选取/锁/校验/CAS/写库；语义Skill仅按版本Schema生成理解；Workflow复用唯一SYSTEM且采集优先；Human无新增审批。没有Provider配置或明确思考控制映射时返回DEFERRED，不偷偷按Provider默认调用。
推荐：复用Raw持久状态与ai_runs，无新增队列服务或调度；共享Gateway仅增加显式调用选项与usage回执，旧调用默认行为不变。请求超时后远端是否计费不可确定，允许租约到期重试但不宣称exactly-once。
Writes：独有job/理解JSON路径及ai_runs，不覆盖其他metadata，不写Event/Source资格。External：仅既有已配置Provider，验收用mock，无采购或真实付费调用。
Acceptance：无翻译/显式输出上限与思考选项/usage缺失未知、失败用量保留、重复与并发不重调、原文变化/旧租约拒绝、其他metadata保留、失败退避/有界扫描与时间片、无配置无调用；开发库同锁夹具+Gateway/采集/学习洞察回归/typecheck/build与独立review。
Rollback：OPC_COLLECTION_CONTENT_UNDERSTANDING=off停自动阶段，同版回退；Raw/ai_runs审计保留，既有v2理解可读。Owner：采集合同/实现映射、PROJECT_STATUS/TASKS。

Files: `configured-chat.ts`、`content-understanding-enrichment.ts`、`run-server-native-automatic-cycle.ts`、既有ai_runs/持久任务Core及Validator。
Interfaces: 显式thinking/输出上限/usage；任务键含inputHash和版本；原子revision CAS；翻译不参与自动理解。

- [x] 写usage计量、无翻译请求、AI失败不阻塞采集、重复不重调、旧revision不覆盖、时间片停止的RED测试。
- [x] 复用既有理解/Schema，拆翻译，接同SYSTEM有界后台阶段；记录可解释状态和AI Run，不设金额硬停。
- [x] 运行AI/采集边界/学习洞察Gateway回归，防止共享Adapter改变其他任务默认行为。

## Task 4 — P3 源头发现与补证增强

Files: 现有Source discovery/onboarding、search-discovery、event-expansion及Deno白名单owner。
Interfaces: 候选必须来自真实链接，先探测后注册；一主搜索/有限备用，目的独立、无新增停止、周期checkpoint。

- [ ] 按已实现通用Family逐个接官方/仓库/作者候选；已存在身份只补Route。
- [ ] 测固定来源/原始URL、限定路径/页数、请求去重、无新增停止与Provider不可用回退。
- [ ] 凭据/回调/未验收海外路由缺失时真实标记UNAVAILABLE，不绕过资格或创建假Source。

### Task 4A — 受管实践搜索可持续执行 Decision Brief

Task ID: MANAGED-PRACTICE-QUERY-PLAN-P3A。Role/Surface：SYSTEM/管理员，来源管理→热点追踪，UI KEEP。
Goal/Problem：现有单来源/两查询没有持久请求去重、跨周期总量或无新增停止，失败也没有现役备用切换。先补可持续请求主链，再扩通用Provider与新源Family。
Must Know：Event Expansion、受管Source opt-in/资格/健康、现有query plan及ExpansionRun；Nice：真实上游样本；Do Not Load：课程/旧Manual/历史发布。
In Scope：现有B站/YouTube真实路由；一个主来源+至多一个不同Provider备用；每轮3请求/每Event滚动24h最多6；同计划成功查询去重、连续2完成查询无新增已接受参考即停止；请求Run在事务内领取，持久记录可重启，失败/运行租约及来源停用保护。
Out of Scope：通用搜索采购/新Key、任意URL正文代理、推送/爬虫、新来源身份/资格晋级、ORIGINAL/INDEPENDENT新目的、AI查询改写、生产部署/UI/Schema。P3整体继续分批，不把该单元等同完整源头覆盖。
分工：Code负责计划键/查询去重/原子预算/状态/校验；AI/Skill本批不参与；Workflow复用SYSTEM与Event Expansion；Human无新增审批。Data Read/Write：现有Event/Source/ExpansionRun，Raw仍由已有ingest链写入。Entitlement沿现役管理员/SYSTEM；External仅既有公开搜索路由，验收mock，开发库仅独有夹具。
Options/Recommendation：复用ExpansionRun作为请求账本、Event行锁串行领取，不新增队列/预算表；选择依据为可持久恢复且不复制事实。预算覆盖失败/超时/RUNNING，新输入不能绕过24h上限；未知结果允许租约到期受限重试，不宣称exactly-once。
Acceptance：三/六上限、重复/重启、失败退避与过期租约、两空停止及计划变化、单主单备共享预算、成功空不fanout、无配置/停用失败关闭；纯行为RED→GREEN、开发库真实PG领取并发/回滚、相关全回归/typecheck/build、独立review。新增参考不冒充独立事实/完整教程，统计含义明确。
Rollback：OPC_COLLECTION_MANAGED_SEARCH=off只停止自动搜索，既有采集/证据刷新继续；同版回退保留Run/Raw审计。Owner：采集合同/实现映射、执行计划及TASKS/PROJECT_STATUS。

- [x] 持久查询计划/预算/停止策略及受管来源主备行为RED→GREEN。
- [x] 已接入唯一SYSTEM；开发库事务/并发/回滚夹具验收通过。
- [x] 全回归/typecheck/build、复核与owner同步。
- Ruling: P3先完成现役搜索的可靠性单元P3A，通用搜索/新源Family、原文验证与推送另列后续 — 现役路由可独立验收且不引入未经验证Provider — 本批不承诺新增源数量或覆盖率。

## Task 4B — P3B 通用网页搜索路由

Decision Brief（2026-10-16）：角色为管理员/SYSTEM；Product Surface为来源管理→热点追踪，UI KEEP。目标是补充B站/YouTube以外的跨站实践线索，复用P3A账本和唯一SYSTEM，不新增持续关键词扫描主链。
Must Know：受管搜索资格、明确Route、ExpansionRun预算、Deno固定Provider；Nice：真实查询小样；Do Not Load：课程/旧Manual/历史任务。
推荐Brave Search API：官方GET接口、结构化web.results及服务端Key认证适合有界适配；协议依据[官方文档](https://api-dashboard.search.brave.com/app/documentation/web-search/get-started)。本批不采购、不创建Key、不调用付费接口，不承诺中文覆盖/召回率或真实费用。
分工：Code负责固定接口/解析/限额/失败关闭/引用；Workflow复用现役Event Expansion及P3A账本；AI/Skill不参与本批；Human无新增逐项确认。Key仅在Deno环境；Node仅持非Secret版本开关和现有Relay连接。配置不等于健康，登记仍需有界真实探测；来源归档/停用意图保留。
范围：一个固定Provider、单页offset=0、每查询最多5条、freshness=pw；后者为上游发现过滤，不保证原文日期，搜索片段publishedAt=null。结果不授予Fact/独立参与者/完整实践材料权威；不抓任意正文，不扩展ORIGINAL/INDEPENDENT目的，不修改UI/Schema/课程。
Validation/Acceptance：RED→GREEN的Node→Relay→模拟上游协议验证；缺开关/缺Key不请求，固定目标/认证Header/禁止重定向、429/非法结构/容量/合法空结果、危险URL及去重、片段/日期边界；受管接线沿P3A真实PG验收；回归/typecheck/build及独立review。真实服务质量和生产效果保持未验收。
Rollback：关闭OPC_COLLECTION_BRAVE_SEARCH或同版回退；不删Run/Raw审计。Owner：采集合同、实现映射、Relay部署手册、TASKS/PROJECT_STATUS。

- [x] 固定Relay/共享解析、受管Source登记与SYSTEM接线。
- [x] 协议/边界及开发库夹具验收。
- [x] 回归/typecheck/build、独立复核与owner同步。
- Ruling: P3B先接单个成熟通用搜索接口，保持显式登记与条件资格 — 避免在缺真实Key时伪称已扩源 — 代价是本批不能验证真实覆盖和新增内容量。

## Task 4C — P3C 固定源头正文与无日期参考补证

Decision Brief（2026-10-16）：SYSTEM/管理员，来源管理→热点追踪，UI KEEP。Problem：受管搜索参考publishedAt=null，被仅接受已发布日期的正文队列过滤；固定正文范围也未覆盖Hugging Face博客与Simon/TIL。Why Now：P3B可发现线索，需要闭合到已有材料补证，避免停留于片段。
Must Know：Raw/Source/Event、正文队列/收据与静态提取、固定Deno路由；Nice：公开Feed/文章小样；Do Not Load：课程/旧Manual/历史执行。
Scope：复用唯一SYSTEM材料阶段，保留原有已日期队列；无日期候选仅限最近7日收集、明确PENDING_SOURCE_REVIEW实践参考且关联≤168h非未来/非归档Event，过期关联不入队；不以收集日替代发布日期。增加固定Hugging Face博客文章、Simon日期文章与TIL文章路径，精确域名/路径/无查询凭证/禁重定向/流式容量；来源只消费已有Raw，不新建或恢复Source。
Code负责确定性选择/去重/站点退避、静态正文提取、收据与输入revision/来源现役复核；AI/Skill本批不参与；Workflow复用既有SYSTEM；Human无新增审批。读Raw/Source/Event，写Raw材料字段/重试回执和现有Audit，不改Event日期/Source资格/发布/Schema/UI。外部仅匿名公开页面，验收mock；有界公开只读小样与真实PG开发夹具，无付费请求。
Options/Recommendation：优先打通既有材料队列与固定路径，复用Readability和Relay；拒绝任意URL代理、浏览器常驻或把搜索片段当全文。材料本身旧/无日期不授予新事件权威；需要附件而未核验仍不通过完整实践门槛。
Acceptance：RED→GREEN证明无日期关联可补证/无关联及过期/归档/未来/停用不能入队，保留日期队列；固定路径/越权URL/重定向/容量失败，真实提取/正文收据/仍缺附件；提交前URL/hash/来源变化拒绝旧结果，保留其他metadata；开发库SYSTEM同锁+mock验证队列SQL/补证/回执/清理；全回归/typecheck/build与独立review。真实生产增量、所有站点/附件/字幕覆盖不在本批结论中。
Rollback：同版回退正文路由/队列逻辑，保留Raw/Audit；不增加Source、任务调度或独立关闭开关。Owner：采集合同/映射、Relay部署手册、TASKS/PROJECT_STATUS。

- [x] 固定正文路由与受管无日期候选桥接。
- [x] 输入变更/资格保护及开发库验收。
- [x] 回归/typecheck/build、独立复核与owner同步。
- Ruling: 本批先补“发现→正文”断链与三个固定路径Family，不批量登记来源 — 新增身份需要独立持续采集证明 — 代价是本批不承诺新增Source数量或全站覆盖。

## Task 4D — P3D 现役Feed固定迁移出口修复

Decision Brief（2026-10-16）：SYSTEM/管理员，来源管理→热点追踪，UI KEEP。Problem：LangChain现役旧Feed已迁移，固定Relay禁止重定向造成可用内容遗漏。已只读复核官方新地址https://www.langchain.com/blog/rss.xml返回200、100条带日期Feed项目；仅为当前快照，不是完整历史或持续健康证明。
Must Know：watchlist固定传输策略、Node/Deno条件回执、Source/Route checkpoint与唯一SYSTEM；Nice：真实上游小样；Do Not Load：课程、旧Manual与历史任务。
Scope：共享策略仅声明一个经验证的旧→新精确URL映射，同Source身份；Deno直接请求固定新目标，不运行通用重定向。Node与Relay双重丢弃旧URI条件Header，响应明确有效URI/映射版本，旧Route不接收新URI validator或跨URI304。直接声明新URL的Route正常独立200→304；不修改Source目录/状态/既有配置，不seed或新建Source。其他源既有路径保持；未知迁移继续明确不可用。
分工：Code负责固定映射/验证/URI作用域/错误；AI/Skill不参与；Workflow沿唯一SYSTEM与现有主备/原子checkpoint；Human无新增审批。读现有Source与回执，运行只写现有Run/Raw/checkpoint；验收仅开发库独有夹具、真实PG+mock上游。外部仅公开只读探测，不采购/AI/付费调用、UI/Schema或生产部署。
Options/Recommendation：固定已验证目标映射，避免自动跟随任意Location或改写身份；不把同上游地址别名当独立备用。旧Route每次无条件读取是保守成本；需要条件请求时可在原Source显式配置新URI，不自动覆盖operator配置。
Acceptance：RED→GREEN验证旧地址仅请求固定新地址、非法query/凭证/域名/未知目标拒绝、不跟随302、429/错误格式/跨URI304失败；旧validator不转发/不回存、新URI条件读取独立、零条有效Feed不触发备用；开发库同SYSTEM锁，真实PG+mock证明Route隔离、失败不推进、已有Source身份/状态不改、重复不造Raw；相关回归/typecheck/build与独立review。
Rollback：同版回退Node/Relay与共享文件，保留Raw/Run/checkpoint；旧路由可能再次不可用需明确报告，不恢复身份或打开HTTP旁路。Owner：采集合同/映射、Relay部署手册、TASKS/PROJECT_STATUS。

- [x] 固定迁移映射与条件回执边界。
- [x] 开发库Route/失败/增量验收。
- [x] 回归/typecheck/build、独立复核与owner同步。
- 验证（2026-10-16）：旧URI请求在实现前RED，固定映射后GREEN；纯mock覆盖旧Relay/伪requestedUrl/跨URI304拒绝、直连新URI条件200→304及302/429/格式/URL反例。真实开发PG+mock通过，含独有Raw URL/标题触发真实写入失败不推进checkpoint、重复去重、双Route隔离和finally清理；最初夹具被正常URL/标题去重，已纠正，不改生产规则。73项quick含typecheck及独立build通过，独立只读review无问题。
- 公开只读快照：固定新URL直接200、100条带日期项目、78616 UTF8字节、未观察ETag；不等于完整历史、真实304或远端Deno/Tencent连通。NOT_DEPLOYED，未新增/恢复Source或调用AI/付费服务。源头持续资格、其他不可用/截断Feed与独立备用仍待后续。
- Ruling: 本批只修实测LangChain地址迁移，不泛化未知源重定向或把别名计作独立备用 — 保持唯一身份与经过验证的出口 — 代价是其他源与真实备用覆盖仍待逐项核验。

## Task 4E — P3E 当前采集资格证据取样修复

Decision Brief（2026-10-16）：SYSTEM/管理员，来源管理→热点追踪，UI KEEP。Goal/Why：当前checkpoint记录在截取5/12条之后才筛选，旧checkpoint/资格预览/其他运行可挤掉有效样本，导致成熟度不足或连续失败被漏算。公开只读Feed探测作为背景，不授予资格。
Must Know：当前checkpoint、SYSTEM生产Run、资格SQL窗口与运行退化；Nice：公开Feed可达性；Do Not Load：课程、历史Manual、旧任务过程。
Scope：在取样/数据库排名之前按当前checkpoint、runtime版本、SYSTEM、非qualificationOnly、非staleRecovery排除、终态与180日/非未来过滤；保持每Source最多12条payload、成熟度最近5条和运行退化最近6条。复用单一SQL证据谓词及既有Source Owner，不增新调度/资格状态/Source。Out：传输版本重认证、门槛调整、自动恢复停用、Feed新迁移、UI/Schema/生产部署。
分工：Code拥有选择/状态/校验；AI/Skill不参与；Workflow仍唯一SYSTEM；Human无新增Gate。Read Source/Run，写既有runtimeQualification；仅开发库独有夹具写入和清理，不触真实Source。无新增权益/采购或付费请求。
Recommendation：先过滤再有界取样，SQL与纯函数同口径；不扩大扫描payload或降低成熟度门槛。代价：旧checkpoint成功不再充数，可能需要当前真实运行积累；同一checkpoint的真实连续失败不可被测试记录掩盖。
Acceptance：交错旧checkpoint/旧runtime/资格测试/非SYSTEM/未来/过期/排除恢复记录的RED→GREEN；仅1条当前成功仍不足，5条当前合格可成熟；6次当前失败被12条噪声包围仍DISABLED，失败后真实成功遵原恢复规则；开发库同SYSTEM锁真实PG，无网络调用、finally清理；修正既有只读DB对照验收使之比较当前口径，回归/typecheck/build/独立复核。
Rollback：同版代码回退，保留Run审计；无Schema/Source迁移，运行资格仍可由现役Core重算。Owner：采集合同/实现映射、TASKS/PROJECT_STATUS、当前计划。

- [x] 纯选择与SQL有界证据过滤RED→GREEN。
- [x] 开发库真实资格/退化与噪声隔离验收。
- [x] 全量相关回归/typecheck/build、独立review与owner同步。
- 验证（2026-10-16）：纯选择RED为0≠5，实现后GREEN；开发库真实PG同锁夹具验证13条旧checkpoint及旧runtime/非SYSTEM/测试/恢复排除/未来/过期噪声不挤占当前记录，1条不足、5条可成熟，6次失败真实DISABLED且新成功不绕过既有recertification。无上游请求，finally清理。现役43个来源1244条最小证据投影与新查询对照通过；该次qualificationReadMs=34523含远端读取，不作性能改善承诺。
- 74项quick含typecheck与独立build通过；首轮quick仅旧静态结构断言依赖已替换的inArray语句，已改为检查共享证据谓词并全绿。独立review无正确性阻断问题。未部署、未改真实Source状态、未采购或付费调用。
- 公开只读探测：Qwen、n8n、BAIR分别200/44、15、10条；Ollama、Latent Space、Machine Learning Mastery分别200/60、20、10条。仅当前公开Feed小样，非Deno/Tencent路径、持续健康或新增生产内容证明。
- Final: minor (deferred): 增加同时两个Source及接近180日边界的专项PG夹具；现有单Source噪声夹具、低频纯选择回归与43源真实只读对照已通过，专项覆盖后补。
- Ruling：本批只修证据选择顺序，不因公开单次Feed200或固定迁移而自动恢复资格；持续采集结论仍须真实SYSTEM记录，代价是部分源继续待观察。

## Task 4F — P3F Hamel固定作者Feed与源头准入

Decision Brief（2026-10-16）：SYSTEM/管理员，来源管理→热点追踪，UI KEEP。Goal：补AI评测/实测作者源头。实际公开主页声明index.xml，Feed与文章返回200且有真实日期；文章观察到../../../index.html首页链接，当前根路径限定无法处理。Must：固定传输、实际链接、机器准入租约/身份去重/停用保护；Nice：作者文章内容；不加载课程/历史Manual。
Scope：共享PUBLIC_SOURCE_DOCUMENT路径策略保留原3域名行为，仅新增hamel.dev固定首页/index.html/index.xml及/blog/posts/单slug文章；只将该固定index.html别名归一为根身份，必须来自实际HTML。Node新增显式作者Feed开关与严格协议回执，Deno逐跳验证；SQL准入候选沿现有Raw队列并随开关选择允许域名；固定正文提取复用既有静态主链。Out：批量Source seed、推断主页/作者权威、其他站点、任意HTTP、登录、UI/Schema/生产发布。
分工：Code做路径/身份/状态/审计/采集，AI/Skill不参与，Workflow仍唯一SYSTEM，Human无新增Gate。Read实际Raw及HTML/Feed，write既有Source/Run/Raw准入收据与Audit；仅开发库独有夹具验收，无新权益/采购或付费调用。
Recommendation：一个固定作者Family接通首页→Feed→文章，不另起采集器；新开关避免老Relay误称支持新站。新来源仅参考/CONDITIONAL，重复和停用保护复用Core。代价：文章/Feed存在不证明持续健康或可复现操作；其他作者仍需逐项验证。
Acceptance：固定路径拒绝/首页别名/声明Feed/日期、Node→Relay条件200/304与重定向逐跳/旧协议拒绝/关闭无请求/正文提取、自动登记/重复/归档保护/独有夹具清理，RED→GREEN、开发库PG+mock、回归/typecheck/build/独立review。真实公开小样与远端服务器分开，不声明生产召回改善。
Rollback：关闭OPC_COLLECTION_AUTHOR_FEEDS或同版Node/Relay回退，保留Source/Raw/Run/Audit，不自动恢复身份。Owner：共享source路由、采集合同/实现映射、部署手册、TASKS/PROJECT_STATUS。

- [x] 固定作者路径/首页与Feed发现RED→GREEN。
- [x] 开发库机器准入与材料链路验收。
- [x] 回归/typecheck/build、独立复核和owner同步。
- 验证（2026-10-16）：首页别名纯测试先null≠root RED后GREEN；Node→本地Relay→mock验证固定路径/Feed声明/旧回执/新开关关闭零请求/200→304/越界重定向；真实开发PG同锁，作者自动登记CONDITIONAL参考身份、重复零请求与单Source、归档阻断及正文收据通过，finally清理。75项quick含typecheck与独立build通过，无付费调用/生产部署。
- Final: fixed P2首页别名未参与旧Source身份匹配 — 新增开发PG归档/index.html且无Feed Route的反例，观察原代码错误注册RED，应用固定别名比较后BLOCKED_SOURCE且无新根Source GREEN；同版75项回归和build通过。不改已归档状态或泛化其他站点别名。
- 公开只读小样：主页实际声明index.xml；Feed 200约525997 UTF8字节，小样最近日期2026-09-30及09-18；实际文章观察到../../../index.html。短文经PowerShell取得HTML并交现役Node静态提取器，5317字符及根主页识别成功；长FAQ触发PUBLIC_ARTICLE_INCOMPLETE_OR_TOO_LARGE，保持失败边界。该路径不是远端Deno/Tencent连通或持续资格证明，也不会将旧日期改成当前事件。
- Ruling：仅加入已经实测的Hamel源头，不因Eugene Yan有RSS链接就同时扩源；后者Feed原文存在双斜杠URL且须独立核验，代价是本批覆盖范围有限。

## Task 4G — P3G Eugene原生Feed声明与文章别名

Decision Brief（2026-10-16）：SYSTEM/管理员，来源管理→热点追踪，UI KEEP。Goal：补LLM工程/评测作者Eugene Yan原生源头。已公开核验根主页普通RSS anchor指向/rss/；Feed 200，文章双斜杠/单斜杠均200且HTML canonical声明单斜杠。Must：真实声明链接、固定Source/Practice路径、URL身份/条件请求、机器准入；Nice：正文内容；不读课程/历史Manual。
Scope：在既有作者Family增加eugeneyan.com根主页、/rss/、/writing/单slug/，仅该站已验证//writing/单slug/别名归一；首页必须实际观察到固定RSS anchor才发现，不添加通用anchor爬取或猜Feed。Feed解析和Raw canonical身份复用同一别名规则，Deno直接固定标准地址，跨URI不带/不回存validator；正文沿静态主链。自动登记沿既有Raw→主页→Feed/CONDITIONAL，无seed；不改历史Raw/Source状态或日期。
分工：Code做URL/发现/身份/状态/审计，AI/Skill不参与，Workflow复用唯一SYSTEM，Human无新增Gate。Read公开小样/已有Raw/Source；write既有机器准入与Run/Raw/Audit，验收仅开发库独有夹具+mock；无新权益/采购/付费接口/Schema/UI/生产发布。
Recommendation：固定已证实Publisher声明及别名，保持原Hamel与3旧域名规则；不泛化双斜杠压缩或网络猜测。代价：此别名不回填旧历史canonical字段，Feed日期旧也不生成当前热点；持续资格仍靠真实运行。
Acceptance：固定RSS anchor发现/非法anchor拒绝、Feed链接与canonical去重RED→GREEN；精确路径/开关/旧协议/越界、别名条件隔离/直接标准304、静态正文；开发PG登记/重复/归档保护/清理，回归/typecheck/build/独立review。Rollback：关既有作者开关或同版回退Node/Relay，保留审计，不改历史内容；Owner：共享路由、采集合同/映射、部署手册、PROJECT_STATUS/TASKS。

- [x] 固定RSS声明与URL别名RED→GREEN。
- [x] 开发PG机器准入/材料与协议反例验收。
- [x] 回归/typecheck/build、独立review和owner同步。
- Ruling：只对有原站canonical证明的Eugene writing别名规范化，不全站压缩路径或回写旧Raw，代价是历史副本仍须独立审计。
- Validation：固定RSS anchor缺失及foreign base反例先RED后GREEN；76项quick回归含typecheck、build通过。开发库Eugene与Hamel使用同一验收脚本，真实PG+mock覆盖CONDITIONAL登记、重复身份、归档保护、正文收据和别名Raw去重，finally清理独有夹具。独立review无阻断问题；未部署、采购、调用AI或修改UI/课程。
- Public sample（2026-10-16）：主页、/rss/及双斜杠/标准文章地址均200；HTML canonical指向标准地址，静态正文提取25819字符。Feed小样日期2026-06-21与2026-05-27，保留原日期；这不证明远端Deno连通、近期内容增长或持续资格。
- Final minor（deferred）：可补直接调用Deno Relay并携带别名validator的专项测试；当前Node入口已先剥离，Deno另有独立URI校验，现有测试未单独执行后者。非阻断覆盖缺口。

## Task 4H — P3收尾：来源分组、原生Feed及AIHOT引用

Decision Brief（2026-10-16）：Goal为收尾P3源头覆盖与真实出口差额；SYSTEM/管理员，来源管理→热点追踪，UI KEEP。Must Know为现役Source/Relay协议、用户两组名单、官方Feed声明与AIHOT公开Schema；Nice为网页内容小样；不加载课程/历史Manual。当前dirty树保留，不提交混合历史改动。

Scope：将用户全部39个对象纳入只读目标覆盖诊断（精选候选/氛围线索，不授予栏目资格）；补已公开验证的PyTorch、Modal、Apple ML、Together、vLLM精确原生Feed/文章路径，仍用既有作者开关、Raw驱动机器准入和单一身份；不直接seed/恢复Source。AIHOT两条既有适配器复用有界引用元数据，移除旧API评分<60的采集硬丢弃，保留分类/理由/原文/归属/故事线索，未知日期保持null；分页未取全明确truncated，不假装完整。无新增AIHOT抓取入口或热度算法替换。

分工：Code拥有校验/采集/状态/审计；AI与Skill不参与本批判断；Workflow仍唯一SYSTEM；Human无新增逐项Source确认。Read公开页面/Feed/API及Source只读；write既有Raw元数据与开发夹具，生产无写库/部署/采购/新Schema/UI。AIHOT现用条款明确对外商业使用须书面授权，本批只内部研究和原站独立采集，不新增公开再分发。

Options：复制AIHOT主链或直接以榜单分数授予栏目资格不符合现有Owner；推荐保留上游发现线索、独立获取原文并由现有Gate判断。代价为未连接的候选仍明确缺口，不承诺本批覆盖全名单或生产增量。

Acceptance：两组全名单有唯一目标和身份缺口诊断；五个Feed真实200/有原日期样本，Node/Deno路径/开关/条件请求与非法反例通过；AIHOT低分保留/分类理由归属有界/缺日期/hasNext截断RED→GREEN；补Deno直接别名validator测试；开发PG只读来源对照和既有准入验收；quick/typecheck/build及独立review。远端健康须实测，旧协议明确REVIEW_BLOCKED_DEPLOYMENT，不以本机mock代替。Rollback关闭既有作者开关或同版Node/Relay回退；Raw审计保留。Owner：采集合同/映射、共享路由、watchlist、既有AIHOT适配器、部署手册及状态。

- [x] 全名单覆盖诊断与五个原生Feed/材料路径。
- [x] AIHOT元数据/召回与截断RED→GREEN，直接Deno协议用例。
- [x] 开发验收、真实出口差额、回归/构建/review与owner同步。
- Ruling：保持现有热度及精选权威，只复用AIHOT发现引用 — 避免把第三方排名当作独立事实或重复参与者 — 代价为更深事件关联留到P4。
- Ruling：原“40个”计数经完整名单复核为39（24+15）；7个未核实个人账号保持IDENTITY_UNRESOLVED，其他候选URL也只用于精确已有身份对照，不据此登记 — 避免将同名人或网站整体误认为目标作者/AI专题 — 代价为部分发现仍待自动或原站证据补齐。
- RED→GREEN：API低分45原先丢失、名单目标原先0、PyTorch固定Feed原先无路由，分别观察失败后实现并通过。新旧AIHOT适配器共同由api-incremental专项执行，无数据库依赖；缺日期、未知类别、非法分数/引用、有界理由及hasNext截断均通过。直接Deno别名条件凭证专项通过，P3G对应覆盖缺口已补。
- Development acceptance：Modal及PyTorch/Apple ML/Together/vLLM/Hamel/Eugene七站开发库真实PG+模拟上游通过，覆盖开关、CONDITIONAL参考登记、重复引用、归档保护、正文收据与finally清理；未创建真实来源。只读开发库39目标：3 TRACKED_NOT_PROBED（Together/TechCrunch/The Decoder），1 INACTIVE_EXISTING（HF）、28 MISSING_SOURCE、7 IDENTITY_UNRESOLVED；不恢复停用HF。
- Public sample：五个原站声明Feed均200且有原发布日期；各一篇真实HTML静态提取通过，正文字符PyTorch5393、Modal919、Apple17077、Together3275、vLLM27831，不等于完整附件/可复现实践。32个网站候选有30个本机可达，Arena/MarkTechPost本次不可达；7个个人身份未推断。原站可达不等于远端健康。
- AIHOT research：公开[hot-topics Schema](https://aihot.news/openapi-v1.json)只返回rank/引用计数，内部[hot.ts](https://github.com/KKKKhazix/AIHOT/blob/main/packages/backend/src/events/hot.ts)为48h/24h半衰期、独立参与者和可比覆盖；[评分提示](https://github.com/KKKKhazix/AIHOT/blob/main/industry/prompts/selection-score.md)按内容类型加权五轴，与热度分开。当前API已有分页，修正“上游无协议”的旧假设；本批不猜旧API cursor，不新增抓取主链。商业再分发边界见[官方条款](https://aihot.news/terms)。
- Validation：77项quick回归含typecheck及build（103静态页）通过；独立复核无Critical/Important。复核发现的名单计数/合同旧评分描述已同步；global-trend整脚本需数据库且不在quick，其新增AIHOT行为另纳入api-incremental，未宣称整脚本已通过。本批无延期代码minor。构建日志原放.next妨碍Windows清理，定位并只停止本任务构建，改存系统TEMP后原命令通过，无业务修复。
- Release status：IMPLEMENTED / DEVELOPMENT_ACCEPTED / NOT_DEPLOYED；真实SYSTEM出口协议差额唯一见CURRENT_SYSTEM_FACTS，状态REVIEW_BLOCKED_DEPLOYMENT。P3开发收尾不等于P3生产闭环；同版发布、真实Feed/正文/条件请求/失败退避及持续SYSTEM观察仍待完成，不能以mock或本机原站200代替。

## Task 4I — 已批准同版发布与远端验收

Decision Brief（2026-10-16）：用户已明确批准同版发布Node/SYSTEM与Relay并继续远端验收。管理员/SYSTEM；来源管理→热点追踪；UI KEEP。Must为真实现役版本、源代码差额、资源/备份/回退、协议及真实周期；不加载课程内容。服务器已运行e61b380审计修复，须三方合入并保留其已上线获批UI、Run/Raw归属和Event恢复，不能以旧本机HEAD覆盖。

Scope：现役e61b380修复+本机已验收P0–P3及v17存储同版；Relay只上传8个代码文件和非密钥app标识。先preview验证，再生产Relay与Node/Web/SYSTEM；延用唯一timer、现有PG/Secret，不新建Provider/采购/Schema或复制来源。受管Brave无Key不启用，模型配置未验证不强开AI理解。正式SYSTEM允许正常来源登记/Run/Raw/Event/Evidence/Snapshot写入；无历史批量改写、停用恢复或课程变更。

分工：Code/Workflow执行固定发布与Gate，AI/Skill不拥有业务资格；Human已给发布授权，无新增确认。Read真实主机/配置键名/健康/来源与运行回执；write版本目录、PM2/current、既有非密钥采集开关、正常周期及备份。推荐旁路构建后原子切换，保留现役完整回退点；不在正在服务的目录就地覆盖。Owner为现有部署手册、CURRENT_SYSTEM_FACTS及状态。

Acceptance：合入后77项回归/typecheck/build及审计恢复PG验收；Linux生产Schema/权限预检通过，无迁移；Relay preview/production协议及真实Feed/正文/条件请求/非法目标检查；Web鉴权/快照compact兼容和PM2 cwd正确，SYSTEM同版、唯一timer enabled；一次真实周期及Raw/Observation/Run归属与快照不变量。真实失败如实记录并退避，不以全绿掩盖外源不可用；长期资格与72h效果仍待观察。

Rollback：恢复发布前实际Web/SYSTEM路径、受保护环境备份及旧Relay revision，重载PM2/save并恢复原timer；必要时正常旧版周期重建旧schema快照，保留业务审计，不逆向删除新Raw。发布前作生产备份并记录非敏感路径；不输出Secret正文。

- [x] 集成现役修复、回归与开发PG复验。
- [x] Relay预览/生产及Linux预检/构建。
- [x] 同版切换、真实出口/周期与生产事实更新；持续质量/覆盖缺口保留。
- Ruling：保留e61b380所有已上线修复及获批UI，v17读兼容针对实际v16-audit-fixes — 防止旧分支发布退回线上修复 — 代价为必须重跑集成验收，v17回退仍需旧周期重建。
- 远端发现并修复：Together既有/blog身份未被新主页/Feed匹配，自动登记产生一个重复Source。立即关闭机器准入，通过现有Source Core归档误登记项并保留审计。新增固定发布者身份归一，五站单测RED→GREEN、PyTorch真实开发PG复用/归档保护PASS、77项quick含typecheck及本地/Linux build PASS，独立复核无Critical/Important。修复仅Node，Relay八文件无需改变；修复后恢复全局机器准入，归档冲突继续BLOCKED_SOURCE，不恢复该来源。
- 运行验收界限：首轮SYSTEM无来源到期，另在同SYSTEM锁内复用既有组合函数验收Together/TechCrunch/Decoder，130条候选、23个Run Raw引用均有来源Observation，新增Raw=0。v17存储/wire回放一致。约18MB快照载荷和当前热点/练习为0均如实保留，不等于召回/增长/性能已达标；原站OpenAI Feed连接、HF正文、全watchlist与72h效果仍待后续验证。
- 最终发布：Node/Web与SYSTEM为p3-verified，Relay为v15。真实周期暴露爱范儿XML样式PI、GitHub两站CDATA中的DOCTYPE示例误报；修复词法结构校验，并修复正文示例item挤占真实条目上限的独立复核问题。100示例+真实条目RED→GREEN；最终77项quick/typecheck、本机/Linux build与独立复核PASS。生产只读预检READY、40条已应用迁移、pending=[]，未执行DDL。
- 最终验收：22:39 SYSTEM周期4源到期、4成功、0失败，PASS、failures=[]；同SYSTEM锁在线复采三个修复源全部成功，收到40条候选、新增Raw=1，24个Run Raw引用均有Observation，v17存储/展开/wire不变量PASS。快照22:39:52为443 Event、0热点、0练习、44精选；存储17,977,211字节、wire17,996,173字节。Web200/未登录API401、唯一timer恢复、PM2 cwd正确。先前周期的DeepMind/AWS/Baoyu/Latent/OpenAI网络失败不能因最终周期PASS视为已恢复；7–14日持续观察与性能/召回验收仍未完成。

## Task 4J — 生产失败来源与栏目漏报诊断

Decision Brief（2026-10-16，用户已授权开始第1、2项）：管理员/SYSTEM；来源管理→热点追踪，UI KEEP。Goal：逐层定位OpenAI/DeepMind/AWS/Baoyu/Latent/Hamel真实采集失败，并用当前Event样本解释热点/练习未命中。Must Know为现役Source/Route/Run、Relay边界、Raw/Observation/Evidence和当前确定性门槛；Nice为可验证的固定备用出口；Do Not Load为历史课程、旧采集工作台和无关批次。

Scope：有界只读生产诊断、可复现缺陷修复及验收；复用唯一SYSTEM、PG和Deno，不改栏目门槛、UI、课程或增加采购，不以全网搜索替代固定源。Code负责传输分层、身份/日期/血缘、规则回放；AI/Skill只辅助分析，不调用模型或授予资格；Workflow继续现役周期；Human已授权实施，无新增人工来源确认。

Data Read：生产来源/近期Run/快照/关联证据、固定公开出口；Data Write：本任务代码、current owners和必要验收夹具；真实采集写入仅走既有SYSTEM锁/Core，修复后发布沿用已批准同版边界与回退。Entitlement为现役管理员和服务器运维权限。External Side Effect为有界公共请求及既有链路正常采集，不修改上游。

Options：仅提高超时/放宽门槛，或先定位层级与真实拒绝原因；推荐后者，避免把缺证或连接问题变成错误热点。Acceptance：六源分别有定位层级/回执/未解决原因；热点与练习有全窗口原因分布及可追溯样本；修复必须先RED后GREEN，typecheck/build及相关回归通过，不用mock替代真实可达性或宣称召回率。Rollback：恢复本任务前文件快照、已保留同版Web/SYSTEM/Relay与配置，保留Run/Raw审计，不逆删生产数据。Owner：采集合同/实现映射、CURRENT_SYSTEM_FACTS、TASKS与本计划。

- [x] 只读诊断与真实样本回放。
- [x] 可复现缺陷修复、确定性回归与远端复验；外源限制单列。
- [x] 当前事实和下一步更新。

Validation：传输超时分层、固定宝玉迁移、原始报道输入/作者Feed/独立身份与真实弱关联反例均RED→GREEN；独立review初版无重要问题，随后真实回放发现误关联并补4类反例修复。首轮18个命中含错误样本未发布；收紧标题后8个命中均保留可追溯原文。77项quick（含typecheck）、本机build、Linux typecheck/build通过；兼容gzip/Feed别名补丁再次全回归和双端build通过。开发库不需要Schema或数据变更。

远端：按已授权同版发布，候选40迁移只读预检及Web/SYSTEM文件一致通过；生产备份验证、唯一SYSTEM周期、五源真实复采、Raw/Observation及快照wire不变量通过。Hamel完整Feed及304通过，Latent残余波动明确保留。最终部署/计数/回退唯一见CURRENT_SYSTEM_FACTS；不宣称P4去重、全量召回率、持续资格或72h效果完成。无UI/课程变更、采购或真实AI调用。Status：IMPLEMENTED / DEPLOYED / BOUNDED_ACCEPTANCE_PASSED；长周期健康持续观察。

## Task 5 — P4 事件归一、AI表达与精选/热点质量

Status：RELATION_IMPLEMENTED / QUALITY_NOT_ACCEPTED；5A–5D开发验收完成，5E工程诊断/输入修复开发验收完成、独立质量未验收，5F准备完成、暂存/资源与独立质量Gate待实施。本轮用户补充的产品规格唯一见[优化规格§14](../research/2026-10-16-source-hot-tracking-autonomous-optimization.md#14-p4扩展规格事件归一ai表达与栏目质量)；Task4J部署事实不代表P4已实现。

Decision Brief：管理员/SYSTEM，Product Surface为来源管理→热点追踪；目标为同一发布一个canonical卡片、各源资料详情展开、AI生成事件中文标题/描述/推荐理由，同时修复精选和热点漏斗。Must Know为Event/Cluster/Raw/Observation/Expansion、Fact/动量/精选计算、AI Gateway与任务、历史练习持久记录及当前界面；Nice为额外优质源候选；不加载课程和退役采集链。

推荐复用现有Cluster与PG，保留成员Event和全部审计，统一主列表/精选/热点/练习的canonical身份。单纯UI去重无法汇总证据；删除/覆盖Event不利于回退。当前代码需重点验证主Event旧policy被用于聚类后精选评分、Expansion仅按主Event读取、历史练习逐Event读取这三条链路；诊断代码位置不作为已完成修复或全量影响统计。

Core负责身份/关系冲突、证据归属/去重、事实/栏目重算、状态、Schema、缓存/租约/CAS、审计与快照；AI/版本化Skill负责模糊关系建议及证据约束的事件中文表达；Workflow仅现役SYSTEM；Human不逐源确认，只在实际UI变化后审核体验。数据读取既有Source/Raw/Event/Cluster/Evidence和有出处回放集，写入现有Core所拥有的关系映射/聚合/AI任务结果，必要Schema另走现有迁移Gate。权限仍管理员/服务器运行角色，外部副作用为有界公共采集及既有Gateway模型请求，无新供应商采购或平行调度。

Validation/Acceptance按规格§14.4：同次Meta Muse发布一张卡、成员原文可追溯、跨栏同一身份、历史练习无重复展示且不删除记录；不同版本/动作与传递链反例全过；聚合后重算完整证据，单源官方精选正例保留；AI标题/描述/理由通过引用/实体/数字/版本验证，失败明确回退，重复周期不重复调用；真实关系集/发现集达到目标才能声明质量改善，无真值报UNKNOWN。开发PG同SYSTEM锁并发/幂等、typecheck/build与采集回归；如改UI，提供可体验结果并获得用户明确批准。

Rollback：分别关闭语义建议/事件表达并回到前版确定性读模型；映射及Prompt/Schema版本可回退，保留Raw/Observation/Run、成员事件、旧练习触发与ai_runs审计，不逆删生产数据。Owner：规格§14、采集合同/实现映射；当前运行事实仅CURRENT_SYSTEM_FACTS。

- [x] 5A：有出处关系回放集与可见栏目漏斗工程基线；独立发现真值仍UNKNOWN，不作为全量质量验收。
- [x] 5B：canonical关系、整簇冲突与成员证据汇总；成员有效性/跨日期边界；历史练习归并与回退。
- [x] 5C：AI模糊关系建议接现有Gateway/Skill，Core校验后应用，版本化缓存与有界任务。
- [x] 5D：聚合事件AI中文标题、答案先行描述、推荐理由；证据引用、输入变化CAS、usage、失败回退和去重调用。
- [ ] 5E：工程部分完成、独立质量未验收。同样本比较发现覆盖/时延与精选/热点误报漏报，先修输入再按证据调整版本化规则；优质源缺口走原Source准入链。
- [ ] 5F：准备完成、整体验收未完成。本地/暂存真实体验及必要UI审核、资源/完整回归、同版发布回退与远端即时验收；72h和7–14日观察单列。

### Task 5A 执行边界（2026-10-17）

Decision Brief：管理员/SYSTEM诊断，UI KEEP；本次下一任务交付为有出处的冻结关系样本、可重复运行的聚类基线与精选/热点漏斗诊断，先建立基准再进入5B业务变更。Core读取既有Source/Run/Raw/Observation/Event/Cluster/Expansion与快照，纯函数验证标注和输出指标；AI/Skill不生成真值、不调用模型；Workflow/状态/生产部署保持原样。Data Write仅代码、公开内容有界fixture和owner文档，生产数据库强制read-only transaction；无新外部供应商/采购/付费调用。与直接改阈值相比，基线可区分抓取、关联及筛选问题。验收为去重的≥100对有出处关系、正负/同对象难负例、≥60个冻结发现参考、未知分母及标签不全时输出UNKNOWN、现行规则反例可复现、原命令兼容、typecheck/build与相关回归通过。已采样本不当作独立全网召回分母；真实外部漏报真值不足须显式列缺口。Rollback为移除新诊断入口与fixture，不改原生产状态。完整P4与AI/界面仍待5B–5F。
### Task 5A 基线验收（2026-10-17）

Status：IMPLEMENTED / BOUNDED_BASELINE_ACCEPTED / QUALITY_NOT_ACCEPTED。本批无UI、Schema、业务状态或生产代码发布；只读生产检查、无模型调用。

冻结资产：`scripts/fixtures/radar-quality-v1.json`含81条有原始标题/URL/发布日期的材料、150个不重复关系对（91个同次发布资料正例、59个不同模型/弱关联反例）、60条一手来源/论文观察参考。保留实际Event标题/summary/keywords/entities/type/主客实体与时间、冻结成员归属；完整输入已只读补齐。标签为按标题/URL作出的可复核工程假设，正例集中Muse Spark Open；未经过独立盲标，60条参考亦来自已采集内容，因此发现召回率、重要事件覆盖率和24h漏报率均UNKNOWN，不以数量冒充独立真值。

`content:radar-quality:replay`显示当前评分器在该切片TP5/FP0/FN86/TN59（正反方向一致），91个正例对的配对召回5.49%，不是线上全流程/全主题召回率；冻结成员归属中91个正例对均未同簇。14篇Muse Spark Open报道分属14簇。当前规则质量目标未达，后续先5B整簇安全归并及证据汇总，5C/5D语义建议和表达，再5E独立发现样本与完整前置漏斗；不得直接放宽门槛。

只读窗口2026-10-17 00:34（北京时间）：447个可见Event，精选42、热点1、练习8；未入精选中TRUST_GATE_FAILED383、MATERIAL_CHANGE_NOT_ESTABLISHED48、DAILY_FRESHNESS_GATE_FAILED48、BELOW_FEATURED_SCORE9，原因可重叠。它们不包括前置被筛除Raw/Event，不证明所有信任失败都由碎片化导致。旧read-model内部部分判断使用进程时钟，asOf不是完整历史重建；冻结汇总随fixture提供，运行事实不改写CURRENT_SYSTEM_FACTS。

验证：新模块缺失实际RED→GREEN；引用/日期/重复反向对、UNKNOWN不执行预测、空集/负例集/零分母、去重原因/正信号不冒充拒绝、真实评分器冻结计数均PASS。独立复核指出遗漏评分输入和未测真实评分器，均已修复。78项quick采集回归（含typecheck）PASS；复核修复后新增行为测试、typecheck与脚本入口复验PASS，最终build（103静态页）PASS，current owner引用与CRLF-aware diff检查PASS；后续改算法需显式评审并更新冻结基线，不能将稳定性PASS当成质量PASS。远端临时检查入口已清理，生产业务未写入。

### Task 5B 执行边界（2026-10-17）

Decision Brief：管理员/SYSTEM，Product Surface仍为热点追踪，UI KEEP。Must Know为现役Cluster/Event/Raw/Observation/Expansion、policy计算及持久练习，Nice为额外对象识别覆盖，不加载课程/历史采集链。推荐保留现有Cluster与PG，明确对象/同次发布用确定性规则，所有跨簇成员须通过一致性检查，事务串行化防并发分裂；模糊对象仍UNKNOWN留给5C，不新增硬编码来源或第二调度。Core负责归并、有效成员选择、证据去重、共享policy重算、历史练习只读归一；AI/Skill本批不执行，Workflow仍唯一SYSTEM，Human无需逐条确认。Data Read现役关联，Data Write仅代码/文档及开发库独有夹具；不删除生产Event/练习、不部署或开启AI。稳定身份使用既有primaryEventId，即使主成员过期/归档，使用有效成员生成投影，不靠展示标题判身份。Validation为冻结同发布/不同模型反例、跨版本/独立动作/72h/传递链、归档/未来/跨日成员、去重/完整Expansion、旧policy不左右聚合、历史最早触发与全部原文、开发PG同锁并发/幂等，typecheck/build及采集回归。Acceptance是5B闭环，不声明AI表达或全量质量已达标；无UI改动不触发视觉审核。Rollback为回退本批规则/读模型，保留成员审计/原Event/原练习；生产事实保持原版。Owner为采集合同与实现映射，实施记录本计划。

### Task 5B 开发验收（2026-10-17）

Status：IMPLEMENTED / DEVELOPMENT_ACCEPTANCE_PASSED / NOT_DEPLOYED；整体精选/热点质量仍QUALITY_NOT_ACCEPTED，下一步5C模糊关系Skill建议，5D事件级AI表达随后实施。

同发布确定性归并、整簇complete-link冲突保护、事务并发协调、有效成员与稳定canonical身份、成员直接/扩展证据汇总及共享policy重算、持久练习历史归一均已实现。规则唯一owner见采集架构合同P4B，代码与命令见实现映射；不复制规则正文。

冻结150对在v6评分器得到TP91/FP0/FN0/TN59，正反方向一致；previous保存v5基线，冻结线上成员归属仍为原结果。仅证明该有出处工程标签切片通过，非独立金标、全模型覆盖、线上归并结果或全网召回率。开发PG以SYSTEM同锁独有夹具验证并发/幂等、已有簇跨版本桥接拒绝、重复Raw/Expansion去重、旧policy失效、归档主成员不遮蔽有效成员、历史最早触发和新链接写入、跨日期投影与原记录保留，finally清理。模型/上游采集请求均0。

实际RED→GREEN覆盖同发布评分、未来/过期成员、reference/signal权限、同组织早到弱证据遮蔽官方证据；开发PG复现并修复归档主成员后第三链接无法持久化。复核修复readiness仍使用旧状态的问题，独立复核无剩余重要阻断。最终79项quick（含typecheck）、canonical开发PG验收通过；最终build（103静态页）、current脚本入口与CRLF-aware diff检查通过。无UI/Schema、生产状态或开关变更，AI保持关闭。后续5C–5F仍须独立完成与验收。

### Task 5C 执行边界（2026-10-17）

Task ID：P4-5C。Goal：模糊跨簇关系由版本化Skill建议、Core校验整簇后应用。User Role/Entitlement：现役SYSTEM运行角色与管理员。Product Surface：热点追踪，UI KEEP。Problem/Why Now：5B已完成确定性聚合，但跨语言/弱标题的同次发布仍缺语义关系判断。Must Know：Cluster/Member、直接SYSTEM Raw、ai_runs和既有Gateway；Nice：扩大对象识别；不加载课程及历史采集。

In Scope：独立版本化输入输出Schema/Prompt、整簇全部跨对引用及置信度校验、确定性对象/版本/动作/时间保护、持久租约/缓存/退避/CAS/usage、SYSTEM有界独立阶段与开发PG验收。Out of Scope：5D中文表达、Source资格/栏目阈值、UI、采购、生产发布和开启真实模型。Code负责候选选择、真实证据、冲突/引用、事务归并与审计；AI只建议五类关系；Skill无DB/发布权；Workflow仍唯一SYSTEM、AI失败不阻断快照；Human不逐事件确认。

Data Read：最近168h非未来活动Event、全部簇成员、当前SYSTEM来源直接Raw与Observation。Data Write：Event扫描水位、ai_runs任务/结果/调用usage与既有成员/簇审计；保留原事件与练习。External Side Effect：仅启用开关且既有模型/关闭思考协议就绪时，经Gateway单次有界请求；本轮验收仅mock，无真实付费。Options：沿用硬编码对象、AI直接合并、版本化建议+Core校验；推荐第三项以覆盖模糊关系且保护业务权威，前两项分别覆盖不足/错误难控。

Deterministic Validation/Acceptance：虚构/缺失引用、错对象/版本/独立动作/跨日窗口、缺任一跨对均不得归并；正向模糊关系可合并，全部成员证据保持；同输入缓存/并发领取/租约恢复/退避、材料或成员变更CAS/归档/停用/关开关拒绝旧结果；usage含失败与UNKNOWN，快照阶段继续。最近候选有界且扫描水位轮转，单周期最多2组、65秒，每请求≤20秒，无金额硬停。真实PG仅opc_ai_dev、SYSTEM同锁独有夹具finally清理，typecheck/build/采集回归/脚本治理通过。Human Review：无可视化变更，无新Gate。Rollback：关闭语义开关停止新增建议/归并；已应用映射保留ai_run中的前簇/成员审计供恢复，不声称关开关自动拆簇；回退旧确定性代码保留原Event/Raw/练习。Owner：采集架构合同P4C与实现映射；状态本计划/PROJECT_STATUS/TASKS。

执行约定：继续用户已授权的codex/collection-quality-feedback工作目录与未提交P0–P4链路，不创建缺少这些改动的新checkout、不隐式提交。前置接口5B complete-link评分对模糊pair会拒绝，5C另使用同一硬冲突保护和每一跨对经验证的建议，不删除5B确定性Guard。AI关系默认off；无真实模型效果/精度验收不宣称全量质量改善。

### Task 5C 开发验收（2026-10-17）

Status：IMPLEMENTED / DEVELOPMENT_ACCEPTANCE_PASSED / NOT_DEPLOYED；真实模型精度、实际费用、资源/线上效果未验收。规则唯一owner见采集架构合同P4C，代码及命令见实现映射，下一步5D事件级中文表达。

新增版本化关系Skill及Core引用/全跨对/硬冲突验证，复用ai_runs的持久任务、Gateway、唯一SYSTEM阶段与既有Cluster写入；原始Event/练习保持，未改UI/Schema或栏目门槛。开关默认关闭，不修改生产配置或调用真实Provider。

验证：模块缺失、原文v1/v2与独立安全动作、共用Python版本遮蔽模型版本、原发日期缺失/过旧反例实际RED→GREEN。开发PG实际复现人工/未知来源入模、无实体首十条阻塞并修复；40条前置候选后的下一页可被处理。独有真实PG+mock验证UNKNOWN缓存、失败退避/usage、到期租约ABANDONED后恢复、并发不重复调用、来源停用/事件归档/中途关开关/标题和成员变化CAS、已有双成员组全部跨对应用、同组不重复请求及原事件保留；finally清理，PAID_CALLS=0。

独立复核提出四项Important及一次版本交集绕过，均修复并复验，最终无Critical/Important。80项采集quick（含typecheck）PASS；最终build（103静态页）、scripts:current、current owner引用及CRLF-aware diff检查PASS。验收不是独立关系金标或精度门槛达成，不把工程mock/固定样本当作真实AI效果。语义组最多8成员与有限候选/证据窗口、无自动拆簇恢复命令等限制保留在合同；完整性能及真实模型质量由5F另验收。

## Task 5D Decision Brief — canonical事件表达

角色为内容运营；Product Surface为热点追踪既有卡片与详情的数据投影，UI KEEP。仅为canonical事件生成中文标题、答案先行摘要和阅读理由，不修改Raw/Event原文、身份、热度、精选或练习资格，不翻译全文、不部署。本任务Owner为采集架构合同，实现定位由映射负责。

Core选择当前有效SYSTEM成员与Source授权的事实资料，排除参考/Signal/评论；代码校验引用、数字、实体、动作与不确定性，负责持久任务、缓存、租约、退避及输入变化CAS。版本化Skill仅建议措辞；Gateway调用固定在唯一SYSTEM Workflow内；Human不新增逐条确认，现有发布/UI Gate保留。读取Event/Cluster/Raw/Observation/Source，写canonical Event的eventExpression元数据与ai_runs审计，其他字段不写。

推荐独立事件表达Skill而非复用代表文章摘要：代表报道变更不应改变事件身份，多篇复述去重后不无条件重复调用。每轮最多2次请求、20秒单次、65秒阶段，扫描轮转最多20个锚点；默认关闭OPC_COLLECTION_EVENT_EXPRESSION，失败退避1/2/4/8/16/24小时，15分钟租约。无采购金额上限但保留资源边界；不调用真实付费模型验收。

Validation/Acceptance：先RED后GREEN的纯行为校验与开发PG+mock Provider，验证正确引用、越权/捏造拒绝、重复缓存、失败usage、租约/并发、材料/Source/成员变化拒绝旧写入、原文不变及真实read-model回退；完成quick/typecheck/build、独立复核与文档治理。模型真实质量、生产时效及全量漏报不在本批宣称通过。Rollback：关闭开关停止新任务；读取仅接受当前指纹且校验通过的表达，缺失/过期回退原文并标记；删除eventExpression只移除表达，账本保留；代码回退需Web/SYSTEM同版。无Schema迁移。

### Task 5D Acceptance

IMPLEMENTED / DEVELOPMENT_ACCEPTED / NOT_DEPLOYED。纯校验、开发PG+mock Gateway与真实卡片/练习投影验收通过：同canonical表达、原文不变、缺失/变更即原文回退、重复文章/重复周期无重复调用、A→B→A和缺失元数据恢复缓存、并发租约、到期ABANDONED、失败退避/usage已知与UNKNOWN、Source/正文/成员/开关CAS、归档主成员，以及Signal/参考/未来观察/非SYSTEM拒绝。所有独有测试夹具finally清理，真实付费调用0。

RED→GREEN覆盖缺模块、中文无依据动作/金额/实体、显式版本遗漏、裁剪传言限定与重复发布日期；独立复核的两项Important和收尾传言问题已修复，最终无Critical/Important。81项采集quick含typecheck PASS，末次保护修正后单项与typecheck再次PASS；最终build（103静态页）PASS。current owner规则与映射同步；无组件/CSS、生产、课程或Schema变更。已有工作树其他改动保留。

真实模型语义质量/兼容/费用、生产启用及完整栏目效果未验收；有界正则与工程mock不构成任意自然语言事实正确性证明。下一步5E采集到栏目完整漏斗质量，不降低栏目门槛；5F整体验收仍未完成。

## Task 5E Decision Brief — 完整漏斗与输入修复

Task ID SOURCE-RADAR-P4E；Goal为把已冻结样本逐项定位到来源、获取、Raw、Event/canonical、证据、栏目、快照，并对可复现输入错误做同样本回放。管理员/SYSTEM，Product Surface来源管理→热点追踪，UI KEEP。Must Know为现役Schema、Source/Run拒绝审计、聚合policy/read-model/快照和冻结参考；Nice为额外源头；不加载课程/旧工作台。当前仅RADAR_VISIBLE_ONLY统计无法解释上游遗漏，故需本步。

Core负责只读一致性快照、精确ID/URL关联、原因与时延、UNKNOWN和同样本比较；AI/Skill本批不调用、不生成真值；Workflow保持唯一SYSTEM；Human不新增逐条确认。读取现有PG关系、Run/拒绝样本/快照及冻结fixture，写代码、owner文档及开发库独有验收夹具，生产访问仅显式read-only transaction，无外部请求/采购/生产部署、无Schema/UI/课程变化。Entitlement沿用管理员/运维脚本权限。

推荐扩展现有诊断入口，复用现役policy和read-model，同时补可复现的逐Raw证据输入问题；相比调低阈值或新增后台大屏，可保持权威与UI边界。历史OBSERVED_ONLY样本不能变成独立全网分母；独立发现/栏目标签不足保持UNKNOWN，不能宣称24h覆盖目标达成。无正负标签的“栏目未入选”不叫误报或漏报。快照过期、容量排名、采样截断、未来材料与权限拒绝分别解释。

Acceptance/Validation：先RED→GREEN的逐层失配、重复/未来/未知/截断、负延迟与24h观察未成熟、同样本配对/标签不足反例；复用既有≥60冻结参考逐项输出，版本化原因、计数口径与无标签UNKNOWN；逐Raw相关性/确认权限不能互借，官方单源正例保留，不同模型/版本及信号负例不退化。开发PG独有夹具验证真实read-model与一致性事务、原始记录不变、finally清理；完成quick/typecheck/build、独立复核、文档引用和diff。真实独立发现集、生产72h与7–14日效果仍属未验收，不伪造独立金标。

Rollback为回退本批诊断入口与输入修复，保留原始Raw/Event/Run/快照和审计；不改阈值。Owner规则唯一为采集架构合同，实现映射负责代码定位，本计划负责实施记录。现有dirty树延续，不做混合提交或新worktree复制历史改动；按已授权同任务继续，在当前codex分支闭环。

### Task 5E Engineering Acceptance

60条冻结观察参考已完成开发库只读诊断：可见22、证据关联/权限缺口6、可见性Gate8、获取原因未知22、缺Source2；可见canonical事件22。独立参考0，三个栏目精度/召回和24h发现召回均null，描述性发现时延中位33.75h。此为开发库当前代码投影，不是生产结果或修复前后质量提升；报告保存在本机`.runtime/p4e-audit-development-final.json`，不进入current规则事实。

Status：IMPLEMENTED / DEVELOPMENT_ACCEPTANCE_PASSED / QUALITY_NOT_ACCEPTED / NOT_DEPLOYED。本步工程交付完成，5E独立发现/栏目质量目标仍未达验收条件，不能以开发库夹具或观察参考替代。没有UI、Schema、课程、来源注册、生产修改或真实模型调用。

已补逐层只读漏斗、独立标签/UNKNOWN、严格同样本比较与直接/扩展证据血缘。实际RED→GREEN验证同源早到无关Raw遮蔽官方事实、无关SYSTEM借权及归档canonical主记录误隐藏有效成员；PG同夹具快照投影before=0/after=1，全部成员归档仍隐藏，原始Event未改。该修复不是当前全网发现率改善证明。

独立复核发现扩展资料漏关联及无关Raw借用同canonical栏目资格，两项分别以真实PG断言先失败后通过；修复后八条隔离参考覆盖来源缺失、拒绝回执、无Event、MANUAL证据、运营阻断、官方正例、无关负例与扩展资料。83项quick（含typecheck）、build（103静态页）、开发PG验收通过；夹具finally清理，无外部采集/模型请求。规则与入口分别见采集架构合同/实现映射P4E。

后续5F先做整体验收准备、部署差异/回退核对及真实独立样本建设；尚无独立发现分母与栏目正负标签，召回/精度保持UNKNOWN。真实AI兼容/质量/费用、生产72h与7–14日效果另行验收，不因工程PASS自动开启AI或宣称精选/热点问题已解决。

## Task 5F Preparation Decision Brief

Task ID SOURCE-RADAR-P4F-PREP；Goal为建立可复核的工程整体验收、候选版本清单与生产只读基线、回退/发布步骤及未完成质量Gate，尚不执行发布。角色为管理员/运维，Product Surface来源管理→热点追踪，UI KEEP。Must Know为5B–5E输入输出、现役部署/唯一SYSTEM与512M边界、Schema/权限、配置开关及原始审计；Nice为更多源头与新性能方案；不加载课程或历史批次。当前分散单项验收不能证明同一候选整体可发布，故本步统一核对。

In Scope：复用现有完整回归（含typecheck/build）、四项开发PG隔离验收串行复验、开发Schema/迁移只读预检；有界SSH只读核对生产Web/SYSTEM代码指纹、资源/唯一timer和语义开关，生成不含Secret的本机候选清单。Out of Scope：生产发布/迁移/恢复Source/执行SYSTEM周期、开启模型或真实Provider采购、新UI、课程及对生产施压。Core/现有脚本负责检查，AI/Skill不判真值；Workflow不变，Human无需逐条审批来源/事件，只有发生UI变更才触发既有视觉Gate。

Data Read为本机代码/既有fixture、开发PG、生产固定路径代码与非敏感运行元数据；Data Write仅本计划、PROJECT_STATUS/TASKS、必要owner指引及忽略的本机验收产物，开发PG夹具finally清理；不读取输出Secret，不改变生产状态。Entitlement沿用开发与运维权限。推荐复用现有验收和只读指纹而不新增长期验收服务/第二发布系统；真实模型、2倍工作量/512M资源、体验、独立质量与72h/7–14日观察逐项保留NOT_RUN或UNKNOWN。

Acceptance：本轮命令与退出状态可追溯、四项PG互不并发争锁、候选包含未跟踪新模块、Web/SYSTEM基线差异明确、迁移/配置和回退副作用逐项说明；不得把准备完成标为发布成功或P4质量通过。Validation含完整回归、开发PG、只读preflight、owner引用和CRLF-aware diff。Rollback为撤回准备文档与本机产物，无生产回退动作；实际未来回退必须保留成员映射/ai_runs审计并区分停新任务与撤销已归并。Owner规则为采集架构合同、操作为Relay DEPLOYMENT与PostgreSQL runbook、实施记录本计划；保持当前codex脏树，不混合提交或复制历史改动。

### Task 5F Preparation Acceptance — 2026-10-17

Status：PREPARATION_COMPLETE / RELEASE_NOT_READY / QUALITY_NOT_ACCEPTED / NOT_DEPLOYED。本轮只更新owner文档并产生本机忽略的验收产物，无业务代码、UI、Schema、课程或生产修改，没有真实模型/采集请求。延续当前脏树，候选按内容指纹识别，不能仅用HEAD代表已验证版本。

| 检查 | 本轮证据 | 判定与限制 |
| --- | --- | --- |
| 完整工程回归 | `content:discovery-collection:regression`，84个检查通过，含typecheck/build（103静态页） | PASS；83项quick加build，不是84条业务用例 |
| 同候选开发PG | canonical-event、event-relation、event-expression、radar-funnel四项accept串行，分别79.10/37.04/47.38/53.13秒 | 全部exit0、独有夹具finally清理，关系/表达为mock，真实付费调用0；耗时含SSH往返，不是服务器周期P95 |
| Schema/迁移 | app预检表/权限READY、管理员存在、非superuser；`--migration-plan`因历史无读取权exit1 | 初次BLOCKED保留，不扩权；专用开发维护连接强制read-only复核40条history，PLAN_ONLY、blockers=[]、pending=[]、exit0；无DDL，生产维护连接预检待正式发布前执行 |
| 生产只读基线 | 2026-10-17约09:14–09:19北京时间，固定代码路径/运行字段及HTTP | Web/SYSTEM 781个清单文件逐字节一致；既有唯一timer enabled/active，service最近success/exit0，512MiB/50% CPU；首页200、未登录Radar API401；不是候选已上线 |
| 现役资源 | 2核、MemTotal约1.92GiB，采样可用约0.98GiB，磁盘可用约19.2GiB | 仅一次环境快照；没有两倍7日峰值、512M/OOM、Web P95或PG连接饥饿结论 |
| 开关/Relay | 生产关系/表达UNSET、材料理解off；Relay执行文件与现役Web/SYSTEM基线一致 | 本步不启用AI；P4没有Relay运行代码差异，暂沿用现役v16协议，无需为准备工作重发Relay，未来发布仍核验健康/能力 |
| 候选范围 | 803文件含未跟踪P4模块/Skill/fixture；对生产新增23、实质变化20、缺少1旧CSS，510文件仅CRLF差异 | 无app/components现役布局内容差异；旧Manual CSS删除为既有工作树变更且不恢复。20项包含非执行配置模板、文档与示例，不能自动应用这些模板到生产 |
| 候选包 | `.runtime/p4f-candidate-source.tar.gz`，2796286字节；SHA256 `983FA5E599516AE0BE9CED4DF4698F74C7A5D13AB83331C3FBE688C115AB13A3` | 路径清单/803个解包文件SHA256全匹配；排除.env/node_modules/.git/.next/logs/.runtime，无Secret；仅源码准备包，未上传、未做候选Linux构建 |
| 关系回放 | `content:radar-quality:replay`，150工程关系对，正反向均TP91/FP0/FN0/TN59 | 当前评分器工程切片precision/recall均100%；正例集中Muse、未独立盲标，不模拟完整候选检索/传递归并，不是全主题质量PASS。storedMembership为冻结旧状态，不当作新版本结果 |
| 真实体验/质量 | 本轮无页面交互变更；没有新增UI审核Gate | 已批准布局保持冻结；候选真实数据界面体验NOT_RUN，独立≥60事件发现集与栏目正负标签不足、真实模型质量/费用/兼容NOT_RUN |
| 连续运行 | 未部署候选 | 72h与7–14日均NOT_RUN，不用现役旧版本健康抵扣 |

本机产物：`.runtime/p4f-full-regression.log`、`p4f-development-acceptance.json`及四项PG日志、`p4f-development-preflight.json`（保留首次exit1）、`p4f-maintenance-migration.json`、`p4f-local-manifest.json`、`p4f-production-preflight.json`、`p4f-release-diff.json`、`p4f-quality-replay.json`。产物只作本次证据，不成为第二个事实Owner；源码变更后必须重建包/清单并复验，旧哈希不能代表新候选。

### 5F Remaining Gates / 执行顺序

1. **暂存与资源**：正常配置Linux构建、隔离PG恢复、真实快照与管理员HTTP、正常工作量Core回放已通过，见下方5F当前裁决与结果。用户已取消本轮人为资源上限及两倍压测优先级，未通过旧限额测试；Web P95本轮比基线增加24.9%，性能目标尚未达到。实际UI未修改，不新增视觉审批结论；独立质量与发布Gate继续开放。
2. **独立质量**：从预先冻结的官方Release/API/论文原始发布记录构建独立事件分母，预先保留未采到内容与原始发布时间；按同asOf核对24h发现、源到Raw时延、精选/热点正负样本。跨对象/版本/动作难负例、模糊关系和中文表达由可追溯证据判定，不让被评估AI生成真值；不足即UNKNOWN。无新增人工逐源/逐事件审批要求。
3. **发布前保护**：完成候选Linux/资源/质量结果分级后重新冻结清单；核验生产只读Schema/维护历史，当前P4无新增迁移，不运行db:migrate。制作并验证可恢复数据库备份，包含Cluster/Member、Event metadata、历史练习、ai_runs及原始审计；保护当前Web/SYSTEM路径、PM2/env恢复材料，先在隔离环境演练恢复。上述备份和恢复演练本轮未执行。
4. **同版切换计划**：暂停既有timer并等待当前周期/锁安全结束，保留原release；以相同候选部署Web/SYSTEM并核对指纹。环境文件通过既有受保护流程注入，不从源码包或模板复制；保持关系/表达未启用、材料理解off，不新建timer、不注册来源。Relay运行代码无变化时保留现役版本并核验固定协议；有变化才按既有DEPLOYMENT顺序先验Relay再切Node。
5. **即时验收计划**：首页200、未登录API401、Schema/权限与timer正常；核对真实Muse同次发布仅一主卡、有效成员原文可追溯、不同版本/独立动作仍分开、精选单源官方正例保留。由现有SYSTEM正常周期验证快照和血缘；异常立即停止新周期并按同版旧Web/SYSTEM及受保护配置回退，禁止用开发夹具在生产“验收”。本轮不执行此切换或生产周期。
6. **AI与观察分开**：真实Gateway兼容、引用/语义正负样本、usage/费用和失败回退另行验证后才考虑启用；关闭开关只停新请求，已应用映射/有效表达仍可能存在。要撤销数据须根据备份/ai_runs前映射审计做独立恢复，不能把代码回退说成拆簇。即时验收、72h稳定、7–14日质量收益逐项记录，未完成前P4保持QUALITY_NOT_ACCEPTED。

收尾：不带迁移历史参数的开发Schema预检exit0；scripts:current、current owner链接、CRLF-aware diff均PASS；再次核验当前803个源码文件仍与已测试候选清单一致。本轮只完成准备子任务，不关闭整个执行计划，也不将既有单项review当成P4整体验收。

5F正常配置暂存运行结果见下方；下一步为独立质量Gate及性能项，不直接跳到生产发布或真实AI启用。无需重复请求用户批准已授权的只读核验与隔离开发验收；发生实际UI变更时按既有视觉Gate处理。

## Task 5F Staging / Resource Decision Brief

Task ID SOURCE-RADAR-P4F-RESOURCE；角色管理员/运维，来源管理→热点追踪，UI KEEP。目标在隔离暂存环境真实运行候选并验证资源，先测再定结论。Must Know为已冻结803文件包/指纹、现役SYSTEM Run/周期工作量、快照/真实API/认证、PG隔离和cgroup；Nice为额外源头；不加载课程历史。当前本机无可用Linux发行版，服务器为现役2C2G且约1GiB可用内存，故不可无界并行压测。

推荐在服务器独立目录、独立PG实例（回环不同端口、库名仍opc_ai_dev）、独立回环Web和临时cgroup执行串行有界测试；基线/候选使用相同冻结公开内容和配置，不改生产PM2、Nginx、timer、release或数据库。构建与采集资源分开：构建有独立上限，采集严格512MiB/50% CPU；PG单独小额预算、有限连接，Web单独预算。宿主低内存或生产健康异常立即终止暂存任务，不停止生产。若资源不足，记录阻断，不能放宽采集限额冒充通过。

Core/脚本负责真实pipeline回放、snapshot/API/认证校验与时延/内存/OOM/连接采样；AI/Skill不开启、不造真值，获取与模型外网在暂存执行环境阻断。数据仅读取公开内容表及脱敏聚合运行量，不复制生产用户/session/Secret/Provider配置，暂存创建独立测试管理员；所有暂存写入限定独立PG。Workflow无新timer，仅临时进程/服务且有退出/停止边界。无需新增人工逐源/事件确认；无UI改动不新增视觉Gate，实际页面体验状态单列。

Acceptance：核验源码指纹、Linux构建/真实暂存HTTP与管理员API、同冻结输入基线/候选资源；按可用最近7日真实峰值定义两倍回放并披露历史覆盖不足，Raw到Event/snapshot走现役Core，报告失败/中止而非仅空跑或401时延。cgroup OOM/峰值、周期/快照、Web P95和PG连接分别验证，未达到的保持NOT_PASS/NOT_RUN；真实AI与72h/独立质量仍不属于本轮。Rollback为停止本任务独有临时服务/隧道并保留受保护暂存数据用于复核，不动现役生产；后续清理只针对已验证的固定暂存目录/实例。Owner为采集合同、实现映射与本计划，保持既有脏树不混合提交。

### 5F 当前执行裁决（2026-10-17）

用户明确“不需要考虑上限，先正常生产”，并进一步确认“先按正常配置跑通暂存，暂不发布”。本轮优先正常构建与隔离暂存运行，取消人为Node heap、MemoryMax、MemorySwapMax及CPUQuota限额；资源采样只作记录，不作为硬阈值验收。上述原资源Brief/§12的512MiB/50% CPU和两倍负载要求不再作为本轮阻断，不得将正常运行结果宣称为通过旧限额测试。仍保留生产HTTP健康保护、暂存独立目录/PG/回环端口、有限执行时间与关闭AI；不切换生产、不改变现役timer/PM2/配置。

前两次受限构建分别在384MiB Node heap发生OOM、在896MiB组限额测试中触发宿主可用内存保护而中止；均不是构建PASS，也不用于推断正常配置不可运行。后续结果以正常配置实测为准。

### 5F 正常配置暂存结果（2026-10-17）

状态：NORMAL_STAGING_RUN_VERIFIED / NOT_DEPLOYED / RELEASE_NOT_READY / QUALITY_NOT_ACCEPTED。本轮没有修改业务代码、UI、生产库、PM2/Nginx、SYSTEM timer或Relay，真实AI请求为0。独立暂存位于服务器`/opt/opc-services/opc-p4f-staging-20261017`，使用回环Web 3011和独立PG 15433；不连接现役5432或原开发隧道15432。源码包仍为前述冻结803文件；本轮额外探针仅为暂存夹具，不进入release。隔离库只恢复14张公开内容表，创建独立管理员，未复制生产用户/session/Provider或登录凭据。

| 验证 | 实测与结论 |
| --- | --- |
| Linux正常构建 | `npm run build` exit0；44.24秒，systemd采样峰值1,091,809,280 bytes（约1.02GiB），CPU时间61.84秒；无额外heap/CPU/内存/禁swap限额。生产健康连续失败0。采样峰值不是内核全程精确峰值，退出后cgroup已回收，不伪造OOM计数。 |
| 冻结真实内容快照 | 基线492事件/34精选/14练习，构建2,768ms、进程RSS216,879,104 bytes；候选491/54/14，构建3,401ms、RSS217,772,032 bytes。两者时间相近但不是固定asOf质量回测；不将栏目数量差异视为召回提升。候选JSON约21.9MB，compact HTTP约19.5MB，大载荷仍存在。 |
| 正常HTTP | 基线/候选首页200、匿名管理员API401、真实独立管理员snapshot API200，来源管理与热点追踪SSR页面200；恢复夹具后候选已登录API再次200。没有新增UI实现或USER_APPROVED声明。 |
| 同冻结输入API时延 | 每版本先冷请求再20次串行回环已登录compact snapshot；冷请求626.46→666.38ms，中位166.02→213.44ms，P95 188.79→235.76ms（+24.9%）。这是小样本正常访问诊断，不是浏览器渲染或并发压测；未满足原≤10%性能目标，保留性能待办，不影响本轮“正常跑通”的事实。 |
| 正常工作量Core回放 | journal仅覆盖约2天/68个周期，不足完整7日；观察峰值1538候选/42源次与最大24新条目用于本轮普通回放（不再2倍）。并发2，42源次完成，received1538、created24、duplicates817；剩余为批内去重/过滤，received不等于实际入库。Raw 5802→5826、Event 5730→5731、Observation 5847→6688；入库9,297ms，含后续快照总14,094ms，进程末尾RSS345,182,208 bytes。所有输入由冻结Raw重构并用collectorOverride注入，经过实际Acquisition/Core/SYSTEM锁及持久化，但不含Feed解析/上游网络/完整SYSTEM扩展阶段，不能称完整真实上游周期。 |
| 夹具与PG | 测试来源会改变独立参与者及精选，因此回放后168精选与合成版本归并不作为质量证据。回放后重新从冻结dump恢复独立库，确认5802 Raw、5730 Event、测试Source0、ai_runs0；重新创建独立管理员并刷新491事件/54精选/14练习。最终连接2/max16，appRole非超级用户；这是收尾快照，不代表全程连接峰值或无连接饥饿证明。 |
| 收尾与回退 | 独立暂存恢复演练与回放夹具清理成功；只证明公开内容暂存dump可恢复，不冒充生产完整备份/恢复验收。已停止本任务暂存Web/PG及临时构建/回放服务，受保护数据/产物保留，避免常驻占用；现役SYSTEM release仍是`20261016-p3-gap-fix`，原timer active、首页200。未发布、未开AI。 |

证据：本机忽略目录`.runtime/p4f-normal-stage-results.json`与服务器暂存`artifacts/normal-stage-results.json`保存非敏感HTTP/回放/清理检查；正常构建与回放退出结果位于`opc-p4f-build-normal-20261017.service`、`opc-p4f-replay-normal-20261017.service` journal。本轮runtime脚本和测试管理员凭据不入Git。资源读数属于实测记录，不能代替稳定性或独立质量验收。

下一步：优先独立官方发布分母与精选/热点正负样本，补真实关系/表达AI质量兼容后再讨论启用；API大载荷和时延增加保留性能项。生产完整备份/恢复、切换和72h观察尚未执行。按用户本轮明确要求，暂不发布。

## Task 5G Duplicate / Independent Quality / API Performance Decision Brief

Task ID SOURCE-RADAR-P4G；管理员/运营，来源管理→热点追踪，UI KEEP。用户要求继续检查Muse重复练习、解释热点过低、补独立质量验收并处理接口性能；沿用“暂不发布”，无生产写入或AI启用授权变化。Must Know为生产Event/Cluster映射、真实快照字段体积、当前聚类调用链、Momentum门槛、独立发布记录和冻结asOf；Nice为更多源目录；不加载课程/历史批次。

根因证据：生产P3的14个Muse相关Event各占一簇；P4仅在摄入/Signal调用聚类，不保证历史重复重算。生产快照492项/14练习/1热点；story约7.52MB、evidenceLinks4.90MB、presentation3.04MB。不能把所有缺口归因未发布，不能以更多条目代替质量。

方案：复用现有SYSTEM增加确定性、可恢复、逐事件版本检查的历史聚类修复阶段，沿用全成员冲突检查和锁；快照接口仅投影已批准UI实际消费字段，原文引用/资料与排序保留，审计metadata留在服务器；操作状态仍每次实时读。独立分母先冻结官方上游发布记录及证据，再对照库和栏目，已观测样本不能充当独立漏报分母。拒绝仅在UI按关键词去重、降低热度门槛或只缓存掩盖查询开销。

Core负责重算/版本/事务、传输投影/权限和验收；AI/Skill本轮关闭，不产出真值；Workflow沿用唯一SYSTEM，无新timer/Schema/Provider。Human只审核实际新增可视化变更（本轮无）；不新增逐源/事件审批。数据读为公开内容及非敏感运行信息，写仅开发/独立暂存的簇、policy、快照与夹具。外部副作用仅公开上游只读核验，不注册Source或采购。

Acceptance：截图同次模型发布在隔离库经现役Core重算后只保留一canonical候选、退出工具练习，保留原文与首次触发审计；合法工具历史触发归一展示；版本/后续动作负例不误并，重跑幂等；真实数据报告热点门槛失败原因，不能作虚假热点；独立参考先冻结再查库、足够样本及正负标签逐项披露，不足保持UNKNOWN；正常配置同冻结数据API payload/P95对比，权限、实时归档、资料详情和排序无回归。typecheck/build、采集回归、开发PG相关验收与文档治理通过。Rollback为还原本轮代码、停止本任务暂存服务，聚类映射只能从隔离备份/审计恢复；生产未变。Owner为采集合同/实现映射、本计划及既有质量fixture，状态仍NOT_DEPLOYED。

### 5G 栏目边界裁决（用户2026-10-17明确确认）

用户确认“热点练习的信号应该是热点；练习聚焦Skill/MCP/Agent/工作流等可实操工具”。以此覆盖本计划此前“所有明确AI模型主题+分析即可练习”的旧规则。讨论热度与事实权威分离：原来的多独立原发布者+实质分析/应用信号进入有时间衰减的热点判定，AI不授予Fact；练习另外要求明确工具主题及已验证可操作材料。纯模型发布/平台上架不进入练习，旧触发记录保留审计但重新按当前范围过滤显示。分类以原始标题/资料判断，不依赖AI改写标题；栏目数量减少也不得放宽工具材料Gate。历史聚类修复仍服务热点、资料归整及合法工具练习，不再以“Muse练习必须显示一条”为最终产品验收；同次发布只一热点候选、模型练习应为0。

### 5G 实测与验收状态（2026-10-17）

工程状态 IMPLEMENTED / DEVELOPMENT_ACCEPTED / NOT_DEPLOYED；质量状态 NOT_ACCEPTED，继续遵守暂不发布。没有UI/课程改动、采购或真实AI调用。

- 历史重复：真实隔离PG中7条Muse旧触发经同SYSTEM锁的版本补聚类合成1条、保留10个原文链接及首次触发，5730个原始Event未删除。应用用户新边界后最终七日快照478项、精选53、热点展示10（展示上限，非全部合格数量）、练习0、Muse仅1个canonical候选且练习0。练习0反映当前已采数据缺少同时满足工具/独立讨论/验证材料的条目，不以模型发布充数，不代表已完成优质工具覆盖。
- 热点：生产P3只读快照492项/14练习/1热点；旧版本与缺历史补聚类确实影响结果，另有规则/证据链和运营归档因素，不能归因“只差发布”。v8保留原时间窗口/42分/衰减，合格原文讨论可跨同一WEB平台；只讨论热度，不授予事实权。
- 独立参考：查库前预选6个官方Feed并冻结7日全部有日期条目，63个不同URL，保存上游文档SHA256和抓取时间；Qwen此窗口0条、arXiv只取上游20条，不能代表全网/全历史。新增fixture `scripts/fixtures/radar-independent-official-v1.json`。生产仅READ ONLY对账：63/63可找到Raw，25可见、7首缺口VISIBILITY、31首缺口EVIDENCE；URL可关联多个事件，不把25/63当召回率。
- 质量限制：60篇已满24h、3篇观察窗未满；31篇发现时间不可确认，24h发现召回UNKNOWN；精选/热点/练习独立正负标签均0，精确率/召回率UNKNOWN。Observation每Raw/Source仅一行，observedAt与context随重采更新；42条当前首次可查询observedAt已晚于冻结asOf，不能据此声称首次发现慢或首次SYSTEM缺失，报告的57.73h仅旧算法已知子集的观察时间差，不作为真实首次发现时延验收。记录创建时间也不证明当时是SYSTEM；后续需明确首次SYSTEM凭证。已识别Open SWE/部分DeepAgents文章相关性Gate、被归档的MCP文章与部分证据归属缺口；归档不得自动恢复。
- API性能：同一暂存数据库、同一新快照、真实管理员会话、每版20次串行loopback请求；P3 baseline响应19180419 bytes，候选8851138 bytes（减少53.85%）；warm median157.345→120.935ms，P95 185.58→166.90ms（下降10.07%）。候选首次请求613.90ms；baseline进程已有前序请求，不能比较cold。首页200、匿名管理API401、授权快照/热点页/来源页200。仅序列本机测量，不代表公网/并发SLO；剩余8.85MB公开正文负载仍偏大。裁剪不改变持久审计、资料原文和现有UI消费字段。
- 复核：修正独立教程URL未并入材料Gate、历史Agent模型漏过工具过滤，及负面模型词误杀实际工具教程；均补先失败后通过反例。参与者仅由合格报道计数，材料链接不制造讨论人数；分类依赖原始标题/Event分类，不依赖AI改写。真实PG最终canonical-event与event-expression验收PASS、外部采集0/付费模型0，夹具清理，mock审计保留。
- 最终验证：83项quick（含typecheck）PASS，Linux正常配置build（103静态页）PASS；44.26秒、采样峰值1108811776 bytes（约1.03GiB），CPU60.15秒，生产健康保护未触发。独立复核三项修复闭环，无剩余确定问题；最终重新启动候选进行20次HTTP复测，响应8851139 bytes、warm median127.015ms/P95 186.68ms、首次936.47ms，权限与两页SSR通过。两次候选P95范围166.90–186.68ms，延迟稳定改善尚未证实；此前10.07%只为单轮结果。旧803文件包已被本轮修改取代，不能作为最终发布包；新804文件最终清单与远端候选逐文件normalized SHA256核对PASS、无差异。暂存Web/独立PG及本任务构建单元已停止，受保护数据/回执保留；生产首页200、唯一timer active、SYSTEM路径保持P3。无CPU/内存人工配额，暂存仅loopback及独立PG，生产Web/SYSTEM/Relay不切换。首次探针错误地要求整个库ai_runs=0，被已存在mock审计触发；改为本次前后差额校验后PASS（delta0、externalAttempts0），未删除审计。

下一步为补足工具正例与精选/热点独立正负真值、核对具体相关性/材料缺口和首次SYSTEM时间凭证；质量不得以工程PASS替代。生产完整备份恢复/切换/72h观察未执行，保持RELEASE_NOT_READY。

## Task 5H Tool Material Coverage / Independent Reference Decision Brief

Task ID SOURCE-RADAR-P4H；Goal为补工具练习源头/正文漏采与独立资料样本，沿用用户暂不发布、无额外人工逐项确认。角色管理员/运营；Product Surface来源管理→SYSTEM→热点追踪，UI KEEP。

Must Know：现役工具Feed/正文白名单、队列标题条件、原文可操作材料Gate、真实待补Raw、冻结独立参考；Nice为新增未核实目录，不加载课程/旧批次。Problem为5G新规则下练习0，候选队列标题只覆盖部分工具词，不能仅扩大模型报道量；同时独立正负资料样本不足。

In Scope：核验已有n8n/LangChain/Comfy等源与官方Skill材料，先冻结参考再对账；用失败反例验证工具正文队列漏项，修复必要的确定性入口，必要时增加已核实固定官方正文路径；评估资料是否可操作，原文日期与当前热点时间分开。Out of Scope：生产部署/写库、采购、真实AI启用、新UI/课程、任意URL代理、源身份复制、历史材料伪造当前事件、自动恢复归档。

Code负责队列/路由/材料校验/审计；AI与Skill不参与事实、栏目真值或状态写入；Workflow复用SYSTEM原阶段/锁/站点公平和退避，无新timer；Human不新增确认，既有UI冻结。读取公开Feed/文章和隔离PG，写仅仓库与隔离测试数据/受保护暂存回执，权益不变；外部副作用仅公开上游只读请求。

Options：扩工具词+已核实路由 vs 加大全网关键词搜索 vs 降低材料门槛。推荐修现有主链与固定材料出口，因为已有身份/Feed不应复制，全网持续搜索违反现有边界，门槛降低不能证明实操可用。没有运行回执的路线仅标候选，不宣称覆盖。

Acceptance：Skill/单数Agent及明确n8n/Dify/LangGraph操作文章能进入原队列；非工具/无材料/越界来源/未来日期仍失败关闭；真实原文验证有日期、hash、正文与材料缺口，旧材料不造当前热点。独立参考保存来源与判定理由，区分资料质量与需要独立讨论的栏目资格；不足样本不声称全量召回。Deterministic Validation为先RED后GREEN、相关PG验收、完整quick/typecheck/build、diff及owner链接；Human Review无新增视觉Gate。Rollback还原本轮增量代码、停止自有暂存服务，保留审计。Owner Files为采集合同/映射、本计划及现役fixture/validator，结束回写PROJECT_STATUS/TASKS。状态IMPLEMENTED / DEVELOPMENT_ACCEPTED / NOT_DEPLOYED；栏目质量NOT_ACCEPTED。


### 5H 实测与验收状态（2026-10-17）

- 修复工具正文队列漏项：Skill/单数Agent/n8n/Dify/LangGraph/LangChain等按JS/PG共享词边界入队，Shareholder等子串不误入。实际隔离PG反例RED→GREEN，原来源/时间/公平/退避/CAS保护保留；直接原文材料资格原先未传到练习报道，已用反例修复。
- 两条既有官方Feed（n8n、LangChain）经现役Relay成功，先冻结7日有日期全部返回条目共17个唯一URL，再查库。没有新增Source身份/路由。Anthropic Skill文章为2025年历史参考，不伪造当前事件。生产对账仅只读：17/17有Raw，5可见、10首缺口EVIDENCE、2 VISIBILITY；同一URL可关联多事件。16个成熟参考中11个时间未知，Observation会更新，不把报告的50.58小时中位数当首次SYSTEM发现延迟；24h召回及三栏目精度/召回UNKNOWN。
- 查库前预选8篇实际正文并保存hash/时间，冻结探索性资料标签2 POSITIVE / 4 NEGATIVE / 2 UNKNOWN。初始6个已标注样本TP2/TN1/FP3/FN0，暴露编号架构、冒号散文、人工申请凭据误判；修复后同hash正文TP2/TN4/FP0/FN0，另2 UNKNOWN保留。该集合规模小且非盲评人工gold，不代表全网、栏目质量或工作流执行成功。独立review另发现optional整行绕过与Open n8n/ComfyUI操作误杀，两项均RED→GREEN并复核关闭，无剩余确定P0/P1/P2。
- 正常Core暂存回填：8个预选URL匹配8个Raw，3个到期选中并FETCHED，分别仍缺操作步骤/人工凭据条件，其他5个未被队列本轮选中；未强制重抓或造资料。真实PG+mock验收再次PASS，4次mock上游、无付费；finally清理验收数据。
- 暂存快照刷新PASS：478个可见事件、53精选、0练习；当前投影12个热点合格、UI展示上限10。练习原因可重叠：393非实操工具、469缺多独立发布者、255缺分析/应用、472缺已验证材料。说明当前瓶颈仍有讨论/材料关联缺口，不能归因仅未发布或通过降门槛填充。快照内存序列化22016490 bytes并非HTTP wire payload，本轮未重复接口负载对比，5G性能限制仍有效。
- 最终83项quick含typecheck PASS；正常Linux build PASS，44.27秒，采样峰值1071620096 bytes，CPU61.87秒，无人工CPU/内存配额，生产健康保护0失败。正文回填与快照AI审计增量均0，未开启模型或付费服务。现有UI/课程未变，生产Web/SYSTEM/Relay未发布；质量保持NOT_ACCEPTED / RELEASE_NOT_READY。
- 最终候选805文件normalized SHA256逐一核对PASS、0差异，旧804文件清单被本轮取代；本任务暂存PG/构建已停止，受保护回执保留。收尾生产首页200、唯一SYSTEM timer active、current仍为20261016-p3-gap-fix。current owner链接与CRLF-aware diff检查PASS。
- 下一步：沿同一工具主题扩充独立原作者的实测/教程资料并校验关联，补正负栏目独立标签及可靠SYSTEM首次发现记录；不复制Source或把所有教程自动当热点。固定官方长文样本仅提供材料检查，不替代讨论度、时效和独立发布者要求。

## Task 5I Source-backed Incremental Tool Discovery Decision Brief

Task ID SOURCE-RADAR-P4I；Goal采用已核实成熟实现修复持续工具发现与首次发现可追溯性，补独立作者资料/标签判据。角色管理员/运营；Surface来源管理→唯一SYSTEM→热点追踪；UI KEEP。Must Know为Observation写入、查询账本与关联/栏目合同，Nice为新平台框架，Do Not Load为课程/旧批次。

Problem：同plan两次无新增永久停止且Brave前三项仅中文，Observation重访覆盖时间；缺独立栏目判断证据。In Scope为成熟方案一手研究、原链有限时间窗去重/跨语言公平、新Observation首SYSTEM回执及历史UNKNOWN、独立作者材料与证据型栏目标注。Out of Scope生产写库/部署、迁移、AI启用、源身份复制、降低讨论/时效/材料要求、全网持续关键词扫描、UI/课程。

Code负责确定性查询计划、时间与验证；AI/Skill不授予事实或栏目权威、不写库；Workflow复用SYSTEM锁、原6小时冷却/日请求边界及主备路由；Human不加来源逐条确认，无新视觉Gate。Data Read公开一手文档/作者页、隔离PG；Write仓库/独立暂存/审计；权益不变，外部仅公开只读获取，无模型费用。

Options：替换整套爬虫 vs 移植成熟去重/时间语义到原链 vs 添加启发式权重。推荐移植并用现有反例验证，因为已有Feed/API/Relay与身份主链；来源：本轮一手研究文件（设计证据，不是新current rule owner）。不照搬Miniflux迁移回填历史时间，不将TREC未判定当负例。

Acceptance：同轮请求不重复、已有冷却后可发现新资料，失败退避/并发租约/日界限不绕过；Brave小预算覆盖中英资料；新SYSTEM首次时间重访不变，非SYSTEM/输入伪造不能授予回执，旧未跟踪记录不伪造历史首见；同主题、版本/作者/转载去重校验仍生效。正负标签须有外部内容与时效/讨论证据，不能由被测评分器生成；不足保留UNKNOWN并列出未验收项。

Validation先RED→GREEN，相关PG验收、完整quick/typecheck/Linux build、独立review、diff与owner链接。Rollback还原本轮增量，停止自有暂存，不删除审计；无生产更改。Owner为采集合同、实现映射、本计划、既有查询/Observation/漏斗代码与fixture。状态IMPLEMENTED / DEVELOPMENT_ACCEPTED / QUALITY_NOT_ACCEPTED / NOT_DEPLOYED。

### Task 5I 验收与剩余边界（2026-10-17）

- 一手依据及适配取舍见[成熟方案研究](2026-10-17-tool-discovery-primary-research.md)：采用Scrapy请求去重与持久调度原则、Miniflux发布时间/入库时间分离、Brave查询能力及W3C PROV归属原则；未照搬历史时间回填或编造热点权重。现有6小时冷却映射为查询generation，同轮停止不再永久封死后续搜索；Brave按原排名交替中英，保留已有租约、退避及日请求边界，不增加采购。
- SYSTEM新增Core生成的首次发现回执，记录真实CollectionRun；重复及并发更新保留首见。旧Observation仅记录升级后已知时间，不冒充历史首次发现；跨Source任一历史覆盖未知时，总体首次发现仍UNKNOWN。独立review发现的跨Source误授已知时间问题经失败反例修复，隔离真实PG再次通过。未部署前生产不会生成新回执。
- 新增7篇独立编辑研究池，见`scripts/fixtures/tool-author-editorial-pool-v1.json`。Simon两篇只计一个作者；Simon/Eugene共享MCP但为不同项目，n8n官方/独立作者共享工具但不同实现及日期，不当同一发布事件。资料归属有原文依据，尚无该池关系准确率结论；不复制Source、不自动准入新域名、不将教程直接升级热点。
- 通过现役Deno正文出口实取Simon长文、Eugene新闻Agent、n8n官方文章共3篇并保存正文哈希；Simon短文提取不完整，不能计材料成功。Eugene首次探测因暂存进程缺已有作者Feed开关失败，继承现役该开关后重试成功；不是生产故障。新增两位n8n作者仅为研究候选，持续采集路由和外部附件仍未验证；官方长文仅提供材料检查。
- 三栏目标签独立于被测排序：精选1正/5负/1未知，热点0正/5负/2未知，练习0正/6负/1未知。标签来自原文、日期和材料事实，是非盲探索性判断，不能充当人工Gold。历史文章不满足当前时效；热点/练习正例尚缺讨论度、当期独立发布者和完整材料，不算质量验收通过，也不以未判定冒充负例。
- 最终84项quick（含typecheck）全PASS；首次回执、持久查询、漏斗三个隔离真实PG验收PASS，上游mock且真实模型/付费调用0。Linux `npm run build`成功，候选809文件哈希全部一致；构建48.31秒、25次采样峰值约1.04GiB，生产探针无连续失败；采样值不是全生命周期严格峰值，不是接口性能改善证据。独立review收尾无剩余新增P1/P2。
- 本轮自有构建与PG单元已停止；生产首页200、SYSTEM timer active、release仍为`20261016-p3-gap-fix`。没有发布、生产写库、AI启用或UI/课程修改。下一步

## Task 5J Current Tool Evidence / Route Qualification Decision Brief

Task ID SOURCE-RADAR-P4J；Goal补当期独立作者讨论/实测证据，核实候选真实采集路径及连续观察前提。User Role管理员/运营；Surface来源管理→SYSTEM→热点追踪；UI KEEP。Must Know为5I资料池、当前路由与Qualification合同、首次回执；Nice为更多抓取框架；Do Not Load课程和历史批次。

Problem/Why Now：资料池偏历史，热点/练习正例及连续SYSTEM时间未建立。In Scope公开一手检索、服务器固定出口探测、生产仅只读资格/运行证据核查、独立证据资料及验收记录；Out of Scope生产写入/发布、付费API/AI、重复Source、伪造运行或时间、降低栏目阈值、UI/课程。

Code负责现有采集/资格读取及确定性校验；AI仅研究整理，不授予身份或栏目资格；Skill研究一手来源；Workflow复用既有SYSTEM和固定Relay，无第二调度；Human不新增逐源确认。Data Read公开网页/Feed/讨论及只读生产运行记录；Write仓库研究资料、受保护暂存工件；Entitlement不变，External Side Effect限公开只读获取。

Options为立即扩大域名白名单或先取得当前证据/持续运行资格。推荐先核实，因单篇可读不等于稳定来源，也不能用旧教程补当前讨论。Acceptance：日期/原作者/同工具不同事件可追溯，正例须有当期独立发布者、讨论与材料证据；未知保留UNKNOWN；路由声明/实际出口/资格分开，观察次数与时间实际记录；连续SYSTEM覆盖不足不计算发现延迟。

Validation复用相关材料/资格/首见校验，所有新增研究事实有原文和采样时间；业务代码若需更改先反例再实现并typecheck/build。无UI修改无视觉Gate。Rollback仅还原本轮文件/停止自有暂存；Owner本计划、现有采集合同/映射、5J一手研究文件及既有资料池；状态EVIDENCE_UPDATED / ROUTE_GAPS_CONFIRMED / NOT_DEPLOYED / QUALITY_NOT_ACCEPTED。

### Task 5J 结果与剩余验收

- 证据正文唯一见[当期一手研究及服务器核查](2026-10-17-current-tool-evidence-research.md)，结构化冻结为`current-tool-evidence-v1.json`。TLO新增探索性精选/热点正例；Character Swap v1.0为强练习候选但仍UNKNOWN，不虚报正式练习正例或Gold。
- HN官方API补绝对时间；Aboard原生RSS实取成功并提供精确首发/署名；TLO三份Skill/llms/deck材料按固定commit经官方Contents API冻结。研究HTTP、Deno实际出口、SYSTEM运行与资格分别记录；没有复制Source、批量准入或把全部教程当热点。
- 现有Simon固定Deno Feed/正文可取，正文共享材料判定仍失败；Eugene/Hamel Feed本次可取，Indus/Penumbra无固定材料路由。Rouage原生RSS和HF固定文档研究请求失败，尚未执行共享材料检查，状态为NOT_EVALUATED而非校验负例。Aboard现已找到原生Feed，但其SYSTEM固定出口和持续资格仍未完成。
- 两次生产强制只读核查之间出现自然SYSTEM新Run；近6小时选中Simon运行22/22成功、同checkpoint，最近5次资格样本成功5次。所查17条Observation及当期文章仍无新首见回执，5I尚未部署，延迟维持UNKNOWN；不以collectedAt或自然运行成功回填首见，不将约5小时44分样本说成72h/7日验收。
- 新证据纳入既有质量Validator；质量/首次回执/Qualification窗口/材料四项检查及typecheck通过。独立资料复核无阻断，未测false已按建议修正为null。没有业务运行代码修改，沿用5I构建结果作为该运行版本证据，本轮未重建发布包，不宣称新build或全84项重跑。
- 本轮无生产写入/发布、付费模型调用、新调度、UI或课程改动；没有启动暂存PG/常驻采集。本轮闭环是证据补充与真实差额确认，完整栏目质量保持NOT_ACCEPTED / RELEASE_NOT_READY。下一开发项为复用既有Source准入/固定Relay接入Aboard原生Feed及限定作者正文/固定仓库材料，保持原Qualification后观察，不将研究成功当AUTO_READY。正式练习正例及上线后可靠连续首见观察仍未完成。

## Execution Ledger

- Task 4C RED→GREEN：固定正文路径断言先因无路由失败后通过；开发库队列反例先失败（无日期参考被排除），改为有效Event关联的近期SYSTEM待审参考分支后PASS。保留已日期队列与null日期，不把收集时间写成发布日期。网络后URL/hash/Source与关联条件复核，不写过期结果。
- Task 4C Validation：真实PG+mock同SYSTEM锁验收通过，覆盖新旧队列、非法ID/过期/未来/归档Event、未来/过期收集时间、非待审/非参考、正文收据复用、并发输入变化、停用与抓取中归档，finally清理。72项quick回归含typecheck PASS，build（103静态页）PASS；独立review无Critical/Important，纯固定路由与原正文检查独立复验PASS。current owner链接与CRLF-aware diff检查通过，状态IMPLEMENTED / DEVELOPMENT_ACCEPTED / NOT_DEPLOYED；无生产修改、付费请求、AI调用、UI或课程改动。
- Task 4C Public sample（2026-10-16）：官方公开HF Feed返回200，观察到实际namespace文章链接；LangChain旧Feed经只读HTTP跳转至www.langchain.com/blog/rss.xml，现有固定Feed禁止重定向，作为后续修复缺口，不在本批修改Source。HF实际文章本机Node→本地Relay handler→匿名上游超时（RELAY_UPSTREAM_TIMEOUT）；PowerShell只读取得同篇HTML后交Node静态提取器，提取15738字符、0识别附件链接。后者仅证明该HTML可提取，不代表远端Deno/腾讯SYSTEM联网可用或实践资格；无业务写库/付费请求。
- Final minor (deferred): 本批输入变更验收同时修改URL/hash；后续可补URL、hash和sourceId逐字段独立变更用例，现有比较已实现，非阻断。

- Task 4B RED→GREEN：共享解析/Relay协议缺失反例先失败后实现；停用来源登记本应前置拒绝却触发空探测，开发库反例RED后增加读前保护，事务内复核保留，再验PASS。通用搜索被平台成功空结果饿死风险以实际SYSTEM来源选择函数反例RED→GREEN解决：已登记且启用Brave优先，平台作为单备用；关闭Brave回到原顺序，总预算不变。
- Task 4B Validation：71项quick回归含typecheck全PASS，build（103静态页）PASS；独立review无Critical/Important。其两项测试缺口已补齐：真实PG+mock验证非空结果经质量/相关性Gate入Raw，SYSTEM选择复用函数行为测试PASS。开发库同SYSTEM锁验收登记/审计、片段与null日期、两空持久停止、停用保护，finally清理；协议覆盖缺配置/Key、固定目标/Header/禁重定向/限额、429/畸形/容量/合法空与URL去重。无真实付费请求、采购、生产Source/部署、UI或课程改动。P3B为IMPLEMENTED / DEVELOPMENT_ACCEPTED / NOT_DEPLOYED；真实上游/费用/召回与P3其他范围未验收。

- 2026-10-16：已记录原始dirty基线，未覆盖用户改动；当前开始Task 1。无生产执行。
- Ruling: 首批可发布单元先收敛为P0入口修复及P1原生Feed/材料队列；机器扩源和P2–P4保留未完成状态 — 避免把未具备持久任务/真实路由与真值集的后续能力混入本批 — 代价是本批不承诺新增来源量或自动AI效果。
- Task 1 RED→GREEN：重要官方单源原先不能搜索，新增行为断言先失败；共享发布者、专属checkpoint与候选选择接入后通过。无健康搜索来源不占刷新名额，零查询计失败；正式练习门槛保持。
- Task 2 RED→GREEN：条件回执接口、合法空Atom与截断/畸形条目、公平顺序、跨500条分页反例均先失败后通过。原生Feed成功Run与Source checkpoint在同一PG事务提交。
- 开发库集成：使用SYSTEM advisory lock与独立临时测试Source，真实验证首次ETag提交、Raw写库失败不推进ETag、下一轮If-None-Match/304，最后清理测试Source/Run/Raw。仅Feed响应注入；没有采购、生产写库或真实采集。
- 独立review发现固定500条前置截断仍会饥饿；已改为一致性分页扫描，有限驻留队列、预读站点退避。每页500/最多100页，超过明确失败；新增反例通过。
- 最终验收：61项采集回归（含typecheck）全部通过；最终本地build通过。构建普通沙箱两次遇Windows EPERM，按相同命令在已授权沙箱外构建成功；没有部署。
- 开发库额外只读验证：真实材料分页SQL与SYSTEM补证候选SQL通过。Feed集成验收进程exit 0，测试数据清理完成。
- 最终独立复核：唯一搜索名额后其他槽位仅refreshDue，SYSTEM在候选截断前选择；三个search-only挤占刷新反例RED→GREEN，复核无新增阻断。
- 文档治理：current owner已同步实际实现；Windows CRLF按`git -c core.whitespace=cr-at-eol diff --check`检查通过，未修改仓库Git配置。生产事实未改。60事件真值集、100对聚类集、负载/72h观察和后续阶段均未验收，不能报告全规格完成。
- Task 2B Ruling：机器准入先启用现有PUBLIC_SOURCE_DOCUMENT三个域名；其他站点的真实路由/watchlist作为后续缺口，不新增通用HTTP出口。网站参考身份不冒充作者或官方身份；代价是本批新增来源范围有限，不承诺生产新增数量。
- Task 2B RED→GREEN：主页链接/日期/未知路由策略、当前checkpoint筛选函数、自动治理仍需人工解锁反例先失败后通过；开发库旧job借用当前租约注册反例先失败，增加jobId提交校验后通过。
- Task 2B 开发库验收PASS：仅开发目标、SYSTEM同锁、模拟Relay与真实PG，审计失败回滚、两并发同一Source、重复输入不重探、失败退避、35秒不开新探测、归档不复活、伪造/旧租约拒绝。合成Run只验证“1新+4旧不成熟、5当前可成熟”，全部测试Source/Raw/Run/审计已清理；未将其算作生产运行证据。
- Task 2B 最终验收：62项quick采集回归（含typecheck）全部通过，本地build通过；独立只读review未发现阻断，另独立通过自动准入/治理执行/Qualification三检查。生产、真实上游连通、更多站点与72h效果仍未验收。
- Task 2C Ruling：现有AIHOT Adapter只声明固定JSON快照，未验证分页/cursor协议；本批实现条件快照与稳定ID，不编造since/next或历史保证。GitHub趋势仍为发现Signal，Release分页与watchlist路由缺口保留未完成，代价是仍有覆盖上限。
- Task 2C RED→GREEN：Relay丢失ETag断言实际失败后修复；新增API条件回执缺失断言实际失败后实现；并补齐数字ID、合法空数组、无items/非法JSON、120条截断、旧200回执、协议304、非法Header、状态类型与超时反例。
- Task 2C 独立复核发现目标ETag会错误归属重定向初始URI；Relay/API两反例实际RED，复用documentHttpValidators按有效URI丢弃目标validator并拒绝跨URI304后GREEN。独立复核确认阻断关闭，另通过Relay/API/原生Feed纯检查。
- Task 2C 最终验收：64项quick采集回归含typecheck全部PASS，本地build（103静态页）PASS；开发库同SYSTEM锁、真实PG+模拟上游，PUBLIC_SOURCE_DOCUMENT/DEEPMIND_FEED/AIHOT三链路全部PASS，验证失败Raw不推进、304持久化、非法JSON/容量、回填/资格不推进及Route隔离。测试夹具清理；未部署、无真实上游效果或72h观察结论。CURRENT_SYSTEM_FACTS保持生产事实。
- Task 2D Ruling：先补已有Source的固定Feed传输范围与四组只读覆盖诊断，不为期待对象自动创建官方身份；归档/停用/重复身份保留缺口。12个已有Source/13个URL是传输配置数，不是新增健康来源数；代价是完整覆盖仍需逐项闭环。
- Task 2D RED→GREEN：未知WATCHLIST_FEED返回400反例先失败后通过；seed重新启用字符串断言先失败后移除状态覆盖；Deno实际导入目标存在性检查暴露conditional-http.js缺失，改为真实共享JS+d.ts后通过。精确URL/参数/认证/域名后缀拒绝、无开关不直连、200→304/503/302与白名单对应现有声明路由通过。
- Task 2D 目录诊断（开发库，只读）：39个期待对象中35个TRACKED_NOT_PROBED、3个INACTIVE_EXISTING、1个IDENTITY_AMBIGUOUS。Anthropic/Hugging Face/Claude Code已有历史记录，Simon有两条current身份；未恢复、合并或新建Source。四组数量有交叉且只是配置诊断，不是生产覆盖率。
- Task 2D 有界真实上游探测（2026-10-16 11:16 UTC，本机Node→本地Relay handler→真实公开Feed，不是远端Deno或生产SYSTEM）：BAIR 10条/10条带日期、未截断且有validator，LIVE_FEED_SAMPLE；OpenAI 100条/100条带日期、truncated=true且无validator，FETCHED_NOT_COMPLETE；LangChain RELAY_UPSTREAM_NETWORK_FAILED，UNAVAILABLE。没有Source/Qualification/Run业务写入，不推断总体召回或时效。
- Task 2D 开发库验收PASS：唯一SYSTEM同锁、仅独有临时Source，验证导出SQL谓词保护读后停用/归档/退出目录/managementDisabled；原子合并保留其他metadata字段，finally清理；没有执行整批portfolio seed或修改既有来源。
- Task 2D 回归修正：原021静态测试要求旧enabled表达式，与并发保护冲突，改为验证实际保护调用/SQL谓词且禁旧表达式；退役source-watchlist.ts路径的禁止断言继续保留，新只读模块命名source-coverage-report.ts。独立复核及收尾复核均无重要问题；66项quick采集回归含typecheck全PASS，本地build PASS。
- Task 2D 部署/回退：尚未部署，不改CURRENT_SYSTEM_FACTS。操作唯一owner见Relay DEPLOYMENT.md；必须先验证远端v8/条件协议/固定Feed能力，再同步Node与开关；缺开关明确不可用，关闭仅停止新出口，恢复旧行为需同版代码回退。Release/API分页、更多源头、全文材料缺口与P2–P4仍未完成。
- Task 2E Ruling：仅对4个固定公开仓库的显式Source Route新增Release能力；不重建/恢复归档Source，目录未切换。page/per_page是上游分页协议，Source续页只是本地遍历进度；始终声明非完整历史，AIHOT仍维持无cursor快照。代价是本批能力就绪不等于生产新增内容。
- Task 2E RED→GREEN：缺分页导出、Relay未知Provider和Runner未接线的开发库验收均实际失败后实现；首页/前页重叠、持久恢复、插入新头部、重复ID、空页、非法结构/链接/日期、跨仓库Link、页限、取消、缺开关/429/302均通过。
- Task 2E 真实协议修正：首轮公开探测被严格Link校验拒绝，核对GitHub公开返回，发现其使用数字仓库ID别名；查询4个官方repository API核验固定ID，再补命名/对应数字ID的相邻页校验，只重建原命名白名单URL。数字ID真实例RED→GREEN、跨仓库拒绝PASS；max1000页的next1001反例亦先失败后修复，仅作页限证据，不可请求1001。
- Task 2E 开发库验收PASS：同SYSTEM锁，独有临时Source+模拟上游+真实PG；首轮[1,2,3]→next4，429/Raw写入失败均保留4，恢复[1,3,4]→next5；回填/资格不推进，Route ID变更隔离。夹具Source/Raw/Run清理，未调用整批seed或修改既有目录。
- Task 2E 真实公开小样（2026-10-16 11:30:58 UTC）：本机Node→本地Relay handler→anthropics/claude-code API，三页[1,2,3]共90条/90条有日期，next4、sweepReachedEnd=false、BOUNDED_PAGES_NO_ARCHIVE_GUARANTEE；无DB业务写入，不是远端Deno/腾讯SYSTEM或召回率验收。
- Task 2E 最终验收：67项quick采集回归含typecheck全PASS；页限收尾反例修复后单项复验PASS，本地build（103静态页）PASS；独立复核与数字ID/页限收尾复核无重要问题。新增文件随Deno v9发布，操作/开关/回退唯一见DEPLOYMENT.md；本批未部署、无采购/AI调用/视觉或课程改动，其他watchlist/API及P2–P4继续未完成。

- Task 3 RED→GREEN：Gateway显式输出/思考/usage与无翻译调用、持久任务/版本/预算反例先失败后实现；复用理解Validator并删除实际全文翻译函数，任务失败与采集/快照分离。每次请求前记录attempt，已返回usage在JSON/语义校验前留存。
- Task 3 开发库验收PASS：唯一SYSTEM同锁、独有Source/Raw/ai_runs夹具、真实PG+mock Provider，当前理解展示、重复/并发不重调、其他metadata保留、材料变化及旧jobId拒绝、失败退避、退避中非输入正文revision同步、过期RUNNING转ABANDONED、来源停用后拒绝写入、非法JSON保留usage及修复网络失败整体UNKNOWN均通过；finally清理，真实付费调用0。
- Task 3 独立review发现真实read-model未传author/publishedAt/contentHash，v3理解会全回退；新增投影边界断言实际RED后四处传完整Raw变GREEN，开发库补当前显示验证。另一问题为FAILED/RUNNING非输入正文变化持续占据候选窗口，已同输入各状态同步revision且保留退避/租约，开发库反例PASS。收尾复核无重要新问题。
- Task 3 最终验收：69项quick采集回归含typecheck全部PASS，本地build PASS；学习洞察Task A/Task B及Event AI共享Gateway回归PASS。无UI/课程改动、采购/真实AI调用或生产部署；Provider思考参数兼容、真实内容质量/费用及72h生产效果仍未验收，不宣称自动覆盖全部材料。下一任务P3源头发现与补证，P1剩余watchlist/API缺口与P4保留未完成。

- Task 4A RED→GREEN：缺持久查询策略/事务领取导出反例先失败后实现；B站code非0被当空成功的反例先失败后修复；新增零查询无控制原因不能报告成功反例RED→GREEN。复用ExpansionRun请求账本与Event/Source行锁，不新增服务/Schema/Source身份。
- Task 4A Review：独立复核发现读取100条旧历史会永久停搜，100条25h旧其他plan反例实际RED；SQL分开筛选24h预算与同计划成功历史、移除永久长度禁用后GREEN。另补主源持久退避转备用及共享预算反例。收尾复核无重要新问题；统计仅“新增已接受参考”，不冒充有效独立事实/完整材料。
- Task 4A Validation：70项quick采集回归含typecheck全PASS，本地build PASS，current owner链接与CRLF-aware diff检查通过。用户补充ubuntu登录后使用本机已有密钥恢复开发库隧道；首次PG夹具遇Source type/providerRef唯一约束冲突，改为独有providerRef并保留collectionConfig真实Provider，未修改既有来源。真实PG+mock上游验证计划停止/重启、输入变化不能逃逸6次日上限、并发只领一次、重复去重、过期租约、事务插入失败回滚、失败退避和停用保护，全部PASS且finally清理；纯策略与typecheck再次PASS。状态IMPLEMENTED / DEVELOPMENT_ACCEPTED / NOT_DEPLOYED，Task4A闭环。无生产修改/采购/真实付费调用/UI或课程改动；真实上游效果与P3其余范围仍未验收。
