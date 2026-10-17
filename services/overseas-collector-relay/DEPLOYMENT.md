# Overseas Relay deployment and production migration prerequisites

Current owner for deployment operations only. Collection rules: `docs/content/COLLECTION_ARCHITECTURE_CONTRACT.md`.

## Production migration connection

Migration prerequisites below are a reusable runbook; current deployment state belongs to `docs/CURRENT_SYSTEM_FACTS.md` and `TASKS.md`. Ordinary table CRUD does not grant ALTER/DROP rights.

1. A database administrator creates a dedicated non-superuser LOGIN role (for example `opc_ai_migrator`), with no CREATEDB/CREATEROLE/REPLICATION/BYPASSRLS. Set its password interactively (`\password opc_ai_migrator`), not in shell arguments or chat.
2. Scope DDL ownership to this application's `opc_ai_prod` objects in `public`/`drizzle`, after reviewing generated ownership-transfer SQL. Do not grant membership in `postgres`, do not use broad `REASSIGN OWNED BY postgres`, and do not grant DDL to the App Role. Existing app grants must be preserved; grants on newly created tables/sequences must follow the current runtime privilege list.
3. Use `sudoedit /etc/opc-ai/migration.env` in a root-only directory; file root:root mode600. It contains only:

```dotenv
DATABASE_MIGRATION_URL=postgresql://opc_ai_migrator:<URL-encoded-password>@127.0.0.1:5432/opc_ai_prod
```

4. Supply only that protected path to the deployment operator. It is loaded for the migration process, never by the Web/collection service. The application still loads its existing DATABASE_URL and DATABASE_ENVIRONMENT=production.
5. Validate target/owner privileges and backup restore evidence, then use the existing safe entry from the reviewed release directory (not an arbitrary working tree):

```bash
sudo node --env-file=/var/www/opc-ai/.env.local --env-file=/etc/opc-ai/migration.env --import tsx scripts/migrate-database-safe.ts --confirm=production --backup-confirmed
```

The sample assumes Node20 and installed project dependencies. Do not execute while migration role, release, grants or backup gates are unresolved. Afterwards run collection deployment preflight and verify migration hashes/schema/runtime grants. No production business data is copied from Development.

## Deno configuration

