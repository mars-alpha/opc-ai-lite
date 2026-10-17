import 'server-only';
import {randomUUID} from 'node:crypto';
import {eq,sql} from 'drizzle-orm';
import {getDatabase} from '../db';
import {contentRadarSnapshots} from '../db/schema';
import {recordContentAudit} from './workbench';
import type {AuthUser} from '../auth/service';
import {DEFAULT_RADAR_ALGORITHM_POLICY,RADAR_ALGORITHM_POLICY_VERSION,validateRadarAlgorithmPolicy,type RadarAlgorithmPolicy} from '../../content/radar-algorithm-policy';
export const RADAR_ALGORITHM_POLICY_KEY='radar-algorithm-policy-v1';
export type RadarAlgorithmEnvelope={version:string;revision:string;updatedAt:string|null;policy:RadarAlgorithmPolicy};
type DB=ReturnType<typeof getDatabase>;
export async function readRadarAlgorithmPolicy(db:DB=getDatabase()):Promise<RadarAlgorithmEnvelope>{
 const [row]=await db.select({payload:contentRadarSnapshots.payload}).from(contentRadarSnapshots).where(eq(contentRadarSnapshots.key,RADAR_ALGORITHM_POLICY_KEY)).limit(1);
 if(!row)return {version:RADAR_ALGORITHM_POLICY_VERSION,revision:'defaults',updatedAt:null,policy:structuredClone(DEFAULT_RADAR_ALGORITHM_POLICY)};
 const payload=row.payload as RadarAlgorithmEnvelope;
 if(payload.version!==RADAR_ALGORITHM_POLICY_VERSION||typeof payload.revision!=='string'||!payload.revision)throw new Error('RADAR_ALGORITHM_POLICY_INVALID');
 return {...payload,policy:validateRadarAlgorithmPolicy(payload.policy)};
}
export async function saveRadarAlgorithmPolicy(value:unknown,expectedRevision:unknown,user:AuthUser){
 const policy=validateRadarAlgorithmPolicy(value);
 if(typeof expectedRevision!=='string'||expectedRevision.length>100)throw new Error('RADAR_ALGORITHM_REVISION_REQUIRED');
 return getDatabase().transaction(async tx=>{
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${RADAR_ALGORITHM_POLICY_KEY}))`);
  const before=await readRadarAlgorithmPolicy(tx as unknown as DB);
  if(before.revision!==expectedRevision)throw new Error('RADAR_ALGORITHM_POLICY_CONFLICT');
  const now=new Date(),payload:RadarAlgorithmEnvelope={version:RADAR_ALGORITHM_POLICY_VERSION,revision:randomUUID(),updatedAt:now.toISOString(),policy};
  await tx.insert(contentRadarSnapshots).values({key:RADAR_ALGORITHM_POLICY_KEY,payload,generatedAt:now,updatedAt:now}).onConflictDoUpdate({target:contentRadarSnapshots.key,set:{payload,generatedAt:now,updatedAt:now}});
  await recordContentAudit(user,{action:'RADAR_ALGORITHM_UPDATED',entityType:'SOURCE_POLICY',entityId:RADAR_ALGORITHM_POLICY_KEY,before,after:payload,metadata:{effective:'NEXT_SYSTEM_SNAPSHOT',factAuthorityChanged:false}},tx);
  return payload;
 });
}
