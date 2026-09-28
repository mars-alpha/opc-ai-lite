# Track 04 Six-step Knowledge Point Audit v1

Status: **PASS / 15 KEEP / DIRECTORY_APPROVED_V1**
Task: **TRACK04-SIX-STEP-AUDIT-001**

## 1. Audit purpose

本审计不是生成课件，而是检查每个 Track 04 候选知识点是否足以独立形成一节六步课程，并避免把自动化工程术语拆成“名词课”。

通过条件：

1. 有一个零基础学员能理解的真实问题；
2. Step 1 能建立直觉而不是先背术语；
3. Step 2 有真实自媒体/一人公司业务案例；
4. Step 3 能用三题验证判断，而不是考缩写；
5. Step 4 能在现有 Unified Lesson Shell 中完成真实设计动作；
6. Step 5 能形成“AI适合做什么 / AI不应该替你做什么”的判断；
7. Step 6 有可复用能力与现实触发场景；
8. 与前后课存在清楚信息增益；
9. 不要求新增 Workflow Builder / Code Editor / Platform UI 才能完成教学。

## 2. Candidate audit

| ID | 核心问题 | Step 4 最小真实动作 | 独立能力闭环 | 初审 |
| --- | --- | --- | --- | --- |
| T4-01 | 这件事值得系统化吗？ | 对一条真实业务链做“重复性/稳定性/价值/风险”判断 | YES | KEEP |
| T4-02 | 人工流程怎样拆成机器可执行步骤？ | 把真实流程写成输入→处理→判断→输出→检查 | YES | KEEP |
| T4-03 | 什么时候启动？ | 定义事件/时间/条件触发与不触发条件 | YES | KEEP |
| T4-04 | 系统怎样知道自己跑到哪里？ | 定义最小状态与状态变化 | YES | KEEP |
| T4-05 | 什么时候继续、停止或失败？ | 写出继续/完成/停止/失败分支 | YES | KEEP |
| T4-06 | 每一步需要知道什么？ | 为节点做“必须知道/可选/不要加载”Context Map | YES | KEEP |
| T4-07 | AI、规则、工具、人分别做什么？ | 对每一步分配责任并解释原因 | YES | KEEP |
| T4-08 | 步骤之间怎样稳定交接？ | 定义结构化输入/输出字段与必填边界 | YES | KEEP |
| T4-09 | 什么时候连接接口、工具或模型上下文协议（MCP）？ | 为外部能力选择连接方式并定义输入输出 | YES | KEEP |
| T4-10 | 调用失败怎么办？ | 设计超时、重试、停止和人工处理规则 | YES | KEEP |
| T4-11 | 重复执行怎么办？ | 识别重复执行风险并设计去重/幂等判断 | YES | KEEP |
| T4-12 | 什么时候必须让人确认？ | 标记高风险动作、确认点和回退方式 | YES | KEEP |
| T4-13 | 什么情况下固定工作流不够？ | 比较固定流程和动态 Agent 决策 | YES | KEEP |
| T4-14 | 怎么证明流程稳定有效？ | 设计测试样例、成功指标、失败案例和回归检查 | YES | KEEP |
| T4-15 | 如何把整条链整理成可实现蓝图？ | 汇总真实业务链形成 工作流设计蓝图 | YES | KEEP |

## 3. Anti-repeat audit

- T4-02 不重复 T1-16：Track 01 只建立 Workflow 概念，T4-02 真正拆解已验证业务链。
- T4-06 不重复 T1 Context：基础 Context 关注一次任务；这里关注节点级、长期流程中的最小充分上下文。
- T4-07 不重复 T1 Tool/Skill/Agent：这里不背定义，而是对真实流程分配系统责任。
- T4-08 不重复 T1 Structured Output：这里强调节点之间的数据契约与交接，不教 JSON 语法。
- T4-09 不重复 API/MCP 基础：这里关注连接设计判断，不教接口开发。
- T4-12 不重复 T3-13：T3-13 判断客服什么时候转人工；T4-12 把人工确认设计成跨流程控制点。
- T4-13 不重复 Agent 基础：这里用真实 Workflow 判断是否真的需要动态决策。
- T4-14 不重复 Track 02/03 数据分析：这里评估系统行为的质量、稳定性与回归。

## 4. Continuity audit

T3-15 的结果：
“下一轮保留/修改/停止/继续验证什么”
↓
T4-01：
“哪些重复、稳定、值得复用的部分值得系统化”
↓
T4-02～12：
形成可控 Workflow 设计
↓
T4-13：
只在固定流程确实不够时判断是否需要 Agent
↓
T4-14：
证明系统不是只会跑，而是稳定有效
↓
T4-15：
形成 Workflow Design Blueprint
↓
Track 05：
围绕完整业务问题做 Solution Design / Prototype / Pilot / Adoption

## 5. Supporting knowledge that must not become extra Core lessons

以下内容可以作为案例或补充，但初审不独立成 Track 04 Core：

- HTTP method / status code / header；
- REST vs GraphQL；
- OAuth / token / rate limit；
- 完整 JSON Schema 语法；
- Queue / Event Bus / Scheduler 框架选型；
- Playwright / Selenium selector；
- Browser automation 平台操作；
- n8n / Zapier / Make / Dify 等具体平台按钮；
- Skill packaging/version registry；
- Multi-Agent framework；
- Secrets / IAM / RBAC / ABAC；
- 企业级 audit log；
- 代码部署和运维。

## 6. Audit result

产品负责人目录 Human Review 已确认：

**15 KEEP / 0 MERGE / 0 SPLIT / 0 DEFER / 0 REMOVE / DIRECTORY_APPROVED_V1**

目录审计已完成并兑现到正式 Runtime：T4-01～T4-15 全部 AVAILABLE / FORMAL_RUNTIME / ACCEPTANCE_PASS。本文只保留课程目录与六步可教学性审计结论，不再承担 current production Gate。
