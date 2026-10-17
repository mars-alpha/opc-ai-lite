import assert from 'node:assert/strict';
import {aiHotspotPracticePublisher,buildAiHotspotPracticeReports,evaluateAiHotspotPractice,isToolPracticeRecord, mergeAiHotspotPractice, type AiHotspotPracticeCandidate} from '../lib/server/content/ai-hotspot-practice';
const now=new Date('2026-10-16T04:00:00Z');
const sourceMap=new Map([
 ['official',{name:'Example Official',sourceType:'OFFICIAL',metadata:{},signalConfig:{signalOnly:false}}],
 ['source_radar_ai_hot',{name:'AI HOT',sourceType:'MEDIA',metadata:{referenceOnly:true,sourceUniverseRole:'DISCOVERY_AGGREGATOR'},signalConfig:{signalOnly:true}}]
]);
const report=(id:string,title:string,url:string,sourceId='official')=>({id,title,originalUrl:url,sourceId,platform:'WEB',excerpt:'Gemini 4 review and benchmark analysis',metadata:{}});
const primary=report('a','Gemini 4 release','https://official.example/release');
const discovered={...report('b','Gemini 4 review','https://author.example/review','source_radar_ai_hot'),metadata:{collector:'ai-hot',contentType:'NEWS_ARTICLE',originPublisher:'Author B',referenceOnly:true}};
const built=buildAiHotspotPracticeReports({title:'Gemini 4 release',keywords:['Gemini 4'],entityTerms:['Gemini 4']},[primary],[discovered],sourceMap);
assert.equal(built.participants.length,2,'RESOLVED_REPORT_AND_RELEVANT_EXPANSION_COUNT_WITHOUT_FULL_MATERIAL');
assert.equal(built.links.length,2);
const recordWithMaterials=evaluateAiHotspotPractice({eventId:'expanded',title:'Gemini 4 review',aiPracticeParticipants:built.participants,aiPracticeEvidenceLinks:built.links,evidenceLinks:[],practicalEvidenceLinks:[{sourceName:'Author B',originalUrl:'https://author.example/review',materialQuality:{eligible:true}}]},now);
assert.equal(recordWithMaterials.eligible,false,'MODEL_NEWS_IS_A_HOT_SIGNAL_NOT_A_TOOL_PRACTICE');

