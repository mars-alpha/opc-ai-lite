# LEARNING-CATALOG-001 — Formal Curriculum Catalog UI

Status: COMPLETE_UI_V1

## Result

正式 Foundation Catalog 已接入当前 Next.js 学习路径页：

- Route: /learning-path
- 7 Foundation Stages
- 28 Foundation Lessons
- F1-01～F1-04 显示 准备中 / 即将开放
- 其余 24 节显示 规划中 / 即将开放
- 当前没有 Foundation Lesson 标记 AVAILABLE
- 所有 COMING_SOON Lesson 均为非链接展示，不进入空 Runtime 页面

新增：
- lib/learning/foundation-catalog.ts：typed planning-data bridge
- components/FoundationCatalog.tsx：正式目录 renderer

更新：
- app/learning-path/page.tsx
- app/globals.css

旧 lib/courses.ts 不再作为 /learning-path 正式目录来源。

## Page alignment

原页面旧“六阶段 / 当前开放 3 阶段 / fallback StageProgress”已从正式 Learning Path 页面移除。

页面现在对齐长期主线：
1. AI 基础认知
2. AI 工作应用
3. AI 推广运营与业务增长
4. AI Workflow 与自动化
5. FDE / AI 解决方案落地

## Validation

- npm run typecheck: PASS
- npm run build: PASS
- build retains one pre-existing autoprefixer warning in globals.css
- no DB/provider/migration/publish change

## Human Review

Open: http://localhost:3001/learning-path

重点检查：
- 28 节目录是否过密
- Stage 分组是否清楚
- 标题 / 状态 / 时长是否容易扫读
- 手机端是否仍然轻量
- 五大长期学习板块是否应该保留在 Foundation Catalog 下方

## Next

Human Review first. After UI direction is accepted, proceed to Foundation Batch A real course production rather than expanding more catalog architecture.
