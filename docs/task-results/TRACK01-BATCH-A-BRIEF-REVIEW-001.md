# TRACK01-BATCH-A-BRIEF-REVIEW-001 — T1-01～T1-05 Human Review Revision

Status: **COMPLETE_TARGETED_REVISION / HUMAN_REVIEW_PASS_BRIEF_LEVEL**

## Scope

只修订 T1-01～T1-05 Formal Brief：
1. 固定 Prompt vs Context 边界；
2. 将五课 Step 4 明确为“具体动作 + 留下结果”；
3. T1-05 增加最低 Task-fit Evaluation，并退出 T1-20 的 HITL / Permissions / Approval 边界。

未生成课程 Draft；未修改 Runtime / Shell / Schema / UI。

## Review result

- 顺序：PASS
- 五课边界：PASS after revision
- Artifact continuity：PASS
- Step 4 specificity：PASS after revision
- T1-05 Hallucination absorption：PASS
- T1-05 basic Evaluation absorption：PASS at beginner minimum level
- T1-05 vs T1-20 boundary：PASS
- T1-05 vs Track 04 Evaluation boundary：PASS

## Fixed boundary

Prompt = **AI 要做什么 / Task Instruction**  
Context = **AI 为了完成任务需要知道什么 / Task Information**

T1-03 不教授 Source of Truth judgment；只教授当前任务的信息取舍。

T1-05 只做两层最小检查：
1. Task-fit：是否完成原始 Clear Task Brief；
2. Reliability：哪些陈述需要按事实、日期、可验证性、错误后果提高核验强度。

T1-05 不教授审批权、权限控制、HITL workflow 或 Core Authority；这些留给 T1-20。
T1-05 不教授 benchmark / rubric system / regression / evaluator engineering；这些留给 Track 04。

## Next

Formal Brief 层 Human Review 已通过。下一步可进入：
`COURSE-PRODUCTION-TRACK01-A-001 — T1-01～T1-05 Course Builder Production`
