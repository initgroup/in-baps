const {test,expect}=require('@playwright/test');
const {randomUUID}=require('node:crypto');

// Real member/session/CSRF lifecycle in the isolated Playwright SYSTEM store.
// Only TARGET connection and Open API contracts are mocked: these tests do not
// claim to contact a public API or write to a real Oracle TARGET.
const issues=new WeakMap();
const fakeSecret='UI-ONLY-SECRET-DO-NOT-REFLECT';
const targetId='ui-api-target';
const tableName='INIT$_TB_BAPS_DATA_API_UI';
const malicious='<img src=x onerror="window.__apiInjected=true">';

test.beforeEach(async({page})=>{
 const captured={errors:[],console:[]};issues.set(page,captured);
 page.on('pageerror',error=>captured.errors.push(error.message));
 page.on('console',message=>{
  if(message.type()!=='error')return;
  if(message.location().url.includes('/api/auth/session')&&message.text().includes('401'))return;
  captured.console.push(message.text());
 });
 await page.addInitScript(()=>{
  window.__apiInjected=false;window.__apiCspViolations=[];
  document.addEventListener('securitypolicyviolation',event=>window.__apiCspViolations.push(event.violatedDirective));
 });
 await page.goto('/');
 await expect(page.locator('#login-form')).toBeVisible();
 await page.locator('#auth-switch').click();
 await page.locator('[name=display_name]').fill('API UI 검증 회원');
 await page.locator('[name=username]').fill('api.ui.'+randomUUID().replaceAll('-',''));
 await page.locator('[name=password]').fill('UI-Isolated-Collection-2026!');
 await page.locator('[name=confirm]').fill('UI-Isolated-Collection-2026!');
 const signup=page.waitForResponse(response=>response.url().endsWith('/api/auth/signup'));
 await page.locator('#login-form button[type=submit]').click();
 expect((await signup).status()).toBe(201);
 await expect(page.locator('#overview-page')).toBeVisible();
 await expect(page.locator('#page-loading')).not.toBeVisible();
});

test.afterEach(async({page})=>{
 expect(issues.get(page).errors,'No uncaught JavaScript failures').toEqual([]);
 expect(issues.get(page).console,'No unexpected browser console errors').toEqual([]);
 expect(await page.evaluate(()=>window.__apiCspViolations),'CSP remains intact').toEqual([]);
 expect(await page.evaluate(()=>window.__apiInjected),'API text never executes as markup').toBe(false);
});

function savedSource(){return {
 id:'ui-source',name:'등록된 API',url:'https://api.example.com/items',method:'GET',
 response_format:'json',records_path:'data.items',body_format:'json',connection_id:targetId,max_rows:20000,
 inputs:[{name:'Authorization',location:'header',type:'string',secret:true,value:'',has_secret:true}],
 fields:[{name:'region',path:'region',type:'string',required:true},{name:'value',path:'metrics.value',type:'number',required:false}],
 pagination:{mode:'none',parameter:'page',start:1,step:1,size_parameter:'per_page',page_size:100,max_pages:10},
 created_at:'2026-10-01T00:00:00Z',updated_at:'2026-10-01T00:00:00Z',locked:false,lock_until:0,
};}

