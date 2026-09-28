import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
loadEnvConfig(process.cwd());
import { OPC_MEMBERSHIP_PRODUCT } from "../lib/membership/policy";
import { TRACK04_RUNTIME_COURSE_SLUG, track04RuntimeDefinitions } from "../lib/learning/track04-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { entitlements, users } from "../lib/server/db/schema";
import { getLearningPrerequisiteRecommendation, getLessonAccess, getStageAccess } from "../lib/server/entitlements/service";
import { answerLessonCheck, getRequiredCheckGateState, getRequiredPracticeGateState, submitPractice } from "../lib/server/interactive/service";
import { getLessonProgressRuntimeState, setLessonCompletion } from "../lib/server/learning/service";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";
function assert(c:unknown,code:string):asserts c{if(!c)throw new Error("TRACK04_RUNTIME_ACCEPTANCE_FAILED:"+code);}
function checkId(slug:string,order:number){return "check_ai_workflow_"+slug.replace(/-/g,"_")+"_"+order;}
async function main(){
 const [user]=await getDatabase().insert(users).values({displayName:"TRACK04_RUNTIME_ACCEPTANCE"}).returning({id:users.id});if(!user)throw new Error("USER_CREATE_FAILED");
 try{
  const first=track04RuntimeDefinitions[0]!.lesson.id;
  const stage=await getStageAccess(user.id,TRACK04_RUNTIME_COURSE_SLUG);assert(stage.allowed,"TRACK03_MUST_NOT_BE_HARD_STAGE_GATE");
  const rec=await getLearningPrerequisiteRecommendation(user.id,TRACK04_RUNTIME_COURSE_SLUG);assert(!rec.satisfied&&rec.recommendedCourseSlug==="ai-growth","TRACK03_RECOMMENDATION");
  const before=await getLessonAccess(user.id,TRACK04_RUNTIME_COURSE_SLUG,first);assert(!before.allowed&&before.reason==="MEMBERSHIP_REQUIRED","NON_MEMBER_DENIED");
  await getDatabase().insert(entitlements).values({userId:user.id,type:OPC_MEMBERSHIP_PRODUCT.entitlementType,resourceType:OPC_MEMBERSHIP_PRODUCT.resourceType,resourceId:OPC_MEMBERSHIP_PRODUCT.resourceId,source:"ADMIN"});
  for(const d of track04RuntimeDefinitions){
   const slug=d.lesson.id;const access=await getLessonAccess(user.id,TRACK04_RUNTIME_COURSE_SLUG,slug);assert(access.allowed&&access.reason==="ENTITLED","ACCESS:"+slug);
   const spec=getLessonSpec(TRACK04_RUNTIME_COURSE_SLUG,slug);assert(spec,"SPEC:"+slug);const plan=buildLessonRuntimePlan(spec);const runtimeId="lesson_ai_workflow_"+slug.replace(/-/g,"_");
   const [c0,p0]=await Promise.all([getRequiredCheckGateState(user.id,runtimeId),getRequiredPracticeGateState(user.id,runtimeId)]);assert(c0.requiredIds.length===3&&p0.requiredIds.length===1,"GATE_CONFIG:"+slug);assert(!(plan.requiresCheck&&!c0.configured)&&!(plan.requiresPractice&&!p0.configured),"PLAN_CONFIG:"+slug);
   for(const check of d.checks){const answer=check.type==="MULTI_SELECT"?check.correctAnswers:check.correctAnswer;const res=await answerLessonCheck(user.id,checkId(slug,check.order),answer);assert(res.correct,"CHECK:"+slug+":"+check.order);}
   const pr=await submitPractice(user.id,d.practice.id,d.referenceFill);assert(pr.status==="PASSED","PRACTICE:"+slug);
   const [c1,p1]=await Promise.all([getRequiredCheckGateState(user.id,runtimeId),getRequiredPracticeGateState(user.id,runtimeId)]);assert(c1.passed&&p1.passed,"GATES:"+slug);
   await setLessonCompletion(user.id,{courseSlug:TRACK04_RUNTIME_COURSE_SLUG,lessonSlug:slug,completed:true});const done=await getLessonProgressRuntimeState(user.id,TRACK04_RUNTIME_COURSE_SLUG,slug);assert(done.completed&&done.currentStep===6,"COMPLETION:"+slug);
  }
  console.log("TRACK04_RUNTIME_ACCESS=PASS");console.log("TRACK04_RUNTIME_45_CHECKS=PASS");console.log("TRACK04_RUNTIME_15_PRACTICES=PASS");console.log("TRACK04_RUNTIME_15_COMPLETIONS=PASS");console.log("TRACK04_RUNTIME_ACCEPTANCE=PASS");
 } finally {await getDatabase().delete(users).where(eq(users.id,user.id));await closeDatabase();}
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1});
