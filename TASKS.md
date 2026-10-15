# TASKS.md

> 只保留 NOW / NEXT / BACKLOG；历史实施与验收通过 Git 追溯。旧「今日情报」、旧 Rising、旧 Manual Collection 不作为 current roadmap。

# NOW — SOURCE MANAGEMENT → HOT TRACKING PRODUCTION CLOSE

Source Management 是唯一来源 Owner；SYSTEM 是唯一正式采集执行链，规则唯一见采集架构合同，不复制旧版门槛。

## PRACTICE-MATERIAL-BACKFILL — Decision Brief

- Goal/Role/Surface：为管理员热点追踪既有实践候选补齐公开原文/字幕/附件；UI KEEP，现行逐篇四条件不变。
- Problem/Why Now：生产39条候选缺正文回执，解除数量门槛仍无完整主题；先核对实际URL与材料Route再补，不靠虚构文本填栏。
- In Scope：复用来源身份与SYSTEM链，有限公开正文/字幕获取、逐篇凭证、必要附件及失败原因、既有Raw材料增量和Evidence重算；海外走Deno，保留预算/冷却/幂等。
- Out of Scope：登录/Cookie/关注/人工会话、AI自动判断、课程/UI/栏目阈值、生产Schema、虚构发布日期、重复Source或常驻浏览器。
- Code/Workflow：确定性安全路由、标准原文抽取、回执与去重写入、SYSTEM自动续采；AI/Skill：无；Human：用户已要求补齐资料，不额外引入人工采集链。
- Data/External Effects：先生产只读盘点，再有界请求公开原站，经原有审计/锁补既有Raw metadata与关联Evidence/快照；不改原始新闻事实、不把描述当正文。
- Recommendation/Why：优先消费已发现URL，成熟站点结构/公开Markdown/字幕及实际工作流复用，避免重搜与无边界通用代理；不可获取明确保留缺口。
- Validation/Acceptance：先增加真实失败样本的确定性回归，验证完整/截断/异站/附件/重复/失败退避；typecheck/build/内容回归；腾讯云+Deno实采、幂等与生产快照读回，报告真实通过/失败及限制。
- Rollback/Owners：Web/SYSTEM/Deno各保留前版，材料增量不删除历史；合同/实现映射与当前事实同步；仅提交本任务变更，保留其他未提交规划。

## SOURCE-QUALITY-FEEDBACK — Decision Brief

- Goal/Role/Surface：管理员在热点追踪标注自动采集动态的正负质量样本，来源管理显示简单来源统计；SYSTEM自动发现与采集不中断。
- Problem/Why Now：旧补充证据/继续观察/忽略/采用含采集或Event状态副作用，不能作为来源准确度回测样本；旧内容工作台兼容页与评论分析仍依赖旧决策。
- In Scope：旧四操作的现役入口、写入与副作用退役；新的采用/忽略只记录POSITIVE/NEGATIVE，支持可选原因、Source归因、改选/撤销、样本上下文；兼容内容页旧决策控件与评论分析旧决策读取/触发清除；来源侧有限统计与明细。
- Out of Scope：手动设为/撤下热点精选今日值得做、自动调权/停源、AI质量判断、复杂审核、来源资格变更、第二采集链、课程与正式内容发布；现行实践逐篇四条件保持。内容工作台与评论挖后续产品改造另行规划。
- Code/AI/Skill/Workflow/Human：Core验证Event-Source关联、append-only标签、幂等、样本快照、汇总与审计；AI/Skill不参与；SYSTEM继续独立运行自动发现/采集/证据刷新；Human仅提交正负标签与可选原因。
- Data Read/Write：读Event/Raw/Observation/Source/Run及反馈时自动判断；新增独立content_collection_quality_labels表保存可回测样本，不写旧content_candidate_decisions、Event.discoveryStatus或正式内容；历史数据不改写。
- Options/Recommendation：新标签与旧决策物理隔离，复用当前热点追踪/来源管理界面。旧决策表仅保留历史审计，避免旧状态和新评价口径混用；多来源未指定具体Source时只记Event层。
- Acceptance：自动发现/SYSTEM/Raw/Observation/Event/Evidence与快照连续可用；新采用/忽略不隐藏、不改栏目、不触发AI/草稿/评论挖；非法Source拒绝；改选/撤销与重试不重复计数；来源统计带样本量；旧人工补证据、WATCH及兼容页旧决策入口/评论分析读取退出；typecheck/build/内容回归及真实UI体验。
- Human Review：界面修改需提供真实体验并取得USER_APPROVED后才可标UI通过。Rollback：新增表保留样本，Web/SYSTEM同版回退并禁用旧决策写入口。Owner：采集架构合同与实现映射。
- Execution plan：[2026-10-16-collection-quality-feedback.md](docs/superpowers/plans/2026-10-16-collection-quality-feedback.md)。当前状态：CORE_IMPLEMENTED / DEV_MIGRATION_PASS / DEV_DB_ACCEPT_PASS / UI_IMPLEMENTED / USER_APPROVED / RELEASE_PENDING；产品负责人已明确批准热点追踪与来源管理两处界面。旧决策写入、人工 Expansion POST、兼容页旧控件与评论挖旧决策读取已从本地代码退出；SYSTEM 自动刷新保留。已完成的 PRACTICE-FOUR-CONDITIONS 验收由 Git 历史及 Current Facts 追溯。

