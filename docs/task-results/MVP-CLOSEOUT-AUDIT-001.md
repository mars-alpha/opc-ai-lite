# MVP-CLOSEOUT-AUDIT-001 — Product / Access / Data Consistency Audit

Status: COMPLETE

## Goal

在 MVP-010 收口后做一次跨模块一致性核对，重点检查：

```text
会员权益 ↔ 实际 Access Policy
课程完成 ↔ Practice / Stage Project
前端展示 ↔ 正式数据源
会员生命周期边界
数据库一致性
明显 N+1 / 重复逻辑
治理文档 ↔ 当前代码事实
```

本任务以只读审计为主，不扩产品功能、不接支付、不重新设计 Practice 核心。

---

## Executive conclusion

当前核心数据库与 Practice Runtime **没有发现数据损坏或模型断链**，MVP-010 的三类 Practice 核心方向成立。

但收口后仍存在 4 个应该在进入新 MVP 前处理的产品 / 代码一致性缺口：

```text
P0 会员权益文案仍明显超前于真实权限实现
P0 /practice 的 Latest Practice UI 文档声称已接入，但当前页面实际未接
P1 Stage Project 是否参与 Stage Completion 尚未定义
P1 Basic Practice 仍是静态双轨数据
```

另有 2 个代码级收口项：

```text
P1 Lesson Interactive / required Practice 查询未显式限定 LESSON_PRACTICE
P2 当前仍存在小规模 N+1 查询
```

因此建议：**不要马上进入大型新功能；先做一个很小的 `MVP-CLOSEOUT-FIX-001` 修一致性，再决定 MVP-011。**

---

## 1. Membership benefit ↔ real access consistency

### Product promise

Canonical `MEMBERSHIP_BENEFIT_MATRIX` 当前展示：

```text
完整课程                         OPC 会员 ✓
全部 Practice / 阶段实操         OPC 会员 ✓
完整 AI 日报                      OPC 会员 ✓
深度解读 / 课程关联               OPC 会员 ✓
飞书深度资料 / 扩展教程 / 附件    OPC 会员 ✓
最新课程内容与新增资料             OPC 会员 ✓
```

### Real code

当前真实 Membership consumer：

```text
Lesson Access
→ active Membership 可以替代 Stage 1 指定 Chapter Entitlement

Practice Access
→ access_tier = MEMBER 时调用 resolveMembershipFeatureAccess()

正式 Stage Project sample
→ MEMBER
```

但以下 feature 目前只有 vocabulary / 产品文案，没有真实 consumer：

```text
COURSE_CONTENT
AI_DAILY_FULL
DEEP_RESOURCE
```

`/ai-daily` 当前直接读取全部 Published Content，没有 Free / Member 分层。

除 Stage 1 公众号锁定部分以外，其余 Course Lesson 当前主要由 Stage prerequisite 控制；通过前置阶段后并不要求会员。

### Finding

**P0 — 前台会员权益矩阵仍是“目标产品权益”，不是当前 Runtime 权限事实。**

这会导致未来正式开放订阅时出现最直接的商业承诺风险：用户购买“完整课程 / 完整日报 / 深度资料”，但系统并没有对这些资源形成统一 member tier。

### Recommended action

在真实 `MEMBERSHIP-001` 前二选一：

```text
A. 先把会员权益文案降到当前真实能力
或
B. 为 Course / AI Daily / Deep Resource 增加正式 access metadata + resolver
```

不要在支付接入时临时散落 `isMember` 判断。

---

## 2. Latest Practice frontend mapping inconsistency

MVP-010 Acceptance 文档 / PROJECT_STATUS 记录：

```text
/practice
→ practice_latest_evaluation_workflow
```

`lib/contentDemo.ts` 的确已有：

```text
evaluation-practice
practiceId = practice_latest_evaluation_workflow
```

但当前 `app/practice/page.tsx`：

```text
- import 了 PracticeSubmissionPanel
- latestPractice card 没有实际渲染 PracticeSubmissionPanel
- Basic Practice 仍是本地 tasks[]
```

也就是说：**数据映射存在，但用户侧 Latest Practice 正式提交 UI 当前并没有真正挂上。**

### Finding

**P0 — 文档与当前前端事实不一致。**

Stage Project `/projects/personal-knowledge-assistant` 已真实渲染 `PracticeSubmissionPanel`；Latest Practice 没有。

### Recommended action

`MVP-CLOSEOUT-FIX-001` 中只做最小修复：

