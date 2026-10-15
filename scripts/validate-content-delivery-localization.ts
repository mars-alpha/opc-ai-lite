import { compactAnswerFirstSummary, localizationIdentityGuard } from "../lib/server/content/review-localization";

function assert(value: unknown, code: string): asserts value { if (!value) throw new Error(code); }
const guarded = localizationIdentityGuard({ sourceTitle:"Anthropic releases Claude update", sourceExcerpt:"Claude gains a new coding feature.", titleZh:"OpenAI 发布 Claude 更新", excerptZh:"Claude 获得新的编码功能。" });
assert(!guarded.pass && guarded.unsupportedTitleEntityIds.length > 0, "IDENTITY_GUARD_SHOULD_BLOCK_ADDED_COMPANY");
const pass = localizationIdentityGuard({ sourceTitle:"Anthropic releases Claude update", sourceExcerpt:"Claude gains a new coding feature.", titleZh:"Anthropic 发布 Claude 更新", excerptZh:"Claude 获得新的编码功能。" });
assert(pass.pass, "IDENTITY_GUARD_VALID_COPY");
const compact = compactAnswerFirstSummary("这是第一句直接说明结果。第二句补充关键限制。第三句继续补充背景。第四句是冗余内容。".repeat(4), 90);
assert(compact.length <= 90, "ANSWER_FIRST_SUMMARY_LENGTH");
console.log(JSON.stringify({task:"CONTENT-DELIVERY-LOCALIZATION",status:"PASS",blocked:guarded.unsupportedTitleEntityIds},null,2));
