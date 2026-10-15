# TASKS.md

> 只保留 NOW / NEXT / BACKLOG；历史实施与验收通过 Git 追溯。旧「今日情报」、旧 Rising、旧 Manual Collection 不作为 current roadmap。

# NOW — SOURCE MANAGEMENT → HOT TRACKING PRODUCTION CLOSE

Source Management 是唯一来源 Owner；SYSTEM 是唯一正式采集执行链，规则唯一见采集架构合同，不复制旧版门槛。

## SOURCE-INPUT-RUNTIME — Decision Brief

- 角色/Surface：管理员来源管理，保持现有界面与唯一SYSTEM主链。Code负责规则保存、确定性匹配、标准Feed自动发现、路由验证与审计；不调用AI，不修改课程或栏目门槛。
- 问题：全局筛选词仅DailyHot消费，普通Feed不消费；网站只猜固定Feed路径，遗漏HTML标准声明的订阅地址。
- 推荐：复用已有词匹配器，排除优先，新增词扩展相关性召回，不绕过时效/质量/栏目门槛；按WHATWG/RSS Autodiscovery读取rel=alternate，复用已有RSS解析及公共URL安全校验，保留有限备用路径。未知/登录来源fail-closed。
- Validation/Acceptance：先复现失败，验证新增/排除、边界误伤、质量不绕过、非标准Feed/相对地址、重复注册及SYSTEM资格链；typecheck/build/内容回归，腾讯云真实探测及开发库注册采集，生产同版部署运行。
- Rollback：Web/SYSTEM同时回退现有release；不做DDL或删除历史数据。Owner：采集架构合同及source-onboarding/discovery-filter；规则从下一次采集读取，不追删历史。

## 当前验收结果 / HUMAN ACCEPTANCE

- 已复现旧Feed不消费全局排除词及新词再被相关性拦截，新增反例后修正；标准rel=alternate覆盖非标准路径、相对URL、HTML实体、非HTTP拒绝和已下载Feed复用。
- 腾讯云+Deno真实检测Simon/TIL/Comfy通过。Comfy Feed超时、Sitemap可用，检测预算后约22秒完成备用检测，不宣称Feed稳定。Deno生产能力与运行路径唯一见CURRENT_SYSTEM_FACTS。
- 开发库真实注册、重复拒绝及审计失败回滚通过；保存3个真实标题为排除词后，Run逐篇返回SOURCE_POLICY_EXCLUDED_TERM。加入真实实操标题后新增1条Raw；恢复词表再次采集0新增、8重复。测试词已恢复，不污染生产规则。
- 内容完整quick回归/typecheck及最终Linux标准build通过。Windows本地build因既有.next目录EPERM未通过，部署依据隔离Linux标准构建；临时验证脚本导致的一次构建失败已清除并重建通过。
- Web与SYSTEM已同版切换；页面200、未登录规则API401、唯一timer enabled/active，课程/组件目录与前版逐文件相同，仅来源API及内容Core修改。无新增UI，不重新声明视觉审核；现有v13页面此前USER_APPROVED。
- 生产统一周期PASS、failures为空，但本轮无到期来源，不冒充实际来源采集证据；随后单独验证既有The Decoder RSS：10条返回、0新增、10重复，Run记录source-ai-relevance-policy-v2；CPU1.332秒，真实生产规则消费通过。
- 本轮难点：可打开主页不等于可采Feed；Deno部分Feed失败需验证备用路径；规则保存不等于参与主链；新词不能被后续Gate意外吞掉。保持成熟标准解析、失败关闭、有限请求/并发与同版回退，不引入AI或平行采集器。

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
