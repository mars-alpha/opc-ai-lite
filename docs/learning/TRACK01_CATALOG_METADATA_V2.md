# Track 01 Canonical Catalog Metadata v2

Status: **CANONICAL_PLANNING_V2**  
Task: **CURRICULUM-AUDIT-REALIGN-001-R1**  
Source: `TRACK01_28_CANDIDATE_SIX_STEP_AUDIT_V1.md`

## Catalog rule

Track 01 planning catalog canonical identity = **T1-01～T1-20**.

This file supersedes `FOUNDATION_CATALOG_METADATA_V1.md` for curriculum planning. It does not change the current frontend implementation by itself.

| order | ID | title | type | curriculumStatus | availability | prerequisite |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | T1-01 | AI 能帮什么，不能帮什么 | APPLICATION | BRIEF_READY | COMING_SOON | none |
| 2 | T1-02 | Prompt：把任务说清楚 | APPLICATION | BRIEF_READY | COMING_SOON | T1-01 |
| 3 | T1-03 | Context：给 AI 足够但不过量的信息 | APPLICATION | BRIEF_READY | COMING_SOON | T1-02 |
| 4 | T1-04 | Iteration：把第一版结果改到可用 | APPLICATION | BRIEF_READY | COMING_SOON | T1-03 |
| 5 | T1-05 | 结果可靠性：什么时候必须核验 | APPLICATION | BRIEF_READY | COMING_SOON | T1-04 |
| 6 | T1-06 | 模型与 AI 产品：你使用的到底是什么 | CONCEPT | PLANNED | COMING_SOON | T1-05 |
| 7 | T1-07 | Token 与概率生成：为什么 AI 每次答案会变化 | CONCEPT | PLANNED | COMING_SOON | T1-06 |
| 8 | T1-08 | Conversation History 与 Memory：AI 到底“记住”什么 | CONCEPT | PLANNED | COMING_SOON | T1-03,T1-06 |
| 9 | T1-09 | Knowledge Base 与 Source of Truth：AI 应该相信哪份资料 | CONCEPT | PLANNED | COMING_SOON | T1-08 |
| 10 | T1-10 | Search 与 RAG：AI 怎样先找证据再回答 | CONCEPT | PLANNED | COMING_SOON | T1-05,T1-09 |
| 11 | T1-11 | API：AI 产品怎样和其他系统交换信息 | CONCEPT | PLANNED | COMING_SOON | T1-06 |
| 12 | T1-12 | Structured Output 与 Schema：怎样让系统稳定接收 AI 结果 | APPLICATION | PLANNED | COMING_SOON | T1-11 |
| 13 | T1-13 | Function Calling 与 Tool Use：AI 怎样调用外部能力 | CONCEPT | PLANNED | COMING_SOON | T1-11,T1-12 |
| 14 | T1-14 | MCP：为什么 AI 需要统一连接工具与资源 | CONCEPT | PLANNED | COMING_SOON | T1-13 |
| 15 | T1-15 | Skill：把可复用的方法交给 AI | CONCEPT | PLANNED | COMING_SOON | T1-02,T1-13 |
| 16 | T1-16 | Workflow 与 Automation：把一次方法变成可重复流程 | APPLICATION | PLANNED | COMING_SOON | T1-15 |
| 17 | T1-17 | Agent：什么时候才需要动态决策 | APPLICATION | PLANNED | COMING_SOON | T1-13,T1-16 |
| 18 | T1-18 | Multimodal：文字、图片、语音、视频怎样一起工作 | APPLICATION | PLANNED | COMING_SOON | T1-06 |
| 19 | T1-19 | Coding、Browser 与 Computer Use：AI 怎样从回答走向操作 | CONCEPT | PLANNED | COMING_SOON | T1-13,T1-18 |
| 20 | T1-20 | Privacy、Permissions 与 Human-in-the-loop：什么不能直接交给 AI | APPLICATION | PLANNED | COMING_SOON | T1-05,T1-17,T1-19 |

Current frontend note:
- existing typed bridge / UI may still physically render legacy F metadata;
- that is implementation drift, not curriculum authority;
- code migration must be a separate explicit implementation task after this planning realignment.
