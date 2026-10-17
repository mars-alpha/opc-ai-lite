/** Shared configuration schema. Hard evidence/identity/security gates are not editable. */
export const RADAR_ALGORITHM_POLICY_VERSION='radar-algorithm-policy-v1';
export const DEFAULT_RADAR_ALGORITHM_POLICY={
 hot:{halfLifeHours:72,risingThreshold:30,sustainedThreshold:42,discussionThreshold:42,participantWeight:18,participantCap:60,activeDayWeight:5,activeDayCap:15,creatorWeight:4,creatorCap:10,diversityWeight:3,diversityCap:10,engagementBonus:5,minSustainedPublishers:2,minActiveDays:2,includeTerms:[] as string[],excludeTerms:[] as string[]},
 featured:{threshold:66,topPickThreshold:78,maxAgeHours:72,weights:{freshness:23,evidenceQuality:28,importance:32,practicalValue:7,independence:7,corroboration:3},includeTerms:[] as string[],excludeTerms:[] as string[]},
 practice:{minPublishers:2,includeTerms:[] as string[],excludeTerms:[] as string[]}
};
export type RadarAlgorithmPolicy=typeof DEFAULT_RADAR_ALGORITHM_POLICY;
export type ColumnPolicySection=keyof RadarAlgorithmPolicy;
export const ALGORITHM_FIELDS:Record<ColumnPolicySection,Array<{key:string;label:string;min:number;max:number;step?:number}>>={
 hot:[
  {key:'halfLifeHours',label:'热度半衰期（小时）',min:1,max:168},
  {key:'risingThreshold',label:'早期升温最低分',min:1,max:100},
  {key:'sustainedThreshold',label:'持续热点最低分',min:1,max:100},
  {key:'discussionThreshold',label:'独立讨论最低分',min:1,max:100},
  {key:'participantWeight',label:'独立发布者贡献系数',min:0,max:100},
  {key:'participantCap',label:'发布者贡献最高分',min:0,max:100},
  {key:'activeDayWeight',label:'每个活跃日加分',min:0,max:100},
  {key:'activeDayCap',label:'活跃日加分上限',min:0,max:100},
  {key:'creatorWeight',label:'每个创作者加分',min:0,max:100},
  {key:'creatorCap',label:'创作者加分上限',min:0,max:100},
  {key:'diversityWeight',label:'跨平台/实践多样性系数',min:0,max:100},
  {key:'diversityCap',label:'多样性加分上限',min:0,max:100},
  {key:'engagementBonus',label:'存在互动证据加分',min:0,max:100},
  {key:'minSustainedPublishers',label:'持续热点最少独立发布者',min:2,max:20},
  {key:'minActiveDays',label:'持续热点最少活跃日',min:1,max:7}
 ],
 featured:[{key:'threshold',label:'精选最低分',min:1,max:100},{key:'topPickThreshold',label:'重点精选最低分',min:1,max:100},{key:'maxAgeHours',label:'精选最长时效（小时）',min:1,max:168}],
 practice:[{key:'minPublishers',label:'最少独立原始发布者',min:2,max:20}]
};
export const FEATURED_WEIGHT_LABELS={freshness:'新鲜度',evidenceQuality:'证据质量',importance:'重要程度',practicalValue:'实践价值',independence:'独立性',corroboration:'事实印证'};
export const COLUMN_HARD_RULES={
 hot:['最近7日窗口，0–24h升温／24–168h持续追踪','同一发布者归一，聚合转载不能获得事实权','排除多新闻汇总；热度不代表事实可信度','持续热点还需创作者、跨平台或实践支持；独立讨论路径需至少2个发布者与实质讨论'],
 featured:['AI相关性与已确认官方／媒体证据','必须有明确实质变化（MAJOR／NORMAL）','重点精选另需更强实践或独立印证条件'],
 practice:['仅Skill／MCP／Agent／工作流等可实操工具主题','实质分析／应用讨论，不以纯模型发布或上架替代','至少一份共享材料校验通过的真实原文链接','来源、事件关联、材料获取资格不可由词表绕过']
};
function object(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))throw new Error('RADAR_ALGORITHM_POLICY_INVALID');return v as Record<string,unknown>;}
function exact(v:Record<string,unknown>,keys:string[]){if(Object.keys(v).length!==keys.length||Object.keys(v).some(k=>!keys.includes(k)))throw new Error('RADAR_ALGORITHM_POLICY_INVALID');}
export function validateRadarAlgorithmPolicy(value:unknown):RadarAlgorithmPolicy{
 const root=object(value);exact(root,['hot','featured','practice']);
 for(const section of ['hot','featured','practice'] as const){
  const row=object(root[section]);exact(row,Object.keys(DEFAULT_RADAR_ALGORITHM_POLICY[section]));
  for(const field of ALGORITHM_FIELDS[section]){const n=row[field.key];if(typeof n!=='number'||!Number.isFinite(n)||!Number.isInteger(n)||n<field.min||n>field.max)throw new Error('RADAR_ALGORITHM_POLICY_INVALID');}
  for(const key of ['includeTerms','excludeTerms']){const terms=row[key];if(!Array.isArray(terms)||terms.length>80||terms.some(t=>typeof t!=='string'||!t.trim()||t!==t.trim()||t.length>80)||new Set(terms.map(t=>t.toLowerCase())).size!==terms.length)throw new Error('RADAR_ALGORITHM_POLICY_INVALID');}
 }
 const featured=object(root.featured),weights=object(featured.weights);exact(weights,Object.keys(FEATURED_WEIGHT_LABELS));
 if(Object.values(weights).some(n=>typeof n!=='number'||!Number.isInteger(n)||n<0||n>100)||Object.values(weights).reduce<number>((sum,n)=>sum+Number(n),0)!==100||Number(featured.topPickThreshold)<Number(featured.threshold))throw new Error('RADAR_ALGORITHM_POLICY_INVALID');
 return structuredClone(value) as RadarAlgorithmPolicy;
}
export function columnTextDecision(text:string,policy:{includeTerms:string[];excludeTerms:string[]}){
 const normalized=text.normalize('NFKC').toLowerCase();
 const matches=(term:string)=>{const t=term.normalize('NFKC').toLowerCase();return /^[a-z0-9][a-z0-9+.#-]*$/i.test(t)?new RegExp('(^|[^a-z0-9])'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z0-9]|$)','i').test(normalized):normalized.includes(t);};
 const excluded=policy.excludeTerms.filter(matches),matched=policy.includeTerms.filter(matches);
 return {eligible:excluded.length===0&&(!policy.includeTerms.length||matched.length>0),matched,excluded};
}
