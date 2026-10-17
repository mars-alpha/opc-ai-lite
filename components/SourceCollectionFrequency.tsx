"use client";
import {useEffect,useState} from 'react';
import type {listSourceCollectionSchedules} from '../lib/server/content/source-collection-schedule-store';
type Model=Awaited<ReturnType<typeof listSourceCollectionSchedules>>;
const endpoint='/api/admin/content/source-management';
function message(e:unknown){const code=e instanceof Error?e.message:'请求失败';return code==='SOURCE_SCHEDULE_CONFLICT'?'频率已被其他管理员修改，请重新读取后再保存。':code.startsWith('INVALID_SOURCE_SCHEDULE')?'频率必须为5–1440的整数分钟，且目标需属于当前来源目录。':code;}
function date(v:string|null|undefined){return v?new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v)):'—';}
export function SourceCollectionFrequency(){
 const [data,setData]=useState<Model|null>(null),[scope,setScope]=useState('ALL'),[minutes,setMinutes]=useState('15'),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 async function load(){const r=await fetch(endpoint+'?mode=frequency',{cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.error??'读取失败');setData(d as Model);return d as Model;}
 useEffect(()=>{let active=true;setBusy(true);load().catch(e=>{if(active)setNotice(message(e));}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[]);
 async function reload(){setBusy(true);setNotice('');try{await load();}catch(e){setNotice(message(e));}finally{setBusy(false);}}
 function select(id:string){setScope(id);setNotice('');if(id!=='ALL'){const item=data?.items.find(r=>r.sourceId===id);if(item)setMinutes(String(item.intervalMinutes));}}
 async function save(){if(!data)return;const intervalMinutes=Number(minutes);if(!minutes.trim()||!Number.isInteger(intervalMinutes)||intervalMinutes<5||intervalMinutes>1440){setNotice('频率必须为5–1440的整数分钟。');return;}
  const selected=data.items.filter(r=>scope==='ALL'||r.sourceId===scope);if(!selected.length){setNotice('当前没有可修改来源。');return;}
  setBusy(true);setNotice('');try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'SAVE_SOURCE_FREQUENCY',changes:selected.map(r=>({sourceId:r.sourceId,intervalMinutes,expectedRevision:r.revision}))})});const result=await response.json();if(!response.ok)throw Error(result.error??'保存失败');setNotice(`已保存 ${result.updated.length} 个来源。新频率将在下次 SYSTEM 到期检查时使用；正在运行的任务继续完成。`);await load();}catch(e){setNotice(message(e));}finally{setBusy(false);}
 }
 return <section className="source-frequency-panel">
  <strong>采集频率</strong><p>调整来源两次正式采集之间的基础间隔。可单独设置，也可批量修改当前目录；批量不改变以后新增来源的默认值。</p>
  {notice?<p role="status" className="source-message">{notice}</p>:null}
  {!data?<div className="source-loading">{busy?'正在读取频率与调度状态…':'尚未读取配置。'}<button type="button" disabled={busy} onClick={()=>void reload()}>重试</button></div>:<>
   <div className="source-frequency-form"><label>修改范围<select aria-label="频率修改范围" disabled={busy} value={scope} onChange={e=>select(e.target.value)}><option value="ALL">全部当前来源（{data.items.length}个）</option>{data.items.map(r=><option key={r.sourceId} value={r.sourceId}>{r.name}{!r.enabled?'（停用）':''}</option>)}</select></label><label>基础采集间隔（分钟）<input aria-label="基础采集间隔（分钟）" type="number" min={5} max={1440} step={1} value={minutes} disabled={busy} onChange={e=>setMinutes(e.target.value)}/></label><button type="button" className="source-btn source-btn-primary" disabled={busy||!data.items.length} onClick={()=>void save()}>{busy?'处理中…':scope==='ALL'?'保存到全部当前来源':'保存该来源频率'}</button><button type="button" className="source-btn" disabled={busy} onClick={()=>void reload()}>重新读取状态</button></div>
   <p className="source-algorithm-help">保存后从最近一次正式 SYSTEM 采集开始时间重新计算到期；调短后已到期的来源会进入下一轮，调长则继续等待。治理降频、配额及未完成周期可能延后实际执行，停用或无资格来源不会因保存而启动。唯一调度器按分钟检查到期来源，实际运行以部署配置为准。</p>
   <div className="source-frequency-table"><table><thead><tr><th>来源</th><th>基础间隔</th><th>有效间隔</th><th>最近正式采集</th><th>预计到期</th><th>状态</th><th>操作</th></tr></thead><tbody>{data.items.map(r=><tr key={r.sourceId}><th scope="row">{r.name}</th><td>{r.intervalMinutes} 分钟</td><td>{r.effectiveIntervalMinutes?`${r.effectiveIntervalMinutes} 分钟`:'—'}</td><td>{date(r.lastRunAt)}</td><td>{r.enabled?date(r.nextDueAt):'—'}</td><td title={r.reason}>{r.action==='DISABLED'?'已停用':r.action==='RUN_WHEN_DUE'?'已到期':r.action==='WAIT_UNTIL_DUE'?'等待到期':r.action==='HUMAN_REVIEW_REQUIRED'?'受治理约束':'资格未就绪'}</td><td><button type="button" disabled={busy} onClick={()=>select(r.sourceId)}>调整</button></td></tr>)}</tbody></table></div>
   <small>状态读取于 {date(data.asOf)}；保存不触发立即采集，不改变来源身份、采集路由或启用状态。基础频率默认15分钟，允许5–1440分钟。</small>
  </>}
 </section>;
}
