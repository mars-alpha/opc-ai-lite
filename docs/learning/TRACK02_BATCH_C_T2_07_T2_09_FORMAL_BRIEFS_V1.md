# Track 02 Batch C — T2-07～T2-09 Formal Briefs v1

Status: **AVAILABLE / FORMAL_RUNTIME / RUNTIME_ACCEPTANCE_PASS**
Drafts: `fixtures/course-builder/track02-batch-c.ts` (T2-07～T2-09)
Historical Workflow: `scripts/_historical-run-track02-batch-c-workflow.ts`; historical deterministic checks: `scripts/_historical-validate-track02-batch-c-drafts.ts`.
Human Review 已通过。正式课程由 `lib/learning/track02-batch-c-runtime.ts` + LessonSpec Registry + Formal Runtime 提供；原 Preview 仅保留历史审阅用途。
Track Owner: `docs/learning/TRACK02_CATALOG_CONTEXT_V1.md`
Audit: `docs/learning/TRACK02_SIX_STEP_AUDIT_V1.md`
Scope: **会处理复杂资料**（T2-07～T2-09）。本 Brief 只定义这三课的课程边界，不维护后续 Batch 的 current status；后续状态统一从 Current Facts / Track 02 owner 解析。

## 批次目标与输入

把已经会制作和修改成品的能力扩展到更长、更复杂、更分散的资料：先围绕明确任务定向阅读一份长资料，再按决策需要比较多份资料，最后把已确认的信息转换成可执行的决策与行动。

能力链：长资料定向定位 → 多资料按维度比较 → 信息转决策与行动。

从 Track 01 调用 Context、结构化输出、事实核验与多模态能力直觉；从 T2-04～T2-06 调用对象/目的、交付物与诊断修订能力，不重新讲这些概念。三课可复用同一个“团队准备选择试行方案”的中性工作场景，但每课必须独立可完成。

共同边界：继续使用统一六步 Shell、三题理解检查、完整 COPY_TO_AI 参考填充、Step 5 两个方向及下方解释、现实 Step 6 触发。文件、PDF、图片、音频等只作为外部 AI Practice Context 或课程内 Sample Input；不新增上传器、文件浏览器、OCR/ASR pipeline UI、表格 UI 或 CSS。没有资料依据时不得把常识补成“文件中写了”。

## T2-07 — 文件太长，怎么快速找到真正需要的信息

- Type / Gate：APPLICATION；CHECK + PRACTICE。
- Primary Knowledge Home：Targeted Document Reading。
- Learner Question：面对几十页资料，为什么“总结一下”往往还是找不到真正影响当前任务的信息？
- 当前任务：先定义这次阅读要解决的工作问题、需要找出的信息、必须保留的依据与未找到项，再让 AI 对长资料做定向提取。
- 继承：T2-06 已会用目的和资料检查成品；调用 Track 01 Context / Multimodal 能力，不重讲模型如何读取文件。
- 新能力：区分泛总结与目标阅读；要求结果包含“找到什么、依据在哪里、什么没找到、下一步需确认什么”。
- 产物：一份目标阅读结果，包含关键发现、依据位置、未找到项与待确认问题。
- EXPLAIN：从“长文件直接总结”切入，点明阅读任务决定要找什么；底部说明“摘要”和“定向阅读”解决的问题不同。
- EXAMPLE：给一份带章节/页码标记的模拟试行方案，目标是判断是否满足小范围试行条件；比较泛摘要与定向提取结果。
- CHECK：最佳判断（先明确阅读任务）；误区（摘要越长越等于找全）；边界（文件未写到的内容不能补成文件事实）。
- PRACTICE：使用随课 Sample Input，要求 AI 找出试行范围、资源要求、风险条件、尚未说明项，并逐条标注依据位置；参考填充组合后必须可直接执行。
- REVIEW：AI适合定位、提取、归纳长资料；不应该把文件没有的信息写成“文件结论”。下方解释“找到信息”和“证明信息来自资料”是两层要求。
- CAPABILITY：能把“读完整份文件”改成一个可检查的定向阅读任务。触发：文件很长、时间很少、只需要其中会影响当前决定的部分。
- Deferred：OCR / ASR / TTS 可作为资料来源背景；pipeline、模型选型、文件上传和解析工程不在本课展开。

