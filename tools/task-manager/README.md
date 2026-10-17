# 独立开发任务管理器

## Decision Brief — DEV-TASK-MANAGER-001

- Goal / Role：项目负责人和开发者快速核对开发进度、阻塞、下一步、版本差异与治理候选。
- Product Surface：独立 localhost 工具，不加入 OPC AI 前台、后台、数据库或生产部署。
- Must Know：TASKS.md、PROJECT_STATUS.md、CURRENT_SYSTEM_FACTS.md、Git、package scripts 引用；Nice to Know：关联任务记录；Do Not Load：Git 历史正文、课程正文、环境密钥。
- In Scope：只读投影、来源定位、阶段标签、搜索筛选、本地备注、治理提示隐藏/恢复、自动刷新、JSON 导出。
- Out of Scope：自动删文件、改任务状态、执行任务脚本、部署、自动宣称质量或用户审核通过。AI辅助范围见下方AI增量Brief。
- Code：确定性解析、引用检查、localhost HTTP 与 UI；AI/Skill / Workflow：见AI增量Brief；Human：可体验及后续反馈，遵循本次“自行推进、不提问”授权，不伪造 USER_APPROVED。
- Data Read：固定 current owners 与 Git 非忽略文件；Data Write：工具源码、浏览器 localStorage 备注/隐藏项；Entitlement：仅回环地址；AI新增的配置与外部调用边界见下方Brief。
- Options：后台新页面、静态快照、独立只读工具。Recommended：独立 Node 标准库工具；避免改冻结 UI，动态读取唯一 owner，零新增依赖。
- Acceptance：任务可追溯、未知不冒充完成、开发/候选/线上分开；治理候选提供理由/风险/验证，未跟踪文件不自动推荐删除；响应不包含环境配置内容。
- Validation：node --test、JS 语法检查、HTTP/浏览器体验；仓库 typecheck/build、git diff --check。
- Rollback：停止该进程并移除 tools/task-manager；不影响业务主链。
- Owner：任务正文 TASKS.md；部署正文 docs/CURRENT_SYSTEM_FACTS.md；阶段 PROJECT_STATUS.md；本文件仅拥有工具用法和本任务 Decision Brief。

## Decision Brief — DEV-TASK-MANAGER-AI-002

- Goal / Role / Surface：项目开发者在独立工具中使用已有 DeepSeek 分析任务推进优先级、未部署与治理原因，生成可直接交给 Codex 的 Prompt。
- Scope：手动触发单次分析、排序及理由/证据、依赖与下一步、按任务/总体生成 Prompt、复制、重分析与失效标记；不代执行、不删文件、不发布、不改正式状态。
- Code / AI / Skill / Workflow / Human：Code 限制输入、校验输出ID/证据、生成受控Prompt、保护密钥；AI只做语义诊断/排序；版本化本地 analysis contract 拥有输入输出Schema；固定读取→调用现有 configured-chat→校验→展示；Human决定何时使用Prompt，无自动业务状态转换。
- Read / Write / Entitlement / External Side Effect：读取current snapshot和服务端已有OPC_AI_ANALYSIS配置；验证后的结果保存至gitignored .runtime/task-manager；仅localhost和同源手动触发；把最小任务/版本/治理证据发送至既有DeepSeek Provider，产生该次模型用量。
- Options / Recommendation：规则排序无法分析语义；直接新建Provider客户端会重复已有调用链；推荐子进程复用configured-chat.ts和同一.env.local配置，不向浏览器、Prompt、日志传递密钥，不新增依赖。
- Acceptance：覆盖所有当前任务与治理候选，引用有效ID/原文证据，优先级唯一且有理由；缺信息明确UNKNOWN，不臆测发布批准；总体及单项Prompt可复制，含验收/回退/边界；失败可恢复，旧结果不冒充新结果。
- Validation：先写contract/Provider边界及HTTP失败测试，mock与一次真实DeepSeek调用；浏览器触发/排序/展开/复制；typecheck/build与治理检查。
- Rollback / Owner：停用分析入口或回退本工具增量；配置唯一owner仍是configured-chat.ts，任务和部署正文owner保持不变；本说明拥有该任务brief与验收。

## Decision Brief — DEV-TASK-MANAGER-VISUAL-003

