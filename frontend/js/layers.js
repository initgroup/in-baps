// Movable dialogs and notices. Notices belong to the active dialog so they stay
// interactive above its backdrop, while the Popover API places them on top.
const notices = new Map();
let modalCleanup = null;
const region = () => document.querySelector('#toast-region');
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function syncFeedback(){
 const dialog=document.querySelector('#modal'),parent=dialog?.open?dialog:document.body;
 for(const container of document.querySelectorAll('#toast-region,#progress-region')){
 if(container.parentElement!==parent){container.hidePopover();parent.append(container);}
 if(container.childElementCount){if(!container.matches(':popover-open'))container.showPopover();}
 else container.hidePopover();
 }
}

// API failures are reported even when a page has no local catch handler. Let a
// caller's more specific message run first and avoid showing the same error twice.
export function reportRequestError(error){
 setTimeout(()=>{
  if([...notices.keys()].some(n=>n.classList.contains('error')&&n.dataset.message.includes(error.message)))return;
  showMessage(error.message,true);
 },0);
}

export function movableLayer(element, handle, onMove = () => {}) {
 const controller = new AbortController(), options = {signal:controller.signal};
 let drag = null, placed = false;
 function place(left, top) {
  const rect = element.getBoundingClientRect(), gap = 12;
  const x = Math.max(gap, Math.min(left, innerWidth - rect.width - gap));
  const y = Math.max(gap, Math.min(top, innerHeight - rect.height - gap));
  Object.assign(element.style, {position:'fixed',margin:'0',inset:'auto',left:x+'px',top:y+'px'});
  placed = true;
 }
 handle.addEventListener('pointerdown', e => {
  if(e.button!==0 || e.target.closest('button,a,input,select,textarea'))return;
  const rect = element.getBoundingClientRect();
  drag = {x:e.clientX,y:e.clientY,left:rect.left,top:rect.top};
  handle.setPointerCapture(e.pointerId);element.classList.add('dragging');e.preventDefault();
 }, options);
 handle.addEventListener('pointermove', e => {
  if(!drag)return;
  place(drag.left+e.clientX-drag.x,drag.top+e.clientY-drag.y);onMove();
 }, options);
 const release = () => {drag=null;element.classList.remove('dragging');};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(event,release,options);
 handle.addEventListener('keydown', e => {
  const delta={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]}[e.key];
  if(!delta || e.target!==handle)return;
  e.preventDefault();const rect=element.getBoundingClientRect();place(rect.left+delta[0],rect.top+delta[1]);onMove();
 }, options);
 const keepVisible=()=>{if(placed&&element.isConnected){const rect=element.getBoundingClientRect();place(rect.left,rect.top);}};
 window.addEventListener('resize',keepVisible,options);
 const observer=new ResizeObserver(keepVisible);observer.observe(element);
 return ()=>{controller.abort();observer.disconnect();};
}

export function clearMessages() {
 for(const cleanup of [...notices.values()])cleanup();
 syncFeedback();
}

