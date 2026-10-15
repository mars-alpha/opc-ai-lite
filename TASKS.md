# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。历史任务通过 Git 追溯；旧「今日情报」、旧 Rising、旧 Manual Collection 描述不得作为 current roadmap。

# NOW — SOURCE MANAGEMENT → HOT TRACKING PRODUCTION CLOSE

## COLLECTION-OPERATIONS-HARDENING-20261015 — Decision Brief / Design

Status：DESIGN_READY / IMPLEMENTATION_NOT_STARTED。用户已授权目标范围；本条为待确认的具体架构设计。不得据此声称实现或上线。

- Goal / Role / Surface：管理员来源管理→热点追踪；降低重复联网与解析成本，保证运营操作立即可见、来源质量可判断、失败可恢复。保留既有页面布局。
- Must Know：采集合约、Acquisition Route、HTTP适配器、Source/Run元数据、资格与cadence、快照/Decision/审计API。Nice to Know：AIHOT对应机械实现；Do Not Load：课程、会员、历史任务。
- In Scope：条件请求、频率/退避、按需正文、统一海外出口、运行/质量/分类解释、来源候选待审、忽略一致性、资格语义、关键操作审计。
- Out of Scope：更改热点/精选/今日值得做门槛，自动AI，采用→内容工作台，课程/权限/会员，Redis、第二scheduler、常驻浏览器，自动批准来源或删除历史。
- Responsibility：Core拥有请求、调度、状态、审计、候选及校验；Workflow继续SYSTEM单timer；AI/Skill不进入采集；Human确认新Source/高成本路由及UI体验。

### Proposed Design

1. HTTP条件状态绑定逻辑Source + Route + 最终URL及配置指纹。持久化ETag/Last-Modified仅在解析、过滤、入库全部成功后提交；失败不得推进validator。304是成功检查但不是新内容或新实践证据，不重复解析/写Raw；不把304当缺Location的重定向。首次补采、显式有界回放和配置改变时不复用旧validator；304但无有效历史检查点时仅允许一次无条件重取。
2. Cadence沿用现有治理计算：人工基础间隔优先；以近7日唯一新增内容产出推荐15–360分钟，叠加治理降频和配额限制。连续失败指数退避，上限24小时，尊重有界Retry-After；成功重置连续失败，304不等同内容荒废。只有明确瞬时网络/5xx允许预算内一次重试，401/403/配额不足不盲重试。来源覆盖保护仍不被自动停用。
3. 列表→正文沿用当前采集器：Feed已有真实正文直接复用；详情只针对新增且规则相关、正文不足、路由允许的条目，每来源每周期上限3条，并沿用总时间/体积预算。提供列表URL内存去重，保存正文来源和完整性。付费/登录详情不得自动升级，无正文不得伪装全文翻译资格。
4. 海外出口集中为一个确定性请求Adapter，业务采集器不单独写代理逻辑。国内已登记路由直连；海外公共路由走现有Deno Relay的Source/Route白名单；保留可配置的可信Relay base URL便于后续换承载。不得把Deno改成任意URL公开代理；重定向逐跳检查，HTTPS/认证/私网与体积/超时保护保持。登录来源按原登录环境运行。缺少已验证路由明确BLOCKED，不偷偷直连。原4 providers保持兼容。
5. 来源质量分项记录：HTTP检查、有效条目、原始发布时间、原链、作者、正文完整性、主题相关保留率、重复率。独立原创仅有origin身份或可核验数据时给出结果；未知显示UNKNOWN，不凭关键词或模型猜测。按Run保存分子/分母、窗口、样本量；不得用短时间5次重放冒充7日稳定质量。
6. 运行诊断从既有Run/治理事实派生：最后尝试/成功、下次due、连续失败、安全错误码、资格原因、恢复结果。分页受限标明TRUNCATED/游标/可恢复状态；上游不支持回溯标记UNAVAILABLE，不承诺完整历史。正文缺口与来源失败单独展示，不能合并成一个健康绿灯。
7. 快照与运营一致性：Decision写入、Event状态更新、审计同一事务；返回已提交事件状态，UI立即更新/移除对应事件及相关榜单，跨进程读取使用轻量最新决策覆盖。快照返回generatedAt/age/stale，过期保留最后成功结果并标记，不在每次页面GET全量重算；SYSTEM刷新仍唯一周期，运营变更触发一次合并刷新或确定性覆盖，禁止刷新风暴。失败展示可重试，不能显示成功却恢复旧状态。
8. 资格操作只写真实阶段PROBED/OBSERVING/QUALIFIED，只有实际AUTO_READY才标合格；探测和qualificationOnly仍不充当正式生产次数。启停、归档、恢复、规则改动记录操作者、理由和前后状态；写状态与审计同事务，历史Raw/Evidence保留。
9. 分类解释复用既有权威Gate输出，为每个Event返回热点/精选/实践的eligible、reasonCodes、actual/required值；不另建评分算法。正文或分析不足明确列缺口，不自动触发AI。
10. 候选来源归来源管理owner：采用独立最小候选表，canonical URL唯一、topic、发现依据/原链、最近探测、PENDING/REJECTED/REGISTERED、处理人。仅复用当前已采内容链接和管理员提交作有界召回；不做持续关键词全网扫描。初始主题覆盖ComfyUI/Skill/MCP/投流/改写/配图/动画/剪辑/客服/工作管理；候选不进入SYSTEM，确认后复用现有预览→注册→资格链。此项需要新增Schema，按Safe Migration Gate独立验收。

