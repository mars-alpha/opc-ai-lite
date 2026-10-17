# 来源管理 / 热点追踪项目状态

最后更新：2026-10-17（Asia/Shanghai）。

独立开发辅助工具状态与用法见 [任务管理器说明](tools/task-manager/README.md)；与来源管理/热点追踪业务界面隔离，不改变其批准或发布状态。

状态：PRODUCTION_RUNNING / P4_RADAR_DEPLOYED / ENGINEERING_PASS；完整栏目质量 NOT_ACCEPTED / RELEASE_NOT_READY。

课程：81 LESSONS / FROZEN。

当前焦点：热点同版本发布归并、机构参与者去重、列表精简读取与按需完整详情已同版上线。来源管理栏目算法、采集图表、采集频率及P4确定性链随本版部署；SYSTEM保持唯一调度，AI理解/关系/表达关闭。生产路径、Relay revision、接口实测及回退点唯一见[当前系统事实](docs/CURRENT_SYSTEM_FACTS.md)。

86项quick含typecheck、最终Linux build、隔离PG及生产认证接口验收通过，去重正反例与独立复核通过。列表负载实测减少72%，不作为生产P95承诺；完整栏目质量与连续发现延迟尚未验收，不将练习数量为0解释为部署失败。

用户已明确授权本轮部署和Git同步。新增来源菜单/图表与按需详情已提供暂存实际体验；未另行记录为USER_APPROVED，后续依赖新增交互的阶段仍遵守视觉Gate。课程与既有批准布局冻结。

当前任务记录见[去重与发布](docs/superpowers/plans/2026-10-17-radar-dedup-read-release.md)、[频率](docs/superpowers/plans/2026-10-17-source-collection-frequency.md)、[算法配置](docs/superpowers/plans/2026-10-17-source-algorithm-controls.md)。规则唯一owner为[采集架构合同](docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md)，代码定位见[实现映射](docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md)。历史阶段过程由Git追溯。

## 当前任务代码快照（2026-10-17，SHA256前16位）

- `tools/task-manager/model.mjs` — current owner/Git只读投影、版本历史与治理建议；`A6C0A2CFF1076546`。
- `tools/task-manager/server.mjs` — localhost固定资源、事实API与同源AI分析入口；`9FEAA566CAA227E4`。
- `tools/task-manager/public/app.js` — 版本时间线/基线比较与阻塞驱动近期计划；`F02E9A02343D98E7`。
- `tools/task-manager/versions.mjs` — Git可恢复提交、文件差异及部署/回退证据映射；`E8F112BAD2A050E5`。
- `tools/task-manager/analysis.mjs` — V2计划字段校验、依赖排序与完整推进Prompt；`23FD9C699193BEB0`。
- `tools/task-manager/analysis-service.mjs` — 单次模型调用、并发保护、结果缓存与失效；`973CF9FCFFDE5C41`。
- `tools/task-manager/analysis-worker.mjs` — 隔离复用DeepSeek与V2计划合同；`6ED961E0B95B7A53`。

- `lib/server/content/collection-runner.ts` — Feed/API条件回执、Route隔离及事务checkpoint；`AB55AE878F5B7BFD`。
- `lib/server/content/overseas-collector-relay-client.ts` — 固定Relay、兼容gzip/Feed别名与分阶段错误；`B9907751DBFF5078`。
- `services/overseas-collector-relay/conditional-http.js` — Node/Deno实际可加载的共享Header校验与URI归属；`E0111B3FC844D4D2`。
- `services/overseas-collector-relay/watchlist-feeds.js` — 精确Feed白名单及v2固定迁移映射；`E386E07EC4CDEE0F`。
- `services/overseas-collector-relay/github-releases.js` — 固定仓库Release页/数字ID别名校验；`6E975DC0A6942517`。
- `lib/server/content/github-release-pagination.ts` — 首页/前页重叠、持久续页与非完整历史回执；`6823F0DD2A48C64C`。
- `lib/content/source-watchlist-policy.ts` — 四组覆盖诊断/身份缺口与seed保护策略；`F3C84290AD46522B`。
- `lib/server/content/source-coverage-report.ts` — Source只读投影及配置可用性，非实时健康证明；`B88709F31EA378FA`。
- `lib/server/content/source-portfolio-runtime.ts` — seed保留停用/归档意图与并发数据库保护；`7A13309A71A03079`。
- `scripts/inspect-source-watchlist.ts` — 只读配置诊断及有界Feed探测，区分本地handler/远端；`427909DE007742F3`。

