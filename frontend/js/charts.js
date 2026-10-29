import {state,label} from './core.js';

export const palette=['#e87552','#3d8790','#9691c6','#ebbb70','#6697bb','#a6bfb3','#d69ca8','#8292a9'];
export const chartTypes=[['line','추세 분석','chart-line','시간에 따른 변화'],['bar','막대 차트','chart-column','범주별 크기 비교'],['area','영역 차트','chart-area','시간 흐름과 규모'],['pie','도넛 차트','chart-pie','전체에서 차지하는 비중'],['scatter','산점도','chart-scatter','두 수치의 관계'],['heatmap','히트맵','grid-3x3','교차 분포와 집중도'],['radar','레이더','radar','다차원 지표 비교'],['treemap','트리맵','panels-top-left','범주별 구성 비율'],['sunburst','선버스트','circle-dot','계층별 구성 탐색'],['sankey','생키','git-branch','두 범주 사이의 흐름'],['graph','관계 네트워크','network','범주 간 연결 관계'],['boxplot','박스 플롯','chart-candlestick','최솟값·사분위·최댓값'],['funnel','퍼널','filter','범주별 값의 순위'],['gauge','게이지','gauge','선택한 수치의 집계값']];
export const grid={left:52,right:24,top:24,bottom:40};
export const axis={axisLine:{show:false},axisTick:{show:false},axisLabel:{color:'#59697c',fontSize:13},splitLine:{lineStyle:{color:'#edf0f3',type:'dashed'}}};

// Match backend.analytics.number: missing, booleans and padded IDs are not zero.
export function finiteNumeric(value){
 if(value===null||value===undefined||typeof value==='boolean'||(typeof value==='string'&&!value.trim()))return null;
 if(typeof value==='string'&&/^[-+]?0\d/.test(value.trim()))return null;
 const n=Number(value);return Number.isFinite(n)&&Math.abs(n)<=1e100?n:null;
}
const category=value=>value===null||value===undefined||value===''?'(결측)':String(value);
const compareNames=(a,b)=>a<b?-1:a>b?1:0;
const newBucket=name=>({name,sum:0,count:0,valid_count:0,min:Infinity,max:-Infinity});
function add(bucket,value){bucket.count++;const n=finiteNumeric(value);if(n!==null){bucket.sum+=n;bucket.valid_count++;bucket.min=Math.min(bucket.min,n);bucket.max=Math.max(bucket.max,n);}return bucket;}
function amount(bucket,aggregation){
 if(aggregation==='count')return bucket.count;
 if(!bucket.valid_count)return null;
 return aggregation==='mean'?bucket.sum/bucket.valid_count:aggregation==='min'?bucket.min:aggregation==='max'?bucket.max:bucket.sum;
}
export function grouped(rows,key,value,aggregation='sum'){
 const map=new Map();for(const row of rows){const name=category(row[key]);const bucket=map.get(name)||newBucket(name);add(bucket,row[value]);map.set(name,bucket);}
 return [...map.values()].map(bucket=>({name:bucket.name,value:amount(bucket,aggregation),count:bucket.count,valid_count:bucket.valid_count}));
}
function pairs(rows,x,secondary,y,aggregation){
 const map=new Map();for(const row of rows){const a=category(row[x]),b=category(row[secondary]),key=JSON.stringify([a,b]);const item=map.get(key)||{a,b,bucket:newBucket(key)};add(item.bucket,row[y]);map.set(key,item);}
 return [...map.values()].map(v=>({a:v.a,b:v.b,value:amount(v.bucket,aggregation),count:v.bucket.count}));
}
function rankedNames(rows,key,limit){return grouped(rows,key,null,'count').sort((a,b)=>b.count-a.count||compareNames(a.name,b.name)).slice(0,limit).map(v=>v.name);}
function bounded(data,limit,notes,preserveOrder=false){
 if(data.length<=limit)return data;
 notes.push(`${preserveOrder?'입력순 처음':'집계값 상위'} ${limit}개 범주 / 전체 ${data.length}개`);
 return (preserveOrder?data:[...data].sort((a,b)=>(b.value??-Infinity)-(a.value??-Infinity)||compareNames(a.name,b.name))).slice(0,limit);
}
const finish=(option,notes)=>({...option,bapsNote:notes.filter(Boolean).join(' · ')});
const noData=message=>finish({series:[],graphic:{type:'text',left:'center',top:'middle',style:{text:message,fill:'#59697c',fontSize:13}}},[message]);

