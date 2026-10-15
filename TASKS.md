# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。历史任务通过 Git 追溯；旧「今日情报」、旧 Rising、旧 Manual Collection 描述不得作为 current roadmap。

## PRACTICE-EVIDENCE-CLOSE — Decision Brief

### PUBLIC-CONTENT-PRODUCTION — Decision Brief

- Role/Surface/Goal：运营采集后端；审计清场并发布逐篇正文/字幕/ZIP说明回执增量，UI KEEP。
- Scope：Deno固定Provider与腾讯云SYSTEM最小7文件增量，无DDL、新Secret、来源注册、Web/P0界面变更。Code负责校验与发布，AI/Skill不参与运行，Workflow沿现有唯一timer，Human已授权本轮上线。
- 推荐：先检查候选与当前生产差异、回归/build，再Deno生产发布、SYSTEM原子链接切换及现有作者真实实采；失败回指旧release/Relay版本，保留Raw审计。
- Acceptance：生产官方正文真实材料Gate通过；既有作者成功、重复不增Raw、凭证持久化，唯一timer正常，Web不受影响；Git无凭据且本地提交推送一致。发布产物和临时验收文件退出current入口，不删除真实业务数据。Owner为采集架构合同，结果归本任务。

- Result（2026-10-15北京时间）：Deno生产revision q0h8sfrv6j17（v4），腾讯云SYSTEM current已切20261015-public-content-receipts；旧20261015-pixaroma-materials保留回退。7文件manifest与回退路径留在release，未改Web、UI、DDL或timer配置。
- Production Acceptance：腾讯云通过生产Relay官方文生图正文/附件材料Gate通过；图生图附件不足及B站字幕不可用仍明确阻断。生产作者Run 27f5e9bd-2267-4588-bb20-6925bdeba382成功，30返回/0新增/30重复，30 Raw/30 Observation；完整BODY回执1篇、材料Gate通过1篇，未知发布日期不创建当前Event。作者运行11.956秒、CPU1.817秒，512M/50%CPU上限；不声称长期稳定或执行工作流成功。
- Cycle Acceptance：统一opc-collection.service真实生产周期退出0，SERVER_NATIVE_AUTOMATIC_CYCLE=PASS，failures为空，CPU7.851秒；timer保持enabled/active，Deno健康v4，后台HTTP200。Web/P0未切换，当前生产旧读模型仍有120首批限制，此项不属于本轮7文件材料发布。
- Audit：生产候选与原release逐文件核对仅7个后端文件；完整quick回归（含typecheck）及标准生产build PASS。无凭据进入版本控制；保留可复用验收和反例，不以历史编号删除有效测试；临时部署/验收入口从生产运行树移除。未审核P0/日历界面留在Git，未进入本次生产包。

### PUBLIC-PRACTICE-CONTENT — Decision Brief

- Goal / Role / Surface：运营后台现有来源与实践证据，补真实正文/公开字幕及逐篇获取凭证；UI KEEP。
- Scope：固定白名单Deno官方教程正文、B站匿名公开字幕、Pixaroma已获取ZIP内逐篇说明；复用SYSTEM、Raw/Observation与JSONB。无登录/Cookie、无AI、无新来源注册、无DDL、无新调度器，不下载执行模型/节点。
- 分工：Code负责限时限量请求、完整性/URL绑定/哈希凭证、去重更新和材料Gate；Skill不参与运行，Workflow沿现有SYSTEM，Human保留当前界面审核边界。
- 选择：固定出版者适配器与平台字幕API，拒绝常驻浏览器、非官方字幕破解及无边界全文抓取；每源每轮最多2篇补详情，失败不阻断列表采集，成功材料复用，重复Raw允许仅升级有效材料字段。
- Data：读公开材料与现有Raw，开发实采沿原Raw身份持久化，生产先隔离实测；Deno只获取海外公开材料、不传数据库凭据。既有共享Secret仅复用原目的地。
- Acceptance：真实正文至少一篇通过逐篇材料Gate；真实字幕成功/不可用均明确，不把描述冒充字幕；真实题材未满足两独立来源/两类型时保持候选并说明原因。专项反例、typecheck/build及腾讯云运行；回退代码/Relay旧deployment并保留Raw审计。
- Owner：采集架构合同及现有Relay、collection-runner、discovery、practice-materials。
- Result：IMPLEMENTED / DENO_PREVIEW_VALIDATED / DEVELOPMENT_SYSTEM_VALIDATED。腾讯云经Deno预览b5st483dm3mc实取Comfy文生图正文15329字，逐篇材料Gate通过；图生图正文5062字已取，但工作流附件未验证，保持阻断。模型仅验证官方公开清单（约2.1GB，不下载/执行）。B站真实样本无匿名字幕，保留明确不可用原因，不冒充成功。
- 持久化：现有开发Pixaroma来源SYSTEM真实运行b2e20801-0a00-4cb7-a726-5b3c898f516d返回30篇，0新增/30重复，Raw总量不变；1篇逐篇ZIP人类说明凭证成功持久化并通过材料Gate。缺发布日期/两独立来源及两实践类型仍不进入今日值得做；不能以此次材料通过宣称实际运行工作流成功。
- 验证与发布：专项、完整quick回归/typecheck及本地标准Next build通过。腾讯云7文件最小后端候选typecheck通过；SYSTEM为无app目录的后端裁剪树，不适用Next build。已于本轮完成Deno/Tencent最小生产晋级，见上方PUBLIC-CONTENT-PRODUCTION；Web/P0读模型与timer配置未改，长期观察仍待执行，不能与此前Pixaroma已部署增量混淆。无DDL/AI/新Source/Secret传输。

- Goal / Role / Surface：运营人员确认来源管理→热点追踪分类；修复双新闻汇总漏排、逐篇材料门槛及生图/工作管理/助手召回。
- Scope：现有确定性分类、Raw材料元数据、未入选原因、回归及腾讯云生产数据验收。UI KEEP；不改课程、评分权重、来源身份、DDL、Deno或定时器。
- 分工：Code校验公开服务器获取证据、完整正文/字幕或已验证工作流与步骤，未知失败关闭；AI/Skill不参与运行；Workflow复用SYSTEM；Human保留既有UI审核边界。
- Read / Write：读取Raw/Event/Evidence与现有材料；写现有派生快照及适配器材料元数据，不补造历史认证。无新增权益、密钥或外部消息。
- 选择：复用统一纯函数与现有JSONB；拒绝标题关键词直接等同可实践，也不引入AI或第二采集主链，降低成本并使原因可追溯。
- Acceptance：双新闻排除及单事件/教程误伤反例；逐篇无正文、登录、截断、步骤或材料缺失均明确阻断；新增主题正例；typecheck/build/专项回归；生产隔离代码真实数据验收后按既有后端最小发布边界推进，不绕过未批准UI。
- Rollback / Owner：回指原后端release、保留Raw；规则owner为采集合同，代码为practical-evidence-actionability/practice-topics/intelligence-read-model。

