const {defineConfig}=require('@playwright/test');
const path=require('node:path');

const root=__dirname;
const runId=process.env.BAPS_UI_RUN_ID||`${Date.now()}-${process.pid}`;
const python=path.join(root,'venv','Scripts','python.exe');
const modes=[
 {name:'all-modules',port:8011,modules:'C-BAP,R-BAP,V-BAP',testMatch:'ui.spec.cjs',grepInvert:/\[(?:R|V)-only\]|advanced statistical parameters|\[Workspace lists\]/},
 {name:'r-only',port:8012,modules:'R-BAP',testMatch:'ui.spec.cjs',grep:/\[R-only\]/},
 {name:'v-only',port:8013,modules:'V-BAP',testMatch:'ui.spec.cjs',grep:/\[V-only\]/},
 // Each independent suite has its own server/IP rate-limit state. Creating all
 // fixture accounts against one process would exceed the real signup limit.
 {name:'collection',port:8014,modules:'C-BAP,R-BAP,V-BAP',testMatch:'collection-ui.spec.cjs'},
 {name:'advanced',port:8015,modules:'C-BAP,R-BAP,V-BAP',testMatch:'ui.spec.cjs',grep:/advanced statistical parameters|\[Workspace lists\]/},
 {name:'review',port:8016,modules:'C-BAP,R-BAP,V-BAP',testMatch:'review-ui.spec.cjs'},
 {name:'context',port:8026,modules:'C-BAP,R-BAP,V-BAP',testMatch:'context-scope.spec.cjs'},
];

module.exports=defineConfig({
 testDir:'./tests',testMatch:['ui.spec.cjs','collection-ui.spec.cjs','review-ui.spec.cjs','context-scope.spec.cjs'],fullyParallel:false,workers:1,
 timeout:60000,expect:{timeout:10000},retries:0,
 outputDir:'.runtime/qa/playwright-results',
 reporter:[['list'],['html',{outputFolder:'.runtime/qa/playwright-report',open:'never'}]],
 use:{browserName:'chromium',headless:true,viewport:{width:1440,height:1000},locale:'ko-KR',timezoneId:'Asia/Seoul',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:modes.map(mode=>({name:mode.name,
  testMatch:mode.testMatch,grep:mode.grep,grepInvert:mode.grepInvert,
  use:{baseURL:`http://127.0.0.1:${mode.port}`}})),
 webServer:modes.map(mode=>({
  command:`"${python}" -m uvicorn main:app --host 127.0.0.1 --port ${mode.port} --no-proxy-headers --log-level warning`,
  cwd:root,url:`http://127.0.0.1:${mode.port}/api/health`,reuseExistingServer:false,timeout:60000,
  env:{...process.env,BAPS_STORAGE:'sqlite',BAPS_ENV:'development',BAPS_DATA_DIR:path.join(root,'.runtime',`ui-test-${runId}`,mode.name),BAPS_ADMIN_PASSWORD:'',BAPS_COOKIE_SECURE:'false',BAPS_MODULES:mode.modules,BAPS_ALLOWED_HOSTS:'127.0.0.1,localhost'},
 })),
});
