import fs from "node:fs";
import { createCourseHumanReviewResult } from "../lib/learning/course-human-review-gate";
import { COURSE_PRODUCTION_RULE_SOURCES } from "../lib/learning/course-production-contract";
import { nextCourseProductionStage } from "../lib/learning/course-production-orchestrator";
import type { CourseBuilderBuildDraft } from "../lib/learning/course-builder";
import { track05BatchBDrafts,track05BatchBIntroComparisons,track05BatchBKnowledgeDepth,track05BatchBTriggerScenarios } from "../fixtures/course-builder/track05-batch-b";
import { track05BatchCDrafts,track05BatchCIntroComparisons,track05BatchCKnowledgeDepth,track05BatchCTriggerScenarios } from "../fixtures/course-builder/track05-batch-c";
import { track05BatchDDrafts,track05BatchDIntroComparisons,track05BatchDKnowledgeDepth,track05BatchDTriggerScenarios } from "../fixtures/course-builder/track05-batch-d";
import { track05BatchEDrafts,track05BatchEIntroComparisons,track05BatchEKnowledgeDepth,track05BatchETriggerScenarios } from "../fixtures/course-builder/track05-batch-e";
import { track05BatchFDrafts,track05BatchFIntroComparisons,track05BatchFKnowledgeDepth,track05BatchFTriggerScenarios } from "../fixtures/course-builder/track05-batch-f";

function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK05_BF_HUMAN_REVIEW_FAILED:"+code);}
const reference="docs/learning/TRACK05_BATCHES_B_F_T5_04_T5_16_HUMAN_REVIEW_V1.md";
const evidence=fs.readFileSync(reference,"utf8");
assert(evidence.includes("HUMAN_REVIEW_PASS / 13 LESSONS / READY_FOR_LESSON_SPEC_REGISTRY"),"EVIDENCE_STATUS");

const groups=[
 {drafts:track05BatchBDrafts,intro:track05BatchBIntroComparisons,depth:track05BatchBKnowledgeDepth,triggers:track05BatchBTriggerScenarios},
 {drafts:track05BatchCDrafts,intro:track05BatchCIntroComparisons,depth:track05BatchCKnowledgeDepth,triggers:track05BatchCTriggerScenarios},
 {drafts:track05BatchDDrafts,intro:track05BatchDIntroComparisons,depth:track05BatchDKnowledgeDepth,triggers:track05BatchDTriggerScenarios},
 {drafts:track05BatchEDrafts,intro:track05BatchEIntroComparisons,depth:track05BatchEKnowledgeDepth,triggers:track05BatchETriggerScenarios},
 {drafts:track05BatchFDrafts,intro:track05BatchFIntroComparisons,depth:track05BatchFKnowledgeDepth,triggers:track05BatchFTriggerScenarios}
];
const all=groups.flatMap(g=>g.drafts) as CourseBuilderBuildDraft[];
assert(all.length===13,"THIRTEEN_DRAFTS");

