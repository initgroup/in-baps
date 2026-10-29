# C/R/V 기능 확장 검증 · 2026-10-29

## 구현·적용

- C-BAP: 등록 API의 GET/POST·Query/Header/Body·JSON/Form 요청, JSON/XML 매핑, 테스트·TARGET 누적 적재·배치·이력.
- R-BAP: 기존 4종과 고급 16종, 진단/해석/표본/가정·실행 이력·CSV/JSON.
- V-BAP: 14종 차트의 원본 행 드릴다운·검색·정렬·페이지·CSV·행 상세.
- SYSTEM `INIT$BASE03`에 V002의 테이블 3개와 명시적 인덱스 4개를 적용했다. V001 체크섬은 유지했다.
- V002 적용 후 반복 설치를 두 번 실행하고 8개 SYSTEM 테이블 전체 행의 정규화 해시를 비교했다. 기존 값과 적용 이력 시각이 보존되었다.
- 로컬 `http://127.0.0.1:9000` 서비스를 새 코드로 재시작했다.

## 자동 검사

| 구분 | 결과·범위 |
|---|---|
| Python 전체 `*_test.py` | 101개 통과. SQLite·가짜 Oracle 드라이버를 사용한 인증/소유권·수집/배치·보안·통계 수치·기존 기능 회귀 |
| Playwright 전체 | 18개 통과, 1.7분. 프로세스 종료까지 정상 완료 |
| 차트 모델 | 기존 4개 + 드릴다운 9개, 13개 통과 |
| 프론트 구문 / Python compileall / pip check | 통과 |
| DB 계획 | V001 11문장, V002 7문장; 적용 후 두 버전 APPLIED 확인 |
| 설치 재현 | 루트·참조 requirements/lock 동기화, Windows와 Linux Python 3.12 wheel·SHA 목록 준비 |

브라우저 검사는 기존 로그인·독립 모듈·DBMS 계약 13개, 새 C-BAP 계약 4개, 고급 통계 1개로 구성한다. C UI는 실제 격리 회원/세션을 사용하고 외부 API·TARGET 응답만 모의한다. 실제 적재는 아래 별도 검사로 검증했다. 테스트 계정 생성이 한 서버의 실제 가입 시도 한도를 넘지 않도록 기능별 테스트 서버를 분리했다.

V-BAP 추가 브라우저 검사에서는 실제 막대 클릭에 해당하는 130개 원본 행, 50/100행 페이지 제한, 셀·전체 행 팝업의 HTML escape, 필터 CSV 수식 방어, 중복 좌표 산점도의 정확한 원본 행, 모바일 가로 넘침·화면 이동 정리를 확인했다. 브라우저 JavaScript 오류는 없었다.

## 실제 공개 API·Oracle

`tests/collection_oracle_live.py --run`을 명시적으로 실행했다. 전용 QA analyst·소유 TARGET 연결을 만들고 World Bank 한국 GDP API의 실제 JSON/XML을 사용했다. 고객 테이블을 수정하지 않았다.

1. API 테스트가 성공하고 TARGET 테이블·실행 이력을 만들지 않음을 확인했다.
2. JSON 5행을 두 번 적재해 물리 10행·서로 다른 실행 2개·유지되는 카탈로그 ID를 확인했다.
3. 등록한 QA 배치의 예정 시각만 조정한 뒤 별도 Python worker를 `--job-id`로 실행했다. 5행 추가 후 15행이 되었으며 즉시 재실행은 0건이었다.
4. 배치를 정지한 뒤 예정 시각을 다시 과거로 지정해도 실행되지 않았다. 검사 종료 시 QA 배치는 비활성화했다.
5. XML도 5행씩 두 번 적재해 물리 10행과 정상 XML 원문 CLOB을 확인했다.
6. TARGET 카탈로그 상세가 실제 추가 행을 재조회함을 확인했다.
7. 위 JSON 15행으로 고급 기술통계를 실행해 Oracle 결과 저장, 결과 본문을 제외한 요약 이력, 원래 결과와 같은 상세 재조회를 확인했다.

검증용 TARGET은 `INIT$_TB_BAPS_C_API_6F7FC010684C`(JSON 15행), `INIT$_TB_BAPS_C_API_23EAAB7DCE8A`(XML 10행)다. QA 회원에게만 연결되어 있으며 자동으로 일반 회원에게 노출하거나 샘플로 등록하지 않았다. 로컬 상세 보고서·구조 기록은 `.runtime/qa/collection-oracle-functional.json`, `.runtime/ddl/`에 있다. 자격증명과 원문 응답은 검증 보고서에 기록하지 않았다.

## 수정·방어를 확인한 항목

- DNS 혼합/사설·메타데이터 주소, TLS 호스트 검증, 리디렉션·압축·과대 응답 차단. 느린 헤더/청크 읽기도 전체 제한 시간으로 종료.
- XML 엔티티·DTD 차단, 필드/행/페이지/중첩 제한, 문자열·정밀 숫자 정책.
- 인증값 암호화와 비밀값 재사용의 회원 소유 검증, Pydantic 오류의 비밀 입력 반사 차단, 응답에 반사된 토큰·JSON 비밀값 제거.
- 수동/배치 동시 실행, 다음 예정 시각의 원자적 갱신, 불명확한 TARGET 결과 잠금 유지.
- 같은 오래된 잠금을 두 번 해제해도 새 실행을 손상시키지 않는 토큰·만료 시각 조건.
- TARGET 소유 표식과 실제 NUMBER 정밀도/scale·문자 길이·NULL/PK 구조 검증.
- 통계 참조 수치, 결측·상수·분리·공선성·실패 조건, 훈련 표본에만 적합하는 홀드아웃, 저장 결과와 화면 활성 표시 일치.

## 배포 범위와 제한

Render용 Web + Cron Blueprint, 같은 런타임 의존성, 별도 worker 명령을 준비했다. Linux wheel 다운로드 성공은 Render에서 빌드·실행했다는 뜻은 아니다. **Git push, Render 서비스 생성·배포·예약 실행은 수행하지 않았다.** Cron에는 Oracle Secret Files와 웹과 같은 암호화 키/DB 접속값을 준비해야 한다.

SYSTEM/TARGET 지원 DBMS는 Oracle이며 다른 Oracle 스키마에 설치 SQL·migration·TARGET 템플릿으로 재현한다. PostgreSQL/MySQL 어댑터까지 구현한 것은 아니다. API의 원천 업무 키 중복 제거·커서 페이지·OAuth 자동 갱신과 통계 패키지 전체 기능 호환은 범위 밖이다. 기능별 제한은 [운영 안내](architecture/COLLECTION_ANALYTICS.md)를 따른다.
