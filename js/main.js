// Main page script
import {
  getQuote,
  getCompanyProfile,
  getMarketNews,
  getExchangeRate,
  searchSymbol,
  formatCurrency,
  formatPercent,
  formatLargeNumber
} from './api.js';

// ============================================
// Theme Management
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
// Mobile Menu
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

    // Close menu when clicking nav link
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
// Market Status Bar
// ============================================
const MARKET_INDICES = [
  { symbol: 'DIA', name: '다우존스 ETF' },
  { symbol: 'QQQ', name: '나스닥100 ETF' },
  { symbol: 'SPY', name: 'S&P500 ETF' }
];

async function loadMarketStatus() {
  const container = document.getElementById('marketStatus');
  if (!container) return;

  try {
    // Load exchange rate
    const exchangeRate = await getExchangeRate();

    // Load market indices
    const statusItems = await Promise.all(
      MARKET_INDICES.map(async (index) => {
        try {
          const quote = await getQuote(index.symbol);
          const change = quote.c - quote.pc;
          const changePercent = (change / quote.pc) * 100;
          const isPositive = change >= 0;

          return `
            <div class="status-item">
              <div class="status-label">${index.name}</div>
              <div class="status-value ${isPositive ? 'positive' : 'negative'}">
                ${formatCurrency(quote.c)}
              </div>
              <div class="status-value ${isPositive ? 'positive' : 'negative'}" style="font-size: 0.875rem;">
                ${formatPercent(changePercent)}
              </div>
            </div>
          `;
        } catch (error) {
          return `
            <div class="status-item">
              <div class="status-label">${index.name}</div>
              <div class="status-value">-</div>
            </div>
          `;
        }
      })
    );

    // Add exchange rate
    statusItems.push(`
      <div class="status-item">
        <div class="status-label">USD/KRW</div>
        <div class="status-value">₩${formatLargeNumber(exchangeRate)}</div>
      </div>
    `);

    container.innerHTML = statusItems.join('');
  } catch (error) {
    console.error('Error loading market status:', error);
    container.innerHTML = `
      <div class="status-item">
        <div class="status-label">시장 정보를 불러올 수 없습니다</div>
      </div>
    `;
  }
}

// ============================================
// Search Function with Autocomplete
// ============================================
let searchTimeout = null;

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchDropdown = document.getElementById('searchDropdown');

  if (!searchInput || !searchBtn || !searchDropdown) return;

  const handleSearch = (symbol) => {
    if (symbol) {
      window.location.href = `detail.html?symbol=${symbol}`;
    }
  };

  // Search button click
  searchBtn.addEventListener('click', () => {
    const symbol = searchInput.value.trim().toUpperCase();
    handleSearch(symbol);
  });

  // Enter key press
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const symbol = searchInput.value.trim().toUpperCase();
      handleSearch(symbol);
    }
  });

  // Autocomplete on input
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Hide dropdown if query is empty or too short
    if (query.length < 1) {
      searchDropdown.classList.remove('active');
      searchDropdown.innerHTML = '';
      return;
    }

    // Debounce search
    searchTimeout = setTimeout(async () => {
      try {
        const results = await searchSymbol(query);

        // Filter for US stocks only and limit to 10 results
        const usStocks = results.result
          .filter(item => item.type === 'Common Stock' && item.symbol.indexOf('.') === -1)
          .slice(0, 10);

        if (usStocks.length === 0) {
          searchDropdown.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: var(--text-secondary);">
              검색 결과가 없습니다
            </div>
          `;
          searchDropdown.classList.add('active');
          return;
        }

        searchDropdown.innerHTML = usStocks.map(item => `
          <div class="search-dropdown-item" data-symbol="${item.symbol}">
            <span class="search-dropdown-symbol">${item.symbol}</span>
            <span class="search-dropdown-name">${item.description}</span>
            <span class="search-dropdown-type">${item.type}</span>
          </div>
        `).join('');

        searchDropdown.classList.add('active');

        // Add click handlers to dropdown items
        document.querySelectorAll('.search-dropdown-item').forEach(item => {
          item.addEventListener('click', () => {
            const symbol = item.dataset.symbol;
            searchInput.value = symbol;
            searchDropdown.classList.remove('active');
            handleSearch(symbol);
          });
        });
      } catch (error) {
        console.error('Error searching symbols:', error);
        searchDropdown.classList.remove('active');
      }
    }, 300); // 300ms debounce
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.remove('active');
    }
  });
}

// ============================================
// News Feed
// ============================================
async function loadNewsFeed() {
  const container = document.getElementById('newsFeed');
  if (!container) return;

  try {
    const news = await getMarketNews('general');
    const limitedNews = news.slice(0, 10);

    if (limitedNews.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-text">표시할 뉴스가 없습니다</p>
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
    console.error('Error loading news:', error);
    container.innerHTML = `
      <div class="error-message">
        뉴스를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </div>
    `;
  }
}

// ============================================
// Watchlist Preview
// ============================================
async function loadWatchlistPreview() {
  const container = document.getElementById('watchlistPreview');
  if (!container) return;

  try {
    const watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

    if (watchlist.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⭐</div>
          <p class="empty-state-text">저장된 종목이 없습니다</p>
        </div>
      `;
      return;
    }

    // Show up to 5 stocks
    const limitedWatchlist = watchlist.slice(0, 5);

    const items = await Promise.all(
      limitedWatchlist.map(async (symbol) => {
        try {
          const [quote, profile] = await Promise.all([
            getQuote(symbol),
            getCompanyProfile(symbol)
          ]);

          const change = quote.c - quote.pc;
          const changePercent = (change / quote.pc) * 100;
          const isPositive = change >= 0;

          return `
            <div class="watchlist-item" onclick="window.location.href='detail.html?symbol=${symbol}'">
              <div class="watchlist-item-info">
                <div class="watchlist-symbol">${symbol}</div>
                <div class="watchlist-name">${profile.name || symbol}</div>
              </div>
              <div class="watchlist-price">
                <div class="watchlist-value">${formatCurrency(quote.c)}</div>
                <div class="watchlist-change ${isPositive ? 'positive' : 'negative'}">
                  ${formatPercent(changePercent)}
                </div>
              </div>
            </div>
          `;
        } catch (error) {
          return `
            <div class="watchlist-item">
              <div class="watchlist-item-info">
                <div class="watchlist-symbol">${symbol}</div>
                <div class="watchlist-name">데이터 로드 실패</div>
              </div>
            </div>
          `;
        }
      })
    );

    container.innerHTML = items.join('');
  } catch (error) {
    console.error('Error loading watchlist preview:', error);
    container.innerHTML = `
      <div class="error-message">
        관심종목을 불러오는 중 오류가 발생했습니다.
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
  initSearch();

  // Load data in parallel
  await Promise.all([
    loadMarketStatus(),
    loadNewsFeed(),
    loadWatchlistPreview()
  ]);
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
