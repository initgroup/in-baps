# 회원·실제 DB 개편 검증 기록

기준일: 2026-10-29. 현재 코드의 검증 범위를 기록합니다. 비밀번호·wallet·암호화 키는 이 문서와 보고서에 포함하지 않습니다.

| 검사 | 결과 | 범위 |
|---|---|---|
| Python 회귀 검사 | 44개 통과 | 회원·세션·CSRF·소유권·SQL 제한·암호화·백업·설치기·Oracle JSON 반환 형식, 격리 SQLite/가짜 드라이버 포함 |
| 브라우저 검사 | 9개 통과 | 실제 격리 API의 회원가입·빈 계정·분석 4종·차트 14종·저장·R/V 단독 구성 |
| TARGET 화면 계약 검사 | 통과 | 브라우저 검사 중 TARGET API만 모의 응답, 실제 Oracle 쓰기 검증과 구분 |
| 차트 계산 검사 | 4개 통과 | 결측·숫자 판별·집계·큰 데이터 제한 |
| Python/JavaScript 구문 | 통과 | compileall, npm run check |
| 오프라인 환경 재현 계획 | 통과 | 고정 버전 설치 파일에서 `pip --dry-run --ignore-installed --no-index` 의존성 해결 |
| 원격 Oracle 연결 | 통과 | Oracle 23.26.4.1.0, 같은 로그인/현재 스키마 |
| 원격 Oracle 기본 오브젝트 | 유효 | SYSTEM 테이블 5개, 인덱스 9개, 뷰 1개, 프로시저 1개. 검증용 TARGET 테이블 3개·PK 인덱스 3개를 포함한 22개 모두 VALID, 컴파일 오류 0개 |
| 실제 Oracle 읽기 | 통과 | 컬럼 사전·DBMS_METADATA DDL, 바인드와 CTE, 읽기 전용 트랜잭션 및 행 제한 |
| 실제 Oracle 데이터 저장 | 통과 | 사용자 승인 ADMIN 작업으로 SYSTEM 소유 계정의 DATA quota 100MiB 설정 후 회원·세션·연결·카탈로그·TARGET 행 저장 |
| 설치 SQL 반복 실행 | 통과 | BASE03 설치 후 데이터가 있는 상태에서도 두 번 재실행, SYSTEM 5개 테이블의 전체 값 해시 비교로 기존 행 보존 확인 |
| 실제 Oracle 전체 업무 흐름 | 10단계 통과 | 회원·암호화 TARGET·실제 적재·그리드·SQL DML·분석·시각화 저장·DDL·세션 만료 |
| 로컬 Oracle 서비스 | 시작·실제 브라우저 확인 통과 | `http://127.0.0.1:9000`, 모의 API 없이 관리자 로그인·빈 카탈로그·TARGET 접속/SQL·SYSTEM 화면·로그아웃, 브라우저 오류 0개 |
| Git push / Render 공개 배포 | 수행하지 않음 | Git 원격과 Render 실행 설정만 유지 |

## 설치와 실제 DB 검증

초기 설치에서는 SYSTEM 소유 계정에 DATA 쓰기 할당량이 없어 ORA-01950이 발생했습니다. 사용자의 명시적 승인에 따라 저장된 `INIT_AI_CLOUD_ADMIN` 연결로 대상 DB와 계정을 확인한 뒤 해당 계정의 DATA quota만 100MiB로 설정했습니다. 이후 앱이 사용하는 `INIT_AI_CLOUD_BASE03` 연결에서 설치 SQL을 두 번 실행하고, 실제 Oracle 통합 검사에서 아래 흐름을 확인했습니다. 앱 시작 시 권한·quota를 부여하거나 DDL을 자동 실행하는 기능은 없습니다.

