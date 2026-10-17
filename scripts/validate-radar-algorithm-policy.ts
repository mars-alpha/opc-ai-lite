import assert from 'node:assert/strict';
import { DEFAULT_RADAR_ALGORITHM_POLICY as defaults, validateRadarAlgorithmPolicy, columnTextDecision } from '../lib/content/radar-algorithm-policy';
import { calculateTopicMomentum } from '../lib/server/content/topic-momentum';
import { evaluateBoleDailyCuration } from '../lib/server/content/bole-daily-curation';
import { evaluateAiHotspotPractice } from '../lib/server/content/ai-hotspot-practice';
const copy=()=>structuredClone(defaults);
assert.deepEqual(validateRadarAlgorithmPolicy(copy()),defaults);
for(const mutate of [
 (p:any)=>p.hot.halfLifeHours=0,
 (p:any)=>p.hot.risingThreshold=NaN,
 (p:any)=>p.featured.weights.importance=99,
 (p:any)=>p.practice.minPublishers=1,
 (p:any)=>p.hot.unknownField=2,
 (p:any)=>p.hot.excludeTerms=[''],
 (p:any)=>p.featured.topPickThreshold=p.featured.threshold-1
]){const p=copy();mutate(p);assert.throws(()=>validateRadarAlgorithmPolicy(p));}
assert.equal(columnTextDecision('MCP 实测', {includeTerms:['MCP'],excludeTerms:['广告']}).eligible,true);
assert.equal(columnTextDecision('MCP 广告', {includeTerms:['MCP'],excludeTerms:['广告']}).eligible,false);
assert.equal(columnTextDecision('MCP 实测', {includeTerms:['Agent'],excludeTerms:[]}).eligible,false);
assert.equal(columnTextDecision('skilled', {includeTerms:['skill'],excludeTerms:[]}).eligible,false);
const now=new Date('2026-10-17T04:00:00Z');
const input={firstSeenAt:new Date(now.getTime()-3600000),now,raws:['Alice','Bob'].map(author=>({title:'MCP tool hands-on',sourceId:author,sourceName:author,sourceType:'SOCIAL',platform:'WEB',author,publishedAt:now,collectedAt:now})),evidence:[]};
const normal=calculateTopicMomentum(input);
const strict=copy();strict.hot.risingThreshold=100;
assert.equal(normal.eligible,true);assert.equal(calculateTopicMomentum({...input,policy:strict}).eligible,false);
const terms=copy();terms.hot.includeTerms=['Agent'];
assert.equal(calculateTopicMomentum({...input,policy:terms}).eligible,false);
const expired={...input.raws[0],title:'Agent tool',publishedAt:new Date(now.getTime()-192*3600000)};
assert.equal(calculateTopicMomentum({...input,raws:[...input.raws,expired],policy:terms}).eligible,false);
const roundup={...input.raws[0],title:'AI news roundup: Agent and other updates'};
assert.equal(calculateTopicMomentum({...input,raws:[...input.raws,roundup],policy:terms}).eligible,false);
terms.hot.includeTerms=[];terms.hot.excludeTerms=['Agent'];
assert.equal(calculateTopicMomentum({...input,raws:[...input.raws,expired,roundup],policy:terms}).eligible,true);
const slower=copy();slower.hot.halfLifeHours=144;
const old={...input,firstSeenAt:new Date(now.getTime()-48*3600000),raws:input.raws.map(r=>({...r,publishedAt:new Date(now.getTime()-48*3600000)}))};
assert(calculateTopicMomentum({...old,policy:slower}).score>calculateTopicMomentum(old).score);
const featured={ageHours:2,aiRelevant:true,verificationStatus:'CONFIRMED_OFFICIAL',practicalEvidenceCount:0,independentOriginCount:1,factSourceCount:1,sourceQuality:100,changeMagnitude:'MAJOR'};
assert.equal(evaluateBoleDailyCuration(featured).selected,true);
strict.featured.threshold=100;strict.featured.topPickThreshold=100;
assert.equal(evaluateBoleDailyCuration(featured,strict).selected,false);
const blocked=copy();blocked.practice.excludeTerms=['MCP'];
const candidate:any={eventId:'e',title:'MCP tool hands-on',category:'开发者',hotParticipants:[{name:'Alice',role:'SOCIAL'},{name:'Bob',role:'SOCIAL'}],aiPracticeEvidenceLinks:[{sourceName:'Alice',originalUrl:'https://example.com/test',materialQuality:{eligible:true}}]};
assert.equal(evaluateAiHotspotPractice(candidate,now).eligible,true);
assert.equal(evaluateAiHotspotPractice(candidate,now,blocked).eligible,false);
console.log('PASS radar algorithm policy: validation, thresholds, decay, weights and column rules');
