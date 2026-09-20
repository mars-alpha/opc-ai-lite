# COURSE-BUILDER-SKILL-002-D — Concept Mastery Before Practice Contract

Status: COMPLETE

## Goal

把“四种 Lesson Type 的前 3 步必须把概念讲透，第 4 步再实操”固化进 Course Builder Contract。

## Contract

所有 BUILD Draft 的 pedagogy 必须：

- conceptMasteryBeforePractice=true
- Step 1 = EXPLAIN
- Step 2 = EXAMPLE
- Step 3 = CHECK
- Step 4 = PRACTICE

### Step 1 — EXPLAIN

必须让学习者先理解：

- 这是什么
- 为什么重要
- 解决什么问题
- 最重要的判断原则

### Step 2 — EXAMPLE

必须进一步讲透：

- 方法怎么用
- 为什么有效
- 什么时候用 / 不用
- 容易与什么混淆
- 常见错误是什么

### Step 3 — CHECK

用于验证“是否真正理解”，支持：

- SINGLE_CHOICE（单选）
- TRUE_FALSE（判断）
- MULTI_SELECT（多选）

题目必须基于前两步已经教过的知识，不得靠猜题或临时引入新核心理论。

### Step 4 — PRACTICE

只负责把前 3 步已经理解的知识转成能力。

允许：

- 字段 / 步骤提示
- Hint
- 参考答案
- 选做进阶提示

禁止：

- 首次教授新的核心概念
- 通过增加新 Gate 补前 3 步没有讲清的知识

## Check Contract

CourseBuilderCheck 新增：

- questionType
- correctValues

旧 Draft 如果没有 questionType，默认 SINGLE_CHOICE。
旧 correctValue 继续兼容并归一成 correctValues。

MULTI_SELECT 使用集合完全一致判分：
- 少选失败
- 多选失败
- 顺序不影响

TRUE_FALSE 必须正好两个选项。

## Preview

Generic Lesson Draft Preview 当前支持：

- 单选：radio
- 判断：radio
- 多选：checkbox

正式学习 Runtime / DB 的 Check 持久化仍保持旧单答案模型；本任务没有修改数据库、正式 Check API 或 Completion 语义。多选 / 判断先作为 Course Builder Draft Preview 能力和后续正式 Runtime 的输入契约。

## Four-type acceptance

已验证：

- CONCEPT
- APPLICATION
- PRACTICE
- PROJECT

四个真实 Draft 均携带 conceptMasteryBeforePractice=true，并保持 EXPLAIN → EXAMPLE → CHECK → PRACTICE 顺序。

## Validation

- npm run course-builder:check PASS
- npm run course-builder:accept:mastery PASS
- npm run course-builder:accept PASS
- npm run course-builder:accept:application PASS
- npm run course-builder:accept:practice PASS
- npm run course-builder:accept:project PASS
- npm run typecheck PASS
- npm run build PASS
- 34 static pages generated
- git diff --check PASS
