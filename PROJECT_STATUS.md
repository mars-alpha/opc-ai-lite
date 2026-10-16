# 来源管理 / 热点追踪项目状态

最后更新：2026-10-16（Asia/Shanghai）。

生产状态：PRODUCTION_RUNNING / AUDIT_FIXES_DEPLOYED / UI_USER_APPROVED。

本次审计修复已独立发布，Web与SYSTEM使用同一业务提交；代码、构建与界面审核通过，生产自然周期验收结果唯一见 CURRENT_SYSTEM_FACTS。主工作区的 Snapshot v17 WIP 未纳入，也未被修改。

课程：81 LESSONS / FROZEN。

用户已明确要求生产使用新版，页面/日历上线审核阻塞已解除。Web与SYSTEM已同版切换；七日完整列表、日期游标、运行漏斗、P0运营一致性及实践材料分类均使用当前代码。部署路径与运行事实唯一见 [CURRENT_SYSTEM_FACTS](docs/CURRENT_SYSTEM_FACTS.md)。

旧120首批时间线与未审核/待切换描述退出当前计划；旧release仅保留回退。部署验收包含Linux构建、SYSTEM类型检查、真实七日/历史遍历、同版统一采集周期与快照一致性。运行数字只代表验收时刻。


当前焦点：观察修复版的来源真实运行、数据续接、快照时效与请求成本。生产数字和部署位置只见 [CURRENT_SYSTEM_FACTS](docs/CURRENT_SYSTEM_FACTS.md)；后续工作只见 [TASKS](TASKS.md)。

本次来源详情随索引追赶、切换来源及热点运行状态文案已完成本地体验，产品负责人于2026-10-16明确回复“已体验，批准本次界面”，满足 AGENTS §11；界面状态为 IMPLEMENTED / USER_APPROVED。生产发布状态仍由 CURRENT_SYSTEM_FACTS 记录。

规则唯一owner为 [采集架构合同](docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md)，代码定位见 [实现映射](docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md)。历史任务结果从Git追溯。

代码 owner 和校验入口以 [采集实现映射](docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md) 为准；历史文件指纹和验收批次由 Git 追溯。
