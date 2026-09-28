# Track 05 Batches B–F — T5-04～T5-16 Human Review v1

Status: **HUMAN_REVIEW_PASS / 13 LESSONS / READY_FOR_LESSON_SPEC_REGISTRY**

Scope: Batch B T5-04～06 / C T5-07～09 / D T5-10～12 / E T5-13～15 / F T5-16
Boundary: **NO NEW UI / NO CSS / NO LESSON-SPECIFIC RENDERER / RUNTIME_NOT_STARTED**

## Review decision

**T5-04～T5-16：13 / 13 PASS**

Human Review 逐课检查 Step 1/2 信息增量、Step 3 理解题、Step 4 学员真实问题与外部 AI 可执行性、Step 5 判断框架、Step 6 Trigger、中文优先、跨课知识边界与 Track04 anti-repeat。

## Batch B — Problem / Target / Value

### T5-04 — PASS
只负责对象、场景、影响、范围和约束；问题定义不混入解决方案或未验证原因。Step 4 从学员自己的真实问题出发，明确本次包含/暂不包含和现实约束。不提前教目标、价值或解决路径。

### T5-05 — PASS
只负责目标状态和可观察成功条件；明确功能上线不等于业务目标。Step 4 允许成功阈值未知，不让 AI 猜百分比。不提前做投入判断、方案选择或试点设计。

### T5-06 — PASS
只负责方案前价值假设与投入优先级；事实、估算、假设分离。“先补证据 / 暂缓”均为合法结论。不提前选解决路径，也不替代 T5-13 的试点后投资 Gate。

**Batch B separation: PASS**
T5-04 = 到底解决什么 → T5-05 = 做成后变成什么 → T5-06 = 现在值不值得继续投入。

## Batch C — Option / Readiness / Scope

### T5-07 — PASS
同时保留手工、流程优化、配置/购买、轻量集成和自建等候选，用统一维度比较；不以技术先进程度排序，也不进入具体工程实现。

### T5-08 — PASS
理论可行与现实条件已具备明确分离。条件可标记已确认 / 待确认 / 阻塞；只识别数据、权限、依赖、安全/合规阻塞，不教授 OAuth / IAM / MCP 等实现。

### T5-09 — PASS
第一阶段目标、包含/不包含、责任、依赖和首个交付物完整；不重画 Track04 Workflow Blueprint。Step 4 重点帮助学习者删减和守范围，不让 AI 添加功能。

**Batch C separation: PASS**
T5-07 = 选哪条路 → T5-08 = 这条路现在能不能走 → T5-09 = 第一阶段先走到哪里。

## Batch D — Prototype / Pilot / Learning

### T5-10 — PASS
一次优先验证一个会改变方向的高风险未知；最小证明可以是样例、人工模拟或轻量组合。成功标准是新证据，不是完整度。

### T5-11 — PASS
真实用户、窄场景、证据、人工护栏和停止条件完整；成功条件继承 T5-05，不在试点后临时改标准。

### T5-12 — PASS
先记录异常，再分类方案 / 数据 / 流程 / 使用方式 / 环境，最后决定单一修改。不把一次异常自动写成根因，也不提前教授 T5-14 的组织采用。

**Batch D separation: PASS**
T5-10 = 低成本验证关键未知 → T5-11 = 在真实工作受控验证 → T5-12 = 从真实异常形成可解释学习。

## Batch E — Decision / Adoption / Ownership

### T5-13 — PASS
回到原当前基线、成功条件、试点结果、副作用和证据质量；继续 / 调整 / 停止均为合法结论。与 T5-06 边界清晰：T5-06 是投入前假设，T5-13 是试点后 Gate。

### T5-14 — PASS
真实行为优先于“用户抗拒变化”的态度标签；区分方案仍无效与有效但存在流程 / 信任 / 理解 / 支持摩擦。不提前定义长期负责人。

### T5-15 — PASS
业务结果、日常运行、异常、支持、反馈/变更责任分离；“团队负责”不能替代真实责任。未确认负责人明确保留待确认，不扩展成完整企业 RACI。

**Batch E separation: PASS**
T5-13 = 投不投 / 怎么投 → T5-14 = 为什么不持续用 → T5-15 = 谁长期负责与怎样持续运行。

## Batch F — T5-16

### T5-16 — PASS
本课不新增 Primary Knowledge Home，只整合前 15 课判断。产物是可追溯的完整解决方案包，不是前课文档打包。决策链覆盖问题与角色 → 当前基线 → 目标与价值 → 解决路径与范围 → 原型/试点证据 → 最终决定 → 采用与长期责任 → 开放风险。未知、风险、权限和责任可以继续待确认，不为完整而虚构答案。

