# Learning Insight Workbench V2.1 Product Contract

Status: **ACTIVE / CURRENT OWNER**

本文件是学习洞察 V2 的产品流程唯一 owner。AI Prompt、结构化输出、确定性校验分别由同目录另外三份 contract 管理。它不属于 Course Builder Workflow，不改变课程生产规则。

## V2.1 Product Direction — Learning Insight

学习洞察 V2.1 的产品定位固定为 **学习洞察（Learning Insight）**，不是问题工单中心；Course Health 只作为底层课程健康聚合模型，不作为产品名称。

历史 Issue First 模型只属于底层采集与 Evidence 记录，不作为管理员主要工作入口。课程才是最终治理、诊断和修改单位。

固定模型：

```text
Learning Data / Feedback / Check / Practice / Event / Trusted Content Evidence
→ Learning Issues
→ Course Aggregation
→ Course Health
→ Course-level Human Review
→ Whole-course AI Diagnosis
→ Course Change Proposal
→ Student-facing Before / After Preview
→ Human Edit + Final Confirmation
→ Direct Formal Course Publish
→ Course Maintenance Version History
```

管理员首先回答四个问题：
- 哪些课程长期积累问题；
- 问题从什么时候开始、最近是否仍在发生；
- 哪些课程问题增长更快、影响更大；
- 哪些课程值得优先进入整课诊断与维护。

点击课程后，再查看该课程下的全部问题分类、时间维度、Evidence、趋势和 AI 综合诊断。

禁止：
- 以全部 Issue 平铺作为主要运营界面；
- 把 Learning Insight 做成客服工单系统；
- 单个 Issue 直接驱动课程修改；
- 一个问题调用一次 AI 并直接改一个字段；
- AI 基于单个问题生成正式课程更新。

## 1. 产品目标

学习洞察不是 BI 大盘，也不是 AI 自动改课系统。

唯一目标：

> 用确定性代码发现和整理真实学习问题，让 Human 基于证据决定是否交给 AI；AI 在一次“AI分析”动作中完成整课诊断与具体修改 Proposal；Human 必须在真实学员界面对比预览中审核并可再次修改细节，最终确认后由 Core 直接发布新的正式课程版本，并在课程维护留下可追溯历史记录。

完整主链：

```text
LEARNING DATA
→ DETERMINISTIC ISSUE DETECTION
→ COURSE AGGREGATION
→ COURSE HEALTH QUEUE
→ HUMAN GATE 1
→ AI TASK A: WHOLE-COURSE DIAGNOSIS
→ AI TASK B: GENERATE COURSE CHANGE PROPOSAL
→ DETERMINISTIC PATCH VALIDATION
→ STUDENT-FACING BEFORE / AFTER PREVIEW
→ HUMAN FINAL EDIT + CONFIRMATION
→ DETERMINISTIC FINAL VALIDATION
→ DIRECT FORMAL COURSE PUBLISH
→ COURSE MAINTENANCE VERSION HISTORY
```

## 2. 业务主对象：Course + Learning Issue

V2 的运营主对象为 Course，Learning Issue 作为课程质量证据和问题状态流对象。

页面和运营入口以课程聚合展示，Issue 用于解释课程为什么需要处理。

以下不再作为独立业务链：
- “质量风险”
- “错误 / 过时风险”
- “课程更新候选”

它们统一成为 Learning Issue 的问题类型或处理阶段。

允许的问题类型：

- 理解困难
- 不知道怎么做
- 检查理解异常
- 实操困难
- 帮助度低
- 内容疑似错误
- 内容待更新核查
- 其它待人工判断

内部可以保留英文 enum，但管理后台必须展示中文产品语言。

### 2.1 Learning Issue Source Matrix（当前真实数据）

Learning Insight 是消费其它系统事实的分析层，不自行创造底层数据。任何问题类型进入 Workbench 前，都必须能追溯到当前已存在的数据 owner。

当前固定矩阵：

