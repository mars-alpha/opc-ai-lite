import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {loadEnvConfig} from '@next/env';
import {eq} from 'drizzle-orm';
import {getDatabase,closeDatabase} from '../lib/server/db';
import {contentEvents} from '../lib/server/db/schema';
import {assertCurrentDatabaseTarget} from '../lib/server/database-target';
import {recordAiHotspotPracticeTriggers,listAiHotspotPractices} from '../lib/server/content/ai-hotspot-practice-store';
loadEnvConfig(process.cwd());
async function main(){assert.equal(assertCurrentDatabaseTarget().environment,'development');const db=getDatabase(),id=randomUUID();
try{
await db.insert(contentEvents).values({id,fingerprint:id,title:'Acceptance fixture',metadata:{unrelated:{preserved:true}},eventAt:new Date('2020-01-01')});
const candidate={eventId:id,title:'MCP Skill 分析和运用',excerpt:'测试工作流',hotParticipants:[{name:'Author A'},{name:'Author B'}],evidenceLinks:[{sourceName:'Author A',originalUrl:'https://example.invalid/a'}]};
await recordAiHotspotPracticeTriggers([candidate],new Date('2026-10-16T00:00:00Z'));
const first=(await listAiHotspotPractices()).find(r=>r.eventId===id);assert(first);assert.equal(first.materialStatus,'MATERIALS_PENDING');
await recordAiHotspotPracticeTriggers([{...candidate,hotParticipants:[]}],new Date('2026-12-16T00:00:00Z'));
assert.deepEqual((await listAiHotspotPractices()).find(r=>r.eventId===id),first);
await recordAiHotspotPracticeTriggers([candidate],new Date('2026-12-16T00:00:00Z'));
assert.equal((await listAiHotspotPractices()).filter(r=>r.eventId===id).length,1);
const [row]=await db.select().from(contentEvents).where(eq(contentEvents.id,id));assert.deepEqual((row.metadata as any).unrelated,{preserved:true});
assert.equal((row.metadata as any).aiHotspotPractice.firstTriggeredAt,first.firstTriggeredAt);
await db.update(contentEvents).set({archivedAt:new Date()}).where(eq(contentEvents.id,id));assert(!(await listAiHotspotPractices()).some(r=>r.eventId===id));
console.log('AI_HOTSPOT_PRACTICE_DATABASE=PASS');
}catch(e){console.error("DB_ACCEPT_CAUSE="+(e as any)?.cause?.code+":"+(e as any)?.cause?.message);throw e;}finally{await db.delete(contentEvents).where(eq(contentEvents.id,id)).catch(e=>console.error("CLEANUP_CAUSE="+e.cause?.code+":"+e.cause?.message));}}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(closeDatabase);
