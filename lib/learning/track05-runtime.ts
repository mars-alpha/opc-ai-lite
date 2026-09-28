import { courseBuilderCheckSequenceToRuntimeSeeds, type CourseBuilderBuildDraft } from "./course-builder";
import { track05BatchADrafts, track05BatchAIntroComparisons, track05BatchAKnowledgeDepth, track05BatchATriggerScenarios } from "../../fixtures/course-builder/track05-batch-a";
import { track05BatchBDrafts, track05BatchBIntroComparisons, track05BatchBKnowledgeDepth, track05BatchBTriggerScenarios } from "../../fixtures/course-builder/track05-batch-b";
import { track05BatchCDrafts, track05BatchCIntroComparisons, track05BatchCKnowledgeDepth, track05BatchCTriggerScenarios } from "../../fixtures/course-builder/track05-batch-c";
import { track05BatchDDrafts, track05BatchDIntroComparisons, track05BatchDKnowledgeDepth, track05BatchDTriggerScenarios } from "../../fixtures/course-builder/track05-batch-d";
import { track05BatchEDrafts, track05BatchEIntroComparisons, track05BatchEKnowledgeDepth, track05BatchETriggerScenarios } from "../../fixtures/course-builder/track05-batch-e";
import { track05BatchFDrafts, track05BatchFIntroComparisons, track05BatchFKnowledgeDepth, track05BatchFTriggerScenarios } from "../../fixtures/course-builder/track05-batch-f";

type ApprovedDraft=CourseBuilderBuildDraft;
const formalDrafts=[...track05BatchADrafts,...track05BatchBDrafts,...track05BatchCDrafts,...track05BatchDDrafts,...track05BatchEDrafts,...track05BatchFDrafts] as ApprovedDraft[];

function lessonFromDraft(draft:ApprovedDraft){return{id:draft.lessonSpec.lessonId,title:draft.lessonSpec.title,duration:"约 18 分钟",summary:draft.content.summary,plainExplanation:draft.content.plainExplanation,whyItMatters:draft.content.whyItMatters,points:[...draft.content.points],content:[...draft.content.content],example:{...draft.content.example},guides:[],practice:{goal:draft.practice?.goal??"",steps:draft.practice?.instructions.map(x=>x.prompt)??[],acceptance:draft.practice?.rubric.map(x=>x.label)??[]},mistakes:[...draft.content.mistakes],related:[...draft.content.related]};}
function practiceSeedFor(draft:ApprovedDraft){if(!draft.practice)throw new Error("TRACK05_PRACTICE_REQUIRED:"+draft.lessonSpec.lessonId);return{id:"practice_fde_"+draft.lessonSpec.lessonId.replace(/-/g,"_"),title:draft.practice.title,goal:draft.practice.goal,instructions:draft.practice.instructions,hints:draft.practice.hints,submissionSchema:{kind:"STRUCTURED_TEXT_V1" as const,fields:draft.practice.instructions.map(x=>({key:x.key,label:x.label,minLength:1,maxLength:3000}))},rubric:draft.practice.rubric,passScore:draft.practice.passScore,required:true,status:"PUBLISHED" as const};}
function referenceFillFor(draft:ApprovedDraft){if(!draft.practice)return{};return Object.fromEntries(draft.practice.instructions.map((x,i)=>[x.key,draft.practice?.rubric[i]?.example??""]));}

const introComparisons={...track05BatchAIntroComparisons,...track05BatchBIntroComparisons,...track05BatchCIntroComparisons,...track05BatchDIntroComparisons,...track05BatchEIntroComparisons,...track05BatchFIntroComparisons};
const knowledgeDepth={...track05BatchAKnowledgeDepth,...track05BatchBKnowledgeDepth,...track05BatchCKnowledgeDepth,...track05BatchDKnowledgeDepth,...track05BatchEKnowledgeDepth,...track05BatchFKnowledgeDepth};
const triggerScenarios={...track05BatchATriggerScenarios,...track05BatchBTriggerScenarios,...track05BatchCTriggerScenarios,...track05BatchDTriggerScenarios,...track05BatchETriggerScenarios,...track05BatchFTriggerScenarios};

