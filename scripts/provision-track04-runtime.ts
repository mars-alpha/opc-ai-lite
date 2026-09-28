import { loadEnvConfig } from "@next/env";
import { and, asc, eq, sql } from "drizzle-orm";
loadEnvConfig(process.cwd());
import { TRACK04_RUNTIME_COURSE_SLUG, track04Course, track04RuntimeDefinitions } from "../lib/learning/track04-runtime";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { getDatabaseConfig } from "../lib/server/database-config";
import { lessonChecks, lessons, modules, practices, stages } from "../lib/server/db/schema";

const APPLY=process.argv.includes("--apply");
const CONFIRM=process.argv.includes("--confirm=TRACK04-RUNTIME-001");
const STAGE_ID="stage_ai_workflow";
const moduleMeta=[
 {id:"module_ai_workflow_workflow_suitability",order:1,indexes:[0]},
 {id:"module_ai_workflow_workflow_decomposition",order:2,indexes:[1,2,3,4]},
 {id:"module_ai_workflow_workflow_context",order:3,indexes:[5,6,7]},
 {id:"module_ai_workflow_workflow_integration",order:4,indexes:[8]},
 {id:"module_ai_workflow_workflow_reliability",order:5,indexes:[9,10,11,12]},
 {id:"module_ai_workflow_workflow_evaluation",order:6,indexes:[13,14]}
] as const;
function lessonId(slug:string){return "lesson_ai_workflow_"+slug.replace(/-/g,"_");}
function checkId(slug:string,order:number){return "check_ai_workflow_"+slug.replace(/-/g,"_")+"_"+order;}
async function readState(){
 const rows=await getDatabase().select({lessonId:lessons.id,lessonSlug:lessons.slug,status:lessons.status,moduleId:lessons.moduleId,order:lessons.order}).from(lessons)
  .innerJoin(modules,eq(lessons.moduleId,modules.id)).innerJoin(stages,eq(modules.stageId,stages.id))
  .where(eq(stages.slug,TRACK04_RUNTIME_COURSE_SLUG)).orderBy(asc(lessons.order));
 const runtime=[];
 for(const row of rows){
  const [checks,practiceRows]=await Promise.all([
   getDatabase().select({id:lessonChecks.id,required:lessonChecks.required,status:lessonChecks.status,order:lessonChecks.order}).from(lessonChecks).where(eq(lessonChecks.lessonId,row.lessonId)).orderBy(asc(lessonChecks.order)),
   getDatabase().select({id:practices.id,required:practices.required,status:practices.status,submissionSchema:practices.submissionSchema}).from(practices).where(and(eq(practices.lessonId,row.lessonId),eq(practices.type,"LESSON_PRACTICE")))
  ]);
  runtime.push({...row,checks,practices:practiceRows});
 }
 return runtime;
}
async function provision(){
 if(!APPLY)return;
 if(!CONFIRM)throw new Error("CONFIRMATION_REQUIRED: use --apply --confirm=TRACK04-RUNTIME-001");
 await getDatabase().transaction(async(tx)=>{
  // Remove legacy ai-workflow pilot modules. Their lessons/checks/progress cascade with the module.
  for(const legacyModuleId of ["module_ai_workflow_thinking","module_ai_workflow_automation"]){
   await tx.delete(modules).where(eq(modules.id,legacyModuleId));
  }
  await tx.insert(stages).values({id:STAGE_ID,slug:TRACK04_RUNTIME_COURSE_SLUG,title:track04Course.title,summary:track04Course.summary,outcome:track04Course.outcome,order:4,status:"PUBLISHED",version:1,updatedAt:sql`now()`})
   .onConflictDoUpdate({target:stages.id,set:{title:track04Course.title,summary:track04Course.summary,outcome:track04Course.outcome,status:"PUBLISHED",updatedAt:sql`now()`}});
  for(const meta of moduleMeta){
   const module=track04Course.modules[meta.order-1]; if(!module)throw new Error("TRACK04_MODULE_MISSING:"+meta.order);
   await tx.insert(modules).values({id:meta.id,stageId:STAGE_ID,slug:module.id,title:module.title,summary:module.description,order:meta.order,status:"PUBLISHED",updatedAt:sql`now()`})
    .onConflictDoUpdate({target:modules.id,set:{stageId:STAGE_ID,slug:module.id,title:module.title,summary:module.description,order:meta.order,status:"PUBLISHED",updatedAt:sql`now()`}});
   for(const index of meta.indexes){
    const d=track04RuntimeDefinitions[index]!; const lesson=d.lesson; const runtimeId=lessonId(lesson.id);
    const content={plainExplanation:lesson.plainExplanation,whyItMatters:lesson.whyItMatters,points:lesson.points,content:lesson.content,example:lesson.example,guides:lesson.guides,practice:lesson.practice,mistakes:lesson.mistakes,related:lesson.related};
    await tx.insert(lessons).values({id:runtimeId,moduleId:meta.id,slug:lesson.id,title:lesson.title,summary:lesson.summary,durationMinutes:18,content,order:index+1,status:"PUBLISHED",version:1,updatedAt:sql`now()`})
     .onConflictDoUpdate({target:lessons.id,set:{moduleId:meta.id,slug:lesson.id,title:lesson.title,summary:lesson.summary,durationMinutes:18,content,order:index+1,status:"PUBLISHED",updatedAt:sql`now()`}});
    for(const check of d.checks){
     await tx.insert(lessonChecks).values({id:checkId(lesson.id,check.order),lessonId:runtimeId,type:check.type,question:check.question,options:check.options,correctAnswer:check.correctAnswer,correctAnswers:check.correctAnswers,explanation:check.explanation,incorrectExplanation:check.incorrectExplanation,required:true,order:check.order,status:"PUBLISHED",updatedAt:sql`now()`})
      .onConflictDoUpdate({target:lessonChecks.id,set:{lessonId:runtimeId,type:check.type,question:check.question,options:check.options,correctAnswer:check.correctAnswer,correctAnswers:check.correctAnswers,explanation:check.explanation,incorrectExplanation:check.incorrectExplanation,required:true,order:check.order,status:"PUBLISHED",updatedAt:sql`now()`}});
    }
    const pr=d.practice;
    await tx.insert(practices).values({id:pr.id,type:"LESSON_PRACTICE",accessTier:"INHERIT",lessonId:runtimeId,title:pr.title,goal:pr.goal,instructions:pr.instructions,hints:pr.hints,submissionSchema:pr.submissionSchema,rubric:pr.rubric,passScore:pr.passScore,required:true,status:"PUBLISHED",updatedAt:sql`now()`})
     .onConflictDoUpdate({target:practices.id,set:{lessonId:runtimeId,title:pr.title,goal:pr.goal,instructions:pr.instructions,hints:pr.hints,submissionSchema:pr.submissionSchema,rubric:pr.rubric,passScore:pr.passScore,required:true,status:"PUBLISHED",updatedAt:sql`now()`}});
   }
  }
 });
}
function validateState(rows:Awaited<ReturnType<typeof readState>>){
 if(rows.length!==15)throw new Error("TRACK04_RUNTIME_LESSON_COUNT:"+rows.length);
 const expected=track04RuntimeDefinitions.map(x=>x.lesson.id);
 if(JSON.stringify(rows.map(x=>x.lessonSlug))!==JSON.stringify(expected))throw new Error("TRACK04_RUNTIME_ORDER_OR_ID_DRIFT");
 for(const row of rows){
  if(row.status!=="PUBLISHED")throw new Error("LESSON_NOT_PUBLISHED:"+row.lessonSlug);
  if(row.checks.length!==3||row.checks.some(x=>!x.required||x.status!=="PUBLISHED"))throw new Error("CHECKS_NOT_READY:"+row.lessonSlug);
  if(row.practices.length!==1||!row.practices[0]?.required||row.practices[0]?.status!=="PUBLISHED")throw new Error("PRACTICE_NOT_READY:"+row.lessonSlug);
  const schema=row.practices[0]?.submissionSchema;if(!schema||typeof schema!=="object"||Array.isArray(schema)||!("kind" in schema)||schema.kind!=="STRUCTURED_TEXT_V1")throw new Error("PRACTICE_SCHEMA:"+row.lessonSlug);
 }
}
async function main(){if(!getDatabaseConfig().configured)throw new Error("DATABASE_NOT_CONFIGURED");console.log("MODE="+(APPLY?"APPLY":"CHECK"));await provision();const rows=await readState();validateState(rows);console.log("TRACK04_RUNTIME_15_LESSONS=PASS");console.log("TRACK04_RUNTIME_45_CHECKS=PASS");console.log("TRACK04_RUNTIME_15_PRACTICES=PASS");console.log(APPLY?"TRACK04_RUNTIME_PROVISIONING=PASS":"TRACK04_RUNTIME_PRECHECK=PASS");}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1}).finally(closeDatabase);