Use [the current Deno Deploy console](https://console.deno.com/) and [current CLI documentation](https://docs.deno.com/runtime/reference/cli/deploy/), not the retired Classic deployctl flow.

- Work from a clean code-only directory containing `deno.ts`, `public-source-routes.js`, `public-practice-routes.js`, `conditional-http.js`, `watchlist-feeds.js`, `github-releases.js`, `brave-search.js` and `curated-publisher-feeds.js`; preserve their relative paths. Never upload the repository root, `.env`, database material or server credentials. The `.d.ts` files serve Node type checking and are not runtime dependencies.
- Existing organization/application should be reused after its owner confirms identity. Runtime dynamic; entrypoint `deno.ts`; no npm install/build command required.
- Set Production context secrets through the console: `OVERSEAS_COLLECTOR_RELAY_SECRET` (same existing shared secret), `YOUTUBE_DATA_API_KEY`. Optional nonsecret `GOOGLE_TRENDS_GEO=US`. Relay has **no DATABASE_URL**.
- Authenticate the CLI with `deno deploy` browser authorization, or put a scoped `DENO_DEPLOY_TOKEN` in a protected server deployment-only file. Provide the organization/app names and file path, not the token in chat.
- First deploy a preview with `deno deploy --org <org> --app <app>` from that clean directory. Validate authentication and fixed providers; only then promote/deploy production with `--prod` and retain the old deployment for rollback.
- This local release adds `WATCHLIST_FEED` and `GITHUB_RELEASES` to the existing fixed providers, including `PUBLIC_SOURCE_DOCUMENT` and `PUBLIC_PRACTICE_DOCUMENT`. X code is not a current enabled source. No arbitrary caller URL is accepted. Fixed watchlist Feeds and Release pages disallow all redirects; the prior three public document domains remain supported; the new fixed author scope requires separate activation below.
- Before enabling the new Node release, `/health` must return200, version `relay-curated-publishers-v15`, conditionalProtocol `source-conditional-http-v1`, watchlistFeedVersion `watchlist-fixed-feeds-v2`, githubReleaseVersion `github-release-pages-v1`, braveSearchProtocol `brave-search-bounded-v1`, publicPracticeRouteProtocol `public-practice-routes-v5`, publicSourceRouteProtocol `public-source-routes-v3`, and the expected provider capabilities. Invalid bearer must401; unknown provider400; valid bounded requests must return real data. Verify a 200/validator then authenticated conditional304 where supported. A health503, truncated Feed or failed upstream is not collection success. These are release prerequisites, not claims about the currently deployed version.
- Keep `OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES=v2` for existing public-document consumers. After the Relay passes capability and upstream checks, deploy Node and set `OPC_COLLECTION_WATCHLIST_FEEDS=v1` together in the existing collection environment. The new Node code intercepts the exact watchlist URLs even with the flag absent: they fail explicitly instead of falling back to host HTTP. Do not deploy that code alone expecting the flag to preserve old direct collection. Missing Relay/secret or old provider must remain visible as unavailable.
- Disabling `OPC_COLLECTION_WATCHLIST_FEEDS` stops the new routes; restoring old behavior requires rollback to the matching prior Node/SYSTEM release. Keep the old Relay deployment, URL and secret for rollback. No migration or Source restoration is needed. Other overseas routes still need individual coverage and real acceptance.
- For Release acquisition, first verify the deployed GITHUB_RELEASES capability and fixed page requests, then set `OPC_COLLECTION_GITHUB_RELEASES=v1` in the existing collection environment. A Source must explicitly declare `kind=PUBLIC_JSON_API`, `runtimeOwner=GITHUB_RELEASES`, and an allowlisted `https://api.github.com/repos/<owner>/<repo>/releases` URL with no query. The shared transport policy currently permits anthropics/claude-code, openai/openai-python, langchain-ai/langchain and ollama/ollama. This does not register these Sources, restore archived records or certify official authority. Keep one logical identity per Source.
- Release requests are unauthenticated public API calls, at most3 per Source run, with no immediate retry on rate limits. Observe403/429 and existing Source backoff; do not assume an unlimited public quota. Inspect with `npm run content:github-release-pagination:inspect -- --mode=relay --repository=anthropics/claude-code`. Local-handler results prove neither the deployed Relay nor Tencent SYSTEM route. Disable the Release flag or remove that explicit Route to stop requests; rollback preserves Raw and ignores the additive checkpoint metadata. Page progress is bounded traversal, not a complete archive or time watermark.
- Total upstream budget16s; YouTube search10s/stats5s; Google/DeepMind/GitHub12s. The client deadline20s; missing YouTube statistics preserve search results. Expensive API searches are not automatically retried.

## Brave Search activation (protocol v10)

- Include `brave-search.js` in the clean code-only deployment directory. Verify `/health` advertises `BRAVE_SEARCH` and `braveSearchProtocol=brave-search-bounded-v1`; capabilities indicate protocol support, not a configured key or live upstream health.
- Put `BRAVE_SEARCH_API_KEY` only in the Deno Production secret environment through the existing protected operator workflow. Never place it in Node, the database, chat, query parameters or logs. Procurement/key creation is outside this implementation; no live Brave calls have been accepted yet.
- After remote protocol and bounded upstream checks, set nonsecret `OPC_COLLECTION_BRAVE_SEARCH=v1` in the existing Node/SYSTEM environment. Without this flag there is no direct host fallback. Missing Deno key returns `RELAY_BRAVE_KEY_REQUIRED`; 429/timeout/schema errors remain failures and use existing P3A backoff.
- Register through the existing source-management Core `registerManagedPracticeSearch(...,"BRAVE_SEARCH")`, with a successful bounded live sample. The development-only tool can explicitly select `--provider=BRAVE_SEARCH --probe`, then `--configure`, then `--verify`; it never defaults to Brave. This is a real provider request when configured, unlike `content:brave-search:check` and `content:brave-search:accept -- --confirm=BRAVE-SEARCH-DEVELOPMENT`, which use mocked upstreams. Do not run a development fixture or bypass database guards on production. Production registration must use its reviewed existing management operation and verified target.
- An active registered Brave Source leads the managed search pair; one distinct platform Provider can be fallback. No new Source is silently seeded. Missing configuration or inactive Source prevents selection. Results remain pending references; web discovery is not original evidence or full text. Real quality, Chinese recall, publisher attribution and actual billable usage still need verification.
- Disable `OPC_COLLECTION_BRAVE_SEARCH` to remove this Provider from automatic selection, or roll back the matching Node/Relay release; retain Source/Run/Raw audit. Other collection and existing search routes continue. No Schema migration is needed.

## Fixed practice bodies and undated references (protocol v11)

- Publish the updated existing `public-practice-routes.js` and `deno.ts` together with all prior shared runtime files. `/health` must show the current version specified above and `publicPracticeRouteProtocol=public-practice-routes-v5`. This is protocol support, not live upstream health or new Source registration.
- Validate bounded authenticated PUBLIC_PRACTICE_DOCUMENT requests for Hugging Face `/blog/<slug>` or `/blog/<namespace>/<slug>`, Simon dated article paths and TIL category/article paths. Directory/API/Feed URLs, query strings, credentials, alternate ports and redirects are rejected. Confirm anonymous real HTML and static extraction; missing body, timeout or unverified required attachments remain explicit gaps.
- Deploy the Relay first, then the matching Node/SYSTEM version using its existing connection/secret. There is no new Key, Source seed, scheduler or host HTTP fallback. An old Relay may reject new paths; do not label it compatible merely because it already lists PUBLIC_PRACTICE_DOCUMENT.
- The existing PRACTICE_MATERIALS stage can now select recent undated SYSTEM references tied to an eligible Event; it keeps publishedAt null and existing Source/Fact boundaries. Default per-cycle two-item and site/backoff controls remain. Revert the matching Node/Relay code to stop the added scope; retain Raw material and Audit history.
- Checks: `npm run content:practice-reference-body:check` (pure mock); `npm run content:practice-reference-body:accept -- --confirm=PRACTICE-REFERENCE-DEVELOPMENT` (development-only PostgreSQL with mocked upstreams and fixture cleanup). Never run development fixtures against production. Local-handler network failure or PowerShell HTML extraction results do not establish remote Deno/Tencent acceptance.

## Fixed Feed migration (protocol v12)

- Deploy the updated `watchlist-feeds.js`, `deno.ts` and matching Node/SYSTEM together, Relay first; verify the current health protocols above and authenticated WATCHLIST_FEED requests. Keep the existing nonsecret activation flag `OPC_COLLECTION_WATCHLIST_FEEDS=v1`; its value is not the wire protocol version. No new Key or Source migration is required.
- Verify the old LangChain URL returns requestedUrl, v2 mapping version, status200 and the fixed canonical URL without forwarding old validators. Node rejects an old Relay receipt for this alias. Also verify a directly configured canonical Route independently; real304 requires actual upstream validator support. The current public sample returned200 with no ETag, so mock304 is protocol proof only.
- The fixed alias preserves Source identity and operator configuration. It makes unconditional requests on the old Route, never stores the new URI validator there and is not an independent fallback. Unknown redirects remain errors; do not open general redirect following or host HTTP fallback.
- Checks: `npm run content:feed-migration:check`; development-only real PG plus mocked upstream: `npm run content:feed-migration:accept -- --confirm=FEED-MIGRATION-DEVELOPMENT`. Remote Relay/Tencent connectivity and continuous Source qualification still require live acceptance. Roll back matching Node/Relay/shared files, retain Raw/Run/checkpoints; the old feed may become unavailable again.

## Fixed Hamel author source (protocol v13)

- Include `public-source-routes.js` with all existing runtime files. Verify current health above, authenticated PUBLIC_SOURCE_DOCUMENT for the fixed homepage/Feed, and PUBLIC_PRACTICE_DOCUMENT for an eligible article. Node rejects author responses missing the new source-route protocol; existing public document consumers remain compatible.
- Deploy Relay first, then matching Node/SYSTEM. Keep `OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES=v2`; only after bounded remote checks set `OPC_COLLECTION_AUTHOR_FEEDS=v1` in the existing Node environment. This is a capability switch, not a Key or new scheduler. Flag off prevents new author admission and direct author Feed/body calls; no host fallback.
- No Source is seeded. Existing SYSTEM-collected references on the exact author paths can enter the existing observed-home → declared-Feed → CONDITIONAL registration workflow. No eligible Raw means no registration. The fixed home alias participates in duplicate/operator-intent checks; never restore an archived source or copy one identity for alternate routes.
- Public PowerShell HTML/feed snapshots and local static extraction are not deployed Deno/Tencent acceptance. Long FAQ bodies still fail the existing 60,000-character extraction bound; do not truncate and label complete. A body receipt does not guarantee operational materials or continuous author quality.
- Checks: `content:author-feed:check` and development-only `content:author-feed:accept -- --confirm=AUTHOR-FEED-DEVELOPMENT`. The latter uses only PostgreSQL fixtures and mocked upstreams, requires an unused fixed identity, and cleans up its own records. Disable the author flag or roll back matching code to stop added requests; retain Source/Raw/Run/Audit. No database migration or procurement is needed.

### Eugene Yan fixed Feed and article aliases

The same author flag also enables the fixed Eugene Yan root, `/rss/` and single-slug `/writing/` routes. Feed discovery requires the actual homepage RSS anchor. Only the publisher-confirmed `//writing/<slug>/` alias maps to `/writing/<slug>/`; alias validators must not accompany the canonical request or be stored against the alias. Existing Raw records are not rewritten.

Before activation, verify these routes on the deployed Relay, the v3 source/v5 practice protocols above, canonical article bodies and conditional requests. Run `npm run content:eugene-feed:check` and development-only `npm run content:author-feed:accept -- --confirm=AUTHOR-FEED-DEVELOPMENT --author=eugene`; repeat the default Hamel acceptance. These fixture/mock checks do not prove remote upstream connectivity. Roll back matching Node/Relay releases or disable the existing author flag; retain historical records. This release does not seed a production Source or grant qualification.

### Five native publisher Feeds

Ship `curated-publisher-feeds.js` alongside the shared route files. It is required by both Source and Practice routes. The existing `OPC_COLLECTION_AUTHOR_FEEDS=v1` gate covers PyTorch, Modal, Apple ML, Together and vLLM; no new timer or Source seed is required. Verify the exact Feed and article paths from that file, not wildcard sites or the old vLLM blog host. Homepage discovery can use these publisher-verified fixed Feeds without inventing new fallback URLs.

Run `content:curated-publisher-feeds:check`; development-only author acceptance also supports `--author=pytorch`, `modal`, `apple_ml`, `together` or `vllm` with the existing confirmation argument. Test flag-off, existing archived identities and both original authors before activation. Roll out matching Node/Web/SYSTEM and Relay protocols together; retain the previous releases and database audit. Source qualification and AIHOT publication rights are separate from transport readiness. Do not enable new AIHOT redistribution as part of this release.

## Feed transport compatibility

Ship matching Node/SYSTEM and `relay-radar-materials-v17`, retaining v16 transport compatibility. Successful collection JSON of at least 16,384 characters uses gzip when explicitly accepted, respecting `gzip;q=0`; identity responses remain supported. Node's native fetch handles decompression. With `x-opc-relay-compact: feed-v1`, identical `text`/`rssText` fields travel once with `feedTextAlias: text`; Node restores the alias before existing callers consume the response. Older Node requests retain the original fields, and newer Node accepts older Relay responses. No Feed truncation, deadline increase or direct-host bypass is introduced.

Before cutover, run `content:relay-feed-incremental:check`, `content:feed-migration:check` and real Tencent-to-Relay probes, including complete large bodies and conditional responses. Fixed Baoyu migration follows the same cross-URI validator isolation as LangChain. Node reports response-header versus body timeout/network failure using fixed safe codes; preserve the normal bounded retry policy. Keep matching previous Web/SYSTEM/Relay releases, protected PM2/env backups and a verified database backup. Current paths, revision and remaining health gaps belong only to CURRENT_SYSTEM_FACTS.

## Hosting lifecycle

Deno announced on2026-10-09 that Deploy will operate for six more months before shutting down: [official announcement](https://deno.com/blog/cloudflare). Existing Deno is a transition runtime. Keep the same authenticated structured protocol and stateless adapter boundary for a later overseas host migration; do not introduce Deno KV or a second collection scheduler.
