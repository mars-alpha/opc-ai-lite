# TASKS.md

> 只保留 NOW / NEXT / BACKLOG；历史实施与验收通过 Git 追溯。旧「今日情报」、旧 Rising、旧 Manual Collection 不作为 current roadmap。

# NOW — SOURCE MANAGEMENT → HOT TRACKING PRODUCTION CLOSE

Source Management 是唯一来源 Owner；SYSTEM 是唯一正式采集执行链，规则唯一见采集架构合同，不复制旧版门槛。

## RADAR-PRODUCTION-V13 — Decision Brief

- Human：用户已明确要求生产使用新版，批准此前已提供体验的页面/日历及120限制删除上线；不再保留USER_REVIEW_PENDING作为发布阻塞。
- Role/Surface：管理员来源管理→热点追踪；发布既有已测试新版，保持课程及非内容域生产文件。Code负责日历/过滤/游标/统计/快照与同版Web/SYSTEM；AI/Skill不参与运行，现有timer不变。
- 方案：以现有生产Web为基底覆盖内容域已确认代码，Linux单CPU受限构建；SYSTEM先同版刷新v13快照，Web再切换。无DDL、新Source/Secret或新调度器。旧快照仅为回退材料，不作为新版current authority。
- Acceptance：生产七日唯一数=总量=日期合计，无120截断；当天展开、其余折叠，历史一天/空日跳过/到底明确；分类反例及真实生产只读遍历通过，页面/API正常，唯一timer同版刷新PASS。Rollback：同版旧Web+SYSTEM及旧快照备份回退，保留Raw与审计。Owner：采集合同§16与现有读模型/快照。


## 生产验收结果（2026-10-15北京时间）

- 当前Web：opc-admin-web-v13-20261015；SYSTEM：releases/20261015-radar-v13；快照radar-snapshot-v13-practice-materials。生产事实路径唯一见CURRENT_SYSTEM_FACTS。
- 最终同一asOf核对：总量245=首批245=唯一245=日期合计；七日外历史2条，遍历后reachedBottom=true。数字属于验收时刻，不是常量。旧308/120快照不再参与当前显示。
- 同版统一生产周期PASS、failures为空，CPU6.852秒；唯一timer enabled/active。公网页面200、未登录API401，PM2实际cwd已确认新版；课程目录逐文件对比无变化。
- 删除无调用方的旧截断时间线及import；完整quick回归/typecheck、专项与Linux标准build通过；规则清理后再次构建与生产只读遍历通过。浏览器自动化会话连接失败，因此未声称新增一轮浏览器交互验证；此前已提供开发真实体验，用户本轮明确批准上线。
- 发布修正：PM2旧版本不接受本次cjs配置格式，改JSON；reload会保留旧cwd，改重建同名进程定义并核验实际目录。Linux脚本固定LF。后续发布必须检查实际运行路径，不能仅看reload成功。

## HUMAN ACCEPTANCE / 发布验收

- 用户已明确确认生产使用新版页面/日历，授权同版Web/SYSTEM上线；USER_APPROVED。页面布局及课程冻结，后续新界面仍遵循AGENTS审核Gate。
- Linux标准Next构建及SYSTEM类型检查通过；生产真实日期验收通过；同版统一周期通过，失败为空。生产事实及路径见CURRENT_SYSTEM_FACTS，不再保留旧“未审核/待切换/120首批”阻塞。
- 清理已无调用方的旧截断listRadarTimeline及残留import，新增防回归断言；生产旧release仅用于显式回退，不作为现役规则。
- 发布后仍需观察连续72小时的失败/恢复、周期耗时、资源峰值与快照时效；单轮通过不代表长期稳定。

# NEXT

- 用真实7–14日Event做Precision/Recall人工样本审计；仅在证据支持后调整精选或热度阈值。
- 核对Feed条件请求、304、失败退避与动态频率：先测请求/字节/解析/周期成本，不承诺未测降本比例；保持唯一timer和有限并发。
- BAIR等海外公共Feed逐项验证主/备用出口；Deno不是任意URL代理，继续补固定公开正文/字幕路由，明确不可用原因。
- 继续核验作者持续可采、原创归属及逐篇完整操作材料后注册；Pixaroma已正式注册并有材料，但无发布日期不造当前Event，其他作者不自动晋级。
- 补生图、Skill/MCP、投流、改写、动画/剪辑、客服/助手和工作管理实操来源。聚合已发现参考优先复用，避免重复发现/Source Identity。
- Comfy图生图工作流附件验证不足、B站匿名字幕不可用仍为真实缺口；不以描述冒充全文或降低材料门槛。官方模型清单不是实际下载/运行证明。
- Deno Secret环境范围与可迁移性复核；数据库凭据不传Relay。

# BACKLOG

- 单篇强教程入栏需完整真实样本后另行设计，未授权修改两来源/两实践类型门槛。
- 人工AI增强沿现有Gateway/审计：查询改写、相关性、分类/标签/事实、中文标题/答案先行摘要/推荐理由及分段翻译；Code控制预算、引用与写库，AI不直接授予栏目资格或发布，未知公司别名需复核。自动采集不调用AI。
- 候选来源待审及质量解释优先复用现有Source、Run与Evidence；若必须新增Schema则独立迁移Gate，不提前增加Redis/常驻浏览器。
- AI HOT保持单一Source Identity，聚合转发不取得Fact或独立参与者权威；评论/互动只作Signal。
- Content Workbench仅消费Adopted Event/Evidence，不承担上游来源或热点修复。
