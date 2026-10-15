import { localizationDoesNotInventProtectedTokens, titlePreservesArticleActionType } from "../lib/server/content/content-understanding-enrichment";
import { knownEntityIdsInText } from "../lib/server/content/review-localization";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("CONTENT_UNDERSTANDING_VALIDATION_FAILED:" + code);
  console.log(code + "=PASS");
}

assert(localizationDoesNotInventProtectedTokens("GPT-5.6 improves 25%", "GPT-5.6 提升 25%"), "PROTECTED_TOKENS_PRESERVED");
assert(!localizationDoesNotInventProtectedTokens("GPT-5.6 improves 25%", "GPT-5.7 提升 30%"), "INVENTED_VERSION_OR_NUMBER_REJECTED");
assert(titlePreservesArticleActionType("How GPT-5.6 fuses intelligence and efficiency", "GPT-5.6 如何兼顾智能与效率"), "HOW_TITLE_PRESERVED");
assert(!titlePreservesArticleActionType("How GPT-5.6 fuses intelligence and efficiency", "OpenAI 发布 GPT-5.6"), "HOW_TITLE_NOT_REWRITTEN_AS_RELEASE");
assert(titlePreservesArticleActionType("OpenAI releases GPT-5.6 API", "OpenAI 发布 GPT-5.6 API"), "RELEASE_TITLE_ALLOWED");
assert(!knownEntityIdsInText("Anthropic releases model 5.6").includes("company_openai") && knownEntityIdsInText("OpenAI 发布模型 5.6").includes("company_openai"), "COMPANY_NOT_IN_MATERIAL_DETECTED");
console.log("CONTENT_UNDERSTANDING_ENRICHMENT=PASS");
