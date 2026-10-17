import {expressionHash} from './event-expression-policy';
import {EVENT_GAP_SKILL,type GapInput,type GapOutput} from '../../../skills/event-discovery-plan/v1';
export const EVENT_GAP_VERSION='event-gap-v1';
export const gapPlanHash=(payload:GapInput)=>expressionHash([EVENT_GAP_VERSION,EVENT_GAP_SKILL,payload]);
export function validateEventGapOutput(input:GapInput,value:unknown):GapOutput{
 const out=value as GapOutput;
 const fail=()=>{throw new Error('EVENT_GAP_OUTPUT_INVALID');};
 if(!out||out.schemaVersion!=='event-gap-output-v1'||!Array.isArray(out.queries)||out.queries.length<2||out.queries.length>3)fail();
 for(const q of out.queries){if(!q||typeof q.query!=='string'||q.query.length>300||!q.query.includes(input.subject)||!['ZH','EN'].includes(q.language)||!['EXPERIENCE','TUTORIAL','USE_CASE'].includes(q.expansionType)||/[\u0000-\u001f]/.test(q.query))fail();}
 if(new Set(out.queries.map(q=>q.language)).size!==2||new Set(out.queries.map(q=>q.query)).size!==out.queries.length)fail();
 return {schemaVersion:out.schemaVersion,queries:out.queries};
}
