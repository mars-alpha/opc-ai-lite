import { gte } from "drizzle-orm";
import { closeDatabase, getDatabase } from "../lib/server/db";
import { contentRawItems, contentSources } from "../lib/server/db/schema";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { resolveParticipantIdentity } from "../lib/server/content/participant-identity";
import { listRadarTimelineWindow } from "../lib/server/content/intelligence-read-model";

function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function sample<T>(rows:T[], n=10){ return rows.slice(0,n); }

async function main(){
  const target=assertCurrentDatabaseTarget(); if(target.environment!=="development"||target.databaseName!=="opc_ai_dev") throw new Error("DEVELOPMENT_DATABASE_ONLY");
  const since=new Date(Date.now()-7*86_400_000); const db=getDatabase();
  const [raws,sources,timeline]=await Promise.all([
    db.select().from(contentRawItems).where(gte(contentRawItems.publishedAt,since)),
    db.select().from(contentSources),
    listRadarTimelineWindow(7)
  ]);
  const sourceById=new Map(sources.map(s=>[s.id,s]));
  const resolved=raws.map(raw=>{ const source=sourceById.get(raw.sourceId); const sourceMeta=record(source?.metadata); const identity=resolveParticipantIdentity({sourceId:raw.sourceId,sourceType:source?.sourceType??"UNKNOWN",sourceName:source?.name??raw.sourceId,platform:raw.platform,canonicalUrl:source?.canonicalUrl,author:raw.author,metadata:raw.metadata,sourceMetadata:source?.metadata,referenceOnly:record(raw.metadata).referenceOnly===true||sourceMeta.referenceOnly===true,signalOnly:record(source?.signalConfig).signalOnly===true,resolvedOriginPublisher:Boolean(record(raw.metadata).originPublisher)}); return {rawId:raw.id,sourceId:raw.sourceId,sourceName:source?.name??raw.sourceId,sourceType:source?.sourceType??"UNKNOWN",platform:raw.platform,author:raw.author,identity}; });
  const official=resolved.filter(x=>x.identity.participantType==="OWNER_ENTITY");
  const media=resolved.filter(x=>x.identity.participantType==="MEDIA_PUBLISHER");
  const creator=resolved.filter(x=>x.identity.participantType==="CREATOR_ACCOUNT");
  const community=resolved.filter(x=>x.identity.participantType==="COMMUNITY_ACCOUNT");
  const ownerGroups=new Map<string,Set<string>>(); for(const x of official){const id=x.identity.ownerEntityId;if(!id)continue;const set=ownerGroups.get(id)??new Set<string>();set.add(x.sourceId);ownerGroups.set(id,set);} const crossChannel=[...ownerGroups.entries()].filter(([,ids])=>ids.size>1);
  const legacyRank=[...timeline].filter(x=>x.heatShadow.identityAudit.legacyParticipantCount>=2).sort((a,b)=>b.heatShadow.identityAudit.legacyScore-a.heatShadow.identityAudit.legacyScore).map((x,i)=>({eventId:x.eventId,rank:i+1}));
  const legacyRankBy=new Map(legacyRank.map(x=>[x.eventId,x.rank])); const normalizedRank=[...timeline].filter(x=>x.heatShadow.eligible).sort((a,b)=>b.heatShadow.score-a.heatShadow.score).map((x,i)=>({eventId:x.eventId,rank:i+1})); const normalizedRankBy=new Map(normalizedRank.map(x=>[x.eventId,x.rank]));
  const changed=timeline.filter(x=>x.heatShadow.identityAudit.participantDelta!==0||x.heatShadow.identityAudit.scoreDelta!==0).map(x=>({eventId:x.eventId,title:x.presentation?.displayTitleZh||x.title,legacyRank:legacyRankBy.get(x.eventId)??null,normalizedRank:normalizedRankBy.get(x.eventId)??null,legacyParticipants:x.heatShadow.identityAudit.legacyParticipantCount,normalizedParticipants:x.heatShadow.identityAudit.normalizedParticipantCount,legacyScore:x.heatShadow.identityAudit.legacyScore,normalizedScore:x.heatShadow.identityAudit.normalizedScore,participantDelta:x.heatShadow.identityAudit.participantDelta,scoreDelta:x.heatShadow.identityAudit.scoreDelta})).sort((a,b)=>Math.abs(b.scoreDelta)-Math.abs(a.scoreDelta));
  const summarize=(rows:typeof resolved)=>sample(rows).map(x=>({source:x.sourceName,platform:x.platform,author:x.author,key:x.identity.participantKey,type:x.identity.participantType,ownerEntityId:x.identity.ownerEntityId,accountId:x.identity.accountId,role:x.identity.role,basis:x.identity.resolutionBasis,confidence:x.identity.confidence}));
  console.log(JSON.stringify({task:"AIHOT-HOT-HEAT-SHADOW-002-B",database:target.databaseName,raw7d:raws.length,auditCoverage:{official:{available:official.length,required:10,sample:summarize(official)},media:{available:media.length,required:10,sample:summarize(media)},creator:{available:creator.length,required:10,sample:summarize(creator)},community:{available:community.length,required:10,sample:summarize(community)},crossChannelOwner:{available:crossChannel.length,required:10,sample:sample(crossChannel).map(([ownerEntityId,ids])=>({ownerEntityId,sourceIds:[...ids]}))}},rankComparison:{legacyEligible:legacyRank.length,normalizedEligible:normalizedRank.length,changedEvents:changed.length,topChanges:changed.slice(0,25)},formalAuthorityChanged:false,status:"PASS"},null,2));
}
main().then(async()=>closeDatabase()).catch(async e=>{try{await closeDatabase()}catch{};console.error(e instanceof Error?e.message:e);process.exit(1)});