# NEXT

- 用真实7–14日Event做Precision/Recall人工样本审计；仅在证据支持后调整精选或热度阈值。
- 核对Feed条件请求、304、失败退避与动态频率：先测请求/字节/解析/周期成本，不承诺未测降本比例；保持唯一timer和有限并发。
- BAIR等海外公共Feed逐项验证主/备用出口；Deno不是任意URL代理，继续补固定公开正文/字幕路由，明确不可用原因。
- 继续核验作者持续可采、原创归属及逐篇完整操作材料后注册；Pixaroma已正式注册并有材料，但无发布日期不造当前Event，其他作者不自动晋级。
- 补生图、Skill/MCP、投流、改写、动画/剪辑、客服/助手和工作管理实操来源。聚合已发现参考优先复用，避免重复发现/Source Identity。
- Comfy图生图工作流附件验证不足、B站匿名字幕不可用仍为真实缺口；不以描述冒充全文或降低材料门槛。官方模型清单不是实际下载/运行证明。
- Deno Secret环境范围与可迁移性复核；数据库凭据不传Relay。

# BACKLOG

- 人工AI增强沿现有Gateway/审计：查询改写、相关性、分类/标签/事实、中文标题/答案先行摘要/推荐理由及分段翻译；Code控制预算、引用与写库，AI不直接授予栏目资格或发布，未知公司别名需复核。自动采集不调用AI。
- 候选来源待审及质量解释优先复用现有Source、Run与Evidence；若必须新增Schema则独立迁移Gate，不提前增加Redis/常驻浏览器。
- AI HOT保持单一Source Identity，聚合转发不取得Fact或独立参与者权威；评论/互动只作Signal。
- Content Workbench选题入口及评论分析后续任务单独规划；不能消费采集质量标签作为内容生产或评论挖触发。

## PRACTICE-MATERIAL-BACKFILL — IMPLEMENTED / PRODUCTION_VERIFIED

Decision Brief：管理员来源管理/热点追踪；UI KEEP、课程冻结。Core在既有SYSTEM锁内串行补公开正文/字幕/固定工作流并记录逐篇凭证，AI/Skill不参与，Human仅维护来源；不新增来源/事件、不降低四条件、不采用登录/关注采集。复用Readability静态解析与受管Deno路由，防止重复请求和服务器成本扩散。验收为typecheck/build/采集回归、生产获取凭证、缓存退避及SYSTEM连续性；Web/SYSTEM/Deno同版回退，保留已有成功材料。Owner与真实结果见 `docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md` 的 PUBLIC-PRACTICE-MATERIALS。本批失败和同站延期保留明确状态，未声明全部候选补齐。
