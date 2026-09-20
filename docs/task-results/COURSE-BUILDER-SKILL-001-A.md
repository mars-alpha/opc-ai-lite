# COURSE-BUILDER-SKILL-001-A — Real Lesson Draft Acceptance

Status: TECHNICAL_ACCEPTANCE_PASS_HUMAN_REVIEW_PENDING

## Real Lesson

```text
Course: ai-literacy
Lesson: skill-foundations
Title: Skill 是什么：把可复用方法交给 AI
Type: CONCEPT
```

最初考虑 Agent 基础课，但读取真实课程目录后发现已有“API、Tool、MCP 与 Agent”。为避免课程重复，改用当前目录缺失且已确认需要学习的 Skill 基础概念作为首个真实 BUILD 样本。

## Draft Shape

```text
EXPLAIN
→ EXAMPLE
→ CHECK
→ REVIEW
→ CAPABILITY

Completion Gate = CHECK
Practice = NONE
REAL_AI = NONE
```

课程内容重点：

- Prompt 是一次任务说明，Skill 是可复用、可版本化的方法资产；
- Tool 解决“能做什么”，Skill 解决“应该怎么稳定做”；
- Agent 可以组合 Tool / Skill / Context，但 Skill 本身不等于 Agent；
- Code = Truth / Skill = Intelligence / Workflow = Controlled Bridge；
- 重复出现、输入输出稳定、又需要语义能力的任务才适合逐步沉淀 Skill。

## Acceptance Evidence

```text
npm run course-builder:accept

REAL_DRAFT_CODE_VALIDATION=PASS
REAL_DRAFT_CONCEPT_RULES=PASS
REAL_DRAFT_RUNTIME_PLAN=PASS
REAL_DRAFT_UNIFIED_SHELL_COMPATIBILITY=PASS
REAL_DRAFT_CURRICULUM_FIT=PASS
REAL_DRAFT_STATUS=PENDING_REVIEW
```

Course Builder regression 与 typecheck 同时 PASS。

## Important Boundary

这份 Draft 只存在于 `fixtures/course-builder/skill-foundations.ts`。

它没有：

- 写入 `lib/courses.ts`；
- 注册到 Lesson Spec Registry；
- 写入 PostgreSQL；
- 变成 Published Lesson；
- 修改 Access / Progress / Completion；
- 调用真实 AI Provider。

因此技术验收 PASS 不等于课程已发布。

## Finding

v0.1 Contract 对本次 CONCEPT 样本足够，没有发现需要立刻修改的结构性问题。

后续 APPLICATION / PRACTICE 真实样本需要进一步验证 Check / Practice 的内部 Schema；当前 Course Builder v0.1 对 Check / Practice 的 Code Validation 主要验证存在性与 Lesson Spec 对齐，还没有建立更强的专用 Draft Schema。

## Next

Human Review 当前这份 `skill-foundations` BUILD Draft：

- 是否属于 AI Literacy；
- 难度是否适合基础用户；
- 与现有“API、Tool、MCP 与 Agent”是否衔接自然；
- 内容表达是否足够简单但不失真；
- Check 是否真正能验证理解；
- 是否值得成为正式课程。

Human Review 通过后，再决定是否进入 Draft persistence / Admin Review UI / Provider Runtime，而不是提前建设。
