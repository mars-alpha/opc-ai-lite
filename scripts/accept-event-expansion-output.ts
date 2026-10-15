import {
  AI_DAILY_EXPANSION_OUTPUT_SCHEMA_VERSION,
  buildEventExpansionDailyOutput,
  validateEventExpansionDailyOutput
} from "../lib/server/content/event-expansion-output";
import {
  AI_DAILY_EXPANSION_SYNTHESIS_SCHEMA_VERSION,
  validateEventExpansionSynthesis
} from "../lib/server/content/event-expansion-output-synthesis";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("EVENT_EXPANSION_OUTPUT_014_FAILED:" + code);
}

const output = buildEventExpansionDailyOutput({
  eventId: "event-014",
  eventTitle: "OpenAI 发布 ChatGPT 新视觉界面",
  eventSummary: "官方宣布 ChatGPT 更新视觉界面。",
  factEvidence: [
    {
      rawItemId: "fact-official",
      sourceId: "source_openai",
      sourceName: "OpenAI",
      title: "ChatGPT visual interface update",
      excerpt: "OpenAI announced a new visual interface for ChatGPT.",
      originalUrl: "https://openai.com/example",
      publishedAt: "2026-10-09T01:00:00.000Z",
      role: "PRIMARY"
    },
    {
      rawItemId: "fact-media",
      sourceId: "source_media",
      sourceName: "Media",
      title: "ChatGPT interface coverage",
      excerpt: "A media report covering the same interface release.",
      originalUrl: "https://example.org/report",
      publishedAt: "2026-10-09T02:00:00.000Z",
      role: "SUPPORTING"
    }
  ],
  expansionEvidence: [
    {
      rawItemId: "exp-demo",
      sourceId: "source_bilibili",
      sourceName: "B站",
      title: "ChatGPT 新界面上手演示",
      excerpt: "展示新界面的实际操作。",
      originalUrl: "https://www.bilibili.com/video/BVdemo",
      publishedAt: "2026-10-09T03:00:00.000Z",
      expansionType: "DEMO",
      mediaType: "VIDEO",
      language: "ZH",
      rankScore: 96
    },
    {
      rawItemId: "exp-tutorial",
      sourceId: "source_bilibili",
      sourceName: "B站",
      title: "ChatGPT 新界面使用教程",
      excerpt: "逐步说明如何进入和使用。",
      originalUrl: "https://www.bilibili.com/video/BVtutorial",
      publishedAt: "2026-10-09T03:30:00.000Z",
      expansionType: "TUTORIAL",
      mediaType: "VIDEO",
      language: "ZH",
      rankScore: 94
    },
    {
      rawItemId: "exp-use",
      sourceId: "source_youtube",
      sourceName: "YouTube",
      title: "Using the new ChatGPT UI for research",
      excerpt: "A practical research workflow using the interface.",
      originalUrl: "https://youtube.com/watch?v=use",
      publishedAt: "2026-10-09T04:00:00.000Z",
      expansionType: "USE_CASE",
      mediaType: "VIDEO",
      language: "EN_OR_OTHER",
      rankScore: 91
    },
    {
      rawItemId: "exp-work",
      sourceId: "source_media",
      sourceName: "Media",
      title: "新界面对运营工作的帮助",
      excerpt: "讨论运营人员如何缩短资料整理时间。",
      originalUrl: "https://example.org/work",
      publishedAt: "2026-10-09T04:20:00.000Z",
      expansionType: "WORK_IMPACT",
      mediaType: "ARTICLE",
      language: "ZH",
      rankScore: 90
    },
    {
      rawItemId: "exp-share",
      sourceId: "source_bilibili",
      sourceName: "B站",
      title: "ChatGPT 新界面一图速览",
      excerpt: "整理值得分享的界面变化。",
      originalUrl: "https://www.bilibili.com/video/BVshare",
      publishedAt: "2026-10-09T05:00:00.000Z",
      expansionType: "SHAREABLE",
      mediaType: "VIDEO",
      language: "ZH",
      rankScore: 89
    },
    {
      rawItemId: "exp-discussion",
      sourceId: "source_x",
      sourceName: "X",
      title: "Community discussion about the new interface",
      excerpt: "Mixed reactions from users.",
      originalUrl: "https://x.com/example/status/1",
      publishedAt: "2026-10-09T05:10:00.000Z",
      expansionType: "DISCUSSION",
      mediaType: "POST",
      language: "EN_OR_OTHER",
      rankScore: 88
    }
  ]
});