async function contract(page,{existing=false}={}){
 const state={calls:[],sources:existing?[savedSource()]:[],jobs:[],runs:[],nextStatus:'SUCCEEDED',previewGate:null};
 await page.route('**/api/connections**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname;
  state.calls.push({path,method:request.method(),body:request.postDataJSON()});
  let data;
  if(path==='/api/connections'&&request.method()==='GET')data=[{id:targetId,name:'UI 계약 TARGET',allow_dml:true,mode:'direct',has_password:true}];
  else if(path===`/api/connections/${targetId}/test`&&request.method()==='POST')data={connected:true,schema:'UI_TARGET',version:'23'};
  else throw new Error('Unexpected connection request '+request.method()+' '+path);
  await route.fulfill({json:{status:'success',data}});
 });
 await page.route('**/api/collection/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname,method=request.method(),body=request.postDataJSON();
  state.calls.push({path,method,body,csrf:request.headers()['x-csrf-token']});
  let data,status=200;
  if(path==='/api/collection/sources'&&method==='GET')data=state.sources;
  else if(path==='/api/collection/jobs'&&method==='GET')data=state.jobs;
  else if(path==='/api/collection/runs'&&method==='GET')data=state.runs;
  else if(path==='/api/collection/test'&&method==='POST'){
   if(state.previewGate)await state.previewGate;
   data={connected:true,format:body.response_format,rows:Array.from({length:25},(_,index)=>({region:index===0?malicious:'서울',value:index})),
    columns:[{name:'region',type:'string'},{name:'value',type:'number'}],row_count:25,preview_limit:20,pages:1,bytes:400,truncated:true,warnings:['UI 계약: 첫 페이지 미리보기']};
  }else if(path==='/api/collection/sources'&&method==='POST'||/^\/api\/collection\/sources\/[^/]+$/.test(path)&&method==='PUT'){
   const old=state.sources.find(item=>path.endsWith('/'+item.id));
   data={...body,id:old?.id||'ui-source',created_at:old?.created_at||'2026-10-01T00:00:00Z',updated_at:'2026-10-02T00:00:00Z',locked:false,lock_until:0,
    inputs:body.inputs.map(item=>item.secret?{...item,value:'',has_secret:true}:{...item})};
   state.sources=[data];if(method==='POST')status=201;
  }else if(path.endsWith('/collect')&&method==='POST'){
   const result=state.nextStatus==='SUCCEEDED'?{table:tableName,dataset_id:'ui-collected-dataset',inserted_rows:2,total_rows:7,pages:1,bytes:400,row_count:2,truncated:false,warnings:[]}:
    {message:'UI 계약: 외부 API 호출 실패',pages:0,bytes:0,inserted_rows:0};
   data={id:'ui-run-'+(state.runs.length+1),source_id:'ui-source',job_id:null,started_at:1790000000,finished_at:1790000001,status:state.nextStatus,result};
   state.runs.unshift(data);
   if(state.nextStatus==='SUCCEEDED')state.sources[0].target={table:tableName,dataset_id:'ui-collected-dataset',row_count:7};
  }else if(path==='/api/collection/jobs'&&method==='POST'){
   data={...body,id:'ui-job',next_run_at:1790003600,created_at:'2026-10-01T00:00:00Z',updated_at:'2026-10-01T00:00:00Z'};
   state.jobs=[data];status=201;
  }else if(path==='/api/collection/jobs/ui-job'&&method==='PUT'){
   data={...state.jobs[0],...body};state.jobs=[data];
  }else throw new Error('Unexpected collection request '+method+' '+path);
  await route.fulfill({status,json:{status:'success',data}});
 });
 return state;
}

async function enter(page){
 await page.locator('#navigation [data-page=M01001]').click();await page.locator('#collection-tab-api').click();
 await expect(page.locator('#api-form')).toBeVisible();
 await expect(page.locator('#api-form [name=connection_id]')).toHaveValue(targetId);
}

