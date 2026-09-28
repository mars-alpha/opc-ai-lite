# Deferred Knowledge Ledger v1

Status: **ACTIVE_GLOBAL_PLANNING_INPUT**
Purpose: 记录“Track 01 基础认知阶段未展开、当前不应展开，但后续板块值得重新规划”的知识。

Latest confirmation: **TRACK01-T11-T20-RUNTIME-001**

本 Ledger 当前条目已在 T1-11～T1-20 实际 Workflow Draft Generation 中重新确认：这些知识不是因为缺少 UI 而遗漏，而是因为它们超出 Track 01 Beginner Primary Knowledge Point；后续 Track 02～05 规划必须重新评估是否形成独立六步能力闭环。

## 1. Governance

固定原则：

- 当前课未展开的原因必须先判断是“知识深度 / 课程归属 / Beginner 认知负担”，不能简单归因于前端表达能力；
- 先判断是不是当前 Primary Knowledge Point；
- 不是当前主知识点但需要一点背景：SUPPORTING_KNOWLEDGE；
- 值得独立形成后续能力：DEFER_TO_LATER_TRACK；
- 对 OPC 主学习路径价值低或过度工程化：OUT_OF_SCOPE；
- Deferred 项必须有后续规划归属，不能只写“以后再说”；
- 后续 Track 规划开始时必须读取本 Ledger 最新版本。

## 2. Track mapping

后续板块当前长期方向：

- Track 02 — AI 工作应用
- Track 03 — 推广运营与业务增长
- Track 04 — Workflow 与自动化
- Track 05 — FDE / AI 解决方案工程

## 3. T1-11～T1-20 Deferred items

| Source | Deferred knowledge | Classification | Planned home | Why deferred now |
| --- | --- | --- | --- | --- |
| T1-11 API | HTTP methods / status codes / headers | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | 属于接口工程，不影响 Beginner 建立 Request/Response 边界 |
| T1-11 API | OAuth / API Key / token auth / rate limit | DEFER_TO_LATER_TRACK | Track 05 | 属于真实系统集成与安全 |
| T1-11 API | Webhook / SDK / REST vs GraphQL | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | 属于系统集成模式 |
| T1-12 Schema | JSON Schema 完整语法 / nested schema | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | Beginner 只需理解稳定字段契约 |
| T1-12 Schema | Type generation / validator library / ORM schema | DEFER_TO_LATER_TRACK | Track 05 | 工程实现细节 |
| T1-13 Tool Use | Tool registry / retries / timeout / idempotency | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | 属于可靠执行机制 |
| T1-13 Tool Use | Tool sandbox / permission resolver | DEFER_TO_LATER_TRACK | Track 05 | 属于生产安全架构 |
| T1-14 MCP | MCP server/client implementation | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | Track 01 只建立统一连接层直觉 |
| T1-14 MCP | Transport / auth / deployment topology | DEFER_TO_LATER_TRACK | Track 05 | 属于协议与部署工程 |
| T1-15 Skill | Skill packaging / versioning / registry | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | 后续需要结合真实 Skill 生命周期学习 |
| T1-15 Skill | Skill evaluation / composition / Skill-to-Skill | DEFER_TO_LATER_TRACK | Track 05 | 需要更成熟的 Agent/Workflow 基础 |
| T1-16 Workflow | Queue / scheduler / event bus / state machine | DEFER_TO_LATER_TRACK | Track 04 | 正式自动化工程核心 |
| T1-16 Workflow | Retry / compensation / idempotency | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | 生产可靠性主题 |
| T1-17 Agent | Planning / reflection / long-running state | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | Track 01 只讲 Agent 与 Workflow 的边界 |
| T1-17 Agent | Multi-Agent / orchestration framework | DEFER_TO_LATER_TRACK | Track 05 | 高复杂度，不适合基础认知 |
| T1-18 Multimodal | OCR / ASR / TTS pipelines | DEFER_TO_LATER_TRACK | Track 02 / Track 03 | 应结合文件、内容、营销真实应用学习 |
| T1-18 Multimodal | Media preprocessing / frame sampling / compression | DEFER_TO_LATER_TRACK | Track 03 / Track 05 | 工程或内容生产细节 |
| T1-19 Execution | Browser automation selectors / Playwright / Selenium | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | 属于真实自动化实现 |
| T1-19 Execution | Code sandbox / execution isolation | DEFER_TO_LATER_TRACK | Track 05 | 安全工程 |
| T1-19 Execution | Desktop RPA / Computer Use reliability | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | 应结合真实业务流程 |
| T1-20 Safety | PII classification / secrets management | DEFER_TO_LATER_TRACK | Track 05 | 企业级安全与治理 |
| T1-20 Safety | RBAC / ABAC / IAM | DEFER_TO_LATER_TRACK | Track 05 | 权限系统工程 |
| T1-20 Safety | Audit logs / approval workflow architecture | DEFER_TO_LATER_TRACK | Track 04 / Track 05 | 应结合实际 Workflow / FDE |
| T1-20 Safety | GDPR / PDPA / PIPL 法规细节 | OUT_OF_SCOPE | 专项合规课程 / 企业扩展 | 不适合作为通用基础课内容 |

