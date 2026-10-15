// Readiness only: this module never provisions roles, runs migrations or changes timers.
export type DeploymentColumn = { table: string; column: string; readable: boolean; writable: boolean };
export function evaluateCollectionDeployment(
  expected: Array<{ table: string; columns: string[]; requireWrite?: boolean }>,
  actual: DeploymentColumn[]
) {
  const columns = new Map(actual.map(x => [x.table + "." + x.column, x]));
  const missingColumns: string[] = [];
  const permissionDenied: string[] = [];
  for (const table of expected) for (const column of table.columns) {
    const key = table.table + "." + column;
    const found = columns.get(key);
    if (!found) missingColumns.push(key);
    else if (!found.readable || (table.requireWrite !== false && !found.writable)) permissionDenied.push(key);
  }
  return {
    status: expected.length && !missingColumns.length && !permissionDenied.length ? "READY" : "BLOCKED",
    missingColumns, permissionDenied
  };
}

export function collectionIdentityBlockers(adminExists: boolean | null, superuser: boolean) {
  const blockers: string[] = [];
  if (adminExists === null) blockers.push("ADMIN_IDENTITY_NOT_CHECKABLE");
  else if (!adminExists) blockers.push("ADMIN_USER_REQUIRED");
  if (superuser) blockers.push("SUPERUSER_APP_ROLE_BLOCKED");
  return blockers;
}

export type CollectionMigration = { tag: string; when: number; hash: string; destructive: string[] };
export function planCollectionMigrations(local: CollectionMigration[], applied: { hash: string; createdAt: number }[]) {
  const blockers: string[] = [];
  let previous = -1;
  for (const entry of local) {
    if (entry.when <= previous) blockers.push("LOCAL_JOURNAL_ORDER_INVALID");
    previous = entry.when;
  }
  for (let index = 0; index < applied.length; index++) {
    const row = applied[index];
    const expected = local[index];
    if (!expected || expected.when !== row.createdAt || expected.hash !== row.hash)
      blockers.push("APPLIED_MIGRATION_DRIFT:" + index);
  }
  return { status: blockers.length ? "BLOCKED" : "PLAN_ONLY", blockers,
    appliedCount: applied.length,
    pending: blockers.length ? [] : local.slice(applied.length),
    execution: "NO_DDL_EXECUTED_BACKUP_RESTORE_AND_MIGRATION_ROLE_GATE_REQUIRED" };
}
