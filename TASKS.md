# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。历史任务、已否决方案和修改过程通过 Git 追溯。开发方法与阶段规则唯一 owner：`docs/DEVELOPMENT_OPERATING_MANUAL.md`。

# NOW — ADMIN-REMAINING-IA-REBUILD-001

目标：
继续完成管理后台其余界面的重构，先把整个 Admin IA、页面职责和交互基线收口，再进入个人 AI 工作台 Product Spec。

执行顺序：
1. `ADMIN-OFFICIAL-CONTENT-001` — 官方内容；
2. `ADMIN-COURSES-001` — 课程维护；
3. `ADMIN-LEARNING-INSIGHTS-001` — 学习洞察；
4. 其它已具备真实底层能力的后台页面按同一原则继续重构；
5. 整体 Admin 基线通过 Visual Human Review 后，才进入 `WORKBENCH-PRODUCT-SPEC-001`。

当前固定边界：
- 已确认的运营总览、用户与权益界面冻结，不因后续页面重构顺手改动。
- 未接通能力不提前创建正式页面或导航入口。
- `/admin/platform`、`/admin/memberships` 仅保留兼容重定向。
- AI 能力配置、系统管理、个人 AI 工作台当前不作为已交付页面。
- 每个后台页面独立完成 Decision Brief → TDD → Validator / typecheck / build → 本地体验 → Visual Human Review。

## ADMIN-OFFICIAL-CONTENT-001

- 只管理 OPC AI 官方日报、知识、练习候选及其来源、证据、状态、发布事实。
- 不管理普通用户素材与个人工作台内容。
- 保留 Source / Evidence / Content / Review / Publish Core 和 AI Run provenance。
- 页面收敛为“内容队列 + 当前内容工作区 + 来源/证据/状态 + 当前可执行动作”。
- 不再把旧阶段式流程作为页面主 IA。

## ADMIN-COURSES-001

- 默认以定位课程、查看状态/版本、受控维护为主。
- Track 01～05 课程内容与 Unified Lesson Shell 继续冻结。
- 不恢复旧流程条，不把 Raw JSON 作为普通管理员主界面。
- 正式课程内容修改仍必须走 Course Builder / Workflow / Human Review。

## ADMIN-LEARNING-INSIGHTS-001

- 聚合真实学习问题、质量风险和课程更新候选。
- 区分确定性事实聚合与 AI 诊断。
- Human 只决定是否形成课程更新任务；批准不自动修改课程。

# AFTER ADMIN BASELINE — WORKBENCH-PRODUCT-SPEC-001

仅在整个管理后台基线确认后进入个人 AI 工作台设计与实现。

# BACKLOG

- AI Registry / Models / Connectors 管理界面；
- System 运行状态 / 审计 / 管理员权限 / Feature Flag；
- 公众号真实 Follow Entitlement；
- Unified Identity；
- Order / WeChat Pay；
- Mobile Web；
- 微信小程序；
- 抖音小程序；
- 独立 Worker（达到真实拆分阈值后）；
- pgvector（真实语义检索需求出现后）；
- Redis / Queue（真实吞吐需要后）；
- 独立工作台子域 / 独立部署（出现独立发布与扩缩容需求后）。
