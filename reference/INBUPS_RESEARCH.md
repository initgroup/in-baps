# IN-BAPS 참고 조사 및 이미지 분석

조사일: 2026-10-29 (Asia/Seoul). 대상: [인아이티 인법스 소개 페이지](https://initgroup.kr/solutions/inbups/index.html).

이 문서는 기존 제품 설명을 새 시스템 설계의 근거로 정리한 참조 자료이다. 구현 완료를 의미하지 않는다. 이미지 속 이전 제품의 제약이나 제휴·서비스 명칭은 새 구현의 지시 또는 현재 제공 기능으로 간주하지 않는다.

## 조사 범위와 보관

- 페이지 HTML의 모든 `img` 3개, Open Graph 이미지, 공통 로더, 공통 헤더·푸터 템플릿, 페이지에 로드되는 CSS 7개, 장식용 JavaScript를 확인했다.
- 본문 제품 이미지 3개는 모두 내려받아 실제 픽셀을 열어 읽었다. Open Graph 이미지는 V-BAP 이미지와 중복된다.
- 헤더·푸터의 공통 로고 1개, 현재 히어로 배경 1개를 추가로 열어 확인했다. CSS에 남은 이전 배경 2개와 SVG 장식 2개도 보관·분석했다.
- 사용자 첨부 캡처의 세 모듈 구성과 페이지의 HTML/CSS 기반 파이프라인을 함께 확인했다. 파이프라인과 대시보드 미니 차트는 원본 이미지 파일이 아니라 HTML/CSS/인라인 SVG이다.
- `inbups/manifest.json`에 출처 URL, 저장 파일명, 바이트 수, SHA-256을 남겼다. 파일은 참조 자료이며 정적 서비스 디렉터리에서 제공하지 않는다.
- 웹 읽기 도구는 대상 주소를 열지 못했으므로 HTTPS 원문을 직접 다운로드해 조사했다. 실제 브라우저의 계산된 스타일을 캡처한 감사는 아니며, 배경의 활성 여부는 페이지 클래스와 CSS 선언 순서 분석에 근거한다.

## 이미지별 판독

| 원본 / 로컬 파일 | 실제 이미지 내용 | 새 시스템 반영 |
|---|---|---|
| [C-BAP](https://initgroup.kr/assets/images/reference/in-baps/c-bap-collection.png), `inbups/c-bap-collection.png` | 1067×749. 주황색 C-BAP 원형 표시. 정형·비정형 입력을 구분하고 공공 API, SNS, 웹 페이지·쇼핑몰·게시판·블로그를 입력원으로 나열한다. | 수집 출처를 기록하고 데이터 형식과 수집 수단을 분리한다. 인증·주기 수집·중복 처리 기능은 실제 구현 범위에 맞춰 명시한다. |
| [R-BAP](https://initgroup.kr/assets/images/reference/in-baps/r-bap-analysis.png), `inbups/r-bap-analysis.png` | 1056×615. 청록색 R-BAP. R 패키지 기반 텍스트·관계·토픽·감성 분석과 기초·고급 통계가 Hybrid Data Analysis로 합류한다. 하단에 SAS 검증 관련 기존 설명이 있다. | 기초 통계, 관계, 텍스트를 별도 분석 유형으로 제공한다. 고급 모델·R 실행·SAS 연계를 실제로 구현하지 않았다면 지원한다고 표시하지 않는다. |
| [V-BAP](https://initgroup.kr/assets/images/reference/in-baps/v-bap-visualization.png), `inbups/v-bap-visualization.png` | 1055×807. V-BAP 원형 표시와 Google Chart, Spotfire/Power BI, R visualization 사례. 시계열·막대·원형·산점·지도·박스플롯·군집·분포 화면을 보여 준다. 우측 제목에 R-BAP으로 표기된 원본 오기가 있다. | 엔진보다 데이터 유형과 판단 목적에 맞는 그래프 선택을 앞세운다. 제품명은 V-BAP으로 통일하고 통계량과 차트의 입력을 연결한다. |
| [브랜드 로고](https://initgroup.kr/assets/images/brand/init-logo.png), `inbups/assets__images__brand__init-logo.png` | 3048×861. 두 청색의 iNIT 워드마크와 결합 심벌. 헤더·푸터에서 같은 파일을 사용한다. | 브랜드 계열 색상을 참고한다. IN-BAPS 자체 탐색 구조를 별도로 구성한다. |
| [현재 히어로](https://initgroup.kr/assets/brand-2026/solutions.webp), `inbups/assets__brand-2026__solutions.webp` | 밝은 사무실, 차트와 산점도가 보이는 모니터, 서버 랙. 실제 분석 데이터의 결과가 아니라 소개용 장식이다. | 운영 화면에서는 장식 이미지보다 실제 데이터 차트에 공간을 배정한다. |
| [이전 솔루션 히어로](https://initgroup.kr/assets/images/menu-heroes/solutions-hero-desktop-v2.png), `inbups/assets__images__menu-heroes__solutions-hero-desktop-v2.png` | 남색 배경 위 연결된 플랫폼·데이터베이스·차트·보안 심벌의 청록색 일러스트. | 통합 모듈 연결의 개념 자료. 현재 `design.css` 히어로 선언이 덮어쓴다. |
| [이전 프로세스 배경](https://initgroup.kr/assets/images/section-backgrounds/solutions-operating-path-dark.png), `inbups/assets__images__section-backgrounds__solutions-operating-path-dark.png` | 남색 격자와 점·빛의 흐름. 텍스트나 제품 기능 정보는 없다. | 장식 자료. 이 페이지의 `.init-light::before` 규칙이 배경을 제거한다. |
| `inbups/assets__images__design-system__wave-lines.svg` | 청색·청록색 곡선 5개와 빛나는 점 3개. SVG 경로와 색상 선언을 확인했다. | 이전 히어로의 파형 장식. 현재 배경 선언에 의해 대체된다. |
| `inbups/assets__images__design-system__grid-dark.svg` | 64×64 반복 격자. 제품 정보 없음. | 이전 히어로 배경의 격자 장식. 현재 배경 선언에 의해 대체된다. |

공통 CSS에 있는 회사·서비스·프로젝트·채용·홈 전용 이미지의 선택자는 이 페이지와 일치하지 않는다. 이들은 대상 페이지 이미지 집합에서 제외했다. 공통 `design.js`의 동적 사진 삽입 역시 회사·연락처 전용 선택자이며 인법스 페이지에는 일치하지 않는다. 장식용 작은 SVG 아이콘은 코드로 정의된다.

## 기능과 구조 해석

현재 본문은 수집·분석·시각화 모듈을 업무 목적과 데이터 환경에 맞게 구성하고 모듈별 독립 목적을 수행한다고 설명한다. 공공 행정 지표, 금융 지표·리스크 검토, 제조·수요 판단을 예로 든다. 소개 페이지의 샘플 KPI 숫자는 실측 성과나 실제 시스템 데이터가 아니다.

이전 이미지에는 R-BAP 입력을 C-BAP 산출물, V-BAP 입력을 R-BAP 산출물로 한정하는 설명이 있다. 새 프로젝트에서는 사용자의 2026-10-29 요청을 우선하여 아래 계약으로 개선한다.

```text
CSV / JSON / 기존 데이터 ──────────┬── R-BAP 분석 ──┐
                                 ├── V-BAP 시각화 │
API / 수집 채널 ── C-BAP ── 데이터 카탈로그 ──────┤
                                                  └── IN-SIGHT 화면
```

- 공통 데이터 계약: 이름, 출처, 열 목록·유형, 행 데이터, 소유자, 생성 시각, 품질 프로파일.
- C-BAP은 카탈로그를 만드는 한 방법이며 필수 선행 단계가 아니다.
- R-BAP은 직접 업로드 또는 카탈로그 선택으로 시작한다. 분석 결과에 원본 데이터 ID와 매개변수를 남겨 재현한다.
- V-BAP은 직접 입력, 공통 카탈로그, 분석 결과 모두를 입력 후보로 갖는다. 그래프 사양은 엔진 옵션 전체를 무제한 실행하는 방식 대신 검증된 필드·유형 매핑으로 저장한다.
- UI의 색상 정체성은 C-BAP 주황, R-BAP 청록, V-BAP 보라를 유지하되 공통 데이터 선택·내보내기·상태 표시를 일관되게 제공한다.
- 수집이 없는 R-BAP과 C/R이 없는 V-BAP 흐름을 각각 검증해야 한다.

## IN-EDITAONE 참조 패턴

읽기 전용으로 `D:\work\in-editaone\AGENTS.md`, `frontend/config/menu.config.js`, `frontend/js/app.js`와 프론트 디렉터리를 조사했다.

| 기존 패턴 | IN-BAPS 적용 방향 |
|---|---|
| `frontend/index.html` 셸 + `frontend/pages/{PAGE}.html` + `frontend/js/{PAGE}.js` | 정적 셸과 페이지 모듈 분리, 페이지 초기화·정리 수명 주기 유지 |
| `window.MENU_CONFIG`에 type, page, title, label, enabled, children 선언 | 메뉴를 한곳에서 관리하고 `M00001`, `M01001` 등의 페이지 코드 규칙 사용 |
| `PageManager`의 비동기 로드 병합·탐색 버전 | 이전 페이지의 늦은 응답이 현재 화면을 덮어쓰지 않도록 보호 |
| `/api` 상대 경로, 공통 fetch timeout | 로컬과 Render에서 동일한 프론트 자산 사용 |
| 페이지별 CSS 및 공통 CSS | 기본 토큰·레이아웃은 공유하고 모듈별 스타일의 범위 제한 |
| 서버 세션·DB 기반 권한, 프론트 메뉴 숨김은 보조 수단 | 서버에서 인증·인가·CSRF를 강제; 브라우저 저장값을 권한 근거로 사용하지 않음 |
| 참조 파일과 배포 파일 디렉터리 분리 | 내려받은 소개 이미지·원문은 `reference/`에만 보관 |

기존 시스템의 `INIT$_*` 테이블 이름이나 저장된 메뉴 코드는 기존 제품의 호환 계약이다. 새 시스템이 같은 DB 자격증명을 사용하더라도 기존 객체를 무분별하게 변경하거나 기존 제품 데이터를 자신의 데이터로 취급하지 않는다.
