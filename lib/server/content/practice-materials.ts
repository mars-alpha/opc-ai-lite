import {evaluatePublicPracticeAccess} from "./public-practice-access";
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const publicUrl = (value: unknown) => { try { return typeof value === "string" && new URL(value).protocol === "https:"; } catch { return false; } };

/** Only collector receipts are evidence of retrieval. A long excerpt is never a receipt. */
export function evaluatePracticeMaterials(input: {originalUrl?: string | null; metadata?: unknown}) {
  const metadata=record(input.metadata), receipt=record(metadata.publicContentReceipt), materials=record(metadata.publicMaterials);
  const reasons:string[]=[];
  const observed = (value:unknown) => typeof value === "string" && Number.isFinite(Date.parse(value)) && Date.parse(value)<=Date.now()+60000;
  const materialRoute = metadata.collector === "pixaroma-public-workflows" &&
    materials.status === "STRUCTURE_VERIFIED_NOT_EXECUTED" && publicUrl(materials.pageUrl) && publicUrl(materials.downloadUrl) &&
    observed(materials.observedAt) && Array.isArray(materials.workflows) && materials.workflows.some(w => { const row=record(w); return Number(row.nodeCount)>0 && typeof row.sha256==="string" && /^[a-f0-9]{64}$/.test(row.sha256); });
  const publicReceipt = receipt.url === input.originalUrl && publicUrl(receipt.url) && receipt.status===200 && receipt.anonymous===true && receipt.serverFetched===true && observed(receipt.observedAt);
  if (!publicUrl(input.originalUrl) || (!publicReceipt && !materialRoute)) reasons.push("PUBLIC_SERVER_ACCESS_UNVERIFIED");
  const text = receipt.kind==="TRANSCRIPT" ? metadata.transcriptText : receipt.kind==="BODY" ? metadata.bodyText : null;
  const completeText = publicReceipt && receipt.complete===true && typeof text==="string" && text.trim().length>0 && (receipt.kind==="TRANSCRIPT" ? metadata.transcriptTruncated!==true : metadata.fullTextTruncated!==true);
  // Shared installation help does not prove an individual episode's operations.
  const steps = materialRoute && Array.isArray(materials.operationSteps) ? materials.operationSteps.filter((v):v is string => typeof v==="string" && v.trim().length>10) : [];
  if (!completeText && !materialRoute) reasons.push("COMPLETE_BODY_OR_TRANSCRIPT_MISSING");
  const operationText = completeText ? text as string : steps.join("\n");
  const numberedSteps = operationText.match(/(?:^|\n)\s*(?:\d+[.)、]|第[一二三四五六七八九十\d]+步|step\s*\d+)/gi) ?? [];
  // Configurations need actual values and an execution instruction, not a claim
  // that a tool is configurable. A verified workflow still needs episode help.
  const configuration = /[a-z][\w.-]*\s*[=:]\s*["']?[\w./-]+/i.test(operationText) &&
    /运行|执行|导入|run\b|execute\b|import\b/i.test(operationText);
  const imperative = /(?:^|[\n.!?。；;])\s*(?:[-*]\s*)?(?:安装|配置|运行|执行|导入|选择|打开|输入|导出|install\b|configure\b|run\b|execute\b|import\b|select\b|open\b|export\b).{4,}/i.test(operationText);
  const procedures = materialRoute ? steps.length>0 : numberedSteps.length>0 || imperative;
  if (!procedures && !configuration) reasons.push("REPRODUCIBLE_STEPS_OR_CONFIGURATION_MISSING");
  const inputSpecified=/输入|安装|配置|依赖|参数|input|install|configur|requirement|parameter/i.test(operationText);
  const outputSpecified=/导出|输出|结果|保存|export|output|result|save|generat(?:e|ed|ing).{0,30}(?:image|video|audio)/i.test(operationText);
  if (!inputSpecified) reasons.push("REQUIRED_INPUTS_MISSING");
  if (!outputSpecified) reasons.push("EXPECTED_OUTPUT_MISSING");
  const requiresDownloads=receipt.requiresExternalMaterials===true || /(?:下载|download).{0,40}(?:工作流|附件|模板|素材|模型|workflow|attachment|template|asset|model)/i.test(operationText);
  if (requiresDownloads && !materialRoute) {
    const artifacts=Array.isArray(receipt.requiredMaterials)?receipt.requiredMaterials:[];
    if (Number(receipt.unverifiedMaterialCount)>0 || !artifacts.length || !artifacts.every(value=>{const artifact=record(value);return publicUrl(artifact.url) && artifact.status===200 && artifact.anonymous===true && artifact.serverFetched===true && observed(artifact.observedAt) && typeof artifact.sha256==="string" && /^[a-f0-9]{64}$/.test(artifact.sha256);})) reasons.push("REQUIRED_ARTIFACTS_UNVERIFIED");
  }
  if (!evaluatePublicPracticeAccess({excerpt:operationText}).eligible) reasons.push("HUMAN_OR_FOLLOW_ACCESS_REQUIRED");
  return {version:"practice-materials-v2",eligible:reasons.length===0,reasons,kind:materialRoute?"VERIFIED_WORKFLOW_AND_STEPS":completeText?String(receipt.kind):"UNAVAILABLE"};
}
