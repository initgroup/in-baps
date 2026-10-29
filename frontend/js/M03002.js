import {state,esc,pageHead,icons,empty,api,toast,refreshData,disposeCharts,modal,modalHead,closeModal} from './core.js';
import {chart,buildOption,chartTypes} from './charts.js';
import {loadVisualization} from './M03001.js';
import {mountChoiceList,datasetItems} from './choice-list.js';

let epoch=0,owner='',picker=null,view={search:'',page:0,dataset:''},datasetView={};
const pageSize=9;
export function destroy(){epoch++;picker?.destroy();picker=null;}
export async function render(){
 destroy();disposeCharts();
 if(owner!==state.user?.id){owner=state.user?.id;view={search:'',page:0,dataset:''};datasetView={};}
 const root=document.querySelector('#saved-page');
 root.innerHTML=pageHead('YOUR INSIGHT LIBRARY','저장한 인사이트','저장한 차트 설정을 찾고 최신 데이터로 다시 확인하세요.',`<a class="button primary" href="#M03001"><i data-lucide="plus"></i>새 인사이트</a>`)+`
 <section class="panel insight-library-tools"><label class="choice-search">저장 인사이트 검색<input type="search" id="insight-search" value="${esc(view.search)}" placeholder="이름·데이터셋·차트 유형으로 검색"></label><details><summary>데이터셋으로 좁히기</summary><div id="insight-dataset-filter"></div></details><p class="collection-note">저장된 것은 차트 유형과 설정입니다. 미리보기·스튜디오에서는 최신 데이터를 조회하며, 저장 당시의 데이터 스냅샷이 아닙니다.</p><p id="insight-count" role="status" aria-live="polite"></p></section>
 <div class="saved-grid" id="insight-items"></div><div class="list-pager"><button class="button small" id="insight-prev">이전</button><span id="insight-page"></span><button class="button small" id="insight-next">다음</button></div>`;
 const datasetIds=new Set(state.visualizations.map(item=>item.dataset_id));
 picker=mountChoiceList(root.querySelector('#insight-dataset-filter'),{items:[{id:'',name:'전체 데이터셋'},...datasetItems(state.datasets.filter(item=>datasetIds.has(item.id)))],selected:view.dataset,view:datasetView,label:'인사이트 데이터셋',pageSize:6,onSelect:id=>{view.dataset=id;view.page=0;drawCards();}});
 root.querySelector('#insight-search').oninput=event=>{view.search=event.target.value;view.page=0;drawCards();};
 root.querySelector('#insight-prev').onclick=()=>{view.page--;drawCards();};root.querySelector('#insight-next').onclick=()=>{view.page++;drawCards();};
 drawCards();icons();
}
function drawCards(){
 const token=++epoch,user=state.user?.id,root=document.querySelector('#saved-page');disposeCharts();
 const term=view.search.trim().toLocaleLowerCase('ko-KR'),items=state.visualizations.filter(item=>(!view.dataset||view.dataset===item.dataset_id)&&[item.name,item.dataset_name,chartTypes.find(type=>type[0]===item.chart_type)?.[1],item.chart_type].join(' ').toLocaleLowerCase('ko-KR').includes(term));
 const pages=Math.max(1,Math.ceil(items.length/pageSize));view.page=Math.max(0,Math.min(pages-1,view.page));
 root.querySelector('#insight-count').textContent=`저장 ${state.visualizations.length.toLocaleString()}개 · 검색 ${items.length.toLocaleString()}개 · 페이지당 ${pageSize}개`;
 root.querySelector('#insight-page').textContent=`${view.page+1} / ${pages}`;root.querySelector('#insight-prev').disabled=view.page===0;root.querySelector('#insight-next').disabled=view.page>=pages-1;
 root.querySelector('#insight-items').innerHTML=items.slice(view.page*pageSize,(view.page+1)*pageSize).map(item=>`<article class="saved-card"><div class="saved-chart insight-preview" data-preview-host="${esc(item.id)}"><button class="button small" data-preview="${esc(item.id)}">최신 데이터 미리보기</button></div><div class="saved-body"><h3>${esc(item.name)}</h3><p>${esc(item.dataset_name||'데이터셋')} · ${esc(chartTypes.find(type=>type[0]===item.chart_type)?.[1]||item.chart_type)}</p><p>설정 저장 ${esc(item.created_at.slice(0,10))} · 최신 데이터로 조회</p><p class="insight-preview-scope" data-preview-scope="${esc(item.id)}"></p><div class="saved-actions"><button class="button small" data-open="${esc(item.id)}">스튜디오에서 열기 <i data-lucide="arrow-up-right"></i></button><button class="icon-button" data-delete="${esc(item.id)}" aria-label="${esc(item.name)} 삭제"><i data-lucide="trash-2"></i></button></div></div></article>`).join('')||`<section class="panel">${empty(state.visualizations.length?'조건에 맞는 인사이트가 없습니다':'아직 저장한 인사이트가 없습니다',state.visualizations.length?'검색어 또는 데이터셋 조건을 변경하세요.':'시각화 화면에서 차트를 만들고 저장해 보세요.')}</section>`;
 const current=()=>token===epoch&&state.page==='M03002'&&state.user?.id===user&&root.isConnected;
 root.querySelectorAll('[data-preview]').forEach(button=>button.onclick=async()=>{
  const item=state.visualizations.find(item=>item.id===button.dataset.preview);if(!item||button.disabled)return;
  button.disabled=true;button.textContent='최신 데이터 확인 중';
  try{
   const data=await api('/datasets/'+encodeURIComponent(item.dataset_id)+'?limit=2000');if(!current())return;
   const host=root.querySelector(`[data-preview-host="${CSS.escape(item.id)}"]`),scope=root.querySelector(`[data-preview-scope="${CSS.escape(item.id)}"]`);
   host.innerHTML='';host.classList.remove('insight-preview');
   if(data.rows.length){const option=buildOption(item.chart_type,data.rows,item.config);option.legend={show:false};chart(host,option);}else host.innerHTML=empty('표시할 행이 없습니다','현재 조회 범위에 데이터가 없습니다.');
   const partial=data.truncated||data.rows.length<Number(data.row_count||0);
   scope.textContent=`미리보기 ${data.rows.length.toLocaleString()}행 · 최대 2,000행${partial?' · 일부 데이터':''} · 조회 ${new Date().toLocaleTimeString('ko-KR')}`;
  }catch(error){if(current()){button.disabled=false;button.textContent='미리보기 다시 시도';toast(error.message,true);}}
 });
 root.querySelectorAll('[data-open]').forEach(button=>button.onclick=()=>{const item=state.visualizations.find(item=>item.id===button.dataset.open);if(item){loadVisualization(item);location.hash='M03001';}});
 root.querySelectorAll('[data-delete]').forEach(button=>button.onclick=()=>{
  const item=state.visualizations.find(item=>item.id===button.dataset.delete);if(!item)return;
  modal(modalHead('INSIGHT LIBRARY','저장한 인사이트 삭제')+`<p class="muted">‘${esc(item.name)}’ 차트 설정을 삭제합니다. 원본 데이터셋은 유지됩니다.</p><div class="modal-actions"><button class="button" data-close>취소</button><button class="button danger" id="confirm-delete">삭제</button></div>`);
  document.querySelector('#confirm-delete').onclick=async event=>{event.currentTarget.disabled=true;try{await api('/visualizations/'+encodeURIComponent(item.id),{method:'DELETE'});if(!current())return;await refreshData({loadRows:false});if(!current())return;closeModal();toast('인사이트를 삭제했습니다.');await render();}catch(error){if(current()){toast(error.message,true);const retry=document.querySelector('#confirm-delete');if(retry)retry.disabled=false;}}};
 });icons();
}
