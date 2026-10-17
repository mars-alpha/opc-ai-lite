# 事件证据、动量与价值报告交付

## Decision Brief

- Task ID：EVENT-EVIDENCE-VALUE-001；Goal：沿唯一 Source→SYSTEM→Raw/Observation→Event/Evidence→栏目主链补齐时间、身份、练习候选、报告与缺口发现，部署已通过工程验证的版本并同步 Git。
- User Role / Product Surface：管理员，来源管理/热点追踪后端及 SYSTEM；保持已确认 UI。课程维护、学习洞察、课程生产和个人工作台均 Out of Scope。
- Must Know：采集合同、现役评分/身份/材料/表达/查询 owner、实际部署和数据回执。Nice to Know：参考研究。Do Not Load：历史批次/退役产品/课程正文。
- Problem / Why Now：时间未知被当近期、首发年龄阻断复燃、排名/曲线异源、实测材料不足无候选状态，短表达不能作为价值报告。
- In Scope：可靠时间与角色投影、统一身份/衰减/复燃/真实评分记录，练习候选及正式门槛隔离，版本化报告 Skill/Schema/Validator/暂存运行，缺口分类并复用受管检索，分层质量验收与上线治理。
- Code：身份、时间、资格、状态、证据选择、引用存在/原文定位、幂等、版本、运行与审计；AI：有证据的语义分析、定向计划建议；Skill：版本化无副作用输入输出；Workflow：现役 SYSTEM 顺序/锁/预算/退避；Human：真实质量标注和 UI Gate，不新增逐条工程确认。
- Data Read / Write：既有 Source/Raw/Observation/Event/Evidence/ai_runs；只在既有 Event metadata 写候选、评分历史、暂存报告；不新增数据库表、不删除原始材料，不修改课程/学习洞察。
- Entitlement：既有管理员鉴权；External Side Effect：获授权的现役 Provider 调用、服务器部署、Git push；凭据不进入产物或日志。
- Options：重建采集系统（重复主链，拒绝）；只改提示词（证据/状态缺口未闭环，拒绝）；扩展现有 Core/Skill/SYSTEM（推荐，可回滚且保留血缘）。
- Acceptance：未知时间不伪造；显式跨平台身份合并/同名账号不误合；重复信号不增热，旧事件新独立讨论可复燃；排名与曲线使用同评分；候选不授予正式练习；报告失败不改变事实/栏目，引用三层检查分开；缺口区别重试/搜索/不可访问；生产 HTTP/鉴权/SYSTEM/唯一 timer 通过。
- Deterministic Validation：先添加失败断言；完整采集回归、typecheck/build、仓库/文档治理、开发 PG 验收；100 对关系、60 独立事件、precision≥98%/recall≥90%/24h覆盖≥90%为待测目标，样本不足必须 NOT_ACCEPTED。
- Human Review：不修改视觉页面；已有未审核新增 UI 不补记 USER_APPROVED。若产生视觉改动仅暂存体验，不越过已有 Gate。
- Rollback：部署前备份/保存 Web 与 SYSTEM release；同版回退，关闭报告开关停止请求，保留账本/Raw/审计；关闭开关不宣称撤销历史数据。
- Owner Files：规则唯一 owner 为 COLLECTION_ARCHITECTURE_CONTRACT；定位为 COLLECTION_IMPLEMENTATION_MAPPING；运行事实为 CURRENT_SYSTEM_FACTS；阶段为 PROJECT_STATUS；剩余任务为 TASKS。

## 实施顺序与验证

1. 时间/身份：扩展 event-story-read-model，提供最早已核验、官方、主资料、最新及 SYSTEM 首见独立字段；topic-momentum 消费 participant-identity，未知/未来时间排除；增加同名/跨平台/转载反例。
2. 动量：每信号七日窗口/72h半衰期、近期实质信号复燃、稳定交集趋势与新增参与者分开；排名/回放共用评分，SYSTEM 持久真实时点/算法/输入版本和分项，历史不回填为真实。
3. 练习：现役 candidate evaluation/store 提供正文/附件/独立讨论/复现缺口，正式门槛不变；作者实测/材料校验/平台执行分开。
4. 报告：新增 event-value-analysis v1 Skill；按事实/独立分析/实测/反例角色选证；声明引用逐字定位及比较条件校验；报告只暂存，支持性和覆盖人工验收仍待测；复用 ai_runs 租约/版本 CAS/失败退避/usage 和 SYSTEM。
5. 补发现：现役 practice-discovery-policy 区分 RETRY_ROUTE/SEARCH_ORIGIN/SEARCH_MATERIAL/BLOCKED_ACCESS，基于独立信号/缺口指纹去重，保留有界并发、公平和无新增停止。
6. 集成/发布：完整回归、PG验收、Linux build、生产备份与 Web/SYSTEM 同版发布；认证只读检查和真实周期；同步规则/事实/任务并提交推送。正常配置启动72h运行观察与7–14日效果评估，届时才可记录观察结果。

