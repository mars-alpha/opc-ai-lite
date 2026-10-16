# 来源管理 / 热点追踪项目状态

最后更新：2026-10-16（Asia/Shanghai）。

状态：PRODUCTION_RUNNING / RADAR_V16_DEPLOYED / LIVE_REFRESH_UI_APPROVED / DEPLOYING。

课程：81 LESSONS / FROZEN。

用户已明确要求生产使用新版，页面/日历上线审核阻塞已解除。Web与SYSTEM已同版切换；七日完整列表、日期游标、运行漏斗、P0运营一致性及实践材料分类均使用当前代码。部署路径与运行事实唯一见 [CURRENT_SYSTEM_FACTS](docs/CURRENT_SYSTEM_FACTS.md)。

旧120首批时间线与未审核/待切换描述退出当前计划；旧release仅保留回退。部署验收包含Linux构建、SYSTEM类型检查、真实七日/历史遍历、同版统一采集周期与快照一致性。运行数字只代表验收时刻。


当前焦点：观察来源真实运行与请求成本，继续补实操原文/字幕凭证。采集质量正负评价、30日来源样本统计及AI热点练习已部署到 Web/SYSTEM 同版，热点追踪与来源管理界面获产品负责人明确批准。2026-10-16 12:32（北京时间）新版SYSTEM周期PASS并生成v16快照：七日388个唯一Event，当日87条，精选48、当前热点1、AI热点练习1；数字只代表验收时刻。接下来观察真实采集周期与7–14日评价样本，不能把标注样本当成全量准确率。后续内容工作台入口与评论分析改造另行规划；课程、评分权重和timer配置未变。

2026-10-16 线上页面滞后诊断：SYSTEM在12:49生成新快照（七日389 Event），已打开的生产浏览器页仍停在12:32的388 Event；服务器周期与持久化正常，Web首读后缺少自动重读，首读期间还把空状态显示成0。两页后台重读及首屏读取态已在本地实现并获产品负责人体验批准，正在发布，尚不能标为生产已上线。来源目录仅显示42个current Source，生产数据库另有22个旧`source_runtime_trend_*`记录（其中10个有历史Run，最后在10月15日），没有数据丢失；这些旧记录不再参与当前SYSTEM组合，但数据库status仍有ACTIVE，需在后续治理中明确历史展示与状态。

规则唯一owner为 [采集架构合同](docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md)，代码定位见 [实现映射](docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md)。历史任务结果从Git追溯。

## 当前任务代码快照（2026-10-16，SHA256前16位）

- `lib/server/content/public-workflow-materials.ts` — 固定材料路由、ZIP/JSON内存结构验证；`992BAA039927F48F`。
- `lib/server/content/pixaroma-source.ts` — capability-first作者登记、onboarding及已发现参考关联；`2C6B33207368E4FD`。
- `services/overseas-collector-relay/deno.ts` — 固定公开正文/材料及来源文档白名单Provider，v5；`609969B00A7EB4ED`。
- `lib/server/content/source-acquisition-runtime-adapters.ts` — 复用SYSTEM注册材料Adapter；`A8F0942A18D2D61B`。
- `lib/server/content/discovery.ts` — 视频链接规范化、无日期历史材料不创建当前Event，旧运营决策写入退出；`463BFE1CA67A3D59`。

- `lib/server/content/collection-expansion.ts` — 受管搜索、平台语言规划、作者身份及访问依赖排除；`4DB28B38E4FBB6DE`。
- `lib/server/content/managed-practice-search.ts` — 真实探测登记、审计、Raw待审参考；`8CBFCEFA4011CC76`。
- `lib/server/content/radar-snapshot.ts` — 生产v16 AI热点练习触发与快照；`41AAF4EDCBC6B448`。
- `lib/server/content/collection-quality-feedback.ts` — 采集质量标签、来源归因、幂等与审计；`85D0DECC32A511E1`。
- `lib/server/content/public-practice-access.ts` — 访问依赖及注册条件；`9BC10B172AD52787`。
- `lib/server/content/public-creator-probe.ts` — 公开详情/列表/字幕探测与缺口状态；`71490A2B063062DE`。
- `lib/server/content/source-acquisition-plan.ts` — 主/备用路径与交互依赖拒绝；`F2BAB00140F6D2A2`。

- `lib/server/content/intelligence-read-model.ts` — 完整日期时间线、热点与练习参与者边界；`748B8199A0F1A236`。

## 当前变更

AI热点练习：IMPLEMENTED / USER_APPROVED / DEPLOYED。类型检查、构建、58项采集回归、开发库验收与新版生产SYSTEM周期通过；练习触发排除纯趋势Signal、无原文链接与无原作者聚合器。规则见采集架构合同§23，生产路径与回退点见当前事实。

- `lib/server/content/ai-hotspot-practice.ts` — AI热点练习与发布者准入；`F630559D10C1C8F9`。

- `lib/server/content/ai-hotspot-practice-store.ts` — AI热点练习与共享证据实现；`BB92815B13572DBA`。

- `lib/server/content/content-evidence-signals.ts` — AI热点练习与共享证据实现；`2DB2515C87B9C9C6`。
