# 보관된 초기 실험판 DB 정의

이 폴더의 `INBAPS_*` 스키마는 이전 SQLite/체험 구현을 재현·비교하기 위한 **참조 보관본**입니다. 앱 SQL 로더, 버전 migration, 새 DB 설치에서 사용하지 않습니다.

`V001__baseline.sql` 원본 SHA-256:

```text
12472293754a84a80e300c3e3fa5321783dd094fe582b1a20f9932d481e9cef6
```

원본 V001·SQLite 정의·생성 계약·템플릿·설치 결과를 보존했습니다. 기존 원격에 IN-BAPS 전용 오브젝트가 없는 것을 확인한 뒤 활성 `database/DDL/`을 새 회원 플랫폼의 `INIT$_<유형>_BAPS_*` 구조로 구성했습니다. 기존 IN-EDITAONE 테이블을 변경하거나 이전 실험판 데이터의 자동 이관을 수행한 기록이 아닙니다.

현재 설치는 [database/DDL/install_oracle.sql](../../../database/DDL/install_oracle.sql), 최신 구조는 [REAL_DATABASE.md](../../architecture/REAL_DATABASE.md)를 따릅니다. 이 보관본을 새 스키마에 실행하거나 활성 이력 체크섬과 혼합하지 않습니다.

