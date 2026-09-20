# LEARNING-SPEC-001 — OPC Course Construction Specification

Status: COMPLETE

## Goal

把前期 Guided Learning 人工体验形成的产品规则，上升为 OPC 全部课程未来可复用、可机器读取、可被 Course Builder Skill 遵守的正式建造规范。

## Deliverable

新增正式规范：

- `docs/LEARNING_SPEC.md`

规范覆盖六阶段能力地图、AI 基础必懂概念、四类 Lesson Type、标准 Lesson Flow、Practice Closure、学习回顾、能力获得、提示与参考答案、真实 AI 操作三态、反馈与 Access 规则、机器可读 Lesson / Step Spec 草案、Course Builder Skill Contract 与课程维护策略。

## Key Decisions

### Course Structure

```text
Stage 1–3
→ 学会 AI 基础能力

Stage 4–6
→ 推广运营 / AI Solution Builder / FDE 业务拓展与落地
```

AI 基础必须理解 LLM、Prompt、Context / Token、多模态、Knowledge Base、RAG、API、MCP、Skill、Agent、Workflow，但它们属于稳定核心知识，不等于新的一级课程类型。

### Lesson Types

```text
CONCEPT
APPLICATION
PRACTICE
PROJECT
```

### Standard Flow

```text
理解
→ 案例
→ 理解检查
→ 自己做 / 检查 / 修改 / 通过
→ 学习回顾
→ 能力获得
→ 点击下一课
→ 可选课程评分
→ 下一课
```

不是所有 Lesson 机械使用完整 6 步；按 Lesson Type 选择必要模块，但 Skill 只能从正式 Spec 组合结构。

### Real AI Operation

废弃“可选加入外部 AI”的概念。

```text
NONE
GUIDED
REQUIRED
```

真实 AI 操作只能由 Learning Objective 触发；只有“不实际操作就无法证明学会”时才可 REQUIRED。

### Skill Boundary

```text
Course Builder Skill
= BUILD / IMPROVE

Skill
→ Structured Draft / Proposal
→ Schema Validation
→ Rule Validation
→ Human Review
→ Core writes Production Data
```

Skill 不得直接 Publish、改 Access、改学习进度、改 Completion、改 Schema 或覆盖 Published Course。

## Out of Scope

- No business code
- No Schema / Migration
- No batch course migration
- No Course Builder Skill implementation
- No Mastery / Recommendation Engine
- No Access Core change

## Next

```text
LEARNING-UX-001-D — Reference Lesson Finalization
→ task-brief 按 Spec 完成最终交互
→ 2–3 节不同 Lesson Type 验证
→ COURSE-BUILDER-SKILL-001
→ 稳定后批量完善课程
```
