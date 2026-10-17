# AIHOT 源码研究（2026-10-16）

状态：只读研究建议，不是产品合同、current facts 或实施授权。未运行外部代码、未测其生产系统。

研究快照：GitHub API HEAD 为 `c8704e5313e6b051560365226b3919d7e0ada5ea`。以下链接固定到此提交；读取 README、部署文档与实际源码，而非仅依据项目宣传。

## 已核查的实现

- **来源与产品定位**：示范配置含 18 个 RSS 来源（官方博客、媒体、个人），不是线上生产名单，也不是 arXiv/GitHub repository/HF model 全覆盖。实现支持 RSS、web list、JSON list、X、公众号及外部推送。该仓库是资讯选稿与发布引擎；本次检查未见 OPC 式练习生成、可复现步骤/输出验收及会员学习 Core。[示范配置](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/industry/sources.json)、[README](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/README.md)
- **采集与增量**：按 source due time 调度；URL identity 在详情抓取前去重；RSS validator 成功存储后才推进，支持 304；初始回填有界；失败退避最大六小时；provider 预算耗尽延迟 15 分钟且不增加来源失败次数；每日根据最近七天产出调整频率。普通抓取 worker 并发 8、X 并发 2。注意这些不是本项目应照搬的并发参数。[采集](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/sources/collect.ts)、[worker](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/jobs/sources.ts)
- **原发归属与独立参与者**：发现渠道不是发布者。T1 publisher 通过配置 URL origin/path scope 唯一匹配，含共享平台的 discovery 限制，避免将聚合站投稿人当作者。热度 participant 优先按 HN/DEV 作者、signal group、owner entity、source 折叠；同公司多个渠道不叠加。[归属](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/content/provenance.ts)、[热度 currentSignals](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/events/hot.ts#L115)
- **聚类**：article → fact（同一次发生）→ story（根事件及直接后续）；最近 14 天 title + 摘要前 300 字向量候选，未配置 embedding 时用字符 bigram 重合度；候选 top 10，最低 cosine 0.6；LLM 区分 SAME_OCCURRENCE / SAME_STORY / UNRELATED / ROUNDUP；低于 cosine 0.85 的合并再复核。发展只挂 story 根，综合稿不作桥接或创建事件，人工覆盖保留。源码注释写 second vendor，但实际通过 modelFor(groupReview) 选择，可配置同厂商，不能声称强制跨厂商。[group.ts](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/events/group.ts#L1)、[relate.ts](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/events/relate.ts#L191)
- **热度是代码计算**：48 小时窗口，每个 participant 取窗口内最近一次 source-time 信号，贡献 `0.5^(ageHours/24)`；至少 2 个参与者且至少 1 个 editorial participant。hot_signal 参与关注热度，但不单独构成 editorial fact；按 heat 排序前十。与六小时前比较时排除缺采/新增 source 导致的不可比 cohort；缺采按最近成功时间及至少 90 分钟/三周期宽限识别。6 小时内新增参与者 ≥3 且占比 ≥50% 标 surge；首次报道不足六小时标 new；比较增幅超过 15% 可标 rising。[hot.ts](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/events/hot.ts#L61)
- **AI 用途与选稿**：相关性预筛、同模型独立两次评分、结构提取、标题摘要/理解写作、翻译、归组/复核及综述。两次评分均值达到 tier 门槛（T1=60/T1_5=65/T2=76）只成为精选候选，之后还检查新闻身份与新增价值。两次调用是同模型相同输入，不是两个独立权威来源，不能消除共享偏差。热度/日报编排本身确定性；这也不等于 OPC 可让 AI 直接拥有正式状态。[analyze.ts](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/packages/backend/src/editorial/analyze.ts#L280)、[selection.ts](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/industry/selection.ts)
- **成本**：部署文档建议至少 2 核 4GB（构建）；Compose 包含 PostgreSQL、API、worker、SSR web，setup 结束退出。文档举例初始 152 条约 930 次模型调用，这是作者自述，不是本次复现。不能由此推断在 OPC 2核2G 共享宿主可增加整套服务。[deploy.md](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/docs/deploy.md#L5)、[compose](https://github.com/KKKKhazix/AIHOT/blob/c8704e5313e6b051560365226b3919d7e0ada5ea/docker-compose.yml)

## 对 OPC 的建议（待产品 owner 决策）

1. 保留唯一 SYSTEM runtime 和当前 source/acquisition route 分离，不安装第二套队列、数据库或资讯发布系统。RSS 条件请求、成功后推进 cursor、按有效产出和成本调频值得核查差额；正文退避等已有能力不应重复实现。
2. 优先统一 creator/owner/group 独立性与原发血缘。聚合转载数、同公司矩阵、平台排名不能作为多份独立事实；发现信号只扩大候选。
3. 本地已有 AIHOT heat shadow，48h/24h 可继续作为对照。不要凭远端规则直接替换本地正式 Event Momentum 算法；使用同一批已冻结 evidence、同一 cohort 对比漏报、虚假突增和迟到证据。
4. 资讯热度、事实可靠性与练习可用性分开。高热新闻不必然有可操作材料；低热但官方文档/仓库/示例完整的实践可进入材料候选。练习发现不得要求先有已分析且可练习的结果，最终练习仍按现有 validator/gate 收敛。
5. 若借鉴 LLM 归组，只适用于已有授权语义阶段及有界候选判断，Core 负责校验和状态；不能将其放入默认自动采集主链、绕过现有 Gate 或复活旧 Hotspot authority。

验证范围：只读源码研究；未验证外部接口在线可用性、生产来源数量、真实成本、模型质量或容量。