const duplicateUrl={...discovered,originalUrl:primary.originalUrl};
assert.equal(buildAiHotspotPracticeReports({title:'Gemini 4 release'},[primary,duplicateUrl],[],sourceMap).participants.length,1,'SAME_ORIGINAL_URL_CANNOT_INVENT_TWO_PUBLISHERS');
const creators=new Map([...sourceMap,['creator',{name:'Creator C',sourceType:'MANAGED_SOURCE',metadata:{referenceOnly:true,sourceUniverseRole:'CREATOR'},signalConfig:{signalOnly:true}}] as const]);
const creatorReport={...report('c','Gemini 4 review','https://creator.example/review','creator'),metadata:{collector:'feed'}};
assert.equal(buildAiHotspotPracticeReports({title:'Gemini 4 release'},[primary,creatorReport],[],creators).participants.length,2,'ACTUAL_CREATOR_FEED_REPORT_IS_NOT_PURE_TREND_SIGNAL');
const wrong={...discovered,title:'Gemini 3 tutorial',excerpt:'Gemini 3 tutorial'};
assert.equal(buildAiHotspotPracticeReports({title:'Gemini 4 release',keywords:['Gemini 4'],entityTerms:['Gemini 4']},[primary],[wrong],sourceMap).participants.length,1,'OTHER_VERSION_CANNOT_SUPPLY_SECOND_PUBLISHER');
for(const [eventTitle,otherTitle] of [
 ['Meta 发布开源权重模型 Muse Spark Open，816B 参数、1M 上下文','Meta Launches Muse Wonder and Muse Wonder Full: Benchmarks, Pricing and How to Use It'],
 ['Learning to Steer LLM Agents and Multi-Agent Systems','Run multi-node inference workloads using Ray LLM Deep Learning Containers'],
 ['Google 工程师讲解如何系统评测 AI 智能体，告别 vibe check','Google wants to host your personal vibe-coded apps in the Play Store'],
 ['PrismaCoder: Pushing the Boundaries of Open Multimodal Code Intelligence through Decomposed Rubric Synthesis','NVIDIA Releases Nemotron 3.5 Super VL, a 120B Open Multimodal Agent Model']
]){
 const unrelated={...discovered,title:otherTitle,excerpt:eventTitle+' review and benchmark analysis'};
 assert.equal(buildAiHotspotPracticeReports({title:eventTitle,keywords:[],entityTerms:[]},[{...primary,title:eventTitle}],[unrelated],sourceMap).participants.length,1,'REAL_WEAK_ANCHOR_FALSE_POSITIVE_EXCLUDED:'+eventTitle);
}
assert.equal(buildAiHotspotPracticeReports({title:'Gemini 4 release'},[primary,{...discovered,metadata:{originPublisher:'Author B',referenceOnly:true,contentType:'TRENDING_REPO'}}],[],sourceMap).participants.length,1,'PURE_SIGNAL_REMAINS_EXCLUDED');
const sameSite={...discovered,originalUrl:'https://official.example/review',metadata:{...discovered.metadata,originPublisher:'Official alias'}};
assert.equal(buildAiHotspotPracticeReports({title:'Gemini 4 release'},[primary,sameSite],[],sourceMap).participants.length,1,'SAME_PUBLISHER_HOST_CANNOT_COUNT_TWICE');
assert.equal(new Set(buildAiHotspotPracticeReports({title:'Gemini 4 release'},[primary,sameSite],[],sourceMap).links.map(l=>l.sourceName)).size,1,'SAME_PUBLISHER_HOST_LINK_NAMES_SHARE_ONE_DISCUSSION_IDENTITY');
const base:AiHotspotPracticeCandidate={eventId:'event-a',title:'MCP Skill 工具实测与工作流',excerpt:'配置并运行 MCP 工具，对比实际工作流结果。',originalUrl:'https://example.com/a',category:'开发者',hotParticipants:[{name:'Author A'},{name:'Author B'}],topicMomentum:{independentParticipantCount:2},evidenceLinks:[{sourceName:'Author A',originalUrl:'https://example.com/a',title:'MCP Skill 实测教程',materialQuality:{eligible:true}}]};
const directBody='1. Install the package and configure input_file=notes.txt.\n2. Run the agent and export the output report.';
const directWithBody={...primary,metadata:{...primary.metadata,bodyText:directBody,publicContentReceipt:{url:primary.originalUrl,status:200,anonymous:true,serverFetched:true,complete:true,kind:'BODY',observedAt:now.toISOString()}}};
assert.equal(buildAiHotspotPracticeReports({title:'MCP Skill tutorial'},[directWithBody],[],sourceMap).links[0]?.materialQuality?.eligible,true,'DIRECT_REPORT_MUST_KEEP_VERIFIED_OPERATION_MATERIAL_QUALITY');
assert.equal(evaluateAiHotspotPractice({...base,evidenceLinks:base.evidenceLinks.map(l=>({...l,materialQuality:undefined}))},now).eligible,false,'TOOL_WITHOUT_VERIFIED_MATERIAL_STAYS_OUT');
const pending=evaluateAiHotspotPractice({...base,evidenceLinks:base.evidenceLinks.map(l=>({...l,materialQuality:undefined}))},now);
assert.equal(pending.candidate?.status,'BODY_PENDING','AUTHOR_TEST_RETAINED_AS_CANDIDATE');
assert.equal(pending.candidate?.platformExecution,'NOT_EXECUTED','AUTHOR_TEST_NOT_PLATFORM_EXECUTION');
assert.equal(evaluateAiHotspotPractice({...base,title:'MCP releases new version',excerpt:'release',evidenceLinks:[{sourceName:'Author A',originalUrl:'https://example.com/a',title:'MCP released'}]},now).candidate,null,'PLAIN_RELEASE_NOT_TEST_CANDIDATE');
const result=evaluateAiHotspotPractice(base,now);
assert.equal(evaluateAiHotspotPractice({...base,aiPracticeEvidenceLinks:base.evidenceLinks.map(l=>({...l,materialQuality:undefined})),practicalEvidenceLinks:[{sourceName:'Author C',originalUrl:'https://tutorial.example/mcp',title:'MCP 配置教程',materialQuality:{eligible:true}}]},now).eligible,true,'SEPARATE_VERIFIED_TUTORIAL_URL_MUST_COUNT_AS_MATERIAL_NOT_PUBLISHER');
assert.equal(isToolPracticeRecord({...result.record!,title:'NVIDIA Releases Nemotron 3.5 Super VL, a 120B Open Multimodal Agent Model'}),false,'HISTORICAL_AGENT_MODEL_RELEASE_IS_NOT_TOOL_PRACTICE');
assert.equal(evaluateAiHotspotPractice({...base,title:'MCP Skill tutorial: using a language model to build an agent workflow'},now).eligible,true,'TOOL_TUTORIAL_USING_MODEL_IS_STILL_PRACTICAL');
assert.equal(evaluateAiHotspotPractice({...base,title:'ComfyUI 工作流教程：加载开源模型并运行图生图'},now).eligible,true,'LOADING_OPEN_MODEL_IS_NOT_A_MODEL_RELEASE');
assert.equal(result.eligible,true,'MULTI_PUBLISHER_TOOL_WITH_VERIFIED_MATERIAL_CAN_TRIGGER');
assert.equal(evaluateAiHotspotPractice({...base,curation:{curated:false,score:0}} as AiHotspotPracticeCandidate,now).eligible,true,'FEATURED_SCORE_CANNOT_BLOCK');
assert.equal(evaluateAiHotspotPractice({...base,hotParticipants:[{name:'Author A'},{name:'author a'}]},now).eligible,false,'REPOSTS_DO_NOT_MAKE_TWO_PEOPLE');
assert.equal(evaluateAiHotspotPractice({...base,title:'新模型 Gemini 发布',excerpt:'正式发布',evidenceLinks:[]},now).eligible,false,'RELEASE_WITHOUT_ANALYSIS_OR_USE_IS_NOT_EXERCISE');
assert.equal(evaluateAiHotspotPractice({...base,title:'早报：Gemini 发布；Claude 上线'},now).eligible,false,'ROUNDUP_EXCLUDED');
assert.equal(evaluateAiHotspotPractice({...base,title:'未知模型实测',hotParticipants:[]},now).eligible,false,'NO_REAL_PARTICIPANTS_FAILS_CLOSED');
const first=mergeAiHotspotPractice(null,result.record!,now);
const later=mergeAiHotspotPractice(first,null,new Date('2026-12-16T04:00:00Z'));
assert.deepEqual(later,first,'TRIGGER_SURVIVES_SEVEN_DAYS_HEAT_AND_MATERIAL_GAPS');
assert.equal(mergeAiHotspotPractice(first,result.record!,now).firstTriggeredAt,first.firstTriggeredAt,'IDEMPOTENT_TRIGGER_TIME');
import {applyRadarOperations} from '../lib/server/content/radar-snapshot';
const history={...first,eventId:'old-event'};
const snapshot={items:[],featured:[],currentHot:[],aiHotspotPractices:[history],windowEventIndex:[],categoryCounts7d:{全部:0},totalEventCount7d:0};
assert.equal(applyRadarOperations(snapshot,[{id:'old-event',discoveryStatus:'IGNORED',archivedAt:null}]).aiHotspotPractices.length,1,'OUTSIDE_WINDOW_AND_FEEDBACK_CANNOT_HIDE_TRIGGER');
assert.equal(applyRadarOperations(snapshot,[{id:'old-event',discoveryStatus:'DISCOVERED',archivedAt:new Date()}]).aiHotspotPractices.length,0,'ARCHIVE_EXITS_DISPLAY');
assert.equal(applyRadarOperations(snapshot,[{id:'old-event',discoveryStatus:'DISCOVERED',archivedAt:null}]).totalEventCount7d,0,'HISTORICAL_EXERCISES_CANNOT_INFLATE_NEWS_COUNT');

