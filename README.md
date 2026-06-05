# 주식 입문자를 위한 종목 리서치 대시보드

종목을 검색하면 실시간 주가, 핵심 재무 지표, 관련 뉴스, 기업 개요를 한 화면에서 확인할 수 있는 주식 입문자용 리서치 대시보드 웹사이트입니다.

## 프로젝트 정보

- **과목**: 웹 프로그래밍
- **개발 기간**: 2025년 6월 4일 ~ 6월 7일
- **제출 마감**: 2025년 6월 8일
- **기술 스택**: HTML, CSS, Vanilla JavaScript (프레임워크 없음)

## 주요 기능

### 1. 홈 (index.html)
- 종목 검색 기능
- 실시간 시장 현황 바 (다우, 나스닥, S&P 500, USD/KRW 환율)
- 최신 시장 뉴스 피드 (최대 10건)
- 관심종목 미리보기

### 2. 종목 상세 (detail.html)
- 종목 정보 헤더 (기업명, 현재가, 등락률, 원화 환산)
- 관심종목 추가/제거 버튼
- 핵심 재무 지표 (전일종가, 시가, 고가, 저가, 52주 범위, 시총, PER, EPS 등)
- 기업 정보 (업종, 국가, 상장일, 웹사이트 등)
- 관련 뉴스 (최근 7일)

### 3. 관심종목 (watchlist.html)
- 저장된 종목 목록 관리
- 실시간 현재가 및 등락률 표시
- 개별 종목 삭제 및 전체 삭제 기능

### 4. 뉴스 (news.html)
- 카테고리별 뉴스 필터 (전체, 기술, 금융, 에너지, 헬스케어)
- 최대 20건의 뉴스 표시
- 관심종목 현황 사이드바

### 5. 공통 기능
- 다크모드 지원 (localStorage 저장)
- 모바일 반응형 디자인
- 햄버거 메뉴 (768px 이하)
- 에러 처리 및 로딩 상태 표시

## 사용 API

| API | 용도 | 웹사이트 |
|-----|------|----------|
| Finnhub | 종목 검색, 실시간 주가, 재무지표, 뉴스, 기업정보 | https://finnhub.io |
| ExchangeRate API | USD → KRW 환율 변환 | https://www.exchangerate-api.com |

## 설치 및 실행

### 1. API 키 설정

`js/config.js` 파일에 API 키가 이미 설정되어 있습니다:

```javascript
const FINNHUB_KEY = 'your-finnhub-api-key';
const EXCHANGE_KEY = 'your-exchange-api-key';
```

### 2. 로컬 서버 실행

이 프로젝트는 ES6 모듈을 사용하므로 로컬 서버가 필요합니다.

#### 방법 1: Python (권장)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 방법 2: Node.js
```bash
# npx 사용 (Node.js 설치 필요)
npx http-server

# 또는 live-server
npx live-server
```

#### 방법 3: VS Code Live Server
1. VS Code에서 "Live Server" 확장 프로그램 설치
2. `index.html` 우클릭 → "Open with Live Server"

### 3. 브라우저에서 접속

```
http://localhost:8000
```

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
│   ├── api.js          # Finnhub / ExchangeRate API 호출 함수
│   ├── main.js         # index.html 전용 JS
│   ├── detail.js       # detail.html 전용 JS
│   ├── watchlist.js    # watchlist.html 전용 JS
│   └── news.js         # news.html 전용 JS
├── .gitignore
├── README.md
└── CLAUDE.md           # 프로젝트 명세
```

## 기술 특징

### CSS
- CSS 변수를 사용한 테마 시스템 (라이트/다크 모드)
- CSS Grid를 활용한 2단 레이아웃
- Flexbox를 사용한 컴포넌트 정렬
- 반응형 디자인 (768px, 1024px 분기점)
- 부드러운 전환 애니메이션

### JavaScript
- ES6 모듈 시스템
- async/await 패턴
- try/catch 에러 처리
- localStorage를 사용한 데이터 저장
- 재사용 가능한 유틸리티 함수

### 반응형 디자인
- **Desktop (1024px+)**: 2단 레이아웃 (메인 + 사이드바)
- **Tablet (768px ~ 1024px)**: 1단 레이아웃 (사이드바 상단 이동)
- **Mobile (~ 768px)**: 햄버거 메뉴, 세로 스크롤

## 사용 방법

### 종목 검색
1. 홈 화면에서 검색창에 종목 코드 입력 (예: AAPL, TSLA, MSFT)
2. 검색 버튼 클릭 또는 Enter 키
3. 종목 상세 페이지로 이동

### 관심종목 추가
1. 종목 상세 페이지에서 "관심종목 추가" 버튼 클릭
2. localStorage에 자동 저장
3. 관심종목 페이지에서 확인 가능

### 다크모드 전환
- 우측 상단 🌙/☀️ 버튼 클릭
- 설정이 localStorage에 저장되어 다음 방문 시에도 유지

## 주의사항

- `js/config.js` 파일은 `.gitignore`에 포함되어 있습니다
- API 무료 티어 제한:
  - Finnhub: 분당 60회
  - ExchangeRate: 월 1,500회
- 미국 주식 한정 (한국 주식 미지원)
- ES6 모듈 사용으로 로컬 서버 필수

## 브라우저 지원

- Chrome (권장)
- Firefox
- Safari
- Edge

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.

## 개발자

웹 프로그래밍 과제 - 2025
