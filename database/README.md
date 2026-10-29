# IN-BAPS SYSTEM / TARGET 데이터베이스

서비스 기본 저장소는 Oracle입니다. SYSTEM DB는 회원·세션·연결 설정·카탈로그를 관리하며, 회원별 TARGET DB는 수집 데이터와 기존 고객 업무 데이터를 조회·편집하는 곳입니다. SQLite 분기는 격리 테스트에 사용하며 Oracle 장애 시 자동 대체하지 않습니다.

## 원격 DB에 실행할 초기 파일

**[DDL/install_oracle.sql](DDL/install_oracle.sql)** 하나를 실제 SYSTEM 스키마 소유자로 연결한 SQL Developer에서 **스크립트 실행(F5)** 하세요. SQLcl에서는 다음과 같이 실행합니다.

```sql
@D:/work/in-baps/database/DDL/install_oracle.sql
```

`V001__baseline.sql`, `V002__open_api_collection.sql`은 이력 원본이므로 수동 반복 실행용이 아닙니다. 설치 파일은 현재 DDL 버전·계약·템플릿으로부터 생성되며 기존 업무 행을 삭제하지 않습니다. 이미 V001을 사용 중이면 `backend.migrate apply --schema 대상스키마`로 V002만 추가할 수 있습니다.

준비 조건은 Oracle 19c 이상, 일반 애플리케이션 스키마, `CREATE SESSION`, `CREATE TABLE`, `CREATE VIEW`, `CREATE PROCEDURE`와 기본 테이블스페이스의 쓰기 quota입니다. SYS/SYSTEM 또는 로그인 계정과 CURRENT_SCHEMA가 다른 상태는 허용하지 않습니다. quota는 DBA가 확인된 계정과 테이블스페이스에 부여합니다. 앱은 권한이나 quota를 스스로 부여하지 않습니다.

2026-10-29 초기 데이터 기록에서 확인한 `ORA-01950`은 사용자가 승인한 `INIT_AI_CLOUD_ADMIN` 연결로 SYSTEM 소유 계정의 DATA quota를 100MiB로 설정하여 해결했습니다. 이후 `INIT_AI_CLOUD_BASE03` 연결에서 같은 설치 SQL을 두 번 실행했고, 기존 호환 오브젝트를 보존한 상태로 설치를 완료했습니다. 실제 Oracle 회원가입·TARGET 적재·SQL/DML·그리드·분석·시각화 저장·세션 만료 검증도 통과했습니다. 데이터 적재 후 설치 SQL을 다시 두 번 실행해 SYSTEM 5개 테이블의 기존 값이 보존되는지 확인했습니다. 실행 결과와 검증 범위는 [현재 검증 기록](../reference/VALIDATION_MEMBERSHIP.md)에 구분합니다.

## 반복 설치가 하는 일

1. 대상 스키마·권한·기본 테이블스페이스 quota를 먼저 확인합니다.
2. 없는 테이블·제약·인덱스를 생성하고 기존 컬럼의 타입·길이·NULL 조건과 제약 정의를 검사합니다.
3. 뷰·세션 정리 프로시저 정의를 적용하고 유효 상태를 확인합니다.
4. `INIT$_TB_BAPS_HISTORY`의 V001/V002 체크섬·상태를 검사하고 해당 설치 이력을 기록합니다. 이미 완료된 이력은 중복 기록하거나 적용 시각을 바꾸지 않습니다.

데이터 삭제, DROP/TRUNCATE, 기존 제품 테이블 이름 변경은 하지 않습니다. 호환되지 않는 기존 구조, 다른 체크섬, 이 설치본이 알지 못하는 후속 버전 이력이 있으면 중단합니다. 여러 설치 세션을 동시에 실행하지 마세요. Oracle DDL은 암묵적으로 커밋되므로 설치는 업무 트랜잭션과 분리한 연결에서 수행합니다.

```powershell
.\venv\Scripts\python.exe -m backend.migrate plan
.\venv\Scripts\python.exe -m backend.migrate status
.\venv\Scripts\python.exe -m backend.migrate install --schema 대상스키마
.\venv\Scripts\python.exe -m backend.migrate apply --schema 대상스키마
.\venv\Scripts\python.exe -m backend.migrate export --output reference/database-export
```

`plan`만 오프라인입니다. `status/install/apply/export`는 Oracle에 연결하며 `install/apply`가 명시적으로 DB를 변경합니다. 앱 시작과 터미널 가상환경 활성화에서는 Oracle DDL을 실행하지 않습니다. 설치 후 [OPS/verify_oracle.sql](OPS/verify_oracle.sql)로 상태와 적용 이력을 확인합니다.

