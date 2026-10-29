"""Explicit live Oracle integration (not unittest discovery).

Run only after install_oracle.sql. This creates two private QA members and
small, clearly named QA tables/records; it never drops customer objects.
Report contains check names and owned object names, never credentials.
"""
import argparse
import json
import os
import re
import secrets
import sys
import time
import traceback
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--run', action='store_true', help='Explicitly permit QA account/table/data creation')
    args = parser.parse_args()
    if not args.run:
        parser.error('--run is required; no DB connection was made')
    os.environ['BAPS_STORAGE'] = 'oracle'
    os.environ['BAPS_ALLOWED_HOSTS'] = 'testserver,127.0.0.1,localhost'
    os.environ['BAPS_COOKIE_SECURE'] = 'false'
    from fastapi.testclient import TestClient
    from backend import config
    from backend.database import connection
    from main import app
    suffix = uuid.uuid4().hex[:12]
    report = {'started_at': time.time(), 'backend': 'oracle', 'steps': [], 'qa_objects': []}
    output = config.ROOT / '.runtime/qa/oracle-functional.json'
    output.parent.mkdir(parents=True, exist_ok=True)

    def ok(name):
        report['steps'].append(name)
        print('PASS ' + name, flush=True)

    def call(client, method, path, expected=200, **kwargs):
        report['last_request'] = {'method': method, 'path': path}
        response = client.request(method, path, **kwargs)
        if response.status_code != expected:
            # Validation responses can echo request values, including passwords.
            # Keep only known error codes/types; never persist the response body.
            try:
                detail = response.json().get('detail')
            except (ValueError, AttributeError):
                detail = None
            diagnostics = []
            if isinstance(detail, str):
                diagnostics = re.findall(r'\b(?:ORA|DPY|DPI)-\d{4,5}\b', detail)
            elif isinstance(detail, list):
                diagnostics = sorted({item.get('type') for item in detail
                                      if isinstance(item, dict) and isinstance(item.get('type'), str)
                                      and re.fullmatch(r'[a-z_]{1,80}', item['type'])})
            suffix = '; error types/codes: ' + ', '.join(diagnostics) if diagnostics else ''
            raise AssertionError(f'{method} {path}: HTTP {response.status_code}, expected {expected}' + suffix)
        if expected in (200, 201):
            return response.json()['data']
        return response

    try:
        with TestClient(app) as client, TestClient(app) as other:
            password = secrets.token_urlsafe(24)
            session = call(client, 'POST', '/api/auth/signup', 201, json={'username': 'qa_' + suffix, 'display_name': 'DB 연동 검증 전용', 'password': password})
            user_id = session['user']['id']
            headers = {'X-CSRF-Token': session['csrf_token']}
            assert call(client, 'GET', '/api/datasets') == []
            call(client, 'POST', '/api/auth/demo', 404)
            ok('signup persists member; empty catalog; demo route removed')
            call(client, 'POST', '/api/auth/logout', headers=headers)
            call(client, 'GET', '/api/auth/session', 401)
            session = call(client, 'POST', '/api/auth/login', json={'username': 'qa_' + suffix, 'password': password})
            assert session['user']['id'] == user_id and session['user']['role'] == 'analyst'
            headers = {'X-CSRF-Token': session['csrf_token']}
            ok('Oracle member password login and logout revoke the prior session')
            args_db = config.oracle_connect_args()
            cfg = {'name': 'QA 실제 Oracle 연결', 'username': args_db['user'], 'password': args_db['password'], 'dsn': args_db['dsn'], 'wallet_profile': bool(args_db.get('wallet_location')), 'allow_dml': True}
            connected = call(client, 'POST', '/api/connections', 201, headers=headers, json=cfg)
            cid = connected['id']
            assert 'password' not in connected and 'password_enc' not in connected
            assert call(client, 'POST', '/api/connections/' + cid + '/test', headers=headers)['connected']
            with connection() as conn:
                cur = conn.cursor()
                cur.execute('SELECT CONFIG_JSON FROM INIT$_TB_BAPS_CONNECTION WHERE ID=:id', id=cid)
                value = cur.fetchone()[0]
                stored = value.read() if hasattr(value, 'read') else value
                if isinstance(stored, dict):
                    stored = json.dumps(stored, ensure_ascii=False)
                assert args_db['password'] not in stored and 'fernet:' in stored
                cur.close()
            ok('member-owned encrypted TARGET connection and live connect')
            payload = {'connection_id': cid, 'name': 'QA 실제 DB 수집 검증', 'rows': [{'REGION':'서울','VALUE':10}, {'REGION':'서울','VALUE':20}, {'REGION':'부산','VALUE':5}], 'module':'C-BAP'}
            dataset = call(client, 'POST', '/api/dbms/import', 201, headers=headers, json=payload)
            did = dataset['id']; table = dataset['target']['table']
            report['qa_objects'].append(table)
            live = call(client, 'GET', '/api/datasets/' + did)
            assert live['row_count'] == 3
            assert sorted((row['REGION'], row['VALUE']) for row in live['rows']) == sorted([('서울', 10), ('서울', 20), ('부산', 5)])
            assert any(o['name'] == table for o in call(client, 'GET', '/api/dbms/objects', params={'connection_id':cid}))
            assert len(call(client, 'GET', '/api/dbms/columns', params={'connection_id':cid,'table':table})) == 3
            assert 'CREATE TABLE' in call(client, 'GET', '/api/dbms/ddl', params={'connection_id':cid,'name':table})['ddl']
            ok('C-BAP physically inserts rows; object, columns and DDL read from Oracle')
            sql = f'SELECT * FROM "{table}" ORDER BY "BAPS_ROW_ID"'
            q = {'connection_id':cid,'sql':sql,'binds':{},'limit':100}
            grid = call(client, 'POST', '/api/dbms/query', headers=headers, json=q)
            original = grid['rows'][0]
            edit = {'connection_id':cid,'table':table,'operation':'update','original':original,'values':{'C002':11},'commit':False}
            assert not call(client,'POST','/api/dbms/grid',headers=headers,json=edit)['committed']
            assert sorted((row['REGION'], row['VALUE']) for row in call(client,'GET','/api/datasets/'+did)['rows']) == sorted([('서울', 10), ('서울', 20), ('부산', 5)])
            edit['commit'] = True
            assert call(client,'POST','/api/dbms/grid',headers=headers,json=edit)['committed']
            assert sorted((row['REGION'], row['VALUE']) for row in call(client,'GET','/api/datasets/'+did)['rows']) == sorted([('서울', 11), ('서울', 20), ('부산', 5)])
            call(client,'POST','/api/dbms/grid',409,headers=headers,json={**edit,'values':{'C002':12}})
            ok('PK grid rollback, commit, optimistic conflict and live dataset re-query')
            dml={'connection_id':cid,'sql':f'UPDATE "{table}" SET "C002"=:value WHERE "BAPS_ROW_ID"=:id','binds':{'value':12,'id':1},'commit':False}
            assert not call(client,'POST','/api/dbms/dml',headers=headers,json=dml)['committed']
            dml['commit']=True
            assert call(client,'POST','/api/dbms/dml',headers=headers,json=dml)['affected_rows']==1
            querydata=call(client,'POST','/api/dbms/datasets',201,headers=headers,json={'connection_id':cid,'name':'QA SQL 기반 분석','sql':dataset['target']['sql'],'binds':{},'module':'R-BAP'})
            analysis=call(client,'POST','/api/analysis',201,headers=headers,json={'dataset_id':querydata['id'],'method':'aggregate','group_by':'REGION','value':'VALUE'})
            assert {r['name']:r['value'] for r in analysis['result']['rows']} == {'서울':32,'부산':5}
            visual=call(client,'POST','/api/visualizations',201,headers=headers,json={'name':'QA Oracle 시각화','dataset_id':querydata['id'],'chart_type':'bar','config':{'x':'REGION','y':'VALUE'}})
            assert visual['dataset_id'] == querydata['id']
            ok('bound SQL DML; real SQL dataset; R-BAP aggregate and V-BAP persisted chart')
            call(client,'POST','/api/dbms/query',403,headers=headers,json={**q,'sql':'SELECT * FROM INIT$_TB_BAPS_MEMBER'})
            call(client,'POST','/api/dbms/query',422,headers=headers,json={**q,'sql':'DROP TABLE '+table})
            other_session=call(other,'POST','/api/auth/signup',201,json={'username':'qa_other_'+suffix,'display_name':'소유권 검증 전용','password':secrets.token_urlsafe(24)})
            other_headers={'X-CSRF-Token':other_session['csrf_token']}
            call(other,'GET','/api/datasets/'+did,404)
            call(other,'POST','/api/connections/'+cid+'/test',404,headers=other_headers)
            call(other,'GET','/api/system',403)
            ok('server denies cross-member data, SYSTEM security tables and unsafe SQL')
            new_table='INIT$_TB_BAPS_QA_'+suffix.upper()
            created=call(client,'POST','/api/dbms/tables',201,headers=headers,json={'connection_id':cid,'name':new_table,'columns':[{'name':'ID','type':'NUMBER','nullable':False},{'name':'TITLE','type':'VARCHAR2','length':100}],'primary_key':['ID']})
            report['qa_objects'].append(new_table)
            assert created['created']
            call(client,'POST','/api/dbms/columns',201,headers=headers,json={'connection_id':cid,'table':new_table,'column':{'name':'ADDED_AT','type':'TIMESTAMP'}})
            inserted=call(client,'POST','/api/dbms/grid',headers=headers,json={'connection_id':cid,'table':new_table,'operation':'insert','values':{'ID':1,'TITLE':'QA','ADDED_AT':'2026-10-29T12:00:00'},'commit':True})
            assert inserted['affected_rows']==1
            readback=call(client,'POST','/api/dbms/query',headers=headers,json={'connection_id':cid,'sql':f'SELECT "ID", "TITLE", "ADDED_AT" FROM "{new_table}" WHERE "ID"=:id','binds':{'id':1},'limit':10})
            assert len(readback['rows'])==1 and readback['rows'][0]['ID']==1 and readback['rows'][0]['TITLE']=='QA'
            assert readback['rows'][0]['ADDED_AT']=='2026-10-29T12:00:00'
            ok('file-managed CREATE/ALTER and typed TIMESTAMP grid insert/readback')
            sample=call(client,'POST','/api/dbms/sample',201,headers=headers,json={'connection_id':cid,'module':'V-BAP'})
            report['qa_objects'].append(sample['target']['table'])
            assert sample['synthetic'] is True and call(client,'GET','/api/datasets/'+sample['id'])['row_count']==36
            ok('sample only on explicit action; real TARGET persistence and query')
            call(client,'POST','/api/auth/activity',headers=headers)
            with connection() as conn:
                cur=conn.cursor()
                cur.execute('UPDATE INIT$_TB_BAPS_SESSION SET IDLE_EXPIRES_AT=:expired WHERE USER_ID=:owner', expired=time.time()-1,owner=user_id)
                cur.close()
            call(client,'GET','/api/datasets',401)
            call(other,'POST','/api/auth/logout',headers=other_headers)
            call(other,'GET','/api/auth/session',401)
            ok('Oracle persisted idle expiry and logout enforce authorization')
            report['success']=True
    except Exception as error:
        report.update(success=False,error_type=type(error).__name__)
        frames = traceback.extract_tb(error.__traceback__)
        if frames:
            report['failure_location'] = f'{Path(frames[-1].filename).name}:{frames[-1].lineno} ({frames[-1].name})'
        if isinstance(error,AssertionError):
            report['failure']=str(error)
        else:
            item=error.args[0] if error.args else None
            report['db_code']=getattr(item,'full_code',None)
    finally:
        report['finished_at']=time.time()
        output.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps(report,ensure_ascii=False),flush=True)
    return 0 if report.get('success') else 1


if __name__ == '__main__':
    raise SystemExit(main())
