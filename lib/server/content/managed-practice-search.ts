import "server-only";
import { eq } from "drizzle-orm";
import type { AuthUser } from "../auth/service";
import { getDatabase } from "../db";
import { contentSources } from "../db/schema";
import { collectEventExpansionSearch } from "./collection-expansion";
import { fetchPublicJson } from "./collection-runner";
import { recordContentAudit } from "./workbench";
import { ingestRawItem } from "./discovery";
import {evaluatePublicPracticeAccess} from "./public-practice-access";

export async function registerManagedPracticeSearch(user:AuthUser, provider:"YOUTUBE_SEARCH"|"BILIBILI_SEARCH") {
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  if (!["YOUTUBE_SEARCH","BILIBILI_SEARCH"].includes(provider)) throw new Error("MANAGED_SEARCH_PROVIDER_INVALID");
  const platform = provider === "YOUTUBE_SEARCH" ? "YOUTUBE" : "BILIBILI";
  const query = platform === "YOUTUBE" ? "ComfyUI image to video tutorial workflow" : "ComfyUI 图生视频 教程 工作流";
  // Registration requires a fresh server-side sample; configuration alone grants no readiness.
  const probe = await collectEventExpansionSearch(provider,query,168,5,{fetchJson:fetchPublicJson});
  if (!probe.items.length) throw new Error("MANAGED_SEARCH_PROBE_EMPTY");
  const id = "source_operator_practice_" + platform.toLowerCase();
  const db = getDatabase();
  const source = await db.transaction(async tx => {
    const [existing] = await tx.select().from(contentSources).where(eq(contentSources.id,id)).for("update");
    if (existing && (!existing.enabled || existing.status !== "ACTIVE")) throw new Error("MANAGED_SEARCH_REQUIRES_OPERATOR_RESTORE");
    if (existing) return existing;
    const values = {
      id,name:platform + " · 实践定向搜索",platform,providerRef:provider,
      canonicalUrl:platform === "YOUTUBE" ? "https://www.youtube.com/results" : "https://search.bilibili.com/all",
      sourceType:"MANAGED_SOURCE",collectionMethod:"SEARCH",enabled:true,status:"ACTIVE" as const,
      topics:["ComfyUI","Skill","MCP"],authorityScore:0,
      collectionConfig:{provider,practiceExpansionProvider:provider,practiceExpansionEnabled:true,
        acquisition:{routes:[{id:"practice-search",role:"PRIMARY",kind:"SEARCH_DISCOVERY",costLevel:"MEDIUM"}]}},
      metadata:{currentPortfolio:true,systemManaged:false,referenceOnly:true,sourceUniverseRole:"DISCOVERY_AGGREGATOR",
        sourceRegistry:{owner:"SOURCE_MANAGEMENT",usageMode:"SYSTEM",executionScope:"EVENT_EXPANSION"},
        runtimeQualification:{effectiveQualification:"CONDITIONAL",reason:"BOUNDED_LIVE_SEARCH_PROBE_ONLY",probeSampleCount:probe.items.length,probedAt:new Date().toISOString(),liveRunCount:0}},
      signalConfig:{signalOnly:true}
    };
    const [created] = await tx.insert(contentSources).values(values).returning();
    await recordContentAudit(user,{action:"MANAGED_PRACTICE_SEARCH_REGISTERED",entityType:"CONTENT_SOURCE",entityId:id,after:values},tx);
    return created;
  });
  let ingested = 0;
  for (const item of probe.items) {
    if (!evaluatePublicPracticeAccess(item).eligible) continue;
    await ingestRawItem({...item,sourceId:source.id,platform,
      metadata:{...item.metadata,referenceOnly:true,practiceDiscovery:{status:"PENDING_SOURCE_REVIEW",query,provider,observedAt:new Date().toISOString(),bodyStatus:"DESCRIPTION_ONLY"}}});
    ingested++;
  }
  return {sourceId:source.id,provider,ingested,qualification:"CONDITIONAL",items:probe.items};
}
