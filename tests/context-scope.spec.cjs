const {test,expect}=require('@playwright/test');
const {randomUUID}=require('node:crypto');
const pageErrors=new WeakMap();

// Real isolated member/session/SYSTEM records. TARGET query endpoints below are
// explicit frontend contracts; these checks do not claim real Oracle execution.
test.beforeEach(async({page})=>{
 const errors=[];pageErrors.set(page,errors);page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.locator('#auth-switch').click();
 await page.locator('[name=display_name]').fill('맥락·범위 UI 검증');
 await page.locator('[name=username]').fill('context.'+randomUUID().replaceAll('-',''));
 await page.locator('[name=password]').fill('Explicit-Context-UI-2026!');await page.locator('[name=confirm]').fill('Explicit-Context-UI-2026!');
 await page.locator('#login-form button[type=submit]').click();await expect(page.locator('#overview-page')).toBeVisible();await expect(page.locator('#page-loading')).not.toBeVisible();
});
test.afterEach(async({page})=>expect(pageErrors.get(page)).toEqual([]));

async function register(page,name){return page.evaluate(async name=>{const core=await import('/static/js/core.js'),rows=[{region:'서울',value:10},{region:'부산',value:20}];const item=await core.post('/datasets',{name,module:'V-BAP',source:'explicit-context-ui-fixture',rows});await core.refreshData({loadRows:false});return {...item,rows};},name);}

test('catalog action enters V-BAP with the chosen data once, while a normal visit still starts at its list',async({page})=>{
 const item=await register(page,'카탈로그 맥락 검증');let reads=0;
 page.on('request',request=>{if(new URL(request.url()).pathname==='/api/datasets/'+item.id&&request.method()==='GET')reads++;});
 await page.locator('#navigation [data-page=M04001]').click();await page.locator(`[data-visualize="${item.id}"]`).click();
 await expect(page.locator('#visual-selected-name')).toHaveText(item.name);await expect(page.locator('[data-chart-type]')).toHaveCount(14);
 await expect(page.locator('#visual-data-picker')).not.toHaveAttribute('open','');await expect(page.locator('#visual-fields')).toHaveCount(0);expect(reads).toBe(1);
 await page.locator('[data-chart-type=bar]').click();await expect(page.locator('#studio-chart canvas')).toBeVisible();
 await page.locator('#navigation [data-page=M04001]').click();await page.locator('#navigation [data-page=M03001]').click();
 await expect(page.locator('#visual-datasets')).toBeVisible();await expect(page.locator('[data-chart-type]')).toHaveCount(0);expect(reads).toBe(1);
});

test('catalog export states its bounded range and SQL handoff retains conditions without a second dataset selection',async({page})=>{
 const item=await register(page,'조회 범위 검증');let datasetReads=0,registeredQuery=null;
 await page.route(`**/api/datasets/${item.id}?*`,async route=>{
  datasetReads++;const url=new URL(route.request().url());
  await route.fulfill({json:{status:'success',data:{...item,source:'target-sql',collection_type:'api',target:{limit:20000},queried_at:'2026-10-30T01:02:03Z',truncated:true,row_count:20000,limit:Number(url.searchParams.get('limit')),offset:0,rows:item.rows}}});
 });
 await page.locator('#navigation [data-page=M04001]').click();await page.locator(`[data-preview="${item.id}"]`).click();
 await expect(page.locator('#modal')).toContainText('전체 건수 미확정');await expect(page.locator('#modal')).toContainText('미리보기 2행');
 await expect(page.locator('#preview-export')).toHaveText('CSV 내보내기 · 최대 20,000행');
 const downloading=page.waitForEvent('download');await page.locator('#preview-export').click();await downloading;
 await expect(page.locator('#preview-export-scope')).toContainText('내보내기 2행');expect(datasetReads).toBe(2);
 await page.locator('#modal [data-close]').last().click();
 await page.route('**/api/connections',route=>route.fulfill({json:{status:'success',data:[{id:'ui-target',name:'명시적 UI TARGET 계약',allow_dml:false}]}}));
 await page.route('**/api/dbms/objects?*',route=>route.fulfill({json:{status:'success',data:[]}}));
 await page.route('**/api/dbms/query',route=>route.fulfill({json:{status:'success',data:{columns:item.columns,rows:item.rows,row_count:2,elapsed_ms:2,truncated:true}}}));
 await page.route('**/api/dbms/datasets',async route=>{
  registeredQuery=route.request().postDataJSON();
  await route.fulfill({status:201,json:{status:'success',data:item}});
 });
 await page.locator('#navigation [data-page=M90003]').click();await page.locator('#query-sql').fill('SELECT REGION, VALUE FROM SALES WHERE REGION = :region');
 await page.locator('.bind-details>summary').click();await page.locator('#query-binds').fill('{"region":"서울"}');
 await page.locator('#run-query').click();await expect(page.locator('#query-csv')).toHaveText('현재 페이지 CSV');await expect(page.locator('#result-note')).toContainText('전체 건수 미확정');
 await page.locator('#query-to-visual').click();await page.locator('#query-dataset-form button.primary').click();
 await expect(page.locator('#visual-selected-name')).toHaveText(item.name);await expect(page.locator('[data-chart-type]')).toHaveCount(14);await expect(page.locator('#visual-datasets')).toBeHidden();
 expect(registeredQuery.sql).toBe('SELECT REGION, VALUE FROM SALES WHERE REGION = :region');expect(registeredQuery.binds).toEqual({region:'서울'});expect(registeredQuery.limit).toBe(20000);expect(datasetReads).toBe(3);
});
