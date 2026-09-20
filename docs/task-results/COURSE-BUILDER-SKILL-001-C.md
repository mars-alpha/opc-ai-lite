# COURSE-BUILDER-SKILL-001-C — Beginner Pedagogy & Knowledge Grounding

Status: COMPLETE

## Goal

把 Course Builder 从“结构正确的课程草稿生成器”升级为更适合普通初学者的教学生成器，同时明确知识研究与课程生成的职责边界。

## New Rules

1. 先有可信知识，再生成课程。BUILD 必须使用已审核 Knowledge 或 Research Packet。Course Builder 不得声称自己已经联网搜索、爬取或核验系统未提供的资料。
2. 中文优先。初学者课程优先使用自然中文；必要专业词第一次使用“中文名称（英文名或缩写）”，后续尽量只用中文。
3. AI 软件中立。通用课程使用“你正在使用的 AI 软件 / 常用 AI 工具”，只有课程专门教学某个产品时才绑定具体产品名。
4. 基础概念课也必须参与。CONCEPT 必须提供低门槛 participation，可使用选择、判断、分类、短答、复制到自己的 AI 软件、结果对比、点击揭晓或小任务。Participation 不自动成为 Completion Gate。

## Knowledge Workflow

公开资料 / 已审核知识
→ 研究与核验
→ Reviewed Knowledge / Research Packet
→ Course Builder
→ Code Validation
→ Human Review
→ 后续正式课程流程

## Real Lesson Rewrite

ai-literacy/skill-foundations 已重写：

- 标题：技能（Skill）是什么：把常用方法教给 AI
- 主案例：每周会议记录整理
- 去掉 Course Builder 工程实现作为主案例
- 不要求编程基础
- 使用提示词（Prompt）、工具（Tool）、智能体（Agent）的首次中文说明
- 加入“复制到你正在使用的 AI 软件”参与活动
- Check 改为客户反馈分类的生活化判断
- 不包含 ChatGPT 默认绑定

研究资料包使用 OpenAI 官方公开资料，核心共识：技能用于把重复任务的方法、指令和配套资源组织成可复用工作流程；不同产品实现可以不同。

## Validation

- npm run course-builder:check PASS
- grounding required PASS
- Chinese-first PASS
- AI-tool-neutral PASS
- participation required PASS
- npm run course-builder:accept PASS
- Beginner pedagogy PASS
- npm run typecheck PASS
- Draft remains PENDING_REVIEW and outside formal catalog / runtime registration

## Boundary

本任务没有新增网络爬虫、真实 AI Provider、PostgreSQL 写入、正式 Runtime 注册、课程发布，也没有修改 Access / Progress / Completion authority。

## Next

产品负责人重新打开 /course-builder/preview/skill-foundations，以普通新手身份体验改造后的课程并给出 Human Review。
