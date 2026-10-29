const tasks=new Map();let sequence=0,previousFocus=null;
const dialog=()=>document.querySelector('#page-loading');
export const isPageLoading=()=>tasks.size>0;
function present(task){const el=dialog();el.dataset.variant=task.variant;el.querySelector('[role=status]').textContent=task.label;}
export function startPageLoading(label='화면을 준비하고 있습니다.',{variant='page'}={}){
 const id=++sequence,task={label,variant:variant==='analysis'?'analysis':'page'};tasks.set(id,task);const el=dialog();present(task);
 if(!el.open){previousFocus=document.activeElement;document.body.classList.add('page-loading');document.querySelector('#main').setAttribute('aria-busy','true');el.showModal();}
 return {finish(){if(!tasks.delete(id))return;if(tasks.size){present([...tasks.values()].at(-1));return;}clearPageLoading();}};
}
export function clearPageLoading(){
 tasks.clear();dialog().close();document.body.classList.remove('page-loading');document.querySelector('#main').removeAttribute('aria-busy');
 if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});else document.querySelector('#main').focus({preventScroll:true});previousFocus=null;
}
dialog().addEventListener('cancel',e=>e.preventDefault());
document.addEventListener('keydown',e=>{if(isPageLoading()&&e.key==='Tab'){e.preventDefault();dialog().focus({preventScroll:true});}},true);
