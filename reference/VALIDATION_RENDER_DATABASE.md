# Render 로그인 DB 오류 진단

진단일: 2026-10-29

## 확인한 사실

- 공개 `https://in-baps.onrender.com/api/health`와 `/api/auth/options`는 HTTP 200이다. 미인증 `/api/auth/session`의 401은 정상이다.
- 같은 관리자 계정의 로그인은 로컬 Oracle 서비스에서 200, Render에서 500이다. Render의 브라우저 메시지는 공통 오류이므로 실제 ORA/DPY 코드가 포함되어 있지 않다.
- 로컬은 Oracle Cloud Thin 모드 + TNS 별칭 + Wallet으로 연결한다. 읽기 전용 진단에서 Oracle 접속과 회원/세션 테이블 접근이 정상이다.
- 사용자가 Render에는 환경변수만 등록하고 Wallet Secret Files를 등록하지 않았다고 확인했다. 현재 접속 방식에 필요한 Wallet/TNS 파일이 누락된 것이 확인된 설정 문제다.

## 조치

- Git 제외 `.local/render-secret-files/`에 로컬 접속에 쓰는 `tnsnames.ora`, `ewallet.pem` 사본과 등록 안내를 준비했다. 공개 소스에는 Wallet이나 비밀번호를 추가하지 않았다.
- Render Secret Files에 두 파일을 각각 등록하고 `DB_WALLET_PATH=/etc/secrets`, `DB_MODE=cloud`, `DB_ORACLE_MODE=thin`으로 설정한다. DB 계정/DSN/Wallet 비밀번호도 로컬과 일치시킨 뒤 재배포한다.
- 공개 진단 도구 `scripts/check_database.py`는 설정값을 숨기고 존재 여부, 오류 코드, 읽기 전용 접속과 로그인 테이블 접근을 확인한다. 로컬 실행 결과는 OK다.

Render 비공개 로그/환경을 직접 읽을 수 있는 연결이 없어 Render 설정 변경은 수행하지 않았다. 원격 DB 로그인 성공은 파일 등록과 재배포 후 추가 확인이 필요하다. 다른 설정 오류가 함께 존재하는지는 아직 확인되지 않았다.

## 근거

- Render Secret Files 경로/적용 방식: https://render.com/docs/configure-environment-variables
- python-oracledb Thin Wallet 접속: https://python-oracledb.readthedocs.io/en/v3.4.1/user_guide/connection_handling.html
