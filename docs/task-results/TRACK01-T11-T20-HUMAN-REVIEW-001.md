# TRACK01-T11-T20-HUMAN-REVIEW-001 — T1-11～T1-20 Batch Human Review

Status: **HUMAN_REVIEW_PASS**

Reviewed source: `fixtures/course-builder/track01-t111-t120.ts`
Course Builder Skill: `course-builder@1.0.0`
Input state: **DETERMINISTIC_VALIDATION_PASS**
Result: **10 / 10 HUMAN_REVIEW_PASS**

## 1. Review scope

本轮直接承接 `TRACK01-T11-T20-WORKFLOW-BATCH-001` 已生成并通过 Deterministic Validation 的 10 个 Draft，不重新生成 Formal Brief / Draft，不改变 Course Production Workflow。

Human Review 按 `LESSON_OUTPUT_CONTRACT_V1.md` 与 `BEGINNER_LESSON_QUALITY_STANDARD_V1.md` 审核真实教学质量：

- Step 1 是否只解决一个自然主问题；
- Step 2 是否用真实案例证明核心规律；
- Step 3 是否只检查已经教过的判断、误区和边界；
- Step 4 是否形成最小真实动作，字段只服务任务完整性；
- Step 5 是否留下以后可复用的具体判断，而不是定义复述；
- Step 6 是否同时具备可执行能力、自我验收、现实触发情境与自然下一步；
- learner-facing language 是否中文优先，是否泄漏工程实现或后续 Track 知识；
- Deferred Knowledge 是否继续留在后续 Track，而不是通过增加正文或 UI 塞回 Track 01。

## 2. Batch decision

| Lesson | Human Review | 关键结论 |
| --- | --- | --- |
| T1-11 API | PASS | Request / Response / interface boundary 清楚；案例与 Practice 均围绕跨系统真实数据，不展开 HTTP / Auth 工程。 |
| T1-12 Structured Output / Schema | PASS | 结构稳定与事实正确分开；Practice 能从后续用途倒推字段；字段示例改为自然中文，避免把代码命名当 Beginner 知识。 |
| T1-13 Function Calling / Tool Use | PASS | 模型判断与系统/工具执行职责清楚；实时数据与外部动作边界自然；SKU 改为“商品编号”。 |
| T1-14 MCP | PASS | API / Tool / MCP 三层边界清楚；只建立统一连接直觉，不展开 Server / Client / Transport / Auth。 |
| T1-15 Skill | PASS | 重复且稳定的方法才值得沉淀；单一职责、输入、输出、禁止动作形成完整最小判断。 |
| T1-16 Workflow / Automation | PASS | “先证明流程，再自动化”明确；能区分规则代码、AI、工具和人工节点，不展开队列 / 状态机等工程。 |
| T1-17 Agent | PASS | Agent 与固定 Workflow 的核心差异落在动态下一步；Human Review 将 learner-facing 循环改为中文优先，并补回“当前状态与观察”。 |
| T1-18 Multimodal | PASS | 模态由任务信息价值决定，不以数量为质量指标；未展开 OCR / ASR / TTS Pipeline。 |
| T1-19 Coding / Browser / Computer Use | PASS | 能力地图与“最低必要复杂度”判断清楚；优先稳定 API / 代码，不把界面操作当默认高级方案。 |
| T1-20 Privacy / Permissions / HITL | PASS | 隐私、最小权限、高影响动作和人工确认形成 Track 01 收束；Core Authority 仍由系统/业务规则掌握。 |

## 3. Targeted Human Review revisions

本轮没有改课程框架、UI、CSS、Renderer 或交互类型，只修改 Draft 内容数据。

### 3.1 Step 6 reality trigger — all 10 lessons

原 Batch Draft 已有 Capability Gain、2 条 Self Assessment 与 Next Lesson Value，但缺少 `BEGINNER_LESSON_QUALITY_STANDARD_V1` 要求的独立现实触发情境。

修正方式：复用现有 `selfAssessment` 展示能力，为每节课增加第三条 learner-facing trigger，不新增 Schema / UI：

- T1-11：当 AI 要读取另一个系统的真实数据或能力时，先想到接口边界；
- T1-12：当 AI 结果要交给程序继续处理时，先想到稳定字段与最小规则；
- T1-13：当任务依赖实时数据或外部动作时，先判断是否需要工具；
- T1-14：当连接对象越来越多时，先区分接口、工具能力与统一连接问题；
- T1-15：当方法反复出现且规则稳定时，判断是否值得沉淀成 Skill；
- T1-16：当重复任务准备自动化时，先拆清步骤、执行者和停止/确认边界；
- T1-17：当下一步依赖中间结果、无法预先写死时，判断是否真正需要 Agent；
- T1-18：当任务包含多种媒体时，先选择最能保留关键信息的模态；
- T1-19：当 AI 从回答走向执行时，优先最低必要复杂度、稳定且可验证的执行路径；
- T1-20：当 AI 读取敏感数据或执行高影响动作时，先检查最小权限与人工确认点。

### 3.2 Beginner learner-facing language

1. T1-12：Practice 字段示例 `customer_name / interest / next_action` 改为“客户姓名 / 客户意向 / 下一步行动”，把代码式命名留给后续工程 Track。
2. T1-13：`商品 SKU` 改为“商品编号”，避免在 Tool 边界课引入不必要业务术语。
3. T1-17：`Goal / Observe / Decide / Act / Stop` 改为中文优先的“目标（Goal）/ 当前状态与观察（Observe）/ 判断与行动（Decide / Act）/ 停止条件（Stop）”，同时让 Practice 明确先看当前状态再观察结果，不把英文流程词当作记忆任务。

## 4. Deferred knowledge review

PASS。

`docs/learning/DEFERRED_KNOWLEDGE_LEDGER_V1.md` 已再次核对。API integration、Schema engineering、Tool reliability、MCP implementation、Skill lifecycle、Workflow orchestration、Agent engineering、Multimodal pipeline、Browser / Computer Use automation、企业权限与安全治理继续属于 Track 02～05 的规划输入。

Human Review 没有通过“加更多知识”解决课程问题；所有发现都优先通过语言、案例、动作与边界修正解决。后续 Track 02～05 必须重新通过 Six-step Knowledge Point Gate，Ledger 条目不自动升级为正式 Lesson。

## 5. Frontend boundary

PASS。

本轮：

- 没有新增 UI；
- 没有新增 Renderer；
- 没有新增 lesson-specific component；
- 没有新增 interaction type；
- 没有调整 CSS；
- 继续使用现有 Unified Lesson Shell。

## 6. Gate decision

**HUMAN_REVIEW_PASS — 10 / 10**

T1-11～T1-20 允许进入：

`LessonSpec Registry → Runtime Provisioning → Runtime Acceptance`

Human Review PASS 不等于 AVAILABLE。任何课程在正式 Runtime 中仍必须完成 Registry、Provisioning 与 Runtime Acceptance，不能绕过 Gate。