## 명명 규칙과 현재 오브젝트

IN-BAPS 시스템 오브젝트 형식은 `INIT$_<유형>_BAPS_<이름>`입니다. 기존 고객 DB 오브젝트를 자동으로 이름 변경하지 않습니다. 이 규칙은 M90003에서 사용자가 생성하는 TARGET 오브젝트의 명명 제약이 아닙니다.

| 유형 | 접두어 | 예 |
|---|---|---|
| 테이블 | `INIT$_TB_` | `INIT$_TB_BAPS_MEMBER` |
| 프로시저 | `INIT$_SP_` | `INIT$_SP_BAPS_SESSION_PURGE` |
| 뷰 | `INIT$_VW_` | `INIT$_VW_BAPS_CATALOG` |
| 인덱스 | `INIT$_IX_` | `INIT$_IX_BAPS_CONN_OWNER` |
| 기본 키 / 유일 / 외래 키 / 검사 | `INIT$_PK_/UK_/FK_/CK_` | `INIT$_PK_BAPS_MEMBER` |

SYSTEM 테이블은 다음 8개입니다.

- `INIT$_TB_BAPS_MEMBER`: 회원 ID·로그인 아이디·표시 이름·암호 해시·역할.
- `INIT$_TB_BAPS_SESSION`: 세션 토큰 해시·회원·CSRF·최대 만료·유휴 만료·마지막 활동.
- `INIT$_TB_BAPS_CONNECTION`: 회원별 TARGET 연결과 암호화한 비밀번호·쓰기 허용·관리 테이블 목록.
- `INIT$_TB_BAPS_RECORD`: 데이터셋 정의/직접 입력·분석 결과·시각화·대시보드 JSON.
- `INIT$_TB_BAPS_HISTORY`: 버전 파일·SHA-256·적용 시각·상태.
- `INIT$_TB_BAPS_API_SOURCE`: 소유 API 설정·암호화 인증값·TARGET 매핑·실행 잠금.
- `INIT$_TB_BAPS_API_JOB`: 소유 API의 실행 간격·다음 실행 시각·활성 여부.
- `INIT$_TB_BAPS_API_RUN`: 수동/배치 실행 상태·시각·저장 건수·결과 메시지.

7개 명시적 인덱스, 카탈로그 뷰, 세션 정리 프로시저 및 각 제약조건도 파일로 관리합니다. V002는 소유 API 조회·실행 예정 배치·회원별 실행 이력·소스별 실행 상태 인덱스 4개를 추가합니다. C-BAP의 자동 관리 테이블은 TARGET에 `INIT$_TB_BAPS_C_<식별자>` 이름으로 생성됩니다. API 수집은 `INIT$_TB_BAPS_C_API_<식별자>` 테이블에 실행 ID·행 번호 복합 PK, 수집 시각, 레코드 원문 CLOB과 매핑 컬럼을 저장합니다.

M90003의 사용자 테이블은 `SALES`, `TB_CUSTOMER` 등 원하는 이름으로 생성할 수 있으며 `INIT$_TB_` 접두어·대문자 규칙을 강제하지 않습니다. 컬럼 역시 사용자 이름을 그대로 인용하고, 기본 키 제약 이름은 Oracle이 자동 부여합니다. 소문자·한글·공백을 포함한 이름도 입력할 수 있으며 SQL에서 이름을 큰따옴표로 감싸 사용합니다. 오브젝트 선택 시 작업실은 이름을 인용한 SQL을 만듭니다. 식별자 길이(UTF-8 128바이트)·DB 자체 문법·권한·SYSTEM 보호는 적용합니다. 사용자 오브젝트의 생성·변경 SQL도 동일하게 파일에 기록합니다.

## SQL 폴더와 버전

| 폴더 | 내용 | 실행 |
|---|---|---|
| `DDL/` | 초기·신규 생성, 반복 설치, TARGET 생성 템플릿 | 버전 파일 또는 명시적 생성 API |
| `ALT/` | 기존 오브젝트 변경, TARGET 컬럼 추가 템플릿 | 버전 파일 또는 명시적 변경 API |
| `DML/` | 기준 데이터·보정 | 버전 파일 |
| `SQL/` | 인증·카탈로그·연결·DBMS·migration SQL | SQL ID와 바인드로 앱에서 호출 |
| `OPS/` | 수동 점검·진단 | 자동 migration 제외 |

