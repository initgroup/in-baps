"""Reference-value, degeneracy and owned-history checks for R-BAP statistics."""
import json
import tempfile
import unittest
import warnings
from pathlib import Path
from unittest.mock import patch

from fastapi import FastAPI, HTTPException, Response
from fastapi.testclient import TestClient

from backend import config, database
from backend.analytics import analyze, clean_rows
from backend.api import router
from backend.auth import create_user, issue_session


def dataset(rows):
    cleaned, columns = clean_rows(rows)
    return {'id':'explicit-statistics-fixture','rows':cleaned,'columns':columns}


def result_table(result, key):
    return next(item['rows'] for item in result['tables'] if item['key']==key)


class AdvancedStatisticsTests(unittest.TestCase):
    def run_method(self, rows, method, **parameters):
        result = analyze(dataset(rows), {'method':method, **parameters})
        json.dumps(result,allow_nan=False)
        return result

    def test_descriptive_reference_confidence_interval_and_numeric_policy(self):
        result = self.run_method([{'x':i} for i in [1,2,3,4,5]], 'descriptive', columns=['x'])
        row = result['rows'][0]
        self.assertEqual(row['mean'],3)
        self.assertAlmostEqual(row['stddev'],1.5811388300841898)
        self.assertAlmostEqual(row['ci_low'],1.036756838522439,places=10)
        self.assertAlmostEqual(row['ci_high'],4.9632431614775605,places=10)
        self.assertEqual((row['q1'],row['median'],row['q3']),(2,3,4))
        result = self.run_method([{'x':x} for x in [0,'1',2,'001',True,None]],'descriptive',columns=['x'])
        self.assertEqual(result['rows'][0]['n'],3)
        self.assertEqual(result['sample']['excluded'],3)
        self.assertEqual(result['rows'][0]['mean'],1)

    def test_t_tests_reference_statistics_and_effects(self):
        rows=[{'x':i,'y':0} for i in range(1,6)]
        for method,params in [('ttest_one',{'null_mean':0}),('ttest_paired',{'value2':'y'})]:
            result=self.run_method(rows,method,value='x',**params)
            self.assertAlmostEqual(result['rows'][0]['statistic'],4.242640687119285)
            self.assertAlmostEqual(result['rows'][0]['p_value'],0.013235599563682695)
            self.assertAlmostEqual(result['rows'][0]['ci_low'],1.036756838522439)
        result=self.run_method(rows,'ttest_one',value='x',null_mean=2)
        self.assertAlmostEqual(result['rows'][0]['ci_low'],-.963243161477561)
        groups=[{'x':i,'g':'A'} for i in range(1,6)]+[{'x':2*i,'g':'B'} for i in range(1,6)]
        result=self.run_method(groups,'ttest_ind',value='x',group_by='g')
        self.assertAlmostEqual(result['rows'][0]['statistic'],-1.8973665961010275)
        self.assertAlmostEqual(result['rows'][0]['df'],5.882352941176471)
        self.assertAlmostEqual(result['rows'][0]['effect'],-1.0838709677419356)

    def test_anova_reference_and_multiplicity_adjusted_posthoc(self):
        groups={'A':[8,9,6,7],'B':[5,4,6,5],'C':[10,12,9,11]}
        result=self.run_method([{'g':g,'v':v} for g,values in groups.items() for v in values],'anova',value='v',group_by='g')
        self.assertAlmostEqual(result['rows'][0]['value'],22.75)
        self.assertEqual(len(result_table(result,'posthoc')),3)
        self.assertTrue(all(0<=row['p_adjusted']<=1 for row in result_table(result,'posthoc')))
        self.assertEqual(result['sample']['used'],12)

    def test_nonparametric_reference_values(self):
        groups=[{'g':'A','v':i} for i in [1,2,3]]+[{'g':'B','v':i} for i in [4,5,6]]
        mann=self.run_method(groups,'mannwhitney',value='v',group_by='g')['rows'][0]
        self.assertEqual(mann['value'],0)
        self.assertAlmostEqual(mann['p_value'],.1)
        self.assertEqual(mann['effect'],-1)
        kruskal=self.run_method(groups,'kruskal',value='v',group_by='g')
        self.assertAlmostEqual(kruskal['rows'][0]['value'],3.857142857142854)
        self.assertEqual(len(result_table(kruskal,'posthoc')),1)
        wilcoxon=self.run_method([{'x':i,'y':0} for i in range(1,6)],'wilcoxon',value='x',value2='y')['rows'][0]
        self.assertEqual(wilcoxon['statistic'],0)
        self.assertAlmostEqual(wilcoxon['p_value'],.0625)
        self.assertEqual(wilcoxon['effect'],1)

    def test_chi_square_reference_and_sparse_expectations(self):
        rows=[]
        for a,b,n in [('A','yes',10),('A','no',20),('B','yes',20),('B','no',10)]:
            rows.extend({'a':a,'b':b} for _ in range(n))
        result=self.run_method(rows,'chi_square',group_by='a',value='b')
        self.assertAlmostEqual(result['rows'][0]['value'],6.666666666666667)
        self.assertAlmostEqual(result['rows'][0]['p_value'],.009823274507519235)
        self.assertAlmostEqual(result['rows'][0]['cramers_v'],1/3)
        self.assertEqual(sum(row['observed'] for row in result_table(result,'contingency')),60)

    def test_correlations_pairwise_missing_and_holm_adjustment(self):
        rows=[{'x':i,'y':2*i,'z':10-i} for i in range(1,9)]+[{'x':None,'y':1,'z':1}]
        result=self.run_method(rows,'correlation_test',columns=['x','y','z'])
        xy=next(row for row in result['rows'] if row['x']=='x' and row['y']=='y')
        self.assertAlmostEqual(xy['value'],1)
        self.assertEqual(xy['n'],8)
        self.assertAlmostEqual(xy['ci_low'],1)
        self.assertTrue(all(row['p_adjusted']>=row['p_value'] for row in result['rows']))
        spearman=self.run_method(rows,'correlation_test',columns=['x','z'],correlation_kind='spearman')
        self.assertAlmostEqual(spearman['rows'][0]['value'],-1)
        self.assertIsNone(spearman['rows'][0]['ci_low'])

    def test_normality_constant_and_bounded_large_sample(self):
        rows=[{'x':i%29,'constant':1} for i in range(6000)]
        result=self.run_method(rows,'normality',columns=['x','constant'])
        normality=result_table(result,'normality')
        self.assertEqual(normality[0]['shapiro_n'],5000)
        self.assertEqual(normality[0]['n'],6000)
        self.assertIsNone(normality[1]['p_value'])
        self.assertTrue(any('5,000' in note for note in result['warnings']))

    def test_ols_known_factorial_coefficients_hc3_and_separate_validation(self):
        rows=[{'x':x,'z':z,'y':2+3*x-4*z+(replicate-1)*.2} for x in [-2,-1,0,1,2] for z in [-1,0,1] for replicate in range(3)]
        result=self.run_method(rows,'ols',value='y',columns=['x','z'])
        estimates={row['name']:row['value'] for row in result['rows']}
        self.assertAlmostEqual(estimates['절편'],2)
        self.assertAlmostEqual(estimates['x'],3)
        self.assertAlmostEqual(estimates['z'],-4)
        validation={row['name']:row['value'] for row in result_table(result,'validation')}
        self.assertEqual(validation['훈련 N']+validation['검증 N'],45)
        self.assertGreater(validation['RMSE'],0)
        self.assertEqual(len(result_table(result,'diagnostics')),4)

    def test_logistic_known_symmetric_odds_and_holdout_metrics(self):
        rows=[]
        for x,count in [(-2,12),(-1,27),(0,50),(1,73),(2,88)]:
            rows.extend({'x':x,'y':int(i<count)} for i in range(100))
        result=self.run_method(rows,'logistic',value='y',columns=['x'])
        estimates={row['name']:row for row in result['rows']}
        self.assertAlmostEqual(estimates['절편']['value'],0,places=8)
        self.assertAlmostEqual(estimates['x']['value'],1,delta=.02)
        self.assertGreater(estimates['x']['odds_ratio'],2.6)
        validation={row['name']:row['value'] for row in result_table(result,'validation')}
        self.assertEqual(validation['훈련 N']+validation['검증 N'],500)
        self.assertGreater(validation['ROC AUC'],.7)
        self.assertEqual(len(result_table(result,'confusion')),2)

    def test_failed_holdout_fit_does_not_discard_stable_full_sample_inference(self):
        from statsmodels.discrete.discrete_model import Logit
        from statsmodels.tools.sm_exceptions import ConvergenceWarning
        original_fit=Logit.fit
        calls=[]
        def fit(model,*args,**kwargs):
            calls.append(len(model.endog))
            if len(model.endog)<30:
                warnings.warn('Deliberate held-out training fit failure',ConvergenceWarning)
            return original_fit(model,*args,**kwargs)
        rows=[{'x':x,'y':int(i<count)} for x,count in [(-1,3),(0,5),(1,7)] for i in range(10)]
        with patch.object(Logit,'fit',fit):
            result=self.run_method(rows,'logistic',value='y',columns=['x'])
        self.assertEqual(calls[0],30)
        self.assertEqual(len(result['rows']),2)
        self.assertFalse(any(item['key']=='validation' for item in result['tables']))
        self.assertTrue(any('홀드아웃 성능을 제공하지 않습니다' in note for note in result['warnings']))

    def test_pca_kmeans_reliability_and_column_name_collisions(self):
        rows=[{'x':i,'y':i} for i in range(1,6)]
        pca=self.run_method(rows,'pca',columns=['x','y'],components=2)
        self.assertAlmostEqual(pca['rows'][0]['value'],1)
        self.assertAlmostEqual(pca['rows'][1]['value'],0)
        alpha=self.run_method([{'a':i,'b':i,'c':i} for i in range(1,7)],'reliability',columns=['a','b','c'])
        self.assertAlmostEqual(next(item['value'] for item in alpha['summary'] if item['label']=='Cronbach α'),1)
        points=[{'name':x,'value':y} for x,y in [(0,0),(0,.1),(.1,0),(10,10),(10,10.1),(10.1,10)]]
        cluster=self.run_method(points,'kmeans',columns=['name','value'],clusters=2)
        self.assertEqual(sorted(row['value'] for row in cluster['rows']),[3,3])
        self.assertTrue(all('feature_0' in row for row in result_table(cluster,'centers')))
        self.assertEqual(cluster['rows'],self.run_method(points,'kmeans',columns=['name','value'],clusters=2)['rows'])

    def test_unsafe_degenerate_or_ambiguous_inputs_are_explicitly_rejected(self):
        cases=[
            ([{'x':1,'y':i} for i in range(10)],'ols',{'value':'y','columns':['x']}),
            ([{'x':i,'y':2*i,'z':3*i} for i in range(10)],'ols',{'value':'y','columns':['x','z']}),
            ([{'x':i} for i in range(10)],'descriptive',{'columns':['x','x']}),
            ([{'x':i} for i in range(10)],'descriptive',{'columns':['missing']}),
            ([{'x':1} for _ in range(10)],'ttest_one',{'value':'x'}),
            ([{'x':i,'y':2} for i in range(20)],'logistic',{'value':'y','columns':['x']}),
            ([{'x':i} for i in range(10)],'descriptive',{'columns':['x'],'confidence':.73}),
        ]
        for rows,method,parameters in cases:
            with self.subTest(method=method,parameters=parameters),self.assertRaises(HTTPException) as caught:
                self.run_method(rows,method,**parameters)
            self.assertEqual(caught.exception.status_code,422)

    def test_truncated_source_is_disclosed(self):
        data=dataset([{'x':i} for i in range(8)])
        data['truncated']=True
        result=analyze(data,{'method':'descriptive','columns':['x']})
        self.assertTrue(result['source']['truncated'])
        self.assertTrue(any('잘렸' in warning for warning in result['warnings']))


