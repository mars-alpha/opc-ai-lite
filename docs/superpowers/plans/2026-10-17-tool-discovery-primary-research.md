# 工具主题发现：成熟实现与可移植边界

日期：2026-10-17（Asia/Shanghai）。状态：一手资料核查完成；建议不等于已部署行为。本文件是本次方案取证附件，产品规则仍由 Collection 合同负责。

## 研究边界与结论

只研究改变本次实现和验收的资料：请求去重、可恢复 frontier、按主题增量发现、原作者溯源、首次 SYSTEM 发现、独立栏目标签。未写库、未部署、未调用模型，未修改业务代码。固定官方长文只验证材料质量，不能证明讨论度、时效或独立作者数量。

建议复用现有 SYSTEM + PostgreSQL + Deno 主链，移植下述机制，不另装一套 Scrapy/Miniflux 平台。采集成熟组件能够证明怎样可靠发现和记录资料，不能替本项目决定“哪些是热点”；没有找到可直接移植且已经验证适用于本项目的统一热度权重。因此不新造分数、权重、参与者阈值或发布时间。

## 1. Scrapy 2.13.4：请求身份与持久 frontier

已核实固定版本：默认请求指纹涉及规范 URL、HTTP method、body；`RFPDupeFilter.request_seen` 保存指纹并可写入文件；Scheduler 存储、取出请求，支持持久队列与去重。来源：[2.13.4 去重源码](https://raw.githubusercontent.com/scrapy/scrapy/2.13.4/scrapy/dupefilters.py)、[2.13.4 指纹源码](https://raw.githubusercontent.com/scrapy/scrapy/2.13.4/scrapy/utils/request.py)、[2.13 Scheduler 文档](https://docs.scrapy.org/en/2.13/topics/scheduler.html)。

可移植：把“主题发现任务身份”和“正文 URL 身份”分开；同一个 Source 的主备路由共享逻辑身份；可恢复任务记录保存 generation、provider、query、cursor、结果覆盖与失败，不靠进程内集合。正常更新和周期重查应创建明确的新 generation，不能使用全历史已访问集合永久禁止后续新内容。任务租约和幂等落库继续由现有 Core 负责。以上是对本项目的适配推论，不是 Scrapy 的热点算法。

不可照搬：Scrapy 默认深度优先顺序不是独立作者公平队列；请求指纹也不等于作者身份、原始报道身份或事件聚类。不要为了采用 Python 框架新增常驻采集调度器。可恢复进程状态参见 [Jobs 文档](https://docs.scrapy.org/en/2.13/topics/jobs.html)；该文档也说明 JOBDIR 对象需可序列化，不能把 Python pickle 存储方案搬成通用跨语言协议。

## 2. Miniflux 2.2.12：发布时间、入库时间、修改时间分离

固定版本 `Entry` 明确区分 `published_at`、`created_at`、`changed_at`。创建记录和刷新记录是两条操作；刷新不改发布时间，避免缺日期 Feed 用当前时间反复刷新排序。来源：[Entry 模型](https://raw.githubusercontent.com/miniflux/v2/2.2.12/internal/model/entry.go)、[Entry 存储实现](https://raw.githubusercontent.com/miniflux/v2/2.2.12/internal/storage/entry.go)。

可移植：记录生产者声明的发布时间；另记录受信 SYSTEM 路径在服务端真实发现的时间、最新观察时间与正文变更时间。重复抓取、重试、主备切换、操作员导入、观察上下文覆盖，都不能推进首次 SYSTEM 时间。须有源、路径、run、时间、版本以及历史是否可证明的 provenance。并发首次写入采用数据库原子条件，不以读出再覆盖代替。

不可照搬：该版本历史迁移曾把既有条目的 `created_at` 回填为 `published_at`，所以不能宣称旧数据天然有真实首次发现时间。来源：[固定版本迁移源码，created_at 迁移](https://raw.githubusercontent.com/miniflux/v2/2.2.12/internal/database/migrations.go)。本项目应将无法证明的历史标为 UNKNOWN；本次重抓只能证明本次观察，不是过去首次发现。缺少发布时间的内容也不能自动用发现时间当新闻发布时间。

## 3. Brave Web Search：主题驱动检索与分页停止

官方文档支持精确短语、站点限定、排除词、语言、`freshness`；分页应检查 `more_results_available`，不是无条件翻到底。`count` 最大 20、`offset` 最大 9 是供应商当前文档限制，不是本项目质量阈值。来源：[Brave 官方 Web Search 文档](https://api-dashboard.search.brave.com/app/documentation/web-search/query)。本次只读取文档，没有发起付费 Search API 请求，也未验证项目当前密钥、套餐或真实检索召回。

可移植：从已验证 Event/工具版本和具体证据缺口派生查询，分别寻找原作者实测、教程、可复现工作流；针对确切工具名/别名/版本形成查询，结果再用正文核对关系。查询上下文含时间窗及缺口版本，允许新时间窗发现后出的教程；同 generation 的完成记录、租约、失败退避仍有效。成功返回空页应被如实记录为该页/该次结果为空，不能等同永久无新作者。

不可照搬：搜索排名、摘要中的日期、`freshness` 筛选都不证明文章真实发布时间，更不证明独立报道或可操作性。排除官方域名可形成“寻找独立作者”的检索通道，但不能替代身份核验，也不能永久屏蔽官方事实证据。查询模板与窗口是可审计实现策略，最终应比较冻结资料池的漏报和误报，不宣称供应商保证召回。

## 4. GitHub 官方 REST Search：结构化约束与完整性标记

官方接口允许搜索限定符；每次搜索最多提供 1,000 个结果，有单独搜索限额；超时可能返回 `incomplete_results:true`。来源：[GitHub 官方 REST Search 文档](https://docs.github.com/en/rest/search/search)。文档是动态接口说明，非冻结源码；当前项目具体请求头/认证资格需要实际适配验证，不能假定所有端点都匿名可用。

可移植：确认工具仓库后复用仓库 identity，围绕该仓库的 README、版本、issue/PR/讨论链接查找相关操作材料和作者；保留 query、分页及 incomplete 标记。新增发现的个人文章或教程应解析真实作者，不把 GitHub 搜索器注册成多个作者。

不可照搬：stars/forks/issue 数量不是实测质量，也不是独立发布者数量。搜索 README 命中只证明词项关联，fork、模板复制、同作者跨平台发布不能被算成新独立来源。仓库更新时间不等于教程发布日期。受限或不完整结果必须报告覆盖未知，不计算全网漏报率。

## 5. Hacker News 官方 Firebase API：讨论更新流

官方定义 `/v0/newstories`、`topstories`、`beststories`、`updates`，item 带作者及类型/互动等字段；`newstories` 和 `topstories` 列表最多 500 项。来源：[官方 API README](https://raw.githubusercontent.com/HackerNews/API/master/README.md)。该链接是动态 master，本次未冻结 commit，不能当不可变版本凭据。

可移植：用已出现的工具 URL、仓库 URL 或明确主题定位讨论，按 item ID 去重并跟踪更新；讨论正文/评论只提供有 provenance 的 Discussion/Demand Signal，独立投稿者身份和原文章作者身份分别保存。

不可照搬：官方 API 没有全文搜索接口；Algolia HN Search 是另一项服务，不能写成同一官方搜索能力。榜位/分数和一条 HN 转帖不能给原文新增一个独立实测作者。全站逆向走 maxitem 并不适合本次按主题的轻量增量任务。

## 作者与转载：证据图而非 host 计数

[W3C PROV-DM Recommendation](https://www.w3.org/TR/prov-dm/) 区分实体、活动、代理以及 attribution/derivation；可借鉴其显式 provenance，而不宣称它提供了自动识别转载的算法。建议沿用本项目现有 publisher identity 与 syndication gate：原文/作者主页/账号、明确引用与转载声明优先；同作者多平台、同机构多域名、聚合转载共享 origin。未知身份保留 UNKNOWN，不能因为跨站就算独立。正文近似只能发现待核对重复，不能在没有验证集的情况下任定相似度阈值。

工具关联也须分层：文章确实讨论同一工具/版本与是否可操作分别判断；“使用 n8n 集成另一工具”不能只因都出现 Agent 就混成同一个事件。引用链保存到同一 canonical Event 的资料详情，Source identity 不随搜索路径或单篇文章复制。

## 独立标签：借鉴 TREC pooling，同时保留 UNKNOWN

NIST TREC 2007 描述由多个检索 run 的头部结果合并、去重后构成 pool，再独立判断相关性。传统 TREC 一些评测把 pool 外未判断文档视为不相关，这是原文的限制，不适合直接搬入本项目。来源：[NIST TREC 2007 Overview §2.1.3](https://trec.nist.gov/pubs/trec16/papers/OVERVIEW16.pdf)。

NIST `trec_eval` 的固定版本 v9.0.8 `bpref` 实现明确跳过 nonpool / unjudged，不假设未评估就是不相关。来源：[NIST bpref 源码](https://raw.githubusercontent.com/usnistgov/trec_eval/v9.0.8/m_bpref.c)。本次不建议为了引用成熟指标直接增加 bpref；当前栏目是多条件资格判断，先把样本、分母和未知量做好。

本项目适配方法：

1. 先冻结多通道发现池、正文快照 hash、工具关联、作者 provenance 和 `asOf`，再运行待验算法；同时纳入各栏目的已选项，避免只检查预选官方源。
2. featured/hot/practice 各自记录 POSITIVE / NEGATIVE / UNKNOWN 和依据，材料合格不能自动推出 practice POSITIVE。练习正例还需讨论、时效、独立作者和工具条件。
3. 标签不能从被测函数输出反推。独立评估者必须先看原始证据和栏目合同，再看算法结果；开发者所作非盲探索判断应明确标为 exploratory，不能宣称金标。用户无需新增逐条人工审批；可以采用独立质检流程，但证据不足仍 UNKNOWN。
4. 分别报告已标注池 TP/FP/FN/TN、judged coverage、UNKNOWN、样本选择方式及 `asOf`；Precision/Recall 只称“冻结参考池指标”。没有全体真实正例，不声称全网 Recall。不能用 UNKNOWN=NEGATIVE 提高精度，也不能用官方长文材料检查代替栏目评测。
5. 时间质量另外评估：首次 SYSTEM 记录来源可靠、有真实发布时间、观察窗成熟才算发现时延；历史不可恢复、未来发布时间、迟到样本及未成熟观察窗分别报告。

## 本项目代码核对（本次读取时的候选工作树）

| 位置 | 实际观察 | 建议与验收 |
| --- | --- | --- |
| `managed-practice-query-policy.ts` | 同 plan 完成过的 provider+query 阻断；两次成功零新建后同 plan 停止；已有租约/失败退避/周期请求边界 | 引入可证明的主题/缺口/时间窗 generation，保留同代幂等；跨新时间窗可发现迟到作者，同代重复不请求 |
| `practice-discovery-policy.ts` | 工具/官方 seed 与材料缺口共同触发；材料已存在就不继续材料搜索 | 不把“已有一份官方教程”解释成独立作者覆盖完备；可按独立作者/实测缺口分开触发，但不得授予栏目资格 |
| `event-expansion.ts` | 已有 topic anchors、中英实测/教程查询和固定优先值 | 优先复用真实工具锚点，保存引用与版本匹配；不把这些优先值或关键词命中当成熟热度算法证据 |
| `discovery.ts` / `collection-runner.ts` | Runner 最终走 observation upsert；raw+source 冲突时 observedAt 被当前观察覆盖；同 context 被替换 | 增加可信首次 SYSTEM 记录和 provenance，最新指标继续更新；并发重试不推进 first，操作员路径不伪造 SYSTEM，旧记录未知 |
| `radar-funnel-store.ts` / `radar-funnel.ts` | 用最新 SYSTEM observation 与 collectedAt 推导 discovered；已支持独立 reference 与 UNKNOWN 栏目标签 | 禁止用被覆盖观察当首次；读取可信 first record，否则 timing UNKNOWN；固定标签先于被测结果 |
| `pollution-syndication-gate.ts` / `source-publisher-identity.ts` | 已有 canonical publisher、declared syndication、内容重复归组与 Source 首页/Feed 身份复用 | 增量完善溯源，保留现有主链；不新增按路径/文章复制的 Source |

这些观察只用于本次研究建议；并行实施可能更新候选代码，最终事实和验收以 Task 执行记录为准。

## 推荐实施次序及硬边界

先修可信首次 SYSTEM 与未知历史，再让工具主题查询按证据缺口和时间窗恢复发现能力；随后在同一主题里补真实独立作者材料、验证正文及关联；最后冻结正负/UNKNOWN 标签做对照。保留现有 Event Momentum v2 与练习既定资格门槛，先验证采集覆盖和关联修复能否改善结果，再讨论是否调整排名。

验收至少覆盖：同主题后续时间窗的新教程可进入候选；同作者跨平台/主备路由不重复计独立性；转载与模型上架不成为练习正例；工具仅被顺带提及时拒绝错误关联；官方完整材料仍不能单独晋级热点/练习；并发重复观察不修改首次记录；历史时延不能恢复时 UNKNOWN；栏目标签与材料标签互不替代。上述是本次项目验收条件，不是从外部系统复制来的最优阈值。

## 联网能力和限制

本次使用可用的 Search Service Web `open/find` 实际读取了上述官方文档、固定 release tag 源码与 NIST PDF。一次组合 search_query 返回空错误；改用官方精确 URL 后成功。旧 Brave 文档域名读取失败，改用其当前官方 dashboard 文档成功。部分旧 TREC URL 失败，改为实际可读的 TREC 2007 PDF。没有把失败 URL 当已核实证据。

Scrapy、Miniflux、trec_eval 采用明确 tag，不声称 tag 永不可变；未取得 commit SHA。Brave/GitHub/HN 文档和 W3C 页面实际可读，其中动态页面不证明本项目运行环境已连通。没有实测各方案资源占用、真实 Search API 覆盖或独立评测金标，因此本报告不提供未经验证的资源性能承诺、排名最优性或整体质量通过结论。
