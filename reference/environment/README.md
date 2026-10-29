# IN-BAPS 설치 환경과 운영

배포 소스와 환경 재현 자료를 구분합니다. 이 폴더의 `requirements.txt`, `package.json`, `package-lock.json`은 루트 사본이고 `requirements-lock.txt`는 간접 의존성까지 고정한 설치 제약입니다. `python-installed.txt`는 설치 환경 기록입니다. 설치 패키지는 Git 제외 `installers/`에 보관합니다.

## 새 PC와 가상환경

Python 3.12 이상, PowerShell 5.1 이상, Git을 준비합니다. 프론트 자산을 다시 만들 때는 Node.js 22 이상도 필요합니다. 기존 환경의 venv를 복사해서 사용하지 않고 이동한 프로젝트 안에서 다시 만듭니다.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& 'D:\work\in-baps\.local\ops\setup.ps1'
. 'D:\work\in-baps\.local\ops\enter-terminal.ps1'
baps-start
baps-status
```

스크립트는 `$PSScriptRoot`에서 프로젝트 루트를 계산합니다. 기본 Python이 구버전 Anaconda라면 `-PythonPath 'C:\...\Python312\python.exe'`를 지정합니다. 프로젝트 터미널은 `BAPS_PYTHON`도 지원합니다.

VS Code 새 터미널은 `.vscode/settings.json`의 `IN-BAPS PowerShell` 프로필로 venv 생성·필요 의존성 설치·활성화·단축 명령 등록을 수행합니다. 준비된 환경은 다시 만들지 않습니다. 일반 PowerShell은 `.local/open-terminal.cmd` 또는 `enter-terminal.ps1` dot-source로 시작합니다. 자동 터미널 시작은 서비스 시작이나 Oracle DDL을 실행하지 않습니다.

`.local/ops/`의 모든 PS1과 `.vscode/`는 Git에서 제외합니다. 다른 PC의 Git clone에 이 파일은 없으므로 소스 백업에서 두 폴더를 복원하거나 프로젝트 전체를 복사하세요. 전역 PowerShell 프로필은 변경하지 않습니다.

## 고정 의존성과 오프라인 설치

회원/DBMS 구현의 주요 런타임 의존성에는 FastAPI, python-oracledb, cryptography, sqlglot이 포함됩니다. `cryptography==50.0.2`, `sqlglot==30.25.0`까지 루트·참조 requirements·lock에 반영했고 sqlglot wheel과 설치파일 SHA 목록을 갱신했습니다.

```powershell
& .\.local\ops\setup.ps1 -PrepareOffline
# 같은 OS·Python 버전의 다른 PC
& .\.local\ops\setup.ps1 -Offline
```

`frontend/vendor/`가 있으면 사이트 실행에 Node가 필수는 아닙니다. 재구성은 `npm ci`, `npm run vendor`로 수행합니다. npm 오프라인 캐시와 URL·버전·integrity·SHA 목록도 `installers/`에 보관합니다. 같은 캐시를 옮긴 후 `setup.ps1 -Offline -RebuildFrontend`로 복원할 수 있습니다.

API 회귀검사용 패키지는 다음과 같이 설치합니다. Render 런타임과 구분합니다.

```powershell
.\venv\Scripts\python.exe -m pip install -r reference/environment/requirements-dev.txt -c reference/environment/requirements-lock.txt
```

오프라인일 때 `--no-index --find-links reference/environment/installers`를 추가합니다. Playwright Chromium은 npm 의존성과 별도이며 UI 검증이 필요한 PC에서 `npx playwright install chromium`으로 준비합니다.

## SYSTEM 환경과 회원별 TARGET

서비스는 `BAPS_STORAGE=oracle`을 사용합니다. SQLite는 격리 테스트용이며 Oracle 연결 실패를 숨기기 위한 대체 저장소가 아닙니다. 로컬 개발은 `BAPS_ENV=development`, 로컬 URL은 **http://127.0.0.1:9000**입니다.

2026-10-29 해당 주소에서 Oracle 연결 서비스의 관리자 로그인·TARGET 접속·실제 SQL·SYSTEM 화면·로그아웃을 브라우저로 확인했습니다. 로컬 초기 관리자의 `BASE03 · 기본 TARGET` 연결은 준비되어 있으며 데이터셋은 자동 생성하지 않습니다. 다른 회원은 자신의 TARGET을 등록합니다.

| 설정 | 용도 |
|---|---|
| `DB_MODE`, `DB_USER_LOC/CLD`, `DB_PASSWORD_LOC/CLD`, `DB_DSN_CLD`, `DB_HOST/PORT/SERVICE` | SYSTEM Oracle 접속, 참고 프로젝트와 같은 변수 형식 |
| `DB_WALLET_PATH`, `DB_WALLET_PASSWORD`, `DB_ORACLE_MODE`, `DB_CLIENT_PATH` | 프로젝트 내부 wallet·thin/thick 접속 |
| `BAPS_ADMIN_USER`, `BAPS_ADMIN_PASSWORD` | 최초 관리자 생성, 비밀번호 12~256자 |
| `BAPS_SECRET_KEY` | TARGET 비밀번호 암호화, 최소 32자·안정적으로 보관 |
| `BAPS_SESSION_IDLE_MINUTES` | 유휴 만료, 기본 30분 |
| `BAPS_SESSION_MAX_HOURS` | 최대 세션 수명, 기본 8시간 |
| `BAPS_SYSTEM_POOL_MAX` | 프로세스별 SYSTEM Oracle 연결 상한, 기본 4·1~16, 변경 후 재시작 |
| `BAPS_ALLOWED_HOSTS`, `BAPS_PUBLIC_ORIGIN` | 허용 호스트와 정확한 공개 출처 |
| `BAPS_MODULES` | C-BAP/R-BAP/V-BAP 독립 활성화 |

`.env.example`에는 빈 비밀값과 설정 이름만 둡니다. 기존 `.env`·wallet은 로컬 비공개이며 Git에 포함하지 않습니다. 기존 제품 계정·연결·업무 행을 자동 복제하지 않습니다. 현재 초기 관리자 안내는 `secrets/initial-admin.txt`에 생성하며 화면·로그·저장소로 노출하지 않습니다.

TARGET은 로그인한 회원이 DB 연결 설정에서 등록합니다. 비밀번호는 SYSTEM DB에서 암호화하여 보관하고 서버만 복호화합니다. 암호화 키를 새 값으로 교체하면 기존 암호문은 읽을 수 없으므로 DB 복구와 함께 키의 별도 복구 절차를 유지합니다.

SYSTEM 연결 풀은 첫 연결 이후 재사용하며, 최대 대기는 15초, 여분의 유휴 연결 정리는 300초입니다. 최소 연결 1개와 문장 캐시 50개를 사용하고 60초 이상 유휴 연결은 드라이버의 상태 확인을 거칩니다. 서버 worker가 여러 개면 각 프로세스가 별도의 풀을 가지므로 전체 연결 상한은 worker 수와 함께 계산합니다. 회원별 TARGET 연결은 이 풀과 분리합니다. 기존 고정 `oracledb==3.4.2`의 기능을 사용하며 추가 패키지 설치는 필요하지 않습니다.

## DB 설치

SYSTEM 소유자로 [database/DDL/install_oracle.sql](../../database/DDL/install_oracle.sql)을 스크립트 실행하거나 다음을 사용합니다.

```powershell
baps-db-plan
baps-db-status
baps-db-install -Schema 대상스키마
# 이후 신규 버전
baps-db-apply -Schema 대상스키마
baps-db-export
```

`plan`은 연결하지 않습니다. 나머지 명령은 Oracle에 연결하며 설치·적용만 명시적으로 구조를 변경합니다. DBMS 오브젝트는 `INIT$_<유형>_BAPS_*` 규칙으로 만들고 DDL/ALT/DML/SQL/OPS로 파일을 구분합니다. 최초 설치 전에 권한과 기본 테이블스페이스 quota가 필요합니다. 2026-10-29 사용자가 승인한 ADMIN 연결로 SYSTEM 소유 계정의 DATA quota를 100MiB로 설정하여 초기 ORA-01950을 해결했습니다. 이후 반복 설치와 실제 Oracle 회원·TARGET 적재·SQL/DML·분석·시각화·세션 검증을 통과했습니다. 다른 DB로 옮길 때에는 대상 계정의 권한과 quota를 별도로 준비합니다.

## Render

별도 IN-BAPS 저장소와 Render Python Web Service를 연결합니다. 기존 IN-EDITAONE 서비스를 덮어쓰지 않습니다.

- Build Command: `bash scripts/render-build.sh`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health: `/api/health`
- `BAPS_STORAGE=oracle`, `BAPS_ENV=production`, `BAPS_COOKIE_SECURE=true`
- 실제 `BAPS_ALLOWED_HOSTS`, 필요 시 공개 HTTPS `BAPS_PUBLIC_ORIGIN`
- 새로운 관리자 비밀번호·안정적인 암호화 키·Oracle 연결 비밀값

Render 기본 공개 출처는 `RENDER_EXTERNAL_HOSTNAME`에서 구성합니다. 사용자 도메인은 정확한 HTTPS origin을 명시합니다. wallet 파일은 Render의 비밀 파일로 별도 등록하고 `DB_WALLET_PATH`를 맞춥니다. 저장소나 정적 자산에 올리지 않습니다.

현재 Oracle Thin + TNS 별칭 접속은 Secret Files에 `tnsnames.ora`와 `ewallet.pem`을 각각 등록하고 `DB_WALLET_PATH=/etc/secrets`, `DB_ORACLE_MODE=thin`, `DB_MODE=cloud`로 설정합니다. `DB_WALLET_PASSWORD`는 DB 계정 비밀번호가 아닌 Wallet 비밀번호입니다. 환경변수만 등록해도 로컬 Wallet 파일이 Render에 전달되는 것은 아닙니다. 저장 후 새 배포가 완료되어야 변경이 적용됩니다.

읽기 전용 DB 진단은 `python scripts/check_database.py`로 실행합니다. 설정의 존재 여부·Wallet 파일 존재 여부·Oracle 연결·회원/세션 테이블 접근만 확인하며 비밀번호와 설정값은 출력하지 않습니다. `/api/health`는 웹 프로세스의 생존 확인이므로 DB 접속 성공을 보장하지 않습니다.

SYSTEM 설치·quota·회원 생성이 준비되어야 정상 서비스를 사용할 수 있습니다. Git/Render 설정 파일을 준비한 사실을 실제 push·공개 배포 성공으로 간주하지 않습니다. 현재 공개 배포는 검증 완료 상태가 아닙니다.

## 단축 명령·백업

```powershell
baps-start
baps-stop
baps-restart
baps-status
baps-deploy
baps-deploy -Publish -Message 'IN-BAPS member platform'
baps-backup
baps-backup -IncludeData
baps-help
```

Git 원격은 `https://github.com/initgroup/in-baps.git`, 기본 브랜치는 `main`입니다. 배포 스크립트는 저장소·비밀 파일을 검사하고 Python 구문·전체 `*_test.py` 회귀·프론트 문법 검사를 통과한 뒤에만 commit/push합니다. 기본 호출은 검토이며 `-Publish`가 실제 게시입니다.