**Capstone anti-new-knowledge: PASS**

## Cross-lesson Human Review

### Step 1 / Step 2
13 节 Step 1 与 Step 2 标题均独立。Step 1 只建立直觉，Step 2 才展开完整真实案例；不存在批量“先看核心 / 再看边界”模板。

### Step 3
每课 3 道 required Check，覆盖 SINGLE_CHOICE / TRUE_FALSE / MULTI_SELECT；题目测试真实业务判断，不考英文术语记忆。

### Step 4
13 节字段签名不同；字段从学习者自己的真实问题出发；最后字段均承担“我希望 AI 帮我继续判断 / 检查什么”；不知道 / 待确认 / 未知可显式保留；Reference Answer 可直接复制给外部 AI；Reflection 检查新增理解。

### Step 5
每课至少 2 张主 Review 卡；固定方向为 **AI适合做什么 / AI不应该替你做什么**；deeper explanation 覆盖为什么、边界和易混淆判断，不使用跨课空话。

### Step 6
每课至少 3 条 self-assessment evidence；Trigger Scenario 独立于 Next Lesson Value，且来自现实业务场景。

### Learner language
学员可见业务术语已中文优先，使用“当前基线 / 目标状态 / 方案范围 / 试点 / 采用 / 正式运行 / 负责人 / 落地条件 / 原型 / 解决方案包”等自然中文。专业工程细节继续留在 Technical / Enterprise boundary。

## 上线前学员体验复核

在 Formal Registration 前追加了一轮按“连续学习 13 节”的真实体验复核。结论：**EXPERIENCE_REVIEW_PASS / 13 LESSONS**。

实际发现并修正：
- 批量中文化曾把内部标识污染为 `t5-08-solution-落地条件`、`t5-14-采用`、`current当前基线`、`decision采用`、`business负责人`、`pilot结果`；现已全部恢复为稳定内部英文 id / key，学员可见层保持中文；
- 清理 `Post-试点 Evaluation`、`采用 Friction Map`、`正式运行 & 负责人ship`、`Value Hypothesis`、`Success Condition`、`Outcome`、`Reference Fill` 等机械中英混排；
- 清理“当前 当前基线”“完整 完整 AI 解决方案包”等批量替换痕迹与不自然空格；
- T5-13～T5-16 进一步改为初学者可直接理解的业务中文，降低项目管理文档感；
- 第二轮体验反馈进一步清理学习路径中的 Pilot、T5-06 的 Evidence First，并把 OAuth / IAM / MCP / RACI 统一为中文（缩写）表达；
- 删除 T5-12、T5-14 以及同类正文中的“T5-xx 再讲 / 留到下一课 / 下一课会……”等课程编排语言，正文只保留当前知识判断；
- T5-16 Step 5 删除“为什么综合交付不新增知识”内部教学说明，替换为“为什么开放风险要单独列出”的真实交付判断；
- T5-04～T5-16 继续保留同一“线索背景整理”纵向主线案例，因为每课承担不同的新决策：定义问题 → 目标 → 价值 → 选路 → 落地条件 → 范围 → 原型 → 试点 → 异常学习 → 评估 → 采用 → 长期责任 → 完整交付；没有把同一判断换术语重复讲。

体验复核后的固定结论：
- 不拆散纵向案例线程；
- 不增加新课程；
- 不调整六步壳层；
- 不进入 Runtime；
- LessonSpec 注册前必须同时通过 learner-facing copy clean 与 internal id/key stability Gate。
- LessonSpec 注册前新增 Gate：学员正文不得出现课号编排语言；普通英文必须翻译；必要专业缩写必须带中文解释；学习路径不得出现 Pilot 等普通英文标题。

## Final Gate（历史发布阶段证据）

**HUMAN_REVIEW_PASS / 13 LESSONS**

下一阶段：**REGISTER_LESSON_SPEC — T5-04～T5-16**

当时 Human Review Gate 通过后仍需先完成 LessonSpec Registry / Runtime Acceptance 才能 AVAILABLE；该限制现已由正式发布链完成并关闭。
`r`n`r`n## Post-release closure`r`n`r`nT5-04～T5-16 已完成 LessonSpec Registry → Runtime Provisioning → authenticated Runtime Acceptance → AVAILABLE。上面的 REGISTER_LESSON_SPEC 仅保留为 Human Review 当时的历史 Gate 证据，不代表当前 Next Gate。`r`n