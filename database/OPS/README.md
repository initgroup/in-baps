# OPS — 수동 점검·운영

이 폴더는 수동 상태·권한·성능·스키마 진단용 SQL을 둡니다. `backend.migrate`는 이 폴더 파일을 자동 실행하지 않습니다.

- `verify_oracle.sql`: 접속 스키마, INIT$_ IN-BAPS 오브젝트 상태와 migration 이력 확인. 설치 후 실제 DB에서 실행합니다.
- 초기 설치: `baps-db-install -Schema 대상스키마` 또는 `database/DDL/install_oracle.sql`.
- 이후 변경: `baps-db-plan`, `baps-db-status` 검토 후 `baps-db-apply -Schema 대상스키마`.
- 정의 보관: `baps-db-export`로 SYSTEM 오브젝트 DDL과 manifest를 `reference/database-export/`에 저장합니다.

quota가 없으면 DBA가 확인된 계정과 기본 테이블스페이스에 제한 quota를 부여한 후 초기 설치를 다시 실행합니다. 앱이 권한을 높이거나 무조건 오류를 무시하지 않습니다.

DDL 내보내기와 TARGET 실행 SQL 기록은 구조 관리입니다. Oracle 데이터 백업·복원은 별도 작업이며 `baps-backup -IncludeData`의 테스트용 SQLite 스냅샷과 구분합니다.

