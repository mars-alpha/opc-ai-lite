import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track03BatchEDrafts, track03BatchEIntroComparisons, track03BatchEKnowledgeDepth, track03BatchETriggerScenarios } from "../fixtures/course-builder/track03-batch-e";
function assert(value: unknown, code: string): asserts value { if (!value) throw new Error("TRACK03_BATCH_E_DRAFT_FAILED:" + code); }
const expectedIds = ["t3-14-operations-metrics","t3-15-growth-review"];
const source = fs.readFileSync("fixtures/course-builder/track03-batch-e.ts","utf8");
assert(!source.includes("lesson.example.situation") && !source.includes("lesson.mistakes.slice"),"AUTO_TEMPLATE_POLLUTION");
const packets = track03BatchEDrafts.map((draft,index)=>createCourseBuilderReviewPacket(draft,new Date("2026-09-28T05:"+String(10+index).padStart(2,"0")+":00.000Z"),CURRENT_COURSE_BUILDER_SKILL.version));
assert(packets.length === expectedIds.length,"DRAFT_COUNT");
assert(JSON.stringify(packets.map((p)=>p.output.mode==="BUILD"?p.output.lessonSpec.lessonId:""))===JSON.stringify(expectedIds),"IDS_OR_ORDER");
for (const packet of packets) {
  assert(packet.status==="PENDING_REVIEW" && packet.validation.schema==="PASS" && packet.validation.rules==="PASS" && packet.validation.warnings.length===0,"REVIEW_PACKET");
  assert(packet.output.mode==="BUILD","BUILD_MODE");
  const draft=packet.output; const id=draft.lessonSpec.lessonId;
  assert(draft.lessonSpec.courseSlug==="ai-growth" && draft.lessonSpec.lessonType==="APPLICATION",id+":IDENTITY");
  assert(JSON.stringify(draft.lessonSpec.completionGates)===JSON.stringify(["CHECK","PRACTICE"]),id+":GATES");
  assert(draft.lessonSpec.steps.length===6,id+":SIX_STEPS");
  for (const step of draft.lessonSpec.steps) { const lines=step.navigationDescription?.split("\n")??[]; assert(lines.length===2 && lines.every((x)=>x.length>0 && x.length<=10),id+":NAV:"+step.kind); assert(step.title.length<=32 && step.objective.length>=20 && step.objective.length<=90,id+":STEP:"+step.kind); }
  assert(draft.checkSequence?.length===3 && draft.practice!==null,id+":CHECK_PRACTICE");
  assert(draft.checkSequence?.[0]?.masteryRole==="BEST_JUDGMENT" && draft.checkSequence?.[1]?.masteryRole==="MISCONCEPTION" && draft.checkSequence?.[2]?.masteryRole==="BOUNDARY_CONDITIONS",id+":QUESTION_ROLES");
  const ref=draft.practice!.rubric.map((x)=>x.example.trim()).join("\n"); assert(draft.referenceAnswer===ref && ref.length>=300 && ref.includes("请"),id+":DIRECT_COPY_REFERENCE");
  assert(draft.review.length>=2 && draft.review.every((x)=>{const [fit,boundary]=x.split("｜"); return Boolean(fit?.trim()&&boundary?.trim());}),id+":REVIEW_TWO_DIRECTIONS");
  assert(draft.selfAssessment.length>=2,id+":SELF_ASSESSMENT");
  const intro=track03BatchEIntroComparisons[id as keyof typeof track03BatchEIntroComparisons];
  const depth=track03BatchEKnowledgeDepth[id as keyof typeof track03BatchEKnowledgeDepth];
  const trigger=track03BatchETriggerScenarios[id];
  assert(intro && intro.title!==draft.content.example.title && intro.situation!==draft.content.example.situation,id+":STEP1_STEP2_SEPARATION");
  assert(intro.bottomDetails.length===2 && depth && depth.example.length>=1 && depth.review.length>=1,id+":STEP1_DEPTH");
  assert(Boolean(trigger?.trim()) && trigger.includes("这节课用于") && !trigger.includes("下一课"),id+":TRIGGER");
  const visible=JSON.stringify({title:draft.lessonSpec.title,steps:draft.lessonSpec.steps,learningObjectives:draft.lessonSpec.learningObjectives,knowledgePoints:draft.lessonSpec.knowledgePoints,learningRecommendation:draft.lessonSpec.learningRecommendation,capabilityGain:draft.lessonSpec.capabilityGain,nextLessonValue:draft.lessonSpec.nextLessonValue,content:draft.content,practice:draft.practice,checks:draft.checkSequence,review:draft.review,self:draft.selfAssessment,intro,depth,trigger});
  for (const forbidden of ["Schema","Beginner","CTA","HITL","Growth Review","Track 04","Workflow","Landing","Dashboard","Trigger","Node","State","Retry","Agent","Automation","系统化候选","系统化属于","进一步设计","OPC AI 工作应用","推广 AI 工作应用 课程"]) assert(!visible.includes(forbidden),id+":LEARNER_LANGUAGE_OR_CROSS_TRACK:"+forbidden);
}
const serialized=track03BatchEDrafts.map((x)=>JSON.stringify(x));
assert(["指标","口径","因果"].every((k)=>serialized[0]?.includes(k)),expectedIds[0]+":TOPIC_BOUNDARY");
assert(["复盘","下一轮","负责人","验证"].every((k)=>serialized[1]?.includes(k)),expectedIds[1]+":TOPIC_BOUNDARY");
assert(serialized[1]?.includes("负责人") && serialized[1]?.includes("验证方式"),"T315_REVIEW_MUST_STAY_IN_LESSON_SCOPE");
console.log("TRACK03_BATCH_E_DRAFTS=PASS");
console.log("TRACK03_BATCH_E_SIX_STEP_AND_NAV=PASS");
console.log("TRACK03_BATCH_E_DIRECT_COPY_REFERENCE=PASS");
console.log("TRACK03_BATCH_E_STEP1_STEP2_SEPARATION=PASS");
console.log("TRACK03_BATCH_E_REVIEW_AND_TRIGGER=PASS");