class AdvancedAnalysisAPITests(unittest.TestCase):
    def setUp(self):
        (config.ROOT/'.runtime').mkdir(exist_ok=True)
        self.directory=tempfile.TemporaryDirectory(dir=config.ROOT/'.runtime',prefix='advanced-analysis-')
        self.patches=[patch.object(config,'STORAGE','sqlite'),patch.object(config,'DATA_DIR',Path(self.directory.name)),
                      patch.object(config,'COOKIE_SECURE',False),patch.object(config,'ENABLED_MODULES',{'R-BAP','V-BAP'})]
        for item in self.patches:item.start()
        database.initialize()
        self.app=FastAPI();self.app.include_router(router)
        self.user=create_user('statistics.user','Statistics user',role='analyst')
        self.client,self.headers=self.session(self.user)

    def session(self,user):
        response=Response();data=issue_session(user,response)
        client=TestClient(self.app)
        client.cookies.set(config.COOKIE,response.headers['set-cookie'].split(';')[0].split('=',1)[1])
        return client,{'X-CSRF-Token':data['csrf_token']}

    def tearDown(self):
        self.client.close()
        for item in reversed(self.patches):item.stop()
        self.directory.cleanup()

    def test_saved_history_is_owned_summary_only_and_reopens_exact_result(self):
        created=self.client.post('/api/datasets',headers=self.headers,json={'name':'Explicit statistics input','module':'R-BAP','rows':[{'x':i} for i in range(1,6)]})
        self.assertEqual(created.status_code,201)
        dataset_id=created.json()['data']['id']
        payload={'dataset_id':dataset_id,'method':'descriptive','columns':['x'],'confidence':.99}
        self.assertEqual(self.client.post('/api/analysis',json=payload).status_code,403)
        response=self.client.post('/api/analysis',headers=self.headers,json=payload)
        self.assertEqual(response.status_code,201,response.text)
        record=response.json()['data']
        summary=self.client.get('/api/analyses?summary=true').json()['data']
        self.assertEqual(len(summary),1);self.assertNotIn('result',summary[0])
        self.assertEqual(summary[0]['parameters']['confidence'],.99)
        self.assertEqual(self.client.get('/api/analyses/'+record['id']).json()['data'],record)
        other=create_user('statistics.other','Other',role='analyst')
        separate,_=self.session(other)
        self.assertEqual(separate.get('/api/analyses?summary=true').json()['data'],[])
        self.assertEqual(separate.get('/api/analyses/'+record['id']).status_code,404)
        separate.close()
        with patch.object(config,'ENABLED_MODULES',{'V-BAP'}):
            self.assertEqual(self.client.get('/api/analyses/'+record['id']).status_code,403)
        self.assertEqual(self.client.post('/api/analysis',headers=self.headers,json={**payload,'confidence':.73}).status_code,422)


if __name__=='__main__':
    unittest.main()