assert.equal(evaluateAiHotspotPractice({...base,hotParticipants:[{name:'Hacker News · AI'},{name:'Product Hunt'},{name:'Author A'}]},now).eligible,false,'PLATFORM_LISTINGS_ARE_NOT_INDEPENDENT_AUTHORS');
assert.equal(evaluateAiHotspotPractice({...base,hotParticipants:[{name:'Google AI'},{name:'Google Developers Blog(RSS)'},{name:'Google DeepMind'}]},now).eligible,false,'SAME_INSTITUTION_CHANNELS_COUNT_ONCE');

import {isMultiNewsRoundup} from "../lib/server/content/content-evidence-signals";
assert(isMultiNewsRoundup("OpenAI发布新模型；Google上线新搜索"), "TWO_UNRELATED_NEWS_EXCLUDED");
assert(isMultiNewsRoundup("OpenAI releases model|Google launches search"), "UNSPACED_PIPE_DIGEST_EXCLUDED");
assert(!isMultiNewsRoundup("OpenAI发布新模型；OpenAI宣布该模型价格"), "SAME_SUBJECT_UPDATE_NOT_DIGEST");
assert(!isMultiNewsRoundup("OpenAI发布新模型；该模型上线API"), "REFERENTIAL_FOLLOWUP_NOT_DIGEST");
assert(!isMultiNewsRoundup("如何用ComfyUI搭建工作流；上线并发布自己的应用"), "PRACTICE_STEPS_NOT_DIGEST");
assert(isMultiNewsRoundup("腾讯上线「绿泡泡」短剧，主打免费看；特斯拉 Roadster 跑车明日发布；豆包工作支持一键导入 GPT、Claude 对话 | 极客早知道"), "ROUNDUP_EXCLUDED");
assert(!isMultiNewsRoundup("ComfyUI教程：安装、配置与运行图生动画工作流"), "SINGLE_TUTORIAL_NOT_ROUNDUP");
assert(!isMultiNewsRoundup("如何搭建AI早报工作流：配置来源并生成日报"), "DIGEST_BUILDING_TUTORIAL_NOT_NEWS_DIGEST");
assert(!isMultiNewsRoundup("OpenAI发布新模型，支持代码与图像"), "SINGLE_RELEASE_NOT_ROUNDUP");
assert.equal(evaluateAiHotspotPractice({...base,hotParticipants:[{name:'Google AI'},{name:'X:Gemini (@GeminiApp)'},{name:'Gemini API:更新日志(网页)'}]},now).eligible,false,'OFFICIAL_BRAND_HANDLES_COUNT_AS_SAME_INSTITUTION');
assert.equal(aiHotspotPracticePublisher({title:'MCP 实测',originalUrl:'https://example.com/a',signalOnly:true,originPublisher:'Author A'}),null,'TREND_SIGNAL_CANNOT_COUNT_AS_PUBLISHER');
assert.equal(aiHotspotPracticePublisher({title:'MCP 实测',originalUrl:'https://example.com/a',referenceOnly:true,sourceName:'DailyHot'}),null,'AGGREGATOR_WITHOUT_ORIGIN_CANNOT_COUNT');
assert.equal(aiHotspotPracticePublisher({title:'MCP 实测',originalUrl:'https://example.com/a',referenceOnly:true,originPublisher:'Author A'}),'Author A','RESOLVED_ORIGINAL_PUBLISHER_CAN_COUNT');
assert.equal(aiHotspotPracticePublisher({title:'MCP 实测',sourceName:'Author A'}),null,'NO_ORIGINAL_LINK_CANNOT_COUNT');

