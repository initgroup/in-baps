import {finiteNumeric,categoryValue} from './charts.js';

const countText=value=>value.toLocaleString('ko-KR');
const text=value=>value===null||value===undefined?'':String(value);
const pairKey=(a,b)=>JSON.stringify([a,b]);
const addIndex=(map,key,index)=>{const list=map.get(key)||[];list.push(index);map.set(key,list);};
const union=lists=>[...new Set(lists.flat())].sort((a,b)=>a-b);

// Map the *rendered option* to its source rows. Labels alone are not reliable:
// hierarchy children can have the same name, and graph endpoints have two roles.
export function createDrillModel(type,rows,settings,option){
 const {x,y,secondary,aggregation='sum'}=settings;
 const groups=new Map(),pairs=new Map(),items=[],lookup=new Map(),byEvent=new Map(),rowItems=new Map();
 rows.forEach((row,index)=>{const a=categoryValue(row[x]),b=categoryValue(row[secondary]);addIndex(groups,a,index);addIndex(pairs,pairKey(a,b),index);});
 const valid=index=>aggregation==='count'||(finiteNumeric(rows[index][y])!==null&&(type!=='scatter'||finiteNumeric(rows[index][secondary])!==null));
 const add=(title,indices,{event,raw,parentId=null,note=''}={})=>{
  const item={id:'detail-'+items.length,title,indices:[...indices],usedIndices:indices.filter(valid),parentId,note,event};
  items.push(item);lookup.set(item.id,item);
  if(event)byEvent.set((event.dataType||'data')+':'+event.dataIndex,item);
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))raw.bapsDrillId=item.id;
  for(const index of item.usedIndices)addIndex(rowItems,index,item.id);
  return item;
 };
 const series=option.series?.[0];
 const pointEvent=(dataIndex,dataType)=>({seriesIndex:0,dataIndex,...(dataType?{dataType}:{})});
 const fieldTitle=(field,value)=>`${field}: ${value}`;
 let groupClick=null;
 if(series){
  if(['line','bar','area','boxplot'].includes(type)){
   (series.data||[]).forEach((value,index)=>{if(value===null)return;const name=option.xAxis?.data?.[index];if(name===undefined)return;add(fieldTitle(x,name),groups.get(String(name))||[],{event:pointEvent(index)});});
  }else if(['pie','treemap','funnel'].includes(type)){
   (series.data||[]).forEach((value,index)=>add(fieldTitle(x,value.name),groups.get(value.name)||[],{raw:value,event:type==='treemap'?undefined:pointEvent(index)}));
   if(type==='treemap')series.nodeClick=false;
  }else if(type==='scatter'){
   // ECharts dataIndex is the original point index, not its position after a
   // brush/zoom operation. Keep duplicate coordinates as distinct source rows.
   const indices=rows.map((row,index)=>index).filter(index=>finiteNumeric(rows[index][y])!==null&&finiteNumeric(rows[index][secondary])!==null).slice(0,(series.data||[]).length);
   indices.forEach((source,index)=>add(`원본 ${countText(source+1)}행 · ${y}=${rows[source][y]}, ${secondary}=${rows[source][secondary]}`,[source],{event:pointEvent(index)}));
  }else if(type==='heatmap'){
   (series.data||[]).forEach((value,index)=>{const a=option.xAxis.data[value[0]],b=option.yAxis.data[value[1]];add(`${fieldTitle(x,a)} / ${fieldTitle(secondary,b)}`,pairs.get(pairKey(a,b))||[],{event:pointEvent(index)});});
  }else if(type==='sunburst'){
   for(const parent of series.data||[]){
    const children=parent.children||[],indices=union(children.map(child=>pairs.get(pairKey(parent.name,child.name))||[]));
    const parentItem=add(fieldTitle(x,parent.name),indices,{raw:parent,note:'현재 차트에 표시된 하위 범주의 원본 행입니다. 생략된 하위 범주는 포함하지 않습니다.'});
    for(const child of children)add(`${fieldTitle(x,parent.name)} / ${fieldTitle(secondary,child.name)}`,pairs.get(pairKey(parent.name,child.name))||[],{raw:child,parentId:parentItem.id});
   }
   series.nodeClick=false;
  }else if(type==='graph'||type==='sankey'){
   const nodeIndices=new Map();
   (series.links||[]).forEach((link,index)=>{
    // Names are built by charts.js from A/B roles. Slice only the known role
    // prefix; a user category containing ':' or 'A: ' remains intact.
    const a=String(link.source).slice(3),b=String(link.target).slice(3),indices=pairs.get(pairKey(a,b))||[];
    add(`${fieldTitle(x,a)} → ${fieldTitle(secondary,b)}`,indices,{raw:link,event:pointEvent(index,'edge')});
    for(const node of [link.source,link.target])nodeIndices.set(node,[...(nodeIndices.get(node)||[]),...indices]);
   });
   (series.data||[]).forEach((node,index)=>{
    const left=node.name.startsWith('A: ');add(fieldTitle(left?x:secondary,node.name.slice(3)),union([nodeIndices.get(node.name)||[]]),{raw:node,event:pointEvent(index,'node'),note:'현재 표시된 연결에 속한 원본 행입니다. 생략된 연결은 포함하지 않습니다.'});
   });
  }else if(type==='radar'){
   const displayed=(option.radar?.indicator||[]).map(indicator=>indicator.name);
   for(const name of displayed)if((groups.get(name)||[]).some(valid))add(fieldTitle(x,name),groups.get(name)||[]);
   groupClick=add('레이더 · 표시된 전체 지표',union(displayed.map(name=>groups.get(name)||[])),{raw:series.data?.[0],event:pointEvent(0),note:'레이더 도형 클릭은 표시된 전체 지표를 선택합니다. 개별 지표는 차트 항목 선택에서 확인하세요.'});
  }else if(type==='gauge'){
   groupClick=add('게이지 · 전체 집계',rows.map((row,index)=>index),{raw:series.data?.[0],event:pointEvent(0),note:'게이지는 전체 조회 행의 집계입니다.'});
  }
 }
 const usedIndices=union(items.map(item=>item.usedIndices));
 const all={id:'all',title:'전체 조회 데이터',indices:rows.map((row,index)=>index),usedIndices,parentId:null,note:'차트 포함 여부는 현재 차트의 범주·점 제한 및 결측·숫자 판별을 반영합니다.'};
 lookup.set('all',all);
 return {type,items,all,lookup,rowItems,
  resolve(event){
   if(event.componentType&&event.componentType!=='series')return null;
   if(event.seriesIndex!==undefined&&event.seriesIndex!==0)return null;
   if(event.data?.bapsDrillId)return lookup.get(event.data.bapsDrillId)||null;
   if(type==='sunburst'||type==='treemap')return null;
   if((type==='graph'||type==='sankey')&&!['node','edge'].includes(event.dataType))return null;
   if(groupClick)return groupClick;
   return byEvent.get((event.dataType||'data')+':'+event.dataIndex)||null;
  },
  forRow(index){return (rowItems.get(index)||[]).map(id=>lookup.get(id));},
 };
}

