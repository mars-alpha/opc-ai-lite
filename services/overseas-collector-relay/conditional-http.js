// Shared Node/Deno implementation. Every relative .js import exists on disk.
export const CONDITIONAL_HTTP_PROTOCOL="source-conditional-http-v1";
export function readHttpValidators(value){
 const record=value && typeof value==="object" && !Array.isArray(value)?value:{};
 const header=input=>{
  if(input===undefined || input===null)return null;
  if(typeof input!=="string" || input.length>2048 || /[^\x20-\x7e\x80-\xff]/.test(input))throw new SyntaxError("invalid conditional header");
  return input||null;
 };
 return {etag:header(record.etag),lastModified:header(record.lastModified)};
}
export function conditionalRequestHeaders(value){
 const validators=readHttpValidators(value);
 return {...(validators.etag?{"if-none-match":validators.etag}:{}),...(validators.lastModified?{"if-modified-since":validators.lastModified}:{})};
}
export function documentHttpValidators(document,requestedUrl,prior){
 if(new URL(document.finalUrl).href!==new URL(requestedUrl).href){
  if(document.status===304)throw new SyntaxError("not modified for another URI");
  return {etag:null,lastModified:null};
 }
 return readHttpValidators(document.status===304?{etag:document.etag??prior?.etag,lastModified:document.lastModified??prior?.lastModified}:document);
}
