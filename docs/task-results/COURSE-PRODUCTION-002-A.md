# COURSE-PRODUCTION-002-A — Beginner Batch A Experience Restoration

Status: COMPLETE_EXPERIENCE_RESTORED_V1

## Goal

不改变 CURRICULUM-005 Beginner-first 内容方向，只恢复此前 Human Review 已验证通过的课程体验增强层。

## Restored experience

四节 Beginner Batch A 现统一恢复：
- Step 1 bottomDetails 轻量补充解释；
- Step 2 previewKnowledgeDepth.example 案例后的边界/易错点；
- Step 5 previewKnowledgeDepth.review 复盘判断框架；
- previewReviewCardFill 完整 Review Card 布局。

APPLICATION 课程额外恢复：
- F1-01 beginner-ai-use-cases：参考答案一键填充；
- F1-02 beginner-ai-result-quality：参考答案一键填充；
- F1-02 恢复 COPY_TO_AI，可把自己补清楚后的任务复制到真实 AI 软件比较结果。

## Architecture

BeginnerFoundationDraftPreview 通过 Generic Lesson Runtime 已有 props 接收 previewReferenceFill / previewKnowledgeDepth / previewReviewCardFill / previewIntroComparison.bottomDetails。

未新增 lesson slug 分支，未修改 Unified Lesson Shell，不形成第二套课程 UI。

## Beginner constraints preserved

- 一节只解决一个学习者问题；
- 每节最多 1–2 个新核心术语；
- 不重新引入 Training / Inference / Token / Embedding / API / Tool / MCP / Agent Runtime；
- 增强层只用于讲透、边界、参考与复盘，不扩张理论范围。

## Validation

- Beginner Batch A acceptance: PASS
- Beginner Batch A Experience Restoration: PASS
- Course Builder Contract: PASS
- Unified Lesson Shell acceptance: PASS
- npm run typecheck: PASS
- npm run build: PASS
- no DB / migration / provider / publish side effect

## Human Review

继续使用 COURSE-PRODUCTION-002 的四个 Preview URL。

重点判断：
1. 内容仍然是否保持零基础易懂；
2. 增强后是否比上一版更讲透但没有重新变理论化；
3. F1-01 / F1-02 参考填充是否真正降低实操门槛；
4. Review Card 与案例深度是否让课程更完整而不显拥挤。
