import {state,esc,columns,numericColumns,columnOptions,modal,modalHead,closeModal,post,toast,icons} from './core.js';
import {startTask} from './progress.js';

const names={profile:'데이터 프로파일',aggregate:'그룹별 집계',correlation:'상관관계 분석',text:'텍스트 빈도 분석'};
let batch=null,running=false,epoch=0,displayedResult=null;
export const batchRunning=()=>running;
export function destroyBatch(){epoch++;if(!state.user||batch?.owner!==state.user.id){batch=null;displayedResult=null;}}
export function syncBatchSelection(result){
 displayedResult=result;
 document.querySelectorAll('[data-batch-result]').forEach(button=>{
  const item=batch?.items[Number(button.dataset.batchResult)];
  const active=item?.status==='success'&&batch.owner===state.user?.id&&batch.dataset===state.selected&&result?.dataset_id===batch.dataset&&result.method===item.method;
  button.classList.toggle('active',!!active);button.setAttribute('aria-pressed',String(!!active));
  button.querySelector('small').textContent=active?'현재 보기':item?.message||'';
 });
}
export function showBatchResults(select){
 const root=document.querySelector('#analysis-batch-results');if(!root)return;
 if(!batch||batch.owner!==state.user?.id||batch.dataset!==state.selected){root.innerHTML='';return;}
 const labels={waiting:'대기',running:'분석 중',success:'완료',failed:'실패',skipped:'건너뜀',stopped:'미실행'};
 root.innerHTML=`<section class="panel batch-results" aria-label="일괄 분석 결과"><h2>방법별 실행 결과</h2><div class="batch-result-grid">${batch.items.map((item,i)=>`<button class="batch-result ${item.status}" data-batch-result="${i}" ${item.status!=='success'?'disabled':''}><strong>${names[item.method]}</strong><span>${labels[item.status]}</span><small>${esc(item.message||'')}</small></button>`).join('')}</div><p class="muted">완료한 방법을 선택하면 아래에서 결과를 확인하고 CSV·V-BAP으로 연결할 수 있습니다.</p></section>`;
 root.querySelectorAll('[data-batch-result]').forEach(button=>button.onclick=()=>select(batch.items[Number(button.dataset.batchResult)].result));
 syncBatchSelection(displayedResult);
}
export function batchDialog(select){
 if(running)return;
 if(!state.selected)return toast('먼저 분석할 데이터셋을 선택하세요.',true);
 const keys=columns(),nums=numericColumns(),cats=keys.filter(k=>!nums.includes(k)),dataset=state.selected,owner=state.user.id;
 modal(modalHead('BATCH ANALYSIS','분석 방법 일괄 실행')+`<form id="analysis-batch-form"><p class="muted">선택한 데이터셋에 4가지 분석을 순서대로 실행하고 결과를 각각 저장합니다. 필요한 컬럼이 없는 방법은 사유와 함께 건너뜁니다.</p><div class="form-grid"><label class="field">그룹 기준<select name="group">${columnOptions(keys,cats.includes('region')?'region':cats[0]||keys[0])}</select></label><label class="field">집계 수치<select name="value">${columnOptions(nums,nums.includes('revenue')?'revenue':nums[0])}</select></label><label class="field">집계 방식<select name="aggregation"><option value="sum">합계</option><option value="mean">평균</option><option value="count" ${!nums.length?'selected':''}>건수</option><option value="min">최솟값</option><option value="max">최댓값</option></select></label><label class="field">텍스트 컬럼<select name="text">${columnOptions(cats,cats.includes('keyword')?'keyword':cats[0])}</select></label></div><p class="muted">프로파일: 전체 컬럼 · 상관관계: 선택한 수치형 컬럼 2~20개. SQL 데이터셋은 분석마다 실제 DB를 다시 조회하므로 실행 중 원본 변경이 결과에 반영될 수 있습니다.</p><fieldset class="batch-correlation"><legend>상관관계 컬럼 · 최대 20개${nums.length>20?' · 처음 20개 기본 선택':''}</legend>${nums.length?nums.map((name,i)=>`<label class="check-field"><input type="checkbox" name="correlation" value="${esc(name)}" ${i<20?'checked':''}>${esc(name)}</label>`).join(''):'<p class="muted">수치형 컬럼이 없어 건너뜁니다.</p>'}</fieldset><div class="modal-actions"><button class="button" type="button" data-close>취소</button><button class="button primary" type="submit">4가지 분석 실행</button></div></form>`);
 document.querySelector('#analysis-batch-form').onsubmit=e=>{
  e.preventDefault();if(running||dataset!==state.selected||owner!==state.user?.id)return;
  const data=new FormData(e.target),aggregation=data.get('aggregation'),correlationColumns=data.getAll('correlation');
  if(correlationColumns.length>20)return toast('상관관계 분석 컬럼은 최대 20개까지 선택하세요.',true);
  if(keys.length&&aggregation!=='count'&&!data.get('value'))return toast('수치형 컬럼이 없으면 건수 집계를 선택하세요.',true);
  const items=[{method:'profile'}, {method:'aggregate',group_by:data.get('group'),value:data.get('value')||null,aggregation}, {method:'correlation',columns:correlationColumns}, {method:'text',value:data.get('text')}].map(payload=>({method:payload.method,payload:{...payload,dataset_id:dataset},status:'waiting',message:''}));
  for(const item of items){const reason=item.method==='aggregate'&&!keys.length?'그룹 기준 컬럼이 없습니다.':item.method==='correlation'&&correlationColumns.length<2?'수치형 컬럼을 2개 이상 선택해야 합니다.':item.method==='text'&&!cats.length?'텍스트 컬럼이 없습니다.':'';if(reason){item.status='skipped';item.message=reason;}}
  closeModal();void execute(items,dataset,owner,select);
 };
}
async function execute(items,dataset,owner,select){
 running=true;const token=++epoch,auth=state.authGeneration;batch={owner,dataset,items};
 const controls=['run-analysis','run-batch-analysis','analysis-method','dataset-select','analysis-import','to-visualization'].map(id=>document.getElementById(id)).filter(Boolean),disabled=controls.map(el=>el.disabled);
 controls.forEach(el=>el.disabled=true);
 const current=()=>token===epoch&&owner===state.user?.id&&auth===state.authGeneration&&state.page==='M02001'&&dataset===state.selected;
 const task=startTask('R-BAP 일괄 분석',{delay:0,completed:0,total:items.length,detail:'분석 방법 처리 건수 기준 · 개별 분석 시간의 진행률이 아닙니다.'});
 let done=0;
 try{
  for(const item of items){
   if(!current())break;
   if(item.status==='skipped'){done++;task.update({completed:done});showBatchResults(select);continue;}
   item.status='running';task.update({label:'일괄 분석 · '+names[item.method],completed:done});showBatchResults(select);
   try{item.result=await post('/analysis',item.payload,{feedback:false});item.status='success';item.message='결과 보기';if(current())select(item.result);}
   catch(error){item.status='failed';item.message=error.message;if(error.status===401||error.status===403)break;}
   finally{done++;task.update({completed:done});if(current())showBatchResults(select);}
  }
 }finally{
  for(const item of items)if(item.status==='waiting'){item.status='stopped';item.message='화면 이동 또는 접근 권한 변경으로 실행하지 않았습니다.';}
  running=false;task.finish();controls.forEach((el,i)=>{if(el.isConnected)el.disabled=disabled[i];});
  if(owner===state.user?.id&&state.page==='M02001'&&dataset===state.selected)showBatchResults(select);
  if(current()){const count=status=>items.filter(i=>i.status===status).length;toast(`일괄 분석: 완료 ${count('success')} · 실패 ${count('failed')} · 건너뜀 ${count('skipped')} · 미실행 ${count('stopped')}`,!!count('failed'));icons();}
 }
}
