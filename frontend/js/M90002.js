import {objectFilterDialog} from './object-browser.js';
import {state,esc,api,post,pageHead,icons,toast,modal,modalHead,closeModal,empty,refreshConnections,refreshData,connectionSelect,inputModule} from './core.js';
let epoch=0;
const methods={easy:'Easy Connect · 호스트 / 포트 / 서비스',tns:'TNS 별칭',descriptor:'직접 연결 기술자 · DESCRIPTION'};
const methodOf=item=>item.connection_type||(item.dsn?.trim().startsWith('(')?'descriptor':/^[\w.$#-]+$/.test(item.dsn||'')?'tns':'easy');
export function destroy(){epoch++;}

export async function render(){
 const token=++epoch,root=document.querySelector('#connections-page');
 root.innerHTML=pageHead('CONNECTED DATABASES','DB 연결 설정','SYSTEM DB와 회원별 TARGET DB를 구분하여 관리합니다.',`<button class="button primary" id="new-connection"><i data-lucide="plus"></i>TARGET DB 등록</button>`)+`
 <details class="connection-guide"><summary><i data-lucide="info"></i>SYSTEM / TARGET DB 안내</summary><div class="db-role-grid"><section><h2>SYSTEM DB · 플랫폼 관리</h2><p>회원·세션·연결 설정·데이터셋·인사이트를 관리하며 서버 환경설정으로 연결합니다. 관리자 목록에 이름을 표시하더라도 시스템 보호 테이블의 SQL·DDL 접근은 제한됩니다.</p></section><section><h2>TARGET DB · 고객 데이터</h2><p>기존 Oracle DB를 연결하거나 수집 데이터를 적재합니다. 연결 카드의 상세정보에서 접속 조건을 확인하고 연결을 테스트하세요.</p></section></div></details>
 <div class="section-title"><h2>내 TARGET DB</h2><button class="button small" id="reload-connections"><i data-lucide="refresh-cw"></i>새로고침</button></div><div id="connection-list"><div class="loading"><span class="spinner"></span>연결 목록을 불러오는 중입니다.</div></div>
 <section class="panel docs-panel sample-panel"><span class="eyebrow">EXPLICIT SETUP</span><h2>예제 데이터 생성</h2><p>원할 때만 선택한 TARGET DB에 합성 예제 테이블과 데이터셋을 생성합니다. 이후 모든 화면은 DB에 저장된 데이터를 SQL로 조회합니다. 기존 고객 테이블은 변경하지 않습니다.</p><div class="inline-actions"><button class="button" id="create-sample"><i data-lucide="database-zap"></i>DB에 예제 생성</button>${state.user.role==='admin'?'<button class="button" id="system-target"><i data-lucide="server"></i>서버 DB를 내 TARGET으로 등록</button>':''}</div></section>`;
 document.querySelector('#new-connection').onclick=()=>connectionForm();
 document.querySelector('#reload-connections').onclick=render;
 document.querySelector('#create-sample').onclick=sampleForm;
 document.querySelector('#system-target')?.addEventListener('click',systemTargetForm);
 const list=await refreshConnections();if(token!==epoch||!root.isConnected)return;
 document.querySelector('#connection-list').innerHTML=list.length?`<div class="connection-grid">${list.map(c=>`
 <article class="panel connection-card"><div class="connection-card-head"><div class="module-icon teal"><i data-lucide="database"></i></div><div><h3>${esc(c.name)}</h3><span class="tag">Oracle · ${c.mode==='system'?'서버 DB 공유':'고객 DB'}</span></div></div>
 <dl class="info-list"><div><dt>사용자</dt><dd>${esc(c.username||'서버 설정')}</dd></div><div><dt>접속 방식</dt><dd>${esc(methods[methodOf(c)])}</dd></div><div><dt>접속 대상</dt><dd class="break-anywhere">${esc(c.dsn||'서버 설정 사용')}</dd></div><div><dt>TNS / Wallet</dt><dd>${c.wallet_profile?'서버 프로필 사용':'직접 접속'}</dd></div><div><dt>DML 허용</dt><dd>${c.allow_dml?'허용':'조회 전용'}</dd></div></dl>
 <div class="connection-actions"><button class="button small" data-detail="${esc(c.id)}"><i data-lucide="file-search"></i>상세정보</button><button class="button small" data-test="${esc(c.id)}">연결 테스트</button><button class="button small" data-object-filter="${esc(c.id)}">목록 설정</button><button class="button small" data-open="${esc(c.id)}">SQL 작업실</button>${c.mode!=='system'?`<button class="button small" data-edit="${esc(c.id)}" aria-label="${esc(c.name)} 수정"><i data-lucide="pencil"></i>수정</button>`:''}<button class="icon-button" data-remove="${esc(c.id)}" aria-label="${esc(c.name)} 연결 삭제"><i data-lucide="trash-2"></i></button></div><p class="connection-status" id="connection-status-${esc(c.id)}" role="status"></p></article>`).join('')}</div>`:empty('등록한 DB 연결이 없습니다','기존 데이터가 있는 DB를 등록하면 C-BAP 없이도 바로 조회·분석·시각화할 수 있습니다.');
 root.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>showConnection(b.dataset.detail));
 root.querySelectorAll('[data-object-filter]').forEach(b=>b.onclick=()=>objectFilterDialog(b.dataset.objectFilter));
 root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>showConnection(b.dataset.edit,'edit'));
 root.querySelectorAll('[data-test]').forEach(b=>b.onclick=()=>testSaved(b,b.dataset.test,document.getElementById('connection-status-'+b.dataset.test)));
 root.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{state.connectionId=b.dataset.open;location.hash='M90003';});
 root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>removeForm(list.find(c=>c.id===b.dataset.remove)));icons();
}

