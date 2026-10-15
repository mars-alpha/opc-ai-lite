import assert from "node:assert/strict";
import {listRadarTimelinePage} from "../lib/server/content/intelligence-read-model";
import {buildPracticeTopics} from "../lib/server/content/practice-topics";
import {isMultiNewsRoundup} from "../lib/server/content/practical-evidence-actionability";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
import {closeDatabase} from "../lib/server/db";
async function main(){
  const target=assertCurrentDatabaseTarget();
  if(target.environment==="production")assert(process.argv.includes("--production-read-only"));
  const asOf=new Date(),start=Date.now();
  const page=await listRadarTimelinePage({asOf});
  assert(page.items.length>0,"REAL_DATA_REQUIRED");
  assert.equal(new Set(page.items.map(x=>x.eventId)).size,page.total);
  const topics=buildPracticeTopics(page.items);
  assert(page.items.filter(x=>x.currentHot.eligible).every(x=>!isMultiNewsRoundup(x.title)));
  assert(topics.every(x=>x.practicalEvidenceLinks.every(l=>l.materialQuality.eligible)));
  const reasons:Record<string,number>={};
  for(const item of page.items)for(const d of item.practiceAssessment.diagnostics)for(const reason of d.reasons)reasons[reason]=(reasons[reason]??0)+1;
  const diagnostics=page.items.flatMap(x=>x.practiceAssessment.diagnostics);
  assert(diagnostics.every(x=>x.materialQuality.eligible || x.reasons.length>0));
  console.log(JSON.stringify({status:"PASS",mode:"READ_ONLY_CLASSIFICATION_NOT_DEPLOYMENT",database:target.databaseName,asOf,events:page.total,hot:page.items.filter(x=>x.currentHot.eligible).length,featured:page.items.filter(x=>x.curation.curated).length,practice:topics.length,evidenceInspected:diagnostics.length,reasons,elapsedMs:Date.now()-start,heapMb:Math.ceil(process.memoryUsage().heapUsed/1048576)},null,2));
}
main().catch(error=>{console.error(error instanceof Error?error.message:"ACCEPTANCE_FAILED");process.exitCode=1}).finally(closeDatabase);
