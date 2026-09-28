import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";
loadEnvConfig(process.cwd());
import { OPC_MEMBERSHIP_PRODUCT } from "../lib/membership/policy";
import { TRACK03_RUNTIME_COURSE_SLUG } from "../lib/learning/track03-batch-a-runtime";
import { track03BatchesBERuntimeDefinitions } from "../lib/learning/track03-batches-b-e-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { entitlements, users } from "../lib/server/db/schema";
import { getLearningPrerequisiteRecommendation, getLessonAccess, getStageAccess } from "../lib/server/entitlements/service";
import { answerLessonCheck, getRequiredCheckGateState, getRequiredPracticeGateState, submitPractice } from "../lib/server/interactive/service";
import { getLessonProgressRuntimeState, setLessonCompletion } from "../lib/server/learning/service";
import { getLessonSpec } from "../lib/learning/lesson-spec-registry";
import { buildLessonRuntimePlan } from "../lib/learning/lesson-runtime";

function assert(condition:unknown,code:string):asserts condition{if(!condition)throw new Error("TRACK03_REMAINING_RUNTIME_ACCEPTANCE_FAILED:"+code)}
function checkId(slug:string,order:number){return "check_ai_growth_"+slug.replace(/-/g,"_")+"_"+order}
async function main(){
 const [user]=await getDatabase().insert(users).values({displayName:"TRACK03_REMAINING_RUNTIME_ACCEPTANCE"}).returning({id:users.id}); if(!user)throw new Error("USER_CREATE_FAILED");
 try{
  const first=track03BatchesBERuntimeDefinitions[0]!.lesson.id;
  const stage=await getStageAccess(user.id,TRACK03_RUNTIME_COURSE_SLUG); assert(stage.allowed,"TRACK02_MUST_NOT_BE_HARD_STAGE_GATE");
  const prerequisite=await getLearningPrerequisiteRecommendation(user.id,TRACK03_RUNTIME_COURSE_SLUG); assert(!prerequisite.satisfied&&prerequisite.recommendedCourseSlug==="ai-work","TRACK02_RECOMMENDATION_REQUIRED");
  const before=await getLessonAccess(user.id,TRACK03_RUNTIME_COURSE_SLUG,first); assert(!before.allowed&&before.reason==="MEMBERSHIP_REQUIRED","NON_MEMBER_DENIED");
  await getDatabase().insert(entitlements).values({userId:user.id,type:OPC_MEMBERSHIP_PRODUCT.entitlementType,resourceType:OPC_MEMBERSHIP_PRODUCT.resourceType,resourceId:OPC_MEMBERSHIP_PRODUCT.resourceId,source:"ADMIN"});
  const after=await getLessonAccess(user.id,TRACK03_RUNTIME_COURSE_SLUG,first); assert(after.allowed&&after.reason==="ENTITLED","MEMBER_ACCESS");
  for(const definition of track03BatchesBERuntimeDefinitions){
    const lessonSlug=definition.lesson.id; const spec=getLessonSpec(TRACK03_RUNTIME_COURSE_SLUG,lessonSlug); assert(spec,"SPEC:"+lessonSlug);
    const plan=buildLessonRuntimePlan(spec); const runtimeLessonId="lesson_ai_growth_"+lessonSlug.replace(/-/g,"_");
    const [c0,p0]=await Promise.all([getRequiredCheckGateState(user.id,runtimeLessonId),getRequiredPracticeGateState(user.id,runtimeLessonId)]);
    assert(!(plan.requiresCheck&&!c0.configured)&&!(plan.requiresPractice&&!p0.configured),"CONFIG:"+lessonSlug); assert(c0.requiredIds.length===3,"CHECK_COUNT:"+lessonSlug); assert(p0.requiredIds.length===1,"PRACTICE_COUNT:"+lessonSlug);
    for(const check of definition.checks){const answer=check.type==="MULTI_SELECT"?check.correctAnswers:check.correctAnswer; const result=await answerLessonCheck(user.id,checkId(lessonSlug,check.order),answer);assert(result.correct,"CHECK:"+lessonSlug+":"+check.order)}
    const practice=await submitPractice(user.id,definition.practice.id,definition.referenceFill); assert(practice.status==="PASSED","PRACTICE:"+lessonSlug);
    const [c1,p1]=await Promise.all([getRequiredCheckGateState(user.id,runtimeLessonId),getRequiredPracticeGateState(user.id,runtimeLessonId)]); assert(c1.passed,"CHECK_GATE:"+lessonSlug);assert(p1.passed,"PRACTICE_GATE:"+lessonSlug);
    await setLessonCompletion(user.id,{courseSlug:TRACK03_RUNTIME_COURSE_SLUG,lessonSlug,completed:true}); const completed=await getLessonProgressRuntimeState(user.id,TRACK03_RUNTIME_COURSE_SLUG,lessonSlug);assert(completed.completed&&completed.currentStep===6,"COMPLETION:"+lessonSlug);
  }
  console.log("TRACK03_BATCHES_B_E_RUNTIME_ACCESS=PASS"); console.log("TRACK03_BATCHES_B_E_RUNTIME_36_CHECKS=PASS"); console.log("TRACK03_BATCHES_B_E_RUNTIME_12_PRACTICES=PASS"); console.log("TRACK03_BATCHES_B_E_RUNTIME_COMPLETION=PASS"); console.log("TRACK03_BATCHES_B_E_RUNTIME_ACCEPTANCE=PASS");
 } finally { await getDatabase().delete(users).where(eq(users.id,user.id)); await closeDatabase(); }
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1});
