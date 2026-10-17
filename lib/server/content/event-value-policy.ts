import {EVENT_VALUE_SKILL,VALUE_SECTIONS,type ValueEvidence,type ValueInput,type ValueOutput} from '../../../skills/event-value-analysis/v1';
import {expressionHash} from './event-expression-policy';
import {localizationDoesNotInventProtectedTokens} from './content-understanding-enrichment';
export const EVENT_VALUE_VERSION='event-value-v1';
export function prepareEventValue(eventId:string,trigger:{hot:boolean;featured:boolean},rows:ValueEvidence[]){
 const unique=[...new Map([...rows].sort((a,b)=>a.id.localeCompare(b.id)).map(e=>[expressionHash([e.publisherKey,e.documentVersion]),e])).values()];
 if(!trigger.hot&&!trigger.featured)return null;
 if(!unique.some(e=>e.complete)||!unique.some(e=>e.role==='PRIMARY'||e.role==='ANALYSIS'))return null;
 const mode=trigger.hot&&new Set(unique.map(e=>e.publisherKey)).size>=2?'FULL':'BRIEF';
 // Round-robin evidence roles, preserving counter-evidence before filling remaining slots.
 const selected:ValueEvidence[]=[];
 for(const role of ['PRIMARY','COUNTER','TEST','ANALYSIS'] as const){const e=unique.find(e=>e.role===role);if(e)selected.push(e);}
 for(const e of unique)if(selected.length<10&&!selected.includes(e))selected.push(e);
 const evidence=selected.map(e=>({...e,text:e.text.slice(0,6000),complete:e.complete&&e.text.length<=6000}));
 const payload:ValueInput={schemaVersion:'event-value-input-v1',eventId,mode,evidence,gaps:[...(unique.length>10?['EVIDENCE_SELECTION_PARTIAL']:[]),...(evidence.some(e=>!e.complete)?['FULL_BODY_INCOMPLETE']:[]),...(!evidence.some(e=>e.role==='TEST')?['INDEPENDENT_TEST_MISSING']:[])]};
 return {payload,fingerprint:expressionHash([EVENT_VALUE_VERSION,EVENT_VALUE_SKILL,unique.map(e=>[e.id,e.documentVersion,e.publisherKey,e.role,e.complete,e.publishedAt]),payload])};
}
const obj=(v:unknown):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:{};
function fail():never{throw new Error('EVENT_VALUE_OUTPUT_INVALID');}
/** Verifies structure, exact citation locations and coverage presence; semantic support stays UNREVIEWED. */
export function validateEventValueOutput(input:ValueInput,value:unknown):ValueOutput{
 const out=obj(value);
 if(out.schemaVersion!=='event-value-output-v1'||!Array.isArray(out.claims)||out.claims.length<7||out.claims.length>28||!Array.isArray(out.gaps)||out.gaps.length>20||out.gaps.some((g:unknown)=>typeof g!=='string'||!g.trim()||g.length>400))fail();
 const cite=(refs:unknown)=>{
  if(!Array.isArray(refs)||!refs.length||refs.length>10)fail();
  return refs.map(r=>{const ref=obj(r),e=input.evidence.find(e=>e.id===ref.evidenceId);if(!e||typeof ref.quote!=='string'||ref.quote.length<8||ref.quote.length>500||!e.text.includes(ref.quote))fail();return {e,quote:ref.quote as string};});
 };
 const sections=new Set<string>();
 for(const v of out.claims){const c=obj(v);if(!VALUE_SECTIONS.includes(c.section)||!['SOURCE_CLAIM','INDEPENDENT_TEST','INFERENCE','ADVICE'].includes(c.kind)||typeof c.text!=='string'||!c.text.trim()||c.text.length>400)fail();
  sections.add(c.section);const refs=cite(c.citations),quotes=refs.map(r=>r.quote).join('\n');
  if(!localizationDoesNotInventProtectedTokens(quotes,c.text)||/平台.{0,8}(?:已执行|运行成功|实测通过)|已完成实践|本平台实测|platform.{0,15}(?:executed|verified)/i.test(c.text))fail();
  if(c.kind==='INDEPENDENT_TEST'&&!refs.every(r=>r.e.role==='TEST'))fail();
  if(c.kind==='INFERENCE'&&!/推断|可能|尚不确定/.test(c.text))fail();
  if(c.kind==='ADVICE'&&!/建议|可以尝试/.test(c.text))fail();
 }
 if(VALUE_SECTIONS.some(s=>!sections.has(s)))fail();
 if((input.gaps.length||input.mode==='BRIEF')&&!out.gaps.length)fail();
 const comparison=obj(out.comparison);
 if(comparison.status==='COMPARABLE'){
  const refs=cite(comparison.citations),quoted=refs.map(r=>r.quote).join('\n');
  if(new Set(refs.filter(r=>r.e.role==='TEST').map(r=>r.e.publisherKey)).size<2)fail();
  for(const field of ['task','versions','hardware','metric','conditions'])if(typeof comparison[field]!=='string'||comparison[field].length<2||!refs.filter(r=>r.e.role==='TEST').every(r=>r.quote.includes(comparison[field])))fail();
 }else if(comparison.status!=='NOT_COMPARABLE'||typeof comparison.reason!=='string'||!comparison.reason.trim()||comparison.reason.length>400)fail();
 if(comparison.status==='NOT_COMPARABLE'&&out.claims.some((c:any)=>/提升\s*\d|快\s*\d|领先\s*\d|优于|outperform|\d+(?:\.\d+)?\s*[%％倍]/i.test(c.text)))fail();
 return {schemaVersion:out.schemaVersion,claims:out.claims,gaps:out.gaps,comparison:out.comparison};
}