DDL/ALT/DML의 `V###__description.sql` 번호는 전체에서 유일해야 합니다. 현재 활성 버전은 V001과 V002이며 2026-10-29 실제 SYSTEM에 적용했습니다. 이후 변경은 V003 이상을 추가하고 적용 파일은 수정하지 않습니다. `*.sql.example`, `*.sql.template`, `sqlite.sql`, `install_oracle.sql`은 버전 스캔 대상이 아닙니다.

`backend.migrate apply`는 각 버전을 적용하기 전에 RUNNING을 커밋하고 완료하면 APPLIED로 기록합니다. 중간 실패가 남으면 자동 재실행을 중단합니다. 부분 생성·실제 데이터·SQL을 비교해 복구한 뒤 상태를 정리해야 합니다. 중복 오브젝트 오류를 무조건 무시하지 않습니다.

기존 실험판 `INBAPS_*` V001은 [reference/database/legacy-prototype](../reference/database/legacy-prototype/README.md)에 원본 바이트로 보존했습니다. SHA-256은 `12472293754a84a80e300c3e3fa5321783dd094fe582b1a20f9932d481e9cef6`입니다. 활성 초기 정의를 교체하기 전에 연결한 원격 DB에 IN-BAPS 전용 오브젝트가 없음을 조회했습니다. 이 보관본은 실행하거나 새 체크섬 이력에 섞지 않습니다.

## TARGET DBMS와 재현 파일

회원이 저장한 TARGET 연결만 서버 소유권 검증 후 사용할 수 있습니다. 직접 연결은 해당 DB 계정의 권한을 따릅니다. 관리자용 SYSTEM 공유 TARGET 연결과 SYSTEM 사용자명 재사용 연결은 본인이 등록·적재한 테이블로 제한합니다. 회원·세션·연결·이력 등 SYSTEM 보호 테이블은 SQL/그리드/DDL 조회에서도 차단합니다.

오브젝트 **목록**에서는 관리자가 공유 스키마 전체의 이름·유형·상태를 볼 수 있습니다. 소유 범위 밖 항목은 목록 전용이며 위 데이터/DDL 권한을 확대하지 않습니다. TARGET별 범위·시스템 숨김·접두어/유형 제외는 기존 `INIT$_TB_BAPS_CONNECTION.CONFIG_JSON`의 `object_filter`에 저장하므로 추가 DDL이 필요하지 않습니다. 메타데이터 SQL은 `SQL/target.sql`의 `TARGET_BROWSER_OBJECTS`, `TARGET_BROWSER_OBJECT`로 관리합니다. 인덱스·트리거는 연관 테이블을 함께 조회하여 시스템 판별과 소유 검증을 적용합니다.

SELECT 결과를 데이터셋으로 등록하면 연결·SQL·바인드를 SYSTEM DB에 저장하고 R/V 사용 시 TARGET에서 다시 조회합니다. 샘플 생성은 자동 초기화가 아니라 사용자가 DB 설정 화면에서 선택하는 실제 TARGET 적재 작업이며 합성임을 표시합니다.

수집 테이블·사용자 테이블 생성과 컬럼 추가는 각각 `DDL/target_*.sql.template`, `ALT/target_add_column.sql.template`에서 SQL을 생성합니다. 생성한 DDL은 프로젝트의 비공개 `.runtime/ddl/<회원식별해시>/<실행식별자>.sql`에 남습니다. API는 파일 경로 및 생성/변경 결과를 반환합니다. 이 파일은 SYSTEM 반복 설치 스크립트와 달리 개별 실행 기록이며 자동 재실행하지 않습니다. 파일 기록은 시도한 SQL을 보존하므로 실제 오브젝트 상태와 함께 성공 여부를 확인합니다.

## 다른 DB로 이동·백업

SYSTEM 구조는 초기 설치와 이후 버전 파일로 재현합니다. TARGET 구조는 실행 DDL 기록과 DBMS DDL 내보내기를 확인해 명시적으로 적용합니다. `baps-db-export`는 실제 IN-BAPS SYSTEM 오브젝트 정의와 manifest를 `reference/database-export/`에 저장합니다.

DDL 파일은 데이터 백업이 아닙니다. Oracle 데이터는 별도 DB 백업/Data Pump 또는 필요한 데이터셋 내보내기로 관리합니다. `baps-backup`은 소스와 `.runtime/ddl/**/*.sql` 기록을 포함하고 비밀 파일·그 외 런타임 상태·원격 데이터는 제외합니다. `-IncludeData`는 격리 테스트용 SQLite 스냅샷에만 해당합니다. 암호화 키·wallet은 별도 보관해야 합니다.

