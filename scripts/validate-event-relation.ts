import assert from 'node:assert/strict';
import {prepareEventRelation,validateEventRelationOutput,eventRelationJobDue} from '../lib/server/content/event-relation-policy';
const at='2026-10-17T00:00:00.000Z';
const event=(eventId:string,title:string)=>({eventId,title,firstSeenAt:at,entities:['company_demo'],subjectEntityId:null,eventType:'MODEL_RELEASE',evidence:[{rawId:'raw-'+eventId,sourceId:'source-'+eventId,text:title+' — Nebula Atlas deployment details.',publishedAt:at}]});
const left=event('a','Nebula Atlas is now available'),right=event('b','How to deploy Nebula Atlas on a local machine');
const input=prepareEventRelation([left],[right],{provider:'fixture',model:'fixture',baseUrl:'https://model.invalid',thinkingControl:'enable_thinking'});
const pair={leftId:'a',rightId:'b',relation:'SUPPORTING_REPORT',confidence:0.99,objectKey:'Nebula Atlas',reason:'同次模型的发布与部署资料',evidence:[{eventId:'a',rawId:'raw-a',quote:'Nebula Atlas is now available'},{eventId:'b',rawId:'raw-b',quote:'How to deploy Nebula Atlas on a local machine'}]};
const out={schemaVersion:'event-relation-output-v1',pairs:[pair]};
assert.equal(validateEventRelationOutput(input.payload,out).mergeAllowed,true);
assert.equal(prepareEventRelation([left],[right],{provider:'fixture',model:'fixture',baseUrl:'https://model.invalid',thinkingControl:'enable_thinking',apiKey:'rotated'} as any).inputHash,input.inputHash,'secret rotation cannot trigger model request');
assert.notEqual(prepareEventRelation([{...left,title:left.title+' revised'}],[right],{provider:'fixture',model:'fixture',baseUrl:'https://model.invalid',thinkingControl:'enable_thinking'}).inputHash,input.inputHash);
assert.throws(()=>validateEventRelationOutput(input.payload,{...out,pairs:[{...pair,evidence:[{...pair.evidence[0],rawId:'invented'},pair.evidence[1]]}]}));
assert.throws(()=>validateEventRelationOutput(input.payload,{...out,pairs:[{...pair,evidence:[{...pair.evidence[0],quote:'invented exact quotation'},pair.evidence[1]]}]}));
assert.throws(()=>validateEventRelationOutput(input.payload,{...out,pairs:[{...pair,objectKey:'company_demo'}]}));
assert.equal(validateEventRelationOutput(input.payload,{...out,pairs:[{...pair,confidence:0.8}]}).mergeAllowed,false);
for(const relation of ['RELATED_EVENT','UNRELATED','UNKNOWN'])assert.equal(validateEventRelationOutput(input.payload,{...out,pairs:[{...pair,relation}]}).mergeAllowed,false);
const multi=prepareEventRelation([left,{...left,eventId:'c',evidence:left.evidence.map(e=>({...e,rawId:'raw-c'}))}],[right],{provider:'fixture',model:'fixture',baseUrl:'https://model.invalid'});
assert.throws(()=>validateEventRelationOutput(multi.payload,out),'every cross pair required');
for(const title of ['Nebula Atlas v2 release','Nebula Atlas pricing update','Nebula Atlas security incident']){
 const x=prepareEventRelation([{...left,title:'Nebula Atlas v1 release'}],[{...right,title}],{provider:'fixture',model:'fixture',baseUrl:'https://model.invalid'});
 assert.equal(validateEventRelationOutput(x.payload,out).mergeAllowed,false,'AI cannot override version or independent action');
}
assert.equal(eventRelationJobDue({status:'SUCCEEDED'},0),false);
assert.equal(eventRelationJobDue({status:'RUNNING',nextRetryAt:'2099-01-01T00:00:00Z'},0),false);
assert.equal(eventRelationJobDue({status:'FAILED',nextRetryAt:'invalid'},Date.now()),false);
assert.equal(eventRelationJobDue({status:'FAILED',nextRetryAt:'2020-01-01T00:00:00Z'},Date.now()),true);
for(const bad of ['Nebula Atlas v2 deployment tutorial.','Nebula Atlas security incident today.']){
 const changed=prepareEventRelation([{...left,evidence:[{...left.evidence[0],text:'Nebula Atlas v1 released today.'}]}],[{...right,evidence:[{...right.evidence[0],text:bad}]}],{provider:'fixture',model:'fixture',baseUrl:'https://model.invalid'});
 const evidence=[{eventId:'a',rawId:'raw-a',quote:'Nebula Atlas v1 released today.'},{eventId:'b',rawId:'raw-b',quote:bad}];
 assert.equal(validateEventRelationOutput(changed.payload,{...out,pairs:[{...pair,evidence}]}).mergeAllowed,false,'raw version/action conflicts override vague titles');
}
const sharedDependency=prepareEventRelation([{...left,evidence:[{...left.evidence[0],text:'Nebula Atlas v1 released today; requires Python 3.12.'}]}],[{...right,evidence:[{...right.evidence[0],text:'Nebula Atlas v2 deployment tutorial; requires Python 3.12.'}]}],{provider:'fixture',model:'fixture',baseUrl:'https://model.invalid'});
assert.equal(validateEventRelationOutput(sharedDependency.payload,{...out,pairs:[{...pair,evidence:[{eventId:'a',rawId:'raw-a',quote:sharedDependency.payload.left[0].evidence[0].text},{eventId:'b',rawId:'raw-b',quote:sharedDependency.payload.right[0].evidence[0].text}]}]}).mergeAllowed,false,'shared dependency version cannot erase model version conflict');
const oldReport=structuredClone(input.payload);oldReport.right[0].evidence[0].publishedAt='2026-01-01T00:00:00Z';
assert.equal(validateEventRelationOutput(oldReport,out).mergeAllowed,false,'old original publication cannot become same release through recent collection');
const noDate=structuredClone(input.payload);noDate.right[0].evidence[0].publishedAt=null;
assert.equal(validateEventRelationOutput(noDate,out).mergeAllowed,false,'missing release dates cannot be supplied by firstSeenAt');
console.log('EVENT_RELATION_POLICY=PASS');
