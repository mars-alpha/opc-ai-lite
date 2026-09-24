# Track 02 Six-step Knowledge Point Audit v1

Status: **PASS / 15 KEEP / DIRECTORY_APPROVED_V1**
Task: **TRACK02-SIX-STEP-AUDIT-001 — Track 02 Fifteen-Lesson Knowledge Point Audit**

## 1. Audit rule

本审计只判断一个候选知识是否值得成为独立正式课程，不生成完整 Lesson Body。

每个候选必须同时通过：

1. **EXPLAIN**：存在一个零基础用户现实中会遇到的独立问题；
2. **EXAMPLE**：存在不可被相邻课程替代、可复用的核心规律；
3. **CHECK**：能设计真实判断题证明理解，而不是记术语；
4. **PRACTICE**：在现有 Unified Lesson Shell 内能完成一个最小真实动作，Reference Fill / COPY_TO_AI 可组成完整可执行任务；
5. **REVIEW**：能具体回答“AI适合做什么 / AI不应该替你做什么”，并保留本课边界；
6. **CAPABILITY**：能定义可自证能力、现实触发场景与下一步复用；
7. **CONTINUITY**：不重教 Track 01，不抢 Track 03 / 04 / 05 Primary Knowledge Home；
8. **UI FIT**：不需要新增 Renderer、UI、CSS 或课程专属交互。

Disposition 允许：`KEEP / MERGE / SPLIT / SUPPORTING_KNOWLEDGE / DEFER / REMOVE`。

## 2. Audit result summary

| ID | Primary Knowledge Home | Result | Why independent |
| --- | --- | --- | --- |
| T2-01 | Research Question / Scope | **KEEP** | “把模糊问题变成可研究问题”是研究工作的入口判断，不能被来源判断替代 |
| T2-02 | Source Quality / Evidence Judgment | **KEEP** | 来源是否可信是独立证据判断能力，不能并入搜索或冲突处理 |
| T2-03 | Multi-source Synthesis / Conflict Handling | **KEEP** | 多来源冲突要求对齐定义、时间、范围、证据，是高频独立工作动作 |
| T2-04 | Audience / Purpose Fit | **KEEP** | 同一信息面向不同对象如何表达，是所有后续工作成品和 Track 03 沟通的前置能力 |
| T2-05 | Source-to-Deliverable Transformation | **KEEP** | 从已有资料组织成可交付成品，区别于“写一句文案”或“改稿” |
| T2-06 | Editorial Diagnosis / Revision | **KEEP** | 用户必须会判断“哪里不好”再修改；不能只会继续说“再好一点” |
| T2-07 | Targeted Document Reading | **KEEP** | 长文件处理的核心不是总结，而是按任务目标定向定位信息 |
| T2-08 | Cross-document Comparison | **KEEP** | 多文件比较要求先定义比较维度，再解释差异与影响，能力独立 |
| T2-09 | Information-to-Action Extraction | **KEEP** | 把信息转成 Decision / Action / Owner / Deadline / Risk，第一次从“读懂”进入“推进工作” |
| T2-10 | Metric Definition / Data Semantics | **KEEP** | 不先统一指标定义与口径，后续计算和业务判断都不可靠 |
| T2-11 | Data Quality / Cleaning Judgment | **KEEP** | 判断数据是否具备分析条件，是独立于计算本身的前置能力 |
| T2-12 | Analytical Question → Calculation → Interpretation → Verification | **KEEP** | 从业务问题到可信结论形成完整分析闭环；图表与数字复核作为 supporting |
| T2-13 | Knowledge Capture / Knowledge Value | **KEEP** | “什么值得长期保存”是沉淀知识前的独立判断 |
| T2-14 | Knowledge Organization + Maintenance / Source Governance | **KEEP** | “以后找得到且用对版本”是同一完整目标，组织与维护不再拆课 |
| T2-15 | Reusable Work Method / Template / Checklist / SOP-lite | **KEEP** | 从一次成功任务提取可复用方法，是 Track 02 → Track 04 的必要桥梁，但不进入自动化设计 |

结论：**15 KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE**。

这不等于未来永远固定 15 节；若 Human Review / Practice Evidence 发现 Exit Capability 缺口，可按治理规则重新开启 Curriculum Audit。

## 3. T2-01 — 把模糊问题变成可研究问题

**Primary**：Research Question / Scope
**Disposition**：KEEP

