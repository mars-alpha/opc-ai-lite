export const FORMAL_RUNTIME_COURSE_SLUGS = ["foundation-ai", "ai-work", "ai-growth", "ai-workflow", "fde"] as const;
export const LEGACY_STATIC_COURSE_SLUGS = [
  "ai-literacy",
  "chatgpt-worker"
] as const;

const formalRuntimeCourseSlugs = new Set<string>(FORMAL_RUNTIME_COURSE_SLUGS);
const legacyStaticCourseSlugs = new Set<string>(LEGACY_STATIC_COURSE_SLUGS);

export function isFormalRuntimeCourse(courseSlug: string) {
  return formalRuntimeCourseSlugs.has(courseSlug);
}

export function isLegacyStaticCourse(courseSlug: string) {
  return legacyStaticCourseSlugs.has(courseSlug);
}
