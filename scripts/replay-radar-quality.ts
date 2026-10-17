import fs from 'node:fs';
import { evaluateRelationPairs, type RadarBenchmark } from '../lib/server/content/radar-quality-benchmark';
import { EVENT_CLUSTER_RULE_VERSION, scoreEventClusterCandidate } from '../lib/server/content/event-clustering';

const fixture = JSON.parse(fs.readFileSync('scripts/fixtures/radar-quality-v1.json', 'utf8')) as RadarBenchmark;
const radarWindow = JSON.parse(fs.readFileSync('scripts/fixtures/radar-quality-v1.json', 'utf8')).radarWindow;
const event = (report: RadarBenchmark['reports'][number]) => ({ ...report.event, firstSeenAt: new Date(report.event.firstSeenAt), lastSeenAt: new Date(report.event.lastSeenAt) });
const forward = evaluateRelationPairs(fixture, (a, b) => Boolean(scoreEventClusterCandidate(event(a), event(b))));
const reverse = evaluateRelationPairs(fixture, (a, b) => Boolean(scoreEventClusterCandidate(event(b), event(a))));
const storedMembership = evaluateRelationPairs(fixture, (a, b) => Boolean(a.clusterId && a.clusterId === b.clusterId));
console.log(JSON.stringify({ version: fixture.version, rules: EVENT_CLUSTER_RULE_VERSION, capturedAt: fixture.capturedAt, scope: fixture.scope, references: fixture.references.length, limitations: fixture.limitations, radarWindow, forward, reverse, storedMembership, target: { precision: 0.98, recall: 0.9 }, engineeringReplayTargetMet: forward.evaluated >= 100 && forward.precision !== null && forward.precision >= 0.98 && forward.recall !== null && forward.recall >= 0.9, qualityTargetMet: false, qualityStatus: 'NOT_ACCEPTED', releaseStatus: 'RELEASE_NOT_READY', blockers: ['INDEPENDENT_RELATION_GOLD_MISSING', 'INDEPENDENT_60_EVENT_DISCOVERY_DENOMINATOR_MISSING', 'REPORT_SEMANTIC_SUPPORT_AND_COVERAGE_UNREVIEWED', 'STABILITY_72H_AND_EFFECT_7_14D_NOT_COMPLETED'] }, null, 2));
