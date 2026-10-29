import {state,esc,num,api,toast,icons,modal,modalHead,closeModal,refreshConnections,refreshData,loadSelected} from './core.js';

let cleanupActive=null;
const types={number:'숫자',date:'날짜 (YYYY-MM-DD)',string:'문자'};
const display=value=>value===null||value===undefined||value===''?'결측':String(value);

export function openFileImport(module,after){
 cleanupActive?.();
 const directAllowed=module==='R-BAP'||module==='V-BAP',generation=state.authGeneration,owner=state.user?.id,page=state.page;
 modal(modalHead(module+' · FILE INPUT','파일 확인 후 저장·사용')+`<form id="import-form"><p class="muted">파일을 선택해 전체 행의 자료형·결측을 확인한 뒤 저장합니다. 미리보기는 데이터를 저장하지 않습니다.</p>${directAllowed?`<fieldset class="file-import-modes"><legend>사용 방식</legend><label><input type="radio" name="storage_mode" value="direct" checked>파일로 바로 ${module==='R-BAP'?'분석':'시각화'}</label><label><input type="radio" name="storage_mode" value="target">TARGET에 적재해 사용</label></fieldset>`:'<input type="hidden" name="storage_mode" value="target"><p class="info-note">C-BAP은 선택한 TARGET DB에 실제 데이터를 적재합니다.</p>'}<section id="import-target" ${directAllowed?'hidden':''}><label class="field">저장할 TARGET DB<select id="import-connection" name="connection_id" required ${directAllowed?'disabled':''}><option value="">연결 정보를 불러옵니다.</option></select></label><p class="muted" id="import-target-note">새 테이블 생성 권한이 있는 DB 연결이 필요합니다.</p><p><a class="button small" href="#M90002" data-close>DB 연결 설정</a></p></section><label class="field">데이터셋 이름<input name="name" required maxlength="120" placeholder="예: 10월 서비스 이용 현황"></label><label class="upload-zone" for="import-file"><i data-lucide="upload-cloud"></i><strong id="file-label">파일을 선택하세요</strong><span>CSV · TSV · JSON / 최대 10MiB · 20,000행 · 100컬럼 / UTF-8·CP949</span><input id="import-file" type="file" name="file" accept=".csv,.tsv,.json" required></label><div class="file-import-preview-actions"><button class="button" type="button" id="preview-import">파일 확인·미리보기</button><span class="muted" id="import-preview-state" role="status">파일 선택 후 미리보기를 확인하세요.</span></div><section id="import-preview" aria-label="파일 미리보기"></section><p class="file-import-destination" id="import-destination"></p><label class="file-import-confirm"><input type="checkbox" id="import-confirm" required>미리보기와 저장 대상을 확인했습니다.</label><div class="modal-actions"><button type="button" class="button" data-close>취소</button><button class="button primary" type="submit" id="save-import" disabled>저장·사용</button></div></form>`);
 const form=document.querySelector('#import-form'),dialog=document.querySelector('#modal'),events=new AbortController();
 const q=selector=>form.querySelector(selector),file=q('#import-file'),save=q('#save-import'),confirm=q('#import-confirm'),target=q('#import-connection');
 let active=true,request=0,preview=null,previewFile=null,previewAbort=null,saving=false,loadingConnections=false,connectionsReady=false;
 const valid=()=>active&&form.isConnected&&dialog.open&&document.querySelector('#import-form')===form&&state.authGeneration===generation&&state.user?.id===owner&&state.page===page;
 const mode=()=>q('[name=storage_mode]:checked')?.value||q('[name=storage_mode]').value;
 const targetName=()=>target.selectedOptions[0]?.textContent||'TARGET 미선택';
 function sync(){
  if(!valid())return;
  const toTarget=mode()==='target';q('#import-target').hidden=!toTarget;target.disabled=!toTarget||saving||loadingConnections;
  q('#import-destination').textContent=toTarget?`저장 대상: ${target.value?targetName():'TARGET DB를 선택하세요.'} · 새 테이블 생성 후 데이터셋 연결`:`저장 대상: 내 파일 데이터셋 · SYSTEM DB에 회원 전용으로 보관 · TARGET 연결 불필요`;
  save.textContent=toTarget?'확인한 파일을 TARGET에 적재':module==='R-BAP'?'파일로 분석 시작':'파일로 시각화 시작';
  save.disabled=saving||!preview||!confirm.checked||(toTarget&&(!target.value||loadingConnections));
 }
 async function connections(){
  if(connectionsReady||loadingConnections)return;loadingConnections=true;sync();
  try{await refreshConnections();if(!valid())return;connectionsReady=true;target.innerHTML=state.connections.length?state.connections.map(item=>`<option value="${esc(item.id)}" ${state.connectionId===item.id?'selected':''}>${esc(item.name)}</option>`).join(''):'<option value="">등록된 TARGET DB 없음</option>';q('#import-target-note').textContent=state.connections.length?'새 테이블 생성 권한이 있는 DB 연결이 필요합니다.':'DB 연결 설정에서 사용할 TARGET을 먼저 등록하세요. 파일 미리보기는 연결 없이 확인할 수 있습니다.';}
  catch(error){if(valid())q('#import-target-note').textContent='TARGET 연결 정보를 읽지 못했습니다. 사용 방식을 다시 선택하거나 팝업을 다시 여세요.';}
  finally{loadingConnections=false;if(valid())sync();}
 }
 function invalidate(){request++;previewAbort?.abort();preview=null;previewFile=null;confirm.checked=false;q('#preview-import').disabled=saving;q('#import-preview').innerHTML='';q('#import-preview-state').textContent='파일 선택 후 미리보기를 확인하세요.';sync();}
 function showPreview(data){
  const keys=data.columns.map(column=>column.name);
  q('#import-preview').innerHTML=`<div class="file-import-summary"><strong>전체 ${num(data.row_count)}행 · ${num(data.column_count)}컬럼</strong><span>${esc(data.file_type)} · ${esc(data.encoding)} · ${num(data.file_bytes)}바이트</span><span>전체 행 점검: 결측 ${num(data.missing_cells)}셀 · 중복 행 ${num(data.duplicate_rows)}개</span></div><p class="muted">전체 업로드 행으로 품질을 점검했습니다. 아래 원본 값은 처음 ${num(data.rows.length)}행${data.preview_truncated?'만 표시하며 전체 파일은 잘리지 않습니다.':'입니다.'}</p>${data.warnings.map(warning=>`<p class="info-note">${esc(warning)}</p>`).join('')}<div class="table-wrap file-import-table"><table class="data-table"><thead><tr>${keys.map(key=>`<th>${esc(key)}</th>`).join('')}</tr></thead><tbody>${data.rows.map(row=>`<tr>${keys.map(key=>`<td title="${esc(display(row[key]))}">${esc(display(row[key]).slice(0,180))}${display(row[key]).length>180?'…':''}</td>`).join('')}</tr>`).join('')}</tbody></table></div><details class="file-import-quality"><summary>컬럼 자료형·결측·날짜 점검 (${num(data.column_count)}개)</summary><div class="table-wrap file-import-table"><table class="data-table"><thead><tr><th>컬럼</th><th>판별 자료형</th><th>결측</th><th>숫자 값</th><th>ISO 날짜</th><th>점검</th></tr></thead><tbody>${data.quality.map(column=>`<tr><td>${esc(column.name)}</td><td>${esc(types[column.type]||column.type)}</td><td>${num(column.missing)}</td><td>${num(column.numeric_values)}</td><td>${num(column.iso_dates)}</td><td>${column.mixed_numeric?'숫자·문자 혼합':column.mixed_dates?'날짜·문자 혼합':'—'}</td></tr>`).join('')}</tbody></table></div></details><p class="muted">${esc(data.conversion_note)} 저장 시에도 동일한 파서와 제한을 적용합니다.</p>`;
 }
 async function inspect(){
  if(saving||!file.reportValidity())return;
  invalidate();const chosen=file.files[0];if(!chosen)return;
  const token=++request,controller=new AbortController();previewAbort=controller;
  q('#import-preview-state').textContent='파일을 전송하고 전체 행을 점검하고 있습니다.';q('#preview-import').disabled=true;
  const body=new FormData();body.append('file',chosen);body.append('module',module);
  try{const data=await api('/datasets/preview',{method:'POST',body,signal:controller.signal,feedback:'파일 구조·품질 확인 중'});if(!valid()||token!==request||file.files[0]!==chosen)return;preview=data;previewFile=chosen;showPreview(data);q('#import-preview-state').textContent='파일 확인 완료 · 아직 저장되지 않았습니다.';}
  catch(error){if(valid()&&token===request&&error.name!=='AbortError')q('#import-preview-state').textContent='파일을 확인하지 못했습니다. 입력값을 확인하고 다시 실행하세요.';}
  finally{if(valid()&&token===request){q('#preview-import').disabled=false;sync();}}
 }
 file.addEventListener('change',()=>{invalidate();q('#file-label').textContent=file.files[0]?.name||'파일을 선택하세요';const name=q('[name=name]');if(!name.value&&file.files[0])name.value=file.files[0].name.replace(/\.[^.]+$/,'');void inspect();},{signal:events.signal});
 q('#preview-import').addEventListener('click',inspect,{signal:events.signal});
 form.addEventListener('change',event=>{if(event.target.name==='storage_mode'){confirm.checked=false;sync();if(mode()==='target')void connections();}if(event.target===target){confirm.checked=false;sync();}if(event.target===confirm)sync();},{signal:events.signal});
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(saving||!preview||file.files[0]!==previewFile||!form.reportValidity())return;
  const toTarget=mode()==='target';if(toTarget&&!target.value)return;
  saving=true;form.querySelectorAll('input,select,button').forEach(control=>control.disabled=true);
  const body=new FormData();body.append('file',previewFile);body.append('name',q('[name=name]').value);body.append('module',module);body.append('preview_hash',preview.sha256);if(toTarget)body.append('connection_id',target.value);
  try{const item=await api('/datasets/import',{method:'POST',body,feedback:toTarget?'TARGET DB에 데이터 적재 중':'내 파일 데이터셋 저장 중'});if(!valid())return;if(toTarget)state.connectionId=target.value;state.selected=item.id;await refreshData({loadRows:false});if(!valid())return;await loadSelected();if(!valid())return;closeModal();toast(toTarget?'TARGET DB에 적재하고 데이터셋을 연결했습니다.':'파일 데이터셋을 회원 전용으로 저장했습니다.');await after();}
  catch(error){if(valid()&&error.name!=='AbortError')toast(error.message,true);}
  finally{saving=false;if(valid()){form.querySelectorAll('input,select,button').forEach(control=>control.disabled=false);sync();}}
 },{signal:events.signal});
 const cleanup=()=>{active=false;request++;previewAbort?.abort();events.abort();if(cleanupActive===cleanup)cleanupActive=null;};
 cleanupActive=cleanup;dialog.addEventListener('close',cleanup,{once:true,signal:events.signal});window.addEventListener('hashchange',cleanup,{once:true,signal:events.signal});window.addEventListener('baps:unauthorized',cleanup,{once:true,signal:events.signal});
 sync();if(!directAllowed)void connections();icons();
}