### Feasibility / 分阶段交付边界

推荐渐进复用主链。重建采集系统会增加第二套状态和迁移负担；仅补页面诊断则无法修复缓存与采集成本。本方案优先在既有Source/Run元数据、事务、Adapter和单timer上补足能力，候选表最后独立迁移。

| 阶段 | 可行性与依赖 | 验收出口 |
| --- | --- | --- |
| P0 运营一致性 | 高；既有Decision/Event/审计及快照可复用，无需新调度器 | 忽略后刷新/重启不恢复；事务失败无半提交；过期快照可见；资格按真实结果显示 |
| P1 请求降本 | 高；改HTTP结果模型、路由检查点和cadence计算 | 200→304不重复解析；失败不推进validator；连续失败延后且成功恢复；人工回放可绕过条件请求 |
| P2 海外出口与正文 | 有条件；每个来源须有可验证白名单路由，上游限流不可消除 | 来源逐项展示已验证出口/阻断；详情有数量、时间、体积上限；无正文不声称全文 |
| P3 质量与分类解释 | 高；复用既有Run字段与权威Gate，原创未知须保留 | 指标有窗口/分母；热点/精选/实践各列原因及缺口；不自动调用AI |
| P4 候选来源 | 有条件；最小新表及迁移Gate，实践作者仍需运营筛选 | 候选不自动入采；URL去重；拒绝/注册可审计；注册复用原资格链 |

资源验收沿用单进程512M/CPU50%和唯一timer；新增网络请求逐来源有界，不以304或回放刷高有效产出。用真实运行日志比较请求数、下载字节、解析次数、周期时长与失败率；未测量前不承诺降本百分比。确定性代码可保证流程和规则，不能保证第三方长期可用或所有主题全覆盖。

### Validation / Acceptance / Rollback

