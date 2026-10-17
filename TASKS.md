# TASKS.md

> 只保留 NOW / NEXT / BACKLOG；历史实施与验收通过 Git 追溯。旧「今日情报」、旧 Rising、旧 Manual Collection 不作为 current roadmap。

# NOW — SOURCE → RADAR AUTONOMOUS DEVELOPMENT

独立开发任务管理器：已实现本机独立工具，功能与验证见 [工具说明](tools/task-manager/README.md)。只读投影当前任务/版本并提供治理建议；新增AI推进分析复用现有DeepSeek，输出优先顺序、未部署/治理原因与可复制Codex Prompt；新增Git版本时间线、回退记录与基线差异，以及包含需求/边界/验收/治理/自检修正的近期推进计划。不属于业务前后台，不执行删除或部署；UI_IMPLEMENTED / UI_NOT_REVIEWED，未记录用户UI审核批准。

当前工程任务按[事件证据与价值报告计划](docs/superpowers/plans/2026-10-17-event-evidence-value-delivery.md)推进：时间/身份、同源动量历史、练习候选、版本化暂存报告与缺口计划已实现，工程验证见计划；生产仍为上一版，具体事实及部署阻断见[当前系统事实](docs/CURRENT_SYSTEM_FACTS.md)。不把本地实现标记已上线，AI开关不自动启用。

完整栏目质量保持NOT_ACCEPTED / RELEASE_NOT_READY。下一步补连续SYSTEM观察、独立作者实测材料与分栏正负标签，再评估发现延迟；不复制Source、不降低讨论/材料门槛。新增UI已提供实际暂存体验，用户明确授权上线，单独的USER_APPROVED状态仍未记录。

观察任务：管理员在来源管理和热点追踪查看生产采集、快照时效与人工评价样本。SYSTEM仍是唯一Workflow；Core记录运行和质量反馈，AI/Skill不自动改写业务状态，Human负责样本标注。7–14日内按真实周期核对失败率、去重、参与者、栏目数量和已标注样本；发现可复现偏差再单独调整规则。当前规则Owner为采集架构合同，部署事实Owner为CURRENT_SYSTEM_FACTS；异常按Web/SYSTEM同版旧release与生产备份回退。

来源管理仍是唯一 Source Owner，SYSTEM 仍是唯一采集执行链。采集质量正负评价已上线且界面获产品负责人批准；按[采集架构合同](docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md)记录样本，不自动调整来源资格、热点/精选/AI热点练习规则。当前观察唯一生产运行事实见 [CURRENT_SYSTEM_FACTS](docs/CURRENT_SYSTEM_FACTS.md)，已完成的 Decision Brief、一次性执行计划与验收由 Git 历史追溯。

- 观察接下来 7–14 天 SYSTEM 周期结果、Raw/Observation 增量、证据刷新、快照时效及真实人工评价样本；异常按同版 Web/SYSTEM 回退和数据库备份处理。
- 部署受阻：自动审批两次拒绝把业务源码上传至现役腾讯云1.14.180.16，要求用户明确授权具体目的地和载荷；待授权后执行隔离Linux build/PG、Web/SYSTEM同版备份与切换、认证接口/唯一timer/真实周期验收，再开始72h稳定观察。不得换通道绕过阻断。
- 发布/研究分析/实测教程分型精选仍需校准；至少100对独立关系金标、至少60个独立事件发现分母、报告引用支持与关键结论覆盖验收集尚未齐备。工程冻结样本不替代这些门槛；完整栏目质量继续NOT_ACCEPTED / RELEASE_NOT_READY。
- 后续内容工作台选题入口与评论分析产品改造另行规划，不把质量标签作为内容生产或评论挖触发。

# NEXT

- 来源管理→热点追踪审计修复按 [执行计划](docs/superpowers/plans/2026-10-16-source-hot-tracking-audit-remediation.md) 分批推进：先只读血缘与事件回测，再处理历史来源呈现、快照负载、运行告警及解释/交互缺口。任何规则门槛调整以回测证据为前提。
- 旧来源目录治理：生产库的22个`source_runtime_trend_*`历史记录不属于当前SYSTEM目录，10个有历史Run且最后运行于2026-10-15。核对各记录是否只是旧采集路径或已由当前逻辑Source承接；保持Raw/Observation/Run审计，确定历史只读呈现及数据库状态修正，不让旧记录误称为现役来源。AI HOT等聚合源带出的原发布者名称只作证据归属，核对可追溯性；未验证持续采集能力前不批量注册为独立Source，也不为不同Route重建重复Source。
- 用真实7–14日已评价Event核对来源问题原因与自动判断；只对已标注样本回测，不据此推断全量召回率，规则调整另立任务。
- 原生Feed、固定Relay透传和AIHOT JSON快照条件请求/304已在本机实现；固定GitHub Release page/per_page、每轮首页/前页重叠、事务续页和明确覆盖上限亦已实现；代码已同版发布，但GitHub Release新路径未启用，也未自动恢复历史来源。其他API逐项验证，不把AIHOT快照伪装成分页；动态频率及真实请求/字节/周期对比待后续，不承诺未测降本比例；保持唯一timer和有限并发。
- BAIR等海外公共Feed逐项验证主/备用出口；Deno不是任意URL代理，继续补固定公开正文/字幕路由，明确不可用原因。
- 继续核验作者持续可采、原创归属及逐篇完整操作材料后注册；Pixaroma已正式注册并有材料，但无发布日期不造当前Event，其他作者不自动晋级。
- 补生图、Skill/MCP、投流、改写、动画/剪辑、客服/助手和工作管理实操来源。聚合已发现参考优先复用，避免重复发现/Source Identity。
- Comfy图生图工作流附件验证不足、B站匿名字幕不可用仍为真实缺口；不以描述冒充全文或降低材料门槛。官方模型清单不是实际下载/运行证明。
- Deno Secret环境范围与可迁移性复核；数据库凭据不传Relay。

# BACKLOG

- P2关键节点AI已迁入NOW实施计划：中文标题/答案先行摘要/阅读价值/分类、查询改写与模糊关系建议；不做全文翻译。P2幂等/usage/revision CAS及开发库验收已完成，代码已发布但理解开关关闭；生产版本不自动调用AI，AI不直接授予栏目资格或发布。P3查询与P4关系/事件表达已部署，默认关闭；真实效果另行验收。
- 候选来源待审及质量解释优先复用现有Source、Run与Evidence；若必须新增Schema则独立迁移Gate，不提前增加Redis/常驻浏览器。
- AI HOT保持单一Source Identity，聚合转发不取得Fact或独立参与者权威；评论/互动只作Signal。
- Content Workbench选题入口及评论分析后续任务单独规划；不能消费采集质量标签作为内容生产或评论挖触发。
