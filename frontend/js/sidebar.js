import {icons} from './core.js';

const drawer=matchMedia('(max-width:900px)');
let opened=false,collapsed=false;
try{collapsed=localStorage.getItem('inbaps.sidebar.collapsed')==='true';}catch{}

function sync(){
 const sidebar=document.querySelector('#sidebar'),button=document.querySelector('#mobile-menu');
 const modal=drawer.matches&&opened;
 document.body.classList.toggle('sidebar-collapsed',collapsed);
 document.body.classList.toggle('menu-open',modal);
 sidebar.classList.toggle('open',modal);
 sidebar.inert=drawer.matches&&!opened;
 document.querySelector('.app-shell').inert=modal;
 document.querySelector('#sidebar-backdrop').hidden=!modal;
 if(modal){sidebar.setAttribute('role','dialog');sidebar.setAttribute('aria-modal','true');sidebar.setAttribute('aria-label','주 메뉴');}
 else{sidebar.removeAttribute('role');sidebar.removeAttribute('aria-modal');sidebar.removeAttribute('aria-label');}
 const expanded=drawer.matches?opened:!collapsed;
 const label=drawer.matches?(opened?'메뉴 닫기':'메뉴 열기'):(collapsed?'메뉴 펼치기':'메뉴 접기');
 button.setAttribute('aria-expanded',String(expanded));button.setAttribute('aria-label',label);button.title=label;
 button.innerHTML=`<i data-lucide="${drawer.matches?'menu':collapsed?'panel-left-open':'panel-left-close'}"></i>`;
 icons();
}

export function revealActiveMenu(){
 if(drawer.matches&&!opened)return;
 document.querySelector('#navigation [aria-current="page"]')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
}

export function closeSidebar(restoreFocus=false){
 const wasOpen=opened;opened=false;sync();
 if(wasOpen&&restoreFocus)document.querySelector('#mobile-menu').focus({preventScroll:true});
 return wasOpen;
}

export function initSidebar(){
 document.querySelector('#mobile-menu').onclick=()=>{
  if(drawer.matches){
   opened=!opened;sync();
   if(opened){revealActiveMenu();(document.querySelector('#navigation [aria-current="page"]')||document.querySelector('#navigation a'))?.focus({preventScroll:true});}
  }else{
   collapsed=!collapsed;
   try{localStorage.setItem('inbaps.sidebar.collapsed',String(collapsed));}catch{}
   sync();revealActiveMenu();window.dispatchEvent(new Event('resize'));
  }
 };
 document.querySelector('#sidebar-close').onclick=()=>closeSidebar(true);
 document.querySelector('#sidebar-backdrop').onclick=()=>closeSidebar(true);
 document.querySelector('#sidebar').addEventListener('click',e=>{
  const link=e.target.closest('a[href^="#"]');
  if(opened&&link&&link.hash===(location.hash||'#M00001')){
   closeSidebar();document.querySelector('#main').focus({preventScroll:true});
  }
 });
 document.addEventListener('keydown',e=>{
  if(!drawer.matches||!opened)return;
  if(e.key==='Escape'){e.preventDefault();closeSidebar(true);return;}
  if(e.key!=='Tab')return;
  const items=[...document.querySelector('#sidebar').querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getClientRects().length);
  const first=items[0],last=items.at(-1);
  if(!first)return;
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 drawer.addEventListener('change',()=>{opened=false;sync();revealActiveMenu();});
 sync();
}
