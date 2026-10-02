# TASKS.md

> 只保留 NOW / NEXT / BACKLOG。实现事实见 `docs/CURRENT_SYSTEM_FACTS.md`；开发方法见 `docs/DEVELOPMENT_OPERATING_MANUAL.md`；历史通过 Git 追溯。

# NOW — FINAL PROJECT CLOSEOUT

- Learning Insight V2 已完成真实闭环、Issue Cycle、课程维护发布与前台跨页面同步收口；左侧正式命名为“课程诊断”，状态列表按确定性排列顺序检查。
- “用户与权益”历史测试账号已清除：11 个 `test-*@dev.opcai.local` 测试用户及其测试权益和对应 USER 审计记录已删除，真实管理员账号保留。
- “运营总览”已重新对齐当前事实：用户 / 会员 / 待处理内容实时读取数据库；正式课程固定读取 5 Track / 81 Lesson；课程提醒直接读取 Learning Insight 当前 Course Health，不再使用旧 qualityRisk 汇总口径。
- 当前最终回归以 current validators、Typecheck、Production Build、数据库目标检查、跨页面 smoke 与 Git diff 审计为提交 Gate。
- 本轮不新增 UI、不调整 CSS；历史一次性测试脚本、临时数据与过期描述退出 current tree，由 Git history 追溯。

# NEXT

1. 真实学习数据达到确定性阈值后，执行首个 Production AI Update 端到端发布验收。
2. 后续功能继续按 `docs/DEVELOPMENT_OPERATING_MANUAL.md` 的 CURRENT 阶段与 BACKLOG 进入，不恢复已清场的模拟数据或历史开发主链。

# BACKLOG

- AI Registry / Models / Connectors 管理界面；
- System 运行状态 / 审计 / 管理员权限 / Feature Flag；
- 公众号真实 Follow Entitlement；
- Unified Identity；
- Order / WeChat Pay；
- Mobile Web、微信小程序、抖音小程序；
- 独立 Worker / pgvector / Redis / Queue（达到真实需求阈值后）；
- 独立工作台子域 / 独立部署（出现独立发布、团队或扩缩容需求后）。
