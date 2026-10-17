export const GITHUB_RELEASE_POLICY_VERSION:"github-release-pages-v1";
export const GITHUB_RELEASE_REPOSITORIES:string[];
export const GITHUB_RELEASE_PAGE_SIZE:30;
export const GITHUB_RELEASE_MAX_PAGE:1000;
export function githubReleaseBase(input:string):string|null;
export function githubReleasePage(input:string):{url:string;base:string;page:number}|null;
export function githubReleaseNextPage(input:string,base:string):{url:string;base:string;page:number}|null;
