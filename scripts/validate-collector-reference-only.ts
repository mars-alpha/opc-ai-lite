import {
  assertCollectorReferenceOnly,
  COLLECTOR_MEDIA_POLICY
} from "../lib/server/content/discovery-contract";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("COLLECTOR_REFERENCE_ONLY_FAILED:" + code);
}

assert(COLLECTOR_MEDIA_POLICY === "REFERENCE_ONLY", "POLICY_NAME");

assertCollectorReferenceOnly([
  {
    originalUrl: "https://example.com/post",
    title: "Reference only",
    metadata: {
      thumbnailUrl: "https://cdn.example.com/image.jpg",
      videoUrl: "https://cdn.example.com/video.mp4"
    }
  }
]);

for (const item of [
  { metadata: { base64: "data:image/png;base64,AAAA" } },
  { metadata: { localPath: "C:\\temp\\video.mp4" } },
  { metadata: { objectStorageKey: "bucket/video.mp4" } },
  { metadata: { media: { url: "file:///tmp/video.mp4" } } }
]) {
  let blocked = false;
  try {
    assertCollectorReferenceOnly([item]);
  } catch (error) {
    blocked = error instanceof Error && error.message === "COLLECTOR_MEDIA_PERSISTENCE_FORBIDDEN";
  }
  assert(blocked, "PERSISTENCE_OUTPUT_NOT_BLOCKED");
}

console.log("COLLECTOR_REFERENCE_ONLY=PASS");
console.log("COLLECTOR_MEDIA_PERSISTENCE_BLOCKED=PASS");