const banned=["Baseline","Target State","Solution Scope","Business Case","Pilot","Adoption","Rollout","Owner","readiness","Readiness","Continue","Adjust","Stop","Prototype","Solution Package","Capstone","operating model","Core FDE","Value Hypothesis","Success Condition","Outcome","Evaluation","adoption","Reference Fill","Operating Model","Gate","Demo","Prompt"];
const awkward=["当前 当前","原 当前","正式 正式","完整 完整","负责人ship"," & "," Plan"," 试点","试点 "," 当前基线","当前基线 "," 目标状态","目标状态 "," 采用","采用 "," 负责人","负责人 "];
const courseMetaLanguage=["Evidence First","下一课","最后一课","留给 T5-","留到 T5-"];
function visible(d:CourseBuilderBuildDraft){
 return [d.lessonSpec.title,...d.lessonSpec.learningObjectives,...d.lessonSpec.knowledgePoints,d.lessonSpec.learningRecommendation??"",...d.lessonSpec.steps.flatMap(s=>[s.title,s.objective,s.navigationDescription??""]),d.content.summary,d.content.plainExplanation,d.content.whyItMatters,...d.content.points,...d.content.content,d.content.example.title,d.content.example.situation,d.content.example.before??"",d.content.example.after??"",d.content.example.result,...d.content.mistakes,...d.content.related,...(d.checkSequence??[]).flatMap(q=>[q.question,...q.options.map(o=>o.label),q.explanation,q.correctFeedback,q.incorrectFeedback]),d.practice?.title??"",d.practice?.goal??"",...(d.practice?.instructions.flatMap(x=>[x.label,x.prompt])??[]),...(d.practice?.hints??[]),...(d.practice?.rubric.map(x=>x.example)??[]),d.pedagogy.participation.prompt??"",d.pedagogy.participation.reflection,d.referenceAnswer??"",...d.review,...d.selfAssessment].join("\n");
}
for(const g of groups){
 for(const d of g.drafts as CourseBuilderBuildDraft[]){
  const id=d.lessonSpec.lessonId;
  assert(/^t5-\d{2}-[a-z0-9-]+$/.test(id),"LESSON_ID_STABILITY:"+id);
  for(const field of d.practice?.instructions??[]) assert(/^[A-Za-z][A-Za-z0-9]*$/.test(field.key),"PRACTICE_KEY_STABILITY:"+id+":"+field.key);
  const intro=(g.intro as Record<string,any>)[id];
  const depth=(g.depth as Record<string,any>)[id];
  const trigger=(g.triggers as Record<string,string>)[id];
  assert(intro&&Array.isArray(intro.bottomDetails)&&intro.bottomDetails.length>=2,"INTRO_BOTTOM:"+id);
  assert(depth&&Array.isArray(depth.review)&&depth.review.length>=3,"REVIEW_DEPTH:"+id);
  assert(typeof trigger==="string"&&trigger.length>30,"TRIGGER:"+id);
  assert(d.checkSequence?.length===3,"CHECKS:"+id);
  assert((d.practice?.instructions.length??0)>=4,"PRACTICE:"+id);
  assert((d.practice?.instructions.at(-1)?.label??"").includes("我希望 AI"),"LAST_FIELD:"+id);
  const hints=(d.practice?.hints??[]).join("|");
  assert(hints.includes("不知道")||hints.includes("待确认")||hints.includes("未知")||hints.includes("证据"),"EXPLICIT_UNKNOWN:"+id);
  assert((d.referenceAnswer?.length??0)>180,"REFERENCE:"+id);
  assert(d.review.length>=2,"REVIEW:"+id);
  assert(d.selfAssessment.length>=3,"SELF:"+id);
  const text=visible(d);
  for(const term of awkward)assert(!text.includes(term),"MECHANICAL_COPY:"+id+":"+term);
  for(const term of banned)assert(!text.includes(term),"LANGUAGE:"+id+":"+term);
  for(const term of courseMetaLanguage)assert(!text.includes(term),"COURSE_META_LANGUAGE:"+id+":"+term);
  assert(!/T5-\d{2}/.test(text),"COURSE_CODE_VISIBLE:"+id);
  if(text.includes("OAuth"))assert(text.includes("开放授权（OAuth）"),"OAUTH_LOCALIZATION:"+id);
  if(text.includes("IAM"))assert(text.includes("身份与访问管理（IAM）"),"IAM_LOCALIZATION:"+id);
  if(text.includes("MCP"))assert(text.includes("模型上下文协议（MCP）"),"MCP_LOCALIZATION:"+id);
  if(text.includes("RACI"))assert(text.includes("责任分工矩阵（RACI）"),"RACI_LOCALIZATION:"+id);
 }
}
const trackCatalog=fs.readFileSync("lib/learning/track-catalog.ts","utf8");
assert(!trackCatalog.includes("Pilot"),"LEARNING_PATH_PILOT_ENGLISH");
assert(evidence.includes("Capstone anti-new-knowledge: PASS"),"CAPSTONE_NO_NEW_KNOWLEDGE");
assert(evidence.includes("T5-04 = 到底解决什么 → T5-05 = 做成后变成什么 → T5-06 = 现在值不值得继续投入"),"B_BOUNDARY");
assert(evidence.includes("T5-07 = 选哪条路 → T5-08 = 这条路现在能不能走 → T5-09 = 第一阶段先走到哪里"),"C_BOUNDARY");
assert(evidence.includes("T5-10 = 低成本验证关键未知 → T5-11 = 在真实工作受控验证 → T5-12 = 从真实异常形成可解释学习"),"D_BOUNDARY");
assert(evidence.includes("T5-13 = 投不投 / 怎么投 → T5-14 = 为什么不持续用 → T5-15 = 谁长期负责与怎样持续运行"),"E_BOUNDARY");

const review=createCourseHumanReviewResult("PASS",reference,[
 "13 lessons reviewed","Step1/2 information gain PASS","Step3 mastery checks PASS",
 "Step4 learner-own problem and explicit unknown PASS","Step5 judgment framework PASS",
 "Step6 trigger separation PASS","Chinese-first learner language PASS","No learner-facing course-meta language PASS","Professional terms localized PASS","Experience copy cleanup PASS","Internal id/key stability PASS","T5-16 integration-only PASS"
]);
assert(review.decision==="PASS","REVIEW_DECISION");
const next=nextCourseProductionStage({
 ruleSourcesLoaded:[...COURSE_PRODUCTION_RULE_SOURCES],groundingReady:true,courseContextReady:true,formalBriefReady:true,
 draftReady:true,deterministicValidation:"PASS",humanReview:"PASS",lessonSpecRegistered:false,
 runtimeProvisioned:false,runtimeAcceptance:"PENDING",available:false
});
assert(next==="REGISTER_LESSON_SPEC","NEXT_STAGE");
console.log("TRACK05_BF_HUMAN_REVIEW=PASS");
console.log("TRACK05_BF_REVIEW_REFERENCE="+reference);
console.log("TRACK05_BF_13_LESSONS=PASS");
console.log("TRACK05_BF_STEP4_LEARNER_OWN_PROBLEM=PASS");
console.log("TRACK05_BF_EXPERIENCE_REVIEW=PASS");
console.log("TRACK05_BF_COURSE_META_LANGUAGE=PASS");
console.log("TRACK05_BF_PROFESSIONAL_TERM_LOCALIZATION=PASS");
console.log("TRACK05_BF_INTERNAL_ID_KEY_STABILITY=PASS");
console.log("TRACK05_BF_T516_INTEGRATION_ONLY=PASS");
console.log("TRACK05_BF_HISTORICAL_NEXT_STAGE=REGISTER_LESSON_SPEC");
console.log("TRACK05_BF_HISTORICAL_RUNTIME_STATE=NOT_STARTED_AT_HUMAN_REVIEW");
