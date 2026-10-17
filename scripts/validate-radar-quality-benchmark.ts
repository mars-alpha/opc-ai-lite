import assert from 'node:assert/strict';
import fs from 'node:fs';
import { evaluateRelationPairs, summarizeRadarQuality, validateRadarBenchmark, type RadarBenchmark } from '../lib/server/content/radar-quality-benchmark';
import { EVENT_CLUSTER_RULE_VERSION, scoreEventClusterCandidate } from '../lib/server/content/event-clustering';

const fixture = JSON.parse(fs.readFileSync('scripts/fixtures/radar-quality-v1.json', 'utf8')) as RadarBenchmark;
validateRadarBenchmark(fixture);
assert.ok(fixture.pairs.length >= 100);
assert.ok(fixture.references.length >= 60);
const result = evaluateRelationPairs(fixture, () => false);
assert.equal(result.precision, null, 'no predicted positives cannot establish precision');
assert.equal(result.recall, 0);
const all = evaluateRelationPairs(fixture, () => true);
assert.ok(all.falsePositive > 0 && all.truePositive > 0);
assert.equal(all.recall, 1);
assert.equal(all.discoveryRecall, null, 'observed-only cohort cannot measure discovery recall');
const unknown: RadarBenchmark = { ...fixture, pairs: [{ ...fixture.pairs[0], relation: 'UNKNOWN' }] };
assert.equal(evaluateRelationPairs(unknown, () => true).evaluated, 0);
assert.equal(evaluateRelationPairs(unknown, () => true).recall, null);
evaluateRelationPairs(unknown, () => { throw Error('UNKNOWN must not invoke prediction'); });
const empty = evaluateRelationPairs({ ...fixture, pairs: [] }, () => true);
assert.equal(empty.precision, null);
assert.equal(empty.recall, null);
assert.equal(evaluateRelationPairs({ ...fixture, pairs: fixture.pairs.filter(p => p.relation === 'UNRELATED') }, () => true).recall, null);
assert.throws(() => validateRadarBenchmark({ ...fixture, pairs: [...fixture.pairs, { ...fixture.pairs[0], left: fixture.pairs[0].right, right: fixture.pairs[0].left }] }), /DUPLICATE_PAIR/);
assert.throws(() => validateRadarBenchmark({ ...fixture, reports: [{ ...fixture.reports[0], originalUrl: '' }, ...fixture.reports.slice(1)] }), /CITATION/);
assert.throws(() => validateRadarBenchmark({ ...fixture, capturedAt: 'bad' }), /DATE/);
const funnel = summarizeRadarQuality([
  { featured: true, hot: true, featuredReasons: ['GOOD'], hotCriteria: { participants: true } },
  { featured: false, hot: false, featuredReasons: ['TRUST_GATE_FAILED', 'TRUST_GATE_FAILED', 'FRESH_WITHIN_24H'], hotCriteria: { participants: false } }
]);
assert.equal(funnel.featured, 1);
assert.equal(funnel.featuredRejections.TRUST_GATE_FAILED, 1);
assert.equal(funnel.featuredRejections.FRESH_WITHIN_24H, undefined, 'positive signals are not rejection reasons');
assert.equal(funnel.featuredNonSelectedReasons.FRESH_WITHIN_24H, 1);
assert.equal(funnel.hotMissingCriteria.participants, 1);
assert.equal(funnel.population, 'RADAR_VISIBLE_ONLY');
const expected = JSON.parse(fs.readFileSync('scripts/fixtures/radar-quality-v1.json', 'utf8')).scorerBaseline;
assert.equal(EVENT_CLUSTER_RULE_VERSION, expected.rules, 'baseline migration must be explicit when scorer rules change');
const event = (r: RadarBenchmark['reports'][number]) => ({ ...r.event, firstSeenAt: new Date(r.event.firstSeenAt), lastSeenAt: new Date(r.event.lastSeenAt) });
const actual = evaluateRelationPairs(fixture, (a, b) => Boolean(scoreEventClusterCandidate(event(a), event(b))));
assert.deepEqual([actual.truePositive, actual.falsePositive, actual.falseNegative, actual.trueNegative], expected.forward, 'frozen diagnostic baseline changed; review scorer and fixture, do not confuse baseline stability with quality acceptance');
console.log('RADAR_QUALITY_BENCHMARK=PASS');

