import {state,inputModule,esc,num,pageHead,icons,importDialog,disposeCharts,api,empty} from './core.js';
import {datasetKind,kindNames} from './choice-list.js';
import {analysisName} from './advanced-analysis.js';
import {loadVisualization,selectVisualizationDataset} from './M03001.js';

let viewEpoch=0;
export function destroy(){viewEpoch++;}
const modules=[['C-BAP','데이터 수집','API·파일을 선택한 TARGET에 수집','download','orange','M01001'],['R-BAP','통계 분석','기존 DB 또는 직접 입력으로 개별 분석','flask-conical','teal','M02001'],['V-BAP','시각화','기존 DB 또는 직접 입력으로 차트 탐색','chart-no-axes-combined','purple','M03001']];
const time=value=>{const result=typeof value==='number'?value*1000:Date.parse(value||'');return Number.isFinite(result)?result:0;};
const date=value=>time(value)?new Date(time(value)).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'short'}):'시각 정보 없음';

// Metadata only: do not sum arbitrary numeric values or infer business units.
export function overviewModel(datasets,visualizations,analyses,runs){
 const recentDatasets=[...datasets].sort((a,b)=>time(b.updated_at||b.created_at)-time(a.updated_at||a.created_at)||String(a.name).localeCompare(String(b.name),'ko-KR')).slice(0,6);
 const activities=[...analyses.map(item=>({...item,kind:'analysis',at:item.created_at})),...visualizations.map(item=>({...item,kind:'visualization',at:item.updated_at||item.created_at})),...runs.map(item=>({...item,kind:'collection',at:item.finished_at||item.started_at}))].sort((a,b)=>time(b.at)-time(a.at)).slice(0,6);
 return {datasetCount:datasets.length,sqlCount:datasets.filter(item=>item.source==='target-sql').length,analysisCount:analyses.length,visualizationCount:visualizations.length,
  recentDatasets,activities,collectionWarnings:runs.filter(item=>['FAILED','UNKNOWN','INTERRUPTED'].includes(item.status)),syntheticCount:datasets.filter(item=>item.synthetic).length};
}

export async function render(){
 const token=++viewEpoch,owner=state.user?.id;disposeCharts();const el=document.querySelector('#overview-page');
 el.innerHTML=pageHead('YOUR WORKSPACE','인법스 개요','최근 데이터와 작업을 확인하고, 필요한 분석·시각화로 이어가세요.',`<a class="button" href="#M04001"><i data-lucide="database"></i>데이터 카탈로그</a><button class="button primary" id="overview-import"><i data-lucide="upload"></i>데이터 가져오기</button>`)+`<div class="module-grid">${modules.filter(item=>state.modules.includes(item[0])).map(item=>`<a href="#${item[5]}" class="module-card"><div class="module-icon ${item[4]}"><i data-lucide="${item[3]}"></i></div><div><h3>${item[1]}<span>${item[0]}</span></h3><p>${item[2]}</p></div><span class="icon-button"><i data-lucide="arrow-up-right"></i></span></a>`).join('')}</div><div id="overview-content"><p class="collection-note" role="status">최근 작업 현황을 확인하고 있습니다.</p></div>`;
 document.querySelector('#overview-import').onclick=()=>importDialog(inputModule(),render);icons();
 const results=await Promise.allSettled([state.modules.includes('R-BAP')?api('/analyses?summary=true',{feedback:false}):Promise.resolve([]),state.modules.includes('C-BAP')?api('/collection/runs',{feedback:false}):Promise.resolve([])]);
 if(token!==viewEpoch||state.user?.id!==owner||state.page!=='M00001'||!el.isConnected)return;
 const [analysisResult,runResult]=results,analyses=analysisResult.status==='fulfilled'?analysisResult.value:[],runs=runResult.status==='fulfilled'?runResult.value:[];
 draw(overviewModel(state.datasets,state.visualizations,analyses,runs),{analysisError:analysisResult.status==='rejected',runError:runResult.status==='rejected'});
}

