import {state,esc,pageHead,icons,importDialog,loadSelected,columns,numericColumns,columnOptions,post,toast,empty,disposeCharts,modal,modalHead,closeModal,refreshData,label,exportCSV} from './core.js';
import {chart,buildOption,chartTypes} from './charts.js';
import {createDrillModel,mountChartGrid} from './chart-grid.js';
import {mountChoiceList,datasetItems,kindNames,datasetKind} from './choice-list.js';
import {startTask,nextPaint} from './progress.js';
let drawEpoch=0;
let type=null,current=null,settings={},chartInstance,rawGrid=null,chartClick=null,stage='datasets',picker=null,datasetView={},ownerId='',pending=null;
function clearLinks(){rawGrid?.destroy();rawGrid=null;if(chartInstance&&!chartInstance.isDisposed())chartInstance.off('click',chartClick);chartClick=null;}
export function destroy(){drawEpoch++;clearLinks();picker?.destroy();picker=null;chartInstance=null;stage='datasets';type=null;settings={};}
export function loadVisualization(item){pending={...item,owner:state.user?.id};state.selected=item.dataset_id;}
export function selectVisualizationDataset(datasetId){loadVisualization({dataset_id:datasetId,chart_type:null,config:{}});}
export async function render(){
 const epoch=++drawEpoch;clearLinks();picker?.destroy();picker=null;disposeCharts();chartInstance=null;
 const page=document.querySelector('#visualization-page');if(!page)return;
 if(ownerId!==state.user?.id){ownerId=state.user?.id;stage='datasets';type=null;settings={};datasetView={};}
 if(pending?.owner===ownerId){const item=pending;pending=null;state.selected=item.dataset_id;type=chartTypes.some(([id])=>id===item.chart_type)?item.chart_type:null;settings=type?item.config||{}:{};await loadSelected();if(epoch!==drawEpoch||state.page!=='M03001')return;stage=state.dataError?'datasets':type?'chart':'types';}
 else pending=null;
 const dataset=state.datasets.find(item=>item.id===state.selected);
 if(!dataset)stage='datasets';
 page.innerHTML=pageHead('','V-BAP 시각화','Visualization - Bigdata Analysis Platform',`<a class="button" href="#M90003"><i data-lucide="database"></i>DB SQL 조회</a><button class="button" id="visual-import"><i data-lucide="upload"></i>직접 가져오기</button><button class="button primary" id="save-insight" ${stage!=='chart'?'disabled':''}><i data-lucide="bookmark"></i>인사이트 저장</button>`)+`
 <details class="panel dataset-disclosure" id="visual-data-picker" ${stage==='datasets'?'open':''}><summary><span><small>1. 시각화 데이터셋</small><strong id="visual-selected-name">${esc(stage==='datasets'?'데이터셋을 선택하세요.':dataset.name)}</strong>${stage==='datasets'?'':`<small>${esc(kindNames[datasetKind(dataset)]||'데이터')} · ${state.rows.length.toLocaleString()}행 조회 · ${dataset.columns.length}컬럼${state.dataset?.truncated?' · 일부 조회':''}</small><small>${esc(datasetScope())}</small>`}</span><span class="dataset-list-toggle">목록 열기 / 닫기</span></summary><div id="visual-datasets"></div></details>
 ${stage==='datasets'?'':`<div class="visualization-workspace"><div class="visualization-layout">
  <aside class="visual-controls visual-types" aria-labelledby="chart-types-title"><h2 id="chart-types-title">2. 차트 유형</h2><div class="chart-type-grid" role="group" aria-label="차트 유형 선택">${chartTypes.map(([k,n,i])=>`<button class="chart-type ${k===type?'active':''}" data-chart-type="${k}" title="${n}" aria-pressed="${k===type}"><i data-lucide="${i}"></i>${n}</button>`).join('')}</div></aside>
  ${stage==='chart'?chartPanels():'<div class="visual-start-note"><h2>차트 유형을 선택하세요</h2><p>선택한 데이터에 맞춰 축·집계 옵션과 원본 상세가 이어집니다.</p></div>'}
 </div></div>`}`;
 document.querySelector('#visual-import').onclick=()=>importDialog('V-BAP',()=>{settings={};type=null;stage='types';render();});
 const dataPicker=document.querySelector('#visual-data-picker');
 picker=mountChoiceList(document.querySelector('#visual-datasets'),{items:datasetItems(state.datasets),selected:state.selected,view:datasetView,label:'시각화 데이터셋',attribute:'data-dataset-choice',wide:true,pageSize:12,filters:['api','file','json','sql','analysis'].map(id=>[id,kindNames[id]]),onSelect:async id=>{
  if(stage!=='datasets'&&id===state.selected&&state.dataset?.id===id&&!state.dataError){dataPicker.open=false;return;}
  const workspace=document.querySelector('.visualization-workspace');if(workspace)workspace.inert=true;
  const importButton=document.querySelector('#visual-import'),saveButton=document.querySelector('#save-insight');importButton.disabled=true;saveButton.disabled=true;
  state.selected=id;await loadSelected();
  if(!dataPicker.isConnected||state.page!=='M03001')return;
  settings={};type=null;stage=state.dataError?'datasets':'types';await render();
 }});
 document.querySelectorAll('[data-chart-type]').forEach(button=>button.onclick=()=>{
  if(stage==='chart'&&type===button.dataset.chartType)return;
  settings=readSettings();type=button.dataset.chartType;
  if(stage!=='chart'){stage='chart';document.querySelector('.visual-start-note').outerHTML=chartPanels();wireChartControls();document.querySelector('#save-insight').disabled=false;icons();}
  // Keep the workspace and focused type button mounted while changing options.
  document.querySelectorAll('[data-chart-type]').forEach(item=>{const selected=item.dataset.chartType===type;item.classList.toggle('active',selected);item.setAttribute('aria-pressed',String(selected));});
  fields();void draw();
 });
 wireChartControls();document.querySelector('#save-insight').onclick=save;
 if(stage==='chart'){fields();await draw();}icons();
}
function chartPanels(){return `<section class="visual-controls visual-settings" aria-labelledby="visual-settings-title"><h2 id="visual-settings-title">3. 상세 설정</h2><div id="visual-fields"></div><button class="button dark" id="apply-chart"><i data-lucide="refresh-cw"></i>차트 적용</button></section><div class="studio-canvas visual-canvas"><section class="panel"><div class="panel-head"><div><span class="eyebrow">IN-SIGHT EXPLORER</span><h2 id="chart-title">데이터 시각화</h2><p id="chart-subtitle">선택한 데이터의 구조에 맞춰 표현합니다.</p></div><button class="button small" id="download-chart"><i data-lucide="image-down"></i>PNG</button></div><div id="studio-chart" class="chart large" role="img" aria-label="선택한 데이터의 시각화"></div><div class="chart-annotation" id="chart-note"></div></section><section class="panel chart-grid-panel" id="visual-data-grid" aria-labelledby="visual-grid-title"></section></div>`;}
function datasetScope(){const dataset=state.dataset;if(!dataset)return '';const time=dataset.source==='target-sql'?dataset.queried_at:dataset.created_at;const stamp=time?new Date(time).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'미확인';return dataset.source==='target-sql'?`TARGET SQL 조건 적용 · 조회 시각 ${stamp} KST · 조회 상한 ${(dataset.target?.limit||20000).toLocaleString()}행${dataset.truncated?' · 전체 건수 미확정':''}`:`회원 저장 데이터 · 등록 시각 ${stamp} KST · 현재 조회 범위 기준`;}
function wireChartControls(){
 document.querySelector('#apply-chart')?.addEventListener('click',draw);
 document.querySelector('#download-chart')?.addEventListener('click',()=>{if(!chartInstance)return toast('먼저 차트를 생성하세요.');const a=document.createElement('a');a.href=chartInstance.getDataURL({type:'png',pixelRatio:2,backgroundColor:'#fff'});a.download='IN-SIGHT-'+type+'.png';a.click();});
}
function fields(){const keys=columns(),nums=numericColumns(),cats=keys.filter(k=>!nums.includes(k));const x=settings.x||(keys.includes('date')&&['area','line'].includes(type)?'date':cats.includes('region')?'region':cats[0]||keys[0]);const y=settings.y||(nums.includes('revenue')?'revenue':nums[0]);const two=['scatter','heatmap','sunburst','sankey','graph'].includes(type);const second=type==='scatter'?nums:cats;let secondary=settings.secondary;if(!second.includes(secondary))secondary=second.find(c=>c!==(type==='scatter'?y:x))||second[0];document.querySelector('#visual-fields').innerHTML=`<label class="field">${type==='scatter'?'분류 기준':'기준 범주 / X축'}<select id="visual-x">${columnOptions(keys,x)}</select></label><label class="field">${type==='scatter'?'X축 수치':'측정값 / Y축'}<select id="visual-y">${columnOptions(nums,y)}</select></label>${two?`<label class="field">${type==='scatter'?'Y축 수치':'두 번째 범주'}<select id="visual-secondary">${columnOptions(second,secondary)}</select></label>`:''}<label class="field">집계 방식<select id="visual-aggregation"><option value="sum">합계</option><option value="mean">평균</option><option value="count">건수</option></select><small>${type==='scatter'||type==='boxplot'?'이 차트는 집계 전 개별 수치로 분포를 표현합니다.':'결측 수치는 합계·평균에서 제외합니다.'}</small></label>`;document.querySelector('#visual-aggregation').value=settings.aggregation||(nums.length?'sum':'count');}
function readSettings(){if(!document.querySelector('#visual-x'))return settings;return {x:document.querySelector('#visual-x').value,y:document.querySelector('#visual-y').value,secondary:document.querySelector('#visual-secondary')?.value,aggregation:document.querySelector('#visual-aggregation').value};}
async function draw(){
 const token=++drawEpoch;settings=readSettings();clearLinks();disposeCharts();chartInstance=null;
 const rows=state.rows,dataset=state.dataset,metadata=dataset?.columns||[],host=document.querySelector('#visual-data-grid');
 document.querySelector('#chart-title').textContent=`${chartTypes.find(c=>c[0]===type)[1]} · ${label(settings.y||settings.x)}`;
 document.querySelector('#chart-subtitle').textContent=dataset?.name||'데이터셋을 선택하세요.';
 const task=startTask('IN-SIGHT 차트와 상세 데이터 준비 중',{delay:200});
 try{
  await nextPaint();if(token!==drawEpoch||!host?.isConnected)return;
  current=buildOption(type,rows,settings);current.animation=false;
  for(const series of current.series||[])series.emphasis={...series.emphasis,scale:false};
  const model=createDrillModel(type,rows,settings,current);
  document.querySelector('#studio-chart').innerHTML='';
  if(rows.length)chartInstance=chart('#studio-chart',current);
  else document.querySelector('#studio-chart').innerHTML=empty('시각화할 데이터를 가져오세요','기존 DB를 SQL로 조회하거나 CSV·JSON을 TARGET DB에 적재하세요.');
  const highlight=items=>{if(!chartInstance||chartInstance.isDisposed()||token!==drawEpoch)return;chartInstance.dispatchAction({type:'downplay',seriesIndex:0});for(const item of items)if(item.event)chartInstance.dispatchAction({type:'highlight',...item.event});};
  rawGrid=mountChartGrid(host,{rows,columns:metadata,dataset,model,esc,label,
   exportRows:filtered=>exportCSV(filtered,'IN-SIGHT-detail.csv'),
   onSelect:item=>highlight(item.id==='all'?[]:[item]),
   onRowFocus:index=>highlight(model.forRow(index)),
   onInspect:(index,row)=>{highlight(model.forRow(index));modal(modalHead('RAW DATA',`원본 ${index+1}행 상세`)+`<p class="muted">${esc(dataset?.name||'')} · 현재 조회 범위의 원본 행입니다.</p><dl class="chart-grid-row-detail">${metadata.map(column=>{const name=typeof column==='string'?column:column.name;return `<dt>${esc(label(name))}</dt><dd>${row[name]===null||row[name]===undefined||row[name]===''?'<span class="chart-grid-missing">결측</span>':esc(row[name])}</dd>`;}).join('')}</dl><div class="modal-actions"><button class="button primary" data-close>닫기</button></div>`);},
  });
  if(chartInstance){chartClick=event=>{if(token!==drawEpoch)return;const item=model.resolve(event);if(item)rawGrid?.select(item.id);};chartInstance.on('click',chartClick);}
  document.querySelector('#chart-note').textContent=[current.bapsNote,'차트 클릭 → 원본 행 상세 · 아래 항목 선택으로 키보드 탐색 가능'].filter(Boolean).join(' · ');
  await nextPaint();
 }catch(error){if(token===drawEpoch)toast('차트와 상세 데이터를 준비하지 못했습니다. 데이터와 필드 설정을 확인하세요.',true);}
 finally{task.finish();}
}
function save(){if(!state.selected||!chartInstance)return toast('먼저 데이터를 가져오세요.',true);modal(modalHead('SAVE YOUR INSIGHT','인사이트 저장')+`<form id="save-form"><label class="field">인사이트 이름<input name="name" required maxlength="150" value="${esc(state.dataset.name+' · '+chartTypes.find(c=>c[0]===type)[1])}"></label><p class="muted">차트 유형과 필드 설정을 저장합니다. 저장한 인사이트 메뉴에서 다시 열 수 있습니다.</p><div class="modal-actions"><button type="button" class="button" data-close>취소</button><button class="button primary">저장하기</button></div></form>`);document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);document.querySelector('#save-form').onsubmit=async e=>{e.preventDefault();e.submitter.disabled=true;try{await post('/visualizations',{name:new FormData(e.target).get('name'),dataset_id:state.selected,chart_type:type,config:settings});await refreshData();closeModal();toast('인사이트를 저장했습니다.');}catch(error){toast(error.message,true);}finally{e.submitter.disabled=false;}};}
