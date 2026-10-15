import assert from "node:assert/strict";
import fs from "node:fs";
import { evaluateCollectionDeployment, collectionIdentityBlockers, planCollectionMigrations } from "../lib/server/content/collection-deployment";

const expected = [{ table: "content_events", columns: ["id", "metadata"] }];
const ready = [{ table: "content_events", column: "id", readable: true, writable: true },
  { table: "content_events", column: "metadata", readable: true, writable: true }];
assert.equal(evaluateCollectionDeployment(expected, ready).status, "READY");
assert.equal(evaluateCollectionDeployment(expected, []).status, "BLOCKED");
assert.deepEqual(evaluateCollectionDeployment(expected, ready.slice(0, 1)).missingColumns, ["content_events.metadata"]);
assert.equal(evaluateCollectionDeployment(expected, ready.map(x => ({ ...x, writable: false }))).status, "BLOCKED");
assert.equal(evaluateCollectionDeployment(expected, ready.map(x => ({ ...x, readable: false }))).status, "BLOCKED");
assert.equal(evaluateCollectionDeployment([], []).status, "BLOCKED");
assert.equal(evaluateCollectionDeployment(expected, [...ready, { table: "unrelated", column: "x", readable: false, writable: false }]).status, "READY");
assert.equal(evaluateCollectionDeployment([{ table: "users", columns: ["role"], requireWrite: false }],
  [{ table: "users", column: "role", readable: true, writable: false }]).status, "READY");
assert.deepEqual(collectionIdentityBlockers(null, false), ["ADMIN_IDENTITY_NOT_CHECKABLE"]);
assert.deepEqual(collectionIdentityBlockers(false, false), ["ADMIN_USER_REQUIRED"]);
assert.deepEqual(collectionIdentityBlockers(true, true), ["SUPERUSER_APP_ROLE_BLOCKED"]);
assert.deepEqual(collectionIdentityBlockers(true, false), []);
const preflight = fs.readFileSync("scripts/check-collection-deployment.ts", "utf8");
assert(preflight.includes('canReadAdminIdentity'), "MISSING_USERS_MUST_NOT_ABORT_SCHEMA_REPORT");
console.log("COLLECTION_DEPLOYMENT_SCHEMA_AND_ROLE_GATES=PASS");
const flag = "--network-family-autoselection-attempt-timeout=2000";
assert(fs.readFileSync("deploy/systemd/opc-collection.service", "utf8").includes(flag), "SERVER_NODE_CONNECTION_ATTEMPT_BUDGET");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const name of ["content:automatic:server-native-cycle", "content:automatic:server-native-cycle:production"]) {
  assert(pkg.scripts[name].includes(flag), "CLI_AND_SERVICE_CONNECTION_POLICY_MATCH:" + name);
}
console.log("COLLECTION_DEPLOYMENT_NODE_NETWORK_BUDGET=PASS");

const migrationFixtures = [
  { tag: "a", when: 1, hash: "ha", destructive: [] },
  { tag: "b", when: 2, hash: "hb", destructive: ["DROP TABLE old"] }
];
assert.deepEqual(planCollectionMigrations(migrationFixtures, [{ hash: "ha", createdAt: 1 }]).pending, migrationFixtures.slice(1));
assert.equal(planCollectionMigrations(migrationFixtures, [{ hash: "changed", createdAt: 1 }]).status, "BLOCKED");
assert.equal(planCollectionMigrations(migrationFixtures, [{ hash: "hb", createdAt: 2 }]).status, "BLOCKED");
assert.equal(planCollectionMigrations([...migrationFixtures].reverse(), []).status, "BLOCKED");
console.log("COLLECTION_MIGRATION_PREFIX_HASH_AND_DESTRUCTIVE_PLAN=PASS");
