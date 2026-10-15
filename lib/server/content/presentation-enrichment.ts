import "server-only";

import { readReviewLocalization } from "./review-localization";
import { readContentUnderstanding } from "./content-understanding-enrichment";

export const CONTENT_PRESENTATION_ENRICHMENT_VERSION = "content-presentation-enrichment-v3-content-understanding";

type PresentationRaw = {
  title: string;
  excerpt: string | null;
  originalUrl: string | null;
  metadata: unknown;
};

type PresentationInput = {
  eventTitle: string;
  eventSummary: string | null;
  representativeRaw: PresentationRaw;
  whyItMatters?: string | null;
  allowEventSummaryFallback?: boolean;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function buildContentPresentationEnrichment(input: PresentationInput) {
  const localization = readReviewLocalization(input.representativeRaw.metadata);
  const understanding = readContentUnderstanding(input.representativeRaw.metadata);
  const originalTitle = input.representativeRaw.title;
  const originalSummary = input.representativeRaw.excerpt ?? (input.allowEventSummaryFallback === false ? null : input.eventSummary);
  const displayTitleZh = text(understanding?.titleZh) ?? text(localization?.displayTitleZh) ?? originalTitle;
  const displaySummaryZh = text(understanding?.summaryZh) ?? text(localization?.displayExcerptZh) ?? originalSummary;
  const editorialJudgmentZh = text(understanding?.editorialJudgment);
  const whyItMattersZh = text(input.whyItMatters);

  return {
    version: CONTENT_PRESENTATION_ENRICHMENT_VERSION,
    originalTitle,
    originalSummary,
    originalUrl: input.representativeRaw.originalUrl,
    eventTitle: input.eventTitle,
    eventSummary: input.eventSummary,
    displayTitleZh,
    displaySummaryZh,
    whyItMattersZh,
    editorialJudgmentZh,
    itemType: understanding?.itemType ?? null,
    tags: understanding?.tags ?? [],
    extractedFact: understanding?.fact ?? null,
    fullTextZh: understanding?.fullTextZh ?? null,
    fullTextTranslationStatus: understanding?.fullTextTranslationStatus ?? "SOURCE_NOT_AVAILABLE",
    originalLanguage: localization?.originalLanguage ?? "EN_OR_OTHER",
    translationStatus: localization?.translationStatus ?? "UNAVAILABLE",
    contentDelivery: {
      chineseTitle: true as const,
      answerFirstSummary: true as const,
      fullTextTranslation: "WHEN_SOURCE_FULL_TEXT_AVAILABLE" as const,
      factsSeparatedFromWriting: true as const,
      identityGuard: true as const
    },
    fallback: {
      title: displayTitleZh === originalTitle,
      summary: displaySummaryZh === originalSummary,
      whyItMatters: whyItMattersZh === null
    },
    authority: "PRESENTATION_ONLY" as const
  };
}