## T2-08 — 多份文件怎么比较，差异在哪里

- Type / Gate：APPLICATION；CHECK + PRACTICE。
- Primary Knowledge Home：Cross-document Comparison。
- Learner Question：为什么把两份方案都丢给 AI 说“帮我比较”，常得到很多差异却仍然无法判断？
- 当前任务：先明确比较目的和维度，再让 AI 对两份资料输出相同点、差异、影响、缺失信息与待确认项。
- 继承：T2-07 的定向阅读结果和依据意识；调用结构化输出，不重教字段概念。
- 新能力：比较维度必须服务当前决定；文字不同不一定是业务差异，关键差异必须说明对当前目的的影响。
- 产物：一份结构化比较结果，能看出每个关键维度的差异、依据、影响与缺口。
- EXPLAIN：区分“找不同”与“为了决定而比较”；底部说明比较维度来自任务目的，而不是 AI 随机列栏目。
- EXAMPLE：给 A/B 两个试行方案节选，以“是否适合先做低风险小范围试行”为目的比较成本、准备时间、数据要求、风险与退出条件。
- CHECK：最佳判断（先定义与决定有关的维度）；误区（差异越多越有价值）；边界（资料没给出的条件不能自动推断）。
- PRACTICE：提供两份完整 Sample Input 和明确比较目的，要求逐维度给证据、差异、影响、缺失项；参考填充可直接复制。
- REVIEW：AI适合并排核对、整理和发现遗漏；不应该在没有决策标准时替用户直接宣布“哪个一定更好”。下方解释“事实差异”和“决策影响”要分开。
- CAPABILITY：能设计一次有目的、有维度、有依据的多文件比较。触发：面对两个版本/供应商/方案，只知道让 AI“比较一下”。
- Deferred：不进入采购决策模型、商业评分体系或 Track 03 竞品策略。

## T2-09 — 看完资料以后，下一步到底该做什么

- Type / Gate：APPLICATION；CHECK + PRACTICE。
- Primary Knowledge Home：Information-to-Action Extraction。
- Learner Question：资料已经读懂、差异也列出来了，为什么团队仍可能不知道下一步谁做什么？
- 当前任务：把已确认的信息转成 Decision / Action / Owner / Deadline / Risk / Open Question，明确哪些是事实、哪些是待决策事项。
- 继承：T2-07 的证据提取、T2-08 的结构化比较；调用 T2-04 的对象/目的，不重教沟通写作。
- 新能力：信息本身不等于行动；每项行动要能指回一个已确认事实或明确决策，负责人和时间不能由 AI 凭空指定。
- 产物：一份可执行行动清单，包含当前决策、行动、责任角色、时间条件、风险与待确认问题。
- EXPLAIN：从“读完很多但没人推进”切入；底部说明“结论、决定、行动”是不同层次。
- EXAMPLE：基于 A/B 方案比较结果，示范把“方案 B 准备更快但数据要求不明”转成“先确认数据条件，再决定是否进入两周试行”，而不是直接假设已批准。
- CHECK：最佳判断（先分事实/决定/行动）；误区（AI 可以自动指定负责人和截止日）；边界（未授权事项必须标待决定）。
- PRACTICE：给一组已确认发现和未决问题，要求 AI 输出“已确认事实 → 需要的决定 → 下一行动 → 负责人角色/确认人 → 时间条件 → 风险/待确认”；参考填充必须完整可执行。
- REVIEW：AI适合整理行动、发现依赖、把信息转换成待办结构；不应该替组织做授权决策、承诺截止时间或指定真实责任人。下方解释行动项必须具备来源与可验证完成条件。
- CAPABILITY：能在阅读/比较之后形成团队可以继续推进的行动清单。触发：资料和会议结论很多，但任务仍停在“大家都看过了”。
- Deferred：Workflow Trigger / State / Retry / Automation / HITL architecture 留给 Track 04；本课只训练人工可执行的行动提取。
