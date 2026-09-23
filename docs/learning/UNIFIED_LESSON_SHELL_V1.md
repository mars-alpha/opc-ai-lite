# Unified Lesson Shell v1

Status: **FROZEN_V1**
Version: **1.0.0**

本文件定义 OPC 当前正式课程体验的统一 Shell。后续课程开发默认只能填充内容、互动数据和 Completion Gate，不得在单个课程任务中顺手改变本 Shell。任何结构性变化必须另开明确的 UX / Runtime 任务，并重新通过 Shell Acceptance。

## 1. 一个正式 Shell

正式课程只有一个 Generic Lesson Shell。

允许 Lesson Type 改变：
- 内容深度；
- Step 内互动；
- Practice Mode；
- Completion Gate；
- 是否需要真实 AI 操作 / Deliverable。

禁止 Lesson Type 或 lesson slug 改变：
- 正式课程页面产品；
- Renderer；
- 导航结构；
- 六步教学骨架。

禁止 `if (lessonSlug === "...")`、`if (lessonId === "...")`、`if (courseSlug === "...")` 选择课程 Renderer。

Draft Preview 必须复用 `GenericLessonRuntimePanel`。Preview 只用于 Human Review，不写正式 Progress / Completion，不得伪造 Runtime Ready。

## 2. 六步骨架

| Step | Kind | 底部标签 | 教学责任 |
| --- | --- | --- | --- |
| 1 | EXPLAIN | 建立直觉 | 讲清是什么、为什么重要、解决什么问题，建立核心判断直觉 |
| 2 | EXAMPLE | 讲透方法 | 展开方法、为什么有效、边界、易混淆点和常见错误 |
| 3 | CHECK | 检查理解 | 验证是否真正理解，并用反馈纠正误区 |
| 4 | PRACTICE | 动手实操 | 把前 3 步已学内容做出来，不首次引入新核心理论 |
| 5 | REVIEW | 复盘框架 | 把本课收束成可复用的判断 / 诊断框架 |
| 6 | CAPABILITY | 能力获得 | 明确学员获得什么能力、可用在哪里、下一步学什么 |

正文保留每节课自己的 Step 标题。底部导航只显示固定四字教学标签 + 页码。

## 3. Step 3 — Three-Question Mastery

新课程默认固定：

1. `SINGLE_CHOICE / BEST_JUDGMENT`：最佳应用判断；
2. `TRUE_FALSE / MISCONCEPTION`：纠正常见误区；
3. `MULTI_SELECT / BOUNDARY_CONDITIONS`：边界和组合条件。

交互固定：
- 一次只显示一题；
- 答错：展示明确错误反馈与判断依据，必须重试，不能进入下一题；
- 答对：展示为什么正确，立即锁定当前题的选项与提交动作；在用户点击“下一题”前不得再次改选，且“下一题”入口必须稳定保留；
- 三题全部答对才满足新课程 CHECK Gate；
- 多选使用 exact-set 判分；
- legacy 单题 Check 继续兼容，但不是新课程默认。

## 4. 展示原则

固定原则：**每一次点击都必须带来认知变化。**

Step 1 / Step 2 / Step 5 可以通过通用数据配置改变内容层级，但不得生成独立页面结构。

允许的通用数据驱动变体包括：
- Scene / Comparison / Takeaway；
- `comparisonPlacement=MIDDLE|BOTTOM`；
- Bottom concept explanation；
- `bottomDetails`；
- Knowledge depth；
- Review card fill presentation；
- Step 5 主卡片后的 `knowledgeDepth.review` 补充说明层：数量由课题决定，不固定条数，但正式课程不得无故删除该层。

这些是可选表达能力，不代表所有课程必须使用同一个具体视觉变体。

禁止：
- 为了“有互动”增加答案显而易见的点击；
- 按课程 slug 写 CSS / Renderer 分支；
- 为单节课复制第二套正式 Shell。

## 5. 底部导航

Desktop / tablet：
- 左：自然尺寸“上一步”；
- 中：固定教学标签 + 页码，视觉居中；
- 右：“还是不懂” + 自然尺寸“下一步”。

Mobile `<=640px`：
- 第一行：`上一步 | 教学标签+页码 | 下一步`；
- 第二行：“还是不懂”；
- 不允许旧 CSS 再隐藏 `.guided-step-nav` 内部容器。

“还是不懂”是学习辅助，不是 Completion Gate。

## 6. Runtime / Preview 边界

Runtime：
- Completion 由 Core / server gate 决定；
- CHECK / PRACTICE / REAL_AI / DELIVERABLE 不由客户端文案决定；
- Lesson Type 只影响计划与 Gate，不选择页面 Renderer。

Preview：
- 复用 Generic Shell；
- `previewMode` 不读取 / 提交正式 Runtime 状态；
- local Check / Practice 只用于 Human Review；
- Preview PASS 不等于正式 Progress / Completion；
- PROJECT local draft PASS 不等于 DELIVERABLE completion。

## 7. 变更治理

`FROZEN_V1` 的含义不是永远不能改，而是：

- 普通课程内容任务不得改变 Shell；
- 新课程优先适配现有 Shell；
- 发现真实体验问题时另开明确任务；
- 修改后必须同步本文件、`CURRENT_SYSTEM_FACTS.md`，并更新 `learning:shell:accept`；
- 禁止“顺便优化”造成课程之间 UX 漂移。