assert(output.schemaVersion === AI_DAILY_EXPANSION_OUTPUT_SCHEMA_VERSION, "SCHEMA_VERSION");
assert(output.sections.map((item) => item.key).join(",") ===
  "WHAT_HAPPENED,HOW_TO_EXPERIENCE,HOW_TO_LEARN,HOW_TO_USE,WORK_IMPACT,WHY_SHARE", "SECTION_ORDER");

const byKey = new Map(output.sections.map((item) => [item.key, item]));
assert(byKey.get("WHAT_HAPPENED")?.items.every((item) => item.authority === "FACT"), "FACT_SECTION_AUTHORITY");
assert(byKey.get("HOW_TO_EXPERIENCE")?.items[0]?.rawItemId === "exp-demo", "DEMO_MAPPING");
assert(byKey.get("HOW_TO_LEARN")?.items[0]?.rawItemId === "exp-tutorial", "TUTORIAL_MAPPING");
assert(byKey.get("HOW_TO_USE")?.items[0]?.rawItemId === "exp-use", "USE_CASE_MAPPING");
assert(byKey.get("WORK_IMPACT")?.items[0]?.rawItemId === "exp-work", "WORK_IMPACT_MAPPING");
assert(byKey.get("WHY_SHARE")?.items[0]?.rawItemId === "exp-share", "SHAREABLE_MAPPING");
assert(!JSON.stringify(output).includes("exp-discussion"), "DISCUSSION_MUST_NOT_BECOME_SHARE_REASON");
assert(output.unmappedExpansionEvidenceCount === 1, "UNMAPPED_DISCUSSION_COUNT");
assert(output.sections.filter((item) => item.key !== "WHAT_HAPPENED")
  .flatMap((item) => item.items)
  .every((item) => item.authority === "REFERENCE_ONLY"), "EXPANSION_REFERENCE_ONLY");

const validated = validateEventExpansionDailyOutput(output);
assert(validated.eventId === "event-014", "VALID_OUTPUT_REJECTED");

const zero = buildEventExpansionDailyOutput({
  eventId: "event-zero",
  eventTitle: "只有官方事实，没有扩展资料",
  eventSummary: null,
  factEvidence: [{
    rawItemId: "fact-zero",
    sourceId: "source_official",
    title: "Official event",
    excerpt: null,
    originalUrl: "https://example.com/official",
    publishedAt: null,
    role: "PRIMARY"
  }],
  expansionEvidence: []
});
assert(zero.sections.filter((item) => item.key !== "WHAT_HAPPENED").every((item) => item.status === "EMPTY"), "ZERO_EVIDENCE_ALLOWED");
assert(zero.missingSectionKeys.length === 5, "ZERO_EVIDENCE_MISSING_SECTIONS");

let authorityLeakBlocked = false;
try {
  const tampered = structuredClone(output);
  const factSection = tampered.sections.find((item) => item.key === "WHAT_HAPPENED");
  if (factSection) factSection.items[0]!.authority = "REFERENCE_ONLY";
  validateEventExpansionDailyOutput(tampered);
} catch {
  authorityLeakBlocked = true;
}
assert(authorityLeakBlocked, "FACT_AUTHORITY_LEAK_MUST_FAIL");

let duplicateBlocked = false;
try {
  const tampered = structuredClone(output);
  const experience = tampered.sections.find((item) => item.key === "HOW_TO_EXPERIENCE");
  const learn = tampered.sections.find((item) => item.key === "HOW_TO_LEARN");
  if (experience && learn && experience.items[0]) {
    learn.items = [experience.items[0]];
    learn.status = "SUPPORTED";
  }
  validateEventExpansionDailyOutput(tampered);
} catch {
  duplicateBlocked = true;
}
assert(duplicateBlocked, "CROSS_SECTION_DUPLICATE_MUST_FAIL");

let emptyPaddingBlocked = false;
try {
  const tampered = structuredClone(zero);
  const learn = tampered.sections.find((item) => item.key === "HOW_TO_LEARN");
  if (learn) {
    learn.items = [{
      rawItemId: "invented",
      sourceId: "invented",
      sourceName: null,
      title: "AI invented tutorial",
      excerpt: null,
      originalUrl: null,
      publishedAt: null,
      expansionType: "TUTORIAL",
      mediaType: "ARTICLE",
      language: "ZH",
      rankScore: 0,
      authority: "REFERENCE_ONLY"
    }];
    learn.status = "SUPPORTED";
  }
  validateEventExpansionDailyOutput(tampered, {
    allowedFactRawItemIds: ["fact-zero"],
    allowedExpansionRawItemIds: []
  });
} catch {
  emptyPaddingBlocked = true;
}
assert(emptyPaddingBlocked, "INVENTED_EVIDENCE_MUST_FAIL");

