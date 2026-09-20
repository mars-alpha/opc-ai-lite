# COURSE-BUILDER-SKILL-002-A — Real APPLICATION Lesson Acceptance

Status: TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING

## Goal

用第二节真实课程验证 Course Builder 对 APPLICATION 课程的生成、校验、练习和统一前端兼容能力。

主题：

Prompt（提示词）怎么写，AI 才更容易理解你

## Knowledge Grounding

研究资料包基于公开官方资料，核心共识包括：

- 指令需要清楚、具体；
- 提供足够上下文；
- 明确预期结果和输出形式；
- 根据输出继续迭代，而不是寻找所谓万能提示词。

Course Builder 本身仍不联网搜索；本任务只是把已研究并审核的资料包交给它使用。

## Lesson Experience

统一 6 步：

EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY

课程设计：

- Step 1：模糊提示 / 更清楚提示直接对比；
- Step 2：客户跟进邮件前后案例；
- Step 3：理解检查；
- Step 4：亲手把“帮我写活动方案”改成任务 / 背景 / 限制 / 结果四部分；
- 本地规则检查 Practice；
- 可把自己填写的内容合并复制到任意 AI 软件中测试；
- Step 5：复盘四个问题；
- Step 6：确认能力获得。

## Contract Upgrade

Course Builder v0.1 原先的 check / practice 只校验为任意对象。

本任务升级为最小明确结构：

Check:
- id
- question
- options
- correctValue
- explanation

Practice:
- id
- title
- goal
- instructions
- hints
- rubric
- passScore

同时校验正确答案必须存在于 options、Rubric key 必须对应 Practice 字段、分数范围合法。

## Completion Boundary

APPLICATION 使用：

- CHECK Gate
- PRACTICE Gate

realAiOperation=GUIDED
realAiEvidence=NONE

复制到真实 AI 软件属于教学体验，不作为可信 Completion 证据，不伪造 REAL_AI Gate。

## Preview

只读 Human Review：

/course-builder/preview/prompt-foundations

Preview 本地完成 Check / Practice 检查，不写正式 Runtime / Progress / Completion / PostgreSQL。

## Validation

- npm run typecheck PASS
- npm run course-builder:check PASS
- npm run course-builder:accept PASS
- npm run course-builder:accept:application PASS
- npm run build PASS
- 32 static pages generated
- git diff --check PASS

## Boundary

未加入正式课程目录。
未注册正式 Runtime。
未写数据库。
未调用真实 AI Provider。
未发布课程。

## Human Review Fix

- Check / Practice 底部反馈不再跨 Step 保留；切换步骤即清除上一节临时消息。
- Practice 本地检查未通过时显示完整参考答案。
- 提供“复制参考答案”按钮。
- 参考答案不会自动把 Practice 标记为通过，仍需用户修改并重新检查。

## Next

产品负责人直接体验 /course-builder/preview/prompt-foundations，重点判断 APPLICATION 是否真的带来“我会做了”的获得感。
