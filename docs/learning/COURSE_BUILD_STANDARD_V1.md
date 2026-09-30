# COURSE_BUILD_STANDARD_V1.md — 正式课程构建标准

Status: **ACTIVE / SINGLE RULE OWNER**

本文件是正式课程 learner-facing 内容、六步教学责任、课程生产质量 Gate 与 Human Review 的唯一规则正文 owner。

它不负责：
- 当前 Track / Batch 状态；
- Runtime 当前事实；
- Workflow 生命周期顺序；
- UI 结构实现。

这些分别由 Current Facts、Course Production Workflow、Unified Lesson Shell 与实际代码负责。

## 1. 六步固定责任

所有正式课程统一六步：

1. 建立直觉
2. 讲透方法
3. 检查理解
4. 实操
5. 复盘判断框架
6. 能力获得

六步固定的是教学责任，不是模板。案例、字段数量、卡片数量、句式和任务形式由当前知识点决定。

若一个知识点无法自然完成六步，不允许为了填满 Shell 强行生成；返回 Curriculum / Formal Brief 调整知识粒度。

## 2. Step 1 — 建立直觉

目标：让学习者快速明白“为什么值得学、当前最重要的问题是什么”。

必须：
- 第一屏只围绕一个主问题；
- 给出学习价值和一句核心判断；
- 表达自然，不要求先理解复杂业务背景或术语。

禁止：
- 堆定义；
- 一开始展开完整案例；
- 同时教学多个后续知识；
- 从 Step 2 example 自动派生 Step 1。

Step 1 与 Step 2 必须有信息增量。主要字段直接复用或两步大段可互换：
`STEP_1_2_OVERLAP_FAIL`

## 3. Step 2 — 讲透方法

目标：用一个真实案例让当前课的核心规律变得可见。

必须：
- 案例只服务当前 Primary Knowledge Home；
- 当前 Shell 的 before / after 两张中间卡片有真实信息增量；
- 明确结果、判断依据或边界；
- Step 2 提供 Step 1 没有展开的新信息。

不得把内部课程生产、Track、Batch、Case Thread 名称展示给学员。

## 4. Step 3 — 检查理解

默认 Mastery Sequence：

```text
SINGLE_CHOICE / BEST_JUDGMENT
→ TRUE_FALSE / MISCONCEPTION
→ MULTI_SELECT / BOUNDARY_CONDITIONS
```

规则：
- 只检查 Step 1～2 已教内容；
- 题目像真实判断，不考术语背诵；
- 答错给出可理解提示并允许重试；
- 当前题答对后锁定当前选项与检查按钮，稳定保留“下一题”入口；
- 离开再回来不得直接跳到最后题。

## 5. Step 4 — 实操

目标：把前三步理解转成一个最小真实动作。

### 5.1 真实任务
字段必须从“当前课题 + 学习者自己的真实问题”自然拆出，不允许跨课程复用固定字段模板。

学习者知道多少写多少；未知事实允许：
- 不知道
- 未记录
- 待确认
- 未知

禁止为了完整度编造业务事实。系统结构化状态可以记录为 `UNKNOWN`；无论中文显示“未知”还是系统状态 `UNKNOWN`，都不得让 AI 自行补猜。

### 5.2 COPY_TO_AI
凡提供复制到 AI：
- 按字段顺序组合后的“字段值本身”必须已经是一份完整 Prompt；
- 不依赖字段标题或页面解释；
- 可以直接复制到任意 AI 工具；
- AI 应完成本课需要的分析 / 判断 / 指出缺口 / 优化，而不是只重新排版字段。

最后一个字段应自然承担：
“我希望 AI 继续帮我想什么 / 判断什么 / 补什么”。

### 5.3 Reference
Reference Fill：
- 是完整可修改示范；
- 不替代学员自己的真实问题。

Reference Answer：
- 与 Reference Fill 语义一致；
- 是可直接复制运行的纯正文；
- 不带字段主标题；
- 不混入课程内部编排文字。

### 5.4 Reflection
Reflection 重点检查学习者获得了什么新理解：
- 发现了什么遗漏信息；
- 哪个判断证据不足；
- 下一步要补什么事实 / 找谁确认 / 采什么数据。

## 6. Step 5 — 复盘判断框架

上方主卡片固定围绕两个方向：
- **AI适合做什么**
- **AI不应该替你做什么**

这两个方向不能删除。

结构：
- 主卡片至少 2 张；
- 上限不固定；
- 超过 2 张只有在能把本课知识讲得更清楚时才增加；
- 每张必须是本课具体判断，不得使用跨课程泛化口号。

主卡片下方必须保留 `knowledgeDepth.review` 说明层：
- 用“明确命题 + 回答/解释”讲清原因、边界、使用条件和容易混淆之处；
- 数量不固定；
- 不得与主卡片机械重复。

Formal Brief 必须给出 `must-retain judgments`。
如果关键判断没有被主卡片 + review 说明完整覆盖：
`STEP5_KNOWLEDGE_COVERAGE_FAIL`

`mistakes` 只做纠错辅助，不能替代 Review 主体。

