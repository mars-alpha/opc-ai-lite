import fs from "node:fs";
import { createCourseBuilderReviewPacket } from "../lib/learning/course-builder";
import { CURRENT_COURSE_BUILDER_SKILL } from "../skills/course-builder";
import { track03BatchDDrafts, track03BatchDIntroComparisons, track03BatchDKnowledgeDepth, track03BatchDTriggerScenarios } from "../fixtures/course-builder/track03-batch-d";
function assert(value: unknown, code: string): asserts value { if (!value) throw new Error("TRACK03_BATCH_D_DRAFT_FAILED:" + code); }
const expectedIds = ["t3-10-customer-context","t3-11-sales-follow-up","t3-12-service-response","t3-13-service-escalation"];
const source = fs.readFileSync("fixtures/course-builder/track03-batch-d.ts","utf8");
assert(!source.includes("lesson.example.situation") && !source.includes("lesson.mistakes.slice"),"AUTO_TEMPLATE_POLLUTION");
const packets = track03BatchDDrafts.map((draft,index)=>createCourseBuilderReviewPacket(draft,new Date("2026-09-28T05:"+String(10+index).padStart(2,"0")+":00.000Z"),CURRENT_COURSE_BUILDER_SKILL.version));
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
  const intro=track03BatchDIntroComparisons[id as keyof typeof track03BatchDIntroComparisons];
  const depth=track03BatchDKnowledgeDepth[id as keyof typeof track03BatchDKnowledgeDepth];
  const trigger=track03BatchDTriggerScenarios[id];
  assert(intro && intro.title!==draft.content.example.title && intro.situation!==draft.content.example.situation,id+":STEP1_STEP2_SEPARATION");
  assert(intro.bottomDetails.length===2 && depth && depth.example.length>=1 && depth.review.length>=1,id+":STEP1_DEPTH");
  assert(Boolean(trigger?.trim()) && trigger.includes("这节课用于") && !trigger.includes("下一课"),id+":TRIGGER");
  const visible=JSON.stringify({title:draft.lessonSpec.title,steps:draft.lessonSpec.steps,learningObjectives:draft.lessonSpec.learningObjectives,knowledgePoints:draft.lessonSpec.knowledgePoints,learningRecommendation:draft.lessonSpec.learningRecommendation,capabilityGain:draft.lessonSpec.capabilityGain,nextLessonValue:draft.lessonSpec.nextLessonValue,content:draft.content,practice:draft.practice,checks:draft.checkSequence,review:draft.review,self:draft.selfAssessment,intro,depth,trigger});
  for (const forbidden of ["Schema","Beginner","CTA","HITL","Growth Review","Track 04","Workflow","Landing","Dashboard","Trigger","Node","State","Retry","Agent","Automation","系统化候选","系统化属于","进一步设计","OPC AI 工作应用","推广 AI 工作应用 课程"]) assert(!visible.includes(forbidden),id+":LEARNER_LANGUAGE_OR_CROSS_TRACK:"+forbidden);
}
const serialized=track03BatchDDrafts.map((x)=>JSON.stringify(x));
assert(["客户","推测","待确认"].every((k)=>serialized[0]?.includes(k)),expectedIds[0]+":TOPIC_BOUNDARY");
assert(["跟进","承诺","暂停"].every((k)=>serialized[1]?.includes(k)),expectedIds[1]+":TOPIC_BOUNDARY");
assert(["依据","来源","过期"].every((k)=>serialized[2]?.includes(k)),expectedIds[2]+":TOPIC_BOUNDARY");
assert(["转人工","权限","业务规则"].every((k)=>serialized[3]?.includes(k)),expectedIds[3]+":TOPIC_BOUNDARY");
assert(!serialized[3]?.includes("状态机") && !serialized[3]?.includes("重试策略"),"T313_TRACK04_BOUNDARY");
console.log("TRACK03_BATCH_D_DRAFTS=PASS");
console.log("TRACK03_BATCH_D_SIX_STEP_AND_NAV=PASS");
console.log("TRACK03_BATCH_D_DIRECT_COPY_REFERENCE=PASS");
console.log("TRACK03_BATCH_D_STEP1_STEP2_SEPARATION=PASS");
console.log("TRACK03_BATCH_D_REVIEW_AND_TRIGGER=PASS");