# 로그인 후 초기 로딩 튜닝 · 2026-10-29

## 확인한 원인과 수정

- 모든 SYSTEM SQL 호출이 Oracle 접속·인증·종료를 반복했습니다. 프로세스별 연결 풀(최소 1, 기본 최대 4, 설정 상한 16), 획득 대기 15초, 여분 유휴 연결 300초 정리, 문장 캐시 50개를 적용했습니다. 앱 종료 시 풀을 정리합니다. 첫 연결 생성 비용은 남으며 설정·접속 정보 변경은 재시작 후 반영합니다.
- `query()`의 SELECT에도 COMMIT을 호출했습니다. 읽기 조회의 COMMIT 왕복을 제거하고 쓰기 커밋·예외 롤백·연결 반환을 유지했습니다.
- SYSTEM CLOB을 행마다 `read()`하던 추가 왕복을 제거했습니다. 고정 python-oracledb 3.4.2의 문장별 `fetch_lobs=False`를 사용해 결과 배치에 포함합니다. 기존 native JSON·문자열·LOB 반환 호환성도 유지합니다. 전역 드라이버 설정과 TARGET 연결에는 적용하지 않습니다.
- `/datasets`가 모든 원본 행을 읽고 JSON을 파싱한 후에야 `rows`를 버렸습니다. Oracle `JSON_MERGEPATCH(... RETURNING CLOB ERROR ON ERROR)`와 테스트용 SQLite `JSON_REMOVE`로 최상위 `rows`를 DB에서 제외합니다. 소유권 조건·생성일/ID 정렬·4,000자 초과 메타데이터·다른 null/중첩 필드를 보존하고 원본 PAYLOAD는 수정하지 않습니다.
- 브라우저가 데이터 목록과 저장 시각화 목록을 순차 요청했습니다. 독립적인 두 목록 요청을 병렬로 시작합니다. 두 응답을 받은 뒤 로그인 세대가 유효할 때만 상태에 반영합니다.
- 로그인 준비의 `refreshData()`와 화면 전환의 `loadSelected()`가 선택 데이터의 TARGET SQL을 두 번 실행했습니다. 로그인 준비는 목록만 읽고 실제 데이터 화면이 한 번 조회합니다. DB 설정 등 행을 사용하지 않는 화면으로 바로 진입하면 TARGET 조회를 생략합니다. 후속 데이터 화면 이동은 새로 조회하며, 늦게 도착한 이전 선택·세션 응답을 적용하지 않습니다.

## 실제 SYSTEM Oracle 읽기 측정

같은 로컬 환경·설정된 기존 관리자·동일한 Oracle 23.26.4.1.0에서 비교했습니다. 기존 데이터 목록은 5개, 저장 시각화는 1개였습니다. 계정 정보·행 데이터·DSN·Wallet·비밀값은 측정 결과에 출력하지 않았습니다.

| 읽기 작업 | 개선 전 중앙값 · 3회 | 개선 후 중앙값 · 5회 |
| --- | ---: | ---: |
| 회원 조회 | 172.46ms | 11.93ms |
| 데이터 목록 | 223.00ms | 31.38ms |
| 저장 시각화 목록 | 181.59ms | 19.01ms |

회원 조회 첫 호출에는 연결 생성 비용이 포함됩니다(전 415.65ms, 후 410.67ms). 풀을 재사용한 이후의 개선과 최초 접속을 구분해야 합니다. 각 작업 중앙값은 개별 DB 읽기 시간이며, 전체 브라우저 로그인 시간·TARGET SQL·차트 렌더링 시간으로 확대 해석하지 않습니다. 측정 시점과 데이터량에 따라 결과가 달라집니다.

사용한 인덱스 목록을 실제 Oracle의 `USER_IND_COLUMNS`에서 확인했습니다. 회원 ID·USERNAME 및 세션 TOKEN_HASH의 PK/UNIQUE와 카탈로그 `(OWNER_ID, KIND)` 인덱스가 이미 존재했습니다. 이번 변경은 연결·전송·중복 요청에 집중했으며 신규 인덱스·힌트·DDL·통계 수집·migration 적용은 수행하지 않았습니다. 기존 V001 체크섬은 그대로입니다.

```powershell
.\venv\Scripts\python.exe scripts/benchmark_startup.py --samples 5 --output .runtime/qa/startup-after.json
```

