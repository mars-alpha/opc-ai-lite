import {createHash} from 'node:crypto';
import {EVENT_EXPRESSION_SKILL,type ExpressionEvidence,type ExpressionInput,type ExpressionOutput} from '../../../skills/event-expression/v1';
import {localizationDoesNotInventProtectedTokens,titlePreservesArticleActionType} from './content-understanding-enrichment';
import {knownEntityIdsInText} from './review-localization';
export const EVENT_EXPRESSION_VERSION='event-expression-v1';
export const expressionHash=(v:unknown)=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const obj=(v:unknown):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,any>:{};
const uncertain=(text:string)=>/rumou?r|unconfirmed|alleged|reportedly|may release|传闻|据传|待核实|尚不确定|疑似|未经证实/i.test(text);
export function prepareEventExpression(canonicalEventId:string,rows:ExpressionEvidence[]){
 const unique=new Map<string,ExpressionEvidence>();
 for(const row of [...rows].sort((a,b)=>(a.collectedAt??a.publishedAt??'').localeCompare(b.collectedAt??b.publishedAt??'')||a.rawId.localeCompare(b.rawId))){
  const value={rawId:row.rawId,text:row.text.trim().slice(0,4000),publishedAt:row.publishedAt,authority:row.authority,scope:row.scope};
  const key=expressionHash([value.text,value.authority,value.scope]);if(!unique.has(key))unique.set(key,value);
 }
 const all=[...unique.entries()].sort(([a],[b])=>a.localeCompare(b));
 const evidence=all.slice(0,8).map(([,v])=>v);
 const payload:ExpressionInput={schemaVersion:'event-expression-input-v1',canonicalEventId,evidence,partial:all.length>8,requiresUncertainty:all.length>8||!evidence.some(e=>e.authority==='PRIMARY')||evidence.some(e=>uncertain(e.text))};
 return {payload,fingerprint:expressionHash([EVENT_EXPRESSION_VERSION,EVENT_EXPRESSION_SKILL.promptVersion,EVENT_EXPRESSION_SKILL.outputSchema,payload,all])};
}
function fail():never{throw new Error('EVENT_EXPRESSION_OUTPUT_INVALID');}
// Conservative guards, not a semantic truth oracle. Unrecognised meanings require model-quality evaluation.
const actions:[RegExp,RegExp][]=[
 [/停止服务|停止支持|停服|下架|终止|弃用|关闭服务|无法使用/,/discontinu|deprecat|shut.?down|end.of.life|no longer|停止|终止|弃用|下架|停服/i],
 [/收购|并购|合并公司/,/acquir|acquisition|merger|收购|并购/i],
 [/降价|涨价|调价|免费|收费/,/price|pricing|cost|free|paid|降价|涨价|调价|免费|收费/i],
 [/安全漏洞|泄露|攻击|安全事故/,/vulnerab|breach|attack|leak|安全漏洞|泄露|攻击|安全事故/i],
 [/已发布|正式发布|推出|上线|正式开放/,/available|releas|launch|introduc|发布|推出|上线|开放/i],
 [/性能提升|速度提升|快于|领先|超过|优于/,/improv|faster|outperform|better|exceed|性能提升|速度提升|快于|领先|超过|优于/i],
 [/必须迁移|强制迁移/,/must migrate|required migration|必须迁移|强制迁移/i]
];
export function validateEventExpressionOutput(input:ExpressionInput,value:unknown):ExpressionOutput{
 const out=obj(value);if(out.schemaVersion!=='event-expression-output-v1'||!input.evidence.length)fail();
 if(!Array.isArray(out.evidenceIds)||!out.evidenceIds.length||out.evidenceIds.length>8||new Set(out.evidenceIds).size!==out.evidenceIds.length)fail();
 if(!Array.isArray(out.uncertainties)||out.uncertainties.length>8||out.uncertainties.some((x:unknown)=>typeof x!=='string'||!x.trim()||x.length>200))fail();
 const used=new Set<string>();
 for(const [field,max] of [['titleZh',100],['summaryZh',220],['whyItMatters',140]] as const){
  const text=out[field];if(typeof text!=='string'||!text.trim()||text!==text.trim()||text.length>max||!/[\u3400-\u9fff]/u.test(text))fail();
  const refs=obj(out.support)[field];if(!Array.isArray(refs)||!refs.length||refs.length>8)fail();
  const quoted:string[]=[],materials:ExpressionEvidence[]=[];
  for(const ref of refs){const r=obj(ref),e=input.evidence.find(x=>x.rawId===r.evidenceId);if(!e||typeof r.quote!=='string'||r.quote.length<8||r.quote.length>500||!e.text.includes(r.quote))fail();used.add(e.rawId);quoted.push(r.quote);materials.push(e);}
  const support=quoted.join('\n');
  if(field==='titleZh'){
   const versions=support.match(/\bv\d+(?:\.\d+)*(?:[-.][a-z0-9]+)*\b/gi)??[];
   if(versions.some(version=>!text.toLowerCase().includes(version.toLowerCase())))fail();
   const namedTokens=support.match(/\b[A-Z][A-Za-z0-9_-]{2,}\b/g)??[];
   if(namedTokens.length&&!namedTokens.some(token=>text.includes(token)))fail();
  }
  if(!localizationDoesNotInventProtectedTokens(support,text))fail();
  const latin=text.match(/[A-Za-z][A-Za-z0-9_.+-]*/g)??[];
  const allowed=new Set((support.match(/[A-Za-z][A-Za-z0-9_.+-]*/g)??[]).map(t=>t.toLowerCase()));
  if(latin.some(t=>!allowed.has(t.toLowerCase())))fail();
  const entities=knownEntityIdsInText(support);if(knownEntityIdsInText(text).some(id=>!entities.includes(id)))fail();
  const amounts=text.match(/[零〇一二三四五六七八九十百千万亿两]+(?:元|美元|亿元|万元|倍|%|％|个百分点|亿|万)/g)??[];
  if(amounts.some(amount=>!support.includes(amount)))fail();
  if(actions.some(([generated,original])=>generated.test(text)&&!original.test(support)))fail();
  if(!titlePreservesArticleActionType(support,text))fail();
  if(/官方|正式确认|已证实/.test(text)&&!materials.some(e=>e.authority==='PRIMARY'))fail();
  if(materials.some(e=>uncertain(e.text))&&/已发布|正式发布|已确认|已上线|正式开放/.test(text))fail();
  if(/已完成实践|实测通过|已成功运行|完整教程|步骤齐全/.test(text))fail();
 }
 if(/^(本文|文章|作者|据报道|报道称|这篇文章|该文|原文)/.test(out.summaryZh))fail();
 if(/革命性|颠覆|史上最强|必看|改变世界/.test(out.whyItMatters))fail();
 if(input.requiresUncertainty&&(!out.uncertainties.length||!/待核实|尚不确定/.test(out.summaryZh)))fail();
 if(out.uncertainties.length&&!/待核实|尚不确定/.test(out.summaryZh))fail();
 if(out.evidenceIds.length!==used.size||out.evidenceIds.some((id:unknown)=>typeof id!=='string'||!used.has(id)))fail();
 return {schemaVersion:out.schemaVersion,titleZh:out.titleZh,summaryZh:out.summaryZh,whyItMatters:out.whyItMatters,evidenceIds:out.evidenceIds,uncertainties:out.uncertainties,support:out.support};
}
export function readEventExpression(value:unknown,prepared:ReturnType<typeof prepareEventExpression>|null){
 const stored=obj(value);if(!prepared||stored.version!==EVENT_EXPRESSION_VERSION||stored.fingerprint!==prepared.fingerprint)return null;
 try{return validateEventExpressionOutput(prepared.payload,stored.output);}catch{return null;}
}
