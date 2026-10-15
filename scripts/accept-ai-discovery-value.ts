import { filterDiscoveryCandidates, type DiscoveryCandidate } from "../lib/server/content/discovery-filter";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("AI_DISCOVERY_VALUE_ACCEPT_FAILED:" + code);
}

async function decide(candidate: DiscoveryCandidate) {
  const result = await filterDiscoveryCandidates([candidate], {
    now: new Date("2026-10-09T00:00:00.000Z"),
    windowHours: 72,
    sourceName: "TechCrunch · AI",
    sourcePlatform: "WEB",
    sourceMethod: "RSS",
    sourceType: "MEDIA",
    requireExplicitAiRelation: true
  });
  return result.decisions[0];
}

async function main() {
  const recent = "2026-10-08T18:00:00.000Z";

  const lowValue = [
    {
      code: "CELEBRITY_VIRAL_PROFILE",
      candidate: {
        title: "Ben Affleck is an AI nerd, and the internet is impressed",
        excerpt: "Ben Affleck is going viral for his deep knowledge of AI, from neural networks and transformers to open weights. The actor is proving he's more than just a Hollywood star.",
        originalUrl: "https://techcrunch.com/example/ben-affleck-ai",
        publishedAt: recent
      }
    },
    {
      code: "CONFERENCE_PROMOTION",
      candidate: {
        title: "Hear from energy execs on where the AI infrastructure boom is creating opportunity at TechCrunch Disrupt 2026",
        excerpt: "Join the Smart Systems Stage at TechCrunch Disrupt. Register now to save up to $100. Grab a second pass to save 50%.",
        originalUrl: "https://techcrunch.com/example/disrupt-ai-infrastructure",
        publishedAt: recent
      }
    }
  ] satisfies Array<{ code: string; candidate: DiscoveryCandidate }>;

  for (const item of lowValue) {
    const decision = await decide(item.candidate);
    assert(decision?.keep === false, item.code + "_NOT_DROPPED");
    assert(
      decision?.reason === "LOW_VALUE_ENTERTAINMENT" || decision?.reason === "LOW_VALUE_PROMOTION",
      item.code + "_WRONG_REASON"
    );
  }

  const keepContext = [
    {
      code: "OPENAI_REVENUE",
      candidate: {
        title: "OpenAI’s revenue is reportedly $20 billion less than previously projected",
        excerpt: "It had previously been reported that the AI lab's annualized revenue was some $70 billion, but a new report claims it's a whole lot less than that.",
        originalUrl: "https://techcrunch.com/example/openai-revenue",
        publishedAt: recent
      }
    },
    {
      code: "GEMINI_ENTERPRISE_AGENT",
      candidate: {
        title: "Google brings agentic AI to Gemini, starting with businesses",
        excerpt: "Google is turning Gemini into an AI agent that can plan, execute tasks, and work across business apps and systems.",
        originalUrl: "https://techcrunch.com/example/gemini-business",
        publishedAt: recent
      }
    },
    {
      code: "CHATGPT_TEEN_SAFETY",
      candidate: {
        title: "ChatGPT for Teens keeps teens talking, even during mental health crises",
        excerpt: "Testing found the chatbot continues encouraging engagement during crises and potentially encourages unhealthy relationships with the AI itself.",
        originalUrl: "https://techcrunch.com/example/chatgpt-teens",
        publishedAt: recent
      }
    }
  ] satisfies Array<{ code: string; candidate: DiscoveryCandidate }>;

  for (const item of keepContext) {
    const decision = await decide(item.candidate);
    assert(decision?.keep === true, item.code + "_REGRESSED");
  }

  const signalPromoLike = await filterDiscoveryCandidates([{
    title: "AI conference notes: Opus 5.5 benchmark discussion",
    excerpt: "Community members discuss the model after a conference session.",
    originalUrl: "https://news.ycombinator.com/item?id=value-guard",
    publishedAt: recent
  }], {
    now: new Date("2026-10-09T00:00:00.000Z"),
    windowHours: 72,
    sourcePlatform: "HACKER_NEWS",
    sourceMethod: "TREND",
    sourceType: "DEVELOPER",
    requireExplicitAiRelation: true
  });
  assert(signalPromoLike.decisions[0]?.keep === true, "NON_MEDIA_PROMO_RULE_LEAKED");

  console.log("AI_DISCOVERY_VALUE_LOW_VALUE_PROMOTION=PASS");
  console.log("AI_DISCOVERY_VALUE_ENTERTAINMENT_PROFILE=PASS");
  console.log("AI_DISCOVERY_VALUE_CONTEXT_RECALL_GUARD=PASS");
  console.log("AI_DISCOVERY_VALUE_MEDIA_SCOPE_GUARD=PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});