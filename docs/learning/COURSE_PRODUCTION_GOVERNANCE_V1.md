# Course Production Governance Baseline v1

Status: **APPROVED_BASELINE_V1**

本规范定义 OPC 正式课程从 Curriculum 到 Published Learning Experience 的生产治理。它不新增 Runtime 状态枚举，也不取代现有 Catalog metadata。

## 1. Canonical production chain

正式课程生产固定为：

```text
LOAD CURRENT RULE SOURCES
→ Grounding / Curriculum
→ Formal Lesson Brief
→ Current Course Builder Skill
→ Deterministic Validators
→ Human Review Gate
→ LessonSpec Registry
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE
```

任何阶段都不得因为“技术已经能跑”而跳过下一阶段的准入条件。

稳定 Workflow 定义见 `docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md`。Workflow 不直接依赖具体 Skill version；当前 Skill 由 `skills/course-builder/index.ts` registry 解析。

## 2. Existing catalog state vs governance stage

现有 Catalog 继续使用两条独立状态线：

### curriculumStatus

```text
PLANNED
BRIEF_READY
IN_PRODUCTION
AVAILABLE
```

### availability

```text
COMING_SOON
LOCKED
AVAILABLE
```

治理阶段中的 `HUMAN_REVIEW_PASS`、`RUNTIME_READY` 是生产过程 Gate，不新增为 Catalog enum。

推荐映射：

| Production stage | curriculumStatus | availability |
| --- | --- | --- |
| Curriculum only | PLANNED | COMING_SOON |
| Formal Brief complete | BRIEF_READY | COMING_SOON |
| Draft / Preview / Review / Runtime provisioning | IN_PRODUCTION | COMING_SOON |
| Runtime accepted and publication approved | AVAILABLE | AVAILABLE or LOCKED |

`LOCKED` 只适用于课程已经正式存在，但因权限/学习条件暂不可进入；未发布课程不能用 LOCKED 伪装成 Runtime Ready。

## 3. Stage entry / exit criteria

### 3.1 PLANNED

Entry:
- 已进入正式 Curriculum；
- lesson identity 已确定或已有正式规划位。

Exit to BRIEF_READY requires:
- Primary Knowledge Home 清楚；
- Learner Question / Outcome 清楚；
- Lesson Type 清楚；
- prerequisite / anti-overlap 清楚；
- planned Completion Gate 清楚；
- grounding requirement 清楚。

禁止：
- 直接生成正式 Runtime；
- 标记 AVAILABLE。

### 3.2 BRIEF_READY

Entry:
- Formal Lesson Brief 已完成；
- 可以作为 Course Builder 的受控输入。

Exit to IN_PRODUCTION requires:
- 明确当前 production batch；
- 明确 Skill Decision Gate 结果；
- 若使用 Course Builder，明确单一 Skill ID / Version；
- Beginner 课程明确 Quality Standard / Profile；
- Grounding 已满足。

禁止：
- 从 Brief 直接切 AVAILABLE；
- 在没有受控 Skill/Code 版本记录时生成无法追溯的 Draft。

### 3.3 IN_PRODUCTION

包含：
- Draft generation；
- Code Validation；
- Preview；
- Human Review；
- Human Review 失败后的重做；
- Human Review 通过后的 Runtime Provisioning；
- Runtime Acceptance。

该阶段可能包含多个 Draft version，但课程 canonical lesson identity 不因重做而改变。

Exit to publication requires同时满足：
1. Code Validation PASS；
2. Human Review PASS；
3. Runtime Provisioning 完成；
4. Runtime Acceptance PASS；
5. Completion Gate 可由 Core/server 正确执行；
6. Catalog runtime mapping 已确认；
7. 无已知 blocking migration / runtime gap；
8. 发布动作由 Core / 人工流程明确执行。

禁止：
- Preview PASS = Runtime Ready；
- Human Review PASS = AVAILABLE；
- local Practice / Check PASS 写成正式 Completion；
- Draft Preview 写正式 Progress / Completion。
## 3.7 Mandatory Six-step Gate for all new lessons

