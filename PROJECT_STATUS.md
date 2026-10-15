# 来源管理 / 热点追踪项目状态

最后更新：2026-10-15（Asia/Shanghai）。

状态：PRODUCTION_RUNNING / OPERATIONS_HARDENING_DESIGN_READY / USER_REVIEW_PENDING。

腾讯云已承载Web与唯一SYSTEM采集timer，Deno仅为海外获取Relay，不依赖本机开机。生产部署和已知能力缺口以 [CURRENT_SYSTEM_FACTS](docs/CURRENT_SYSTEM_FACTS.md) §2、§7B为准；来源数量、健康和榜单数量属于运行时结果，不在本文件维护副本。既往单次回归通过不代表72小时稳定观察完成。

当前焦点：治理事实与旧描述，按运营一致性→请求降本→出口和正文→质量解释→候选来源分阶段改造。具体设计、未完成验收和回滚边界只见 [TASKS](TASKS.md)。本轮未改变采集业务、页面、Schema或生产部署。

规则唯一owner为 [采集架构合同](docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md)，入口映射为 [实现映射](docs/content/COLLECTION_IMPLEMENTATION_MAPPING.md)。热点、精选、今日值得做门槛保持；自动采集不调用AI，人工AI能力保留。课程与已确认UI冻结。

本轮治理：清除已完成任务中失效的生产阻塞、旧Web说明与重复快照数字；合并同一校验的重复命令。仍有行为断言的历史编号测试继续保留，不能仅因编号旧而删除。未提交资产不以“Git可追溯”为由删除。

代码定位缓存：当前只治理文档与回归编排，未修改业务代码；对应代码边界和待实现项见CURRENT_SYSTEM_FACTS §7B及实现映射，后续实现前按文件变化重新读取。

本轮验证：入口治理、采集单主链、架构、发现边界、typecheck、production build、文档链接与diff检查PASS。未重跑生产实时健康或完整采集回归。
