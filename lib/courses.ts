export type LessonGuideBlock = {
  type: "prompt" | "template" | "steps" | "checklist" | "example";
  title: string;
  intro?: string;
  body?: string;
  items?: string[];
};

export type Lesson = {
  id: string;
  title: string;
  duration: string;
  summary: string;
  plainExplanation: string;
  whyItMatters: string;
  points: string[];
  content: string[];
  example: { title: string; situation: string; before?: string; after?: string; result: string };
  guides: LessonGuideBlock[];
  practice: { goal: string; steps: string[]; acceptance: string[] };
  mistakes: string[];
  related: string[];
};

export type CourseModule = { id:string; title:string; description:string; lessons:Lesson[] };
export type Course = { slug:string; title:string; stage:string; stageLabel:string; level:string; duration:string; summary:string; outcome:string; modules:CourseModule[] };

export const courses: Course[] = [
  {
    slug:"ai-literacy", title:"AI 入门：从 0 到 1 认识生成式 AI", stage:"AI Literacy", stageLabel:"Stage 1 · 看懂 AI", level:"入门", duration:"1.5 小时",
    summary:"建立生成式 AI 的基础世界模型，理解模型、上下文、Token、Memory、RAG、API 与 Agent 的基本关系。",
    outcome:"看懂常见 AI 产品与核心技术概念，并知道它们分别适合解决什么问题。",
    modules:[
      { id:"foundation", title:"01 · 建立 AI 基础认知", description:"理解生成式 AI 的核心工作方式。", lessons:[
        {
          id:"what-is-genai", title:"什么是生成式 AI", duration:"12 分钟", summary:"建立不依赖具体产品的 AI 基础认知。",
          plainExplanation:"你可以把生成式 AI 理解成一个非常擅长“根据上下文继续往下生成”的概率系统，而不是一个永远知道正确答案的数据库。",
          whyItMatters:"如果一开始就把 AI 当成搜索引擎或万能专家，后面会很难理解幻觉、上下文、验证和工具调用为什么重要。",
          points:["理解生成式 AI 与传统软件的差异","知道模型能力来自哪里","建立“生成 ≠ 事实”的直觉"],
          content:["传统软件通常按预先写好的规则执行；生成式 AI 则根据训练形成的模式，在当前上下文中预测和生成内容。","它特别擅长语言转换、总结、结构化、生成和模式归纳，但输出是概率性的，所以流畅并不代表事实正确。","学习 AI 时要把“模型能力”和“产品功能”分开：同一个模型可以被封装成聊天、搜索、写作、代码等不同产品。"],
          example:{title:"同一句问题，为什么会得到不同答案？",situation:"你两次问 AI“帮我写一个产品介绍”，没有给受众、场景和约束。",before:"第一次得到偏营销的文案，第二次得到偏功能说明。",after:"补充“面向第一次使用 AI 的普通用户，100 字以内，不使用专业术语”。",result:"输出更稳定，也更接近真实需求。"},
          guides:[
            {type:"checklist",title:"判断一个任务适不适合交给生成式 AI",items:["任务是否允许存在一定生成空间？","是否可以通过上下文说明目标和限制？","错误结果是否能够被检查？","如果涉及关键事实，是否有可靠来源可核验？"]},
            {type:"prompt",title:"用这个提示词观察 AI 的“生成”特性",intro:"把一个你熟悉的主题代入括号。",body:"请围绕【主题】给出 3 种不同风格的解释：\n1. 给完全不了解的人\n2. 给有一点基础的人\n3. 给专业人士\n最后说明：哪些内容是事实，哪些属于表达方式或推断。"}
          ],
          practice:{goal:"亲自观察“同一模型会因上下文不同而生成不同结果”。",steps:["选择一个你熟悉的主题。","先只问一句非常模糊的问题并保存结果。","再补充受众、目标、限制和输出格式。","比较两次输出，标出最明显的三个变化。"],acceptance:["能说清楚生成式 AI 与传统规则软件至少一个差异","能指出第二次输出为什么更稳定","知道流畅答案仍需要验证事实"]},
          mistakes:["把 AI 的自信语气当成事实证明","只记住某个产品按钮，不理解底层能力","用一次输出就判断模型“会”或“不会”"],
          related:["下一课：Context、Token 与提示词","后续：搜索与研究中的证据验证","知识提示：模型能力会持续变化，但“生成结果需要上下文和验证”是稳定原则"]
        },
        {
          id:"context-token", title:"Context、Token 与提示词", duration:"14 分钟", summary:"理解输入方式为什么会影响输出质量。",
          plainExplanation:"Context 是 AI 此刻能看到的全部信息；Token 是这些信息被模型处理时的基本单位；提示词的本质，是把当前任务需要的上下文组织清楚。",
          whyItMatters:"很多“AI 不好用”其实不是模型能力问题，而是目标、背景、输入或约束没有进入当前上下文。",
          points:["理解 Context Window","理解 Token 与信息成本","掌握 Goal / Context / Input / Constraint / Output 基本结构"],
          content:["Context 不只是你最后一句问题，还可能包括系统指令、历史对话、上传文件、工具结果和前文内容。","上下文越长不等于越好。无关信息会增加噪声，重要信息被淹没时，输出反而可能更差。","好的提示词不靠神奇措辞，而是让模型清楚知道：要做什么、为什么做、根据什么做、不能做什么、最后交付什么。"],
          example:{title:"“帮我总结这个文件”为何经常不好用？",situation:"用户上传一份会议纪要，只说“帮我总结”。",before:"AI 自己猜测重点，结果与用户真正关心的项目风险无关。",after:"明确 Goal=找决策和风险；Input=会议纪要；Constraint=不得补充原文没有的信息；Output=决策/负责人/风险三栏。",result:"总结从“泛泛概括”变成可执行结果。"},
          guides:[
            {type:"template",title:"OPC 任务简报模板",body:"Goal：我要完成什么？\nContext：这件事的背景是什么？\nInput：AI 应该基于哪些材料？\nConstraint：哪些规则不能违反？\nOutput：结果要以什么形式交付？"},
            {type:"prompt",title:"让 AI 先检查你的任务是否说清楚",body:"下面是我的任务描述。请先不要执行任务，只检查 Goal / Context / Input / Constraint / Output 是否完整。\n如果缺少关键上下文，只问我最少数量的问题。\n\n【粘贴你的任务】"}
          ],
          practice:{goal:"把一个模糊需求改造成可执行任务简报。",steps:["写下一个最近真的想让 AI 帮你完成的任务。","用一句话直接提问并保存结果。","按五段模板重写任务。","再次执行并比较结果。"],acceptance:["五个字段至少填写四个","第二次结果更贴合目标","能指出一个原本缺失的关键上下文"]},
          mistakes:["一次塞进大量无关背景","只规定语气，不说明任务目标","把长提示词误认为高质量提示词"],
          related:["Stage 2 会继续使用任务简报完成真实工作","Stage 3 会把 Context 从单次提示升级到整个工作流的上下文治理"]
        }
      ]},
      { id:"systems", title:"02 · 看懂 AI 系统组件", description:"理解 RAG、Tool 与 Agent 如何组成 AI 应用。", lessons:[
        {
          id:"memory-rag", title:"Memory 与 RAG", duration:"16 分钟", summary:"理解记忆与知识检索的区别。",
          plainExplanation:"Memory 解决“记住你和过去状态”，RAG 解决“现在去哪里找可靠资料再回答”。",
          whyItMatters:"把两者混在一起，会让你误以为只要 AI 记住更多，就能回答公司资料、最新政策或专业知识。",
          points:["区分 Memory 与知识库","理解 RAG 基本链路","知道什么时候需要外部知识"],
          content:["Memory 更适合保存偏好、历史状态、常用设置等持续性信息。","RAG 通常先从外部知识源检索相关内容，再把证据放入 Context，让模型基于这些内容回答。","当信息经常更新、必须可追溯、属于私有资料或超出模型训练知识时，外部检索比单纯依赖记忆更可靠。"],
          example:{title:"AI 客服为什么不能只靠 Memory？",situation:"客服需要回答最新退款政策。",before:"只依赖模型记忆，可能引用旧规则。",after:"每次回答前从已审核知识库检索最新政策，并把原文片段放入上下文。",result:"回答更可追溯，也方便政策更新后立即生效。"},
          guides:[
            {type:"checklist",title:"Memory 还是 RAG？",items:["用户偏好 / 历史状态 → 优先考虑 Memory","公司制度 / 产品手册 → 优先考虑 RAG","最新、经常变化的信息 → 优先考虑检索","关键结论需要引用来源 → 不要只靠模型记忆"]},
            {type:"steps",title:"最小 RAG 思路",items:["准备可信知识源","按问题检索最相关片段","只把必要证据放入上下文","要求回答基于证据","必要时显示来源并处理“找不到答案”"]}
          ],
          practice:{goal:"给一个真实场景判断应该用 Memory、RAG，还是两者都需要。",steps:["选择个人助手、客服或内部知识问答中的一个场景。","列出哪些信息需要长期记住。","列出哪些信息必须从外部资料获取。","说明其中一条信息过时后会造成什么问题。"],acceptance:["至少正确区分两类信息","能指出一个需要可追溯来源的知识","能说明‘找不到证据’时不应该强答"]},
          mistakes:["把聊天历史当成知识库","把所有资料一次性塞进上下文","检索到内容后不区分可信来源与低质量来源"],
          related:["相关概念：Search、Knowledge Base、Source of Truth","Stage 3：事实源与 Context Engineering"]
        },
        {
          id:"api-agent", title:"API、Tool、MCP 与 Agent", duration:"18 分钟", summary:"看懂 AI 如何从会回答升级到会完成任务。",
          plainExplanation:"API 是系统交流的接口，Tool 是 AI 可调用的具体能力，MCP 是连接工具/资源的一种标准方式，Agent 则是在目标下反复‘判断—调用—观察—继续’的执行模式。",
          whyItMatters:"不区分这些概念，很容易把任何自动化都叫 Agent，也会误判一个产品到底具备什么能力。",
          points:["理解 API 与 Tool","知道 MCP 解决什么问题","理解 Agent 的任务循环"],
          content:["API 让系统之间以结构化方式交换数据或执行动作。","Tool 是暴露给模型的能力，例如搜索网页、查数据库、发消息、读文件。MCP 关注如何更标准地把资源和工具接给 AI。","Agent 的关键不只是调用一次工具，而是根据目标观察结果，再决定下一步，直到完成、失败或触发人工确认。"],
          example:{title:"“查天气”不是完整 Agent，“规划出差”可能是",situation:"一个系统只调用天气 API 返回温度。",before:"一次调用即可结束，更像 Tool Use。",after:"规划出差时，系统可能搜索航班、查天气、比较时间、生成方案，并在订票前请求确认。",result:"多步状态变化和决策循环才更接近 Agent。"},
          guides:[
            {type:"template",title:"判断一个 AI 系统的四层结构",body:"模型：负责什么判断/生成？\nTool：能调用哪些外部能力？\nContext：每一步能看到什么？\nControl：什么时候继续、停止或交给人工？"},
            {type:"checklist",title:"不要一看到自动化就叫 Agent",items:["是否需要根据中间结果动态决定下一步？","是否会调用一个或多个工具？","是否存在明确停止条件？","是否定义失败、权限和人工确认边界？"]}
          ],
          practice:{goal:"拆解一个你正在使用的 AI 产品，判断它有哪些层。",steps:["选一个带搜索、文件或工具能力的 AI 产品。","找出模型、Tool、Context、Control 四部分。","判断它只是一次 Tool Use，还是存在 Agent 循环。","写出一个需要人工确认的高风险动作。"],acceptance:["能正确区分 API / Tool / Agent","能给出一个停止条件","不会把所有自动化都称为 Agent"]},
          mistakes:["把 API、Tool、MCP 当成同一个概念","认为 Agent 越自主越好","没有停止条件和人工边界就直接做高风险动作"],
          related:["Stage 3：Automation 与 Human-in-the-loop","后续可学习 MCP / Skill 的具体实现，但不把工具名当课程骨架"]
        }
      ]}
    ]
  },
  {
    slug:"chatgpt-worker", title:"ChatGPT 高效使用指南", stage:"AI Worker", stageLabel:"Stage 2 · 用好 AI", level:"实战", duration:"2.3 小时",
    summary:"围绕搜索、研究、写作、文件、数据与办公任务，建立稳定可复用的 ChatGPT 工作方法。",
    outcome:"把 ChatGPT 从聊天工具变成日常工作助手，并形成可复用的任务模板。",
    modules:[
      { id:"brief", title:"01 · 把任务说清楚", description:"从模糊提问升级到结构化任务描述。", lessons:[
        {
          id:"task-brief", title:"用任务简报替代“神奇提示词”", duration:"18 分钟", summary:"用任务目标、背景信息、输入材料、限制条件和输出要求把任务说明白。",
          plainExplanation:"真正稳定的提示词不是一句咒语，而是一份让 AI 能执行的任务说明书。",
          whyItMatters:"大多数工作任务有真实背景、材料和限制；如果这些没有被写出来，AI 只能猜。",
          points:["明确目标","补足背景","规定输入、限制和输出格式"],
          content:["先定义目标，再决定要给 AI 什么信息。不要从‘写一句高级提示词’开始。","复杂任务可先让 AI 复述它对任务的理解，再补缺失信息。","稳定任务应该沉淀成可重复使用的简报模板，而不是每次重新聊天。"],
          example:{title:"写周报：从一句话到稳定模板",situation:"每周都要根据项目记录写周报。",before:"“帮我写一份周报”，内容经常遗漏风险和下一步。",after:"固定输入项目记录，并规定输出为本周进展 / 问题风险 / 下周动作 / 需协助事项。",result:"每周只替换输入数据，不再重新设计提示词。"},
          guides:[
            {type:"prompt",title:"可直接复制的任务简报提示词",body:"Goal：请帮我完成【任务】。\nContext：【背景/受众/用途】\nInput：【我提供的材料】\nConstraint：【必须遵守/不要做的事】\nOutput：请以【格式】输出。\n\n开始前先复述你对任务的理解；如果缺少关键输入，只问最必要的问题。"},
            {type:"checklist",title:"发送前 30 秒检查",items:["目标能不能用一句话说清？","AI 是否拿到了真正需要的材料？","有没有明确不能猜的地方？","结果格式是否方便我直接使用？"]}
          ],
          practice:{goal:"把一个重复工作任务做成可复用任务简报。",steps:["选一个每周或每月都会出现的任务。","用五段模板写出第一版。","执行一次并记录偏差。","只修改导致偏差的字段，再执行第二次。"],acceptance:["模板下次可直接复用","输入和输出边界明确","第二次修改能解释为什么有效"]},
          mistakes:["追求‘万能提示词’","把所有背景写成大段散文","AI 输出不理想时只反复说‘再好一点’"],
          related:["下一课：搜索与研究，把任务简报加入证据要求","Stage 3：把单次任务简报升级成节点级 Context"]
        },
        {
          id:"search-research", title:"搜索与研究：从答案到证据", duration:"22 分钟", summary:"让 AI 先检索、再比较、再给结论。",
          plainExplanation:"研究型任务的目标不是让 AI 给你一个漂亮答案，而是让你能检查它的结论从哪里来。",
          whyItMatters:"产品、市场、投资、政策和技术研究都涉及变化中的事实，没有来源和日期的结论很容易失真。",
          points:["提出可验证问题","区分事实、分析与观点","要求来源、日期和适用范围"],
          content:["先把研究问题拆成事实问题、比较问题和判断问题。","关键数字、时间、政策、产品能力等事实应尽量追到一手或高质量来源。","最终结论要说明证据、限制和不确定性，而不是把推断写成事实。"],
          example:{title:"‘哪个 AI 工具最好’为什么不是好研究问题？",situation:"用户直接要求选最好的工具。",before:"AI容易根据泛化印象给结论。",after:"先定义任务场景、预算、数据敏感性、平台限制，再比较各候选的可验证能力。",result:"研究从主观排名变成基于条件的选择。"},
          guides:[
            {type:"prompt",title:"证据优先研究提示词",body:"我要研究【问题】。\n请按以下顺序进行：\n1. 先拆出需要验证的事实问题\n2. 优先寻找官方/一手来源\n3. 每个关键事实标注来源和日期\n4. 区分事实、分析和推断\n5. 最后给出结论，并明确限制与仍需验证的问题"},
            {type:"checklist",title:"研究结果验收",items:["关键事实是否有来源？","来源日期是否仍适用？","是否把观点误写成事实？","不同来源冲突时有没有说明？","结论是否超出了证据支持范围？"]}
          ],
          practice:{goal:"完成一次小型证据研究。",steps:["选一个最近真的需要做决定的问题。","列出 3 个必须验证的事实。","让 AI 搜索并整理来源。","人工打开至少 2 个关键来源复核。"],acceptance:["至少两个关键事实可追溯","明确标出一个推断或不确定点","最终结论没有超出证据范围"]},
          mistakes:["只看 AI 摘要，不打开原始来源","引用没有日期的旧信息","为了得到明确答案而忽略冲突证据"],
          related:["Stage 1：RAG 与外部知识","AI Daily：正式内容同样要求来源和可追溯"]
        }
      ]},
      { id:"office", title:"02 · 日常工作场景", description:"把 AI 用在写作、文件、数据与办公任务里。", lessons:[
        {
          id:"writing-files", title:"写作与文件处理", duration:"20 分钟", summary:"从改写、总结到结构化提取。",
          plainExplanation:"文件任务最稳的方法通常不是‘直接写成品’，而是先抽取事实，再组织结构，最后生成。",
          whyItMatters:"直接让 AI 从长文件生成成品，很容易遗漏关键事实或把原文没有的内容补进去。",
          points:["定义受众与目的","先提取再生成","用检查清单验证"],
          content:["第一步先确定哪些信息必须来自文件本身。","第二步把事实抽取为结构化字段，例如人物、时间、决策、风险。","第三步再根据受众和用途生成邮件、报告、摘要或纪要。"],
          example:{title:"会议纪要变成项目更新",situation:"把 8 页会议记录整理成给老板看的更新。",before:"直接要求‘总结会议’，得到很多过程描述。",after:"先抽取决策、负责人、截止时间、阻塞，再生成一页管理摘要。",result:"输出更短、更准确，也更适合决策。"},
          guides:[
            {type:"prompt",title:"文件处理三步提示词",body:"请严格基于我提供的文件处理，不补充文件外事实。\n第一步：抽取【需要的字段】。\n第二步：指出缺失、冲突或不确定信息。\n第三步：基于抽取结果，为【受众】生成【成品类型】，目标是【用途】。"},
            {type:"template",title:"常用文件抽取字段",body:"会议：决策 / Action / Owner / Deadline / Risk\n报告：结论 / 数据 / 假设 / 风险 / 建议\n合同：主体 / 金额 / 时间 / 义务 / 违约 / 异常条款"}
          ],
          practice:{goal:"把一份真实文件处理成可直接使用的成品。",steps:["选一份会议记录、报告或长邮件。","先定义 4~6 个要抽取的字段。","让 AI 只做事实抽取并检查。","再用抽取结果生成目标成品。"],acceptance:["成品中的关键事实能回到原文","没有明显增加原文不存在的事实","最终格式适合真实受众"]},
          mistakes:["一步完成抽取、判断、写作，难以检查","没有说明‘不得补充文件外事实’","让 AI 总结所有内容，却没说明真正的使用目的"],
          related:["搜索与研究：需要外部事实时再增加检索步骤","数据任务：结构化字段同样是后续分析的基础"]
        },
        {
          id:"data-office", title:"数据、表格与办公任务", duration:"24 分钟", summary:"用 AI 辅助数据分析与办公材料。",
          plainExplanation:"AI 可以帮你理解数据、写公式、写 SQL、找异常，但最先要固定的是字段口径和计算定义。",
          whyItMatters:"数据分析里最危险的不是公式写错，而是不同人对‘销售额、活跃用户、转化率’理解不同。",
          points:["明确字段口径","要求解释计算过程","人工复核关键数字"],
          content:["先明确数据范围、时间、字段定义和缺失值处理方式。","让 AI 先解释它准备怎么计算，再让它生成公式、SQL 或 Python，能更早发现口径错误。","关键数字要用独立方式复核，尤其是金额、比例、排名和业务决策指标。"],
          example:{title:"为什么两个‘转化率’会不一样？",situation:"表格里有访问人数、注册人数和付费人数。",before:"只说‘算转化率’，AI自行选择分母。",after:"明确‘付费转化率 = 付费人数 / 注册人数’，时间范围为本月。",result:"计算结果与业务定义一致。"},
          guides:[
            {type:"template",title:"数据任务最小说明模板",body:"数据范围：【时间/文件/表】\n字段定义：【字段=含义】\n目标指标：【公式或业务定义】\n异常规则：【缺失/重复/0值怎么处理】\n输出：【表格/公式/SQL/图表/解释】"},
            {type:"prompt",title:"先解释，再计算",body:"在计算前，请先用普通语言复述：\n1. 你理解的字段含义\n2. 计算公式\n3. 对缺失值/重复值的处理\n4. 哪些地方需要我确认\n我确认后再生成公式或代码。"}
          ],
          practice:{goal:"用 AI 帮你完成一个真实表格或数据计算。",steps:["选一个至少包含 3 个字段的数据表。","明确一个业务指标的计算口径。","让 AI 先复述计算逻辑。","生成公式后，手工复核至少 3 行。"],acceptance:["字段和指标定义清楚","AI 的计算逻辑与定义一致","至少复核一个关键结果"]},
          mistakes:["未定义口径就直接算","把模型生成的数字当成数据源","不检查数据缺失、重复和时间范围"],
          related:["Stage 3 Evaluation：指标定义决定工作流是否真的有效","后续可扩展到 SQL / Python，但方法先于工具"]
        }
      ]}
    ]
  },
  {
    slug:"ai-workflow", title:"用 AI 搭建自动化工作流", stage:"AI Workflow", stageLabel:"Stage 3 · 建立工作流认知", level:"进阶", duration:"3.1 小时",
    summary:"学习任务拆解、Context Engineering、知识库、Automation、Human-in-the-loop 与 Evaluation。",
    outcome:"把重复任务组织成可执行工作流，并知道哪些环节该自动化、哪些必须保留人工判断。",
    modules:[
      { id:"thinking", title:"01 · 工作流思维", description:"从问一次 AI 升级到设计可重复流程。", lessons:[
        {
          id:"task-decomposition", title:"任务拆解与节点设计", duration:"24 分钟", summary:"拆出输入、处理、判断、输出和检查节点。",
          plainExplanation:"工作流不是把一条大提示词自动重复，而是把任务拆成多个职责清楚、可以检查的步骤。",
          whyItMatters:"大任务直接交给一个模型完成时，失败后很难知道错在哪；拆成节点后，每一步都可以验证、替换和改进。",
          points:["识别重复节点","区分生成与判断","定义每一步输入输出"],
          content:["先从真实任务的起点和最终结果画出流程，不要先选自动化工具。","生成、检索、计算、判断、审批应该尽量分开，因为它们的风险和验证方式不同。","每个节点都要有明确输入、输出、失败条件和下一步。"],
          example:{title:"内容发布流程不要写成一个超级 Prompt",situation:"团队想自动生成并发布公众号内容。",before:"一个提示词同时研究、写作、审核、发布。",after:"拆成选题→证据收集→草稿→事实检查→人工审核→发布。",result:"任何一步失败都能定位，发布前也保留人工关口。"},
          guides:[
            {type:"template",title:"节点卡模板",body:"节点名称：\n目标：\n输入：\n处理方式：AI / 规则 / 人工 / 工具\n输出：\n成功条件：\n失败怎么办：\n下一节点："},
            {type:"steps",title:"拆任务的顺序",items:["先写最终交付结果","列出现实中已经存在的人工步骤","把生成和判断分开","给每一步定义输入输出","最后才决定哪些步骤值得自动化"]}
          ],
          practice:{goal:"把一个重复任务画成 4~7 个节点。",steps:["选一个每周重复的真实任务。","写出起点输入和最终结果。","拆出中间节点。","给每个节点标记 AI / 规则 / 人工 / 工具。"],acceptance:["至少有一个人工或规则判断节点","每个节点有明确输入输出","没有把所有步骤都塞进一个模型调用"]},
          mistakes:["先选 n8n、Zapier 等工具，再倒推需求","把整个流程做成一个超级提示词","节点没有失败处理和退出条件"],
          related:["下一课：Context Engineering 决定每个节点应该看到什么","Automation：后续再决定哪些节点真正自动化"]
        },
        {
          id:"context-engineering", title:"Context Engineering", duration:"28 分钟", summary:"设计模型在每一步真正需要看到的信息。",
          plainExplanation:"Context Engineering 不是把更多资料塞给 AI，而是让每一个节点只看到完成当前任务真正需要的信息。",
          whyItMatters:"长期项目中最常见的问题之一，就是历史资料、旧规则和无关上下文越来越多，最终让 AI 判断冲突、成本升高、结果不稳定。",
          points:["减少无关上下文","按节点提供信息","区分事实源、任务上下文和可选资料"],
          content:["先确定 Canonical Source：某个事实到底以哪里为准。","再把上下文分成 Must Know、Nice to Know、Do Not Load，避免全量读取。","不同节点应使用不同上下文，例如写作节点不一定需要部署配置，代码节点也不需要全部市场资料。"],
          example:{title:"为什么长期 Coding Agent 越做越慢？",situation:"每次任务都让 Agent 读取全部规划、全部历史结果和整个仓库。",before:"上下文越来越大，旧规则冲突，Agent反复讨论历史问题。",after:"只读全局规则 + 当前 Task + 当前模块必要文件；其他资料按需读取。",result:"任务边界更清晰，错误和上下文成本都下降。"},
          guides:[
            {type:"template",title:"Minimum Sufficient Context 模板",body:"Must Know：完成任务必须知道什么？\nNice to Know：有帮助但不是必须？\nDo Not Load：哪些信息会造成噪声？\nCanonical Source：关键事实以哪里为准？\nStop Rule：出现什么情况停止扩大范围？"},
            {type:"checklist",title:"上下文加入前先问",items:["这个信息会改变当前决策吗？","它是不是已经在另一个事实源重复？","它是否可能已经过时？","当前节点真的需要它吗？"]}
          ],
          practice:{goal:"给一个真实 AI 任务做上下文瘦身。",steps:["列出当前你会提供给 AI 的所有资料。","分成 Must / Nice / Do Not Load。","指定至少一个 Canonical Source。","删除非必要上下文后重新执行同一任务。"],acceptance:["至少删掉一类无关上下文","明确一个事实源","能比较瘦身前后的输出或执行效率"]},
          mistakes:["把知识库和 Context Engineering 当成同一件事","认为上下文越多越可靠","同一个事实在多个文档长期重复维护"],
          related:["Knowledge Base = 有什么知识；Context Engineering = 当前任务给什么知识","OPC 项目治理本身也使用这一原则"]
        }
      ]},
      { id:"automation", title:"02 · 自动化与验证", description:"加入自动化、人工确认与质量评估。", lessons:[
        {
          id:"hitl", title:"Automation 与 Human-in-the-loop", duration:"30 分钟", summary:"判断什么应该自动化，什么需要人工确认。",
          plainExplanation:"自动化的目标不是把人全部拿掉，而是把稳定、重复、低风险的步骤交给系统，把关键判断留给合适的人。",
          whyItMatters:"涉及发布、资金、权限、客户承诺或高影响决策时，全自动往往会把偶发错误放大成真实损失。",
          points:["识别适合自动化的节点","设置人工确认点","设计异常、超时和回退"],
          content:["高频、规则清晰、可逆、低风险的动作通常适合优先自动化。","高风险、不可逆、证据不足或需要价值判断的动作，应保留人工确认。","Human-in-the-loop 不只是审批按钮，还包括补充信息、纠错、异常处理和最终承担责任。"],
          example:{title:"AI 客服可以自动回答，但退款不一定自动执行",situation:"客服机器人收到用户退款请求。",before:"模型判断‘符合条件’后直接退款。",after:"AI先检索政策并生成建议；涉及金额动作时交给规则系统或人工确认。",result:"大部分咨询自动化，但关键动作保持可控。"},
          guides:[
            {type:"checklist",title:"一个节点能不能全自动？",items:["错误是否容易发现？","错误是否可逆？","是否涉及资金、权限、发布或法律承诺？","规则是否稳定且明确？","证据不足时系统能否安全停止？"]},
            {type:"template",title:"人工确认点模板",body:"触发条件：\n需要人确认什么：\n系统提供哪些证据：\n允许的操作：批准 / 修改 / 拒绝\n超时怎么办：\n结果如何记录："}
          ],
          practice:{goal:"给自己的工作流增加一个合理的人工确认点。",steps:["选择上一课拆出的工作流。","给每个节点标记风险高/中/低。","选择一个中高风险节点设计确认机制。","写出拒绝、超时或数据缺失时怎么办。"],acceptance:["确认点不是随意加，而是对应具体风险","有明确证据提供给人工","异常时不会默认继续执行"]},
          mistakes:["把‘全自动’当成成熟度指标","每一步都要求人工审批，失去自动化价值","失败时静默继续，而不是停止或回退"],
          related:["下一课 Evaluation：人工修改和失败记录本身就是重要评估数据","Agent 设计同样需要权限和 Stop Rule"]
        },
        {
          id:"evaluation", title:"Evaluation：如何知道流程真的有效", duration:"26 分钟", summary:"建立质量、效率和稳定性评价标准。",
          plainExplanation:"Evaluation 就是先定义‘什么叫做有效’，再持续用真实结果检查工作流，而不是只看它有没有成功运行。",
          whyItMatters:"一个自动化即使每天都跑成功，也可能输出质量差、人工修改很多、耗时没有下降，甚至制造更多返工。",
          points:["定义成功标准","记录失败案例","用指标和样本持续优化"],
          content:["评估应同时关注质量、效率、稳定性和业务价值，而不是单一准确率。","可以建立一个小型真实样本集，固定测试关键场景，并持续加入失败案例。","每次改提示词、模型或流程后，用同一组标准重新比较，才知道优化是否真的有效。"],
          example:{title:"摘要工作流‘跑通’不等于有效",situation:"系统每天自动把 20 篇文章生成摘要。",before:"只统计是否成功生成 20 条摘要。",after:"增加事实准确率、人工修改量、用户点击率、处理时间四个指标。",result:"发现真正的问题不是生成失败，而是摘要过长且人工修改太多。"},
          guides:[
            {type:"template",title:"最小 Evaluation 表",body:"任务：\n测试样本：\n质量指标：\n效率指标：\n失败类型：\n人工修改量：\nBaseline：\n新版本结果：\n是否真的更好："},
            {type:"checklist",title:"指标是否有用？",items:["能否反映真实用户/业务结果？","有没有 Baseline 可比较？","失败案例是否被记录而不是删除？","优化后是否用相同条件重新测试？"]}
          ],
          practice:{goal:"给一个 AI 任务建立最小评估基线。",steps:["选一个你已经用 AI 完成过的重复任务。","找 5 个真实样本。","定义 2 个质量指标和 1 个效率指标。","记录当前 Baseline，再修改一次流程并比较。"],acceptance:["有真实样本而不是想象场景","至少一个指标可以客观比较","能判断新版本是真的更好还是只是感觉更好"]},
          mistakes:["只看模型主观评分","没有 Baseline 就宣布提升","失败样本被修掉后不再保留，导致问题反复出现"],
          related:["Stage Project 会把 Evaluation 用到完整项目","FDE 阶段会进一步关注 Adoption、价值度量和真实业务结果"]
        }
      ]}
    ]
  }
];

export function getCourse(slug:string){ return courses.find((course)=>course.slug===slug); }
export function getAllLessons(course:Course){ return course.modules.flatMap((module)=>module.lessons); }
export function getLesson(course:Course, lessonId:string){ return getAllLessons(course).find((lesson)=>lesson.id===lessonId); }

