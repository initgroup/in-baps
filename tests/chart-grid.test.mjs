import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

// Use production transformations; replace only DOM-owned state/labels.
const chartsSource=(await readFile(new URL('../frontend/js/charts.js',import.meta.url),'utf8')).replace("import {state,label} from './core.js';","const state={charts:[]};const label=value=>value;");
const chartsURL='data:text/javascript;base64,'+Buffer.from(chartsSource).toString('base64');
const gridSource=(await readFile(new URL('../frontend/js/chart-grid.js',import.meta.url),'utf8')).replace("from './charts.js'",`from '${chartsURL}'`);
const {buildOption}=await import(chartsURL);
const {createDrillModel,selectGridRows}=await import('data:text/javascript;base64,'+Buffer.from(gridSource).toString('base64'));
const spec={x:'category',y:'value',secondary:'second',aggregation:'sum'};
const make=(type,rows,settings=spec)=>{const option=buildOption(type,rows,settings);return {option,model:createDrillModel(type,rows,settings,option)};};
const indices=(model,event)=>model.resolve({componentType:'series',seriesIndex:0,...event})?.indices;

test('grouped numeric and missing labels use the exact chart grouping policy',()=>{
 const rows=[{category:1,value:10},{category:'1',value:null},{category:'001',value:20},{category:null,value:3},{category:'',value:true},{category:'(결측)',value:'001'}];
 const {model}=make('bar',rows);
 assert.deepEqual(indices(model,{dataIndex:0}),[0,1]);
 assert.deepEqual(model.items[0].usedIndices,[0]);
 assert.deepEqual(indices(model,{dataIndex:1}),[2]);
 assert.deepEqual(indices(model,{dataIndex:2}),[3,4,5]);
 assert.deepEqual(model.items[2].usedIndices,[3]);
 assert.deepEqual(model.all.usedIndices,[0,2,3]);
 assert.equal(model.resolve({componentType:'legend',dataIndex:0}),null);
 assert.equal(model.resolve({componentType:'series',seriesIndex:1,dataIndex:0}),null);
 assert.equal(model.resolve({componentType:'series',dataIndex:999}),null);
});

test('count includes every matching raw row while non-numeric sum rows remain inspectable',()=>{
 const rows=[{category:'A',value:10},{category:'A',value:'001'},{category:'A',value:false},{category:'B',value:null}];
 for(const type of ['line','area','bar','pie','treemap','funnel','radar','gauge']){
  const {model}=make(type,rows,{...spec,aggregation:'count'});
  assert.deepEqual(model.all.usedIndices,[0,1,2,3],type);
 }
 const {model}=make('pie',rows);
 assert.deepEqual(model.items[0].indices,[0,1,2]);
 assert.deepEqual(model.items[0].usedIndices,[0]);
 assert.deepEqual(model.all.indices,[0,1,2,3]);
});

test('scatter distinguishes identical points and keeps original row numbers after exclusions and cap',()=>{
 const rows=[{value:null,second:8},{value:4,second:8},{value:'4',second:'8'},{value:'004',second:8},{value:0,second:0}];
 const {model}=make('scatter',rows);
 assert.deepEqual(indices(model,{dataIndex:0}),[1]);
 assert.deepEqual(indices(model,{dataIndex:1}),[2]);
 assert.deepEqual(indices(model,{dataIndex:2}),[4]);
 assert.equal(indices(model,{dataIndex:3}),undefined);
 assert.match(model.items[1].title,/원본 3행/);
 const large=Array.from({length:6000},(_,i)=>({value:i,second:i}));
 const bounded=make('scatter',large).model;
 assert.equal(bounded.items.length,5000);
 assert.equal(bounded.all.indices.length,6000);
 assert.equal(bounded.all.usedIndices.length,5000);
 assert.deepEqual(bounded.forRow(5999),[]);
});

test('heatmap maps both actual displayed axes using safe pair keys and preserves missing contributors',()=>{
 const rows=[{category:'A|B',second:'C',value:1},{category:'A',second:'B|C',value:7},{category:'A|B',second:'C',value:null},{category:'A',second:'C',value:2}];
 const {model,option}=make('heatmap',rows);
 const point=option.series[0].data.findIndex(value=>option.xAxis.data[value[0]]==='A|B'&&option.yAxis.data[value[1]]==='C');
 assert.deepEqual(indices(model,{dataIndex:point}),[0,2]);
 assert.deepEqual(model.resolve({dataIndex:point}).usedIndices,[0]);
});

