# 来源管理 / 热点追踪项目状态

最后更新：2026-10-16（Asia/Shanghai）。

状态：PRODUCTION_RUNNING / RADAR_V15_DEPLOYED / SOURCE_INPUT_RUNTIME_DEPLOYED / UI_TEXT_IMPLEMENTED。

用户已明确要求生产使用新版，页面/日历上线审核阻塞已解除。Web与SYSTEM已同版切换；七日完整列表、日期游标、运行漏斗、P0运营一致性及实践材料分类均使用当前代码。部署路径与运行事实唯一见 [CURRENT_SYSTEM_FACTS](docs/CURRENT_SYSTEM_FACTS.md)。

旧120首批时间线与未审核/待切换描述退出当前计划；旧release仅保留回退。部署验收包含Linux构建、SYSTEM类型检查、真实七日/历史遍历、同版统一采集周期与快照一致性。运行数字只代表验收时刻。

正文/材料获取经腾讯云与Deno生产实测，1篇作者说明凭证已落库并过材料Gate；B站匿名字幕、部分附件、通用正文覆盖及长期稳定性仍有缺口。材料通过不等于实际执行工作流，也不保证今日值得做非空。

当前焦点：继续补实操原文/字幕凭证、观察来源真实运行与请求成本。自动采集质量反馈已在本地实现并通过开发库验收，热点追踪与来源管理两处界面已获产品负责人明确批准；生产仍是旧运营决策行为，部署和 Git 同步待执行。任务状态见 `TASKS.md`。后续内容工作台入口与评论分析改造另行规划。不更改课程、评分权重或timer配置。

规则唯一owner为 [采集架构合同](docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md)，代码定位见 [实现映射](docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md)。历史任务结果从Git追溯。

## 当前任务代码快照（2026-10-15，SHA256前16位）

- `lib/server/content/public-workflow-materials.ts` — 固定材料路由、ZIP/JSON内存结构验证；`992BAA039927F48F`。
- `lib/server/content/pixaroma-source.ts` — capability-first作者登记、onboarding及已发现参考关联；`2C6B33207368E4FD`。
- `services/overseas-collector-relay/deno.ts` — 固定公开正文/材料及来源文档白名单Provider，v5；`C7C2F136A0FBFCD8`。
- `lib/server/content/source-acquisition-runtime-adapters.ts` — 复用SYSTEM注册材料Adapter；`A8F0942A18D2D61B`。
- `lib/server/content/discovery.ts` — 视频链接规范化、无日期历史材料不创建当前Event；`B320DBACC443E4EB`。

- `lib/server/content/practice-topics.ts` — 原文工具/任务归并、贡献证据与忽略重算；`8D105B6BB67A3CF6`。
- `lib/server/content/practical-evidence-actionability.ts` — 汇总、实践主体、机械门槛及访问依赖排除；`38B583DE8AB4C747`。
- `lib/server/content/collection-expansion.ts` — 受管搜索、平台语言规划、作者身份及访问依赖排除；`E147BE1B18A472D9`。
- `lib/server/content/managed-practice-search.ts` — 真实探测登记、审计、Raw待审参考；`8CBFCEFA4011CC76`。
- `lib/server/content/radar-snapshot.ts` — v15公开材料及逐篇条件快照及当前运营状态覆盖；`E9F5F35CB74AAFAF`。
- `lib/server/content/public-practice-access.ts` — 访问依赖及注册条件；`9BC10B172AD52787`。
- `lib/server/content/public-creator-probe.ts` — 公开详情/列表/字幕探测与缺口状态；`71490A2B063062DE`。
- `lib/server/content/source-acquisition-plan.ts` — 主/备用路径与交互依赖拒绝；`F2BAB00140F6D2A2`。

- `lib/server/content/intelligence-read-model.ts` — 唯一完整日期时间线，旧截断入口已删除；`5E3ED9A1AEB2EB16`。
