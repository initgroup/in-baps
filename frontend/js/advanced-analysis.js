import {state,esc,columns,columnOptions,api,modal,modalHead,closeModal,icons,exportCSV,toast,download,label} from './core.js';
import {chart,buildOption,finiteNumeric} from './charts.js';
import {mountChoiceList} from './choice-list.js';

export const advancedMethods={
 descriptive:['기술통계·평균 신뢰구간','평균·표준오차·분위수·왜도·첨도와 평균 신뢰구간을 비교합니다.'],
 normality:['정규성 검정','Shapiro–Wilk와 D’Agostino 검정으로 정규성 가정을 점검합니다.'],
 ttest_one:['일표본 t 검정','선택한 수치의 평균을 지정한 기준 평균과 비교합니다.'],
 ttest_ind:['독립표본 Welch t 검정','두 독립 그룹의 평균 차이·신뢰구간·Hedges g를 계산합니다.'],
 ttest_paired:['대응표본 t 검정','같은 행의 두 측정값을 대응 쌍으로 비교합니다.'],
 anova:['일원 분산분석·사후검정','ANOVA 표·효과크기·등분산 점검·Tukey HSD를 제공합니다.'],
 mannwhitney:['Mann–Whitney U 검정','두 독립 그룹의 순위 분포와 효과크기를 비교합니다.'],
 kruskal:['Kruskal–Wallis 검정','여러 그룹의 순위를 비교하고 쌍별 검정에 Holm 보정을 적용합니다.'],
 wilcoxon:['Wilcoxon 부호순위 검정','대응 측정의 차이를 순위로 검정합니다. 차이 분포의 대칭성을 확인하세요.'],
 chi_square:['교차표·독립성 검정','관측·기대 빈도, 카이제곱, Cramér V와 2×2 Fisher 검정을 제공합니다.'],
 correlation_test:['상관계수·유의성 검정','Pearson/Spearman, 쌍별 표본 수, p값·Holm 보정과 Pearson 신뢰구간을 계산합니다.'],
 ols:['다중 선형회귀','회귀계수·신뢰구간·VIF·잔차 진단과 별도 홀드아웃 검증을 제공합니다.'],
 logistic:['이항 로지스틱 회귀','0/1 결과의 계수·오즈비·추론과 별도 검증 표본의 AUC·혼동행렬을 제공합니다.'],
 pca:['주성분 분석','설명분산·성분 가중치·관측 점수로 다차원 구조를 탐색합니다.'],
 kmeans:['K-means 군집 분석','고정 시드 군집·중심·관측 배정·Silhouette를 제공합니다.'],
 reliability:['신뢰도·문항 분석','Cronbach α, 수정 문항-총점 상관, 문항 제거 α를 계산합니다.'],
};
export const isAdvanced=method=>Object.hasOwn(advancedMethods,method);
export const analysisName=method=>advancedMethods[method]?.[0]||({profile:'데이터 프로파일',aggregate:'그룹별 집계',correlation:'상관관계 분석',text:'텍스트 빈도 분석'}[method]||method);
export function methodOptions(){
 return [
  ['기초 통계·품질',['profile','descriptive','normality','aggregate']],
  ['평균·집단 비교',['ttest_one','ttest_ind','ttest_paired','anova']],
  ['비모수 검정',['mannwhitney','kruskal','wilcoxon']],
  ['상관·범주 분석',['correlation','correlation_test','chi_square']],
  ['모형·다변량 분석',['ols','logistic','pca','kmeans','reliability']],
  ['텍스트',['text']],
 ].map(([group,methods])=>`<optgroup label="${group}">${methods.map(method=>`<option value="${method}">${analysisName(method)}</option>`).join('')}</optgroup>`).join('');
}
const select=(id,title,keys,selected)=>`<label class="field">${title}<select id="${id}">${columnOptions(keys,selected)}</select></label>`;
export function advancedFields(method){
 const keys=columns(),nums=keys.filter(name=>state.rows.some(row=>finiteNumeric(row[name])!==null)),cats=keys.filter(key=>!nums.includes(key));
 const dependent=nums.includes('revenue')?'revenue':nums[0];
 let content=`<p class="advanced-method-help">${advancedMethods[method][1]}</p>`;
 if(['ttest_one','ttest_ind','ttest_paired','anova','mannwhitney','kruskal','wilcoxon','ols','logistic'].includes(method))content+=select('analysis-value',method==='logistic'?'종속변수 · 수치 0/1':method==='ols'?'종속변수':'분석 수치 · 첫 측정',nums,dependent);
 if(['ttest_ind','anova','mannwhitney','kruskal','chi_square'].includes(method))content+=select('analysis-group','그룹 / 행 범주',keys,cats[0]||keys[0]);
 if(method==='chi_square')content+=select('analysis-value','열 범주',keys,cats[1]||keys.find(key=>key!==(cats[0]||keys[0])));
 if(['ttest_paired','wilcoxon'].includes(method))content+=select('analysis-value2','둘째 측정 · 같은 행의 대응값',nums,nums.find(key=>key!==dependent));
 if(method==='ttest_one')content+='<label class="field">기준 평균<input id="analysis-null-mean" type="number" value="0" step="any" required></label>';
 if(['descriptive','normality','correlation_test','ols','logistic','pca','kmeans','reliability'].includes(method)){
  const regression=['ols','logistic'].includes(method);
  content+=`<fieldset class="advanced-columns"><legend>${regression?'설명변수':'분석 컬럼'} · 최대 20개</legend>${nums.length?nums.map((name,i)=>`<label><input type="checkbox" name="advanced-columns" value="${esc(name)}" ${i<Math.min(20,regression?6:20)&&(!regression||name!==dependent)?'checked':''} ${regression&&name===dependent?'disabled':''}><span>${esc(label(name))}</span></label>`).join(''):'<p class="muted">유효한 수치가 있는 컬럼이 없습니다.</p>'}</fieldset><small class="muted">숫자로 해석할 수 없는 값은 제외합니다. 001 같은 앞자리 0 식별자는 수치로 사용하지 않습니다.</small>`;
 }
 if(method==='correlation_test')content+='<label class="field">상관계수<select id="analysis-correlation-kind"><option value="pearson">Pearson · 선형 관계</option><option value="spearman">Spearman · 순위 관계</option></select></label>';
 if(method==='ols')content+='<label class="check-field"><input type="checkbox" id="analysis-robust" checked>HC3 이분산 강건 표준오차</label>';
 if(['ols','logistic'].includes(method))content+='<label class="field">홀드아웃 검증 비율<select id="analysis-test-fraction"><option value="0.25">25%</option><option value="0.2">20%</option><option value="0.3">30%</option></select><small>충분한 표본에서 별도 훈련 모형으로 검증합니다. 고정 시드 1729, 표준화도 훈련 표본에만 적합합니다.</small></label>';
 if(['pca','kmeans'].includes(method))content+='<label class="check-field"><input type="checkbox" id="analysis-standardize" checked>컬럼별 표준화 · 평균 0, 표준편차 1</label>';
 if(method==='pca')content+='<label class="field">주성분 수<input id="analysis-components" type="number" min="1" max="20" value="2" required></label>';
 if(method==='kmeans')content+='<label class="field">군집 수<input id="analysis-clusters" type="number" min="2" max="10" value="3" required></label>';
 if(!['pca','kmeans','reliability'].includes(method))content+='<label class="field">신뢰수준 / 유의수준<select id="analysis-confidence"><option value="0.95">95% / α = 0.05</option><option value="0.90">90% / α = 0.10</option><option value="0.99">99% / α = 0.01</option></select></label>';
 return content;
}
export function wireAdvancedFields(method){
 if(['ols','logistic'].includes(method))document.querySelector('#analysis-value')?.addEventListener('change',event=>{
  document.querySelectorAll('[name="advanced-columns"]').forEach(input=>{input.disabled=input.value===event.target.value;if(input.disabled)input.checked=false;});
 });
}
export function advancedParameters(){
 const result={},single=['value','value2','group'],numeric=['null-mean','components','clusters','confidence','test-fraction'];
 for(const name of single){const element=document.querySelector('#analysis-'+name);if(element)result[name==='group'?'group_by':name]=element.value;}
 for(const name of numeric){const element=document.querySelector('#analysis-'+name);if(element){if(!element.checkValidity())throw new Error('분석 설정의 수치 범위를 확인하세요.');result[name.replaceAll('-','_')]=Number(element.value);}}
 const checks=[...document.querySelectorAll('[name="advanced-columns"]')];
 if(checks.length){result.columns=checks.filter(input=>input.checked&&!input.disabled).map(input=>input.value);if(!result.columns.length||result.columns.length>20)throw new Error('분석 컬럼을 1~20개 선택하세요.');}
 for(const name of ['robust','standardize']){const element=document.querySelector('#analysis-'+name);if(element)result[name]=element.checked;}
 const kind=document.querySelector('#analysis-correlation-kind');if(kind)result.correlation_kind=kind.value;
 return result;
}
function format(value){
 if(value===null||value===undefined)return '—';
 if(typeof value==='boolean')return value?'예':'아니요';
 if(typeof value==='number')return value!==0&&Math.abs(value)<.0001?value.toExponential(4):value.toLocaleString('ko-KR',{maximumFractionDigits:6});
 return String(value);
}
function resultTable(item,index){
 const rows=item.rows||[],visible=rows.slice(0,100);
 return `<section class="advanced-result-table"><div class="advanced-table-heading"><h3>${esc(item.title)}</h3><button class="button small" data-stat-export="${index}">표 CSV</button></div><div class="table-wrap"><table class="data-table"><thead><tr>${item.columns.map(column=>`<th>${esc(column.label)}</th>`).join('')}</tr></thead><tbody>${visible.map(row=>`<tr>${item.columns.map(column=>`<td>${esc(format(row[column.key]))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length>100?`<p class="advanced-table-limit">화면에 ${rows.length.toLocaleString()}개 중 앞 100개 표시 · 표 CSV는 저장된 ${rows.length.toLocaleString()}개 전체를 내보냅니다.</p>`:''}</section>`;
}
export function drawAdvancedResult(record,target){
 const result=record.result;
 target.innerHTML=`<div class="advanced-result">
  <div class="advanced-sample-note"><strong>실행 당시 조회 데이터 기준</strong><span>입력 ${format(result.sample.total)}행 · 유효 ${format(result.sample.used)}행 · 제외 ${format(result.sample.excluded)}행</span><p>${esc(result.sample.policy)}</p></div>
  ${result.summary.length?`<div class="result-summary advanced-summary">${result.summary.map(item=>`<div class="result-stat"><small>${esc(item.label)}</small><b>${esc(format(item.value))}</b></div>`).join('')}</div>`:''}
  ${result.interpretation.length?`<section class="advanced-interpretation"><h3>결과 해석</h3>${result.interpretation.map(text=>`<p>${esc(text)}</p>`).join('')}</section>`:''}
  ${result.warnings.length?`<section class="advanced-warnings"><h3>해석 전 확인</h3><ul>${result.warnings.map(text=>`<li>${esc(text)}</li>`).join('')}</ul></section>`:''}
  <details class="advanced-assumptions" open><summary>분석 가정·범위</summary><ul>${result.assumptions.map(text=>`<li>${esc(text)}</li>`).join('')}</ul><p>계산할 수 없는 통계량은 —로 표시합니다. ${Object.entries(result.engine||{}).map(([key,value])=>`${esc(key)} ${esc(value)}`).join(' · ')}</p></details>
  ${['ols','logistic','pca','kmeans'].includes(record.method)?'<div id="advanced-chart" class="chart"></div>':''}
  ${result.tables.map(resultTable).join('')}
  <details class="advanced-parameters"><summary>실행 설정·재현 정보</summary><pre>${esc(JSON.stringify({parameters:result.parameters,source:result.source,engine:result.engine},null,2))}</pre></details>
 </div>`;
 target.querySelectorAll('[data-stat-export]').forEach(button=>button.onclick=()=>{const item=result.tables[Number(button.dataset.statExport)];exportCSV(item.rows,`inbaps-${record.method}-${item.key}.csv`);});
 if(['ols','logistic','pca','kmeans'].includes(record.method))chart('#advanced-chart',buildOption('bar',result.rows,{x:'name',y:'value'}));
}
export function exportAnalysisJSON(record){
 if(!record)return;
 download(new Blob([JSON.stringify(record,null,2)],{type:'application/json;charset=utf-8'}),`inbaps-analysis-${record.method}.json`);
}
export async function analysisHistory(select,isCurrent){
 const dataset=state.selected,owner=state.user?.id;
 if(!dataset)return toast('먼저 데이터셋을 선택하세요.',true);
 modal(modalHead('ANALYSIS HISTORY','저장한 분석 결과')+'<div id="analysis-history-list"><p class="muted">저장한 분석을 조회하고 있습니다.</p></div>');
 try{
  const summaries=await api('/analyses?summary=true');
  const root=document.querySelector('#analysis-history-list');if(!root||!isCurrent()||owner!==state.user?.id)return;
  const items=summaries.filter(item=>item.dataset_id===dataset);
  root.innerHTML='<p class="muted">내 최근 200개 실행 중 선택 데이터셋의 결과입니다. 저장 결과는 실행 당시의 데이터 기준입니다.</p><div id="analysis-history-browser"></div>';
  mountChoiceList(root.querySelector('#analysis-history-browser'),{items:items.map(item=>({id:item.id,name:analysisName(item.method),meta:item.created_at.replace('T',' ').slice(0,19)+' UTC',description:item.dataset_name})),label:'저장 분석',attribute:'data-analysis-history',pageSize:10,onSelect:async id=>{
   try{const item=await api('/analyses/'+encodeURIComponent(id));if(!isCurrent()||state.selected!==dataset||owner!==state.user?.id)return;closeModal();select(item);}
   catch(error){if(isCurrent())toast(error.message,true);}
  }});
 }catch(error){if(isCurrent())toast(error.message,true);}
}
