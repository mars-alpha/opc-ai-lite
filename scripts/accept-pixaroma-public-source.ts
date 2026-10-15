import assert from "node:assert/strict";
import {loadEnvConfig} from "@next/env";
import {and,eq,sql} from "drizzle-orm";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentRawItems,contentRawItemObservations,contentCollectionRuns,contentEventRawItems,users,userIdentities} from "../lib/server/db/schema";
import {collectPixaromaPublicWorkflows} from "../lib/server/content/public-workflow-materials";
import {registerPixaromaPublicSource,PIXAROMA_SOURCE_ID} from "../lib/server/content/pixaroma-source";
import {runSourceCollection} from "../lib/server/content/collection-runner";
import {listCurrentSystemCollectionSources} from "../lib/server/content/source-portfolio-runtime";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
loadEnvConfig(process.cwd());
async function main(){
  const environment=assertCurrentDatabaseTarget().environment;
  if(environment==="production")assert(process.argv.includes("--confirm=PIXAROMA-PRODUCTION"),"EXPLICIT_PRODUCTION_CONFIRMATION_REQUIRED");
  else assert.equal(environment,"development");
  const preview=process.argv.find(a=>a.startsWith("--relay="))?.slice(8);
  if(preview){assert.equal(environment,"development");assert(/^https:\/\/opc-overseas-relay-[a-z0-9]+\.mars-alpha\.deno\.net$/.test(preview));process.env.OVERSEAS_COLLECTOR_RELAY_URL=preview;}
  if(process.argv.includes("--probe")){
    const items=await collectPixaromaPublicWorkflows();
    console.log(JSON.stringify({probe:true,items:items.length,materials:items.flatMap(i=>{const m=i.metadata?.publicMaterials as Record<string,unknown>;return m.status==="STRUCTURE_VERIFIED_NOT_EXECUTED"?[{url:i.originalUrl,episode:m.episode,workflows:m.workflows,status:m.status}]:[];}),unknownDates:items.filter(i=>!i.publishedAt).length}));return;
  }
  const db=getDatabase();
  const [admin]=await db.select().from(users).where(and(eq(users.role,"ADMIN"),eq(users.accountStatus,"ACTIVE"))).limit(1);assert(admin);
  const [identity]=await db.select().from(userIdentities).where(and(eq(userIdentities.userId,admin.id),eq(userIdentities.provider,"EMAIL"))).limit(1);assert(identity);
  const user={...admin,email:identity.providerUserId,role:"ADMIN" as const};
  if(process.argv.includes("--register"))console.log(JSON.stringify(await registerPixaromaPublicSource(user)));
  const current=(await listCurrentSystemCollectionSources({serverRuntimeOnly:true})).find(s=>s.id===PIXAROMA_SOURCE_ID);
  assert(current,"REGISTERED_AUTHOR_MUST_BE_IN_EXISTING_SYSTEM_PORTFOLIO");
  assert.equal((current.metadata as Record<string,unknown>).sourceUniverseRole,"CREATOR");
  if(process.argv.includes("--run")){
    const locked=await withSourceCollectionCycleLock(()=>runSourceCollection(user,PIXAROMA_SOURCE_ID,{provenance:{origin:"SYSTEM",collectionPurpose:"LATEST",runKind:"PIXAROMA_PUBLIC_MATERIALS_OBSERVATION"}}));
    assert(locked.status==="COMPLETED","SYSTEM_CYCLE_BUSY_RETRY_LATER");
    const result=locked.value;
    assert.equal(result.status,"SUCCEEDED");
    console.log(JSON.stringify({run:{id:result.id,status:result.status,received:result.receivedCount,created:result.createdCount,duplicates:result.duplicateCount,startedAt:result.startedAt,finishedAt:result.finishedAt}}));
  }
  const counts=await db.select({count:sql<number>`count(*)::int`}).from(contentRawItems).where(eq(contentRawItems.sourceId,PIXAROMA_SOURCE_ID));
  const observations=await db.select({count:sql<number>`count(*)::int`}).from(contentRawItemObservations).where(eq(contentRawItemObservations.sourceId,PIXAROMA_SOURCE_ID));
  const runs=await db.select().from(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,PIXAROMA_SOURCE_ID));
  const [eventLinks]=await db.select({count:sql<number>`count(*)::int`}).from(contentEventRawItems).innerJoin(contentRawItems,eq(contentRawItems.id,contentEventRawItems.rawItemId)).where(and(eq(contentRawItems.sourceId,PIXAROMA_SOURCE_ID),sql`${contentRawItems.metadata}->>'publicationStatus' = 'UNKNOWN_HISTORICAL'`));
  assert.equal(eventLinks.count,0,"UNKNOWN_DATES_MUST_NOT_CREATE_RECENT_EVENTS");
  const [unique]=await db.select({count:sql<number>`count(distinct ${contentRawItems.canonicalUrl})::int`}).from(contentRawItemObservations).innerJoin(contentRawItems,eq(contentRawItems.id,contentRawItemObservations.rawItemId)).where(eq(contentRawItemObservations.sourceId,PIXAROMA_SOURCE_ID));
  assert.equal(unique.count,observations[0].count,"ONE_OBSERVATION_PER_CANONICAL_EPISODE_AND_SOURCE");
  // New upstream episodes may arrive between cycles. Do not freeze source counts.
  assert(observations[0].count>=3,"VERIFIED_AUTHOR_MATERIALS_MUST_BE_PERSISTED");
  console.log(JSON.stringify({sourceId:PIXAROMA_SOURCE_ID,rawCount:counts[0].count,observationCount:observations[0].count,runs:runs.map(r=>({id:r.id,status:r.status,created:r.createdCount,duplicates:r.duplicateCount,startedAt:r.startedAt,finishedAt:r.finishedAt}))}));
}
main().catch(e=>{console.error(e instanceof Error?e.message:"PIXAROMA_ACCEPTANCE_FAILED");process.exitCode=1;}).finally(closeDatabase);
