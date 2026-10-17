import assert from "node:assert/strict";
import {evaluatePublicPracticeAccess,evaluateCreatorRegistration} from "../lib/server/content/public-practice-access";
import {resolveSourceAcquisitionPlan} from "../lib/server/content/source-acquisition-plan";
for(const excerpt of ["关注后私信获取工作流","三连关注后私信获取嗷","私信发送【教程】领取资料","sign in to download"]) assert(!evaluatePublicPracticeAccess({excerpt}).eligible,excerpt);
for(const excerpt of ["感谢点赞，公开工作流直接下载","无需关注，公开完整步骤与配置","教程如何登录自己的飞书账户","Follow the steps to get the workflow running"]) assert(evaluatePublicPracticeAccess({excerpt}).eligible,excerpt);
assert(!evaluateCreatorRegistration({serverRouteVerified:true,historySamples:5,originality:"SELF_DECLARED",completeMaterials:true,accessEligible:true}).eligible,"UPLOADER_COPYRIGHT_CLAIM_IS_NOT_PROOF");
assert(evaluateCreatorRegistration({serverRouteVerified:true,historySamples:3,originality:"FIRST_PARTY_ATTRIBUTED",completeMaterials:true,accessEligible:true}).eligible);
const plan=resolveSourceAcquisitionPlan({collectionMethod:"RSS",platform:"WEB",collectionConfig:{acquisition:{routes:[{kind:"RSS_ATOM",requiresLogin:true}]}}});
assert(!plan.routes.some(r=>r.enabled&&r.serverRuntimeSupported),"LOGIN_FLAG_MUST_DISABLE_ROUTE");
const legacy=resolveSourceAcquisitionPlan({collectionMethod:"RSS",platform:"WEB",collectionConfig:{acquisition:{kind:"RSS_ATOM",requiresFollow:true}}});
assert(!legacy.serverRuntimeSupported,"LEGACY_KIND_CANNOT_BYPASS_ACCESS_GATE");
assert(!evaluatePublicPracticeAccess({excerpt:'A service API key. The service is in early access; request access and await approval.'}).eligible,'MANDATORY_API_ACCESS_REQUIRES_HUMAN');
assert(evaluatePublicPracticeAccess({excerpt:'Create an API key from the self-service dashboard.\nOptional webinar: request access from the host.'}).eligible,'OPTIONAL_EVENT_DOES_NOT_GATE_MATERIAL');
assert(evaluatePublicPracticeAccess({excerpt:'Optional API key: request access for an extra integration.'}).eligible,'OPTIONAL_DEPENDENCY_IS_NOT_REQUIRED');

for (const excerpt of [
  "Required API key: request access and wait for manual approval. Optional telemetry can be disabled.",
  "Required API key:\nrequest access and wait for manual approval.",
  "Request access and wait for manual approval to obtain the required API key."
]) assert(!evaluatePublicPracticeAccess({excerpt}).eligible, excerpt);
console.log("PUBLIC_PRACTICE_ACCESS=PASS");
