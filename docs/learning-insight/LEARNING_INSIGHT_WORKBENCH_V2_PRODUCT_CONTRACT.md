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
→ Before / After Course Preview
→ Human Confirmation
→ Course Maintenance DRAFT
→ Existing Review / Publish Flow
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

> 用确定性代码发现和整理真实学习问题，让 Human 基于证据决定是否交给 AI；AI 只在获得授权后诊断问题、列出涉及课程并生成具体修改 Proposal；最终修改只能进入现有 Course Maintenance DRAFT，经 Human 审核后发布。

完整主链：

```text
LEARNING DATA
→ DETERMINISTIC ISSUE DETECTION
→ COURSE AGGREGATION
→ COURSE HEALTH QUEUE
→ HUMAN GATE 1
→ AI TASK A: WHOLE-COURSE DIAGNOSIS
→ HUMAN GATE 2
→ AI TASK B: GENERATE COURSE CHANGE PROPOSAL
→ DETERMINISTIC PATCH VALIDATION
→ BEFORE / AFTER COURSE PREVIEW
→ HUMAN GATE 3
→ APPLY ACCEPTED PATCHES TO COURSE MAINTENANCE DRAFT
→ EXISTING COURSE REVIEW / PUBLISH
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
- 写入 Course Maintenance DRAFT；
- 审计与版本冲突保护。

AI 不负责判断“有没有达到阈值”。

### 3.2 Human 负责的授权

Human 拥有三次明确 Gate：

**Human Gate 1 — 是否值得 AI 分析**

可选：
- 交给 AI 分析
- 继续观察
- 无需处理

只有“交给 AI 分析”才允许调用 Task A。

**Human Gate 2 — 允许 AI 修改哪些课程**

Task A 可以列出多门可能相关课程，但 AI 不拥有课程修改范围。

Human 必须明确选择：
- 允许生成修改方案的课程；
- 只检查、不允许修改的课程；
- 不相关课程。

只有被 Human 勾选的课程才能进入 Task B。

**Human Gate 3 — 采纳哪些具体修改**

Task B 生成 Patch 后，Human 对每项 Patch 逐项：
- 采纳
- 不采纳

只有采纳项可写入 Course Maintenance DRAFT。

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

固定硬边界：学习洞察 AI **不得直接提交审核或发布**；所有采纳结果只能先进入现有 Course Maintenance DRAFT。

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
   - 学习反馈唯一 owner 为课程级 `learningFeedback` 全量记录；顶部“累计反馈”和 02“学习反馈”必须使用同一个课程级口径；默认展示前 5 条，超过 5 条只允许“查看全部 / 收起”；
   - 学习行为固定由现有稳定数据 owner 聚合 6 项：进入学习（lessonProgress）、完成课程（lessonProgress COMPLETED）、检查重试（lessonCheckResponses attempts）、实操参与（practiceSubmissions）、实操重试（practiceSubmissions attempt > 1）、AI 实操证据（real_ai_evidence_recorded）；
   - 内容治理项只保留在 01 问题汇总统计中，不通过点击切换 02，也不得被解释为学员反馈证据。

4. **趋势与持续性**
   - 只展示当前真实可计算的 first_seen / last_seen / recent_7d / recent_30d / duration；
   - 当前数据不支持的趋势字段显示 unavailable 或不展示；
   - 不做未来趋势预测。

5. **AI 综合分析**
   - Human Gate 1 后才能运行；
   - 一次分析整门课程的全部授权问题；
   - 必须读取完整 Step 1～6、累计问题、时间线、Evidence，以及可用的相邻课程上下文。

6. **课程修改建议**
   - AI 先判断整门课程的学习目标、知识顺序、六步结构、检查理解、实操与能力获得是否需要调整；
   - 明确哪些 Step 建议修改、哪些 Step 保持不变；
   - 不允许“问题 1 改一句、问题 2 再改一句”的碎片化处理。

7. **改前 / 改后预览**
   - 复用现有 Course Maintenance / Course Preview Runtime；
   - 左侧为当前正式版；
   - 右侧为 Course Change Proposal 形成的建议版；
   - Step 1～6 完整展示；
   - 只高亮真实发生变化的字段；
   - Preview 不等于写入正式课程。

8. **Human 决策**
   - 返回调整方案；
   - 保存修改草稿；
   - 发起课程更新。

其中“发起课程更新”只进入现有 Course Maintenance DRAFT，不自动提交审核、不自动发布。

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
→ COURSE_SCOPE_CONFIRMED
→ CHANGE_PROPOSAL_READY
→ DRAFT_APPLIED
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
- “DRAFT_APPLIED”必须已成功写入 Course Maintenance DRAFT。

## 7. Course Change Proposal 与 Preview 边界

Learning Insight 负责形成 **Course Change Proposal**，不负责拥有正式课程修改状态。

固定职责：

```text
Learning Insight
→ 发现问题
→ 聚合课程健康事实
→ 整课 AI 诊断
→ 生成 Course Change Proposal
→ 生成 Before / After Preview
→ Human 确认