export function chart(el,option){
 const node=typeof el==='string'?document.querySelector(el):el;if(!node)return;
 const c=window.echarts.init(node,null,{renderer:'canvas'});state.charts.push(c);
 c.setOption({color:palette,animationDuration:450,textStyle:{fontFamily:'Noto Sans KR Variable, sans-serif',color:'#59697c',fontSize:13},aria:{enabled:true},tooltip:{trigger:'item',renderMode:'richText'},...option});
 return c;
}

export function buildOption(type,rows,{x,y,secondary,aggregation='sum'}={}){
 if(!rows.length)return noData('표시할 데이터가 없습니다.');
 const notes=[];
 if(!['sum','mean','count','min','max'].includes(aggregation))aggregation='sum';
 if(aggregation==='count'&&['scatter','boxplot'].includes(type))return noData(type==='scatter'?'산점도는 두 수치형 컬럼의 원자료를 사용합니다. 합계 또는 평균을 선택하세요.':'박스 플롯은 수치형 컬럼의 원자료를 사용합니다. 합계 또는 평균을 선택하세요.');
 if(aggregation!=='count'&&!rows.some(row=>finiteNumeric(row[y])!==null))return noData('숫자 컬럼을 선택하거나 집계를 행 수로 변경하세요.');
 let data=grouped(rows,x,y,aggregation);
 const aggLabel={sum:'합계',mean:'평균',count:'행 수',min:'최솟값',max:'최댓값'}[aggregation];
 notes.push(aggregation==='count'?'행 수 집계':`${aggLabel} · 결측·비수치 제외`);
 if(['pie','treemap','sunburst','funnel','sankey'].includes(type)&&data.some(v=>v.value!==null&&v.value<0))return noData('이 차트는 음수 값을 표현할 수 없습니다. 막대·선 차트를 선택하세요.');
 if(['line','bar','area','pie','radar','treemap','sunburst','boxplot','funnel'].includes(type))data=bounded(data,type==='line'||type==='area'?500:type==='radar'?12:50,notes,type==='line'||type==='area');
 const categories=data.map(v=>v.name);
 const base={grid,tooltip:{trigger:'axis',renderMode:'richText'},xAxis:{type:'category',data:categories,...axis},yAxis:{type:'value',...axis},toolbox:{show:false}};

 if(['line','bar','area'].includes(type))return finish({...base,dataZoom:categories.length>24?[{type:'inside'},{type:'slider',height:16,bottom:2}]:[],series:[{type:type==='bar'?'bar':'line',data:data.map(v=>v.value),smooth:true,symbolSize:6,showSymbol:categories.length<20,connectNulls:false,lineStyle:{width:3},barMaxWidth:42,itemStyle:{borderRadius:type==='bar'?[4,4,0,0]:0},areaStyle:type==='area'?{opacity:.13}:undefined}]},notes);
 if(type==='pie')return finish({tooltip:{trigger:'item',renderMode:'richText'},legend:{bottom:5,icon:'circle',itemWidth:8,type:'scroll'},series:[{type:'pie',radius:['48%','72%'],center:['50%','44%'],itemStyle:{borderColor:'#fff',borderWidth:4,borderRadius:5},label:{show:false},emphasis:{label:{show:true,fontSize:15,fontWeight:700}},data:data.filter(v=>v.value!==null)}]},notes);

 if(type==='scatter'){
  const valid=rows.map(r=>[finiteNumeric(r[y]),finiteNumeric(r[secondary])]).filter(p=>p.every(v=>v!==null));
  if(!valid.length)return noData('산점도에는 유효한 숫자 컬럼 두 개가 필요합니다.');
  return finish({...base,xAxis:{type:'value',name:label(y),...axis},yAxis:{type:'value',name:label(secondary),...axis},tooltip:{trigger:'item',renderMode:'richText'},series:[{type:'scatter',symbolSize:9,itemStyle:{opacity:.7},data:valid.slice(0,5000)}]},['원자료 수치 쌍 · 결측·비수치 제외',valid.length>5000?`입력순 처음 5,000점 / 전체 ${valid.length}점`:'']);
 }

 if(type==='heatmap'){
  const xs=rankedNames(rows,x,40),ys=rankedNames(rows,secondary,40),xi=new Map(xs.map((v,i)=>[v,i])),yi=new Map(ys.map((v,i)=>[v,i]));
  const values=pairs(rows,x,secondary,y,aggregation).filter(v=>xi.has(v.a)&&yi.has(v.b)&&v.value!==null).map(v=>[xi.get(v.a),yi.get(v.b),v.value]);
  if(!values.length)return noData('선택한 컬럼 조합에 유효한 값이 없습니다.');
  return finish({grid:{left:64,right:20,top:18,bottom:70},tooltip:{renderMode:'richText'},xAxis:{type:'category',data:xs,...axis,splitArea:{show:true}},yAxis:{type:'category',data:ys,...axis},visualMap:{min:Math.min(0,...values.map(v=>v[2])),max:Math.max(1,...values.map(v=>v[2])),calculable:false,orient:'horizontal',left:'center',bottom:2,itemHeight:120,itemWidth:8,inRange:{color:['#f9eee7','#efba9e','#df704c']}},series:[{type:'heatmap',data:values,itemStyle:{borderColor:'#fff',borderWidth:2,borderRadius:3},emphasis:{itemStyle:{borderColor:'#152536'}}}]},[...notes,'각 축 빈도 상위 40개 범주 이내 · 값 없는 조합은 빈칸']);
 }

 if(type==='radar'){
  if(data.some(v=>v.value!==null&&v.value<0))return noData('음수 지표는 막대 차트로 비교하세요.');
  const max=Math.max(1,...data.map(d=>d.value??0))*1.15;
  return finish({tooltip:{renderMode:'richText'},radar:{indicator:data.map(d=>({name:d.name,max})),radius:'65%',splitArea:{areaStyle:{color:['#fafbfc','#f3f6f8']}}},series:[{type:'radar',data:[{value:data.map(d=>d.value),name:label(y)||'행 수'}],areaStyle:{opacity:.2}}]},notes);
 }
 if(type==='treemap')return finish({tooltip:{renderMode:'richText'},series:[{type:'treemap',data:data.filter(v=>v.value!==null),roam:false,breadcrumb:{show:false},label:{show:true,formatter:'{b}\n{c}'},itemStyle:{borderWidth:3,borderColor:'#fff'},top:12,bottom:12,left:12,right:12}]},notes);
 if(type==='sunburst'){
  const selected=new Set(categories),byParent=new Map();
  for(const v of pairs(rows,x,secondary,y,aggregation)){if(!selected.has(v.a)||v.value===null)continue;if(v.value<0)return noData('선버스트는 음수 값을 표현할 수 없습니다.');const children=byParent.get(v.a)||[];children.push({name:v.b,value:v.value});byParent.set(v.a,children);}
  let budget=200-categories.length,omitted=0;
  const tree=data.map(parent=>{const all=byParent.get(parent.name)||[];all.sort((a,b)=>b.value-a.value||compareNames(a.name,b.name));const keep=all.slice(0,Math.min(3,budget));budget-=keep.length;omitted+=all.length-keep.length;return {name:parent.name,children:keep};}).filter(p=>p.children.length);
  if(omitted)notes.push(`상위 범주당 하위 3개 이내 · 하위 ${omitted}개 생략`);
  if(['mean','min','max'].includes(aggregation))notes.push(`각 조각은 하위 범주 ${aggLabel} · 상위 면적은 하위 값의 합`);
  return finish({tooltip:{renderMode:'richText'},series:[{type:'sunburst',radius:['12%','90%'],data:tree,label:{rotate:'radial'},itemStyle:{borderWidth:2,borderColor:'#fff'}}]},notes);
 }

 if(type==='graph'||type==='sankey'){
  let links=pairs(rows,x,secondary,y,aggregation).filter(v=>v.value!==null);
  if(links.some(v=>v.value<0))return noData('연결 가중치는 음수가 될 수 없습니다. 다른 집계를 선택하세요.');
  links.sort((a,b)=>b.value-a.value||compareNames(a.a,b.a)||compareNames(a.b,b.b));
  const nodes=new Map(),kept=[];
  for(const link of links){const a='A: '+link.a,b='B: '+link.b,extra=(nodes.has(a)?0:1)+(nodes.has(b)?0:1);if(nodes.size+extra>50)continue;nodes.set(a,{name:a});nodes.set(b,{name:b});kept.push({source:a,target:b,value:link.value});if(kept.length>=150)break;}
  if(kept.length<links.length)notes.push(`가중치 순 최대 50노드·150연결 / 전체 ${links.length}연결`);
  return finish({tooltip:{renderMode:'richText'},series:[{type,data:[...nodes.values()],links:kept,layout:type==='graph'?'force':undefined,force:{repulsion:180,edgeLength:70},roam:type==='graph',draggable:true,symbolSize:22,label:{show:true,color:'#48576a'},lineStyle:{color:'source',opacity:.3,curveness:.3},emphasis:{focus:'adjacency'},left:60,right:80,top:25,bottom:25}]},notes);
 }

 if(type==='boxplot'){
  const buckets=new Map(categories.map(v=>[v,[]]));
  for(const row of rows){const n=finiteNumeric(row[y]),k=category(row[x]);if(n!==null&&buckets.has(k))buckets.get(k).push(n);}
  const q=(a,p)=>{const pos=(a.length-1)*p,lo=Math.floor(pos);return a[lo]+(a[Math.min(lo+1,a.length-1)]-a[lo])*(pos-lo);};
  const values=categories.map(k=>{const a=buckets.get(k).sort((a,b)=>a-b);return a.length?[a[0],q(a,.25),q(a,.5),q(a,.75),a.at(-1)]:null;});
  return finish({...base,series:[{type:'boxplot',data:values}]},['원자료 분포 · 결측·비수치 제외','수염 = 최솟값·최댓값 (1.5×IQR 아님)',...notes.filter(v=>v.includes('범주'))]);
 }
 if(type==='funnel')return finish({tooltip:{renderMode:'richText'},series:[{type:'funnel',left:'15%',width:'70%',top:20,bottom:20,label:{position:'inside'},data:data.filter(v=>v.value!==null)}]},notes);
 if(type==='gauge'){
  const total=newBucket('all');rows.forEach(r=>add(total,r[y]));const value=amount(total,aggregation);
  if(value===null)return noData('유효한 숫자가 없습니다.');
  const min=Math.min(0,value<0?value*1.1:0),max=Math.max(1,value>0?value*1.1:0);
  return finish({series:[{type:'gauge',min,max,progress:{show:true,width:18},axisLine:{lineStyle:{width:18}},axisTick:{show:false},splitLine:{length:8},detail:{valueAnimation:true,formatter:v=>Number(v.toFixed(1)).toLocaleString()},data:[{value,name:(aggregation==='count'?'전체':label(y))+' '+aggLabel}]}]},[...notes,'축 범위 자동 · 목표 달성률이 아닙니다']);
 }
 return noData('지원하지 않는 차트 유형입니다.');
}
