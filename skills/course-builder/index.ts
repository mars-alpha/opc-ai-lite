import { COURSE_BUILDER_SKILL_V1 } from "./v1";

export const CURRENT_COURSE_BUILDER_SKILL = COURSE_BUILDER_SKILL_V1;

export const COURSE_BUILDER_SKILL_REGISTRY = {
  current: CURRENT_COURSE_BUILDER_SKILL,
  historicalVersions: ["0.1.0", "0.2.0"] as const
} as const;