function draw(model,{analysisError,runError}){
 const hasResearch=state.modules.includes('R-BAP'),hasVisual=state.modules.includes('V-BAP');
 const metrics=[['등록 데이터셋',model.datasetCount,'개','database','카탈로그에 등록된 데이터'],['DB SQL 데이터셋',model.sqlCount,'개','square-terminal','열 때 TARGET을 다시 조회'],['최근 저장 분석',hasResearch?(analysisError?'조회 실패':model.analysisCount):'비활성',hasResearch?'건':'','flask-conical','최근 200개 분석 이력 범위'],['저장 차트',hasVisual?model.visualizationCount:'비활성',hasVisual?'개':'','bookmark','저장 설정 · 열 때 데이터 조회']];
 const root=document.querySelector('#overview-content');
 root.innerHTML=`<div class="metric-grid overview-metrics">${metrics.map(item=>`<article class="metric"><div class="metric-top">${item[0]}<i data-lucide="${item[3]}"></i></div><div class="metric-value">${typeof item[1]==='number'?num(item[1]):esc(item[1])}<small>${item[2]}</small></div><div class="metric-bottom">${item[4]}</div></article>`).join('')}</div>
 <p class="info-note">업무 KPI는 지표·단위·집계·기간·비교 기준을 정의한 뒤 확인해야 합니다. 이 개요는 등록 메타데이터와 작업 이력을 표시하며 원본 데이터의 수치 합계나 품질을 자동 판단하지 않습니다.</p>
 ${runError?'<div class="db-link-note" role="status"><span>최근 수집 이력을 읽지 못했습니다. C-BAP에서 실행 이력을 확인하세요.</span><a class="button small" href="#M01001">수집 화면</a></div>':''}
 ${model.collectionWarnings.length?`<div class="db-link-note" role="status"><span>최근 수집 이력 100개 범위에 실패·결과 확인 필요 기록이 ${num(model.collectionWarnings.length)}건 있습니다. 자동 재실행 전에 실행 이력을 확인하세요.</span><a class="button small" href="#M01001">실행 이력 확인</a></div>`:''}
 ${model.syntheticCount?`<p class="info-note">합성 예제 데이터 ${num(model.syntheticCount)}개가 카탈로그에 포함되어 있습니다.</p>`:''}
 ${model.datasetCount?`<div class="chart-grid equal"><section class="panel"><div class="panel-head"><div><span class="eyebrow">RECENT DATA</span><h2>최근 등록·변경 데이터</h2><p>카탈로그 기록 기준 · 행 데이터는 열 때 조회합니다.</p></div><a class="button small" href="#M04001">전체 목록</a></div><div class="table-wrap"><table class="data-table"><thead><tr><th>데이터셋</th><th>수집유형</th><th>활용</th></tr></thead><tbody>${model.recentDatasets.map(item=>`<tr><td><strong>${esc(item.name)}</strong><p>${num(item.columns?.length||0)}컬럼 · ${esc(date(item.updated_at||item.created_at))}</p></td><td><span class="soft-tag">${esc(kindNames[datasetKind(item)]||'데이터')}</span></td><td>${state.modules.includes('R-BAP')?`<button class="button small" data-overview-analysis="${esc(item.id)}">분석</button>`:''}${state.modules.includes('V-BAP')?`<button class="button small" data-overview-visual="${esc(item.id)}">시각화</button>`:''}</td></tr>`).join('')}</tbody></table></div></section><section class="panel"><div class="panel-head"><div><span class="eyebrow">RECENT WORK</span><h2>최근 작업·이어서 하기</h2><p>분석은 실행 당시 결과, 저장 차트는 최신 데이터 조회입니다.</p></div>${state.modules.includes('V-BAP')?'<a class="button small" href="#M03002">저장한 인사이트</a>':''}</div>${activitiesHTML(model.activities)}</section></div>`:empty('분석할 데이터를 연결하세요','기존 DB를 SQL로 조회하거나 파일을 직접 분석·시각화할 수 있습니다. C-BAP 수집은 선택한 TARGET에 적재합니다.','<a class="button" href="#M90002">DB 연결 설정</a> <a class="button" href="#M90003">SQL 조회</a> <button class="button primary" id="first-import">데이터 가져오기</button>')}`;
 if(!model.datasetCount&&model.activities.length)root.insertAdjacentHTML('beforeend',`<section class="panel"><div class="panel-head"><div><h2>최근 작업</h2><p>데이터셋 등록이 삭제되어도 실행 당시의 분석 이력은 남아 있습니다.</p></div></div>${activitiesHTML(model.activities)}</section>`);
 root.querySelector('#first-import')?.addEventListener('click',()=>importDialog(inputModule(),render));
 root.querySelectorAll('[data-overview-analysis]').forEach(button=>button.onclick=()=>{state.selected=button.dataset.overviewAnalysis;location.hash='M02001';});
 root.querySelectorAll('[data-overview-visual]').forEach(button=>button.onclick=()=>{selectVisualizationDataset(button.dataset.overviewVisual);location.hash='M03001';});
 root.querySelectorAll('[data-overview-chart]').forEach(button=>button.onclick=()=>{const item=state.visualizations.find(item=>item.id===button.dataset.overviewChart);if(item){loadVisualization(item);location.hash='M03001';}});
 icons();
}

function activitiesHTML(activities){
 if(!activities.length)return '<div class="empty-state"><h3>아직 저장된 작업이 없습니다</h3><p>분석을 실행하거나 차트를 저장하면 최근 작업을 확인할 수 있습니다.</p></div>';
 const status={SUCCEEDED:'수집 완료',FAILED:'수집 실패',UNKNOWN:'저장 결과 확인 필요',INTERRUPTED:'중단 확인 필요',RUNNING:'실행 중'};
 return `<div class="table-wrap"><table class="data-table"><thead><tr><th>작업</th><th>기준시점</th><th>활용</th></tr></thead><tbody>${activities.map(item=>{
  const title=item.kind==='analysis'?analysisName(item.method):item.kind==='visualization'?item.name:status[item.status]||'수집 이력';
  const description=item.kind==='analysis'?item.dataset_name:item.kind==='visualization'?item.dataset_name:(item.result?.message||'C-BAP 실행 이력에서 원천과 적재 결과를 확인하세요.');
  const action=item.kind==='analysis'?(state.datasets.some(dataset=>dataset.id===item.dataset_id)?`<button class="button small" data-overview-analysis="${esc(item.dataset_id)}">분석 화면</button>`:'<span class="soft-tag">데이터셋 등록 삭제됨</span>'):item.kind==='visualization'?`<button class="button small" data-overview-chart="${esc(item.id)}">저장 차트 열기</button>`:'<a class="button small" href="#M01001">수집 이력</a>';
  return `<tr><td><strong>${esc(title)}</strong><p>${esc(description)}</p></td><td>${esc(date(item.at))}<p>${item.kind==='analysis'?'실행 당시 결과':item.kind==='visualization'?'열 때 최신 데이터':'실행 이력'}</p></td><td>${action}</td></tr>`;
 }).join('')}</tbody></table></div>`;
}
