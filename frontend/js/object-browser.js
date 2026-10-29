import {esc,api,modal,modalHead,closeModal,toast,icons} from './core.js';

export const objectTypes=[['TABLE','테이블','table-2'],['VIEW','뷰','eye'],['MATERIALIZED VIEW','구체화 뷰','layers-3'],['FUNCTION','함수','square-function'],['PROCEDURE','프로시저','file-code-2'],['PACKAGE','패키지','package'],['INDEX','인덱스','list-ordered'],['TRIGGER','트리거','zap'],['SEQUENCE','시퀀스','list-ordered']];
let revision=0;

export async function objectFilterDialog(id,after=()=>{}){
 const token=++revision;
 try{
  const policy=await api('/connections/'+encodeURIComponent(id)+'/object-filter');if(token!==revision)return;
  const f=policy.filter;
  modal(modalHead('OBJECT EXPLORER','오브젝트 목록 설정')+`<form id="object-filter-form"><p class="muted">선택한 TARGET 연결에만 적용합니다. 목록에서 숨겨도 DB 오브젝트는 변경되지 않습니다.</p><label class="field">표시 범위<select name="scope"><option value="owned" ${f.scope==='owned'?'selected':''}>이 연결에서 내가 생성·적재한 테이블 및 관련 오브젝트</option>${policy.can_schema?`<option value="schema" ${f.scope==='schema'?'selected':''}>현재 계정 스키마 전체${policy.restricted_system?' · 소유 범위 밖은 목록만 표시':''}</option>`:''}</select></label>${policy.restricted_system?'<div class="db-link-note">SYSTEM 공유 연결입니다. 전체 목록은 관리자에게만 제공하며, 다른 회원의 데이터와 시스템 보안 테이블의 SQL·DDL 접근 권한은 확대되지 않습니다.</div>':''}<label class="check-field"><input name="hide_system" type="checkbox" ${f.hide_system?'checked':''}> IN-BAPS 시스템 오브젝트 숨김</label><p class="connection-profile-note">회원·세션·설정 테이블과 관련 시스템 인덱스·뷰·프로시저입니다. 해제하면 이름·유형·상태만 확인할 수 있습니다.</p><label class="field">제외할 이름 접두어<textarea name="exclude_prefixes" rows="4" maxlength="6500" placeholder="예: TMP_&#10;BAK_">${esc(f.exclude_prefixes.join('\n'))}</textarea><small>한 줄에 하나, 최대 50개 · 대소문자 무시 · 밑줄(_), %, $는 일반 문자로 처리합니다. 비우면 접두어 제외가 없습니다.</small></label><fieldset class="object-type-filters"><legend>목록에서 제외할 유형</legend>${objectTypes.map(([type,label])=>`<label class="check-field"><input name="exclude_types" type="checkbox" value="${type}" ${f.exclude_types.includes(type)?'checked':''}>${label}</label>`).join('')}</fieldset><div class="modal-actions"><button class="button" type="button" data-close>취소</button><button class="button" type="button" id="reset-object-filter">기본값</button><button class="button primary" type="submit">설정 저장</button></div></form>`);
  const form=document.querySelector('#object-filter-form');
  form.querySelector('#reset-object-filter').onclick=()=>{form.elements.scope.value=policy.can_schema?'schema':'owned';form.elements.hide_system.checked=true;form.elements.exclude_prefixes.value='';form.querySelectorAll('[name=exclude_types]').forEach(el=>el.checked=false);};
  form.onsubmit=async e=>{
   e.preventDefault();const button=e.submitter;button.disabled=true;
   try{const data=new FormData(form);await api('/connections/'+encodeURIComponent(id)+'/object-filter',{method:'PUT',body:JSON.stringify({scope:data.get('scope'),hide_system:form.elements.hide_system.checked,exclude_prefixes:String(data.get('exclude_prefixes')).split(/\r?\n/).map(s=>s.trim()).filter(Boolean),exclude_types:data.getAll('exclude_types')}),feedback:'오브젝트 목록 설정 저장 중'});closeModal();toast('이 TARGET의 오브젝트 목록 설정을 저장했습니다.');await after();}catch(error){toast(error.message,true);}finally{button.disabled=false;}
  };icons();
 }catch(error){toast(error.message,true);}
}

export function objectFolders(objects,selected){
 return objectTypes.map(([type,label,icon])=>{
  const items=objects.map((item,index)=>({item,index})).filter(({item})=>item.type===type);
  return `<details class="object-folder" data-object-type="${type}" ${type==='TABLE'||selected?.type===type?'open':''}><summary><i data-lucide="folder"></i><span>${label}</span><b>${items.length}</b></summary><div class="object-folder-items">${items.length?items.map(({item:o,index:i})=>`<button class="object-item ${selected?.name===o.name&&selected?.type===o.type?'selected':''}" data-object="${i}" title="${esc(o.name+' · '+o.type+(o.metadata_only?' · 목록만 표시':''))}"><i data-lucide="${icon}"></i><span>${esc(o.name)}<small>${esc(o.status)}${o.metadata_only?' · 목록만':''}</small></span></button>`).join(''):'<p class="object-folder-empty">이 유형의 표시 대상이 없습니다.</p>'}</div></details>`;
 }).join('');
}
