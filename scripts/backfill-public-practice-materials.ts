import {loadEnvConfig} from "@next/env";
import {and,eq} from "drizzle-orm";
import {backfillPracticeMaterials} from "../lib/server/content/practice-material-backfill";
import {withSourceCollectionCycleLock} from "../lib/server/content/source-runtime-governance-execution";
import {getDatabase,closeDatabase} from "../lib/server/db";
import {users} from "../lib/server/db/schema";
import {assertCurrentDatabaseTarget} from "../lib/server/database-target";
loadEnvConfig(process.cwd());
async function main(){
 const target=assertCurrentDatabaseTarget(),apply=process.argv.includes("--apply");
 if(apply && target.environment==="production" && !process.argv.includes("--confirm=PUBLIC-MATERIALS-PRODUCTION"))throw new Error("PRODUCTION_MATERIAL_BACKFILL_CONFIRMATION_REQUIRED");
 const limit=Number(process.argv.find(x=>x.startsWith("--limit="))?.slice(8)??2);
 if(!Number.isSafeInteger(limit)||limit<1||limit>20)throw new Error("MATERIAL_LIMIT_OUT_OF_RANGE");
 const [admin]=await getDatabase().select().from(users).where(and(eq(users.role,"ADMIN"),eq(users.accountStatus,"ACTIVE"))).limit(1);
 if(!admin)throw new Error("ADMIN_USER_REQUIRED");
 const result=await withSourceCollectionCycleLock(()=>backfillPracticeMaterials({...admin,email:"local-admin@opc.invalid",role:"ADMIN"},{limit,apply}));
 console.log(JSON.stringify({database:target.databaseName,...result},null,2));
}
main().catch(e=>{console.error(e instanceof Error?e.message:"MATERIAL_BACKFILL_FAILED");process.exitCode=1}).finally(closeDatabase);