## Review Focus

未知/未来/仅更新时间不能成为新发布时间；来源身份与原作者身份不能混淆；同名跨平台无显式身份不得误合；重复转载不能续热；暂存报告不可因Schema通过自动发布；付费调用失败必须保留未知usage；旧canonical缓存不能跨版本复用。

## 状态

IMPLEMENTED / ENGINEERING_PASS；DEPLOYMENT_BLOCKED；QUALITY_NOT_ACCEPTED / RELEASE_NOT_READY。

完成的工程范围：步骤1–5的后端Core/版本化Skill/SYSTEM接线、管理员只读暂存API及正反例；现有UI、课程维护和学习洞察均未修改。新任务默认关闭，没有真实付费模型请求。正式精选分型与独立作者召回仍需样本校准，未放宽现役门槛。

验证证据（2026-10-17）：91项采集quick回归（含typecheck）通过；本机Next生产build通过；开发PG的报告/缺口租约、非canonical成员水位、缓存、asOf、revision CAS、网络失败退避、未知usage、只暂存状态及RUNNING计划消费通过；既有event-expression与canonical真实PG路径通过。canonical夹具原先依赖服务器默认createdAt，被短暂时钟偏差当作未来记录；显式设置历史createdAt后通过，不修改运行时未来时间防线。所有测试使用mock Provider，夹具finally清理。

独立复核修正：自有RUNNING检查阻断计划消费、明确转载跨发布者重复计热、不同条件的测试被误认为可比、非canonical成员扫描饥饿、官方自测经聚合器被误标独立；复核未发现剩余可复现P1/P2。引用Validator仅证明定位与有限保护，语义支持/覆盖仍UNREVIEWED。

质量回放150对工程假设样本（91正/59负）正反向评分器precision/recall均1.0，但标签非独立金标、集中主题、60条参考来自已采内容；脚本已改为engineeringReplayTargetMet=true、qualityTargetMet=false。它不是100对独立关系金标或60个独立原始事件发现分母，不证明24h覆盖率。报告语义、真实练习正例、来源/Feed/附件覆盖、72h稳定与7–14日效果仍按TASKS推进。

治理：原文/动量/候选/报告/缺口/分层验收规则归入既有COLLECTION_ARCHITECTURE_CONTRACT，实现定位归COLLECTION_IMPLEMENTATION_MAPPING；修正生产热点版本旧描述和旧质量回放“达标”字段；已完成去重发布、采集频率、算法配置三份一次性计划移出current tree，由Git追溯；PROJECT_STATUS只留当前关键代码指纹。并行任务的tools/task-manager与其owner说明保留，不混入本提交。

部署阻断：自动审批两次拒绝scp上传（先全源码候选、再仅本任务业务/测试增量，均未发送成功）；拒绝理由是现有总体上线授权未被识别为对具体源码载荷和外部IP 1.14.180.16的明确授权。第二次增量已扫描无配置secret/私钥，不包含env、数据库或tools；仍被拒。不得通过SSH stdin/Git拉取或其他通道绕过。当前生产Web/SYSTEM/Relay未变；隔离Linux build、生产备份/切换、认证接口/真实周期验收及观察必须在具体上传授权后继续。Git同步单独执行，不等同部署。

Git：业务提交a41c265已保存在本地codex/collection-quality-feedback，未推送。首次push被审批要求核验目的地；只读核验gh账号mars-alpha、origin mars-alpha/opc-ai-lite且viewerPermission=ADMIN后，原push重试获准，但github.com:443实际连接失败（只读ls-remote同样失败）。未通过API/其他通道替代推送，后续网络恢复后继续既有origin同步。本轮最终部署准备包包含35个业务/测试文件，不含环境/数据库/并行工具；Secret扫描0，未再次尝试上传。
