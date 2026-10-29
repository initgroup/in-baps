import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

// Test the production chart transformations without a browser or ECharts canvas.
// Only UI state/label helpers are replaced; all numeric and mapping code is real.
const source=await readFile(new URL('../frontend/js/charts.js',import.meta.url),'utf8');
const isolated=source.replace("import {state,label} from './core.js';","const state={charts:[]}; const label=value=>value;");
assert.notEqual(source,isolated,'Update the test adapter if charts.js imports change.');
const {buildOption,grouped,finiteNumeric}=await import('data:text/javascript;base64,'+Buffer.from(isolated).toString('base64'));

test('missing and identifier values are excluded from arithmetic, preserving true zero',()=>{
 for(const value of [null,undefined,'','   ',true,false,'001','-002',Infinity,NaN,1e101])assert.equal(finiteNumeric(value),null);
 assert.equal(finiteNumeric(0),0);assert.equal(finiteNumeric('0'),0);assert.equal(finiteNumeric('12.5'),12.5);
 const rows=[{c:'A',n:10},{c:'A',n:null},{c:'A',n:''},{c:'A',n:true},{c:'A',n:'001'}];
 assert.equal(grouped(rows,'c','n','mean')[0].value,10);
 assert.equal(grouped(rows,'c','n','count')[0].value,5);
 assert.equal(grouped([{c:'A',n:null}],'c','n','sum')[0].value,null);
 assert.equal(grouped([{c:'A',n:null}],'c','n','count')[0].value,1);
});

const sample=[{c:'A',s:'B',n:10,m:20},{c:'A',s:'B',n:20,m:null},{c:'C',s:'D',n:null,m:15}];
test('graph and gauge use the selected aggregation; scatter excludes incomplete pairs',()=>{
 assert.equal(buildOption('graph',sample,{x:'c',secondary:'s',y:'n',aggregation:'mean'}).series[0].links[0].value,15);
 assert.equal(buildOption('sankey',sample,{x:'c',secondary:'s',y:'n',aggregation:'mean'}).series[0].links[0].value,15);
 assert.deepEqual(buildOption('scatter',sample,{y:'n',secondary:'m'}).series[0].data,[[10,20]]);
 assert.equal(buildOption('gauge',sample,{y:'n',aggregation:'mean'}).series[0].data[0].value,15);
 assert.equal(buildOption('gauge',sample,{aggregation:'count'}).series[0].data[0].value,3);
});

test('20,000 distinct categories produce bounded chart options with visible limit notes',()=>{
 const large=Array.from({length:20000},(_,i)=>({c:'C'+i,s:'S'+i,n:i,m:i}));
 const heat=buildOption('heatmap',large,{x:'c',secondary:'s',y:'n'});
 assert(heat.xAxis.data.length<=40&&heat.yAxis.data.length<=40&&heat.series[0].data.length<=1600);
 assert.match(heat.bapsNote,/40/);
 const graph=buildOption('graph',large,{x:'c',secondary:'s',y:'n'});
 assert(graph.series[0].data.length<=50&&graph.series[0].links.length<=150);
 assert.match(graph.bapsNote,/50.*150/);
 for(const type of ['line','area'])assert(buildOption(type,large,{x:'c',y:'n'}).series[0].data.length<=500);
 for(const type of ['bar','pie','treemap','funnel'])assert(buildOption(type,large,{x:'c',y:'n'}).series[0].data.length<=50);
 assert(buildOption('scatter',large,{y:'n',secondary:'m'}).series[0].data.length<=5000);
 const sun=buildOption('sunburst',large,{x:'c',secondary:'s',y:'n'}).series[0].data;
 assert(sun.length+sun.reduce((a,b)=>a+b.children.length,0)<=200);
});

test('count works without numeric columns; numeric-only charts explain incompatible data',()=>{
 for(const type of ['line','bar','area','pie','heatmap','radar','treemap','sunburst','sankey','graph','funnel','gauge']){
  assert(buildOption(type,[{c:'A',s:'B'}],{x:'c',secondary:'s',aggregation:'count'}).series.length,type);
 }
 for(const type of ['scatter','boxplot'])assert.equal(buildOption(type,[{c:'A'}],{x:'c',aggregation:'count'}).series.length,0);
 for(const type of ['pie','treemap','sunburst','funnel','sankey'])assert.equal(buildOption(type,[{c:'A',s:'B',n:-1}],{x:'c',secondary:'s',y:'n'}).series.length,0);
 assert.match(buildOption('boxplot',sample,{x:'c',y:'n'}).bapsNote,/최솟값·최댓값/);
});
