"""Bounded statistical procedures using open-source scientific libraries.

No formula evaluation or user code execution. Parameters always refer to
validated columns; source rows use the same numeric policy as basic analysis.
"""
import math
import warnings
from collections import defaultdict
from itertools import combinations

from fastapi import HTTPException

METHODS = {
    'descriptive': '기술통계·평균 신뢰구간', 'normality': '정규성 검정',
    'ttest_one': '일표본 t 검정', 'ttest_ind': '독립표본 Welch t 검정',
    'ttest_paired': '대응표본 t 검정', 'anova': '일원 분산분석·사후검정',
    'mannwhitney': 'Mann–Whitney U 검정', 'kruskal': 'Kruskal–Wallis 검정',
    'wilcoxon': 'Wilcoxon 부호순위 검정', 'chi_square': '교차표·독립성 검정',
    'correlation_test': '상관계수·유의성 검정', 'ols': '다중 선형회귀',
    'logistic': '이항 로지스틱 회귀', 'pca': '주성분 분석',
    'kmeans': 'K-means 군집 분석', 'reliability': '신뢰도·문항 분석',
}
MAX_COLUMNS = 20
MAX_DETAIL_ROWS = 2000
SEED = 1729


def fail(message):
    raise HTTPException(422, message)


def table(key, title, columns, rows):
    return {'key': key, 'title': title, 'columns': [{'key': k, 'label': label} for k, label in columns], 'rows': rows}