- 先验收机械Core：200→validator→304、解析/写库失败不推进、配置切换/补采绕过旧validator、重定向安全、失败退避/恢复、并发单次提交/唯一锁、无AI调用、原评分反例。
- 再验收运营：忽略后立即退出且刷新/重启不恢复；跨进程快照一致；资格不会假合格；启停/归档有同事务审计；质量未知不显示通过，候选未经确认不能采集。
- 检查：focused tests、npm run typecheck、npm run build、完整采集回归、git diff --check；开发库真实验证后再生产小范围验证。部署限CPU50%/512M、有限并发、单timer。
- UI：在现有详情/列表增量展示，不重排已确认PC布局；实际数据体验后由用户明确确认，再标USER_APPROVED。
- Rollback：独立release保留旧Web/采集包；新增元数据可忽略，validator失效可回到无条件请求；候选表不破坏既有业务表，不自动删除。生产DDL通过专用迁移账号与备份Gate，不用App Role/postgres绕过。
- Owner：规则最终归COLLECTION_ARCHITECTURE_CONTRACT；代码归既有collector/router/governance/source-management/snapshot；本条仅设计与任务进度，不复制事实owner。
- 推荐实施顺序：运营一致性→条件请求/退避→统一出口/按需正文→质量与分类解释→候选来源。每步单独可验证，使用当前会话顺序执行；未确认设计前不实施。

## CURRENT CLOSE — 尚未完成的生产验收

- 当前部署与能力缺口唯一见 `docs/CURRENT_SYSTEM_FACTS.md` §7B；已完成迁移、切换、补采的执行过程退出当前计划，不再保留旧阻塞或重复部署说明。
- [ ] 连续72小时观察：记录各来源失败/恢复、周期耗时/资源峰值、快照时效与缺口；不得用五次短时回放代替稳定性。
- [ ] BAIR及其他海外公共Feed逐项核验主/备用出口；区分当前健康、资格和实际路由。
- [ ] Deno Secret环境范围收窄与承载可迁移性复核；不向Relay传数据库配置。
- [ ] 已上线来源管理/热点追踪登录后真实体验审核；当前仅IMPLEMENTED / USER_REVIEW_PENDING。

## GOVERNANCE-FACTS-20261015 — 本轮治理

- Goal / Role / Surface：为管理员确定来源管理→热点追踪事实，清除重复描述与脚本入口，收敛后续可行性方案。
- Boundary：只治理当前文档、重复命令与回归编排；不修改业务行为、UI、Schema、生产来源或数据，不执行生产部署。
- Responsibility：Core保持现状；AI/Skill仅辅助核对；Human负责后续设计及可视化审核。
- Recommendation：保留唯一SYSTEM主链，分阶段实施上方设计；不以重建采集系统解决缓存、出口和质量诊断缺口。
- Validation：入口治理、采集单主链/架构/边界检查、文档引用与diff检查；入口治理、单主链、架构、发现边界检查、typecheck、production build、current owner链接与diff检查均PASS。首次构建沙箱目录EPERM，按原命令解除限制后通过；未重新跑真实生产采集或完整52项回归。
- Acceptance：当前事实与待实施设计可区分；无重复回归执行入口；旧开发故障与旧Web描述不再充当当前阻塞。
- Rollback / Owner：仅回退本轮文档及编排补丁；事实归CURRENT_SYSTEM_FACTS，代码映射归COLLECTION_IMPLEMENTATION_MAPPING，计划归本文件。

# NEXT — HUMAN ACCEPTANCE

- /admin/sources：确认发现渠道、来源目录、DailyHot Source detail、筛选职责是否清晰。
- /admin/intelligence：确认最近 7 天 Event 按日期折叠完整展示、摘要≤100字、加载更多可继续读取历史；热点参与者按机构/账号去重并 72h half-life；无同 cohort 历史时不展示趋势线；精选与热点评分分离。
- 用真实 7–14 天 Event 做 Precision / Recall 人工样本审计；只有证据支持时再调整 FEATURED / TOP_PICK / Momentum 阈值。
- Human Acceptance 后再决定 BILIBILI / DOUYIN / YOUTUBE 是否值得补真实 Source / Route。

# BACKLOG

- AI HOT 继续保持一个 Source Identity；若未来增加备用 Route，REST 为 primary、RSS 仅 fallback，不并行重复采集；不得把 AI HOT 聚合结果当独立 Fact Source。
- Creator / 评论需求 / 平台互动只作 Signal / Practical Evidence，不取得 Fact Authority。
- Content Workbench 继续只消费 Adopted Event / Evidence，不承担上游 Source 或热点修复。
