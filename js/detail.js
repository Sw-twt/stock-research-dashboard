// Detail page script
import {
  getQuote,
  getCompanyProfile,
  getCompanyNews,
  getBasicFinancials,
  getExchangeRate,
  formatCurrency,
  formatPercent,
  formatNumber,
  formatLargeNumber,
  getNewsDateRange
} from './api.js';

// ============================================
// Theme Management (same as main.js)
// ============================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// ============================================
// Mobile Menu (same as main.js)
// ============================================
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');
  const mobileOverlay = document.getElementById('mobileOverlay');

  if (mobileMenuBtn && mainNav && mobileOverlay) {
    mobileMenuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      mobileOverlay.classList.toggle('active');
    });

    mobileOverlay.addEventListener('click', () => {
      mainNav.classList.remove('active');
      mobileOverlay.classList.remove('active');
    });

    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        mobileOverlay.classList.remove('active');
      });
    });
  }
}

// ============================================
// Tab Management
// ============================================
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.querySelector(`[data-content="${targetTab}"]`).classList.add('active');
    });
  });
}

// ============================================
// URL Parameters
// ============================================
function getSymbolFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('symbol');
}

// ============================================
// Watchlist Management
// ============================================
function isInWatchlist(symbol) {
  const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
  return watchlist.includes(symbol);
}

function toggleWatchlist(symbol) {
  const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');
  const index = watchlist.indexOf(symbol);

  if (index > -1) {
    watchlist.splice(index, 1);
  } else {
    watchlist.push(symbol);
  }

  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  return isInWatchlist(symbol);
}

// ============================================
// Stock Header
// ============================================
async function loadStockHeader(symbol) {
  const container = document.getElementById('stockHeader');
  if (!container) return;

  try {
    const [quote, profile, exchangeRate] = await Promise.all([
      getQuote(symbol),
      getCompanyProfile(symbol),
      getExchangeRate()
    ]);

    const change = quote.c - quote.pc;
    const changePercent = (change / quote.pc) * 100;
    const isPositive = change >= 0;
    const krwPrice = quote.c * exchangeRate;

    const inWatchlist = isInWatchlist(symbol);

    container.innerHTML = `
      <div class="stock-header-content">
        <div class="stock-info">
          <h1>${profile.name || symbol}</h1>
          <div class="stock-symbol">${symbol} · ${profile.exchange || 'N/A'}</div>
        </div>
        <div class="stock-price">
          <div class="current-price">${formatCurrency(quote.c)}</div>
          <div class="price-change ${isPositive ? 'positive' : 'negative'}">
            ${formatPercent(changePercent)} (${isPositive ? '+' : ''}${formatCurrency(change)})
          </div>
          <div style="opacity: 0.9; margin-top: 0.5rem;">
            ₩${formatNumber(krwPrice.toFixed(0))}
          </div>
        </div>
        <div>
          <button class="watchlist-btn ${inWatchlist ? 'active' : ''}" id="watchlistBtn">
            ${inWatchlist ? '★' : '☆'} ${inWatchlist ? '관심종목에서 제거' : '관심종목 추가'}
          </button>
        </div>
      </div>
    `;

    // Add watchlist button event listener
    const watchlistBtn = document.getElementById('watchlistBtn');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', () => {
        const isNowInWatchlist = toggleWatchlist(symbol);
        watchlistBtn.classList.toggle('active', isNowInWatchlist);
        watchlistBtn.innerHTML = isNowInWatchlist
          ? '★ 관심종목에서 제거'
          : '☆ 관심종목 추가';
      });
    }
  } catch (error) {
    console.error('Error loading stock header:', error);
    container.innerHTML = `
      <div class="error-message">
        종목 정보를 불러오는 중 오류가 발생했습니다. 종목 코드를 확인해주세요.
      </div>
    `;
  }
}