- **Step 1 / Learner problem**：用户知道自己“想了解一个东西”，但问题过宽、目的不清，AI 只能给泛泛答案。
- **Step 2 / Core rule**：先确定“为什么查 → 查谁/什么 → 范围/时间 → 想形成什么判断 → 需要什么证据”，再开始研究。这里调用 Track 01 Prompt / Context，但不重教定义。
- **Step 3 / Mastery**：能判断哪些问题可以直接研究、哪些仍太宽；能识别缺少对象/时间/目的/输出要求的研究问题。
- **Step 4 / Minimum action**：把一个“帮我研究 X”的模糊需求改成可直接给 AI 的研究任务。COPY_TO_AI 至少包含目的、对象/范围、时间、所需结论、来源要求。
- **Step 5 / Review**：AI适合帮助收窄问题、拆研究维度和提出资料需求；AI不应该替用户决定一个尚未说清的真实业务目的。
- **Step 6 / Capability**：看到“问题太大、答案太泛”时，能先重写 Research Question，而不是不断换模型或重问同一句。
- **Next reuse**：T2-02 评估找到的来源；Track 03 市场/选题研究；Track 05 Problem Discovery。

## 4. T2-02 — 判断来源和证据是否可信

**Primary**：Source Quality / Evidence Judgment
**Disposition**：KEEP

- **Step 1**：AI 给出数据、结论或引用，但用户不知道能不能信。
- **Step 2**：判断来源至少看原始性、发布主体、日期、统计对象/适用范围、可追溯证据；“有链接”不等于可靠。
- **Step 3**：比较官方原始资料、媒体转述、无出处说法等，判断哪一个能支撑当前结论以及还缺什么核验。
- **Step 4**：给定一组来源描述，让学习者要求 AI 标记 source / date / scope / evidence / confidence，并指出需回到原文核验的项。
- **Step 5**：AI适合整理来源、追踪证据、暴露缺口；AI不应该因为语气确定或来源数量多就自动判定事实成立。
- **Step 6**：以后看到关键数字、政策、市场结论、产品能力等影响决策的信息，会主动追问“来源在哪里、适用于谁、是什么时候”。
- **Next reuse**：T2-03；Track 03 内容事实核验与市场研究。

## 5. T2-03 — 处理多个答案和来源冲突

**Primary**：Multi-source Synthesis / Conflict Handling
**Disposition**：KEEP

- **Step 1**：两个 AI 回答、两个报告或两个来源给出不同数字/结论，用户不知道该选哪一个。
- **Step 2**：先对齐定义、统计对象、时间、范围和证据，再区分“真正冲突 / 口径不同 / 时间变化 / 样本不同 / 仍无法确定”。
- **Step 3**：能识别“表面冲突其实口径不同”，也能识别证据不足时不能强行选一个赢家。
- **Step 4**：把两到三个冲突陈述与来源交给 AI，要求输出一致部分、冲突点、冲突原因、证据强弱、仍不确定项。
- **Step 5**：AI适合做多源对齐和冲突表；AI不应该在证据不足时编造一个确定答案消除冲突。
- **Step 6**：遇到“为什么每个地方说法不一样”时，会先做 source alignment，再决定是否能下结论。
- **Next reuse**：Track 03 竞品/市场研究；Track 05 Discovery evidence。

## 6. T2-04 — 针对不同对象和目的表达

**Primary**：Audience / Purpose Fit
**Disposition**：KEEP

- **Step 1**：同一份信息直接让 AI “改专业一点”，结果对老板、客户、同事都像同一种话术。
- **Step 2**：表达先由“谁看 → 看完要知道/相信/行动什么 → 他已有多少背景 → 需要什么语气与细节”决定。
- **Step 3**：能判断同一原始信息面对不同对象，哪些内容要保留、解释、缩短或改变行动要求。
- **Step 4**：提供同一组事实，指定对象、目的、已有背景和期望行动，生成一个可直接发送/继续编辑的版本。
- **Step 5**：AI适合做受众适配和表达重组；AI不应该替用户虚构对象需求、关系背景或业务承诺。
- **Step 6**：写邮件、汇报、客户说明、内部沟通前，会先明确 audience + purpose，而不是只指定“风格”。
- **Next reuse**：T2-05；Track 03 Content / Sales / Service。

## 7. T2-05 — 从资料变成可交付成品

**Primary**：Source-to-Deliverable Transformation
**Disposition**：KEEP

