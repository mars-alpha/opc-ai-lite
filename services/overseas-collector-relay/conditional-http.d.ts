export const CONDITIONAL_HTTP_PROTOCOL:"source-conditional-http-v1";
export type HttpValidators={etag?:string|null;lastModified?:string|null};
export function readHttpValidators(value:unknown):HttpValidators;
export function conditionalRequestHeaders(value:HttpValidators):Record<string,string>;
export function documentHttpValidators(document:HttpValidators & {finalUrl:string;status:number},requestedUrl:string,prior?:HttpValidators):HttpValidators;
