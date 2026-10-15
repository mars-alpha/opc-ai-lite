import "server-only";
import {inflateRawSync} from "node:zlib";
import {createHash} from "node:crypto";
import {collectThroughOverseasRelay} from "./overseas-collector-relay-client";
import type {NormalizedCollectedItem} from "./collection-runner";

// Inspect in memory. Never extract paths or execute custom nodes/workflows.
export function inspectWorkflowZip(base64:string) {
  if(base64.length>180000)throw new Error("WORKFLOW_ZIP_TOO_LARGE");
  const zip=Buffer.from(base64,"base64");let offset=0,total=0,decoded=0;const workflows:{name:string;nodeCount:number;sha256:string}[]=[];
  let footer=-1;
  for(let i=zip.length-22;i>=Math.max(0,zip.length-65557);i--)if(zip.readUInt32LE(i)===0x06054b50&&i+22+zip.readUInt16LE(i+20)===zip.length){footer=i;break;}
  if(footer<0||zip.readUInt16LE(footer+4)!==0||zip.readUInt16LE(footer+6)!==0)throw new Error("WORKFLOW_ZIP_DIRECTORY_INVALID");
  const central=zip.readUInt32LE(footer+16);
  if(central+4>footer||zip.readUInt32LE(central)!==0x02014b50)throw new Error("WORKFLOW_ZIP_DIRECTORY_INVALID");
  while(offset+30<=zip.length&&zip.readUInt32LE(offset)===0x04034b50){
    const flags=zip.readUInt16LE(offset+6),method=zip.readUInt16LE(offset+8),compressed=zip.readUInt32LE(offset+18),size=zip.readUInt32LE(offset+22);
    const nameLength=zip.readUInt16LE(offset+26),extra=zip.readUInt16LE(offset+28);
    const start=offset+30+nameLength+extra,end=start+compressed;
    if(flags&9||![0,8].includes(method)||end>zip.length||size>1000000||++total>150)throw new Error("WORKFLOW_ZIP_UNSUPPORTED");
    const name=zip.subarray(offset+30,offset+30+nameLength).toString("utf8");
    if(name.includes("..")||name.startsWith("/")||name.includes("\\"))throw new Error("WORKFLOW_ZIP_PATH_INVALID");
    if(/\.json$/i.test(name)){
      const data=method===0?zip.subarray(start,end):inflateRawSync(zip.subarray(start,end),{maxOutputLength:1000000});
      if(data.length!==size)throw new Error("WORKFLOW_ZIP_SIZE_INVALID");
      decoded+=data.length;if(decoded>4000000)throw new Error("WORKFLOW_ZIP_TOO_LARGE");
      const value=JSON.parse(data.toString("utf8"));
      if(value&&Array.isArray(value.nodes)&&value.nodes.length>0&&Array.isArray(value.links))workflows.push({name,nodeCount:value.nodes.length,sha256:createHash("sha256").update(data).digest("hex")});
    }
    offset=end;
  }
  if(!workflows.length)throw new Error("WORKFLOW_JSON_MISSING");
  return workflows;
}

export async function collectPixaromaPublicWorkflows():Promise<NormalizedCollectedItem[]> {
  const payload=await collectThroughOverseasRelay({provider:"PIXAROMA_WORKFLOWS",searchQuery:"",windowHours:168,resultLimit:30,minStars:0});
  if(payload.provider!=="PIXAROMA_WORKFLOWS"||!Array.isArray(payload.items)||!Array.isArray(payload.steps))throw new Error("PIXAROMA_PAYLOAD_INVALID");
  const steps=payload.steps.filter((s):s is string=>typeof s==="string");
  if(steps.length<3)throw new Error("PIXAROMA_STEPS_MISSING");
  return payload.items.map(raw=>{
    const row=raw as Record<string,unknown>;
    if(typeof row.originalUrl!=="string"||!/^https:\/\/www.youtube.com\/watch\?v=[\w-]{11}$/.test(row.originalUrl)||typeof row.title!=="string"||!Number.isInteger(row.episode))throw new Error("PIXAROMA_ITEM_INVALID");
    const verified=typeof row.zipBase64==="string"?inspectWorkflowZip(row.zipBase64):[];
    return {externalId:"pixaroma-ep-"+row.episode,originalUrl:row.originalUrl,title:row.title,author:"Pixaroma",
      excerpt:(Array.isArray(row.workflowNames)?row.workflowNames.join("; "):row.title).slice(0,11000),publishedAt:typeof row.publishedAt==="string"?row.publishedAt:null,
      metadata:{collector:"pixaroma-public-workflows",originPublisher:"Pixaroma",creatorIdentity:{key:"pixaroma",site:"https://pixaroma.com/",youtube:"https://www.youtube.com/@pixaroma"},
        // Unknown dates and one author's materials cannot create fresh fact authority.
        referenceOnly:true,publicationStatus:row.publishedAt?"AUTHOR_DECLARED":"UNKNOWN_HISTORICAL",
        publicMaterials:{version:1,episode:row.episode,pageUrl:row.materialUrl,downloadUrl:row.downloadUrl,
          helpUrl:payload.helpUrl,steps,workflows:verified,status:verified.length?"STRUCTURE_VERIFIED_NOT_EXECUTED":row.materialStatus,
          catalogueBacklog:payload.backlog,observedAt:new Date().toISOString()},
        bodyStatus:"WORKFLOW_AND_SHARED_SETUP_STEPS",contentType:"TUTORIAL",fullTextAvailable:false}};
  });
}
