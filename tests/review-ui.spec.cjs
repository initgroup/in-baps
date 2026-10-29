const {test,expect}=require('@playwright/test');
const {randomUUID}=require('node:crypto');
const issues=new WeakMap();

test.beforeEach(async({page})=>{
 const errors=[];issues.set(page,errors);page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.locator('#auth-switch').click();
 await page.locator('[name=display_name]').fill('워크플로 검증 회원');
 await page.locator('[name=username]').fill('review.'+randomUUID().replaceAll('-',''));
 await page.locator('[name=password]').fill('Workflow-Isolated-2026!');await page.locator('[name=confirm]').fill('Workflow-Isolated-2026!');
 await page.locator('#login-form button[type=submit]').click();await expect(page.locator('#overview-page')).toBeVisible();
 await expect(page.locator('#overview-content')).toContainText('분석할 데이터를 연결하세요');
});
test.afterEach(async({page})=>{expect(issues.get(page)).toEqual([]);});
async function navigate(page,id){await page.locator(`#navigation [data-page=${id}]`).click();await expect(page).toHaveURL(new RegExp('#'+id+'$'));await expect(page.locator('#page-loading')).not.toBeVisible();}

test('saved insight search and dataset paging load rows only for requested previews',async({page})=>{
 await page.evaluate(async()=>{
  const core=await import('/static/js/core.js');
  const datasets=[];for(const name of ['라이브러리 서울','라이브러리 부산'])datasets.push(await core.post('/datasets',{name,module:'V-BAP',rows:[{region:name,value:1},{region:name,value:2}]}));
  for(let index=0;index<14;index++)await core.post('/visualizations',{name:'의사결정 차트 '+String(index).padStart(2,'0'),dataset_id:datasets[index%2].id,chart_type:'bar',config:{x:'region',y:'value',aggregation:'sum'}});
  await core.refreshData({loadRows:false});
 });
 const reads=[];page.on('request',request=>{if(/\/api\/datasets\/[^/?]+\?/.test(request.url()))reads.push(request.url());});
 await navigate(page,'M03002');await expect(page.locator('.saved-card')).toHaveCount(9);
 expect(reads).toHaveLength(0);await expect(page.locator('#saved-page')).toContainText('저장 당시의 데이터 스냅샷이 아닙니다');
 await page.locator('#insight-next').click();await expect(page.locator('.saved-card')).toHaveCount(5);expect(reads).toHaveLength(0);
 await page.locator('#insight-search').fill('의사결정 차트 13');await expect(page.locator('.saved-card')).toHaveCount(1);
 await page.locator('[data-preview]').click();await expect(page.locator('.saved-card canvas')).toBeVisible();
 expect(reads).toHaveLength(1);expect(reads[0]).toContain('limit=2000');await expect(page.locator('.insight-preview-scope')).toContainText('미리보기 2행');
 await page.locator('#insight-search').fill('');await page.locator('.insight-library-tools details summary').click();
 await page.locator('#insight-dataset-filter [data-choice-search]').fill('라이브러리 서울');await page.locator('#insight-dataset-filter .choice-item').click();
 await expect(page.locator('.saved-card')).toHaveCount(7);expect(reads).toHaveLength(1);
 await page.locator('.saved-card [data-open]').first().click();await expect(page.locator('#studio-chart canvas').first()).toBeVisible();
 expect(reads).toHaveLength(2);await expect(page.locator('#visual-selected-name')).toHaveText('라이브러리 서울');
});

test('R and V files preview before direct SYSTEM save without a TARGET connection',async({page})=>{
 const connections=[];page.on('request',request=>{if(request.url().includes('/api/connections'))connections.push(request.url());});
 for(const [id,module,button] of [['M02001','R-BAP','#analysis-import'],['M03001','V-BAP','#visual-import']]){
  await navigate(page,id);await page.locator(button).click();await expect(page.locator('[name=storage_mode][value=direct]')).toBeChecked();
  await page.locator('#import-form [name=name]').fill(module+' 직접 파일 검증');
  await page.locator('#import-file').setInputFiles({name:'quality.csv',mimeType:'text/csv',buffer:Buffer.from('date,code,value,group\n2026-10-01,001,10,A\n2026-10-02,002,,B\n2026-10-03,003,20,A\n')});
  await expect(page.locator('#import-preview-state')).toContainText('파일 확인 완료');
  await expect(page.locator('#import-preview')).toContainText('3');await expect(page.locator('#import-preview')).toContainText('code');
  await expect(page.locator('#import-preview')).toContainText('001');
  if(module==='R-BAP'){
   await page.setViewportSize({width:390,height:844});
   expect(await page.locator('#modal').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
   await page.screenshot({path:require('node:path').join(__dirname,'../.runtime/qa/file-preview-mobile.png'),fullPage:true,animations:'disabled'});
   await page.setViewportSize({width:1440,height:1000});
  }
  await expect(page.locator('#save-import')).toBeDisabled();
  expect(await page.evaluate(async()=>(await import('/static/js/core.js')).state.datasets.length)).toBe(module==='R-BAP'?0:1);
  await page.locator('#import-confirm').check();await page.locator('#save-import').click();await expect(page.locator('#modal')).not.toBeVisible();
  if(module==='R-BAP'){
   await page.locator('#run-analysis').click();await expect(page.locator('#analysis-result')).toContainText('데이터 완전성');
  }else{
   await expect(page.locator('#visual-selected-name')).toHaveText(module+' 직접 파일 검증');
   await page.locator('[data-chart-type=bar]').click();await expect(page.locator('#studio-chart canvas').first()).toBeVisible();
  }
 }
 expect(connections).toHaveLength(0);
});

test('a file-import module arriving after navigation does not open the previous page dialog',async({page})=>{
 let release,started;const gate=new Promise(resolve=>release=resolve),requested=new Promise(resolve=>started=resolve);
 await page.route('**/static/js/file-import.js*',async route=>{started();await gate;await route.continue();});
 await navigate(page,'M02001');await page.locator('#analysis-import').click();await requested;
 await navigate(page,'M04001');const loaded=page.waitForResponse(response=>new URL(response.url()).pathname==='/static/js/file-import.js');release();await loaded;
 // Allow the module evaluation/import continuation to complete without a timer.
 await page.evaluate(async()=>{await import('/static/js/file-import.js');await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
 await expect(page.locator('#modal')).not.toBeVisible();
 await page.locator('#catalog-import').click();await expect(page.locator('#modal')).toContainText('V-BAP · FILE INPUT');
});
