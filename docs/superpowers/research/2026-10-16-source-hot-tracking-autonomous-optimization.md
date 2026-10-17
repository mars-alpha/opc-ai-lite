# 来源管理 → 热点追踪：自动发现与关键节点 AI 优化规格
日期：2026-10-16（Asia/Shanghai）。
状态：研究与目标设计已形成；IMPLEMENTATION_NOT_STARTED / NOT_DEPLOYED。
授权依据：用户要求进一步优化五点建议、继续研究成熟发现与采集方案、无需额外人工确认、不设费用硬上限、AI仅辅助重点节点。此前“不执行”的建议范围在本轮未明确转换为生产部署请求，因此本次产出研究、边界和验收规格，不修改现网、业务代码或 current contract。

本文件是本轮设计研究，不是新的 current owner。现网事实仍见 [CURRENT_SYSTEM_FACTS](../../CURRENT_SYSTEM_FACTS.md)，采集规则唯一 owner 仍为 [COLLECTION_ARCHITECTURE_CONTRACT](../../content/COLLECTION_ARCHITECTURE_CONTRACT.md)，实现定位见 [COLLECTION_IMPLEMENTATION_MAPPING](../../content/COLLECTION_IMPLEMENTATION_MAPPING.md)。前期 [方案比较](2026-10-16-hot-tracking-collection-options-assessment.md) 与 [成本研究](2026-10-16-content-ai-cost-feasibility.md) 保留依据；其中按金额限制的起步建议，不适用于本轮“不设金额硬上限”的目标设计。

## 1. Decision Brief
| 项目 | 决策 |
|---|---|
| Task ID | SOURCE-RADAR-AUTONOMOUS-DISCOVERY-20261016 |
| Goal / Problem | 改善重要内容少、更新慢、漏事件；优先提高原始证据、独立分析与可操作材料的覆盖 |
| User Role / Surface | 管理员；来源管理、热点追踪；保持已批准 UI 和 API 消费结构 |
| In Scope | watchlist、通用 Acquisition Family、机器准入、增量/队列、事件缺口补证、异步 AI、身份与聚类、可观测与自动验收 |
| Out of Scope | 全文翻译；自动生成正式练习/课程；AI日报自动发布；额外内容工作台；登录/人工 Session；本地大模型；另起调度器/数据库 |
| Code Responsibility | URL安全、身份、路由资格、调度/锁、状态、落库、去重、出处与时间校验、栏目资格、停止条件 |
| AI / Skill Responsibility | 版本化 Schema 的材料理解、有限查询改写、模糊聚类建议、事件推荐理由；不直接调用网络工具或写核心状态 |
| Workflow Responsibility | 同一 SYSTEM 生命周期按确定顺序领取任务；来源采集优先；异步补全/AI/搜索/推送回执均可断点续跑 |
| Human Responsibility | 现有运营可编辑/停用与事后反馈，不作为逐源/逐条处理前提；本任务不新增人工 Gate |
| Data Read / Write | 既有 Source/Run/Raw/Observation/Event/Evidence；最小必要的候选、任务、游标与 AI Run 记录均归现有 PG/Core |
| External Side Effect | 后续实施可调用已配置的搜索、正文、模型服务；本轮未调用收费API、创建账号或采购 |
| Options | A 仅增加源；B 现有主链+机器准入+关键AI；C 迁移整套聚合系统/全量LLM Agent |
| Recommended | B：A不能解决补证自锁与理解问题，C增加资源/状态/运维成本；B复用当前主链且能逐阶段回退 |
| Validation / Acceptance | 本规格§10–12；工程行为用例、开发库集成、限定线上观察分别报告 |
| Rollback | 按功能开关关闭自动扩源/AI/新补证，保留原始证据与审计；既有确定性采集继续 |
| Owner Files | 当前采集合同/映射；source-onboarding/qualification、collection-expansion、configured-chat、content-understanding-enrichment、唯一SYSTEM脚本 |

Must Know：既有主链、机器资格与人工AI限制、用户新授权、Deno边界、三个栏目独立规则、2C2G、当前脏工作区。Nice to Know：Provider便利能力。Do Not Load：旧Manual/历史课程生产/旧批次。

## 2. 推荐主链与 AI 位置
```text
受管对象 watchlist / 已有证据中的真实外链 / 有界发现索引
→ 候选身份归一 → 真实路由探测 → 自动注册 CONDITIONAL
→ 原 SYSTEM 到期采集 → Raw/Observation 确定性提交
→ 按需正文/材料补全 → 异步 AI 材料理解
→ 规则匹配事件 + 有限模糊聚类辅助
→ Event/Evidence 与缺口计算
→ 有界搜索补证 / 新源候选回流
→ 既有 Hotspot / Curation / AI热点练习 Core 判定
→ 增量推荐理由与 Radar Snapshot
```