- **Step 1**：用户手里有资料，但不知道怎样让 AI 从“总结资料”真正变成报告、邮件、方案或汇报。
- **Step 2**：成品必须同时绑定 source、deliverable purpose、结构、必须保留事实和完成标准；格式只是载体。
- **Step 3**：能识别“让 AI 凭空写”和“基于给定资料制作交付物”的区别；能判断输出是否遗漏关键依据。
- **Step 4**：给定资料包 + 交付对象/目的 + 成品结构/约束，形成完整 COPY_TO_AI 任务并得到可编辑成品。
- **Step 5**：AI适合整理、结构化、起草和转换已有信息；AI不应该补不存在的事实、数据或批准事项。
- **Step 6**：以后面对“资料很多但要交一个东西”，会先定义 deliverable，再让 AI 从 source 生成。
- **Next reuse**：T2-06；Track 03 Content Assets。

## 8. T2-06 — 诊断成品问题并有效修改

**Primary**：Editorial Diagnosis / Revision
**Disposition**：KEEP

- **Step 1**：AI 已经写出来，但用户只会说“再好一点 / 更专业一点 / 再改改”。
- **Step 2**：修改前先诊断问题属于事实、信息缺口、结构、逻辑、重点、语气、长度、具体性或行动性，再给对应反馈。
- **Step 3**：给多种“看起来不好”的成品，判断真正的问题类型以及哪条修改要求最有效。
- **Step 4**：对一份有明确缺陷的 AI 初稿先写 diagnosis，再组合成精确 revision request；Reference 必须能直接复制给 AI。
- **Step 5**：AI适合按明确标准重写与局部修改；AI不应该替用户定义真实事实、业务立场或最终审批标准。
- **Step 6**：以后结果不满意时，不再无方向重生成，而是先说清“哪里不对、为什么、要怎么改”。
- **Next reuse**：Track 03 内容质量、销售沟通与客服回复审核。

## 9. T2-07 — 长文件定向阅读

**Primary**：Targeted Document Reading
**Disposition**：KEEP

- **Step 1**：长 PDF / 报告 / 合同直接“总结一下”后，用户仍找不到真正需要的信息。
- **Step 2**：先定义阅读任务：要找什么、为什么找、需要哪些原文依据、遗漏什么会造成风险，再让 AI 定向提取。
- **Step 3**：能区分“泛总结”和“目标阅读”；能判断什么时候必须保留页码/原文/条件。
- **Step 4**：使用课程内 Sample Input 或用户自己的外部 AI 文件能力，写出一个定向阅读任务，要求提取目标信息 + 依据 + 未找到项。
- **Step 5**：AI适合快速定位、归纳、引用长资料；AI不应该在文件没有写到时把常识补成“文件内容”。
- **Step 6**：看到长文件时先问“我这次到底要从里面找什么”，而不是默认全文总结。
- **UI boundary**：不新增文件上传器；文件能力属于外部 AI Practice Context。
- **Next reuse**：T2-08。

## 10. T2-08 — 多文件比较

**Primary**：Cross-document Comparison
**Disposition**：KEEP

- **Step 1**：两份合同、方案、版本或竞品资料放在一起，用户只得到一堆零散差异。
- **Step 2**：先定义比较目的与维度，再要求 AI 输出相同点、差异、影响、缺失信息和需要进一步确认的项。
- **Step 3**：能判断一个比较维度是否和当前决策有关；能识别只列文字差异但没有解释影响的伪比较。
- **Step 4**：给两份 Sample Input + 比较目的 + 维度 + 输出要求，生成结构化 comparison。
- **Step 5**：AI适合并排比对和发现遗漏；AI不应该替用户在没有决策标准时自动判断“哪个一定更好”。
- **Step 6**：遇到两个版本/方案时会先定义“为了什么而比较”。
- **Next reuse**：T2-09；Track 03 竞品/方案比较。

## 11. T2-09 — 从信息提取决策和行动

**Primary**：Information-to-Action Extraction
**Disposition**：KEEP

- **Step 1**：会议、资料、聊天看完了，但没人知道下一步谁做什么。
- **Step 2**：区分 Fact / Decision / Action / Owner / Deadline / Dependency / Risk；没有明确的信息必须标记待确认，不能自动补责任人或期限。
- **Step 3**：能从一段记录中判断哪些是真正决策、哪些只是讨论；识别 AI 擅自补 Owner/Deadline 的风险。
- **Step 4**：把一段会议或资料文本转换为 action list，要求 AI 明确“原文已确认 / 推断 / 待确认”。
- **Step 5**：AI适合整理行动项、依赖和风险；AI不应该替团队做尚未达成的决策或虚构负责人。
- **Step 6**：以后“读完但没有推进”时，会把信息转为可执行 action，并主动确认缺失责任信息。
- **Next reuse**：Track 03 运营执行；Track 04 已验证人工流程的输入。

## 12. T2-10 — 先统一指标定义与口径

**Primary**：Metric Definition / Data Semantics
**Disposition**：KEEP

