# COURSE-BUILDER-SKILL-002-E — Formal Check Types Runtime Completion

Status: CODE_COMPLETE_LOCAL_MIGRATION_READY_REMOTE_PENDING

## Goal

让课程设计可以直接使用三种正式 Check 题型：SINGLE_CHOICE、TRUE_FALSE、MULTI_SELECT，不再只停留在 Draft Preview。

## Formal Runtime

- 正式 Check Runtime 返回 type。
- SINGLE_CHOICE / TRUE_FALSE 使用 radio。
- MULTI_SELECT 使用 checkbox。
- API 同时接受 answer 与 answers。
- 单选 / 判断必须只有一个答案。
- 多选去重后按答案集合完全一致判分：少选失败，多选错误项失败，顺序不影响结果。
- 已登录用户保存规范化后的 answers；Runtime 重新读取时恢复已有选择。
- CHECK Completion Gate 仍只在判分正确后满足。

## Backward Compatibility

旧结构保留 lesson_checks.correct_answer 与 lesson_check_responses.answer；新增 lesson_checks.correct_answers 与 lesson_check_responses.answers。旧数据没有 correct_answers 时自动回退为 [correct_answer]。

Course Builder 新增 courseBuilderCheckToRuntimeSeed()，把已校验的 Draft Check 转成正式 Runtime seed 结构。

## Migration

已生成本地 migration：drizzle/0010_famous_blockbuster.sql。

内容：lesson_check_type 增加 TRUE_FALSE / MULTI_SELECT；lesson_check_responses 增加 answers jsonb；lesson_checks 增加 correct_answers jsonb。

本任务没有执行 npm run db:migrate，远程 PostgreSQL 仍停在 0009。因此 Code / Schema / Migration = READY，Remote DB = 0010 PENDING。

## Validation

- learning:check-types:accept PASS
- learning:runtime:check PASS
- course-builder:accept:mastery PASS
- course-builder:check PASS
- CONCEPT / APPLICATION / PRACTICE / PROJECT acceptance PASS
- typecheck PASS
- build PASS
- 34 static pages generated
- git diff --check PASS

## Boundary

未执行远程 migration；未修改 Completion Gate 语义；未发布新课程；未连接 AI Provider。