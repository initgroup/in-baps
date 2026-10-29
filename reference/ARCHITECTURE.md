# IN-BAPS 구조와 데이터 계약

> 초기 실험판의 설계 이력을 보존한 문서입니다. 아래의 자동 체험·SQLite 중심 설명과 INBAPS_* 이름은 현재 서비스 계약이 아닙니다. 회원/SYSTEM/TARGET 개편의 최신 구현은 [REAL_DATABASE.md](architecture/REAL_DATABASE.md)를 따릅니다.

작성 기준: 2026-10-29, 초기 구현. 참고 사이트의 제품 비전은 [이미지·본문 조사](INBUPS_RESEARCH.md)에, 설치와 배포는 [환경 안내](environment/README.md)에 별도로 기록한다.

## 독립 모듈

```text
CSV / JSON ── C-BAP 가져오기 ──┐
CSV / JSON ── R-BAP 직접 입력 ─┼── 사용자별 데이터 카탈로그
CSV / JSON ── V-BAP 직접 입력 ─┘           │
                              ┌───────────┴───────────┐
                              R-BAP 분석             V-BAP 시각화
                              결과·매개변수 저장      차트 사양 저장
```

데이터셋은 수집 작업의 하위 객체가 아니라 독립 자원이다. R-BAP·V-BAP은 자신을 입력 모듈로 지정해 동일한 등록 API를 사용한다. C-BAP을 비활성화해도 두 경로가 열려 있다. `BAPS_MODULES`는 API 실행 권한을 제어하며 데이터 원본이 어느 모듈에서 생성됐는지는 계보 정보로 보존한다.

R-BAP 결과는 원본 데이터셋 ID와 분석 매개변수를 보존한다. 사용자가 분석 결과의 시각화 동작을 선택하면 통계 프로파일은 숫자 통계표, 상관분석은 계수 행렬, 집계·텍스트 빈도는 이름-값 표로 변환해 V-BAP용 데이터셋을 만들고 차트에 연결한다. 외부 분석 엔진 간 자동 ETL 오케스트레이션은 구현하지 않았다. V-BAP의 직접 입력은 R-BAP 분석 실행을 요구하지 않는다.

## 층별 역할

| 층 | 파일 | 역할 |
|---|---|---|
| 셸·탐색 | `frontend/index.html`, `config/menu.config.js` | 메뉴와 페이지 연결 |
| 페이지 | `frontend/pages/M*.html`, `frontend/js/M*.js` | 개요·수집·분석·시각화·카탈로그·관리 |
| 공통 UI | `frontend/js/core.js`, `charts.js` | 요청·상태·입력·차트 매핑 |
| ASGI | `main.py`, `backend/middleware.py` | 정적 프론트만 제공, 요청 크기·호스트·보안 헤더 |
| API | `backend/api.py` | 모델 검증·모듈·세션·소유권 경계 |
| 분석 | `backend/analytics.py` | 프로파일·집계·상관·토큰 빈도 |
| 인증 | `backend/auth.py` | PBKDF2 암호·DB 세션·CSRF·관리자 권한 |
| 저장 | `backend/database.py`, `database/SQL/*.sql` | SQL ID·바인딩·트랜잭션·SQLite/Oracle |
| 이관 | `backend/migrate.py`, `database/DDL/`, `database/ALT/`, `database/DML/` | Oracle 명시적 생성·버전·체크섬·내보내기 |

참고 프로젝트의 메뉴 코드·파일 분리·외부 SQL·서버 권한 패턴을 가져왔으며, 그 대형 업무 모듈을 통째로 복사하지 않았다. 새 앱은 IN-EDITAONE 폴더를 import하거나 해당 서버에 의존하지 않는다.

## 데이터 계약

데이터셋: `id`, `name`, `source`, `module`, `description`, `row_count`, `columns[{name,type}]`, `rows`, `created_at`. 소유자는 DB `OWNER_ID`로 저장하며 요청 본문에서 받지 않는다. CSV의 문자열은 원본대로 보존하고 숫자 계산 시 변환한다. 선행 0 문자열은 코드로 간주해 숫자에서 제외한다. 날짜 유형은 실제 달력상 유효한 ISO 일자에만 부여한다. 프론트 데이터 선택은 지원 한도 20,000행 전체를 가져오며 개별 차트의 범주 상한은 차트 안내에 표시한다.

