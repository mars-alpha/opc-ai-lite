import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { getDatabase, closeDatabase } from "../lib/server/db";
import { assertCurrentDatabaseTarget } from "../lib/server/database-target";
import { contentSources, contentRawItems, users, userIdentities } from "../lib/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { registerManagedPracticeSearch } from "../lib/server/content/managed-practice-search";
import { collectEventExpansionSearch, isManagedPracticeSearchReady } from "../lib/server/content/collection-expansion";
import { fetchPublicJson } from "../lib/server/content/collection-runner";
import { isCurrentSystemCollectionSource } from "../lib/server/content/source-portfolio-runtime";

loadEnvConfig(process.cwd());
async function main() {
  assert.equal(assertCurrentDatabaseTarget().environment, "development", "DEVELOPMENT_ONLY");
  const sources = await getDatabase().select().from(contentSources);
  if (process.argv.includes("--verify")) {
    const searchSources = sources.filter(s=>s.id.startsWith("source_operator_practice_"));
    assert.equal(searchSources.length,2);
    assert(searchSources.every(isManagedPracticeSearchReady));
    assert(searchSources.every(s=>!isCurrentSystemCollectionSource(s)));
    const raws = await getDatabase().select().from(contentRawItems).where(inArray(contentRawItems.sourceId,searchSources.map(s=>s.id)));
    assert(raws.length>=1);
    assert(raws.every(r=>typeof (r.metadata as any)?.practiceDiscovery?.status === "string" && (r.metadata as any)?.referenceOnly === true));
    console.log(JSON.stringify({status:"PASS",managedRoutes:searchSources.length,referenceCandidates:raws.length,distinctAuthorNames:new Set(raws.map(r=>r.author)).size,formalCreatorRegistrations:0,aiCalls:0,productionChanged:false}));
    return;
  }
  if (process.argv.includes("--configure")) {
    const [admin] = await getDatabase().select().from(users).where(eq(users.role,"ADMIN")).limit(1);
    assert(admin,"ADMIN_REQUIRED");
    const [identity] = await getDatabase().select().from(userIdentities).where(and(eq(userIdentities.userId,admin.id),eq(userIdentities.provider,"EMAIL"))).limit(1);
    assert(identity,"ADMIN_EMAIL_IDENTITY_REQUIRED");
    for (const provider of ["BILIBILI_SEARCH","YOUTUBE_SEARCH"] as const) {
      const result = await registerManagedPracticeSearch({...admin,email:identity.providerUserId,role:"ADMIN"},provider);
      const {items,...counts}=result;
      console.log(JSON.stringify({...counts,authors:items.map(i=>({name:i.author,url:i.originalUrl,title:i.title}))}));
    }
    return;
  }
  console.log(JSON.stringify({ sources: sources.filter(s => ["YOUTUBE","BILIBILI"].includes(s.platform)).map(s => ({
    id:s.id, name:s.name, platform:s.platform, providerRef:s.providerRef,
    method:s.collectionMethod, enabled:s.enabled,status:s.status,ready:isManagedPracticeSearchReady(s),
    acquisition:(s.collectionConfig as any)?.acquisition,
    qualification:(s.metadata as any)?.runtimeQualification?.effectiveQualification, currentPortfolio:(s.metadata as any)?.currentPortfolio
  })) }));
  if (!process.argv.includes("--probe")) return;
  for (const provider of ["BILIBILI_SEARCH", "YOUTUBE_SEARCH"] as const) {
    try {
      const result = await collectEventExpansionSearch(provider, provider === "YOUTUBE_SEARCH" ? "ComfyUI image to video tutorial workflow" : "ComfyUI 图生视频 教程 工作流", 168, 5, {fetchJson:fetchPublicJson});
      console.log(JSON.stringify({provider,received:result.items.length,items:result.items.map(item => ({title:item.title,url:item.originalUrl,author:item.author,publishedAt:item.publishedAt,excerpt:item.excerpt?.slice(0,300)}))}));
    } catch {
      console.log(JSON.stringify({provider,status:"PROBE_FAILED"}));
    }
  }
}
main().catch(()=> { console.error("MANAGED_PRACTICE_LIVE_FAILED");process.exitCode=1; }).finally(closeDatabase);