### 实施与生产真实数据验收

- IMPLEMENTED：双新闻主体拼接排除，保留同主体补充/指代续句/汇总工具教程；新增生图、工作管理、助手目标。逐证据公开访问、完整正文/字幕、编号操作步骤、输入输出和访问依赖校验；共享帮助不冒充逐篇材料。API读模型新增practiceAssessment（逐篇材料/来源/关联/主题原因及数量缺口），管理员practice-diagnostics视图返回按工具+任务主题重算的不足原因；不改变页面布局。缓存版本v13，不复用旧快照。
- Validation：新增反例先失败，修正后专项与完整quick回归PASS；typecheck、标准Next生产build PASS（Windows默认沙箱mkdir动态路由EPERM，受审执行同一构建成功）。无新增业务依赖、AI调用、DDL或来源清洗。
- 2026-10-15 21:37北京时间：腾讯云隔离候选代码以512M/50%CPU只读opc_ai_prod，238个七日唯一Event、热点1、精选23、实践0；检查21份实践关联候选，21份缺公开服务器回执/完整正文或字幕/步骤及输入输出/明确工具任务身份，其中4份操作语义不足、3份来源不具正式资格。原因可重叠，不加总成过滤条数。耗时1785ms，JS heap约27MB（不是进程峰值）；零写库、不触发采集。
- 部署边界：此次生产验收是候选代码读取生产真实数据，非线上已切换。当前Web及日历/P0读模型仍为旧版（SYSTEM独立材料采集增量已发布）；全量v13包含此前未批准界面交互，不能绕过VISUAL_HUMAN_REVIEW_GATE。当前没有伪造公开获取回执，也没有为了列表非空降低门槛；逐篇采集已产出材料凭证；分类v13与跨来源实操入栏仍需后续验证。

## RADAR-CALENDAR-FUNNEL — Decision Brief / Execution Plan

追加任务边界：清除明确可证明的内容测试数据，保留最近成功SYSTEM实采及全部真实报道，不把开发联网验收误当假数据；Code负责双库只读盘点、精确ID备份/事务删除与真实内容不变断言，AI不参与，Human只处理证据不足对象。热度继续消费同Event/Cluster下多独立来源报道，重复轮询/同原始发布者不重复加参与者；补确定性反例，不改评分权重。验收为已确认夹具退出、真实Raw数量/最后采集时间不变、聚类多报道及重复反例通过；回退使用受限临时备份，不涉及课程、DDL或生产切换。

清理结果：双库Source/Raw/Event/Run的acceptance/testOnly/isTest/mock明确标记均0；开发库另确认归档HTTP503故障样例（固定httpstat.us/503、0Raw、两次FAILED且0新增），备份后事务删除1测试Source和2测试Run。开发Raw1309、Event1141保持，Raw最后采集时间不变；生产仅只读核查，Raw5435、Event5364保持。保留E2E真实联网结果、最近成功SYSTEM实采及审计，不以来源停用/旧日期或标题含“测试”为删除依据；没有证据的内容不猜测删除。最近成功新增内容已按Run.createdRawItemIds逐条关联原文验证：开发Pixaroma公开材料，生产国内综合热点/TechCrunch/InfoQ内容仍在。明确测试标记核验不等于逐篇真实性认证。

热度核对：当前读模型汇入同Event及聚类成员全部SYSTEM报道后计算Momentum，并非只拿代表标题评分。新增回归证实两独立报道分数高于单篇、同篇重复10次分数不变；既有聚合器同原发布者去重/汇总排除测试继续PASS。类型检查PASS；无业务算法、权重、UI或生产发布变化，未调用AI。

Status: IMPLEMENTED / PRODUCTION_READ_ONLY_VALIDATED / USER_REVIEW_PENDING；用户已明确指定规则并授权实现；顺序执行，不派生采集主链。UI 交付后仍需 VISUAL_HUMAN_REVIEW_GATE。
- 追加反馈：历史加载结束修正。边界仅为同一读模型历史资格判断、到底文案与统计释义；按实际可见事件寻找下一有内容日期，SQL先过滤明显不合格记录，再复用主事件/证据规则；不因历史空日截断更早合法内容，无合格历史显示“已经到底”。原“历史含空日”要求被本次反馈替代，默认七日空日仍保留。新增原因反例、真实开发/生产只读验收及构建；回退仅代码/快照，仍不切生产。
- Role / Surface：管理员来源管理→热点追踪；仅改时间线、诊断统计及采集计数元数据，课程/权限/模型/来源资格冻结。
- Goal：删除120条首批规则；北京时间今天及前六日完整返回，今天展开、其他折叠；历史每次一个有内容日期，跳过历史空日，到底明确显示；同批数据计算数量与分类。
- Code / AI / Skill / Workflow / Human：Code负责日期、唯一Event、聚合及解释；AI/Skill不参与业务运行；SYSTEM继续唯一调度；Human只做界面体验审核及生产界面发布确认。
- Recommendation：日期半开区间＋eventAt/firstSeenAt规范事件时间＋ID稳定排序；一次REPEATABLE READ只读事务构建完整窗口，快照items和计数同源；不用先LIMIT再过滤。历史按日期游标，固定asOf，运营忽略仍即时覆盖。
- Funnel：北京时间今日、近七个自然日、最近100次运行分别标记；返回/过滤/Raw新增重复/事件新建归并分开计量；旧Run无事件计数明确未记录，不用当前表状态猜历史。七日可见Event属于存量，不冒充运行漏斗终点转化率。
- Data / Boundary：只读生产298快照及SQL审计；无DDL、无来源清洗、无AI、无生产写入；新增未来Run元数据复用JSONB。部署先同版Web/SYSTEM构建和真实生产只读验收，UI未批准不切换生产。
- Validation：北京时间午夜、7日边界、相同时间400事件、不重复/不截断、空日、非法日期、历史未知统计；完整发现采集回归/typecheck/build；真实生产审计，解释旧298与新口径差异；本地登录体验。
- Acceptance：默认7日items唯一数=totalEventCount7d=分类之和=各日之和；每次历史只取一天，默认不混入七日计数；新Run阶段守恒，旧Run缺失显式；服务器可运行且不依赖电脑。
- Rollback：同版代码和快照schema回退，保留Raw/Event/Audit及新增元数据；不改timer与Secret。Owner：采集架构合同、radar-calendar、intelligence-read-model、radar-snapshot、collection-funnel、collection-runner。
- Evidence references：PostgreSQL14 transaction-iso.html（REPEATABLE READ）、functions-datetime.html（显式时区）、queries-limit.html（唯一排序）；本轮只据官方文档和实际代码/数据库形成结论。
### 本轮自检、真实数据与发布边界