| 问题类型 | 当前真实数据入口 | 当前状态 |
| --- | --- | --- |
| 检查理解异常 | Step 3 Check `lessonCheckResponses`；至少 10 位独立学员且错误率 ≥ 35% | 已实现 / 自动聚合 |
| 实操困难 | Step 4 `practiceSubmissions`；至少 10 位独立学员且首次通过率 < 50% | 已实现 / 自动聚合 |
| 提示依赖高 | `hint_revealed` Learning Event + Practice 用户；至少 10 位独立学员且提示使用率 ≥ 50% | 已实现 / 自动聚合 |
| 帮助度低 | `LESSON_HELPFULNESS`；至少 10 位独立学员且“不太有帮助”比例 ≥ 25% | 已实现 / 自动聚合 |
| 理解困难 | `still_confused` 事件或明确学习反馈 | 已有事件采集能力，但当前尚未形成确定性聚合规则 |
| 不知道怎么做 | 明确学习反馈 | 当前仅历史/帮助链可产生，不作为自动行为结论 |
| 内容疑似错误 | 管理员、知识更新、内容采集或可信来源冲突 | 当前尚无统一自动入口；不得由学习行为推断 |
| 内容待更新核查（内部可映射 CONTENT_OUTDATED） | 知识库更新、官方资料、内容采集、管理员核查 | 当前尚无统一自动入口；学员反馈不得直接生成该类型 |
| 其它待人工判断 | 已有明确 Evidence、但不满足上述固定类型 | 仅 Human 可确认 |

硬边界：
- “当前尚无统一自动入口”不等于让 AI 补数据；该类型只有在真实来源接入后才能自动出现。
- 学员可以反馈“没看懂 / 不会做 / 评分疑问 / 其它学习问题”，但不能直接把课程标记为“内容过时”或“内容错误”。
- AI 不允许根据模型常识自行声明课程内容已经过时；必须存在可信新来源或管理员提供的 Evidence。
- `still_confused` 当前只算“已采集未聚合”，在确定性阈值规则落地前不得声称系统已自动生成“理解困难”。
- 新增任何 Learning Issue 类型前，必须先写清数据 owner、产生规则、时间字段和去重/聚合规则。

### 2.2 数据可用性原则

每个界面字段和 AI 输入字段必须满足：
1. 当前数据库 / Registry / Snapshot / Event 中真实存在；
2. 能说明数据 owner；
3. 能说明发生时间或快照版本；
4. 能区分“事实 / 规则计算 / AI 判断”；
5. 缺失时返回 unavailable / insufficient evidence，不允许 AI 补造。

管理后台展示固定补充规则：
- 面向运营人员的文案必须翻译为中文业务语言，不直接展示内部 enum、Evidence Set、Schema、数据库字段、文件路径或系统文件名；
- “可用于 AI 判断 / 已过滤”的数量必须来自当前 Course 的 Effective Evidence 治理结果，不允许写死；
- Human Review / Simulation / Acceptance 数据必须在界面明确标注为“审核样例”，不得让运营人员误认为真实学员数据；
- 学习反馈默认展示 5 条，只有超过 5 条时才提供“查看更多 / 收起”；标题使用反馈含义，不使用“学习反馈 #1”这类内部编号；
- 学习行为说明必须直接解释“已达到统计条件、可用于判断课程问题”，不得要求运营人员理解 Effective Evidence Set 等内部术语。
- 「真实数据」面板不展示 AI 输入条数、排除条数、Evidence 治理等系统内部判断；这些信息只保留在系统内部与审计链路中。
- 「真实数据」内容区左右内边距必须与 01、03 面板一致，不允许学习反馈或学习行为内容直接贴边。
- 「数据说明」必须可解释“这些数字从哪里来”：正式环境说明真实学习数据来源；审核模式说明为本地审核样例；排除项按人话展示原因和数量。
- 学习反馈正文优先展示学员原话；人数、原因、时间、是否用于判断均为次级信息，不得抢占正文视觉。
- 学习行为每张卡只回答“哪里发生了什么 / 数值多少 / 涉及多少学员”；阈值、内部事件名、Evidence 归属等治理信息不进入主卡片。
- 切换「学习反馈 / 学习行为」不得触发重新 AI 分析或改变任何业务状态；「查看更多」和「数据说明」均只影响本地展示状态。

