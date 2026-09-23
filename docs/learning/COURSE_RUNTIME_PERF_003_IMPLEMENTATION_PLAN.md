# COURSE_RUNTIME_PERF-003 — Static Shell / Dynamic State Split

Status: **COMPLETE / CODE_ACCEPTANCE_PASS**

## Goal

在不改变正式课程 UI、不改变六步教学结构、不削弱 Server / PostgreSQL 权威的前提下，把课程公共内容与用户个人 Runtime 状态从首屏关键路径中拆开。

目标链路：

```text
点击正式课程
→ Server 只完成 Session + Access
→ LessonSpec / Presentation 构建静态课程计划
→ FormalGuidedLessonView 立即稳定显示课程 Hero
→ AsyncLessonRuntimeShell 显示轻量“正在读取学习进度…”
→ Client 后台 GET /api/learning/runtime
→ 恢复 currentStep / Check / Practice / Completion / Rating
→ 引导式学习整块一次展开到正确 Step
```

## Implemented

- 正式 `foundation-ai` 课程页不再在 Server Render 阶段 await `getLessonRuntimeReadModel()`。
- `LessonRuntimePlan` 直接由已注册 `LessonSpec` 在 Server 侧同步构建，不依赖用户 Runtime 查询。
- 正式页面层固定为 `FormalGuidedLessonView → AsyncLessonRuntimeShell → GenericLessonRuntimePanel`；三者职责分别为静态 Hero、异步 Runtime bridge、唯一六步 Renderer。
- `GenericLessonRuntimePanel` 在 `initialRuntime=null` 时沿用现有 mount 后 Runtime fetch，并使用 `refresh(true)` 恢复个人学习位置。
- Runtime hydration 后通过 `onRuntimeChange` 同步给外层 Shell：
  - Completion button configuration readiness
  - Rating visibility
  - Rating eligibility
- Runtime 未恢复前只显示静态 Hero 与轻量“正在读取学习进度…”提示；`引导式学习` 整体不展开，避免先显示 Step 1 再跳到历史位置。
- `currentStep` 会话缓存只用于预定位；不得以缓存提前展开引导式学习。
- 旧 static renderer 已物理隔离到 `components/legacy-learning/`，只允许 `ai-literacy / chatgpt-worker / ai-workflow` 进入；正式组件不得 import legacy-learning。

## Authority Boundary

静态层可以直接渲染：
- Lesson title / summary
- Six-step structure
- Course Builder approved presentation
- Capability / review / reference content

动态个人状态仍只由 Server / PostgreSQL 决定：
- currentStep
- Check answers / passed
- Practice submission / evaluation
- Completion
- Real AI evidence
- Rating eligibility

前端只允许在 Server 返回后恢复这些权威状态；不得用静态内容推断 Gate PASS。

## Non-negotiable regression rule

正式课程页面禁止重新加入：

`await getLessonRuntimeReadModel(...)`

作为首屏 Server Render 的前置条件。

新增正式课程必须继续复用：

`LessonSpec → buildLessonRuntimePlan → FormalGuidedLessonView → AsyncLessonRuntimeShell → GenericLessonRuntimePanel`

## Acceptance

- `npm run typecheck` PASS
- `npm run build` PASS
- `npm run learning:formal-registry:check` PASS
- `npm run learning:runtime-perf003:check` PASS
- `npm run learning:course-interaction:check` PASS

真实体验验收重点：
1. 点击课程后 Shell / 正文出现时间；
2. 个人 currentStep 恢复时间；
3. Step 3 / Step 4 已完成状态恢复；
4. Completion / Rating 在 Runtime hydration 后正确恢复。

PERF-003 不承诺消除 Session / Access 本身的数据库 RTT；如首屏仍慢，下一步只分析 Server Session / Entitlement critical path，不把个人 Runtime 查询重新塞回首屏。
