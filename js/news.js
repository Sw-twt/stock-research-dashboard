// News page script
import {
  getMarketNews,
  getQuote,
  getCompanyProfile,
  formatCurrency,
  formatPercent
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
// Category Filter
// ============================================
let currentCategory = 'general';

function initCategoryFilter() {
  const categoryBtns = document.querySelectorAll('.category-btn');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;

      // Update active state
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Load news for selected category
      currentCategory = category;
      loadNews(category);
    });
  });
}

// ============================================
// Load News
// ============================================
async function loadNews(category = 'general') {
  const container = document.getElementById('newsList');
  if (!container) return;

  try {
    container.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>뉴스를 불러오는 중...</p>
      </div>
    `;

    const news = await getMarketNews(category);
    const limitedNews = news.slice(0, 20);

    if (limitedNews.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📰</div>
          <h3 class="empty-state-title">표시할 뉴스가 없습니다</h3>
          <p class="empty-state-text">다른 카테고리를 선택해보세요.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = limitedNews.map(article => {
      const date = new Date(article.datetime * 1000);
      const formattedDate = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="news-item" onclick="window.open('${article.url}', '_blank')">
          ${article.image ? `
            <img src="${article.image}" alt="${article.headline}" class="news-image" onerror="this.classList.add('error')">
          ` : ''}
          <div class="news-content">
            <h3 class="news-title">${article.headline}</h3>
            <div class="news-meta">
              <span>📰 ${article.source}</span>
              <span>🕒 ${formattedDate}</span>
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
// Watchlist Sidebar
// ============================================
async function loadWatchlistSidebar() {
  const container = document.getElementById('watchlistSidebar');
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

    // Show up to 10 stocks
    const limitedWatchlist = watchlist.slice(0, 10);

    container.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
      </div>
    `;

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
    console.error('Error loading watchlist sidebar:', error);
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
  initCategoryFilter();

  // Load data in parallel
  await Promise.all([
    loadNews('general'),
    loadWatchlistSidebar()
  ]);
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
