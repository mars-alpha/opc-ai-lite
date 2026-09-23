# TRACK01-RUNTIME-PERF-002 — Critical Path Reduction

Status: **COMPLETE / BROWSER_ACCEPTANCE_PASS_WITH_INFRA_LIMITATION**

## Goal

在不改变六步课程结构、不改变 PostgreSQL / Server 正式状态权威、不改现有课程 UI 版式的前提下，继续缩短以下高频交互的用户等待时间：

```text
进入课程
检查答案
重新学习
检查我的结果
修改后重新检查
完成本课
Rating
```

本任务不再重构 Lesson Runtime 主模型。`TRACK01-PHASE1-RUNTIME-001-B` 已完成 Read / Command 主链收敛；本任务只处理剩余 **critical path latency**。

## Current implementation result

- PERF-002-A：已加入 Runtime / Check / Reset / Practice / Completion / Feedback structured timing；每条记录带 `trace_id`，默认仅开发环境启用，production 需 `OPC_RUNTIME_TIMING=1`。
- Timing 只保留进程内最近记录与 console structured log，不做同步文件写入，避免 instrumentation 自身污染请求耗时。
- PERF-002-B：最小 PostgreSQL `background_jobs` Outbox 已正式应用当前开发数据库；`LEARNING_BEHAVIOR_REFRESH` enqueue、dedupe、claim/retry/complete 与显式 drain runner 已真实验证。独立 worker 使用 `react-server` condition + `.env.local` 启动；T1-01 CHECK 测试 job 已 `claimed=1 / completed=1 / failed=0`。
- PERF-002-C：Check Answer 已合并 Check+Lesson identity 查询，并把 Event / Outbox / Gate 查询并行；Required Check / Practice Gate 各收敛为单 join；Reset 已把清空 Check + currentStep 保存合成单 Command；Practice Submit 复用同一 Practice row 完成权限判断与 evaluator 输入，latest attempt 与 Practice resolve 并行，Submission Event 与 Evaluation 并行，Evaluation 后两个 Event + Outbox 并行。
- PERF-002-D：Lesson Runtime 只在 `progress.completed=true` 时读取 Rating eligibility；Step 1～5 不再无条件读取 Rating state。
- PERF-002-E：Check / Reset / Practice / Completion 已统一即时 processing 文案；正式 PASS / COMPLETE 仍只在 Server 返回后显示。
- Runtime 读取进一步根据 timing 证据优化：Check responses 与 Practice state 并行读取，Practice Submission + Evaluation 合并为单次 join 查询。
- DB 根因证据：当前开发数据库 warm `SELECT 1` RTT 约 `270–276ms`（均值约 `273ms`），首次建连接约 `2.2s`。因此本轮重点从 React/UI 转为减少串行数据库 round-trip。最近一次 T1-01 warm 观测约 `1.2s` Runtime / `1.3s` 完整 HTTP；cold dev 首次请求仍受 Next 编译影响，不作为 Runtime SLA。
- `0013` migration 已应用当前 `.env.local` 开发数据库；Outbox enqueue + drain acceptance 已 PASS。
- 真实浏览器最终体验已完成：进入课程约 3s；Check 约 3s；重新学习约 4s；Practice 首次约 6s；Practice 重试约 5s；Completion 约 4s；Rating 约 3s。对应最新服务端核心 timing 约为：Check 1.7–2.2s、Reset 1.9s、Practice 3.8s、Completion 3.1s、Rating 1.66s。
- 代码层 critical path 已完成主要可维护性范围内的收敛；剩余主要限制来自远程 PostgreSQL RTT、首次建连与每个 API 的 Session/Auth DB 开销。后续不再在本任务中继续以更复杂 SQL 换取小幅延迟收益，转入 `RUNTIME-INFRA-PERF-003`。

## Baseline

- 首次课程页由 Server Runtime Snapshot 初始化，客户端 mount 不重复 GET Runtime。
- Step 3 Answer / Reset 为单 Command；正式“下一题”不发网络请求。
- Step 4 Submission + Evaluation 为单 Command；前端不再提交后全量 Runtime refresh。
- Completion / Rating 已取消 `router.refresh()`。
- currentStep 已使用 latest-intent-wins serialized/coalesced save。
- PostgreSQL / Server 是 Check / Practice / Completion / Rating 唯一正式事实源。
- T1-01～T1-05 Interaction Parity、`learning:runtime:check`、typecheck、production build 已 PASS。
- 当前仍存在同步 Behavior Signal 聚合、部分 Command 内部写后重读、首次 Runtime 非必要状态读取等剩余延迟来源。
- 当前本地第一节课程服务端完整页面响应观测约 1.8s；这只是开发环境单次观测，不作为生产基准。

## Non-negotiable architecture rules

### Server authority