### 2.3 Learning Issue 时间模型

每一个进入学习洞察的 Learning Issue 必须能够表达时间维度。最小字段：

```text
first_seen_at
last_seen_at
occurrence_count
```

如果来源本身支持事件级时间，还可以确定性计算：

```text
recent_7d_count
recent_30d_count
duration_days
```

规则：
- `first_seen_at` 取该聚合问题最早真实 Evidence 时间；
- `last_seen_at` 取最近真实 Evidence 时间；
- `duration_days` 由 Code 根据 first / last 计算；
- 近 7 天 / 30 天只统计真实发生记录；
- 没有历史事件明细时不得伪造趋势；
- 单次问题和持续问题必须在 UI 上可区分。

时间维度只描述历史事实，不做未来预测。

### 2.4 Course Health 风险排序

课程风险与排序必须由确定性 Code 计算，AI 不参与排序。

可使用的风险因子仅限当前真实可计算数据：

```text
问题数量
+ 问题近期增长
+ 至少影响人数
+ 问题持续时间
+ 问题类型权重
+ 已存在的学习行为指标
```

其中任何数据当前不可用时，该因子必须标记 unavailable 并退出本次计算，不能用默认假值补齐。

V2.1 产品层只固定三档：

```text
NORMAL       正常
WATCH        关注
ATTENTION    需要检查
```

初始确定性规则采用可解释阈值，不采用黑箱综合分。当前颜色只由“仍未处理的问题”驱动：未处理问题 ≥ 10 → ATTENTION（红色）；未处理问题 5～9 → WATCH（黄色）；未处理问题 0～4 → NORMAL（绿色）。Visual Review 绿色样本固定使用 ≤1，避免测试数据掩盖阈值边界。已经 REVIEWED / DISMISSED 的历史问题不继续抬高课程颜色；问题类型本身不得绕过数量阈值直接改变颜色。

风险排序原则：
1. 颜色权重固定为 ATTENTION（红） > WATCH（黄） > NORMAL（绿）；
2. 同颜色内，只按 oldest_open_issue_at 升序排列，即最早出现且仍未处理的问题越久，课程越靠前；
3. 未处理时间完全相同，仅按 course_key 做稳定排序；该兜底不代表问题数量、影响人数或其它业务权重；
4. open_issue_count / affected_user_count 不得参与同颜色默认排序；
5. 最近更新时间不得覆盖“长期未处理优先”；
6. 任何规则变更必须进入 Deterministic Validator Contract，不允许只改 UI 文案。

### 2.6 问题处理周期（Issue Cycle）

课程风险只计算**当前处理周期仍未处理的问题**，不得把历史问题永久累计为风险。

- Human 选择“无需处理”后，本周期进入 `DISMISSED`；
- Human 选择“继续观察”后，本周期进入 `WATCHING`；
- 课程修改正式发布后，本周期进入 `REVIEWED`；
- `WATCHING / DISMISSED / REVIEWED` 均退出 `open_issue_count`，因此不会继续把课程抬高为黄/红；
- 学员反馈类问题从处理时刻建立新基线，之后新增 **3 位独立学员**触发下一周期；
- 学习行为类问题从处理时刻保存样本基线，之后新增 **10 位样本**触发下一周期；
- 下一周期开启时 `cycleNumber + 1`，并以新周期 `openedAt` 参与“同色最久未处理优先”；
- 历史 `createdAt`、累计反馈、上一周期样本量继续保留用于追溯，但不得作为当前周期风险数量。

因此“继续观察”不是把问题无限留在 OPEN；它是一个已有人处理决定、等待新增证据达到重新打开条件的旁路状态。

## 3. Code / Human / AI 分工

### 3.1 Code 负责的确定性工作