분석: 원본 `dataset_id`·이름, `method`, `parameters`, `result`, 생성시각을 저장한다. `profile`은 결측률과 통계, `aggregate`는 범주별 합계·평균·건수·최솟값·최댓값, `correlation`은 쌍별 유효값을 사용한 Pearson 계수, `text`는 한글·영문·숫자 토큰 빈도다. 분산 없는 컬럼이나 유효 쌍 3개 미만은 상관계수를 `null`로 반환한다.

시각화: `name`, `dataset_id`, 허용된 `chart_type`, 필드 매핑 `config`를 저장한다. JavaScript 함수나 임의 SQL을 저장·실행하는 계약은 아니다. 원본을 사용하는 저장 시각화가 있으면 데이터셋 삭제를 차단한다. 저장된 대시보드가 참조하는 시각화도 삭제를 차단한다.

API는 `{status:"success",data:...}` 응답을 사용한다. 입력 오류는 422, 인증은 401, 모듈·권한·CSRF 오류는 403, 소유 자원 부재는 404, 참조 충돌은 409다. 예상하지 못한 내부 오류는 일반화한 메시지로 응답한다.

## 주요 API

| 목적 | 경로 |
|---|---|
| 상태·로그인 옵션 | `GET /api/health`, `GET /api/auth/options` |
| 로그인·세션 | `POST /api/auth/demo`, `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout` |
| 데이터 | `GET/POST /api/datasets`, `POST /api/datasets/import`, `GET/DELETE /api/datasets/{id}`, `GET /api/datasets/{id}/export` |
| 분석 | `POST /api/analysis`, `GET /api/analyses` |
| 시각화 | `GET/POST /api/visualizations`, `PUT/DELETE /api/visualizations/{id}` |
| 대시보드 | `GET/POST /api/dashboards` |
| 개요·관리 | `GET /api/overview`, `GET /api/system` |

API의 데모·로그인 외 변경 요청은 `X-CSRF-Token`을 요구한다. 현재 `/docs`는 개발환경에서만 제공한다.

## 저장과 규모

SQLite와 Oracle은 같은 논리 스키마를 사용한다. 사용자·세션은 독립 테이블, 데이터셋·분석·시각화·대시보드는 `INBAPS_RECORDS`의 구분값과 JSON payload로 관리한다. Oracle은 CLOB 바인딩을 사용하며 데이터셋 조회용 뷰도 파일로 관리한다.

이 구성은 초기 탐색·의사결정 인법스를 빠르게 실행하기 위한 것이다. 대용량 데이터 웨어하우스·분산 처리·백그라운드 작업 큐·실시간 스트리밍은 없다. 데이터셋당 20,000행·100컬럼·10MiB 제한에서 서버 메모리 분석을 수행하며, 큰 데이터는 향후 외부 테이블·오브젝트 저장소·작업 큐로 계약을 확장해야 한다.

Oracle 설치는 versioned DDL의 명시적 실행이다. SQLite의 개발 자동 생성과 구분한다. 기존 IN-EDITAONE의 DB 이름·계정 설정 형식은 호환되지만 `INIT$_*` 업무 객체와 데이터는 사용하지 않는다.

## 이후 확장 지점

외부 API/SNS/크롤러는 공통 데이터셋 계약을 생성하는 별도 수집 어댑터로, R·BI 연계는 동일 계약을 소비하는 별도 어댑터로 추가한다. 네트워크 요청 허용 정책, 비밀정보 저장, 재시도·스케줄·실행 이력이 구현되기 전에는 연결 완료로 표시하지 않는다. 참고 사이트의 기능 목록은 [조사 문서](INBUPS_RESEARCH.md)의 요구 후보이며 현재 기능 목록과 구분한다.
