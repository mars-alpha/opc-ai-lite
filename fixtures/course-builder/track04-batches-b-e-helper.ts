import { makeTrack04Draft, type Track04CanonicalId, type Track04LessonConfig } from "./track04-batch-shared";

type PracticeFieldConfig={key:string;label:string;prompt:string};
type LessonPresentationProfile={
  explainTitle:string;
  checkTitle:string;
  reviewTitle:string;
  capabilityTitle:string;
  introSecondary:string;
  introBottomDetails:[string,string];
  practiceFields:[PracticeFieldConfig,PracticeFieldConfig,PracticeFieldConfig,PracticeFieldConfig];
  mistakes:[string,string,string];
  reviewGuide:string;
};

export type Track04CompactLesson = {
  id:string;
  canonicalId:Track04CanonicalId;
  title:string;
  prerequisites:string[];
  mainQuestion:string;
  mainConcept:string;
  summary:string;
  explanation:string;
  why:string;
  points:[string,string,string,string];
  intuition:string;
  caseName:string;
  example:{title:string;situation:string;before:string;after:string;result:string};
  nav:[string,string,string,string,string,string];
  practiceTitle:string;
  practiceGoal:string;
  practiceExamples:[string,string,string,string];
  hints:[string,string,string];
  best:{question:string;options:[string,string,string];answer:"A"|"B"|"C";explanation:string};
  misconception:{question:string;answer:boolean;explanation:string};
  boundary:{question:string;options:[string,string,string,string];answers:Array<"A"|"B"|"C"|"D">;explanation:string};
  review:[string,string,string];
  reviewDepth:[{proposition:string;answer:string},{proposition:string;answer:string}];
  self:[string,string,string];
  trigger:string;
  capability:string;
  next:string;
};

