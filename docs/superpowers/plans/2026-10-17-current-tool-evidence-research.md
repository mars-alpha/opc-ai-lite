# 当期工具作者与讨论证据研究（Task 5J）

研究截点：2026-10-17 05:24:40 UTC（含主线程服务器核查补充）。目标窗口为截点前 168 小时；日粒度文章仅能证明大致日期，不能补造精确首发时间。本记录是公开一手资料研究，不是 SYSTEM 采集、来源准入、实操复现或栏目 Gold；完整质量保持 `NOT_ACCEPTED / RELEASE_NOT_READY`。

## 方法与限制

读取 Task 5I 和现有 7 篇作者池后，以 MCP、Skill、Agent、Claude Code、工具名和 2026 年 10 月日期进行中英文/站点检索，再打开原作者页、项目仓库和 HN 原帖。聚合新闻仅用于发现 URL，未用其分数、日期或转述作事实证据。不调用付费模型/API，不写 DB、不新增 Source、不改变路由白名单。

每个 URL 分开记录原创身份、文章日期、工具/实现、材料和讨论；同作者的博客与 HN 评论只计一个人。HN 相对时间在不同检索缓存中有冲突，主线程已用官方 API 核准下列两个主帖和 Simon 评论的绝对时间；未核的其他评论不倒算日期。本文打开页面的时间不是 SYSTEM 首次发现时间。下述标签均为证据型探索判断，未由被测评分器反推。

## A. Tiny Little Office：最有价值的当期正例候选