以下工作一律使用机械代码，不调用 AI：

- 学习行为采集；
- Feedback / Check / Practice / Event 聚合；
- 独立用户数；
- 错误率；
- 首次通过率；
- 重试人数；
- 提示使用次数；
- “仍然不懂”次数；
- 阈值判断；
- 问题类型映射；
- 同类问题去重与合并；
- 课程 identity 映射；
- 优先级排序；
- 分页、搜索、筛选；
- 状态流转；
- Evidence Reference 编号；
- AI 输入组装；
- AI 输出 Schema 校验；
- Patch path / baseline / scope 校验；
- 生成真实学员界面 Before / After Preview；
- 对 Human 最终编辑后的文本重新做 path / baseline / structure 校验；
- Human 最终确认后发布正式课程版本；
- 写入 Course Maintenance 历史记录，调整原因固定为“课程反馈更新”；
- 审计与版本冲突保护。

AI 不负责判断“有没有达到阈值”。

### 3.2 Human 负责的授权

Human 只保留两次明确 Gate，不再要求 AI 诊断后再做一次“是否生成修正方案”的二次判断。

**Human Gate 1 — 是否值得 AI 分析**

可选：
- AI分析
- 继续观察
- 无需处理
- 人工修正

只有“AI分析”才允许运行 AI Orchestrator。一次点击后，系统内部可连续执行 Task A → Task B；管理员不再额外点击“生成具体修正方案”。

**Human Final Gate — 是否发布这次最终修改**

Task A / Task B 完成后必须弹出真实学员界面对比：
- 左侧：当前正式课程；
- 右侧：建议修改后的课程；
- AI 改动位置必须明确标注；
- Human 可以在右侧直接修改 AI 生成的文字细节；
- Human 可以取消，不产生正式课程变化；
- Human 点击“确认并发布”后，Core 才允许直接发布新的正式课程版本。

该 Final Gate 同时取代历史 Human Gate 2 / Gate 3 与 Course Maintenance 二次提交审核。

### 3.3 AI 只负责两类语义工作

**Task A — Whole-course Diagnosis**

负责：
- 理解证据；
- 判断根因；
- 区分本课 / 前置课 / 后续课问题；
- 列出可能相关课程；
- 指出可能需要修改的 Step / 字段；
- 在证据不足时明确“继续观察”。

不负责：
- 直接改课程；
- 决定最终课程范围；
- 创建 Candidate；
- 提交审核；
- 发布。

**Task B — Course Change Generator**

负责：
- 针对 Human 已批准的单一课程；
- 根据已确认问题和证据；
- 生成具体、可验证的文本替换 Patch。

不负责：
- 修改未授权课程；
- 改变课程结构；
- 改业务状态；
- 发布。

固定硬边界：AI **永远不得自己发布课程**。只有 Human 在真实学员界面对比预览完成最终确认后，Core 才能执行正式发布；不再要求先进入 Course Maintenance DRAFT 做第二次人工提交。

## 4. Workbench V2.1 信息架构

页面采用固定双栏。管理员运营入口固定为 **Course First / Course Health First**。

### 4.1 左栏：课程健康队列

每一行只代表一门课程，而不是一个 Issue。

当前必显字段：
- 课程名称；
- 当前未处理问题数；
- 最老未处理问题时间；
- 风险等级；
- 学员影响（仅有真实学习侧数据时显示）。

在真实数据 owner 已存在时可增加：
- 当前正式版本；
- 首次问题时间；
- 持续时间；
- 近 7 天 / 30 天问题数量；
- 学员影响人数（仅学习问题；内容治理项不得伪造学员影响）；
- 学习人数；
- 完成率。

这些可选字段不得因为界面需要而预造。

排序由确定性 Code 完成，不允许 AI 排序。

当前交互只保留：
- 搜索课程；
- 风险筛选：全部风险 / 需要检查 / 关注 / 正常；
- 分页（课程数超过单页阈值时才显示）。