export function selectGridRows(rows,indices,columns,{query='',sortKey='',direction='asc',contributingOnly=false,usedIndices=[]}={}){
 const needle=query.trim().toLocaleLowerCase('ko-KR'),names=columns.map(col=>typeof col==='string'?col:col.name),used=new Set(usedIndices);
 let selected=indices.filter(index=>(!contributingOnly||used.has(index))&&(!needle||names.some(name=>text(rows[index][name]).toLocaleLowerCase('ko-KR').includes(needle))));
 if(!names.includes(sortKey))return selected;
 const numeric=columns.some(col=>col.name===sortKey&&['number','numeric','integer','float'].includes(col.type));
 const sign=direction==='desc'?-1:1;
 return selected.sort((left,right)=>{
  const rawLeft=rows[left][sortKey],rawRight=rows[right][sortKey];
  const a=numeric?finiteNumeric(rawLeft):text(rawLeft),b=numeric?finiteNumeric(rawRight):text(rawRight);
  const missingA=numeric?a===null:rawLeft===null||rawLeft===undefined||rawLeft==='',missingB=numeric?b===null:rawRight===null||rawRight===undefined||rawRight==='';
  if(missingA||missingB)return missingA===missingB?left-right:missingA?1:-1;
  const difference=numeric?(a<b?-1:a>b?1:0):a.localeCompare(b,'ko-KR',{numeric:false});
  return difference*sign||left-right;
 });
}