- **Step 1**：用户会问“哪个渠道转化率最高”，却没有先确认转化率怎么算、分母是谁、时间范围是什么。
- **Step 2**：任何分析前先明确 metric name、business meaning、formula、unit、time window、population / denominator。
- **Step 3**：面对同名指标不同公式，能识别为什么不能直接比较。
- **Step 4**：给一个业务问题和一张小表，要求学习者先让 AI生成/确认 metric dictionary，再进入计算。
- **Step 5**：AI适合解释指标、发现口径不一致、辅助写公式；AI不应该在业务口径没定义时自行选择一个“看起来合理”的公式。
- **Step 6**：看到数字结论前，会先问“这个指标到底怎么算、代表什么”。
- **Next reuse**：T2-11 / T2-12；Track 03 Operations Metrics；Track 05 Value Metric。

## 13. T2-11 — 判断数据是否具备分析条件

**Primary**：Data Quality / Cleaning Judgment
**Disposition**：KEEP

- **Step 1**：表格一拿到就让 AI 分析，结果其实混有空值、重复、单位/日期格式不一致和异常数据。
- **Step 2**：先检查 completeness、uniqueness、format/unit consistency、range/anomaly、category consistency，再决定清洗或分析。
- **Step 3**：给一小段脏数据，能识别哪些问题会改变结论，哪些只是显示格式。
- **Step 4**：把小型 Sample Dataset 交给 AI，要求输出 quality issues、影响、建议处理方法以及“处理前不能下的结论”。
- **Step 5**：AI适合发现规则性数据问题和提出清洗建议；AI不应该未经业务确认就删除异常值或猜测缺失值。
- **Step 6**：以后看到数据分析任务，先问“数据有没有资格分析”。
- **UI boundary**：不新增 Spreadsheet editor。
- **Next reuse**：T2-12；Track 03 运营分析。

## 14. T2-12 — 从数据得到可信业务判断

**Primary**：Analytical Question → Calculation → Interpretation → Verification
**Disposition**：KEEP

- **Step 1**：用户会让 AI “分析这个表”，得到很多数字和图，但不知道哪个回答了真正的问题。
- **Step 2**：Business Question → Metric → Calculation → Comparison → Interpretation → Verification → Limitation；图表只服务解释，不能成为独立目标。
- **Step 3**：能判断哪个分析真正回答业务问题；能识别“算对了但解释错了 / 图表漂亮但口径错了”。
- **Step 4**：给一个小型数据集和业务问题，让 AI 明确计算、复核关键数字、解释结果、列限制，必要时建议最合适图表。
- **Step 5**：AI适合计算、比较、解释和生成可视化建议；AI不应该把相关性当因果或在样本不足时做过强结论。
- **Step 6**：以后不再只问“帮我分析”，而是先说明要回答什么业务问题，并能复核关键数字。
- **Supporting only**：Visualization / Numerical Verification；不拆成第 16 课。
- **Next reuse**：Track 03 Data Review；Track 05 Evaluation。

## 15. T2-13 — 判断什么值得沉淀为知识

**Primary**：Knowledge Capture / Knowledge Value
**Disposition**：KEEP

- **Step 1**：用户把所有聊天、链接、文件都保存，最后仍找不到真正有价值的知识。
- **Step 2**：判断信息是否值得沉淀要看未来复用概率、稳定性、权威性、决策价值、维护成本；临时上下文不等于长期知识。
- **Step 3**：给临时消息、稳定规则、项目事实、决策记录、外部资料等，判断哪些应保存、保存多久、为什么。
- **Step 4**：对一组工作信息建立 capture decision，要求 AI 帮助分类为临时 / 项目 / 稳定规则 / 决策 / 参考资料，并说明依据。
- **Step 5**：AI适合帮助整理和提炼待保存内容；AI不应该决定组织真正的权威来源或擅自把推测升级为长期事实。
- **Step 6**：以后不会“什么都存”，而会先判断这条信息未来是否值得成为知识资产。
- **Next reuse**：T2-14；Track 03 FAQ / Sales / Content Assets。

## 16. T2-14 — 让知识可找、可信、可更新

**Primary**：Knowledge Organization + Maintenance / Source Governance
**Disposition**：KEEP

