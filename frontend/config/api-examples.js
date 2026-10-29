// Verified real public observations. Explicit refresh: scripts/refresh_api_examples.py --refresh
export const apiExamples = [
  {
    "id": "kor-gdp",
    "title": "한국 GDP",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "현재 US$",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD?locations=KR",
    "description": "GDP (current US$)",
    "definition": "Gross domestic product is the total income earned through the production of goods and services in an economic territory during an accounting period. It can be measured in three different ways: using either the expenditure approach, the income approach, or the production approach. This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 GDP · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NY.GDP.MKTP.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1872374961553.15
      },
      {
        "year": "2024",
        "value": 1875388209406.8
      },
      {
        "year": "2023",
        "value": 1844800934391.54
      },
      {
        "year": "2022",
        "value": 1799363116866.52
      },
      {
        "year": "2021",
        "value": 1942313560965.9
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:02+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "kor-population",
    "title": "한국 총인구",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "명",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.TOTL?locations=KR",
    "description": "Population, total",
    "definition": "Total population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship. The values shown are midyear estimates.",
    "attribution": "World Population Prospects, United Nations (UN), uri: https://population.un.org/wpp/, publisher: UN Population Division;\nStatistical databases and publications from national statistical offices, National Statistical Offices (NSOs), uri: https://unstats.un.org/home/nso_sites/, publisher: National Statistical Offices;\nEurostat: Demographic Statistics, Eurostat (ESTAT), uri: https://ec.europa.eu/eurostat/data/database?node_code=earn_ses_monthly, publisher: Eurostat;\nPopulation and Vital Statistics Report (various years), United Nations (UN), uri: https://unstats.un.org, publisher: UN Statistics Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 총인구 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.TOTL",
      "method": "GET",
      "response_format": "xml",
      "records_path": "data/data",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "xml",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 51684564.0
      },
      {
        "year": "2024",
        "value": 51751065.0
      },
      {
        "year": "2023",
        "value": 51712619.0
      },
      {
        "year": "2022",
        "value": 51672569.0
      },
      {
        "year": "2021",
        "value": 51769539.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:02+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "kor-life",
    "title": "한국 기대수명",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "세",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.DYN.LE00.IN?locations=KR",
    "description": "Life expectancy at birth, total (years)",
    "definition": "Life expectancy at birth indicates the number of years a newborn infant would live if prevailing patterns of mortality at the time of its birth were to stay the same throughout its life.",
    "attribution": "World Population Prospects, United Nations (UN), uri: UN Population Division;\nStatistical databases and publications from national statistical offices, National Statistical Offices (NSOs), note: Derived from male and female life expectancy at birth from sources such as statistical databases and publications from national statistical offices.;\nDemographic Statistics, Eurostat (ESTAT), note: Derived from male and female life expectancy at birth from sources such as Eurostat: Demographic Statistics.",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 기대수명 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.DYN.LE00.IN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 83.6292682926829
      },
      {
        "year": "2023",
        "value": 83.4292682926829
      },
      {
        "year": "2022",
        "value": 82.6804878048781
      },
      {
        "year": "2021",
        "value": 83.5268292682927
      },
      {
        "year": "2020",
        "value": 83.4268292682927
      }
    ],
    "preview_checked_at": "2026-10-29T15:13:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ny-gdp-mktp-kd-zg",
    "title": "한국 실질 GDP 성장률",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG?locations=KR",
    "description": "GDP growth (annual %)",
    "definition": "Gross domestic product is the total income earned through the production of goods and services in an economic territory during an accounting period. It can be measured in three different ways: using either the expenditure approach, the income approach, or the production approach. This indicator denotes the percentage change over each previous year of the constant price (base year 2015) series in United States dollars.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 실질 GDP 성장률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NY.GDP.MKTP.KD.ZG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1.00701840291242
      },
      {
        "year": "2024",
        "value": 2.00361101838986
      },
      {
        "year": "2023",
        "value": 1.58301467403629
      },
      {
        "year": "2022",
        "value": 2.72756456708991
      },
      {
        "year": "2021",
        "value": 4.61296795454287
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:11+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ny-gdp-pcap-cd",
    "title": "한국 1인당 GDP",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NY.GDP.PCAP.CD?locations=KR",
    "description": "GDP per capita (current US$)",
    "definition": "Gross domestic product is the total income earned through the production of goods and services in an economic territory during an accounting period. It can be measured in three different ways: using either the expenditure approach, the income approach, or the production approach. The core indicator has been divided by the general population to achieve a per capita estimate.This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 1인당 GDP · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NY.GDP.PCAP.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 36226.9663637512
      },
      {
        "year": "2024",
        "value": 36238.639908315
      },
      {
        "year": "2023",
        "value": 35674.095995632
      },
      {
        "year": "2022",
        "value": 34822.4048404971
      },
      {
        "year": "2021",
        "value": 37518.4635305697
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:11+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ny-gdp-pcap-kd-zg",
    "title": "한국 1인당 GDP 성장률",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NY.GDP.PCAP.KD.ZG?locations=KR",
    "description": "GDP per capita growth (annual %)",
    "definition": "Gross domestic product is the total income earned through the production of goods and services in an economic territory during an accounting period. It can be measured in three different ways: using either the expenditure approach, the income approach, or the production approach. The core indicator has been divided by the general population to achieve a per capita estimate.This indicator denotes the percentage change over each previous year of the constant price (base year 2015) series in United States dollars.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 1인당 GDP 성장률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NY.GDP.PCAP.KD.ZG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1.13698114634992
      },
      {
        "year": "2024",
        "value": 1.92783227201599
      },
      {
        "year": "2023",
        "value": 1.50434142529414
      },
      {
        "year": "2022",
        "value": 2.92034561376229
      },
      {
        "year": "2021",
        "value": 4.747751556973
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:21+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ny-gnp-pcap-cd",
    "title": "한국 1인당 국민총소득",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NY.GNP.PCAP.CD?locations=KR",
    "description": "GNI per capita, Atlas method (current US$)",
    "definition": "Gross national income is the total income earned by all residents within an economic territory during an accounting period. It is equal to gross domestic product plus earned income receivable from abroad minus earned income payable abroad. This figure is converted to U.S. dollars using the World Bank Atlas method, and divided by the midyear population. GNI, calculated in national currency, is usually converted to U.S. dollars at official exchange rates for comparisons across economies, although an alternative rate is used when the official exchange rate is judged to diverge by an exceptionally large margin from the rate actually applied in international transactions. To smooth fluctuations in prices and exchange rates, a special Atlas method of conversion is used by the World Bank. This applies a conversion factor that averages the exchange rate for a given year and the two preceding years, adjusted for differences in rates of inflation between the country, and through 2000, the G-5 countries (France, Germany, Japan, the United Kingdom, and the United States). From 2001, these countries include the Euro area, Japan, the United Kingdom, and the United States. This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 1인당 국민총소득 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NY.GNP.PCAP.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 37880.0
      },
      {
        "year": "2024",
        "value": 36750.0
      },
      {
        "year": "2023",
        "value": 38020.0
      },
      {
        "year": "2022",
        "value": 38590.0
      },
      {
        "year": "2021",
        "value": 37450.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:13:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ny-gnp-mktp-cd",
    "title": "한국 국민총소득 총액",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NY.GNP.MKTP.CD?locations=KR",
    "description": "GNI (current US$)",
    "definition": "Gross national income is the total income earned by all residents within an economic territory during an accounting period. It is equal to gross domestic product plus earned income receivable from abroad minus earned income payable abroad. This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 국민총소득 총액 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NY.GNP.MKTP.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1904543891844.25
      },
      {
        "year": "2024",
        "value": 1902456770881.09
      },
      {
        "year": "2023",
        "value": 1871357950465.76
      },
      {
        "year": "2022",
        "value": 1821087204060.28
      },
      {
        "year": "2021",
        "value": 1962780858667.37
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:21+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ne-con-totl-zs",
    "title": "한국 최종소비 지출 비중",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NE.CON.TOTL.ZS?locations=KR",
    "description": "Final consumption expenditure (% of GDP)",
    "definition": "Final consumption expenditure is expenditure on goods and services by resident institutional units for the direct satisfaction of human needs or wants, whether individual or collective. Final consumption expenditure can be measured for households, general government, the central bank and non-profit institutions serving households. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 최종소비 지출 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NE.CON.TOTL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 65.6696288340824
      },
      {
        "year": "2024",
        "value": 65.9709024054294
      },
      {
        "year": "2023",
        "value": 67.7238275087087
      },
      {
        "year": "2022",
        "value": 66.6699386323542
      },
      {
        "year": "2021",
        "value": 64.135749875704
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ne-con-prvt-zs",
    "title": "한국 가계소비 지출 비중",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NE.CON.PRVT.ZS?locations=KR",
    "description": "Households and NPISHs final consumption expenditure (% of GDP)",
    "definition": "This field includes expenditure on goods and services by the Household and NPISH sector for the direct satisfaction of human needs or wants, whether individual or collective. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 가계소비 지출 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NE.CON.PRVT.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 48.0219630775252
      },
      {
        "year": "2024",
        "value": 48.4862941515628
      },
      {
        "year": "2023",
        "value": 49.9486442283876
      },
      {
        "year": "2022",
        "value": 49.0320281833727
      },
      {
        "year": "2021",
        "value": 47.1113066583303
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ne-con-govt-zs",
    "title": "한국 정부소비 지출 비중",
    "provider": "World Bank",
    "category": "행정·재정",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NE.CON.GOVT.ZS?locations=KR",
    "description": "General government final consumption expenditure (% of GDP)",
    "definition": "Final consumption expenditure is expenditure on goods and services by resident institutional units for the direct satisfaction of human needs or wants, whether individual or collective. General government FCE includes all government current expenditures for purchases of goods and services (including compensation of employees), and most expenditures on national defense and security, but excludes government military expenditures that are part of government capital formation. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 정부소비 지출 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NE.CON.GOVT.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 17.6476657565572
      },
      {
        "year": "2024",
        "value": 17.4846082538666
      },
      {
        "year": "2023",
        "value": 17.7751832803211
      },
      {
        "year": "2022",
        "value": 17.6379104489815
      },
      {
        "year": "2021",
        "value": 17.0244387167472
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:24+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ne-gdi-totl-zs",
    "title": "한국 총자본 형성 비중",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NE.GDI.TOTL.ZS?locations=KR",
    "description": "Gross capital formation (% of GDP)",
    "definition": "Gross capital formation includes acquisitions less disposals of produced assets for purposes of fixed capital formation, inventories or valuables. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 총자본 형성 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NE.GDI.TOTL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 29.1311226726896
      },
      {
        "year": "2024",
        "value": 29.9738499299961
      },
      {
        "year": "2023",
        "value": 31.8912200894147
      },
      {
        "year": "2022",
        "value": 33.3254869272348
      },
      {
        "year": "2021",
        "value": 32.4929253527445
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:24+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ne-gdi-ftot-zs",
    "title": "한국 총고정자본 형성 비중",
    "provider": "World Bank",
    "category": "경제·성장",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NE.GDI.FTOT.ZS?locations=KR",
    "description": "Gross fixed capital formation (% of GDP)",
    "definition": "Gross fixed capital formation includes acquisitions less disposals of fixed assets during the accounting period, including certain specified expenditures on services that add to the value of non-produced assets. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 총고정자본 형성 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NE.GDI.FTOT.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 28.3299339709431
      },
      {
        "year": "2024",
        "value": 30.029371211707
      },
      {
        "year": "2023",
        "value": 31.4470154989809
      },
      {
        "year": "2022",
        "value": 31.9338930962313
      },
      {
        "year": "2021",
        "value": 31.4877644393711
      }
    ],
    "preview_checked_at": "2026-10-29T15:13:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ny-gns-ictr-zs",
    "title": "한국 국민총저축 비중",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NY.GNS.ICTR.ZS?locations=KR",
    "description": "Gross savings (% of GDP)",
    "definition": "Savings is an amount that represents the part of disposable income (adjusted for the\n\n\n\n\n\n\n\n\nchange in pension entitlements) that is not spent on final consumption. Gross savings are calculated as gross national income less total consumption, plus net transfers. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 국민총저축 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NY.GNS.ICTR.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 35.5988152959013
      },
      {
        "year": "2024",
        "value": 35.0305415292226
      },
      {
        "year": "2023",
        "value": 33.3597970548711
      },
      {
        "year": "2022",
        "value": 34.3078343934928
      },
      {
        "year": "2021",
        "value": 36.6043931161577
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:28+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-fp-cpi-totl-zg",
    "title": "한국 소비자물가 상승률",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=KR",
    "description": "Inflation, consumer prices (annual %)",
    "definition": "Inflation as measured by the consumer price index reflects the annual percentage change in the cost to the average consumer of acquiring a basket of goods and services that may be fixed or changed at specified intervals, such as yearly.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 소비자물가 상승률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FP.CPI.TOTL.ZG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2.12309421458659
      },
      {
        "year": "2024",
        "value": 2.32174328643542
      },
      {
        "year": "2023",
        "value": 3.5974562502901
      },
      {
        "year": "2022",
        "value": 5.08951365062841
      },
      {
        "year": "2021",
        "value": 2.49833333333339
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:28+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-fp-cpi-totl",
    "title": "한국 소비자물가지수",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FP.CPI.TOTL?locations=KR",
    "description": "Consumer price index (2010 = 100)",
    "definition": "Index of the prices of consumption goods and services, as compared to a certain reference period (2010=100).",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 소비자물가지수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FP.CPI.TOTL",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 135.002199769989
      },
      {
        "year": "2024",
        "value": 132.195563411264
      },
      {
        "year": "2023",
        "value": 129.195964772806
      },
      {
        "year": "2022",
        "value": 124.709591769001
      },
      {
        "year": "2021",
        "value": 118.66987241334
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:29+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-pa-nus-fcrf",
    "title": "한국 공식 환율",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/PA.NUS.FCRF?locations=KR",
    "description": "Official exchange rate (LCU per US$, period average)",
    "definition": "Official exchange rate refers to the exchange rate determined by national authorities or to the rate determined in the legally sanctioned exchange market. This indicator represents the ratio of Local Currency Units relative to United States dollars.This indicator is derived as an average over the reference period.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 공식 환율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/PA.NUS.FCRF",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1422.44083333333
      },
      {
        "year": "2024",
        "value": 1363.375
      },
      {
        "year": "2023",
        "value": 1305.6625
      },
      {
        "year": "2022",
        "value": 1291.44666666666
      },
      {
        "year": "2021",
        "value": 1143.95166666666
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:29+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-fr-inr-rinr",
    "title": "한국 실질금리",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FR.INR.RINR?locations=KR",
    "description": "Real interest rate (%)",
    "definition": "An interest rate is the amount charged, expressed as a percentage of the principal over a period of time, by the owners of certain kinds of financial assets for putting the financial assets at the disposal of another institutional unit. The real interest rate is the lending interest rate adjusted for inflation as measured by the GDP deflator. The terms and conditions attached to lending rates differ by country, however, limiting their comparability. This indicator is expressed as a percentage (a÷b)*100.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF);\nWorld Development Indicators, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 실질금리 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FR.INR.RINR",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1.03398477457102
      },
      {
        "year": "2024",
        "value": 0.634469260614754
      },
      {
        "year": "2023",
        "value": 3.0877262746629
      },
      {
        "year": "2022",
        "value": 2.44052857732634
      },
      {
        "year": "2021",
        "value": -0.287216232726015
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:30+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-fr-inr-lend",
    "title": "한국 대출금리",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FR.INR.LEND?locations=KR",
    "description": "Lending interest rate (%)",
    "definition": "Lending rate is the bank rate that usually meets the short- and medium-term financing needs of the private sector. This rate is normally differentiated according to creditworthiness of borrowers and objectives of financing. The terms and conditions attached to these rates differ by country, however, limiting their comparability.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 대출금리 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FR.INR.LEND",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 4.1925
      },
      {
        "year": "2024",
        "value": 4.72666666666666
      },
      {
        "year": "2023",
        "value": 5.18916666666666
      },
      {
        "year": "2022",
        "value": 4.2925
      },
      {
        "year": "2021",
        "value": 2.88416666666666
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:30+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-fr-inr-dpst",
    "title": "한국 예금금리",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FR.INR.DPST?locations=KR",
    "description": "Deposit interest rate (%)",
    "definition": "Deposit interest rate is the rate paid by commercial or similar banks for demand, time, or savings deposits. The terms and conditions attached to these rates differ by country, however, limiting their comparability. This indicator is expressed as a percentage (a÷b)*100.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 예금금리 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FR.INR.DPST",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2.73416666666666
      },
      {
        "year": "2024",
        "value": 3.48166666666666
      },
      {
        "year": "2023",
        "value": 3.84416666666666
      },
      {
        "year": "2022",
        "value": 3.12166666666666
      },
      {
        "year": "2021",
        "value": 1.19666666666666
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:31+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-fm-lbl-bmny-gd-zs",
    "title": "한국 광의통화 GDP 비중",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FM.LBL.BMNY.GD.ZS?locations=KR",
    "description": "Broad money (% of GDP)",
    "definition": "Broad money is the sum of all liquid financial instruments held by money-holding sectors that are widely accepted in an economy as a medium of exchange, plus those that can be converted into a medium of exchange at short notice at, or close to, their full nominal value. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF);\nWorld Development Indicators Database, World Bank (WB);\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 광의통화 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FM.LBL.BMNY.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 162.713643122999
      },
      {
        "year": "2023",
        "value": 162.102920744302
      },
      {
        "year": "2022",
        "value": 161.729295899876
      },
      {
        "year": "2021",
        "value": 162.638580522216
      },
      {
        "year": "2020",
        "value": 155.447545782261
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:31+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-fs-ast-prvt-gd-zs",
    "title": "한국 민간 신용공급 GDP 비중",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FS.AST.PRVT.GD.ZS?locations=KR",
    "description": "Domestic credit to private sector (% of GDP)",
    "definition": "Domestic credit to private sector refers to financial resources provided to the private sector by financial corporations, such as through loans, purchases of nonequity securities, and trade credits and other accounts receivable, that establish a claim for repayment. For some countries these claims include credit to public enterprises. The financial corporations include monetary authorities and deposit money banks, as well as other financial corporations where data are available (including corporations that do not accept transferable deposits but do incur such liabilities as time and savings deposits). Examples of other financial corporations are finance and leasing companies, money lenders, insurance corporations, pension funds, and foreign exchange companies. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF);\nWorld Development Indicators Database, World Bank (WB);\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 민간 신용공급 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FS.AST.PRVT.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 160.347182678236
      },
      {
        "year": "2023",
        "value": 163.515631501207
      },
      {
        "year": "2022",
        "value": 162.769501736717
      },
      {
        "year": "2021",
        "value": 159.926120236306
      },
      {
        "year": "2020",
        "value": 154.747902042613
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:31+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-fd-ast-prvt-gd-zs",
    "title": "한국 은행 민간신용 GDP 비중",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FD.AST.PRVT.GD.ZS?locations=KR",
    "description": "Domestic credit to private sector by banks (% of GDP)",
    "definition": "Domestic credit to private sector by banks refers to financial resources provided to the private sector by other depository corporations (deposit taking corporations except central banks), such as through loans, purchases of nonequity securities, and trade credits and other accounts receivable, that establish a claim for repayment. For some countries these claims include credit to public enterprises. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF);\nWorld Development Indicators Database, World Bank (WB);\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 은행 민간신용 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FD.AST.PRVT.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 160.347182678236
      },
      {
        "year": "2023",
        "value": 163.515631501207
      },
      {
        "year": "2022",
        "value": 162.769501736717
      },
      {
        "year": "2021",
        "value": 159.926120236306
      },
      {
        "year": "2020",
        "value": 154.747902042613
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:31+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-cm-mkt-lcap-gd-zs",
    "title": "한국 상장기업 시가총액 GDP 비중",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/CM.MKT.LCAP.GD.ZS?locations=KR",
    "description": "Market capitalization of listed domestic companies (% of GDP)",
    "definition": "Market capitalization (also known as market value) is the share price times the number of shares outstanding (including their several classes) for listed domestic companies. Investment funds, unit trusts, and companies whose only business goal is to hold shares of other listed companies are excluded. Data are end of year values.",
    "attribution": "World Federation of Exchanges database, World Federation of Exchanges (WFE)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 상장기업 시가총액 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/CM.MKT.LCAP.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 147.228388896705
      },
      {
        "year": "2024",
        "value": 83.0488083580649
      },
      {
        "year": "2023",
        "value": 106.678084519135
      },
      {
        "year": "2022",
        "value": 91.393869563349
      },
      {
        "year": "2021",
        "value": 114.227598704334
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:31+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-cm-mkt-ldom-no",
    "title": "한국 국내 상장기업 수",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/CM.MKT.LDOM.NO?locations=KR",
    "description": "Listed domestic companies, total",
    "definition": "Listed domestic companies, including foreign companies which are exclusively listed, are those which have shares listed on an exchange at the end of the year. Investment funds, unit trusts, and companies whose only business goal is to hold shares of other listed companies, such as holding companies and investment companies, regardless of their legal status, are excluded. A company with several classes of shares is counted once. Only companies admitted to listing on the exchange are included.",
    "attribution": "World Federation of Exchanges database, World Federation of Exchanges (WFE)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 국내 상장기업 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/CM.MKT.LDOM.NO",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2653.0
      },
      {
        "year": "2024",
        "value": 2599.0
      },
      {
        "year": "2023",
        "value": 2536.0
      },
      {
        "year": "2022",
        "value": 2446.0
      },
      {
        "year": "2021",
        "value": 2383.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:32+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-cm-mkt-trad-gd-zs",
    "title": "한국 주식 거래대금 GDP 비중",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/CM.MKT.TRAD.GD.ZS?locations=KR",
    "description": "Stocks traded, total value (% of GDP)",
    "definition": "The value of shares traded is the total number of shares traded, both domestic and foreign, multiplied by their respective matching prices. Figures are single counted (only one side of the transaction is considered). Companies admitted to listing and admitted to trading are included in the data. Data are end of year values.",
    "attribution": "World Federation of Exchanges database, World Federation of Exchanges (WFE)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 주식 거래대금 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/CM.MKT.TRAD.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 176.335700796877
      },
      {
        "year": "2024",
        "value": 166.72813363741
      },
      {
        "year": "2023",
        "value": 183.863103425776
      },
      {
        "year": "2022",
        "value": 169.461837992437
      },
      {
        "year": "2021",
        "value": 288.316688023078
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:32+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-fb-atm-totl-p5",
    "title": "한국 성인 10만 명당 ATM 수",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FB.ATM.TOTL.P5?locations=KR",
    "description": "Automated teller machines (ATMs) (per 100,000 adults)",
    "definition": "Automated teller machines (ATMs) are electromechanical devices which enable customers of financial institutions to perform financial transactions such as cash withdrawals, balance inquiries, deposits, transfer of funds, and obtaining account information, using an electronic card.",
    "attribution": "Financial Access Survey, International Monetary Fund (IMF), uri: https://data.imf.org/?sk=E5DCAB7E-A5CA-4892-A6EA-598B5463A34C",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 성인 10만 명당 ATM 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FB.ATM.TOTL.P5",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 244.469292769745
      },
      {
        "year": "2022",
        "value": 252.633953975451
      },
      {
        "year": "2021",
        "value": 256.855232744804
      },
      {
        "year": "2020",
        "value": 258.191725888422
      },
      {
        "year": "2019",
        "value": 263.322520065682
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:32+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-fb-cbk-brch-p5",
    "title": "한국 성인 10만 명당 은행 지점 수",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FB.CBK.BRCH.P5?locations=KR",
    "description": "Commercial bank branches (per 100,000 adults)",
    "definition": "Commercial bank branches are retail locations of resident commercial banks and other resident banks that function as commercial banks that provide financial services to customers and are physically separated from the main office but not organized as legally separated subsidiaries.",
    "attribution": "Financial Access Survey, International Monetary Fund (IMF), uri: https://data.imf.org/en/datasets/IMF.STA:FAS",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 성인 10만 명당 은행 지점 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FB.CBK.BRCH.P5",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 12.3936010645014
      },
      {
        "year": "2023",
        "value": 12.7000138142787
      },
      {
        "year": "2022",
        "value": 12.8936337694186
      },
      {
        "year": "2021",
        "value": 13.5740244244837
      },
      {
        "year": "2020",
        "value": 14.285571292025
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:40+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-fi-res-totl-cd",
    "title": "한국 총 외환보유액",
    "provider": "World Bank",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/FI.RES.TOTL.CD?locations=KR",
    "description": "Total reserves (includes gold, current US$)",
    "definition": "Reserve assets are external assets, including monetary gold, that are readily available to and controlled by monetary authorities for meeting balance of payments financing needs, for intervention in exchange markets to affect the currency exchange rate, and for other related purposes (such as maintaining confidence in the currency and the economy, and serving as a basis for foreign borrowing). Reserve assets must be denominated and settled in foreign currency. This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.",
    "attribution": "International Financial Statistics database, International Monetary Fund (IMF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 총 외환보유액 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/FI.RES.TOTL.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 436572785443.925
      },
      {
        "year": "2024",
        "value": 418218648901.668
      },
      {
        "year": "2023",
        "value": 420930029064.024
      },
      {
        "year": "2022",
        "value": 423365991593.016
      },
      {
        "year": "2021",
        "value": 463281305723.059
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:40+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-gc-tax-totl-gd-zs",
    "title": "한국 조세수입 GDP 비중",
    "provider": "World Bank",
    "category": "행정·재정",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/GC.TAX.TOTL.GD.ZS?locations=KR",
    "description": "Tax revenue (% of GDP)",
    "definition": "Taxes are compulsory, unrequited payments, in cash or in kind, made by institutional\n\n\n\n\nunits to government units. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Government Finance Statistics Yearbook and data files, International Monetary Fund (IMF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 조세수입 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/GC.TAX.TOTL.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 13.2937188380388
      },
      {
        "year": "2023",
        "value": 14.5990997893708
      },
      {
        "year": "2022",
        "value": 17.1586747410902
      },
      {
        "year": "2021",
        "value": 15.6673866200663
      },
      {
        "year": "2020",
        "value": 14.0112224960532
      }
    ],
    "preview_checked_at": "2026-10-29T15:13:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-gc-rev-xgrt-gd-zs",
    "title": "한국 보조금 제외 정부수입 비중",
    "provider": "World Bank",
    "category": "행정·재정",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/GC.REV.XGRT.GD.ZS?locations=KR",
    "description": "Revenue, excluding grants (% of GDP)",
    "definition": "Revenue is an increase in net worth resulting from a transaction. Grants are excluded from this figure. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Government Finance Statistics Yearbook and data files, International Monetary Fund (IMF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 보조금 제외 정부수입 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/GC.REV.XGRT.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 25.7690025538074
      },
      {
        "year": "2023",
        "value": 27.3522982777032
      },
      {
        "year": "2022",
        "value": 29.7729228756878
      },
      {
        "year": "2021",
        "value": 28.0245804485222
      },
      {
        "year": "2020",
        "value": 26.3065329311566
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:44+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-gc-xpn-totl-gd-zs",
    "title": "한국 정부지출 GDP 비중",
    "provider": "World Bank",
    "category": "행정·재정",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/GC.XPN.TOTL.GD.ZS?locations=KR",
    "description": "Expense (% of GDP)",
    "definition": "Expense is a decrease in net worth resulting from a transaction. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Government Finance Statistics Yearbook and data files, International Monetary Fund (IMF);\nWorld Development Indicators, World Bank (WB);\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 정부지출 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/GC.XPN.TOTL.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 28.3225119832631
      },
      {
        "year": "2022",
        "value": 31.2975333759802
      },
      {
        "year": "2021",
        "value": 28.5464738099917
      },
      {
        "year": "2020",
        "value": 28.0256629437299
      },
      {
        "year": "2019",
        "value": 25.9471764437754
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:45+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-ind-manf-zs",
    "title": "한국 제조업 부가가치 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.IND.MANF.ZS?locations=KR",
    "description": "Manufacturing, value added (% of GDP)",
    "definition": "Manufacturing includes industries classified in ISIC (Rev. 3) major division C and is defined as the physical or chemical transformation of materials or components into new products. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조업 부가가치 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.IND.MANF.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 27.4263326092558
      },
      {
        "year": "2024",
        "value": 26.6179725157922
      },
      {
        "year": "2023",
        "value": 25.4551420827792
      },
      {
        "year": "2022",
        "value": 26.4977408590265
      },
      {
        "year": "2021",
        "value": 26.2480856022754
      }
    ],
    "preview_checked_at": "2026-10-29T15:13:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-ind-manf-cd",
    "title": "한국 제조업 부가가치 금액",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.IND.MANF.CD?locations=KR",
    "description": "Manufacturing, value added (current US$)",
    "definition": "Manufacturing includes industries classified in ISIC (Rev. 3) major division C and is defined as the physical or chemical transformation of materials or components into new products. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조업 부가가치 금액 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.IND.MANF.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 513523784647.99
      },
      {
        "year": "2024",
        "value": 499190318144.311
      },
      {
        "year": "2023",
        "value": 469596698993.806
      },
      {
        "year": "2022",
        "value": 476790575820.194
      },
      {
        "year": "2021",
        "value": 509820126146.934
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:57+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-ind-manf-kd-zg",
    "title": "한국 제조업 부가가치 성장률",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.IND.MANF.KD.ZG?locations=KR",
    "description": "Manufacturing, value added (annual % growth)",
    "definition": "Manufacturing includes industries classified in ISIC (Rev. 3) major division C and is defined as the physical or chemical transformation of materials or components into new products. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator denotes the percentage change over each previous year of the constant price (base year 2015) series in United States dollars.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조업 부가가치 성장률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.IND.MANF.KD.ZG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2.0257298148465
      },
      {
        "year": "2024",
        "value": 4.29797621886875
      },
      {
        "year": "2023",
        "value": 1.47641884191995
      },
      {
        "year": "2022",
        "value": 2.47348280154547
      },
      {
        "year": "2021",
        "value": 6.47672943111641
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:57+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-ind-totl-zs",
    "title": "한국 산업 부가가치 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.IND.TOTL.ZS?locations=KR",
    "description": "Industry (including construction), value added (% of GDP)",
    "definition": "Industry (including construction) corresponds to ISIC (Rev.4) divisions 05-43. It is comprised of mining, manufacturing, construction, electricity, water, and gas industries. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 산업 부가가치 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.IND.TOTL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 34.3300820555343
      },
      {
        "year": "2024",
        "value": 33.9025438024037
      },
      {
        "year": "2023",
        "value": 32.5234690063974
      },
      {
        "year": "2022",
        "value": 32.5112580507246
      },
      {
        "year": "2021",
        "value": 33.152604676808
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:57+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-ind-totl-kd-zg",
    "title": "한국 산업 부가가치 성장률",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.IND.TOTL.KD.ZG?locations=KR",
    "description": "Industry (including construction), value added (annual % growth)",
    "definition": "Industry (including construction) corresponds to ISIC (Rev.4) divisions 05-43. It is comprised of mining, manufacturing, construction, electricity, water, and gas industries. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator denotes the percentage change over each previous year of the constant price (base year 2015) series in United States dollars.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 산업 부가가치 성장률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.IND.TOTL.KD.ZG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 0.189771346172336
      },
      {
        "year": "2024",
        "value": 2.92256343059236
      },
      {
        "year": "2023",
        "value": 1.04038737225088
      },
      {
        "year": "2022",
        "value": 2.24473406357141
      },
      {
        "year": "2021",
        "value": 5.00445073087525
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:57+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-ind-empl-zs",
    "title": "한국 산업부문 고용 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.IND.EMPL.ZS?locations=KR",
    "description": "Employment in industry (% of total employment) (modeled ILO estimate)",
    "definition": "Employment is defined as persons of working age who were engaged in any activity to produce goods or provide services for pay or profit, whether at work during the reference period or not at work due to temporary absence from a job, or to working-time arrangement. The industry sector consists of mining and quarrying, manufacturing, construction, and public utilities (electricity, gas, and water), in accordance with divisions 2-5 (ISIC 2) or categories C-F (ISIC 3) or categories B-F (ISIC 4).",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: external database, date accessed: January 17, 2026",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 산업부문 고용 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.IND.EMPL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 23.3828172443507
      },
      {
        "year": "2024",
        "value": 23.6590890618115
      },
      {
        "year": "2023",
        "value": 23.9914232241802
      },
      {
        "year": "2022",
        "value": 24.4572753776052
      },
      {
        "year": "2021",
        "value": 24.6038800147514
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:57+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-tx-val-manf-zs-un",
    "title": "한국 제조품 수출 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/TX.VAL.MANF.ZS.UN?locations=KR",
    "description": "Manufactures exports (% of merchandise exports)",
    "definition": "Manufactures comprise commodities in SITC (Rev. 3) sections 5 (chemicals), 6 (basic manufactures), 7 (machinery and transport equipment), and 8 (miscellaneous manufactured goods), excluding division 68 (non-ferrous metals). This indicator is expressed as a percentage of merchandise exports which is comprised of goods whose economic ownership is changed between a resident and a non-resident and that are not included in the following specific categories: goods under merchanting, non-monetary gold, and parts of travel, construction, and government goods and services n.i.e.",
    "attribution": "Comtrade database, United Nations (UN), publisher: UN Statistics Division;\nWorld Integrated Trade Solution system (WITS);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조품 수출 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/TX.VAL.MANF.ZS.UN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 87.9515708056734
      },
      {
        "year": "2024",
        "value": 87.2877868115765
      },
      {
        "year": "2023",
        "value": 86.0896614520211
      },
      {
        "year": "2022",
        "value": 84.9179316912058
      },
      {
        "year": "2021",
        "value": 87.8993739603608
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:58+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-tm-val-manf-zs-un",
    "title": "한국 제조품 수입 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/TM.VAL.MANF.ZS.UN?locations=KR",
    "description": "Manufactures imports (% of merchandise imports)",
    "definition": "Manufactures comprise commodities in SITC (Rev. 3) sections 5 (chemicals), 6 (basic manufactures), 7 (machinery and transport equipment), and 8 (miscellaneous manufactured goods), excluding division 68 (non-ferrous metals). This indicator is expressed as a percentage of merchandise imports which is comprised of goods whose economic ownership is changed between a non-resident and a resident and that are not included in the following specific categories: goods under merchanting, non-monetary gold, and parts of travel, construction, and government goods and services n.i.e.",
    "attribution": "Comtrade database, United Nations (UN), publisher: UN Statistics Division;\nWorld Integrated Trade Solution system (WITS);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조품 수입 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/TM.VAL.MANF.ZS.UN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 62.0735899800151
      },
      {
        "year": "2024",
        "value": 60.1073364940026
      },
      {
        "year": "2023",
        "value": 59.2359303946367
      },
      {
        "year": "2022",
        "value": 55.8774453616359
      },
      {
        "year": "2021",
        "value": 61.3305603692108
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:58+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-tx-val-tech-mf-zs",
    "title": "한국 첨단기술 제품 수출 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/TX.VAL.TECH.MF.ZS?locations=KR",
    "description": "High-technology exports (% of manufactured exports)",
    "definition": "High-technology exports are products with high R&D intensity, such as in aerospace, computers, pharmaceuticals, scientific instruments, and electrical machinery.",
    "attribution": "Comtrade database, United Nations (UN), uri: comtrade.un.org, publisher: UN Statistics Division;\nWorld Integrated Trade Solution system (WITS), World Bank (WB), uri: https://wits.worldbank.org/",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 첨단기술 제품 수출 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/TX.VAL.TECH.MF.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 36.2582559366674
      },
      {
        "year": "2023",
        "value": 30.2762799912651
      },
      {
        "year": "2022",
        "value": 36.118278931217
      },
      {
        "year": "2021",
        "value": 36.014503674486
      },
      {
        "year": "2020",
        "value": 35.6022265413283
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:58+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-tx-val-tech-cd",
    "title": "한국 첨단기술 제품 수출액",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/TX.VAL.TECH.CD?locations=KR",
    "description": "High-technology exports (current US$)",
    "definition": "High-technology exports are products with high R&D intensity, such as aerospace, computers, pharmaceuticals, scientific instruments, and electrical machinery.",
    "attribution": "Comtrade database, United Nations (UN), uri: comtrade.un.org, publisher: UN Statistics Division;\nWorld Integrated Trade Solution system (WITS), World Bank (WB), uri: https://wits.worldbank.org/",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 첨단기술 제품 수출액 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/TX.VAL.TECH.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 216203069107.0
      },
      {
        "year": "2023",
        "value": 164678173896.0
      },
      {
        "year": "2022",
        "value": 209651189631.0
      },
      {
        "year": "2021",
        "value": 203986068635.0
      },
      {
        "year": "2020",
        "value": 163074029188.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:58+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-mnf-fbto-zs-un",
    "title": "한국 제조업 내 식품·음료·담배 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.MNF.FBTO.ZS.UN?locations=KR",
    "description": "Food, beverages and tobacco (% of value added in manufacturing)",
    "definition": "Manufacturing of food, beverages, and tobacco includes industries classified in ISIC (Rev. 3) divisions 15 and 16. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed as a percentage of value added in manufacturing which is the contribution to the economy by the manufacturing sector (ISIC Rev. 3 major division D).",
    "attribution": "International Yearbook of Industrial Statistics, UN Industrial Development Organization (UNIDO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조업 내 식품·음료·담배 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.MNF.FBTO.ZS.UN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 7.56034797596316
      },
      {
        "year": "2022",
        "value": 6.52380897560638
      },
      {
        "year": "2021",
        "value": 6.70135217820264
      },
      {
        "year": "2020",
        "value": 7.49004854123161
      },
      {
        "year": "2019",
        "value": 6.87164788109921
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:58+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-mnf-txtl-zs-un",
    "title": "한국 제조업 내 섬유·의류 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.MNF.TXTL.ZS.UN?locations=KR",
    "description": "Textiles and clothing (% of value added in manufacturing)",
    "definition": "Textiles and clothing refers to industries in ISIC (rev. 3) divisions 17-19 and includes manufacturing of textiles, apparel, dyeing of fur, and tanning of leather. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed as a percentage of value added in manufacturing which is the contribution to the economy by the manufacturing sector (ISIC Rev. 3 major division D).",
    "attribution": "International Yearbook of Industrial Statistics, UN Industrial Development Organization (UNIDO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조업 내 섬유·의류 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.MNF.TXTL.ZS.UN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 2.67123848556194
      },
      {
        "year": "2022",
        "value": 2.60164654201885
      },
      {
        "year": "2021",
        "value": 2.72885518740117
      },
      {
        "year": "2020",
        "value": 3.03285682172029
      },
      {
        "year": "2019",
        "value": 2.91092796865623
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:58+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-mnf-chem-zs-un",
    "title": "한국 제조업 내 화학제품 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.MNF.CHEM.ZS.UN?locations=KR",
    "description": "Chemicals (% of value added in manufacturing)",
    "definition": "Manufacturing of chemicals and chemical products includes industries classified in ISIC (Rev. 3) division 24. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed as a percentage of value added in manufacturing which is the contribution to the economy by the manufacturing sector (ISIC Rev. 3 major division D).",
    "attribution": "International Yearbook of Industrial Statistics, UN Industrial Development Organization (UNIDO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조업 내 화학제품 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.MNF.CHEM.ZS.UN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 12.1017989493277
      },
      {
        "year": "2022",
        "value": 10.8934090920277
      },
      {
        "year": "2021",
        "value": 11.8177834351636
      },
      {
        "year": "2020",
        "value": 11.2458346256169
      },
      {
        "year": "2019",
        "value": 11.0052642618245
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-mnf-mtrn-zs-un",
    "title": "한국 제조업 내 기계·운송장비 비중",
    "provider": "World Bank",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.MNF.MTRN.ZS.UN?locations=KR",
    "description": "Machinery and transport equipment (% of value added in manufacturing)",
    "definition": "Machinery and transport equipment manufacturing includes industries classified in ISIC (Rev. 3) divisions 29-35. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed as a percentage of value added in manufacturing which is the contribution to the economy by the manufacturing sector (ISIC Rev. 3 major division D).",
    "attribution": "International Yearbook of Industrial Statistics, UN Industrial Development Organization (UNIDO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 제조업 내 기계·운송장비 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.MNF.MTRN.ZS.UN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 42.0706664060189
      },
      {
        "year": "2022",
        "value": 45.2769999691045
      },
      {
        "year": "2021",
        "value": 48.2290209796317
      },
      {
        "year": "2020",
        "value": 47.5595622083988
      },
      {
        "year": "2019",
        "value": 47.3049515549
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:00+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-srv-totl-zs",
    "title": "한국 서비스업 부가가치 비중",
    "provider": "World Bank",
    "category": "서비스·관광",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.SRV.TOTL.ZS?locations=KR",
    "description": "Services, value added (% of GDP)",
    "definition": "Services industries correspond to ISIC (Rev. 4) divisions 45-99 and includes wholesale and retail trade, repair of motor vehicles, hotels and restaurants, transport, storage and communication, financial intermediation, real estate, renting and business activities, public administration and defence, compulsory social security, education, health and social work, other community, social and personal service activities, private households with employed persons, and extra-territorial organizations and bodies. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 서비스업 부가가치 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.SRV.TOTL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 57.2276281692036
      },
      {
        "year": "2024",
        "value": 57.5005082410932
      },
      {
        "year": "2023",
        "value": 58.8846232184384
      },
      {
        "year": "2022",
        "value": 58.0714839153337
      },
      {
        "year": "2021",
        "value": 56.9003312416072
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-srv-totl-kd-zg",
    "title": "한국 서비스업 부가가치 성장률",
    "provider": "World Bank",
    "category": "서비스·관광",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.SRV.TOTL.KD.ZG?locations=KR",
    "description": "Services, value added (annual % growth)",
    "definition": "Services industries correspond to ISIC (Rev. 4) divisions 45-99 and includes wholesale and retail trade, repair of motor vehicles, hotels and restaurants, transport, storage and communication, financial intermediation, real estate, renting and business activities, public administration and defence, compulsory social security, education, health and social work, other community, social and personal service activities, private households with employed persons, and extra-territorial organizations and bodies. Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator denotes the percentage change over each previous year of the constant price (base year 2015) series in United States dollars.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 서비스업 부가가치 성장률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.SRV.TOTL.KD.ZG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1.74182797654252
      },
      {
        "year": "2024",
        "value": 1.61957344361836
      },
      {
        "year": "2023",
        "value": 2.68114319250638
      },
      {
        "year": "2022",
        "value": 3.80069347111147
      },
      {
        "year": "2021",
        "value": 4.34743422569814
      }
    ],
    "preview_checked_at": "2026-10-29T15:08:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-srv-empl-zs",
    "title": "한국 서비스업 고용 비중",
    "provider": "World Bank",
    "category": "서비스·관광",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.SRV.EMPL.ZS?locations=KR",
    "description": "Employment in services (% of total employment) (modeled ILO estimate)",
    "definition": "Employment is defined as persons of working age who were engaged in any activity to produce goods or provide services for pay or profit, whether at work during the reference period or not at work due to temporary absence from a job, or to working-time arrangement. The services sector consists of wholesale and retail trade and restaurants and hotels; transport, storage, and communications; financing, insurance, real estate, and business services; and community, social, and personal services, in accordance with divisions 6-9 (ISIC 2) or categories G-Q (ISIC 3) or categories G-U (ISIC 4).",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: external database, date accessed: January 17, 2026",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 서비스업 고용 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.SRV.EMPL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 71.5133653919359
      },
      {
        "year": "2024",
        "value": 71.1441056814925
      },
      {
        "year": "2023",
        "value": 70.684251824038
      },
      {
        "year": "2022",
        "value": 70.1109264373538
      },
      {
        "year": "2021",
        "value": 70.0491246502855
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:00+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-st-int-arvl",
    "title": "한국 국제 관광객 입국 수",
    "provider": "World Bank",
    "category": "서비스·관광",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ST.INT.ARVL?locations=KR",
    "description": "International tourism, number of arrivals",
    "definition": "International inbound tourists (overnight visitors) are the number of tourists who travel to a country other than that in which they have their usual residence, but outside their usual environment, for a period not exceeding 12 months and whose main purpose in visiting is other than an activity remunerated from within the country visited. When data on number of tourists are not available, the number of visitors, which includes tourists, same-day visitors, cruise passengers, and crew members, is shown instead. Sources and collection methods for arrivals differ across countries. In some cases data are from border statistics (police, immigration, and the like) and supplemented by border surveys. In other cases data are from tourism accommodation establishments. For some countries number of arrivals is limited to arrivals by air and for others to arrivals staying in hotels. Some countries include arrivals of nationals residing abroad while others do not. Caution should thus be used in comparing arrivals across countries. The data on inbound tourists refer to the number of arrivals, not to the number of people traveling. Thus a person who makes several trips to a country during a given period is counted each time as a new arrival.",
    "attribution": "Yearbook of Tourism Statistics, Compendium of Tourism Statistics and data files, UN Tourism",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 국제 관광객 입국 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ST.INT.ARVL",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2020",
        "value": 2519000.0
      },
      {
        "year": "2019",
        "value": 17503000.0
      },
      {
        "year": "2018",
        "value": 15347000.0
      },
      {
        "year": "2017",
        "value": 13336000.0
      },
      {
        "year": "2016",
        "value": 17242000.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:00+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-st-int-rcpt-cd",
    "title": "한국 국제 관광수입",
    "provider": "World Bank",
    "category": "서비스·관광",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ST.INT.RCPT.CD?locations=KR",
    "description": "International tourism, receipts (current US$)",
    "definition": "International tourism receipts are expenditures by international inbound visitors, including payments to national carriers for international transport. These receipts include any other prepayment made for goods or services received in the destination country. They also may include receipts from same-day visitors, except when these are important enough to justify separate classification. For some countries they do not include receipts for passenger transport items. Data are in current U.S. dollars.",
    "attribution": "Yearbook of Tourism Statistics, Compendium of Tourism Statistics and data files, UN Tourism",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 국제 관광수입 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ST.INT.RCPT.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2020",
        "value": 11776000000.0
      },
      {
        "year": "2019",
        "value": 25456000000.0
      },
      {
        "year": "2018",
        "value": 23104000000.0
      },
      {
        "year": "2017",
        "value": 17173000000.0
      },
      {
        "year": "2016",
        "value": 20924000000.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:00+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-st-int-xpnd-cd",
    "title": "한국 국제 관광지출",
    "provider": "World Bank",
    "category": "서비스·관광",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ST.INT.XPND.CD?locations=KR",
    "description": "International tourism, expenditures (current US$)",
    "definition": "International tourism expenditures are expenditures of international outbound visitors in other countries, including payments to foreign carriers for international transport. These expenditures may include those by residents traveling abroad as same-day visitors, except in cases where these are important enough to justify separate classification. For some countries they do not include expenditures for passenger transport items. Data are in current U.S. dollars.",
    "attribution": "Yearbook of Tourism Statistics, Compendium of Tourism Statistics and data files, UN Tourism",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 국제 관광지출 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ST.INT.XPND.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2020",
        "value": 16705000000.0
      },
      {
        "year": "2019",
        "value": 35339000000.0
      },
      {
        "year": "2018",
        "value": 38022000000.0
      },
      {
        "year": "2017",
        "value": 34453000000.0
      },
      {
        "year": "2016",
        "value": 29817000000.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:00+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ne-exp-gnfs-zs",
    "title": "한국 상품·서비스 수출 비중",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NE.EXP.GNFS.ZS?locations=KR",
    "description": "Exports of goods and services (% of GDP)",
    "definition": "Exports of goods includes changes in the economic ownership of goods from residents of the compiling economy to non-residents, irrespective of physical movement of goods across national borders. Exports of services includes services provided by residents to non-residents. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 상품·서비스 수출 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NE.EXP.GNFS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 45.7630385215931
      },
      {
        "year": "2024",
        "value": 44.3582383593234
      },
      {
        "year": "2023",
        "value": 41.3214807367697
      },
      {
        "year": "2022",
        "value": 45.294860984133
      },
      {
        "year": "2021",
        "value": 39.3388192669479
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:00+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ne-imp-gnfs-zs",
    "title": "한국 상품·서비스 수입 비중",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NE.IMP.GNFS.ZS?locations=KR",
    "description": "Imports of goods and services (% of GDP)",
    "definition": "Imports of goods includes change in the economic ownership of goods from non-residents to\n\n\n\n\nresidents of the compiling economy, irrespective of physical movement of goods across national borders. Imports of services includes services provided by non-residents to residents. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Offices (NSOs);\nNational Accounts data files, Central Banks;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 상품·서비스 수입 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NE.IMP.GNFS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 40.5985621226499
      },
      {
        "year": "2024",
        "value": 40.2842567598803
      },
      {
        "year": "2023",
        "value": 40.9365283348931
      },
      {
        "year": "2022",
        "value": 45.2902865437219
      },
      {
        "year": "2021",
        "value": 35.9674854941434
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:01+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ne-trd-gnfs-zs",
    "title": "한국 무역 GDP 비중",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NE.TRD.GNFS.ZS?locations=KR",
    "description": "Trade (% of GDP)",
    "definition": "Trade is the sum of exports and imports of goods and services. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 무역 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NE.TRD.GNFS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 86.3616006442431
      },
      {
        "year": "2024",
        "value": 84.6424951192038
      },
      {
        "year": "2023",
        "value": 82.2580090716629
      },
      {
        "year": "2022",
        "value": 90.5851475278549
      },
      {
        "year": "2021",
        "value": 75.3063047610912
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:01+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-bn-cab-xoka-gd-zs",
    "title": "한국 경상수지 GDP 비중",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/BN.CAB.XOKA.GD.ZS?locations=KR",
    "description": "Current account balance (% of GDP)",
    "definition": "Balance of current transactions (transactions in goods and services, earned income and transfer income) between residents and non-residents. The term current account balance is used in the external accounts and is expressed from the perspective of resident units. The term current external balance is used in the national accounts and is expressed from the perspective of the non-resident units, and therefore with the opposite sign. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period.",
    "attribution": "Balance of Payments Statistics Yearbook and data files, International Monetary Fund (IMF);\nWorld Development Indicators Database, World Bank (WB);\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 경상수지 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/BN.CAB.XOKA.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 6.57207036660681
      },
      {
        "year": "2024",
        "value": 5.33081628105267
      },
      {
        "year": "2023",
        "value": 1.76334472698699
      },
      {
        "year": "2022",
        "value": 1.29147917850335
      },
      {
        "year": "2021",
        "value": 4.31851487245382
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:01+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-bx-klt-dinv-wd-gd-zs",
    "title": "한국 외국인 직접투자 순유입 비중",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/BX.KLT.DINV.WD.GD.ZS?locations=KR",
    "description": "Foreign direct investment, net inflows (% of GDP)",
    "definition": "Foreign direct investment is the net inflows of investment to acquire a lasting management interest (10 percent or more of voting stock) in an enterprise operating in an economy other than that of the investor. It is the sum of equity capital, reinvestment of earnings, other long-term capital, and short-term capital as shown in the balance of payments. This series shows net inflows (new investment inflows less disinvestment) in the reporting economy from foreign investors, and is divided by GDP.",
    "attribution": "International Financial Statistics and Balance of Payments databases, International Monetary Fund (IMF);\nInternational Debt Statistics, World Bank (WB);\nWorld Bank GDP estimates, World Bank (WB);\nOECD GDP estimates, Organisation for Economic Co-operation and Development (OECD)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 외국인 직접투자 순유입 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/BX.KLT.DINV.WD.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 0.844067044503223
      },
      {
        "year": "2024",
        "value": 0.685857996519477
      },
      {
        "year": "2023",
        "value": 1.03221435142435
      },
      {
        "year": "2022",
        "value": 1.39186469730544
      },
      {
        "year": "2021",
        "value": 1.13577953855347
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:02+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-bm-klt-dinv-wd-gd-zs",
    "title": "한국 해외 직접투자 순유출 비중",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/BM.KLT.DINV.WD.GD.ZS?locations=KR",
    "description": "Foreign direct investment, net outflows (% of GDP)",
    "definition": "Foreign direct investment refers to direct investment equity flows in an economy. It is the sum of equity capital, reinvestment of earnings, and other capital. Direct investment is a category of cross-border investment associated with a resident in one economy having control or a significant degree of influence on the management of an enterprise that is resident in another economy. Ownership of 10 percent or more of the ordinary shares of voting stock is the criterion for determining the existence of a direct investment relationship. This series shows net outflows of investment from the reporting economy to the rest of the world, and is divided by GDP.",
    "attribution": "Balance of Payments database, International Monetary Fund (IMF), note: International Monetary Fund, Balance of Payments database, supplemented by data from the United Nations Conference on Trade and Development and official national sources.;\nUN Conference on Trade and Development (UNCTAD);\nOfficial national sources",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 해외 직접투자 순유출 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/BM.KLT.DINV.WD.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2.20204824603075
      },
      {
        "year": "2024",
        "value": 2.65146702696443
      },
      {
        "year": "2023",
        "value": 1.74392257724062
      },
      {
        "year": "2022",
        "value": 3.65679386129604
      },
      {
        "year": "2021",
        "value": 3.39804042593299
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:02+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-tx-val-mrch-cd-wt",
    "title": "한국 상품 수출액",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/TX.VAL.MRCH.CD.WT?locations=KR",
    "description": "Merchandise exports (current US$)",
    "definition": "Merchandise exports includes goods whose economic ownership is changed from a resident to a non-resident and that are not included in the following specific categories: goods under merchanting, non-monetary gold, and parts of travel, construction, and government goods and services n.i.e. This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.",
    "attribution": "World Trade Organization (WTO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 상품 수출액 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/TX.VAL.MRCH.CD.WT",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 709330000000.0
      },
      {
        "year": "2024",
        "value": 683609000000.0
      },
      {
        "year": "2023",
        "value": 632226000000.0
      },
      {
        "year": "2022",
        "value": 683585000000.0
      },
      {
        "year": "2021",
        "value": 644400000000.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:02+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-tm-val-mrch-cd-wt",
    "title": "한국 상품 수입액",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/TM.VAL.MRCH.CD.WT?locations=KR",
    "description": "Merchandise imports (current US$)",
    "definition": "Merchandise imports includes goods whose economic ownership is changed from a non-resident to a resident and that are not included in the following specific categories: goods under merchanting, non-monetary gold, and parts of travel, construction, and government goods and services n.i.e. This indicator is expressed in current prices, meaning no adjustment has been made to account for price changes over time. This indicator is expressed in United States dollars.",
    "attribution": "World Trade Organization (WTO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 상품 수입액 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/TM.VAL.MRCH.CD.WT",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 631895000000.0
      },
      {
        "year": "2024",
        "value": 631767000000.0
      },
      {
        "year": "2023",
        "value": 642572000000.0
      },
      {
        "year": "2022",
        "value": 731370000000.0
      },
      {
        "year": "2021",
        "value": 615093000000.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:02+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-bx-trf-pwkr-cd-dt",
    "title": "한국 개인 송금 수취액",
    "provider": "World Bank",
    "category": "무역·국제수지",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT?locations=KR",
    "description": "Personal remittances, received (current US$)",
    "definition": "Personal remittances comprise personal transfers and compensation of employees. Personal transfers consist of all current transfers in cash or in kind made or received by resident households to or from nonresident households. Personal transfers thus include all current transfers between resident and nonresident individuals. Compensation of employees refers to the income of border, seasonal, and other short-term workers who are employed in an economy where they are not resident and of residents employed by nonresident entities. Data are the sum of two items defined in the sixth edition of the IMF's Balance of Payments Manual: personal transfers and compensation of employees. Data are in current U.S. dollars.",
    "attribution": "IMF balance of payments data, International Monetary Fund (IMF);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 개인 송금 수취액 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/BX.TRF.PWKR.CD.DT",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 7070900000.0
      },
      {
        "year": "2024",
        "value": 7283000000.0
      },
      {
        "year": "2023",
        "value": 7106500000.0
      },
      {
        "year": "2022",
        "value": 7861000000.0
      },
      {
        "year": "2021",
        "value": 7789300000.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:02+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-grow",
    "title": "한국 인구 증가율",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.GROW?locations=KR",
    "description": "Population growth (annual %)",
    "definition": "Annual population growth rate for year t is the exponential rate of growth of midyear population from year t-1 to t, expressed as a percentage. Population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.",
    "attribution": "World Population Prospects, United Nations (UN), note: Derived from total population, publisher: UN Population Division;\nStatistical databases and publications from national statistical offices, National Statistical Offices (NSOs), note: Derived from total population;\nDemographic Statistics, Eurostat (ESTAT), note: Derived from total population;\nPopulation and Vital Statistics Report (various years), United Nations (UN), note: Derived from total population, publisher: UN Statistical Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 인구 증가율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.GROW",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": -0.128584337535563
      },
      {
        "year": "2024",
        "value": 0.0743178674548815
      },
      {
        "year": "2023",
        "value": 0.077477253324535
      },
      {
        "year": "2022",
        "value": -0.187486566698935
      },
      {
        "year": "2021",
        "value": -0.128757315474928
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:02+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-dpnd",
    "title": "한국 전체 부양비",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.DPND?locations=KR",
    "description": "Age dependency ratio (% of working-age population)",
    "definition": "Age dependency ratio is the ratio of dependents--people younger than 15 or older than 64--to the working-age population--those ages 15-64. Data are shown as the proportion of dependents per 100 working-age population.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 전체 부양비 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.DPND",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 43.9571507924701
      },
      {
        "year": "2024",
        "value": 42.5346866514455
      },
      {
        "year": "2023",
        "value": 41.4544025774417
      },
      {
        "year": "2022",
        "value": 40.6448114715604
      },
      {
        "year": "2021",
        "value": 39.7812162829152
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:03+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-dpnd-ol",
    "title": "한국 노년 부양비",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.DPND.OL?locations=KR",
    "description": "Age dependency ratio, old (% of working-age population)",
    "definition": "Age dependency ratio, old, is the ratio of older dependents--people older than 64--to the working-age population--those ages 15-64. Data are shown as the proportion of dependents per 100 working-age population.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 노년 부양비 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.DPND.OL",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 29.2670913343357
      },
      {
        "year": "2024",
        "value": 27.47144069912
      },
      {
        "year": "2023",
        "value": 25.9356983752934
      },
      {
        "year": "2022",
        "value": 24.5912480325812
      },
      {
        "year": "2021",
        "value": 23.2870478873057
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:03+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-dpnd-yg",
    "title": "한국 유소년 부양비",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.DPND.YG?locations=KR",
    "description": "Age dependency ratio, young (% of working-age population)",
    "definition": "Age dependency ratio, young, is the ratio of younger dependents--people younger than 15--to the working-age population--those ages 15-64. Data are shown as the proportion of dependents per 100 working-age population.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 유소년 부양비 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.DPND.YG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 14.6900594581344
      },
      {
        "year": "2024",
        "value": 15.0632459523254
      },
      {
        "year": "2023",
        "value": 15.5187042021483
      },
      {
        "year": "2022",
        "value": 16.0535634389793
      },
      {
        "year": "2021",
        "value": 16.4941683956095
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:03+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-0014-to-zs",
    "title": "한국 14세 이하 인구 비중",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.0014.TO.ZS?locations=KR",
    "description": "Population ages 0-14 (% of total population)",
    "definition": "Population between the ages 0 to 14 as a percentage of the total population. Population is based on the de facto definition of population.",
    "attribution": "United Nations Population Division. World Population Prospects., United Nations Population Division, uri: https://population.un.org/wpp/, publisher: United Nations Population Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 14세 이하 인구 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.0014.TO.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 10.2044670479846
      },
      {
        "year": "2024",
        "value": 10.568126821068
      },
      {
        "year": "2023",
        "value": 10.970817085997
      },
      {
        "year": "2022",
        "value": 11.4142590399463
      },
      {
        "year": "2021",
        "value": 11.799988611027
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:03+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-1564-to-zs",
    "title": "한국 15~64세 인구 비중",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.1564.TO.ZS?locations=KR",
    "description": "Population ages 15-64 (% of total population)",
    "definition": "Total population between the ages 15 to 64 as a percentage of the total population. Population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 15~64세 인구 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.1564.TO.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 69.465114111118
      },
      {
        "year": "2024",
        "value": 70.1583600473263
      },
      {
        "year": "2023",
        "value": 70.6941593301433
      },
      {
        "year": "2022",
        "value": 71.1010946234232
      },
      {
        "year": "2021",
        "value": 71.5403701724822
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:03+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-65up-to-zs",
    "title": "한국 65세 이상 인구 비중",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.65UP.TO.ZS?locations=KR",
    "description": "Population ages 65 and above (% of total population)",
    "definition": "Population ages 65 and above as a percentage of the total population. Population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 65세 이상 인구 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.65UP.TO.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 20.3304188408974
      },
      {
        "year": "2024",
        "value": 19.2735131316057
      },
      {
        "year": "2023",
        "value": 18.3350235838597
      },
      {
        "year": "2022",
        "value": 17.4846463366305
      },
      {
        "year": "2021",
        "value": 16.6596412164908
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:03+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-totl-fe-zs",
    "title": "한국 여성 인구 비중",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.TOTL.FE.ZS?locations=KR",
    "description": "Population, female (% of total population)",
    "definition": "Female population is the percentage of the population that is female. Population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division;\nStaff estimates, World Bank (WB), note: World Bank staff estimates based on age/sex distributions of United Nations Population Division's World Population Prospects: 2022 Revision",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 여성 인구 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.TOTL.FE.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 50.1136188806211
      },
      {
        "year": "2024",
        "value": 50.0863497313003
      },
      {
        "year": "2023",
        "value": 50.0821478954299
      },
      {
        "year": "2022",
        "value": 50.0977183184933
      },
      {
        "year": "2021",
        "value": 50.0925139480684
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:04+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-urb-totl-in-zs",
    "title": "한국 도시 인구 비중",
    "provider": "World Bank",
    "category": "도시·주거",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS?locations=KR",
    "description": "Urban population (% of total population)",
    "definition": "Urban population refers to people living in urban areas as defined by national statistical offices. The data are collected and smoothed by United Nations Population Division.",
    "attribution": "World Urbanization Prospects, United Nations (UN), uri: https://population.un.org/wup/, note: United Nations Population Division's World Urbanization Prospects, National definitions, publisher: UN Population Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 도시 인구 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.URB.TOTL.IN.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 81.1740263306674
      },
      {
        "year": "2024",
        "value": 81.1682528469686
      },
      {
        "year": "2023",
        "value": 81.1645551720421
      },
      {
        "year": "2022",
        "value": 81.1624941626873
      },
      {
        "year": "2021",
        "value": 81.1616526507785
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:04+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-urb-grow",
    "title": "한국 도시 인구 증가율",
    "provider": "World Bank",
    "category": "도시·주거",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.URB.GROW?locations=KR",
    "description": "Urban population growth (annual %)",
    "definition": "Annual urban population growth rate for year t is the exponential rate of growth of midyear urban population from year t-1 to t, expressed as a percentage. Urban population refers to people living in urban areas as defined by national statistical offices. It is calculated using World Bank total population estimates and urban ratios from the United Nations World Urbanization Prospects.",
    "attribution": "World Urbanization Prospects, United Nations (UN), uri: https://population.un.org/wup/, note: World Bank staff estimates based on the United Nations Population Division's World Urbanization Prospects, National definitions, publisher: UN Population Division;\nStaff estimates, World Bank (WB), note: World Bank staff estimates based on the United Nations Population Division's World Urbanization Prospects, National definitions",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 도시 인구 증가율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.URB.GROW",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": -0.121469940385914
      },
      {
        "year": "2024",
        "value": 0.0788732751905413
      },
      {
        "year": "2023",
        "value": 0.080015675146798
      },
      {
        "year": "2022",
        "value": -0.186448252283125
      },
      {
        "year": "2021",
        "value": -0.1463834679225
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:04+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-rur-totl-zs",
    "title": "한국 농촌 인구 비중",
    "provider": "World Bank",
    "category": "도시·주거",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.RUR.TOTL.ZS?locations=KR",
    "description": "Rural population (% of total population)",
    "definition": "Rural population refers to people living in rural areas as defined by national statistical offices. It is calculated as the difference between total population and urban population.",
    "attribution": "World Urbanization Prospects, United Nations (UN), uri: https://population.un.org/wup/, note: World Bank staff estimates based on the United Nations Population Division's World Urbanization Prospects, National definitions, publisher: UN Population Division;\nStaff estimates, World Bank (WB), note: World Bank staff estimates based on the United Nations Population Division's World Urbanization Prospects, National definitions",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 농촌 인구 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.RUR.TOTL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 18.8259736693326
      },
      {
        "year": "2024",
        "value": 18.8317471530314
      },
      {
        "year": "2023",
        "value": 18.8354448279579
      },
      {
        "year": "2022",
        "value": 18.8375058373127
      },
      {
        "year": "2021",
        "value": 18.8383473492215
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:04+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-en-pop-dnst",
    "title": "한국 인구 밀도",
    "provider": "World Bank",
    "category": "도시·주거",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EN.POP.DNST?locations=KR",
    "description": "Population density (people per sq. km of land area)",
    "definition": "Population density is midyear population divided by land area in square kilometers. Population is based on the de facto definition of population, which counts all residents regardless of legal status or citizenship--except for refugees not permanently settled in the country of asylum, who are generally considered part of the population of their country of origin. Land area is a country's total area, excluding area under inland water bodies, national claims to continental shelf, and exclusive economic zones. In most cases the definition of inland water bodies includes major rivers and lakes.",
    "attribution": "FAO population estimates, Food and Agriculture Organization of the United Nations (FAO), publisher: Food and Agriculture Organization of the United Nations (FAO);\nWorld Bank population estimates, World Bank (WB), publisher: World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 인구 밀도 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EN.POP.DNST",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 530.236321721311
      },
      {
        "year": "2023",
        "value": 529.842407786885
      },
      {
        "year": "2022",
        "value": 529.43205942623
      },
      {
        "year": "2021",
        "value": 530.425604508197
      },
      {
        "year": "2020",
        "value": 531.109006147541
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:04+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-dyn-tfrt-in",
    "title": "한국 합계출산율",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.DYN.TFRT.IN?locations=KR",
    "description": "Fertility rate, total (births per woman)",
    "definition": "Total fertility rate represents the number of children that would be born to a woman if she were to live to the end of her childbearing years and bear children in accordance with age-specific fertility rates of the specified year.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division;\nStatistical databases and publications from national statistical offices, National Statistical Offices (NSOs);\nDemographic Statistics, Eurostat (ESTAT)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 합계출산율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.DYN.TFRT.IN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 0.748
      },
      {
        "year": "2023",
        "value": 0.721
      },
      {
        "year": "2022",
        "value": 0.778
      },
      {
        "year": "2021",
        "value": 0.808
      },
      {
        "year": "2020",
        "value": 0.837
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:04+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-dyn-cbrt-in",
    "title": "한국 조출생률",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.DYN.CBRT.IN?locations=KR",
    "description": "Birth rate, crude (per 1,000 people)",
    "definition": "Crude birth rate indicates the number of live births occurring during the year, per 1,000 population estimated at midyear. Subtracting the crude death rate from the crude birth rate provides the rate of natural increase, which is equal to the rate of population change in the absence of migration.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division;\nStatistical databases and publications from national statistical offices, National Statistical Offices (NSOs);\nDemographic Statistics, Eurostat (ESTAT);\nPopulation and Vital Statistics Report (various years), United Nations (UN), publisher: UN Statistical Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 조출생률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.DYN.CBRT.IN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 4.7
      },
      {
        "year": "2023",
        "value": 4.5
      },
      {
        "year": "2022",
        "value": 4.9
      },
      {
        "year": "2021",
        "value": 5.1
      },
      {
        "year": "2020",
        "value": 5.3
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:04+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-dyn-cdrt-in",
    "title": "한국 조사망률",
    "provider": "World Bank",
    "category": "인구·사회",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.DYN.CDRT.IN?locations=KR",
    "description": "Death rate, crude (per 1,000 people)",
    "definition": "Crude death rate indicates the number of deaths occurring during the year, per 1,000 population estimated at midyear. Subtracting the crude death rate from the crude birth rate provides the rate of natural increase, which is equal to the rate of population change in the absence of migration.",
    "attribution": "World Population Prospects, United Nations (UN), publisher: UN Population Division;\nStatistical databases and publications from national statistical offices, National Statistical Offices (NSOs);\nDemographic Statistics, Eurostat (ESTAT);\nPopulation and Vital Statistics Report (various years), United Nations (UN), publisher: UN Statistical Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 조사망률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.DYN.CDRT.IN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 7.0
      },
      {
        "year": "2023",
        "value": 6.9
      },
      {
        "year": "2022",
        "value": 7.3
      },
      {
        "year": "2021",
        "value": 6.2
      },
      {
        "year": "2020",
        "value": 5.9
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:05+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-dyn-imrt-in",
    "title": "한국 영아 사망률",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.DYN.IMRT.IN?locations=KR",
    "description": "Mortality rate, infant (per 1,000 live births)",
    "definition": "Infant mortality rate is the number of infants dying before reaching one year of age, per 1,000 live births in a given year.",
    "attribution": "UN Inter-agency Group for Child Mortality Estimation, UN Children's Fund (UNICEF), uri: www.childmortality.org;\nWorld Health Organization (WHO), uri: www.childmortality.org, note: UN Inter-agency Group for Child Mortality Estimation;\nWorld Bank (WB), uri: www.childmortality.org, note: UN Inter-agency Group for Child Mortality Estimation;\nUnited Nations (UN), uri: www.childmortality.org, note: UN Inter-agency Group for Child Mortality Estimation, publisher: UN Population Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 영아 사망률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.DYN.IMRT.IN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 2.3
      },
      {
        "year": "2023",
        "value": 2.4
      },
      {
        "year": "2022",
        "value": 2.4
      },
      {
        "year": "2021",
        "value": 2.5
      },
      {
        "year": "2020",
        "value": 2.5
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:05+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-dyn-mort",
    "title": "한국 5세 미만 아동 사망률",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.DYN.MORT?locations=KR",
    "description": "Mortality rate, under-5 (per 1,000 live births)",
    "definition": "Under-five mortality rate is the probability per 1,000 that a newborn baby will die before reaching age five, if subject to age-specific mortality rates of the specified year.",
    "attribution": "UN Inter-agency Group for Child Mortality Estimation, UN Children's Fund (UNICEF), uri: www.childmortality.org, publisher: UNICEF, WHO, World Bank, United Nations Population Division;\nWorld Health Organization (WHO), uri: www.childmortality.org, note: UN Inter-agency Group for Child Mortality Estimation;\nWorld Bank (WB), uri: www.childmortality.org, note: UN Inter-agency Group for Child Mortality Estimation;\nUnited Nations (UN), uri: www.childmortality.org, note: UN Inter-agency Group for Child Mortality Estimation, publisher: UN Population Division",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 5세 미만 아동 사망률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.DYN.MORT",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 2.8
      },
      {
        "year": "2023",
        "value": 2.9
      },
      {
        "year": "2022",
        "value": 2.9
      },
      {
        "year": "2021",
        "value": 3.0
      },
      {
        "year": "2020",
        "value": 3.1
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:05+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-sta-mmrt",
    "title": "한국 모성 사망비",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.STA.MMRT?locations=KR",
    "description": "Maternal mortality ratio (modeled estimate, per 100,000 live births)",
    "definition": "Maternal mortality ratio is the number of women who die from pregnancy-related causes while pregnant or within 42 days of pregnancy termination per 100,000 live births. The data are estimated with a regression model using information on the proportion of maternal deaths among non-AIDS deaths in women ages 15-49, fertility, birth attendants, and GDP measured using purchasing power parities (PPPs).",
    "attribution": "Trends in Maternal Mortality, World Health Organization (WHO), uri: https://www.who.int/news/item/23-02-2023-a-woman-dies-every-two-minutes-due-to-pregnancy-or-childbirth--un-agencies;\nUN Children's Fund (UNICEF), note: Trends in Maternal Mortality;\nUN Population Fund (UNFPA), note: Trends in Maternal Mortality;\nWorld Bank Group (WBG), note: Trends in Maternal Mortality",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 모성 사망비 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.STA.MMRT",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 4.0
      },
      {
        "year": "2022",
        "value": 7.0
      },
      {
        "year": "2021",
        "value": 5.0
      },
      {
        "year": "2020",
        "value": 12.0
      },
      {
        "year": "2019",
        "value": 5.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:05+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-xpd-chex-gd-zs",
    "title": "한국 경상의료비 GDP 비중",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.XPD.CHEX.GD.ZS?locations=KR",
    "description": "Current health expenditure (% of GDP)",
    "definition": "Level of current health expenditure expressed as a percentage of GDP.  Estimates of current health expenditures include healthcare goods and services consumed during each year. This indicator does not include capital health expenditures such as buildings, machinery, IT and stocks of vaccines for emergency or outbreaks.",
    "attribution": "Global Health Expenditure Database, updated December 12th, 2025, World Health Organization (WHO), uri: https://apps.who.int/nha/database",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 경상의료비 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.XPD.CHEX.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 8.67656994
      },
      {
        "year": "2023",
        "value": 8.5650692
      },
      {
        "year": "2022",
        "value": 8.8595314
      },
      {
        "year": "2021",
        "value": 8.34412766
      },
      {
        "year": "2020",
        "value": 8.02722836
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:05+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-xpd-chex-pc-cd",
    "title": "한국 1인당 경상의료비",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.XPD.CHEX.PC.CD?locations=KR",
    "description": "Current health expenditure per capita (current US$)",
    "definition": "Current expenditures on health per capita in current US dollars. Estimates of current health expenditures include healthcare goods and services consumed during each year.",
    "attribution": "Global Health Expenditure Database, updated December 12th, 2025, World Health Organization (WHO), uri: http://apps.who.int/nha/database",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 1인당 경상의료비 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.XPD.CHEX.PC.CD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 3136.78564453
      },
      {
        "year": "2023",
        "value": 3043.87329102
      },
      {
        "year": "2022",
        "value": 3078.55151367
      },
      {
        "year": "2021",
        "value": 3125.82714844
      },
      {
        "year": "2020",
        "value": 2699.6640625
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:05+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-med-beds-zs",
    "title": "한국 천 명당 병상 수",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.MED.BEDS.ZS?locations=KR",
    "description": "Hospital beds (per 1,000 people)",
    "definition": "Hospital beds include inpatient beds available in public, private, general, and specialized hospitals and rehabilitation centers. In most cases beds for both acute and chronic care are included.",
    "attribution": "WHO data, supplemented by country data, World Health Organization (WHO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 천 명당 병상 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.MED.BEDS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2022",
        "value": 12.81
      },
      {
        "year": "2021",
        "value": 12.75
      },
      {
        "year": "2020",
        "value": 12.65
      },
      {
        "year": "2019",
        "value": 12.43
      },
      {
        "year": "2018",
        "value": 12.43
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:05+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-med-phys-zs",
    "title": "한국 천 명당 의사 수",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.MED.PHYS.ZS?locations=KR",
    "description": "Physicians (per 1,000 people)",
    "definition": "Physicians include generalist and specialist medical practitioners.",
    "attribution": "Global Health Workforce Statistics, World Health Organization (WHO);\nOrganisation for Economic Co-operation and Development (OECD);\nCountry data",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 천 명당 의사 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.MED.PHYS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2022",
        "value": 2.61
      },
      {
        "year": "2021",
        "value": 2.517
      },
      {
        "year": "2020",
        "value": 2.507
      },
      {
        "year": "2019",
        "value": 2.458
      },
      {
        "year": "2018",
        "value": 2.386
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:06+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-imm-idpt",
    "title": "한국 DPT 예방접종률",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.IMM.IDPT?locations=KR",
    "description": "Immunization, DPT (% of children ages 12-23 months)",
    "definition": "Child immunization, DPT, measures the percentage of children ages 12-23 months who received DPT vaccinations before 12 months or at any time before the survey. A child is considered adequately immunized against diphtheria, pertussis (or whooping cough), and tetanus (DPT) after receiving three doses of vaccine.",
    "attribution": "World Health Organization (WHO), uri: http://www.who.int/immunization/monitoring_surveillance/en/;\nUN Children's Fund (UNICEF)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 DPT 예방접종률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.IMM.IDPT",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 97.0
      },
      {
        "year": "2023",
        "value": 98.0
      },
      {
        "year": "2022",
        "value": 98.0
      },
      {
        "year": "2021",
        "value": 98.0
      },
      {
        "year": "2020",
        "value": 98.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:06+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-imm-meas",
    "title": "한국 홍역 예방접종률",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.IMM.MEAS?locations=KR",
    "description": "Immunization, measles (% of children ages 12-23 months)",
    "definition": "Child immunization, measles, measures the percentage of children ages 12-23 months who received the measles vaccination before 12 months or at any time before the survey. A child is considered adequately immunized against measles after receiving one dose of vaccine.",
    "attribution": "World Health Organization (WHO), uri: http://www.who.int/immunization/monitoring_surveillance/en/;\nUN Children's Fund (UNICEF), uri: https://data.unicef.org/topic/child-health/immunization/",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 홍역 예방접종률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.IMM.MEAS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 97.0
      },
      {
        "year": "2023",
        "value": 97.0
      },
      {
        "year": "2022",
        "value": 97.0
      },
      {
        "year": "2021",
        "value": 98.0
      },
      {
        "year": "2020",
        "value": 98.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:06+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-tbs-incd",
    "title": "한국 결핵 발생률",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.TBS.INCD?locations=KR",
    "description": "Incidence of tuberculosis (per 100,000 people)",
    "definition": "Incidence of tuberculosis is the estimated number of new and relapse tuberculosis cases arising in a given year, expressed as the rate per 100,000 population. All forms of TB are included, including cases in people living with HIV. Estimates for all years are recalculated as new information becomes available and techniques are refined, so they may differ from those published previously.",
    "attribution": "Global Tuberculosis Report, World Health Organization (WHO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 결핵 발생률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.TBS.INCD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 35.0
      },
      {
        "year": "2023",
        "value": 38.0
      },
      {
        "year": "2022",
        "value": 40.0
      },
      {
        "year": "2021",
        "value": 44.0
      },
      {
        "year": "2020",
        "value": 48.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:06+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-sta-diab-zs",
    "title": "한국 성인 당뇨병 유병률",
    "provider": "World Bank",
    "category": "보건·의료",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.STA.DIAB.ZS?locations=KR",
    "description": "Diabetes prevalence (% of population ages 20 to 79)",
    "definition": "Diabetes prevalence refers to the percentage of people ages 20-79 who have type 1 or type 2 diabetes. It is calculated by adjusting to a standard population age-structure.",
    "attribution": "Diabetes Atlas, International Diabetes Federation",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 성인 당뇨병 유병률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.STA.DIAB.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 9.6
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:07+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 1행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-uem-totl-zs",
    "title": "한국 전체 실업률",
    "provider": "World Bank",
    "category": "고용·노동",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.UEM.TOTL.ZS?locations=KR",
    "description": "Unemployment, total (% of total labor force) (modeled ILO estimate)",
    "definition": "Unemployment refers to the share of the labor force that is without work but available for and seeking employment.",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: external database, date accessed: January 17, 2026",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 전체 실업률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.UEM.TOTL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2.683
      },
      {
        "year": "2024",
        "value": 2.784
      },
      {
        "year": "2023",
        "value": 2.675
      },
      {
        "year": "2022",
        "value": 2.857
      },
      {
        "year": "2021",
        "value": 3.639
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:06+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-uem-1524-zs",
    "title": "한국 청년 실업률",
    "provider": "World Bank",
    "category": "고용·노동",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.UEM.1524.ZS?locations=KR",
    "description": "Unemployment, youth total (% of total labor force ages 15-24) (modeled ILO estimate)",
    "definition": "Youth unemployment refers to the share of the labor force ages 15-24 without work but available for and seeking employment.",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: external database, date accessed: January 17, 2026",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 청년 실업률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.UEM.1524.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 6.695
      },
      {
        "year": "2024",
        "value": 6.434
      },
      {
        "year": "2023",
        "value": 5.405
      },
      {
        "year": "2022",
        "value": 6.638
      },
      {
        "year": "2021",
        "value": 8.055
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:07+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-tlf-cact-zs",
    "title": "한국 경제활동 참가율",
    "provider": "World Bank",
    "category": "고용·노동",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.TLF.CACT.ZS?locations=KR",
    "description": "Labor force participation rate, total (% of total population ages 15+) (modeled ILO estimate)",
    "definition": "Labor force participation rate is the proportion of the population ages 15 and older that is economically active: all people who supply labor for the production of goods and services during a specified period.",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: external database, date accessed: January 17, 2026",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 경제활동 참가율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.TLF.CACT.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 64.351
      },
      {
        "year": "2024",
        "value": 64.465
      },
      {
        "year": "2023",
        "value": 64.266
      },
      {
        "year": "2022",
        "value": 63.794
      },
      {
        "year": "2021",
        "value": 62.55
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:07+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-tlf-cact-fe-zs",
    "title": "한국 여성 경제활동 참가율",
    "provider": "World Bank",
    "category": "고용·노동",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.TLF.CACT.FE.ZS?locations=KR",
    "description": "Labor force participation rate, female (% of female population ages 15+) (modeled ILO estimate)",
    "definition": "The labor force participation rate is the labor force as a percent of the population ages 15 and older. The labor force is the sum of all persons of working age who are employed and those who are unemployed.",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: external database, date accessed: January 17, 2026",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 여성 경제활동 참가율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.TLF.CACT.FE.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 56.782
      },
      {
        "year": "2024",
        "value": 56.826
      },
      {
        "year": "2023",
        "value": 56.038
      },
      {
        "year": "2022",
        "value": 55.03
      },
      {
        "year": "2021",
        "value": 53.65
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:07+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-tlf-totl-in",
    "title": "한국 전체 노동력",
    "provider": "World Bank",
    "category": "고용·노동",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.TLF.TOTL.IN?locations=KR",
    "description": "Labor force, total",
    "definition": "Labor force comprises people ages 15 and older who supply labor for the production of goods and services during a specified period. It includes people who are currently employed and people who are unemployed but seeking work as well as first-time job-seekers. Not everyone who works is included, however. Unpaid workers, family workers, and students are often omitted, and some countries do not count members of the armed forces. Labor force size tends to vary during the year as seasonal workers enter and leave.",
    "attribution": "International Labour Organization (ILO), type: estimates based on external database;\nUnited Nations (UN), publisher: UN Population Division;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 전체 노동력 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.TLF.TOTL.IN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 29865575.0
      },
      {
        "year": "2024",
        "value": 29835657.0
      },
      {
        "year": "2023",
        "value": 29587631.0
      },
      {
        "year": "2022",
        "value": 29201402.0
      },
      {
        "year": "2021",
        "value": 28560792.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:07+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-emp-totl-sp-zs",
    "title": "한국 고용 인구 비율",
    "provider": "World Bank",
    "category": "고용·노동",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.EMP.TOTL.SP.ZS?locations=KR",
    "description": "Employment to population ratio, 15+, total (%) (modeled ILO estimate)",
    "definition": "Employment to population ratio is the proportion of a country's population that is employed.",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: external database, date accessed: January 17, 2026",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 고용 인구 비율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.EMP.TOTL.SP.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 62.624
      },
      {
        "year": "2024",
        "value": 62.67
      },
      {
        "year": "2023",
        "value": 62.547
      },
      {
        "year": "2022",
        "value": 61.971
      },
      {
        "year": "2021",
        "value": 60.274
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:13+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-emp-vuln-zs",
    "title": "한국 취약 고용 비율",
    "provider": "World Bank",
    "category": "고용·노동",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.EMP.VULN.ZS?locations=KR",
    "description": "Vulnerable employment, total (% of total employment) (modeled ILO estimate)",
    "definition": "Vulnerable employment is contributing family workers and own-account workers as a percentage of total employment.",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: estimates based on external database;\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 취약 고용 비율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.EMP.VULN.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 17.6868314198239
      },
      {
        "year": "2024",
        "value": 17.8505357530481
      },
      {
        "year": "2023",
        "value": 18.1874620593958
      },
      {
        "year": "2022",
        "value": 18.5907853606545
      },
      {
        "year": "2021",
        "value": 19.1130541438887
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:08+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-gdp-pcap-em-kd",
    "title": "한국 취업자당 GDP",
    "provider": "World Bank",
    "category": "고용·노동",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.GDP.PCAP.EM.KD?locations=KR",
    "description": "GDP per person employed (constant 2021 PPP $)",
    "definition": "GDP per person employed is gross domestic product (GDP) divided by total employment in the economy. Purchasing power parity (PPP) GDP is GDP converted to 2021 constant international dollars using PPP rates. An international dollar has the same purchasing power over GDP that a U.S. dollar has in the United States.",
    "attribution": "Staff estimates, World Bank (WB), note: Estimates are based on employment, population, GDP, and PPP data obtained from International Labour Organization, United Nations Population Division, Eurostat, OECD, and World Bank., type: estimates based on external database;\nInternational Labour Organization (ILO);\nUnited Nations (UN), publisher: UN Population Division;\nEurostat (ESTAT);\nOrganisation for Economic Co-operation and Development (OECD);\nWorld Development Indicators database, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 취업자당 GDP · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.GDP.PCAP.EM.KD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 99045.9987724777
      },
      {
        "year": "2024",
        "value": 98258.5741422485
      },
      {
        "year": "2023",
        "value": 97026.6007247124
      },
      {
        "year": "2022",
        "value": 96960.0305578976
      },
      {
        "year": "2021",
        "value": 97284.8428897318
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:08+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-se-xpd-totl-gd-zs",
    "title": "한국 교육지출 GDP 비중",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SE.XPD.TOTL.GD.ZS?locations=KR",
    "description": "Government expenditure on education, total (% of GDP)",
    "definition": "General government expenditure on education (current, capital, and transfers) is expressed as a percentage of GDP. It includes expenditure funded by transfers from international sources to government. General government usually refers to local, regional and central governments.",
    "attribution": "Data API, UN Educational, Scientific and Cultural Organization (UNESCO), uri: https://databrowser.uis.unesco.org/resources, note: The data are obtained through the UIS API.  Detailed documentation is available at: https://api.uis.unesco.org/api/public/documentation/, publisher: UNESCO Institute for Statistics (UIS), date accessed: 2026-03-19, date published: 2026-02",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 교육지출 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SE.XPD.TOTL.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2022",
        "value": 5.40910005569458
      },
      {
        "year": "2021",
        "value": 4.55590009689331
      },
      {
        "year": "2020",
        "value": 4.52706003189087
      },
      {
        "year": "2019",
        "value": 4.41813993453979
      },
      {
        "year": "2018",
        "value": 4.21645021438599
      }
    ],
    "preview_checked_at": "2026-10-29T15:13:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-se-prm-enrr",
    "title": "한국 초등교육 총취학률",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SE.PRM.ENRR?locations=KR",
    "description": "School enrollment, primary (% gross)",
    "definition": "Gross enrollment ratio is the ratio of total enrollment, regardless of age, to the population of the age group that officially corresponds to the level of education shown. Primary education provides children with basic reading, writing, and mathematics skills along with an elementary understanding of such subjects as history, geography, natural science, social science, art, and music.",
    "attribution": "Data API, UN Educational, Scientific and Cultural Organization (UNESCO), uri: https://databrowser.uis.unesco.org/resources, note: The data are obtained through the UIS API.  Detailed documentation is available at: https://api.uis.unesco.org/api/public/documentation/, publisher: UNESCO Institute for Statistics (UIS), type: Bulk file (csv), date accessed: 2026-03-19, date published: 2026-02",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 초등교육 총취학률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SE.PRM.ENRR",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 100.866508483887
      },
      {
        "year": "2023",
        "value": 100.301467895508
      },
      {
        "year": "2022",
        "value": 99.0050201416016
      },
      {
        "year": "2021",
        "value": 98.6079330444336
      },
      {
        "year": "2020",
        "value": 99.217903137207
      }
    ],
    "preview_checked_at": "2026-10-29T15:13:59+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-se-sec-enrr",
    "title": "한국 중등교육 총취학률",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SE.SEC.ENRR?locations=KR",
    "description": "School enrollment, secondary (% gross)",
    "definition": "Gross enrollment ratio is the ratio of total enrollment, regardless of age, to the population of the age group that officially corresponds to the level of education shown. Secondary education completes the provision of basic education that began at the primary level, and aims at laying the foundations for lifelong learning and human development, by offering more subject- or skill-oriented instruction using more specialized teachers.",
    "attribution": "Data API, UN Educational, Scientific and Cultural Organization (UNESCO), uri: https://databrowser.uis.unesco.org/resources, note: The data are obtained through the UIS API.  Detailed documentation is available at: https://api.uis.unesco.org/api/public/documentation/, publisher: UNESCO Institute for Statistics (UIS), type: Bulk file (csv), date accessed: 2026-03-19, date published: 2026-02",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 중등교육 총취학률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SE.SEC.ENRR",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 96.2539901733398
      },
      {
        "year": "2023",
        "value": 96.2983932495117
      },
      {
        "year": "2022",
        "value": 97.8181304931641
      },
      {
        "year": "2021",
        "value": 98.0692291259766
      },
      {
        "year": "2020",
        "value": 97.0888214111328
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:14+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-se-ter-enrr",
    "title": "한국 고등교육 총취학률",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SE.TER.ENRR?locations=KR",
    "description": "School enrollment, tertiary (% gross)",
    "definition": "Gross enrollment ratio is the ratio of total enrollment, regardless of age, to the population of the age group that officially corresponds to the level of education shown. Tertiary education, whether or not to an advanced research qualification, normally requires, as a minimum condition of admission, the successful completion of education at the secondary level.",
    "attribution": "Data API, UN Educational, Scientific and Cultural Organization (UNESCO), uri: https://databrowser.uis.unesco.org/resources, note: The data are obtained through the UIS API.  Detailed documentation is available at: https://api.uis.unesco.org/api/public/documentation/, publisher: UNESCO Institute for Statistics (UIS), type: Bulk file (csv), date accessed: 2026-03-19, date published: 2026-02",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 고등교육 총취학률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SE.TER.ENRR",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 111.853302001953
      },
      {
        "year": "2023",
        "value": 106.709167480469
      },
      {
        "year": "2022",
        "value": 102.813056945801
      },
      {
        "year": "2021",
        "value": 100.359878540039
      },
      {
        "year": "2020",
        "value": 96.8767700195312
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:14+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-se-prm-enrl-tc-zs",
    "title": "한국 초등학교 교사당 학생 수",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SE.PRM.ENRL.TC.ZS?locations=KR",
    "description": "Pupil-teacher ratio, primary",
    "definition": "Primary school pupil-teacher ratio is the average number of pupils per teacher in primary school.",
    "attribution": "Stat Bulk Data Download Service, UN Educational, Scientific and Cultural Organization (UNESCO), uri: https://uis.unesco.org/bdds, publisher: UNESCO Institute for Statistics (UIS)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 초등학교 교사당 학생 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SE.PRM.ENRL.TC.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2017",
        "value": 16.28669
      },
      {
        "year": "2016",
        "value": 16.30703
      },
      {
        "year": "2015",
        "value": 16.55424
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:15+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 3행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-se-sec-enrl-tc-zs",
    "title": "한국 중등학교 교사당 학생 수",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SE.SEC.ENRL.TC.ZS?locations=KR",
    "description": "Pupil-teacher ratio, secondary",
    "definition": "Secondary school pupil-teacher ratio is the average number of pupils per teacher in secondary school.",
    "attribution": "Stat Bulk Data Download Service, UN Educational, Scientific and Cultural Organization (UNESCO), uri: https://uis.unesco.org/bdds, publisher: UNESCO Institute for Statistics (UIS)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 중등학교 교사당 학생 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SE.SEC.ENRL.TC.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2017",
        "value": 13.26544
      },
      {
        "year": "2016",
        "value": 13.84298
      },
      {
        "year": "2015",
        "value": 14.40724
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:15+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 3행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-gb-xpd-rsdv-gd-zs",
    "title": "한국 연구개발 지출 GDP 비중",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=KR",
    "description": "Research and development expenditure (% of GDP)",
    "definition": "Gross domestic expenditures on research and development (R&D), expressed as a percent of GDP. They include both capital and current expenditures in the four main sectors: Business enterprise, Government, Higher education and Private non-profit. R&D covers basic research, applied research, and experimental development.",
    "attribution": "Stat Bulk Data Download Service, UN Educational, Scientific and Cultural Organization (UNESCO), uri: https://databrowser.uis.unesco.org/resources/bulk, publisher: UNESCO Institute for Statistics (UIS), date accessed: 2025-03-26, date published: 2025-02",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 연구개발 지출 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/GB.XPD.RSDV.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 4.94352
      },
      {
        "year": "2022",
        "value": 4.84753
      },
      {
        "year": "2021",
        "value": 4.59673
      },
      {
        "year": "2020",
        "value": 4.5214
      },
      {
        "year": "2019",
        "value": 4.36379
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:17+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sp-pop-scie-rd-p6",
    "title": "한국 백만 명당 연구개발 연구원 수",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SP.POP.SCIE.RD.P6?locations=KR",
    "description": "Researchers in R&D (per million people)",
    "definition": "The number of researchers engaged in Research &Development (R&D), expressed as per million. Researchers are professionals who conduct research and improve or develop concepts, theories, models techniques instrumentation, software of operational methods. R&D covers basic research, applied research, and experimental development.",
    "attribution": "Stat Bulk Data Download Service, UN Educational, Scientific and Cultural Organization (UNESCO), uri: https://databrowser.uis.unesco.org/resources/bulk, publisher: UNESCO Institute for Statistics (UIS), date accessed: 2025-03-26, date published: 2025-02",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 백만 명당 연구개발 연구원 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SP.POP.SCIE.RD.P6",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 9471.82543
      },
      {
        "year": "2022",
        "value": 9434.7613
      },
      {
        "year": "2021",
        "value": 9071.4503
      },
      {
        "year": "2020",
        "value": 8620.009
      },
      {
        "year": "2019",
        "value": 8328.96727
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:17+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ip-pat-resd",
    "title": "한국 거주자 특허 출원 수",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IP.PAT.RESD?locations=KR",
    "description": "Patent applications, residents",
    "definition": "Patent applications are worldwide patent applications filed through the Patent Cooperation Treaty procedure or with a national patent office for exclusive rights for an invention--a product or process that provides a new way of doing something or offers a new technical solution to a problem. A patent provides protection for the invention to the owner of the patent for a limited period, generally 20 years.",
    "attribution": "WIPO Patent Report: Statistics on Worldwide Patent Activity, World Intellectual Property Organization (WIPO), note: The International Bureau of WIPO assumes no responsibility with respect to the transformation of these data.",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 거주자 특허 출원 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IP.PAT.RESD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 195786.0
      },
      {
        "year": "2023",
        "value": 191142.0
      },
      {
        "year": "2022",
        "value": 183748.0
      },
      {
        "year": "2021",
        "value": 186245.0
      },
      {
        "year": "2020",
        "value": 180477.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:18+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ip-pat-nres",
    "title": "한국 비거주자 특허 출원 수",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IP.PAT.NRES?locations=KR",
    "description": "Patent applications, nonresidents",
    "definition": "Patent applications are worldwide patent applications filed through the Patent Cooperation Treaty procedure or with a national patent office for exclusive rights for an invention--a product or process that provides a new way of doing something or offers a new technical solution to a problem. A patent provides protection for the invention to the owner of the patent for a limited period, generally 20 years.",
    "attribution": "WIPO Patent Report: Statistics on Worldwide Patent Activity, World Intellectual Property Organization (WIPO), note: The International Bureau of WIPO assumes no responsibility with respect to the transformation of these data.",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 비거주자 특허 출원 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IP.PAT.NRES",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 50459.0
      },
      {
        "year": "2023",
        "value": 52168.0
      },
      {
        "year": "2022",
        "value": 53885.0
      },
      {
        "year": "2021",
        "value": 51753.0
      },
      {
        "year": "2020",
        "value": 46282.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:19+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ip-jrn-artc-sc",
    "title": "한국 과학·기술 학술논문 수",
    "provider": "World Bank",
    "category": "교육·연구",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IP.JRN.ARTC.SC?locations=KR",
    "description": "Scientific and technical journal articles",
    "definition": "Article counts refer to publications from a selection of conference proceedings and peer-reviewed journals from Scopus in science and engineering fields, according to the National Center for Science and Engineering Statistics Taxonomy of Disciplines.",
    "attribution": "Science and Engineering Indicators, National Science Foundation (NSF), uri: https://ncses.nsf.gov/indicators",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 과학·기술 학술논문 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IP.JRN.ARTC.SC",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 71724.33
      },
      {
        "year": "2022",
        "value": 71998.13
      },
      {
        "year": "2021",
        "value": 72352.13
      },
      {
        "year": "2020",
        "value": 69089.86
      },
      {
        "year": "2019",
        "value": 67687.84
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:19+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-it-net-user-zs",
    "title": "한국 인터넷 이용자 비중",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IT.NET.USER.ZS?locations=KR",
    "description": "Individuals using the Internet (% of population)",
    "definition": "Internet users are individuals who have used the Internet (from any location) in the last 3 months. The Internet can be used via a computer, mobile phone, personal digital assistant, games machine, digital TV etc.",
    "attribution": "World Telecommunication/ICT Indicators Database, International Telecommunication Union (ITU), uri: https://datahub.itu.int/",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 인터넷 이용자 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IT.NET.USER.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 97.89563777
      },
      {
        "year": "2023",
        "value": 97.41597478
      },
      {
        "year": "2022",
        "value": 97.16855335
      },
      {
        "year": "2021",
        "value": 97.57132698
      },
      {
        "year": "2020",
        "value": 96.50506052
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:19+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-it-net-bbnd-p2",
    "title": "한국 백 명당 초고속인터넷 가입 수",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IT.NET.BBND.P2?locations=KR",
    "description": "Fixed broadband subscriptions (per 100 people)",
    "definition": "Fixed broadband subscriptions refers to fixed subscriptions to high-speed access to the public Internet (a TCP/IP connection), at downstream speeds equal to, or greater than, 256 kbit/s. This includes cable modem, DSL, fiber-to-the-home/building, other fixed (wired)-broadband subscriptions, satellite broadband and terrestrial fixed wireless broadband. This total is measured irrespective of the method of payment. It excludes subscriptions that have access to data communications (including the Internet) via mobile-cellular networks. It should include fixed WiMAX and any other fixed wireless technologies. It includes both residential subscriptions and subscriptions for organizations.",
    "attribution": "World Telecommunication/ICT Indicators Database, International Telecommunication Union (ITU)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 백 명당 초고속인터넷 가입 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IT.NET.BBND.P2",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 47.8014965507867
      },
      {
        "year": "2023",
        "value": 46.5676352036327
      },
      {
        "year": "2022",
        "value": 45.4542124182774
      },
      {
        "year": "2021",
        "value": 44.2526082339633
      },
      {
        "year": "2020",
        "value": 43.0540600860627
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:19+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-it-cel-sets-p2",
    "title": "한국 백 명당 이동통신 가입 수",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IT.CEL.SETS.P2?locations=KR",
    "description": "Mobile cellular subscriptions (per 100 people)",
    "definition": "Mobile cellular telephone subscriptions are subscriptions to a public mobile telephone service that provide access to the PSTN using cellular technology. The indicator includes (and is split into) the number of postpaid subscriptions, and the number of active prepaid accounts (i.e. that have been used during the last three months). The indicator applies to all mobile cellular subscriptions that offer voice communications. It excludes subscriptions via data cards or USB modems, subscriptions to public mobile data services, private trunked mobile radio, telepoint, radio paging and telemetry services.",
    "attribution": "World Telecommunication/ICT Indicators Database, International Telecommunication Union (ITU)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 백 명당 이동통신 가입 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IT.CEL.SETS.P2",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 172.520241179065
      },
      {
        "year": "2023",
        "value": 162.11365652794
      },
      {
        "year": "2022",
        "value": 148.68360770138
      },
      {
        "year": "2021",
        "value": 140.516382791931
      },
      {
        "year": "2020",
        "value": 135.973274343048
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:19+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-it-mlt-main-p2",
    "title": "한국 백 명당 유선전화 가입 수",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IT.MLT.MAIN.P2?locations=KR",
    "description": "Fixed telephone subscriptions (per 100 people)",
    "definition": "Fixed telephone subscriptions refers to the sum of active number of analogue fixed telephone lines, voice-over-IP (VoIP) subscriptions, fixed wireless local loop (WLL) subscriptions, ISDN voice-channel equivalents and fixed public payphones.",
    "attribution": "World Telecommunication/ICT Indicators Database, International Telecommunication Union (ITU)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 백 명당 유선전화 가입 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IT.MLT.MAIN.P2",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 41.1670420064044
      },
      {
        "year": "2023",
        "value": 42.8125485337913
      },
      {
        "year": "2022",
        "value": 44.0492458148805
      },
      {
        "year": "2021",
        "value": 44.7712761495789
      },
      {
        "year": "2020",
        "value": 46.006435359986
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:20+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-it-net-secr-p6",
    "title": "한국 백만 명당 보안 인터넷 서버 수",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IT.NET.SECR.P6?locations=KR",
    "description": "Secure Internet servers (per 1 million people)",
    "definition": "The number of distinct, publicly-trusted TLS/SSL certificates found in the Netcraft Secure Server Survey (by hosting country), per 1 million people.",
    "attribution": "Secure Server Survey, Netcraft, uri: http://www.netcraft.com/;\nWorld Bank population estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 백만 명당 보안 인터넷 서버 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IT.NET.SECR.P6",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 11902.38307173
      },
      {
        "year": "2023",
        "value": 9728.36049939764
      },
      {
        "year": "2022",
        "value": 8821.91477648421
      },
      {
        "year": "2021",
        "value": 7334.11978035964
      },
      {
        "year": "2020",
        "value": 5939.01112308707
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:20+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-tx-val-ictg-zs-un",
    "title": "한국 ICT 제품 수출 비중",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/TX.VAL.ICTG.ZS.UN?locations=KR",
    "description": "ICT goods exports (% of total goods exports)",
    "definition": "Information and communication technology goods exports include computers and peripheral equipment, communication equipment, consumer electronic equipment, electronic components, and other information and technology goods (miscellaneous).",
    "attribution": "UNCTADstat database, UN Conference on Trade and Development (UNCTAD), uri: http://unctadstat.unctad.org/ReportFolders/reportFolders.aspx",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 ICT 제품 수출 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/TX.VAL.ICTG.ZS.UN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 28.33
      },
      {
        "year": "2023",
        "value": 22.83
      },
      {
        "year": "2022",
        "value": 27.66
      },
      {
        "year": "2021",
        "value": 28.66
      },
      {
        "year": "2020",
        "value": 28.23
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:20+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-tm-val-ictg-zs-un",
    "title": "한국 ICT 제품 수입 비중",
    "provider": "World Bank",
    "category": "디지털·기술",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/TM.VAL.ICTG.ZS.UN?locations=KR",
    "description": "ICT goods imports (% total goods imports)",
    "definition": "Information and communication technology goods imports include computers and peripheral equipment, communication equipment, consumer electronic equipment, electronic components, and other information and technology goods (miscellaneous).",
    "attribution": "UNCTADstat database, UN Conference on Trade and Development (UNCTAD), uri: http://unctadstat.unctad.org/ReportFolders/reportFolders.aspx",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 ICT 제품 수입 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/TM.VAL.ICTG.ZS.UN",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 16.4
      },
      {
        "year": "2023",
        "value": 14.69
      },
      {
        "year": "2022",
        "value": 15.27
      },
      {
        "year": "2021",
        "value": 15.71
      },
      {
        "year": "2020",
        "value": 17.16
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:21+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-lnd-frst-zs",
    "title": "한국 산림 면적 비중",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.LND.FRST.ZS?locations=KR",
    "description": "Forest area (% of land area)",
    "definition": "Forest area (% of land area) is the share of total land area that is under natural or planted stands of trees of at least 5 meters in situ, whether productive or not, and excludes tree stands in agricultural production systems (for example, in fruit plantations and agroforestry systems) and trees in urban parks and gardens.",
    "attribution": "FAOSTAT, Food and Agriculture Organization of the United Nations (FAO), uri: https://www.fao.org/faostat/en/#data/RL, publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 산림 면적 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.LND.FRST.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 64.3739754098361
      },
      {
        "year": "2023",
        "value": 64.4127049180328
      },
      {
        "year": "2022",
        "value": 64.4513319672131
      },
      {
        "year": "2021",
        "value": 64.4900614754098
      },
      {
        "year": "2020",
        "value": 64.5286885245902
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:20+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-lnd-frst-k2",
    "title": "한국 산림 면적",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.LND.FRST.K2?locations=KR",
    "description": "Forest area (sq. km)",
    "definition": "Forest area is land under natural or planted stands of trees of at least 5 meters in situ, whether productive or not, and excludes tree stands in agricultural production systems (for example, in fruit plantations and agroforestry systems) and trees in urban parks and gardens.",
    "attribution": "FAOSTAT, Food and Agriculture Organization of the United Nations (FAO), uri: https://www.fao.org/faostat/en/#data/RL, publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 산림 면적 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.LND.FRST.K2",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 62791.3
      },
      {
        "year": "2024",
        "value": 62829.0
      },
      {
        "year": "2023",
        "value": 62866.8
      },
      {
        "year": "2022",
        "value": 62904.5
      },
      {
        "year": "2021",
        "value": 62942.3
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:20+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-lnd-totl-k2",
    "title": "한국 전체 육지 면적",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.LND.TOTL.K2?locations=KR",
    "description": "Land area (sq. km)",
    "definition": "Land area is a country's total area, excluding area under inland water bodies, national claims to continental shelf, and exclusive economic zones. In most cases the definition of inland water bodies includes major rivers and lakes.",
    "attribution": "FAOSTAT, Food and Agriculture Organization of the United Nations (FAO), uri: https://www.fao.org/faostat/en/#data/RL, publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 전체 육지 면적 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.LND.TOTL.K2",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 97600.0
      },
      {
        "year": "2023",
        "value": 97600.0
      },
      {
        "year": "2022",
        "value": 97600.0
      },
      {
        "year": "2021",
        "value": 97600.0
      },
      {
        "year": "2020",
        "value": 97600.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:21+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-en-atm-pm25-mc-m3",
    "title": "한국 초미세먼지 평균 노출 농도",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EN.ATM.PM25.MC.M3?locations=KR",
    "description": "PM2.5 air pollution, mean annual exposure (micrograms per cubic meter)",
    "definition": "Population-weighted exposure to ambient PM2.5 pollution is defined as the average level of exposure of a nation's population to concentrations of suspended particles measuring less than 2.5 microns in aerodynamic diameter, which are capable of penetrating deep into the respiratory tract and causing severe health damage. Exposure is calculated by weighting mean annual concentrations of PM2.5 by population in both urban and rural areas.",
    "attribution": "Global Burden of Disease Study 2023 (GBD 2023) Air Pollution Exposure Estimates and Risk Curves 1990-2023, GBD Collaborator Network, uri: https://ghdx.healthdata.org/record/ihme-data/gbd-2023-air-pollution-exposure-estimates-1990-2023, note: Need to create account to retrieve data., publisher: Institute for Health Metrics and Evaluation (IHME), date accessed: 2026-04-03, date published: 2026-01-23",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 초미세먼지 평균 노출 농도 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EN.ATM.PM25.MC.M3",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 21.8940234142942
      },
      {
        "year": "2022",
        "value": 23.4407513786108
      },
      {
        "year": "2021",
        "value": 21.5452573537044
      },
      {
        "year": "2020",
        "value": 20.9983697877048
      },
      {
        "year": "2019",
        "value": 21.9795785125884
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:21+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-en-atm-pm25-mc-zs",
    "title": "한국 대기질 권고 초과 노출 인구 비중",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EN.ATM.PM25.MC.ZS?locations=KR",
    "description": "PM2.5 air pollution, population exposed to levels exceeding WHO guideline value (% of total)",
    "definition": "Percent of population exposed to ambient concentrations of PM2.5 that exceed the WHO guideline value is defined as the portion of a country’s population living in places where mean annual concentrations of PM2.5 are greater than 10 micrograms per cubic meter, the guideline value recommended by the World Health Organization as the lower end of the range of concentrations over which adverse health effects due to PM2.5 exposure have been observed.",
    "attribution": "Global Burden of Disease Study 2017 (GBD 2017), Institute for Health Metrics and Evaluation (IHME), uri: https://ghdx.healthdata.org/gbd-2017, publisher: Institute for Health Metrics and Evaluation (IHME), date published: 202112",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 대기질 권고 초과 노출 인구 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EN.ATM.PM25.MC.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2017",
        "value": 100.0
      },
      {
        "year": "2016",
        "value": 100.0
      },
      {
        "year": "2015",
        "value": 100.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:21+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 3행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-er-h2o-fwtl-zs",
    "title": "한국 내부 수자원 대비 담수 취수 비중",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ER.H2O.FWTL.ZS?locations=KR",
    "description": "Annual freshwater withdrawals, total (% of internal resources)",
    "definition": "Annual freshwater withdrawals refer to total water withdrawals, not counting evaporation losses from storage basins. Withdrawals also include water from desalination plants in countries where they are a significant source. Withdrawals can exceed 100 percent of total renewable resources where extraction from nonrenewable aquifers or desalination plants is considerable or where there is significant water reuse. Withdrawals for agriculture and industry are total withdrawals for irrigation and livestock production and for direct industrial use (including withdrawals for cooling thermoelectric plants). Withdrawals for domestic uses include drinking water, municipal use or supply, and use for public services, commercial establishments, and homes. Data are for the most recent year available for 1987-2002.",
    "attribution": "AQUASTAT - FAO's Global Information System on Water and Agriculture, Food and Agriculture Organization of the United Nations (FAO), uri: https://data.apps.fao.org/aquastat/, publisher: Food and Agriculture Organization of the United Nations (FAO), date accessed: 20240529",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 내부 수자원 대비 담수 취수 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ER.H2O.FWTL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2022",
        "value": 45.0223592906708
      },
      {
        "year": "2021",
        "value": 45.0223592906708
      },
      {
        "year": "2020",
        "value": 45.0223592906708
      },
      {
        "year": "2019",
        "value": 45.0223592906708
      },
      {
        "year": "2018",
        "value": 45.0223592906708
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:22+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-er-h2o-intr-pc",
    "title": "한국 1인당 내부 재생 담수자원",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ER.H2O.INTR.PC?locations=KR",
    "description": "Renewable internal freshwater resources per capita (cubic meters)",
    "definition": "Renewable internal freshwater resources flows refer to internal renewable resources (internal river flows and groundwater from rainfall) in the country. Renewable internal freshwater resources per capita are calculated using the World Bank's population estimates.",
    "attribution": "AQUASTAT - FAO's Global Information System on Water and Agriculture, Food and Agriculture Organization of the United Nations (FAO), uri: https://data.apps.fao.org/aquastat/, publisher: Food and Agriculture Organization of the United Nations (FAO), date accessed: 20240529",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 1인당 내부 재생 담수자원 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ER.H2O.INTR.PC",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2022",
        "value": 1255.01791869493
      },
      {
        "year": "2021",
        "value": 1252.66713307994
      },
      {
        "year": "2020",
        "value": 1251.05527042577
      },
      {
        "year": "2019",
        "value": 1252.7812806929
      },
      {
        "year": "2018",
        "value": 1257.14698236842
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:22+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-er-h2o-fwag-zs",
    "title": "한국 농업용 담수 취수 비중",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ER.H2O.FWAG.ZS?locations=KR",
    "description": "Annual freshwater withdrawals, agriculture (% of total freshwater withdrawal)",
    "definition": "Annual freshwater withdrawals refer to total water withdrawals, not counting evaporation losses from storage basins. Withdrawals also include water from desalination plants in countries where they are a significant source. Withdrawals can exceed 100 percent of total renewable resources where extraction from nonrenewable aquifers or desalination plants is considerable or where there is significant water reuse. Withdrawals for agriculture are total withdrawals for irrigation and livestock production. Data are for the most recent year available for 1987-2002.",
    "attribution": "AQUASTAT - FAO's Global Information System on Water and Agriculture, Food and Agriculture Organization of the United Nations (FAO), uri: https://data.apps.fao.org/aquastat/, publisher: Food and Agriculture Organization of the United Nations (FAO), date accessed: 20240529",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 농업용 담수 취수 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ER.H2O.FWAG.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2022",
        "value": 58.93213204
      },
      {
        "year": "2021",
        "value": 58.93213204
      },
      {
        "year": "2020",
        "value": 58.93213204
      },
      {
        "year": "2019",
        "value": 58.93213204
      },
      {
        "year": "2018",
        "value": 58.93213204
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:22+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-er-h2o-fwin-zs",
    "title": "한국 산업용 담수 취수 비중",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ER.H2O.FWIN.ZS?locations=KR",
    "description": "Annual freshwater withdrawals, industry (% of total freshwater withdrawal)",
    "definition": "Annual freshwater withdrawals refer to total water withdrawals, not counting evaporation losses from storage basins. Withdrawals also include water from desalination plants in countries where they are a significant source. Withdrawals can exceed 100 percent of total renewable resources where extraction from nonrenewable aquifers or desalination plants is considerable or where there is significant water reuse. Withdrawals for industry are total withdrawals for direct industrial use (including withdrawals for cooling thermoelectric plants). Data are for the most recent year available for 1987-2002.",
    "attribution": "AQUASTAT - FAO's Global Information System on Water and Agriculture, Food and Agriculture Organization of the United Nations (FAO), uri: https://data.apps.fao.org/aquastat/, publisher: Food and Agriculture Organization of the United Nations (FAO), date accessed: 20240529",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 산업용 담수 취수 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ER.H2O.FWIN.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2022",
        "value": 16.43157817
      },
      {
        "year": "2021",
        "value": 16.43157817
      },
      {
        "year": "2020",
        "value": 16.43157817
      },
      {
        "year": "2019",
        "value": 16.43157817
      },
      {
        "year": "2018",
        "value": 16.43157817
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:22+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-er-lnd-ptld-zs",
    "title": "한국 육상 보호구역 비중",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ER.LND.PTLD.ZS?locations=KR",
    "description": "Terrestrial protected areas (% of total land area)",
    "definition": "Terrestrial protected areas are totally or partially protected areas of at least 1,000 hectares that are designated by national authorities as scientific reserves with limited public access, national parks, natural monuments, nature reserves or wildlife sanctuaries, protected landscapes, and areas managed mainly for sustainable use. Marine areas, unclassified areas, littoral (intertidal) areas, and sites protected under local or provincial law are excluded.",
    "attribution": "Protected Planet: The World Database on Protected Areas (WDPA) and World Database on Other Effective Area-based Conservation Measures (WD-OECM), UN Environment Programme World Conservation Monitoring Centre (UNEP-WCMC), uri: https://www.protectedplanet.net/en, publisher: Protected Planet, date accessed: 20240516, date published: 202405;\nInternational Union for Conservation of Nature (IUCN), uri: https://www.protectedplanet.net/en, publisher: Protected Planet, date accessed: 20240516",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 육상 보호구역 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ER.LND.PTLD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 17.7
      },
      {
        "year": "2024",
        "value": 17.4
      },
      {
        "year": "2023",
        "value": 17.0
      },
      {
        "year": "2022",
        "value": 17.0
      },
      {
        "year": "2021",
        "value": 17.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:22+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-er-mrn-ptmr-zs",
    "title": "한국 해양 보호구역 비중",
    "provider": "World Bank",
    "category": "환경·기후",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ER.MRN.PTMR.ZS?locations=KR",
    "description": "Marine protected areas (% of territorial waters)",
    "definition": "Marine protected areas are areas of intertidal or subtidal terrain--and overlying water and associated flora and fauna and historical and cultural features--that have been reserved by law or other effective means to protect part or all of the enclosed environment.",
    "attribution": "Protected Planet: The World Database on Protected Areas (WDPA) and World Database on Other Effective Area-based Conservation Measures (WD-OECM), UN Environment Programme World Conservation Monitoring Centre (UNEP-WCMC), uri: https://www.protectedplanet.net/en, note: Only the latest data can be retrieved from the Protected Planet website. The time series are provided directly to WDI by Protected Planet., publisher: Protected Planet, date accessed: 20240516, date published: 202405;\nInternational Union for Conservation of Nature (IUCN), uri: https://www.protectedplanet.net/en, publisher: Protected Planet, date accessed: 20240516",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 해양 보호구역 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ER.MRN.PTMR.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2.3
      },
      {
        "year": "2024",
        "value": 2.2
      },
      {
        "year": "2023",
        "value": 2.5
      },
      {
        "year": "2022",
        "value": 2.5
      },
      {
        "year": "2021",
        "value": 2.5
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:22+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-use-pcap-kg-oe",
    "title": "한국 1인당 에너지 사용량",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.USE.PCAP.KG.OE?locations=KR",
    "description": "Energy use (kg of oil equivalent per capita)",
    "definition": "Energy use refers to use of primary energy before transformation to other end-use fuels, which is equal to indigenous production plus imports and stock changes, minus exports and fuels supplied to ships and aircraft engaged in international transport.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 1인당 에너지 사용량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.USE.PCAP.KG.OE",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 5564.26057364945
      },
      {
        "year": "2023",
        "value": 5461.08379540164
      },
      {
        "year": "2022",
        "value": 5521.41225174154
      },
      {
        "year": "2021",
        "value": 5624.52677639384
      },
      {
        "year": "2020",
        "value": 5293.92743300692
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-use-elec-kh-pc",
    "title": "한국 1인당 전력 소비량",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.USE.ELEC.KH.PC?locations=KR",
    "description": "Electric power consumption (kWh per capita)",
    "definition": "Electric power consumption measures the production of power plants and combined heat and power plants less transmission, distribution, and transformation losses and own use by heat and power plants.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 1인당 전력 소비량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.USE.ELEC.KH.PC",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 12071.3217199627
      },
      {
        "year": "2024",
        "value": 12234.588795419
      },
      {
        "year": "2023",
        "value": 11873.755610792
      },
      {
        "year": "2022",
        "value": 11874.6757104335
      },
      {
        "year": "2021",
        "value": 11647.2738920855
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-fec-rnew-zs",
    "title": "한국 최종 에너지 중 재생에너지 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.FEC.RNEW.ZS?locations=KR",
    "description": "Renewable energy consumption (% of total final energy consumption)",
    "definition": "Renewable energy consumption is the share of renewable energy in total final energy consumption.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 최종 에너지 중 재생에너지 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.FEC.RNEW.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2021",
        "value": 3.6
      },
      {
        "year": "2020",
        "value": 3.6
      },
      {
        "year": "2019",
        "value": 3.2
      },
      {
        "year": "2018",
        "value": 3.2
      },
      {
        "year": "2017",
        "value": 2.8
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-elc-rnew-zs",
    "title": "한국 재생에너지 전력생산 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.ELC.RNEW.ZS?locations=KR",
    "description": "Renewable electricity output (% of total electricity output)",
    "definition": "Renewable electricity is the share of electricity generated by renewable power plants in total electricity generated by all types of plants.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 재생에너지 전력생산 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.ELC.RNEW.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2021",
        "value": 6.65144502708922
      },
      {
        "year": "2020",
        "value": 6.27249191815822
      },
      {
        "year": "2019",
        "value": 5.18582991257534
      },
      {
        "year": "2018",
        "value": 4.49678515063246
      },
      {
        "year": "2017",
        "value": 3.91100036331978
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-elc-nucl-zs",
    "title": "한국 원자력 발전 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.ELC.NUCL.ZS?locations=KR",
    "description": "Electricity production from nuclear sources (% of total)",
    "definition": "The share of electricity production from nuclear sources of total electricity production. Sources of electricity refer to the inputs used to generate electricity. Nuclear power refers to electricity produced by nuclear power plants.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 원자력 발전 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.ELC.NUCL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 28.7170078287167
      },
      {
        "year": "2024",
        "value": 28.9003994677846
      },
      {
        "year": "2023",
        "value": 28.6163646654628
      },
      {
        "year": "2022",
        "value": 27.6556606811574
      },
      {
        "year": "2021",
        "value": 25.4640298319856
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-elc-coal-zs",
    "title": "한국 석탄 발전 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.ELC.COAL.ZS?locations=KR",
    "description": "Electricity production from coal sources (% of total)",
    "definition": "The share of electricity production from coal sources of total electricity production. Sources of electricity refer to the inputs used to generate electricity. Coal refers to all coal and brown coal, both primary (including hard coal and lignite-brown coal) and derived fuels (including patent fuel, coke oven coke, gas coke, coke oven gas, and blast furnace gas). Peat is also included in this category.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 석탄 발전 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.ELC.COAL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 32.0153309129357
      },
      {
        "year": "2024",
        "value": 31.158946531949
      },
      {
        "year": "2023",
        "value": 33.8386680977967
      },
      {
        "year": "2022",
        "value": 34.9411633492671
      },
      {
        "year": "2021",
        "value": 36.5177538345511
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:24+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-elc-ngas-zs",
    "title": "한국 천연가스 발전 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.ELC.NGAS.ZS?locations=KR",
    "description": "Electricity production from natural gas sources (% of total)",
    "definition": "The share of electricity production from natural gas sources of total electricity production. Sources of electricity refer to the inputs used to generate electricity. Gas refers to natural gas but excludes natural gas liquids.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 천연가스 발전 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.ELC.NGAS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 25.8420729384509
      },
      {
        "year": "2024",
        "value": 27.6309523991799
      },
      {
        "year": "2023",
        "value": 26.3506025490815
      },
      {
        "year": "2022",
        "value": 26.8659881588393
      },
      {
        "year": "2021",
        "value": 28.2736704364894
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-elc-hyro-zs",
    "title": "한국 수력 발전 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.ELC.HYRO.ZS?locations=KR",
    "description": "Electricity production from hydroelectric sources (% of total)",
    "definition": "The share of electricity production from hydroelectric sources of total electricity production. Sources of electricity refer to the inputs used to generate electricity. Hydropower refers to electricity produced by hydroelectric power plants.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 수력 발전 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.ELC.HYRO.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1.27949373780407
      },
      {
        "year": "2024",
        "value": 1.37478774924631
      },
      {
        "year": "2023",
        "value": 1.18924369428145
      },
      {
        "year": "2022",
        "value": 1.1402890072621
      },
      {
        "year": "2021",
        "value": 1.08614727125642
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:23+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-imp-cons-zs",
    "title": "한국 에너지 순수입 의존도",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.IMP.CONS.ZS?locations=KR",
    "description": "Energy imports, net (% of energy use)",
    "definition": "Net energy imports are estimated as gross imports less gross exports, both measured in tons of oil equivalents (toe). A negative value indicates that the country is a net exporter. Energy use refers to use of primary energy before transformation to other end-use fuels, which is equal to indigenous production plus imports and stock changes, minus exports and fuels supplied to ships and aircraft engaged in international transport.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 에너지 순수입 의존도 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.IMP.CONS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 83.2427143669888
      },
      {
        "year": "2023",
        "value": 84.0279710083395
      },
      {
        "year": "2022",
        "value": 85.2039731864914
      },
      {
        "year": "2021",
        "value": 84.7225461154454
      },
      {
        "year": "2020",
        "value": 84.5107053056221
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:24+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-elc-loss-zs",
    "title": "한국 송배전 전력 손실 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.ELC.LOSS.ZS?locations=KR",
    "description": "Electric power transmission and distribution losses (% of output)",
    "definition": "Electric power transmission and distribution losses include losses in transmission between sources of supply and points of distribution and in the distribution to consumers, including pilferage. The losses are expressed as a share of the total output.",
    "attribution": "IEA Energy Statistics Data Browser, International Energy Agency (IEA), uri: https://www.iea.org/data-and-statistics/data-tools/energy-statistics-data-browser, publisher: International Energy Agency (IEA), date accessed: 2025-03-25",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 송배전 전력 손실 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.ELC.LOSS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2.99217128330314
      },
      {
        "year": "2024",
        "value": 3.05702329897002
      },
      {
        "year": "2023",
        "value": 2.64991589204375
      },
      {
        "year": "2022",
        "value": 3.61266931932962
      },
      {
        "year": "2021",
        "value": 2.83107348092474
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:24+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-elc-accs-zs",
    "title": "한국 전력 접근 인구 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.ELC.ACCS.ZS?locations=KR",
    "description": "Access to electricity (% of population)",
    "definition": "Access to electricity is the percentage of population with access to electricity. Electrification data are collected from industry, national surveys and international sources.",
    "attribution": "SDG 7.1.1 Electrification Dataset, World Bank (WB), uri: https://trackingsdg7.esmap.org/downloads, note: Data is downloaded from ESMAP website. Data is released when a new Tracking SDG7 report is released., publisher: World Bank (WB), date accessed: 2024-05-16, date published: 2023",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 전력 접근 인구 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.ELC.ACCS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 100.0
      },
      {
        "year": "2023",
        "value": 100.0
      },
      {
        "year": "2022",
        "value": 100.0
      },
      {
        "year": "2021",
        "value": 100.0
      },
      {
        "year": "2020",
        "value": 100.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:24+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-eg-cft-accs-zs",
    "title": "한국 청정 조리연료 접근 비중",
    "provider": "World Bank",
    "category": "에너지·전력",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/EG.CFT.ACCS.ZS?locations=KR",
    "description": "Access to clean fuels and technologies for cooking (% of population)",
    "definition": "Access to clean fuels and technologies for cooking is the proportion of total population primarily using clean cooking fuels and technologies for cooking. Under WHO guidelines, kerosene is excluded from clean cooking fuels.",
    "attribution": "Tracking SDG 7: The Energy Progress Report, ACRA Europe, uri: https://trackingsdg7.esmap.org/, note: License: Creative Commons Attribution—NonCommercial 3.0 IGO (CC BY-NC 3.0 IGO), publisher: International Energy Agency (IEA), International Renewable Energy Agency (IRENA), United Nations Statistical Division (UNSD), World Bank, World Health Organization (WHO), date published: 2025-06;\nInternational Renewable Energy Agency (IRENA), note: Tracking SDG 7: The Energy Progress Report;\nUnited Nations (UN), note: Tracking SDG 7: The Energy Progress Report, publisher: UN Statistics Division;\nWorld Bank (WB), note: Tracking SDG 7: The Energy Progress Report;\nWorld Health Organization (WHO), note: Tracking SDG 7: The Energy Progress Report",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 청정 조리연료 접근 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/EG.CFT.ACCS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 100.0
      },
      {
        "year": "2023",
        "value": 100.0
      },
      {
        "year": "2022",
        "value": 100.0
      },
      {
        "year": "2021",
        "value": 100.0
      },
      {
        "year": "2020",
        "value": 100.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:24+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-agr-totl-zs",
    "title": "한국 농림어업 부가가치 비중",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.AGR.TOTL.ZS?locations=KR",
    "description": "Agriculture, forestry, and fishing, value added (% of GDP)",
    "definition": "Agriculture, forestry, and fishing corresponds to ISIC (Rev. 4) divisions 01-03 and includes the exploitation of vegetal and animal natural resources, comprising the activities of growing of crops, raising and breeding of animals, harvesting of timber and other plants, animals or animal products from a farm or their natural habitats.Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator is expressed as a percentage of Gross Domestic Product (GDP) which is the total income earned through the production of goods and services in an economic territory during an accounting period. Note: For VAB countries, gross value added at factor cost is used as the denominator.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 농림어업 부가가치 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.AGR.TOTL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1.46427275259293
      },
      {
        "year": "2024",
        "value": 1.45825105459538
      },
      {
        "year": "2023",
        "value": 1.44773871445502
      },
      {
        "year": "2022",
        "value": 1.4483461547482
      },
      {
        "year": "2021",
        "value": 1.66515978191584
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:25+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-nv-agr-totl-kd-zg",
    "title": "한국 농림어업 부가가치 성장률",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/NV.AGR.TOTL.KD.ZG?locations=KR",
    "description": "Agriculture, forestry, and fishing, value added (annual % growth)",
    "definition": "Agriculture, forestry, and fishing corresponds to ISIC (Rev. 4) divisions 01-03 and includes the exploitation of vegetal and animal natural resources, comprising the activities of growing of crops, raising and breeding of animals, harvesting of timber and other plants, animals or animal products from a farm or their natural habitats.Value added is the contribution to the economy by a producer or an industry or an institutional sector, which is estimated by the total value of output produced and deducting the total value of intermediate consumption of goods and services used to produce that output. This indicator denotes the percentage change over each previous year of the constant price (base year 2015) series in United States dollars.",
    "attribution": "Country official statistics, National Statistical Organizations and/or Central Banks;\nNational Accounts data files, Organisation for Economic Co-operation and Development (OECD);\nStaff estimates, World Bank (WB)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 농림어업 부가가치 성장률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/NV.AGR.TOTL.KD.ZG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 1.445319973216
      },
      {
        "year": "2024",
        "value": 0.640495308349315
      },
      {
        "year": "2023",
        "value": -1.84962632469447
      },
      {
        "year": "2022",
        "value": 0.797059392532404
      },
      {
        "year": "2021",
        "value": 3.43856213979608
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:25+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sl-agr-empl-zs",
    "title": "한국 농업부문 고용 비중",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SL.AGR.EMPL.ZS?locations=KR",
    "description": "Employment in agriculture (% of total employment) (modeled ILO estimate)",
    "definition": "Employment is defined as persons of working age who were engaged in any activity to produce goods or provide services for pay or profit, whether at work during the reference period or not at work due to temporary absence from a job, or to working-time arrangement. The agriculture sector consists of activities in agriculture, hunting, forestry and fishing, in accordance with division 1 (ISIC 2) or categories A-B (ISIC 3) or category A (ISIC 4).",
    "attribution": "ILO Modelled Estimates database (ILOEST), International Labour Organization (ILO), uri: https://ilostat.ilo.org/data/bulk/, publisher: ILOSTAT, type: external database, date accessed: January 17, 2026",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 농업부문 고용 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SL.AGR.EMPL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 5.10382768921025
      },
      {
        "year": "2024",
        "value": 5.19680870662354
      },
      {
        "year": "2023",
        "value": 5.32432842202518
      },
      {
        "year": "2022",
        "value": 5.43180170278522
      },
      {
        "year": "2021",
        "value": 5.34699533496314
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:25+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-lnd-agri-zs",
    "title": "한국 농업용 토지 비중",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.LND.AGRI.ZS?locations=KR",
    "description": "Agricultural land (% of land area)",
    "definition": "Agricultural land refers to the share of land area that is arable, under permanent crops, and under permanent pastures. Arable land includes land defined by the FAO as land under temporary crops (double-cropped areas are counted once), temporary meadows for mowing or for pasture, land under market or kitchen gardens, and land temporarily fallow. Land abandoned as a result of shifting cultivation is excluded. Land under permanent crops is land cultivated with crops that occupy the land for long periods and need not be replanted after each harvest, such as cocoa, coffee, and rubber. This category includes land under flowering shrubs, fruit trees, nut trees, and vines, but excludes land under trees grown for wood or timber. Permanent pasture is land used for five or more years for forage, including natural and cultivated crops.",
    "attribution": "FAO electronic files and web site, Food and Agriculture Organization of the United Nations (FAO), publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 농업용 토지 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.LND.AGRI.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 15.9938524590164
      },
      {
        "year": "2023",
        "value": 16.0655737704918
      },
      {
        "year": "2022",
        "value": 16.2295081967213
      },
      {
        "year": "2021",
        "value": 16.4241803278689
      },
      {
        "year": "2020",
        "value": 16.608606557377
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:25+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-lnd-arbl-zs",
    "title": "한국 경작 가능 토지 비중",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.LND.ARBL.ZS?locations=KR",
    "description": "Arable land (% of land area)",
    "definition": "Arable land includes land defined by the FAO as land under temporary crops (double-cropped areas are counted once), temporary meadows for mowing or for pasture, land under market or kitchen gardens, and land temporarily fallow. Land abandoned as a result of shifting cultivation is excluded.",
    "attribution": "FAO electronic files and website, Food and Agriculture Organization of the United Nations (FAO), publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 경작 가능 토지 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.LND.ARBL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 13.3401639344262
      },
      {
        "year": "2023",
        "value": 14.9180327868852
      },
      {
        "year": "2022",
        "value": 13.5245901639344
      },
      {
        "year": "2021",
        "value": 13.7602459016393
      },
      {
        "year": "2020",
        "value": 13.8524590163934
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:25+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-yld-crel-kg",
    "title": "한국 곡물 단위면적당 수확량",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.YLD.CREL.KG?locations=KR",
    "description": "Cereal yield (kg per hectare)",
    "definition": "Cereal yield, measured as kilograms per hectare of harvested land, includes wheat, rice, maize, barley, oats, rye, millet, sorghum, buckwheat, and mixed grains. Production data on cereals relate to crops harvested for dry grain only. Cereal crops harvested for hay or harvested green for food, feed, or silage and those used for grazing are excluded. The FAO allocates production data to the calendar year in which the bulk of the harvest took place. Most of a crop harvested near the end of a year will be used in the following year.",
    "attribution": "FAO electronic files and web site, Food and Agriculture Organization of the United Nations (FAO), uri: https://www.fao.org/faostat/en/#data/QCL, publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 곡물 단위면적당 수확량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.YLD.CREL.KG",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 6544.4
      },
      {
        "year": "2023",
        "value": 6612.1
      },
      {
        "year": "2022",
        "value": 6612.0
      },
      {
        "year": "2021",
        "value": 6825.5
      },
      {
        "year": "2020",
        "value": 6211.5
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:25+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-prd-crel-mt",
    "title": "한국 곡물 생산량",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.PRD.CREL.MT?locations=KR",
    "description": "Cereal production (metric tons)",
    "definition": "Production data on cereals relate to crops harvested for dry grain only. Cereal crops harvested for hay or harvested green for food, feed, or silage and those used for grazing are excluded.",
    "attribution": "FAO electronic files and web site, Food and Agriculture Organization of the United Nations (FAO), uri: https://www.fao.org/faostat/en/#data/QCL, publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 곡물 생산량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.PRD.CREL.MT",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 4984350.77
      },
      {
        "year": "2023",
        "value": 5134359.45
      },
      {
        "year": "2022",
        "value": 5219729.36
      },
      {
        "year": "2021",
        "value": 5443076.16
      },
      {
        "year": "2020",
        "value": 4945457.62
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:25+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-prd-food-xd",
    "title": "한국 식량 생산지수",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.PRD.FOOD.XD?locations=KR",
    "description": "Food production index (2014-2016 = 100)",
    "definition": "Food production index covers food crops that are considered edible and that contain nutrients. Coffee and tea are excluded because, although edible, they have no nutritive value.",
    "attribution": "FAO electronic files and web site, Food and Agriculture Organization of the United Nations (FAO), publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 식량 생산지수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.PRD.FOOD.XD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 101.39
      },
      {
        "year": "2023",
        "value": 100.17
      },
      {
        "year": "2022",
        "value": 100.74
      },
      {
        "year": "2021",
        "value": 101.96
      },
      {
        "year": "2020",
        "value": 99.35
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:26+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-prd-crop-xd",
    "title": "한국 작물 생산지수",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.PRD.CROP.XD?locations=KR",
    "description": "Crop production index (2014-2016 = 100)",
    "definition": "Crop production index shows agricultural production for each year relative to the base period 2014-2016. It includes all crops except fodder crops. Regional and income group aggregates for the FAO's production indexes are calculated from the underlying values in international dollars, normalized to the base period 2014-2016.",
    "attribution": "FAO electronic files and web site, Food and Agriculture Organization of the United Nations (FAO), publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 작물 생산지수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.PRD.CROP.XD",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 90.0
      },
      {
        "year": "2023",
        "value": 89.69
      },
      {
        "year": "2022",
        "value": 92.05
      },
      {
        "year": "2021",
        "value": 95.76
      },
      {
        "year": "2020",
        "value": 90.28
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:26+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ag-con-fert-zs",
    "title": "한국 경작지 면적당 비료 소비량",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/AG.CON.FERT.ZS?locations=KR",
    "description": "Fertilizer consumption (kilograms per hectare of arable land)",
    "definition": "Fertilizer consumption measures the quantity of plant nutrients used per unit of arable land. Fertilizer products cover nitrogenous, potash, and phosphate fertilizers (including ground rock phosphate). Traditional nutrients--animal and plant manures--are not included. For the purpose of data dissemination, FAO has adopted the concept of a calendar year (January to December). Some countries compile fertilizer data on a calendar year basis, while others are on a split-year basis. Arable land includes land defined by the FAO as land under temporary crops (double-cropped areas are counted once), temporary meadows for mowing or for pasture, land under market or kitchen gardens, and land temporarily fallow. Land abandoned as a result of shifting cultivation is excluded.",
    "attribution": "FAO electronic files and web site, Food and Agriculture Organization of the United Nations (FAO), publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 경작지 면적당 비료 소비량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/AG.CON.FERT.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 285.569892473118
      },
      {
        "year": "2023",
        "value": 262.3125
      },
      {
        "year": "2022",
        "value": 325.433333333333
      },
      {
        "year": "2021",
        "value": 281.478034251675
      },
      {
        "year": "2020",
        "value": 304.810650887574
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:26+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-er-fsh-prod-mt",
    "title": "한국 어업·양식 생산량",
    "provider": "World Bank",
    "category": "농업·식량",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/ER.FSH.PROD.MT?locations=KR",
    "description": "Total fisheries production (metric tons)",
    "definition": "Total fisheries production measures the volume of aquatic species caught by a country for all commercial, industrial, recreational and subsistence purposes. The harvest from mariculture, aquaculture and other kinds of fish farming is also included.",
    "attribution": "Food and Agriculture Organization., Food and Agriculture Organization of the United Nations (FAO), publisher: Food and Agriculture Organization of the United Nations (FAO)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 어업·양식 생산량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/ER.FSH.PROD.MT",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 3555275.096
      },
      {
        "year": "2023",
        "value": 3706536.184
      },
      {
        "year": "2022",
        "value": 3601215.807
      },
      {
        "year": "2021",
        "value": 3796721.368
      },
      {
        "year": "2020",
        "value": 3711028.564
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:26+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-is-air-psgr",
    "title": "한국 항공 여객 수",
    "provider": "World Bank",
    "category": "교통·물류",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IS.AIR.PSGR?locations=KR",
    "description": "Air transport, passengers carried",
    "definition": "Air carrier data per country refers to passengers carried by airlines registered in that country regardless of the origin or destination of the passengers.",
    "attribution": "Civil Aviation Statistics of the World, International Civil Aviation Organization (ICAO), uri: https://data.icao.int/newdataplus/#:~:text=ICAO%20data%20is%20comprised%20of,information%20about%20commercial%20air%20carriers;\nICAO Staff estimates, International Civil Aviation Organization (ICAO), uri: https://data.icao.int/newdataplus/#:~:text=ICAO%20data%20is%20comprised%20of,information%20about%20commercial%20air%20carriers",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 항공 여객 수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IS.AIR.PSGR",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 76272453.877
      },
      {
        "year": "2022",
        "value": 46853301.0
      },
      {
        "year": "2021",
        "value": 34020088.0
      },
      {
        "year": "2020",
        "value": 30033310.0
      },
      {
        "year": "2019",
        "value": 92434079.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:26+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-is-air-good-mt-k1",
    "title": "한국 항공 화물 운송량",
    "provider": "World Bank",
    "category": "교통·물류",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IS.AIR.GOOD.MT.K1?locations=KR",
    "description": "Air transport, freight (million ton-km)",
    "definition": "Air freight is the volume of freight, express, and diplomatic bags carried on each flight stage (operation of an aircraft from takeoff to its next landing), measured in metric tons times kilometers traveled.",
    "attribution": "Civil Aviation Statistics of the World, International Civil Aviation Organization (ICAO), uri: https://data.icao.int/newdataplus/#:~:text=ICAO%20data%20is%20comprised%20of,information%20about%20commercial%20air%20carriers;\nICAO Staff estimates, International Civil Aviation Organization (ICAO), uri: https://data.icao.int/newdataplus/#:~:text=ICAO%20data%20is%20comprised%20of,information%20about%20commercial%20air%20carriers",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 항공 화물 운송량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IS.AIR.GOOD.MT.K1",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 12293.78421188
      },
      {
        "year": "2022",
        "value": 13741.013239
      },
      {
        "year": "2021",
        "value": 15370.019378
      },
      {
        "year": "2020",
        "value": 12456.57079
      },
      {
        "year": "2019",
        "value": 10664.3782296361
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:26+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-is-shp-good-tu",
    "title": "한국 컨테이너 항만 물동량",
    "provider": "World Bank",
    "category": "교통·물류",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IS.SHP.GOOD.TU?locations=KR",
    "description": "Container port traffic (TEU: 20 foot equivalent units)",
    "definition": "Port container traffic measures the flow of containers from land to sea transport modes, and vice versa, in twenty-foot equivalent units (TEUs), a standard-size container. Data refer to coastal shipping as well as international journeys. Transshipment traffic is counted as two lifts at the intermediate port (once to off-load and again as an outbound lift) and includes empty units.",
    "attribution": "UN Conference on Trade and Development (UNCTAD), uri: http://unctad.org/en/Pages/statistics.aspx",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 컨테이너 항만 물동량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IS.SHP.GOOD.TU",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 31850924.0
      },
      {
        "year": "2023",
        "value": 30003141.0
      },
      {
        "year": "2022",
        "value": 28502044.0
      },
      {
        "year": "2021",
        "value": 29786900.0
      },
      {
        "year": "2020",
        "value": 28834192.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:27+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-is-rrs-totl-km",
    "title": "한국 철도 노선 길이",
    "provider": "World Bank",
    "category": "교통·물류",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IS.RRS.TOTL.KM?locations=KR",
    "description": "Rail lines (total route-km)",
    "definition": "The total length of rail line in the country operated for passenger transport, goods transport, or both.",
    "attribution": "Railisa Database, International Union of Railways (UIC), uri: https://uic-stats.uic.org/",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 철도 노선 길이 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IS.RRS.TOTL.KM",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2021",
        "value": 4308.5
      },
      {
        "year": "2020",
        "value": 4284.7
      },
      {
        "year": "2019",
        "value": 4109.15
      },
      {
        "year": "2018",
        "value": 4200.0
      },
      {
        "year": "2017",
        "value": 4071.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:27+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-is-rrs-pasg-km",
    "title": "한국 철도 여객 운송량",
    "provider": "World Bank",
    "category": "교통·물류",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/IS.RRS.PASG.KM?locations=KR",
    "description": "Railways, passengers carried (million passenger-km)",
    "definition": "Passengers carried by railway are the number of passengers transported by rail multiplied by kilometers traveled.",
    "attribution": "Railisa Database (UIC), International Union of Railways (UIC), uri: https://uic-stats.uic.org/select/;\nOECD Statistics, Organisation for Economic Co-operation and Development (OECD)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 철도 여객 운송량 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/IS.RRS.PASG.KM",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2019",
        "value": 100381.0
      },
      {
        "year": "2018",
        "value": 92193.0
      },
      {
        "year": "2017",
        "value": 89964.0
      },
      {
        "year": "2016",
        "value": 86871.0
      },
      {
        "year": "2015",
        "value": 68371.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:27+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-sta-traf-p5",
    "title": "한국 교통사고 사망률",
    "provider": "World Bank",
    "category": "교통·물류",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.STA.TRAF.P5?locations=KR",
    "description": "Mortality caused by road traffic injury (per 100,000 population)",
    "definition": "Mortality caused by road traffic injury is estimated road traffic fatal injury deaths per 100,000 population.",
    "attribution": "World Health Organization, Global Health Observatory Data Repository (http://apps.who.int/ghodata/)., World Health Organization (WHO), uri: https://www.who.int/data/gho",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 교통사고 사망률 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.STA.TRAF.P5",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2019",
        "value": 8.6
      },
      {
        "year": "2018",
        "value": 8.6
      },
      {
        "year": "2017",
        "value": 9.5
      },
      {
        "year": "2016",
        "value": 9.8
      },
      {
        "year": "2015",
        "value": 10.6
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:27+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-si-pov-gini",
    "title": "한국 소득 불평등 지니계수",
    "provider": "World Bank",
    "category": "복지·평등",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SI.POV.GINI?locations=KR",
    "description": "Gini index",
    "definition": "Gini index measures the extent to which the distribution of income (or, in some cases, consumption expenditure) among individuals or households within an economy deviates from a perfectly equal distribution. A Lorenz curve plots the cumulative percentages of total income received against the cumulative number of recipients, starting with the poorest individual or household. The Gini index measures the area between the Lorenz curve and a hypothetical line of absolute equality, expressed as a percentage of the maximum area under the line. Thus a Gini index of 0 represents perfect equality, while an index of 100 implies perfect inequality.",
    "attribution": "World Bank, Poverty and Inequality Platform. Data are based on primary household survey data obtained from government statistical agencies and World Bank country departments. Data for high-income economies are mostly from the Luxembourg Income Study database. For more information and methodology, please see http://pip.worldbank.org., World Bank (WB), uri: http://pip.worldbank.org, note: Data are based on primary household survey data obtained from government statistical agencies and World Bank country departments. Data for high-income economies are mostly from the Luxembourg Income Study database.",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 소득 불평등 지니계수 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SI.POV.GINI",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2021",
        "value": 32.9
      },
      {
        "year": "2020",
        "value": 32.7
      },
      {
        "year": "2019",
        "value": 33.2
      },
      {
        "year": "2018",
        "value": 33.7
      },
      {
        "year": "2017",
        "value": 34.9
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:27+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-si-dst-frst-20",
    "title": "한국 하위 20% 소득 점유율",
    "provider": "World Bank",
    "category": "복지·평등",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SI.DST.FRST.20?locations=KR",
    "description": "Income share held by lowest 20%",
    "definition": "Percentage share of income or consumption is the share that accrues to subgroups of population indicated by deciles or quintiles. Percentage shares by quintile may not sum to 100 because of rounding.",
    "attribution": "World Bank, Poverty and Inequality Platform. Data are based on primary household survey data obtained from government statistical agencies and World Bank country departments. Data for high-income economies are mostly from the Luxembourg Income Study database. For more information and methodology, please see http://pip.worldbank.org., World Bank (WB), uri: http://pip.worldbank.org, note: Data are based on primary household survey data obtained from government statistical agencies and World Bank country departments. Data for high-income economies are mostly from the Luxembourg Income Study database.",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 하위 20% 소득 점유율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SI.DST.FRST.20",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2021",
        "value": 7.4
      },
      {
        "year": "2020",
        "value": 7.5
      },
      {
        "year": "2019",
        "value": 7.2
      },
      {
        "year": "2018",
        "value": 7.0
      },
      {
        "year": "2017",
        "value": 6.6
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:27+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-si-dst-05th-20",
    "title": "한국 상위 20% 소득 점유율",
    "provider": "World Bank",
    "category": "복지·평등",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SI.DST.05TH.20?locations=KR",
    "description": "Income share held by highest 20%",
    "definition": "Percentage share of income or consumption is the share that accrues to subgroups of population indicated by deciles or quintiles. Percentage shares by quintile may not sum to 100 because of rounding.",
    "attribution": "World Bank, Poverty and Inequality Platform. Data are based on primary household survey data obtained from government statistical agencies and World Bank country departments. Data for high-income economies are mostly from the Luxembourg Income Study database. For more information and methodology, please see http://pip.worldbank.org., World Bank (WB), uri: http://pip.worldbank.org, note: Data are based on primary household survey data obtained from government statistical agencies and World Bank country departments. Data for high-income economies are mostly from the Luxembourg Income Study database.",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 상위 20% 소득 점유율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SI.DST.05TH.20",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2021",
        "value": 40.3
      },
      {
        "year": "2020",
        "value": 40.3
      },
      {
        "year": "2019",
        "value": 40.5
      },
      {
        "year": "2018",
        "value": 40.7
      },
      {
        "year": "2017",
        "value": 41.6
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:27+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sg-gen-parl-zs",
    "title": "한국 국회 여성 의석 비중",
    "provider": "World Bank",
    "category": "복지·평등",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SG.GEN.PARL.ZS?locations=KR",
    "description": "Proportion of seats held by women in national parliaments (%)",
    "definition": "Women in parliaments are the percentage of parliamentary seats in a single or lower chamber held by women.",
    "attribution": "Monthly ranking of women in national parliaments, Inter-Parliamentary Union (IPU), uri: https://data.ipu.org/women-ranking/, note: For the year of 1998, the data is as of August 10, 1998., type: Excel, date accessed: 2026-03-29",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 국회 여성 의석 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SG.GEN.PARL.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 20.3333333333333
      },
      {
        "year": "2024",
        "value": 20.0
      },
      {
        "year": "2023",
        "value": 19.0635451505017
      },
      {
        "year": "2022",
        "value": 18.6440677966102
      },
      {
        "year": "2021",
        "value": 19.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:28+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-h2o-basw-zs",
    "title": "한국 기본 식수 서비스 접근 비중",
    "provider": "World Bank",
    "category": "도시·주거",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.H2O.BASW.ZS?locations=KR",
    "description": "People using at least basic drinking water services (% of population)",
    "definition": "The percentage of people using at least basic water services.  This indicator encompasses both people using basic water services as well as those using safely managed water services.  Basic drinking water services is defined as drinking water from an improved source, provided collection time is not more than 30 minutes for a round trip.  Improved water sources include piped water, boreholes or tubewells, protected dug wells, protected springs, and packaged or delivered water.",
    "attribution": "WHO/UNICEF Joint Monitoring Programme (JMP) for Water Supply, Sanitation and Hygiene, World Health Organization (WHO), uri: washdata.org, publisher: WHO/UNICEF Joint Monitoring Programme (JMP) for Water Supply, Sanitation and Hygiene (washdata.org), date accessed: 2025-09-30, date published: 2025-08-25;\nUN Children's Fund (UNICEF), uri: washdata.org, note: WHO/UNICEF Joint Monitoring Programme (JMP) for Water Supply, Sanitation and Hygiene",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 기본 식수 서비스 접근 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.H2O.BASW.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 100.0
      },
      {
        "year": "2023",
        "value": 99.979971635449
      },
      {
        "year": "2022",
        "value": 99.9085387997134
      },
      {
        "year": "2021",
        "value": 99.8371059639777
      },
      {
        "year": "2020",
        "value": 99.7656731282421
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:28+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-sh-sta-bass-zs",
    "title": "한국 기본 위생 서비스 접근 비중",
    "provider": "World Bank",
    "category": "도시·주거",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/SH.STA.BASS.ZS?locations=KR",
    "description": "People using at least basic sanitation services (% of population)",
    "definition": "The percentage of people using at least basic sanitation services, that is, improved sanitation facilities that are not shared with other households.  This indicator encompasses both people using basic sanitation services as well as those using safely managed sanitation services.   Improved sanitation facilities include flush/pour flush to piped sewer systems, septic tanks or pit latrines; ventilated improved pit latrines, composting toilets or pit latrines with slabs.",
    "attribution": "WHO/UNICEF Joint Monitoring Programme (JMP) for Water Supply, Sanitation and Hygiene, World Health Organization (WHO), uri: washdata.org, publisher: WHO/UNICEF Joint Monitoring Programme (JMP) for Water Supply, Sanitation and Hygiene (washdata.org), date accessed: 2025-09-30, date published: 2025-08-25;\nUN Children's Fund (UNICEF), uri: washdata.org, note: WHO/UNICEF Joint Monitoring Programme (JMP) for Water Supply, Sanitation and Hygiene",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 기본 위생 서비스 접근 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/SH.STA.BASS.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2024",
        "value": 99.7293536055989
      },
      {
        "year": "2023",
        "value": 99.7457286506475
      },
      {
        "year": "2022",
        "value": 99.762103695696
      },
      {
        "year": "2021",
        "value": 99.7784787407445
      },
      {
        "year": "2020",
        "value": 99.7948537857931
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:29+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "wb-ms-mil-xpnd-gd-zs",
    "title": "한국 국방비 GDP 비중",
    "provider": "World Bank",
    "category": "행정·재정",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/MS.MIL.XPND.GD.ZS?locations=KR",
    "description": "Military expenditure (% of GDP)",
    "definition": "Military expenditure by country as percentage of gross domestic product",
    "attribution": "SIPRI Military Expenditure Database, Stockholm International Peace Research Institute (SIPRI), uri: https://www.sipri.org/databases",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 국방비 GDP 비중 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/MS.MIL.XPND.GD.ZS",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2025",
        "value": 2.6014689513
      },
      {
        "year": "2024",
        "value": 2.5383855979
      },
      {
        "year": "2023",
        "value": 2.5992577105
      },
      {
        "year": "2022",
        "value": 2.576425604
      },
      {
        "year": "2021",
        "value": 2.6190494124
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:28+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "wb-vc-ihr-psrc-p5",
    "title": "한국 인구 10만 명당 고의살인 피해율",
    "provider": "World Bank",
    "category": "안전·재난",
    "region": "한국",
    "auth_mode": "none",
    "unit": "공식 지표 정의 참고",
    "documentation": "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation",
    "indicator_url": "https://data.worldbank.org/indicator/VC.IHR.PSRC.P5?locations=KR",
    "description": "Intentional homicides (per 100,000 people)",
    "definition": "An intentional homicide is defined as an unlawful death inflicted upon a person with the intent to cause death or serious injury.",
    "attribution": "UNODC Research - Data Portal – Intentional Homicide, UN Office on Drugs and Crime (UNODC)",
    "limitations": "2015~2025년 조회. 연도별 결측과 지표별 갱신 주기가 다릅니다. 기간·국가·페이지는 INPUT에서 변경할 수 있습니다.",
    "source": {
      "name": "한국 인구 10만 명당 고의살인 피해율 · World Bank",
      "url": "https://api.worldbank.org/v2/country/KOR/indicator/VC.IHR.PSRC.P5",
      "method": "GET",
      "response_format": "json",
      "records_path": "$[1]",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        },
        {
          "name": "date",
          "location": "query",
          "value": "2015:2025",
          "type": "string",
          "secret": false
        },
        {
          "name": "per_page",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "year",
          "path": "date",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "value",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "preview": [
      {
        "year": "2023",
        "value": 0.477306316584835
      },
      {
        "year": "2022",
        "value": 0.49630655708926
      },
      {
        "year": "2021",
        "value": 0.472531479878428
      },
      {
        "year": "2020",
        "value": 0.593924062354197
      },
      {
        "year": "2019",
        "value": 0.573715197653771
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:29+00:00",
    "verified_rows": 11,
    "preview_scope": "실제 응답 11행 중 5행 표시 · 미리보기에서 수치 결측 행 제외",
    "preview_warnings": []
  },
  {
    "id": "bok-base-rate",
    "title": "한국은행 기준금리",
    "provider": "한국은행 ECOS",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "public-sample",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "한국은행 기준금리",
      "url": "https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/722Y001/D/20240101/20240110",
      "method": "GET",
      "response_format": "json",
      "records_path": "StatisticSearch.row",
      "inputs": [],
      "body_format": "json",
      "fields": [
        {
          "name": "period",
          "path": "TIME",
          "type": "string",
          "required": false
        },
        {
          "name": "statistic",
          "path": "STAT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "item",
          "path": "ITEM_NAME1",
          "type": "string",
          "required": false
        },
        {
          "name": "unit",
          "path": "UNIT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "DATA_VALUE",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://ecos.bok.or.kr/api/",
    "indicator_url": "https://ecos.bok.or.kr/api/",
    "description": "한국은행 기준금리",
    "definition": "",
    "attribution": "한국은행 ECOS",
    "limitations": "개인 인증키 없이 공개 sample 경로로 실제 통계를 최대 10행 조회합니다. 정식 대량 수집은 본인 ECOS 인증키가 필요합니다.",
    "preview": [
      {
        "period": "20240101",
        "statistic": "1.3.1. 한국은행 기준금리 및 여수신금리",
        "item": "한국은행 기준금리",
        "unit": "연%",
        "value": 3.5
      },
      {
        "period": "20240101",
        "statistic": "1.3.1. 한국은행 기준금리 및 여수신금리",
        "item": "정부대출금금리",
        "unit": "연%",
        "value": 3.623
      },
      {
        "period": "20240101",
        "statistic": "1.3.1. 한국은행 기준금리 및 여수신금리",
        "item": "자금조정 대출금리",
        "unit": "연%",
        "value": 4.0
      },
      {
        "period": "20240101",
        "statistic": "1.3.1. 한국은행 기준금리 및 여수신금리",
        "item": "자금조정 예금금리",
        "unit": "연%",
        "value": 3.0
      },
      {
        "period": "20240101",
        "statistic": "1.3.1. 한국은행 기준금리 및 여수신금리",
        "item": "무역금융지원 프로그램대출금리",
        "unit": "연%",
        "value": 2.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:29+00:00",
    "verified_rows": 10,
    "preview_scope": "실제 응답 10행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "bok-exchange",
    "title": "한국은행 주요 환율",
    "provider": "한국은행 ECOS",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "public-sample",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "한국은행 주요 환율",
      "url": "https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/731Y001/D/20240101/20240110",
      "method": "GET",
      "response_format": "json",
      "records_path": "StatisticSearch.row",
      "inputs": [],
      "body_format": "json",
      "fields": [
        {
          "name": "period",
          "path": "TIME",
          "type": "string",
          "required": false
        },
        {
          "name": "statistic",
          "path": "STAT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "item",
          "path": "ITEM_NAME1",
          "type": "string",
          "required": false
        },
        {
          "name": "unit",
          "path": "UNIT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "DATA_VALUE",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://ecos.bok.or.kr/api/",
    "indicator_url": "https://ecos.bok.or.kr/api/",
    "description": "한국은행 주요 환율",
    "definition": "",
    "attribution": "한국은행 ECOS",
    "limitations": "개인 인증키 없이 공개 sample 경로로 실제 통계를 최대 10행 조회합니다. 정식 대량 수집은 본인 ECOS 인증키가 필요합니다.",
    "preview": [
      {
        "period": "20240102",
        "statistic": "3.1.1.1. 주요국 통화의 대원화환율",
        "item": "원/미국달러(매매기준율)",
        "unit": "원",
        "value": 1289.4
      },
      {
        "period": "20240102",
        "statistic": "3.1.1.1. 주요국 통화의 대원화환율",
        "item": "원/일본엔(100엔)",
        "unit": "원",
        "value": 915.6
      },
      {
        "period": "20240102",
        "statistic": "3.1.1.1. 주요국 통화의 대원화환율",
        "item": "원/유로",
        "unit": "원",
        "value": 1423.63
      },
      {
        "period": "20240102",
        "statistic": "3.1.1.1. 주요국 통화의 대원화환율",
        "item": "원/영국파운드",
        "unit": "원",
        "value": 1641.92
      },
      {
        "period": "20240102",
        "statistic": "3.1.1.1. 주요국 통화의 대원화환율",
        "item": "원/캐나다달러",
        "unit": "원",
        "value": 973.76
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:30+00:00",
    "verified_rows": 10,
    "preview_scope": "실제 응답 10행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "bok-cpi",
    "title": "한국은행 소비자물가",
    "provider": "한국은행 ECOS",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "public-sample",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "한국은행 소비자물가",
      "url": "https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/901Y009/M/202401/202410",
      "method": "GET",
      "response_format": "json",
      "records_path": "StatisticSearch.row",
      "inputs": [],
      "body_format": "json",
      "fields": [
        {
          "name": "period",
          "path": "TIME",
          "type": "string",
          "required": false
        },
        {
          "name": "statistic",
          "path": "STAT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "item",
          "path": "ITEM_NAME1",
          "type": "string",
          "required": false
        },
        {
          "name": "unit",
          "path": "UNIT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "DATA_VALUE",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://ecos.bok.or.kr/api/",
    "indicator_url": "https://ecos.bok.or.kr/api/",
    "description": "한국은행 소비자물가",
    "definition": "",
    "attribution": "한국은행 ECOS",
    "limitations": "개인 인증키 없이 공개 sample 경로로 실제 통계를 최대 10행 조회합니다. 정식 대량 수집은 본인 ECOS 인증키가 필요합니다.",
    "preview": [
      {
        "period": "202401",
        "statistic": "4.2.1. 소비자물가지수",
        "item": "총지수",
        "unit": "2020=100",
        "value": 113.17
      },
      {
        "period": "202401",
        "statistic": "4.2.1. 소비자물가지수",
        "item": "식료품 및 비주류음료",
        "unit": "2020=100",
        "value": 122.2
      },
      {
        "period": "202401",
        "statistic": "4.2.1. 소비자물가지수",
        "item": "식료품",
        "unit": "2020=100",
        "value": 122.38
      },
      {
        "period": "202401",
        "statistic": "4.2.1. 소비자물가지수",
        "item": "빵 및 곡물",
        "unit": "2020=100",
        "value": 119.36
      },
      {
        "period": "202401",
        "statistic": "4.2.1. 소비자물가지수",
        "item": "쌀",
        "unit": "2020=100",
        "value": 104.96
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:30+00:00",
    "verified_rows": 10,
    "preview_scope": "실제 응답 10행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "bok-industrial",
    "title": "한국은행 산업생산 통계",
    "provider": "한국은행 ECOS",
    "category": "제조·산업",
    "region": "한국",
    "auth_mode": "public-sample",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "한국은행 산업생산 통계",
      "url": "https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/901Y033/M/202401/202410",
      "method": "GET",
      "response_format": "json",
      "records_path": "StatisticSearch.row",
      "inputs": [],
      "body_format": "json",
      "fields": [
        {
          "name": "period",
          "path": "TIME",
          "type": "string",
          "required": false
        },
        {
          "name": "statistic",
          "path": "STAT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "item",
          "path": "ITEM_NAME1",
          "type": "string",
          "required": false
        },
        {
          "name": "unit",
          "path": "UNIT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "DATA_VALUE",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://ecos.bok.or.kr/api/",
    "indicator_url": "https://ecos.bok.or.kr/api/",
    "description": "한국은행 산업생산 통계",
    "definition": "",
    "attribution": "한국은행 ECOS",
    "limitations": "개인 인증키 없이 공개 sample 경로로 실제 통계를 최대 10행 조회합니다. 정식 대량 수집은 본인 ECOS 인증키가 필요합니다.",
    "preview": [
      {
        "period": "202401",
        "statistic": "8.1.4. 전산업생산지수(농림어업제외)",
        "item": "전산업생산지수(농림어업 제외)",
        "unit": "2020=100",
        "value": 110.5
      },
      {
        "period": "202401",
        "statistic": "8.1.4. 전산업생산지수(농림어업제외)",
        "item": "전산업생산지수(농림어업 제외)",
        "unit": "2020=100",
        "value": 113.7
      },
      {
        "period": "202401",
        "statistic": "8.1.4. 전산업생산지수(농림어업제외)",
        "item": "광공업",
        "unit": "2020=100",
        "value": 108.9
      },
      {
        "period": "202401",
        "statistic": "8.1.4. 전산업생산지수(농림어업제외)",
        "item": "광공업",
        "unit": "2020=100",
        "value": 108.9
      },
      {
        "period": "202401",
        "statistic": "8.1.4. 전산업생산지수(농림어업제외)",
        "item": "서비스업",
        "unit": "2020=100",
        "value": 113.7
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:30+00:00",
    "verified_rows": 10,
    "preview_scope": "실제 응답 10행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "bok-household-credit",
    "title": "한국은행 가계신용",
    "provider": "한국은행 ECOS",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "public-sample",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "한국은행 가계신용",
      "url": "https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/151Y005/Q/2022Q1/2024Q2",
      "method": "GET",
      "response_format": "json",
      "records_path": "StatisticSearch.row",
      "inputs": [],
      "body_format": "json",
      "fields": [
        {
          "name": "period",
          "path": "TIME",
          "type": "string",
          "required": false
        },
        {
          "name": "statistic",
          "path": "STAT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "item",
          "path": "ITEM_NAME1",
          "type": "string",
          "required": false
        },
        {
          "name": "unit",
          "path": "UNIT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "DATA_VALUE",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://ecos.bok.or.kr/api/",
    "indicator_url": "https://ecos.bok.or.kr/api/",
    "description": "한국은행 가계신용",
    "definition": "",
    "attribution": "한국은행 ECOS",
    "limitations": "개인 인증키 없이 공개 sample 경로로 실제 통계를 최대 10행 조회합니다. 정식 대량 수집은 본인 ECOS 인증키가 필요합니다.",
    "preview": [
      {
        "period": "2022Q1",
        "statistic": "1.2.4.2.2. 예금취급기관 가계대출(용도별, 월)",
        "item": "예금취급기관",
        "unit": "십억원",
        "value": 1252757.2
      },
      {
        "period": "2022Q1",
        "statistic": "1.2.4.2.2. 예금취급기관 가계대출(용도별, 월)",
        "item": "주택관련대출-예금취급기관",
        "unit": "십억원",
        "value": 739697.1
      },
      {
        "period": "2022Q1",
        "statistic": "1.2.4.2.2. 예금취급기관 가계대출(용도별, 월)",
        "item": "기타대출-예금취급기관",
        "unit": "십억원",
        "value": 513060.1
      },
      {
        "period": "2022Q1",
        "statistic": "1.2.4.2.2. 예금취급기관 가계대출(용도별, 월)",
        "item": "주택관련대출-예금은행",
        "unit": "십억원",
        "value": 632170.2
      },
      {
        "period": "2022Q1",
        "statistic": "1.2.4.2.2. 예금취급기관 가계대출(용도별, 월)",
        "item": "기타대출-예금은행",
        "unit": "십억원",
        "value": 273430.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:30+00:00",
    "verified_rows": 10,
    "preview_scope": "실제 응답 10행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "bok-key-stats",
    "title": "한국은행 주요 경제지표",
    "provider": "한국은행 ECOS",
    "category": "금융·물가",
    "region": "한국",
    "auth_mode": "public-sample",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "한국은행 주요 경제지표",
      "url": "https://ecos.bok.or.kr/api/KeyStatisticList/sample/json/kr/1/10/",
      "method": "GET",
      "response_format": "json",
      "records_path": "KeyStatisticList.row",
      "inputs": [],
      "body_format": "json",
      "fields": [
        {
          "name": "category",
          "path": "CLASS_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "indicator",
          "path": "KEYSTAT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "period",
          "path": "CYCLE",
          "type": "string",
          "required": false
        },
        {
          "name": "unit",
          "path": "UNIT_NAME",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "DATA_VALUE",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://ecos.bok.or.kr/api/",
    "indicator_url": "https://ecos.bok.or.kr/api/",
    "description": "한국은행 주요 경제지표",
    "definition": "",
    "attribution": "한국은행 ECOS",
    "limitations": "공개 sample 경로의 실제 최신 지표 최대 10행. 정식 대량 수집은 본인 인증키가 필요합니다.",
    "preview": [
      {
        "category": "통화량",
        "indicator": "M1(협의통화, 평잔)",
        "period": "202608",
        "unit": "십억원",
        "value": 1351852.9
      },
      {
        "category": "통화량",
        "indicator": "M2(광의통화, 평잔)",
        "period": "202608",
        "unit": "십억원",
        "value": 4257820.8
      },
      {
        "category": "환율",
        "indicator": "원/달러 환율(종가)",
        "period": "20261029",
        "unit": "원",
        "value": 1336.8
      },
      {
        "category": "환율",
        "indicator": "원/엔(100엔) 환율(매매기준율)",
        "period": "20261029",
        "unit": "원",
        "value": 846.89
      },
      {
        "category": "환율",
        "indicator": "원/유로 환율(매매기준율)",
        "period": "20261029",
        "unit": "원",
        "value": 1490.51
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:30+00:00",
    "verified_rows": 10,
    "preview_scope": "실제 응답 10행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "usgs-global-earthquakes",
    "title": "세계 지진 목록",
    "provider": "미국 지질조사국 USGS",
    "category": "안전·재난",
    "region": "세계",
    "auth_mode": "none",
    "unit": "규모·km·밀리초",
    "source": {
      "name": "세계 지진 목록 · USGS",
      "url": "https://earthquake.usgs.gov/fdsnws/event/1/query",
      "method": "GET",
      "response_format": "json",
      "records_path": "features",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "geojson",
          "type": "string",
          "secret": false
        },
        {
          "name": "starttime",
          "location": "query",
          "value": "2024-01-01",
          "type": "string",
          "secret": false
        },
        {
          "name": "endtime",
          "location": "query",
          "value": "2024-02-01",
          "type": "string",
          "secret": false
        },
        {
          "name": "limit",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        },
        {
          "name": "minmagnitude",
          "location": "query",
          "value": "4",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "event_id",
          "path": "id",
          "type": "string",
          "required": false
        },
        {
          "name": "magnitude",
          "path": "properties.mag",
          "type": "number",
          "required": false
        },
        {
          "name": "place",
          "path": "properties.place",
          "type": "string",
          "required": false
        },
        {
          "name": "time_ms",
          "path": "properties.time",
          "type": "number",
          "required": false
        },
        {
          "name": "longitude",
          "path": "geometry.coordinates[0]",
          "type": "number",
          "required": false
        },
        {
          "name": "latitude",
          "path": "geometry.coordinates[1]",
          "type": "number",
          "required": false
        },
        {
          "name": "depth_km",
          "path": "geometry.coordinates[2]",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://earthquake.usgs.gov/fdsnws/event/1/",
    "indicator_url": "https://earthquake.usgs.gov/fdsnws/event/1/",
    "description": "세계 지진 목록",
    "definition": "",
    "attribution": "미국 지질조사국 USGS",
    "limitations": "2024년 1월 역사 관측 최대 100행. INPUT 기간·최소 규모·위치 조건을 변경해 조회할 수 있습니다.",
    "preview": [
      {
        "event_id": "us7000lvj9",
        "magnitude": 4.6,
        "place": "97 km S of La Libertad, El Salvador",
        "time_ms": 1706744597478.0,
        "longitude": -89.2963,
        "latitude": 12.6093,
        "depth_km": 45.259
      },
      {
        "event_id": "us7000lviq",
        "magnitude": 4.2,
        "place": "18 km NNW of Anamizu, Japan",
        "time_ms": 1706742432081.0,
        "longitude": 136.7898,
        "latitude": 37.3723,
        "depth_km": 8.748
      },
      {
        "event_id": "us7000lx42",
        "magnitude": 4.4,
        "place": "northern Mid-Atlantic Ridge",
        "time_ms": 1706741512816.0,
        "longitude": -39.3618,
        "latitude": 33.1068,
        "depth_km": 10.0
      },
      {
        "event_id": "us7000lx41",
        "magnitude": 4.5,
        "place": "51 km SSE of Finschhafen, Papua New Guinea",
        "time_ms": 1706740136022.0,
        "longitude": 148.0811,
        "latitude": -6.9643,
        "depth_km": 28.439
      },
      {
        "event_id": "us7000lx43",
        "magnitude": 4.3,
        "place": "southeast of the Loyalty Islands",
        "time_ms": 1706738664814.0,
        "longitude": 172.3308,
        "latitude": -23.1189,
        "depth_km": 10.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:32+00:00",
    "verified_rows": 100,
    "preview_scope": "실제 응답 100행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "usgs-major-earthquakes",
    "title": "규모 6 이상 지진",
    "provider": "미국 지질조사국 USGS",
    "category": "안전·재난",
    "region": "세계",
    "auth_mode": "none",
    "unit": "규모·km·밀리초",
    "source": {
      "name": "규모 6 이상 지진 · USGS",
      "url": "https://earthquake.usgs.gov/fdsnws/event/1/query",
      "method": "GET",
      "response_format": "json",
      "records_path": "features",
      "inputs": [
        {
          "name": "format",
          "location": "query",
          "value": "geojson",
          "type": "string",
          "secret": false
        },
        {
          "name": "starttime",
          "location": "query",
          "value": "2024-01-01",
          "type": "string",
          "secret": false
        },
        {
          "name": "endtime",
          "location": "query",
          "value": "2024-02-01",
          "type": "string",
          "secret": false
        },
        {
          "name": "limit",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        },
        {
          "name": "minmagnitude",
          "location": "query",
          "value": "6",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "event_id",
          "path": "id",
          "type": "string",
          "required": false
        },
        {
          "name": "magnitude",
          "path": "properties.mag",
          "type": "number",
          "required": false
        },
        {
          "name": "place",
          "path": "properties.place",
          "type": "string",
          "required": false
        },
        {
          "name": "time_ms",
          "path": "properties.time",
          "type": "number",
          "required": false
        },
        {
          "name": "longitude",
          "path": "geometry.coordinates[0]",
          "type": "number",
          "required": false
        },
        {
          "name": "latitude",
          "path": "geometry.coordinates[1]",
          "type": "number",
          "required": false
        },
        {
          "name": "depth_km",
          "path": "geometry.coordinates[2]",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://earthquake.usgs.gov/fdsnws/event/1/",
    "indicator_url": "https://earthquake.usgs.gov/fdsnws/event/1/",
    "description": "규모 6 이상 지진",
    "definition": "",
    "attribution": "미국 지질조사국 USGS",
    "limitations": "2024년 1월 역사 관측 최대 100행. INPUT 기간·최소 규모·위치 조건을 변경해 조회할 수 있습니다.",
    "preview": [
      {
        "event_id": "us7000lui3",
        "magnitude": 6.5,
        "place": "70 km W of Tarauacá, Brazil",
        "time_ms": 1706434736538.0,
        "longitude": -71.4005,
        "latitude": -8.236,
        "depth_km": 621.081
      },
      {
        "event_id": "us7000luai",
        "magnitude": 6.1,
        "place": "15 km W of Taxisco, Guatemala",
        "time_ms": 1706334768419.0,
        "longitude": -90.6159,
        "latitude": 14.0636,
        "depth_km": 90.0
      },
      {
        "event_id": "us7000lt73",
        "magnitude": 6.3,
        "place": "39 km SW of Port-Vila, Vanuatu",
        "time_ms": 1706020425022.0,
        "longitude": 168.0499,
        "latitude": -17.9827,
        "depth_km": 31.0
      },
      {
        "event_id": "us7000lsze",
        "magnitude": 7.0,
        "place": "128 km WNW of Aykol, China",
        "time_ms": 1705946944340.0,
        "longitude": 78.6538,
        "latitude": 41.2555,
        "depth_km": 13.0
      },
      {
        "event_id": "us6000m53t",
        "magnitude": 6.2,
        "place": "Southwest Indian Ridge",
        "time_ms": 1705788579708.0,
        "longitude": 46.1966,
        "latitude": -39.93,
        "depth_km": 10.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:32+00:00",
    "verified_rows": 12,
    "preview_scope": "실제 응답 12행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "noaa-water-level",
    "title": "NOAA 해수면 높이",
    "provider": "미국 해양대기청 NOAA",
    "category": "해양·기상",
    "region": "미국",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "해수면 높이 · NOAA",
      "url": "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
      "method": "GET",
      "response_format": "json",
      "records_path": "data",
      "inputs": [
        {
          "name": "product",
          "location": "query",
          "value": "water_level",
          "type": "string",
          "secret": false
        },
        {
          "name": "application",
          "location": "query",
          "value": "IN-BAPS",
          "type": "string",
          "secret": false
        },
        {
          "name": "begin_date",
          "location": "query",
          "value": "20240101",
          "type": "string",
          "secret": false
        },
        {
          "name": "end_date",
          "location": "query",
          "value": "20240101",
          "type": "string",
          "secret": false
        },
        {
          "name": "datum",
          "location": "query",
          "value": "MLLW",
          "type": "string",
          "secret": false
        },
        {
          "name": "station",
          "location": "query",
          "value": "9414290",
          "type": "string",
          "secret": false
        },
        {
          "name": "time_zone",
          "location": "query",
          "value": "gmt",
          "type": "string",
          "secret": false
        },
        {
          "name": "units",
          "location": "query",
          "value": "metric",
          "type": "string",
          "secret": false
        },
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "time",
          "path": "t",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "v",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://api.tidesandcurrents.noaa.gov/api/prod/",
    "indicator_url": "https://api.tidesandcurrents.noaa.gov/api/prod/",
    "description": "NOAA 해수면 높이",
    "definition": "",
    "attribution": "미국 해양대기청 NOAA",
    "limitations": "샌프란시스코 9414290 관측소의 2024-01-01 관측. 관측소·일자·product를 INPUT에서 변경하세요. 결측은 제공기관 정책을 따릅니다.",
    "preview": [
      {
        "time": "2024-01-01 00:00",
        "value": 1.327
      },
      {
        "time": "2024-01-01 00:06",
        "value": 1.297
      },
      {
        "time": "2024-01-01 00:12",
        "value": 1.242
      },
      {
        "time": "2024-01-01 00:18",
        "value": 1.217
      },
      {
        "time": "2024-01-01 00:24",
        "value": 1.163
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:32+00:00",
    "verified_rows": 240,
    "preview_scope": "실제 응답 240행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "noaa-water-temperature",
    "title": "NOAA 해수 온도",
    "provider": "미국 해양대기청 NOAA",
    "category": "해양·기상",
    "region": "미국",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "해수 온도 · NOAA",
      "url": "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
      "method": "GET",
      "response_format": "json",
      "records_path": "data",
      "inputs": [
        {
          "name": "product",
          "location": "query",
          "value": "water_temperature",
          "type": "string",
          "secret": false
        },
        {
          "name": "application",
          "location": "query",
          "value": "IN-BAPS",
          "type": "string",
          "secret": false
        },
        {
          "name": "begin_date",
          "location": "query",
          "value": "20240101",
          "type": "string",
          "secret": false
        },
        {
          "name": "end_date",
          "location": "query",
          "value": "20240101",
          "type": "string",
          "secret": false
        },
        {
          "name": "datum",
          "location": "query",
          "value": "MLLW",
          "type": "string",
          "secret": false
        },
        {
          "name": "station",
          "location": "query",
          "value": "9414290",
          "type": "string",
          "secret": false
        },
        {
          "name": "time_zone",
          "location": "query",
          "value": "gmt",
          "type": "string",
          "secret": false
        },
        {
          "name": "units",
          "location": "query",
          "value": "metric",
          "type": "string",
          "secret": false
        },
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "time",
          "path": "t",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "v",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://api.tidesandcurrents.noaa.gov/api/prod/",
    "indicator_url": "https://api.tidesandcurrents.noaa.gov/api/prod/",
    "description": "NOAA 해수 온도",
    "definition": "",
    "attribution": "미국 해양대기청 NOAA",
    "limitations": "샌프란시스코 9414290 관측소의 2024-01-01 관측. 관측소·일자·product를 INPUT에서 변경하세요. 결측은 제공기관 정책을 따릅니다.",
    "preview": [
      {
        "time": "2024-01-01 00:00",
        "value": 14.9
      },
      {
        "time": "2024-01-01 00:06",
        "value": 14.9
      },
      {
        "time": "2024-01-01 00:12",
        "value": 14.9
      },
      {
        "time": "2024-01-01 00:18",
        "value": 14.9
      },
      {
        "time": "2024-01-01 00:24",
        "value": 14.9
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:32+00:00",
    "verified_rows": 240,
    "preview_scope": "실제 응답 240행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "noaa-air-temperature",
    "title": "NOAA 연안 대기 온도",
    "provider": "미국 해양대기청 NOAA",
    "category": "해양·기상",
    "region": "미국",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "연안 대기 온도 · NOAA",
      "url": "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
      "method": "GET",
      "response_format": "json",
      "records_path": "data",
      "inputs": [
        {
          "name": "product",
          "location": "query",
          "value": "air_temperature",
          "type": "string",
          "secret": false
        },
        {
          "name": "application",
          "location": "query",
          "value": "IN-BAPS",
          "type": "string",
          "secret": false
        },
        {
          "name": "begin_date",
          "location": "query",
          "value": "20240101",
          "type": "string",
          "secret": false
        },
        {
          "name": "end_date",
          "location": "query",
          "value": "20240101",
          "type": "string",
          "secret": false
        },
        {
          "name": "datum",
          "location": "query",
          "value": "MLLW",
          "type": "string",
          "secret": false
        },
        {
          "name": "station",
          "location": "query",
          "value": "9414290",
          "type": "string",
          "secret": false
        },
        {
          "name": "time_zone",
          "location": "query",
          "value": "gmt",
          "type": "string",
          "secret": false
        },
        {
          "name": "units",
          "location": "query",
          "value": "metric",
          "type": "string",
          "secret": false
        },
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "time",
          "path": "t",
          "type": "string",
          "required": false
        },
        {
          "name": "value",
          "path": "v",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://api.tidesandcurrents.noaa.gov/api/prod/",
    "indicator_url": "https://api.tidesandcurrents.noaa.gov/api/prod/",
    "description": "NOAA 연안 대기 온도",
    "definition": "",
    "attribution": "미국 해양대기청 NOAA",
    "limitations": "샌프란시스코 9414290 관측소의 2024-01-01 관측. 관측소·일자·product를 INPUT에서 변경하세요. 결측은 제공기관 정책을 따릅니다.",
    "preview": [
      {
        "time": "2024-01-01 00:00",
        "value": 12.9
      },
      {
        "time": "2024-01-01 00:06",
        "value": 12.9
      },
      {
        "time": "2024-01-01 00:12",
        "value": 12.9
      },
      {
        "time": "2024-01-01 00:18",
        "value": 13.0
      },
      {
        "time": "2024-01-01 00:24",
        "value": 13.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:33+00:00",
    "verified_rows": 240,
    "preview_scope": "실제 응답 240행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "noaa-wind",
    "title": "NOAA 연안 풍속·풍향",
    "provider": "미국 해양대기청 NOAA",
    "category": "해양·기상",
    "region": "미국",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "연안 풍속·풍향 · NOAA",
      "url": "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter",
      "method": "GET",
      "response_format": "json",
      "records_path": "data",
      "inputs": [
        {
          "name": "product",
          "location": "query",
          "value": "wind",
          "type": "string",
          "secret": false
        },
        {
          "name": "application",
          "location": "query",
          "value": "IN-BAPS",
          "type": "string",
          "secret": false
        },
        {
          "name": "begin_date",
          "location": "query",
          "value": "20240101",
          "type": "string",
          "secret": false
        },
        {
          "name": "end_date",
          "location": "query",
          "value": "20240101",
          "type": "string",
          "secret": false
        },
        {
          "name": "datum",
          "location": "query",
          "value": "MLLW",
          "type": "string",
          "secret": false
        },
        {
          "name": "station",
          "location": "query",
          "value": "9414290",
          "type": "string",
          "secret": false
        },
        {
          "name": "time_zone",
          "location": "query",
          "value": "gmt",
          "type": "string",
          "secret": false
        },
        {
          "name": "units",
          "location": "query",
          "value": "metric",
          "type": "string",
          "secret": false
        },
        {
          "name": "format",
          "location": "query",
          "value": "json",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "time",
          "path": "t",
          "type": "string",
          "required": false
        },
        {
          "name": "speed",
          "path": "s",
          "type": "number",
          "required": false
        },
        {
          "name": "direction",
          "path": "d",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://api.tidesandcurrents.noaa.gov/api/prod/",
    "indicator_url": "https://api.tidesandcurrents.noaa.gov/api/prod/",
    "description": "NOAA 연안 풍속·풍향",
    "definition": "",
    "attribution": "미국 해양대기청 NOAA",
    "limitations": "샌프란시스코 9414290 관측소의 2024-01-01 관측. 관측소·일자·product를 INPUT에서 변경하세요. 결측은 제공기관 정책을 따릅니다.",
    "preview": [
      {
        "time": "2024-01-01 00:00",
        "speed": 3.9,
        "direction": 346.0
      },
      {
        "time": "2024-01-01 00:06",
        "speed": 3.8,
        "direction": 348.0
      },
      {
        "time": "2024-01-01 00:12",
        "speed": 3.4,
        "direction": 344.0
      },
      {
        "time": "2024-01-01 00:18",
        "speed": 3.7,
        "direction": 347.0
      },
      {
        "time": "2024-01-01 00:24",
        "speed": 3.5,
        "direction": 345.0
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:33+00:00",
    "verified_rows": 240,
    "preview_scope": "실제 응답 240행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "treasury-debt",
    "title": "미국 일별 국가부채",
    "provider": "미국 재무부 Fiscal Data",
    "category": "금융·물가",
    "region": "미국",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "미국 일별 국가부채",
      "url": "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny",
      "method": "GET",
      "response_format": "json",
      "records_path": "data",
      "inputs": [
        {
          "name": "page[size]",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        },
        {
          "name": "sort",
          "location": "query",
          "value": "-record_date",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "date",
          "path": "record_date",
          "type": "string",
          "required": false
        },
        {
          "name": "public_debt",
          "path": "tot_pub_debt_out_amt",
          "type": "number",
          "required": false
        },
        {
          "name": "held_by_public",
          "path": "debt_held_public_amt",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://fiscaldata.treasury.gov/api-documentation/",
    "indicator_url": "https://fiscaldata.treasury.gov/api-documentation/",
    "description": "미국 일별 국가부채",
    "definition": "",
    "attribution": "미국 재무부 Fiscal Data",
    "limitations": "최신순 첫 100행. 검색 조건·페이지 크기를 INPUT에서 수정할 수 있습니다.",
    "preview": [
      {
        "date": "2026-10-27",
        "public_debt": 40582274254843.57,
        "held_by_public": 32677379585770.57
      },
      {
        "date": "2026-10-26",
        "public_debt": 40528358939415.85,
        "held_by_public": 32635294814294.48
      },
      {
        "date": "2026-10-23",
        "public_debt": 40463151897249.19,
        "held_by_public": 32610649676158.39
      },
      {
        "date": "2026-10-22",
        "public_debt": 40444342709389.15,
        "held_by_public": 32597664070880.23
      },
      {
        "date": "2026-10-21",
        "public_debt": 40413639012305.97,
        "held_by_public": 32566346587338.02
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:34+00:00",
    "verified_rows": 100,
    "preview_scope": "실제 응답 100행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "treasury-exchange",
    "title": "미국 재무부 기준 환율",
    "provider": "미국 재무부 Fiscal Data",
    "category": "금융·물가",
    "region": "미국",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "미국 재무부 기준 환율",
      "url": "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange",
      "method": "GET",
      "response_format": "json",
      "records_path": "data",
      "inputs": [
        {
          "name": "page[size]",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        },
        {
          "name": "sort",
          "location": "query",
          "value": "-record_date",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "date",
          "path": "record_date",
          "type": "string",
          "required": false
        },
        {
          "name": "country_currency",
          "path": "country_currency_desc",
          "type": "string",
          "required": false
        },
        {
          "name": "exchange_rate",
          "path": "exchange_rate",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://fiscaldata.treasury.gov/api-documentation/",
    "indicator_url": "https://fiscaldata.treasury.gov/api-documentation/",
    "description": "미국 재무부 기준 환율",
    "definition": "",
    "attribution": "미국 재무부 Fiscal Data",
    "limitations": "최신순 첫 100행. 검색 조건·페이지 크기를 INPUT에서 수정할 수 있습니다.",
    "preview": [
      {
        "date": "2026-09-30",
        "country_currency": "Republic Of North Macedonia-Denar",
        "exchange_rate": 54.05
      },
      {
        "date": "2026-09-30",
        "country_currency": "Romania-New Leu",
        "exchange_rate": 4.648
      },
      {
        "date": "2026-09-30",
        "country_currency": "Russia-Ruble",
        "exchange_rate": 83.041
      },
      {
        "date": "2026-09-30",
        "country_currency": "Rwanda-Franc",
        "exchange_rate": 1450.0
      },
      {
        "date": "2026-09-30",
        "country_currency": "Sao Tome & Principe-New Dobras",
        "exchange_rate": 21.576
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:34+00:00",
    "verified_rows": 100,
    "preview_scope": "실제 응답 100행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "treasury-interest",
    "title": "미국 연방채무 평균금리",
    "provider": "미국 재무부 Fiscal Data",
    "category": "금융·물가",
    "region": "미국",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "미국 연방채무 평균금리",
      "url": "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/avg_interest_rates",
      "method": "GET",
      "response_format": "json",
      "records_path": "data",
      "inputs": [
        {
          "name": "page[size]",
          "location": "query",
          "value": "100",
          "type": "string",
          "secret": false
        },
        {
          "name": "sort",
          "location": "query",
          "value": "-record_date",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "date",
          "path": "record_date",
          "type": "string",
          "required": false
        },
        {
          "name": "security",
          "path": "security_desc",
          "type": "string",
          "required": false
        },
        {
          "name": "average_rate",
          "path": "avg_interest_rate_amt",
          "type": "number",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://fiscaldata.treasury.gov/api-documentation/",
    "indicator_url": "https://fiscaldata.treasury.gov/api-documentation/",
    "description": "미국 연방채무 평균금리",
    "definition": "",
    "attribution": "미국 재무부 Fiscal Data",
    "limitations": "최신순 첫 100행. 검색 조건·페이지 크기를 INPUT에서 수정할 수 있습니다.",
    "preview": [
      {
        "date": "2026-09-30",
        "security": "Treasury Bills",
        "average_rate": 3.87
      },
      {
        "date": "2026-09-30",
        "security": "Treasury Notes",
        "average_rate": 3.383
      },
      {
        "date": "2026-09-30",
        "security": "Treasury Bonds",
        "average_rate": 3.466
      },
      {
        "date": "2026-09-30",
        "security": "Treasury Inflation-Protected Securities (TIPS)",
        "average_rate": 1.149
      },
      {
        "date": "2026-09-30",
        "security": "Treasury Floating Rate Notes (FRN)",
        "average_rate": 4.141
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:34+00:00",
    "verified_rows": 100,
    "preview_scope": "실제 응답 100행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "nasa-wildfires",
    "title": "NASA 산불 사건",
    "provider": "미국 항공우주국 NASA",
    "category": "안전·재난",
    "region": "세계",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "NASA 산불 자연재해",
      "url": "https://eonet.gsfc.nasa.gov/api/v3/events",
      "method": "GET",
      "response_format": "json",
      "records_path": "events",
      "inputs": [
        {
          "name": "status",
          "location": "query",
          "value": "closed",
          "type": "string",
          "secret": false
        },
        {
          "name": "category",
          "location": "query",
          "value": "wildfires",
          "type": "string",
          "secret": false
        },
        {
          "name": "limit",
          "location": "query",
          "value": "20",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "event_id",
          "path": "id",
          "type": "string",
          "required": false
        },
        {
          "name": "title",
          "path": "title",
          "type": "string",
          "required": false
        },
        {
          "name": "closed",
          "path": "closed",
          "type": "string",
          "required": false
        },
        {
          "name": "categories",
          "path": "categories",
          "type": "json",
          "required": false
        },
        {
          "name": "geometry",
          "path": "geometry",
          "type": "json",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://eonet.gsfc.nasa.gov/docs/v3",
    "indicator_url": "https://eonet.gsfc.nasa.gov/docs/v3",
    "description": "NASA 산불 사건",
    "definition": "",
    "attribution": "미국 항공우주국 NASA",
    "limitations": "종료된 자연재해의 최근 최대 20건. 범주·기간·상태를 INPUT에서 수정합니다. 위치·범주는 중첩 JSON으로 보존합니다.",
    "preview": [
      {
        "event_id": "EONET_25831",
        "title": "Wildfire in China 1033270",
        "closed": "2026-10-27T00:00:00Z",
        "categories": "[{\"id\":\"wildfires\",\"title\":\"Wildfires\"}]",
        "geometry": "[{\"magnitudeValue\":5088.00,\"magnitudeUnit\":\"hectare\",\"date\":\"2026-10-27T19:00:00Z\",\"type\":\"Point\",\"coordinates\":[119.67609807075,32.913481725015]}]"
      },
      {
        "event_id": "EONET_25832",
        "title": "Wildfire in Botswana 1033271",
        "closed": "2026-10-27T00:00:00Z",
        "categories": "[{\"id\":\"wildfires\",\"title\":\"Wildfires\"}]",
        "geometry": "[{\"magnitudeValue\":9846.00,\"magnitudeUnit\":\"hectare\",\"date\":\"2026-10-27T19:00:00Z\",\"type\":\"Point\",\"coordinates\":[23.367968160634,-21.091241051575]}]"
      },
      {
        "event_id": "EONET_25833",
        "title": "Wildfire in Nigeria 1033286",
        "closed": "2026-10-28T00:00:00Z",
        "categories": "[{\"id\":\"wildfires\",\"title\":\"Wildfires\"}]",
        "geometry": "[{\"magnitudeValue\":6075.00,\"magnitudeUnit\":\"hectare\",\"date\":\"2026-10-27T19:00:00Z\",\"type\":\"Point\",\"coordinates\":[13.694612090153,13.076781022611]}]"
      },
      {
        "event_id": "EONET_25804",
        "title": "Wildfire in Mongolia 1033256",
        "closed": "2026-10-26T00:00:00Z",
        "categories": "[{\"id\":\"wildfires\",\"title\":\"Wildfires\"}]",
        "geometry": "[{\"magnitudeValue\":5522.00,\"magnitudeUnit\":\"hectare\",\"date\":\"2026-10-26T19:00:00Z\",\"type\":\"Point\",\"coordinates\":[114.50471902121,46.443067593754]}]"
      },
      {
        "event_id": "EONET_25834",
        "title": "Wildfire in Botswana 1033287",
        "closed": "2026-10-28T00:00:00Z",
        "categories": "[{\"id\":\"wildfires\",\"title\":\"Wildfires\"}]",
        "geometry": "[{\"magnitudeValue\":5873.00,\"magnitudeUnit\":\"hectare\",\"date\":\"2026-10-26T19:00:00Z\",\"type\":\"Point\",\"coordinates\":[24.145615795743,-21.359268235194]}]"
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:36+00:00",
    "verified_rows": 20,
    "preview_scope": "실제 응답 20행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "nasa-volcanoes",
    "title": "NASA 화산 사건",
    "provider": "미국 항공우주국 NASA",
    "category": "안전·재난",
    "region": "세계",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "NASA 화산 자연재해",
      "url": "https://eonet.gsfc.nasa.gov/api/v3/events",
      "method": "GET",
      "response_format": "json",
      "records_path": "events",
      "inputs": [
        {
          "name": "status",
          "location": "query",
          "value": "closed",
          "type": "string",
          "secret": false
        },
        {
          "name": "category",
          "location": "query",
          "value": "volcanoes",
          "type": "string",
          "secret": false
        },
        {
          "name": "limit",
          "location": "query",
          "value": "20",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "event_id",
          "path": "id",
          "type": "string",
          "required": false
        },
        {
          "name": "title",
          "path": "title",
          "type": "string",
          "required": false
        },
        {
          "name": "closed",
          "path": "closed",
          "type": "string",
          "required": false
        },
        {
          "name": "categories",
          "path": "categories",
          "type": "json",
          "required": false
        },
        {
          "name": "geometry",
          "path": "geometry",
          "type": "json",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://eonet.gsfc.nasa.gov/docs/v3",
    "indicator_url": "https://eonet.gsfc.nasa.gov/docs/v3",
    "description": "NASA 화산 사건",
    "definition": "",
    "attribution": "미국 항공우주국 NASA",
    "limitations": "종료된 자연재해의 최근 최대 20건. 범주·기간·상태를 INPUT에서 수정합니다. 위치·범주는 중첩 JSON으로 보존합니다.",
    "preview": [
      {
        "event_id": "EONET_19859",
        "title": "Piton de la Fournaise, Reunion (France)",
        "closed": "2026-04-29T00:00:00Z",
        "categories": "[{\"id\":\"volcanoes\",\"title\":\"Volcanoes\"}]",
        "geometry": "[{\"magnitudeValue\":null,\"magnitudeUnit\":null,\"date\":\"2026-04-08T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[55.708,-21.244]}]"
      },
      {
        "event_id": "EONET_19906",
        "title": "Akan Volcano, Japan",
        "closed": "2026-04-12T00:00:00Z",
        "categories": "[{\"id\":\"volcanoes\",\"title\":\"Volcanoes\"}]",
        "geometry": "[{\"magnitudeValue\":null,\"magnitudeUnit\":null,\"date\":\"2026-03-08T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[144.013,43.384]}]"
      },
      {
        "event_id": "EONET_19907",
        "title": "Masaya Volcano, Nicaragua",
        "closed": "2026-03-27T00:00:00Z",
        "categories": "[{\"id\":\"volcanoes\",\"title\":\"Volcanoes\"}]",
        "geometry": "[{\"magnitudeValue\":null,\"magnitudeUnit\":null,\"date\":\"2026-02-13T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-86.1688,11.9844]}]"
      },
      {
        "event_id": "EONET_19920",
        "title": "Heard Volcano, Australia",
        "closed": "2026-03-25T00:00:00Z",
        "categories": "[{\"id\":\"volcanoes\",\"title\":\"Volcanoes\"}]",
        "geometry": "[{\"magnitudeValue\":null,\"magnitudeUnit\":null,\"date\":\"2026-02-11T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[73.513,-53.106]}]"
      },
      {
        "event_id": "EONET_19921",
        "title": "Lascar Volcano, Chile",
        "closed": "2026-03-22T00:00:00Z",
        "categories": "[{\"id\":\"volcanoes\",\"title\":\"Volcanoes\"}]",
        "geometry": "[{\"magnitudeValue\":null,\"magnitudeUnit\":null,\"date\":\"2026-02-08T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-67.73,-23.37]}]"
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:35+00:00",
    "verified_rows": 20,
    "preview_scope": "실제 응답 20행 중 5행 표시",
    "preview_warnings": []
  },
  {
    "id": "nasa-severestorms",
    "title": "NASA 폭풍 사건",
    "provider": "미국 항공우주국 NASA",
    "category": "안전·재난",
    "region": "세계",
    "auth_mode": "none",
    "unit": "제공기관 정의 참고",
    "source": {
      "name": "NASA 폭풍 자연재해",
      "url": "https://eonet.gsfc.nasa.gov/api/v3/events",
      "method": "GET",
      "response_format": "json",
      "records_path": "events",
      "inputs": [
        {
          "name": "status",
          "location": "query",
          "value": "closed",
          "type": "string",
          "secret": false
        },
        {
          "name": "category",
          "location": "query",
          "value": "severeStorms",
          "type": "string",
          "secret": false
        },
        {
          "name": "limit",
          "location": "query",
          "value": "20",
          "type": "string",
          "secret": false
        }
      ],
      "body_format": "json",
      "fields": [
        {
          "name": "event_id",
          "path": "id",
          "type": "string",
          "required": false
        },
        {
          "name": "title",
          "path": "title",
          "type": "string",
          "required": false
        },
        {
          "name": "closed",
          "path": "closed",
          "type": "string",
          "required": false
        },
        {
          "name": "categories",
          "path": "categories",
          "type": "json",
          "required": false
        },
        {
          "name": "geometry",
          "path": "geometry",
          "type": "json",
          "required": false
        }
      ],
      "pagination": {
        "mode": "none",
        "parameter": "page",
        "start": 1,
        "step": 1,
        "size_parameter": "per_page",
        "page_size": 100,
        "max_pages": 10
      },
      "max_rows": 20000,
      "connection_id": ""
    },
    "documentation": "https://eonet.gsfc.nasa.gov/docs/v3",
    "indicator_url": "https://eonet.gsfc.nasa.gov/docs/v3",
    "description": "NASA 폭풍 사건",
    "definition": "",
    "attribution": "미국 항공우주국 NASA",
    "limitations": "종료된 자연재해의 최근 최대 20건. 범주·기간·상태를 INPUT에서 수정합니다. 위치·범주는 중첩 JSON으로 보존합니다.",
    "preview": [
      {
        "event_id": "EONET_25457",
        "title": "Tropical Cyclone Agueda",
        "closed": "2026-10-28T00:00:00Z",
        "categories": "[{\"id\":\"severeStorms\",\"title\":\"Severe Storms\"}]",
        "geometry": "[{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-20T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[53.8,-4.5]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-20T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[53.3,-5]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-20T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[52.7,-5.1]},{\"magnitudeValue\":45.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-21T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[52.5,-5.1]},{\"magnitudeValue\":45.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-21T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[52.2,-5.3]},{\"magnitudeValue\":50.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-21T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[51.6,-5.7]},{\"magnitudeValue\":50.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-21T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[50.8,-6]},{\"magnitudeValue\":45.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-22T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[51.2,-5.8]},{\"magnitudeValue\":50.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-22T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[50.8,-6]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-22T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[50.1,-6.2]},{\"magnitudeValue\":50.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-22T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[49.7,-6.7]},{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-23T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[49.9,-5.8]},{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-23T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[49.5,-5.7]},{\"magnitudeValue\":30.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-23T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[48.7,-5.7]},{\"magnitudeValue\":30.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-23T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[47.7,-5.7]}]"
      },
      {
        "event_id": "EONET_25340",
        "title": "Tropical Cyclone Wati",
        "closed": "2026-10-24T00:00:00Z",
        "categories": "[{\"id\":\"severeStorms\",\"title\":\"Severe Storms\"}]",
        "geometry": "[{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-163.3,-10.8]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-163.3,-11.7]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-163.4,-12.7]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-17T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-163.6,-12.1]},{\"magnitudeValue\":60.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-17T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-163.2,-13.2]},{\"magnitudeValue\":60.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-17T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-163.1,-14.4]},{\"magnitudeValue\":65.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-17T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-163.2,-14.8]},{\"magnitudeValue\":65.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-18T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-162.8,-15.6]},{\"magnitudeValue\":65.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-18T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-162.4,-16.1]},{\"magnitudeValue\":60.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-18T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-161.4,-17.4]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-18T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-160.2,-18.6]},{\"magnitudeValue\":50.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-19T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-158.9,-19.9]},{\"magnitudeValue\":45.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-19T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-156.8,-20.7]}]"
      },
      {
        "event_id": "EONET_25290",
        "title": "Hurricane Trudy",
        "closed": "2026-10-25T00:00:00Z",
        "categories": "[{\"id\":\"severeStorms\",\"title\":\"Severe Storms\"}]",
        "geometry": "[{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-13T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-95.9,10.3]},{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-14T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-96.9,10.5]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-14T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-98.6,10.8]},{\"magnitudeValue\":45.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-14T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-99.2,11.3]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-14T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-99.7,11.7]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-15T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-100.5,12.1]},{\"magnitudeValue\":65.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-15T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-101.2,12.6]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-15T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-101.6,12.9]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-15T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-101.6,13.5]},{\"magnitudeValue\":85.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-101.9,14.1]},{\"magnitudeValue\":105.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-102.4,14]},{\"magnitudeValue\":105.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-102.4,14.4]},{\"magnitudeValue\":75.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-102.4,14.6]},{\"magnitudeValue\":75.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-17T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-102.5,15.1]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-17T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-103.2,15.7]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-17T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-103.7,16.3]},{\"magnitudeValue\":85.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-17T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-105,17]},{\"magnitudeValue\":85.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-18T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-105.5,17.9]},{\"magnitudeValue\":90.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-18T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-106.1,18.4]},{\"magnitudeValue\":90.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-18T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-106.6,18.9]},{\"magnitudeValue\":85.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-18T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-106.9,19.3]},{\"magnitudeValue\":75.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-19T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-107.4,19.6]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-19T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-107.8,19.7]},{\"magnitudeValue\":50.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-19T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108.3,19.6]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-19T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-107.9,19.5]},{\"magnitudeValue\":30.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-20T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108,19.4]}]"
      },
      {
        "event_id": "EONET_25094",
        "title": "Hurricane Simon",
        "closed": "2026-10-21T00:00:00Z",
        "categories": "[{\"id\":\"severeStorms\",\"title\":\"Severe Storms\"}]",
        "geometry": "[{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-07T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-101.3,15.2]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-08T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-102.1,15.3]},{\"magnitudeValue\":45.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-08T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-102.7,15.4]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-08T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-103.1,15.4]},{\"magnitudeValue\":60.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-08T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-103.7,15.6]},{\"magnitudeValue\":65.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-09T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.3,15.7]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-09T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.4,15.7]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-09T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.5,15.9]},{\"magnitudeValue\":90.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-09T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.7,16]},{\"magnitudeValue\":105.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-10T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.6,16.6]},{\"magnitudeValue\":120.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-10T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.6,17]},{\"magnitudeValue\":130.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-10T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.8,17.3]},{\"magnitudeValue\":130.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-10T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.8,17.4]},{\"magnitudeValue\":130.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-11T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-104.8,18]},{\"magnitudeValue\":135.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-11T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-105,18.4]},{\"magnitudeValue\":130.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-11T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-105.2,18.9]},{\"magnitudeValue\":115.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-11T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-105.6,19.4]},{\"magnitudeValue\":105.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-12T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-105.8,19.7]},{\"magnitudeValue\":100.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-12T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-106.1,19.9]},{\"magnitudeValue\":95.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-12T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-106.4,20]},{\"magnitudeValue\":90.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-12T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-106.7,20]},{\"magnitudeValue\":85.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-13T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-106.9,20.3]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-13T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-107.1,20.5]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-13T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-107.2,20.3]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-13T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-107.4,20.2]},{\"magnitudeValue\":90.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-14T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-107.5,20.2]},{\"magnitudeValue\":90.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-14T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-107.7,20]},{\"magnitudeValue\":85.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-14T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108,19.8]},{\"magnitudeValue\":75.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-14T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108.3,19.5]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-15T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108.5,19.2]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-15T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108.5,19.2]},{\"magnitudeValue\":50.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-15T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108,19.2]},{\"magnitudeValue\":45.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-15T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108.2,19.2]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T00:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108.3,19.3]},{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T06:00:00Z\",\"type\":\"Point\",\"coordinates\":[-108.5,19.7]},{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T12:00:00Z\",\"type\":\"Point\",\"coordinates\":[-109.2,20.4]},{\"magnitudeValue\":30.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-16T18:00:00Z\",\"type\":\"Point\",\"coordinates\":[-110,21.3]}]"
      },
      {
        "event_id": "EONET_25063",
        "title": "Hurricane Isaias",
        "closed": "2026-10-16T00:00:00Z",
        "categories": "[{\"id\":\"severeStorms\",\"title\":\"Severe Storms\"}]",
        "geometry": "[{\"magnitudeValue\":35.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-07T09:00:00Z\",\"type\":\"Point\",\"coordinates\":[-94.1,22]},{\"magnitudeValue\":40.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-07T15:00:00Z\",\"type\":\"Point\",\"coordinates\":[-93.6,22.4]},{\"magnitudeValue\":55.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-07T21:00:00Z\",\"type\":\"Point\",\"coordinates\":[-92.9,22.7]},{\"magnitudeValue\":60.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-08T03:00:00Z\",\"type\":\"Point\",\"coordinates\":[-91.9,22.9]},{\"magnitudeValue\":70.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-08T09:00:00Z\",\"type\":\"Point\",\"coordinates\":[-91.2,23.3]},{\"magnitudeValue\":75.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-08T15:00:00Z\",\"type\":\"Point\",\"coordinates\":[-90.2,23.7]},{\"magnitudeValue\":85.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-08T21:00:00Z\",\"type\":\"Point\",\"coordinates\":[-89.3,24.4]},{\"magnitudeValue\":90.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-09T03:00:00Z\",\"type\":\"Point\",\"coordinates\":[-88.4,25.4]},{\"magnitudeValue\":95.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-09T09:00:00Z\",\"type\":\"Point\",\"coordinates\":[-88,26.4]},{\"magnitudeValue\":105.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-09T15:00:00Z\",\"type\":\"Point\",\"coordinates\":[-87.3,27.7]},{\"magnitudeValue\":100.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-09T21:00:00Z\",\"type\":\"Point\",\"coordinates\":[-87,29.2]},{\"magnitudeValue\":80.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-10T03:00:00Z\",\"type\":\"Point\",\"coordinates\":[-86.5,30.8]},{\"magnitudeValue\":30.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-10T09:00:00Z\",\"type\":\"Point\",\"coordinates\":[-86.5,32]},{\"magnitudeValue\":30.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-10T15:00:00Z\",\"type\":\"Point\",\"coordinates\":[-86.8,32.8]},{\"magnitudeValue\":25.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-10T21:00:00Z\",\"type\":\"Point\",\"coordinates\":[-86.9,33.5]},{\"magnitudeValue\":20.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-11T03:00:00Z\",\"type\":\"Point\",\"coordinates\":[-86.7,35]},{\"magnitudeValue\":20.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-11T09:00:00Z\",\"type\":\"Point\",\"coordinates\":[-85.9,35.4]},{\"magnitudeValue\":20.00,\"magnitudeUnit\":\"kts\",\"date\":\"2026-10-11T15:00:00Z\",\"type\":\"Point\",\"coordinates\":[-84,37.5]}]"
      }
    ],
    "preview_checked_at": "2026-10-29T15:09:40+00:00",
    "verified_rows": 20,
    "preview_scope": "실제 응답 20행 중 5행 표시",
    "preview_warnings": []
  }
];
