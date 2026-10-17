export const CURATED_PUBLISHER_FEEDS:ReadonlyArray<{key:string;home:string;listing:string;feed:string;article:RegExp}>;
export function curatedPublisherRoute(input:string):{url:string;kind:"FEED"|"INDEX"|"ARTICLE"}|null;
export function curatedPublisherFeed(input:string):string|null;