def finite(value):
    """Persist interoperable JSON: undefined statistical values are null, never 0."""
    if isinstance(value, dict):
        return {str(key): finite(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [finite(item) for item in value]
    if hasattr(value, 'tolist'):
        return finite(value.tolist())
    if isinstance(value, float) and not math.isfinite(value):
        return None
    return value


def _names(dataset, selected, minimum=1, maximum=MAX_COLUMNS):
    available = {column['name'] for column in dataset['columns']}
    if not selected or not minimum <= len(selected) <= maximum or len(set(selected)) != len(selected) or any(name not in available for name in selected):
        fail(f'서로 다른 유효 컬럼 {minimum}~{maximum}개를 선택하세요.')
    return selected


def _numeric(value):
    from backend.analytics import number
    result = number(value)
    if result is not None and abs(result) > 1e50:
        fail('고급 통계 계산 범위를 넘는 값이 있습니다. 절댓값 1e50 이하가 되도록 단위를 변환하세요.')
    return result


def _matrix(dataset, selected, minimum=3):
    import numpy as np
    _names(dataset, selected, maximum=MAX_COLUMNS+1)
    values, indices = [], []
    for index, row in enumerate(dataset['rows']):
        line = [_numeric(row.get(name)) for name in selected]
        if all(value is not None for value in line):
            values.append(line)
            indices.append(index + 1)
    if len(values) < minimum:
        fail(f'선택 컬럼의 결측·비수치 값을 제외한 유효 행이 {minimum}개 이상 필요합니다.')
    return np.asarray(values, dtype=float), indices


def _groups(dataset, value, group, minimum_groups=2, maximum_groups=20):
    import numpy as np
    _names(dataset, [value, group], minimum=2)
    groups = defaultdict(list)
    for row in dataset['rows']:
        amount, category = _numeric(row.get(value)), row.get(group)
        if amount is not None and category not in (None, ''):
            groups[str(category)].append(amount)
    if not minimum_groups <= len(groups) <= maximum_groups:
        fail(f'유효한 그룹 {minimum_groups}~{maximum_groups}개가 필요합니다.')
    if any(len(values) < 2 for values in groups.values()):
        fail('각 그룹에 유효한 수치 관측이 2개 이상 필요합니다.')
    return {name: np.asarray(groups[name], dtype=float) for name in sorted(groups)}


def _decision(p, confidence, subject='차이'):
    if p is None or not math.isfinite(float(p)):
        return '통계량을 계산할 수 없습니다. 표본 수와 분산을 확인하세요.'
    alpha = 1 - confidence
    if p < alpha:
        return f'유의수준 {alpha:g}에서 {subject}에 대한 귀무가설을 기각합니다. 효과크기와 신뢰구간을 함께 해석하세요.'
    return f'유의수준 {alpha:g}에서 {subject}에 대한 귀무가설을 기각하지 못했습니다. 이것이 차이나 관련성이 없다는 증명은 아닙니다.'


def _base(dataset, spec):
    import scipy
    import numpy
    return {
        'advanced': True, 'schema_version': 1, 'title': METHODS[spec['method']],
        'summary': [], 'tables': [], 'rows': [], 'interpretation': [], 'warnings': [],
        'assumptions': ['관측의 독립성과 표본의 대표성은 연구 설계에서 확인해야 합니다.'],
        'sample': {'total': len(dataset['rows']), 'used': 0, 'excluded': 0, 'policy': '선택 컬럼의 결측·비수치 행 제외'},
        'parameters': {key: value for key, value in spec.items() if key != 'dataset_id' and value is not None},
        'engine': {'numpy': numpy.__version__, 'scipy': scipy.__version__},
        'source': {'dataset_id': dataset.get('id'), 'queried_at': dataset.get('queried_at'),
                   'truncated': bool(dataset.get('truncated')), 'available_rows': len(dataset['rows'])},
    }


def _used(result, count, policy=None):
    result['sample'].update(used=int(count), excluded=result['sample']['total'] - int(count))
    if policy:
        result['sample']['policy'] = policy


def _summary(result, **values):
    result['summary'].extend({'label': key, 'value': value} for key, value in values.items())


def _group_table(groups):
    import numpy as np
    return table('groups', '그룹별 기술통계', [('name', '그룹'), ('n', '유효 N'), ('mean', '평균'), ('stddev', '표준편차'), ('median', '중앙값')],
                 [{'name': name, 'n': len(values), 'mean': np.mean(values), 'stddev': np.std(values, ddof=1), 'median': np.median(values)} for name, values in groups.items()])


def _descriptive(dataset, spec, result):
    import numpy as np
    from scipy import stats
    selected = _names(dataset, spec.get('columns'))
    confidence = spec.get('confidence', .95)
    entries, normality = [], []
    any_valid = set()
    for name in selected:
        values = []
        for index, row in enumerate(dataset['rows']):
            value = _numeric(row.get(name))
            if value is not None:
                values.append(value)
                any_valid.add(index)
        x = np.asarray(values)
        n = len(x)
        if n:
            mean = np.mean(x)
            sd = np.std(x, ddof=1) if n > 1 else None
            margin = stats.t.ppf((1 + confidence) / 2, n - 1) * sd / math.sqrt(n) if n > 1 else None
            entries.append(dict(name=name, n=n, missing=len(dataset['rows']) - n, mean=mean, stddev=sd,
                                se=sd / math.sqrt(n) if sd is not None else None,
                                ci_low=mean - margin if margin is not None else None, ci_high=mean + margin if margin is not None else None,
                                min=np.min(x), q1=np.quantile(x, .25), median=np.median(x), q3=np.quantile(x, .75), max=np.max(x),
                                skew=stats.skew(x, bias=False) if n >= 3 and sd else None,
                                kurtosis=stats.kurtosis(x, bias=False) if n >= 4 and sd else None))
            if spec['method'] == 'normality':
                sample = x if n <= 5000 else x[np.sort(np.random.default_rng(SEED).choice(n, 5000, replace=False))]
                w, p = stats.shapiro(sample) if n >= 3 and sd else (None, None)
                k2, kp = stats.normaltest(x) if n >= 8 and sd else (None, None)
                normality.append(dict(name=name, n=n, shapiro_n=len(sample), statistic=w, p_value=p, omnibus=k2, omnibus_p=kp,
                                      conclusion='정규성 기각' if p is not None and p < 1 - confidence else '정규성 기각 못함' if p is not None else '계산 불가'))
                if n > 5000:
                    result['warnings'].append(f'{name}: Shapiro–Wilk는 고정 난수 시드로 선택한 5,000행 표본만 사용합니다. 기술통계·D’Agostino 검정은 전체 유효 행을 사용합니다.')
        else:
            entries.append(dict(name=name, n=0, missing=len(dataset['rows'])))
            result['warnings'].append(f'{name}: 유효한 수치가 없습니다.')
    _used(result, len(any_valid), '컬럼별 결측·비수치 제외; 사용 행은 선택 컬럼 중 하나 이상 유효한 행, 각 통계의 N은 표에 표시')
    result['tables'].append(table('descriptive', '기술통계와 평균의 신뢰구간', [
        ('name', '컬럼'), ('n', '유효 N'), ('missing', '제외'), ('mean', '평균'), ('stddev', '표준편차'), ('se', '표준오차'),
        ('ci_low', '평균 CI 하한'), ('ci_high', '평균 CI 상한'), ('min', '최소'), ('q1', 'Q1'), ('median', '중앙값'), ('q3', 'Q3'), ('max', '최대'), ('skew', '왜도'), ('kurtosis', '초과첨도')], entries))
    result['rows'] = entries
    if normality:
        result['tables'].insert(0, table('normality', '정규성 검정', [('name', '컬럼'), ('n', '유효 N'), ('shapiro_n', 'Shapiro N'), ('statistic', 'Shapiro W'), ('p_value', 'p'), ('omnibus', 'D’Agostino K²'), ('omnibus_p', 'K² p'), ('conclusion', '판단')], normality))
        result['interpretation'].append('정규성 검정의 작은 p값은 정규분포 가정과의 불일치를 뜻합니다. 큰 표본의 작은 이탈과 작은 표본의 낮은 검정력을 함께 고려하세요.')
    else:
        result['interpretation'].append(f'평균의 {confidence * 100:g}% 신뢰구간은 t 분포를 사용합니다. 표본이 작고 심하게 비대칭이면 구간 해석에 주의하세요.')
    result['assumptions'].append('평균 신뢰구간은 독립 표본과 평균의 정규 근사에 기반합니다. 표준편차는 표본 표준편차(N−1)입니다.')


def _ttest(dataset, spec, result):
    import numpy as np
    from scipy import stats
    method, confidence = spec['method'], spec.get('confidence', .95)
    value, second = spec.get('value'), spec.get('value2')
    null_mean = spec.get('null_mean', 0)
    if method == 'ttest_ind':
        groups = _groups(dataset, value, spec.get('group_by'), maximum_groups=2)
        left, right = groups.values()
        if np.var(left) == 0 and np.var(right) == 0:
            fail('두 그룹 모두 상수여서 t 검정을 계산할 수 없습니다.')
        test = stats.ttest_ind(left, right, equal_var=False)
        difference = np.mean(left) - np.mean(right)
        pooled = math.sqrt(((len(left)-1)*np.var(left, ddof=1)+(len(right)-1)*np.var(right, ddof=1))/(len(left)+len(right)-2))
        effect = difference / pooled if pooled else None
        correction = 1 - 3 / (4 * (len(left) + len(right)) - 9)
        effect = effect * correction if effect is not None else None
        effect_name = 'Hedges g (정렬된 첫 그룹 − 둘째 그룹)'
        _used(result, len(left) + len(right), '그룹 또는 수치가 결측인 행 제외; 그룹 이름 오름차순 비교')
        result['tables'].append(_group_table(groups))
        result['assumptions'].append('독립된 두 그룹; Welch 방식으로 등분산을 가정하지 않습니다. Hedges g는 합동 표준편차 기준입니다.')
    else:
        matrix, _ = _matrix(dataset, [value, second] if method == 'ttest_paired' else [value])
        x = matrix[:, 0] - matrix[:, 1] if method == 'ttest_paired' else matrix[:, 0]
        if np.std(x, ddof=1) == 0:
            fail('관측값 또는 대응 차이의 분산이 0이어서 t 검정을 계산할 수 없습니다.')
        null_mean = 0 if method == 'ttest_paired' else null_mean
        test = stats.ttest_1samp(x, popmean=null_mean)
        difference = np.mean(x) - null_mean
        effect = difference / np.std(x, ddof=1)
        effect_name = 'Cohen dz (첫 컬럼 − 둘째 컬럼)' if method == 'ttest_paired' else 'Cohen d'
        _used(result, len(x))
        result['assumptions'].append('대응표본은 같은 행의 두 측정치를 짝으로 사용하며 차이의 분포를 검정합니다.' if method == 'ttest_paired' else '일표본 평균을 지정한 기준 평균과 비교합니다.')
    ci = test.confidence_interval(confidence)
    # scipy's one-sample interval is for the mean, not mean minus the null.
    lower, upper = (ci.low - null_mean, ci.high - null_mean) if method == 'ttest_one' else (ci.low, ci.high)
    row = dict(name='평균 차이', value=difference, statistic=test.statistic, df=test.df, p_value=test.pvalue,
               ci_low=lower, ci_high=upper, effect=effect, effect_name=effect_name)
    result['rows'] = [row]
    result['tables'].insert(0, table('test', '양측 t 검정', [('name', '측정'), ('value', '평균 차이'), ('statistic', 't'), ('df', '자유도'), ('p_value', 'p'), ('ci_low', '차이 CI 하한'), ('ci_high', '차이 CI 상한'), ('effect', '효과크기'), ('effect_name', '효과 정의')], [row]))
    result['interpretation'].append(_decision(test.pvalue, confidence))


def _group_tests(dataset, spec, result):
    import numpy as np
    import statsmodels
    from scipy import stats
    from statsmodels.stats.multitest import multipletests
    method, confidence = spec['method'], spec.get('confidence', .95)
    result['engine']['statsmodels'] = statsmodels.__version__
    groups = _groups(dataset, spec.get('value'), spec.get('group_by'), maximum_groups=2 if method == 'mannwhitney' else 20)
    arrays = list(groups.values())
    count, k = sum(map(len, arrays)), len(groups)
    if np.ptp(np.concatenate(arrays)) == 0:
        fail('모든 그룹의 값이 같아 그룹 비교를 계산할 수 없습니다.')
    _used(result, count, '그룹 또는 수치가 결측인 행 제외')
    result['tables'].append(_group_table(groups))
    if method == 'anova':
        from statsmodels.stats.multicomp import pairwise_tukeyhsd
        stat, p = stats.f_oneway(*arrays)
        grand = np.mean(np.concatenate(arrays))
        between = sum(len(x) * (np.mean(x) - grand) ** 2 for x in arrays)
        within = sum(np.sum((x - np.mean(x)) ** 2) for x in arrays)
        if within == 0:
            fail('모든 그룹 내 분산이 0이므로 분산분석을 계산할 수 없습니다.')
        mse = within / (count - k)
        eta = between / (between + within)
        omega = max(0, (between - (k - 1) * mse) / (between + within + mse))
        levene_stat, levene_p = stats.levene(*arrays, center='median')
        result['tables'].append(table('variance', '분산분석표', [('name', '요인'), ('ss', '제곱합'), ('df', '자유도'), ('ms', '평균제곱'), ('statistic', 'F'), ('p_value', 'p')], [
            {'name': '그룹 간', 'ss': between, 'df': k-1, 'ms': between/(k-1), 'statistic': stat, 'p_value': p},
            {'name': '그룹 내', 'ss': within, 'df': count-k, 'ms': mse},
            {'name': '합계', 'ss': between+within, 'df': count-1}]))
        labels = np.concatenate([[name]*len(x) for name, x in groups.items()])
        posthoc = pairwise_tukeyhsd(np.concatenate(arrays), labels, alpha=1-confidence)
        pairs = list(combinations(list(posthoc.groupsunique), 2))
        post = [dict(group1=str(a), group2=str(b), difference=posthoc.meandiffs[i], p_adjusted=posthoc.pvalues[i],
                     ci_low=posthoc.confint[i, 0], ci_high=posthoc.confint[i, 1], reject=bool(posthoc.reject[i])) for i, (a, b) in enumerate(pairs)]
        result['tables'].append(table('posthoc', 'Tukey HSD 사후검정 · 둘째 그룹 − 첫 그룹', [('group1', '첫 그룹'), ('group2', '둘째 그룹'), ('difference', '평균 차이'), ('p_adjusted', '보정 p'), ('ci_low', 'CI 하한'), ('ci_high', 'CI 상한'), ('reject', '기각')], post))
        _summary(result, **{'F': stat, 'p': p, 'η²': eta, 'ω²': omega, 'Brown–Forsythe p': levene_p})
        if math.isfinite(levene_p) and levene_p < 1-confidence:
            result['warnings'].append('등분산 가정이 의심됩니다. 일반 ANOVA·Tukey 결과를 주의해 해석하고 순위 기반 검정 또는 적절한 이분산 모형을 검토하세요.')
        result['assumptions'].append('일반 일원 ANOVA와 Tukey HSD는 독립성·잔차 정규성·등분산을 가정합니다. 사후검정 p값과 구간은 다중 비교를 보정합니다.')
        effect, effect_name = eta, 'eta squared'
    elif method == 'mannwhitney':
        stat, p = stats.mannwhitneyu(arrays[0], arrays[1], alternative='two-sided', method='auto')
        effect, effect_name = 2 * stat / (len(arrays[0])*len(arrays[1])) - 1, 'rank-biserial (첫 그룹 기준)'
        result['assumptions'].append('독립된 두 그룹의 분포를 비교합니다. 분포 모양이 다르면 중앙값 차이로만 해석하지 않습니다. 동률은 SciPy auto 정책을 따릅니다.')
    else:
        stat, p = stats.kruskal(*arrays)
        effect, effect_name = max(0, (stat-k+1)/(count-k)), 'epsilon squared'
        post = []
        for left, right in combinations(groups, 2):
            test = stats.mannwhitneyu(groups[left], groups[right], alternative='two-sided', method='auto')
            post.append(dict(group1=left, group2=right, statistic=test.statistic, p_value=test.pvalue))
        adjusted = multipletests([row['p_value'] for row in post], alpha=1-confidence, method='holm')[1]
        for row, adjusted_p in zip(post, adjusted):
            row['p_adjusted'] = adjusted_p
        result['tables'].append(table('posthoc', '쌍별 Mann–Whitney · Holm 보정 (Dunn 검정 아님)', [('group1', '첫 그룹'), ('group2', '둘째 그룹'), ('statistic', 'U'), ('p_value', '원 p'), ('p_adjusted', 'Holm p')], post))
        result['assumptions'].append('독립 그룹의 순위 분포를 비교합니다. 분포 형태가 같을 때 위치 차이로 해석할 수 있습니다.')
    result['rows'] = [dict(name='그룹 비교', value=stat, p_value=p, effect=effect, effect_name=effect_name)]
    result['tables'].insert(0, table('test', '전체 그룹 비교', [('name', '검정'), ('value', '통계량'), ('p_value', 'p'), ('effect', '효과크기'), ('effect_name', '효과 정의')], result['rows']))
    result['interpretation'].append(_decision(p, confidence, '그룹 차이'))


def _wilcoxon(dataset, spec, result):
    import numpy as np
    from scipy import stats
    matrix, _ = _matrix(dataset, [spec.get('value'), spec.get('value2')])
    differences = matrix[:, 0] - matrix[:, 1]
    nonzero = differences[differences != 0]
    if len(nonzero) < 3:
        fail('0이 아닌 대응 차이가 3개 이상 필요합니다.')
    test = stats.wilcoxon(differences, zero_method='wilcox', alternative='two-sided', method='auto')
    ranks = stats.rankdata(np.abs(nonzero))
    effect = (np.sum(ranks[nonzero > 0]) - np.sum(ranks[nonzero < 0])) / np.sum(ranks)
    _used(result, len(matrix))
    result['rows'] = [dict(name='대응 차이', value=np.median(differences), statistic=test.statistic, p_value=test.pvalue, effect=effect, zero_differences=len(matrix)-len(nonzero))]
    result['tables'].append(table('test', 'Wilcoxon 양측 부호순위 검정', [('name', '측정'), ('value', '차이 중앙값'), ('statistic', 'W'), ('p_value', 'p'), ('effect', '순위 이분 상관'), ('zero_differences', '0 차이 제외')], result['rows']))
    result['interpretation'].append(_decision(test.pvalue, spec.get('confidence', .95), '대응 차이'))
    result['assumptions'].append('같은 행이 대응 쌍이어야 하며 차이 분포의 대칭성을 가정합니다. 차이가 0인 쌍은 순위 검정에서 제외합니다.')


def _chi_square(dataset, spec, result):
    import numpy as np
    from scipy import stats
    left, right = _names(dataset, [spec.get('group_by'), spec.get('value')], minimum=2)
    pairs = [(str(row[left]), str(row[right])) for row in dataset['rows'] if row.get(left) not in (None, '') and row.get(right) not in (None, '')]
    levels1, levels2 = sorted({a for a, _ in pairs}), sorted({b for _, b in pairs})
    if not 2 <= len(levels1) <= 30 or not 2 <= len(levels2) <= 30:
        fail('교차표의 각 컬럼은 결측 제외 후 2~30개의 범주가 필요합니다.')
    counts = np.zeros((len(levels1), len(levels2)), dtype=int)
    li, ri = {v:i for i,v in enumerate(levels1)}, {v:i for i,v in enumerate(levels2)}
    for a, b in pairs:
        counts[li[a], ri[b]] += 1
    stat, p, df, expected = stats.chi2_contingency(counts, correction=False)
    cramers = math.sqrt(stat/(len(pairs)*min(len(levels1)-1, len(levels2)-1)))
    _used(result, len(pairs), '두 범주 중 결측이 있는 행 제외; 수치처럼 보이는 범주도 문자열 수준으로 처리')
    observed = [dict(row=a, column=b, observed=int(counts[i,j]), expected=expected[i,j], pearson_residual=(counts[i,j]-expected[i,j])/math.sqrt(expected[i,j])) for i,a in enumerate(levels1) for j,b in enumerate(levels2)]
    result['tables'].append(table('contingency', '관측·기대 빈도', [('row', left), ('column', right), ('observed', '관측'), ('expected', '기대'), ('pearson_residual', 'Pearson 잔차')], observed))
    result['rows'] = [dict(name='독립성', value=stat, df=df, p_value=p, cramers_v=cramers)]
    result['tables'].insert(0, table('test', 'Pearson 카이제곱 · 연속성 보정 없음', [('name', '검정'), ('value', 'χ²'), ('df', '자유도'), ('p_value', 'p'), ('cramers_v', 'Cramér V')], result['rows']))
    if counts.shape == (2,2):
        odds, fisher_p = stats.fisher_exact(counts, alternative='two-sided')
        _summary(result, **{'Fisher 정확검정 p': fisher_p, '표본 오즈비': odds})
    sparse = int(np.sum(expected < 5))
    if sparse:
        result['warnings'].append(f'기대빈도 5 미만 셀이 {sparse}/{counts.size}개입니다. 카이제곱 근사의 적합성을 확인하세요. 2×2 표는 Fisher 정확검정도 제공합니다.')
    result['interpretation'].append(_decision(p, spec.get('confidence', .95), '두 범주의 독립성'))
    result['assumptions'].append('각 행은 독립된 하나의 관측이며 빈도를 집계합니다. 원본의 빈도 컬럼을 자동 가중치로 사용하지 않습니다.')


def _correlation(dataset, spec, result):
    import numpy as np
    import statsmodels
    from scipy import stats
    from statsmodels.stats.multitest import multipletests
    selected = _names(dataset, spec.get('columns'), minimum=2)
    result['engine']['statsmodels'] = statsmodels.__version__
    confidence, kind = spec.get('confidence', .95), spec.get('correlation_kind', 'pearson')
    if kind not in ('pearson', 'spearman'):
        fail('Pearson 또는 Spearman 방식을 선택하세요.')
    pairs, used = [], set()
    for left, right in combinations(selected, 2):
        valid = []
        for index, row in enumerate(dataset['rows']):
            x, y = _numeric(row.get(left)), _numeric(row.get(right))
            if x is not None and y is not None:
                valid.append((x,y)); used.add(index)
        n = len(valid)
        coefficient = p = low = high = None
        if n >= 4:
            matrix = np.asarray(valid)
            if np.ptp(matrix[:,0]) and np.ptp(matrix[:,1]):
                if kind == 'pearson':
                    test = stats.pearsonr(matrix[:,0], matrix[:,1])
                    coefficient, p = test.statistic, test.pvalue
                    ci = test.confidence_interval(confidence)
                    low, high = ci.low, ci.high
                else:
                    test = stats.spearmanr(matrix[:,0], matrix[:,1])
                    coefficient, p = test.statistic, test.pvalue
        pairs.append(dict(name=f'{left} × {right}', x=left, y=right, n=n, value=coefficient, p_value=p, ci_low=low, ci_high=high))
    finite_rows = [row for row in pairs if row['p_value'] is not None]
    if finite_rows:
        for row, p in zip(finite_rows, multipletests([row['p_value'] for row in finite_rows], method='holm')[1]):
            row['p_adjusted'] = p
    _used(result, len(used), '쌍별 완전 관측; 표의 각 쌍 N을 사용하며 전체 사용 행은 유효한 쌍에 속한 행의 합집합')
    result['rows'] = pairs
    result['tables'].append(table('correlation', f'{kind.title()} 상관 검정 · 양측', [('x', '컬럼 1'), ('y', '컬럼 2'), ('n', '쌍 N'), ('value', '상관계수'), ('p_value', 'p'), ('p_adjusted', 'Holm p'), ('ci_low', 'CI 하한'), ('ci_high', 'CI 상한')], pairs))
    result['interpretation'].append('계수는 관련성의 방향과 크기를 나타냅니다. 여러 쌍을 비교할 때 Holm 보정 p값을 사용하세요. 상관관계만으로 인과를 판단할 수 없습니다.')
    result['assumptions'].append('Pearson 구간은 Fisher z 근사이며 쌍별 4행 이상과 두 변수의 변동이 필요합니다.' if kind == 'pearson' else 'Spearman은 순위의 단조 관계입니다. p값은 점근 근사이며 작은 표본에서 신중히 해석하세요. Spearman 신뢰구간은 제공하지 않습니다.')


def _regression(dataset, spec, result):
    import numpy as np
    import sklearn
    import statsmodels
    import statsmodels.api as sm
    from scipy import stats
    from statsmodels.stats.diagnostic import het_breuschpagan
    from statsmodels.stats.stattools import durbin_watson
    from statsmodels.stats.outliers_influence import variance_inflation_factor
    from statsmodels.tools.sm_exceptions import PerfectSeparationError, PerfectSeparationWarning, ConvergenceWarning
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, roc_auc_score, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, log_loss
    dependent = spec.get('value')
    predictors = _names(dataset, spec.get('columns'))
    if dependent in predictors:
        fail('종속변수는 설명변수 목록에서 제외하세요.')
    matrix, indices = _matrix(dataset, [dependent, *predictors], minimum=max(8, len(predictors)+4))
    y, x = matrix[:,0], matrix[:,1:]
    if np.ptp(y) == 0 or np.any(np.ptp(x, axis=0) == 0):
        fail('종속변수·설명변수에 상수 컬럼이 있습니다. 변동이 있는 컬럼을 선택하세요.')
    design = sm.add_constant(x, has_constant='add')
    if np.linalg.matrix_rank(design) < design.shape[1]:
        fail('설명변수에 완전 다중공선성이 있습니다. 중복·선형 결합 컬럼을 제거하세요.')
    n, p = len(y), len(predictors)
    confidence = spec.get('confidence', .95)
    logistic = spec['method'] == 'logistic'
    if logistic and set(np.unique(y)) != {0.,1.}:
        fail('이항 로지스틱 회귀의 종속변수는 수치 0과 1 두 값이어야 합니다.')
    if logistic and min(np.bincount(y.astype(int))) < max(5, p+1):
        fail('각 종속 범주의 관측 수가 설명변수 수+1 이상이고 최소 5개여야 합니다.')
    if logistic:
        model = sm.Logit(y, design).fit(disp=False, maxiter=100)
        if not model.mle_retvals.get('converged') or not np.all(np.isfinite(model.bse)):
            fail('로지스틱 모형이 안정적으로 수렴하지 않았습니다. 분리·희소 범주·다중공선성을 확인하세요.')
        predicted = model.predict(design)
        if np.any(np.abs(model.params) > 1e6) or np.max(model.bse) > 1e6 or np.all((predicted >= .5) == y):
            fail('완전·준완전 분리가 의심되어 유효한 비정규화 로지스틱 추론을 제공할 수 없습니다.')
        _summary(result, **{'McFadden pseudo R²': model.prsquared, '로그우도': model.llf, '우도비 p': model.llr_pvalue, 'AIC': model.aic, 'BIC': model.bic})
        result['assumptions'].append('이항 0/1 종속변수와 연속형 설명변수의 비정규화 최대우도 Logit입니다. 로짓의 선형성·분리 여부·사건 수를 확인하세요.')
    else:
        robust = spec.get('robust', True)
        model = sm.OLS(y, design).fit(cov_type='HC3' if robust else 'nonrobust')
        predicted = model.predict(design)
        _summary(result, **{'R²': model.rsquared, '수정 R²': model.rsquared_adj, '잔차 자유도': model.df_resid, '모형 p': model.f_pvalue, 'AIC': model.aic, 'BIC': model.bic})
        jb = stats.jarque_bera(model.resid)
        bp = het_breuschpagan(model.resid, design)
        result['tables'].append(table('diagnostics', '회귀 진단', [('name','진단'),('value','값'),('p_value','p')], [
            {'name':'Jarque–Bera 잔차 정규성','value':jb.statistic,'p_value':jb.pvalue},
            {'name':'Breusch–Pagan 이분산','value':bp[0],'p_value':bp[1]},
            {'name':'Durbin–Watson (입력 행 순서)','value':durbin_watson(model.resid)},
            {'name':'설계행렬 조건수','value':model.condition_number}]))
        result['assumptions'].append('선형·가산 관계와 독립 관측을 가정합니다. 기본 HC3 표준오차는 이분산에 강건하며 통계량은 점근 z입니다. 일반 표준오차를 선택하면 t 분포를 사용합니다.')
        if model.condition_number > 1e8:
            result['warnings'].append('설계행렬 조건수가 큽니다. 변수 단위와 다중공선성을 확인하세요.')
    intervals = model.conf_int(alpha=1-confidence)
    coefficients = []
    for i, name in enumerate(['절편', *predictors]):
        row = dict(name=name, value=model.params[i], std_error=model.bse[i], statistic=model.tvalues[i], p_value=model.pvalues[i], ci_low=intervals[i,0], ci_high=intervals[i,1])
        if logistic:
            row.update(odds_ratio=np.exp(model.params[i]), odds_low=np.exp(intervals[i,0]), odds_high=np.exp(intervals[i,1]))
        elif i:
            row['vif'] = variance_inflation_factor(design, i)
        coefficients.append(row)
    columns = [('name','변수'),('value','계수'),('std_error','표준오차'),('statistic','z' if logistic or spec.get('robust',True) else 't'),('p_value','p'),('ci_low','CI 하한'),('ci_high','CI 상한')]
    columns += [('odds_ratio','오즈비'),('odds_low','OR 하한'),('odds_high','OR 상한')] if logistic else [('vif','VIF')]
    result['tables'].insert(0, table('coefficients', '전체 유효 표본 적합 · 회귀계수', columns, coefficients))
    result['rows'] = coefficients
    _used(result, n)
    result['engine']['statsmodels'] = statsmodels.__version__
    result['engine']['scikit-learn'] = sklearn.__version__
    # Train-only fit and train-only standardization prevent holdout leakage.
    if n >= max(30, 5*(p+1)):
        train, test = train_test_split(np.arange(n), test_size=spec.get('test_fraction',.25), random_state=SEED, stratify=y if logistic else None)
        mean, scale = np.mean(x[train],axis=0), np.std(x[train],axis=0)
        if np.any(scale == 0):
            result['warnings'].append('훈련 분할에 상수 설명변수가 있어 홀드아웃 검증을 생략했습니다.')
        else:
            train_x, test_x = sm.add_constant((x[train]-mean)/scale,has_constant='add'), sm.add_constant((x[test]-mean)/scale,has_constant='add')
            try:
                if np.linalg.matrix_rank(train_x) < train_x.shape[1]:
                    raise ValueError('singular training split')
                # A bad training split must not invalidate stable full-sample
                # inference; fail only this validation fit and disclose it.
                with warnings.catch_warnings():
                    warnings.simplefilter('error', PerfectSeparationWarning)
                    warnings.simplefilter('error', ConvergenceWarning)
                    validation = sm.Logit(y[train],train_x).fit(disp=False,maxiter=100) if logistic else sm.OLS(y[train],train_x).fit()
                if logistic and not validation.mle_retvals.get('converged'):
                    raise ValueError('nonconverged training split')
                estimated = validation.predict(test_x)
                if not np.all(np.isfinite(estimated)):
                    raise ValueError('invalid prediction')
                scores = {'훈련 N':len(train),'검증 N':len(test)}
                if logistic:
                    labels = (estimated >= .5).astype(int)
                    scores.update({'ROC AUC':roc_auc_score(y[test],estimated),'정확도':accuracy_score(y[test],labels),'정밀도':precision_score(y[test],labels,zero_division=0),
                                   '재현율':recall_score(y[test],labels,zero_division=0),'F1':f1_score(y[test],labels,zero_division=0),'Log loss':log_loss(y[test],estimated,labels=[0,1])})
                    cm = confusion_matrix(y[test],labels,labels=[0,1])
                    result['tables'].append(table('confusion','검증 표본 혼동행렬 · 임계값 0.5',[('actual','실제'),('predicted_0','예측 0'),('predicted_1','예측 1')],
                                                  [{'actual':i,'predicted_0':int(cm[i,0]),'predicted_1':int(cm[i,1])} for i in range(2)]))
                else:
                    scores.update({'RMSE':math.sqrt(mean_squared_error(y[test],estimated)),'MAE':mean_absolute_error(y[test],estimated),'검증 R²':r2_score(y[test],estimated)})
                result['tables'].append(table('validation','별도 훈련 모형의 홀드아웃 성능 · 고정 시드 1729',[('name','지표'),('value','값')],[{'name':k,'value':v} for k,v in scores.items()]))
            except (ValueError, np.linalg.LinAlgError, PerfectSeparationError, PerfectSeparationWarning, ConvergenceWarning):
                result['warnings'].append('훈련 분할 모형이 식별·수렴 조건을 충족하지 않아 홀드아웃 성능을 제공하지 않습니다. 전체 표본 적합도와 검증 성능은 다릅니다.')
    else:
        result['warnings'].append(f'홀드아웃 검증은 최소 {max(30,5*(p+1))}개의 유효 행에서 제공합니다. 현재 표의 계수·적합도는 전체 표본 적합 결과입니다.')
    detail = [dict(source_row=indices[i], observed=y[i], fitted=predicted[i], residual=y[i]-predicted[i]) for i in range(min(n,MAX_DETAIL_ROWS))]
    result['tables'].append(table('predictions','전체 표본 적합값·잔차 (검증 예측 아님)',[('source_row','원본 행'),('observed','관측'),('fitted','적합'),('residual','잔차')],detail))
    if n > MAX_DETAIL_ROWS:
        result['warnings'].append(f'적합값·잔차 출력은 앞 {MAX_DETAIL_ROWS:,}행이며 모형은 전체 유효 {n:,}행으로 적합했습니다.')
    result['interpretation'].append('계수는 나머지 설명변수가 일정할 때의 조건부 관련성입니다. 전체 표본 추론과 별도 훈련 모형의 홀드아웃 성능을 구분하고 인과효과로 해석하지 마세요.')


def _multivariate(dataset, spec, result):
    import numpy as np
    import sklearn
    from sklearn.preprocessing import StandardScaler
    from sklearn.decomposition import PCA
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    selected = _names(dataset,spec.get('columns'),minimum=2)
    x, indices = _matrix(dataset,selected,minimum=max(5,len(selected)+1))
    if np.any(np.std(x,axis=0) == 0):
        fail('상수 컬럼은 다변량 분석에서 제외하세요.')
    n,p = x.shape
    _used(result,n)
    result['engine']['scikit-learn'] = sklearn.__version__
    method = spec['method']
    if method == 'reliability':
        variances = np.var(x,axis=0,ddof=1)
        total = np.sum(x,axis=1)
        total_var = np.var(total,ddof=1)
        if total_var <= 0:
            fail('합산 점수의 분산이 0이므로 Cronbach α를 계산할 수 없습니다.')
        alpha = p/(p-1)*(1-np.sum(variances)/total_var)
        items=[]
        for i,name in enumerate(selected):
            rest = total-x[:,i]
            rest_var = np.var(rest,ddof=1)
            corrected = np.corrcoef(x[:,i],rest)[0,1] if rest_var else None
            deleted = (p-1)/(p-2)*(1-(np.sum(variances)-variances[i])/rest_var) if p>2 and rest_var else None
            items.append(dict(name=name,value=np.mean(x[:,i]),stddev=np.std(x[:,i],ddof=1),corrected_item_total=corrected,alpha_deleted=deleted))
        _summary(result,**{'Cronbach α':alpha,'문항 수':p,'유효 N':n})
        result['rows']=items
        result['tables'].append(table('items','문항 통계',[('name','문항'),('value','평균'),('stddev','표준편차'),('corrected_item_total','수정 문항-총점 상관'),('alpha_deleted','문항 제거 α')],items))
        result['interpretation'].append('α는 문항의 내적 일관성 지표이며 단일 차원성이나 타당성을 보장하지 않습니다. 역문항은 사용자가 사전에 동일 방향으로 재코딩해야 합니다.')
        result['assumptions'].append('원점수 기반 Cronbach α입니다. 동일 척도·문항 방향을 확인하세요. 음수 α는 부호 불일치나 데이터 문제를 시사하며 0으로 보정하지 않습니다.')
        return
    standardize = spec.get('standardize',True)
    scaler = StandardScaler().fit(x)
    z = scaler.transform(x) if standardize else x
    if method == 'pca':
        count = spec.get('components',2)
        if not 1 <= count <= min(p,n):
            fail('주성분 수는 선택 컬럼 수와 유효 행 수 이하여야 합니다.')
        model = PCA(n_components=count,svd_solver='full')
        scores = model.fit_transform(z)
        rows=[dict(name=f'PC{i+1}',value=model.explained_variance_ratio_[i],eigenvalue=model.explained_variance_[i],cumulative=np.sum(model.explained_variance_ratio_[:i+1])) for i in range(count)]
        loadings=[{'name':name,**{f'PC{i+1}':model.components_[i,j] for i in range(count)}} for j,name in enumerate(selected)]
        score_rows=[{'source_row':indices[i],**{f'PC{j+1}':scores[i,j] for j in range(count)}} for i in range(min(n,MAX_DETAIL_ROWS))]
        result['rows']=rows
        result['tables']=[table('variance','설명분산',[('name','주성분'),('eigenvalue','고유값'),('value','설명 비율'),('cumulative','누적 비율')],rows),
                          table('loadings','성분 가중치 · 단위 고유벡터',[('name','컬럼'),*[(f'PC{i+1}',f'PC{i+1}') for i in range(count)]],loadings),
                          table('scores','관측별 주성분 점수',[('source_row','원본 행'),*[(f'PC{i+1}',f'PC{i+1}') for i in range(count)]],score_rows)]
        result['interpretation'].append('주성분은 분산을 많이 설명하는 직교 선형 결합입니다. 설명 비율과 가중치를 함께 확인하세요. 성분의 부호는 통계적 의미를 바꾸지 않습니다.')
    else:
        k=spec.get('clusters',3)
        if not 2 <= k <= min(10,n-1) or len(np.unique(z,axis=0))<k:
            fail('군집 수는 2~10개이며 고유 관측 수 이하, 전체 유효 행 수 미만이어야 합니다.')
        model=KMeans(n_clusters=k,random_state=SEED,n_init=10,max_iter=300,algorithm='lloyd')
        labels=model.fit_predict(z)
        if len(np.unique(labels))!=k:
            fail('요청한 군집 수를 분리하지 못했습니다. 중복 관측과 군집 수를 확인하세요.')
        centers=scaler.inverse_transform(model.cluster_centers_) if standardize else model.cluster_centers_
        sample_n=min(n,2000)
        # Include all groups when sampling, then fill deterministically.
        rng=np.random.default_rng(SEED)
        chosen=[int(np.flatnonzero(labels==i)[0]) for i in range(k)]
        rest=np.setdiff1d(np.arange(n),chosen)
        chosen=np.asarray(chosen+list(rng.choice(rest,sample_n-k,replace=False)))
        score=silhouette_score(z[chosen],labels[chosen]) if len(chosen)>k else None
        rows=[dict(name=f'군집 {i+1}',value=int(np.sum(labels==i))) for i in range(k)]
        center_rows=[{**rows[i],**{f'feature_{j}':centers[i,j] for j in range(p)}} for i in range(k)]
        assignments=[{'source_row':indices[i],'cluster':int(labels[i])+1,'distance':float(np.linalg.norm(z[i]-model.cluster_centers_[labels[i]]))} for i in range(min(n,MAX_DETAIL_ROWS))]
        result['rows']=rows
        result['tables']=[table('centers','군집별 크기·중심 (원 단위)',[('name','군집'),('value','관측 수'),*[(f'feature_{i}',name) for i,name in enumerate(selected)]],center_rows),
                          table('assignments','관측별 군집 배정',[('source_row','원본 행'),('cluster','군집'),('distance','중심 거리 · 분석 단위')],assignments)]
        _summary(result,**{'군집 수':k,'Inertia':model.inertia_,'Silhouette':score,'Silhouette 표본 N':sample_n,'반복 수':model.n_iter_})
        result['interpretation'].append('군집은 거리 기반 탐색 결과이며 정답 범주나 인과 구조를 뜻하지 않습니다. 군집 수·척도·이상치에 따라 결과가 달라집니다.')
        if n>2000:
            result['warnings'].append('Silhouette는 군집을 포함하도록 고정 시드로 선택한 2,000행 표본에서 계산합니다. 군집 적합은 전체 유효 행을 사용합니다.')
    result['assumptions'].append('컬럼별 평균 0·표준편차 1로 표준화했습니다(모집단 표준편차 기준).' if standardize else '표준화하지 않았습니다. 단위가 큰 컬럼이 결과를 지배할 수 있습니다.')
    if n>MAX_DETAIL_ROWS:
        result['warnings'].append(f'관측별 출력은 앞 {MAX_DETAIL_ROWS:,}행입니다. 적합에는 전체 유효 {n:,}행을 사용했습니다.')


def analyze_advanced(dataset, spec):
    """Validated procedures with one BLAS thread and bounded observations."""
    if spec.get('method') not in METHODS:
        fail('지원하지 않는 고급 분석 방식입니다.')
    from backend import config
    if not 1 <= len(dataset.get('rows',[])) <= config.MAX_ROWS:
        fail(f'고급 분석은 1~{config.MAX_ROWS:,}행의 조회 데이터가 필요합니다.')
    confidence = spec.get('confidence',.95)
    if confidence not in (.90,.95,.99):
        fail('신뢰수준은 90%, 95%, 99% 중 선택하세요.')
    from threadpoolctl import threadpool_limits
    import numpy as np
    from statsmodels.tools.sm_exceptions import PerfectSeparationError
    result = _base(dataset,spec)
    if dataset.get('truncated'):
        result['warnings'].append('원본 조회가 행·용량 제한으로 잘렸습니다. 결과는 현재 조회된 데이터에만 해당합니다.')
    handlers = {'descriptive':_descriptive,'normality':_descriptive,
                'ttest_one':_ttest,'ttest_ind':_ttest,'ttest_paired':_ttest,
                'anova':_group_tests,'mannwhitney':_group_tests,'kruskal':_group_tests,
                'wilcoxon':_wilcoxon,'chi_square':_chi_square,'correlation_test':_correlation,
                'ols':_regression,'logistic':_regression,'pca':_multivariate,'kmeans':_multivariate,'reliability':_multivariate}
    try:
        with threadpool_limits(limits=1), warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter('always')
            handlers[spec['method']](dataset,spec,result)
        if caught:
            names={type(item.message).__name__ for item in caught}
            if any('Separation' in name or 'Convergence' in name for name in names):
                fail('모형의 분리 또는 수렴 문제가 감지되었습니다. 변수·범주와 표본 수를 확인하세요.')
            result['warnings'].append('일부 통계량에 수치·표본 조건 경고가 발생했습니다. 계산 불가능한 값은 빈칸으로 표시하며 표본 수·분산·가정을 확인하세요.')
    except HTTPException:
        raise
    except (ValueError, np.linalg.LinAlgError, ZeroDivisionError, OverflowError, FloatingPointError, PerfectSeparationError):
        fail('선택한 데이터에서 안정적인 통계 계산을 완료하지 못했습니다. 표본 수·상수 컬럼·분리·다중공선성을 확인하세요.')
    _summary(result,**{'유효 행':result['sample']['used'],'제외 행':result['sample']['excluded'],'신뢰수준':confidence,'유의수준':1-confidence})
    result['warnings']=list(dict.fromkeys(result['warnings']))
    return finite(result)