问题类型筛选、AI 状态筛选和用户侧排序控件退出当前 V2.1。默认排序固定由确定性代码执行“红 > 黄 > 绿；同色按 oldest_open_issue_at”，不允许 UI 覆盖。

默认目标不是“处理一条反馈”，而是快速找出最值得治理的课程。

### 4.2 右栏：课程健康详情

点击左侧课程后，右侧展示整门课程的健康详情，不直接进入单个问题详情。

固定分区：

1. **课程概况**
   - 课程名称；
   - 累计反馈：仅统计课程级 `learningFeedback` 全量真实反馈；
   - 学员影响：只使用当前可确认的学习侧影响人数；
   - 处理次数：使用正式课程 `lessons.version`，固定为 `max(0, version - 1)`，只统计已经正式发布完成的课程更新。

当前没有稳定 owner 的上线时间、学习人数、完成率、近 7/30 天趋势不进入顶部概况。

2. **问题汇总**
   - 按问题类型聚合，只做课程级统计，不作为筛选器，也不保存问题选中状态；
   - 每类显示问题类型、次数、首次出现、最近出现、学员影响；
   - 学习问题可以显示真实“学员影响”；内容待更新核查 / 内容疑似错误属于治理项，学员影响显示 unavailable / —；
   - 问题行不可点击，不存在选中态，只承担统计职责。

3. **真实数据**
   - 02 固定为当前课程级真实数据，不依赖 01 中任何问题分类或 Issue 选择；
   - 只提供“学习反馈 / 学习行为”两个互斥视图按钮，不提供“全部 / Check / Practice / Event”筛选器；
   - 02 的唯一事实入口为 PRODUCTION `buildEffectiveLearningEvidenceSet(courseKey)`；但 Evidence Set、排除数量、排除原因等系统治理信息不进入运营主界面；
   - 顶部“累计反馈”继续表示课程收到的全部课程级反馈总量；02 表示治理后的可展示学习反馈与学习行为，两者不要求数量相等；
   - 学习反馈只展示进入 Effective Evidence Set 的 LEARNER_FEEDBACK / HELPFULNESS / TRUSTED_REVIEW_FEEDBACK；
   - 学习行为只展示进入 Effective Evidence Set 的 CHECK / PRACTICE / LEARNING_EVENT；被排除或样本不足的数据不得混入 AI 可用列表；
   - 内容治理项只保留在 01 问题汇总统计中，不通过点击切换 02，也不得被解释为学员反馈证据。

4. **趋势与持续性**
   - 只展示当前真实可计算的 first_seen / last_seen / recent_7d / recent_30d / duration；
   - 当前数据不支持的趋势字段显示 unavailable 或不展示；
   - 不做未来趋势预测。

5. **AI 综合分析**
   - Human Gate 1 后才能运行；
   - 一次分析整门课程的全部授权问题；
   - 必须读取完整 Step 1～6、累计问题、时间线、Evidence，以及可用的相邻课程上下文。
   - 运营展示固定为“整课判断 → 核心原因 → 课程判断 → 建议关注范围”，不得把模型内部结构直接平铺到页面。
   - 核心原因以短标签 + 一句人话解释呈现；证据引用默认收起，按“查看依据”展开，不得阻碍主文阅读。
   - 建议关注范围必须优先显示具体 Step、具体问题和“建议调整”，内部字段名、文件路径、Schema、Evidence 编号不得进入主文。

6. **课程修改建议**
   - AI 先判断整门课程的学习目标、知识顺序、六步结构、检查理解、实操与能力获得是否需要调整；
   - 明确哪些 Step 建议修改、哪些 Step 保持不变；
   - 不允许“问题 1 改一句、问题 2 再改一句”的碎片化处理。

