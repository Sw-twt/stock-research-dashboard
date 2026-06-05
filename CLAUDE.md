# 주식 입문자를 위한 종목 리서치 대시보드

## 프로젝트 개요
종목을 검색하면 실시간 주가, 핵심 재무 지표, 관련 뉴스, 기업 개요를 한 화면에서 확인할 수 있는 주식 입문자용 리서치 대시보드 웹사이트.

- **과목**: 웹 프로그래밍
- **개발 기간**: 2025년 6월 4일 ~ 6월 7일
- **제출 마감**: 2025년 6월 8일
- **기술 스택**: HTML, CSS, Vanilla JS (프레임워크 없음)

---

## 사용 API

| API | 용도 | 비고 |
|-----|------|------|
| [Finnhub](https://finnhub.io/docs/api) | 종목 검색, 실시간 주가, 재무지표, 뉴스, 기업정보 | 메인 API |
| [ExchangeRate API](https://www.exchangerate-api.com/) | USD → KRW 환율 변환 | 보조 API |

> API 키는 `.env` 또는 `js/config.js` 파일에 별도 관리 (git에 올리지 말 것)

---

## 폴더 구조

```
stock-research-dashboard/
├── index.html          # 홈 (시장 현황 + 뉴스 피드)
├── detail.html         # 종목 상세 (주가 + 재무지표 + 뉴스)
├── watchlist.html      # 관심 종목 (localStorage 저장 목록)
├── news.html           # 뉴스 (시장 전반 뉴스 피드)
├── css/
│   ├── reset.css       # 브라우저 기본 스타일 초기화
│   └── style.css       # 전체 스타일 (CSS 변수, 레이아웃, 다크모드)
├── js/
│   ├── config.js       # API 키 관리 (git ignore)
│   ├── api.js          # Finnhub / ExchangeRate API 호출 함수 모음
│   ├── main.js         # index.html 전용 JS
│   ├── detail.js       # detail.html 전용 JS
│   ├── watchlist.js    # watchlist.html 전용 JS
│   └── news.js         # news.html 전용 JS
├── .gitignore
├── README.md
└── CLAUDE.md           # 이 파일
```

---

## 페이지별 기능 명세

### 1. 홈 (index.html)
- 상단 검색창 → 종목 코드/기업명 입력 시 detail.html로 이동
- 시장 현황 바: 다우(DJI), 나스닥(IXIC), S&P500(SPX) 지수 + 원/달러 환율
- 메인 영역 (2단 레이아웃)
  - 좌: 최신 시장 뉴스 목록 (Finnhub Market News API, 최대 10건)
  - 우: 관심 종목 미리보기 (localStorage에서 불러와 현재가 표시)

### 2. 종목 상세 (detail.html)
- URL 파라미터로 종목 코드 전달: `detail.html?symbol=AAPL`
- 종목 헤더: 기업명, 종목 코드, 현재가, 등락률, 원화 환산
- 탭 메뉴: [요약] [뉴스] 전환
- 2단 레이아웃
  - 좌: 핵심 재무 지표 테이블 (전일종가, 시가, 고가, 저가, 거래량, 시총, 52주 범위, PER, EPS) + 기업 정보 (업종, 국가, CEO, 상장일, 웹사이트)
  - 우: 관련 뉴스 (Finnhub Company News API, 최대 5건)
- 관심 종목 저장/해제 버튼 (★)

### 3. 관심 종목 (watchlist.html)
- localStorage에서 저장된 종목 코드 목록 불러오기
- 테이블 형태: 종목코드 / 기업명 / 현재가 / 등락률 / 시총 / 삭제버튼
- 상승(초록), 하락(빨강) 색상 표시
- 전체 삭제 버튼
- 빈 상태 UI: "저장된 종목이 없습니다. 홈에서 검색해보세요."

### 4. 뉴스 (news.html)
- 카테고리 탭 필터: 전체 / 기술 / 금융 / 에너지 / 헬스케어
- 뉴스 카드: 썸네일 + 제목 + 출처 + 날짜 + 요약
- 우측 사이드바: 관심 종목 등락률 표시
- 최대 20건 표시, 클릭 시 원문 새 탭 이동

---

## 공통 기능

| 기능 | 구현 방법 |
|------|----------|
| 다크모드 | `body[data-theme="dark"]` 토글 + CSS 변수 전환 + localStorage 저장 |
| 모바일 메뉴 | 768px 이하에서 햄버거 버튼 표시, classList.toggle |
| 관심종목 저장 | `localStorage.setItem/getItem/removeItem`, JSON 배열로 관리 |
| 에러 처리 | try/catch, API 실패 시 사용자 안내 메시지 렌더링 |

---

## CSS 설계

```css
/* CSS 변수 구조 */
:root {
  --primary: #1F3864;
  --accent: #6001D2;
  --bg: #F4F6F9;
  --card-bg: #FFFFFF;
  --text: #333333;
  --border: #E0E0E0;
  --positive: #26A69A;
  --negative: #EF5350;
}

[data-theme="dark"] {
  --bg: #1A1A2E;
  --card-bg: #16213E;
  --text: #E0E0E0;
  --border: #2A2A4A;
}
```

- CSS Grid로 메인(좌) + 사이드바(우) 2단 레이아웃
- Flexbox로 헤더, 현황 바, 카드 내부 정렬
- 미디어 쿼리 분기점: 768px (모바일), 1024px (태블릿)

---

## JS 설계 원칙

- 프레임워크 없이 Vanilla JS만 사용
- 모든 API 호출은 `js/api.js`에서 함수로 관리
- async/await + try/catch 패턴 통일
- 페이지별 JS 파일 분리 (main.js, detail.js, watchlist.js, news.js)

```js
// api.js 구조 예시
const API_KEY = config.FINNHUB_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export async function getQuote(symbol) { ... }
export async function getCompanyProfile(symbol) { ... }
export async function getCompanyNews(symbol) { ... }
export async function getMarketNews(category) { ... }
export async function getExchangeRate() { ... }
```

---

## 개발 일정

| 일자 | 작업 내용 |
|------|----------|
| 6/4 (오늘) | HTML 4개 페이지 골격, 공통 헤더/푸터/네비, CSS 변수 세팅 |
| 6/5 | Finnhub 종목 검색·Quote·Company Profile API 연동, 재무지표 테이블 렌더링, 환율 API |
| 6/6 | 시장 현황 바, 뉴스 피드 (전체), localStorage 관심종목 저장/삭제/토글 |
| 6/7 | 다크모드, 모바일 메뉴, 반응형 점검, 빈 상태/에러 처리, 코드 정리 |

---

## 커밋 컨벤션

```
feat: 새 기능 추가
style: CSS/UI 작업
fix: 버그 수정
refactor: 코드 정리
```

예시:
```
feat: Finnhub Quote API 연동 및 종목 카드 렌더링
style: 다크모드 CSS 변수 적용
feat: localStorage 관심종목 저장/삭제 구현
```

---

## 주의사항

- `js/config.js`는 반드시 `.gitignore`에 추가할 것
- API 무료 티어 제한: Finnhub 분당 60회, ExchangeRate 월 1,500회
- 미국 주식 한정 (한국 주식 미지원)
