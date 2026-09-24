"use client";

import { useEffect } from "react";
import type { LearningTrackSlug } from "../lib/learning/track-catalog";

export function LearningTrackPreference({ track }: { track: LearningTrackSlug }) {
  useEffect(() => {
    document.cookie =
      "opc_learning_track=" + encodeURIComponent(track) + "; Path=/; Max-Age=31536000; SameSite=Lax";
  }, [track]);

  return null;
}