- Role / Surface：开发负责人使用独立控制台核对Git版本、部署与回退、功能优化差异，并取得阻塞驱动的下一步Codex任务计划。
- Must Know：三个current owners、Git元数据及本工具；Nice to Know：任务关联验收；不加载课程正文、密钥、历史方案全文。
- Code / AI / Workflow / Human：Code投影最近Git提交及差异、部署回退证据、验证计划Schema与依赖；AI为近期任务列需求、边界、验收、治理、自检修正；固定读取→分析→校验→生成Prompt；体验确认单独记录。
- 推荐：复用现有只读快照与DeepSeek，增加版本时间线/基线比较及结构化近期计划。Git可恢复提交不等于已部署，也不等于已验证生产回退；缺少部署SHA时显示UNKNOWN，不从提交日期或release名称猜测。
- Scope：最近12次提交、当前工作区相对基线的文件数量和提交主题、线上/前版release与Git映射状态、当前任务功能差异；最多3项近期计划，覆盖显式需求/边界/验收/治理/自检/修正步骤与Prompt。
- Acceptance / Validation：用临时Git仓库测试真实diff、未提交/未跟踪差异和未知部署映射；计划字段/任务ID/完整性及过期缓存测试；实际浏览器比较与复制；真实DeepSeek、typecheck/build和治理检查。
- Rollback / Owner：回退本工具源码或停止本机进程；无Git reset/checkout、部署或清理接口。工具说明拥有本Brief，部署和任务仍由各自owner负责。UI_IMPLEMENTED与USER_APPROVED分开记录。

## 运行

在仓库根目录：

```powershell
node tools/task-manager/server.mjs
```

打开 http://127.0.0.1:4317 。更换端口：`node tools/task-manager/server.mjs --port=4318`。

Windows 也可双击同目录 `start.cmd`，保持窗口运行。停止时在窗口按 Ctrl+C。

检查：`node --test tools/task-manager/test.mjs tools/task-manager/ai.test.mjs tools/task-manager/versions.test.mjs`。

## Git版本可视化与对比

版本区保留当前开发/候选/Web/SYSTEM/Relay记录，增加最近12个本地Git提交的可恢复时间线。点击提交卡片或选择基线，下方比较表展示完整SHA、提交时间、部署绑定状态、提交主题、相对基线的文件变化，以及暂存/未暂存和未跟踪增量；条形图按目录统计变化，功能/优化主题来自基线之后的Git提交记录。当前任务已开发功能及部署差异另按任务原文展开，不能据此推断基线版本一定缺少该功能。

线上与回退release读取CURRENT_SYSTEM_FACTS，不通过日期、审计SHA或release名称猜测Git映射。可在该owner登记明确的“线上Git提交：`SHA`”“回退Git提交：`SHA`”（同一Web/SYSTEM release组），工具将匹配本地提交并标记绑定；单独Relay revision继续保持独立。当前没有这两项映射时显示UNKNOWN。本地Git对象存在只证明代码可取回，不证明生产依赖、数据库、配置或回退演练已就绪。所有比较只读，无reset/checkout/发布接口。

## AI 推进分析

进入“AI 推进分析”，点击“开始 AI 分析”。服务端复用 `.env.local` 中现有 `OPC_AI_ANALYSIS_BASE_URL / API_KEY / MODEL / PROVIDER` 和 `lib/server/ai/configured-chat.ts`，当前配置须识别为 DeepSeek；不新增密钥、不修改配置。配置有变更后重启工具。

每次手动触发最多调用一次模型（180秒请求上限、32000输出token上限），无自动重试。模型使用既有账户额度，Provider回报用量会显示在结果中。浏览器刷新/轮询不调用模型。仅发送最小任务与版本/治理证据，不发送文件全文、环境配置、密钥或浏览器备注。结果须通过全量任务覆盖、优先级、真实引文、有效ID与无环依赖校验；Core按依赖和优先级生成整体/单项Codex Prompt。未知未部署原因必须标明UNKNOWN。

验证后的分析缓存在 `.runtime/task-manager/ai-analysis.json`（Git忽略），可重启恢复。任务/版本/治理依据变化会标记旧结果过期并禁用复制按钮；旧Prompt原文仅供回看。Prompt是建议，不等于Codex消息派发、发布批准或删除授权。按“复制整体 Codex Prompt”或“复制此项 Prompt”，粘贴到目标Codex聊天即可。

V2分析新增最多3项“下一步计划”：根据当前任务原文、阻塞、依赖和部署/回退映射，列出需求、边界、可验证验收、治理项、推进步骤、自我检查、失败定位修正与重验。每项均可复制包含这些清单的Codex Prompt；整体Prompt先放近期计划，再列完整优先队列。旧V1缓存没有计划字段，不再作为V2有效结果展示。

