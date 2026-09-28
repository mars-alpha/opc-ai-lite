import fs from "node:fs";
import { createCourseBuilderReviewPacket, type CourseBuilderBuildDraft } from "../lib/learning/course-builder";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track05BatchBDrafts } from "../fixtures/course-builder/track05-batch-b";
import { track05BatchCDrafts } from "../fixtures/course-builder/track05-batch-c";
import { track05BatchDDrafts } from "../fixtures/course-builder/track05-batch-d";
import { track05BatchEDrafts } from "../fixtures/course-builder/track05-batch-e";
import { track05BatchFDrafts } from "../fixtures/course-builder/track05-batch-f";

function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK05_BF_BUILD_FAILED:"+code);}
const batches=[
  {id:"B",drafts:track05BatchBDrafts,brief:"docs/learning/TRACK05_BATCH_B_T5_04_T5_06_FORMAL_BRIEFS_V1.md",count:3},
  {id:"C",drafts:track05BatchCDrafts,brief:"docs/learning/TRACK05_BATCH_C_T5_07_T5_09_FORMAL_BRIEFS_V1.md",count:3},
  {id:"D",drafts:track05BatchDDrafts,brief:"docs/learning/TRACK05_BATCH_D_T5_10_T5_12_FORMAL_BRIEFS_V1.md",count:3},
  {id:"E",drafts:track05BatchEDrafts,brief:"docs/learning/TRACK05_BATCH_E_T5_13_T5_15_FORMAL_BRIEFS_V1.md",count:3},
  {id:"F",drafts:track05BatchFDrafts,brief:"docs/learning/TRACK05_BATCH_F_T5_16_FORMAL_BRIEF_V1.md",count:1}
];
const all=batches.flatMap(x=>x.drafts) as CourseBuilderBuildDraft[];
assert(CURRENT_COURSE_BUILDER_SKILL.version==="1.0.0","CURRENT_SKILL");
assert(all.length===13,"THIRTEEN_DRAFTS");
assert(new Set(all.map(d=>d.lessonSpec.lessonId)).size===13,"UNIQUE_IDS");
for(const batch of batches){
  assert(fs.readFileSync(batch.brief,"utf8").includes("FORMAL_BRIEF_APPROVED_V1 / READY_FOR_COURSE_BUILDER"),"BRIEF:"+batch.id);
  assert(batch.drafts.length===batch.count,"COUNT:"+batch.id);
}
const packets=all.map((draft,i)=>createCourseBuilderReviewPacket(draft,new Date("2026-09-28T15:"+String(i).padStart(2,"0")+":00.000Z"),CURRENT_COURSE_BUILDER_SKILL.version));
assert(packets.every(p=>p.status==="PENDING_REVIEW"&&p.validation.schema==="PASS"&&p.validation.rules==="PASS"&&p.validation.warnings.length===0),"PACKETS");

