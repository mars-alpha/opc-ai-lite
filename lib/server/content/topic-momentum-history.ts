import {createHash} from 'node:crypto';
export type MomentumHistoryPoint={at:string;version:string;inputVersion:string;algorithmRevision:string|number;score:number;participantCount:number;components:unknown};
export const momentumInputHash=(input:unknown)=>createHash('sha256').update(JSON.stringify(input)).digest('hex');
export function readMomentumHistory(value:unknown,version:string):MomentumHistoryPoint[]{
 return Array.isArray(value)?value.filter((p):p is MomentumHistoryPoint=>Boolean(p&&typeof p==='object'&&p.version===version&&typeof p.at==='string'&&Number.isFinite(Date.parse(p.at))&&typeof p.inputVersion==='string'&&Number.isFinite(p.score)&&Number.isFinite(p.participantCount))):[];
}
/** Six-hour actual observations only. Never fills missing historical slots. */
export function appendMomentumHistory(value:unknown,point:MomentumHistoryPoint){
 const at=Date.parse(point.at),slot=Math.floor(at/21600000);
 const same=readMomentumHistory(value,point.version).find(p=>Math.floor(Date.parse(p.at)/21600000)===slot&&p.inputVersion===point.inputVersion);
 if(same)return readMomentumHistory(value,point.version);
 return [...readMomentumHistory(value,point.version).filter(p=>Date.parse(p.at)>=at-168*3600000&&Date.parse(p.at)<=at&&Math.floor(Date.parse(p.at)/21600000)!==slot),point].slice(-29);
}
