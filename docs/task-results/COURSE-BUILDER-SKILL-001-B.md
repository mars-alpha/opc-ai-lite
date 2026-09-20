# COURSE-BUILDER-SKILL-001-B — Draft Preview & Human Review

Status: PREVIEW_READY

## Goal

让非技术产品负责人可以直接在浏览器里像学员一样体验 Course Builder 的真实 Draft，而不是阅读 TypeScript / JSON。

## Preview Route

`/course-builder/preview/skill-foundations`

预览课程：`Skill 是什么：把可复用方法交给 AI`。

## Safety Boundary

- Draft 仍来自 `fixtures/course-builder/skill-foundations.ts`；
- 未加入 `lib/courses.ts`；
- 未注册到 Lesson Spec Registry；
- 不写 PostgreSQL；
- 不保存 Progress / Completion；
- 不提交 Feedback；
- 不调用正式 Check API；
- 不发布课程。

`GenericLessonRuntimePanel` 新增 `previewMode`。Preview 下复用同一 Step Renderer，但 Runtime data 与选择题 Check 均为浏览器本地状态。

## Human Review

产品负责人只需按普通学员方式体验并判断：

1. 是否看得懂；
2. 是否过长、过技术或重复；
3. 案例与理解检查是否真正帮助理解；
4. 是否愿意继续下一课。

## Validation

- `npm run typecheck` PASS
- `npm run build` PASS
- build route includes `/course-builder/preview/skill-foundations`
- `npm run course-builder:accept` PASS
- Draft remains outside formal catalog / registry

## Next

等待 Human Review 反馈。Human Review 通过前，不进入 Provider / persistence / publish。