从本规则生效后，所有新正式 Lesson 在进入 Course Builder / Draft Production 前，必须完成 Six-step Knowledge Point Gate。

Formal Brief 必须能够为当前 Primary Knowledge Point 明确：

EXPLAIN → 如何让学习者快速明白当前问题、学习价值和核心判断
EXAMPLE → 用什么真实任务让核心规律变得可见
CHECK → 怎样证明真正理解而不是背定义
PRACTICE → 学习者怎样亲手完成一个最小真实动作
REVIEW → 哪些判断值得长期保留
CAPABILITY → 最终真正会什么、怎样自证、什么真实情况会触发这项能力

Step 1 Clarity Gate：如果第一步必须先解释大量业务背景、数字、角色或条件，学习者才能理解核心问题，则 EXPLAIN 过载；应只保留进入课题所需的信息，把完整案例和复杂边界后移到 EXAMPLE。

任何新 Lesson 不得因为属于 CONCEPT、进阶课或专业课而跳过六步。Lesson Type 只影响 Step 4 深度和 Completion Gate。

若知识点无法自然完成六步：
- 不允许 Course Builder 为了填满 Shell 强行生成；
- 返回 Curriculum / Formal Brief 重做知识粒度；
- 判断应合并、拆分或降为 Supporting Knowledge。

新课程生产的 Gate 顺序固定为：

Knowledge Point Six-step Gate
→ Formal Brief
→ Course Builder
→ Six-step Content Integrity
→ Code Validation
→ Preview
→ Human Review
→ Runtime Provisioning
→ Runtime Acceptance
→ AVAILABLE

固定：**六步不是 UI 模板，也不是某节 reference lesson 的复制模板；它是知识是否真正被教会的教学检验。教学责任固定，案例、字段、文案组织和具体表现按课题决定。**

### 3.8 Lesson Output Contract

Formal Brief 进入 Course Builder 后，正式 Draft 还必须遵守 `docs/learning/LESSON_OUTPUT_CONTRACT_V1.md`。

该 Contract 固定六步的输出职责、Step 4 完整学习动作 / Hint / Reference / Artifact 规则、Step 5 复盘与纠错分层、Step 6 Capability 自证与触发情境要求，以及 Code Validation 与 Human Review 的职责边界；它不固定具体案例写法、Practice 字段数量或某一课的文案模板。

关键原则：
- 不因单节课内容问题扩展 Runtime / UI；
- Artifact 必须从当前课自然学习动作产生，不得为了下一课 handoff 反向制造字段；
- Production Brief 若锁定内部 Case Thread，可用于保持业务连续性；但 Stable Method Layer 与学员可见案例必须行业中立、自然真实、可迁移，不得把内部 OPC / 自媒体 / 品牌 / 项目标签作为课程正文默认表达；
- 技术规则能自动判断的进入 Code Validation，案例自然度、教学清晰度、Review 是否重复等语义质量必须由 Human Review 判断。

后续若需要改变这套输出方式，必须版本化 Lesson Output Contract，不允许在单节课里静默漂移。

### 3.4 HUMAN_REVIEW_PASS — governance gate

Human Review 必须由产品负责人实际体验或明确授权的审核者完成。

Human Review 关注：
- 是否容易理解；
- 是否符合目标用户；
- 是否存在认知负担；
- 是否有真实获得感；
- Check 是否像判断训练；
- Practice 是否可完成；
- 是否与相邻课程重复；
- 是否愿意继续学习。

技术 PASS 不能替代 Human Review PASS。
Human Review 前还必须完成 **Six-step Content Integrity Review**：