任务从 NOW / NEXT / BACKLOG 的段落和列表逐条投影，保留原文证据；复合任务不会被伪造为已完成子任务。状态是显式词句推导的辅助标签，可展开原文核对。更新任务仍编辑原 owner。线上版本仅为文档记录，不代表当前实时生产健康；候选版本没有发布清单时显示未知。

备注与隐藏提示仅保存在当前浏览器，可清除和恢复，不覆盖正式事实。治理扫描排除环境文件、依赖、构建产物和业务数据；仅未被忽略的 Git 路径参与引用检查。零引用只是人工复核线索，不是可安全删除证明。工具没有删除/发布接口。

## 实施验证

2026-10-17：IMPLEMENTED / LOCAL_EXPERIENCE_READY / USER_APPROVAL_NOT_RECORDED。按用户本轮授权自行实现、检查和修正，未请求确认；未把 Agent 自检标记为 USER_APPROVED。

- 9 项 Node 测试通过：任务解析、版本证据、混合发布、治理误报边界、真实 HTTP / 只读与敏感路径隔离。
- 浏览器实际操作通过：搜索 5H、阻塞筛选、展开进度、保存补充、重载持久化、清除补充、清除/恢复治理提示、JSON 快照导出。
- 主仓库 typecheck、build（103 静态页）、scripts:current:check、governance:repository:check、governance:development:check 通过。首次受限构建 EPERM，原工作区重跑通过；没有修改业务构建配置。
- 未改前台/后台页面、导航、业务 API、Schema 或生产部署；未清理用户已有文件。

### AI 增量验证

2026-10-17：AI IMPLEMENTED / LOCAL_EXPERIENCE_READY；USER_APPROVAL_NOT_RECORDED。

- 完整17项测试通过，包含最小输入、全量覆盖、伪造引文拒绝、依赖环拒绝、按依赖排序、密钥反射拒绝、并发单调用、缓存恢复与脱敏错误分类；HTTP测试确认跨源或缺少动作头不能触发模型。
- 真实复用既有DEEPSEEK / deepseek-flash，成功分析35项任务及3项治理提示；所有ID、原文引证和无环依赖校验通过，结果已保存且未过期。成功回报5703输入、22424输出（含17190 reasoning）、28127总tokens；仅为成功这次的Provider回报。
- 实测发现14000输出上限会被思考及正文共同耗尽；截断结果拒绝展示，补充固定脱敏诊断后将上限改为现有调用链支持的32000，并缩短正文。无自动重试；修正后真实调用通过。
- 浏览器实际触发、状态轮询、结果展示、原文证据展开、整体/单项Prompt复制通过；整体Prompt为10812字符。只生成建议，无自动派发、部署或文件清理。
- 仓库typecheck、build及既有治理检查通过；JS语法与文档空白检查通过。源码指纹见PROJECT_STATUS；业务界面与课程保持冻结。

### 版本可视化与近期计划增量验证

2026-10-17：IMPLEMENTED / LOCAL_EXPERIENCE_READY；USER_APPROVAL_NOT_RECORDED。

- 全部20项测试通过：新增真实临时Git仓库的基线/工作区/未跟踪比较，未知部署SHA与历史审计SHA隔离，以及V2近期计划必填字段、Prompt内容和计划顺序回归。模型计划展示顺序不一致的失败断言已复现，Core按全局依赖/优先队列统一修正并重验。
- 浏览器切换到150b0dd基线，显示完整SHA、103个已跟踪文件差异及未跟踪增量；提交时间线、目录差异、线上与前版回退原文可查看。当前生产release已登记，但部署Git/回退Git映射仍UNKNOWN；没有把任一历史提交标为已验证生产回退版本。
- 真实DeepSeek V2分析覆盖38项，生成3项完整近期计划；回报输入7140、输出19324（含13092 reasoning）、总26464 tokens。证据、ID、依赖和计划字段校验通过；结果已保存，进程重启从缓存恢复且未过期，没有再次调用模型。
- 整体Prompt及首项近期计划复制通过，首项1239字符，实际剪贴板包含需求、边界、验收、治理、推进、自检、修正全部清单。界面截图位于gitignored `.runtime/task-manager/version-comparison.png` 和 `next-plan.png`。
- 主仓库typecheck、build（103页）、scripts:current:check、governance:repository:check、governance:development:check、JS语法与文档空白检查通过。没有新增业务页面、修改课程或执行生产回退/部署/文件清理。
