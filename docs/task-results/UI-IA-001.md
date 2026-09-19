# UI-IA-001 — Learning / Practice Navigation Refinement

Status: COMPLETE

## Goal

修正学习路径与进阶练习中的跨模块误跳转，让“查看更多”进入对应内容的独立集合页，并为最新技术内容提供独立文稿详情页。

## Changes

### 实操项目

学习路径中的：

```text
实操项目 → 查看更多
```

由原来的：

```text
/practice
```

改为：

```text
/projects
```

新增 `/projects` 全部实操项目列表页，集中展示所有 Stage Project；单个项目继续进入既有 `/projects/[slug]`。

### 最新技术实操

进阶练习中的：

```text
最新技术实操 → 查看更多
```

由原来的：

```text
/ai-daily
```

改为：

```text
/practice/latest
```

新增全部最新技术内容列表页。

新增：

```text
/practice/latest/[id]
```

作为独立最新文稿详情页。

### Card behavior

最新技术卡片不再直接嵌入 `PracticeSubmissionPanel`。

当前规则：

```text
卡片正文
→ 独立最新文稿详情

有关联 courseSlug + lessonId
→ 右下角显示「查看课程」
→ 进入对应 Lesson

无关联课程
→ 右下角显示「查看文稿」
→ 进入独立文稿详情页
```

因此“最新变化的阅读入口”和“课程学习入口”不再混成一个按钮。

## Product navigation rule

后续前端开发固定判断：

```text
查看更多
→ 优先进入当前内容类型自己的完整列表页

单条知识 / 新闻 / 最新文稿
→ 有足够独立信息时使用详情页

存在正式 Course / Lesson
→ 提供明确「查看课程」入口

不要因为已有页面相近，
就把用户跨模块跳到语义不同的 AI Daily / Practice / Learning Path 页面。
```

是否新增页面以“用户能否连续理解当前知识点与下一步操作”为判断标准，而不是以“少建一个路由”为目标。

## Data

现有 `KnowledgeItem` 增加可选 `body`，用于当前静态最新文稿详情示例。

没有修改 PostgreSQL Schema、Practice Runtime、Content Engine 或 Membership。

## Validation

```text
npm run typecheck   PASS
npm run build       PASS
```

Production build 当前生成 36 个页面，并确认：

```text
/projects
/practice/latest
/practice/latest/context-window-change
/practice/latest/workflow-tools
/practice/latest/evaluation-practice
```

Build 仍只有既有 CSS autoprefixer `end` mixed-support warning，不阻塞。

## Next

产品主线下一阶段仍为：

```text
MVP-011-B — Content → Knowledge Routing
```

本任务只修正前端信息架构，不改变 MVP-011 内容引擎顺序。
