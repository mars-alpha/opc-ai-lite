export const BRAVE_SEARCH_PROTOCOL: "brave-search-bounded-v1";
export const BRAVE_SEARCH_ENDPOINT: "https://api.search.brave.com/res/v1/web/search";
export function parseBraveSearchResults(payload:unknown,resultLimit?:number): {originalUrl:string;title:string;excerpt:string|null;publishedAt:null;metadata:Record<string,unknown>}[];
