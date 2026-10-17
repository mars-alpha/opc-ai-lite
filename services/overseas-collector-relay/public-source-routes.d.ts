export const PUBLIC_SOURCE_ROUTE_PROTOCOL:"public-source-routes-v3";
export const LEGACY_PUBLIC_SOURCE_HOSTS:readonly string[];
export const AUTHOR_FEED_HOSTS:readonly string[];
export function publicSourceRoute(input:string):{url:string;authorFeed:boolean}|null;
export function publicSourceHomepageAlias(input:string):string|null;
export function publicSourceArticleAlias(input:string):string|null;
export function publicSourceFeedAnchor(pageUrl:string,href:string):string|null;