test('versioned modules ignore an obsolete catalog module and reload on a changed frontend build',async({page})=>{
 await contract(page);
 const requestedModules=[];page.on('request',request=>{const url=new URL(request.url());if(url.pathname.startsWith('/static/js/'))requestedModules.push(url);});
 const version=await page.locator('meta[name=baps-build]').getAttribute('content');expect(version).toMatch(/^[0-9a-f]{20}$/);
 await page.route('**/static/js/M04001.js?legacy-cache=1',route=>route.fulfill({contentType:'application/javascript',body:'export const table = () => "old catalog";'}));
 expect(await page.evaluate(async()=>typeof (await import('/static/js/M04001.js?legacy-cache=1')).mountDatasetCatalog)).toBe('undefined');
 let changed=false;
 await page.route('**/static/pages/M01001.html',async route=>{
  const response=await route.fetch();const headers=response.headers();
  if(!changed){headers['x-frontend-version']='new-deployment';changed=true;}
  await route.fulfill({response,headers});
 });
 const reload=page.waitForEvent('framenavigated',frame=>frame===page.mainFrame());
 await page.locator('#navigation [data-page=M01001]').click();await reload;
 await expect(page.locator('#collection-tab-file')).toBeVisible();
 await page.locator('#collection-tab-api').click();await expect(page.locator('#api-form')).toBeVisible();
 expect(await page.evaluate(async()=>typeof (await import('/static/js/M04001.js')).mountDatasetCatalog)).toBe('function');
 for(const name of ['M01001.js','M04001.js'])expect(requestedModules.some(url=>url.pathname.endsWith('/'+name)&&url.searchParams.get('v')===version)).toBe(true);
 await expect(page.locator('#main')).not.toContainText('does not provide an export');
});

test('public API examples preview real observations and populate editable settings without automatic registration',async({page})=>{
 const model=await contract(page,{existing:true});
 model.jobs=Array.from({length:22},(_,index)=>({id:'job-'+index,source_id:'ui-source',name:'긴 배치 작업 이름 '.repeat(10)+index,interval_minutes:60,enabled:true,next_run_at:1790003600}));
 await page.locator('#navigation [data-page=M01001]').click();
 await expect(page.locator('#collection-file-panel')).toBeVisible();await expect(page.locator('#collection-api-panel')).toBeHidden();
 await page.locator('#collection-tab-file').focus();await page.keyboard.press('ArrowRight');
 await expect(page.locator('#collection-tab-api')).toBeFocused();await expect(page.locator('.api-example-card')).toHaveCount(12);
 const catalog=await page.evaluate(async()=>{const {apiExamples}=await import('/static/config/api-examples.js');return {count:apiExamples.length,last:apiExamples.at(-1).id};});
 expect(catalog.count).toBeGreaterThanOrEqual(100);
 await page.locator('[data-example-preview=kor-population]').click();
 await expect(page.locator('#modal tbody tr')).toHaveCount(5);await expect(page.locator('#modal')).toContainText('실제 응답 확인');
 await page.locator('#api-example-apply').click();await expect(page.locator('#api-form [name=response_format]')).toHaveValue('xml');
 expect(await page.locator('#api-form [name=url]').inputValue()).toContain('SP.POP.TOTL');
 await expect(page.locator('#api-form [name=records_path]')).toHaveValue('data/data');
 expect(model.calls.filter(call=>call.path==='/api/collection/sources'&&call.method==='POST')).toHaveLength(0);
 await page.locator('.api-examples>summary').click();
 await page.locator('[data-example-search]').fill('환경');
 await expect(page.locator('[data-example-status]')).toContainText('11개 검색');
 await expect(page.locator('.api-example-card')).toHaveCount(11);
 await page.locator('[data-example-search]').fill('제조');await expect(page.locator('.api-example-card')).toHaveCount(12);
 await page.locator('[data-example-next]').click();await expect(page.locator('.api-example-card')).toHaveCount(3);
 await page.locator('[data-example-reset]').click();
 for(let index=1;index<Math.ceil(catalog.count/12);index++)await page.locator('[data-example-next]').click();
 await expect(page.locator(`[data-example-preview="${catalog.last}"]`)).toBeVisible();
 await page.locator('[data-example-reset]').click();await page.locator('.api-example-filters>summary').click();
 await page.locator('[data-example-filter=provider][data-filter-value="한국은행 ECOS"]').click();
 await expect(page.locator('.api-example-card')).toHaveCount(6);await expect(page.locator('[data-example-status]')).toContainText('한국은행 ECOS');
 await page.locator('[data-example-preview=bok-industrial]').click();await expect(page.locator('#modal')).toContainText('공개 샘플 제한');
 await expect(page.locator('#modal')).toContainText('최대 10행');await expect(page.locator('#modal tbody tr')).toHaveCount(5);
 await page.locator('#modal [data-close]').last().click();
 await expect(page.locator('#api-form [name=response_format]')).toHaveValue('xml');
 await page.locator('[data-example-reset]').click();await page.locator('[data-example-search]').fill('<img src=x onerror=window.__apiInjected=true>');
 await expect(page.locator('.api-example-card')).toHaveCount(0);await expect(page.locator('[data-example-grid]')).toContainText('조건에 맞는');
 await page.locator('[data-example-reset]').click();
 await page.screenshot({path:require('node:path').join(__dirname,'../.runtime/qa/public-api-catalog-desktop.png'),fullPage:true});
 await page.locator('#collection-tab-file').click();await expect(page.locator('#collection-import')).toBeVisible();
 await page.locator('#collection-tab-api').click();await expect(page.locator('#api-form [name=response_format]')).toHaveValue('xml');
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 expect(await page.locator('.api-job-list').evaluate(element=>element.scrollHeight>element.clientHeight)).toBe(true);
 expect(await page.locator('.api-jobs .panel-head h3').evaluate(element=>{const text=element.getBoundingClientRect(),panel=element.closest('.panel').getBoundingClientRect();return text.left>=panel.left&&text.right<=panel.right;})).toBe(true);
 await page.screenshot({path:require('node:path').join(__dirname,'../.runtime/qa/workspace-api-mobile.png'),fullPage:true});
});
async function basicForm(page,name='Open API UI 계약'){
 await page.locator('#api-form [name=name]').fill(name);
 await page.locator('#api-form [name=url]').fill('https://api.example.com/items');
 await page.locator('#api-form [name=records_path]').fill('data.items');
}
async function input(page,{name,location='query',type='string',value='',secret=false}){
 await page.locator('#api-add-input').click();const row=page.locator('[data-input-row]').last();
 await row.locator('[data-input=name]').fill(name);await row.locator('[data-input=location]').selectOption(location);
 await row.locator('[data-input=type]').selectOption(type);await row.locator('[data-input=secret]').setChecked(secret);
 await row.locator('[data-input=value]').fill(value);return row;
}
async function output(page,{name,path,type='string',required=false}){
 await page.locator('#api-add-output').click();const row=page.locator('[data-output-row]').last();
 await row.locator('[data-output=name]').fill(name);await row.locator('[data-output=path]').fill(path);
 await row.locator('[data-output=type]').selectOption(type);await row.locator('[data-output=required]').setChecked(required);return row;
}
const latest=(state,path,method='POST')=>state.calls.filter(call=>call.path===path&&call.method===method).at(-1);

