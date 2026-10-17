type RadarItem = { eventId: string; curation: Record<string, unknown> };
type FullSnapshot<I extends RadarItem> = {
  items: I[];
  featured: I[];
  currentHot: I[];
};

type StoredSnapshot<I extends RadarItem, S extends FullSnapshot<I>> = Omit<S, "featured" | "currentHot"> & {
  featured: Array<{ eventId: string; featuredRank: number }>;
  currentHot: string[];
};

// The full event exists once in items. Lists with alternate ordering only store references.
// The admin API expands this format before applying live Event operations.
export function compactRadarSnapshot<I extends RadarItem, S extends FullSnapshot<I>>(snapshot: S): StoredSnapshot<I, S> {
  return {
    ...snapshot,
    featured: snapshot.featured.map((item) => ({ eventId: item.eventId, featuredRank: Number(item.curation.featuredRank) })),
    currentHot: snapshot.currentHot.map((item) => item.eventId)
  };
}

export function expandRadarSnapshot<I extends RadarItem, S extends FullSnapshot<I>>(stored: StoredSnapshot<I, S>): S {
  const byId = new Map(stored.items.map((item) => [item.eventId, item]));
  const requireItem = (id: string) => {
    const item = byId.get(id);
    if (!item) throw new Error("RADAR_SNAPSHOT_ORPHAN_REFERENCE");
    return item;
  };
  return {
    ...stored,
    featured: stored.featured.map(({ eventId, featuredRank }) => {
      const item = requireItem(eventId);
      return { ...item, curation: { ...item.curation, featuredRank, rerankAuthority: "PRESENTATION_ONLY" } } as I;
    }),
    currentHot: stored.currentHot.map(requireItem)
  } as S;
}
