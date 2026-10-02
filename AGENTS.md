# AGENTS.md — OPC AI 开发治理基线

本文件只定义仓库级开发治理。产品事实、课程规范和任务计划分别由各自 owner 维护，不在本文件复制正文。

## 1. 总原则

优先级：

```text
系统可运行
→ 当前事实正确
→ 当前任务闭环
→ 上下文最小化
→ 再增加功能
```

固定原则：
- 单一事实源优先，不维护同一事实的多份副本。
- 能删除旧分支就不叠加兼容层；能复用现有主链就不新增第二主链。
- 当前任务只加载会改变设计或验收结果的信息。
- 历史过程通过 Git 追溯，不作为 current context。
- 已确认 UI 与已上线课程默认为冻结资产。

## 2. 每个任务开始前

必读：

```text
git status
git log -1
AGENTS.md
docs/CURRENT_SYSTEM_FACTS.md
PROJECT_STATUS.md
TASKS.md
docs/DEVELOPMENT_OPERATING_MANUAL.md
```

然后只读取当前任务涉及的 owner、代码、Schema 和 API。

每个任务先区分：

```text
Must Know     会改变设计 / 实现 / 验收
Nice to Know  有帮助但不决定结果
Do Not Load   历史过程、旧批次、旧聊天、已废止方案
```

## 3. 当前事实 owner

```text
docs/CURRENT_SYSTEM_FACTS.md
→ 已经存在并正在运行的系统事实

PROJECT_STATUS.md
→ 当前阶段、健康状态、当前焦点

TASKS.md
→ NOW / NEXT / BACKLOG / Acceptance

docs/ARCHITECTURE.md
→ 稳定技术边界

docs/DEVELOPMENT_OPERATING_MANUAL.md
→ 开发规则、产品边界、技术选择、阶段验收与操作手册唯一 owner

docs/domains/*
→ 领域边界

docs/learning/*
→ 当前课程规范与 Curriculum

Git history
→ 历史实现、旧批次、旧验收、已删除文件
```

同一事实只能有一个正文 owner。其他文件只允许状态或路径引用。

## 4. 历史隔离

完成后的历史资产应退出 current tree，由 Git 追溯：
- Track/Batch Formal Brief、Human Review、一次性生产脚本；
- 已退役 acceptance / provisioning / pilot；
- 旧静态原型；
- 重复 Current Facts 的 task result；
- superseded 规则文件。

## 5. 课程构建唯一入口

课程任务第一份文件：

`docs/learning/COURSE_BUILD_START_HERE.md`

课程 current owners：

```text
docs/learning/COURSE_BUILD_START_HERE.md
docs/learning/COURSE_BUILD_STANDARD_V1.md
docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md
docs/learning/UNIFIED_LESSON_SHELL_V1.md
docs/learning/FORMAL_CURRICULUM_V1.md
docs/learning/FIVE_TRACK_CAPABILITY_CONTINUITY_V1.md
docs/learning/TRACK_CONTEXTS_V1.md
```

Track 01～05 已正式上线并冻结。除明确阻断或产品负责人显式重新开启：
- 不改课程目录；
- 不改课程内容；
- 不改六步 Shell；
- 不重新运行历史 Track/Batch provisioning；
- 不恢复旧 Preview / legacy renderer。

## 6. 课程生产主链

```text
LOAD_CURRENT_RULE_SOURCES
→ PREPARE_GROUNDING
→ PREPARE_FORMAL_BRIEF
→ RUN_COURSE_BUILDER
→ RUN_DETERMINISTIC_VALIDATORS
→ HUMAN_REVIEW_GATE
→ REGISTER_LESSON_SPEC
→ PROVISION_RUNTIME
→ RUN_RUNTIME_ACCEPTANCE
→ MARK_AVAILABLE
```

Workflow 不绑定 Track 或具体 Skill version。当前 Course Builder 只通过 `skills/course-builder/index.ts` 解析。

## 7. Core / Skill / Workflow

### Core
确定性能力用代码：
- CRUD、权限、状态、排序过滤；
- Schema、状态机、Gate；
- 发布、写库、版本、审计；
- Validator、Secret、多端 API。

### Skill
语义能力使用 Skill：
- 分类、摘要、改写、内容生成；
- 价值判断建议；
- 多资料综合；
- 图片/脚本/视频草稿。

Skill 必须版本化、有输入/输出 Schema，不直接拥有核心状态、不直接发布、不直接覆盖正式 Course / Knowledge / Practice。

### Workflow
Workflow 按确定顺序调用 Core 与 Skill 并控制 Gate。AI 不自行决定业务状态流。

## 8. 学习洞察 V2 current owners

