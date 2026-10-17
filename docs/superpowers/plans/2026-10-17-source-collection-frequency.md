# 来源采集频率 — Decision Brief

Task ID: SOURCE_COLLECTION_FREQUENCY；授权：用户要求新增可调整且实际生效的采集频率。本轮沿用正常暂存、暂不发布。

- Goal/Role/Surface：管理员在来源管理「栏目算法」后新增「采集频率」，选择单个或全部当前目录来源，调整5–1440整数分钟的基础间隔。
- Must Know：当前唯一SYSTEM周期、来源身份/资格与治理、来源配置及Run时间口径；Nice to Know：过去统计；Do Not Load：旧Manual链与历史课程。
- Problem/Why Now：已有基础间隔解析但无运营入口；15分钟唤醒无法兑现更短频率。
- In Scope：Source.metadata.collectionSchedule单一可写覆盖值、版本/CAS/事务审计、实时生效到期查询、批量修改当前目录、实际有效间隔和预计到期、唯一timer一分钟检查模板；排除探测/回填/非SYSTEM/过期恢复对频率水位影响。
- Out of Scope：生产发布、启用停用源、绕过资格/限流、额外调度、AI、课程和其他UI。
- Code：Schema、Source设置、版本锁、调度时间判断、API；AI/Skill：无语义调用；Workflow：复用现有SYSTEM与锁；Human：最终体验确认。
- Data：读取当前Source/治理/正式SYSTEM运行；仅写当前Source的频率覆盖字段及Audit，不改Route或Raw。批量只包含提交时已读取的来源，不是未来新增来源默认值。
- Options：直接修改systemd间隔（需要特权且所有阶段受影响）、新增调度器（违背单链）、沿用唯一一分钟tick+逐源到期判断（推荐）。新值从最近正式运行开始时间重新计算；保存不发起采集，正在运行不重启。实际执行受下一tick、周期耗时、资格/治理/配额限制，可延后不抢跑。
- Entitlement：现有管理员权限；External Side Effect：隔离暂存构建/测试，无生产写入或模型调用。
- Acceptance：单源/批量可保存和读回；越界/重复ID/未知源/并发旧版本拒绝，批量原子；5/30/60分钟到期前不选中、到期选中；调长/缩短立即影响后续到期判定；探测不推迟；原配置/停用意图保留。
- Validation：先失败再实现的纯行为测试、真实隔离PG保存/审计/到期选择与真实Runner回执（模拟上游）、typecheck/build、相关回归、HTTP及浏览器体验；不将虚拟时钟测试称真实持续运行。
- Human Review：IMPLEMENTED与USER_APPROVED分开；本轮是上一轮UI体验中的增补，不推进依赖阶段。
- Rollback：保存先前频率为新审计版本；回退代码与唯一timer模板，保留审计与原文。
- Owner：规则正文COLLECTION_ARCHITECTURE_CONTRACT；映射COLLECTION_IMPLEMENTATION_MAPPING；本文件为任务验收记录。

状态：IMPLEMENTED / ENGINEERING_PASS / STAGING_EXPERIENCE_READY / USER_APPROVAL_PENDING / NOT_DEPLOYED。

## 验收结果

- 测试先失败后通过：Schema与新覆盖解析；历史SOURCE_QUALIFICATION排除反例；5/30/60分钟到期前1ms不入选、到期入选。
- 真实隔离PG通过：单源保存、同revision并发仅一成功、批量任一旧revision则全回滚、未知源拒绝、停用状态/原Route及metadata保留、事务Audit；真实Runner成功与失败探测/失败回填回执通过；真实SYSTEM查询在5/60/30分钟虚拟时钟边界准确入选。该测试不是跨5分钟真实持续timer观察。
- 86项quick含typecheck全部通过。初轮两项旧静态断言（15分钟模板/四菜单表达式）已随新行为更新，未删除边界校验，最终完整重跑通过。
- Linux npm run build通过（103静态页）。本机npm run build仍被已有.next受限目录EPERM阻断，不记为本机PASS。
- Linux systemd-analyze识别分钟calendar表达式；verify未报告本timer语法错误，但有现役系统无关service读取权限/兼容警告。生产opc-collection.timer经只读核对仍OnUnitInactiveSec=15min；未修改或重载生产unit。
- HTTP实际验证：匿名401、越界400、外站403、旧版本409；保存/读回/恢复200。频率GET本次冷读6246ms、13766bytes，是暂存单次观察，不是生产P95。该诊断复用现役治理读取，未在本轮另写评分缓存或改变治理算法。
- 浏览器实际操作：第五菜单可见；OpenAI基础15→30保存、列表显示基础30/治理有效60，再恢复15；输入4被拒绝；console error为空。1440×1000桌面布局与窄屏可用；截图`.runtime/source-collection-frequency-desktop.jpg`。
- 独立复核1个P2已修复并复核闭环：探测/回填意图必须在RUNNING创建时持久化，否则失败任务推迟正式水位；增加历史SOURCE_QUALIFICATION及冒号后缀排除。无剩余确定重要发现。
- 无生产写入、真实外部采集或模型调用，不宣称正式连续调度已部署；完整栏目质量仍NOT_ACCEPTED / RELEASE_NOT_READY。

## 体验与发布边界

暂存页：http://127.0.0.1:3012/admin/sources → 栏目算法后的采集频率。独立PG与Web沿用上轮临时体验环境。新频率Core已被真实Runner/到期查询验收，产品UI待用户明确确认；发布时须同时部署匹配Web、SYSTEM及唯一timer模板，不能只发Web后宣称5分钟已经在生产兑现。最终UI与生产部署均未获本轮确认。

Rollback：通过频率菜单保存原间隔为新审计版本；若回退功能代码，还需恢复原唯一timer文件。保留原文和审计；不以删除Source或频率审计回退。

## 当前发布状态更新

2026-10-17：用户后续明确授权生产上线与Git同步，本功能已随同版Web/SYSTEM/Relay发布。上文“未部署/原timer”属于当时验收记录，当前部署事实唯一见CURRENT_SYSTEM_FACTS。实际暂存体验已提供，未另行标记USER_APPROVED；完整栏目质量保持NOT_ACCEPTED / RELEASE_NOT_READY。
