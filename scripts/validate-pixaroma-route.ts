import assert from "node:assert/strict";
import {handleRelayRequest,parsePixaromaEpisodes} from "../services/overseas-collector-relay/deno";
import {inspectWorkflowZip} from "../lib/server/content/public-workflow-materials";
import {canonicalizeOriginalUrl} from "../lib/server/content/discovery";
const row={number:31,title:"ComfyUI workflow",youtube:"https://www.youtube.com/watch?v=abcdefghijk&list=foo",downloadPath:"workflows/Ep31 Workflows.zip",zipSizeBytes:100,workflows:[{name:"Image edit"}],comingSoon:false,date:""};
const parse=(rows:unknown[])=>parsePixaromaEpisodes("window.EPISODES = "+JSON.stringify(rows)+";");
assert.equal(parse([row])[0].publishedAt,null);
assert.equal(parse([row])[0].originalUrl,"https://www.youtube.com/watch?v=abcdefghijk");
assert.equal(parse([{...row,comingSoon:true}]).length,0);
assert.equal(parse([{...row,downloadPath:"https://evil.test/a.zip"}]).length,0);
assert.equal(parse([{...row,number:1.1}]).length,0);
assert.throws(()=>parsePixaromaEpisodes('window.EPISODES = []; fetch("https://evil.test");'));
assert.throws(()=>inspectWorkflowZip(Buffer.from("PK bad archive").toString("base64")));
assert.throws(()=>inspectWorkflowZip("A".repeat(180001)));
assert.equal(canonicalizeOriginalUrl(parse([row])[0].originalUrl),canonicalizeOriginalUrl("https://www.youtube.com/watch?v=abcdefghijk&utm_source=search"));
assert.equal(canonicalizeOriginalUrl("https://youtu.be/abcdefghijk?si=search&t=10"),parse([row])[0].originalUrl);
assert.equal(canonicalizeOriginalUrl(row.youtube),parse([row])[0].originalUrl);
function zipFixture(name:string,value:unknown){
  const filename=Buffer.from(name),data=Buffer.from(JSON.stringify(value));
  const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
  const local=Buffer.concat([header,filename,data]),central=Buffer.alloc(46);central.writeUInt32LE(0x02014b50);
  const footer=Buffer.alloc(22);footer.writeUInt32LE(0x06054b50);footer.writeUInt32LE(local.length,16);
  return Buffer.concat([local,central,footer]).toString("base64");
}
const fixture=zipFixture("Workflow.json",{nodes:[{id:1}],links:[]});
assert.equal(inspectWorkflowZip(fixture)[0].nodeCount,1);
assert.throws(()=>inspectWorkflowZip(zipFixture("../Workflow.json",{nodes:[{id:1}],links:[]})));
assert.throws(()=>inspectWorkflowZip(zipFixture("config.json",{hello:"world"})));
async function checkProvider(){
  const previous=globalThis.fetch;const called:string[]=[];
  globalThis.fetch=async(input,init)=>{
    const url=String(input);called.push(url);assert.equal(init?.redirect,"error");assert(init?.signal);
    if(url==="https://workflows.pixaroma.com/episodes.js")return new Response("window.EPISODES = "+JSON.stringify([row])+";");
    if(url==="https://workflows.pixaroma.com/help/open-workflow/")return new Response([1,2,3].map(n=>`<li class="step"><h2>Step ${n}</h2><div>Open ComfyUI</div></li>`).join(""));
    if(url==="https://workflows.pixaroma.com/workflows/Ep31%20Workflows.zip")return new Response(Buffer.from(fixture,"base64"));
    throw new Error("UNEXPECTED_NETWORK");
  };
  try{
    const response=await handleRelayRequest(new Request("https://relay.test/v1/collect",{method:"POST",headers:{authorization:"Bearer test"},body:JSON.stringify({provider:"PIXAROMA_WORKFLOWS",url:"http://169.254.169.254/latest/meta-data",searchQuery:"https://evil.test/"})}),{OVERSEAS_COLLECTOR_RELAY_SECRET:"test"});
    assert.equal(response.status,200);const body=await response.json();assert.equal(body.items.length,1);assert.equal(body.steps.length,3);
    assert(called.every(url=>url.startsWith("https://workflows.pixaroma.com/")));assert.equal(called.length,3);
  }finally{globalThis.fetch=previous;}
}
checkProvider().then(()=>console.log("PIXAROMA_ROUTE=PASS")).catch(error=>{console.error(error);process.exitCode=1;});