## 7. Step 6 — 能力获得

必须分别回答：
1. 我现在会做什么；
2. 我怎样知道自己会了；
3. 遇到什么真实情况，我应该想到这节课；
4. 下一课为什么值得继续。

Trigger Scenario 必须是具体、现实可识别的场景，并说明本课能力为什么适用。

不得：
- 写成“我会先…… / 你应该先……”式操作步骤；
- 用 Next Lesson Value 代替本课 Trigger；
- 用课程编排说明代替现实场景。

## 8. 学习建议 / 导航 / 页码

- 每课学习建议必须课程专属、自然、简洁；
- 六个 `navigationDescription` 必须逐步准确且不重复；
- `navigationDescription` 只服务顶部六张进度卡片；
- 底部页码固定只显示 `1 / 6`～`6 / 6`；
- 页码前后不得附加任何描述。

## 9. 语言

原则：**先说人话，再决定是否需要术语。**

### 普通业务术语
优先自然中文。ICP、Audience、Business Fit、Problem Fit、Value Fit、CTA、HITL、Lead、Dashboard 等不能因为行业常见就裸露给初学者。

### AI 通用技术术语
第一次出现可使用：
`中文（English）`

行业常用缩写使用：
`中文解释（缩写）`

例如：
- 检索增强生成（RAG）
- 应用程序编程接口（API）
- 模型上下文协议（MCP）

不展开无必要英文全称。

学员可见正文出现不必要英文：
`LEARNER_LANGUAGE_FAIL`

表达虽然正确但过度学术 / 咨询化：
`BEGINNER_PLAIN_LANGUAGE_FAIL`

## 10. 内部身份边界

学员端可以显示正常课程序号，例如：
`07 / 08 / 09`

不得展示：
- T2-07；
- Track 名；
- Batch 名；
- 内部 Lesson ID；
- Schema 名；
- Workflow Gate；
- Artifact 内部编号；
- production handoff 描述。

## 11. 案例原则

方法层保持行业中立。

底层案例优先来自真实个人 / 小团队 / 一人公司常见工作：
- 内容；
- 客户；
- 运营；
- 销售；
- 资料；
- 分析；
- 协作。

禁止拿“本课程 / 课程推广 / 课程功能 / 内部课程生产过程”作为主要教学案例。

涉及市场、用户、竞争、价格、渠道、规模且 Brief 未指定地区时，默认中国市场；其他地区必须显式说明。

## 12. Artifact

固定顺序：

```text
Natural Learning Action
→ Natural Learner Output
→ Optional Next Reuse
```

禁止：

```text
Next Lesson Needs Artifact
→ Reverse-engineer Current Practice
→ Force Extra Fields
```

## 13. 批量课程防模板漂移

批量课程进入 Human Review 前必须做跨课审计。

检查：
- Step 1 标题 / 核心 / 边界是否整批同模版；
- Step 3 objective / feedback 是否机械复制；
- Step 4 字段是否整批固定成同一结构；
- Step 5 mistakes / Review 是否通用化；
- Step 6 objective / trigger 是否机械复制；
- 相邻课程是否只是换案例重复同一知识。

发现批量模板化：
`LESSON_TEMPLATE_DRIFT_FAIL`

相邻课程实质重复核心判断：
`CROSS_LESSON_KNOWLEDGE_OVERLAP_FAIL`

共享 helper 只复用：
- 类型；
- 数据装配；
- 确定性逻辑。

不得复用 learner-facing 文案模板。

## 14. Deterministic Validation / Human Review

### Code 可以判断
- 六步完整；
- Step 类型 / Completion Gate；
- navigationDescription；
- 学习建议基础结构；
- Step 3 题型序列；
- Step 4 必填 Schema；
- 内部 ID / 禁止词；
- Step 5 最低结构；
- Runtime authority；
- Preview 不写正式进度。

### Human Review 必须判断
- 是否真的容易理解；
- Step 1 / Step 2 是否有信息增量；
- 案例是否自然；
- Check 是否真的检验理解；
- Step 4 是否是学习者真实动作；
- COPY_TO_AI 是否能直接运行；
- Review 是否留下可复用判断；
- Trigger 是否具体；
- 相邻课程是否重复；
- 是否愿意继续学。

技术 PASS 永远不等于教学 PASS。

## 15. Human Review Gate

标准状态：
- PENDING
- PASS
- REVISE
- REJECT

只有 PASS 可以进入 LessonSpec Registry / Runtime。

AI / Skill 永远不能直接将课程标记为 AVAILABLE。

## 16. UI / Runtime 边界

单节课内容问题不得通过新增：
- 新 Renderer；
- Lesson-specific UI；
- 新 interaction type；
- CSS 特判；
- Runtime fallback；
来解决。

默认复用 Unified Lesson Shell。

## 17. 冻结状态

当前 Track 01～05 已正式上线并冻结。

本标准仍作为未来：
- 明确课程 Bug 修复；
- 课程审计；
- 产品负责人显式重新开启课程生产；
的唯一课程内容规则 owner。

没有显式重新开启，不进入新 Batch / Formal Brief / provisioning。