- 历史到底追加验收：开发真实页面加载10月8日23条后按钮消失、显示“已经到底”，日期组止于10月8日，无10月7/6日空行；七日389不变、含历史412。腾讯云生产只读遍历历史1日共2条，nextCursor=null/reachedBottom=true，3.231秒；受限验收峰值RSS147880KB。完整quick回归、typecheck、build PASS。2652=新增Raw214+重复Raw2438属于此前开发快照的今日条次；389为该快照七日独立事件，不能相减推导漏采。UI仍待用户审核，未切生产。

- 旧快照12:10:20Z确为298条、首批120条；旧查询12:26:43Z为300条，其中2条创建于原快照之后。旧300与新230逐ID对照：69条已归档仍被旧查询计入，另1条是10月8日回填、超出北京时间10月9–15日窗口。旧快照无完整ID清单/历史状态版本，不能把当前状态硬说成原298完整复原。
- 最终腾讯云只读验收锚定12:42:56Z：旧302、新232，唯一ID=列表总量=逐日合计；此前一天10月8日2条、与七日无交集。数据持续增长，数字属于此验收时刻，不是产品常量。隔离代码未切换生产，不刷新生产快照，不写生产业务表。
- 同次真实运行窗口：今日/七日成功722次、失败1次；返回21008条次、过滤保留5089、新Raw361、重复Raw4728。历史722次没有事件新建/归并计数，明确未知。最近100次为独立窗口，不再称“今日采集”。这些是按运行时间的流量，七日可见Event是按事件日期的存量，不能强作同一批转化率。
- 资源实测：腾讯云临时systemd服务MemoryMax512M/CPUQuota50%，只读验收退出0，3.664秒、CPU1.810秒、峰值RSS143484KB；未增加常驻任务。本地开发库经SSH查询有约73秒端到端延迟，不能据此推断生产同样慢。
- 自检修正：去掉先LIMIT后过滤；排除archivedAt；Date查询参数转ISO；历史回填createdAt上界用asOf而非历史日末；七日分组按服务器北京时间；健康详情展开不得覆盖三种统计窗口；仅投影运行计数元数据，避免搬运Raw样本。浏览器时钟与服务器日期可能不同，今天展开以服务器窗口为准。
- Validation：完整发现采集quick回归（含typecheck）PASS；新增午夜、非法日期、400同时间、不重复/不截断、旧计数未知与阶段守恒检查PASS。最终build PASS，脚本入口和diff空白检查PASS；Chrome真实开发库体验：七日389唯一Event、日期合计389，今天85条默认展开，其余六日折叠；加载一次增加10月8日23条，总计412但七日仍389；三统计窗口和历史缺口可见。界面IMPLEMENTED / USER_REVIEW_PENDING，未获UI审核不标USER_APPROVED。
- 发布要求：复用现有腾讯云Web/SYSTEM发布与回退路径，同版更新二者并刷新v12快照；无DDL、新依赖、Secret或timer改动，Deno无需发布。生产先验版本/唯一数/日合计，再观察唯一timer下一真实Run新增元数据。旧Run不回填猜测值。当前只具备隔离验收，未宣称已生产切换。
- 难点：固定asOf不是历史状态快照；运营即时忽略会改变当前可见集合。当前七日计数与列表同批构建解决一致性，历史逐日按当前规则读取；如以后要求跨小时绝对冻结，需单独批准版本化清单/保留期，不把长事务维持到用户翻页。
- 下一步优先：以新Run计数观察真实增量与阶段守恒；先对已支持的Feed补齐/核对条件请求、304计数及变化后再下载正文，减少高重复轮询；依据[RFC9110条件请求](https://www.rfc-editor.org/rfc/rfc9110.html#section-13)。查询增长后先用[PostgreSQL EXPLAIN](https://www.postgresql.org/docs/14/using-explain.html)测计划/缓冲命中，再决定表达式索引或SQL聚合；当前实测不支持直接引入Redis或常驻浏览器。读取一致性依据[PostgreSQL14隔离级别](https://www.postgresql.org/docs/14/transaction-iso.html)。

# NOW — SOURCE MANAGEMENT → HOT TRACKING PRODUCTION CLOSE

## Pixaroma生产后端独立发布 — Decision Brief

Status：PRODUCTION_DEPLOYED / SOURCE_REGISTERED / LONG_TERM_OBSERVING。Role/Surface：来源管理员；UI KEEP。
- Scope：基于已运行生产版本构建最小SYSTEM增量，仅发布固定材料Adapter、Relay client、无日期保护/视频去重及事务审计所需兼容签名；生产登记单一作者Source。不发布P0界面、评分/实践主题改动，不复制开发业务数据、不做DDL。
- 分工：Code负责发布清单/hash、Gate、注册审计、SYSTEM运行和只读观察；AI/Skill不调用；Workflow复用唯一timer；Human处理后续UI审核，不参与采集登录。
- 推荐：独立不可变release与原子current切换，保留旧release；生产先新来源实采/幂等，再验现有timer。避免整分支覆盖未审核内容。
- Validation/Acceptance：生产基线文件hash核对；最小增量typecheck/build/确定性测试；开发库同一release预演；生产Source与Audit、Raw/Observation/无日期Event断言及服务健康；24–72小时稳定仅记观察，不提前宣称。
- Rollback：先停用新增Source并审计，current回指原release；保留Raw/Observation，不动Web/课程/其他Source。Owner：采集架构合同、现有SYSTEM发布入口、Pixaroma Source/Adapter。
- 发布：`20261015-pixaroma-materials`；以服务器实际旧release为基线，最终manifest确认仅10个清单文件变化，无其他文件差异。Git archive的CRLF与额外验证脚本未带入生产；服务器原有脚本修正全部保留。旧`20261015-production`保留回退，Web仍为原release。
- 验证：隔离发布包typecheck/build/固定路由测试PASS；同版腾讯云开发库预演0新增/30重复；生产只读Schema/权限/Relay预检READY，应用非超级用户，无DDL。首次生产登记探测20秒超时，未登记；沿现有runner的Node网络参数受限重试成功，不掩盖瞬时网络失败。
- 生产数据：北京时间20:06登记并事务审计（1条注册审计），首轮30新增；回放0新增/30重复，Raw=30、Observation=30，无日期材料当前Event=0。资格CONDITIONAL、连续运行失败0；不人工提升AUTO_READY，不复制开发业务数据。
- 调度：现有唯一`opc-collection.timer`配置保持；来源已在SYSTEM列表且executable=true，15分钟基础间隔，诊断下次到期20:21:41；`HUMAN_REVIEW_REQUIRED`为现有治理建议，不阻断自动执行。新来源尚未完成24–72小时稳定观察。无新常驻timer、AI调用或本机依赖。
- 发布后原定时器真实周期20:08启动、20:10:20完成，`SERVER_NATIVE_AUTOMATIC_CYCLE=PASS`、failures=[]、退出0；CPU约16.86秒。Pixaroma尚未到期，本周期不重复抓取；首次到期后的自动实采仍属长期观察。后台HTTP200、Web release未变。生产缺确认参数负例正确失败关闭；临时上传包与诊断目录已清理。

## Pixaroma公开材料路由 — Decision Brief

Status：IMPLEMENTED / DENO_DEPLOYED / DEVELOPMENT_REGISTERED / CROSS_CYCLE_VALIDATED。Role/Surface：来源管理员；UI KEEP，课程冻结。
- Scope：仅消费已发现的Pixaroma目录/公开步骤/小型工作流；固定Deno Provider，无任意URL代理，不重复全网发现；单一作者Source，视频URL规范化复用Raw/Observation去重。
- Responsibility：Code负责允许域、大小/时间预算、ZIP结构与JSON校验、日期真实性、事务注册/审计、运行观察；AI/Skill不调用；Workflow复用SYSTEM；Human处理语义争议，不参与日常登录。
- Recommendation：作者结构化目录优先，已有聚合结果只补材料；未发布条目排除，无发布日期标历史参考，不以采集时间制造热点；大型材料显式缺口，不下载全站。
- Acceptance：Deno预览→腾讯云实采→注册开发Source→SYSTEM真实运行→重复运行无新增副本；跨周期必须使用真实经过时间，未完成长期观察不得宣称稳定。无Web/UI生产覆盖，无DDL。
- Validation：固定路由/恶意JS/重定向/大小限制/待发布/缺日期/ZIP JSON/去重回归，typecheck/build；发布保留旧Deno回退版本，Source可停用并保留历史。
- Owner：采集架构合同；Deno entry、public-workflow-materials、Source runtime adapter及现有Source/Raw/Observation。
- 实测：腾讯云经Deno取得30集目录，第31/28/27集共10个ComfyUI节点JSON与3步共享操作说明校验通过；工作流未执行、视频字幕未取得。37个非comingSoon目录只取前30，7个历史条目为明确预算积压；其余大包未下载，不标完整实操。目录均无发布日期，生成当前Event=0。
- 开发注册：`source_operator_creator_pixaroma`，来源管理onboarding/CREATOR角色及SYSTEM列表断言通过；首次30新增，立即回放0新增/30重复，Raw=30、Observation=30。既有搜索Pixaroma记录只关联原作者，不重复发现、注册或授予事实权。跨周期资格仍保守，不手工授予AUTO_READY。
- Deno：预览实测通过后生产发布revision `cq7emzmxdmty`（上一v2 revision `41egse2fxff2`可回退）。开发验收后的生产SYSTEM独立发布由上方任务承接；旧Audit签名差异仅随材料发布补事务executor，不复制全部未审核分支。Web保持原版本。
- 观察：腾讯云一次性service `opc-pixaroma-cross-cycle`北京时间19:56:23开始，19:56:33成功（首次19:40:21，间隔超过16分钟）；使用Deno生产地址，30条/0新增/30重复，Raw与Observation均仍30，无日期材料当前Event仍0。CPU约1.96秒，512M/50%CPU；无新常驻timer、不依赖本机。临时验证目录与传输包已清理。仅证明本次跨周期，不代表24–72小时或长期稳定。
- 检查：完整发现采集回归quick（含typecheck）PASS，build PASS；新增固定域/恶意脚本/任意URL忽略/重定向策略/ZIP结构与路径/视频链接去重检查PASS。长期连续可采与材料运行效果尚不成立。

## 公开作者与操作材料核验 — Decision Brief

Status：DEVELOPMENT_VALIDATED / NO_ELIGIBLE_CREATOR / PRODUCTION_PENDING。Role/Surface：管理员来源管理→热点追踪；UI KEEP。
- Goal/Scope：核验上一轮作者候选的公开详情、作者列表、原创归属与完整材料；剔除登录/关注/私信/人工会话依赖。仅合格者可正式注册；不追求必须注册出正数。
- Code：确定性访问门槛、服务器公开请求、资格原因、Raw材料与事务审计；AI/Skill不调用；Workflow复用现有采集；Human不参与运行中的登录/领资料。原创声明不等于已证实原创。
- Data/Side effects：开发库候选Raw/metadata/audit；只请求公开B站端点；海外仍遵守Deno路由。无生产写入、无Cookie、无DDL、无课程/UI变更。
- Recommendation：优先作者公开步骤与工作流，公开字幕仅补材料；YouTube官方字幕需owner授权，不作为通用第三方字幕路线。未实现且未实测的作者路由保持阻断，不恢复Browser旧策略。
- Validation/Acceptance：访问门槛反例、显式/旧路由禁止交互依赖、腾讯云单次有限内存/CPU逐候选探测与审计；完整回归/typecheck/build；无材料不标全文、无稳定路由不注册。
- Rollback：代码回退；候选保留历史核验元数据与审计；无删除来源或Raw。Owner：采集架构合同、public-practice-access、public-creator-probe、source-acquisition-plan。
- 真实验收：腾讯云开发库10个候选完成评估与事务审计，0个合格、0个正式注册；2个明确关注/私信依赖排除；3个B站取得公开详情，但无可用作者列表/字幕/完整材料；5个YouTube按当前作者Relay路由缺口阻断，未尝试需要owner授权的字幕。一次探测不能证明长期稳定。
- 材料状态：该视频候选探测未取得正文/字幕，不声称全文。Pixaroma后续作者站路线由本文件“Pixaroma公开材料路由”承接，不重复发现；其他作者未补路由。
- 已实现：定向搜索排除显式关注/私信/登录领资料；已有实践证据同样排除；新旧Acquisition声明requiresLogin/requiresHuman/requiresFollow/requiresBrowserSession均拒绝。保留Raw历史与可解释失败，未删除合法Source。
- 后续公开作者站路由与跨周期观察由本文件Pixaroma任务承接；通用视频作者与字幕路线未完成，不标记全面采集闭环完成。
- Validation：完整发现采集回归PASS；最终访问规则微调后专属检查、路由检查、typecheck、脚本入口检查与build再次PASS；临时腾讯云代码目录已清理。未部署生产。

## 受管实践搜索实测 — Decision Brief

Status：DEVELOPMENT_LIVE_VALIDATED / PRODUCTION_PENDING。承接本轮明确授权，页面与课程冻结。
- Goal / Role / Surface：管理员来源管理→热点追踪；搜索与作者候选沿既有Source/Raw主链进入待审，验证服务器运行。
- Scope：登记受管B站/YouTube搜索路由；事务审计、真实探测、候选写入、语言修正、移除非必要AI前置门槛。无DDL、无生产变更，不恢复归档旧Source、不自动注册作者。
- Responsibility：Code负责网络、去重、预算/冷却、资格与状态；AI/Skill仅后续人工触发语义筛选/翻译建议；Workflow复用SYSTEM；Human确认作者、语义争议、正式内容及UI。
- Data：读开发来源与管理员；写开发Source/Audit/Raw/Observation/Snapshot；无Secret传输、无AI调用。
- Recommendation：借鉴Inoreader监测订阅与规则过滤、Feedly原始源与AI分离；API/Feed为主，定向搜索补证。拒绝常驻浏览器、全量AI扫描、搜索命中自动入选，避免压力、会话依赖及错误资格。
- Acceptance：腾讯云512M/50%CPU单次进程，真实返回、登记审计与持久化；不进入持续关键词扫描，不授予候选正式实践资格；完整回归/typecheck/build；生产沿既有UI Gate。
- Rollback：停用新搜索Source并回退同版代码，保留Raw/Audit。Owner：采集架构合同、managed-practice-search、collection-expansion、source-portfolio-runtime。
- 实测：B站直连、YouTube经现有Deno各返回5条；开发库2条CONDITIONAL路由、10条参考、10个作者名称；0个正式作者注册、0次AI。名称数量不是独立原创已验证数量。新快照热点5、实践主题0。
- [x] 开发登记、持久化/非持续扫描验证；YouTube英文模板；今日值得做移除AI分析AVAILABLE前置依赖，保留独立来源及实践证据门槛。最终完整发现采集回归（含typecheck/build）PASS，脚本入口检查PASS。
- [ ] 作者逐个验证持续可采、原创性、完整步骤及产出后走正式Source注册；目前仅作者候选，没有作者持续采集验收。
- [ ] 补齐海外作者Feed/正文Deno路由和视频详情/字幕；description不能全文翻译。
- [ ] 单篇强教程入栏路径需完整样本再设计，尚未实施。
- [ ] 人工AI增强复用Gateway与审计：辅助查询改写、语义相关性、分类/标签、事实抽取、中文标题/答案先行摘要/推荐理由、分段翻译；分别输出并引用原文hash/材料。Code控制域、预算与写库；未知公司别名及完整语义不能机械证明，需复核。现有内容理解模块不是生产功能已接通。
- 参考：[Inoreader监测](https://www.inoreader.com/blog/2026/01/discover-and-monitor-content.html)、[Feedly来源治理](https://docs.feedly.com/article/768-follow-sources-in-feedly)、[Feedly引用](https://docs.feedly.com/article/741-guide-to-ai-actions-for-feedly-market-intelligence)。仅借鉴方案。

## 实践主题与汇总排除 — Decision Brief / Implementation Plan

Status：IMPLEMENTED / DEVELOPMENT_LIVE_VALIDATED / USER_REVIEW_PENDING；生产未部署。
- Role / Surface：管理员热点追踪；UI KEEP，复用Event、Evidence和SYSTEM主链。
- Scope：多新闻汇总排除热点与今日值得做；今日值得做主体必须为具体实践，保留独立来源/类型门槛；定向扩展须由已管理搜索Source承载，禁止隐藏Source；移除常驻重新读取，仅失败重试。
- Responsibility：Code负责分类、身份去重、阈值、预算和冷却；AI/Skill不自动运行；Human确认候选Source与实际UI。
- Recommendation：先校正内容主体，再复用已有定向搜索和证据校验，避免以模型发布的附带教程冒充实践主题。
- Validation / Acceptance：真实汇总反例、单一发布、操作教程、泛关键词误判、缺少实操主体、搜索来源失败关闭及预算测试；typecheck/build；本地体验待审核。
- Rollback：同版Web与SYSTEM代码回退，历史Raw/Evidence保留；无DDL、无生产操作。
- Owner Files：采集架构合同、intelligence-read-model、practical-evidence-actionability、collection-expansion、radar-snapshot与现有热点组件。
- [x] 分类、原文实践主题归并与跨父Event忽略重算TDD；发布新闻不变成实践标题。
- [x] 定向扩展来源/预算/冷却治理；搜索结果仅为PENDING_SOURCE_REVIEW参考，后续按原Event重建Evidence，不能自动授予新作者资格。
- [x] 完整发现采集回归与build通过；独立审查修正发布伪教程、跨事件忽略、搜索上下文和Provider范围。
- [x] 腾讯云/tmp隔离单次进程直连开发库生成v11快照PASS：热点5、实践主题0、已就绪且opt-in的搜索来源0；约15.5秒，512M/50%CPU。数量仅为本次测试，不是固定生产事实。
- [x] 开发库配置并真实验证受管B站/YouTube搜索Route；生产未配置，边界见本文件受管实践搜索任务。
- [ ] 新版登录后UI体验审核及明确确认；生产未部署。
- Coverage limit：当前工具标题明确匹配ComfyUI/REA及具名英文Skill/MCP，操作目标采用确定性规则；未知名字/任务保持候选，尚不具备全领域召回保证。后续扩展规则不能合并泛Skill/MCP标签。

## P0 运营一致性修正 Implementation Plan

Status：IMPLEMENTED / DEVELOPMENT_VALIDATED / USER_REVIEW_PENDING。用户已确认顺序实施；P1–P4不在本次范围。

> For agentic workers: use superpowers:executing-plans，当前会话顺序实施；不派生平行采集链。

**Goal:** 忽略立即持久生效、快照过期可见、资格真实、来源操作和规则变更与审计原子提交。
**Architecture:** 复用现有Drizzle事务、Event状态、Snapshot和审计表，无Schema迁移。快照基础缓存继续由SYSTEM刷新，读取时轻量覆盖最新Event运营状态；不在GET重建全窗口。
**Tech Stack:** TypeScript / Next.js / PostgreSQL / Drizzle；无新依赖。
**Spec:** 本文件COLLECTION-OPERATIONS-HARDENING设计第7、8项及P0验收；采集架构合同为规则owner。

### Global Constraints

- UI KEEP；不改评分、课程、权限、会员、timer、Deno、AI调用策略。
- 忽略不删除Raw/Evidence；采用仅记录意图，继续观察保留事件。
- 归档恢复只针对operator-added Source，恢复为禁用并重新走既有资格检查；禁止恢复退役来源路径或自动启用。
- 不自动commit、不直接覆盖生产目录；验证后提供独立release体验，UI未经明确审核只标IMPLEMENTED。

### Review Focus

- 忽略和旧快照刷新并发：任何读进程不重新展示已忽略事件。
- 写审计失败：Decision/Event或Source/Policy不得留下半提交。
- 日期损坏/未来日期：显示快照异常，不能当新鲜结果。
- 资格探测成功但正式Run不足：保持PROBED/OBSERVING，不写合格。
- 归档恢复或重复启停：资格与禁用标识不漂移，操作人和原因可查。

### Execution ledger

- Ruling：沿用户指定本地目录创建codex/p0-operations-consistency分支，不另建目录；保留TASKS未提交计划。
- Task 1：真实开发库用不存在actor触发审计FK失败，Decision/Event回滚验证PASS；Source审计缺失反例RED已复现，修正后GREEN。
- Task 2：时效/全榜单覆盖/未知Event失败关闭夹具RED→GREEN；独立Node进程读取忽略覆盖PASS。
- Task 3：来源启停、归档、恢复及Policy事务回滚、并发决策与资格不足真实开发库PASS；所有专属夹具finally清理。
- Ruling：旧回归以TASKS中的历史原句校验Source owner，治理后误报；改读规则唯一owner采集合同，不恢复重复历史任务。
- Task 4：首轮旧文档断言及沙箱build EPERM已修正；最终完整回归PASS（含typecheck/build）。
- 独立复核：修正恢复时误写实际资格DISABLED，新增保留原资格夹具PASS；发布必须先SYSTEM生成当前v13快照再切Web，不能只升级Web。
- 冷启动：本地开发隧道读取较慢但最终PASS；腾讯云临时隔离代码包同一开发库全部验收PASS，unit约3.6秒、512M/CPU50%，未改生产。临时包验收后清理。
- 体验：http://127.0.0.1:3102/admin/sources 与 /admin/intelligence，需现有管理员登录；当前未取得UI明确审核，不部署生产、不进入依赖界面的下一阶段。
- Rollout Gate：先部署同版SYSTEM代码并生成v13快照，再切Web；回退同样保持Web/collector的快照版本一致。保留旧release，无DDL。

### Task 1 — Decision与审计原子性

Files：lib/server/content/workbench.ts、discovery.ts；app/api/admin/content/discovery/events/[eventId]/decision/route.ts；新增scripts/validate-collection-operations.ts及scripts/accept-collection-operations.ts并登记package.json。

Interfaces：recordContentAudit保留原调用兼容，增加可选事务executor；recordCandidateDecision返回原Decision字段及已提交discoveryStatus。

- [x] RED：开发库隔离夹具验证审计插入失败后Decision与Event均不变；同Event并发操作串行锁定，返回状态与本次提交一致。
- [x] 记录预期失败后，实现同一事务内行锁、Decision、Event和审计；现有审计调用默认行为不变。
- [x] GREEN：验证IGNORE/WATCH/ADOPT、无效Event、并发与失败回滚；测试夹具finally清理，不碰正式数据。

### Task 2 — 快照与前端一致性

Files：lib/server/content/radar-snapshot.ts、intelligence-read-model.ts；components/AdminIntelligenceWorkspace.tsx；必要时intelligence API；上述两份验证脚本。

Interfaces：getRadarSnapshot保持既有字段，增加freshness={ageSeconds,stale,maxAgeSeconds,reason}；最大年龄30分钟，非法/未来时间标记异常。每次请求基于Event运营状态覆盖items/featured/currentHot/worthPracticing，更新全窗口分类计数；缓存基础快照不能缓存运营覆盖结果。

- [x] RED：测试已忽略事件在所有榜单退出，WATCH/ADOPT状态同步；旧快照跨独立Node进程读取仍遵守当前Event状态。
- [x] RED：29分钟新鲜、31分钟过期、无效/未来日期异常；读取旧快照不触发全量刷新；分页加载不得带回忽略项。
- [x] 实现只读覆盖及时间判断；Decision成功后UI按返回结果立即修改现有列表，防止在途旧请求回写；刷新失败保留最近数据与错误提示，成功消息不被loadSnapshot清掉。
- [x] 仅在现有状态区域展示生成时间/过期提示与重试，不重排布局；测试并发刷新、慢请求及失败。

### Task 3 — 资格与来源运营审计

Files：lib/server/content/source-onboarding.ts、source-management.ts、source-management-policy.ts；app/api/admin/content/source-management/route.ts；components/AdminSourceManagementWorkspace.tsx；验证脚本。

Interfaces：来源和Policy写入函数接收AuthUser与可选reason；reason缺失记录明确动作原因；AUTO_READY→QUALIFIED，成功探测但不足→PROBED，有有效生产观察但未合格→OBSERVING；无成功探测不记录成功qualifiedAt。

- [x] RED：探测不能充当正式Run成熟度；合格/不足/失败与时间字段一致。
- [x] RED：启停、归档、恢复、Policy变更保存actor/reason/before/after；强制审计失败时业务写回滚。
- [x] 实现行锁及事务，局部更新onboarding元数据避免覆盖并发Run；禁用管理标识与enabled一致；Policy并发更新使用唯一key upsert及事务。
- [x] 恢复入口复用现有来源管理详情操作，不新增页面；baseline不可归档，退役路径不可恢复，不自动授予资格。
- [x] GREEN：重复操作、并发变更、归档恢复及鉴权检查通过；审计不写Secret。

### Task 4 — 完整验证与可体验交付

- [x] focused validator与开发库真实验收；无可用开发库则明确DB_VALIDATION_BLOCKED，不用静态测试代替事务验收。
- [x] npm run scripts:current:check、npm run content:discovery-collection:regression（含typecheck/build）；git diff --check。
- [x] 更新采集合同/映射、CURRENT_SYSTEM_FACTS与PROJECT_STATUS，仅反映已验证结果。
- [ ] 完成登录后实际交互体验审核（已提供本地入口）：忽略、刷新、过期、资格、来源审计；明确USER_REVIEW_PENDING。
- [ ] 用户体验确认后才标USER_APPROVED；生产部署使用独立release并保留旧release回退，不改数据库Schema或timer。

Rollback：本轮代码回退即可；新增审计保留，Decision/Event事实不自动逆转，恢复操作仍需管理员明确动作。生产旧快照不可当回滚成功证明。

## COLLECTION-OPERATIONS-HARDENING-20261015 — Decision Brief / Design

Status：P0_IMPLEMENTED / USER_REVIEW_PENDING；P1–P4仍为后续设计，P0尚未发布生产。

- Goal / Role / Surface：管理员来源管理→热点追踪；降低重复联网与解析成本，保证运营操作立即可见、来源质量可判断、失败可恢复。保留既有页面布局。
- Must Know：采集合约、Acquisition Route、HTTP适配器、Source/Run元数据、资格与cadence、快照/Decision/审计API。Nice to Know：AIHOT对应机械实现；Do Not Load：课程、会员、历史任务。
- In Scope：条件请求、频率/退避、按需正文、统一海外出口、运行/质量/分类解释、来源候选待审、忽略一致性、资格语义、关键操作审计。
- Out of Scope：更改热点/精选/今日值得做门槛，自动AI，采用→内容工作台，课程/权限/会员，Redis、第二scheduler、常驻浏览器，自动批准来源或删除历史。
- Responsibility：Core拥有请求、调度、状态、审计、候选及校验；Workflow继续SYSTEM单timer；AI/Skill不进入采集；Human确认新Source/高成本路由及UI体验。

### Proposed Design

1. HTTP条件状态绑定逻辑Source + Route + 最终URL及配置指纹。持久化ETag/Last-Modified仅在解析、过滤、入库全部成功后提交；失败不得推进validator。304是成功检查但不是新内容或新实践证据，不重复解析/写Raw；不把304当缺Location的重定向。首次补采、显式有界回放和配置改变时不复用旧validator；304但无有效历史检查点时仅允许一次无条件重取。
2. Cadence沿用现有治理计算：人工基础间隔优先；以近7日唯一新增内容产出推荐15–360分钟，叠加治理降频和配额限制。连续失败指数退避，上限24小时，尊重有界Retry-After；成功重置连续失败，304不等同内容荒废。只有明确瞬时网络/5xx允许预算内一次重试，401/403/配额不足不盲重试。来源覆盖保护仍不被自动停用。
3. 列表→正文沿用当前采集器：Feed已有真实正文直接复用；详情只针对新增且规则相关、正文不足、路由允许的条目，每来源每周期上限3条，并沿用总时间/体积预算。提供列表URL内存去重，保存正文来源和完整性。付费/登录详情不得自动升级，无正文不得伪装全文翻译资格。
4. 海外出口集中为一个确定性请求Adapter，业务采集器不单独写代理逻辑。国内已登记路由直连；海外公共路由走现有Deno Relay的Source/Route白名单；保留可配置的可信Relay base URL便于后续换承载。不得把Deno改成任意URL公开代理；重定向逐跳检查，HTTPS/认证/私网与体积/超时保护保持。登录来源按原登录环境运行。缺少已验证路由明确BLOCKED，不偷偷直连。原4 providers保持兼容。
5. 来源质量分项记录：HTTP检查、有效条目、原始发布时间、原链、作者、正文完整性、主题相关保留率、重复率。独立原创仅有origin身份或可核验数据时给出结果；未知显示UNKNOWN，不凭关键词或模型猜测。按Run保存分子/分母、窗口、样本量；不得用短时间5次重放冒充7日稳定质量。
6. 运行诊断从既有Run/治理事实派生：最后尝试/成功、下次due、连续失败、安全错误码、资格原因、恢复结果。分页受限标明TRUNCATED/游标/可恢复状态；上游不支持回溯标记UNAVAILABLE，不承诺完整历史。正文缺口与来源失败单独展示，不能合并成一个健康绿灯。
7. 快照与运营一致性：Decision写入、Event状态更新、审计同一事务；返回已提交事件状态，UI立即更新/移除对应事件及相关榜单，跨进程读取使用轻量最新决策覆盖。快照返回generatedAt/age/stale，过期保留最后成功结果并标记，不在每次页面GET全量重算；SYSTEM刷新仍唯一周期，运营变更触发一次合并刷新或确定性覆盖，禁止刷新风暴。失败展示可重试，不能显示成功却恢复旧状态。
8. 资格操作只写真实阶段PROBED/OBSERVING/QUALIFIED，只有实际AUTO_READY才标合格；探测和qualificationOnly仍不充当正式生产次数。启停、归档、恢复、规则改动记录操作者、理由和前后状态；写状态与审计同事务，历史Raw/Evidence保留。
9. 分类解释复用既有权威Gate输出，为每个Event返回热点/精选/实践的eligible、reasonCodes、actual/required值；不另建评分算法。正文或分析不足明确列缺口，不自动触发AI。
10. 候选来源归来源管理owner：采用独立最小候选表，canonical URL唯一、topic、发现依据/原链、最近探测、PENDING/REJECTED/REGISTERED、处理人。仅复用当前已采内容链接和管理员提交作有界召回；不做持续关键词全网扫描。初始主题覆盖ComfyUI/Skill/MCP/投流/改写/配图/动画/剪辑/客服/工作管理；候选不进入SYSTEM，确认后复用现有预览→注册→资格链。此项需要新增Schema，按Safe Migration Gate独立验收。

### Feasibility / 分阶段交付边界

推荐渐进复用主链。重建采集系统会增加第二套状态和迁移负担；仅补页面诊断则无法修复缓存与采集成本。本方案优先在既有Source/Run元数据、事务、Adapter和单timer上补足能力，候选表最后独立迁移。

| 阶段 | 可行性与依赖 | 验收出口 |
| --- | --- | --- |
| P0 运营一致性 | 高；既有Decision/Event/审计及快照可复用，无需新调度器 | 忽略后刷新/重启不恢复；事务失败无半提交；过期快照可见；资格按真实结果显示 |
| P1 请求降本 | 高；改HTTP结果模型、路由检查点和cadence计算 | 200→304不重复解析；失败不推进validator；连续失败延后且成功恢复；人工回放可绕过条件请求 |
| P2 海外出口与正文 | 有条件；每个来源须有可验证白名单路由，上游限流不可消除 | 来源逐项展示已验证出口/阻断；详情有数量、时间、体积上限；无正文不声称全文 |
| P3 质量与分类解释 | 高；复用既有Run字段与权威Gate，原创未知须保留 | 指标有窗口/分母；热点/精选/实践各列原因及缺口；不自动调用AI |
| P4 候选来源 | 有条件；最小新表及迁移Gate，实践作者仍需运营筛选 | 候选不自动入采；URL去重；拒绝/注册可审计；注册复用原资格链 |

资源验收沿用单进程512M/CPU50%和唯一timer；新增网络请求逐来源有界，不以304或回放刷高有效产出。用真实运行日志比较请求数、下载字节、解析次数、周期时长与失败率；未测量前不承诺降本百分比。确定性代码可保证流程和规则，不能保证第三方长期可用或所有主题全覆盖。

### Validation / Acceptance / Rollback

- 先验收机械Core：200→validator→304、解析/写库失败不推进、配置切换/补采绕过旧validator、重定向安全、失败退避/恢复、并发单次提交/唯一锁、无AI调用、原评分反例。
- 再验收运营：忽略后立即退出且刷新/重启不恢复；跨进程快照一致；资格不会假合格；启停/归档有同事务审计；质量未知不显示通过，候选未经确认不能采集。
- 检查：focused tests、npm run typecheck、npm run build、完整采集回归、git diff --check；开发库真实验证后再生产小范围验证。部署限CPU50%/512M、有限并发、单timer。
- UI：在现有详情/列表增量展示，不重排已确认PC布局；实际数据体验后由用户明确确认，再标USER_APPROVED。
- Rollback：独立release保留旧Web/采集包；新增元数据可忽略，validator失效可回到无条件请求；候选表不破坏既有业务表，不自动删除。生产DDL通过专用迁移账号与备份Gate，不用App Role/postgres绕过。
- Owner：规则最终归COLLECTION_ARCHITECTURE_CONTRACT；代码归既有collector/router/governance/source-management/snapshot；本条仅设计与任务进度，不复制事实owner。
- 推荐实施顺序：运营一致性→条件请求/退避→统一出口/按需正文→质量与分类解释→候选来源。每步单独可验证，使用当前会话顺序执行；未确认设计前不实施。

## CURRENT CLOSE — 尚未完成的生产验收

- 当前部署与能力缺口唯一见 `docs/CURRENT_SYSTEM_FACTS.md` §7B；已完成迁移、切换、补采的执行过程退出当前计划，不再保留旧阻塞或重复部署说明。
- [ ] 连续72小时观察：记录各来源失败/恢复、周期耗时/资源峰值、快照时效与缺口；不得用五次短时回放代替稳定性。
- [ ] BAIR及其他海外公共Feed逐项核验主/备用出口；区分当前健康、资格和实际路由。
- [ ] Deno Secret环境范围收窄与承载可迁移性复核；不向Relay传数据库配置。
- [ ] 已上线来源管理/热点追踪登录后真实体验审核；当前仅IMPLEMENTED / USER_REVIEW_PENDING。

## GOVERNANCE-FACTS-20261015 — 本轮治理

- Goal / Role / Surface：为管理员确定来源管理→热点追踪事实，清除重复描述与脚本入口，收敛后续可行性方案。
- Boundary：只治理当前文档、重复命令与回归编排；不修改业务行为、UI、Schema、生产来源或数据，不执行生产部署。
- Responsibility：Core保持现状；AI/Skill仅辅助核对；Human负责后续设计及可视化审核。
- Recommendation：保留唯一SYSTEM主链，分阶段实施上方设计；不以重建采集系统解决缓存、出口和质量诊断缺口。
- Validation：入口治理、采集单主链/架构/边界检查、文档引用与diff检查；入口治理、单主链、架构、发现边界检查、typecheck、production build、current owner链接与diff检查均PASS。首次构建沙箱目录EPERM，按原命令解除限制后通过；未重新跑真实生产采集或完整52项回归。
- Acceptance：当前事实与待实施设计可区分；无重复回归执行入口；旧开发故障与旧Web描述不再充当当前阻塞。
- Rollback / Owner：仅回退本轮文档及编排补丁；事实归CURRENT_SYSTEM_FACTS，代码映射归COLLECTION_IMPLEMENTATION_MAPPING，计划归本文件。

# NEXT — HUMAN ACCEPTANCE

- /admin/sources：确认发现渠道、来源目录、DailyHot Source detail、筛选职责是否清晰。
- /admin/intelligence：确认最近 7 天 Event 按日期折叠完整展示、摘要≤100字、加载更多可继续读取历史；热点参与者按机构/账号去重并 72h half-life；无同 cohort 历史时不展示趋势线；精选与热点评分分离。
- 用真实 7–14 天 Event 做 Precision / Recall 人工样本审计；只有证据支持时再调整 FEATURED / TOP_PICK / Momentum 阈值。
- Human Acceptance 后再决定 BILIBILI / DOUYIN / YOUTUBE 是否值得补真实 Source / Route。

# BACKLOG

- AI HOT 继续保持一个 Source Identity；若未来增加备用 Route，REST 为 primary、RSS 仅 fallback，不并行重复采集；不得把 AI HOT 聚合结果当独立 Fact Source。
- Creator / 评论需求 / 平台互动只作 Signal / Practical Evidence，不取得 Fact Authority。
- Content Workbench 继续只消费 Adopted Event / Evidence，不承担上游 Source 或热点修复。