const synthesis = validateEventExpansionSynthesis({
  schemaVersion: AI_DAILY_EXPANSION_SYNTHESIS_SCHEMA_VERSION,
  eventId: output.eventId,
  sections: [
    { key: "WHAT_HAPPENED", items: [{ text: "OpenAI 发布 ChatGPT 新视觉界面。", evidenceRawItemIds: ["fact-official"] }] },
    { key: "HOW_TO_EXPERIENCE", items: [{ text: "可以先看新界面的上手演示，确认实际操作方式。", evidenceRawItemIds: ["exp-demo"] }] },
    { key: "HOW_TO_LEARN", items: [{ text: "已有逐步使用教程可供学习。", evidenceRawItemIds: ["exp-tutorial"] }] },
    { key: "HOW_TO_USE", items: [{ text: "可参考研究工作流中的实际用法。", evidenceRawItemIds: ["exp-use"] }] },
    { key: "WORK_IMPACT", items: [{ text: "已有资料讨论它对运营资料整理工作的帮助。", evidenceRawItemIds: ["exp-work"] }] },
    { key: "WHY_SHARE", items: [{ text: "已有速览资料整理了值得分享的界面变化。", evidenceRawItemIds: ["exp-share"] }] }
  ],
  warnings: []
}, output);
assert(synthesis.sections.length === 6, "SYNTHESIS_VALID_OUTPUT_REJECTED");

let unknownCitationBlocked = false;
try {
  validateEventExpansionSynthesis({
    ...synthesis,
    sections: synthesis.sections.map((section) =>
      section.key === "HOW_TO_LEARN"
        ? { ...section, items: [{ text: "虚构教程。", evidenceRawItemIds: ["unknown-raw"] }] }
        : section
    )
  }, output);
} catch {
  unknownCitationBlocked = true;
}
assert(unknownCitationBlocked, "SYNTHESIS_UNKNOWN_CITATION_MUST_FAIL");

let emptySectionHallucinationBlocked = false;
try {
  validateEventExpansionSynthesis({
    schemaVersion: AI_DAILY_EXPANSION_SYNTHESIS_SCHEMA_VERSION,
    eventId: zero.eventId,
    sections: zero.sections.map((section) => ({
      key: section.key,
      items: section.key === "HOW_TO_LEARN"
        ? [{ text: "AI 自己补了一条教程。", evidenceRawItemIds: ["fact-zero"] }]
        : []
    })),
    warnings: []
  }, zero);
} catch {
  emptySectionHallucinationBlocked = true;
}
assert(emptySectionHallucinationBlocked, "SYNTHESIS_EMPTY_SECTION_MUST_STAY_EMPTY");

let inventedNumberBlocked = false;
try {
  validateEventExpansionSynthesis({
    ...synthesis,
    sections: synthesis.sections.map((section) =>
      section.key === "WORK_IMPACT"
        ? { ...section, items: [{ text: "可以让运营效率提升 95%。", evidenceRawItemIds: ["exp-work"] }] }
        : section
    )
  }, output);
} catch {
  inventedNumberBlocked = true;
}
assert(inventedNumberBlocked, "SYNTHESIS_INVENTED_NUMBER_MUST_FAIL");

let multiItemSectionBlocked = false;
try {
  validateEventExpansionSynthesis({
    ...synthesis,
    sections: synthesis.sections.map((section) =>
      section.key === "WHAT_HAPPENED"
        ? {
            ...section,
            items: [
              { text: "第一条表达。", evidenceRawItemIds: ["fact-official"] },
              { text: "第二条重复表达。", evidenceRawItemIds: ["fact-media"] }
            ]
          }
        : section
    )
  }, output);
} catch {
  multiItemSectionBlocked = true;
}
assert(multiItemSectionBlocked, "SYNTHESIS_ONE_ITEM_PER_SECTION_REQUIRED");

console.log("EVENT_EXPANSION_OUTPUT_014_SYNTHESIS_VALIDATOR=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_NUMERIC_GUARD=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_CONTRACT=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_MAPPING=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_REFERENCE_ONLY=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_ZERO_EVIDENCE=PASS");
console.log("EVENT_EXPANSION_OUTPUT_014_FALSE_POSITIVE_GUARDS=PASS");
