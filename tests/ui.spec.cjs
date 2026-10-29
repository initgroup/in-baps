const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');

// These deterministic, explicitly submitted fixtures exercise the isolated SQLite
// SYSTEM stores. Oracle execution is covered separately by oracle_live_smoke.py.
const fixtureName='UI 검증용 명시적 데이터';
const fixtureRows=[
 {date:'2026-10-01',region:'서울',channel:'검색',revenue:10,visitors:100,keyword:'데이터 분석'},
 {date:'2026-10-02',region:'서울',channel:'직접',revenue:20,visitors:200,keyword:'데이터 시각화'},
 {date:'2026-10-20',region:'부산',channel:'검색',revenue:30,visitors:300,keyword:'분석 시각화'},
 {date:'2026-10-21',region:'부산',channel:'직접',revenue:40,visitors:400,keyword:'데이터 연결'},
];
const issues=new WeakMap(),accounts=new WeakMap();
const qa=path.join(__dirname,'..','.runtime','qa');

test('advanced statistical parameters, diagnostics, saved results and JSON export',async({page})=>{
 const rows=Array.from({length:32},(_,i)=>({x:i%4,z:Math.floor(i/4)%4,y:5+2*(i%4)+3*(Math.floor(i/4)%4)+(i<16?-1:1),group:i<16?'A':'B'}));
 rows.push({x:null,z:1,y:4,group:'A'});
 await explicitDataset(page,'R-BAP','고급 통계 UI 명시적 입력',rows);
 await route(page,'M02001','R-BAP 데이터 분석');
 await expect(page.locator('#analysis-methods [data-choice-status]')).toContainText('20개');await expect(page.locator('select#analysis-method')).toHaveCount(0);
 const execute=async()=>{
  const response=page.waitForResponse(r=>r.url().endsWith('/api/analysis')&&r.request().method()==='POST');
  await page.locator('#run-analysis').click();const completed=await response;
  expect(completed.status()).toBe(201);return (await completed.json()).data;
 };
 await chooseMethod(page,'descriptive');
 await page.locator('#analysis-confidence').selectOption('0.99');
 const descriptive=await execute();
 expect(descriptive.parameters.confidence).toBe(.99);
 expect(descriptive.result.rows.find(row=>row.name==='x').n).toBe(32);
 await expect(page.locator('#analysis-result')).toContainText('평균의 99% 신뢰구간');
 await expect(page.locator('.advanced-result-table')).toHaveCount(1);
 await expect(page.locator('.advanced-sample-note')).toContainText('입력 33행');
 await chooseMethod(page,'pca');
 const pca=await execute();expect(pca.result.sample.excluded).toBe(1);
 await expect(page.locator('#advanced-chart canvas').first()).toBeVisible();
 await expect(page.locator('#analysis-result')).toContainText('설명분산');
 await chooseMethod(page,'ols');
 await page.locator('#analysis-value').selectOption('y');
 await page.locator('[name="advanced-columns"][value="x"]').check();
 await page.locator('[name="advanced-columns"][value="z"]').check();
 await expect(page.locator('[name="advanced-columns"][value="y"]')).toBeDisabled();
 const regression=await execute();
 expect(regression.parameters.robust).toBe(true);
 expect(regression.parameters.columns).toEqual(['x','z']);
 expect(regression.result.tables.some(table=>table.key==='validation')).toBe(true);
 await expect(page.locator('#analysis-result')).toContainText('HC3');
 await expect(page.locator('#analysis-result')).toContainText('VIF');
 await page.locator('#analysis-history').click();
 await page.locator('[data-analysis-history]').filter({hasText:'기술통계·평균 신뢰구간'}).click();
 await expect(page.locator('#result-title')).toHaveText('기술통계·평균 신뢰구간');
 await expect(page.locator('[data-analysis-method=ols]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#analysis-result')).toContainText('평균의 99% 신뢰구간');
 const downloading=page.waitForEvent('download');await page.locator('#export-analysis-json').click();
 const download=await downloading;
 expect(download.suggestedFilename()).toBe('inbaps-analysis-descriptive.json');
 const saved=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
 expect(saved.id).toBe(descriptive.id);expect(saved.result).toEqual(descriptive.result);
});

test.beforeEach(async({page})=>{
 const captured={errors:[],console:[]};issues.set(page,captured);
 page.on('pageerror',e=>captured.errors.push(e.message));
 page.on('console',message=>{
  if(message.type()!=='error')return;
  if(message.location().url.includes('/api/auth/session')&&message.text().includes('401'))return;
  captured.console.push(`${message.text()} (${message.location().url})`);
 });
 await page.addInitScript(()=>{
  window.__bapsCspViolations=[];
  document.addEventListener('securitypolicyviolation',e=>window.__bapsCspViolations.push(`${e.violatedDirective}: ${e.blockedURI}`));
 });
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'인법스 로그인',exact:true})).toBeVisible();
 expect(requests.some(url=>url.includes('/auth/demo')),'No automatic demonstration login').toBeFalsy();
 const account={username:'ui.'+randomUUID().replaceAll('-',''),password:'UI-Isolated-Account-2026!',display_name:'UI 검증 회원'};accounts.set(page,account);
 await page.locator('#auth-switch').click();
 await page.locator('[name=display_name]').fill(account.display_name);
 await page.locator('[name=username]').fill(account.username);
 await page.locator('[name=password]').fill(account.password);
 await page.locator('[name=confirm]').fill(account.password);
 const signup=page.waitForResponse(r=>r.url().endsWith('/api/auth/signup'));
 await page.locator('#login-form button[type=submit]').click();
 expect((await signup).status()).toBe(201);
 await expect(page.locator('#navigation .nav-link').first()).toBeVisible();
 await expect(page.getByRole('heading',{name:'인법스 개요',exact:true})).toBeVisible();
 await expect(page.locator('#overview-content')).toContainText('분석할 데이터를 연결하세요');
 expect(await page.evaluate(async()=>{const {state}=await import('/static/js/core.js');return state.datasets.length;}),'New accounts begin with no seeded rows').toBe(0);
});
test.afterEach(async({page})=>{
 const captured=issues.get(page);
 expect(captured.errors,'Uncaught browser JavaScript errors').toEqual([]);
 expect(captured.console,'Browser console errors').toEqual([]);
 expect(await page.evaluate(()=>window.__bapsCspViolations),'Content Security Policy violations').toEqual([]);
});

async function route(page,code,heading){
 await page.locator(`#navigation [data-page="${code}"]`).click();
 await expect(page).toHaveURL(new RegExp(`#${code}$`));
 await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();
}
async function explicitDataset(page,module='R-BAP',name=fixtureName,rows=fixtureRows){
 return page.evaluate(async payload=>{
  const core=await import('/static/js/core.js');
  const item=await core.post('/datasets',{...payload,source:'ui-test-fixture',description:'명시적으로 제출한 자동 검증 데이터 · 실제 고객 데이터 아님'});
  core.state.selected=item.id;await core.refreshData();window.dispatchEvent(new HashChangeEvent('hashchange'));return item;
 },{name,rows,module});
}
async function chooseMethod(page,id){await page.locator('#analysis-methods [data-choice-search]').fill(id);await page.locator(`[data-analysis-method="${id}"]`).click();}
async function selectDataset(page,name){
 if(await page.locator('#analysis-data-picker').count())await page.locator('#analysis-data-picker').evaluate(el=>el.open=true);
 if(await page.locator('select#dataset-select').isVisible()){await page.locator('#dataset-select').selectOption({label:name});}
 else{const host=page.locator('#analysis-datasets:visible,#visual-datasets:visible');await host.locator('[data-choice-search]').fill(name);const id=await page.evaluate(async name=>(await import('/static/js/core.js')).state.datasets.find(item=>item.name===name)?.id,name);await host.locator(`[data-dataset-choice="${id}"]`).click();}
 await expect.poll(()=>page.evaluate(async()=>{const {state}=await import('/static/js/core.js');return state.dataset?.name;})).toBe(name);
}
async function visualDataset(page){if(await page.locator('#visual-datasets').isVisible()){const id=await page.evaluate(async()=>(await import('/static/js/core.js')).state.selected);await page.locator(`[data-dataset-choice="${id}"]`).click();}}
async function runAnalysis(page,method){
 await chooseMethod(page,method);
 const response=page.waitForResponse(r=>r.url().endsWith('/api/analysis')&&r.request().method()==='POST');
 await page.locator('#run-analysis').click();const result=await response;expect(result.status()).toBe(201);
 await expect(page.locator('#export-analysis')).toBeEnabled();return (await result.json()).data;
}
async function chartType(page,type){
 await visualDataset(page);
 await page.locator(`[data-chart-type="${type}"]`).click();
 await expect(page.locator(`[data-chart-type="${type}"]`)).toHaveAttribute('aria-pressed','true');
 await page.locator('#visual-x').selectOption('region');await page.locator('#visual-y').selectOption('revenue');
 if(['scatter','heatmap','sunburst','sankey','graph'].includes(type))await page.locator('#visual-secondary').selectOption(type==='scatter'?'visitors':'channel');
 await page.locator('#visual-aggregation').selectOption('sum');await page.locator('#apply-chart').click();
 await expect(page.locator('#studio-chart canvas').first()).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>window.echarts.getInstanceByDom(document.querySelector('#studio-chart'))?.getOption().series?.[0]?.type)).toBe(type==='area'?'line':type);
}

