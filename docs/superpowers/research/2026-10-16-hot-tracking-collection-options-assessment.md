# 热点追踪采集改进：成熟方案可行性评估

日期：2026-10-16（Asia/Shanghai）。状态：研究与决策建议，未实施、未采购、未改变当前产品合同。

用户已明确：主要不满为**内容少、更新慢、遗漏重要事件**；预算同时评估零新增采购和付费增强。目标覆盖「当前热点、AI热点练习、精选动态」。

## 1. 推荐结论

优先选择**现有主链补强 + 官方/作者 watchlist + 有界补证**。原生 Feed/API 为基础，RSSHub 只补明确缺口；AIHOT 等聚合源继续补发现。付费增强先对照 **Brave Search + Jina Reader** 与 **Tavily Search + Extract**，只选择一家通用搜索 Provider；Firecrawl 仅在复杂网页失败样本证明有收益后作限定备用。

不建议现在迁移至另一整套资讯平台，也不建议先降热点、练习、精选门槛。三个栏目共享采集，但需要的证据不同；只增加热榜源，无法稳定补足官方新发布与小众实操材料。

| 路线 | 对当前目标的可行性判断 | 选择 |
| --- | --- | --- |
| A. 现有 Core + 官方 Feed/API + watchlist + RSSHub 按需补路由 | 高；改动可局部回退，资源及业务状态最可控 | **零新增采购首选，也是付费档基础** |
| B. A + 一家托管搜索/正文服务 | 高，但中文覆盖、时延、正文收益需实测；需补 Provider 资格与部分合同范围 | **付费增强首选，先做同样本对照** |
| C. AIHOT / TrendRadar / NewsNow 作为聚合发现源 | 中；可补候选，存在上游筛选、缓存、Top N 及重叠依赖 | 补充来源，不作为唯一入口 |
| D. Inoreader 托管订阅聚合 | 中；可减运维，API 商业权限、刷新速度和额度有采购前置项 | 有大量难维护订阅时再选 |
| E. 迁移至 Miniflux / AIHOT / TrendRadar 整套系统 | 低；增加状态迁移、运维及现有产品整合成本，仍需自建练习判断 | 当前不选 |

“成熟”的依据是正式 API/文档、实际实现、发行及可运维机制；不是 star 数，也不代表本项目已完成生产验证。

## 2. 研究范围与证据等级

- **已核实**：本地 current owners、相关源码、外部官方文档/价格页及选定仓库源码。
- **工程推断**：接入难度、推荐组合、潜在瓶颈、资源适配方式。
- **待实测**：各服务在腾讯云/Deno 网络中的成功率、中文召回、真实端到端时延、材料质量、单位有效内容成本。
- 本次未访问生产数据库、未触发额外生产采集、未调用付费 API、未安装外部系统或创建服务账号。当前生产部署事实继续只以 [CURRENT_SYSTEM_FACTS](../../CURRENT_SYSTEM_FACTS.md) 为准。

Must Know：用户优先目标、唯一 SYSTEM/Source Owner、2核2G、已批准 UI、三个栏目门槛、来源/路由资格、服务计费和许可范围。Nice to Know：供应商便利功能及发行历史。未加载历史课程生产、旧 Manual/Preview 和无关批次。

## 3. 项目本地核查：先定位漏失发生在哪一层

当前主链已经存在，正文及字幕覆盖仍有明确缺口；不是从零建设采集平台。相关事实与边界见 [采集架构合同](../../content/COLLECTION_ARCHITECTURE_CONTRACT.md)、[实现映射](../../content/COLLECTION_IMPLEMENTATION_MAPPING.md)、[TASKS](../../../TASKS.md)。

