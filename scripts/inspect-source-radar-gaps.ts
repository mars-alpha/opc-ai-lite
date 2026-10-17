import {loadEnvConfig} from '@next/env';
import {eq,desc} from 'drizzle-orm';
import {getDatabase,closeDatabase} from '../lib/server/db';
import {assertCurrentDatabaseTarget} from '../lib/server/database-target';
import {contentSources,contentCollectionRuns} from '../lib/server/db/schema';
import {listRadarTimelineWindow} from '../lib/server/content/intelligence-read-model';
import {evaluateAiHotspotPractice,aiHotspotPracticePublishers} from '../lib/server/content/ai-hotspot-practice';
import {summarizeRadarQuality} from '../lib/server/content/radar-quality-benchmark';
import fs from 'node:fs';
import {inspectRadarFunnel} from '../lib/server/content/radar-funnel-store';
import {compareRadarFunnel,type RadarReference} from '../lib/server/content/radar-funnel';
loadEnvConfig(process.cwd());
async function main(){
 const target=assertCurrentDatabaseTarget();
 if(target.environment==='production'&&!process.argv.includes('--production-read-only'))throw Error('PRODUCTION_READ_ONLY_FLAG_REQUIRED');
 const rawDate=process.argv.find(a=>a.startsWith('--as-of='))?.slice(8);
 const asOf=rawDate?new Date(rawDate):new Date();
 if(!Number.isFinite(asOf.getTime())||asOf.getTime()>Date.now()+60000)throw Error('AS_OF_INVALID');
 if(process.argv.includes('--full-funnel')){
  const referencePath=process.argv.find(a=>a.startsWith('--references='))?.slice(13);
  const fixture=JSON.parse(fs.readFileSync(referencePath??'scripts/fixtures/radar-quality-v1.json','utf8'));
  const references:RadarReference[]=referencePath?fixture.references:fixture.references.map((r:any)=>{
   const report=fixture.reports.find((x:any)=>x.id===r.reportId);if(!report)throw Error('REFERENCE_REPORT_MISSING');
   return {id:report.id,url:report.originalUrl,sourceId:report.sourceId,publishedAt:report.publishedAt,basis:'OBSERVED_ONLY',labels:{featured:'UNKNOWN',hot:'UNKNOWN',practice:'UNKNOWN'}};
  });
  const report=await inspectRadarFunnel(references,asOf);
  const comparePath=process.argv.find(a=>a.startsWith('--compare='))?.slice(10);
  const comparison=comparePath?compareRadarFunnel(JSON.parse(fs.readFileSync(comparePath,'utf8')).diagnoses,report.diagnoses):null;
  console.log(JSON.stringify({...report,comparison},null,2));return;
 }
 const sources=await getDatabase().transaction(async tx=>{
  const rows=await tx.select().from(contentSources);const result=[];
  for(const source of rows.filter(s=>/openai|deepmind|aws_ml|baoyu|latent|hamel/i.test(s.id+' '+s.name))){
   const runs=await tx.select({status:contentCollectionRuns.status,received:contentCollectionRuns.receivedCount,created:contentCollectionRuns.createdCount,errorCode:contentCollectionRuns.errorCode,startedAt:contentCollectionRuns.startedAt}).from(contentCollectionRuns).where(eq(contentCollectionRuns.sourceId,source.id)).orderBy(desc(contentCollectionRuns.startedAt)).limit(5);
   result.push({sourceId:source.id,name:source.name,enabled:source.enabled,status:source.status,runs});
  }return result;
 },{accessMode:'read only',isolationLevel:'repeatable read'});
 const items=await listRadarTimelineWindow(7,asOf);
 const quality=summarizeRadarQuality(items.map(item=>({featured:item.curation.curated,hot:item.currentHot.eligible,featuredReasons:item.curation.reasons,hotCriteria:item.topicMomentum.criteria})));
 const practiceReasons:Record<string,number>={},hotMissingCriteria:Record<string,number>={},participantCounts:Record<string,number>={},hotPhases:Record<string,number>={};
 let hotCount=0,practiceCount=0;
 const samples=[];
 for(const item of items){
  const practice=evaluateAiHotspotPractice(item,asOf),participants=aiHotspotPracticePublishers(item);
  if(item.currentHot.eligible)hotCount++;if(practice.eligible)practiceCount++;
  for(const reason of practice.reasons)practiceReasons[reason]=(practiceReasons[reason]??0)+1;
  for(const [criterion,passed] of Object.entries(item.topicMomentum.criteria))if(!passed)hotMissingCriteria[criterion]=(hotMissingCriteria[criterion]??0)+1;
  const count=String(participants.length);participantCounts[count]=(participantCounts[count]??0)+1;
  const phase=item.topicMomentum.phase;hotPhases[phase]=(hotPhases[phase]??0)+1;
  samples.push({eventId:item.eventId,title:item.title,originalUrl:item.originalUrl,hotEligible:item.currentHot.eligible,hotScore:item.topicMomentum.score,hotCriteria:item.topicMomentum.criteria,practiceEligible:practice.eligible,practiceReasons:practice.reasons,participants,reportUrls:item.aiPracticeEvidenceLinks.map(l=>l.originalUrl)});
 }
 samples.sort((a,b)=>Number(b.practiceEligible)-Number(a.practiceEligible)||b.participants.length-a.participants.length||b.hotScore-a.hotScore||a.eventId.localeCompare(b.eventId));
 console.log(JSON.stringify({version:'source-radar-gap-inspection-v2',scope:'READ_ONLY_NO_NETWORK_NO_AI_NO_STATE_CHANGE',asOf:asOf.toISOString(),sources,quality,window:{events:items.length,hotEligible:hotCount,practiceEligible:practiceCount,participantCounts,practiceReasons,hotPhases,hotMissingCriteria},samples:samples.slice(0,20)},null,2));
}
main().catch(e=>{console.error('SOURCE_RADAR_GAP_INSPECTION_FAILED:'+e.name);process.exitCode=1}).finally(closeDatabase);
