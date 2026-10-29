# 사용자 오브젝트 명명 규칙 구분

검증일: 2026-10-29

`INIT$_<유형>_BAPS_*`는 IN-BAPS 시스템 오브젝트 규칙이며 M90003의 사용자 테이블에 강제하지 않는다.

## 반영

- 새 테이블 입력창의 접두어 패턴, 컬럼 이름의 대문자 패턴을 제거했다.
- 서버 CREATE TABLE 경로에서 `INIT$_TB_` 형식 검사를 제거했다. 이름은 입력한 대소문자·한글·공백을 보존하여 하나의 SQL 식별자로 인용한다.
- 사용자 테이블 기본 키에는 `INIT$_PK_BAPS_*` 이름을 생성하지 않고 DB 자동 이름을 사용한다.
- API 테이블·컬럼 이름의 문자 제한을 UI와 같은 128자로 맞추고, 실제 SQL 생성 전 기존 UTF-8 128바이트 검사를 적용한다.
- SYSTEM 보호, 연결 소유권, 쓰기 권한, DDL 파일 기록과 생성 테이블 소유 등록은 유지한다.
- SYSTEM 설치 DDL과 기존 DB 오브젝트는 변경하지 않았다.

## 검증

- `venv\Scripts\python.exe -m unittest discover -s tests -p target_test.py -v`: 16개 통과.
- 새 회귀: `SALES`, `TB_CUSTOMER`, `sales_detail`, `매출 내역`, 128자 이름의 API 모델·DDL 실행 전달·소유 등록·인용 SELECT 검사. 시스템 보호 이름, 읽기 전용 연결, NUL·바이트 초과 차단. 컬럼 식별자 인용으로 SQL 문장이 분리되지 않는지 확인.
- `npm.cmd run check`: 통과.
- Playwright 관련 2개 통과: `SALES_UI_CHECK` 생성 요청, `고객 메모` 컬럼 추가, 테이블·컬럼 HTML 패턴 제거, 모바일 입력창 및 레이어 동작.
- 관리자 비밀번호 배포 제외 검사 통과.

서버 테스트의 TARGET 실행은 가짜 Oracle 커서로 SQL 전달을 검사하고, 브라우저는 격리 SYSTEM 및 모의 TARGET API를 사용한다. 실제 Oracle에 검증용 테이블을 추가 생성하지 않았다.