- `lib/server/content/source-auto-admission.ts` — SYSTEM有界发现、已启用作者域名、Raw租约与重试；`EE26C9E58234A191`。
- `lib/server/content/source-auto-admission-policy.ts` — 真实主页及固定首页别名/时间/重试；`0038506B61BF115C`。
- `lib/server/content/source-onboarding.ts` — 注册事务、发现凭证及固定首页别名的历史身份保护；`DEA6D3496FF97A9F`。
- `lib/server/content/source-qualification.ts` — 当前checkpoint先过滤再排名的有界成熟度；`9758358FB782988C`。
- `lib/server/content/source-qualification-runtime.ts` — 共享SQL证据谓词与当前checkpoint有界运行退化；`0C07349634C6819C`。
- `lib/server/content/source-runtime-governance-execution.ts` — 自动登记有界观察与SYSTEM锁；`FE8A468A12D3B4A8`。
- `scripts/run-server-native-automatic-cycle.ts` — 唯一SYSTEM周期与EVENT_RELATION阶段；`B98E4C13F5F64841`。

- `lib/server/content/public-workflow-materials.ts` — 固定材料路由、ZIP/JSON内存结构验证；`992BAA039927F48F`。
- `lib/server/content/pixaroma-source.ts` — capability-first作者登记、onboarding及已发现参考关联；`2C6B33207368E4FD`。
- `services/overseas-collector-relay/deno.ts` — 固定白名单Provider、gzip与Feed别名协商；`AEFB482AF087A819`。
- `lib/server/content/source-acquisition-runtime-adapters.ts` — AIHOT条件快照/稳定ID及SYSTEM材料Adapter；`A897E00F64F3DA06`。
- `lib/server/content/discovery.ts` — 视频链接规范化、无日期历史材料不创建当前Event，旧运营决策写入退出；`A0588454A123DFC4`。

- `lib/server/content/collection-expansion.ts` — P3A账本与Brave主备接线，真实PG+mock验收通过；`92CB91FCD2BF590B`。
- `lib/server/content/managed-practice-search.ts` — B站/YouTube/Brave探测登记与停用前置保护；`3239C6BA09CD2D28`。
- `lib/server/content/radar-snapshot.ts` — 按有效canonical成员叠加操作状态与v17快照读取；`1C2899CFC37825CA`。
- `lib/server/content/collection-quality-feedback.ts` — 采集质量标签、来源归因、幂等与审计；`85D0DECC32A511E1`。
- `lib/server/content/public-practice-access.ts` — 访问依赖及注册条件；`2A202C2F354C6751`。
- `lib/server/content/public-creator-probe.ts` — 公开详情/列表/字幕探测与缺口状态；`71490A2B063062DE`。
- `lib/server/content/source-acquisition-plan.ts` — 主/备用路径与交互依赖拒绝；`F2BAB00140F6D2A2`。

- `lib/server/content/intelligence-read-model.ts` — 逐Raw证据归属与诊断opt-in血缘；`604F38B3EEEBDBF7`。

- `lib/server/ai/configured-chat.ts` — 可选思考/输出控制与每次请求usage回执，旧默认保留；`14F9169136EF6334`。
- `lib/server/content/content-understanding-enrichment.ts` — v3版本化理解/验证/输入指纹，不翻译；`467B9141E7E9F8D5`。
- `lib/server/content/content-understanding-runtime.ts` — 持久任务/租约/CAS/退避与ai_runs用量；`B0E00ABA81B48C28`。
- `lib/server/content/presentation-enrichment.ts` — 当前材料指纹校验与原文回退；`046F3257CA401EBF`。

- `lib/server/content/managed-practice-query-policy.ts` — P3A持久查询去重/预算/无新增停止与单主单备；`DD1E7A7B863475E3`。

