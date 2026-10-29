import {state,pageHead,icons,importDialog} from './core.js';
import {table,wireTable,jsonDialog} from './M04001.js';
export async function render(){
 document.querySelector('#collection-page').innerHTML=pageHead('','C-BAP 데이터 수집','Collection - Bigdata Analysis Platform',`<a class="button" href="#M90003"><i data-lucide="square-terminal"></i>DBMS · SQL 작업실</a>`)+`
 <p class="collection-note"><i data-lucide="database"></i><span>수집 데이터는 TARGET DB에 저장됩니다. 기존 DB는 SQL 작업실에서 바로 조회·분석·시각화하세요.</span></p>
 <div class="import-cards">
  <article class="import-card"><div class="module-icon"><i data-lucide="file-up"></i></div><div><h2>파일에서 가져오기</h2><p>CSV · JSON 파일 적재<br>한글 CSV: UTF-8 · CP949 지원</p></div><button class="button primary" id="collection-import">파일 선택 <i data-lucide="arrow-up-right"></i></button></article>
  <article class="import-card"><div class="module-icon"><i data-lucide="braces"></i></div><div><h2>JSON으로 직접 연결</h2><p>Open API · 외부 시스템의 JSON 배열을<br>TARGET DB 테이블로 저장합니다.</p></div><button class="button" id="collection-json">JSON 데이터 입력 <i data-lucide="arrow-up-right"></i></button></article>
 </div>
 <div class="section-title"><h2>연결된 데이터셋</h2><span class="muted">${state.datasets.length}개 · 모듈 간 공유</span></div><section class="panel">${table()}</section>
 <div class="insight-strip"><i data-lucide="info"></i><div><strong>수집 커넥터 안내</strong><p>현재 파일 업로드와 JSON 입력을 지원합니다. 인증형 Open API 자동 수집·SNS·웹 크롤링은 별도 커넥터 구현이 필요합니다.</p></div></div>`;
 document.querySelector('#collection-import').onclick=()=>importDialog('C-BAP',render);document.querySelector('#collection-json').onclick=()=>jsonDialog('C-BAP',render);wireTable();icons();
}