采集不等待 AI，AI失败不能将成功采集改写为失败；整个周期仍真实报告 AI/来源的 PARTIAL/FAILED。已有快照提供原文或已验证缓存回退，不能清空旧摘要。
来源管理拥有身份、关注条件、路由、准入与健康；热点追踪只读事件、证据与运行健康，不创建第二条采集入口。官方单源发布可以建立候选并触发补证，不因尚未成为热点而被丢掉；热点规则不随之降低。

## 3. 四组 watchlist：持续采集与发现新对象分开
| 组 | 关注对象/变化 | 新对象发现入口 | 持续跟踪 |
|---|---|---|---|
| 官方机构/产品 | 正式发布、版本、能力与使用条件 | 已知官网互链、官方公告引用、机构平台稳定ID | Feed/API、Release、模型卡、限定公告路径 |
| 重点开源/研究 | 仓库发布、论文版本、代码与示例 | 已有有效模型卡/论文/仓库外链；受管机构新repo；有界topic扫描 | repo Release、HF owner、arXiv作者/类别 |
| 独立媒体/作者 | 独立报道、分析、评测与局限 | 已有证据原作者、参考链接、事件定向分析搜索 | 原站Feed、栏目API、稳定作者目录 |
| 实测/教程作者 | 真实步骤、代码、配置、输入输出 | 官方cookbook/examples、有效教程作者互链、事件任务搜索 | 作者Feed、频道uploads、公开notebook/工作流目录 |

复用 Source 和 Creator Identity，watchlist是同一资产下的关注条件/标签，不建四套来源库。已存在的官方/媒体源先补路由与健康，不因本规格列举就重复注册。重要低频源保留巡检底线；缺历史的新源有观察机会；不得按粉丝/播放、聚合分数或单纯文章条数永久淘汰。
研究关注属于开源/研究组，不擅自将当前论文类别映射成第五产品面。细分岗位/任务（生图、剪辑、写作、投流、客服、Agent/MCP/Skill、工作流）用于缺口覆盖，而非创建独立采集执行器。

## 4. 成熟方案选择与边界
以下为官方文档核实能力与项目适配建议，不代表已从腾讯云/Deno成功实采。