```text
item.practiceId
→ PracticeSubmissionPanel compact
```

不重做 `/practice` 页面。

---

## 3. Basic Practice remains dual-track

当前 `/practice` 的 Basic Practice：

```text
const tasks = [...]
```

共 4 个本地静态任务。

它们：

```text
不在 practices 表
没有 practiceId
不能 Submit
没有 Evaluation
没有 Event
没有历史记录
```

而同一页面又使用 “Practice” 产品语言，容易让用户误以为它们与正式 Practice 是同一能力。

数据库当前正式 Practice 实际只有：

```text
LESSON_PRACTICE  1 PUBLISHED
STAGE_PROJECT    1 PUBLISHED
LATEST_PRACTICE 1 PUBLISHED
```

### Finding

**P1 — 产品层存在“正式 Practice + 展示型 Practice”双轨。**

这不是数据库错误，但在继续增加 Practice 前必须确定：

```text
静态 tasks 是示例文案？
还是未来可提交 Practice？
```

### Recommended action

MVP 阶段优先：

- 明确标为“练习示例 / 自主练习”，不要冒充可保存正式 Practice；或
- 只迁移真正需要保存 / 评价的少量任务进入 `practices`。

不建议一次性批量迁移所有静态任务。

---

## 4. Lesson Completion vs Stage Project completion

当前正式规则：

```text
Lesson Completion
→ required LESSON_PRACTICE PASSED
```

Stage prerequisite 当前判断的是：

```text
前序 Stage 的全部 Lesson COMPLETED
```

Stage Project 当前：

```text
可以 Submit / Evaluate / PASSED
但不会阻止 Stage 进入下一阶段
```

### Finding

**P1 — Stage Project 已正式化，但“是否属于 Stage Completion Gate”还没有产品规则。**

这不是代码 bug；是尚未做出的产品决定。

### Decision needed before scaling projects

建议固定其中一种：

```text
A. Stage Project 永远可选，不阻塞学习路径
B. 某些 Stage Project required，PASSED 后才能进入下一 Stage
C. 只在证书 / 高级路径中 required
```

当前系统等价于 A。

如果产品目标强调“知 → 学 → 用”，建议后续支持 B，但不要在本审计任务里直接修改。

---

## 5. Membership lifecycle boundary

当前已经真实验证：

```text
expires_at <= now
→ Membership 不再 active
→ member content 锁定
→ 历史 Submission / Evaluation 保留
```

这个规则是正确的。

但以下仍没有正式业务模型 / 规则：

```text
取消自动续费
当前周期结束时间
支付失败 / past_due
退款
退款后即时 revoke 还是人工处理
重新订阅
续费幂等
Webhook 重放
```

### Finding

**P1 — 到期规则已验证，取消 / 退款 / 续费规则仍应留给 MEMBERSHIP-001，不应现在临时实现。**

当前没有 Subscription / Order / Payment，因此这不是 MVP-010 blocker。

---

## 6. Database consistency audit

对当前真实 PostgreSQL 执行只读检查。

### Current formal Practice rows

```text
LESSON_PRACTICE  PUBLISHED  1
STAGE_PROJECT    PUBLISHED  1
LATEST_PRACTICE PUBLISHED  1
```

### Integrity results

```text
invalid_practice_ownership                 0
published_latest_without_published_source  0
submissions_without_evaluation              0
multiple_evaluations_per_submission         0
passed_submission_eval_mismatch             0
expired_unrevoked_entitlements              0
orphan_practice_events                      0
active_memberships                          0
```

### Finding

**PASS — 当前数据库没有发现 Practice ownership、Submission / Evaluation、Latest Source 或 Practice Event 的明显脏数据。**

`active_memberships = 0` 与当前尚未接正式支付的开发状态一致。

---

## 7. Lesson Practice type boundary drift

MVP-010 Closeout 文档记录：

```text
Interactive Lesson 只读取 LESSON_PRACTICE
required Practice Completion Gate 只检查 LESSON_PRACTICE
```

但当前代码实际查询条件为：

```text
getInteractiveLesson()
→ practices.lesson_id = lesson.id
→ status = PUBLISHED
```

以及：

```text
hasPassedRequiredPractices()
→ practices.lesson_id = lessonId
→ required = true
→ status = PUBLISHED
```

当前均**没有显式**：

```text
type = LESSON_PRACTICE
```

由于当前 STAGE_PROJECT / LATEST_PRACTICE 的 `lesson_id` 都是 null，所以 Runtime 目前没有出错。