- `services/overseas-collector-relay/brave-search.js` — Node/Deno共用有界搜索协议、公开URL与片段解析；`25D462C603E8B01B`。

- `services/overseas-collector-relay/public-practice-routes.js` — 共享v5固定正文路径与作者/发布者文章范围；`835D16250726FB95`。
- `services/overseas-collector-relay/public-source-routes.js` — Source固定路径、原域名与作者首页别名；`E28FD2F10F0E9CD1`。

- `lib/server/content/practice-material-backfill.ts` — 近期无日期参考/Event桥接、材料公平队列与输入/来源/关联提交保护；`51DA88F8D648B541`。

- `lib/content/requested-source-targets.ts` — 用户39对象只读目标，非seed；`C67832C064B63C83`。
- `services/overseas-collector-relay/curated-publisher-feeds.js` — 五站固定Feed与文章范围；`D917C429C17DD614`。
- `lib/server/content/aihot-discovery-metadata.ts` — 两条既有AIHOT链的有界提示与归属；`747424E83A527FEE`。
- `lib/server/content/trend-discovery.ts` — AIHOT发现提示与真实日期；`13BB6D56A4162214`。
- `lib/server/content/public-feed-discovery.ts` — 真实声明与已核实固定Feed候选；`5712F309F1981C0B`。
## 当前变更

AI热点练习：IMPLEMENTED / USER_APPROVED / DEPLOYED。类型检查、构建、58项采集回归、开发库验收与新版生产SYSTEM周期通过；练习触发排除纯趋势Signal、无原文链接与无原作者聚合器。规则见采集架构合同§23，生产路径与回退点见当前事实。

- `lib/server/content/ai-hotspot-practice.ts` — 历史最早触发及链接合并；`5107A542AC6E2A66`。

- `lib/server/content/ai-hotspot-practice-store.ts` — 历史canonical归一及归档主成员触发路由；`28034BF2BD499F99`。

- `lib/server/content/content-evidence-signals.ts` — AI热点练习与共享证据实现；`053BEA40CDFF85B6`。

- `scripts/inspect-source-radar-gaps.ts` — 来源近Run与七日栏目拒绝原因只读诊断；`978950345BD534A1`。

- `lib/server/content/radar-quality-benchmark.ts` — 冻结质量回放与UNKNOWN分母；`50C43D5E856C3FAD`。
- `scripts/replay-radar-quality.ts` — 正反向真实评分器及冻结成员归属回放；`E48EA991D581BE95`。

- `lib/server/content/canonical-event.ts` — 稳定canonical身份、有效成员与快照状态投影；`21770FF3B8F82D29`。
- `lib/server/content/event-clustering.ts` — v6归并与语义建议共用Core写入/硬冲突保护；`AA5FBD8B8C026D44`。
- `lib/server/content/event-policy.ts` — 共享确定性policy投影与事务持久刷新；`D35DEEAC65FB5C17`。
- `scripts/validate-canonical-event.ts` — 确定性归并与逐Raw事实权限反例；`826D1A6846683712`。
- `scripts/accept-canonical-event.ts` — 独有开发PG夹具并发/幂等和跨簇冲突验收；`4C393F856527025C`。
- `skills/event-relation/v1.ts` — 版本化AI关系建议Skill与输入输出类型；`92D98E7D910B28BF`。
- `lib/server/content/event-relation-policy.ts` — 全跨对引用/对象版本动作及原发时间校验；`225E0852DF887A7D`。
- `lib/server/content/event-relation-runtime.ts` — SYSTEM语义阶段、持久任务/游标/租约/CAS/usage；`1BC10D3D745E1659`。
- `scripts/validate-event-relation.ts` — 引用/版本动作/日期与未知关系反例；`65E5C69B4A0CD6DE`。
- `scripts/accept-event-relation.ts` — 开发PG关系任务、整簇/权限/租约/CAS/分页验收；`BC80708DCF69C4B2`。
- `skills/event-expression/v1.ts` — P4D事件表达Skill/Core/验收定位，规则见采集架构合同；`0E4235FB8B7DB79B`。
- `lib/server/content/event-expression-policy.ts` — P4D事件表达Skill/Core/验收定位，规则见采集架构合同；`4068CCEABC5AB5A7`。
- `lib/server/content/event-expression-context.ts` — P4D事件表达Skill/Core/验收定位，规则见采集架构合同；`BF6779646F2CFB14`。
- `lib/server/content/event-expression-runtime.ts` — P4D事件表达Skill/Core/验收定位，规则见采集架构合同；`1D3CDCA35B7E3F29`。
- `scripts/validate-event-expression.ts` — P4D事件表达Skill/Core/验收定位，规则见采集架构合同；`79254161552619B4`。
- `scripts/accept-event-expression.ts` — P4D事件表达Skill/Core/验收定位，规则见采集架构合同；`DBFC382CBE126A16`。

