import {loadEnvConfig} from "@next/env";
import assert from "node:assert/strict";
import {eq,and} from "drizzle-orm";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {users,contentSources,contentRawItems} from "../lib/server/db/schema";
import {discoverSource,registerOnboardedSource,runOnboardedSourceCollection,previewSourceOnboarding} from "../lib/server/content/source-onboarding";
import {readSourceAiRelevancePolicy,saveSourceAiRelevancePolicy} from "../lib/server/content/source-management-policy";
import {collectRss} from "../lib/server/content/collection-runner";
import {filterDiscoveryCandidates} from "../lib/server/content/discovery-filter";
import {isCurrentSystemCollectionSource} from "../lib/server/content/source-portfolio-runtime";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=SOURCE-INPUT-DEVELOPMENT"),"EXPLICIT_DEVELOPMENT_ACCEPTANCE_REQUIRED");
 assert.equal(new URL(process.env.DATABASE_URL!).pathname,"/opc_ai_dev","DEVELOPMENT_ONLY");
 const db=getDatabase();const [admin]=await db.select().from(users).where(eq(users.role,"ADMIN")).limit(1);assert(admin);
 const actor={id:admin.id,email:"source-input-acceptance@example.invalid",displayName:null,role:"ADMIN" as const};
 const initial=await readSourceAiRelevancePolicy();
 if(initial.terms.some(term=>term.id.startsWith("accept-exclude-") || term.id==="accept-include-real")) await saveSourceAiRelevancePolicy(initial.terms.filter(term=>!term.id.startsWith("accept-exclude-") && term.id!=="accept-include-real"),actor,"CLEAN_INTERRUPTED_DEVELOPMENT_ACCEPTANCE");
 const before=await readSourceAiRelevancePolicy();
 const input={url:"https://simonwillison.net/",kind:"WEBSITE"};
 const candidate=await discoverSource(input);assert(candidate.check.passed);
 const preview=await previewSourceOnboarding(input);
 let source:any;
 if(preview.duplicate){[source]=await db.select().from(contentSources).where(eq(contentSources.id,preview.duplicate.sourceId));console.log("EXISTING_LOGICAL_SOURCE_REUSED="+source.id);}
 else {
  await assert.rejects(()=>registerOnboardedSource({...actor,id:"00000000-0000-0000-0000-000000000000"},input));
  const afterFailure=await previewSourceOnboarding(input);assert.equal(afterFailure.duplicate,null,"AUDIT_FAILURE_ROLLS_BACK_SOURCE");
  source=await registerOnboardedSource(actor,input);
 }
 assert(isCurrentSystemCollectionSource(source),"REGISTERED_SOURCE_IN_SYSTEM_PORTFOLIO");
 await assert.rejects(()=>registerOnboardedSource(actor,input),/SOURCE_ONBOARDING_DUPLICATE/);
 try {
  const words=candidate.samples.map((sample,i)=>({id:"accept-exclude-"+i,value:sample.title,kind:"EXCLUDE" as const}));
  await saveSourceAiRelevancePolicy([...before.terms,...words],actor,"SOURCE_INPUT_REAL_FEED_ACCEPTANCE");
  assert.deepEqual((await readSourceAiRelevancePolicy()).terms.slice(-words.length),words);
  const excluded=await runOnboardedSourceCollection(actor,source.id);
  assert.equal(excluded.status,"SUCCEEDED",excluded.errorCode ?? "EXCLUSION_RUN_FAILED");
  const audit=(excluded.metadata as any)?.rejectedSampleCapture;
  assert.equal(audit.samples.filter((sample:any)=>sample.reason==="SOURCE_POLICY_EXCLUDED_TERM" && words.some(word=>word.value===sample.title)).length,words.length,"EVERY_SAVED_EXCLUSION_REACHES_RUNNER");
  console.log(JSON.stringify({stage:"EXCLUDED_REAL_FEED",received:excluded.receivedCount,created:excluded.createdCount,duplicates:excluded.duplicateCount,reasons:audit.samples.reduce((counts:any,row:any)=>{counts[row.reason]=(counts[row.reason]??0)+1;return counts;},{})}));
 }finally{await saveSourceAiRelevancePolicy(before.terms,actor,"RESTORE_POLICY_AFTER_SOURCE_INPUT_ACCEPTANCE");}
 const realItems=await collectRss(candidate.acquisitionUrl!);
 const baseline=await filterDiscoveryCandidates(realItems,{requireExplicitAiRelation:true,sourceType:"MEDIA",relevanceTerms:before.terms});
 const index=baseline.decisions.find(decision=>decision.reason==="NOT_AI_RELATED")?.index;
 assert.notEqual(index,undefined,"REAL_FEED_MUST_SUPPLY_NON_RECALLED_SAMPLE");
 const target=realItems[index!];
 try {
  await saveSourceAiRelevancePolicy([...before.terms,{id:"accept-include-real",value:target.title,kind:"INCLUDE"}],actor,"REAL_FEED_INCLUDE_ACCEPTANCE");
  const included=await runOnboardedSourceCollection(actor,source.id);assert.equal(included.status,"SUCCEEDED");
  const [raw]=await db.select().from(contentRawItems).where(and(eq(contentRawItems.sourceId,source.id),eq(contentRawItems.originalUrl,target.originalUrl!))).limit(1);
  assert(raw,"CUSTOM_INCLUDE_MUST_REACH_REAL_RAW");
  console.log(JSON.stringify({stage:"CUSTOM_INCLUDE_REAL_RAW",title:target.title,received:included.receivedCount,created:included.createdCount,duplicates:included.duplicateCount}));
 }finally{await saveSourceAiRelevancePolicy(before.terms,actor,"RESTORE_POLICY_AFTER_INCLUDE_ACCEPTANCE");}
 const run=await runOnboardedSourceCollection(actor,source.id);assert.equal(run.status,"SUCCEEDED",run.errorCode ?? "COLLECTION_FAILED");
 console.log(JSON.stringify({stage:"RESTORED_REAL_FEED",sourceId:source.id,received:run.receivedCount,created:run.createdCount,duplicates:run.duplicateCount}));
 console.log("SOURCE_INPUT_SERVER_ACCEPTANCE=PASS");
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(closeDatabase);
