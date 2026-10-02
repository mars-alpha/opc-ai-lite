export const FORMAL_RUNTIME_COURSE_SLUGS = ["foundation-ai", "ai-work", "ai-growth", "ai-workflow", "fde"] as const;

const formalRuntimeCourseSlugs = new Set<string>(FORMAL_RUNTIME_COURSE_SLUGS);

export function isFormalRuntimeCourse(courseSlug: string) {
  return formalRuntimeCourseSlugs.has(courseSlug);
}
