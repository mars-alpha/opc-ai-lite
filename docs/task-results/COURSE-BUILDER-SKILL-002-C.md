# COURSE-BUILDER-SKILL-002-C — Six-Step Knowledge Responsibility Contract

Status: COMPLETE

## Goal

把已经通过 Human Review 的六步教学职责固化进 Course Builder Contract，避免后续课程生成时重新漂成“每一步都在讲说明”。

统一六步：

EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY

## Responsibility Contract

### EXPLAIN

建立一个核心直觉：
- 这个主题解决什么问题；
- 最重要的判断原则是什么；
- 必要时指出一个最常见错误直觉。

避免一次堆入多个新概念、长篇说明或把后续方法全部提前讲完。

### EXAMPLE

通过真实案例展开：
- 方法；
- 前后对比；
- 为什么有效；
- 适用边界；
- 更深知识。

较深知识优先放这里，而不是继续塞进 EXPLAIN。

### CHECK

验证理解：
- 具体情境；
- 正确答案解释；
- 条件允许时说明错误选项为什么不成立。

不得突然加入大量未教过的新理论。

### PRACTICE

把知识转成能力：
- 清晰任务；
- 字段 / 步骤提示；
- Hint；
- 必要时参考答案；
- 进阶提示可选。

选做内容不得偷偷升级成新的 Completion Gate。

### REVIEW

把零散知识收束成以后可复用的判断 / 诊断框架，而不是重复前文或重新堆知识卡片。

### CAPABILITY

明确：
- 现在会什么；
- 马上能用在哪里；
- 下一步学什么。

不在最后一步引入新的核心理论。

## Contract Implementation

CourseBuilderPedagogy 新增：

sixStepResponsibilities:
- EXPLAIN
- EXAMPLE
- CHECK
- PRACTICE
- REVIEW
- CAPABILITY

每一项必须包含：
- purpose
- include
- avoid

BUILD Draft 缺少任意一个 Step responsibility 时 Code Validation 直接拒绝。

Course Builder Skill systemPrompt 同步加入六步职责规则。

## Samples

- skill-foundations / CONCEPT：已接入六步职责。
- prompt-foundations / APPLICATION：已接入六步职责。
- Course Builder validation fixture：已接入六步职责。

## Acceptance

APPLICATION acceptance 检查：
- 六个责任 key 必须完整；
- 每项 purpose / include / avoid 都必须存在。

Course Builder contract check 额外验证：
- 缺少 CAPABILITY responsibility 时必须被拒绝。

## Boundary

未修改 Generic Lesson Runtime Completion 逻辑。
未新增 Lesson Type。
未新增 UI。
未写数据库。
未发布课程。
未接入真实 AI Provider。

## Validation

- npm run course-builder:check PASS
- npm run course-builder:accept PASS
- npm run course-builder:accept:application PASS
- npm run typecheck PASS
- npm run build PASS
- 32 static pages generated
- git diff --check PASS