- `lib/server/content/radar-funnel.ts` — P4E完整漏斗/Core/回归定位，规则见采集架构合同；`0C357C6A861B050F`。
- `lib/server/content/radar-funnel-store.ts` — P4E完整漏斗/Core/回归定位，规则见采集架构合同；`AF747CEFEAF5FAEC`。
- `scripts/validate-radar-funnel.ts` — P4E完整漏斗/Core/回归定位，规则见采集架构合同；`00833F1C981BDAB2`。
- `scripts/validate-canonical-snapshot.ts` — P4E完整漏斗/Core/回归定位，规则见采集架构合同；`232DA71F8189E7D1`。
- `scripts/accept-radar-funnel.ts` — P4E完整漏斗/Core/回归定位，规则见采集架构合同；`8F28465880188744`。
- `scripts/inspect-source-radar-gaps.ts` — P4E完整漏斗/Core/回归定位，规则见采集架构合同；`978950345BD534A1`。
- `scripts/run-discovery-collection-full-regression.ts` — P4E完整漏斗/Core/回归定位，规则见采集架构合同；`34719412637F369A`。

- `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md` — P4F分级验收/只读维护预检owner；`9380551FD4595C41`。
- `docs/runbooks/POSTGRESQL.md` — P4F分级验收/只读维护预检owner；`D3DAFDF1639F4920`。

- `lib/content/radar-snapshot-wire.ts` — P4G工具练习/热点讨论/传输投影，规则见采集架构合同；`C4FCEA0A4B37390A`。

- `lib/server/content/topic-momentum.ts` — P4G工具练习/热点讨论/传输投影，规则见采集架构合同；`22EE175C1DDEECB6`。

- `lib/server/content/practice-discovery-policy.ts` — P4G工具练习/热点讨论/传输投影，规则见采集架构合同；`1C2D6687B4898C30`。

- `lib/server/content/practice-materials.ts` — 实际操作/配置及必要访问条件材料校验；`FE5BE88F3D1356D6`。

- `lib/server/content/system-discovery-receipt.ts` — Core首次SYSTEM回执与跨Source历史UNKNOWN；`EF85D21BCDC6211D`。

- `scripts/fixtures/current-tool-evidence-v1.json` — P4J当期独立证据与资格隔离校验；`8C3B1E7009AB6E13`。

- `scripts/validate-radar-quality-benchmark.ts` — P4J当期独立证据与资格隔离校验；`F4D319FB4C66FD5A`。

- `lib/content/radar-algorithm-policy.ts` — 栏目参数Schema、默认值与词表判定；`28C3C4FA5B0AD949`。

- `lib/server/content/radar-algorithm-store.ts` — PG配置版本、CAS和审计；`23A754870E7C0822`。

- `lib/server/content/source-collection-analytics.ts` — SYSTEM运行聚合与小字段快照投影；`56CCB56ACA251828`。

- `components/SourceAlgorithmControls.tsx` — 三栏目配置编辑与来源采集图表；`F79B944AF5CEF79B`。

- `lib/content/source-collection-schedule.ts` — 频率Schema与正式Run水位；`88117B28A79100F0`。

- `lib/server/content/source-collection-schedule-store.ts` — 单源/批量锁行CAS及审计；`7F978DB0E0DEDE04`。

- `components/SourceCollectionFrequency.tsx` — 频率编辑与实际到期投影；`D188AFD842169A02`。

- `deploy/systemd/opc-collection.timer` — 已部署的唯一分钟tick模板；`5819FEE343E98CD9`。