const connectedMessage=r=>`연결 성공 · ${r.schema} · Oracle ${r.version}`;
async function testSaved(button,id,status){
 button.disabled=true;
 try{const result=await post('/connections/'+encodeURIComponent(id)+'/test',{});const message=connectedMessage(result);if(status?.isConnected)status.textContent=message;toast(message);}
 catch(error){toast(error.message,true);}finally{button.disabled=false;}
}

async function showConnection(id,mode='view'){
 const token=epoch;
 try{const item=await api('/connections/'+encodeURIComponent(id));if(token===epoch)await connectionForm(item,mode);}
 catch(error){toast(error.message,true);}
}

async function connectionForm(item=null,mode='edit'){
 const token=epoch;let options;
 try{options=await api('/connections/options');}catch(error){toast(error.message,true);return;}
 if(token!==epoch)return;
 const system=item?.mode==='system',view=mode==='view'||system,method=item?methodOf(item):'easy';
 const readonly=view?'readonly':'',disabled=view?'disabled':'';
 modal(modalHead('TARGET DATABASE',view?'DB 연결 상세정보':item?'DB 연결 수정':'새 DB 연결')+`
 ${system?'<div class="db-link-note">서버 환경설정을 사용하는 공유 연결입니다. 실제 접속 조건을 확인할 수 있으며, 변경은 서버 환경설정에서 관리합니다.</div>':''}
 <form id="connection-form">
 <label class="field">연결 이름<input name="name" maxlength="150" required ${readonly} value="${esc(item?.name||'')}" placeholder="예: 고객 분석 DB"></label>
 <div class="form-grid"><label class="field">Oracle 사용자<input name="username" required ${readonly} autocomplete="off" value="${esc(item?.username||'')}" placeholder="예: CUSTOMER_USER"></label>
 <label class="field">${view?'비밀번호 보관 상태':'비밀번호'}${view?`<input readonly value="${system?'서버 환경설정에서 관리':item?.has_password?'암호화하여 저장됨':'저장된 비밀번호 없음'}">`:`<input type="password" name="password" autocomplete="new-password" ${item?'':'required'} maxlength="256"><small>${item?'비워 두면 저장된 비밀번호를 유지합니다.':'Oracle DB 계정의 비밀번호를 입력하세요. 사이트 로그인·Wallet 비밀번호와 다릅니다.'}</small>`}</label></div>
 <div class="form-grid connection-method-grid"><label class="field">접속 방식<select name="connection_type" ${disabled}>${Object.entries(methods).map(([key,label])=>`<option value="${key}" ${key===method?'selected':''}>${label}</option>`).join('')}</select></label>
 ${view?'':`<label class="field" id="server-tns-field" hidden>서버에 등록된 TNS 별칭<select id="server-tns-select"><option value="">직접 입력 또는 아래에서 선택</option>${(options.tns_aliases||[]).map(alias=>`<option value="${esc(alias)}">${esc(alias)}</option>`).join('')}</select></label>`}</div>
 <label class="field"><span id="dsn-label">접속 문자열 (DSN)</span><textarea class="code-input connection-dsn" name="dsn" required ${readonly} maxlength="4000" spellcheck="false" rows="2">${esc(item?.dsn||'')}</textarea><small id="dsn-help"></small></label>
 <label class="check-field"><input type="checkbox" name="wallet_profile" ${item?.wallet_profile?'checked':''} ${disabled}> 서버 Oracle 네트워크 프로필 사용 (TNS / Wallet)</label>
 <p class="connection-profile-note">${options.profile_error?esc(options.profile_error):options.profile_configured?`서버 TNS 별칭 ${(options.tns_aliases||[]).length}개 · Wallet ${options.wallet_available?'준비됨':'준비 필요'}`:'서버 TNS / Wallet 프로필이 아직 설정되지 않았습니다.'}</p>
 <label class="check-field"><input type="checkbox" name="allow_dml" ${item?.allow_dml?'checked':''} ${disabled}> 이 연결에서 INSERT · UPDATE · DELETE 허용</label>
 <p class="connection-profile-note">연결 테스트는 접속·조회만 확인합니다. 쓰기 작업은 DB 계정에 해당 권한이 있어야 합니다.</p>
 ${item?`<dl class="connection-dates"><div><dt>등록</dt><dd>${esc(item.created_at||'—')}</dd></div><div><dt>변경</dt><dd>${esc(item.updated_at||'—')}</dd></div></dl>`:''}
 <p id="connection-test-status" class="connection-profile-note" role="status"></p>
 <div class="modal-actions"><button class="button" type="button" data-close>${view?'닫기':'취소'}</button><button class="button" type="button" id="test-connection-form">연결 테스트</button>${view?(system?'':'<button class="button primary" type="button" id="edit-connection-detail">수정</button>'):'<button class="button primary" type="submit">연결 저장</button>'}</div></form>`);
 const form=document.querySelector('#connection-form'),select=form.elements.connection_type,dsn=form.elements.dsn,status=form.querySelector('#connection-test-status');
 function updateMethod(){
  const type=select.value;
  document.querySelector('#dsn-label').textContent=type==='tns'?'TNS 별칭 (DSN)':type==='descriptor'?'연결 기술자 (DSN)':'접속 문자열 (DSN)';
  dsn.placeholder=type==='tns'?'예: mydatabase_high':type==='descriptor'?'예: (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=db.example.com)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=service_name)))':'예: db.example.com:1521/service_name';
  document.querySelector('#dsn-help').textContent=type==='tns'?'서버 tnsnames.ora에 등록된 별칭입니다. SQL Developer에 저장한 연결 이름과는 다릅니다.':type==='descriptor'?'Oracle (DESCRIPTION=...) 전체 문자열을 입력하세요. JDBC URL은 사용하지 않습니다.':'host:port/service_name 형식입니다. TLS 연결은 tcps:// 접속 문자열을 사용할 수 있습니다.';
  if(!view)document.querySelector('#server-tns-field').hidden=type!=='tns'||!options.tns_aliases?.length;
 }
 updateMethod();
 if(view){
  document.querySelector('#test-connection-form').onclick=e=>testSaved(e.currentTarget,item.id,status);
  document.querySelector('#edit-connection-detail')?.addEventListener('click',()=>connectionForm(item));
  form.onsubmit=e=>e.preventDefault();return;
 }
 select.onchange=()=>{updateMethod();if(select.value==='tns'&&options.profile_configured)form.elements.wallet_profile.checked=true;};
 document.querySelector('#server-tns-select').onchange=e=>{if(e.target.value){dsn.value=e.target.value;form.elements.wallet_profile.checked=true;dsn.removeAttribute('aria-invalid');if(status.textContent)status.textContent='접속 조건이 변경되었습니다. 다시 테스트하세요.';}};
 form.addEventListener('input',()=>{if(status.textContent)status.textContent='접속 조건이 변경되었습니다. 다시 테스트하세요.';});
 const payload=()=>({name:form.elements.name.value,username:form.elements.username.value,password:form.elements.password.value,dsn:dsn.value,connection_type:select.value,wallet_profile:form.elements.wallet_profile.checked,allow_dml:form.elements.allow_dml.checked});
 document.querySelector('#test-connection-form').onclick=async e=>{
  if(!form.reportValidity())return;const button=e.currentTarget;button.disabled=true;
  const data=payload(),tested=JSON.stringify(data);status.textContent='입력한 조건으로 접속을 확인하는 중입니다…';
  try{const r=await post('/connections/test',{...data,...(item?{connection_id:item.id}:{})});const message=connectedMessage(r);status.textContent=JSON.stringify(payload())===tested?message+' · 아직 저장하지 않았습니다.':'테스트 중 접속 조건이 변경되었습니다. 다시 테스트하세요.';toast(status.textContent);}
  catch(error){status.textContent='연결 테스트 실패';toast(error.message,true);}finally{button.disabled=false;}
 };
 form.onsubmit=async e=>{
  e.preventDefault();const button=e.submitter;button.disabled=true;
  try{const saved=await api('/connections'+(item?'/'+encodeURIComponent(item.id):''),{method:item?'PUT':'POST',body:JSON.stringify(payload())});state.connectionId=saved.id;closeModal();toast('DB 연결 설정을 저장했습니다.');await render();}
  catch(error){toast(error.message,true);}finally{button.disabled=false;}
 };
}