| 方案 | 推荐用途 | 关键条件与限制 |
|---|---|---|
| 标准 Feed 自动发现+条件请求 | 首选原站/作者持续更新；现有自动发现代码继续扩展 | 解析真实RSS/Atom声明；ETag/Last-Modified验证；304无需AI；feed不是整站历史。参考[WHATWG](https://html.spec.whatwg.org/multipage/links.html#rel-alternate) |
| GitHub Releases + org/repo发现 | 发布源头、变更说明、examples | 分页releases而非只取latest；release ID稳定去重，published_at与编辑分开；Search用于有限对象发现。[Releases](https://docs.github.com/en/rest/releases/releases)、[Search](https://docs.github.com/en/rest/search/search) |
| GitHub Events | 仓库活动与补漏线索 | 官方延迟30秒至6小时，最多300条/30天；不能当实时发布主路由。[Events](https://docs.github.com/en/rest/activity/events) |
| Hugging Face owner + webhook/对账 | 模型发布、新repo与材料关联 | author过滤、显式limit、sha/版本去重；webhook可关注公开用户/组织旗下repo；lastModified并非正式发布，不下载weights。[API](https://huggingface.co/docs/huggingface_hub/package_reference/hf_api#huggingface_hub.HfApi.list_models)、[Webhook](https://huggingface.co/docs/hub/webhooks) |
| arXiv作者/分类 API/RSS | 论文发现与版本追踪 | base ID与版本分开；RSS按官方日更；legacy接口单连接至少间隔3秒；摘要不是全文，PDF按需。[API](https://info.arxiv.org/help/api/user-manual.html)、[访问要求](https://info.arxiv.org/help/api/tou.html)、[RSS](https://info.arxiv.org/help/rss.html) |
| Sitemap差量 | 无Feed的公告、研究、教程目录补漏 | 限定路径/页数/子sitemap；lastmod是修改线索，不当发布日期；不无界加载5万URL。[协议](https://www.sitemaps.org/protocol.html) |
| WebSub / YouTube push + uploads | 降低已知作者更新发现时延 | 有hub才订阅，续租、验签、重复去重和poll对账；频道持续上传用uploads，不依赖search完整性。[WebSub](https://www.w3.org/TR/websub/)、[uploads](https://developers.google.com/youtube/v3/docs/playlistItems/list)、[push](https://developers.google.com/youtube/v3/guides/push_notifications) |
| RSSHub白名单 Generated Feed | 没有原生Feed且路由已证实可用的缺口 | 逐route核验匿名服务器可跑、作者归属与完整性；不全套部署浏览器集群；[文档](https://docs.rsshub.app/guide/) |
| AIHOT/国内榜单/HN等 | 新对象、事件和作者的发现信号 | 聚合分数/排名不授予事实与独立参与者；低分保留可观测与样本回放，不能直接全放入正式栏目 |

YouTube Search有索引延迟和配额，持续频道采集应转uploads；配额以当前项目Console与官方文档为准，不写死旧单价/单位。官方字幕下载需视频编辑权限，不能保证取得任意第三方字幕。[Search](https://developers.google.com/youtube/v3/docs/search/list)、[字幕](https://developers.google.com/youtube/v3/docs/captions/download)。

### 定向检索与正文服务
| 组件 | 选择理由 | 使用约束 |
|---|---|---|
| Brave 或 Tavily，选一家通用主搜索 | 官方原始证据、新闻、中文/英文定向补漏；Tavily也可组合Extract | 同事件同缺口不默认同时查询多家；只用真实结果及原站，不以Answers/自动答案充证据。[Brave](https://api-dashboard.search.brave.com/app/documentation/web-search/query)、[Tavily](https://docs.tavily.com/documentation/api-reference/endpoint/search) |
| Exa，条件性语义补充 | 长尾分析/教程表达与关键词不一致时扩召回 | 已有普通搜索不足才用；限域/路径/时间；不默认deep-reasoning或合成答案。[Search](https://docs.exa.ai/reference/search)、[Contents](https://docs.exa.ai/reference/contents-retrieval) |
| Jina / 既有Reader | 已知URL的正文补全 | 先复用原Feed完整文本；原文URL/状态/哈希可追溯；不把生成摘要或视频描述当全文。[Reader](https://jina.ai/reader/) |
| Firecrawl | 明确docs/examples等区域的复杂正文与站内补漏 | 逐篇Extract优先，Crawl仅在有明确缺口时；必须显式limit、路径、域名、深度，不能接受默认10000页；Map不保证完整。[Map](https://docs.firecrawl.dev/features/map)、[Crawl](https://docs.firecrawl.dev/features/crawl) |

推荐原生接口为基础，一家通用搜索加既有Reader；Exa/Firecrawl按真实缺口增加。无金额硬上限不意味着必须同时采购所有Provider。未配置账号/有效凭据的Provider标记UNAVAILABLE，继续其他可用路由，不制造待人工确认的任务。配置与接入不等同本轮已采购。

主搜索由固定样本自动对照选定：在相同查询、时间截断、结果与原站验证数量下，先比较原始证据/有效材料覆盖，再比较独立性、失败率和P95时延，单位有效证据成本用于后续优化，不设金额审批。未通过质量门槛的Provider不因便宜而晋级；无合格候选时保留原生源主链并记录缺口，不伪报搜索能力已就绪。

### 已核实可达的优质材料入口候选
本次公开HTTP读取核实以下入口可达，但没有在腾讯云/Deno注册、持续采集或运行其示例；先核对已有Source再按机器准入，不能将候选列表冒充已启用目录。

| 入口 | 优先发现的信息 | 边界 |
|---|---|---|
| [OpenAI Cookbook](https://github.com/openai/openai-cookbook) | 任务代码、工具调用、检索与评估示例 | README指向Cookbook站；逐篇版本/依赖/代码/日期验证，不把仓库任意commit当产品发布 |
| [Claude Cookbooks](https://github.com/anthropics/claude-cookbooks) | 官方开发与任务示例、notebook | 同机构多个repo仍归一；示例不代表免费可用，也不证明本平台已执行成功 |
| [MCP servers](https://github.com/modelcontextprotocol/servers) | 服务端参考实现、官方/社区链接发现 | 目录中第三方server分别验证发布者与访问条件，不能全部继承MCP官方身份 |
| [n8n AI文档](https://docs.n8n.io/advanced-ai/) | Agent、工作流步骤、集成与操作条件 | 站内限定路径；社区模板另查作者、付费/凭据依赖，不以模板卡片当完整材料 |
| [ComfyUI维护者示例目录](https://comfyanonymous.github.io/ComfyUI_examples/) | 工作流、示例与配置说明 | 验证实际workflow/输入与模型清单；不批量下载大模型、不运行工作流；原发布日期未知则作历史参考 |

另一个试探的Comfy教程路径返回404，未列作有效Route；网站可达、样例存在与服务器持续路由可用分别验收。

## 5. 自动准入：机器 Gate 代替逐项人工确认
目标流程（设计状态，非当前枚举）：
`DISCOVERED → PROBING → REGISTERED_CONDITIONAL → 持续真实SYSTEM观察 → AUTO_READY`；
暂时失败为可重试状态，身份/安全不合格为拒绝，原因与下一次可探测时间可追溯。

准入条件：
1. 候选URL必须来自已取得的网页、Feed/API或搜索结果，记录发现链。AI输出只能引用输入候选ID，不允许模型凭记忆生成正式URL。
2. 规范化网站/平台稳定ID、已有Source/Creator/Origin映射，事务查重。相同机构不同渠道归一；同域不同作者不能机械当同一人；名字相同不能证明同人。
3. 找到明确可执行的Acquisition Plan，真实服务器样本可解析、原文可达、身份和时间语义可解释，才自动复用onboarding Core注册CONDITIONAL；不绕过Qualification。
4. 复用现有资格证据：current runtime/route checkpoint、稳定身份与路由、溯源/去重/时间/能力条件、最近5条真实SYSTEM Run至少4次成功等全部满足才可自动成熟；不瞬时刷5次测试Run凑资格。
5. 运行成熟只说明持续可采，不授予CONFIRMED_OFFICIAL/MEDIA、独立性或实践材料完整资格。首次页面可作为参考候选，不要求先长期订阅。
6. 新闻/评测作者长期可采与“某篇教程材料完整”分开，后者仍逐篇检查；不能要求所有媒体作者先提供完整教程才能采集。
7. 需登录、关注、人工领取、Session续期的路由不进入本阶段自动链；未知Source/Route保持失败关闭，不退回任意HTTP/Browser/Manual。
8. 尊重现有operator归档/禁用，不因自动再次发现就复活。重要源临时失败自动换已验证备用、退避与恢复探测，不能因AI低价值判断永久删除。
9. 采用SYSTEM actor与同一Source Owner审计。现有PENDING_SOURCE_REVIEW可迁移为自动候选，保留原始发现依据，不批量设APPROVED/AUTO_READY。

自动来源扩展不会自动扩展Deno成任意URL代理。现有固定Provider不能覆盖的新路由保持UNRESOLVED；后续可由Source管理输出版本化、受限、经过探测的路由清单同步Relay，Relay复核域名/路径/公开IP/重定向，不能仅接收任意请求URL后直转。未同步成功的Source不能被宣称海外已可采。

## 6. 五个关键节点的 AI
| 节点 | 触发 | 输出与边界 |
|---|---|---|
| 来源候选辅助 | 规则无法确定关注对象/任务适配时 | 候选角色/主题建议和依据；身份官方性、可采资格由代码和真实探测判断 |
| 材料理解（主入口） | 新Raw或正文revision变化，机械基础过滤后 | 一次生成中文标题、答案先行摘要、阅读价值、类型/主题、原文事实片段及不确定项 |
| 查询改写 | 模板搜索无有效增量且有明确缺口 | 有限关键词/同义词与查询目的；不自创URL、版本、实体 |
| 模糊事件关系 | 规则候选在不确定区间 | SAME_EVENT / RELATED / DIFFERENT、依据；Core校验实体/版本/动作和时间，不全量两两比较 |
| 事件栏目理由 | 事件证据或栏目资格变化 | 热点为何值得关注、精选的信息增量、练习可练什么/前提/材料缺口；不能改栏目资格或声称已运行成功 |

版本化任务输入包含material/event revision、原文哈希、输入证据ID、prompt/schema/model版本；缓存与幂等键按这些维度。没有变化不重复分析。模型温度/思考/输出长度按任务显式控制；简单任务默认非思考，少量复杂关系才升级。保存usage和失败/修复原因，AI不是自主循环联网Agent。
不做全文翻译，理解结果先保存，不等待translateFullText；原材料英文可直接参与判定。不得只删除翻译展示却继续后台调用。

安全与事实：采集正文是非可信数据，不可覆盖系统提示/工具权限；AI无secret、网络执行与发布权限。事实引用须指向输入证据与原文片段，数字/型号/日期等受保护字段校验，材料不足返回UNKNOWN。确定性Validator不能证明所有自然语言语义正确；不得用模型自评当事实验证，保持可回退原文与已验证事实字段。

## 7. 事件缺口驱动补证，消除自锁
三个目的分开：
- ORIGINAL：缺官方公告/模型卡/论文/Release原页，优先已知官方域名与原始链接。
- INDEPENDENT：缺独立分析/评测/局限，排除同机构、镜像和转载网络。
- PRACTICAL：缺步骤、代码、配置、输入输出、材料与访问条件，优先官方examples/cookbook和已证明贡献有效材料的作者。

“进入补证队列”与“达到栏目门槛”独立。重要官方单源AI发布可触发缺口搜索，不要求先已有两位作者和教程；栏目AI热点练习仍保持现有多人原文＋分析/应用条件。材料完整度是共享证据状态，不冒充已完成练习。

必须修复的当前代码路径：
- collection-expansion从evaluateAiHotspotPractice的成功record读取人数；缺分析/应用时record=null导致人数0。搜索入口改取共享、未依赖栏目成功的真实发布者集合。
- 搜索使用hotParticipants，快照使用aiPracticeParticipants，含Signal资格不同。共享身份归一能力，但分别输出热度参与者、可验证原文发布者、Fact来源，不互相替代。
- 当前cooldown读取任意Event expansion Run，普通补证会压住实践搜索；改用purpose/provider/queryPlan独立水位。
- 全部候选持久due+aging，不固定每次只挑前几个新事件；索引/批大小有界，未处理可续跑。
- 搜索source作为Discovery Signal；真实原站抓取后可形成原作者Evidence，不因搜索Source为signal就永久否认真实原作者，也不凭snippet授予Fact。

新版本参数作为可配置技术边界，替代当前“一主题/一Provider/两查询”的窄限制，需行为回测后启用：
- 每事件每轮最多3个互补查询，每查询最多5条候选；最多验证5个新原站，余者排队。
- 一个主搜索，最多一个已配置备用；切换仍共用该轮请求边界，不默认多家fanout。
- 同event+gap通常6小时冷却；失败遵Provider Retry-After及失败退避。新正式版本/重大新证据可以开启新计划，但同事件滚动24h最多6次查询，防止输入微改逃逸。
- 两个连续完成查询没有新的独立相关证据/有效材料时停止本计划；确有新证据/新查询维度可后续续轮，不能原样循环。
- 有明确站内材料缺口才深挖，初始同域限定路径最多10页/2跳，禁止全域/外域自动扩散。总页数与深度一起约束，sitemap种子不能绕过页数。
- 缺口已补齐、事件时窗结束、无法取得合法材料时结束/降级；历史常青教程可作为带真实日期的参考，不伪造当前事件。
这些是请求/资源边界，不是金额硬上限。到期暂停保留checkpoint，既有采集照常。

## 8. 增量、可靠性与队列
- Source游标、ETag/Last-Modified在该批Raw/Observation成功提交之后推进；304记NOT_MODIFIED，合法空Feed记NO_NEW_ITEMS，权限/验证码/错误HTML200不能记空成功。
- API按官方分页/ID语义与稳定排序，采用有界重叠回扫，时间戳相同仍用稳定ID；达到结果上限或窗口不完整明确TRUNCATED/AVAILABLE_WINDOW_ONLY，不宣称全量历史。
- Feed修改/Release编辑/HF sha变化只更新revision；publishedAt/updatedAt/firstSeenAt分开。未知或未来时间不造新鲜事件，保留原始时间字段与拒绝原因。
- 初次回填与日常采集分开，历史回补不突然增加当前热度。旧原发的转载不伪装新发布；新独立评论保留自己的真实评论时间与证据角色。
- 正文队列按优先级+等待时长提升+站点份额；重要快讯及时入事件池，缺正文不拖原始采集。保留冷门重要源及普通材料的轮转份额，站点不能垄断。
- 2C2G沿用PG和唯一SYSTEM timer/advisory lock；采集并发先保留现有2，AI初始1；AI/深爬不得与回调或网页请求同步长等待。不部署本地LLM、Redis/向量库、常驻Chrome或第二worker调度器。
- 每周期为补全/AI阶段设置执行时间片，超时checkpoint下轮继续，不在锁内等待远端Crawl完成；快照刷新仍有机会执行。并发和时间片由负载测试校准，不盲目复制AIHOT worker=8。
- claim/lease、唯一任务键、有限重试、stale recovery；网络未知结果不能无界重提收费作业。
- AI写回按revision compare-and-set或专属JSON路径原子更新；请求中原文变更时旧结果记STALE并重排，不能整体覆盖新材料/运营标签。
- 费用按任务/Source/Event/Provider记请求与tokens、cache hit/miss、总输出（含推理细分）和估价；不保存secret，不因任意月金额自动停机。Provider余额/权限或配额耗尽是客观不可用状态，明确记录并自动退避/备用，不伪装系统健康。

## 9. 网络、推送与自动治理边界
新URL、Feed声明、重定向、canonical和搜索结果均不可信。按[OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)校验公开目标IP（含IPv6/DNS变化），每跳与实际连接复核，禁止内网/metadata/任意协议和端口；不跨origin泄露鉴权。XML禁外部实体/DTD，设响应/解压/条目/解析资源限制。RSS guid/Atom id是稳定标识，不能自动当可抓URL。[RSS](https://www.rssboard.org/rss-specification)、[Atom](https://www.rfc-editor.org/rfc/rfc4287)。

Webhook只做验证→持久化inbox→快速ACK，SYSTEM领取同一任务；secret校验、租约/续订、重复与丢失补偿归路由健康。没有已部署HTTPS回调能力先poll，不为push另建调度器。
Firecrawl须对原始body做HMAC；单job有多页，不能仅jobID去重吞掉后续页面，采用provider+jobID+type+URL+hash。结果需及时落库，已完成也检查逐页失败；通知丢失由同SYSTEM轮询对账。参考[Webhook](https://docs.firecrawl.dev/webhooks/overview)、[签名](https://docs.firecrawl.dev/webhooks/security)。

自动治理限于可逆调频、暂时隔离、备用切换和恢复探测；永久删除不是默认动作。Coverage-critical即使失败也保留低频恢复通道。手动禁用/归档维持人工意图，不因本策略自动恢复。Source首次成熟、普通机器降频/暂时隔离不再等待人工审批；身份/权限无法证明则维持不合格而不是塞进待人工队列阻塞其他任务。

## 10. 验收：必须满足的行为用例
| 场景 | 预期 |
|---|---|
| 同官方机构官网/频道/聚合转载 | 不伪增独立发布者；多个Observation保留 |
| 同名不同作者；同机构不同产品 | 稳定ID优先，不能只靠名字误合/漏合 |
| 单源正式AI发布，缺教程 | 补证可入队；不伪造第二发布者/正式热点 |
| 两独立报道但无分析/应用材料 | 可寻找教程；栏目资格仍未满足 |
| 两个纯趋势Signal＋多新闻汇总 | 不算练习发布者/Fact；可保留发现线索 |
| 合格公共Feed新作者第一次被发现 | 自动探测/去重/CONDITIONAL，不等待人工；不直接AUTO_READY |
| Source route/runtime checkpoint变化 | 旧成功Run不能冒充新路由成熟证据 |
| 归档来源再次被发现 | 不自动复活，不重复Source |
| 登录/关注/不明路由 | fail-closed并记原因，不恢复Manual/Browser链 |
| Feed/API 304/合法空列表/HTML200验证码 | 分别正确分类；不调用AI/不误判故障或成功 |
| 成功提交前崩溃/游标边界相同时间 | 不漏条，重复Raw不重复，Observation仍可补写 |
| AI超时、坏JSON、伪造URL/数字/型号 | 原始采集继续；拒绝无效输出、回原文并有限重试 |
| AI将教程改称正式发布 | 动作类型/证据校验拒绝；不得进入精选事实字段 |
| AI处理中正文发生更新 | 旧结果STALE，不覆盖新revision/材料 |
| 不做全文翻译 | 整个自动理解路径没有translation请求和费用 |
| v1/v2模型、发布/评测、同实体不同日期 | 关系分别判断；不因标题像就全部合并 |
| 搜索提供snippet、部分字幕或不可访问附件 | 不声称全文或完整可练，不虚构步骤/下载链接 |
| 普通扩展完成但实践搜索未运行 | 专属cooldown不误压实践补证 |
| 查询持续无新增；Provider429/403/余额不可用 | 有限停止/遵Retry-After/备用或延期，其他采集继续 |
| 重要源低频、新内容洪峰、低优先级旧任务 | 无饥饿；关键源不断覆盖；等待时长可观测 |
| 重复/乱序/伪签名/丢失Webhook、重启 | 验签、幂等与poll恢复；未知job拒绝，无重复Source/Evidence |
| 同job不同page | 每页均可保存，不仅第一条通过 |
| SSRF/重定向内网/DNS重绑/XXE/解压炸弹 | 失败关闭，回退路由仍执行相同检查 |
| 本月累计估价超过旧¥150/¥200建议 | 无金额硬停、无新增人工费用审批；资源/权限控制继续 |
| 单Source失败或AI阶段失败 | 结果真实PARTIAL/FAILED，不将已尝试冒充全部PASS |

以上是待实现的行为测试规格，不声称现在已有测试或通过；字符串扫描只作辅助，不能代替输入→状态/写库/调用次数断言。

## 11. 效果与运行验收
以下是建议起始验收目标，非现网已达到的事实。先采集基线再在同工作负载下比较；基线不支持计算的指标报告UNKNOWN，不编造全网召回率。

| 指标 | 定义/目标 |
|---|---|
| 重要对象覆盖 | 四组关注对象都有明确Source/Route或机器可解释缺口；关键官方对象不存在悄然消失 |
| 样本发现覆盖 | 固定可追溯原始发布集至少60个事件，按首次发布截断回放；目标24h发现≥90%，原有已覆盖正例不退化 |
| 聚类质量 | 至少100对含难负例的固定关系集：precision≥98%、recall≥90%；版本/独立发布混合的关键反例必须全过 |
| 发现时延 | 已验证高优先级Feed/API，从可信publishedAt到Raw P95≤45min；arXiv日更等按上游能力另报，不混算 |
| 入池与呈现 | Raw提交到确定性事件/下一有效快照不依赖AI；AI语义任务P95≤30min（基线负载），普通材料待补队列P95≤24h，积压原因可追溯 |
| 内容质量 | Schema/受保护实体数字/出处/动作类型固定反例全部通过；记录有依据推荐理由率/材料不足率；不将Validator当成全语义正确证明 |
| 材料收益 | 单独报告新增有效原文、独立分析、可操作材料、缺口完成率与时延；以原始输入输出/步骤/附件证据为准，不按命中数灌水 |
| 来源健康 | 304、无更新、失败、权限、截断、正文缺口分别统计；单源失败不阻塞余源，验收整体不伪报全绿 |
| 资源 | 最近7日实测峰值工作量的2倍回放，原512M采集限额下无OOM，周期能刷新快照，Web P95相对基线劣化≤10%，无PG连接饥饿 |
| 稳定性 | 72h自动运行无人工逐项解锁、无重复注册/无界请求/持续饥饿；接着观察7–14日覆盖与材料收益，两个阶段分开报告 |
| 费用 | usage及估价覆盖所有模型请求、修复/重试与搜索/正文调用；仅计量，不以累计金额判停 |

样本真值来自预先冻结的官方release/API原始记录、独立原文与明确关系标注，不能用被评估模型自己生成真值。工程师可制作可追溯fixture，不要求运营逐条审批；无现成真值集时，先完成基准构建，不能跳过后宣称召回提升。
未知发布日期单列，不用firstSeenAt替代原发时间以美化时延；无标签事件不算负例。不能以全站所有文章作为“本应入选”的分母，也不承诺全网重要事件全覆盖。

## 12. 实施顺序与发布前检查
1. **P0 可观测与自锁修复**：记录各阶段时间和拒绝原因；统一身份组件的多口径输出，修复补证触发/cooldown，建立有界回放基线。保持栏目门槛。
2. **P1 来源与增量**：补watchlist实际缺口、主备路由与Deno覆盖；条件请求/水位/重叠回扫、公平队列。新源机器准入替代逐项确认。
3. **P2 AI材料理解**：复用现有Gateway，拆翻译，任务幂等/usage/revision CAS，异步标题摘要理由与分类；错误回原文。
4. **P3 发现增强**：接一家通用搜索及已知URL正文；缺口驱动引入HF/YouTube推送、语义检索、限定站内深挖；复用Source身份和同一任务执行链。
5. **P4 模糊聚类/事件理由**：有固定错误样本后启用AI辅助，按关系精度门槛控制；无需等此项才补官方源。

各阶段由自动技术验收推进，不新增人工逐源/逐内容确认。若实际修改可视化UI，仍适用既有UI体验Gate；本设计冻结UI避免增加该依赖。AI日报最终发布与课程维护不在本任务授权范围，不迁移其既有发布Gate。

后续实施必须同时调整唯一采集合同中的旧约束：开头及§6/7/13/14/16/18/23的“自动不调用AI”“首次AUTO人工”“作者PENDING_SOURCE_REVIEW”；明确仅允许上述持久异步辅助阶段。相应更新硬断言旧边界的Validator，不只删测试。
实现映射只记真实落地；CURRENT_SYSTEM_FACTS只在实际验收/部署后更新。TASKS中旧“人工AI增强”届时按本次用户授权迁移，不同时维护相反有效规则。

现有治理的HUMAN_REVIEW_REQUIRED标签仍允许到期基础采集，不能据此断言当前所有Source都在等待人工；本轮要替换的是首次长期准入/语义处理等明确的人工作业依赖，而非误诊整个采集执行器。

自动验证至少：相关onboarding/route/qualification/collection/dedup/cluster/practice/expansion/cadence/AI行为测试，Manual退出守卫，开发库真实SYSTEM集成，npm run typecheck、npm run build、scripts:current治理、git diff --check。未改业务代码的本轮不冒称这些检查已运行。

迁移以最小必要Schema为准：候选/任务若现有存储不足，归现有Source/Core与PG增补，不挤成伪Source或任意Raw FK，不提前建第二事实源；复用ai_runs并核对必要字段/索引。数据库迁移遵现有独立凭据与幂等Gate。自动写入的CAS、lease和唯一键须在开发库实际验证。

## 13. 回滚与本轮交付边界
开关分别控制机器扩源、AI理解、语义聚类、搜索深挖；回滚到此前确定性主链，保留Raw/Observation/Evidence/审计与原始输入。不清空事实、不批量归档现有来源、不覆盖operator意图；新增自动Source按provenance和scope停止新任务，可恢复续跑。回滚不宣称供应商未知结果一定没有计费，应先对账。

本轮完成：本地代码与合同差额核查、官方成熟方案核实、目标分工、自动准入与技术停止条件、可执行验收和分期设计。
本轮未执行：收费API请求、Provider账号采购、生产采集/写库、部署、UI修改、业务代码修改。

本轮文档检查：本文件本地链接无断链、无占位符、无行尾空白。仓库级git diff --check仍因本轮开始前已有修改中的行尾空白失败（PROJECT_STATUS、快照及相关映射/脚本等），本轮未修改这些文件，不能报告全仓检查通过。


## 14. P4扩展规格：事件归一、AI表达与栏目质量

用户补充需求：同一Meta Muse模型发布的多源报道合为一个事件卡片，各来源在资料详情展开；标题、描述由AI产出；同时解决精选与当前热点的发现及呈现质量。此节为待实施规格，当前生产状态仍以CURRENT_SYSTEM_FACTS为准。

### 14.1 事件与资料的边界

推荐复用现有Event Cluster建立稳定canonical事件身份，保留成员Event、Raw、Observation、原文及历史触发审计。主列表、精选、当前热点、AI热点练习按相同canonical身份去重，资料详情汇集全部成员及已验证关联的原文。仅前端去重无法汇总热度和事实，直接删除/覆盖原Event又不利于回退和追溯，均不采用。

同一对象、同一版本、同一次发布的官方发布、平台上架/兼容支持、同次发布的评测/教程作为该事件的报道或资料，不各自占用主卡片。不同版本、不同发布日期的独立实质更新、事故/政策等独立动作保留新事件；仅同品牌/同模型但发生独立动作不能直接合并。发布、评测、部署、教程保留关系类型和原文身份，关系归入同一卡片不把教程当官方发布。缺少对象/版本/时间依据时保留UNKNOWN，不强制合并。

精确URL和明确版本/动作先由Core归一；模糊候选交AI输出SAME_EVENT / SUPPORTING_REPORT / RELATED_EVENT / UNRELATED / UNKNOWN、引用的输入ID及证据理由。Core校验时间、对象/版本冲突、原文引用和整簇一致性后应用；单对相似不得通过传递链吞并互相冲突的事件。原始标题保持不可覆盖，展示标题不参与身份计算。

历史练习触发也须映射至canonical身份：同组只保留一张展示卡，合并去重的资料、独立参与者及最早触发时间，不删除旧记录；超过七日仍遵现有持久展示规则。过期/归档主成员不能使有效成员的整个事件消失。回退聚合映射后仍可追溯原始记录。

### 14.2 AI生成事件表达

在聚合证据完成后生成事件级中文标题、答案先行描述和推荐理由；复用既有Model Gateway、版本化Skill、ai_runs与持久任务，不逐篇生成多张同主题卡。输入为经Core接受的事实与报道集，包含出处ID、原发时间、机构、模型/版本及原文片段；信号和作者评论单列，不冒充事实。

结构化输出包含titleZh、summaryZh、whyItMatters、evidenceIds和uncertainties。描述先说明发生了什么/对谁有用，再说明必要限制；推荐理由解释具体变化/可用价值，不复述标题或泛称值得关注。实体、版本、数字、日期、可用范围必须可追溯，冲突事实保留分歧，缺材料不虚构实测结论。不要把尚未发布、未验证步骤、传言写成已正式发布或可完整练习。

缓存按canonical身份、证据输入指纹、模型/Prompt/Schema版本复用；原文新增到相同事实集不无条件重调，实质变化后重算。具备租约、输入变更CAS、退避、取消/过期保护与每次尝试usage。AI异步失败不阻塞采集或快照，临时展示有明确回退标记的原文，不伪装成AI成稿；最终AI表达验收要求当前命中样本均有有效生成结果。继续不做全文翻译，无金额累计硬停，保持请求、并发及时间预算。

### 14.3 精选与当前热点质量

以来源发现→获取→Raw→Event归一→证据汇总→栏目判定→快照为完整漏报漏斗。对预先冻结的真实发布/报道样本记录缺在哪一层；补缺失的优质官方/研究/工程/实测源时仍走Source机器准入和唯一SYSTEM，保留Route健康、退避与重要低频源基础覆盖，AI不能通过推测创建伪Source或事实。

栏目计算必须消费canonical事件的完整合格成员证据：事实状态、来源质量、实质变化、独立发布者、跨平台/实践与互动信号分别按其权限汇总并重算。不能只取主Event旧policy计数或遗漏成员Event的Expansion，不能把同一Raw/机构重复累加。确定性验证官方/媒体资格；AI只提取变化及价值建议，不自授事实权威或精选/热点状态。

精选优先发现有实质价值的模型/产品更新、论文、开源能力及工程/实测内容；已有单源官方正例保留，不以需要多家讨论为前置。热点评价同事件的真实讨论动量，补全多源参与后重算，并区分新近上升和持续讨论。先修输入缺失与错误关联；窗口/阈值若仍排除真实正例，以同样本回放证明收益和误报代价后再版本化调整，不以填满数量为验收。重复报道、榜单排名、粉丝数和AIHOT评分不能充当独立事实。

### 14.4 实施顺序与验收

1. 建立有出处的关系集及漏报漏斗基线：至少100对关系（含关键难负例）和60个冻结发现事件；无真值指标报UNKNOWN。
2. 修正现有聚类/证据汇总/持久练习的canonical链路，补开发PG同锁、幂等、并发和回退验收；真实Meta Muse同次发布只出现一张卡，全部合格来源在资料详情可追溯。
3. 接入模糊关系AI与事件级中文表达，验证输入输出Schema、引用、数字/版本及usage；重复周期无实质输入变化不重复付费。AI失败时Core仍能刷新快照。
4. 对同一冻结样本比较采集覆盖、发现时延、栏目缺失原因与误报，逐项修精选/热点输入和规则；原有正例不得退化。目标聚类precision≥98%、recall≥90%，关键错版本/独立动作混并反例全过；24h发现覆盖目标≥90%，未实测不得宣称达成。
5. 生成可体验版本：保持已确认布局，复用资料详情折叠交互；任何必要可视化变更按VISUAL_HUMAN_REVIEW_GATE提供本地/暂存真实数据体验，用户明确批准前不标记UI完成。非UI Core可先完成同任务闭环。
6. typecheck/build、相关采集回归、scripts治理、文档链接和diff检查通过；同版发布前保留映射/任务/配置回退，保留全部原始审计。资源按原2核2G与512M采集限制验证；即时结果、72h稳定及7–14日效果分别报告。

P4不要求人工逐源/逐事件确认；工程师负责有出处fixture和确定性验收，Human只承担实际发生UI变更后的体验审核。生产AI是否已启用、实际费用及效果由运行验收记录，不能从本规格推断。