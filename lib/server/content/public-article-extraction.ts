import {Readability} from "@mozilla/readability";
import {parseHTML} from "linkedom";

/** Static DOM only: no script execution, resource loading or browser session. */
export function extractPublicPracticeArticle(html:string,url:string) {
  if(Buffer.byteLength(html)>1_500_000)throw new Error("PUBLIC_ARTICLE_TOO_LARGE");
  const {document}=parseHTML(html);
  const denied=[...document.querySelectorAll('script[type="application/ld+json"]')].some(node=>/"isAccessibleForFree"\s*:\s*(?:false|"false")/i.test(node.textContent??""));
  if(denied || document.querySelector('[class*="paywall"], [data-paywall]'))throw new Error("PUBLIC_ARTICLE_ACCESS_RESTRICTED");
  const base=document.createElement("base");base.setAttribute("href",url);document.head.prepend(base);
  Object.defineProperty(document,"documentURI",{value:url,configurable:true});
  Object.defineProperty(document,"baseURI",{value:url,configurable:true});
  const result=new Readability(document as unknown as Document,{maxElemsToParse:20000,charThreshold:400}).parse();
  if(!result?.content)throw new Error("PUBLIC_ARTICLE_BODY_MISSING");
  const content=parseHTML('<html><body>'+result.content+'</body></html>').document;
  const links=[...content.querySelectorAll("a[href]")].flatMap(node=>{
    const label=node.textContent??"";
    try {const target=new URL(node.getAttribute("href")!,url);return /\.(?:json|zip|ya?ml|safetensors|ckpt)(?:$|\?)/i.test(target.href) || /(?:download|下载).*(?:workflow|template|asset|工作流|模板|素材)/i.test(label) ? [{url:target.href,label}] : [];} catch {return [];}
  });
  for(const node of content.querySelectorAll("p,div,li,h1,h2,h3,h4,pre,br"))node.appendChild(content.createTextNode("\n"));
  const text=(content.body.textContent??"").replace(/[ \t]+/g," ").replace(/\n\s*\n/g,"\n\n").trim();
  if(text.length<400 || text.length>60000)throw new Error("PUBLIC_ARTICLE_INCOMPLETE_OR_TOO_LARGE");
  if(/^(?:just a moment|access denied|verify you are human|sign in to continue)/i.test(text))throw new Error("PUBLIC_ARTICLE_ACCESS_RESTRICTED");
  return {text,title:result.title??null,byline:result.byline??null,publishedAt:result.publishedTime??null,materialLinks:links};
}
