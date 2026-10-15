import assert from "node:assert/strict";
import {writeFileSync} from "node:fs";
import {and,desc,eq,like,sql} from "drizzle-orm";
import {collectPublicPracticeContent} from "../lib/server/content/public-practice-content";
import {evaluatePracticeMaterials} from "../lib/server/content/practice-materials";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentRawItems,users,userIdentities} from "../lib/server/db/schema";
import {runSourceCollection} from "../lib/server/content/collection-runner";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
async function main(){
 const target=assertCurrentDatabaseTarget();
 const override=process.argv.find(x=>x.startsWith("--relay-url="))?.slice(12);
 if(override){assert(/^https:\/\/opc-overseas-relay-[a-z0-9]+\.mars-alpha\.deno\.net$/.test(override));process.env.OVERSEAS_COLLECTOR_RELAY_URL=override;}
 const urls=["https://docs.comfy.org/tutorials/basic/text-to-image","https://docs.comfy.org/tutorials/basic/image-to-image"];
 const candidates=await getDatabase().select({originalUrl:contentRawItems.originalUrl}).from(contentRawItems).where(like(contentRawItems.originalUrl,"https://www.bilibili.com/video/BV%")).orderBy(desc(contentRawItems.collectedAt)).limit(1);
 const results=[];const materials=[];
 for(const url of [...urls,...candidates.map(x=>x.originalUrl!)]){
  try{const metadata=await collectPublicPracticeContent({originalUrl:url});assert(metadata);const quality=evaluatePracticeMaterials({originalUrl:url,metadata});materials.push({originalUrl:url,metadata});results.push({url,status:"FETCHED",quality,receipt:metadata.publicContentReceipt});}
  catch(error){results.push({url,status:"UNAVAILABLE",reason:error instanceof Error?error.message:"PUBLIC_CONTENT_FAILED"});}
 }
 writeFileSync(".runtime/public-content-live-materials.json",JSON.stringify(materials));
 console.log(JSON.stringify({database:target.databaseName,mode:"LIVE_FETCH_NO_DATABASE_WRITES",results},null,2));
 assert(results.some(x=>"quality" in x && x.quality?.eligible),"NO_REAL_CONTENT_PASSED_MATERIAL_GATE");
 if(process.argv.includes("--run-existing-development")){
  assert.equal(target.environment,"development","DEVELOPMENT_ONLY_WRITE");
  const db=getDatabase(),sourceId="source_operator_creator_pixaroma";
  const [before]=await db.select({count:sql<number>`count(*)::int`}).from(contentRawItems).where(eq(contentRawItems.sourceId,sourceId));
  assert(before.count>0,"EXISTING_AUTHOR_REQUIRED");
  const [admin]=await db.select().from(users).where(and(eq(users.role,"ADMIN"),eq(users.accountStatus,"ACTIVE"))).limit(1);assert(admin);
  const [identity]=await db.select().from(userIdentities).where(and(eq(userIdentities.userId,admin.id),eq(userIdentities.provider,"EMAIL"))).limit(1);assert(identity);
  const locked=await withSourceCollectionCycleLock(()=>runSourceCollection({...admin,email:identity.providerUserId,role:"ADMIN"},sourceId,{provenance:{origin:"SYSTEM",collectionPurpose:"LATEST",runKind:"PUBLIC_CONTENT_MATERIALS_OBSERVATION"}}));
  assert.equal(locked.status,"COMPLETED");if(locked.status!=="COMPLETED")return;
  assert.equal(locked.value.status,"SUCCEEDED");assert.equal(locked.value.createdCount,0,"NO_DUPLICATE_RAW_CREATED");
  const raws=await db.select().from(contentRawItems).where(eq(contentRawItems.sourceId,sourceId));
  assert.equal(raws.length,before.count);
  const fetched=raws.filter(raw=>Boolean((raw.metadata as any).publicContentReceipt));assert(fetched.length>0,"RECEIPTS_PERSISTED_ON_EXISTING_RAW");
  console.log(JSON.stringify({developmentSystemRun:{id:locked.value.id,created:locked.value.createdCount,duplicates:locked.value.duplicateCount,receipts:fetched.length,materialGatePass:fetched.filter(raw=>evaluatePracticeMaterials(raw).eligible).length,rawCountUnchanged:true}}));
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(closeDatabase);
