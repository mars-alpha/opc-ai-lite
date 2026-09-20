# COURSE-BUILDER-SKILL-002-F — Three-Question Mastery Sequence

Status: COMPLETE_CODE_READY_REMOTE_MIGRATIONS_PENDING

## Goal

把 Step 3 CHECK 从单题扩展为新课程默认的三题理解闭环：

SINGLE_CHOICE → TRUE_FALSE → MULTI_SELECT

一次只显示一题。

## Learning Contract

三题职责固定：

- SINGLE_CHOICE / BEST_JUDGMENT：最佳应用判断。
- TRUE_FALSE / MISCONCEPTION：纠正常见误区。
- MULTI_SELECT / BOUNDARY_CONDITIONS：验证边界与组合条件。

三题不能只是换措辞重复同一知识点。

## Interaction

固定交互：

选择答案 → 检查答案 → 即时反馈。

- 答对：展示 correctFeedback，解释为什么正确以及判断规则，然后才出现“下一题”。
- 答错：展示 incorrectFeedback，解释误区和正确判断依据；不允许进入下一题，必须重新选择并答对。
- 三题全部答对后，Step 3 CHECK 才完成，才能进入 Step 4 PRACTICE。

这次按 Human Review 修正，没有采用“答错看完反馈也能继续”的较松规则。

## Course Builder

BUILD Draft 现在支持：

- legacy `check`：旧单题兼容。
- `checkSequence`：新三题 Mastery Sequence。

同一 Draft 不允许同时存在 check 和 checkSequence。

checkSequence 必须：

- 正好 3 题。
- 题型顺序固定 SINGLE_CHOICE → TRUE_FALSE → MULTI_SELECT。
- masteryRole 顺序固定 BEST_JUDGMENT → MISCONCEPTION → BOUNDARY_CONDITIONS。
- 每题显式提供 correctFeedback / incorrectFeedback。
- 正确反馈与错误反馈不能完全相同。
- 三题 question 不得完全相同。

Course Builder Skill Prompt 已明确：新课程默认使用三题 Sequence；旧单题只作为兼容。

## Runtime

正式 Runtime 复用现有 `lesson_checks` 多行 + `order`，没有新增题组表。

`courseBuilderCheckSequenceToRuntimeSeeds()` 可以将三题 Draft 转换成按 order=0/1/2、required=true 的正式 Runtime seeds。

Gate 语义：

- Legacy 单题：仍必须答对该题。
- Three-Question Mastery Sequence：三题都必须有正确响应才通过 CHECK Gate。

Interactive API 不会在答题前返回正确答案。答题后按结果返回对应 feedback。

## Real Sample

Prompt APPLICATION Draft 已升级为真实三题样板：

`/course-builder/preview/prompt-foundations`

可直接体验：单选 → 判断 → 多选；答错重试；答对后下一题。

其他 CONCEPT / PRACTICE / PROJECT 旧样板仍保留 legacy 单题用于兼容回归，但 Course Builder 对四种 Lesson Type 均支持三题 Sequence；后续新课程默认生成三题。

## Migration

之前本地已生成但未应用：

- `0010_famous_blockbuster.sql`：TRUE_FALSE / MULTI_SELECT + correct_answers / answers。

本任务新增本地：

- `0011_milky_sharon_carter.sql`：lesson_checks.incorrect_explanation。

没有执行远程 migration。当前远程 PostgreSQL 仍为 0009。正式环境启用本能力前需要按顺序执行 0010、0011。

## Validation

- course-builder:accept:three-question-mastery PASS
- course-builder:check PASS
- course-builder:accept PASS
- course-builder:accept:application PASS
- course-builder:accept:practice PASS
- course-builder:accept:project PASS
- course-builder:accept:mastery PASS
- learning:check-types:accept PASS
- learning:runtime:check PASS
- typecheck PASS
- build PASS
- 34 static pages generated
- git diff --check PASS

## Boundary

未执行远程 migration；未发布正式新课程；未连接 AI Provider；未改变 Step 4 责任边界。