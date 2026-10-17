# 来源管理：栏目算法与采集观测

Decision Brief — 2026-10-17

- 授权：用户明确要求在筛选规则后新增算法菜单，并在发现覆盖/来源管理下方增加详细采集图表，保证可运行。本次不发布生产、不启用模型。
- 角色/Product Surface：管理员；现有来源管理页；沿用布局与权限。
- 边界：Source身份/Route/资格不变；SYSTEM唯一执行链；配置只控制栏目展示判定，不授予事实权或发布权。
- 分工：Core版本化配置、严格校验、CAS、审计、真实SQL聚合；无AI/Skill调用；Human仅最终体验审核。
- 推荐：复用PG既有配置存储模式，纯算法接受显式配置，单次快照使用同版本；默认值保持当前行为。正向词为可选必要匹配，排除词优先；原始证据与材料等硬Gate不可关闭。
- 数据：北京时间完整日窗口的SYSTEM正式运行，明确接收/新增/重复为Run计数而非独立事件漏斗。状态、逐日趋势、来源贡献及错误分布独立展示；0分母显示未知。
- Validation：先失败用例，验证阈值/衰减/权重/正负规则真实影响算法；类型检查、构建、相关回归；开发PG持久化/CAS/审计与聚合验收；实际页面体验。
- Acceptance：菜单按指定位置；读取/编辑/保存/恢复默认可用；拒绝越界与并发覆盖；当前快照注明实际配置版本；图表没有虚构指标；UI_IMPLEMENTED与USER_APPROVED分开。
- Rollback：恢复默认配置生成新审计版本，回退代码；原文与运行审计不删。
- Owner：规则正文归COLLECTION_ARCHITECTURE_CONTRACT，实现归COLLECTION_IMPLEMENTATION_MAPPING；本文件只记录本任务Decision Brief及验收。

状态：IMPLEMENTED / STAGING_EXPERIENCE_READY / UI_NOT_REVIEWED / NOT_DEPLOYED。

## 工程验证

- 85项quick（含typecheck）通过；最终复核修复后，typecheck、栏目参数行为用例、topic-momentum回归及脚本入口检查再次通过。
- 独立复核发现过期/roundup Raw污染词表，已收紧到有效七日原文并增加正负回归；复核闭环，无剩余确定项。
- 真实隔离PG验收通过：CAS并发单赢家、旧revision拒绝、原子审计、单快照配置版本、SYSTEM计数及资格/回填/非SYSTEM/过期恢复排除；脚本在finally恢复配置及删除专属测试记录。
- Linux最终构建通过（103页）；本机build因既有.next目录EPERM不能完成，使用同源码隔离Linux构建验证，未把本机失败记为PASS。
- 统计SQL只提取CURRENT快照的revision，避免为版本号读取整个payload；HTTP验收发现Next内部URL与外部Host不同导致同站403，修复为目标Host同源比较，外站仍拒绝。
- 运行无生产写入、无模型调用、未启动新采集调度；固定官方长文不作为独立质量正例。完整栏目质量保持NOT_ACCEPTED / RELEASE_NOT_READY。

## 体验入口与Gate

隔离暂存候选与独立PG，访问入口：http://127.0.0.1:3012/admin/sources（本机SSH隧道，服务8小时临时运行）。生产Web/SYSTEM/Relay未发布。新UI仅为IMPLEMENTED，尚无产品负责人明确批准，不能标记USER_APPROVED；后续依赖该UI的阶段需按AGENTS.md视觉Gate继续。

## 最终暂存验收

- 最终Linux build成功，103静态页；816个候选源码SHA256与本机一致，0差异。
- 实际HTTP通过：匿名401、非法参数400、旧revision409、外站Origin403、同站保存/读回/恢复200。
- 统计HTTP单次观察：7天1308ms/12741bytes、14天832ms/13757bytes、30天829ms/16077bytes；仅隔离暂存本次观察，不作为生产P95或容量结论。
- 浏览器实际操作通过：三栏目切换、热点半衰期96保存成功、精选权重总和越界被拒绝、撤销及恢复默认保存、14天与OpenAI News单源筛选；最终恢复7天/全部来源。浏览器console error为空。
- PC 1440×1000维持原双栏；窄屏可滚动与编辑。暂存截图位于本机`.runtime/p4k-source-algorithm-desktop.jpg`及`.runtime/p4k-source-collection-desktop.jpg`。临时视口已恢复默认，体验页保留。
- 最终状态：IMPLEMENTED / ENGINEERING_PASS / STAGING_EXPERIENCE_READY / USER_APPROVAL_PENDING / NOT_DEPLOYED。后续先由产品负责人体验明确确认，再推进依赖UI的阶段。

## 当前发布状态更新

2026-10-17：用户后续明确授权生产上线与Git同步，本功能已随同版Web/SYSTEM/Relay发布。上文“未部署/原timer”属于当时验收记录，当前部署事实唯一见CURRENT_SYSTEM_FACTS。实际暂存体验已提供，未另行标记USER_APPROVED；完整栏目质量保持NOT_ACCEPTED / RELEASE_NOT_READY。