const profiles:Record<Track04CanonicalId,LessonPresentationProfile>={
  "T4-01":{explainTitle:"先判断这件事值不值得系统化",checkTitle:"哪些重复工作现在适合系统化？",reviewTitle:"系统化判断最容易错在哪里？",capabilityTitle:"你能判断现在该不该做了吗？",introSecondary:"重复只是信号，真正决定是否进入系统化的是做法是否稳定、价值是否明确、风险是否可控。",introBottomDetails:["先把人工流程跑稳定，再固定其中已经看懂的部分。","暂不系统化不是放弃，而是继续积累规则和证据。"],practiceFields:[{key:"workflow",label:"当前人工流程",prompt:"按现在真实做法写清这项工作怎样完成。"},
  {key:"evidence",label:"重复与稳定证据",prompt:"写明发生频率、哪些做法稳定、哪些仍经常变化。"},
  {key:"valueRisk",label:"价值与风险",prompt:"说明系统化能解决什么真实问题，以及做错一次会带来什么影响。"},
  {key:"decision",label:"系统化判断",prompt:"分别列出优先系统化、保留人工和继续验证的环节及理由。"}],mistakes:["误区：每天重复就应该自动化｜正确理解：还要看人工做法是否稳定、价值和风险。","误区：最耗时间的步骤优先自动化｜正确理解：高耗时但高风险、规则不稳的步骤可能更不适合先做。","误区：暂不系统化等于没有价值｜正确理解：可能只是当前证据和规则还不够稳定。"],reviewGuide:"复盘哪些环节值得现在系统化、哪些继续人工，以及做出这个判断所依据的真实证据。"},
  "T4-02":{explainTitle:"把人脑里的做法变成系统看得懂的步骤",checkTitle:"这样的步骤系统真的能执行吗？",reviewTitle:"拆流程最容易拆错什么？",capabilityTitle:"你能把隐含经验说清了吗？",introSecondary:"步骤的关键不是越细越好，而是每一步都有自然业务边界、明确输入和可检查结果。",introBottomDetails:["处理动作与业务判断要分开，才能发现哪里仍依赖人的经验。","如果只能写“整理一下、判断一下”，说明规则还没有真正说清。"],practiceFields:[{key:"current",label:"当前人工做法",prompt:"按真实顺序描述现在由人怎样完成这项工作。"},
  {key:"inputOutput",label:"开始输入与最终结果",prompt:"写清流程开始已有的信息，以及最后必须得到什么结果。"},
  {key:"hiddenJudgment",label:"隐含判断与检查",prompt:"列出哪些地方现在靠经验判断，以及已经存在的检查规则。"},
  {key:"steps",label:"可执行步骤草图",prompt:"按自然业务边界拆出步骤，并为每一步写输入、处理/判断、输出和检查。"}],mistakes:["误区：步骤越多越专业｜正确理解：自然业务边界比数量重要。","误区：处理和判断混在一起没关系｜正确理解：混在一起会让隐含规则继续藏在人脑里。","误区：只在最后审核就够｜正确理解：关键事实应在对应步骤及时检查。"],reviewGuide:"复盘每一步是否真的有输入、结果和检查，并指出仍然只能靠人工经验完成的地方。"},
  "T4-03":{explainTitle:"系统开始之前，先把启动边界说清楚",checkTitle:"这个启动规则真的完整吗？",reviewTitle:"触发设计最容易漏掉什么？",capabilityTitle:"你能说清什么时候该启动了吗？",introSecondary:"时间或事件只代表“可能开始”，真正启动还要满足业务前置条件，并排除明确不应运行的情况。",introBottomDetails:["启动规则只负责是否进入流程，不应该承担后面所有步骤。","不启动条件和最小输入能减少误触发、空跑和重复任务。"],practiceFields:[{key:"event",label:"候选启动事件",prompt:"写清发生什么事件或到什么时间点时，流程可能开始。"},
  {key:"requirements",label:"启动前置条件",prompt:"列出事件发生后仍必须满足的业务条件。"},
  {key:"doNotStart",label:"明确不启动情况",prompt:"列出测试、重复、缺信息、人工暂停等不应启动的情况。"},
  {key:"minimumInput",label:"第一步最小输入",prompt:"只写流程第一步真正需要拿到的信息。"}],mistakes:["误区：设置时间就等于完整触发｜正确理解：还要检查业务前置条件。","误区：事件发生就一定启动｜正确理解：测试、重复、人工暂停等情况可能明确不启动。","误区：触发里要把后续步骤都设计完｜正确理解：触发只负责是否进入流程。"],reviewGuide:"复盘启动事件、前置条件、不启动情况和最小输入是否真正分开。"},
  "T4-04":{explainTitle:"系统为什么必须记住自己做到哪里",checkTitle:"哪些信息才算真正的当前状态？",reviewTitle:"状态设计最容易混淆什么？",capabilityTitle:"你能让系统知道自己跑到哪里了吗？",introSecondary:"状态不是运行日志的缩写，而是系统此刻据此决定“下一步能不能做”的关键业务事实。",introBottomDetails:["状态变化要由明确事件或判断触发，不能每次靠模型重新猜。","完成、暂停、等待也要被明确表示，否则重新进入流程时容易重复或跳步。"],practiceFields:[{key:"states",label:"关键状态清单",prompt:"列出真正会改变下一步允许动作的状态，不把每个小动作都当状态。"},
  {key:"enter",label:"进入状态的条件",prompt:"为每个状态写清由什么事件或判断进入。"},
  {key:"allowed",label:"状态下允许的下一步",prompt:"说明处于该状态时系统允许继续做什么、不能做什么。"},
  {key:"leave",label:"离开状态的条件",prompt:"写清什么事件会进入下一个状态，以及完成、暂停、等待如何表达。"}],mistakes:["误区：保存完整日志就不需要状态｜正确理解：日志回答发生过什么，状态回答现在在哪里。","误区：每个动作都要变成一个状态｜正确理解：只有会影响后续控制的节点才需要独立状态。","误区：让 AI 根据历史内容猜状态更灵活｜正确理解：关键业务状态必须由明确事件、规则或人工判断改变。"],reviewGuide:"复盘哪些信息真正控制下一步，以及每个状态怎样进入、离开和被检查。"},
  "T4-05":{explainTitle:"“没继续”到底是哪一种结果",checkTitle:"这是等待、完成、停止还是失败？",reviewTitle:"退出边界最容易混淆什么？",capabilityTitle:"你能给每种结果正确归类了吗？",introSecondary:"真正的边界在后续动作：等待要保留继续入口，完成要关闭任务，业务停止要留下原因，系统失败才进入恢复处理。",introBottomDetails:["业务条件不满足通常不是系统故障，不能靠重试解决。","真正失败需要可观察证据；否则系统不知道应该恢复还是结束。"],practiceFields:[{key:"continue",label:"继续条件",prompt:"写清满足什么条件后流程可以进入下一步。"},
  {key:"wait",label:"等待条件",prompt:"写清哪些情况只是暂时缺条件，未来补齐后还能继续。"},
  {key:"finishStop",label:"完成与业务停止",prompt:"分别写清怎样算正常完成，以及哪些业务条件意味着主动停止。"},
  {key:"failure",label:"真正失败依据",prompt:"列出可以客观观察的系统失败信号，以及失败后先做什么。"}],mistakes:["误区：没有下一步就是失败｜正确理解：也可能是等待、完成或业务主动停止。","误区：客户不符合服务范围属于系统失败｜正确理解：这是业务停止，系统按规则结束反而是正确执行。","误区：写“结果不好”就算失败条件｜正确理解：失败必须有可观察的错误或无法完成的事实。"],reviewGuide:"复盘继续、等待、完成、停止和失败是否有不同条件与不同后续动作。"},
  "T4-06":{explainTitle:"每一步只看自己真正需要的信息",checkTitle:"这些信息真的都应该给当前步骤吗？",reviewTitle:"上下文设计最容易过量在哪里？",capabilityTitle:"你能为当前步骤选对信息了吗？",introSecondary:"同一条流程里的不同步骤承担不同职责，因此不应该共享一整包相同资料。",introBottomDetails:["最小充分上下文能减少无关噪声、过期信息和敏感数据暴露。","信息缺失时要明确标记，而不是让模型自行补全。"],practiceFields:[{key:"must",label:"必须知道",prompt:"只列出没有这些信息就无法完成当前职责的内容。"},
  {key:"optional",label:"有帮助但可缺省",prompt:"列出能改善判断但缺失时仍可按规则继续的信息。"},
  {key:"exclude",label:"不应加载",prompt:"列出与当前职责无关、过度敏感或容易造成干扰的信息。"},
  {key:"sourceFreshness",label:"来源与时效",prompt:"为关键信息写明来源、更新时间，以及缺失或冲突时怎样处理。"}],mistakes:["误区：上下文窗口够大就把资料全塞进去｜正确理解：无关信息会增加噪声和风险。","误区：历史信息越多越准确｜正确理解：过期或冲突信息可能误导当前判断。","误区：模型自己决定需要什么权限最灵活｜正确理解：敏感数据访问范围必须由业务和系统控制。"],reviewGuide:"复盘当前步骤必须知道、可选和不应加载的信息，并检查来源、时效与敏感边界。"},
  "T4-07":{explainTitle:"不同任务应该交给不同的执行者",checkTitle:"这一步真的应该交给 AI 吗？",reviewTitle:"职责分配最容易错配在哪里？",capabilityTitle:"你能给每一步分对责任了吗？",introSecondary:"确定规则、语义理解、外部动作和高风险决策的性质不同，不能用一个 AI 角色包办整条流程。",introBottomDetails:["确定、可验证的逻辑优先规则；需要理解和生成时再使用 AI。","外部写入和最终责任必须有受控工具、核心系统或明确责任人。"],practiceFields:[{key:"ruleTasks",label:"适合确定规则的步骤",prompt:"找出可以用明确条件稳定判断的步骤，并说明规则依据。"},
  {key:"aiTasks",label:"适合 AI 的步骤",prompt:"找出需要理解、归纳或生成的步骤，并说明输出如何被检查。"},
  {key:"toolTasks",label:"需要外部工具的动作",prompt:"列出读取、写入等必须连接外部系统的动作及其权限边界。"},
  {key:"humanTasks",label:"必须保留人工的判断",prompt:"列出高风险、不可逆或需要最终责任人的步骤。"}],mistakes:["误区：AI 能做就应该优先交给 AI｜正确理解：确定逻辑通常用规则更稳定。","误区：外部写入只是另一个 AI 步骤｜正确理解：改变外部状态需要受控工具和权限。","误区：人工确认说明自动化做得不够好｜正确理解：高风险责任本来就需要明确的人或核心系统承担。"],reviewGuide:"复盘每一步为什么属于规则、AI、工具或人工，并检查权限与责任是否匹配。"},
  "T4-08":{explainTitle:"让下游不用猜上一步到底交了什么",checkTitle:"这个交接结果真的稳定可用吗？",reviewTitle:"数据交接最容易失真在哪里？",capabilityTitle:"你能让上下游稳定接得上了吗？",introSecondary:"自然语言可以表达很多，但关键交接必须让下游明确知道字段含义、来源、缺失和可用边界。",introBottomDetails:["字段只保留下游真正需要的信息，不为“看起来完整”增加无关内容。","必填事实缺失时要显式表达，不能让 AI 为了完整自动补造。"],practiceFields:[{key:"downstreamNeed",label:"下游真正需要什么",prompt:"从下一步职责出发，列出必须接收到的信息。"},
  {key:"fields",label:"交接字段与含义",prompt:"为每项信息定义稳定字段名和业务含义。"},
  {key:"required",label:"必填、可选与允许值",prompt:"写清哪些字段必须有、哪些可选，以及重要字段允许出现哪些值。"},
  {key:"missingSource",label:"缺失处理与来源",prompt:"说明字段缺失时怎么办，以及关键事实来自哪里。"}],mistakes:["误区：一段完整总结就足够交接｜正确理解：下游仍可能分不清事实、来源和待确认项。","误区：结构化就是字段越多越好｜正确理解：字段只为下游职责服务。","误区：必填字段缺失时让 AI 补一个最可能的值｜正确理解：缺失必须显式处理，不能补造事实。"],reviewGuide:"复盘交接字段是否真正服务下游职责，以及来源、必填和缺失边界是否清楚。"},
  "T4-09":{explainTitle:"先定义外部能力，再决定怎么连接",checkTitle:"这个连接需求真的说清楚了吗？",reviewTitle:"外部连接最容易失控在哪里？",capabilityTitle:"你能先说清能力再选连接方式了吗？",introSecondary:"读取、写草稿和正式发布都是“连接外部系统”，但权限、风险和失败处理完全不同。",introBottomDetails:["先定义业务动作、输入输出与权限边界，再比较接口、工具或模型上下文协议（MCP）。","凭据和最终写入权限属于核心系统，不应由模型自由持有。"],practiceFields:[{key:"purpose",label:"连接的业务目的",prompt:"说明为什么必须连接外部系统，以及当前步骤只负责什么。"},
  {key:"readWrite",label:"允许读取与写入范围",prompt:"分别列出允许读取、允许写入和明确禁止的动作。"},
  {key:"contract",label:"输入、输出与失败反馈",prompt:"定义调用前提供什么、成功返回什么、失败必须返回什么。"},
  {key:"connectionChoice",label:"连接方式比较",prompt:"基于已有边界比较接口、受控工具和模型上下文协议（MCP）的适用性，不先选技术。"}],mistakes:["误区：先选最先进的协议再设计业务｜正确理解：先定义能力和权限，再选连接方式。","误区：读取和写入只是同一种连接｜正确理解：写入改变外部状态，权限和失败风险更高。","误区：模型持有全部凭据最方便｜正确理解：核心凭据和最终权限必须由系统控制。"],reviewGuide:"复盘连接目的、读写范围、输入输出和权限边界，再比较最简单可控的连接方式。"},
  "T4-10":{explainTitle:"外部调用失败后，先判断发生了什么",checkTitle:"这个失败应该重试、停止还是转人工？",reviewTitle:"失败恢复最危险的误区是什么？",capabilityTitle:"你能为不同失败选对恢复方式了吗？",introSecondary:"超时、业务拒绝和真正系统错误表面都叫“失败”，但恢复方式不同，写入动作还要额外考虑是否其实已经成功。",introBottomDetails:["重试前先判断失败是否可能恢复、重复执行是否安全。","高风险写入结果不确定时先查现状，而不是连续重试。"],practiceFields:[{key:"failureTypes",label:"可能出现的失败类型",prompt:"按外部动作列出超时、业务拒绝、系统错误等真实失败类型。"},
  {key:"recoverable",label:"是否可能自行恢复",prompt:"说明哪些故障可能短暂恢复，哪些重试也不会解决。"},
  {key:"retrySafety",label:"重试前检查",prompt:"写清重复执行是否安全、是否需要先确认外部结果。"},
  {key:"fallback",label:"停止与转人工",prompt:"定义什么时候停止自动处理、保留证据并交给人工。"}],mistakes:["误区：失败后统一重试三次｜正确理解：先分类失败并判断重复风险。","误区：超时就等于一定没有成功｜正确理解：外部写入可能已成功但响应丢失。","误区：业务拒绝多重试几次可能成功｜正确理解：权限或业务条件问题通常需要修正条件或转人工。"],reviewGuide:"复盘每类失败的证据、是否可恢复、重试安全性以及停止/转人工条件。"},
  "T4-11":{explainTitle:"同一件事做两遍，结果也必须可控",checkTitle:"这个动作真的能防止重复结果吗？",reviewTitle:"重复保护最容易漏掉什么？",capabilityTitle:"你能让重复请求不产生重复结果了吗？",introSecondary:"界面防重复点击只能减少一种来源，网络重发、任务重跑和失败恢复仍可能让同一个业务动作再次执行。",introBottomDetails:["重复保护要围绕业务唯一身份，而不是只看文本是否相似。","发现已经处理后应返回明确已有结果，帮助流程继续而不是制造第二份写入。"],practiceFields:[{key:"duplicateSources",label:"重复可能从哪里来",prompt:"列出用户重复提交、重试、任务重跑等重复来源。"},
  {key:"businessKey",label:"业务唯一标识",prompt:"定义什么组合能稳定代表同一次业务动作。"},
  {key:"beforeWrite",label:"写入前检查",prompt:"说明执行前怎样确认该业务动作是否已经处理。"},
  {key:"duplicateResult",label:"重复到达后的结果",prompt:"写清已处理时返回什么，以及什么变化应被视为真正新版本。"}],mistakes:["误区：禁用重复点击就不会重复执行｜正确理解：网络和任务系统仍可能重发。","误区：标题一样就一定是同一业务事件｜正确理解：唯一标识要对应业务身份和版本。","误区：让 AI 判断内容相似就能保护高风险写入｜正确理解：概率相似不能替代确定的重复保护。"],reviewGuide:"复盘重复来源、业务唯一标识、执行前检查和重复到达后的明确结果。"},
  "T4-12":{explainTitle:"人工确认应该放在真正需要承担责任的地方",checkTitle:"这里真的需要人工确认吗？",reviewTitle:"人工关口最容易设计过度在哪里？",capabilityTitle:"你能把人工放在真正关键的位置了吗？",introSecondary:"每一步都审批会让自动化失去价值，完全不审批又会让高风险动作失去责任边界。",introBottomDetails:["是否对外、是否可逆、是否涉及金额或权限，是判断人工确认的重要依据。","确认人必须看到做决定所需的证据，而不是只看到“AI 建议通过”。"],practiceFields:[{key:"auto",label:"可以自动继续的步骤",prompt:"列出低风险、可逆、规则清楚且无需人工负责的动作。"},
  {key:"approval",label:"必须人工确认的动作",prompt:"列出高风险、不可逆、对外承诺或需要明确责任人的动作。"},
  {key:"evidence",label:"确认人必须看到的证据",prompt:"为每个人工关口写清需要展示的事实、来源和风险信息。"},
  {key:"afterDecision",label:"批准、拒绝与退回后的路径",prompt:"分别定义通过、拒绝、退回和超时后流程怎样继续。"}],mistakes:["误区：每一步人工确认最安全｜正确理解：过度确认只会让自动化失去价值。","误区：只给确认人看 AI 的结论就够｜正确理解：责任判断必须看到事实和来源。","误区：确认只有“通过”一个出口｜正确理解：拒绝、退回和超时都要有明确后续路径。"],reviewGuide:"复盘哪些步骤应自动流动、哪些需要人工承担责任，以及确认所需证据和退回路径。"},
  "T4-13":{explainTitle:"复杂任务不等于需要智能体（Agent）",checkTitle:"这项任务真的需要动态决定下一步吗？",reviewTitle:"智能体最容易被滥用在哪里？",capabilityTitle:"你能判断什么时候不该用智能体了吗？",introSecondary:"步骤多、工具多只是复杂；只有运行中必须根据新信息动态选择路径时，才出现智能体真正擅长的问题。",introBottomDetails:["主要路径能提前定义时，固定工作流更容易测试、恢复和控制。","即使使用智能体，也必须限制工具、资源、停止条件和高风险人工关口。"],practiceFields:[{key:"predictability",label:"主要路径能否提前定义",prompt:"说明任务的主要步骤和常见分支是否可以事先写清。"},
  {key:"dynamicNeed",label:"运行中是否必须动态选路",prompt:"写清哪些新信息会真正改变下一步，而不是仅让任务看起来复杂。"},
  {key:"value",label:"动态决策带来的实际价值",prompt:"说明动态能力解决了什么固定流程难以解决的问题。"},
  {key:"controls",label:"工具、资源与停止边界",prompt:"如果属于智能体候选，写清允许工具、资源限制、停止条件和人工控制。"}],mistakes:["误区：任务越复杂越需要智能体｜正确理解：复杂不等于路径必须动态。","误区：智能体是固定工作流的升级版｜正确理解：它引入的是运行时动态决策和更高不确定性。","误区：用了智能体就不需要停止条件｜正确理解：动态系统反而更需要工具、资源和人工边界。"],reviewGuide:"复盘路径是否可预定义、动态选择是否真的必要，以及新增不确定性是否值得。"},
  "T4-14":{explainTitle:"一次跑通，只能证明它能运行",checkTitle:"这些证据足以说明工作流稳定吗？",reviewTitle:"评估自动化最容易自我欺骗在哪里？",capabilityTitle:"你能用证据判断它是否值得长期用了吗？",introSecondary:"评估不能把质量、效率、稳定性和业务价值混成一个“好不好”；流程修改后还必须用同一组样例做回归，确认没有破坏原有能力。",introBottomDetails:["正常、边界和失败场景都必须进入固定测试集。","修改流程后重跑同一测试，才能知道是否修好一个问题却破坏了其他能力。"],practiceFields:[{key:"normalCases",label:"正常场景测试",prompt:"设计能代表日常主要使用情况的测试样例和预期结果。"},
  {key:"edgeCases",label:"边界与失败场景",prompt:"加入缺信息、冲突、重复、外部失败等容易出问题的样例。"},
  {key:"signals",label:"要记录的评估信号",prompt:"分别定义质量、效率、稳定性和业务价值要观察什么。"},
  {key:"regression",label:"修改后的回归规则",prompt:"说明流程改动后哪些固定样例必须重跑，以及怎样判断是否退化。"}],mistakes:["误区：演示成功一次就说明系统稳定｜正确理解：必须覆盖正常、边界和失败场景。","误区：只看模型输出质量就够｜正确理解：效率、恢复稳定性和真实业务价值也要分别观察。","误区：修完一个问题只测试新场景｜正确理解：还要重跑旧样例防止回归。"],reviewGuide:"复盘测试覆盖、评估信号和回归规则是否能持续证明系统稳定有效。"},
  "T4-15":{explainTitle:"完整蓝图不只是把步骤画成一条线",checkTitle:"这份蓝图真的能交给实现方继续了吗？",reviewTitle:"完整蓝图最容易遗漏哪些控制信息？",capabilityTitle:"你能把设计整理成可实现的输入了吗？",introSecondary:"只画顺利路径无法回答状态、失败、重复、权限、人工确认和验证问题，因此还不是可实现蓝图。",introBottomDetails:["每个关键设计应能追溯到业务事实或明确假设。","未确认规则进入待验证清单，而不是为了让蓝图完整被写成事实。"],practiceFields:[{key:"goalScope",label:"业务目标与系统化范围",prompt:"写清要解决的业务问题、要系统化什么、明确不做什么。"},
  {key:"flowDesign",label:"启动、状态与步骤设计",prompt:"整理启动条件、状态、退出边界，以及每步输入/处理/判断/输出/检查。"},
  {key:"controlDesign",label:"交接、连接与控制设计",prompt:"整合上下文、责任、结构化交接、外部连接、失败恢复、重复保护和人工确认。"},
  {key:"validation",label:"评估与待验证清单",prompt:"写清测试/回归方式，并分开已确认事实、关键假设、待验证项和实现阶段再决定的技术细节。"}],mistakes:["误区：画出顺利流程图就等于完整蓝图｜正确理解：还要包含状态、异常、人工控制和评估。","误区：蓝图里不能出现未知项｜正确理解：未知必须显式列为待验证，不能伪装成事实。","误区：有蓝图就等于技术方案已经完成｜正确理解：蓝图是实现输入，代码、部署和试点仍属后续工作。"],reviewGuide:"复盘蓝图是否覆盖正常与异常路径、责任和验证，并确认每个关键判断都有依据或待验证标记。"}
};

