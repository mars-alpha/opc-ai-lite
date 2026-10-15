# 来源管理 / 热点追踪项目状态

最后更新：2026-10-15（Asia/Shanghai）。

状态：PRODUCTION_RUNNING / P0_IMPLEMENTED / USER_REVIEW_PENDING。

公开作者核验：Pixaroma材料增量已独立发布腾讯云生产SYSTEM，Deno与生产单一作者来源已接通；生产实采/即时幂等通过，沿现有timer观察。开发真实跨周期复测通过，生产长期稳定尚待观察。Web/P0界面未切换，其余作者与通用正文/字幕缺口保持。详见TASKS。

受管搜索追加：DEVELOPMENT_LIVE_VALIDATED；腾讯云已验证B站与Deno YouTube搜索并持久化待审参考；作者持续采集和正文仍未闭环。生产未变更，AI未调用。运行结果与后续验收见TASKS。

腾讯云已承载Web与唯一SYSTEM采集timer，Deno仅为海外获取Relay，不依赖本机开机。生产部署和已知能力缺口以 [CURRENT_SYSTEM_FACTS](docs/CURRENT_SYSTEM_FACTS.md) §2、§7B为准；来源数量、健康和榜单数量属于运行时结果，不在本文件维护副本。既往单次回归通过不代表72小时稳定观察完成。

当前焦点：P0运营一致性及用户追加的实践主题/汇总排除已在本地分支实现；来源管理与热点追踪交互待用户体验审核。Pixaroma独立生产材料增量部署范围见Current Facts；正在观察运行。请求降本、通用正文与质量解释仍为后续。具体边界只见 [TASKS](TASKS.md)。本轮不改评分权重、Schema、生产Web或常驻timer配置。

规则唯一owner为 [采集架构合同](docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md)，入口映射为 [实现映射](docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md)。精选评分与原证据数量门槛保持，追加内容主体边界；自动采集不调用AI，人工AI能力保留。课程与页面布局冻结。

本轮治理：清除已完成任务中失效的生产阻塞、旧Web说明与重复快照数字；合并同一校验的重复命令。仍有行为断言的历史编号测试继续保留，不能仅因编号旧而删除。未提交资产不以“Git可追溯”为由删除。

代码定位：P0业务改动集中在discovery、radar-snapshot、source-management/policy/onboarding、事务审计及两页状态交互；入口见采集实现映射P0段。

P0验证：完整发现/采集回归（含typecheck/build）PASS；开发库审计失败回滚、并发、跨进程忽略、资格不足与真实快照PASS；腾讯云隔离直连开发库同样PASS（约3.6秒）。本地体验入口http://127.0.0.1:3102，需管理员登录；USER_REVIEW_PENDING，未发布生产。

追加分类验证：此前完整回归PASS；本次受管搜索及开发库快照验收PASS，DEVELOPMENT_LIVE_VALIDATED / USER_REVIEW_PENDING，不标记正式上线。作者持续采集与正文缺口见TASKS。

## 当前任务代码快照（2026-10-15，SHA256前16位）

- `lib/server/content/public-workflow-materials.ts` — 固定材料路由、ZIP/JSON内存结构验证；`839FF64104AAAF88`。
- `lib/server/content/pixaroma-source.ts` — capability-first作者登记、onboarding及已发现参考关联；`2C6B33207368E4FD`。
- `services/overseas-collector-relay/deno.ts` — 固定Pixaroma目录、步骤与有界包获取，v3；`E412C9123009A193`。
- `lib/server/content/source-acquisition-runtime-adapters.ts` — 复用SYSTEM注册材料Adapter；`A8F0942A18D2D61B`。
- `lib/server/content/discovery.ts` — 视频链接规范化、无日期历史材料不创建当前Event；`BCDA3A3E3883646E`。

- `lib/server/content/practice-topics.ts` — 原文工具/任务归并、贡献证据与忽略重算；`21D86E6AA7953245`。
- `lib/server/content/practical-evidence-actionability.ts` — 汇总、实践主体、机械门槛及访问依赖排除；`8BBCB289E4386ED5`。
- `lib/server/content/collection-expansion.ts` — 受管搜索、平台语言规划、作者身份及访问依赖排除；`E147BE1B18A472D9`。
- `lib/server/content/managed-practice-search.ts` — 真实探测登记、审计、Raw待审参考；`CADC166ACF0A2697`。
- `lib/server/content/radar-snapshot.ts` — v11主题快照及当前运营状态覆盖；`3B4125B03EC2DBF6`。
- `lib/server/content/public-practice-access.ts` — 访问依赖及注册条件；`9BC10B172AD52787`。
- `lib/server/content/public-creator-probe.ts` — 公开详情/列表/字幕探测与缺口状态；`71490A2B063062DE`。
- `lib/server/content/source-acquisition-plan.ts` — 主/备用路径与交互依赖拒绝；`F2BAB00140F6D2A2`。