学习洞察 / 课程反馈优化任务先读取：

```text
docs/learning-insight/LEARNING_INSIGHT_WORKBENCH_V2_PRODUCT_CONTRACT.md
docs/learning-insight/LEARNING_INSIGHT_AI_PROMPT_CONTRACT.md
docs/learning-insight/LEARNING_INSIGHT_STRUCTURED_OUTPUT_CONTRACT.md
docs/learning-insight/LEARNING_INSIGHT_DETERMINISTIC_VALIDATOR_CONTRACT.md
```

固定边界：
- 机械代码先完成采集、聚合、阈值、去重、课程定位、状态与校验；
- Human 拥有三次 Gate；
- AI 只做 Task A“诊断 + 列课程”和 Task B“单课程文本 Patch”；
- AI 不直接拥有 Learning Issue 状态、不直接写正式课程、不直接提交审核或发布；
- 最终只进入现有 Course Maintenance DRAFT；
- 不接入、不修改 Course Builder Workflow。

## 9. 三产品边界

固定分为：
- OPC AI 前台：学习与官方内容消费；
- 独立个人 AI 工作台：会员使用 AI 完成真实工作，不属于前台导航；
- 管理后台：平台运营、用户/会员、AI 能力配置、系统控制。

个人 AI 工作台属于会员权益；普通用户只消费已发布的 Workflow / Prompt / Skill 能力，不看到内部 Registry、Provider、数据库或审计。

完整需求、边界、技术选择、推荐理由、阶段顺序和验收规则只见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`。

## 10. UI 边界

Runtime、API、Schema、Skill、AI、后台任务默认冻结已确认前端。

修改前按：

```text
UI KEEP
Logic REWRITE
State DELETE
```

PC 当前布局不因 Mobile 工作顺手改变。Mobile 与小程序共享业务 Core / API / State。

### VISUAL_HUMAN_REVIEW_GATE

任何新增或修改的可视化页面、组件、布局、交互界面完成实现后，必须按以下顺序：

```text
IMPLEMENT
→ TYPECHECK / BUILD / DETERMINISTIC VALIDATION
→ LOCAL OR STAGING EXPERIENCE READY
→ USER EXPERIENCE REVIEW
→ EXPLICIT USER APPROVAL
→ MARK UI APPROVED
→ NEXT PHASE
```

固定规则：
- 未向产品负责人提供可实际体验的界面，不得把 UI 标记为正式完成；
- 未收到产品负责人明确审核确认，不得进入依赖该界面的下一开发阶段；
- 如果后端/数据库尚未就绪导致界面无法真实体验，状态只能是 `UI_IMPLEMENTED / REVIEW_BLOCKED`，不能视为 UI PASS；
- 用户审核提出修改后，修正并重新提供体验，直到明确确认；
- 非可视化 Core / Schema / Validator 工作可以继续完成当前同一任务的必要闭环，但不得借此绕过 UI Review Gate。

## 11. Secret / Provider

- API Key 不进入 Git、Prompt、日志、Analytics 或错误正文。
- 平台 Secret 优先环境变量 / 云 Secret Manager。
- 学员 BYOK 第一阶段默认不持久保存。
- 外部 Provider 通过 Adapter / Model Gateway，不在业务代码写死厂商。

## 12. Task Contract

每个实现任务必须先完成 `docs/DEVELOPMENT_OPERATING_MANUAL.md` 定义的 Decision Brief，至少明确角色、Product Surface、边界、Code / AI / Skill / Workflow / Human 分工、推荐方案与理由、Validation、Acceptance、Rollback 和 Owner。

当前闭环必需才实现；其余进入 Backlog。

## 13. 验收

业务代码至少：

```bash
npm run typecheck
npm run build
```

课程治理至少：

```bash
npm run learning:course-current-state:check
npm run learning:course-build-entry:check
npm run learning:course-governance:check
npm run learning:course-production-workflow:check
npm run learning:formal-registry:check
npm run scripts:current:check
```

文档治理：
- git diff --check；
- current owner 引用无断链；
- 无已删除 owner 的 current reference；
- 不新增重复事实文件。

涉及可视化界面时额外要求：
- `VISUAL_HUMAN_REVIEW_GATE` 已满足；
- 最终验收记录必须区分 `IMPLEMENTED` 与 `USER_APPROVED`；
- 没有用户明确确认时不得宣称视觉/交互“已验收完成”。

## 13. Done

任务结束确认：
- 改动只属于当前任务；
- current facts 与代码一致；
- 历史未回到 current path；
- Validator / Build 通过；
- 新规则只有一个 owner；
- 新对话只读少量 current 文件即可恢复状态。