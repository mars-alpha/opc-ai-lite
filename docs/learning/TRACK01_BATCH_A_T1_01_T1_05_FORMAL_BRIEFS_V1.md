# Track 01 Batch A — T1-01～T1-05 Formal Briefs v1

Status: **BRIEF_READY_V1 / HUMAN_REVIEW_PASS_BRIEF_LEVEL**
Task: **CURRICULUM-AUDIT-REALIGN-001-R1**  
Canonical IDs: **T1-01～T1-05**  
Course Builder target: **Current Course Builder Skill via registry + current quality rules**

## 1. Batch continuity

默认 Case Thread：**OPC / 自媒体 AI 内容任务**。从“看到一个值得分享的 AI 变化、手里只有零散想法”开始，先让 AI 完成一个极简单的整理任务，再逐步做到任务说明清楚、资料足够、迭代完成、结果可用且已做最小核验。学习者始终可以替换成自己的真实工作任务。

```text
T1-01 选择任务并生成 First Draft
→ T1-02 写成 Clear Task Brief
→ T1-03 补成 Minimum Context Pack
→ T1-04 做两轮 Iteration
→ T1-05 完成 Verification Record
→ Verified Publishable Draft
```

Stable Method Layer 必须行业中立。**Batch A 默认连续案例层固定使用 OPC / 自媒体 AI 内容任务**，用于保证 T1-01～T1-05 的同一 Artifact 连续推进；学习者可替换为房地产、电商、教育、企业服务等自己的真实任务，方法与验收标准不变。

### Prompt vs Context fixed boundary

从本版本开始固定：

- **Prompt = AI 要做什么 / Task Instruction**：目标、对象、任务要求、输出形式；
- **Context = AI 为了完成任务需要知道什么 / Task Information**：当前事实、已有资料、业务背景、参考内容。

同一个信息有时可以写进一句 Prompt，但教学判断按“它是在定义任务，还是在提供任务所需信息”区分。T1-02 负责定义任务；T1-03 负责信息取舍。T1-03 不教授 Knowledge Base / Source of Truth 的正式判断。

---

## T1-01 — AI 能帮什么，不能帮什么

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Everyday AI task fit / human judgment boundary**  
Prerequisite: **None**

### Learner Question
做一条 OPC / 自媒体内容时，哪些步骤可以先让 AI 帮一把？

### Current Learner Job
从 OPC / 自媒体内容生产中，看见 AI 最容易协助的入口，并找出一个可以先交给 AI 帮一步的内容步骤。

### Inherited Capability / Artifact
无。输入是学习者自己的真实任务想法。

### New Capability
能从 OPC / 自媒体内容任务中识别 AI 常见的协助入口：
- 起草标题 / 开头 / 结构；
- 整理 / 总结已有资料；
- 围绕主题找表达角度；
并知道重要事实需要核验、最终决定仍由人负责。

### Artifact Action / Output
选一条自己真实准备做的内容 → 写清 AI 可以先帮哪一个小步骤。

Output: **Task Fit Note**

### Six-step intent

1. **EXPLAIN**：从一项普通真实工作进入，让学习者看见 AI 更适合先协助容易检查的中间工作；重要事实、关键取舍和最终决定仍由人负责。
2. **EXAMPLE**：使用行业中立的客户会议跟进任务，展示 AI 可以整理记录、起草内容和提供候选，但承诺、事实与最终发送版本必须由人确认。
3. **CHECK**：检查学习者能否区分“AI 可以协助”与“责任可以交出去”。
4. **PRACTICE**：从学习者自己的真实任务中找出一个适合 AI 先协助、且容易检查的小步骤。
5. **REVIEW**：保留本课真正需要长期复用的判断：优先选择容易检查的中间工作；重要事实自己确认；最终取舍和责任仍由人承担。Review 数量与表现形式不预设。
6. **CAPABILITY**：能在真实任务中划分 AI 协作边界，并知道什么时候应该调用这项判断。

### Next Reuse
T1-02 可以继续使用当前真实任务与 help step，把模糊需求改成 Clear Task Brief；T1-01 不为下一课强制生产额外字段。

### Anti-repeat / Deferred
- 不正式教 Prompt 结构；
- 不正式教 Context；
- 不定义 Hallucination；
- 不解释模型机制；
- 不展开 Tool / RAG / Agent。

### Grounding
REVIEWED_KNOWLEDGE + current AI product capability examples only as examples.

---

## T1-02 — Prompt：把任务说清楚

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Prompt foundations / executable task brief**  
Prerequisite: **T1-01**

### Learner Question
为什么“帮我写一下”经常得不到我真正想要的结果？怎样把任务说到 AI 能执行？

### Inherited Capability / Artifact
T1-01 的真实任务 + `AI 先帮哪一步`。T1-02 不依赖外部 AI First Draft。

### Current Learner Job
把原始模糊要求重写成一份清楚、可执行、可检查的任务说明。

### New Capability
能明确：
- 要完成什么；
- 给谁使用；
- 有什么关键要求 / 限制；
- 希望输出成什么样。

