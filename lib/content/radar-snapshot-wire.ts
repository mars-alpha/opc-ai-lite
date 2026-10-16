type RadarWireItem = { eventId: string; curation: object };

export function compactRadarSnapshotWire<S extends { items: RadarWireItem[]; featured: RadarWireItem[]; currentHot: RadarWireItem[] }>(snapshot: S) {
  const { featured, currentHot, ...base } = snapshot;
  return {
    ...base,
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
