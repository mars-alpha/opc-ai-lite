# TASKS.md

> 只保留 NOW / NEXT / BACKLOG；历史实施与验收通过 Git 追溯。旧「今日情报」、旧 Rising、旧 Manual Collection 不作为 current roadmap。

# NOW — SOURCE MANAGEMENT → HOT TRACKING PRODUCTION CLOSE

Source Management 是唯一来源 Owner；SYSTEM 是唯一正式采集执行链，规则唯一见采集架构合同，不复制旧版门槛。

## PRACTICE-FOUR-CONDITIONS — Decision Brief

- Goal/Role/Surface：管理员热点追踪「今日值得做」；用户已明确取消两来源、两类型及多证据数量推荐门槛。
- Problem/Why Now：旧数量门槛拦截单篇完整实操；三个编号步骤也不能代表所有有效配置或工作流。
- In Scope：同一篇公开原文逐项核验工具与任务、步骤/配置/可用工作流、输入材料与访问条件、预期产出；至少一篇完整材料即可。保留多报道计数用于解释，不授予新闻实践资格。
- Out of Scope：热点/精选权重、课程、来源注册、AI及Deno路由；不删除原始数据，不改布局。
- Code/Workflow：确定性材料凭证与资格计算、快照失效、原有SYSTEM链；AI/Skill：无；Human：产品负责人定义门槛，必要时复核语义误判，不把关键词校验宣称执行成功。
- 推荐理由：采用逐篇完整性校验，避免数量替代质量、避免跨文章拼凑缺失条件；搜索扩展保留预算与冷却，取消独立讨论人数前置。
- Validation/Acceptance：单篇完整材料可入、多篇不完整不可拼凑、缺少四项分别解释、配置与工作流分支、新闻拒绝、忽略后重算；typecheck/build与内容回归；生产同版读回。
- Rollback/Owner：Web/SYSTEM同时回退本轮前release，重建旧版本快照；规则唯一owner为采集架构合同，无DDL。实现与部署状态待验证。

## 当前验收结果 / HUMAN ACCEPTANCE

- IMPLEMENTED / PRODUCTION_DEPLOYED：59项内容quick回归（含typecheck）通过；最终Linux标准build及SYSTEM typecheck通过。反例先失败再修正，覆盖单来源/单类型、短摘要不能覆盖完整正文凭证、配置、无编号步骤、缺输入/缺输出、忽略后单篇存活与多篇不完整不能拼凑。
- 腾讯云生产只读核验：2026-10-15 23:46北京时间，近七日276个Event、39条实践候选、0个完整实践主题；39条均缺公开获取回执和完整正文/字幕，不能以解除数量门槛冒充已有合格产出。热点1、精选24，不改其规则。
- Web/SYSTEM同版切换、v14快照刷新落库及直接读取一致性通过，七日列表数量等于总量；唯一timer恢复运行。Deno、Secret、数据库Schema及课程未改；前版release保留回退。
- UI_TEXT_IMPLEMENTED：仅按用户新条件更正现有空态说明，布局保持；新版说明可在生产体验，本轮未声称新增视觉体验已经USER_APPROVED。
- 难点/后续：数量不代表材料完整，解除数量限制后瓶颈仍是实际原文获取与工具/任务识别覆盖。优先为已发现候选补可验证公开正文/字幕与附件，避免重复搜索；不生成虚构步骤或日期填栏。

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
- Content Workbench仅消费Adopted Event/Evidence，不承担上游来源或热点修复。


## PRACTICE-MATERIAL-BACKFILL — IMPLEMENTED / PRODUCTION_VERIFIED

Decision Brief：管理员来源管理/热点追踪；UI KEEP、课程冻结。Core在既有SYSTEM锁内串行补公开正文/字幕/固定工作流并记录逐篇凭证，AI/Skill不参与，Human仅维护来源；不新增来源/事件、不降低四条件、不采用登录/关注采集。复用Readability静态解析与受管Deno路由，防止重复请求和服务器成本扩散。验收为typecheck/build/采集回归、生产获取凭证、缓存退避及SYSTEM连续性；Web/SYSTEM/Deno同版回退，保留已有成功材料。Owner与真实结果见 `docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md` 的 PUBLIC-PRACTICE-MATERIALS。本批失败和同站延期保留明确状态，未声明全部候选补齐。
