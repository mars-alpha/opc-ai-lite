import { buildEventStoryReadModel, attachRelatedEventStories, EVENT_STORY_READ_MODEL_VERSION } from "../lib/server/content/event-story-read-model";
function assert(condition:unknown,code:string):asserts condition{if(!condition)throw new Error(code)}
const reports=[
{reportId:"r1",sourceId:"official",sourceType:"OFFICIAL",sourceName:"OpenAI",platform:"WEB",canonicalUrl:"https://openai.com",metadata:{},sourceMetadata:{},title:"Official release",titleZh:"官方发布",excerpt:"official detail",excerptZh:"官方细节",originalUrl:"https://openai.com/a",publishedAt:"2026-10-15T08:00:00Z"},
{reportId:"r2",sourceId:"media",sourceType:"MEDIA",sourceName:"Media",platform:"WEB",metadata:{originPublisher:"Media"},sourceMetadata:{},title:"Later report",titleZh:"后续报道",excerpt:"later",excerptZh:"后续进展",originalUrl:"https://media.example/a",publishedAt:"2026-10-15T10:00:00Z"},
{reportId:"r3",sourceId:"signal",sourceType:"SOCIAL",sourceName:"HN",platform:"HACKER_NEWS",author:"alice",metadata:{},sourceMetadata:{},signalOnly:true,title:"Signal",originalUrl:"https://news.ycombinator.com/item?id=1",publishedAt:"2026-10-15T11:00:00Z"}
];
const story=buildEventStoryReadModel({eventId:"e1",title:"Event",titleZh:"事件",summary:"summary",summaryZh:"事件摘要",reports,heatSeries:Array.from({length:9},(_,i)=>({at:new Date(Date.UTC(2026,9,13,12+i*6)).toISOString(),score:i,participantCount:i,editorialParticipantCount:i,signalParticipantCount:0}))});
assert(story.version===EVENT_STORY_READ_MODEL_VERSION,"STORY_VERSION");
assert(story.authority==="DERIVED_READ_MODEL","STORY_AUTHORITY");
assert(story.latest?.reportId==="r3","LATEST_IS_NEWEST_PUBLIC_EVIDENCE");
assert(story.latestReport?.reportId==="r1","LATEST_REPORT_PRIMARY_PRIORITY");
assert(story.digest.aiGenerated===false&&story.digest.mode==="DETERMINISTIC_DERIVED","DIGEST_DETERMINISTIC");
assert(story.reportTimeline.length===3,"TIMELINE_ALL_REPORTS");
assert(story.heatSeries.mode==="DERIVED_REPLAY"&&story.heatSeries.persistedHistory===false&&story.heatSeries.points.length===9,"HEAT_SERIES_REPLAY");
const related=attachRelatedEventStories([{eventId:"e1",title:"OpenAI GPT 6 API 发布",eventType:"API_PLATFORM_UPDATE",story},{eventId:"e2",title:"OpenAI GPT 6 API 定价更新",eventType:"API_PLATFORM_UPDATE",story:{...story,eventId:"e2"}},{eventId:"e3",title:"苹果发布新款家庭设备",eventType:"PRODUCT_FEATURE_RELEASE",story:{...story,eventId:"e3"}}]);
assert(related[0].story.relatedEvents.some((item)=>item.eventId==="e2"),"RELATED_CONSERVATIVE_MATCH");
assert(!related[0].story.relatedEvents.some((item)=>item.eventId==="e3"),"RELATED_UNRELATED_EXCLUDED");
console.log(JSON.stringify({task:"EVENT-STORY-READ-MODEL-003",version:story.version,latest:story.latest?.reportId,latestReport:story.latestReport?.reportId,timeline:story.reportTimeline.length,heatPoints:story.heatSeries.points.length,status:"PASS"},null,2));
