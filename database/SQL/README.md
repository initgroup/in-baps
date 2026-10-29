# SQL — 앱 기능별 실행 SQL

| 파일 | 기능 |
|---|---|
| `auth.sql` | INIT$_ 회원 생성·조회, 세션 발급·만료·활동 연장·삭제 |
| `catalog.sql` | 소유 데이터셋·분석·시각화·대시보드 레코드 |
| `target.sql` | 회원별 연결 CRUD, TARGET 오브젝트·컬럼·DDL·접속 계정 조회 |
| `management.sql` | SYSTEM 스키마·오브젝트 조회, migration 이력 |

`-- [SQL_ID]`로 SQL을 구분하고 `backend.database.statements()`에서 읽습니다. 중복 ID는 오류이며 값은 바인드합니다. SYSTEM 오브젝트 이름은 `INIT$_<유형>_BAPS_*` 규칙을 따릅니다. 이 파일들은 버전 migration의 자동 적용 대상이 아닙니다.

`DATASET_LIST`는 Oracle 19c 이상의 `JSON_MERGEPATCH`로 최상위 `rows`만 제거한 메타데이터를 CLOB으로 반환합니다. 4,000자를 넘는 컬럼 정보·설명을 자르지 않으며 다른 null·중첩 필드는 보존합니다. `DATASET_LIST_SQLITE`는 격리 테스트에서 동일한 결과를 내는 `JSON_REMOVE` 쿼리입니다. 원본 PAYLOAD는 변경하지 않습니다. 데이터 상세·분석·내보내기는 기존 원본 조회를 유지하고 TARGET SQL은 사용할 때 다시 실행합니다.

사용자가 작성하는 SQL 작업실 쿼리는 별도의 Oracle 구문 검사·소유권·보호 테이블·행 수·시간 제한을 거칩니다. 정적 SQL 로더에 사용자 문장을 등록하거나 비밀값을 SQL에 문자열로 결합하지 않습니다. 생성·변경 템플릿은 DDL/ALT 폴더에서 관리합니다.