### Artifact Action / Output
把原始模糊要求拆成 **任务目标 / 使用对象 / 关键要求与限制 / 输出形式** 四项，形成 **Clear Task Brief**。可选复制给常用 AI 体验结果差异，但课程 Artifact 不要求回填 AI 回复。

### Six-step intent

1. **EXPLAIN**：让学习者明白模糊要求会迫使 AI 猜目标、对象、标准和交付形式；Prompt 的价值是把任务意图说清楚，而不是追求长度。
2. **EXAMPLE**：使用“为第一次了解某项服务的用户写简短介绍”的通用任务，展示同一需求如何从“帮我写一下”变成可执行任务。
3. **CHECK**：判断一份任务说明是否真正可执行，而不是只看字数或语气是否专业。
4. **PRACTICE**：把自己的真实需求整理成清楚、可执行、可检查的任务说明。当前练习可使用目标、对象、关键要求与交付形式四项，因为它们服务本课知识，不将其升级为所有课程的固定模板。
5. **REVIEW**：保留本课实际需要的任务表达判断；数量由知识决定，不为了卡片版式增加或删减。
6. **CAPABILITY**：能把模糊需求变成 AI 可以直接执行的任务说明，并在结果偏题时知道先回看任务是否说清楚。

### Next Reuse
T1-03 不再修改“AI 要做什么”，而是在 Clear Task Brief 已固定的前提下补足“AI 为了完成这件事需要知道什么”。

### Anti-repeat / Deferred
- 不教“万能 Prompt 模板”；
- 不教 System Prompt；
- 不展开 Prompt Engineering 技巧；
- 不把文件 / 历史 /工具结果混成 Prompt 本身。

### Grounding
REVIEWED_KNOWLEDGE.

---

## T1-03 — 上下文（Context）：给 AI 足够但不过量的信息

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Minimum sufficient task context**  
Prerequisite: **T1-02**

### Learner Question
任务已经说清楚了，为什么 AI 还是会缺业务背景、用错资料，或者被太多无关信息干扰？

### Inherited Capability / Artifact
已经说清楚的任务说明。T1-03 不依赖外部 AI 回复。

### Current Learner Job
把已经说清楚的任务和这次真正需要的信息放在一起，形成一段可以直接复制到自己的 AI 软件里验证的内容。

### New Capability
能把信息分为：
- 必须知道；
- 有帮助但非必须；
- 暂时不要放。

同时建立“上下文（Context）有限，更多不等于更好”的最低直觉。

### Artifact Action / Output
从当前事实、已有业务资料、参考内容、必要背景中选出本次任务真正需要的信息；目标、对象、任务要求、输出形式继续属于 T1-02，不在本课重新定义。

Output: **可直接复制验证的任务 + 必要信息**

### Six-step intent

1. **EXPLAIN**：让学习者区分“任务要求”和“完成任务所需信息”；任务说清楚以后，AI 仍可能因为缺少真实资料而猜，也可能因为无关信息过多而抓错重点。
2. **EXAMPLE**：使用通用服务介绍任务，对比哪些信息真正影响结果，说明 Context 的目标是够用而不是越多越好。
3. **CHECK**：检查学习者能否区分必要信息、可选信息与当前任务无关的信息。
4. **PRACTICE**：把一个清楚任务与本次真正需要的资料组合成可直接验证的内容；字段只为任务完整性服务。
5. **REVIEW**：只留下两个本课真正需要复用的判断：只给会影响当前任务的信息；信息够用就停。
6. **CAPABILITY**：能为一次 AI 任务准备足够但不过量的 Context，并知道什么时候应该删减或补充信息。

### Next Reuse
下一课可以继续使用当前任务与最小信息包来学习如何修改第一版结果；本课不为下一课强制制造额外字段或外部回复。

### Anti-repeat / Deferred
- Context Window 只建立“容量有限”直觉，不讲 token 数字；
- 不教 Context Engineering；
- 不教 Memory / Knowledge Base / Source of Truth / RAG；
- 不把 Prompt wording 与 Context 来源混为一谈。

### Grounding
REVIEWED_KNOWLEDGE.

---

## T1-04 — 迭代（Iteration）：把第一版结果改到可用

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Purposeful Revision / Iteration**
Prerequisite: **T1-03**

### Learner Question
第一版不满意时，应该怎么继续，而不是反复“重来一次”？

### Inherited Capability / Artifact
已经能把任务说清楚、提供必要信息，并得到一版 AI 结果；本课不要求学员理解任何内部 Artifact 名称。

### Current Learner Job
在课程已经指出“这次具体改哪一部分”的前提下，把修改要求说具体，让 AI 只修改这一处，而不是模糊地要求“再写一版”。

### New Capability
能对一个已经明确的问题提出一次具体、可检查的修改要求，并完成一次定向修改。

### Artifact Action / Output
完成一次最小定向修改。

Output: **可直接复制验证的修改要求**

### Six-step intent

