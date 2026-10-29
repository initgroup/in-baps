import {movableLayer,syncFeedback} from './layers.js';

const tasks=new Map();
let panel=null,cleanup=null,timer=null,nextId=0;
const elapsed=started=>{const seconds=Math.floor((performance.now()-started)/1000);return seconds<60?`${seconds}초`:`${Math.floor(seconds/60)}분 ${seconds%60}초`;};

function render(){
 const visible=[...tasks.values()].filter(task=>performance.now()-task.started>=task.delay);
 if(!visible.length){
  cleanup?.();cleanup=null;panel?.remove();panel=null;syncFeedback();
  if(!tasks.size){clearInterval(timer);timer=null;}
  return;
 }
 if(!panel){
  panel=document.createElement('section');panel.className='work-progress';panel.setAttribute('aria-label','작업 진행 상황');
  panel.innerHTML='<div class="message-head"><div class="layer-handle" tabindex="0" role="button" aria-label="진행 창 이동: 드래그 또는 방향키"><span class="spinner" aria-hidden="true"></span><strong>작업 진행 중</strong><span class="work-count"></span><span class="move-hint">드래그하여 이동</span></div></div><div class="work-list"></div><p class="work-help">처리가 끝나면 자동으로 닫힙니다.</p>';
  document.querySelector('#progress-region').append(panel);syncFeedback();
  cleanup=movableLayer(panel,panel.querySelector('.layer-handle'));
 }
 panel.querySelector('.work-count').textContent=visible.length>1?`${visible.length}건`:'';
 const list=panel.querySelector('.work-list');
 for(const item of [...list.children])if(!visible.some(t=>String(t.id)===item.dataset.task))item.remove();
 for(const task of visible){
  let row=list.querySelector(`[data-task="${task.id}"]`);
  if(!row){
   row=document.createElement('div');row.className='work-item';row.dataset.task=task.id;
   row.innerHTML='<div class="work-caption"><strong class="work-label" role="status" aria-live="polite"></strong><span class="work-elapsed"></span></div><div class="work-meter" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span></span></div><div class="work-description"><span class="work-detail"></span><b class="work-percent"></b></div>';
   list.append(row);
  }
  const label=row.querySelector('.work-label');if(label.textContent!==task.label)label.textContent=task.label;
  row.querySelector('.work-elapsed').textContent=elapsed(task.started);
  const measured=Number.isFinite(task.total)&&task.total>0&&Number.isFinite(task.completed);
  const percent=measured?Math.max(0,Math.min(100,Math.floor(task.completed/task.total*100))):null;
  const meter=row.querySelector('.work-meter');meter.setAttribute('aria-label',task.label);meter.classList.toggle('indeterminate',!measured);
  if(measured){meter.setAttribute('aria-valuenow',percent);meter.firstElementChild.style.width=percent+'%';}
  else{meter.removeAttribute('aria-valuenow');meter.firstElementChild.style.removeProperty('width');}
  row.querySelector('.work-percent').textContent=measured?`${percent}%`:'';
  row.querySelector('.work-detail').textContent=task.detail||(performance.now()-task.started>=10000?'처리가 계속 진행 중입니다. 잠시 기다려 주세요.':'처리 결과를 기다리고 있습니다.');
 }
}

// Only completed/total from real work may produce a percentage. Elapsed time is
// informational; it never estimates database progress or a completion deadline.
export function startTask(label,{delay=300,detail='',completed=null,total=null}={}){
 const task={id:++nextId,label,delay,detail,completed,total,started:performance.now()};tasks.set(task.id,task);
 if(!timer)timer=setInterval(render,200);render();
 return {
  update(values){if(!tasks.has(task.id))return;for(const key of ['label','detail','completed','total'])if(key in values)task[key]=values[key];render();},
  finish(){tasks.delete(task.id);render();}
 };
}

export function clearProgress(){tasks.clear();render();}

export const nextPaint=()=>new Promise(resolve=>{
 // Rendering frames can pause in background tabs; never stall an export there.
 const fallback=setTimeout(done,100),frame=requestAnimationFrame(()=>setTimeout(done,0));
 function done(){clearTimeout(fallback);cancelAnimationFrame(frame);resolve();}
});

export function requestLabel(path,method){
 const route=path.split('?')[0];
 if(route==='/auth/login')return '로그인 중';
 if(route==='/auth/signup')return '회원가입 중';
 if(route==='/auth/logout')return '로그아웃 중';
 if(route==='/auth/activity')return '로그인 시간 연장 중';
 if(route.startsWith('/connections')&&route.endsWith('/test'))return 'DB 연결 확인 중';
 if(route==='/analysis')return '데이터 분석 중';
 if(route==='/datasets/import')return '파일 전송 준비 중';
 if(route==='/system/schema/initialize')return '시스템 오브젝트 검증·생성 중';
 const dbms={query:'SQL 조회 중',dml:'SQL 변경 작업 실행 중',grid:'그리드 변경 작업 실행 중',objects:'DB 오브젝트 조회 중',ddl:'DDL 소스 조회 중',import:'TARGET DB에 데이터 적재 중',datasets:'SQL 데이터셋 연결 중',sample:'DB에 예제 데이터 생성 중',tables:'테이블 생성 중',columns:method==='GET'?'컬럼 구조 조회 중':'테이블 구조 변경 중'};
 if(route.startsWith('/dbms/'))return dbms[route.split('/')[2]]||'DB 작업 처리 중';
 const subject=route.startsWith('/connections')?'DB 연결 정보':route.startsWith('/visualizations')?'인사이트':route.startsWith('/datasets')?'데이터':route.startsWith('/system')?'시스템 정보':'요청';
 return `${subject} ${method==='GET'?'불러오는':method==='DELETE'?'삭제하는':'저장하는'} 중`;
}

// XMLHttpRequest exposes actual upload byte counts, unlike fetch. A completed
// upload is a separate phase from the server's parsing, validation and DB write.
export function uploadRequest(url,options,task){
 return new Promise((resolve,reject)=>{
  const xhr=new XMLHttpRequest(),signal=options.signal;
  const abort=()=>xhr.abort();
  const cleanup=()=>signal?.removeEventListener('abort',abort);
  if(signal?.aborted){reject(new DOMException('요청이 취소되었습니다.','AbortError'));return;}
  xhr.open(options.method||'POST',url);
  for(const [key,value] of new Headers(options.headers))xhr.setRequestHeader(key,value);
  xhr.upload.onprogress=e=>task?.update({label:'파일 전송 중',completed:e.lengthComputable?e.loaded:null,total:e.lengthComputable?e.total:null,detail:e.lengthComputable?`${(e.loaded/1048576).toFixed(1)} / ${(e.total/1048576).toFixed(1)} MB 전송`:'파일을 서버로 전송하고 있습니다.'});
  xhr.upload.onload=()=>task?.update({label:'TARGET DB에 파일 적재 중',completed:null,total:null,detail:'파일 전송 완료 · 서버에서 검증하고 DB에 저장 중입니다.'});
  xhr.onload=()=>{cleanup();resolve({ok:xhr.status>=200&&xhr.status<300,status:xhr.status,headers:{get:name=>xhr.getResponseHeader(name)},json:async()=>JSON.parse(xhr.responseText)});};
  xhr.onerror=()=>{cleanup();reject(new TypeError('네트워크 연결 실패'));};
  xhr.onabort=()=>{cleanup();reject(new DOMException('요청이 취소되었습니다.','AbortError'));};
  signal?.addEventListener('abort',abort,{once:true});
  try{xhr.send(options.body);}catch(error){cleanup();reject(error);}
 });
}
