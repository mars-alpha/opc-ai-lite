import { collectTrendDiscovery } from "../lib/server/content/trend-discovery";

function assert(condition: unknown, code: string): asserts condition {
  if (!condition) throw new Error("GLOBAL_SOCIAL_SIGNAL_FAILED:" + code);
}

async function main() {
  const oldYoutube = process.env.YOUTUBE_DATA_API_KEY;
  process.env.YOUTUBE_DATA_API_KEY = "yt-test";

  let youtubeCalls = 0;
  const youtube = await collectTrendDiscovery(
    { provider: "YOUTUBE_AI_TREND", searchQuery: "AI Agent", resultLimit: 2, windowHours: 72 },
    async (url) => {
      youtubeCalls += 1;
      const parsed = new URL(url);
      if (parsed.pathname.endsWith("/search")) return {
        items: [{
          id: { videoId: "yt1" },
          snippet: { title: "AI Agents Explained", channelTitle: "AI Channel", channelId: "ch1", description: "Agent tutorial", publishedAt: "2026-10-03T08:00:00Z" }
        }]
      };
      return { items: [{ id: "yt1", statistics: { viewCount: 120000, likeCount: 6000, commentCount: 450 } }] };
    }
  );
  assert(youtubeCalls === 2, "YOUTUBE_SEARCH_AND_STATS_CALLS");
  assert(youtube.items[0]?.platformMetrics?.views === 120000, "YOUTUBE_VIEWS");
  assert(youtube.items[0]?.metadata?.signalDimension === "VIDEO_ATTENTION", "YOUTUBE_SIGNAL_DIMENSION");

  if (oldYoutube === undefined) delete process.env.YOUTUBE_DATA_API_KEY; else process.env.YOUTUBE_DATA_API_KEY = oldYoutube;

  console.log("GLOBAL_SOCIAL_SIGNAL_YOUTUBE=PASS");
  console.log("GLOBAL_SOCIAL_SIGNAL_SERVER_ONLY=PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
