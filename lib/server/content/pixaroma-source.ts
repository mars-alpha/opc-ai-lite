import "server-only";
import {and,eq,inArray,sql} from "drizzle-orm";
import type {AuthUser} from "../auth/service";
import {getDatabase} from "../db";
import {contentRawItems,contentSources} from "../db/schema";
import {recordContentAudit} from "./workbench";
import {collectPixaromaPublicWorkflows} from "./public-workflow-materials";
import {SOURCE_ONBOARDING_VERSION} from "./source-onboarding";

export const PIXAROMA_SOURCE_ID="source_operator_creator_pixaroma";
export async function registerPixaromaPublicSource(user:AuthUser){
  if(user.role!=="ADMIN")throw new Error("FORBIDDEN");
  const items=await collectPixaromaPublicWorkflows();
  const verified=items.filter(i=>(i.metadata?.publicMaterials as {status?:string})?.status==="STRUCTURE_VERIFIED_NOT_EXECUTED");
  if(verified.length<3)throw new Error("PIXAROMA_THREE_MATERIAL_SAMPLES_REQUIRED");
  const db=getDatabase();
  const source=await db.transaction(async tx=>{
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('creator:pixaroma'))`);
    const rows=await tx.select().from(contentSources);
    const matches=rows.filter(s=>s.id===PIXAROMA_SOURCE_ID||s.providerRef==="creator:pixaroma"||s.canonicalUrl?.includes("workflows.pixaroma.com")||s.canonicalUrl?.replace(/\/$/,"")==="https://www.youtube.com/@pixaroma");
    if(matches.length>1)throw new Error("PIXAROMA_IDENTITY_CONFLICT_REQUIRES_REVIEW");
    if(matches[0]){
      if(matches[0].id!==PIXAROMA_SOURCE_ID)throw new Error("PIXAROMA_EXISTING_SOURCE_REUSE_REQUIRED");
      if(!matches[0].enabled||matches[0].status!=="ACTIVE")throw new Error("PIXAROMA_OPERATOR_RESTORE_REQUIRED");
      const before=matches[0];const metadata=before.metadata as Record<string,unknown>;
      if((metadata.sourceOnboarding as {version?:string})?.version!==SOURCE_ONBOARDING_VERSION||metadata.sourceUniverseRole!=="CREATOR"){
        const after={...metadata,sourceUniverseRole:"CREATOR",evidenceRoles:["TUTORIAL"],sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION,stage:"REGISTERED",objectType:"CREATOR",checkReason:"DENO_PUBLIC_WORKFLOW_JSON_VERIFIED",checkSampleCount:verified.length},sourceRegistry:{owner:"SOURCE_MANAGEMENT",managed:true,usageMode:"SYSTEM",sourceRoles:["CREATOR"]},factualSource:false,signalSource:true};
        const [updated]=await tx.update(contentSources).set({metadata:after,updatedAt:new Date()}).where(eq(contentSources.id,before.id)).returning();
        await recordContentAudit(user,{action:"PUBLIC_CREATOR_ONBOARDING_ALIGNED",entityType:"CONTENT_SOURCE",entityId:before.id,before:{metadata},after:{metadata:after}},tx);
        return updated;
      }
      return before;
    }
    const values={id:PIXAROMA_SOURCE_ID,name:"Pixaroma · 公开工作流与操作说明",sourceType:"MANAGED_SOURCE",providerRef:"creator:pixaroma",platform:"WEB",canonicalUrl:"https://workflows.pixaroma.com/",collectionMethod:"API",enabled:true,status:"ACTIVE",authorityScore:0,topics:["ComfyUI","工作流","教程"],
      collectionConfig:{acquisition:{routes:[{id:"deno-public-materials",role:"PRIMARY",kind:"PUBLIC_JSON_API",runtimeOwner:"PIXAROMA_PUBLIC_WORKFLOWS",targetUrl:"https://workflows.pixaroma.com/episodes.js",costLevel:"LOW"}]}},
      metadata:{currentPortfolio:true,systemManaged:false,referenceOnly:true,factualSource:false,signalSource:true,sourceUniverseRole:"CREATOR",evidenceRoles:["TUTORIAL"],sourceOnboarding:{version:SOURCE_ONBOARDING_VERSION,stage:"REGISTERED",objectType:"CREATOR",checkReason:"DENO_PUBLIC_WORKFLOW_JSON_VERIFIED",checkSampleCount:verified.length},creatorIdentity:{key:"pixaroma",site:"https://pixaroma.com/",youtube:"https://www.youtube.com/@pixaroma"},sourceRegistry:{owner:"SOURCE_MANAGEMENT",managed:true,usageMode:"SYSTEM",sourceRoles:["CREATOR"]},runtimeQualification:{effectiveQualification:"CONDITIONAL",reason:"PUBLIC_MATERIALS_VERIFIED_CROSS_CYCLE_PENDING",originality:"FIRST_PARTY_ATTRIBUTED",materialSampleCount:verified.length,probedAt:new Date().toISOString(),liveRunCount:0}},signalConfig:{signalOnly:true}};
    const [created]=await tx.insert(contentSources).values(values).returning();
    await recordContentAudit(user,{action:"PUBLIC_CREATOR_SOURCE_REGISTERED",entityType:"CONTENT_SOURCE",entityId:created.id,after:values},tx);
    return created;
  });
  // Reuse the already discovered author. Do not search again or create a second
  // Source for the channel. Linking attribution does not promote the old video.
  await db.transaction(async tx=>{
    const references=await tx.select().from(contentRawItems).where(and(
      inArray(contentRawItems.sourceId,["source_operator_practice_youtube"]),
      sql`lower(${contentRawItems.author}) = 'pixaroma'`
    )).for("update");
    for(const raw of references){
      const metadata=raw.metadata as Record<string,unknown>;
      if(metadata.creatorSourceId===source.id)continue;
      const after={...metadata,creatorSourceId:source.id,practiceDiscovery:{...metadata.practiceDiscovery as object,status:"REGISTERED_CREATOR_REFERENCE"}};
      await tx.update(contentRawItems).set({metadata:after}).where(eq(contentRawItems.id,raw.id));
      await recordContentAudit(user,{action:"EXISTING_CREATOR_REFERENCE_LINKED",entityType:"CONTENT_RAW_ITEM",entityId:raw.id,after:{creatorSourceId:source.id,status:"REGISTERED_CREATOR_REFERENCE"}},tx);
    }
  });
  return {sourceId:source.id,samples:items.length,verified:verified.length};
}