7. **课程更新审核界面**
   - 不再采用“修改前 / 修改后”双 Runtime 对照；
   - 直接复用课程维护中的「课程预览」版式，Step 1～6 全部展开；
   - 页面只保留一份应用 Proposal 后的课程预览；
   - 顶部固定显示 6 个 Step，并在每个 Step 上显示本步修改数量；点击后滚动到该 Step 第一处修改；
   - 右侧固定为“本步修改”列表，每一项必须拥有精确定位文案，至少能说明“第几步 / 哪个现有内容块 / 哪一题或哪一项”；
   - 每一处修改必须直接标记在课程原位，并显示修改编号；点击右侧修改项必须自动滚动到课程中的对应位置并高亮；
   - 每项修改右侧固定同时显示原文与修改后内容，不再折叠原文；
   - AI 修改字段保持原位标注，并可通过右侧查看原文、修改后内容与再次人工调整；
   - 除 AI 已修改字段外，课程预览中课程维护允许编辑的现有文本字段全部开放 Human 直接编辑；Human 编辑范围与 AI mutable path 严格分离；
   - Human 在课程预览中直接修改后，右侧必须新增对应“人工修改”记录，同时显示原文与修改后内容；
   - 人工修改记录默认完整展开原文与修改后内容，不要求再次点击展开；
   - 当前 Step 的修改记录不设 5 条或其它展示上限，必须全部进入右侧列表；超出可视高度时使用右侧独立滚动条浏览；
   - 页面支持保存本机草稿，关闭后可恢复继续审核；发布仍必须经过正式 Validator；
   - Human 直接编辑仍只能修改课程维护已有字段值，不允许新增 / 删除 Step、卡片、题目、实操字段或改变数组结构；发布前必须重新经过结构与安全 Validator。
   - 课程标题、副标题、顶部学习目标、六步步骤名称、步骤卡片、步骤顺序、步骤数量均不可进入 AI mutable path；
   - AI 只允许修复已经存在且被证据支持的课程正文问题，不允许通过新增字段、增加说明区、增加卡片或扩写课程来“解决问题”。
   - Task B 必须遵守 Six-Step Semantic Contract：先判断问题属于哪一步的教学职责，再选择该步中最小充分的现有字段进行替换；跨 Step 或与该 Step 教学职责不匹配的修改必须拒绝。

8. **Human 最终确认**
   - 取消：不改变正式课程；
   - 确认并发布：对 Human 最终编辑值重新校验后，直接生成新的正式课程版本；
   - 发布按钮固定在更新对照界面内，不要求跳出当前对照界面；
   - 发布成功后刷新正式 Runtime；
   - Course Maintenance 只留下历史更新记录，调整原因固定为“课程反馈更新”；
   - 不再要求管理员跳转课程维护再次保存 / 提交 / 审核。

### 4.3 AI 整课诊断原则

AI Task A 的分析对象固定为课程，而不是 Issue。

AI 必须从以下五个角度重新审视整门课程：
- 学习目标；
- 知识顺序；
- 六步结构；
- 检查理解设计；
- 实操与能力获得。

并结合：
- 当前完整课程；
- 当前课程累计问题；
- 问题时间线；
- 当前可用学习行为数据；
- 前置 / 后续课程上下文。

输出必须明确区分：
- 核心问题；
- 建议修改范围；
- 保持不变范围；
- 需要人工结构调整的部分；
- 证据不足、继续观察的部分。

## 5. 真实证据边界

证据必须来自真实系统数据，至少可包含：

- 学员 Feedback；
- Step 3 Check；
- Step 4 Practice；
- Learning Event；
- 已批准知识来源；
- 需要核查的外部来源。

管理员界面不得展示：
- userId；
- 邮箱；
- 数据库内部 ID；
- 内部文件路径；
- sourceKnowledgeId 等开发字段。

引用必须显示为 Human 可理解的 Evidence Reference，例如：

```text
反馈 #1
检查理解 · 第 2 题
实操 · Step 4
知识库 ·《RAG 使用边界》
外部资料 · OpenAI 官方文档
```

AI 所有判断必须引用输入中存在的 evidence_ref。

## 6. 状态模型

Learning Issue V2 产品状态固定为：

```text
DETECTED
→ HUMAN_REVIEW
→ AI_DIAGNOSED
→ CHANGE_PROPOSAL_READY
→ PREVIEW_READY
→ HUMAN_CONFIRMED
→ PUBLISHED
→ RESOLVED
```

