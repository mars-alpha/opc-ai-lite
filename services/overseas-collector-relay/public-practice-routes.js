/** Shared fixed routes; neither runtime exposes an arbitrary-URL fetch proxy. */
import {publicSourceArticleAlias} from "./public-source-routes.js";
import {curatedPublisherRoute} from "./curated-publisher-feeds.js";
export const PUBLIC_PRACTICE_ROUTE_PROTOCOL="public-practice-routes-v5";
/** @param {string} input @returns {{url:string,kind:"MARKDOWN"|"HTML"|"ARTIFACT"}|null} */
export function publicPracticeRoute(input) {
  try {
    const u=new URL(input);
    if(u.protocol!=="https:" || u.username || u.password || u.port || u.search || u.hash || u.pathname.length>500)return null;
    const alias=publicSourceArticleAlias(u.href);if(alias)return {url:alias,kind:"HTML"};
    if(curatedPublisherRoute(input)?.kind==="ARTICLE")return {url:u.href,kind:"HTML"};
    if(u.hostname==="raw.githubusercontent.com" && /^\/Comfy-Org\/ComfyUI_Nvidia_VFX_Nodes\/main\/example_workflows\/[a-zA-Z0-9_-]+\.json$/.test(u.pathname))return {url:u.href,kind:"ARTIFACT"};
    if(u.hostname==="docs.comfy.org" && /^\/tutorials\/[a-z0-9/-]+(?:\.md)?$/.test(u.pathname) && !u.pathname.includes("//"))return {url:u.href.replace(/\.md$/,""),kind:"MARKDOWN"};
    /** @type {Record<string,RegExp>} */
    const patterns={
      "huggingface.co":/^\/blog\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)?\/?$/,
      "hamel.dev":/^\/blog\/posts\/[a-z0-9-]+\/(?:index\.html)?$/,
      "eugeneyan.com":/^\/writing\/[a-z0-9-]+\/$/,
      "simonwillison.net":/^\/20\d{2}\/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\/(?:[1-9]|[12]\d|3[01])\/[a-z0-9-]+\/$/,
      "til.simonwillison.net":/^\/[a-z0-9-]+\/[a-z0-9-]+\/?$/,
      "blog.n8n.io":/^\/[a-z0-9-]+\/$/,
      "www.langchain.com":/^\/blog\/[a-z0-9-]+\/?$/,
      "blog.comfy.org":/^\/p\/[a-z0-9-]+\/?$/,
      "aws.amazon.com":/^\/blogs\/machine-learning\/[a-z0-9-]+\/$/
    };
    return patterns[u.hostname]?.test(u.pathname) ? {url:u.href,kind:"HTML"} : null;
  } catch {return null;}
}
