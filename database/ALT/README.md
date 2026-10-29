# ALT — 기존 오브젝트 변경

기존 테이블·컬럼·제약·인덱스·뷰·프로시저 변경은 `V002__description.sql` 형태의 새 영문 버전 파일로 관리합니다. DDL/ALT/DML 전체에서 버전 번호는 유일해야 합니다. 적용한 파일은 고치지 않으며 SQL/PLSQL 문장은 한 줄 `/`로 구분합니다.

```powershell
baps-db-plan
baps-db-status
baps-db-apply -Schema 대상스키마
```

`V002__add_user_external_id.sql.example`은 `INIT$_TB_BAPS_MEMBER` 변경 작성 예시이며 실행 대상이 아닙니다. 현재 활성 ALT 버전은 없습니다.

`target_add_column.sql.template`은 DBMS의 명시적 TARGET 컬럼 추가용입니다. 기존 행을 보존하도록 NULL 허용 컬럼만 추가하고 생성한 ALTER SQL을 `.runtime/ddl/`에 기록합니다. 이 템플릿은 버전 migration에서 자동 실행하지 않습니다. DROP/TRUNCATE나 전체 재생성으로 변경을 대신하지 않습니다.