| 核查项 | 本地可见依据 | 对“少、慢、漏”的影响与下一步 |
| --- | --- | --- |
| 调度间隔 | [timer 模板](../../../deploy/systemd/opc-collection.timer) 使用 `OnUnitInactiveSec=15min`；service 最长30分钟 | 模板意味着结束后再等15分钟，启动间隔约为本轮耗时+15分钟；还叠加 source due/退避。先核对生产 unit 和阶段耗时，不能把模板当生产实测 |
| 来源覆盖与网络路径 | current owners 记录部分海外 Feed 路由尚未覆盖；代码存在平台适配不等于来源已启用并健康 | 逐来源核对首次发布时间、due、Run、失败、备用出口；重要源长期低产出不等于低价值 |
| 聚合源已先筛过 | [AI HOT adapter](../../../lib/server/content/source-acquisition-runtime-adapters.ts) 最多消费120项，且过滤已提供的正分数低于60的项 | 在本项目再次过滤前已有上游窗口/评分选择；不能把聚合流视为完整原始流。限额和窗口是否造成真实遗漏须按样本验证 |
| 实践搜索前置条件 | [collection-expansion.ts](../../../lib/server/content/collection-expansion.ts) 用练习完整评估返回的 record 取得搜索人数 | 未具分析/应用内容时可能无法启动补证，存在发现自锁路径；需 fixture/回放确认影响，而非宣称已证明生产漏报数 |
| 材料处理容量和顺序 | [SYSTEM cycle](../../../scripts/run-server-native-automatic-cycle.ts) 每轮材料补全最多2篇，随后扩展最多3个事件；搜索最多一个事件/两查询/各五条 | 新扩展材料可能等待后续周期，需看候选队列年龄与每阶段耗时；不应直接无限加并发 |
| 发布者口径 | 搜索使用 hotParticipants；[快照](../../../lib/server/content/radar-snapshot.ts) 记录练习时改用 aiPracticeParticipants | 搜索与正式触发的输入集合需统一，防止候选断裂或平台信号误计 |
| 精选的下游门禁 | [curation](../../../lib/server/content/bole-daily-curation.ts) 需要可信确认、72小时内、MAJOR/NORMAL，FEATURED≥66 | 已采到但缺可信原文、时间或被规则分类排除，不会因增加抓取数量自然进入精选；逐项记录拒绝原因 |
| 详情曲线与正式热度 | [topic-momentum](../../../lib/server/content/topic-momentum.ts) 七日/72h；[heat shadow](../../../lib/server/content/aihot-heat-shadow.ts) 48h/24h | 时间尺度不同是现状；先回测各自召回和解释，再决定正式算法，不用改权重掩盖采集缺口 |

每个期望出现的事件都应归因到：`未覆盖来源 / 未到期或失败 / 原文未返回 / 前置过滤 / Raw去重或Event误合并 / 证据不足或栏目门禁 / 快照与展示延迟`。当前无分层人工真值和运行测量，不能给各原因虚构比例。

## 4. 成熟方案比较

### 4.1 官方 Feed/API + watchlist：最直接补重要发布

为重要机构、仓库、产品变更日志和高价值作者建立受管 watchlist；优先原生 RSS/Atom、GitHub Releases、机构模型更新和定向论文查询。现有同身份 Source 可加主/备用路由，不为 API/Feed 复制 Source。

