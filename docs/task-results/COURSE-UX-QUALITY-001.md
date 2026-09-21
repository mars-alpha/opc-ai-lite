# COURSE-UX-QUALITY-001 — Beginner Lesson Quality Pass

Status: COMPLETE_QUALITY_BASELINE_V1

## Goal

以 Beginner Batch A 四节课作为后续课程生产样板，在不增加理论复杂度的前提下完成最后一轮教学质量打磨。

## Quality improvements

### First-screen clarity

- 保持真实场景 → 对比 → 一句结论；
- Step 1 补充说明最多 2 条；
- 不再把补充内容继续堆成新的概念卡片。

### Step 2 “原来如此”

- 每节只保留一个主要案例；
- Knowledge Depth 最多 2 条；
- 用“改变一个关键条件 → 结果变化”解释原因，不扩张理论范围。

### Step 3 realistic judgment

- 保持 Three-Question Mastery；
- 题目继续使用真实工作/使用场景；
- 不考专业术语定义；
- 清理 F1-04 Check 中提前出现的 API 等后置术语。

### Step 4 accomplishment

- F1-01 / F1-02 继续使用 GUIDED Practice；
- 保留 Hint / Reference Fill；
- F1-02 保留 COPY_TO_AI，用真实 AI 软件比较修改前后结果；
- CONCEPT Lesson Step 4 继续为非 Gate 轻量参与。

### Step 5 memorable review

- 主 Review 固定 2–3 条；
- Knowledge Depth Review 最多 2 条；
- F1-03 从 4 条 Review 收敛为 3 条；
- Review 不再复述整节课，只保留以后会真正使用的判断规则。

### Terminology hygiene

Stage 1 用户可见内容新增整课术语泄漏检查。

禁止提前出现：
- Training / Inference
- Token
- Embedding / Vector Search
- Deterministic Logic
- API / Tool / MCP
- Agent Runtime
- RAG
- Evaluation

若只是“以后会学”，优先改成自然中文描述。

## Quality standard

新增：

docs/learning/BEGINNER_LESSON_QUALITY_STANDARD_V1.md

固定 Cognitive Load Budget：

- 1 个主问题；
- 1 个主概念或判断；
- 最多 1–2 个新核心术语；
- 1 个主要案例；
- bottomDetails <= 2；
- example depth <= 2；
- main review <= 3；
- review depth <= 2。

## Validation

- Beginner Batch A Quality Acceptance: PASS
- Beginner Cognitive Load Budget: PASS
- User-visible terminology leak check: PASS
- Course Builder Contract: PASS
- Unified Lesson Shell: PASS
- npm run typecheck: PASS
- npm run build: PASS

没有修改：
- Unified Lesson Shell
- Lesson IDs / Types / Gates
- Catalog availability
- DB / migrations / provider / publish state

## Human Review

继续使用原四个 Beginner Preview。

重点确认：
1. 第一屏是否足够轻；
2. 案例是否有明显“原来如此”的变化；
3. Check 是否像真实判断而不是考试；
4. Practice 是否有完成一件事的感觉；
5. Review 是否能记住；
6. 连续四节是否愿意继续进入 Stage 2。