1. 회원가입과 빈 카탈로그, 자동 체험 로그인 API 제거 확인.
2. 비밀번호 로그인과 로그아웃으로 이전 세션 폐기.
3. 회원 소유 TARGET 연결 암호화 저장과 실제 접속.
4. C-BAP 실제 행 적재와 오브젝트·컬럼·DDL 조회.
5. 기본 키 그리드 미리보기 롤백·저장·동시 변경 충돌, SQL 데이터셋 재조회.
6. 바인드 SQL DML, 실제 조회 데이터의 R-BAP 집계와 V-BAP 차트 저장.
7. 타 회원 데이터·SYSTEM 보호 테이블·허용하지 않는 SQL 접근 거부.
8. 생성/변경 DDL 파일 기록, 실제 CREATE/ALTER, TIMESTAMP 입력과 재조회.
9. 명시적 샘플 생성 요청으로만 TARGET에 예제 적재 후 SQL 조회.
10. SYSTEM DB에 저장된 유휴 만료와 로그아웃에 따른 접근 거부.

실행 명령은 `venv\Scripts\python.exe tests/oracle_live_smoke.py --run`입니다. 보고서는 위 10단계 성공을 기록합니다. 이 명령은 실행마다 실제 QA 회원 2개와 검증용 TARGET 테이블/행을 만들며 기존 고객 오브젝트를 삭제하지 않습니다. 검증 중 수정 전 실패한 첫 실행에서 생성된 QA 회원 1개도 보존되어, 설치 재검증 시점에는 초기 관리자 1명과 QA 회원 3명이 있었습니다. 검증용 행은 업무 실적이 아니며 사용자 새 인법스에 자동으로 들어가지 않습니다. 재실행하면 별도 QA 회원과 오브젝트가 추가됩니다.

통합 검사 후 설치 SQL을 다시 두 번 실행했습니다. 실행 전후 SYSTEM 5개 테이블의 전체 값 해시가 동일했고, V001 이력도 한 건으로 유지되었습니다. 기본 16개와 QA용 6개 오브젝트 모두 유효하며 컴파일 오류가 없었습니다.

실제 Oracle 23의 JSON 컬럼이 문자열/LOB 대신 이미 변환된 객체를 반환하는 경우를 확인하고 저장소 해석을 보완했습니다. JSON 반환 형식 회귀 6개를 추가한 전체 Python 검사 44개와 구문 검사를 통과했습니다.

9000 서비스의 실제 브라우저 검사에서는 초기 관리자 계정으로 로그인한 뒤 `BASE03 · 기본 TARGET` 연결을 등록·재사용하고 접속 시험 및 바인드 SELECT 조회를 수행했습니다. 이 연결은 관리자 개인 소유의 SYSTEM 공유 TARGET이며 데이터셋이나 샘플을 자동 생성하지 않습니다. 관리자 인법스가 비어 있음을 확인했고, SYSTEM 오브젝트 화면과 로그아웃도 검증했습니다.

## 로컬 증거

- `.runtime/qa/oracle-readonly.json`: quota 설정 전 실제 Oracle 읽기 검증과 당시 quota 조회 결과.
- `.runtime/qa/oracle-install.json`: 데이터 적재 후 두 번 설치 성공, DATA quota 104,857,600바이트, 오브젝트 유효 상태, 기존 행 보존, 설치 SQL 해시.
- `.runtime/qa/playwright-report/index.html`: 유지보수 브라우저 검사 보고서.
- `.runtime/qa/membership-login.png`, `db-settings.png`, `dbms-workspace.png`: 화면 검사 이미지. TARGET 화면 일부는 명시적 API 계약 검사 자료입니다.
- `.runtime/qa/oracle-functional.json`: 실제 Oracle 통합 검사 10단계 `success: true`와 생성한 QA 오브젝트 목록.
- `.runtime/qa/live-service.json`: 실제 9000 서비스 브라우저 검사, `mocked_api: false`, `storage: oracle`, 빈 관리자 인법스·TARGET SQL 성공·브라우저 오류 0개.
- `.runtime/qa/live-oracle-login.png`, `live-oracle-db-settings.png`, `live-oracle-system.png`, `live-oracle-workspace.png`: 실제 Oracle 서비스의 화면 증거.

이전 SQLite 체험 서비스를 중지하고 `.env`의 SYSTEM 저장소를 Oracle로 변경한 뒤, 운영 스크립트로 `http://127.0.0.1:9000` 서비스를 시작했습니다. 새 회원에게 데이터를 자동 생성하거나 Oracle 오류 시 SQLite로 대체하지 않습니다.
