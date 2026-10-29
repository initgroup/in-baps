import {apiExamples} from '../config/api-examples.js';
import {esc,modal,modalHead,closeModal} from './core.js';

const authNames={none:'인증키 불필요','public-sample':'개인키 불필요 · 공개 샘플 제한'};
const checkedDate=value=>new Date(value).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'});
const providerGuidance='<details class="api-provider-guidance"><summary>공공데이터포털·서울시 등 국내 API 이용 안내</summary><p class="collection-note"><a href="https://www.data.go.kr/" target="_blank" rel="noopener noreferrer">공공데이터포털</a>은 서비스별 인증키·활용신청 조건을 확인하세요. <a href="https://data.seoul.go.kr/together/guide/useGuide.do" target="_blank" rel="noopener noreferrer">서울 열린데이터광장</a>의 공개 sample은 최대 5건이며 정식 수집은 본인 인증키가 필요합니다. 한국은행 공개 sample 예제는 개인키 없이 최대 10행을 조회하며 별도 제한 표시를 제공합니다.</p></details>';
const valueText=value=>value===null||value===undefined?'결측':typeof value==='object'?JSON.stringify(value):String(value);
const fieldNames={year:'연도',value:'값',period:'시점',date:'날짜',title:'제목',published:'발행일',link:'링크',unit:'단위',item:'항목',statistic:'통계명',indicator:'지표',category:'분야'};