test('C-BAP typed INPUT, secret masking/reuse, JSON mapping and bounded escaped preview',async({page})=>{
 const state=await contract(page);await enter(page);await basicForm(page);
 await page.locator('#api-form [name=method]').selectOption('POST');
 const credential=await input(page,{name:'Authorization',location:'header',value:fakeSecret,secret:true});
 await expect(credential.locator('[data-input=value]')).toHaveAttribute('type','password');
 await input(page,{name:'limit',location:'body',type:'number',value:'100'});
 await input(page,{name:'active',location:'body',type:'boolean',value:'true'});
 await input(page,{name:'filter',location:'body',type:'json',value:'{"region":["서울"]}'});
 await output(page,{name:'region',path:'region',required:true});
 await output(page,{name:'value',path:'metrics.value',type:'number'});
 await output(page,{name:'detail',path:'detail',type:'json'});
 await page.locator('#api-target-test').click();
 await expect.poll(()=>latest(state,`/api/connections/${targetId}/test`)).toBeTruthy();
 await page.locator('#api-test').click();
 await expect(page.locator('#api-preview tbody tr')).toHaveCount(20);
 await expect(page.locator('#api-preview')).toContainText(malicious);
 await expect(page.locator('#api-preview img')).toHaveCount(0);
 await expect(page.locator('#api-preview')).toContainText('전체 원천의 일부');
 const tested=latest(state,'/api/collection/test');
 expect(tested.csrf).toBeTruthy();expect(tested.body.source_id).toBeUndefined();
 expect(tested.body.inputs).toEqual([
  {name:'Authorization',location:'header',type:'string',value:fakeSecret,secret:true},
  {name:'limit',location:'body',type:'number',value:'100',secret:false},
  {name:'active',location:'body',type:'boolean',value:'true',secret:false},
  {name:'filter',location:'body',type:'json',value:'{"region":["서울"]}',secret:false},
 ]);
 expect(tested.body.fields.map(field=>[field.path,field.type,field.required])).toEqual([['region','string',true],['metrics.value','number',false],['detail','json',false]]);
 expect(state.calls.some(call=>call.path.endsWith('/collect')),'Preview never requests TARGET collection').toBe(false);
 await page.locator('#api-form button[type=submit]').click();
 await expect(page.locator('[data-source=ui-source]')).toBeVisible();
 const storedCredential=page.locator('[data-input-row]').first().locator('[data-input=value]');
 await expect(storedCredential).toHaveValue('');await expect(storedCredential).toHaveAttribute('type','password');
 await expect(storedCredential).toHaveAttribute('placeholder','저장된 비밀값 유지 (변경 시 입력)');
 expect(latest(state,'/api/collection/sources').body.inputs[0].value).toBe(fakeSecret);
 await page.locator('#api-form [name=name]').fill('이름만 수정');
 await page.locator('#api-form button[type=submit]').click();
 await expect(page.locator('[data-source=ui-source]')).toContainText('이름만 수정');
 expect(latest(state,'/api/collection/sources/ui-source','PUT').body.inputs[0]).toEqual({name:'Authorization',location:'header',type:'string',value:'',secret:true});
 await page.locator('#api-test').click();await expect(page.locator('#api-preview tbody tr')).toHaveCount(20);
 expect(latest(state,'/api/collection/test').body.source_id).toBe('ui-source');
 expect(latest(state,'/api/collection/test').body.inputs[0].value).toBe('');
 expect(await page.locator('#openapi-workspace').innerHTML()).not.toContain(fakeSecret);
});

