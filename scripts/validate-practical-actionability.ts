import { evaluatePracticalEvidenceActionability, isFormalPracticalEvidenceSource, evaluatePracticeSubject, isMultiNewsRoundup, shouldExpandPractice } from "../lib/server/content/practical-evidence-actionability";

function assert(condition: unknown, code: string): asserts condition { if (!condition) throw new Error(code); }
assert(isMultiNewsRoundup("OpenAI发布新模型；Google上线新搜索"), "TWO_UNRELATED_NEWS_EXCLUDED");
assert(isMultiNewsRoundup("OpenAI releases model|Google launches search"), "UNSPACED_PIPE_DIGEST_EXCLUDED");
assert(!isMultiNewsRoundup("OpenAI发布新模型；OpenAI宣布该模型价格"), "SAME_SUBJECT_UPDATE_NOT_DIGEST");
assert(!isMultiNewsRoundup("OpenAI发布新模型；该模型上线API"), "REFERENTIAL_FOLLOWUP_NOT_DIGEST");
assert(!isMultiNewsRoundup("如何用ComfyUI搭建工作流；上线并发布自己的应用"), "PRACTICE_STEPS_NOT_DIGEST");
assert(isMultiNewsRoundup("腾讯上线「绿泡泡」短剧，主打免费看；特斯拉 Roadster 跑车明日发布；豆包工作支持一键导入 GPT、Claude 对话 | 极客早知道"), "ROUNDUP_EXCLUDED");
assert(!isMultiNewsRoundup("ComfyUI教程：安装、配置与运行图生动画工作流"), "SINGLE_TUTORIAL_NOT_ROUNDUP");
assert(!isMultiNewsRoundup("如何搭建AI早报工作流：配置来源并生成日报"), "DIGEST_BUILDING_TUTORIAL_NOT_NEWS_DIGEST");
assert(!isMultiNewsRoundup("OpenAI发布新模型，支持代码与图像"), "SINGLE_RELEASE_NOT_ROUNDUP");
assert(!evaluatePracticeSubject({ title:"新模型发布", excerpt:"支持工作流、代码调用，性能提升30%" }).eligible, "RELEASE_NOT_PRACTICE_SUBJECT");
assert(!evaluatePracticeSubject({ title:"新模型发布：如何用新功能生成视频", excerpt:"输入图片即可生成视频。" }).eligible, "RELEASE_WITH_HOW_TO_TEASER_NOT_PRACTICE");
assert(evaluatePracticeSubject({ title:"如何用 ComfyUI 工作流制作图生动画", excerpt:"安装节点，配置输入图片，运行工作流并导出动画。" }).eligible, "CONCRETE_WORKFLOW_SUBJECT");
assert(!evaluatePracticeSubject({ title:"MCP改变办公效率", excerpt:"帮助团队完成工作，表现优秀。" }).eligible, "GENERIC_CLAIM_NOT_PRACTICE");
assert(shouldExpandPractice({ title:"如何用 ComfyUI 工作流制作图生动画", excerpt:"安装节点，配置输入图片并导出。", independentParticipants:2, lastAttemptAt:null }).eligible, "PRACTICE_EXPANSION_TRIGGER");
assert(!shouldExpandPractice({ title:"如何用 ComfyUI 工作流制作图生动画", excerpt:"安装节点并导出。", independentParticipants:1, lastAttemptAt:null }).eligible, "REPOST_NOT_MULTIPLE_ORIGINS");
assert(!shouldExpandPractice({ title:"如何用 ComfyUI 工作流制作图生动画", excerpt:"安装节点并导出。", independentParticipants:2, lastAttemptAt:new Date().toISOString() }).eligible, "SEARCH_COOLDOWN");
assert(evaluatePracticalEvidenceActionability({ expansionType:"TUTORIAL", title:"Deploy an agent", excerpt:"Step-by-step setup, configure the API and run the command." }).actionable, "TUTORIAL_ACTIONABLE");
assert(evaluatePracticalEvidenceActionability({ expansionType:"EXPERIENCE", title:"Hands-on test", excerpt:"We tested the model on 100 tasks and measured 22% lower latency." }).actionable, "EXPERIENCE_ACTIONABLE");
assert(evaluatePracticalEvidenceActionability({ expansionType:"USE_CASE", title:"AI workflow", excerpt:"Use the agent to automate invoice review; the workflow reduced processing time by 30%." }).actionable, "USE_CASE_ACTIONABLE");
assert(!evaluatePracticalEvidenceActionability({ expansionType:"EXPERIENCE", title:"New model announced", excerpt:"The company announced a new model." }).actionable, "NEWS_NOT_ACTIONABLE");
assert(!evaluatePracticalEvidenceActionability({expansionType:"TUTORIAL",title:"ComfyUI教程：配置工作流导出动画",excerpt:"关注后私信获取工作流及完整步骤"}).actionable,"FOLLOW_GATED_TUTORIAL_NOT_ACTIONABLE");
assert(isFormalPracticalEvidenceSource({ sourceEnabled:true, currentPortfolio:true, sourceUniverseRole:"OFFICIAL", sourceReferenceOnly:false, rawReferenceOnly:false, signalOnly:false }), "CURRENT_SOURCE_ELIGIBLE");
assert(!isFormalPracticalEvidenceSource({ sourceEnabled:false, currentPortfolio:false, sourceUniverseRole:"CREATOR", sourceReferenceOnly:true, rawReferenceOnly:true, signalOnly:true }), "RETIRED_SOURCE_REJECTED");
assert(isFormalPracticalEvidenceSource({ sourceEnabled:true, currentPortfolio:true, sourceUniverseRole:"CREATOR", sourceReferenceOnly:true, rawReferenceOnly:true, signalOnly:true }), "CURRENT_CREATOR_REFERENCE_EVIDENCE_ELIGIBLE");
assert(!isFormalPracticalEvidenceSource({ sourceEnabled:true, currentPortfolio:true, sourceUniverseRole:"DISCOVERY_AGGREGATOR", sourceReferenceOnly:true, rawReferenceOnly:false, signalOnly:true }), "DISCOVERY_AGGREGATOR_REJECTED");
console.log(JSON.stringify({task:"PRACTICAL-ACTIONABILITY",status:"PASS"},null,2));
