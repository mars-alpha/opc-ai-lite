# 热点去重、读取优化与生产发布

## Decision Brief

- 角色 / Surface：管理员；来源管理、热点追踪及唯一 SYSTEM 执行链。用户已明确授权上线并同步 Git，覆盖此前暂不发布要求。
- Must Know：现役聚类、独立发布者身份、快照传输、真实页面消费字段、生产 Web/SYSTEM/Relay 版本与回滚点。Nice to Know：历史质量探索。Do Not Load：课程和已退役采集工作台。
- 推荐：复用现有事件聚类与发布者归一，扩展具备明确模型及版本锚点的发布归并；不同版本、独立价格/安全/重大更新保持分开。读取先测量，再裁剪页面未消费字段、消除重复传输；保留资料引用、时间线及实时运营状态。
- 分工：Core 负责身份、聚类、评分、读取、配置、审计与部署；AI / Skill 不调用真实模型，不授予栏目资格；Workflow 复用 SYSTEM；Human 已授权发布，现有界面布局保持不变。
- 边界：不复制 Source、不删除 Raw/Observation，不降低热点及工具实践门槛；完整栏目质量仍 NOT_ACCEPTED / RELEASE_NOT_READY，不等同于工程部署状态。
- Validation：去重正反例、独立来源重复计数反例、读取字段与大小回归；quick/typecheck/build；暂存认证 API / 页面；生产备份、同版切换、HTTP/鉴权/SYSTEM/timer/日志验证。
- Acceptance：同模型同版本发布报道归并，独立动作/版本不误合；同源重复不增加独立参与者；页面核心信息完整且读取负载可测下降；Web/SYSTEM 正常运行、唯一调度按已保存频率判定；Git 提交推送成功。
- Rollback：保留旧 Web cwd、SYSTEM current、timer、环境配置与数据库备份；异常恢复旧版本及配置，不删除审计资产。
- Owner：采集架构合同与实现映射拥有规则，CURRENT_SYSTEM_FACTS 拥有部署事实，本文件只记录本任务执行与验收。

## 执行状态

IMPLEMENTED / ENGINEERING_PASS / DEPLOYED；完整栏目质量 NOT_ACCEPTED / RELEASE_NOT_READY，新增UI不另记USER_APPROVED。

- 86项quick（含typecheck）全部通过，最终Linux构建通过；本机旧.next写入限制不记为本机build PASS。独立复核提出的价格/安全/API独立动作误合与展开详情刷新问题均增加反例并修复，最终复核无剩余P1/P2。
- 隔离PG事件聚类、频率真实Runner/虚拟时钟到期边界及实际暂存页面通过；不同版本、教程、评测、普通评论反例保留。同机构不同署名只计一个参与者，不复制Source。
- 生产备份、只读迁移预检、821源码一致、Web/SYSTEM/Relay同版切换及认证接口验收通过；实际性能/去重结果、路径和回退点唯一见CURRENT_SYSTEM_FACTS。
- 首次及随后SYSTEM真实周期正常退出，唯一分钟timer已启用；持续覆盖与栏目质量继续观察，不将短期运行成功算为质量通过。AI开关保持关闭，无真实模型调用。
- Git同步结果以分支提交及远端比对为准，不把本地未推送状态写成已同步。