test('sunburst child identity includes parent; parents include displayed children only',()=>{
 const rows=[{category:'A',second:'same',value:10},{category:'B',second:'same',value:5},{category:'A',second:'two',value:9},{category:'A',second:'three',value:8},{category:'A',second:'omitted',value:1}];
 const {model,option}=make('sunburst',rows);
 const a=option.series[0].data.find(node=>node.name==='A'),b=option.series[0].data.find(node=>node.name==='B');
 assert.deepEqual(indices(model,{data:a.children.find(child=>child.name==='same')}),[0]);
 assert.deepEqual(indices(model,{data:b.children.find(child=>child.name==='same')}),[1]);
 assert.deepEqual(indices(model,{data:a}),[0,2,3]);
 assert(!model.all.usedIndices.includes(4));
 assert.equal(model.resolve({dataIndex:1,name:'same'}),null,'Ambiguous hierarchy labels are never guessed');
 assert.equal(model.resolve({data:{bapsDrillId:'foreign-token'}}),null);
 const child=model.resolve({data:a.children[0]});assert.equal(child.parentId,a.bapsDrillId);
});

test('network edges and nodes keep side identity even when text contains role prefixes',()=>{
 const rows=[{category:'same',second:'same',value:10},{category:'A: same',second:'same',value:4},{category:'same',second:'A: same',value:6},{category:'same',second:'same',value:null}];
 for(const type of ['graph','sankey']){
  const {model,option}=make(type,rows),series=option.series[0];
  const edge=series.links.find(link=>link.source==='A: same'&&link.target==='B: same');
  assert.deepEqual(indices(model,{data:edge,dataType:'edge'}),[0,3],type);
  const node=series.data.find(node=>node.name==='A: A: same');
  assert.deepEqual(indices(model,{data:node,dataType:'node'}),[1],type);
  const right=series.data.find(node=>node.name==='B: same');
  assert.deepEqual(indices(model,{data:right,dataType:'node'}),[0,1,3],type);
  assert.equal(model.resolve({dataIndex:0}),null,'Node/edge role is required without provenance token');
 }
});

test('network node detail excludes links removed by the displayed-node bound',()=>{
 const rows=Array.from({length:70},(_,i)=>({category:'source',second:'target '+i,value:70-i}));
 const {model,option}=make('sankey',rows);
 const source=option.series[0].data.find(node=>node.name==='A: source');
 const selected=model.resolve({data:source});
 assert.equal(selected.indices.length,49);
 assert(!selected.indices.includes(69));
 assert.match(selected.note,/생략된 연결/);
});

test('radar click means displayed indicators, gauge means its full aggregate, and invalid charts retain raw data',()=>{
 const rows=Array.from({length:20},(_,i)=>({category:'C'+i,value:i+1}));
 const radar=make('radar',rows).model;
 assert.equal(radar.resolve({dataIndex:0}).indices.length,12);
 assert.match(radar.resolve({dataIndex:0}).note,/전체 지표/);
 assert.deepEqual(make('gauge',rows).model.resolve({dataIndex:0}).indices,rows.map((row,index)=>index));
 const invalid=make('pie',[{category:'negative',value:-1}]).model;
 assert.equal(invalid.items.length,0);assert.deepEqual(invalid.all.indices,[0]);assert.deepEqual(invalid.all.usedIndices,[]);
});

test('grid filtering and sorting never mutate input, preserve stable ties, and place numeric missing values last',()=>{
 const rows=[{name:'<img src=x>',value:2},{name:'서울',value:null},{name:'부산',value:10},{name:'서울',value:'02'},{name:'서울',value:2}];
 const columns=[{name:'name',type:'string'},{name:'value',type:'number'}],all=[0,1,2,3,4],snapshot=JSON.stringify(rows);
 assert.deepEqual(selectGridRows(rows,all,columns,{sortKey:'value'}),[0,4,2,1,3]);
 assert.deepEqual(selectGridRows(rows,all,columns,{sortKey:'value',direction:'desc'}),[2,0,4,1,3]);
 assert.deepEqual(selectGridRows(rows,all,columns,{query:'서울'}),[1,3,4]);
 assert.deepEqual(selectGridRows(rows,all,columns,{query:'서울',contributingOnly:true,usedIndices:[0,2,4]}),[4]);
 assert.deepEqual(selectGridRows(rows,all,columns,{query:'IMG'}),[0]);
 assert.deepEqual(all,[0,1,2,3,4]);assert.equal(JSON.stringify(rows),snapshot);
});
