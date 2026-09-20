# COURSE-BUILDER-SKILL-002-B — Knowledge Depth Expansion

Status: COMPLETE_HUMAN_REVIEW_PENDING

## Goal

在不改变已经通过 Human Review 的 APPLICATION 课程体验结构前提下，提高单节课的知识密度。

保留：

EXPLAIN → EXAMPLE → CHECK → PRACTICE → REVIEW → CAPABILITY

不增加新的交互类型、Completion Gate、Runtime 或正式发布能力。

## Knowledge Depth

Prompt 课程现在形成 4 个核心知识点：

1. 基础结构：任务 / 背景 / 限制 / 结果。
2. Example（示例）：当格式、语气或结构难以描述时，用短示例展示期望。
3. Context（上下文）：依赖文件、历史、客户信息等资料时，关键资料必须真正进入当前上下文。
4. Iteration（迭代）：第一次结果不好时，指出具体偏差并补缺失信息，而不是只说“再好一点”。

知识没有集中堆在 Step 1，而是主要分散到 Step 2 Example、Step 4 Practice hints、Step 5 Review 与 Capability。

## UX

- Step 1 保持原来的轻量直接对比。
- Step 2 在案例结果后增加两条轻量知识补充：Example / Context。
- Step 4 保持一个核心练习，不增加 Gate，只增加一个可选提示：格式很具体时可补短示例。
- Step 5 保留误区 / 正确理解，并增加两条轻量总结：如何补缺失信息、如何做 Iteration。
- 新增知识区使用轻量两列文字区，不新增重卡片或新交互。

## Grounding

本轮再次核对公开官方提示工程资料。稳定共识包括：

- 指令清晰具体；
- 提供足够上下文；
- 明确输出格式；
- 必要时通过 Example 展示期望；
- 根据实际输出继续迭代。

Course Builder 本身仍不联网；这些资料属于已研究的 Research Packet。

## Acceptance

APPLICATION acceptance 新增：

- knowledgePoints 必须有 4 个；
- 必须覆盖 Example；
- 必须覆盖 Context；
- 必须覆盖 Iteration。

## Validation

- npm run course-builder:check PASS
- npm run course-builder:accept PASS
- npm run course-builder:accept:application PASS
- npm run typecheck PASS
- npm run build PASS
- 32 static pages generated
- git diff --check PASS

已知原有非阻塞 autoprefixer warning 仍存在，不属于本任务新增问题。

## Boundary

未加入正式课程目录。
未注册正式 Runtime。
未写数据库。
未连接真实 AI Provider。
未增加新的 Completion Gate。
未发布课程。

## Next

Human Review：重新体验 /course-builder/preview/prompt-foundations，重点判断知识量增加后是否仍然轻、易懂、有获得感。