## 4. Supporting knowledge that may appear briefly

这些内容允许作为当前课程一句话辅助，但不得变成新的主知识点：

- T1-11：API 可能需要认证；
- T1-12：常见结构可用 JSON 表达；
- T1-13：工具调用需要权限；
- T1-14：MCP 仍然需要安全与权限控制；
- T1-16：Workflow 运行失败需要处理；
- T1-17：Agent 动态性越高越需要观察与停止条件；
- T1-18：不同模型支持的媒体能力不同；
- T1-19：界面自动化通常比稳定 API 更脆弱；
- T1-20：不同地区和行业可能有额外合规要求。

只用于帮助理解，不在 Track 01 展开工程教学。

## 5. Future Track planning rule

Track 02～05 规划时必须：

1. 读取本 Ledger；
2. 只吸收与该 Track 能力目标有关的 Deferred 项；
3. 重新做 Six-step Knowledge Point Gate；
4. 不因为本 Ledger 已登记就自动生成课程；
5. 能形成独立能力闭环才升级为正式 Lesson；
6. 仍不适合时继续保持 Deferred，不强行清空 Ledger。

## 5.1 Track 02 planning resolution — TRACK02-CURRICULUM-CONTEXT-001

Track 02 Context Freeze 已重新评估与其能力目标有关的 Deferred 项：

- `OCR / ASR / TTS pipelines`：Track 02 可使用“把图片/音频/视频转成可处理信息”作为文件/资料工作的应用场景，但 pipeline、模型选型、工程串联不是 Track 02 Primary Knowledge Home，也不独立成 Core Lesson；
- Formula / SQL / Python：可以作为 AI 辅助产生的工作结果或 supporting example，但普通路径不要求学习语言本身；
- Media preprocessing / frame sampling / compression：继续留给 Track 03 内容生产或 Advanced Technical；
- Skill packaging / versioning / registry、Workflow / Agent engineering、API / MCP engineering、Browser automation、可靠执行与权限架构：不进入 Track 02，继续按后续 Track / Advanced Technical 重新评估；
- Track 02 不因为真实文件、表格或知识库场景而新增上传器、Spreadsheet、图表编辑器或 Knowledge Base UI；这些场景使用现有 Unified Lesson Shell 的 Sample Input / Practice Context / COPY_TO_AI 表达。

因此，当前 Ledger 没有任何条目因登记为 Deferred 而自动升级成 Track 02 第 16 节或新增 Primary Knowledge Home。

## 5.2 Track 03 planning resolution — TRACK03-CURRICULUM-CONTEXT-001

Track 03 重新评估与业务增长有关的 Deferred 项：

- OCR / ASR / TTS：可作为 T3-06 多模态内容再利用的 supporting capability，不升级为 pipeline 工程课；
- Media preprocessing / frame sampling / compression：普通路径只说明素材准备边界，工程参数继续 Deferred 到 Advanced Technical / Track 05；
- 渠道营销与多模态内容生产：已经吸收为 Track 03 的稳定业务方法，但具体平台按钮、账号配置、发布后台只属于 Channel Practice；
- RAG：在客服场景只调用“基于可信知识答复”的既有能力，不重教 RAG 原理；
- Workflow / Agent / API / MCP / Browser automation / Computer Use reliability：不进入 Track 03 Core，继续进入 Track 04/05；
- IAM / RBAC / Secrets / Audit / 合规架构：继续留给 Track 05 / 企业扩展。

因此 Track 03 不因 Deferred Ledger 自动新增第 16 节；当前 Six-step Audit 收敛为 15 个 Primary Knowledge Home。

## 5.3 Track 04 resolution — RELEASED

Track 04 已按“把已人工验证的流程系统化”完成课程审计、生产与正式发布；以下记录保留其知识吸收边界：