export function previewPublicExample(id,onUse){
 const item=apiExamples.find(item=>item.id===id);if(!item)return;
 const fields=item.source.fields;
 modal(modalHead('PUBLIC OPEN DATA',esc(item.title))+`<p>${esc(item.provider)} · ${esc(item.region)} · ${esc(item.category)}</p><p class="muted">${esc(authNames[item.auth_mode])} · 실제 응답 확인: ${esc(checkedDate(item.preview_checked_at))}</p><p>${esc(item.preview_scope)} · TARGET에 저장되지 않은 미리보기입니다.</p><div class="table-wrap api-example-preview"><table class="data-table"><thead><tr>${fields.map(field=>`<th>${esc(fieldNames[field.name]||field.name)}</th>`).join('')}</tr></thead><tbody>${item.preview.map(row=>`<tr>${fields.map(field=>`<td>${esc(valueText(row[field.name]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="collection-note">${esc(item.limitations)}</p>${(item.preview_warnings||[]).map(warning=>`<p class="collection-note">${esc(warning)}</p>`).join('')}<details class="api-example-definition"><summary>지표 정의·단위·출처</summary><p>${esc(item.description)}</p><p>${esc(item.definition)}</p><p>단위: ${esc(item.unit)}</p><p>출처: ${esc(item.attribution)}</p></details><details><summary>INPUT·OUTPUT 설정 보기</summary><pre class="api-example-json">${esc(JSON.stringify(item.source,null,2))}</pre></details><p><a href="${esc(item.indicator_url)}" target="_blank" rel="noopener noreferrer">공식 데이터 출처</a> · <a href="${esc(item.documentation)}" target="_blank" rel="noopener noreferrer">API 문서</a></p><div class="modal-actions"><button class="button" data-close>닫기</button><button class="button primary" id="api-example-apply">내 API 설정으로 가져오기</button></div>`);
 document.querySelector('#api-example-apply').onclick=()=>{closeModal();onUse(id);};
}

export function mountPublicExamples(root,{view,onUse,isBusy=()=>false}){
 const abort=new AbortController(),pageSize=12;
 view.search??='';view.page??=0;view.category??='';view.provider??='';view.region??='';view.auth_mode??='';view.open??=true;view.filtersOpen??=false;
 const groups=[['category','분야'],['provider','제공기관'],['region','지역'],['auth_mode','인증 조건']];
 const groupsHTML=groups.map(([key,name])=>`<div class="api-example-filter-group" role="group" aria-label="예제 ${name}"><strong>${name}</strong><div>${['',...new Set(apiExamples.map(item=>item[key]))].map(value=>`<button type="button" data-example-filter="${key}" data-filter-value="${esc(value)}" aria-pressed="${String(view[key]===value)}">${esc(!value?'전체':key==='auth_mode'?authNames[value]:value)}</button>`).join('')}</div></div>`).join('');
 root.innerHTML=`<details class="api-examples" ${view.open?'open':''}><summary>공공데이터 API 예제 · ${apiExamples.length.toLocaleString()}개 수집 설정</summary><p class="collection-note">실제 응답을 확인한 공공 API입니다. 검색 → 미리보기 → 설정 가져오기 → TARGET 선택 → 연결 테스트·등록·수집 순서로 활용하세요. 공개 샘플 제한은 별도 표시합니다.</p>${providerGuidance}<label class="choice-search">공공 API 예제 검색<input type="search" data-example-search aria-label="공공 API 예제 검색" value="${esc(view.search)}" placeholder="분야·기관·지표명·코드 검색 (예: 환경, 제조, 환율)"></label><details class="api-example-filters" ${view.filtersOpen?'open':''}><summary>분야·기관·지역·인증 조건으로 좁히기</summary>${groupsHTML}</details><div class="api-example-status"><p data-example-status role="status" aria-live="polite"></p><button type="button" class="button small" data-example-reset>검색 초기화</button></div><div class="api-example-grid" data-example-grid></div><div class="list-pager"><button type="button" class="button small" data-example-prev>이전</button><span data-example-page></span><button type="button" class="button small" data-example-next>다음</button></div></details>`;
 const q=selector=>root.querySelector(selector),grid=q('[data-example-grid]');
 function draw(){
  const term=view.search.trim().toLocaleLowerCase('ko-KR');
  const items=apiExamples.filter(item=>groups.every(([key])=>!view[key]||item[key]===view[key])&&(!term||[item.id,item.title,item.description,item.definition,item.category,item.provider,item.region,item.source.url].join(' ').toLocaleLowerCase('ko-KR').includes(term)));
  const pages=Math.max(1,Math.ceil(items.length/pageSize));view.page=Math.max(0,Math.min(pages-1,view.page));
  grid.innerHTML=items.slice(view.page*pageSize,(view.page+1)*pageSize).map(item=>`<article class="api-example-card"><div class="api-example-tags"><span class="soft-tag">${esc(item.category)}</span><span class="soft-tag">${esc(item.region)}</span><span class="soft-tag">${esc(item.source.response_format.toUpperCase())}</span></div><h3>${esc(item.title)}</h3><p class="api-example-provider">${esc(item.provider)} · ${esc(authNames[item.auth_mode])}</p><p>${esc(item.description)}</p><small>실제 응답 확인 ${esc(checkedDate(item.preview_checked_at))}</small><div class="api-actions"><button type="button" class="button small" data-example-preview="${esc(item.id)}">응답 미리보기</button><button type="button" class="button small" data-example-use="${esc(item.id)}">설정 가져오기</button></div></article>`).join('')||'<p class="choice-empty">조건에 맞는 API 예제가 없습니다. 검색어나 분류를 변경하세요.</p>';
  const active=groups.filter(([key])=>view[key]).map(([key])=>key==='auth_mode'?authNames[view[key]]:view[key]);
  q('[data-example-status]').textContent=`전체 ${apiExamples.length.toLocaleString()}개 중 ${items.length.toLocaleString()}개 검색 · ${pageSize}개씩 표시${active.length?' · '+active.join(' / '):''}`;
  q('[data-example-page]').textContent=`${view.page+1} / ${pages}`;q('[data-example-prev]').disabled=view.page===0;q('[data-example-next]').disabled=view.page>=pages-1;
  root.querySelectorAll('[data-example-filter]').forEach(button=>button.setAttribute('aria-pressed',String(view[button.dataset.exampleFilter]===button.dataset.filterValue)));
  grid.scrollTop=0;
 }
 q('.api-examples').addEventListener('toggle',event=>{view.open=event.target.open;},{signal:abort.signal});
 q('.api-example-filters').addEventListener('toggle',event=>{view.filtersOpen=event.target.open;},{signal:abort.signal});
 q('[data-example-search]').addEventListener('input',event=>{view.search=event.target.value;view.page=0;draw();},{signal:abort.signal});
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-example-filter')){view[button.dataset.exampleFilter]=button.dataset.filterValue;view.page=0;draw();}
  if(button.hasAttribute('data-example-prev')){view.page--;draw();}
  if(button.hasAttribute('data-example-next')){view.page++;draw();}
  if(button.hasAttribute('data-example-reset')){for(const [key] of groups)view[key]='';view.search='';view.page=0;q('[data-example-search]').value='';draw();}
  if(button.hasAttribute('data-example-preview'))previewPublicExample(button.dataset.examplePreview,onUse);
  if(button.hasAttribute('data-example-use')&&!isBusy())onUse(button.dataset.exampleUse);
 },{signal:abort.signal});
 draw();return {destroy(){abort.abort();}};
}