- 六步每一步都必须与当前 Formal Brief / Draft Version 一致；
- 根据 `LESSON_OUTPUT_CONTRACT_V1.md` 检查学习建议是否说清本课与准备、六张进度卡片是否逐课逐步准确；使用 intro comparison 的课程须在 Step 1 takeaway 下方显示能帮助理解本课判断的说明。不得只检查字符串长度而忽略教学含义；
- CHECK 题组必须属于当前课程版本，不得沿用已被 supersede 的旧题；
- Step 4 必须有真实学习动作；CONCEPT 可不设 Practice Gate，但不能出现“有 PRACTICE Step、无可操作内容”；
- Review / Capability 必须收束当前版本，而不是旧稿残留；
- 仅修改标题、正文或 Case Thread，而未同步 Check / Practice / Participation，视为未完成 Rework。
- Step 5 上方 Review 主体固定围绕“AI适合做什么 / AI不应该替你做什么”两个核心方向回答；二者不能删除。主卡片数量由课题与知识密度决定、不固定，每张都必须有本课具体回答正文，禁止泛化口号；主卡片下方必须保留 `knowledgeDepth.review` 说明层，按“明确命题 + 回答/解释”继续讲清为什么、边界、使用条件和易混淆判断，数量同样不固定，且不得与主卡片机械重复。mistakes 只做辅助纠偏；
- Step 6 必须同时能回答“会做什么 / 怎么知道自己会了 / 遇到什么情况应该想到这节课 / 下一步为什么继续”；
- Guided Step 4 若要求学习者输入或产出内容，Human Review 必须检查 Hint / Reference / Fill / Copy 等辅助是否足够，避免出现“能输入但不会做”的伪实操。
- 若 Step 4 使用 COPY_TO_AI，Human Review 必须把学习者实际字段按顺序组合，验证它们无需额外解释即可成为完整、准确、可执行并能得到本课目标输出的 AI 任务；若缺真实输入材料必须补为字段。Reference Fill 与 Reference Answer 必须表达同一标准任务，Reference Answer 不带字段主标题。
- Step 6 的触发情境必须描述学习者未来会真实遇到的具体场景，并与 Next Lesson Value 分开存放和展示；若内容只是“本课使用某知识 / 上一课已学某知识 / 下一课继续某知识”，视为 CAPABILITY_TRIGGER_FAIL。
- Human Review 必须检查是否出现模板漂移：把某一课的案例结构、字段数量、Review 数量或生产术语复制成其他课程的默认结构；Step 5 只有“AI适合做什么 / AI不应该替你做什么”两个核心复盘方向是固定的，主卡片数量、具体回答和下方说明数量都必须由课题决定；同时检查是否错误删除主卡片后的说明层、把说明固定成某个条数，或让上下两层机械重复；并检查 `Beginner`、`Schema`、过程英文标签等是否在没有教学必要时泄漏到学员端。

Human Review FAIL：
```text
IN_PRODUCTION
→ Rework Draft
→ Code Validation
→ Preview
→ Human Review again
```

FAIL 不自动改变 Curriculum identity，也不允许通过修改 Catalog lessonId 逃避重做。

### 3.5 RUNTIME_READY — governance gate

必须证明：
- lesson 已接入正式 Generic Lesson Runtime；
- Runtime 使用正确 Lesson Type / Gate；
- CHECK / PRACTICE / REAL_AI / DELIVERABLE 等 Gate 按正式 Core 规则工作；
- Preview-only 数据没有被当作正式状态；
- runtimeCourseSlug / runtimeLessonId 映射明确；
- 必要 migration 已处于允许上线的状态；
- Runtime smoke / acceptance PASS。

若某 Gate 尚未有可信 Runtime resolver，例如 PROJECT Deliverable，课程不得声称 RUNTIME_READY。
对于 CONCEPT 的非 Gate Step 4 participation：
- Preview 可以使用受控本地 participation 验证教学体验；
- 正式 Runtime Provisioning 必须证明该 participation 已有正式数据来源与渲染路径；
- 如果正式 Runtime 只支持 CHECK，而 Step 4 participation 尚未 provision，则该课不得标记 RUNTIME_READY；
- 不允许用 Preview-only participation 冒充正式 Runtime 能力。

### 3.6 AVAILABLE

只有 Human Review PASS + RUNTIME_READY 后才能进入。

AVAILABLE 表示：
- 正式课程已经发布；
- Catalog 可进入正式 Runtime；
- Progress / Completion 来自正式 Runtime；
- 不再是 Preview 候选。

AVAILABLE 不代表课程永远不能更新；后续更新必须进入新的内容版本 / Skill version / Review cycle。

## 4. Preview boundary

Draft Preview 只用于 Human Review：