Course Maintenance
→ 接收确认后的 Proposal
→ DRAFT
→ 保存
→ 提交审核
→ 审核
→ 发布
```

Preview 必须复用现有课程维护的真实 Snapshot / Runtime Presentation，不创建第二套课程预览模型。

Before / After 的两个版本必须来自：
- Before：当前正式 AdminCourseSnapshot；
- After：在内存或 Proposal 层对当前 Snapshot 应用通过 Validator 的候选 Patch。

禁止：
- AI 自己构造一个“完整新课程”作为 After；
- Preview 使用与 Course Maintenance 不同的字段模型；
- Learning Insight 直接改正式版本；
- “保存修改草稿”绕过 Course Maintenance Candidate。

## 8. Course Maintenance 接入规则

学习洞察不创建第二套课程编辑器。

最终落点固定为现有 Course Maintenance：

```text
accepted patches
→ existing AdminCourseSnapshot
→ existing DRAFT Candidate
→ 保存草稿
→ 提交审核
→ 审核通过并上线
```

边界：
- 一门课程同时只允许一个活动 DRAFT / REVIEW；
- 已有活动 Candidate 时不得静默合并新的 Learning Issue；
- 必须提示 Human 先处理已有草稿；
- AI Patch 不允许直接写正式版本；
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

- 只有 Human Gate 1 后才调用 Task A；
- 只有 Human Gate 2 后才调用 Task B；
- Task B 每次只处理一门课程；
- 多课程由 Orchestrator 按 Human 选择逐课程调用；
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
- AI 自动发布；
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
5. 02 真实数据固定为课程级学习反馈 / 学习行为，不能由 01 某一问题类型切换；
6. 顶部累计反馈与 02 学习反馈必须使用同一课程级 `learningFeedback` owner；
7. 风险等级和排序完全由确定性 Code 计算，AI 不参与；
8. Human Gate 1 前没有 AI 调用；
9. Task A 一次读取完整课程 + 当前累计问题 + 时间线 + 可用行为数据，并从整课角度诊断；
10. Task A 明确哪些 Step 建议修改、哪些 Step 保持不变，并考虑前后课程衔接；
11. Human Gate 2 可以限制 AI 只对指定课程生成 Course Change Proposal；
12. Task B 输出具体 current_value → proposed_value，而不是“优化一下”；
13. Validator 能拒绝越权课程、非法 path、伪造 evidence_ref、过期 baseline；
14. Before / After Preview 使用同一 AdminCourseSnapshot / Course Maintenance Preview 能力完整展示 Step 1～6；
15. Human 可以返回调整方案、保存修改草稿或发起课程更新；
16. “发起课程更新”只进入 Course Maintenance DRAFT，不自动 submit review、不直接 publish；
17. 正式课程仍必须经过现有审核发布链；
18. 当前不存在的数据明确 unavailable，不允许 UI 或 AI 补造；
19. 全流程无内部英文状态、数据库 ID、内部文件路径暴露给管理员。