function visible(d:CourseBuilderBuildDraft){
 return [
  d.lessonSpec.title,...d.lessonSpec.learningObjectives,...d.lessonSpec.knowledgePoints,d.lessonSpec.learningRecommendation??"",
  ...d.lessonSpec.steps.flatMap(s=>[s.title,s.objective,s.navigationDescription??""]),
  d.content.summary,d.content.plainExplanation,d.content.whyItMatters,...d.content.points,...d.content.content,
  d.content.example.title,d.content.example.situation,d.content.example.before??"",d.content.example.after??"",d.content.example.result,
  ...d.content.mistakes,...d.content.related,
  ...(d.checkSequence??[]).flatMap(q=>[q.question,...q.options.map(o=>o.label),q.explanation,q.correctFeedback,q.incorrectFeedback]),
  d.practice?.title??"",d.practice?.goal??"",...(d.practice?.instructions.flatMap(x=>[x.label,x.prompt])??[]),...(d.practice?.hints??[]),...(d.practice?.rubric.map(x=>x.example)??[]),
  d.pedagogy.participation.prompt??"",d.pedagogy.participation.reflection,d.referenceAnswer??"",...d.review,...d.selfAssessment
 ].join("\n");
}
const banned=["Baseline","Target State","Solution Scope","Business Case","Pilot","Adoption","Rollout","Owner","readiness","Readiness","Continue","Adjust","Stop","Prototype","Solution Package","Capstone","operating model","Core FDE","Value Hypothesis","Success Condition","Outcome","Evaluation","adoption","Reference Fill","Operating Model","Gate","Demo","Prompt"];
const awkward=["当前 当前","原 当前","正式 正式","完整 完整","负责人ship"," & "," Plan"," 试点","试点 "," 当前基线","当前基线 "," 目标状态","目标状态 "," 采用","采用 "," 负责人","负责人 "];
const courseMetaLanguage=["Evidence First","下一课","最后一课","留给 T5-","留到 T5-"];
const languageDrift:string[]=[];
const step4UnknownDrift:string[]=[];
for(const d of all){
 const text=visible(d);
 assert(/^t5-\d{2}-[a-z0-9-]+$/.test(d.lessonSpec.lessonId),"LESSON_ID_STABILITY:"+d.lessonSpec.lessonId);
 for(const field of d.practice?.instructions??[]) assert(/^[A-Za-z][A-Za-z0-9]*$/.test(field.key),"PRACTICE_KEY_STABILITY:"+d.lessonSpec.lessonId+":"+field.key);
 for(const term of awkward) assert(!text.includes(term),"LEARNER_MECHANICAL_COPY:"+d.lessonSpec.lessonId+":"+term);
 for(const term of banned) if(text.includes(term)) languageDrift.push(d.lessonSpec.lessonId+":"+term);
 for(const term of courseMetaLanguage) assert(!text.includes(term),"LEARNER_COURSE_META_LANGUAGE:"+d.lessonSpec.lessonId+":"+term);
 assert(!/T5-\d{2}/.test(text),"LEARNER_COURSE_CODE:"+d.lessonSpec.lessonId);
 if(text.includes("OAuth")) assert(text.includes("开放授权（OAuth）"),"OAUTH_LOCALIZATION:"+d.lessonSpec.lessonId);
 if(text.includes("IAM")) assert(text.includes("身份与访问管理（IAM）"),"IAM_LOCALIZATION:"+d.lessonSpec.lessonId);
 if(text.includes("MCP")) assert(text.includes("模型上下文协议（MCP）"),"MCP_LOCALIZATION:"+d.lessonSpec.lessonId);
 if(text.includes("RACI")) assert(text.includes("责任分工矩阵（RACI）"),"RACI_LOCALIZATION:"+d.lessonSpec.lessonId);
 assert(d.checkSequence?.length===3,"THREE_CHECKS:"+d.lessonSpec.lessonId);
 assert((d.practice?.instructions.length??0)>=4,"PRACTICE_FIELDS:"+d.lessonSpec.lessonId);
 assert((d.practice?.hints.length??0)>=3,"HINTS:"+d.lessonSpec.lessonId);
 assert((d.referenceAnswer?.length??0)>180,"REFERENCE:"+d.lessonSpec.lessonId);
 assert(d.review.length>=2,"REVIEW_MIN_TWO:"+d.lessonSpec.lessonId);
 assert(d.selfAssessment.length>=3,"SELF_ASSESSMENT:"+d.lessonSpec.lessonId);
 assert((d.pedagogy.participation.prompt??"").length>80,"STEP4_EXECUTABLE_PROMPT:"+d.lessonSpec.lessonId);
 assert((d.practice?.instructions.at(-1)?.label??"").includes("我希望 AI"),"STEP4_LAST_FIELD:"+d.lessonSpec.lessonId);
 const hint=(d.practice?.hints??[]).join("|");
 if(!(hint.includes("不知道")||hint.includes("待确认")||hint.includes("证据")||hint.includes("未知"))) step4UnknownDrift.push(d.lessonSpec.lessonId);
}
assert(step4UnknownDrift.length===0,"STEP4_UNKNOWN:"+step4UnknownDrift.join(","));
assert(languageDrift.length===0,"LEARNER_LANGUAGE:"+languageDrift.join(","));
const step1=all.map(d=>d.lessonSpec.steps[0]!.title);
const step2=all.map(d=>d.lessonSpec.steps[1]!.title);
assert(new Set(step1).size===13,"STEP1_TEMPLATE_DRIFT");
assert(new Set(step2).size===13,"STEP2_TEMPLATE_DRIFT");
for(const d of all) assert(d.lessonSpec.steps[0]!.title!==d.lessonSpec.steps[1]!.title,"STEP1_2_OVERLAP:"+d.lessonSpec.lessonId);
const practiceSignatures=all.map(d=>(d.practice?.instructions.map(x=>x.label).join("|")??""));
assert(new Set(practiceSignatures).size===13,"STEP4_TEMPLATE_DRIFT");

console.log("TRACK05_BF_CURRENT_SKILL="+CURRENT_COURSE_BUILDER_SKILL.version);
console.log("TRACK05_BF_FORMAL_BRIEFS=5_PASS");
console.log("TRACK05_BF_DRAFTS=13");
console.log("TRACK05_BF_SCHEMA_RULE_VALIDATION=PASS");
console.log("TRACK05_BF_LESSON_TEMPLATE_DRIFT=PASS");
console.log("TRACK05_BF_STEP4_TOPIC_SPECIFIC=PASS");
console.log("TRACK05_BF_LEARNER_LANGUAGE=PASS");
console.log("TRACK05_BF_INTERNAL_ID_KEY_STABILITY=PASS");
console.log("TRACK05_BF_EXPERIENCE_COPY_CLEAN=PASS");
const trackCatalog=fs.readFileSync("lib/learning/track-catalog.ts","utf8");
assert(!trackCatalog.includes("Pilot"),"LEARNING_PATH_PILOT_ENGLISH");
console.log("TRACK05_BF_LEARNER_COURSE_META_LANGUAGE=PASS");
console.log("TRACK05_BF_PROFESSIONAL_TERM_LOCALIZATION=PASS");
console.log("TRACK05_BF_LEARNING_PATH_LANGUAGE=PASS");
console.log("TRACK05_BF_HISTORICAL_NEXT_STAGE=HUMAN_REVIEW_GATE");
console.log("TRACK05_BF_HISTORICAL_RUNTIME_STATE=NOT_STARTED_AT_BUILD");
