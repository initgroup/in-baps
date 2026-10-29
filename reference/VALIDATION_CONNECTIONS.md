# TARGET 연결 방식·상세보기 검증

검증일: 2026-10-29

## 반영

- M90002에 Easy Connect, TNS 별칭, 직접 연결 기술자 선택 및 서버 TNS 목록을 제공한다.
- 일반 연결과 SYSTEM 공유 연결 모두 상세정보 버튼을 제공한다. 일반 연결은 별도 수정 버튼도 노출한다. 공유 연결의 사용자/DSN은 현재 서버 환경설정에서 가져온 읽기 전용 값이다.
- 비밀번호는 보관 상태만 표시한다. 기존 암호/암호문/Wallet 경로나 내용을 상세 API로 반환하지 않는다.
- 새 연결/수정 중 연결 테스트를 제공한다. 저장과 같은 구성 함수를 사용하며 실제 조회 시험만 수행한다. 기존 비밀번호를 재사용할 때 연결 소유권을 확인한다.
- 연결 방식은 기존 CONFIG_JSON에 추가 저장하고 이전 레코드는 DSN에서 판별한다. SYSTEM DDL은 변경하지 않는다.

## 검증

- 신규 연결 회귀 6개: 상세 소유권/비밀 제외, 저장 전 시험의 무저장·CSRF·타 회원 암호 재사용 차단, 새 연결 시험, 서버 TNS 목록의 정보 범위, 공유 연결의 실제 조건, 수정 시 암호 유지.
- 기존 TARGET 회귀 16개 통과. 전체 Python 55개 중 JSON 응답의 공개 필드 검사에서 신규 `connection_type` 반영 누락을 확인했으며, 명시적 허용 필드에 추가한 뒤 해당 6개 회귀를 다시 통과했다. 나머지 Python 검사도 통과했다.
- TARGET 브라우저 검증 4개 통과: C 수집, DBMS 작업, 일반 연결 상세/수정/TNS 선택/저장 전 시험, 공유 연결 상세/시험. 모바일 상세 창의 가로 잘림도 확인했다.
- 실제 9000 서비스에서 공유 연결의 사용자/DSN, 서버 TNS 별칭 5개와 Wallet 준비 상태, 저장 전 실제 Oracle 접속 시험, 기존 연결 레코드 불변을 확인했다. 보고서는 비공개 `.runtime/qa/connection-live.json`에 있다.
- 실제 브라우저에서 공유 연결 상세 및 BASE02 등록 예시 입력을 확인했다. 비밀번호 입력/자동 등록/테이블 생성은 하지 않았다.
- SQLcl의 사용자 지정 BASE02 연결로 사용자·서비스·CREATE 권한 SELECT가 성공했다. 개인 환경 입력값은 Git 제외 `.local/ops/BASE02_CONNECTION.md`에서 안내한다. 이 확인을 앱에서 BASE02 암호로 접속한 것으로 표현하지 않는다.
- JavaScript 구문 검사와 관리자 비밀번호 배포 제외 검사 통과.

TNS/Wallet 처리 근거: [python-oracledb 3.4 연결 안내](https://python-oracledb.readthedocs.io/en/v3.4.1/user_guide/connection_handling.html#tns-aliases-for-connection-strings). 앱은 서버 네트워크 프로필 하나를 사용하며 개별 Wallet 업로드나 SQL Developer 연결 암호 가져오기는 구현하지 않는다.
