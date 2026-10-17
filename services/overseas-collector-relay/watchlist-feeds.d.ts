export const WATCHLIST_FEED_POLICY_VERSION:"watchlist-fixed-feeds-v2";
export const WATCHLIST_FEED_MIGRATIONS:ReadonlyArray<{sourceId:string;from:string;to:string}>;
export const WATCHLIST_FEEDS:ReadonlyArray<{sourceId:string;urls:readonly string[]}>;
export function fixedWatchlistFeedUrl(input:string):string|null;
export function watchlistFeedFetchUrl(input:string):string|null;