// Only the current page of rows is rendered. All events belong to this host and
// are removed on page navigation/dataset changes through destroy().
export function mountChartGrid(host,{rows,columns,dataset,model,esc,label,exportRows,onSelect=()=>{},onInspect=()=>{},onRowFocus=()=>{}}){
 const abort=new AbortController(),names=columns.map(col=>typeof col==='string'?col:col.name);
 let active=true,selection=model.all,page=0,pageSize=50,query='',sortKey='',direction='asc',only=false,itemQuery='',filtered=[];
 const q=selector=>host.querySelector(selector);
 host.innerHTML=`<div class="panel-head"><div><span class="eyebrow">LINKED RAW DATA</span><h2 id="visual-grid-title">차트 · 원본 데이터</h2><p>차트 항목을 선택하면 같은 조회 데이터의 상세 행을 확인합니다.</p></div><button type="button" class="button small" data-grid-export>선택 결과 CSV</button></div>
 <div class="chart-grid-controls"><label class="field">차트 항목 찾기<input data-drill-search type="search" maxlength="200" placeholder="예: 서울, 검색, 원본 12행"></label><label class="field">차트 항목 선택<select id="visual-drill-item" data-drill-item aria-describedby="visual-drill-options-note"></select></label><p class="chart-grid-options-note" id="visual-drill-options-note"></p></div>
 <nav class="chart-grid-path" aria-label="상세 데이터 경로" data-grid-path></nav>
 <p class="chart-grid-note" data-grid-note></p>
 <div class="chart-grid-toolbar"><label class="field">상세 행 검색<input id="visual-grid-search" data-grid-search type="search" maxlength="200" placeholder="예: 고객명, 지역, 값"></label><label class="chart-grid-check"><input data-grid-only type="checkbox">차트에 포함된 행만</label><label class="field chart-grid-page-size">페이지당 행<select data-grid-size><option>25</option><option selected>50</option><option>100</option></select></label></div>
 <p class="chart-grid-summary" id="visual-grid-summary" aria-live="polite" data-grid-summary></p>
 <div class="table-wrap chart-grid-table-wrap" tabindex="0" role="region" aria-label="차트와 연결된 원본 데이터 표"><table class="data-table chart-grid-table"><caption class="sr-only">현재 차트 선택에 연결된 원본 행. 행 번호 버튼으로 전체 값을 확인합니다.</caption><thead data-grid-head></thead><tbody id="visual-grid-body" data-grid-body></tbody></table></div>
 <div class="chart-grid-footer"><span data-grid-page></span><div><button class="button small" type="button" data-grid-prev>이전</button><button class="button small" type="button" data-grid-next>다음</button></div></div>`;
 function fillOptions(){
  const needle=itemQuery.trim().toLocaleLowerCase('ko-KR'),matches=model.items.filter(item=>!needle||item.title.toLocaleLowerCase('ko-KR').includes(needle)),visible=matches.slice(0,200);
  if(selection.id!=='all'&&!visible.some(item=>item.id===selection.id))visible.unshift(selection);
  q('[data-drill-item]').innerHTML=[model.all,...visible].map(item=>`<option value="${item.id}"${selection.id===item.id?' selected':''}>${esc(item.title)}</option>`).join('');
  q('#visual-drill-options-note').textContent=model.items.length?`${countText(matches.length)}개 항목${matches.length>200?' 중 처음 200개 · 검색어로 범위를 좁히세요.':' · 마우스 클릭과 같은 상세 조회입니다.'}`:'이 차트에는 선택 가능한 항목이 없습니다. 전체 원본 행을 확인하세요.';
 }
 function update(){
  if(!active)return;
  filtered=selectGridRows(rows,selection.indices,columns,{query,sortKey,direction,contributingOnly:only,usedIndices:selection.usedIndices});
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));page=Math.max(0,Math.min(page,pages-1));
  const shown=filtered.slice(page*pageSize,(page+1)*pageSize),used=new Set(selection.usedIndices);
  const path=[model.all];if(selection.parentId)path.push(model.lookup.get(selection.parentId));if(selection.id!=='all')path.push(selection);
  q('[data-grid-path]').innerHTML=path.map((item,index)=>`${index?'<span aria-hidden="true">›</span>':''}<button class="button text" type="button" data-grid-select="${item.id}"${index===path.length-1?' aria-current="page"':''}>${esc(item.title)}</button>`).join('')+(selection.id!=='all'||query||only?'<button class="button small" type="button" data-grid-reset>전체 보기</button>':'');
  q('[data-grid-note]').textContent=[selection.note, dataset?.truncated?'원본 조회의 행·용량 제한으로 잘린 데이터입니다. 아래 행은 현재 조회 범위에 한정됩니다.':`현재 조회 ${countText(rows.length)}행 기준${dataset?.source==='target-sql'?' · TARGET SQL 조회 시점의 데이터':''}.`,model.type==='scatter'?'동일 좌표의 점도 원본 행 번호로 각각 구분합니다.':''].filter(Boolean).join(' ');
  q('[data-grid-summary]').textContent=`선택 그룹 ${countText(selection.indices.length)}행 · 검색/필터 결과 ${countText(filtered.length)}행 · 선택 그룹 중 차트 포함 ${countText(selection.usedIndices.length)}행`;
  q('[data-grid-head]').innerHTML=`<tr><th scope="col">원본 행</th><th scope="col">차트 포함</th>${names.map((name,index)=>`<th scope="col" aria-sort="${sortKey===name?(direction==='asc'?'ascending':'descending'):'none'}"><button type="button" class="chart-grid-sort" data-grid-sort="${index}">${esc(label(name))}<span aria-hidden="true">${sortKey===name?(direction==='asc'?' ↑':' ↓'):' ↕'}</span></button></th>`).join('')}</tr>`;
  q('[data-grid-body]').innerHTML=shown.length?shown.map(index=>`<tr><th scope="row"><button type="button" class="button text" data-grid-row="${index}" aria-label="원본 ${index+1}행 전체 값 보기">${countText(index+1)}</button></th><td><span class="chart-grid-status ${used.has(index)?'included':'excluded'}">${used.has(index)?'포함':'불포함'}</span></td>${names.map(name=>{const value=rows[index][name],display=text(value);return `<td>${value===null||value===undefined||value===''?'<span class="chart-grid-missing">결측</span>':esc(display.length>180?display.slice(0,180)+'…':display)}</td>`;}).join('')}</tr>`).join(''):`<tr><td colspan="${names.length+2}" class="chart-grid-empty">선택 조건에 해당하는 원본 행이 없습니다.</td></tr>`;
  q('[data-grid-page]').textContent=`${page+1} / ${pages}페이지 · ${filtered.length?countText(page*pageSize+1)+'–'+countText(Math.min((page+1)*pageSize,filtered.length)):'0'}행 표시`;
  q('[data-grid-prev]').disabled=page===0;q('[data-grid-next]').disabled=page>=pages-1;q('[data-grid-export]').disabled=!filtered.length;
 }
 function choose(id){const item=model.lookup.get(id);if(!item||!active)return;selection=item;page=0;fillOptions();update();onSelect(item);}
 host.addEventListener('input',event=>{
  if(event.target.matches('[data-grid-search]')){query=event.target.value;page=0;update();}
  if(event.target.matches('[data-drill-search]')){itemQuery=event.target.value;fillOptions();}
 },{signal:abort.signal});
 host.addEventListener('change',event=>{
  if(event.target.matches('[data-drill-item]'))choose(event.target.value);
  if(event.target.matches('[data-grid-only]')){only=event.target.checked;page=0;update();}
  if(event.target.matches('[data-grid-size]')){pageSize=Number(event.target.value);page=0;update();}
 },{signal:abort.signal});
 host.addEventListener('focusin',event=>{const button=event.target.closest('[data-grid-row]');if(button)onRowFocus(Number(button.dataset.gridRow));},{signal:abort.signal});
 host.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-grid-select'))choose(button.dataset.gridSelect);
  if(button.hasAttribute('data-grid-reset')){query='';only=false;itemQuery='';q('[data-grid-search]').value='';q('[data-grid-only]').checked=false;q('[data-drill-search]').value='';choose('all');}
  if(button.hasAttribute('data-grid-sort')){const key=names[Number(button.dataset.gridSort)];direction=sortKey===key&&direction==='asc'?'desc':'asc';sortKey=key;page=0;update();q(`[data-grid-sort="${names.indexOf(key)}"]`)?.focus({preventScroll:true});}
  if(button.hasAttribute('data-grid-prev')){page--;update();}
  if(button.hasAttribute('data-grid-next')){page++;update();}
  if(button.hasAttribute('data-grid-row'))onInspect(Number(button.dataset.gridRow),rows[Number(button.dataset.gridRow)]);
  if(button.hasAttribute('data-grid-export')){button.disabled=true;try{await exportRows(filtered.map(index=>rows[index]));}finally{if(active)button.disabled=!filtered.length;}}
 },{signal:abort.signal});
 fillOptions();update();
 return {select:choose,destroy(){active=false;abort.abort();},get selected(){return selection;},get filteredIndices(){return [...filtered];}};
}