- GitHub Releases 提供 release、发布时间、说明及附件信息，能针对真实版本变更；Trending 仅覆盖榜单，不能替代。[官方文档](https://docs.github.com/en/rest/releases/releases?apiVersion=2022-11-28)
- HF 关注明确机构/作者及模型 revision；`lastModified` 可能只是文件修改，不自动等于新模型正式发布。模型卡、授权、依赖和运行条件另核验。[Hub API](https://huggingface.co/docs/hub/api)
- arXiv 按主题/作者获取元信息并做重叠回扫及 ID/version 去重；摘要不证明有可运行代码。[API说明](https://info.arxiv.org/help/api/user-manual.html)
- 原生官方公告补精选；独立报道/作者补热点；教程、examples、工作流及 demo 补练习材料。不同入口的权威和材料等级分别判断。

**可行性：高，优先级最高。** 新增采购可为0；仍有工程、网络和维护成本。不保证穷尽全网，重点是覆盖事先定义的重点对象。官方 API 也有配额及适用条件，必须按接口限流。

### 4.2 RSSHub：补没有原生 Feed 的已知来源

RSSHub 有成熟路由、输出格式和部署机制，可作为 Generated Feed Adapter。原生来源优先；只对确有缺口、服务器能持续读取的路由启用。[指南](https://docs.rsshub.app/guide/)、[参数](https://docs.rsshub.app/guide/parameters)

默认内存缓存、路由缓存300秒；Redis可选。浏览器及 Cookie/API token 依路由而定，不能把“有该 route”当作已验收。公共实例无本次可确认的项目 SLA。默认完整 Compose 含额外组件，不适合未经量测就放进现有2G主机。[配置](https://docs.rsshub.app/deploy/config)、[部署](https://docs.rsshub.app/deploy/)、[公共实例](https://docs.rsshub.app/guide/instances)

**可行性：选择性高。** 零采购档作为按需补充；不全量部署、不追登录内容。缓存5分钟不代表原站到本项目5分钟必达；fulltext不保证动态站、付费站或完整附件成功。

### 4.3 AIHOT / TrendRadar / NewsNow：补发现与参考算法

| 方案 | 已核实能力 | 对本项目的取舍 |
| --- | --- | --- |
| AIHOT | 独立 participant 衰减热度、事件/故事关系、增量采集、编辑精选 | 可复用思路、继续作为发现源；精选输出不是完整内容流。本地已有热度 shadow，无需再起整套平台 |
| TrendRadar | 多平台热榜、RSS、词组/AI筛选、翻译及推送；默认热榜权重结合排名、出现频率和高位比例 | 可补榜单候选，不能把平台权重直接当 Event 独立讨论强度；默认依赖 NewsNow，与其他聚合源存在重叠 |
| NewsNow | 多平台实时热榜 adapter、自适应获取与缓存；GitHub adapter抓 Trending | 可参考或消费合格发现路由；不是官方 Releases 覆盖。当前 README 明示此版本不再接受贡献，计入维护风险 |

AIHOT 核查固定提交 `c8704e5`；详细证据见 [既有研究](2026-10-16-aihot-source-analysis.md)。[AIHOT 热度源码](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/events/hot.ts)、[部署资源说明](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/docs/deploy.md)

[TrendRadar 排序源码，657094e](https://github.com/sansan0/TrendRadar/blob/657094ed6a527441b917e16d9497fc8435ed091d/trendradar/core/analyzer.py)、[NewsNow README，0560c99](https://github.com/ourongxing/newsnow/blob/0560c993b226cd2fd07d8a79875d50551f52c584/README.md)。代码移植须分别核对原始 LICENSE；接入其接口不等于拥有可复用全部源码的相同条件。

**可行性：作为补充中等，整套替换低。** 聚合站可能互相订阅；同一原文经过多个站转发不能增加独立发布者。新模型刚发布、小众教程尚未上榜时，这类源仍可能漏掉。

### 4.4 Brave Search + Jina Reader：定向补漏与补文分开

Brave 普通 Web/News 搜索提供URL、标题、片段及时间/语言/域名控制；选择 Search，不使用 Answers 生成。适合已存在重要 Event 的独立报道、评测、教程补证；不将其改成全天泛关键词全网扫描。[API](https://brave.com/search/api/)、[查询参数](https://api-dashboard.search.brave.com/app/documentation/web-search/query)

Jina Reader 从已有URL提取正文，可使用普通 text/markdown，支持PDF。本项目已有 `JINA_READER` route kind，优先复用，但枚举支持不代表所有域名已部署通过。应关闭可选生成式处理，验证缓存、原URL、页面状态、正文质量和发布时间来源。[Reader](https://jina.ai/reader/)、[官方源码说明](https://github.com/jina-ai/reader/blob/main/README.md)

**可行性：条件性高，推荐进入付费档对照。** 托管请求减轻本地浏览器负担；两家 Provider 分工清晰。搜索片段不当全文，Reader不保证中文登录平台、字幕和附件可得。按明示允许的来源与路由经既有Relay/Adapter接入，不把Deno扩成任意URL代理。

当前产品合同只允许B站/YouTube实践定向搜索；增加 Brave 通用Web补证是**待确认的合同范围与Adapter变更**，不是本次已获得的生产授权。

### 4.5 Tavily Search + Extract：单 Provider 对照候选

支持 general/news、域名控制、时间窗口、中文及逐URL Extract；可减少 Provider 数。Search content是相关片段；Extract若带query可能返回裁剪内容，练习正文不能只存这些片段。响应成功仍需检查逐URL失败。[Search](https://docs.tavily.com/documentation/api-reference/endpoint/search)、[Extract](https://docs.tavily.com/documentation/api-reference/endpoint/extract)

关闭 `include_answer`，显式设置深度和预算；不能仅据关闭答案就断言供应商内部完全不使用模型。日期字段可能是估计发布/更新时间，也可能缺失，不能自动成为原发时间真值。

**可行性：条件性高，与Brave+Jina同样本比较。** 新增通用Web能力同样需要合同与资格变更；中文召回和正文收益尚未实测，不因免费额度就直接选定。

### 4.6 Firecrawl Cloud：复杂网页补文备用

Search、Scrape、Crawl、Map作用不同。项目优先选**限定URL的Scrape**；不默认运行整站Crawl。普通markdown与 `onlyMainContent` 可做确定性HTML主文处理；关闭额外LLM清洗/结构生成等可选能力。[Search](https://docs.firecrawl.dev/features/search)、[Scrape](https://docs.firecrawl.dev/api-reference/endpoint/scrape)

Scrape默认缓存可达两天，热点场景需显式控制freshness，不能默认调用后认定实时；news和web时间过滤的支持也不同。返回正文不代表全部输入、输出、依赖附件已验证。

**可行性：补文中高，作为主要发现入口中等。** 先对现有Reader失败的公开网页做比较，成功率和成本有改善再启用；不在2G主机自托管完整浏览器抓取平台。不承诺任意B站/YouTube字幕或登录内容可取。

### 4.7 Inoreader：托管聚合候选，当前不优先

官方提供订阅、Web/Monitoring feeds、规则、全文和API等能力。Pro至少每小时刷新；Boosted本次未核实明确分钟SLA。个人Pro价格为年付折合$7.50/月、月付$9.99，但Pricing将API列Custom，开发页也要求按用途确认权益，**不能用个人订阅价代表本项目API总成本**。[价格与权益](https://www.inoreader.com/pricing)、[开发者规则](https://www.inoreader.com/developers/)

默认Pro两个API Zone各100请求/天，stream每页最多100条。若每15分钟拉一次就是96次/天，分页、重试及其他读取可能超额。高额度和商业用途需核实报价。[限流](https://www.inoreader.com/developers/rate-limiting)、[增量stream](https://www.inoreader.com/developers/stream-contents)

**可行性：中。** 适合大量难维护订阅的托管需求；对当前“重要内容更快出现”的优先问题，不应先采购再期待小时级刷新解决分钟级时效。默认减少二次过滤，保留原文及原发布者。

### 4.8 Miniflux：成熟工程参考，当前不迁移

Go二进制+PostgreSQL、正文抽取、REST API及可关闭内置scheduler；源码实现ETag/Last-Modified条件请求与304处理。可以借鉴采集机制。[功能](https://miniflux.app/features.html)、[API](https://miniflux.app/docs/api.html)、[配置](https://miniflux.app/docs/configuration.html)、[条件请求源码](https://github.com/miniflux/v2/tree/main/internal/reader/fetcher)

**整套接入可行性低于A路线。** 关闭scheduler仍会引入自有feed/entry状态；它不会自动创造缺少的官方源、作者和实践材料，也不能替代热点/练习/精选 Core。当前不增加第二阅读器和数据库状态集。

## 5. 两档选择与费用

### 零新增采购档：先修入口和链路

1. 按产品负责人认可的重要对象整理watchlist：官方机构/产品变更、重点开源仓库、独立媒体/作者、实测/教程作者四组。先核对已有Source，补真正缺少的身份。
2. 官方Feed/API优先；重要源主/备路由逐项实测；缺原生Feed才考虑RSSHub白名单。保持唯一SYSTEM调度、现有PG与Deno边界。
3. 完成增量游标、重叠回扫、ETag/304及失败退避的差额检查；低频但重要的发布源保留基础覆盖，不只按条数降低频率。
4. 修复练习搜索前置条件和发布者集合差异；正文处理按待补队列年龄公平分配，控制站点/周期预算。
5. AIHOT/国内榜单继续辅助补发现；不强制上游给低分就永久丢弃，应先用真实漏报样本判断这些过滤的作用。

新增采购可为0，不代表现有服务器、Relay、网络与工程成本为0。免费托管服务试用也可能要求Key、信用卡或用途许可，不作为无需配置的默认能力。

### 付费增强档：先比较，再选一家

候选一：**Brave Search + 已有Reader能力/Jina**，适合想独立控制发现和正文策略。

候选二：**Tavily Search + Extract**，适合希望统一Provider、并且同样本表现足够好的情况。

Firecrawl只作为少量公开复杂页面的备用，先不同时采购所有工具。Inoreader仅在watchlist规模与维护工时证明托管有优势后询价。生产采购顺序由实测“新增有效证据/材料收益”决定。

以下仅是比较用量假设：每日10个事件×2查询×30天=**600次搜索/月**；结果去重筛选后**900个普通网页/月**。不含重试、错误页、多页PDF、税费、汇率及已有账户其他用量。不是现网已测需求。

| 服务 | 2026-10-16核实的官方口径 | 假设用量对应费用/额度 |
| --- | --- | --- |
| Brave Search | $5/1000请求；每月$5 credits，免费订阅需信用卡验证 | 搜索毛额$3；符合当期抵扣规则时可被credits覆盖。正文费用另算，不能说组合总价$3 |
| Jina Reader | 输出token计费；新Key初始10M tokens，不是每月赠送；美元单价本次未核实 | 假设每篇3000输出token，900篇约2.7M；实际费用=token量×确认单价，再扣确可用额度 |
| Tavily basic | 每月1000免费credits；basic search每次1；basic extract每5个成功URL计1；PAYG $0.008/credit | 若900URL能以5个成功URL/批有效批处理：600+180=780credits，理论在免费额度内。小批调用/失败重试/高级深度会改变用量，不承诺最终账单为0 |
| Firecrawl | 当前free每月1000credits；Hobby月付$19/5000，年付折合$16；搜索每1–10结果2credits，普通scrape每页1 | 600×2+900=2100credits，超免费档；Hobby可覆盖此假设，错误页/PDF/附加能力另计 |
| Inoreader | 个人Pro价不等于项目API许可和额度 | 询价前不纳入确定总预算 |

价格来源：[Brave](https://brave.com/search/api/)、[Jina](https://jina.ai/reader/)、[Tavily credits](https://docs.tavily.com/documentation/api-credits)、[Firecrawl pricing](https://www.firecrawl.dev/pricing)、[Inoreader](https://www.inoreader.com/pricing)。价格/赠额/用途条款可能变化，采购时复核。免费试点额度不能代替长期成本结论。

## 6. 三个栏目分别如何调整

### 当前热点：提高独立报道覆盖和首次发现速度

- 官方watchlist提供早期事件种子；独立媒体/作者提供第二条及后续讨论。聚合转载不能制造独立人数。
- 统一机构/账号/原发/转载血缘；平台榜单和互动保留Signal角色，不代替Fact。
- 回放比较48h/24h快速热度与168h/72h持续热度；先保持正式owner不变。换公式后重新校准门槛，不能直接复用旧30/42分。
- 增长以同一组持续正常采集来源的可比窗口衡量；新增Source、断采恢复和旧文补采不能造成假升温。
- 不以“热点一定要凑满10条”为验收；刚发布且仅单源的可信重要事件可按精选规则评估，并继续补独立证据。

### AI热点练习：把补资料资格与栏目资格分开

- 修正搜索自锁风险：搜索候选无需先已有分析/应用全文；先依据明确主题、多独立发布者、缺口与冷却决定补证，栏目触发继续检查关联原文的分析/应用依据。
- 两阶段复用同一合格publisher集合。主题匹配、分析/实测/应用判断绑定到具体原文和可用文本，不仅依赖全局关键词拼接。
- 若样本证明“只有一个可信官方首发，找不到第二来源”是主要断点，可另提**单一重要官方事件仅触发有界独立报道补证**的合同变更；不直接授予热点/练习资格，也不是当前已开放路径。
- 先找公开正文、代码、示例、模型卡、工作流、输入输出说明；正文存在、结构下载成功、实际运行成功分别记录。材料Validator继续拥有结论，搜索/Reader响应不自动成为可练习证明。
- 保留已触发记录和待补材料状态，不因短期降热撤销。公开视频元信息不等于字幕；YouTube官方字幕下载要求编辑该视频权限，不能凭普通Key承诺任意视频字幕。[官方权限](https://developers.google.com/youtube/v3/docs/captions/download)

### 精选动态：官方首发更快到达，同时解释每次拒绝

- 官方公告、release/changelog、可信媒体直接入源，减少只依赖上游精选的二次筛选损失。
- 单源可信重要更新不必等教程才能被评估；现行规则已允许，重点查实际来源确认、时效及分类是否正确传递。
- 为所有期望入选样本区分：未采到、确认不足、过时、MINOR分类、低于66分、事件归并或展示问题。检验泛关键词是否误判MINOR，而非直接降低总阈值。
- 先保障重大模型/工具/API/开源变化的覆盖，再在合格集合中处理排序与多样性。AI语义建议仅使用已有人工授权入口，不照搬AIHOT自动评分发布来控制正式状态。

## 7. 如何用证据选定方案

### 建立可审计样本

建议先收集约60个已发生、重要性预先标注的样本：20官方发布/变更、20独立报道事件、20分析/实测/教程；覆盖中英文、不同平台及有/无日期。某类不足就报告实际数量。由产品负责人确认重要性和期望栏目，不能用某供应商自己返回的结果作为完整真值。

留出较晚时间段作验证，避免在同一批样本调参又报成绩。每条保存原始URL、真实发布时间依据、预期出现时间/栏目及已存在的本地血缘。

两种实验分开：

1. **同源对照**：相同Source/watchlist、相同查询/URL/时间/语言预算，比较路由、搜索及抽取能力。
2. **覆盖扩展对照**：新增官方/作者入口带来多少真正新增的重要事件，单独记收益，不能归功于更换Reader。

### 核心指标

| 指标 | 计算与边界 |
| --- | --- |
| 重要事件覆盖 | 在独立标注集合中，1h/6h/24h内已发现的比例；样本覆盖率不称为全网召回率 |
| 首次发现与可见时延 | 原发→首次Raw、Raw→Event、Event→快照、快照→页面分别测P50/P95；无历史时延日志时用后续真实观察，不反推 |
| 三栏目合格覆盖 | 期望且满足各自证据门槛的样本有多少及时出现；单源公告不要求伪装为多人热点 |
| 证据/材料收益 | 新独立原发布者、完整相关正文、可验证步骤/输入输出/依赖；正文成功不等于实践成功 |
| 误报与重复 | 非AI/无关、错误事件合并、同作者跨站重复；未评价不是负例 |
| 成本与健康 | 每百次请求的新增有效事件/证据、每份合格材料成本、字节量、周期P95、内存峰值、失败率、队列最老年龄 |

### 选择规则

- **A路线先做**：重要来源缺失或失败已足以解释漏报，采购搜索无法替代修主路由。
- **选Brave+Jina**：在相同预算下新增相关独立证据更多，正文已有能力可复用，且两服务总成本与运维可接受。
- **选Tavily**：覆盖和时效不劣，逐URL完整材料收益可接受，单Provider减少复杂度；不单看免费额度。
- **加Firecrawl**：现有Reader失败集合中，新增合格正文的收益足以覆盖调用成本；成功样本已验证其freshness。
- **选Inoreader**：维护大量订阅的工时节省超过总订阅/API费用，且实际刷新/导出/额度满足目标。
- **不迁移整套平台**：除非同样本证明收益显著且可覆盖数据迁移、Core整合、资源和回退成本；目前证据不足。

候选服务文档支持并不等于适配验收通过。最低采用条件为：重要样本及时覆盖较基线改善、误合并/无关率不恶化、每条可追溯、预算可硬限制、既有主链稳定。具体可接受的延迟和覆盖目标在基线后由产品负责人确定，不预承诺“召回提高XX%”。

## 8. 推荐落地批次与治理边界

**第一批：零采购，诊断与来源补强。** 固定样本和漏失原因；只读核对生产timer/Run/快照，测周期耗时；修确定性漏失与练习候选链，补watchlist和已验收主备路由。保持现有UI。

**第二批：有界服务对照。** 使用开发/隔离数据测试一家搜索+一条正文路径；Brave+Jina与Tavily预算对称。新增Web补证范围先落入唯一采集合同及Adapter资格；本次报告不直接更改规则。成本预算按日/周期/来源硬限制，不补隐藏Source。

**第三批：算法与发布。** 有证据后调整participant归一、趋势可比性及必要门槛；模型语义仅在既有授权入口用作建议。运行类型检查、构建、来源路由、事件聚类、热点、练习、精选及快照的受影响验证；真实观察7–14天，不能用模拟运行替代时效证据。

未来实现的Decision Brief至少包含：管理员角色；来源管理/热点追踪surface；Core负责采集、去重、状态、预算与校验；Skill/AI只保留已授权语义建议；SYSTEM负责唯一流程；Human负责重要样本与必要Gate；读取Source/Run/Raw/Event/Evidence，写库仅由现有Core；无会员权益变化；外部调用及费用明确；Owner仍为现有采集合同/映射。新增Schema单独迁移，不在本研究中提前引入。

回退：新Provider/Route可独立停用，恢复上一规则版本及同版Web/SYSTEM；不删除历史Raw/Evidence、不用人工标签改业务状态。生产部署前按当前规范保留备份与上一release。若有可视化变化，严格按 `IMPLEMENTED → 可实际体验 → EXPLICIT USER APPROVAL → USER_APPROVED`，不能以报告完成替代UI验收。

## 9. 最终建议

**现在选A作为基础，B作为经过对照后可加的增强。** 先把“重要事件在哪里漏掉”变成可追踪事实，再用成熟服务补明确缺口。

对用户当前问题，第一优先不是更多平台榜单或更复杂的热度公式，而是：**重要来源持续覆盖、首次发布及时入库、练习补证能启动、三个栏目拒绝原因可核对。** 完成这些后，新增付费服务和算法调整才能按实际收益选择。

研究验证：官方文档/源码核查完成；本文所有本地引用存在，无占位符和行尾空白。全仓库 `git diff --check` 报告了任务开始前已有修改文件中的行尾问题，本次未改动这些文件。本次仅新增研究报告，不运行业务构建或声称业务验证通过，未做服务性能或生产效果实测。本文是决策报告，不是新的current事实owner或已批准实施计划。