- **Step 1**：资料保存了很多份，但不知道放在哪里、哪份最新、哪个才是可信版本。
- **Step 2**：组织和维护围绕同一个结果：knowledge item 必须有清晰主题/用途、来源、日期/版本、状态、owner/更新规则和 Source of Truth。
- **Step 3**：能识别重复版本、过期资料、无来源总结和真正 canonical source；判断什么时候应该更新而不是继续新增副本。
- **Step 4**：给一组新旧资料，要求 AI 输出知识清单、分类、source/version/status、canonical source 和需要归档/更新项。
- **Step 5**：AI适合整理、去重、标记版本和发现冲突；AI不应该自行宣布未经确认的资料成为 Source of Truth。
- **Step 6**：以后找资料不只问“在哪里”，还会确认“哪份才是当前可信版本”。
- **Merge decision retained**：Knowledge Organization + Knowledge Maintenance 属于同一能力闭环，不再拆成两课。
- **Next reuse**：Track 03 客服/销售知识；Track 04 Context Engineering。

## 17. T2-15 — 把一次成功做法变成可复用方法

**Primary**：Reusable Work Method / Template / Checklist / SOP-lite
**Disposition**：KEEP

- **Step 1**：同类任务已经做成功过，但下一次仍重新回忆、重新问、重新检查。
- **Step 2**：复盘一次成功任务，区分固定步骤、每次变化的输入、判断点、检查项、常见失败与最终完成标准，再选择模板 / Checklist / SOP-lite 形式保存。
- **Step 3**：能区分“复制上次答案”和“提取可复用方法”；能识别哪些判断仍必须人工做。
- **Step 4**：提供一个已经完成的工作过程，要求 AI 帮助提取 reusable method，并由学习者确认固定项/变量/人工判断/检查标准。
- **Step 5**：AI适合帮助抽象步骤、形成模板和 Checklist；AI不应该把一次偶然成功自动认定为稳定流程，也不替用户决定高风险判断。
- **Step 6**：以后第二次遇到同类任务，会先复用方法而不是从零开始；当方法高频、稳定、值得系统化时，知道它进入 Track 04 的学习范围。
- **Boundary**：不教授 Trigger / Node / State / Retry / Automation / Agent Design。
- **Merge decision retained**：Reusable Method Extraction + Template / Checklist / SOP-lite 是一个连续动作，不拆课。

## 18. Supporting knowledge that must not become extra Track 02 lessons

以下内容经过本轮 Audit，继续只作为 supporting / case / later-track 内容：

- Visualization：服务 T2-12 解释，不独立成“AI 图表课”；
- Numerical Verification：属于 T2-12 分析闭环；
- Knowledge Organization / Knowledge Maintenance：共同服务 T2-14 的“可找、可信、可更新”；
- Template / Checklist / SOP-lite：属于 T2-15 的复用方法输出形式；
- OCR / ASR / TTS：可作为 T2-07 等资料处理案例，pipeline 工程 Deferred；
- Formula / SQL / Python：可作为 AI 辅助结果，普通路径不独立教学；
- 文件上传、Spreadsheet editor、Knowledge Base UI：产品功能，不是课程知识点；
- Workflow decomposition、Trigger / State / Retry / Timeout / Idempotency、Automation、HITL architecture：Track 04；
- ICP / Funnel / Lead / CRM / Sales / Customer Service business loop：Track 03；
- Problem Discovery / Value / Solution Design / Pilot / Adoption：Track 05。

## 19. Approved Track 02 directory after audit

```text
Phase 1 会找答案
T2-01 把模糊问题变成可研究问题
T2-02 判断来源和证据是否可信
T2-03 处理多个答案和来源冲突

Phase 2 会做成品
T2-04 针对不同对象和目的表达
T2-05 从资料变成可交付成品
T2-06 诊断成品问题并有效修改

Phase 3 会处理复杂资料
T2-07 长文件定向阅读
T2-08 多文件比较
T2-09 从信息提取决策和行动

Phase 4 会看数据
T2-10 先统一指标定义与口径
T2-11 判断数据是否具备分析条件
T2-12 从数据得到可信业务判断

Phase 5 会积累知识
T2-13 判断什么值得沉淀为知识
T2-14 让知识可找、可信、可更新

Phase 6 会复用方法
T2-15 把一次成功做法变成可复用方法
```

## 20. Production decision

Track 02 Six-step Audit 结果固定为：

**`PASS / 15 KEEP / DIRECTORY_APPROVED_V1`**

下一步不直接一次性生成 15 节 Lesson Draft。

固定进入：

```text
approved Track 02 directory
→ Formal Brief batch
→ Course Production Workflow
→ Course Builder
→ Deterministic Validation
→ Human Review
→ Runtime
```

建议第一批 Formal Brief：**T2-01～T2-03（会找答案）**。它们最适合验证 Track 02 是否真正从“理解 AI”切换到“会在工作里使用 AI”，并能完整调用 Track 01 的 Prompt / Context / Reliability / Search / Source of Truth 而不重教。
