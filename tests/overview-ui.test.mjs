import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {chromium,expect} from '@playwright/test';

test('overview shows metadata and real work without arbitrary KPI charts or row reads', {timeout:60000},async()=>{
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),port=8041;
 const server=spawn(path.join(root,'venv/Scripts/python.exe'),['-m','uvicorn','main:app','--host','127.0.0.1','--port',String(port),'--no-proxy-headers','--log-level','warning'],{cwd:root,windowsHide:true,stdio:'ignore',env:{...process.env,BAPS_STORAGE:'sqlite',BAPS_ENV:'development',BAPS_DATA_DIR:path.join(root,'.runtime',`overview-ui-${Date.now()}`),BAPS_ADMIN_PASSWORD:'',BAPS_COOKIE_SECURE:'false',BAPS_MODULES:'C-BAP,R-BAP,V-BAP',BAPS_ALLOWED_HOSTS:'127.0.0.1,localhost'}});
 let browser;
 try{
  for(let attempt=0;attempt<60;attempt++){
   if(server.exitCode!==null)throw new Error('Isolated overview UI server exited before readiness');
   if(await fetch(`http://127.0.0.1:${port}/api/health`).then(response=>response.ok).catch(()=>false))break;
   await new Promise(resolve=>setTimeout(resolve,250));
  }
  browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000},locale:'ko-KR'});
  const errors=[],rowReads=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/\/api\/datasets\/[^/?]+\?/.test(request.url()))rowReads.push(request.url());});
  await page.goto(`http://127.0.0.1:${port}/`);await page.locator('#auth-switch').click();
  await page.locator('[name=display_name]').fill('Overview UI verification');await page.locator('[name=username]').fill('overview.ui.'+Date.now());await page.locator('[name=password]').fill('Overview-Isolated-2026!');await page.locator('[name=confirm]').fill('Overview-Isolated-2026!');await page.locator('#login-form button[type=submit]').click();
  await expect(page.locator('#overview-content')).toContainText('분석할 데이터를 연결하세요');
  await page.route('**/api/collection/runs',route=>route.fulfill({json:{status:'success',data:[{id:'explicit-warning-fixture',source_id:'fixture',status:'FAILED',started_at:1793360000,finished_at:1793360001,result:{message:'Explicit offline UI collection contract'}}]}}));
  await page.evaluate(async()=>{const core=await import('/static/js/core.js');const dataset=await core.post('/datasets',{name:'식별자 데이터 · 합계 지표 아님',source:'explicit-overview-ui-fixture',module:'R-BAP',rows:[{code:10001,value:2},{code:10002,value:3}]});core.state.selected=dataset.id;await core.post('/analysis',{dataset_id:dataset.id,method:'profile'});await core.refreshData({loadRows:false});await(await import('/static/js/M00001.js')).render();});
  await expect(page.locator('#overview-content')).toContainText('최근 등록·변경 데이터');
  await expect(page.locator('#overview-content')).toContainText('실행 당시 결과');
  await expect(page.locator('#overview-content')).toContainText('최근 수집 이력 100개 범위');
  await expect(page.locator('#overview-page .metric-value')).toHaveText(['1개','0개','1건','0개']);
  await expect(page.locator('#trend-chart,#composition-chart,#heat-chart,#region-filter,#period-filter,#dataset-select')).toHaveCount(0);
  assert.deepEqual(rowReads,[],'Metadata overview must not fetch selected dataset rows');
  await mkdir(path.join(root,'.runtime/qa'),{recursive:true});await page.screenshot({path:path.join(root,'.runtime/qa/overview-reviewed-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(root,'.runtime/qa/overview-reviewed-mobile.png'),fullPage:true,animations:'disabled'});
  assert.deepEqual(errors,[]);
 }finally{
  await browser?.close();
  if(server.pid&&server.exitCode===null){if(process.platform==='win32')execFileSync('taskkill',['/PID',String(server.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});else server.kill('SIGTERM');}
 }
});
