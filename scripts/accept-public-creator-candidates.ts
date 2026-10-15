import assert from "node:assert/strict";
import {loadEnvConfig} from "@next/env";
import {eq,inArray,and} from "drizzle-orm";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentRawItems,users,userIdentities} from "../lib/server/db/schema";
import {probePublicCreatorCandidate} from "../lib/server/content/public-creator-probe";
import {recordContentAudit} from "../lib/server/content/workbench";
loadEnvConfig(process.cwd());
async function main(){
  assert.equal(assertCurrentDatabaseTarget().environment,"development");
  const db=getDatabase();
  const raws=await db.select().from(contentRawItems).where(inArray(contentRawItems.sourceId,["source_operator_practice_bilibili","source_operator_practice_youtube"])).limit(20);
  const [admin]=await db.select().from(users).where(and(eq(users.role,"ADMIN"),eq(users.accountStatus,"ACTIVE"))).limit(1); assert(admin);
  const [identity]=await db.select().from(userIdentities).where(and(eq(userIdentities.userId,admin.id),eq(userIdentities.provider,"EMAIL"))).limit(1);assert(identity);
  const results=[];
  for(const raw of raws){
    const existingMetadata=raw.metadata as Record<string,unknown>;
    if(typeof existingMetadata.creatorSourceId==="string"){
      results.push({author:raw.author,url:raw.originalUrl,status:"REGISTERED_CREATOR_REFERENCE",eligible:false,creatorSourceId:existingMetadata.creatorSourceId});
      continue;
    }
    const result=await probePublicCreatorCandidate(raw);
    if(process.argv.includes("--apply")) await db.transaction(async tx=>{
      const [latest]=await tx.select().from(contentRawItems).where(eq(contentRawItems.id,raw.id)).for("update");assert(latest);
      const metadata=latest.metadata as Record<string,unknown>;
      const after={...metadata,creatorReview:result,practiceDiscovery:{...metadata.practiceDiscovery as object,status:result.status},...(result.transcript?{publicTranscript:{text:result.transcript,status:result.transcriptStatus,observedAt:result.observedAt}}:{})};
      await tx.update(contentRawItems).set({metadata:after}).where(eq(contentRawItems.id,raw.id));
      await recordContentAudit({...admin,email:identity.providerUserId,role:"ADMIN"},{action:"PUBLIC_CREATOR_CANDIDATE_REVIEWED",entityType:"CONTENT_RAW_ITEM",entityId:raw.id,after:{status:result.status,reasons:result.reasons,eligible:result.eligible}},tx);
    });
    const {transcript,detailDescription,...summary}=result;
    results.push({author:raw.author,url:raw.originalUrl,...summary});
  }
  console.log(JSON.stringify({status:"PASS",applied:process.argv.includes("--apply"),candidates:results.length,eligible:results.filter(r=>r.eligible).length,formalRegistered:0,results},null,2));
}
main().catch(()=>{console.error("PUBLIC_CREATOR_ACCEPTANCE_FAILED");process.exitCode=1;}).finally(closeDatabase);
