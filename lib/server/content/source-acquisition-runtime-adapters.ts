import "server-only";
export {collectGithubReleaseDocument} from "./github-release-pagination";

import type { NormalizedCollectedItem } from "./collection-runner";
import {collectPixaromaPublicWorkflows} from "./public-workflow-materials";
import {documentHttpValidators,type HttpValidators} from "../../../services/overseas-collector-relay/conditional-http";
import {aihotDiscoveryMetadata} from "./aihot-discovery-metadata";

export const AIHOT_SNAPSHOT_URL="https://aihot.virxact.com/api/public/items";
type ApiDocument={body:string;status:number;finalUrl:string;etag?:string|null;lastModified?:string|null};
export async function collectAiHotDocument(options:{validators?:HttpValidators;fetchText:(url:string,validators?:HttpValidators)=>Promise<ApiDocument>}){
 const fetched=await options.fetchText(AIHOT_SNAPSHOT_URL,options.validators);
 const validators=documentHttpValidators(fetched,AIHOT_SNAPSHOT_URL,options.validators);
 if(fetched.status===304){
  if(!options.validators?.etag && !options.validators?.lastModified)throw new Error("API_UNEXPECTED_NOT_MODIFIED");
  return {items:[] as NormalizedCollectedItem[],validators,truncated:false,disposition:"NOT_MODIFIED" as const};
 }
 if(fetched.status!==200)throw new Error("API_DOCUMENT_INVALID");
 let payload:Record<string,unknown>;
 try{payload=record(JSON.parse(fetched.body));}catch{throw new Error("API_DOCUMENT_INVALID");}
 if(!Array.isArray(payload.items))throw new Error("API_DOCUMENT_INVALID");
 const items=await collectAiHot(async()=>payload);
 return {items,validators,truncated:payload.items.length>120 || payload.hasNext===true,disposition:items.length?"FETCHED" as const:"NO_NEW_ITEMS" as const};
}

type RuntimeAdapterDependencies = {
  fetchJson: (url: string) => Promise<unknown>;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function collectAiHot(
  fetchJson: RuntimeAdapterDependencies["fetchJson"]
): Promise<NormalizedCollectedItem[]> {
  const payload = record(await fetchJson(AIHOT_SNAPSHOT_URL));
  const items = Array.isArray(payload.items) ? payload.items : [];
  return items.slice(0, 120).flatMap((raw) => {
    const item = record(raw);
    const hints=aihotDiscoveryMetadata(item);
    const originalUrl = text(item.url) ?? text(item.link);
    const title = text(item.title) ?? text(item.name);
    if (!originalUrl || !title) return [];
    return [{
      externalId: text(item.id) ?? (Number.isSafeInteger(item.id) && Number(item.id)>=0?String(item.id):originalUrl),
      originalUrl,
      title,
      author: text(item.source) ?? text(item.author),
      excerpt: text(item.summary) ?? text(item.description),
      publishedAt: text(item.published_at) ?? text(item.publishedAt),
      platformMetrics: {},
      metadata: {
        collector: "ai-hot",
        contentType: "NEWS_ARTICLE",
        originPublisher: text(item.source) ?? "AI HOT",
        ...hints
      }
    }];
  });
}

export const SOURCE_RUNTIME_ADAPTER_OWNERS = ["RADAR_AI_HOT", "PIXAROMA_PUBLIC_WORKFLOWS"] as const;

export function hasSourceRuntimeAdapter(runtimeOwner: string | null | undefined) {
  return SOURCE_RUNTIME_ADAPTER_OWNERS.includes(
    String(runtimeOwner ?? "").trim().toUpperCase() as (typeof SOURCE_RUNTIME_ADAPTER_OWNERS)[number]
  );
}

export async function collectSourceRuntimeAdapter(input: {
  runtimeOwner: string;
  fetchJson: RuntimeAdapterDependencies["fetchJson"];
}) {
  const owner = input.runtimeOwner.trim().toUpperCase();
  if (owner === "PIXAROMA_PUBLIC_WORKFLOWS") return collectPixaromaPublicWorkflows();
  if (owner === "RADAR_AI_HOT") {
    return collectAiHot(input.fetchJson);
  }
  throw new Error("COLLECTION_RUNTIME_ADAPTER_NOT_REGISTERED:" + owner);
}
