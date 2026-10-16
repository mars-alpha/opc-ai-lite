# TASKS.md

> 只保留 NOW / NEXT / BACKLOG；历史实施与验收通过 Git 追溯。旧「今日情报」、旧 Rising、旧 Manual Collection 不作为 current roadmap。

# NOW — COLLECTION OBSERVATION

观察任务：管理员在来源管理和热点追踪查看生产采集、快照时效与人工评价样本。SYSTEM仍是唯一Workflow；Core记录运行和质量反馈，AI/Skill不自动改写业务状态，Human负责样本标注。7–14日内按真实周期核对失败率、去重、参与者、栏目数量和已标注样本；发现可复现偏差再单独调整规则。当前规则Owner为采集架构合同，部署事实Owner为CURRENT_SYSTEM_FACTS；异常按Web/SYSTEM同版旧release与生产备份回退。

来源管理仍是唯一 Source Owner，SYSTEM 仍是唯一采集执行链。采集质量正负评价已上线且界面获产品负责人批准；按采集架构合同记录样本，不自动调整来源资格、热点/精选/AI热点练习规则。当前观察唯一生产运行事实见 [CURRENT_SYSTEM_FACTS](docs/CURRENT_SYSTEM_FACTS.md)，已完成的 Decision Brief、一次性执行计划与验收由 Git 历史追溯。

- 观察接下来 7–14 天 SYSTEM 周期结果、Raw/Observation 增量、证据刷新、快照时效及真实人工评价样本；异常按同版 Web/SYSTEM 回退和数据库备份处理。
- 后续内容工作台选题入口与评论分析产品改造另行规划，不把质量标签作为内容生产或评论挖触发。

# NEXT

- 旧来源目录治理：生产库的22个`source_runtime_trend_*`历史记录不属于当前42个Source目录，10个有历史Run且最后运行于2026-10-15。核对各记录是否只是旧采集路径或已由当前逻辑Source承接；保持Raw/Observation/Run审计，确定历史只读呈现及数据库状态修正，不让旧记录误称为现役来源。AI HOT等聚合源带出的原发布者名称只作证据归属，核对可追溯性；未验证持续采集能力前不批量注册为独立Source，也不为不同Route重建重复Source。
- 用真实7–14日已评价Event核对来源问题原因与自动判断；只对已标注样本回测，不据此推断全量召回率，规则调整另立任务。
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
