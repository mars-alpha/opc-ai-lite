# 来源管理 / 热点追踪项目状态

最后更新：2026-10-17（Asia/Shanghai）。

独立开发辅助工具状态与用法见 [任务管理器说明](tools/task-manager/README.md)；与来源管理/热点追踪业务界面隔离，不改变其批准或发布状态。

状态：PRODUCTION_RUNNING / EVENT_EVIDENCE_VALUE_IMPLEMENTED / DEPLOYMENT_BLOCKED；完整栏目质量 NOT_ACCEPTED / RELEASE_NOT_READY。

课程：81 LESSONS / FROZEN。

当前焦点：事件时间/发布者身份、同源动量与实际历史、练习候选、独立暂存报告及缺口定向计划已在现有Core/Skill/SYSTEM实现。生产仍运行P4 Radar，源码上传被自动审批阻断，未切换版本或启用新AI任务。生产路径、接口实测及回退点唯一见[当前系统事实](docs/CURRENT_SYSTEM_FACTS.md)。

本轮验收证据和未完成项见[实施计划](docs/superpowers/plans/2026-10-17-event-evidence-value-delivery.md)。工程、部署和真实栏目质量分别记录；完整质量与连续发现延迟未验收，不将练习数量为0解释为部署失败。

用户已明确授权本轮部署和Git同步。新增来源菜单/图表与按需详情已提供暂存实际体验；未另行记录为USER_APPROVED，后续依赖新增交互的阶段仍遵守视觉Gate。课程与既有批准布局冻结。

当前任务记录见[事件证据与价值报告](docs/superpowers/plans/2026-10-17-event-evidence-value-delivery.md)。规则唯一owner为[采集架构合同](docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md)，代码定位见[实现映射](docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md)。已完成的去重/频率/算法配置计划退出current tree，历史由Git追溯。

## 当前任务代码快照（2026-10-17，SHA256前16位）

- `tools/task-manager/model.mjs` — current owner/Git只读投影、版本历史与治理建议；`A6C0A2CFF1076546`。
- `tools/task-manager/server.mjs` — localhost固定资源、事实API与同源AI分析入口；`9FEAA566CAA227E4`。
- `tools/task-manager/public/app.js` — 版本时间线/基线比较与阻塞驱动近期计划；`F02E9A02343D98E7`。
- `tools/task-manager/versions.mjs` — Git可恢复提交、文件差异及部署/回退证据映射；`E8F112BAD2A050E5`。
- `tools/task-manager/analysis.mjs` — V2计划字段校验、依赖排序与完整推进Prompt；`23FD9C699193BEB0`。
- `tools/task-manager/analysis-service.mjs` — 单次模型调用、并发保护、结果缓存与失效；`973CF9FCFFDE5C41`。
- `tools/task-manager/analysis-worker.mjs` — 隔离复用DeepSeek与V2计划合同；`6ED961E0B95B7A53`。

- `lib/server/content/participant-identity.ts` — 发布者身份及独立实测边界；`E1A1EBD2C3955A0C`。
- `lib/server/content/topic-momentum.ts` — 同源动量、信号时间与复燃；`F7D4007CED1F7D18`。
- `lib/server/content/topic-momentum-history.ts` — 实际评分时点与版本记录；`95D6005489489891`。
- `lib/server/content/intelligence-read-model.ts` — canonical事实、精选时间与同源曲线；`CB13BFFCC7A77773`。
- `lib/server/content/event-story-read-model.ts` — 原文角色和取得/完整/执行状态；`BC76FB23B8F21CE8`。
- `lib/server/content/ai-hotspot-practice.ts` — 实测候选和正式资格隔离；`BF4F23DDF3525991`。
- `lib/server/content/event-value-context.ts` — 当前证据选择与输入版本；`46CDCB90E30C8F21`。
- `lib/server/content/event-value-policy.ts` — 报告引用/比较/覆盖Validator；`52F914A253145CA2`。
- `lib/server/content/event-value-runtime.ts` — 暂存报告任务和账本；`83D37895BE551C5F`。
- `lib/server/content/event-gap-runtime.ts` — 缺口计划任务和账本；`7C22BE31B57D01CC`。
- `lib/server/content/collection-expansion.ts` — 现役受管搜索消费计划；`75414B8B3A4AECE9`。
- `scripts/run-server-native-automatic-cycle.ts` — 唯一SYSTEM报告/缺口阶段；`4DC3404513532877`。
- `scripts/accept-event-value.ts` — 开发PG并发/缓存/CAS验收；`2CBE7A1558C4CC69`。