| 证据 | 作者/日期 | 实际证明 | 不证明 |
| --- | --- | --- | --- |
| [官方原创介绍](https://aboard.com/introducing-tinylittleoffice-com/) | Paul Ford / Aboard；原生Feed为2026-10-14 16:21:30 UTC | 新工具及 Agent 文档生成场景；作者给出可编辑示例、LLM 集成说明和源码链接 | 独立外部测评、工具已由本项目执行、所有附件当前可用 |
| [Simon 原创实测](https://simonwillison.net/2026/Oct/15/latex/) | Simon Willison；现役Feed为2026-10-15 02:07:28 UTC | 明确让 Claude 读取 TLO 的 llms.txt，生成解释 URL 格式的演示稿；链接会话/成品并展示截图 | Simon 新建的 LaTeX renderer 与 TLO 是同一实现/发布事件 |
| [Simon 的 HN 原评论](https://news.ycombinator.com/item?id=50096438) | simonw；官方API为2026-10-14 22:34:07 UTC | 同一 TLO Agent 用法及演示稿；与博客可交叉关联 | 第二个独立作者 |
| [HN 主讨论](https://news.ycombinator.com/item?id=50096142) | donohoe 为提交者；官方API为2026-10-14 22:10:08 UTC | 本轮API显示692 points / 204 comments，有具体用法、限制与故障讨论 | HN 排名自身成为 Hotspot Authority；204 条评论等于 204 个独立事实发布者 |
| [mikepurvis 原评论](https://news.ycombinator.com/item?id=50099050) | mikepurvis；仅相对时间 | 作者明确只浅试 Trip Planner，提出旅行组织需求 | 完整教程、可复现成功案例，或第二位已验证实操教程作者 |

材料入口已打开：官方 [仓库](https://github.com/aboard-io/tinylittleoffice)、[llms.txt 源码](https://raw.githubusercontent.com/aboard-io/tinylittleoffice/main/public/llms.txt)、[tinyoffice Skill 源码](https://raw.githubusercontent.com/aboard-io/tinylittleoffice/main/skill/tinyoffice/SKILL.md)。当前 README 提供 Node 24、本地开发/测试/构建命令，Agent 路径包括读取 llms.txt、Node CLI 和 Claude Code Skill 安装。主线程随后通过[官方ref API](https://api.github.com/repos/aboard-io/tinylittleoffice/git/ref/heads/main)固定commit `faf8c5f9409bc332f60630e56a553d3d47220f5b`；raw出口Skill/llms/deck三次失败，改用同revision的官方Contents API成功冻结三文件并记录哈希，API参考文件也已实取。未安装Skill、未执行仓库代码。这些一次性研究请求不属于SYSTEM固定出口或Source资格。

关联结论：官方介绍与 Simon 对 TLO 的演示是同一工具的当期发布/使用证据；Simon 的 LaTeX renderer 是受其启发的新工具，应作为 `INSPIRED_BY / RELATED_TOOL`，不能并入 TLO 事件获得额外作者或项目材料。HN 中关于 bento.page、singlebook、语义 HTML remix 的讨论也不能不经校验借给 TLO。历史 TinySheet/TinyCalendar 或 HN 旧帖不能代替本期首发与观察。

独立性计数必须保留两个口径：**2 个不同原创发布身份 = Paul/Aboard + Simon；其中只有 1 位外部实测作者 = Simon**。Paul 与 Rich 同属 Aboard，不算两个独立发布组织。HN 提交人、浅试/需求评论或泛泛赞美不自动计入原作者教程数。

探索性分栏判断：

- `featured = POSITIVE`：探索性编辑正例，日期明确、原创产品变化、Agent 实用场景与独立实例具备；仍需真实采集投影验收。
- `hot = POSITIVE`：探索性编辑正例，两个原创发布身份、实质使用讨论及官方API绝对时间已核；不是人工Gold或生产Hotspot Authority，不直接写入栏目。
- `practice = UNKNOWN`：实际合同要求至少两个独立带原文发布者，官方可计一个，不要求两位外部实测作者；Paul/Aboard + Simon 已具备两个原创身份候选。主任务实取的 Simon 正文未通过共享 `evaluatePracticeMaterials`，因此仍缺合格材料，不能授正式练习正例。

## B. hw-harness：当期讨论充分，材料边界需严格保留

[Christian Schaller 原文](https://blogs.gnome.org/uraeus/2026/10/15/aiandreverseengineerhardware/)署名本人，日期 2026-10-15；[项目仓库](https://github.com/cschalle/hw-harness)是相同作者身份。作者描述 Windows VM 参考采集、Linux usbmon 捕获及两侧差分，并报告扫描仪/摄像头实机结果；同时明确**通用 hw-harness 是事后整理，原项目使用的是其前身脚本**。因此不能宣称通用仓库已在这些设备上按现形态复现。

[HN 原讨论](https://news.ycombinator.com/item?id=50104299)本轮官方API显示246 points / 236 comments，精确时间为2026-10-15 14:35:15 UTC。评论包含不同硬件/实现的作者自述，例如 [revolvingthrow](https://news.ycombinator.com/item?id=50106153)，但没有证明使用同一 hw-harness。原文评论中 bazfp 的 openoptic 也是不同硬件/实现。相关方法讨论不能转成同仓库的独立复现实测数。

探索判断：`featured = POSITIVE_CANDIDATE`，`hot = UNKNOWN_PENDING_PUBLISHER_ASSOCIATION`，`practice = UNKNOWN`。保留具体硬件、总线、虚拟机和作者材料限制；不能只因文章有命令/代码和热门讨论就自动授予练习资格。

## C. OpenCode 2：当期真实问题，但不作为现成练习正例

[原用户 Issue #55162](https://github.com/anomalyco/opencode/issues/55162)由 Sahil-Gupta584 于 2026-10-13 提交，明确 v2.0.26，后续提供 v2.0.28 命令输出及空 agents。线程也包含旧六月日志；官方机器人明确指出旧日志不能解释本期失败，且其 Linux 复现未出现用户的同样症状。机器人不能计第二个独立原作者，也不能把用户提出的 v1 插件原因当已证实根因。

[Caprock 自己的 changelog](https://caprock.dev/changelog/)描述集成 OpenCode 2 的启动参数/版本适配，是不同作者的实际集成线索；动态 changelog 必须取对应日期块，不能将页面最新日期借给所有条目。本次未为它建立同一 bug 或同一发布事件关联，也没有补齐教程材料。该组只作后续定向发现候选，三栏目均 `UNKNOWN`。

## 已排除的误合并与误授正例

- 现有 Simon 7 月 MCP、Eugene 2025 年新闻 Agent、n8n 4 月官方能力及 1 月 Python 桥接继续是历史材料；本次未改造成当期证据。
- [Blake Crosley 长指南](https://blakecrosley.com/guides/claude-code)可见更新日 2026-10-14，但更新日期不证明全文在本周原创，更不能自动关联为 TLO/hw-harness 的实测。
- [Irina Shvaya 首次网站操作教程](https://eseospace.com/blog/claude-code-first-session/)是另一 Claude Code 使用主题；不能只因共同使用 Claude Code 就补足 TLO 的独立实测人数。
- HN 关于 Simon LaTeX renderer 的上下文菜单截图属于派生 LaTeX 工具；TLO 的 Trip Planner 浅试和“写 here 无反应”属于使用/故障信号，均不是已验证完整教程。

## 交接给资格与连续观察验收

优先实取 TLO 官方介绍、Simon 本期文章、TLO 官方仓库/固定 commit 材料与 HN 两个主 item 及 Simon comment 的绝对时间。公开研究 HTTP、现役 Deno 白名单路由、SYSTEM 运行、Source Qualification 必须分别记录，禁止用研究请求补 SYSTEM 回执。当前作者池没有因此新增 Source 或 route。

需要后续真实样本才能完成：固定正文/附件 hash；身份归一和独立作者关联；当期讨论时间及项目投影；至少两个独立带原文发布者（官方可计一个）及至少一条共享材料 Validator 合格链接；连续 SYSTEM 成功观察及不可变 firstSeen。取得这些之前，发现延迟为 `UNKNOWN`，栏目整体质量继续 `NOT_ACCEPTED / RELEASE_NOT_READY`。

## 补充：按实际合同寻找可验证材料的练习正例

### D. n8n + Gemini 4 Argon：未补出可靠独立实测

[n8n 官方 2026-10-13 原文](https://blog.n8n.io/build-n8n-workflows-with-gemini-4-argon-mcp-the-assistant-and-agents/)署名 Liam Hampton，涵盖 MCP、Assistant 与 Agent 三条入口；本次只作为官方原创身份，不把官方 YouTube 同主题视频再算独立组织。[n8nKnowledge 的 10 月 14 日文章](https://n8nknowledge.com/blog/is-gemini-4-argon-the-best-llm-for-n8n-workflows/)虽然自述生产测试，但未提供原始日志或可访问工作流；页尾明示 FlipPress 自动 AI 管线。[DevAIToolkit 同期文](https://devaitoolkit.com/blog/is-gemini-4-argon-worth-it-for-dev-tooling/)也是 Sergii Muliarchuk/FlipFactory 身份，不是另一个独立作者；两文关于 10 月 9 日已测与 10 月 13 日上线的叙述也需要额外核实。不能用具体百分比和私有 workflow ID 的精确外观代替可审计材料。此组练习仍 `UNKNOWN`。

### E. Alissonerdx Character Swap v1.0：更强的同版本候选

| 一手材料 | 原创身份/时间 | 关联结论与待核项 |
| --- | --- | --- |
| [作者 Reddit 发布](https://www.reddit.com/r/StableDiffusion/comments/1x4jh3c/character_swap_minimax_h3_bfs_collection/) | u/Round_Awareness5490；检索索引标 2026-10-13，原页只有相对时间 | 自称训练作者，链接 Alissonerdx HF；同一身份仍需正式归一，不把 Reddit/HF 算两个作者 |
| [Rouage AI Lab 独立实测](https://note.com/rouageailab/n/n547122352046) | 2026-10-13 19:51，页面未在本文核时区 | 明确测 Alissonerdx 10/12 的 Character Swap LoRA v1.0，给出 A40 48GB / ComfyUI 0.39.0、9 组组合的成功失败、节点链、确切 LoRA 文件；可计不同原创发布身份候选 |
| [作者 HF card](https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI) | Alissonerdx；动态 main | Character Swap 专属行链接说明与 workflow；不要把同仓库 Head Swap / Live Wallpaper 当同版本成果 |
| [作者专属设置说明](https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI/blob/main/docs/character-swap.md) | HF 同作者 | 包含放置 LoRA、Add Guide、图片参考、body_swap 前缀、长度/宽高比及可选 Planner；实际正文还需共享 Validator 检查 |
| [作者 workflow JSON](https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI/blob/main/workflows/minimax_h3_character_swap_workflow.json) | HF 同作者 | 网页可展开 121kB JSON，不能因此声称节点依赖及权重全可下载或已执行 |

工具/版本关系有具体依据：Rouage 直接给出 `minimax_h3_character_swap_v1.0_ref2va_r64_gl` 与作者仓库一致，且区分 Akatz Labs 9 月 25 日的同名 LoRA。两者使用 Add Guide 的能力关联明确；Rouage 把作者 Turbo/BFSNodes workflow 改为原生节点 + PDD 8 step，因此是**同 LoRA 的独立实现/测试**，不是原 workflow 完全同构复现。该实测使用 AI 辅助撰文，但明确报告自己的硬件与正负结果；仍需材料 Gate，不能只凭“实测”字样授信。

Reddit 已见实质讨论：参考分辨率/脸部相似度、单人/多人限制、guide latents 与普通 reference 区别、错误编码器引起 shape mismatch 后修复完成。可追溯 [Maskwi2 的问题](https://www.reddit.com/r/StableDiffusion/comments/1x4jh3c/comment/pggfwbq/)与 [r0ni 的错误及修复](https://www.reddit.com/r/StableDiffusion/comments/1x4jh3c/comment/pgjks64/)；只是讨论/用户自述，不代替本项目复现。各缓存相对时间不同，严格讨论窗口待原站绝对时间核验，不能从搜索摘要倒算。

HF 树页返回 [commit 5fd1b0e563bb51e8abf2782b43ef82b16d504bff](https://huggingface.co/Alissonerdx/Minimax-H3-ComfyUI/commit/5fd1b0e563bb51e8abf2782b43ef82b16d504bff)，但固定 revision 的 raw 说明请求本工具未成功，本文不宣称已经冻结该 commit 的材料 hash。后续优先取得官方文件元数据/小型说明/JSON，不下载模型权重来凑采集验收。

探索结论：本组是 `PRACTICE_POSITIVE_CANDIDATE`，具备两个原创身份、同确切 LoRA、当期独立实测和可访问操作说明/JSON线索；**正式标签仍 `UNKNOWN_PENDING_TIME_IDENTITY_AND_SHARED_MATERIAL_VALIDATOR`**。只有真实路由、时间、身份及共享 Validator 均成功，才可升级为探索性正例；完整栏目质量仍不通过。

### F. 不与 E 混并的 ComfyUI 资料

[Next Diffusion 10 月 13 日教程](https://www.nextdiffusion.ai/tutorials/minimax-h3-creating-character-sheets-comfyui)有 RTX 6000 Pro、模型清单、步骤和 [可打开的 workflow JSON](https://storage.nextdiffusion.ai/comfyui-workflows/1791885634006_MiniMax-H3-Character-Sheets.json)，但其能力是 character sheets；[cgpixel23 原帖](https://www.reddit.com/r/comfyui_elite/comments/1x38n6q/comfyui_tutorial_consistent_ai_characters_in/)则是 Qwen Image 2.1 + RefMod 的角色一致性，均不同于 Alissonerdx Character Swap v1.0。不能只因 MiniMax H3 / ComfyUI 关键词相同就合并发布者数或借走讨论。Next Diffusion 附件只证明研究工具可读 JSON，未证明 SYSTEM 路由合格、依赖安装成功或执行成功。

## G. 服务器实取、来源资格与连续观察（主线程核查）

本节为实际回执结果；结构化样本见 `scripts/fixtures/current-tool-evidence-v1.json`。所有数据库连接以 PostgreSQL `default_transaction_read_only=on` 强制只读，并在查询前实际验证；没有触发生产采集、修改来源或资格，没有启用模型。

| 对象 | 实际路径与结果 | 可授予的结论 / 仍缺条件 |
| --- | --- | --- |
| Simon | 现役Deno固定Feed 30条、未截断；本期正文2399字符、完整回执及哈希 | 现有唯一匹配Source按当前checkpoint只读计算MATURE、最近5/5成功；正文材料校验仍缺步骤/输入/输出，不能计作练习材料正例 |
| Eugene | 现役Deno固定Feed 100条、truncated=true | 本次路由可取；返回样本无7日条目，不代表全历史完整，本次canonical主机筛选未找到对应Source，不能授予成熟资格 |
| Hamel | 现役Deno固定Feed 20条、未截断 | 本次路由可取；返回样本无7日条目，本次canonical主机筛选未找到对应Source的持续SYSTEM证据 |
| Indus / Penumbra | 服务器现役共享材料路由解析为null，无需发起越界请求 | NO_FIXED_MATERIAL_ROUTE；不创建重复Source、不把普通HTTP作为默认采集 |
| Aboard | 原生 `https://aboard.com/feed/` 一次性研究HTTP 200，10条，包含Paul Ford署名及TLO精确时间；XML哈希已冻结 | 已找到优先候选RSS入口；尚无SYSTEM固定Deno路由/Source资格，不把研究探测变成正式Run |
| Rouage | 原文研究工具可读，服务器原生 `https://note.com/rouageailab/rss` 本次URLError；Note/HF仓库材料无现役固定路由 | 真实出口仍未就绪，sharedMaterialEligible=null / NOT_EVALUATED，不作为材料校验负例 |

[note官方RSS帮助](https://www.help-note.com/hc/ja/articles/900001001246)说明普通RSS提供文章开头，全文RSS有额外条件；不能因取得RSS便宣称完整正文。优先原生Feed的下一项具体接线对象为Aboard；Rouage须先解决原生Feed出口及限定作者正文，HF应按固定仓库/revision读取小型说明与workflow JSON。都复用Source身份、Acquisition Plan、Deno固定白名单与原Qualification，不新建调度或任意URL代理。

HN官方API分别取得 [TLO主帖](https://hacker-news.firebaseio.com/v0/item/50096142.json)、[Simon评论](https://hacker-news.firebaseio.com/v0/item/50096438.json)、[硬件主帖](https://hacker-news.firebaseio.com/v0/item/50104299.json)的绝对Unix时间与响应哈希；HN HTML本次服务器研究请求失败，不影响上述API事实。TLO固定revision的raw文档出口部分超时，官方Contents API随后成功；该主备取证过程只是一次性研究，不给SYSTEM登记成功。HF固定文档与Reddit JSON本次研究请求失败，不能据此补造日期、附件可用或身份认证。

连续观察：05:15:16 UTC首次只读时，Simon最新Run为 `15a388e9-3e64-4a98-bf53-9a8f20603dbd`；05:20:49 UTC第二次只读时，自然产生了 `5791cca9-df00-46af-9665-7370ab1732bf`（05:16:14 UTC开始并成功）。第二次近6小时读取到22个Run，均SUCCEEDED且同checkpoint/SYSTEM，覆盖约5小时44分；这不是72小时或完整7日稳定性验收。

首次只读的17条Simon Observation中，新版首SYSTEM回执为0；第二次所查当期Simon文章亦为0。四个精确候选URL只命中Simon LaTeX一条Raw及一个直接Event；不能把其TLO支持段落自动提升成第二个TLO事件，也不能据此推断全库召回率。生产未部署5I首见代码，现有collectedAt/observedAt不回填成首SYSTEM时间。因此 discoveryDelayHours=null / UNKNOWN；自然运行连续成功不能补足不可变首见证据。

独立资料复核未发现事实或资格混用的阻断问题，并据其建议将Character Swap未执行校验的false改为null / NOT_EVALUATED；远端哈希由主线程实际请求记录，复核者未独立重取。不宣称完成Gold、全量召回或正式练习正例验收；下一步的阻点已具体落到固定来源/材料接线、资格与首见版本上线后的真实连续记录。
