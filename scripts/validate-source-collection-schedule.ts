import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateSourceScheduleChanges,isSourceCadenceRun} from '../lib/content/source-collection-schedule';
import {resolveSourceBaseIntervalMinutes,buildSourceGovernanceExecutionPlan} from '../lib/server/content/source-runtime-governance-execution';
const valid=[{sourceId:'s',intervalMinutes:5,expectedRevision:'default'}];
assert.deepEqual(validateSourceScheduleChanges(valid),valid);
for(const value of [[],[{...valid[0],intervalMinutes:4}],[{...valid[0],intervalMinutes:1441}],[{...valid[0],intervalMinutes:5.5}],[{...valid[0],intervalMinutes:'30'}],[{...valid[0],expectedRevision:''}],[valid[0],valid[0]],[{...valid[0],extra:1}]])assert.throws(()=>validateSourceScheduleChanges(value),/INVALID/);
assert.equal(resolveSourceBaseIntervalMinutes({metadata:{collectionSchedule:{version:'source-collection-schedule-v1',intervalMinutes:60,revision:'r'}},collectionConfig:{automaticCollection:{intervalMinutes:15}}}),60);
const at=new Date('2026-10-17T00:00:00Z');
for(const interval of [5,30,60]){
 const input={sourceId:'s',governancePlan:'KEEP_CADENCE',recommendedIntervalMultiplier:1 as const,qualificationKnown:true,coverageCritical:false,baseIntervalMinutes:interval,lastRunAt:at};
 assert.equal(buildSourceGovernanceExecutionPlan({...input,now:new Date(at.getTime()+interval*60000-1)}).due,false);
 assert.equal(buildSourceGovernanceExecutionPlan({...input,now:new Date(at.getTime()+interval*60000)}).due,true);
}
assert.equal(isSourceCadenceRun({collectionOrigin:'SYSTEM'}),true);
for(const meta of [{},{collectionOrigin:'MANUAL'},{collectionOrigin:'SYSTEM',qualificationOnly:true},{collectionOrigin:'SYSTEM',backfillWindow:{}},{collectionOrigin:'SYSTEM',staleRunRecovery:{excludeFromRuntimeQualification:true}}])assert.equal(isSourceCadenceRun(meta),false);
assert.equal(isSourceCadenceRun({collectionOrigin:'SYSTEM',collectionRunKind:'SOURCE_QUALIFICATION'}),false);
const timer=fs.readFileSync('deploy/systemd/opc-collection.timer','utf8');assert(timer.includes('OnCalendar=*-*-* *:*:00'));assert(!timer.includes('OnUnitInactiveSec=15min'));
console.log('PASS source schedule: schema, override, exact due boundaries, formal-run watermark and one-minute tick');
