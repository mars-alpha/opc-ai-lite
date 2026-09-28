# Track 05 Batch A — T5-01～T5-03 Human Review v1

Status: **HUMAN_REVIEW_PASS / 3 LESSONS / READY_FOR_LESSON_SPEC_REGISTRY**
Formal Brief: `TRACK05_BATCH_A_T5_01_T5_03_FORMAL_BRIEFS_V1.md`
Draft: `fixtures/course-builder/track05-batch-a.ts`

## Review result

**T5-01 PASS / T5-02 PASS / T5-03 PASS**

本轮 Human Review 不是确认“代码能跑”，而是逐课检查学员是否真正能看懂、判断、实操、复盘并知道现实中何时调用本课能力。

## Issues found and repaired

1. 初版 Draft 缺少 Step 1 底部说明数据层。
   - 已补齐每课独立 intro / bottomDetails。
   - Step 1 只建立直觉，不复述 Step 2 完整案例。

2. 初版 Draft 缺少 Step 5 `knowledgeDepth.review`。
   - 三课各补 3 条“明确命题 + 回答/解释”。
   - 上方主 Review 继续固定为“AI适合做什么 / AI不应该替你做什么”。
   - mistakes 只做纠错，不替代 Review 主体。

3. 初版 Draft 缺少 Step 6 独立 Trigger Scenario。
   - 三课均增加现实可识别的触发场景。
   - Trigger 与 Next Lesson Value 分离。

4. 初版学员文案残留普通业务英文。
   - Stakeholder / Owner / Approver / Baseline / Pilot / Demo / FDE / ROI / Business Case / Problem Statement 等学员可见表达已中文化。
   - AI 通用或必要缩写仅在确有需要时按中文优先表达。

5. Step 4 初版偏向“字段填写 → AI 整理信息”。
   - 已先改为 AI 分析 / 判断 / 找缺口 / 优化，又进一步修正为“当前课题 + 学习者自己想到的真实问题 → 课题专属字段 → Reference Fill 完整示范 → 复制字段值 → 粘贴到学习者自己的 AI 工具获取更多信息”。
   - 三课字段不共用抽象模板，也不要求学员照抄课程预设案例；参考案例只承担一键填充示范。
   - 按字段顺序复制后的值本身就是完整 Prompt，不依赖字段标题或页面说明。
   - AI 可以补充分析和需要继续了解的信息，但不能虚构业务事实。
   - Hint 明确要求“知道多少写多少，不知道就写不知道 / 未记录 / 待确认”。
   - 最后一个字段固定承担“我希望 AI 帮我继续想什么 / 判断什么 / 补什么信息”。
   - Reflection 改为检查学习者新增了什么理解：遗漏信息、证据不足的原判断、下一步要补的事实/角色/数据。

## Per-lesson review

### T5-01 — 问题发现

PASS:
- Step 1：只建立“症状不等于原因”的直觉。
- Step 2：AI 日报晚发案例增加事实 → 影响 → 可能原因 → 未知的完整信息增量。
- Step 3：三题均测试事实/猜测/方案边界，不考术语。
- Step 4：字段从学员自己想到的问题出发；“AI 日报晚发”只作为 Reference Fill 示范。学员填写自己的问题、事实、流程、猜测和想继续了解的信息后，复制即可直接交给自己的 AI 工具分析事实/猜测、补充验证方向并优化问题观察记录。
- Step 5：保留“原因需要证据 / 不知道也可以继续 / 不提前谈方案”。
- Step 6：团队直接说“需要 AI 客服/智能体/自动化”但问题未说清时触发本课。
- Boundary：不提前收敛正式问题定义，不进入解决方案设计。

### T5-02 — 关键角色地图

PASS:
- Step 1：只建立“使用者不是全部角色”的直觉。
- Step 2：客服案例讲清使用、受影响、结果责任、关键条件与批准角色。
- Step 3：题目验证“使用 ≠ 负责 ≠ 批准”。
- Step 4：字段从学员自己的角色问题出发；“线索整理与跟进”只作为 Reference Fill 示范。学员填写自己的工作方式、已知角色、权限关系和想继续判断的问题后，复制即可直接交给自己的 AI 工具补充遗漏角色、待确认关系并优化角色地图。
- Step 5：解释为什么要单独找结果负责人、关键提供者和批准者，以及角色不确定时如何处理。
- Step 6：团队说不清谁提供数据、谁负责错误、谁批准试点时触发本课。
- Boundary：不提前进入采用管理或长期运营责任设计。

### T5-03 — 当前状态基线

PASS:
- Step 1：只建立“感觉不能作为未来比较起点”的直觉。
- Step 2：日报案例讲清周期、口径、来源与证据质量。
- Step 3：三题验证事实/估算/感受/未知边界。
- Step 4：字段从学员自己想看清的现状问题出发；课程数据只作为 Reference Fill 示范。学员填写自己的已有数据、观察和来源后，复制即可直接交给自己的 AI 工具判断事实/估算/感受/未知、补充数据缺口并优化当前基线；禁止 AI 补数字、目标和投资回报。
- Step 5：保留“为什么要有口径 / 什么指标值得留 / 没数据怎么办”。
- Step 6：团队开始讨论 AI 能提升多少、却说不清现在水平时触发本课。
- Boundary：只记录现在，不提前设置目标、投入价值或方案。

## Cross-lesson review

连续性确认：

```text
T5-01 发现真正的问题
→ T5-02 找清关键角色与责任
→ T5-03 建立当前事实基线
→ T5-04 正式收敛问题定义
```

无以下漂移：
- T5-02 不重复 T5-01 的根问题判断；
- T5-03 不重复角色分析；
- T5-01～03 不提前教授 T5-04～06 的问题定义、目标与投入价值；
- 不重教 Track 04 Workflow mechanics；
- 三课 Step 1 / Step 4 / mistakes / Review / Trigger 均为课题专属，不是批量模板。

## Gate decision（历史发布阶段证据）

Human Review Decision: **PASS**

允许下一步进入：

**REGISTER_LESSON_SPEC**

仍然禁止在 LessonSpec Registry / Formal Registration 完成前：
- Provision Runtime；
- 加入 Learning Map AVAILABLE；
- 标记课程 AVAILABLE；
- 修改 Unified Lesson Shell / UI / CSS。
`r`n`r`n## Post-release closure`r`n`r`n该 Gate 已完成并关闭：T5-01～T5-03 已完成 LessonSpec Registry → Runtime Provisioning → authenticated Runtime Acceptance → AVAILABLE。本节保留 REGISTER_LESSON_SPEC 仅作为当时 Human Review 后的历史证据，不代表当前系统状态。`r`n