正式状态只能由 Server / PostgreSQL 产生：Check correct / passed、Practice evaluation / passed、Completion、Rating eligibility、Access / Entitlement。

允许前端即时更新：busy / processing、当前未提交输入、当前题展示指针、Server Command 已返回的 authoritative partial state、transient success / error feedback。

禁止前端自行推断或制造：Check Gate、Practice Gate、Completion、canRate、Access。

### No fake async

禁止使用 `void refreshLearningBehaviorSignals(...)` 作为“后台异步”。只有建立可靠 durable execution boundary 后，非 critical work 才可离开同步请求。

### No new runtime truth

本任务不新增 runtime_sessions、generic state JSONB、第二套 Check / Practice / Progress 表；不引入 Redis、Kafka、RabbitMQ 或微服务作为前置依赖。如需要 durable background work，优先使用现有 PostgreSQL 建立最小 Outbox / Job 边界。

---

# PERF-002-A — Timing Instrumentation

## Goal

先测量，再优化。建立同一套服务端 timing，定位每个 Command 真正耗时的位置。

## Required measurements

### Lesson Runtime Read

`lesson_identity_ms / access_ms / interactive_ms / progress_ms / rating_ms / runtime_total_ms`

### Check Answer

`check_lookup_ms / response_write_ms / check_state_ms / event_ms / behavior_signal_ms / command_total_ms`

### Check Reset

`reset_write_ms / progress_write_ms / check_state_ms / command_total_ms`

### Practice Submit

`practice_resolve_ms / submission_write_ms / evaluation_ms / evaluation_write_ms / event_ms / behavior_signal_ms / command_total_ms`

### Completion

`gate_validation_ms / completion_write_ms / event_ms / rating_eligibility_ms / command_total_ms`

### Rating

`feedback_write_ms / event_ms / behavior_signal_ms / command_total_ms`

## Logging rules

- Development / acceptance 可输出结构化 performance log。
- 不记录用户答案正文、Practice 正文、Token、Cookie、Session、PII。
- 不把 timing 写入正式业务表作为业务事实。
- 同一 Command 生成 request / trace id，便于串联阶段耗时。
- 性能日志必须可关闭，不能污染生产业务逻辑。

## Acceptance

能从一次真实课程流程明确回答：慢在网络、DB、Evaluator、Event、Behavior Signal，还是 Runtime Read。不得再只凭感觉判断。

---

# PERF-002-B — Durable Behavior Signal Outbox

## Goal

将课程运营聚合从用户按钮 critical path 中移除，同时保证任务不丢失。

目标链路：

```text
Command durable write
→ formal fact
→ learning event
→ enqueue behavior refresh job
→ return user

later:
worker / drain
→ refreshLearningBehaviorSignals()
→ mark done
```

## Minimal model

优先建立最小 PostgreSQL job/outbox 表，例如：

```text
background_jobs
- id
- job_type
- dedupe_key
- payload
- status
- attempts
- available_at
- created_at
- started_at
- completed_at
- last_error
```

本阶段只正式注册 `LEARNING_BEHAVIOR_REFRESH`。

payload 只含 `lessonId` 与 `signal: CHECK | PRACTICE | HELPFULNESS`。

## Dedupe

同一 Lesson + Signal 短时间重复事件允许合并，例如 `behavior:<lessonId>:CHECK`。只要求最终聚合正确，不要求每次交互都独立跑一次全量聚合。

## Reliability

- Command 成功后 job 必须已 durable。
- Worker 失败保留 retry 状态。
- job 失败不得回滚已合法成功的 Check / Practice / Completion。
- Insight / AI analysis 失败不得影响 learner-facing formal state。
- 若暂时没有常驻 worker，可提供显式 drain command / admin runner；不得伪装实时后台能力。

## Acceptance

Check / Practice / Rating 响应不再 await 全量 Behavior Signal 聚合。

---

# PERF-002-C — Command Internal Reread Reduction

## C1 Check Answer

写当前 response 后只查询返回所需的正式最小状态：当前 authoritative response + required passed ids + Check Gate。不得为了返回结果重新装载完整三题定义与全部详情。

Reset Command：reset required responses → save currentStep=3 → 直接返回 authoritative reset Gate。若写入边界已明确覆盖全部 required checks，不再为了确认清空而重查整题详情。

## C2 Practice Submit

尽量复用已经解析的 practice、submission id、attempt、content、rubric、pass score，避免 INSERT 后马上 SELECT 同一 Submission / Practice。

目标：resolve Practice once → validate → create Submission → evaluate using known server values → persist Evaluation + final status → return authoritative result。

Evaluation 与 final Submission status 在一致性边界内完成。PASSED 判定不得搬到前端。

## C3 Completion

Completion 必须继续重新校验正式 Gates，但只读所需 Gate；禁止重新读取整课 Runtime 作为 Completion 校验。