### Finding

**P1 — 当前数据安全，但代码边界没有完全落实文档约束。**

未来如果某个非 Lesson Practice 为了关联展示意外填入 `lesson_id`，可能进入 Interactive Lesson 或阻塞 Lesson Completion。

### Recommended action

收口修复时给这两个查询明确补：

```text
eq(practices.type, "LESSON_PRACTICE")
```

这是低风险、高价值的小修复。

---

## 8. Query / performance audit

### `getInteractiveLesson()`

当前：

```text
每个 Practice
→ 1 次 latest Submission query
→ 1 次 Evaluation query
```

属于典型 N+1。

### `hasPassedRequiredPractices()`

当前：

```text
先查 required practices
再对每个 practice 查一次 PASSED submission
```

也是 N+1。

### Finding

**P2 — 当前数据规模极小，不是上线 blocker，但已确认存在。**

不建议为了 1–3 个 Practice 提前做复杂缓存；更适合在 Practice 数量扩大前改成 join / batched query。

另外 `lib/server/practices/access.ts` 仍残留：

```text
const sqlStage = stages;
```

未使用，可在小修复时清理。

---

## 9. Entitlement source uniqueness risk

`entitlements` 当前唯一键仍是：

```text
user_id + type + resource_type + resource_id
```

不包含 source。

当前采用 global Membership：

```text
MEMBERSHIP + PRODUCT + OPC_MEMBER
```

因此**当前 Membership 与公众号 Chapter Entitlement 不会互相覆盖**，BIZ-AUDIT-001 的主要风险已经通过架构规避。

但未来如果：

```text
PROMOTION
ADMIN
多个渠道
```

同时授予完全相同 tuple，仍可能出现 source 覆盖问题。

### Finding

**P2 — 当前不阻塞；在 Promotions / Admin manual grants 真正出现时再设计多 grant-source 模型。**

---

## 10. Governance / documentation consistency

当前 `TASKS.md` 仍出现：

```text
# NEXT
MVP-010
Status: IN_PROGRESS
```

但同一文件后面又写：

```text
MVP-010-ACCEPTANCE COMPLETE
MVP-010 正式收口
```

并且旧 Goal 仍保留：

```text
PASSED / RETRY / REVIEW_REQUIRED
```

与最终 Runtime：

```text
SUBMITTED / NEEDS_REVISION / PASSED / EVALUATION_FAILED
```

不一致。

`PROJECT_STATUS.md` 已写 MVP-010 COMPLETE，但仍保留大量阶段性“下一步”历史描述。

### Finding

**P1 — 治理事实源已经出现轻微漂移。**

建议收口修复时：

```text
TASKS.md → MVP-010 移入 COMPLETED
删除 / 改写旧 NEXT 状态
更新 Practice 状态 vocabulary
PROJECT_STATUS → 只保留当前事实，历史阶段细节留 task-results
```

这能减少下一阶段 Codex 读到冲突上下文。

---

## Final audit matrix

| Area | Result | Priority |
|---|---|---|
| Practice DB integrity | PASS | — |
| Three Practice core model | PASS | — |
| Submission / Evaluation integrity | PASS | — |
| Membership expiry + history | PASS | — |
| Membership benefit promise vs Runtime | GAP | P0 |
| Latest Practice user UI | GAP / doc drift | P0 |
| Basic Practice formalization | DECISION | P1 |
| Stage Project completion rule | DECISION | P1 |
| Lesson-only type filters | GAP | P1 |
| Governance source consistency | GAP | P1 |
| N+1 queries | OPTIMIZE LATER | P2 |
| Entitlement multi-source grants | FUTURE RISK | P2 |

## Recommended next step

不要直接开始大型 MVP-011。

先做：

```text
MVP-CLOSEOUT-FIX-001
```

范围严格限制为：

```text
1. 修 /practice Latest Practice 正式 Panel 挂载
2. Interactive / Completion query 明确 LESSON_PRACTICE
3. 清理 TASKS / PROJECT_STATUS 状态漂移
4. 明确 Basic Practice 是“展示型自主练习”还是正式 Practice
5. 会员权益矩阵标识“当前已开放 / 规划权益”，或先收窄到真实 Runtime
6. 固定 Stage Project 是否参与 Stage Completion 的产品决定（可只写规则，不实现）
```

N+1、支付、退款、AI Evaluator、第二 Submission Schema 都不进入这个修复任务。

完成这一步后，再讨论 MVP-011，项目的业务事实源会更干净。