export function showMessage(message, error=false) {
 const container=region();
 for(const notice of notices.keys())if(notice.dataset.message===String(message))return;
 const dialog=document.querySelector('#modal'),parent=dialog.open?dialog:document.body;
 if(container.parentElement!==parent){container.hidePopover();parent.append(container);}
 const notice=document.createElement('section');
 notice.className='message-layer'+(error?' error':'');notice.dataset.message=String(message);
 notice.setAttribute('aria-label',error?'확인이 필요합니다':'알림');
 notice.innerHTML=`<div class="message-head"><div class="layer-handle" tabindex="0" role="button" aria-label="알림 이동: 드래그 또는 방향키"><span class="message-symbol" aria-hidden="true">${error?'!':'✓'}</span><strong>${error?'확인이 필요합니다':'알림'}</strong><span class="move-hint">드래그하여 이동</span></div><button class="icon-button message-close" type="button" aria-label="알림 닫기">×</button></div><p class="message-body" role="${error?'alert':'status'}" aria-live="${error?'assertive':'polite'}" aria-atomic="true"></p><div class="message-actions"><button class="button small message-close" type="button">확인</button></div>`;
 container.append(notice);syncFeedback();
 notice.querySelector('.message-body').textContent=String(message);
 if(!reducedMotion())notice.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});
 let timer=null,pinned=error,disposed=false;
 const pause=()=>clearTimeout(timer);
 const schedule=()=>{pause();if(!pinned)timer=setTimeout(dismiss,7000);};
 const stopDrag=movableLayer(notice,notice.querySelector('.layer-handle'),()=>{pinned=true;pause();});
 function dismiss(){
  if(disposed)return;disposed=true;pause();stopDrag();
  const focused=notice.contains(document.activeElement);
  notice.remove();notices.delete(notice);
  syncFeedback();
  if(focused){const target=parent.querySelector('[aria-invalid="true"]')||parent.querySelector('input:not([disabled]),textarea:not([disabled]),button:not([disabled])');target?.focus({preventScroll:true});}
 }
 notices.set(notice,dismiss);
 notice.querySelectorAll('.message-close').forEach(button=>button.onclick=dismiss);
 notice.addEventListener('pointerenter',pause);notice.addEventListener('pointerleave',schedule);
 notice.addEventListener('focusin',pause);notice.addEventListener('focusout',()=>{if(!notice.contains(document.activeElement))schedule();});
 schedule();return dismiss;
}

export function openLayer(html) {
 clearMessages();modalCleanup?.();
 const dialog=document.querySelector('#modal'),content=document.querySelector('#modal-content');
 dialog.removeAttribute('style');content.innerHTML=html;
 const title=content.querySelector('h2');if(title){title.id='modal-title';dialog.setAttribute('aria-labelledby',title.id);}
 if(!dialog.open)dialog.showModal();
 syncFeedback();
 content.querySelectorAll('[data-close]').forEach(button=>button.onclick=closeLayer);
 const handle=content.querySelector('.layer-handle');modalCleanup=handle?movableLayer(dialog,handle):null;
 if(!reducedMotion())dialog.animate([{opacity:0,transform:'translateY(10px) scale(.99)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:180,easing:'ease-out'});
 (content.querySelector('input:not([readonly]):not([type=checkbox]):not([type=hidden]),textarea:not([readonly]),select')||content.querySelector('[data-close]'))?.focus({preventScroll:true});
}

export function closeLayer() {
 clearMessages();modalCleanup?.();modalCleanup=null;
 const dialog=document.querySelector('#modal');document.body.append(region());dialog.close();syncFeedback();
}

export function initLayers() {
 const dialog=document.querySelector('#modal');
 dialog.addEventListener('cancel',e=>{e.preventDefault();closeLayer();});
 dialog.addEventListener('click',e=>{
  if(e.target!==dialog)return;
  const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeLayer();
 });
 document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||!notices.size)return;
  e.preventDefault();e.stopImmediatePropagation();[...notices.values()].at(-1)();
 },true);
 let firstInvalid=null;
 document.addEventListener('invalid',e=>{
  e.preventDefault();e.target.setAttribute('aria-invalid','true');
  if(firstInvalid)return;firstInvalid=e.target;
  // Browser validation may flush microtasks between individual invalid events.
  // Wait for the complete validation pass and report its first invalid control.
  setTimeout(()=>{
   const input=firstInvalid;firstInvalid=null;if(!input.isConnected)return;
   const label=input.getAttribute('aria-label')||[...(input.labels?.[0]?.childNodes||[])].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent.trim()).join(' ')||'입력값';
   const v=input.validity;
   const detail=v.valueMissing?'필수 항목을 입력하거나 선택하세요.':v.tooShort?`${input.minLength}자 이상 입력하세요.`:v.rangeUnderflow?`${input.min} 이상의 값을 입력하세요.`:v.rangeOverflow?`${input.max} 이하의 값을 입력하세요.`:v.patternMismatch?'입력 형식이 올바르지 않습니다. 입력란의 안내를 확인하세요.':v.badInput||v.stepMismatch?'올바른 숫자를 입력하세요.':'입력값의 형식을 확인하세요.';
   input.focus({preventScroll:false});showMessage(label+' · '+detail,true);
  },0);
 },true);
 document.addEventListener('input',e=>{if(e.target.validity?.valid)e.target.removeAttribute('aria-invalid');});
}