export const TRACK05_RUNTIME_COURSE_SLUG="fde";
export const track05RuntimeDefinitions=formalDrafts.map((draft,index)=>{if(!draft.checkSequence)throw new Error("TRACK05_CHECK_SEQUENCE_REQUIRED:"+draft.lessonSpec.lessonId);return{canonicalId:"T5-"+String(index+1).padStart(2,"0"),lesson:lessonFromDraft(draft),spec:draft.lessonSpec,checks:courseBuilderCheckSequenceToRuntimeSeeds(draft.checkSequence).map(x=>({...x,status:"PUBLISHED" as const})),practice:practiceSeedFor(draft),referenceFill:referenceFillFor(draft)};});
export const track05Course={slug:TRACK05_RUNTIME_COURSE_SLUG,title:"FDE / AI 解决方案落地",stage:"FDE",stageLabel:"Track 05 · FDE / AI 解决方案落地",level:"进阶实战",duration:"约 5 小时",summary:"从真实业务问题出发，先看清问题、关键角色和当前状态，再逐步进入解决方案设计、试点、评估与落地。",outcome:"能从真实业务问题出发，形成从问题发现、目标与价值、方案选择、验证、评估到长期运行的完整解决方案交付链。",modules:[
 {id:"fde-discovery",title:"看清真实问题",description:"确认真正的问题、关键角色和当前事实。",lessons:track05RuntimeDefinitions.slice(0,3).map(x=>x.lesson)},
{id:"fde-definition",title:"定义目标与价值",description:"把模糊抱怨收敛成明确问题、目标状态和投入价值。",lessons:track05RuntimeDefinitions.slice(3,6).map(x=>x.lesson)},
{id:"fde-solution",title:"设计可落地方案",description:"比较不同解决路径，确认落地条件，并收敛到可启动范围。",lessons:track05RuntimeDefinitions.slice(6,9).map(x=>x.lesson)},
{id:"fde-pilot",title:"用最小试点验证",description:"用最小原型验证关键假设，再通过真实试点学习方案是否可用。",lessons:track05RuntimeDefinitions.slice(9,12).map(x=>x.lesson)},
{id:"fde-adoption",title:"用证据决定并推动采用",description:"根据试点证据决定是否继续投入，并解决真实采用与长期负责的问题。",lessons:track05RuntimeDefinitions.slice(12,15).map(x=>x.lesson)},
{id:"fde-capstone",title:"完成解决方案落地交付",description:"把前面所有判断整合成一套可交付、可复核、可继续推进的 AI 解决方案。",lessons:track05RuntimeDefinitions.slice(15,16).map(x=>x.lesson)}
]};
function presentationFor(draft:ApprovedDraft){const lessonSlug=draft.lessonSpec.lessonId;return{activity:{...draft.pedagogy.participation,fields:draft.practice?.instructions??[]},introComparison:introComparisons[lessonSlug as keyof typeof introComparisons],referenceAnswer:draft.referenceAnswer,referenceFill:referenceFillFor(draft),knowledgeDepth:knowledgeDepth[lessonSlug as keyof typeof knowledgeDepth],reviewItems:draft.review,reviewLabels:{primary:"AI适合做什么",secondary:"AI不应该替你做什么"},reviewCardFill:true,practiceHintsGrouped:true,practiceCopyValuesOnly:true,selfAssessment:draft.selfAssessment,triggerScenario:triggerScenarios[lessonSlug as keyof typeof triggerScenarios]??null};}
export function getTrack05RuntimePresentation(courseSlug:string,lessonSlug:string){if(courseSlug!==TRACK05_RUNTIME_COURSE_SLUG)return null;const draft=formalDrafts.find(x=>x.lessonSpec.lessonId===lessonSlug);return draft?presentationFor(draft):null;}