1. **EXPLAIN**：让学习者看懂第一版有明确问题时，模糊地要求“重写一次”会制造更多变化；迭代的核心是针对问题做可检查的修改。
2. **EXAMPLE**：使用一份大部分可用、只有一段太抽象的通用服务介绍，说明如何只改目标部分并保护已经可用的内容。
3. **CHECK**：检查学习者能否识别具体、可执行、可检查的定向修改要求。
4. **PRACTICE**：在问题已经明确的情况下，写出修改目标与必要要求，让 AI 只修改这一处。
5. **REVIEW**：只留下两个本课真正需要复用的判断：问题明确后做定向修改；修改要求必须可以检查。
6. **CAPABILITY**：能在 AI 第一版出现明确问题时控制修改范围，并判断这一轮是否真的改善。

### Next Reuse
下一课会从“结果看起来更可用”继续进入可靠性判断：哪些事实、日期、数字或重要信息仍必须核验；本课不为下一课强制制造额外字段。

### Anti-repeat / Deferred
- 不讲 Workflow loop / 自动迭代；
- 不讲 Agent self-correction；
- 不讲 Evaluation Engineering；
- 不讲 Chain-of-Thought 或复杂 Prompt Engineering 技巧；
- 不要求初学者独立完成复杂结果诊断；
- 不重新教授 Prompt / Context；
- 不把“改语气”当成完整 Iteration 能力。

### Grounding
REVIEWED_KNOWLEDGE.

---

## T1-05 — 结果可靠性：什么时候必须核验

Type: **APPLICATION**  
Planned Gate: **CHECK + PRACTICE**  
Primary Knowledge Home: **Reliability judgment / verification**  
Prerequisite: **T1-04**

### Learner Question
AI 写得很像真的，我怎样判断哪些可以直接参考、哪些一定要查？

### Inherited Capability / Artifact
已经能把任务说清楚、提供必要信息，并把第一版结果改得更可用；本课不要求学员理解任何内部 Artifact 名称。

### Current Learner Job
面对一段准备发布的 AI 内容，先识别哪些陈述不能因为“看起来很像真的”就直接采用，并说清楚要去核对哪类信息。

### New Capability
能用三个 Beginner 判断决定是否必须核验：
- 这是可以查证的事实、数字、日期、功能或来源吗？
- 这条信息会随时间变化吗？
- 如果它错了，会不会明显误导用户或带来较大后果？

“能不能找到可追溯来源”作为核验方向使用，不要求本课建立正式证据体系。

Hallucination 只用于解释“AI 可能生成听起来合理但并不可靠的内容”，不作为本课主概念。

### Artifact Action / Output
对课程给定的 OPC / 自媒体草稿列出需要核验的内容，并写清每一项应该核对什么类型的来源或最新信息。

Output: **可直接使用的待核验清单**

### Six-step intent

1. **EXPLAIN**：让学习者建立“表达像真的 ≠ 事实已经确认”的可靠性直觉。
2. **EXAMPLE**：使用一段准备发给客户的通用服务说明，展示当前状态、具体数字与来源为什么必须回到真实证据核验。
3. **CHECK**：检查学习者能否识别可查证、会变化或错误后果较大的陈述，并理解为什么不能直接采用。
4. **PRACTICE**：从给定内容中列出真正需要核验的说法，并写清下一步应该核对什么；不让 AI 替代真实来源判断。
5. **REVIEW**：保留事实证据、时效性和错误后果三个可靠性判断；数量来自本课知识，不来自固定卡片要求。
6. **CAPABILITY**：能在使用或发布 AI 内容前识别必须核验的信息，并明确下一步核验方向。

### Next Reuse
后续 Search / Research / Writing / Files / Data 课程可以继续使用这套最低可靠性判断：先识别需要核验的陈述，再进入真正的搜索、来源比较与证据工作。

### Anti-repeat / Deferred
- 不展开正式 Evaluation framework / baseline / regression；
- 不讲 RAG / Source of Truth / Evidence Pipeline；
- 不讲谁有审批权、AI 可以获得什么权限、哪些动作必须 HITL / Core Authority；这些属于 T1-20；
- 不要求初学者在本课完成复杂网络搜索、来源冲突处理或正式证据记录；
- 不承诺“核验后一定正确”；本课只建立“什么时候必须查、应该查什么”的最低判断。
- “错误后果大小”只用于提醒核验优先级，不延伸到审批流程、权限控制或自动执行边界。

### Grounding
REVIEWED_KNOWLEDGE + high-freshness examples where current facts are used.

---

## 2. Batch acceptance before Course Builder

进入 Course Builder 前必须由产品负责人确认：
本轮 Human Review revision 已确认：
1. T1-01～T1-05 顺序保持不变，边界 PASS；
2. Prompt vs Context 固定为 Task Instruction vs Task Information；
3. 五课 Step 4 均明确具体动作与保留结果；
4. T1-05 吸收 Hallucination 作为原因解释，并吸收最低 Task-fit Evaluation；
5. T1-05 不进入 T1-20 的 HITL / Permissions / Approval，也不进入 Track 04 Evaluation Engineering；
6. 旧 Trial 只作为 reference，不把旧 Check / Practice / Review 静默继承进新 Draft。

Formal Brief 层 Human Review = **PASS**。Production Batch 固定为 T1-01～T1-05；若未来重建，只使用当时 registry 解析出的 Current Course Builder Skill。
