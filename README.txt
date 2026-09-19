OPC AI 简版 — 当前仓库说明

当前正式应用：
- Next.js 15 App Router
- React 19 + TypeScript
- PostgreSQL + Drizzle ORM
- npm

正式启动方式：
1. 配置本地环境变量（参考 .env.example）
2. npm install
3. npm run dev

质量检查：
- npm run typecheck
- npm run build

数据库：
- npm run db:generate
- npm run db:migrate
- npm run db:seed

重要说明：
- app/、components/、lib/server/、drizzle/ 是当前正式系统主线。
- index.html、learning-path.html、ai-daily.html、practice.html、styles.css、script.js 是早期静态原型，仅保留历史/视觉参考，不是正式 Runtime。
- 当前系统事实以 docs/CURRENT_SYSTEM_FACTS.md 为准。
- 开发治理以 AGENTS.md 为准。
- 当前阶段与下一任务以 PROJECT_STATUS.md / TASKS.md 为准。