이 도구는 설정된 기존 관리자의 SYSTEM 데이터를 읽기만 합니다. 출력 경로는 프로젝트 내부로 제한하고 실패 시 내부 드라이버 메시지를 출력하지 않습니다. 로컬 전후 측정 원본은 `.runtime/qa/startup-before.json`, `.runtime/qa/startup-after.json`에 있습니다. 이 런타임 파일은 Git·정적 배포에서 제외합니다.

## 실제 브라우저 로그인·메인 표시

실행 중이던 `http://127.0.0.1:9000` 서비스에서 기존 관리자 계정으로 로그인 제출부터 개요 화면 표시 및 중앙 차단 로딩 종료까지 Playwright Chromium으로 측정했습니다. 같은 1440×1000 화면에서 3회 로그인·조회·로그아웃한 뒤, 프로젝트 재시작 스크립트로 새 백엔드를 반영하고 다시 3회 측정했습니다. 기존 데이터셋 5개 중 첫 데이터의 실제 9행이 표시되었습니다.

| 로컬 서비스 | 1회 | 2회 | 3회 | 중앙값 |
| --- | ---: | ---: | ---: | ---: |
| 기존 백엔드 | 2,896ms | 2,388ms | 2,373ms | 2,388ms |
| 개선 백엔드 | 925ms | 861ms | 848ms | 861ms |

중앙값은 약 64% 줄었습니다. 이 비교는 **양쪽 모두 중복 조회 제거·목록 병렬화를 적용한 같은 프론트**를 사용하므로 백엔드 반영 전후 비교입니다. 원래 프론트의 중복 TARGET 조회까지 포함한 전체 변경 전후 수치로 해석하지 않습니다. 데이터가 많거나 TARGET SQL 자체가 느리면 표시 시간이 달라집니다.

모든 회차에서 선택 데이터 상세 요청은 1회, 실패 API 0건, JavaScript 오류 0건, 데이터 조회 오류 0건이었습니다. 로그인·로그아웃은 실제 API의 일반 세션 생성·정리 작업을 수행했습니다. 업무 데이터·연결 설정·분석 결과·DB 구조는 변경하지 않았습니다. 로컬 측정 스크립트와 결과는 Git 제외 `.runtime/qa/startup-browser.cjs`, `startup-http-before.json`, `startup-http-after.json`에 있습니다. 측정에 사용한 계정 정보는 출력하거나 파일에 기록하지 않았습니다.

## 검증

- Python 전체 회귀 64개 통과: 회원·CSRF·유휴/최대 만료·소유권·TARGET 경계·기존 SQL 제어·4,000자 초과 메타데이터·null/중첩값·원본 행 보존·동시 풀 초기화/격리·실패 후 복구·트랜잭션 정리. SQLite와 가짜 Oracle 드라이버를 포함한 검사이며 실제 Oracle 쓰기 검증과 구분합니다.
- JavaScript 구문 검사와 차트 검사 4개 통과.
- Python 구문 검사와 Oracle 연결 없는 migration 계획 검사 통과. 활성 migration은 기존 V001 하나입니다.
- UI 전체 13개 통과: 로그인/로그아웃·차단 로딩·세션 연장·실패 후 재시도·모바일·독립 R/V·차트 및 TARGET API 계약. 기존 화면 검사에 초기 병렬 요청, 메타데이터 화면의 TARGET 미조회, 개요 진입 1회 조회, 후속 분석 화면 재조회 검증을 함께 수행했습니다. 테스트 계정의 인증 요청 수가 기존 5분 12회 제한을 넘지 않도록 기존 계정을 재사용하며 제품 인증 제한을 변경하지 않았습니다.
- 실제 Oracle에서 기존 5개 데이터셋의 새 목록을 원본에서 `rows`를 제외한 결과와 비교해 일치를 확인했습니다. DUAL SELECT에 바인드한 5,000자 메타데이터·null·중첩 rows의 보존도 확인했습니다. DB 데이터와 구조를 쓰지 않는 검증입니다.
- 프로젝트 운영 스크립트로 로컬 9000 서비스를 재시작하고 실제 로그인·메인 조회·로그아웃을 확인했습니다. Git push·Render 공개 배포는 수행하지 않았습니다.

## 참고한 공식 문서

- [python-oracledb 연결 풀](https://python-oracledb.readthedocs.io/en/latest/user_guide/connection_handling.html#connection-pooling)
- [고정 드라이버 3.4.2의 CLOB 직접 읽기](https://python-oracledb.readthedocs.io/en/v3.4.2/user_guide/lob_data.html#fetching-lobs-as-strings-and-bytes)
- [Oracle 19c JSON_MERGEPATCH](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/JSON_MERGEPATCH.html)
