import {esc,num} from './core.js';

export function datasetKind(item){
 const table=item.target?.table||'';
 if(item.collection_type)return item.collection_type;
 if(table.startsWith('INIT$_TB_BAPS_C_API_'))return 'api';
 if(item.synthetic)return 'sample';
 if(item.source==='analysis')return 'analysis';
 if(item.source==='upload')return 'file';
 if(table.startsWith('INIT$_TB_BAPS_C_'))return 'legacy-input';
 return item.source==='target-sql'?'sql':'json';
}
export const kindNames={api:'API',file:'파일',json:'직접 입력',sql:'DB SQL',analysis:'분석 결과',sample:'합성 예제','legacy-input':'파일·직접 입력'};
export const datasetItems=items=>items.map(item=>({id:item.id,name:item.name,group:datasetKind(item),tag:kindNames[datasetKind(item)]||'기타',meta:`${num(item.row_count)}행 · ${item.columns?.length||0}컬럼 · ${item.module}`,description:item.description||''}));

// Only visible page items enter the DOM. Search/paging state belongs to the caller.
export function mountChoiceList(root,{items,selected='',onSelect,view={},label='목록',pageSize=8,filters=[],wide=false,attribute='data-choice'}={}){
 let current=selected,disabled=false,alive=true;
 view.search??='';view.page??=0;view.group??='';
 root.classList.add('choice-browser');root.classList.toggle('choice-wide',wide);
 root.innerHTML=`<label class="choice-search"><span>${esc(label)} 검색</span><input type="search" data-choice-search aria-label="${esc(label)} 검색" placeholder="이름·설명으로 검색" value="${esc(view.search)}"></label>${filters.length?`<div class="choice-filters" role="group" aria-label="${esc(label)} 분류">${[['','전체'],...filters].map(([id,name])=>`<button type="button" data-choice-filter="${esc(id)}">${esc(name)}</button>`).join('')}</div>`:''}<p class="choice-status" data-choice-status role="status" aria-live="polite"></p><div class="choice-scroll" data-choice-items role="group" aria-label="${esc(label)} 선택"></div><div class="list-pager"><button type="button" class="button small" data-choice-prev aria-label="${esc(label)} 이전 페이지">이전</button><span data-choice-page></span><button type="button" class="button small" data-choice-next aria-label="${esc(label)} 다음 페이지">다음</button></div>`;
 const search=root.querySelector('[data-choice-search]'),host=root.querySelector('[data-choice-items]');
 function draw(){
  const term=view.search.trim().toLocaleLowerCase(),list=items.filter(item=>(!view.group||view.group===item.group)&&`${item.id} ${item.name} ${item.description||''} ${item.meta||''} ${item.tag||''}`.toLocaleLowerCase().includes(term));
  const pages=Math.max(1,Math.ceil(list.length/pageSize));view.page=Math.max(0,Math.min(pages-1,view.page));
  const visible=list.slice(view.page*pageSize,(view.page+1)*pageSize);
  host.innerHTML=visible.length?visible.map(item=>`<button type="button" class="choice-item ${item.id===current?'active':''}" ${attribute}="${esc(item.id)}" aria-pressed="${item.id===current}" ${disabled?'disabled':''}><span class="choice-item-title">${esc(item.name)}</span>${item.tag?`<span class="soft-tag">${esc(item.tag)}</span>`:''}${item.meta?`<small>${esc(item.meta)}</small>`:''}${item.description?`<p>${esc(item.description)}</p>`:''}</button>`).join(''):'<p class="choice-empty">조건에 맞는 항목이 없습니다.</p>';
  root.querySelector('[data-choice-status]').textContent=`${num(list.length)}개${current&&items.some(item=>item.id===current)?' · 선택: '+items.find(item=>item.id===current).name:''}`;
  root.querySelector('[data-choice-page]').textContent=`${view.page+1} / ${pages}`;
  root.querySelector('[data-choice-prev]').disabled=disabled||view.page===0;root.querySelector('[data-choice-next]').disabled=disabled||view.page>=pages-1;
  root.querySelectorAll('[data-choice-filter]').forEach(button=>{button.setAttribute('aria-pressed',String(button.dataset.choiceFilter===view.group));button.disabled=disabled;});
  host.scrollTop=0;
  host.querySelectorAll(`[${attribute}]`).forEach(button=>button.onclick=async()=>{
   if(disabled||!alive)return;const id=button.getAttribute(attribute);setDisabled(true);
   try{await onSelect?.(id);if(alive&&root.isConnected){current=id;draw();}}
   finally{if(alive&&root.isConnected){setDisabled(false);host.querySelector(`[${attribute}="${CSS.escape(id)}"]`)?.focus({preventScroll:true});}}
  });
 }
 function setDisabled(value){disabled=value;search.disabled=value;root.querySelectorAll('button').forEach(button=>button.disabled=value);draw();}
 search.oninput=()=>{view.search=search.value;view.page=0;draw();};
 root.querySelectorAll('[data-choice-filter]').forEach(button=>button.onclick=()=>{view.group=button.dataset.choiceFilter;view.page=0;draw();});
 root.querySelector('[data-choice-prev]').onclick=()=>{view.page--;draw();};root.querySelector('[data-choice-next]').onclick=()=>{view.page++;draw();};
 if(!view.search&&!view.group&&current&&view.page===0){const index=items.findIndex(item=>item.id===current);if(index>=0)view.page=Math.floor(index/pageSize);}
 draw();return {setDisabled,destroy(){alive=false;root.replaceChildren();}};
}
