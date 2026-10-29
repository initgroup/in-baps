# 공공 API 예제 카탈로그

2026-10-30 KST에 190개 후보를 실제 HTTPS로 조회하여 179개 수집 설정을 확인했다. 19개 분야, 6개 제공기관이며 국가·지표 이름만 바꿔 동일 요청을 중복 등록하지 않는다. 개인키를 받거나 회원 TARGET에 자동 적재하지 않는다.

| 제공기관 | 수집 설정 | 인증 조건 |
| --- | ---: | --- |
| World Bank | 161 | 인증키 불필요. 한국 관측 우선, 유효 관측이 없는 항목은 세계 집계라고 명시 |
| 한국은행 ECOS | 6 | 개인키 불필요. 공개 `sample` 최대 10행, 정식 대량 수집은 본인 키 필요 |
| 미국 지질조사국 USGS | 2 | 인증키 불필요 |
| 미국 해양대기청 NOAA | 4 | 인증키 불필요 |
| 미국 재무부 Fiscal Data | 3 | 인증키 불필요 |
| 미국 항공우주국 NASA EONET | 3 | 인증키 불필요 |

환경·기후, 해양·기상, 금융·물가, 제조·산업, 인구·사회, 경제·성장, 농업·식량, 에너지·전력, 무역·국제수지, 고용·노동, 교육·연구, 보건·의료, 복지·평등, 도시·주거, 교통·물류, 디지털·기술, 서비스·관광, 행정·재정, 안전·재난을 제공한다.

## 실행과 확장

- 실행 스크립트: `scripts/refresh_api_examples.py`. 자신의 경로로 프로젝트 루트를 계산한다.
- World Bank 후보 정의: `worldbank-indicators.tsv`. 제공기관별 후보 정의: `scripts/public_api_catalog.py`.
- 배포 파일: `frontend/config/api-examples.js`. 확인 시점·실제 미리보기·OUTPUT 필드·INPUT·제약·출처를 함께 보관한다.
- 검증 보고서: `verification.json`. 후보 전체 개수와 제외 이유를 기록한다. 실패 항목은 실행 가능한 카탈로그에 노출하지 않는다.
- 갱신: 프로젝트 가상환경 Python으로 `scripts/refresh_api_examples.py --refresh` 실행. `--workers 1`부터 `4`까지는 요청 동시성 설정이며 카탈로그 개수 제한이 아니다.
- 오프라인 검증: `scripts/refresh_api_examples.py --check`.
- 개별 재검증: `--refresh --ids kor-life,bok-base-rate`. 해당 항목만 갱신하고 나머지 검증 결과는 보존한다. 연결 오류 때문에 한국 관측이 없다고 판단하거나 세계 집계로 대체하지 않는다.
- 정의 목록에 새 항목을 추가하고 갱신하면 검색 대상에 자동 포함된다. 50개·100개 같은 카탈로그 상한은 없다. 페이지당 12개 렌더링과 스크롤 높이 제한으로 화면을 유지한다.
- 앱 시작·Render 빌드·목록 검색은 외부 API를 호출하지 않는다. 검증한 정적 카탈로그를 사용한다. 실제 최신 응답은 본인 TARGET을 선택한 후 연결 테스트·등록·수집으로 요청한다.
- 변경한 기간·국가·관측소·페이지 크기는 INPUT/URL에서 편집한다. 런타임의 안전한 수집량·시간·응답 크기 제한은 그대로 적용된다.

## 실제 응답과 제약

World Bank는 2015~2025년 중 수치가 존재하는 최근 최대 5개 관측을 미리보기에 보관한다. 수집 설정 자체는 해당 기간의 결측을 그대로 유지한다. 다른 API는 확인된 응답의 처음 5개 행을 보여준다. 역사 관측과 최신순 조회를 항목별로 구분하고, 행 미리보기에서 생략한 개수와 범위를 표시한다. NASA의 중첩 위치·분류는 JSON 컬럼으로 보존하며 USGS 좌표는 경로로 분리한다.

서울 열린데이터광장은 공식 안내상 공개 `sample` 5건 제한과 정식 인증키 조건이 있다. 기존 공개 HTTP:8088 주소는 현재 수집기의 공개 HTTPS·443 정책과 맞지 않으며, 조사한 HTTPS 호스트도 연결 검증에 실패하여 예제 수에 포함하지 않았다. 공공데이터포털의 서비스별 활용신청·키 조건도 화면의 별도 안내에서 원문을 열어 확인한다. 제한을 없앤 것처럼 표시하거나 인증정보를 대체하지 않는다.

Korea.net RSS 후보는 리디렉션 때문에 제외했다. TLS·SSRF·리디렉션 보호를 완화하지 않았다. 일부 ECOS 표와 World Bank 지표는 유효 관측·레코드 경로가 확인되지 않아 제외했다. 제외된 후보는 새로 갱신할 때 다시 검증한다.

공식 문서:

- [World Bank 인증·API 소개](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation)
- [한국은행 ECOS](https://ecos.bok.or.kr/api/)
- [서울 열린데이터광장 이용 안내](https://data.seoul.go.kr/together/guide/useGuide.do)
- [USGS 지진 검색](https://earthquake.usgs.gov/fdsnws/event/1/)
- [NOAA 관측 API](https://api.tidesandcurrents.noaa.gov/api/prod/)
- [미국 재무부 API](https://fiscaldata.treasury.gov/api-documentation/)
- [NASA EONET API](https://eonet.gsfc.nasa.gov/docs/v3)

## 구현 검증

- 190개 후보의 실제 공공 HTTPS 응답 확인 후 179개 설정 게시. 응답 경로·매핑으로 실제 미리보기 생성.
- 공개 설정의 수집 API 계약·안전한 URL·중복·JSON 좌표/XML 매핑·연결 실패와 결측 구분 검사 3개 통과. 외부 연결을 모의하는 오프라인 검사다.
- C-BAP 브라우저 검사 6개 통과. 카탈로그 검색·기관 분류·마지막 페이지·공개 샘플 제한·미리보기·자동 등록 방지·모바일 폭과 기존 수집/배치 흐름을 포함한다. TARGET과 외부 API 업무 응답은 UI 계약으로 모의한다.
- 최종 기관 안내·한국 관측 재확인 후 해당 카탈로그 UI 검사 1개 재통과. 프론트 JavaScript 및 갱신 스크립트 Python 구문 검사 통과.
- 이 변경으로 신규 TARGET 테이블 적재·Oracle DDL·Render 원격 배포를 수행하지 않았다. 로컬 정적 서비스에 반영했다.