// Independent editorial pool is evidence, never a source of runtime authority.
const pool=JSON.parse(fs.readFileSync('scripts/fixtures/tool-author-editorial-pool-v1.json','utf8'));
assert.equal(pool.labelAuthority,'EXPLORATORY_ANALYST_NOT_BLINDED_HUMAN_GOLD');
assert.equal(new Set(pool.samples.map((r:any)=>r.url)).size,pool.samples.length);
for(const row of pool.samples){
 assert.equal(row.sourceWrite,'NONE_REUSE_EXISTING_IDENTITY_AFTER_RESOLUTION');
 for(const column of ['featured','hot','practice']){
  const judgement=row.judgements[column];assert(['POSITIVE','NEGATIVE','UNKNOWN'].includes(judgement.label));
  assert(judgement.reason&&judgement.citations.includes(row.url));
  assert.equal(judgement.basis,'SOURCE_BASED_ANALYST_EXPLORATORY_NOT_BLINDED_HUMAN_GOLD');
 }
}
assert(pool.samples.some((r:any)=>r.judgements.featured.label==='POSITIVE'));
assert(pool.samples.some((r:any)=>r.judgements.featured.label==='NEGATIVE'));
assert(pool.samples.some((r:any)=>r.judgements.hot.label==='UNKNOWN'));
assert.equal(pool.relations[0].independentPublishers,1);
console.log('TOOL_AUTHOR_EDITORIAL_POOL=PASS;GOLD_QUALITY=NOT_ACCEPTED');

// Frozen current evidence remains separate from runtime authority and historical pools.
const current=JSON.parse(fs.readFileSync('scripts/fixtures/current-tool-evidence-v1.json','utf8'));
assert.equal(current.labelAuthority,'EXPLORATORY_ANALYST_NOT_BLINDED_HUMAN_GOLD');
assert.equal(current.sourceWrite,'NONE_REUSE_EXISTING_IDENTITY_AFTER_RESOLUTION');
assert.equal(current.qualityStatus,'NOT_ACCEPTED');assert.equal(current.releaseStatus,'RELEASE_NOT_READY');
const cutoff=Date.parse(current.asOf);assert(Number.isFinite(cutoff));
for(const topic of current.topics){
 assert.equal(new Set(topic.publications.map((p:any)=>p.url)).size,topic.publications.length);
 if(topic.runtimeMaterial.validationStatus==='NOT_EVALUATED')assert.equal(topic.runtimeMaterial.sharedMaterialEligible,null,'unmeasured material cannot become a negative judgement');
 for(const column of ['featured','hot','practice']){
  const label=topic.labels[column];assert(['POSITIVE','NEGATIVE','UNKNOWN'].includes(label.label));assert(label.reason);
  if(label.label!=='POSITIVE')continue;
  const publishers=new Set(topic.publications.filter((p:any)=>{
   const at=Date.parse(p.publishedAt??p.publishedDate);return Number.isFinite(at)&&at<=cutoff&&cutoff-at<=168*3600000;
  }).map((p:any)=>p.publisherKey));
  assert(publishers.size>=2,'positive current topic requires independently dated original publishers');
  if(column==='hot'){
   assert.equal(topic.discussion.role,'DISCUSSION_SIGNAL_ONLY');
   assert.equal(topic.discussion.independentFactPublishersAdded,0);
   const at=Date.parse(topic.discussion.publishedAt);assert(at<=cutoff&&cutoff-at<=168*3600000);
   assert.match(topic.discussion.sha256,/^[a-f0-9]{64}$/);
  }
  if(column==='practice')assert.equal(topic.runtimeMaterial.sharedMaterialEligible,true,'research readability cannot grant practice material eligibility');
 }
}
assert(current.topics.some((t:any)=>t.labels.hot.label==='POSITIVE'));
assert(current.topics.some((t:any)=>t.labels.practice.label==='UNKNOWN'));
assert.notEqual(current.continuity.firstReadLatestRunId,current.continuity.secondReadLatestRunId);
assert.equal(current.continuity.discoveryDelayHours,null,'continuous runs cannot reconstruct untracked first discovery');
console.log('CURRENT_TOOL_EVIDENCE=PASS;QUALITY=NOT_ACCEPTED;DISCOVERY_DELAY=UNKNOWN');