```text
Draft Content
→ Generic Lesson Shell Preview
→ Human Review
```

Preview 必须：
- 复用 Unified Lesson Shell；
- 不写正式 Progress；
- 不写正式 Completion；
- 不伪造 Runtime Ready；
- 不因 local evaluator PASS 自动进入 AVAILABLE。

## 5. Provenance requirement

每个进入生产的 Lesson 必须能追溯：

```text
canonicalLessonId
curriculumSource / curriculumVersion
briefSource / briefVersion
productionBatchId
skillId
skillVersion
qualityStandard / qualityProfile
draftVersion
humanReviewStatus
humanReviewReference / notes
runtimeVersion or runtimeContractVersion
runtimeReadiness
availability
```

原则：
- 一次 generation attempt 只能使用一个明确的 Skill Version；
- 不允许 `course-builder v0.1 + v0.2` 复合生成；
- 当前新正式课程默认通过 `skills/course-builder/index.ts` 解析 Current Skill；当前为 `course-builder@1.0.0`；
- v0.1 / v0.2 仅用于历史 provenance / legacy compatibility；
- Skill Version 与 Draft Version 分开；
- Skill 升级不会自动改变历史 Lesson Draft。
- Skill / Orchestrator / Deterministic Validators / Human Review Policy 的内部升级不要求修改 Workflow；只有稳定 Contract breaking change、正式 Gate 增删或 Gate 顺序变化才升级 Workflow。

## 6. Production batch rule

正式 Curriculum scope 与生产批次必须分离。

当前 Foundation 固定：
- 完整知识地图可以有 28 节；
- Production Batch 默认 3–5 节；
- Batch 只是开发、Review、验收单位，不重新定义 Curriculum 范围。

Stage 2 当前 4 节可以作为一个完整 Production Batch。

禁止因为“本批只有 4 节”而删除后续 Curriculum，也禁止一次生成整个 28 节来减少任务数。

## 7. Rework and version rules

### Content problem

若 Human Review 认为内容不好：
- 保持 canonical lesson identity；
- 新建/更新 Draft Version；
- 回到 IN_PRODUCTION；
- 重新 Preview + Human Review。

### Skill problem

若发现某类输出持续不好：
- 不在课程任务里静默修改 Skill Prompt；
- 单独创建 Skill improvement task；
- 产生新 Skill Version；
- 用真实样本重新 acceptance；
- 后续 generation attempt 明确选择新版本。

### Architecture problem

若课程需求超出现有 Lesson Spec / Shell / Runtime：
- Course Skill 只能提出 Proposal；
- 另开 UX / Runtime / Schema engineering task；
- 当前课程保持 IN_PRODUCTION；
- 不允许 Skill 自己扩架构。

## 8. Course production task gate

任何正式课程生产任务开始前必须明确：

```text
Canonical Lesson IDs
Formal Brief Source
Production Batch
Skill Decision: CODE_ONLY / EXISTING_SKILL / NEW_SKILL_NEEDED
Selected Skill ID / Version
Quality Standard / Profile
Grounding Source
Target Preview
Human Review Required
Runtime Scope
Out of Scope
Acceptance
```

对于当前新正式课程：
- Skill Decision = EXISTING_SKILL；
- Selected Skill = 由 `skills/course-builder/index.ts` 解析，当前为 `course-builder@1.0.0`；
- Human Review = REQUIRED；
- Runtime publication 不与内容生产任务自动绑定。

## 9. Publication authority

Skill / Preview / Code Validation 都无权发布。

固定权限链：

```text
Human Review PASS
→ Runtime Ready
→ Core / Admin publication action
→ AVAILABLE
```

后台审核逻辑保持不变。

## 10. Anti-drift rules

- Catalog presence != Lesson exists in Runtime；
- BRIEF_READY != generated；
- IN_PRODUCTION != approved；
- Human Review PASS != Runtime Ready；
- Runtime Ready != automatically published；
- Preview URL != formal learning URL；
- technical PASS != pedagogy PASS；
- legacy lesson route != current Curriculum truth；
- Skill output != Production Data；
- one production attempt = one explicit Skill Version.
