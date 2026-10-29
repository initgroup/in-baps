import {startTask,requestLabel,uploadRequest,nextPaint} from './progress.js';
import {reportRequestError} from './layers.js';
export const state = {user:null,csrf:'',modules:['C-BAP','R-BAP','V-BAP'],datasets:[],selected:null,rows:[],visualizations:[],charts:[],page:'M00001',search:'',analysis:null,connections:[],connectionId:'',session:null};
export const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const num = value => Number(value||0).toLocaleString('ko-KR',{maximumFractionDigits:1});
export const compact = value => Intl.NumberFormat('ko-KR',{notation:'compact',maximumFractionDigits:1}).format(Number(value||0));
export function icons(){window.lucide?.createIcons({attrs:{'stroke-width':1.7}});}
export async function api(path,options={}){
 const generation=state.authGeneration||0;
 const {feedback,...request}=options,method=(request.method||'GET').toUpperCase();
 const silent=feedback===false||['/auth/session','/auth/options'].includes(path);
 const task=silent?null:startTask(typeof feedback==='string'?feedback:requestLabel(path,method));
 try{
 const headers={...(request.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(state.csrf?{'X-CSRF-Token':state.csrf}:{}),...request.headers};
 const response=request.body instanceof FormData?await uploadRequest('/api'+path,{...request,headers},task):await fetch('/api'+path,{credentials:'same-origin',...request,headers});
 const body=await response.json().catch(()=>{if(response.ok)throw new Error('서버 응답을 읽을 수 없습니다. 다시 시도하세요.');return {detail:'서버 응답을 읽을 수 없습니다.'};});
 if(generation!==(state.authGeneration||0))throw new Error('로그인 상태가 변경되었습니다. 요청을 다시 실행하세요.');
 if(!response.ok){const error=new Error(typeof body.detail==='string'?body.detail:(body.message||'요청을 처리하지 못했습니다. 입력값을 확인하세요.'));error.status=response.status;if(response.status===401&&!path.startsWith('/auth/'))window.dispatchEvent(new Event('baps:unauthorized'));throw error;}
 if(state.user&&!path.startsWith('/auth/'))window.dispatchEvent(new CustomEvent('baps:activity',{detail:{expires_at:Number(response.headers.get('X-Session-Expires-At'))||null,idle_expires_at:Number(response.headers.get('X-Session-Idle-Expires-At'))||null}}));
 return body.data??body;
 }catch(error){
  if(error instanceof TypeError)error=new Error('서버와 통신하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도하세요.');
  if(!silent&&error.name!=='AbortError'&&generation===(state.authGeneration||0)&&error.status!==401)reportRequestError(error);
  throw error;
 }finally{task?.finish();}
}
export const post=(path,data,options={})=>api(path,{...options,method:'POST',body:JSON.stringify(data)});
export {showMessage as toast,closeLayer as closeModal} from './layers.js';
import {showMessage as toast,openLayer,closeLayer as closeModal} from './layers.js';
export function modal(html){openLayer(html);icons();}
export function modalHead(eyebrow,title){return `<div class="modal-head"><div class="layer-handle" tabindex="0" role="button" aria-label="팝업 이동: 드래그 또는 방향키"><span class="eyebrow">${eyebrow}</span><h2>${title}</h2><span class="move-hint"><i data-lucide="move"></i>드래그하여 이동 · 방향키 지원</span></div><button type="button" class="icon-button" data-close aria-label="닫기"><i data-lucide="x"></i></button></div>`;}
export async function refreshData({loadRows=true}={}){
 const generation=state.authGeneration||0;
 const [datasets,visualizations]=await Promise.all([api('/datasets'),state.modules.includes('V-BAP')?api('/visualizations'):Promise.resolve([])]);
 if(generation!==(state.authGeneration||0)||!state.user)return;
 state.datasets=datasets;state.visualizations=visualizations;
 if(!state.selected||!datasets.some(d=>d.id===state.selected))state.selected=datasets[0]?.id;
 if(loadRows)await loadSelected();
}
let selectedRequest=0;
export async function loadSelected(){
 const request=++selectedRequest,generation=state.authGeneration||0,selected=state.selected;
 const current=()=>request===selectedRequest&&generation===(state.authGeneration||0)&&selected===state.selected&&!!state.user;
 state.dataError='';if(!selected){state.rows=[];state.dataset=null;return;}
 try{const data=await api('/datasets/'+encodeURIComponent(selected)+'?limit=20000');if(!current())return;state.rows=data.rows||[];state.dataset=data;}
 catch(error){if(!current())return;state.rows=[];state.dataset=state.datasets.find(d=>d.id===selected)||null;state.dataError=error.message;if(error.status!==401)toast('데이터 조회 실패: '+error.message,true);}
}
export function datasetSelect(id='dataset-select'){return `<select id="${id}" aria-label="데이터셋 선택">${state.datasets.length?state.datasets.map(d=>`<option value="${esc(d.id)}" ${state.selected===d.id?'selected':''}>${esc(d.name)}</option>`).join(''):'<option value="">데이터셋 없음</option>'}</select>`;}
export function pageHead(eyebrow,title,description,actions=''){return `<section class="page-heading"><div class="page-heading-copy"><div class="page-title-line"><h1>${title}</h1>${eyebrow?`<span class="eyebrow">${eyebrow}</span>`:''}</div>${description?`<p>${description}</p>`:''}</div>${actions?`<div class="heading-actions">${actions}</div>`:''}</section>`;}
export const empty=(title,description,action='')=>`<div class="empty-state"><i data-lucide="layers-3"></i><h3>${title}</h3><p>${description}</p>${action}</div>`;
export function numericColumns(){return (state.dataset?.columns||[]).filter(c=>['number','numeric','integer','float'].includes(c.type)).map(c=>c.name);}
export function columns(){return (state.dataset?.columns||[]).map(c=>typeof c==='string'?c:c.name);}
export function inputModule(){return state.modules.includes('V-BAP')?'V-BAP':state.modules.includes('R-BAP')?'R-BAP':'C-BAP';}
export const labels={date:'일자',region:'지역',channel:'유입 채널',category:'서비스',revenue:'매출',visitors:'방문자',conversions:'전환',satisfaction:'만족도',keyword:'키워드'};
export const label=k=>labels[k]||k;
export function columnOptions(list,selected){return list.map(c=>`<option value="${esc(c)}" ${selected===c?'selected':''}>${esc(label(c))}</option>`).join('');}
export async function exportCSV(rows,filename='inbaps-data.csv'){
 if(!rows.length)return toast('내보낼 데이터가 없습니다.');
 const generation=state.authGeneration||0;
 const task=startTask('CSV 파일 만들기',{delay:0,completed:0,total:rows.length,detail:'행 데이터를 CSV 형식으로 변환합니다.'});
 try{
 const keys=Object.keys(rows[0]);const cell=v=>{let text=String(v??'');if(typeof v==='string'&&/^[\s]*[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
 const lines=[keys.map(cell).join(',')];
 for(let offset=0;offset<rows.length;offset+=500){
  await nextPaint();if(generation!==(state.authGeneration||0))return;for(const row of rows.slice(offset,offset+500))lines.push(keys.map(key=>cell(row[key])).join(','));
  const done=Math.min(offset+500,rows.length);task.update({completed:done,detail:`${done.toLocaleString('ko-KR')} / ${rows.length.toLocaleString('ko-KR')}행 변환`});
 }
 download(new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),filename);toast('CSV 파일을 준비했습니다.');
 }catch{toast('CSV 파일을 만들지 못했습니다. 다시 시도하세요.',true);}finally{task.finish();}
}
export function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
export function disposeCharts(){state.charts.forEach(c=>c.dispose());state.charts=[];}
export async function refreshConnections(){state.connections=await api('/connections');if(!state.connections.some(c=>c.id===state.connectionId))state.connectionId=state.connections[0]?.id||'';return state.connections;}
export function connectionSelect(id='target-connection'){return `<select id="${id}" name="connection_id" required aria-label="TARGET DB 선택">${state.connections.length?state.connections.map(c=>`<option value="${esc(c.id)}" ${state.connectionId===c.id?'selected':''}>${esc(c.name)}</option>`).join(''):'<option value="">등록된 TARGET DB 없음</option>'}</select>`;}
export function openDatabase(module){state.dbmsModule=module;location.hash='M90003';}
export async function importDialog(module='C-BAP',after=()=>location.reload()){
 const page=state.page,generation=state.authGeneration||0,owner=state.user?.id;
 const {openFileImport}=await import('./file-import.js');
 if(!owner||state.user?.id!==owner||state.page!==page||(state.authGeneration||0)!==generation)return;
 return openFileImport(module,after);
}