// ============================================
// Metrics Table
// ============================================
async function loadMetrics(symbol) {
  const container = document.getElementById('metricsTable');
  if (!container) return;

  try {
    const [quote, metrics] = await Promise.all([
      getQuote(symbol),
      getBasicFinancials(symbol)
    ]);

    const metricData = metrics.metric || {};

    container.innerHTML = `
      <table class="data-table">
        <tbody>
          <tr>
            <th>전일 종가</th>
            <td>${formatCurrency(quote.pc)}</td>
            <th>시가</th>
            <td>${formatCurrency(quote.o)}</td>
          </tr>
          <tr>
            <th>고가</th>
            <td class="positive">${formatCurrency(quote.h)}</td>
            <th>저가</th>
            <td class="negative">${formatCurrency(quote.l)}</td>
          </tr>
          <tr>
            <th>52주 고가</th>
            <td>${formatCurrency(metricData['52WeekHigh'] || '-')}</td>
            <th>52주 저가</th>
            <td>${formatCurrency(metricData['52WeekLow'] || '-')}</td>
          </tr>
          <tr>
            <th>시가총액</th>
            <td colspan="3">$${formatLargeNumber(metricData.marketCapitalization * 1e6 || 0)}</td>
          </tr>
          <tr>
            <th>PER (주가수익비율)</th>
            <td>${metricData.peBasicExclExtraTTM?.toFixed(2) || '-'}</td>
            <th>EPS (주당순이익)</th>
            <td>${formatCurrency(metricData.epsBasicExclExtraItemsAnnual || 0)}</td>
          </tr>
          <tr>
            <th>베타</th>
            <td>${metricData.beta?.toFixed(2) || '-'}</td>
            <th>배당수익률</th>
            <td>${metricData.currentDividendYieldTTM?.toFixed(2) || '-'}%</td>
          </tr>
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error loading metrics:', error);
    container.innerHTML = `
      <div class="error-message">
        재무 지표를 불러오는 중 오류가 발생했습니다.
      </div>
    `;
  }
}

// ============================================
// Company Info
// ============================================
async function loadCompanyInfo(symbol) {
  const container = document.getElementById('companyInfo');
  if (!container) return;

  try {
    const profile = await getCompanyProfile(symbol);

    const ipoDate = profile.ipo ? new Date(profile.ipo).toLocaleDateString('ko-KR') : '-';

    container.innerHTML = `
      <table class="data-table">
        <tbody>
          <tr>
            <th>업종</th>
            <td>${profile.finnhubIndustry || '-'}</td>
          </tr>
          <tr>
            <th>국가</th>
            <td>${profile.country || '-'}</td>
          </tr>
          <tr>
            <th>통화</th>
            <td>${profile.currency || 'USD'}</td>
          </tr>
          <tr>
            <th>상장일</th>
            <td>${ipoDate}</td>
          </tr>
          <tr>
            <th>웹사이트</th>
            <td>
              ${profile.weburl ? `<a href="${profile.weburl}" target="_blank" style="color: var(--accent)">${profile.weburl}</a>` : '-'}
            </td>
          </tr>
          <tr>
            <th>시가총액</th>
            <td>$${formatLargeNumber(profile.marketCapitalization * 1e6 || 0)}</td>
          </tr>
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error loading company info:', error);
    container.innerHTML = `
      <div class="error-message">
        기업 정보를 불러오는 중 오류가 발생했습니다.
      </div>
    `;
  }
}

// ============================================
// Company News
// ============================================
async function loadCompanyNews(symbol) {
  const container = document.getElementById('companyNews');
  if (!container) return;

  try {
    const { from, to } = getNewsDateRange();
    const news = await getCompanyNews(symbol, from, to);
    const limitedNews = news.slice(0, 10);

    if (limitedNews.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">관련 뉴스가 없습니다</p>
        </div>
      `;
      return;
    }

    container.innerHTML = limitedNews.map(article => {
      const date = new Date(article.datetime * 1000);
      const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="news-item" onclick="window.open('${article.url}', '_blank')">
          ${article.image ? `
            <img src="${article.image}" alt="${article.headline}" class="news-image" onerror="this.classList.add('error')">
          ` : ''}
          <div class="news-content">
            <h3 class="news-title">${article.headline}</h3>
            <div class="news-meta">
              <span>${article.source}</span>
              <span>${formattedDate}</span>
            </div>
            <p class="news-summary">${article.summary || '요약 정보가 없습니다.'}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading company news:', error);
    container.innerHTML = `
      <div class="error-message">
        뉴스를 불러오는 중 오류가 발생했습니다.
      </div>
    `;
  }
}

// ============================================
// Company News Sidebar (최대 5건)
// ============================================
async function loadCompanyNewsSidebar(symbol) {
  const container = document.getElementById('companyNewsSidebar');
  if (!container) return;

  try {
    const { from, to } = getNewsDateRange();
    const news = await getCompanyNews(symbol, from, to);
    const limitedNews = news.slice(0, 5);

    if (limitedNews.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">관련 뉴스가 없습니다</p>
        </div>
      `;
      return;
    }

    container.innerHTML = limitedNews.map(article => {
      const date = new Date(article.datetime * 1000);
      const formattedDate = date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });

      return `
        <div class="news-item" onclick="window.open('${article.url}', '_blank')" style="cursor: pointer;">
          ${article.image ? `
            <img src="${article.image}" alt="${article.headline}" class="news-image" onerror="this.classList.add('error')">
          ` : ''}
          <div class="news-content">
            <h4 class="news-title" style="font-size: 1rem;">${article.headline}</h4>
            <div class="news-meta">
              <span style="font-size: 0.75rem;">${article.source}</span>
              <span style="font-size: 0.75rem;">${formattedDate}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading company news sidebar:', error);
    container.innerHTML = `
      <div class="error-message" style="font-size: 0.875rem; padding: 1rem;">
        뉴스를 불러오는 중 오류가 발생했습니다.
      </div>
    `;
  }
}

// ============================================
// Initialize Page
// ============================================
async function init() {
  initTheme();
  initMobileMenu();
  initTabs();

  const symbol = getSymbolFromURL();

  if (!symbol) {
    const stockHeader = document.getElementById('stockHeader');
    if (stockHeader) {
      stockHeader.innerHTML = `
        <div class="error-message">
          종목 코드가 지정되지 않았습니다. <a href="index.html" style="color: var(--accent)">홈으로 돌아가기</a>
        </div>
      `;
    }
    return;
  }

  // Load all data
  await Promise.all([
    loadStockHeader(symbol),
    loadMetrics(symbol),
    loadCompanyInfo(symbol),
    loadCompanyNews(symbol),
    loadCompanyNewsSidebar(symbol)
  ]);
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
