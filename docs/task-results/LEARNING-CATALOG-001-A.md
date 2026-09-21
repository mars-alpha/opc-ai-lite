# LEARNING-CATALOG-001-A — Navigation & Progress Refinement

Status: COMPLETE_UI_REFINEMENT_V1

## Result

Human Review feedback applied to /learning-path:

- 五大长期学习板块已移动到 Foundation 课程目录上方，作为一级课程导航。
- 当前板块 AI 基础认知高亮显示；其余四个板块显示后续开放，不创建空页面。
- Foundation 区域改为桌面端左侧进度面板 + 右侧 7 Stage / 28 Lesson 目录。
- 手机端自动改为进度面板在上、目录在下。
- 左侧进度面板使用圆环显示当前学习板块完成百分比，并显示已完成 / 已开放 / 总课程。

## Progress authority

进度只统计同时满足：
1. availability = AVAILABLE
2. 已绑定正式 runtimeCourseSlug + runtimeLessonId
3. ProgressProvider 返回该正式课时已完成

PLANNED / BRIEF_READY / COMING_SOON 课程不会进入进度分母，也不会制造假完成率。

当前 Foundation 没有 AVAILABLE 正式课程，因此页面正确显示 0%，并提示课程按批次开放。

## Validation

- npm run typecheck: PASS
- npm run build: PASS
- 仅保留仓库已有 autoprefixer warning
- no DB / migration / provider / publish changes

## Human Review

Open: http://localhost:3001/learning-path

重点检查：
- 五大板块作为一级导航是否足够清晰
- 左侧圆环进度大小和信息密度是否合适
- 右侧 Stage 目录与左侧进度是否平衡
- 手机端堆叠是否自然
