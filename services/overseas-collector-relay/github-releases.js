// A transport allowlist, never a Source registry or authority grant.
export const GITHUB_RELEASE_POLICY_VERSION="github-release-pages-v1";
export const GITHUB_RELEASE_REPOSITORIES=["anthropics/claude-code","openai/openai-python","langchain-ai/langchain","ollama/ollama"];
// Verified against the public repository API; used only to validate Link aliases.
const repositoryIds={"anthropics/claude-code":937253475,"openai/openai-python":307213173,"langchain-ai/langchain":552661142,"ollama/ollama":658928958};
export const GITHUB_RELEASE_PAGE_SIZE=30;
export const GITHUB_RELEASE_MAX_PAGE=1000;
export function githubReleaseBase(input){
 try{const u=new URL(input);const repo=u.pathname.match(/^\/repos\/([^/]+\/[^/]+)\/releases$/)?.[1];
  return u.protocol==="https:" && u.hostname==="api.github.com" && !u.port && !u.username && !u.password && !u.search && !u.hash && GITHUB_RELEASE_REPOSITORIES.includes(repo)?u.href:null;
 }catch{return null;}
}
function parsePage(input,maxPage){
 try{const u=new URL(input);const page=Number(u.searchParams.get("page"));
  if(u.searchParams.size!==2 || u.searchParams.get("per_page")!==String(GITHUB_RELEASE_PAGE_SIZE) || String(page)!==u.searchParams.get("page") || !Number.isInteger(page) || page<1 || page>maxPage)return null;
  const base=new URL(u);base.search="";if(!githubReleaseBase(base.href))return null;
  return {url:`${base.href}?per_page=${GITHUB_RELEASE_PAGE_SIZE}&page=${page}`,base:base.href,page};
 }catch{return null;}
}
export function githubReleasePage(input){return parsePage(input,GITHUB_RELEASE_MAX_PAGE);}
export function githubReleaseNextPage(input,base){
 if(!githubReleaseBase(base))return null;
 // Accept max+1 as Link evidence of overflow only; the transport never fetches it.
 const named=parsePage(input,GITHUB_RELEASE_MAX_PAGE+1);if(named)return named.base===base?named:null;
 try{const url=new URL(input),repo=new URL(base).pathname.slice(7,-9);
  if(url.pathname!==`/repositories/${repositoryIds[repo]}/releases`)return null;
  url.pathname=new URL(base).pathname;
  const page=parsePage(url.href,GITHUB_RELEASE_MAX_PAGE+1);return page?.base===base?page:null;
 }catch{return null;}
}
