# OPC AI 简版

当前生产站：`https://opcai.fun`

## 从哪里开始

开发任务：
1. `AGENTS.md`
2. `docs/CURRENT_SYSTEM_FACTS.md`
3. `PROJECT_STATUS.md`
4. `TASKS.md`

课程任务额外先读：
`docs/learning/COURSE_BUILD_START_HERE.md`

开发规则、技术选择与阶段操作手册：
`docs/DEVELOPMENT_OPERATING_MANUAL.md`

上下文治理：
`docs/CONTEXT_GOVERNANCE.md`

## 当前状态

- Track 01～05 共 81 节正式课程已上线并冻结。
- PC 当前确认版式冻结。
- Repository Governance 已完成；当前以三产品边界与开发操作手册作为后续开发基线。
- 历史批次、旧验收与旧原型通过 Git history 追溯，不保留为 current context。

## 常用验证

```bash
npm run typecheck
npm run build
npm run learning:course-current-state:check
npm run learning:course-build-entry:check
npm run learning:course-governance:check
npm run learning:course-production-workflow:check
npm run learning:formal-registry:check
npm run scripts:current:check
npm run governance:repository:check
npm run governance:development:check
```