소스 백업은 `.local/ops/`, `.vscode/`, **`.runtime/ddl/**/*.sql` 생성·변경 기록**을 포함합니다. 그 외 `.runtime/`, `.env`, `secrets/`의 관리자 안내·wallet·암호화 키, DB 파일·로그·원격 Oracle 데이터는 제외합니다. DDL은 구조 자료이며 원격 데이터 백업이 아닙니다.

`-IncludeData`는 `BAPS_DATA_DIR`의 테스트용 SQLite를 일관된 스냅샷으로 추가합니다. Oracle SYSTEM/TARGET 데이터는 별도의 DB 백업으로 관리합니다. 설정 데이터 경로는 프로젝트 내부 실제 하위 폴더로 제한하며 심볼릭 링크·junction을 통한 외부 접근을 차단합니다.

Render의 실행 DDL 기록도 서비스 파일시스템 수명에 영향을 받으므로 필요한 구조 기록은 다운로드·소스 백업·별도 영구 보관 절차로 수집해야 합니다.



터미널 진입 시 `scripts/check_environment.py`가 runtime/dev manifest의 고정 버전과 실제 가상환경 버전을 비교합니다. 누락 또는 버전 불일치가 있을 때만 의존성을 설치합니다. 2026-10-29 현재 SQLGlot을 포함한 설치 파일로 `pip --dry-run --ignore-installed --no-index` 의존성 해결을 확인했습니다.
