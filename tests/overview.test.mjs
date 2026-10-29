import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

// Exercise the production metadata model; DOM/API imports are not needed here.
const source=(await readFile(new URL('../frontend/js/M00001.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'');
const {overviewModel}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

test('overview uses registered metadata and never reads rows or invents numeric KPIs',()=>{
 const dataset={id:'a',name:'Identifiers',source:'upload',row_count:300,columns:[{name:'code',type:'number'}],created_at:'2026-10-29T00:00:00Z',get rows(){throw new Error('Overview must not read row values');}};
 const result=overviewModel([dataset,{id:'b',name:'SQL',source:'target-sql',columns:[],synthetic:true}],[],[],[]);
 assert.equal(result.datasetCount,2);assert.equal(result.sqlCount,1);assert.equal(result.syntheticCount,1);
 assert.equal(result.analysisCount,0);assert.equal(result.visualizationCount,0);
 assert.equal(result.recentDatasets[0].id,'a');
 assert.equal(Object.hasOwn(result,'sum'),false);assert.equal(Object.hasOwn(result,'quality'),false);
});

test('recent work merges actual timestamps and reports known collection outcomes',()=>{
 const analyses=[{id:'analysis',created_at:'2026-10-28T00:00:00Z'}];
 const charts=[{id:'chart',created_at:'2026-10-27T00:00:00Z',updated_at:'2026-10-29T00:00:00Z'}];
 const runs=[{id:'ok',status:'SUCCEEDED',started_at:1793235600},{id:'failure',status:'FAILED',started_at:1793408400},{id:'unknown',status:'UNKNOWN',started_at:1793408401},{id:'running',status:'RUNNING',started_at:1793408402}];
 const model=overviewModel([],charts,analyses,runs);
 assert.equal(model.activities.length,6);
 assert.equal(model.activities[0].id,'running');
 assert.deepEqual(model.collectionWarnings.map(item=>item.id),['failure','unknown']);
 assert.equal(model.activities.find(item=>item.id==='chart').at,'2026-10-29T00:00:00Z');
});
