type RadarWireItem = { eventId: string; curation: object };

const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
function without(value: Record<string, unknown>, keys: string[]) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
}
function publicPresentation(value: unknown) {
  if (!object(value)) return value;
  // All text consumed by the approved UI remains unchanged. Raw material and
  // duplicated source text remain in the server snapshot and audit records.
  return without(value, ['originalTitle', 'originalSummary', 'originalUrl', 'eventTitle', 'eventSummary', 'fullTextZh', 'extractedFact']);
}
function publicReport(value: unknown) {
  if (!object(value)) return value;
  return without(value, ['excerpt', 'excerptZh']);
}
function publicRadarItem<T extends RadarWireItem>(item: T): T {
  const row = item as T & Record<string, unknown>;
  const projected = without(row, ['heatShadow', 'scores', 'boleCuration', 'sourceManagedExpansionRuntime', 'practiceDiscovery', 'structure', 'aiPracticeEvidenceLinks', 'aiPracticeParticipants']);
  if (object(row.presentation)) projected.presentation = publicPresentation(row.presentation);
  if (Array.isArray(row.evidenceLinks)) projected.evidenceLinks = row.evidenceLinks.map(link => {
    if (!object(link)) return link;
    const projectedLink = without(link, ['rawMetadata', 'sourceMetadata']);
    if (object(link.presentation)) projectedLink.presentation = publicPresentation(link.presentation);
    return projectedLink;
  });
  if (object(row.story)) {
    projected.story = { ...row.story,
      ...(Array.isArray(row.story.reportTimeline) ? { reportTimeline: row.story.reportTimeline.map(publicReport) } : {}),
      ...(object(row.story.latestReport) ? { latestReport: publicReport(row.story.latestReport) } : {}) };
  }
  return projected as T;
}

/** List transport keeps search text and citations; full stories are read on expand. */
export function radarListingItem<T extends RadarWireItem>(item:T):T {
  const row=publicRadarItem(item) as T & Record<string,unknown>;
  const projected=without(row,['story','coverage','opcValue','leadTime','generationReadiness','hotParticipants','practicalEvidenceLinks','contentBoundary']);
  if(object(row.story)&&object(row.story.latest)) projected.latestProgressPreview=String(row.story.latest.text??'').slice(0,101);
  if(object(row.presentation)) projected.presentation={
    ...without(row.presentation,['contentDelivery','eventExpression','fallback']),
    displaySummaryZh:typeof row.presentation.displaySummaryZh==='string'?row.presentation.displaySummaryZh.slice(0,101):row.presentation.displaySummaryZh
  };
  if(Array.isArray(row.evidenceLinks)) projected.evidenceLinks=row.evidenceLinks.map(link=>object(link)?{
    ...without(link,['presentation']),...(object(link.presentation)?{presentation:{displayTitleZh:link.presentation.displayTitleZh}}:{})
  }:link);
  return projected as T;
}

export function compactRadarSnapshotWire<S extends { items: RadarWireItem[]; featured: RadarWireItem[]; currentHot: RadarWireItem[] }>(snapshot: S, listing=false) {
  const { featured, currentHot, ...base } = snapshot;
  return {
    ...base,
    items: snapshot.items.map(listing?radarListingItem:publicRadarItem) as S['items'],
    wireSchema: "radar-snapshot-wire-v1" as const,
    featuredRefs: featured.map((item) => ({ eventId: item.eventId, curation: item.curation as S["featured"][number]["curation"] })),
    currentHotIds: currentHot.map((item) => item.eventId)
  };
}

export function expandRadarSnapshotWire<T extends RadarWireItem>(payload: {
  items: T[];
  wireSchema?: string;
  featuredRefs?: Array<{ eventId: string; curation: T["curation"] }>;
  currentHotIds?: string[];
  featured?: T[];
  currentHot?: T[];
}) {
  if (payload.wireSchema !== "radar-snapshot-wire-v1") {
    return { featured: payload.featured ?? [], currentHot: payload.currentHot ?? [] };
  }
  if (!Array.isArray(payload.featuredRefs) || !Array.isArray(payload.currentHotIds)) {
    throw new Error("RADAR_SNAPSHOT_WIRE_INVALID");
  }
  const byId = new Map(payload.items.map((item) => [item.eventId, item]));
  const requireItem = (eventId: string) => {
    const item = byId.get(eventId);
    if (!item) throw new Error("RADAR_SNAPSHOT_WIRE_EVENT_MISSING");
    return item;
  };
  return {
    featured: payload.featuredRefs.map((ref) => ({ ...requireItem(ref.eventId), curation: ref.curation })),
    currentHot: payload.currentHotIds.map(requireItem)
  };
}