旁路状态：

```text
WATCHING
DISMISSED
AI_FAILED
VALIDATION_FAILED
```

说明：
- 状态只能由 Core Code 按已发生事实写入；
- AI 不返回或控制数据库状态；
- “AI_DIAGNOSED”必须有通过校验的 Task A 输出；
- “CHANGE_PROPOSAL_READY”必须有通过校验的 Task B 输出；
- “PREVIEW_READY”必须由真实当前 Snapshot + validated Patch 生成；
- “HUMAN_CONFIRMED”必须保存 Human 最终编辑结果与确认审计；
- “PUBLISHED”必须已经由 Core 成功写入正式课程版本并留下 Course Maintenance 历史记录。
- `WATCHING / DISMISSED / REVIEWED` 必须同时建立 Issue Cycle 新基线；后续证据只按新基线后的新增样本判断是否重新进入 OPEN。

## 7. Course Change Proposal、Preview 与发布边界

Learning Insight 负责形成 **Course Change Proposal** 并承载最终 Human Review；正式课程发布仍由 Core Code 执行。

固定职责：

```text
Learning Insight
→ 发现问题
→ Effective Evidence Set
→ 整课 AI 诊断
→ 生成 Course Change Proposal
→ 真实学员 Runtime Before / After Preview
→ Human 再编辑
→ Human 最终确认
→ Core 发布正式课程版本
→ Course Maintenance 留历史记录
```

Preview 必须复用学员正式课程的真实 Snapshot / Runtime Presentation，不创建第二套课程预览模型。

Before / After：
- Before：当前正式 AdminCourseSnapshot；
- After：在内存中对同一 Snapshot 应用通过 Validator 的 AI Patch + Human 最终编辑值；
- 两侧必须使用同一学员 Runtime renderer；
- AI 修改字段在 After 中必须可识别标注；
- Human 只能编辑允许的字符串叶子值，不能自由输入 path。

禁止：
- AI 自己构造“完整新课程”；
- Preview 使用和学员端不同的课程模型；
- AI 自己执行 publish；
- Human 编辑绕过 mutable_path_catalog、baseline、structure fingerprint；
- 发布后不留历史版本。

## 8. Course Maintenance 接入规则

学习洞察不创建第二套课程编辑器，也不再把 AI 更新链强制送到 Course Maintenance DRAFT 做二次提交。

最终落点：

```text
validated AI patches
+ Human final text edits
→ current AdminCourseSnapshot
→ final deterministic validation
→ publish new formal lesson version
→ Course Maintenance PUBLISHED history record
```

历史记录固定要求：
- updateReason = “课程反馈更新”；
- 保留 Before / After Snapshot；
- 保留 Learning Insight / Task A / Task B / evidence refs / Human actor / 时间；
- 新版本出现在课程维护历史列表，可用于查看和恢复；
- 不额外生成需要再次提交的 DRAFT。

冲突保护：
- 若课程已有活动人工 DRAFT / REVIEW，直接发布必须 fail-closed 并提示先处理人工维护；
- 发布前必须重新核对当前正式 baseline；
- Course Builder Workflow 不参与本链。

## 9. V2.1 Patch 能力边界

V2.1 只支持**现有字符串叶子字段替换**。

允许：
- 标题 / 副标题文字；
- 六步已有文本字段；
- 已有卡片的 title / text；
- 已有 Check 的题干、选项 label、解释、反馈文案；
- 已有 Practice 的标题、目标、说明、提示、rubric 文案；
- Review / Capability 的已有文本字段。

V2.1 禁止 AI 自动：
- 新增 / 删除 Step；
- 改变六步顺序；
- 新增 / 删除卡片；
- 新增 / 删除题目；
- 新增 / 删除实操；
- 修改任何 ID；
- 修改 questionType；
- 修改 correctValues / correctAnswer；
- 修改 passScore / 分值；
- 修改权限 / 状态 /版本；
- 修改 Course Builder Workflow；
- 修改 Course Registry identity。

