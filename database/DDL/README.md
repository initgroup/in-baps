# DDL — 초기·신규 오브젝트

원격 SYSTEM DB에 직접 실행할 파일은 **[install_oracle.sql](install_oracle.sql)**입니다. SQL Developer F5 또는 SQLcl에서 스크립트로 실행합니다. 대상·CREATE TABLE/VIEW/PROCEDURE 권한·기본 테이블스페이스 quota를 검사하고 호환되는 기존 오브젝트와 업무 데이터를 보존합니다.

| 파일 | 역할 |
|---|---|
| `install_oracle.sql` | 반복 가능한 초기 설치·정의 검사·이력 기록 |
| `V001__baseline.sql` | INIT$_ 명명 규칙의 SYSTEM 초기 정의: 테이블·제약·인덱스·뷰·프로시저·설명 |
| `schema_contract.json`, `installer.sql.template` | 설치 SQL 생성 소스 |
| `target_collection.sql.template` | C-BAP TARGET 수집 테이블 생성 |
| `target_table.sql.template` | DBMS TARGET 새 테이블 생성 |
| `sqlite.sql` | 격리 테스트용 논리 스키마 |

`python scripts/build_oracle_installer.py`로 초기 설치 파일을 생성합니다. CLI는 생성 결과가 오래된 경우 설치를 차단합니다. V001 파일 자체를 수동으로 반복 실행하지 않습니다. 설치 정책·quota·부분 생성 복구는 [상위 안내](../README.md)를 따릅니다.

기존 실험판 V001은 `reference/database/legacy-prototype/`에 원본 체크섬과 함께 보존했습니다. 활성 INIT$_ V001 설치 이후에는 적용 파일을 수정하지 않습니다. 신규 오브젝트는 새 `V###__create_description.sql`로 추가하고 기존 변경은 ALT, 기준 데이터는 DML에 둡니다. 버전 번호는 세 폴더 전체에서 유일합니다.

TARGET 템플릿은 앱의 명시적인 생성 요청으로만 실행하고 실제 SQL을 `.runtime/ddl/`에 기록합니다. 파일 내 사용자 값은 바인드하며 식별자는 검증·인용합니다. 개별 TARGET 실행 기록은 초기 SYSTEM 반복 설치 스크립트가 아닙니다.