---

# PERF-002-D — Runtime Lazy Reads

## Goal

首次进入课程只读取首屏和当前恢复状态真正需要的动态数据。

## Rating

- 未完成课程 / 不在需要 Rating 的状态时，不做完整 helpfulness eligibility 查询。
- 完成课程时由 Completion Command 返回 authoritative `canRate`。
- 已完成课程重新进入时才读取 rating state。
- Step 1～5 不因为页面存在 Rating component 就强制查询完整 rating eligibility。

## Other optional reads

审计 Rating、Help / Insight derived state、非当前 Step 扩展状态、运营聚合结果是否首屏必需。只延后真正非必需数据；Check / Practice Gate、resume position、Access 必须保持恢复正确。

---

# PERF-002-E — Immediate UI Feedback Contract

本任务不改整体 UI 设计，只统一按钮反馈时序。

- Check：检查答案 → 正在检查… → Server result → 正确 / 需要调整。
- Reset：重新学习 → 正在重置… → 第一题可重新作答。
- Practice：检查我的结果 → 正在检查你的结果… → Evaluation。
- Completion：完成本课 → 正在确认学习结果… → 本课已完成。
- Rating：提交反馈 → 正在提交… → 已收到。

立即反馈只代表“请求正在处理”，不能提前显示 PASS / COMPLETE。

---

# Performance Acceptance

## Request count

```text
Initial lesson mount: 0 duplicate Runtime GET after server snapshot
Check answer: 1 Command
Next mastery question: 0 request
Check reset: 1 Command
Practice submit / retry: 1 Command each
Completion: 1 Command + 0 router.refresh()
Rating: 1 Command + 0 router.refresh()
```

## Latency measurement

真实浏览器流程至少记录多次样本并查看 P50 / P95 / max。

开发 / 同区域数据库环境第一轮参考目标，不作为硬编码产品 SLA：

```text
Check Answer / Reset: P50 <= 300–500ms
Completion: P50 <= 500ms
Deterministic Practice: P50 <= 500–800ms
Initial Lesson Runtime: P50 <= 800–1200ms
```

未达到目标时必须用 PERF-002-A timing 证明瓶颈，再决定下一步；不得无证据增加缓存或重构。

---

# Correctness Acceptance

1. Check 判分仍由 Server authoritative evaluator 产生。
2. 三题全部正确才通过 Check Gate。
3. 上一题 transient answer 不进入下一题。
4. Reset 后正式 Check state 重置并可恢复。
5. Practice PASSED 仍只来自正式 Evaluation。
6. Completion 重新校验 Check / Practice / Real AI required Gates。
7. Historical completion 不因 relearn 自动撤销。
8. Rating 非 Completion Gate。
9. currentStep 支持前进 / 后退，latest navigation intent wins。
10. 刷新 / 离开返回后 PostgreSQL state 可恢复。
11. T1-01～T1-05 Interaction Parity PASS。
12. `learning:runtime:check` PASS。
13. typecheck + production build PASS。
14. Manual browser flow PASS。

---

# Implementation sequence

```text
PERF-002-A Timing Instrumentation
→ PERF-002-B Durable Behavior Signal Outbox
→ PERF-002-C Command Internal Reread Reduction
→ PERF-002-D Runtime Lazy Reads
→ PERF-002-E Immediate UI Feedback Contract
→ PERF-002-ACCEPTANCE Real Browser + Timing + Regression
```

必须先完成 A，后续所有优化都以 timing evidence 为依据。

## Migration rule

PERF-002-B 如新增 Outbox / Job 表：只生成最小 migration，先 review；未经明确确认不自动应用独立 remote / production DB；不借此任务扩成通用 Job Platform。

## Out of Scope

题库、T1-06～T1-20 内容生产、新课程结构、前端视觉重设计、AI Tutor、AI Practice Evaluator、RAG / Vector DB、Redis、微服务、Kafka / RabbitMQ、通用 Workflow Platform、支付、小程序、Obsidian / Feishu / 公众号渠道实现。

## Done definition

- 每个目标 Command 有 timing evidence。
- Behavior Signal 不再阻塞 Check / Practice / Rating learner response。
- Check Answer / Reset 不做无必要 full Sequence reread。
- Practice Submit 不做可避免的 write-then-reread。
- Completion 不读取完整 Lesson Runtime。
- Runtime 不为 Step 1～5 无条件读取完整 Rating state。
- 所有正式学习状态仍保持 Server / PostgreSQL authority。
- Immediate UI processing feedback 一致且不提前制造 PASS。
- Request-count acceptance PASS。
- T1-01～T1-05 correctness acceptance PASS。
- typecheck / runtime validation / production build PASS。
- 真实浏览器全流程与 timing 结果有记录。