export function makeTrack04CompactDraft(c:Track04CompactLesson){
  const p=profiles[c.canonicalId];
  const config:Track04LessonConfig={
    id:c.id,
    canonicalId:c.canonicalId,
    title:c.title,
    prerequisites:c.prerequisites,
    learningRecommendation:"建议先完成前序课程，并准备一条真实业务材料，用来完成“"+c.practiceTitle+"”。",
    stepCopy:{
      explainTitle:p.explainTitle,
      exampleTitle:c.caseName,
      checkTitle:p.checkTitle,
      practiceTitle:c.practiceTitle,
      reviewTitle:p.reviewTitle,
      capabilityTitle:p.capabilityTitle,
      explainGuide:c.intuition,
      exampleGuide:"用"+c.caseName+"验证本课方法在真实业务中的作用，并观察错误设计会带来什么后果。",
      checkGuide:"围绕“"+p.checkTitle+"”，用最佳判断、常见误区和边界条件检查是否真的会用。",
      practiceGuide:c.practiceGoal,
      reviewGuide:p.reviewGuide,
      capabilityGuide:"完成后确认自己已经"+(c.capability.startsWith("能")?c.capability:"能"+c.capability)
    },
    navigation:{explain:c.nav[0],example:c.nav[1],check:c.nav[2],practice:c.nav[3],review:c.nav[4],capability:c.nav[5]},
    mainQuestion:c.mainQuestion,
    mainConcept:c.mainConcept,
    summary:c.summary,
    explanation:c.explanation,
    why:c.why,
    points:[...c.points],
    body:[c.points[0]+" "+c.points[1],c.points[2]+" "+c.points[3]],
    example:c.example,
    mistakes:[...p.mistakes],
    related:[c.next],
    practice:{
      title:c.practiceTitle,
      goal:c.practiceGoal,
      fields:p.practiceFields.map((field,index)=>({...field,example:c.practiceExamples[index]+(index===3?" 最后请逐项检查本课训练结果是否完整："+p.practiceFields.map(item=>item.label).join("、")+"；缺少任何一项时请明确标记，不要自行补造。":"")})),
      hints:[...c.hints],
      prompt:"请帮助我完成“"+c.practiceTitle+"”。请按“"+p.practiceFields.map(item=>item.label).join("｜")+"”四项依次处理。只使用已有事实；未知规则明确写“待人工确认”，不要为了完整而补造业务数据、权限、历史效果或技术实现。",
      reflection:"回看“"+p.practiceFields.map(item=>item.label).join("、")+"”四项：是否都完成了本课要求的判断？如果某项缺少依据或出现补造内容，先标记待确认再修改。"
    },
    checks:{best:c.best,misconception:c.misconception,boundary:c.boundary},
    review:[...c.review],
    reviewDepth:[...c.reviewDepth],
    intro:{
      title:p.explainTitle,
      situation:c.summary,
      primary:c.intuition,
      secondary:p.introSecondary,
      bottomDetails:[...p.introBottomDetails]
    },
    self:[...c.self],
    trigger:c.trigger,
    capability:c.capability,
    next:c.next
  };
  return makeTrack04Draft(config);
}

export function presentationMaps(lessons:Track04CompactLesson[]){
  return {
    intros:Object.fromEntries(lessons.map((x)=>{
      const p=profiles[x.canonicalId];
      return [x.id,{
        title:p.explainTitle,
        situation:x.summary,
        approaches:[{label:"先看核心",text:x.intuition},{label:"再看边界",text:p.introSecondary}],
        comparison:[],
        comparisonPlacement:"BOTTOM" as const,
        bottomDetails:[{title:"为什么重要",text:x.why},{title:"怎么理解",text:x.mainConcept}],
        takeaway:x.intuition
      }];
    })),
    depths:Object.fromEntries(lessons.map((x)=>[x.id,{
      example:x.points.map((text,index)=>({title:"方法要点 "+String(index+1),text})),
      review:x.reviewDepth.map((item)=>({title:item.proposition,text:item.answer}))
    }])),
    triggers:Object.fromEntries(lessons.map((x)=>[x.id,x.trigger])) as Record<string,string>
  };
}
