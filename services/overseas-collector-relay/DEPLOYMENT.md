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

- Work from a clean code-only directory containing `deno.ts`; never upload the repository root, `.env`, database material or server credentials.
- Existing organization/application should be reused after its owner confirms identity. Runtime dynamic; entrypoint `deno.ts`; no npm install/build command required.
- Set Production context secrets through the console: `OVERSEAS_COLLECTOR_RELAY_SECRET` (same existing shared secret), `YOUTUBE_DATA_API_KEY`. Optional nonsecret `GOOGLE_TRENDS_GEO=US`. Relay has **no DATABASE_URL**.
- Authenticate the CLI with `deno deploy` browser authorization, or put a scoped `DENO_DEPLOY_TOKEN` in a protected server deployment-only file. Provide the organization/app names and file path, not the token in chat.
- First deploy a preview with `deno deploy --org <org> --app <app>` from that clean directory. Validate authentication and fixed providers; only then promote/deploy production with `--prod` and retain the old deployment for rollback.
- Current fixed providers: `YOUTUBE_AI_TREND`, `GOOGLE_TRENDS`, `DEEPMIND_FEED`, `GITHUB_TREND_PROXY`; X code is not a current enabled source. No arbitrary caller URL is accepted. DeepMind/GitHub disallow upstream redirects.
- `/health` must return200 and version `relay-public-sources-v2`, with the two new provider capabilities. Invalid bearer must401; unknown provider400; valid bounded requests must return real data. A health503 is a deployment blocker, not collection success.
- Only after the deployed service passes these checks enable `OVERSEAS_COLLECTOR_RELAY_PUBLIC_SOURCES=v2` in the collection environment. Until then new public-source consumers remain disabled; do not remove the old URL/secret. Other overseas Feed routes still need individual Relay coverage and verified fallback work.
- Total upstream budget16s; YouTube search10s/stats5s; Google/DeepMind/GitHub12s. The client deadline20s; missing YouTube statistics preserve search results. Expensive API searches are not automatically retried.

## Hosting lifecycle

Deno announced on2026-10-09 that Deploy will operate for six more months before shutting down: [official announcement](https://deno.com/blog/cloudflare). Existing Deno is a transition runtime. Keep the same authenticated structured protocol and stateless adapter boundary for a later overseas host migration; do not introduce Deno KV or a second collection scheduler.