若问题需要结构变化，Task B 必须输出：
`REQUIRES_MANUAL_STRUCTURE_CHANGE`
并由 Human 另开明确开发任务。

## 10. AI 调用策略

- 只有 Human Gate 1 后才调用 AI Orchestrator；
- 单次“AI分析”内部允许连续执行 Task A → Task B，不再增加第二个用户按钮；
- Task B 只处理当前管理员正在处理的这一门课程；
- 若 Task A 判断当前课程不应修改、证据不足或需要结构变化，则不得强行生成文本 Patch；
- 模型通过 Provider Adapter / Model Gateway；
- 不在业务代码绑定厂商；
- Prompt 使用固定版本；
- 每次 AI Run 保留 prompt_version、output_schema_version、模型、时间、输入 evidence refs 和结果 hash。

## 11. 模拟数据边界

模拟数据只允许用于 Development Human Review。

必须：
- 明确标记“模拟测试”；
- 禁用会产生正式 Course Maintenance 动作的按钮；
- 可通过固定标识精准清理；
- 不进入 Production；
- 不进入正式学习统计；
- Human Review 完成后清理。

## 12. 非目标

V2.1 当前不做：
- 复杂 BI；
- 自动课程评分；
- AI 自动发现阈值；
- AI 自动选择最终课程；
- AI 无 Human 最终确认自动发布；
- AI 脱离现有 Snapshot 的整课自由重写；
- 第二套 Course Builder；
- 第二套 Course Maintenance；
- 未来趋势预测；
- 个体学员画像；
- 为了界面完整而新增没有真实 owner 的指标。

## 13. 产品验收标准

必须能完成以下真实流程：

1. 左侧一行只代表一门课程，不能回退为 Issue Queue；
2. 左侧只保留“搜索课程 + 风险筛选”，默认排序固定为红 > 黄 > 绿、同色按最老未处理时间；
3. 每门课程能看到当前未处理问题数、风险等级、最老未处理时间；有真实学习侧数据时显示学员影响；
4. 01 问题汇总只做静态课程级统计，不可点击；每类能看到次数、首次、最近、学员影响；
5. 02 真实数据固定读取 PRODUCTION Effective Evidence Set，不能由 01 某一问题类型切换；有效 / 仅供参考 / 排除原因必须与 AI 输入一致；
6. 顶部累计反馈表示原始反馈总量，02 表示治理后的有效证据，两者用途明确区分且不得伪造相同数量；
7. 风险等级和排序完全由确定性 Code 计算，AI 不参与；
8. Human Gate 1 前没有 AI 调用；
9. Task A 一次读取完整课程 + 当前累计问题 + 时间线 + 可用行为数据，并从整课角度诊断；
10. Task A 明确哪些 Step 建议修改、哪些 Step 保持不变，并考虑前后课程衔接；
11. 单次“AI分析”在 Task A 建议修改当前课程时自动进入 Task B，不再要求 Human 第二次点击生成修正方案；
12. Task B 输出具体 current_value → proposed_value，而不是“优化一下”；
13. Validator 能拒绝越权课程、非法 path、伪造 evidence_ref、过期 baseline；
14. Before / After Preview 必须使用学员正式 Runtime Presentation 完整展示 Step 1～6，左当前正式版、右建议版；
15. AI 修改字段必须有明显标注，Human 可以在右侧直接编辑文字细节；
16. Human 点击“确认并发布”后，Core 重新校验 baseline / path / structure，再直接发布正式课程新版本；
17. 课程维护自动留下 PUBLISHED 历史记录，调整原因固定为“课程反馈更新”，无需再次进入课程维护提交；
18. 有活动人工 DRAFT / REVIEW 时必须冲突退出，不允许静默覆盖；
19. 当前不存在的数据明确 unavailable，不允许 UI 或 AI 补造；
20. 全流程无内部英文状态、数据库 ID、内部文件路径暴露给管理员。
