import {state,pageHead,icons,importDialog} from './core.js';
import {mountDatasetCatalog,jsonDialog} from './M04001.js';
import {mountCollection,destroyCollection} from './collection-workbench.js';
export function destroy(){destroyCollection();}
let mode='file',ownerId='',catalogView={};
export async function render(){
 destroyCollection();if(ownerId!==state.user?.id){ownerId=state.user?.id;mode='file';catalogView={};}
 document.querySelector('#collection-page').innerHTML=pageHead('','C-BAP 데이터 수집','Collection - Bigdata Analysis Platform',`<a class="button" href="#M90003"><i data-lucide="square-terminal"></i>DBMS · SQL 작업실</a>`)+`
 <p class="collection-note"><i data-lucide="database"></i><span>수집 데이터는 TARGET DB에 저장됩니다. 기존 DB는 SQL 작업실에서 바로 조회·분석·시각화하세요.</span></p>
 <div class="collection-tabs" role="tablist" aria-label="수집 방식"><button id="collection-tab-file" role="tab" aria-selected="${mode==='file'}" aria-controls="collection-file-panel" tabindex="${mode==='file'?0:-1}">파일·직접 입력</button><button id="collection-tab-api" role="tab" aria-selected="${mode==='api'}" aria-controls="collection-api-panel" tabindex="${mode==='api'?0:-1}">Open API</button></div>
 <section id="collection-file-panel" role="tabpanel" aria-labelledby="collection-tab-file" ${mode==='file'?'':'hidden'}><div class="import-cards">
  <article class="import-card"><div class="module-icon"><i data-lucide="file-up"></i></div><div><h2>파일에서 가져오기</h2><p>CSV · JSON 파일 적재<br>한글 CSV: UTF-8 · CP949 지원</p></div><button class="button primary" id="collection-import">파일 선택 <i data-lucide="arrow-up-right"></i></button></article>
  <article class="import-card"><div class="module-icon"><i data-lucide="braces"></i></div><div><h2>JSON으로 직접 연결</h2><p>Open API · 외부 시스템의 JSON 배열을<br>TARGET DB 테이블로 저장합니다.</p></div><button class="button" id="collection-json">JSON 데이터 입력 <i data-lucide="arrow-up-right"></i></button></article>
 </div></section><section id="collection-api-panel" role="tabpanel" aria-labelledby="collection-tab-api" ${mode==='api'?'':'hidden'}><div id="openapi-workspace"></div></section>
 <div class="section-title"><h2>연결된 데이터셋</h2><span class="muted" id="collection-dataset-count">${state.datasets.length}개 · 모듈 간 공유</span></div><section class="panel" id="collection-catalog"></section>
 <div class="insight-strip"><i data-lucide="info"></i><div><strong>수집 데이터 활용</strong><p>Open API와 파일에서 수집한 TARGET 데이터를 R-BAP 분석과 V-BAP 시각화에서 함께 활용하세요.</p></div></div>`;
 document.querySelector('#collection-import').onclick=()=>importDialog('C-BAP',render);document.querySelector('#collection-json').onclick=()=>jsonDialog('C-BAP',render);mountDatasetCatalog(document.querySelector('#collection-catalog'),catalogView);icons();
 let mounted=false;const show=async next=>{mode=next;for(const key of ['file','api']){const selected=key===mode,tab=document.querySelector('#collection-tab-'+key);tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;document.querySelector('#collection-'+key+'-panel').hidden=!selected;}if(mode==='api'&&!mounted){mounted=true;await mountCollection(document.querySelector('#openapi-workspace'),()=>{const host=document.querySelector('#collection-catalog');if(!host)return;mountDatasetCatalog(host,catalogView);document.querySelector('#collection-dataset-count').textContent=state.datasets.length+'개 · 모듈 간 공유';});}};
 for(const key of ['file','api']){const tab=document.querySelector('#collection-tab-'+key);tab.onclick=()=>show(key);tab.onkeydown=event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?'file':event.key==='End'?'api':mode==='file'?'api':'file';show(next);document.querySelector('#collection-tab-'+next).focus();}};}await show(mode);
}
