# IN-BAPS 초기 구현 검증

> 이 문서는 회원/SYSTEM/TARGET 개편 전 초기 구현의 검증 이력입니다. 자동 체험 기반 UI·SQLite 검증을 현재 Oracle 전체 흐름의 성공으로 해석하지 않습니다. 현재 상태는 [README.md](../README.md)와 [REAL_DATABASE.md](architecture/REAL_DATABASE.md)의 검증 상태를 확인하세요.

검증일: 2026-10-29, Asia/Seoul. 로컬 Windows / Python 3.12 / Node 24 / Chromium에서 확인했다.

## 결과

| 구분 | 결과 | 확인 범위 |
|---|---|---|
| Python 회귀 | 10개 통과 | 실제 CSV/CP949/JSON 가져오기, 잘못된 입력, 통계·집계·상관·빈도, 세션·CSRF·소유권·관리자, 독립 모듈, 프록시 origin, migration 부분 실패 |
| 백업 회귀 | 2개 통과 | 사용자 지정 데이터 경로의 소스 제외·스냅샷 포함, DB 값 보존, 프로젝트 외부 경로 차단 |
| 차트 계산 회귀 | 4개 통과 | 결측·숫자 정책, 평균, 관계망·게이지 집계, 20,000행 범주 제한, 수치 없는 데이터의 안내 |
| Playwright UI | 7개 시나리오 통과 | 개요·필터·메뉴·모바일, 4분석, 14차트·PNG·저장/재열기/삭제, C 파일/JSON, R 단독 입력/분석, V 단독 입력/저장, 4분석 결과의 V 연결 |
| 정적 검사 | 통과 | 프론트 JS 문법, Python compileall, PowerShell 구문 |
| 운영 | 통과 | 다른 작업 폴더에서 단축명령 호출, 시작/중지/재시작/상태, Git 배포 미리보기, 소스/SQLite 백업 |
| 환경 재현 | 통과 | 프로젝트 venv, pip check, Python 오프라인 패키지 설치, 별도 폴더 npm offline ci |

UI 최초 6개 시나리오와 이후 추가한 R→V 1개를 실행했다. 최종 글자 크기·사이드바·계기 카드 수정 뒤에는 개요·메뉴·모바일 시나리오를 재검증했다. 콘솔 및 CSP 오류가 없었으며 대시보드는 데스크톱 1440px, 모바일 390px에서 수평 넘침 없이 표시되었다.

샘플 데이터는 합성 예제다. 개요의 지표와 차트는 선택한 데이터에서 계산한다. 실제 추이를 뜻할 수 있는 장식용 KPI 스파크라인은 사용하지 않는다. 사용자 입력은 escape하고 차트 툴팁은 richText로 렌더링한다.

## 재실행

```powershell
.\venv\Scripts\python.exe -m unittest discover -s tests -p '*_test.py' -v
npm.cmd run check
npm.cmd run test:charts
npm.cmd run test:ui
.\venv\Scripts\python.exe -m backend.migrate plan
```

Playwright는 8011~8013 포트와 매 실행 별도 `.runtime/ui-test-*` SQLite를 사용한다. 8010 서비스와 사용자 데이터를 변경하지 않는다. 테스트용 브라우저가 없는 PC에서는 `npx playwright install chromium`이 필요하다. 테스트 종료 시 테스트 서버는 정리된다.

최신 화면 기록은 `.runtime/qa/dashboard-desktop.png`, `.runtime/qa/dashboard-mobile.png`다. 런타임 검증 산출물이므로 Git에 포함하지 않는다.

## 아직 실환경에서 확인하지 않은 범위

- Oracle 실 DB 연결·DDL 실행·데이터 입출력. SQL 계획·분할·체크섬과 실패 복구 차단은 오프라인/가짜 드라이버로 확인했다.
- 실제 Git 원격 push, Render 서비스 생성 및 공개 배포. 이후 사용자가 지정한 `https://github.com/initgroup/in-baps.git`을 로컬 `origin`에 연결했지만 커밋·push는 수행하지 않았다. 별도 IN-BAPS Render 서비스는 아직 지정되지 않았다.
- 외부 Open API·SNS·크롤러 자동수집, R 실행기, 감성·토픽 모델, 외부 BI 연계. 현재 제공되는 기능이 아니며 별도 구현 대상이다.

이 기록은 구현한 로컬 범위의 기능 검증이며, 대규모 부하 시험·외부 보안 감사·상용 운영 승인 결과가 아니다.

## 로컬 포트 9000 및 반복 초기 설치 SQL

- 로컬 시작·재시작 기본 포트를 9000으로 변경하고 실제 서비스를 재시작했다. `http://127.0.0.1:9000/api/health`에서 HTTP 200을 확인했다. 이전 8010 기록은 당시 검증 주소다. Render 시작 명령의 `$PORT`는 그대로다.
- `database/DDL/install_oracle.sql`을 반복 실행용 초기 설치 진입점으로 생성했다. V001 원본 SQL과 체크섬을 보존하며 테이블·컬럼·제약·인덱스를 확인하고 뷰와 초기 이력을 관리한다.
- 설치 파일/생성 소스 일치, 원본 DDL 인용 보존, 단일 PL/SQL 블록, 부모 제약의 선행 순서, 필수 대상 스키마와 불일치 차단을 오프라인 검사했다. 총 Python 테스트 16개 통과.
- 원격 Oracle에 이 PL/SQL을 실행하거나 반복 적용한 실 DB 검증은 하지 않았다. 구문 생성·호출 경계 검증을 실 DB 컴파일/실행 검증으로 간주하지 않는다. 실제 적용은 사용자가 연결 계정의 권한·quota와 기존 구조를 확인한 뒤 수행해야 한다.

## 터미널·DB 파일 구분 개편 검증

- `.local/ops/`로 운영 PS1을 이동하고 `.vscode/` 자동 터미널 설정과 함께 Git 제외 확인. 배포 후보에 PS1이 없는 것을 확인했다.
- venv가 없는 `.runtime/terminal-first-run/`에서 Python 3.12로 자동 생성, 로컬 wheel 설치, 활성화, Python 경로와 단축 명령을 확인했다. 다시 실행했을 때 생성·설치를 반복하지 않았다.
- 현재 프로젝트에서도 가상환경 활성화와 명령 등록을 확인하고 `C:\Windows`로 작업 폴더를 바꾼 뒤 서비스 재시작·상태·Git 미리보기·백업을 실행했다. 서비스는 8010에서 정상 응답했다.
- 백업 ZIP에 `.local/ops/`와 `.vscode/settings.json`이 포함되고 `.env`·wallet은 제외된 것을 확인했다.
- DDL/ALT/DML 전역 버전 정렬, 중복 버전 차단, 예시 파일 제외, 초기 DDL 체크섬 보존과 기능별 SQL 16개 로딩을 검증했다. Python 테스트는 API 10개·백업 2개·SQL 분류 2개로 총 14개 통과했다.
- 로컬 PS1 전체 구문 검사와 프론트 문법 검사 통과. Oracle 실 DB 적용과 Git push는 실행하지 않았다.