test('C-BAP XML element/attribute mappings and offset paging preserve submitted settings',async({page})=>{
 const state=await contract(page);await enter(page);await basicForm(page,'XML 수집 계약');
 await page.locator('#api-form [name=response_format]').selectOption('xml');
 await page.locator('#api-form [name=records_path]').fill('response/body/items/item');
 await output(page,{name:'id',path:'@id',required:true});
 await output(page,{name:'amount',path:'metrics/amount',type:'number'});
 await output(page,{name:'detail',path:'detail',type:'json'});
 await page.locator('.api-pagination summary').click();
 await page.locator('[name=page_mode]').selectOption('offset');await page.locator('[name=page_parameter]').fill('offset');
 await page.locator('[name=page_start]').fill('0');await page.locator('[name=page_step]').fill('50');
 await page.locator('[name=size_parameter]').fill('limit');await page.locator('[name=page_size]').fill('50');
 await page.locator('[name=max_pages]').fill('4');await page.locator('[name=max_rows]').fill('150');
 await page.locator('#api-test').click();await expect(page.locator('#api-preview')).toContainText('API 연결 성공');
 const body=latest(state,'/api/collection/test').body;
 expect(body).toMatchObject({response_format:'xml',records_path:'response/body/items/item',max_rows:150,
  pagination:{mode:'offset',parameter:'offset',start:0,step:50,size_parameter:'limit',page_size:50,max_pages:4}});
 expect(body.fields.map(field=>[field.name,field.path,field.type])).toEqual([['id','@id','string'],['amount','metrics/amount','number'],['detail','detail','json']]);
 expect(state.calls.some(call=>call.method!=='GET'&&call.path!=='/api/collection/test')).toBe(false);
});

