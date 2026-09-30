# COURSE.md — Course Domain Boundary

Status: **CURRENT**

本文件只定义 Course / Learning 的数据与状态权威。教学内容、六步责任和课程生产质量规则见 `docs/learning/COURSE_BUILD_STANDARD_V1.md`。

## 1. Canonical Structure

当前正式学习目录事实由代码 Catalog / LessonSpec Registry 拥有。

概念关系：

```text
Learning Track
→ Stage
→ Lesson
→ Check / Practice
→ Progress / Completion
```

具体 Track 01～05 当前目录见：
`docs/learning/TRACK_CONTEXTS_V1.md`

## 2. LessonSpec

LessonSpec 是正式课程 Runtime 的结构化内容契约。

必须：
- stable courseSlug / lessonId；
- six steps；
- Completion Gates；
- learning recommendation / navigation metadata；
- Check / Practice 引用；
- Runtime-compatible content payload。

课程生产规则不在 Domain 文档复制。

## 3. Runtime Authority

正式状态单一事实源：

```text
Lesson position / Completion → Learning Progress
Step 3 Check                 → server Check state
Step 4 Practice              → Practice Submission / Evaluation
Rating                       → Learning Feedback
Access                       → Entitlement / Access service
```

前端只保存尚未提交的局部 UI 状态，不建立第二套 passed / completed / access 事实。

## 4. Practice Model

Practice 统一业务类型：

```text
LESSON_PRACTICE
STAGE_PROJECT
LATEST_PRACTICE
```

共用 Submission / Evaluation 主链，不为 Stage Project 或 AI Hotspot Practice 建平行提交系统。

正式 schema / table 以当前 Drizzle Schema / Migration / TypeScript types 为准。

## 5. Completion

Lesson Completion 只能由服务端验证 required Gates 后写入。

- CHECK required → 必须满足正式 Check；
- PRACTICE required → 必须满足正式 Practice；
- review / relearn 不自动撤销历史 Completion；
- Preview 不得写正式 Completion / Progress。

## 6. Access

客户端通过统一 Access / Entitlement 决定是否可进入课程。

未来 Web / Mobile / 微信 / 抖音必须共用同一规则，不在客户端复制 Membership / Follow / Access 判断。

## 7. Content Freeze

当前 Track 01～05 共 81 节课程已上线并冻结。

没有显式重新开启课程生产：
- 不改课程目录；
- 不改知识点；
- 不改变六步；
- Runtime 修复不得顺手重写课程内容。

## 8. Current Owners

- Curriculum：`docs/learning/FORMAL_CURRICULUM_V1.md`
- Track Context：`docs/learning/TRACK_CONTEXTS_V1.md`
- Course Build：`docs/learning/COURSE_BUILD_STANDARD_V1.md`
- Shell：`docs/learning/UNIFIED_LESSON_SHELL_V1.md`
- Workflow：`docs/learning/COURSE_PRODUCTION_WORKFLOW_V1.md`
- 实际状态：TypeScript / Drizzle / PostgreSQL