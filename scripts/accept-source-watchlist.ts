import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {loadEnvConfig} from "@next/env";
import {eq,sql} from "drizzle-orm";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {contentSources} from "../lib/server/db/schema";
import {portfolioSeedRefreshCondition} from "../lib/server/content/source-portfolio-runtime";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
loadEnvConfig(process.cwd());
async function main(){
 assert(process.argv.includes("--confirm=SOURCE-WATCHLIST-DEVELOPMENT"));
 assert.equal(assertCurrentDatabaseTarget().environment,"development");
 const locked=await withSourceCollectionCycleLock(async()=>{
  const db=getDatabase(),id="source_accept_watchlist_"+randomUUID().replaceAll("-","");
  try{
   await db.insert(contentSources).values({id,name:"Watchlist seed protection fixture",sourceType:"OFFICIAL",platform:"WEB",collectionMethod:"RSS",status:"ACTIVE",enabled:true,metadata:{currentPortfolio:true,operatorNote:"preserve"}});
   const refresh=()=>db.update(contentSources).set({metadata:sql`${contentSources.metadata} || '{"seedMarker":true}'::jsonb`}).where(portfolioSeedRefreshCondition(id)).returning({id:contentSources.id});
   assert.equal((await refresh()).length,1,"ACTIVE_SOURCE_CAN_REFRESH");
   for(const patch of [{enabled:false},{status:"ARCHIVED" as const},{metadata:{currentPortfolio:false}},{metadata:{currentPortfolio:true,managementDisabled:true}}]){
    await db.update(contentSources).set({enabled:true,status:"ACTIVE",metadata:{currentPortfolio:true,operatorNote:"preserve"}}).where(eq(contentSources.id,id));
    const [stale]=await db.select().from(contentSources).where(eq(contentSources.id,id));assert(stale.enabled);
    await db.update(contentSources).set(patch).where(eq(contentSources.id,id));
    assert.equal((await refresh()).length,0,"CONCURRENT_OPERATOR_CHANGE_BLOCKS_STALE_SEED");
    const [after]=await db.select().from(contentSources).where(eq(contentSources.id,id));
    assert.equal((after.metadata as Record<string,unknown>).seedMarker,undefined);
   }
   await db.update(contentSources).set({enabled:true,status:"ACTIVE",metadata:{currentPortfolio:true,operatorNote:"preserve"}}).where(eq(contentSources.id,id));
   await refresh();const [after]=await db.select().from(contentSources).where(eq(contentSources.id,id));
   assert.equal((after.metadata as Record<string,unknown>).operatorNote,"preserve","ATOMIC_METADATA_MERGE_PRESERVES_OTHER_FIELDS");
  }finally{await db.delete(contentSources).where(eq(contentSources.id,id));}
 });
 assert.equal(locked.status,"COMPLETED");
 console.log("SOURCE_WATCHLIST_DATABASE=PASS;DATABASE=DEVELOPMENT;FIXTURES=CLEANED;FULL_PORTFOLIO_SEED=NOT_RUN");
}
main().catch(error=>{console.error("SOURCE_WATCHLIST_DATABASE=FAILED;CODE="+String(error.code??error.name??"UNKNOWN")+";ASSERTION="+String(error.operator??"NONE"));process.exitCode=1;}).finally(closeDatabase);