function removeForm(item){modal(modalHead('REMOVE CONNECTION','DB 연결 삭제')+`<p class="muted">${esc(item.name)} 연결 설정을 삭제합니다. 실제 DB의 테이블과 데이터는 삭제하지 않습니다. 이 연결을 참조하는 데이터셋이 있으면 먼저 카탈로그에서 정리해야 합니다.</p><div class="modal-actions"><button class="button" data-close>취소</button><button class="button danger" id="confirm-remove">연결 삭제</button></div>`);document.querySelector('#confirm-remove').onclick=async e=>{e.currentTarget.disabled=true;try{await api('/connections/'+item.id,{method:'DELETE'});closeModal();toast('연결을 삭제했습니다.');await render();}catch(error){toast(error.message,true);e.target.disabled=false;}};}
async function sampleForm(){try{await refreshConnections();}catch(error){toast(error.message,true);return;}modal(modalHead('SAMPLE · STORED IN YOUR DB','예제 데이터 생성')+`${state.connections.length?`<p class="muted">이 예제는 합성 데이터입니다. 선택한 TARGET DB에 새 예제 테이블을 만들고 실제 행을 저장합니다.</p><form id="sample-form"><label class="field">TARGET DB${connectionSelect()}</label><div class="modal-actions"><button type="button" class="button" data-close>취소</button><button class="button primary">예제 생성 실행</button></div></form>`:empty('연결을 먼저 등록하세요','예제를 저장할 TARGET DB가 필요합니다.')}`);document.querySelector('#sample-form')?.addEventListener('submit',async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{const d=await post('/dbms/sample',{connection_id:new FormData(e.target).get('connection_id'),module:inputModule()});state.selected=d.id;await refreshData();closeModal();toast('DB에 합성 예제를 생성했습니다. 데이터 카탈로그에서 확인하세요.');location.hash='M04001';}catch(error){toast(error.message,true);}finally{b.disabled=false;}});}
function systemTargetForm(){modal(modalHead('ADMINISTRATOR SETUP','서버 DB를 TARGET으로 등록')+`<p class="muted">SYSTEM DB와 같은 서버 연결을 내 TARGET으로 등록합니다. 시스템 회원·세션·연결 테이블은 작업실에서 보호됩니다. 업무 데이터를 별도 DB로 운영하려면 일반 TARGET DB 등록을 사용하세요.</p><form id="system-target-form"><label class="field">연결 이름<input name="name" required maxlength="150" value="내 서버 DB"></label><div class="modal-actions"><button class="button" type="button" data-close>취소</button><button class="button primary">등록</button></div></form>`);document.querySelector('#system-target-form').onsubmit=async e=>{e.preventDefault();e.submitter.disabled=true;try{const c=await post('/connections/system',{name:new FormData(e.target).get('name')});state.connectionId=c.id;closeModal();await render();}catch(error){toast(error.message,true);e.submitter.disabled=false;}};}