test('[Workspace lists] accumulated datasets remain bounded and V-BAP requires data before chart options',async({page})=>{
 const records=await page.evaluate(async()=>{
  const core=await import('/static/js/core.js'),items=[];
  for(let index=0;index<45;index++)items.push(await core.post('/datasets',{name:'누적 목록 '+String(index).padStart(2,'0'),module:'R-BAP',source:index%2?'analysis':'explicit-ui-input',rows:[{region:'서울',value:index+1},{region:'부산',value:index+2}]}));
  await core.refreshData();return items;
 });
 await route(page,'M02001','R-BAP 데이터 분석');
 await expect(page.locator('#analysis-datasets [data-dataset-choice]')).toHaveCount(6);
 await page.locator('#analysis-data-picker summary').click();
 await page.locator('#analysis-datasets [data-choice-search]').fill('누적 목록 42');
 await expect(page.locator('#analysis-datasets [data-dataset-choice]')).toHaveCount(1);
 await page.locator('#analysis-datasets [data-dataset-choice]').click();
 await expect(page.locator('#analysis-selected-data')).toHaveText('누적 목록 42');
 await expect(page.locator('#analysis-data-picker')).not.toHaveAttribute('open','');
 const methodBox=await page.locator('.research-methods').boundingBox(),settingsBox=await page.locator('.research-settings').boundingBox();
 expect(Math.abs(methodBox.y-settingsBox.y)).toBeLessThan(2);
 expect(settingsBox.x).toBeGreaterThan(methodBox.x);
 await expect(page.locator('#run-analysis')).toBeInViewport();
 const resultBox=await page.locator('.research-results').boundingBox();
 expect(Math.abs(resultBox.x-settingsBox.x)).toBeLessThan(2);
 expect(resultBox.y-settingsBox.y-settingsBox.height).toBeLessThan(25);
 expect(resultBox.y).toBeLessThan(methodBox.y+methodBox.height);
 await page.locator('#analysis-data-picker summary').click();
 await expect(page.locator('#analysis-datasets [data-choice-search]')).toHaveValue('누적 목록 42');
 await page.locator('#analysis-data-picker summary').click();
 await expect(page.locator('#analysis-page select#dataset-select,#analysis-page select#analysis-method,#run-batch-analysis')).toHaveCount(0);
 await chooseMethod(page,'ols');await expect(page.locator('#analysis-settings-title')).toContainText('다중 선형회귀');
 await expect(page.locator('#analysis-run-method')).toContainText('다중 선형회귀');
 await page.screenshot({path:path.join(qa,'workspace-research-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await page.screenshot({path:path.join(qa,'workspace-research-mobile.png'),fullPage:true,animations:'disabled'});await page.setViewportSize({width:1440,height:1000});
 await route(page,'M03001','V-BAP 시각화');await expect(page.locator('#visual-datasets')).toBeVisible();
 await expect(page.locator('#visual-data-picker summary')).toContainText('1. 시각화 데이터셋');
 await expect(page.locator('#visual-data-picker summary')).toContainText('데이터셋을 선택하세요.');
 await expect(page.locator('#visual-data-picker summary')).toContainText('목록 열기 / 닫기');
 await expect(page.getByRole('searchbox',{name:'시각화 데이터셋 검색',exact:true})).toBeVisible();
 await expect(page.locator('#visual-datasets .choice-filters button')).toHaveText(['전체','API','파일','직접 입력','DB SQL','분석 결과']);
 await page.screenshot({path:path.join(qa,'workspace-data-first-desktop.png'),fullPage:true});
 await expect(page.locator('[data-chart-type],#visual-fields')).toHaveCount(0);
 await page.locator('#visual-datasets [data-choice-search]').fill('누적');
 await page.locator('#visual-datasets [data-choice-search]').fill('');
 await expect(page.locator('#visual-datasets [data-dataset-choice]')).toHaveCount(12);
 await page.locator('#visual-datasets [data-choice-next]').click();await expect(page.locator('#visual-datasets [data-choice-page]')).toHaveText('2 / 4');
 await page.locator('#visual-datasets [data-choice-search]').fill('누적 목록 42');await page.locator('#visual-datasets [data-dataset-choice]').click();
 await expect(page.locator('#visual-selected-name')).toHaveText('누적 목록 42');await expect(page.locator('[data-chart-type]')).toHaveCount(14);await expect(page.locator('#visual-fields')).toHaveCount(0);
 await page.locator('[data-chart-type=bar]').scrollIntoViewIfNeeded();
 const firstTypePosition=await page.locator('[data-chart-type=bar]').boundingBox();
 await page.evaluate(()=>{window.__firstTypeButton=document.querySelector('[data-chart-type=bar]');window.__firstDataSummary=document.querySelector('#visual-data-picker summary');window.__firstScrollY=scrollY;});
 await page.locator('[data-chart-type=bar]').click();await expect(page.locator('#visual-fields')).toBeVisible();await expect(page.locator('#visual-grid-body tr')).toHaveCount(2);
 expect(await page.evaluate(()=>window.__firstTypeButton===document.querySelector('[data-chart-type=bar]')&&window.__firstDataSummary===document.querySelector('#visual-data-picker summary'))).toBe(true);
 await expect(page.locator('[data-chart-type=bar]')).toBeFocused();
 const afterFirstTypePosition=await page.locator('[data-chart-type=bar]').boundingBox();
 expect(Math.abs(afterFirstTypePosition.x-firstTypePosition.x)).toBeLessThan(1);
 expect(Math.abs(afterFirstTypePosition.y-firstTypePosition.y)).toBeLessThan(1);
 expect(await page.evaluate(()=>Math.abs(scrollY-window.__firstScrollY))).toBeLessThan(1);
 await page.evaluate(()=>{window.__stableChartHost=document.querySelector('#studio-chart');window.__stableTypeButton=document.querySelector('[data-chart-type=bar]');});
 await page.locator('[data-chart-type=pie]').click();
 await expect.poll(()=>page.evaluate(()=>window.echarts.getInstanceByDom(document.querySelector('#studio-chart'))?.getOption().series[0].type)).toBe('pie');
 expect(await page.evaluate(()=>window.__stableChartHost===document.querySelector('#studio-chart')&&window.__stableTypeButton===document.querySelector('[data-chart-type=bar]'))).toBe(true);
 await page.evaluate(()=>{window.__stableChart=window.echarts.getInstanceByDom(document.querySelector('#studio-chart'));});
 await page.locator('[data-chart-type=pie]').click();
 expect(await page.evaluate(()=>window.__stableChart===window.echarts.getInstanceByDom(document.querySelector('#studio-chart')))).toBe(true);
 expect(await page.evaluate(()=>window.__stableChart.getOption().animation)).toBe(false);
 await page.locator('[data-chart-type=bar]').click();
 await page.screenshot({path:path.join(qa,'workspace-visual-options-desktop.png'),fullPage:true});
 await page.evaluate(()=>{window.__disclosureChart=window.echarts.getInstanceByDom(document.querySelector('#studio-chart'));});
 await page.locator('#visual-data-picker summary').click();await expect(page.locator('#visual-datasets [data-choice-search]')).toHaveValue('누적 목록 42');
 await expect(page.locator('#visual-fields')).toBeVisible();
 expect(await page.evaluate(()=>window.__disclosureChart===window.echarts.getInstanceByDom(document.querySelector('#studio-chart')))).toBe(true);
 await page.locator('#visual-data-picker summary').click();await expect(page.locator('#visual-datasets')).toBeHidden();
 await page.locator('#visual-data-picker summary').focus();await page.keyboard.press('Enter');await expect(page.locator('#visual-datasets')).toBeVisible();
 await page.locator('#visual-datasets [data-dataset-choice]').click();await expect(page.locator('#visual-datasets')).toBeHidden();
 expect(await page.evaluate(()=>window.__disclosureChart===window.echarts.getInstanceByDom(document.querySelector('#studio-chart')))).toBe(true);
 await page.locator('#visual-data-picker summary').click();await page.locator('#visual-datasets [data-choice-search]').fill('누적 목록 41');
 await page.locator('#visual-datasets [data-dataset-choice]').click();await expect(page.locator('#visual-selected-name')).toHaveText('누적 목록 41');
 await expect(page.locator('#visual-datasets')).toBeHidden();await expect(page.locator('#visual-fields')).toHaveCount(0);
 await page.locator('#visual-data-picker summary').click();
 await page.locator('#visual-datasets [data-choice-search]').fill('');await expect(page.locator('#visual-datasets [data-dataset-choice]')).toHaveCount(12);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(qa,'workspace-data-first-mobile.png'),fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await page.setViewportSize({width:1440,height:1000});await route(page,'M04001','데이터 카탈로그');
 await expect(page.locator('[data-catalog-table] tbody tr')).toHaveCount(20);await page.locator('[data-catalog-next]').click();await expect(page.locator('[data-catalog-page]')).toHaveText('2 / 3');
 await page.locator('[data-catalog-search]').fill('누적 목록 42');await expect(page.locator('[data-catalog-table] tbody tr')).toHaveCount(1);
 await expect(page.locator('[data-catalog-table]')).toContainText('직접 입력');
 expect(records).toHaveLength(45);
});
test('[Workspace lists] wheel scrolling continues into the page at list boundaries and over short lists',async({page})=>{
 await page.evaluate(async()=>{
  const core=await import('/static/js/core.js');
  for(let index=0;index<24;index++)await core.post('/datasets',{name:'스크롤 검증 '+String(index).padStart(2,'0'),module:'R-BAP',source:'explicit-ui-scroll-fixture',rows:[{region:'서울',value:index}],description:'목록 스크롤과 부모 페이지의 연결을 검증하는 명시적 입력 데이터'});
  await core.refreshData();
 });
 await page.setViewportSize({width:1440,height:420});
 async function hoverVisible(locator){
  const box=await locator.boundingBox();
  const top=Math.max(68,box.y),bottom=Math.min(410,box.y+box.height);
  expect(bottom-top).toBeGreaterThan(5);
  await page.mouse.move(box.x+Math.min(box.width/2,120),(top+bottom)/2);
 }
 async function checkChaining(locator,overflow){
  await locator.scrollIntoViewIfNeeded();
  expect(await locator.evaluate(el=>el.scrollHeight>el.clientHeight+2)).toBe(overflow);
  expect(await locator.evaluate(el=>getComputedStyle(el).overscrollBehaviorY)).toBe('auto');
  if(overflow){
   await locator.evaluate(el=>{el.scrollTop=0;});await hoverVisible(locator);
   const before=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,120);
   await expect.poll(()=>locator.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
   expect(await page.evaluate(()=>scrollY)).toBe(before);
  }
  await locator.evaluate(el=>{el.scrollTop=el.scrollHeight;});
  await page.evaluate(()=>scrollBy(0,-80));await hoverVisible(locator);
  const beforeDown=await page.evaluate(()=>scrollY);
  expect(await page.evaluate(()=>document.scrollingElement.scrollHeight-innerHeight-scrollY)).toBeGreaterThan(10);
  await page.mouse.wheel(0,180);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(beforeDown);
  await locator.scrollIntoViewIfNeeded();await locator.evaluate(el=>{el.scrollTop=0;});
  await page.evaluate(()=>{if(scrollY<80)scrollTo(0,80);});await hoverVisible(locator);
  const beforeUp=await page.evaluate(()=>scrollY);expect(beforeUp).toBeGreaterThan(0);
  await page.mouse.wheel(0,-180);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeLessThan(beforeUp);
 }
 await route(page,'M04001','데이터 카탈로그');
 await checkChaining(page.locator('.dataset-catalog-scroll'),true);
 await page.locator('[data-catalog-search]').fill('스크롤 검증 23');
 await expect(page.locator('[data-catalog-table] tbody tr')).toHaveCount(1);
 await checkChaining(page.locator('.dataset-catalog-scroll'),false);
 await route(page,'M02001','R-BAP 데이터 분석');
 await checkChaining(page.locator('#analysis-methods .choice-scroll'),true);
});

async function persistContractDataset(page,payload,rows=fixtureRows){
 // Only the TARGET endpoint is mocked. Its returned dataset is an explicit,
 // ordinary R/V fixture persisted through the real authenticated SYSTEM API.
 const csrf=await page.evaluate(async()=>{const {state}=await import('/static/js/core.js');return state.csrf;});
 const response=await page.request.post('/api/datasets',{headers:{'X-CSRF-Token':csrf},data:{name:payload.name||'TARGET 계약 검증',rows,module:payload.module==='V-BAP'?'V-BAP':'R-BAP',source:'ui-target-contract',description:'TARGET API를 모의한 프론트 계약 검증 데이터'}});
 expect(response.status()).toBe(201);return (await response.json()).data;
}
async function targetContract(page,{existing=false,system=false}={}){
 const calls=[],objects=[{name:'SALES',type:'TABLE',status:'VALID'}];
 let objectFilter={scope:'schema',hide_system:true,exclude_prefixes:[],exclude_types:[]};
 const metadata=[{name:'ID',type:'NUMBER',nullable:'N',primary_key:1},{name:'region',type:'VARCHAR2',nullable:'Y',primary_key:0},{name:'revenue',type:'NUMBER',nullable:'Y',primary_key:0}];
 const rows=[{ID:1,region:'서울',revenue:120},{ID:2,region:'부산',revenue:90}];
 let connections=existing?[{id:'ui-target',name:'UI 계약 TARGET',username:system?'UI_SYSTEM':'UI_TARGET',dsn:system?'TEST_HIGH':'db.invalid:1521/test',wallet_profile:system,allow_dml:true,mode:system?'system':'direct',has_password:true}]:[];
 await page.route('**/api/connections**',async r=>{
  const req=r.request(),p=new URL(req.url()).pathname,method=req.method(),body=req.postDataJSON();calls.push({p,method,body});let data;
  if(p==='/api/connections/options')data={tns_aliases:['TEST_HIGH','TEST_LOW'],profile_configured:true,wallet_available:true,driver_mode:'thin'};
  else if(p.endsWith('/object-filter')){if(method==='PUT')objectFilter=body;data={filter:objectFilter,restricted_system:system,can_schema:true};}
  else if(method==='GET')data=p==='/api/connections'?connections:connections.find(c=>p.endsWith('/'+c.id));
  else if(p.endsWith('/test'))data={connected:true,schema:'UI_TARGET',version:'23'};
  else if(method==='POST'){const {password,...safe}=body;data={...safe,id:'ui-target',has_password:true,mode:'direct'};connections=[data];}
  else if(method==='PUT'){const {password,...safe}=body;data={...connections[0],...safe};connections=[data];}
  else{connections=[];data={deleted:true};}
  await r.fulfill({json:{status:'success',data}});
 });
 await page.route('**/api/dbms/**',async r=>{
  const req=r.request(),u=new URL(req.url()),p=u.pathname,method=req.method(),body=req.postDataJSON();calls.push({p,method,body});let data;
  if(p.endsWith('/objects')){const visible=objects.filter(o=>!objectFilter.exclude_types.includes(o.type)&&!objectFilter.exclude_prefixes.some(prefix=>o.name.toUpperCase().startsWith(prefix.toUpperCase()))&&!(objectFilter.hide_system&&o.system_object));data=u.searchParams.get('details')==='true'?{objects:visible,filter:objectFilter,restricted_system:system,owned_table_count:1,excluded_count:objects.length-visible.length,truncated:false,limit:1000}:visible;}
  else if(p.endsWith('/columns')&&method==='GET')data=metadata;
  else if(p.endsWith('/columns'))data={table:body.table,altered:true};
  else if(p.endsWith('/ddl'))data={ddl:'-- '+u.searchParams.get('type')+' '+u.searchParams.get('name')+'\nCREATE TABLE SALES (ID NUMBER PRIMARY KEY, region VARCHAR2(100), revenue NUMBER)'};
  else if(p.endsWith('/query'))data={rows,columns:metadata,row_count:rows.length,truncated:false,elapsed_ms:12};
  else if(p.endsWith('/grid')||p.endsWith('/dml'))data={affected_rows:1,committed:!!body.commit};
  else if(p.endsWith('/tables')){objects.push({name:body.name,type:'TABLE',status:'VALID'});data={table:body.name,created:true};}
  else if(p.endsWith('/datasets'))data=await persistContractDataset(page,body,rows);
  else if(p.endsWith('/import'))data=await persistContractDataset(page,body,body.rows);
  else if(p.endsWith('/sample'))data=await persistContractDataset(page,{...body,name:'명시적 TARGET 샘플 계약'},rows);
  else throw new Error('Unexpected TARGET contract endpoint '+p);
  await r.fulfill({status:method==='POST'&&['/datasets','/import','/sample'].some(x=>p.endsWith(x))?201:200,json:{status:'success',data}});
 });
 return {calls,objects};
}

test('membership login roundtrip, role menus and explicit session extension',async({page,context})=>{
 await expect(page.locator('#navigation [data-page=M90001]')).toHaveCount(0);
 const cookie=(await context.cookies()).find(c=>c.name==='inbaps_session');expect(cookie.httpOnly).toBeTruthy();expect(cookie.sameSite).toBe('Lax');
 const extension=page.waitForResponse(r=>r.url().endsWith('/api/auth/activity'));await page.locator('#extend-session').click();expect((await extension).status()).toBe(200);
 await expect(page.locator('#session-remaining')).toHaveText(/\d+:\d{2}/);
 await route(page,'M04001','데이터 카탈로그');
 await page.locator('#user-profile').click();await expect(page.locator('#login-form')).toBeVisible();
 await expect(page).toHaveURL(/#M04001$/);
 // A saved/deep menu URL on the login screen must not decide the new session's landing page.
 await page.evaluate(()=>{location.hash='M02001';});await expect(page).toHaveURL(/#M02001$/);
 fs.mkdirSync(qa,{recursive:true});await page.screenshot({path:path.join(qa,'membership-login.png'),fullPage:true});
 const account=accounts.get(page);await page.locator('[name=username]').fill(account.username);await page.locator('[name=password]').fill(account.password);
 const entryPages=[];page.on('request',request=>{if(request.url().includes('/static/pages/'))entryPages.push(new URL(request.url()).pathname);});
 let releaseEntry,entryStarted;const entryGate=new Promise(r=>releaseEntry=r),entryPending=new Promise(r=>entryStarted=r);
 await page.route('**/api/datasets',async r=>{entryStarted();await entryGate;await r.continue();});
 const login=page.waitForResponse(r=>r.url().endsWith('/api/auth/login'));await page.locator('#login-form button[type=submit]').click();expect((await login).status()).toBe(200);
 await entryPending;await expect(page.locator('#page-loading')).toBeVisible();await expect(page.locator('#login-form')).toHaveCount(0);await expect(page.locator('.auth-layout')).toHaveCount(0);
 const blocking=await page.locator('#page-loading').boundingBox();expect(Math.abs(blocking.x+blocking.width/2-720)).toBeLessThan(2);expect(Math.abs(blocking.y+blocking.height/2-500)).toBeLessThan(2);
 const before=page.url(),link=await page.locator('#help-button').boundingBox();await page.mouse.click(link.x+link.width/2,link.y+link.height/2);await expect(page.locator('#modal')).not.toBeVisible();await page.keyboard.press('Escape');await page.keyboard.press('/');await page.keyboard.press('Tab');expect(page.url()).toBe(before);await expect(page.locator('#page-loading')).toBeVisible();expect(await page.evaluate(()=>document.querySelector('#page-loading').contains(document.activeElement))).toBeTruthy();
 releaseEntry();await page.unrouteAll({behavior:'wait'});await expect(page.locator('#page-loading')).not.toBeVisible();
 await expect(page).toHaveURL(/#M00001$/);await expect(page.locator('#overview-page')).toBeVisible();await expect(page.locator('#overview-content')).toContainText('분석할 데이터를 연결하세요');
 expect(entryPages,'Successful login enters the overview once without rendering the previous menu').toEqual(['/static/pages/M00001.html']);
 await page.route('**/api/datasets',r=>r.fulfill({status:503,json:{detail:'검증용 초기 데이터 조회 실패'}}));await page.reload();await expect(page.locator('#retry-entry')).toBeVisible();await expect(page.locator('#page-loading')).not.toBeVisible();await expect(page.locator('#login-form')).toHaveCount(0);await page.unroute('**/api/datasets');await page.locator('#retry-entry').click();await expect(page.locator('#overview-page')).toBeVisible();await expect(page.locator('#page-loading')).not.toBeVisible();
 issues.get(page).console=issues.get(page).console.filter(message=>!(message.includes('503')&&message.includes('/api/datasets')));
 await page.locator('#user-profile').click();await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(qa,'membership-mobile.png'),fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});

async function verifyStartupRequests(page){
 await expect(page.locator('.overview-metrics')).toBeVisible();
 await route(page,'M90002','DB 연결 설정');
 const details=[];page.on('request',request=>{if(/\/api\/datasets\/[^/?]+\?/.test(request.url()))details.push(request.url());});
 let datasetStarted,visualizationStarted,release;
 const datasetsPending=new Promise(resolve=>datasetStarted=resolve);
 const visualizationsPending=new Promise(resolve=>visualizationStarted=resolve);
 const gate=new Promise(resolve=>release=resolve);
 await page.route('**/api/datasets',async route=>{datasetStarted();await gate;await route.continue();});
 await page.route('**/api/visualizations',async route=>{visualizationStarted();await gate;await route.continue();});
 const reload=page.reload();
 try{
  // Neither request can complete until both have started; sequential loading fails.
  await Promise.all([datasetsPending,visualizationsPending]);
 }finally{release();}
 await reload;await expect(page.locator('#connections-page')).toBeVisible();
 await expect(page.locator('#page-loading')).not.toBeVisible();
 expect(details,'Metadata-only entry does not query the selected TARGET').toHaveLength(0);
 await page.unroute('**/api/datasets');await page.unroute('**/api/visualizations');
 await route(page,'M00001','인법스 개요');await expect(page.locator('.overview-metrics')).toBeVisible();
 expect(details,'Overview uses metadata without querying TARGET rows').toHaveLength(0);
 details.length=0;
 await page.reload();await expect(page.locator('.overview-metrics')).toBeVisible();
 await expect(page.locator('#page-loading')).not.toBeVisible();
 expect(details,'Login/session overview uses metadata only').toHaveLength(0);
 await route(page,'M02001','R-BAP 데이터 분석');
 expect(details,'A later analysis screen reads fresh rows once').toHaveLength(1);
}

test('workspace metadata overview, desktop/mobile layout and member menu routes',async({page})=>{
 await explicitDataset(page);await verifyStartupRequests(page);await route(page,'M00001','인법스 개요');
 await expect(page.locator('.overview-metrics .metric')).toHaveCount(4);
 await expect(page.locator('.metric-value').first()).toContainText('1');
 await expect(page.locator('#overview-content')).toContainText(fixtureName);
 await expect(page.locator('#trend-chart,#composition-chart,#heat-chart,#region-filter,#period-filter')).toHaveCount(0);
 await expect(page.locator('#overview-content')).toContainText('업무 KPI는 지표·단위·집계·기간·비교 기준을 정의한 뒤');
 await page.evaluate(()=>document.fonts.ready);fs.mkdirSync(qa,{recursive:true});await page.screenshot({path:path.join(qa,'dashboard-desktop.png'),fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await page.screenshot({path:path.join(qa,'dashboard-mobile.png'),fullPage:true});await page.locator('#mobile-menu').click();await expect(page.locator('#sidebar')).toHaveClass(/open/);
 await page.setViewportSize({width:1440,height:1000});
 for(const [code,heading] of [['M01001','C-BAP 데이터 수집'],['M02001','R-BAP 데이터 분석'],['M03001','V-BAP 시각화'],['M03002','저장한 인사이트'],['M04001','데이터 카탈로그'],['M90002','DB 연결 설정'],['M90003','DBMS · SQL 작업실']])await route(page,code,heading);
 await expect(page.locator('#dbms-page')).toContainText('TARGET DB 연결이 필요합니다');
 await verifySidebar(page);
});

async function verifySidebar(page){
 // Layout-only admin fixture: server authorization and stored membership stay unchanged.
 await page.route('**/api/auth/session',async r=>{const response=await r.fetch(),body=await response.json();body.data.user.role='admin';await r.fulfill({response,json:body});});
 await page.reload();await expect(page.locator('#navigation .nav-link')).toHaveCount(9);
 for(const viewport of [{width:1920,height:1080},{width:1366,height:768},{width:1280,height:720}]){
  await page.setViewportSize(viewport);
  const layout=await page.evaluate(()=>{const area=document.querySelector('.sidebar-scroll'),footer=document.querySelector('.sidebar-bottom').getBoundingClientRect(),links=[...document.querySelectorAll('#navigation .nav-link')];return {scroll:area.scrollHeight>area.clientHeight+1,links:links.every(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=footer.top&&r.height>=44;}),footer:footer.bottom<=innerHeight+1};});
  expect(layout).toEqual({scroll:false,links:true,footer:true});
 }
 fs.mkdirSync(qa,{recursive:true});await page.screenshot({path:path.join(qa,'sidebar-desktop.png'),fullPage:false});
 await page.locator('#mobile-menu').click();await expect(page.locator('body')).toHaveClass(/sidebar-collapsed/);
 expect((await page.locator('#sidebar').boundingBox()).width).toBe(76);
 await expect(page.locator('#navigation [data-page=M90003]')).toHaveAttribute('title','DBMS · SQL 작업실');
 await page.reload();await expect(page.locator('body')).toHaveClass(/sidebar-collapsed/);
 await route(page,'M90003','DBMS · SQL 작업실');await expect(page.locator('#navigation [data-page=M90003]')).toHaveAttribute('aria-current','page');
 await page.locator('#mobile-menu').click();await expect(page.locator('body')).not.toHaveClass(/sidebar-collapsed/);
 await page.setViewportSize({width:390,height:844});await expect(page.locator('#sidebar')).toHaveJSProperty('inert',true);
 await page.locator('#mobile-menu').click();await expect(page.locator('#sidebar')).toHaveAttribute('aria-modal','true');
 await expect(page.locator('.app-shell')).toHaveJSProperty('inert',true);
 await expect(page.locator('#navigation [data-page=M90003]')).toBeFocused();
 await page.locator('#user-profile').focus();await page.keyboard.press('Tab');await expect(page.locator('#sidebar .brand')).toBeFocused();
 await page.keyboard.press('Shift+Tab');await expect(page.locator('#user-profile')).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.locator('#sidebar')).not.toHaveClass(/open/);await expect(page.locator('#mobile-menu')).toBeFocused();
 await page.locator('#mobile-menu').click();await page.locator('#sidebar-backdrop').click({position:{x:380,y:300}});await expect(page.locator('#sidebar')).not.toHaveClass(/open/);
 await page.locator('#mobile-menu').click();await page.locator('#navigation [data-page=M90003]').click();await expect(page.locator('#sidebar')).not.toHaveClass(/open/);await expect(page.locator('#main')).toBeFocused();
 await page.locator('#mobile-menu').click();await page.screenshot({path:path.join(qa,'sidebar-mobile.png'),fullPage:false,animations:'disabled'});
 expect((await page.locator('#sidebar').boundingBox()).x).toBe(0);
 await page.setViewportSize({width:640,height:360});await expect(page.locator('#user-profile')).toBeInViewport();
 await page.locator('#navigation [data-page=M04001]').focus();await page.keyboard.press('Enter');await expect(page.locator('#catalog-page')).toBeVisible();await expect(page.locator('#sidebar')).not.toHaveClass(/open/);
 await expect(page.locator('.app-shell')).toHaveJSProperty('inert',false);
}

test('R-BAP profile, aggregate, correlation and text persist real API results',async({page})=>{
 await explicitDataset(page);await route(page,'M02001','R-BAP 데이터 분석');
 const profile=await runAnalysis(page,'profile');expect(profile.result.row_count).toBe(4);await expect(page.locator('#analysis-result')).toContainText('데이터 완전성');
 const aggregate=await runAnalysis(page,'aggregate');expect(aggregate.result.rows.map(r=>r.value).sort((a,b)=>a-b)).toEqual([30,70]);
 await expect(page.locator('#analysis-chart canvas')).toBeVisible();
 const correlation=await runAnalysis(page,'correlation');expect(correlation.result.matrix.some(v=>v.x==='revenue'&&v.y==='visitors'&&v.value===1)).toBeTruthy();
 const text=await runAnalysis(page,'text');expect(text.result.token_count).toBeGreaterThan(0);await expect(page.locator('#analysis-result')).toContainText('단어 빈도 분석');
 const download=page.waitForEvent('download');await page.locator('#export-analysis').click();expect((await download).suggestedFilename()).toBe('inbaps-analysis.csv');
 await expect(page.locator('#run-batch-analysis')).toHaveCount(0);
});

test('all four analysis outputs become V-BAP datasets with working field mappings',async({page})=>{
 await explicitDataset(page);
 for(const method of ['profile','aggregate','correlation','text']){
  await route(page,'M02001','R-BAP 데이터 분석');await selectDataset(page,fixtureName);const analysis=await runAnalysis(page,method);
  const transfer=page.waitForResponse(r=>r.url().endsWith('/api/datasets')&&r.request().method()==='POST');await page.locator('#to-visualization').click();
  const response=await transfer;expect(response.status()).toBe(201);const data=(await response.json()).data;expect(data.source).toBe('analysis');expect(data.module).toBe('V-BAP');expect(data.description).toContain(analysis.id);
  await expect(page.getByRole('heading',{name:'V-BAP 시각화',exact:true})).toBeVisible();await expect(page.locator('#visual-selected-name')).toHaveText(data.name);await expect(page.locator('#studio-chart canvas').first()).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>window.echarts.getInstanceByDom(document.querySelector('#studio-chart'))?.getOption().series?.[0]?.type)).toBe(method==='correlation'?'heatmap':'bar');
 }
});

test('all 14 IN-SIGHT chart types render; save reopen export and delete',async({page})=>{
 await explicitDataset(page,'V-BAP');await route(page,'M03001','V-BAP 시각화');
 for(const type of ['line','bar','area','pie','scatter','heatmap','radar','treemap','sunburst','sankey','graph','boxplot','funnel','gauge'])await chartType(page,type);
 await chartType(page,'bar');const download=page.waitForEvent('download');await page.locator('#download-chart').click();expect((await download).suggestedFilename()).toBe('IN-SIGHT-bar.png');
 await page.locator('#save-insight').click();await page.locator('#save-form input[name=name]').fill('UI QA insight roundtrip');
 const savedResponse=page.waitForResponse(r=>r.url().endsWith('/api/visualizations')&&r.request().method()==='POST');await page.locator('#save-form button.primary').click();expect((await savedResponse).status()).toBe(201);await expect(page.locator('#modal')).not.toBeVisible();
 await route(page,'M03002','저장한 인사이트');const card=page.locator('.saved-card').filter({hasText:'UI QA insight roundtrip'});await expect(card.locator('canvas')).toHaveCount(0);await card.locator('[data-preview]').click();await expect(card.locator('canvas')).toBeVisible();
 await card.locator('[data-open]').click();await expect(page.locator('#chart-title')).toContainText('막대 차트');await expect(page.locator('#visual-x')).toHaveValue('region');
 await route(page,'M03002','저장한 인사이트');await card.locator('[data-delete]').click();await page.locator('#confirm-delete').click();await expect(card).toHaveCount(0);
});

test('[TARGET API contract] C-BAP JSON and file inputs send the selected target',async({page})=>{
 const mock=await targetContract(page,{existing:true});
 await page.route('**/api/datasets/import',async r=>{
  const raw=r.request().postData();expect(raw).toContain('name="connection_id"');expect(raw).toContain('ui-target');expect(raw).toContain('C-BAP');
  const data=await persistContractDataset(page,{name:'UI C CSV contract',module:'R-BAP'},[{region:'서울',revenue:11},{region:'부산',revenue:22}]);
  await r.fulfill({status:201,json:{status:'success',data}});
 });
 await route(page,'M01001','C-BAP 데이터 수집');await page.locator('#collection-json').click();await page.locator('#json-form input[name=name]').fill('UI C JSON contract');await page.locator('#json-form textarea').fill(JSON.stringify(fixtureRows));
 await page.locator('#json-form button.primary').click();await expect(page.locator('#modal')).not.toBeVisible();await expect(page.locator('#collection-page')).toContainText('UI C JSON contract');
 expect(mock.calls.find(c=>c.p==='/api/dbms/import').body).toMatchObject({connection_id:'ui-target',module:'C-BAP',rows:fixtureRows});
 await page.locator('#collection-import').click();await page.locator('#import-form input[name=name]').fill('UI C CSV contract');await page.locator('#import-file').setInputFiles({name:'fixture.csv',mimeType:'text/csv',buffer:Buffer.from('region,revenue\n서울,11\n부산,22\n')});
 await expect(page.locator('#import-preview-state')).toContainText('파일 확인 완료');await page.locator('#import-confirm').check();await page.locator('#import-form button[type=submit]').click();await expect(page.locator('#modal')).not.toBeVisible();await route(page,'M04001','데이터 카탈로그');await page.locator('[data-catalog-search]').fill('UI C');await expect(page.locator('[data-catalog-table] tbody tr')).toHaveCount(2);
 await page.getByRole('button',{name:'UI C CSV contract',exact:true}).click();await expect(page.locator('#modal')).toContainText('서울');await expect(page.locator('#modal')).toContainText('11');
 await verifyUploadProgress(page);
});

test('[TARGET API contract] connection settings object SQL DML grid and controlled DDL',async({page})=>{
 const mock=await targetContract(page);await route(page,'M90002','DB 연결 설정');await page.locator('#new-connection').click();
 for(const [name,value] of Object.entries({name:'UI 계약 TARGET',username:'UI_TARGET',password:'Only-A-Contract-Fixture',dsn:'db.invalid:1521/test'}))await page.locator('#connection-form [name='+name+']').fill(value);
 await page.locator('#connection-form [name=allow_dml]').check();await page.locator('#connection-form .primary').click();await expect(page.locator('.connection-card')).toContainText('UI 계약 TARGET');await page.locator('[data-test]').click();await expect(page.locator('.connection-status')).toContainText('연결 성공');
 await page.locator('[data-edit]').click();await expect(page.locator('#connection-form [name=password]')).toHaveValue('');await page.locator('#modal [data-close]').first().click();
 await page.locator('[data-open]').click();await page.locator('[data-object]').click();await expect(page.locator('.db-data-grid')).toContainText('서울');
 await page.locator('[data-row-edit="0"]').click();await page.locator('[data-col-index="2"]').fill('9007199254740993');await page.locator('#grid-row-form button[type=submit]').click();await expect(page.locator('#grid-preview-status')).toContainText('롤백 완료');await page.locator('#grid-commit').click();await expect(page.locator('#modal')).not.toBeVisible();
 expect(mock.calls.find(c=>c.p==='/api/dbms/grid').body.values.revenue).toBe('9007199254740993');
 await page.locator('[data-db-tab=dml]').click();await page.locator('#dml-sql').fill('UPDATE SALES SET revenue = :value WHERE ID = :id');await page.locator('#dml-binds').fill('{"value":135,"id":1}');await page.locator('#preview-dml').click();await expect(page.locator('#dml-state')).toContainText('롤백 완료');await page.locator('#commit-dml').click();await page.locator('#commit-dml-confirm').click();await expect(page.locator('#dml-state')).toContainText('커밋 완료');
 await page.locator('#new-db-table').click();await page.locator('#object-ddl-form [name=table]').fill('SALES_UI_CHECK');await page.locator('#object-ddl-form [name=confirm]').check();await page.locator('#object-ddl-form .primary').click();await expect(page.locator('#modal')).not.toBeVisible();await expect(page.locator('#object-list')).toContainText('SALES_UI_CHECK');
 await page.locator('[data-db-tab=structure]').click();await page.locator('#add-db-column').click();await page.locator('[data-name]').fill('고객 메모');await page.locator('#object-ddl-form [name=confirm]').check();await page.locator('#object-ddl-form .primary').click();await expect(page.locator('#modal')).not.toBeVisible();
 for(const suffix of ['grid','dml'])for(const commit of [false,true])expect(mock.calls.some(c=>c.p==='/api/dbms/'+suffix&&c.body.commit===commit)).toBeTruthy();
 await page.locator('#query-to-visual').click();await page.locator('#query-dataset-form .primary').click();await expect(page.locator('#visualization-page')).toBeVisible();await visualDataset(page);await page.locator('[data-chart-type=bar]').click();await expect(page.locator('#studio-chart canvas')).toBeVisible();
 expect(mock.calls.find(c=>c.p==='/api/dbms/datasets').body).toMatchObject({connection_id:'ui-target',module:'V-BAP',limit:20000});
 await route(page,'M90002','DB 연결 설정');expect(mock.calls.filter(c=>c.p==='/api/dbms/sample')).toHaveLength(0);await page.locator('#create-sample').click();await page.locator('#sample-form .primary').click();await expect(page.locator('#catalog-page')).toBeVisible();expect(mock.calls.filter(c=>c.p==='/api/dbms/sample')).toHaveLength(1);
 await verifyObjectBrowser(page,mock);
});

async function verifyObjectBrowser(page,mock){
 mock.objects.push(...[{name:'FN_SCORE',type:'FUNCTION'},{name:'SP_REFRESH',type:'PROCEDURE'},{name:'PKG_REPORT',type:'PACKAGE'},{name:'IX_SALES',type:'INDEX'},{name:'TMP_OLD',type:'TABLE'},{name:'TMPX_KEEP',type:'TABLE'},{name:'INIT$_TB_BAPS_MEMBER',type:'TABLE',system_object:true,metadata_only:true,access_note:'시스템 보호 · 목록만 표시'}].map(o=>({status:'VALID',...o})));
 await route(page,'M90003','DBMS · SQL 작업실');await expect(page.locator('.object-folder')).toHaveCount(9);
 await page.locator('[data-object-type=FUNCTION] summary').click();await page.locator('.object-item').filter({hasText:'FN_SCORE'}).click();await expect(page.locator('#ddl-source')).toHaveValue(/FUNCTION FN_SCORE/);
 await page.locator('#object-filter-settings').click();const form=page.locator('#object-filter-form');
 await form.locator('[name=exclude_prefixes]').fill('TMP_');await form.locator('[name=exclude_types][value=INDEX]').check();await form.locator('[name=hide_system]').uncheck();await form.locator('button[type=submit]').click();
 await expect(form).not.toBeVisible();await expect(page.locator('.object-item').filter({hasText:'TMP_OLD'})).toHaveCount(0);await expect(page.locator('.object-item').filter({hasText:'TMPX_KEEP'})).toBeVisible();
 await expect(page.locator('[data-object-type=INDEX] summary b')).toHaveText('0');await expect(page.locator('#object-policy')).toContainText('개 제외');
 const requests=mock.calls.length;await page.locator('.object-item').filter({hasText:'INIT$_TB_BAPS_MEMBER'}).click();await expect(page.locator('#ddl-source')).toHaveValue(/목록 설정은 SQL·DDL 접근 권한을 변경하지 않습니다/);expect(mock.calls.length).toBe(requests);
 await page.screenshot({path:path.join(qa,'object-browser-categories.png'),animations:'disabled'});
 await route(page,'M90002','DB 연결 설정');await page.locator('[data-object-filter]').click();await expect(form.locator('[name=exclude_prefixes]')).toHaveValue('TMP_');await expect(form.locator('[name=exclude_types][value=INDEX]')).toBeChecked();
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(qa,'object-browser-filter-mobile.png'),animations:'disabled'});expect(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
 await page.locator('#reset-object-filter').click();await form.locator('button[type=submit]').click();
 expect(mock.calls.filter(c=>c.p.endsWith('/object-filter')&&c.method==='PUT').at(-1).body).toEqual({scope:'schema',hide_system:true,exclude_prefixes:[],exclude_types:[]});
}

test('[TARGET API contract] connection details, unsaved TNS test and password-preserving edits',async({page})=>{
 const mock=await targetContract(page,{existing:true});await route(page,'M90002','DB 연결 설정');
 await page.locator('[data-detail]').click();const form=page.locator('#connection-form');
 await expect(form.locator('[name=username]')).toHaveValue('UI_TARGET');
 await expect(form.locator('[name=dsn]')).toHaveValue('db.invalid:1521/test');
 await expect(form.locator('[name=dsn]')).toHaveAttribute('readonly');
 await expect(form.locator('[name=password]')).toHaveCount(0);
 await page.locator('#edit-connection-detail').click();await expect(form.locator('[name=password]')).toHaveValue('');
 await page.locator('#test-connection-form').click();await expect(page.locator('#connection-test-status')).toContainText('아직 저장하지 않았습니다');
 expect(mock.calls.find(c=>c.p==='/api/connections/test').body).toMatchObject({connection_id:'ui-target',password:''});
 await page.keyboard.press('Escape');await page.locator('#modal [data-close]').first().click();
 await page.locator('#new-connection').click();
 for(const [name,value] of Object.entries({name:'UI TNS connection',username:'UI_CUSTOMER',password:'Fixture-Only-Password'}))await form.locator('[name='+name+']').fill(value);
 await form.locator('[name=connection_type]').selectOption('tns');await page.locator('#server-tns-select').selectOption('TEST_HIGH');
 await expect(form.locator('[name=dsn]')).toHaveValue('TEST_HIGH');await expect(form.locator('[name=wallet_profile]')).toBeChecked();
 await page.locator('#test-connection-form').click();await expect(page.locator('#connection-test-status')).toContainText('연결 성공');
 expect(mock.calls.filter(c=>c.p==='/api/connections'&&c.method==='POST')).toHaveLength(0);
 await page.keyboard.press('Escape');await form.locator('button[type=submit]').click();
 expect(mock.calls.find(c=>c.p==='/api/connections'&&c.method==='POST').body).toMatchObject({connection_type:'tns',dsn:'TEST_HIGH',wallet_profile:true});
 await page.locator('[data-detail]').click();await expect(form.locator('[name=connection_type]')).toHaveValue('tns');await expect(form.locator('[name=dsn]')).toHaveValue('TEST_HIGH');
 await expect(form).not.toContainText('Fixture-Only-Password');
 fs.mkdirSync(qa,{recursive:true});await page.screenshot({path:path.join(qa,'connection-details.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});expect(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
 await page.screenshot({path:path.join(qa,'connection-details-mobile.png'),fullPage:true});
});

test('[TARGET API contract] shared server connection has readonly effective details and a test action',async({page})=>{
 const mock=await targetContract(page,{existing:true,system:true});await route(page,'M90002','DB 연결 설정');
 await page.locator('[data-detail]').click();const form=page.locator('#connection-form');
 await expect(form.locator('[name=username]')).toHaveValue('UI_SYSTEM');await expect(form.locator('[name=dsn]')).toHaveValue('TEST_HIGH');
 await expect(form.locator('[name=wallet_profile]')).toBeChecked();await expect(form.locator('[name=wallet_profile]')).toBeDisabled();
 await expect(page.locator('#edit-connection-detail')).toHaveCount(0);await expect(form.locator('button[type=submit]')).toHaveCount(0);
 await page.locator('#test-connection-form').click();await expect(page.locator('#connection-test-status')).toContainText('연결 성공');
 expect(mock.calls.some(c=>c.p==='/api/connections/ui-target/test')).toBeTruthy();
 await verifyFeedback(page);
});

async function verifyFeedback(page){
 await page.keyboard.press('Escape');
 let finishFirst,finishSecond;
 const first=new Promise(resolve=>finishFirst=resolve),second=new Promise(resolve=>finishSecond=resolve);
 await page.route('**/api/datasets?feedback=*',async r=>{
  if(r.request().url().endsWith('first')){await first;await r.fulfill({json:{status:'success',data:[]}});}
  else{await second;await r.fulfill({status:400,json:{detail:'검증용 조회 오류입니다.'}});}
 });
 await page.evaluate(async()=>{const core=await import('/static/js/core.js');window.__feedbackDone=Promise.allSettled([core.api('/datasets?feedback=first',{feedback:'첫 번째 조회 중'}),core.api('/datasets?feedback=second',{feedback:'두 번째 조회 중'})]);});
 const progress=page.locator('.work-progress');await expect(progress).toBeVisible();await expect(progress.locator('.work-item')).toHaveCount(2);
 await expect(progress.locator('[role=progressbar]').first()).not.toHaveAttribute('aria-valuenow');
 await expect(page.locator('#modal #toast-region')).toHaveCount(1);
 await progress.locator('.layer-handle').focus();const before=await progress.boundingBox();await page.keyboard.press('ArrowLeft');
 expect((await progress.boundingBox()).x).toBeLessThan(before.x);expect((await progress.boundingBox()).width).toBeLessThanOrEqual(430);
 await page.screenshot({path:path.join(qa,'progress-concurrent.png'),animations:'disabled'});
 finishFirst();await expect(progress.locator('.work-item')).toHaveCount(1);await expect(progress).toContainText('두 번째 조회 중');
 finishSecond();await page.evaluate(()=>window.__feedbackDone);await expect(progress).toHaveCount(0);
 await expect(page.locator('.message-layer.error')).toHaveCount(1);await expect(page.locator('.message-layer.error')).toContainText('검증용 조회 오류입니다.');
 await expect(page.locator('#connection-form [name=username]')).toHaveValue('UI_SYSTEM');await expect(page.locator('#modal')).toBeVisible();
 issues.get(page).console=issues.get(page).console.filter(m=>!(m.includes('/api/datasets?feedback=second')&&m.includes('400')));
 await page.keyboard.press('Escape');await expect(page.locator('.message-layer')).toHaveCount(0);await page.locator('#modal [data-close]').first().click();
 // The export path reports real processed row counts and yields between batches.
 await page.evaluate(async()=>{
  window.__csvPercents=[];window.__csvObserver=new MutationObserver(()=>document.querySelectorAll('.work-meter[aria-valuenow]').forEach(el=>window.__csvPercents.push(Number(el.getAttribute('aria-valuenow')))));
  window.__csvObserver.observe(document.querySelector('#progress-region'),{subtree:true,attributes:true,childList:true});
  const core=await import('/static/js/core.js');window.__csvDone=core.exportCSV(Array.from({length:5000},(_,id)=>({id,value:'CSV progress fixture'})),'progress-fixture.csv');
 });
 await expect(progress).toContainText('CSV 파일 만들기');await page.evaluate(()=>window.__csvDone);await expect(progress).toHaveCount(0);
 expect(await page.evaluate(()=>{window.__csvObserver.disconnect();return window.__csvPercents.some(n=>n>0&&n<100);})).toBeTruthy();
}

async function verifyUploadProgress(page){
 // Deterministic browser transport fixture: real byte events are supplied by XHR
 // in production; this controls the transfer/DB phase boundary without DB writes.
 await page.evaluate(async()=>{
  const original=window.XMLHttpRequest;window.__uploadOriginal=original;
  window.XMLHttpRequest=class{
   constructor(){this.upload={};this.headers={};window.__upload=this;}
   open(method,url){this.method=method;this.url=url;}
   setRequestHeader(k,v){this.headers[k]=v;}
   getResponseHeader(){return null;}
   send(){this.upload.onprogress({lengthComputable:true,loaded:524288,total:1048576});}
   abort(){this.onabort();}
  };
  const core=await import('/static/js/core.js'),form=new FormData();form.append('file',new Blob(['fixture']),'fixture.csv');
  window.__uploadDone=core.api('/datasets/import',{method:'POST',body:form}).finally(()=>window.XMLHttpRequest=original);
 });
 const progress=page.locator('.work-progress');await expect(progress.locator('[role=progressbar]')).toHaveAttribute('aria-valuenow','50');
 await expect(progress).toContainText('50%');expect(await page.evaluate(()=>Boolean(window.__upload.headers['x-csrf-token']))).toBeTruthy();
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(qa,'progress-upload-mobile.png'),animations:'disabled'});
 const box=await progress.boundingBox();expect(box.x>=0&&box.x+box.width<=390&&box.y>=0&&box.y+box.height<=844).toBeTruthy();
 await page.evaluate(()=>window.__upload.upload.onload());await expect(progress).toContainText('파일 전송 완료');await expect(progress.locator('[role=progressbar]')).not.toHaveAttribute('aria-valuenow');
 await expect(progress.locator('.work-percent')).toBeEmpty();
 await page.evaluate(()=>{const xhr=window.__upload;xhr.status=201;xhr.responseText=JSON.stringify({data:{fixture:true}});xhr.onload();return window.__uploadDone;});
 await expect(progress).toHaveCount(0);await expect(page.locator('#modal')).toBeVisible();
}

test('readable DDL form, validation layers, pointer and keyboard movement survive resize',async({page})=>{
 const mock=await targetContract(page,{existing:true});await page.setViewportSize({width:1920,height:1080});
 await route(page,'M90003','DBMS · SQL 작업실');await page.locator('#new-db-table').click();
 const dialog=page.locator('#modal'),table=page.locator('#object-ddl-form [name=table]');
 await expect(table).toHaveValue('');await expect(table).not.toHaveAttribute('pattern');await expect(page.locator('[data-name]')).not.toHaveAttribute('pattern');await expect(table).toHaveAttribute('placeholder',/^예:/);
 expect((await dialog.boundingBox()).width).toBeGreaterThanOrEqual(840);
 const styles=await table.evaluate(el=>({input:getComputedStyle(el).color,placeholder:getComputedStyle(el,'::placeholder').color,size:parseFloat(getComputedStyle(el).fontSize),height:el.getBoundingClientRect().height}));
 expect(styles.input).not.toBe(styles.placeholder);expect(styles.size).toBeGreaterThanOrEqual(15);expect(styles.height).toBeGreaterThanOrEqual(44);
 await page.locator('#object-ddl-form .primary').click();
 const notice=page.locator('.message-layer.error');await expect(notice).toContainText('필수 항목');
 await expect(table).toBeFocused();await expect(table).toHaveAttribute('aria-invalid','true');
 expect(mock.calls.filter(c=>c.p==='/api/dbms/tables')).toHaveLength(0);
 const before=await notice.boundingBox(),handle=notice.locator('.layer-handle');const point=await handle.boundingBox();
 await page.mouse.move(point.x+40,point.y+15);await page.mouse.down();await page.mouse.move(point.x-180,point.y-110,{steps:8});await page.mouse.up();
 expect((await notice.boundingBox()).x).toBeLessThan(before.x-150);
 await page.keyboard.press('Escape');await expect(notice).toHaveCount(0);await expect(dialog).toBeVisible();
 await table.fill('sales_detail');await expect(table).not.toHaveAttribute('aria-invalid','true');
 const title=dialog.locator('.modal-head .layer-handle');await title.focus();const original=await dialog.boundingBox();
 await title.press('ArrowLeft');expect((await dialog.boundingBox()).x).toBeCloseTo(original.x-24,0);
 await page.locator('#ddl-add-column').click();await page.locator('[data-name]').nth(1).fill('customer_name');
 await page.locator('#ddl-add-column').click();await page.locator('[data-name]').nth(2).fill('DESCRIPTION');await table.clear();
 fs.mkdirSync(qa,{recursive:true});await page.screenshot({path:path.join(qa,'readability-ddl-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await expect.poll(async()=>{const b=await dialog.boundingBox();return b.x>=0&&b.x+b.width<=391&&b.y>=0&&b.y+b.height<=845;}).toBeTruthy();
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBeTruthy();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
 await page.screenshot({path:path.join(qa,'readability-ddl-mobile.png'),fullPage:true});
 await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
});

test('login errors use persistent layers and invalid fields keep keyboard focus',async({page})=>{
 await page.locator('#user-profile').click();await expect(page.locator('#login-form')).toBeVisible();
 await page.locator('#login-form button[type=submit]').click();
 await expect(page.locator('.message-layer.error')).toContainText('아이디');
 await expect(page.locator('[name=username]')).toBeFocused();
 await page.locator('.message-layer .message-actions button').click();
 await page.locator('#auth-switch').click();
 for(const [name,value] of Object.entries({display_name:'UI 검증',username:'mismatch_test',password:'Only-UI-Fixture-Password',confirm:'Different-UI-Fixture-Password'}))await page.locator('#login-form [name='+name+']').fill(value);
 await page.locator('#login-form button[type=submit]').click();
 await expect(page.locator('.message-layer.error')).toContainText('비밀번호 확인이 일치하지 않습니다.');
 await page.waitForTimeout(7200);await expect(page.locator('.message-layer.error')).toBeVisible();
 await page.keyboard.press('Escape');await expect(page.locator('.message-layer')).toHaveCount(0);
});

test('[R-only] explicit independent data and analysis without C-BAP or V-BAP',async({page})=>{
 await expect(page.locator('#navigation [data-page=M01001]')).toHaveCount(0);await expect(page.locator('#navigation [data-page=M03001]')).toHaveCount(0);
 await explicitDataset(page,'R-BAP','UI R independent');await route(page,'M02001','R-BAP 데이터 분석');await expect(page.locator('[data-dataset-choice][aria-pressed=true]')).toContainText('UI R independent');
 expect((await runAnalysis(page,'profile')).result.row_count).toBe(4);expect((await runAnalysis(page,'aggregate')).result.rows.map(r=>r.value).sort((a,b)=>a-b)).toEqual([30,70]);
 await page.locator('#analysis-import').click();await expect(page.locator('#modal')).toContainText('TARGET 연결 불필요');await expect(page.locator('[name=storage_mode][value=direct]')).toBeChecked();await expect(page.locator('#import-file')).toBeVisible();
});

test('[V-only] explicit independent data and saved chart without C-BAP or R-BAP',async({page})=>{
 await expect(page.locator('#navigation [data-page=M01001]')).toHaveCount(0);await expect(page.locator('#navigation [data-page=M02001]')).toHaveCount(0);
 await explicitDataset(page,'V-BAP','UI V independent');await route(page,'M03001','V-BAP 시각화');await chartType(page,'bar');
 const values=await page.evaluate(()=>window.echarts.getInstanceByDom(document.querySelector('#studio-chart')).getOption().series[0].data);expect([...values].sort((a,b)=>a-b)).toEqual([30,70]);
 await page.locator('#save-insight').click();await page.locator('#save-form input[name=name]').fill('UI V independent chart');await page.locator('#save-form .primary').click();await expect(page.locator('#modal')).not.toBeVisible();
 await route(page,'M03002','저장한 인사이트');const card=page.locator('.saved-card').filter({hasText:'UI V independent chart'});await card.locator('[data-preview]').click();await expect(card.locator('canvas')).toBeVisible();
});
