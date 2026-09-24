import type { LessonSpec } from "./lesson-spec";

// Course-owned copy for the six progress cards, in EXPLAIN → CAPABILITY order.
// Each line is deliberately short enough for one desktop card line.
const TRACK01_STEP_NAVIGATION: Record<string, readonly [string, string, string, string, string, string]> = {
  "t1-01-ai-task-fit": [
    "识别适合的任务\n分清人的责任",
    "看真实任务拆分\n找到 AI 入口",
    "判断能否交给 AI\n留下人工把关",
    "挑一个小步骤\n自己验证结果",
    "看适合做什么\n明确不能代做",
    "会划分协作边界\n知道何时使用"
  ],
  "t1-02-clear-prompt": [
    "看模糊要求问题\n减少 AI 猜测",
    "对比两种说法\n找出关键要求",
    "判断任务清不清\n核对执行标准",
    "说明真实任务\n写出交付形式",
    "留下任务要素\n避免含糊要求",
    "会说清需求\n让任务可执行"
  ],
  "t1-03-minimum-context": [
    "区分任务与资料\n知道还缺什么",
    "比较信息多少\n看结果怎样变",
    "判断哪些必要\n去掉无关信息",
    "补齐必要资料\n检查回答依据",
    "留下筛选依据\n信息够用就停",
    "会准备上下文\n不过量也不缺"
  ],
  "t1-04-purposeful-iteration": [
    "看第一版偏差\n确定修改目标",
    "对比定向修改\n避免全部重写",
    "判断要求能否做\n明确检查标准",
    "只改目标部分\n比较修改结果",
    "记住改动范围\n保留可用内容",
    "会提出改法\n能检查是否变好"
  ],
  "t1-05-reliability-verification": [
    "辨认事实风险\n别被语气说服",
    "找出关键说法\n看哪些必须查",
    "判断核验优先级\n先查高风险项",
    "列出待核验点\n说明去哪确认",
    "按时效和后果\n决定核验顺序",
    "会识别事实项\n发布前先核查"
  ],
  "t1-06-model-and-product": [
    "区分模型与产品\n看能力从哪来",
    "比较两个产品\n找出能力差别",
    "判断能力来源\n别混为一谈",
    "拆解熟悉产品\n标明各层作用",
    "看模型与功能\n分别如何影响",
    "会看产品能力\n不只看模型名"
  ],
  "t1-07-token-probability": [
    "理解输出变化\n看词元如何生成",
    "比较两次回答\n分清可变和错误",
    "判断变化影响\n哪些需要处理",
    "同题运行两次\n对照关键差别",
    "保留判断标准\n核验事实内容",
    "会管理差异\n不追求逐字相同"
  ],
  "t1-08-history-memory": [
    "理解新对话断点\n分清历史与记忆",
    "看缺少的背景\n为何接不上任务",
    "判断需带回什么\n别假设 AI 记得",
    "整理旧任务信息\n在新对话重用",
    "区分记忆与材料\n关键事实重给",
    "会恢复上下文\n继续完成旧任务"
  ],
  "t1-09-knowledge-source": [
    "看资料冲突原因\n指定可信事实源",
    "比较四份资料\n找谁有最终依据",
    "判断谁说了算\n处理过期信息",
    "给业务事实\n指定正式来源",
    "留下冲突规则\n别让 AI 猜测",
    "会指定事实源\n知道怎样更新"
  ],
  "t1-10-search-rag": [
    "区分存有资料\n与已找到证据",
    "看资料如何被找\n匹配当前问题",
    "判断先查后答\n还是直接回答",
    "改写真实问题\n要求先找证据",
    "记住检索边界\n不能凭空引用",
    "会先找依据\n再组织回答"
  ],
  "t1-11-api": [
    "看系统如何交换\n信息需有接口",
    "对比猜订单状态\n与系统真实查询",
    "判断何时用接口\n别让模型猜值",
    "描述接口任务\n说清输入输出",
    "分清数据交换\n与最终业务决定",
    "会识别接口需求\n接入真实系统"
  ],
  "t1-12-structured-output-schema": [
    "看自由文本问题\n系统难以接收",
    "比较段落与字段\n看结构如何稳定",
    "判断字段是否够\n能否继续处理",
    "拆成固定字段\n写清取值规则",
    "分清结构与事实\n字段也要核验",
    "会定义输出结构\n交给系统接续"
  ],
  "t1-13-function-calling-tool-use": [
    "看模型能力边界\n何时需要工具",
    "对比猜测库存\n与实时工具查询",
    "判断该不该调用\n确认工具权限",
    "定义工具输入\n明确执行结果",
    "分清建议与操作\n保留人的确认",
    "会划分工具任务\n不用模型硬猜"
  ],
  "t1-14-mcp": [
    "看连接为何复杂\n需要统一约定",
    "比较多种资源\n看统一接入价值",
    "判断连接对象\n分清资源与工具",
    "列出接入资源\n明确使用边界",
    "统一连接方式\n不等于自动授权",
    "会识别连接需求\n知道权限仍在"
  ],
  "t1-15-skill": [
    "看重复方法价值\n何时值得沉淀",
    "对比每次重说\n与复用做法",
    "判断方法够稳定\n再决定做技能",
    "写出最小技能\n给出输入输出",
    "分清提示与技能\n保留审核边界",
    "会识别可复用法\n不用每次重写"
  ],
  "t1-16-workflow-automation": [
    "看重复步骤\n哪些值得固定",
    "看发布前流程\n找出人工关口",
    "判断能否自动\n先看异常与风险",
    "拆出最小流程\n标明每步责任",
    "分清流程与自动化\n别跳过验证",
    "会设计步骤链\n知道何处停下"
  ],
  "t1-17-agent": [
    "区分固定流程\n与动态决策",
    "比较整理与研究\n看任务变化程度",
    "判断何时用智能体\n先看流程够不够",
    "定义动态任务\n写清目标和停止",
    "明确决策边界\n保留人工监督",
    "会判断是否需要\n动态选择下一步"
  ],
  "t1-18-multimodal": [
    "看任务需要啥\n选择信息形式",
    "比较文字与图片\n看哪种更准确",
    "判断输入模态\n不为多模态而用",
    "给真实任务\n选合适输入",
    "按信息价值选择\n检查识别误差",
    "会组合多种信息\n服务同一目标"
  ],
  "t1-19-coding-browser-computer-use": [
    "区分写代码\n浏览与电脑操作",
    "对比三种做法\n看执行与风险",
    "判断执行方式\n选择最小权限",
    "为真实任务\n选低风险方案",
    "区分建议与动作\n操作前要确认",
    "会选择执行方式\n知道该停在哪"
  ],
  "t1-20-privacy-permissions-hitl": [
    "看数据与动作风险\n划出权限边界",
    "比较退款场景\n谁能建议或执行",
    "判断人工确认点\n限制敏感操作",
    "给工作流标注\n访问与审批边界",
    "分清能做与可做\n高风险要复核",
    "会设计安全关口\n让人掌握决定"
  ]
};

export function withTrack01StepNavigation(spec: LessonSpec): LessonSpec {
  const descriptions = TRACK01_STEP_NAVIGATION[spec.lessonId];
  if (!descriptions || spec.steps.length !== descriptions.length) {
    throw new Error("TRACK01_STEP_NAVIGATION_MISSING:" + spec.lessonId);
  }
  return {
    ...spec,
    steps: spec.steps.map((step, index) => ({
      ...step,
      navigationDescription: descriptions[index]
    }))
  };
}

export const TRACK01_STEP_NAVIGATION_LESSON_IDS = Object.keys(TRACK01_STEP_NAVIGATION);
