/** Access policy is independent from relevance and popularity. */
export function evaluatePublicPracticeAccess(input:{title?:string|null;excerpt?:string|null}) {
  const text = [input.title,input.excerpt].filter(Boolean).join(" ").normalize("NFKC");
  const gated = /(?:关注|三连|点赞|转发|加群|入群)(?:后|即可|才能|自动|并).{0,14}(?:获取|领取|私信|发送|下载)|(?:私信|私聊|加微信|加我微信|扫码加群).{0,18}(?:获取|领取|发送|资料|工作流|教程)|(?:登录|登陆|付费|订阅会员).{0,10}(?:后|才能|即可).{0,10}(?:下载|获取|查看)|(?:follow (?:me|us|this account|the channel)|subscribe|sign in|log in|dm me).{0,24}(?:to get|to download|for access)/i.test(text);
  // An explicitly required service credential behind manual approval prevents
  // immediate practice. Optional integrations/events do not gate the material.
  const credentials = [...text.matchAll(/\b(?:api[ -]?key|access token)\b/gi)];
  const approvals = [...text.matchAll(/\b(?:request access|manual approval)\b/gi)];
  const optionalClause = (position:number) => /\boptional\b/i.test(text.slice(Math.max(0,position-120),position).split(/[.!?;\n]/).at(-1) ?? "");
  const manualCredential = credentials.some(credential => !optionalClause(credential.index!) && approvals.some(approval =>
    Math.abs(approval.index! - credential.index!) <= 240 && !optionalClause(approval.index!)));
  return {eligible:!gated&&!manualCredential,reason:gated||manualCredential ? "HUMAN_OR_FOLLOW_ACCESS_REQUIRED" : "NO_DECLARED_ACCESS_GATE"};
}

export function evaluateCreatorRegistration(input:{serverRouteVerified:boolean;historySamples:number;originality:"UNVERIFIED"|"SELF_DECLARED"|"FIRST_PARTY_ATTRIBUTED";completeMaterials:boolean;accessEligible:boolean}) {
  const reasons:string[]=[];
  if (!input.accessEligible) reasons.push("HUMAN_OR_FOLLOW_ACCESS_REQUIRED");
  if (!input.serverRouteVerified || input.historySamples<3) reasons.push("CONTINUOUS_PUBLIC_ROUTE_UNVERIFIED");
  if (input.originality!=="FIRST_PARTY_ATTRIBUTED") reasons.push("ORIGINALITY_NOT_CORROBORATED");
  if (!input.completeMaterials) reasons.push("COMPLETE_OPERATION_MATERIALS_MISSING");
  return {eligible:reasons.length===0,reasons};
}
