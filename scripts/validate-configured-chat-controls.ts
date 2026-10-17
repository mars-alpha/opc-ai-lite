import assert from "node:assert/strict";
import {callConfiguredChatJson,readChatUsage} from "../lib/server/ai/configured-chat";
async function main(){
 let sent:Record<string,unknown>={};
 const result=await callConfiguredChatJson({systemPrompt:"fixture",userPayload:{},temperature:0,...{maxOutputTokens:800,thinking:"disabled" as const}},{config:{baseUrl:"https://model.invalid",apiKey:"fixture",model:"fixture",provider:"fixture",...{thinkingControl:"enable_thinking" as const}},fetchImpl:async(_url,init)=>{sent=JSON.parse(String(init?.body));return Response.json({choices:[{message:{content:'{"ok":true}'}}],usage:{prompt_tokens:12,completion_tokens:5,total_tokens:17,completion_tokens_details:{reasoning_tokens:0}}});}});
 assert.equal(sent.max_tokens,800,"EXPLICIT_OUTPUT_LIMIT_REACHES_GATEWAY");assert.equal(sent.enable_thinking,false);
 assert.equal((result as any).usage.totalTokens,17);assert.equal((result as any).usage.reasoningTokens,0);
 const config={baseUrl:"https://model.invalid",apiKey:"fixture",model:"fixture",provider:"fixture"};
 const legacy=await callConfiguredChatJson({systemPrompt:"fixture",userPayload:{}},{config,fetchImpl:async(_url,init)=>{const body=JSON.parse(String(init?.body));assert.equal(body.temperature,0.1);assert.equal("max_tokens" in body,false);assert.equal("enable_thinking" in body,false);return Response.json({choices:[{message:{content:'{"ok":true}'}}]});}});assert.equal(legacy.usage.status,"UNKNOWN");assert.equal(legacy.usage.totalTokens,null);
 let reported=0;await assert.rejects(callConfiguredChatJson({systemPrompt:"fixture",userPayload:{}},{config,onUsage:async u=>{reported++;assert.equal(u.totalTokens,17);},fetchImpl:async()=>Response.json({choices:[{message:{content:"invalid"}}],usage:{total_tokens:17}})}),/AI_ANALYSIS_INVALID_JSON/);assert.equal(reported,1,"USAGE_DELIVERED_BEFORE_JSON_VALIDATION");
 await assert.rejects(callConfiguredChatJson({systemPrompt:"fixture",userPayload:{},thinking:"disabled"},{config,fetchImpl:async()=>{throw new Error("MUST_NOT_CALL");}}),/AI_THINKING_CONTROL_UNCONFIGURED/);
 assert.equal(readChatUsage({prompt_tokens:-1,total_tokens:"123"}).status,"UNKNOWN");assert.equal(readChatUsage({prompt_tokens:0}).inputTokens,0);
 console.log("CONFIGURED_CHAT_CONTROLS=PASS");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