const officialSelfTest=evaluateAiHotspotPractice({eventId:'self-test',title:'Codex MCP workflow review',hotParticipants:[{name:'OpenAI',role:'OFFICIAL'}],evidenceLinks:[{sourceName:'OpenAI',title:'Codex MCP workflow hands-on',originalUrl:'https://openai.com/test'}]},now);
assert.equal(officialSelfTest.candidate,null,'OFFICIAL_SELF_TEST_IS_NOT_INDEPENDENT_PRACTICE_CANDIDATE');
const officialRepost=buildAiHotspotPracticeReports({title:'Codex MCP workflow benchmark'},[{...discovered,title:'Codex MCP workflow benchmark',originalUrl:'https://openai.com/index/codex-mcp-benchmark',metadata:{...discovered.metadata,originPublisher:'OpenAI'}}],[],sourceMap);
assert.equal(evaluateAiHotspotPractice({eventId:'official-repost',title:'Codex MCP workflow benchmark',aiPracticeParticipants:officialRepost.participants,aiPracticeEvidenceLinks:officialRepost.links,evidenceLinks:[]},now).candidate,null,'OFFICIAL_TEST_TRANSPORTED_BY_AGGREGATOR_IS_NOT_INDEPENDENT');
console.log('AI_HOTSPOT_PRACTICE=PASS');