- Queue / Scheduler / Event / State Machine：吸收其“触发、状态、停止/失败”的系统设计责任，不教授具体框架或部署；
- Retry / Idempotency：已进入可靠工作流核心课程；Compensation 保持 supporting knowledge，不独立成课；
- Agent long-running state：只吸收状态与 Workflow-vs-Agent 动态性边界，不进入 Multi-Agent framework；
- API / Tool / MCP：吸收连接设计与输入输出契约判断，不重复基础定义，也不进入 OAuth / transport / deployment 工程；
- Browser / Computer Use：作为外部执行能力与失败案例出现，不独立成平台操作课；
- Approval / HITL：吸收为跨 Workflow 的人工确认与回退控制点；企业级 audit / IAM 继续留 Track 05；
- 完整 JSON Schema、Skill lifecycle、Sandbox、OAuth/Secrets、IAM/RBAC、Multi-Agent、部署运维继续 Deferred 到 Track 05 / Technical / Enterprise。

上述 planning resolution 已兑现为 T4-01～T4-15 共 15 个正式 Primary Knowledge Home，并完成 Human Review / Runtime Acceptance。未被 Track 04 吸收的工程实现边界继续 Deferred 到 Track 05 / Technical / Enterprise；本 Ledger 不再维护第二份 Track 04 目录。

## 6. Workflow generation findings — T1-11～T1-20

实际生成 10 节 Draft 后确认，以下知识如果强行塞进当前课，会明显破坏“一个主问题 + Beginner 最小动作”的教学边界：

- T1-11：认证、Webhook、Rate Limit、REST/GraphQL 属于真实接口集成工程；
- T1-12：完整 JSON Schema、复杂验证、类型生成属于结构化数据工程；
- T1-13：Tool Registry、超时、重试、幂等、沙箱属于工具可靠执行；
- T1-14：MCP Server/Client、Transport、认证与部署属于 MCP 工程实现；
- T1-15：Skill packaging、版本生命周期、评测、组合属于可复用 AI 能力工程；
- T1-16：队列、调度、状态机、失败补偿属于 Workflow 自动化工程；
- T1-17：Planning、Reflection、长期状态、Multi-Agent 属于 Agent Engineering；
- T1-18：OCR / ASR / TTS、媒体预处理、帧采样属于 Multimodal 应用/工程；
- T1-19：Playwright / Browser Automation、Sandbox、Computer Use reliability 属于执行工程；
- T1-20：IAM / RBAC / Secrets / Audit / Approval Architecture 与法规细节属于企业安全治理。

这些条目中已由 Track 02～04 吸收的内容以各 Track current owner 为准；剩余工程实现与企业级内容继续作为 Track 05 / Technical / Enterprise 规划输入，并仍需 Six-step Knowledge Point Gate。

## 7. Human Review confirmation — T1-11～T1-20

Human Review 再次确认：当前 Ledger 的 Deferred 边界仍然有效，不需要为了让基础课“显得完整”把工程实现塞回 Track 01。

本轮特别确认：

- 结构化输出的代码式字段命名、序列化与完整 Schema 工程继续留在 Track 04 / Track 05；Track 01 只使用自然字段建立结构直觉；
- Agent 的状态表示、持久化、Planning / Reflection 等工程内容继续留在 Track 04 / Track 05；Track 01 只要求学习者能写清目标、当前状态与观察、判断与行动、停止条件；
- Tool / API / Browser / Computer Use 的生产可靠性、认证、重试、隔离和自动化框架继续按现有条目进入 Track 04 / Track 05；
- Track 01 的 Human Review 修正只提升学员语言、现实触发与能力闭环，不通过新增 UI 或扩展知识深度解决内容问题。

Track 05 继续按本 Ledger Section 5 重新做 Six-step Knowledge Point Gate，不自动把剩余 Deferred 条目升级为课程。

## 8. Runtime acceptance confirmation — T1-11～T1-20

T1-11～T1-20 已完成正式 Runtime Acceptance。接入过程中没有发现需要通过新增 UI、Renderer、interaction type 或 CSS 才能表达的 Track 01 核心知识缺口，因此本 Ledger 的知识边界保持不变。

Runtime 实现中涉及的数据库 provisioning、Check / Practice Gate、幂等写入与验收脚本属于课程运行基础设施，不反向升级为 Beginner 课程知识点；Track 02～05 仍按 Section 5 重新规划。