test('C-BAP TARGET collect result, durable failure message and batch registration/pause',async({page})=>{
 await page.clock.install();
 const state=await contract(page,{existing:true});await enter(page);
 await page.locator('#api-collect').click();
 await expect(page.locator('#modal')).toBeVisible();await expect(page.locator('.api-run-details')).toContainText(tableName);
 await expect(page.locator('.api-run-details')).toContainText('이번 저장 2행 · 누적 7행');
 await page.locator('#modal [data-close]').first().click();
 await expect(page.locator('.api-history tbody tr')).toHaveCount(1);
 await expect(page.locator('.api-history tbody tr')).toContainText('완료');
 await expect(page.locator('#api-form')).toContainText(tableName);
 await page.locator('#api-add-job').click();
 await page.locator('#api-job-form [name=name]').fill('시간별 API 수집');
 await page.locator('#api-job-form [name=interval_minutes]').fill('30');
 await page.locator('#api-job-form button.primary').click();
 await expect(page.locator('[data-job-toggle=ui-job]')).toHaveText('일시 정지');
 expect(latest(state,'/api/collection/jobs').body).toEqual({source_id:'ui-source',name:'시간별 API 수집',interval_minutes:30,enabled:true});
 await page.locator('[data-job-toggle=ui-job]').click();
 await expect(page.locator('[data-job-toggle=ui-job]')).toHaveText('재개');
 expect(latest(state,'/api/collection/jobs/ui-job','PUT').body).toEqual({source_id:'ui-source',name:'시간별 API 수집',interval_minutes:30,enabled:false});
 state.nextStatus='FAILED';await page.locator('#api-collect').click();
 await expect(page.locator('#modal-title')).toHaveText('실패');
 const failure=page.locator('.message-layer.error');
 await expect(failure).toContainText('UI 계약: 외부 API 호출 실패');
 // Longer than the shared layer's 7-second success expiry; errors need an explicit close.
 await page.clock.fastForward(8000);
 await expect(failure).toBeVisible();
 await failure.locator('.message-close').first().click();await expect(failure).toHaveCount(0);
 await expect(page.locator('#modal')).toBeVisible();
 await page.locator('#modal [data-close]').first().click();
 await expect(page.locator('.api-history tbody tr')).toHaveCount(2);
 await expect(page.locator('.api-history tbody tr').first()).toContainText('실패');
 expect(state.calls.filter(call=>call.path.endsWith('/collect'))).toHaveLength(2);
});

test('C-BAP mobile workspace stays within viewport and ignores a late preview after navigation',async({page})=>{
 const state=await contract(page,{existing:true});await enter(page);
 await page.setViewportSize({width:390,height:844});
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#api-form [name=name]').fill('모바일 API');
 await output(page,{name:'detail',path:'detail',type:'json'});
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 let release;state.previewGate=new Promise(resolve=>release=resolve);
 try{
  const previewResponse=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/collection/test');
  await page.locator('#api-test').click();
  await expect.poll(()=>latest(state,'/api/collection/test')).toBeTruthy();
  await expect(page.locator('#api-test')).toBeDisabled();
  await page.locator('#mobile-menu').click();
  await page.locator('#navigation [data-page=M04001]').click();
  await expect(page).toHaveURL(/#M04001$/);
  await expect(page.locator('#collection-page')).toHaveCount(0);
  release();await previewResponse;
  await expect(page.locator('#page-loading')).not.toBeVisible();
  await expect(page.locator('#modal')).not.toBeVisible();
  await expect(page.locator('#api-preview')).toHaveCount(0);
  await expect(page.locator('.message-layer.error')).toHaveCount(0);
  await page.locator('#mobile-menu').click();await page.locator('#navigation [data-page=M01001]').click();await page.locator('#collection-tab-api').click();
  await expect(page.locator('#api-form')).toBeVisible();await expect(page.locator('#api-test')).toBeEnabled();
  await expect(page.locator('#api-preview')).toBeEmpty();
 }finally{release();}
});
