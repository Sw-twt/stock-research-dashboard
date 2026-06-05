// Watchlist page script
import {
  getQuote,
  getCompanyProfile,
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
// Watchlist Management
// ============================================
function getWatchlist() {
  return JSON.parse(localStorage.getItem('watchlist') || '[]');
}

function removeFromWatchlist(symbol) {
  const watchlist = getWatchlist();
  const filtered = watchlist.filter(s => s !== symbol);
  localStorage.setItem('watchlist', JSON.stringify(filtered));
}

function clearWatchlist() {
  if (confirm('모든 관심종목을 삭제하시겠습니까?')) {
    localStorage.setItem('watchlist', JSON.stringify([]));
    loadWatchlist();
  }
}

// ============================================
// Load Watchlist
// ============================================
async function loadWatchlist() {
  const container = document.getElementById('watchlistContent');
  if (!container) return;

  try {
    const watchlist = getWatchlist();

    if (watchlist.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⭐</div>
          <h3 class="empty-state-title">저장된 종목이 없습니다</h3>
          <p class="empty-state-text">홈에서 종목을 검색하고 관심종목에 추가해보세요.</p>
          <a href="index.html" class="btn" style="margin-top: 1rem;">홈으로 가기</a>
        </div>
      `;
      return;
    }

    // Show loading
    container.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>관심종목을 불러오는 중...</p>
      </div>
    `;

    // Load data for all symbols
    const stockData = await Promise.all(
      watchlist.map(async (symbol) => {
        try {
          const [quote, profile] = await Promise.all([
            getQuote(symbol),
            getCompanyProfile(symbol)
          ]);

          const change = quote.c - quote.pc;
          const changePercent = (change / quote.pc) * 100;
          const isPositive = change >= 0;

          return {
            symbol,
            name: profile.name || symbol,
            price: quote.c,
            change: changePercent,
            isPositive,
            marketCap: profile.marketCapitalization || 0
          };
        } catch (error) {
          console.error(`Error loading ${symbol}:`, error);
          return {
            symbol,
            name: symbol,
            price: null,
            change: null,
            isPositive: false,
            marketCap: 0,
            error: true
          };
        }
      })
    );

    // Render table
    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>종목코드</th>
            <th>기업명</th>
            <th>현재가</th>
            <th>등락률</th>
            <th>시가총액</th>
            <th style="text-align: center;">관리</th>
          </tr>
        </thead>
        <tbody>
          ${stockData.map(stock => {
            if (stock.error) {
              return `
                <tr>
                  <td><strong>${stock.symbol}</strong></td>
                  <td colspan="4">데이터 로드 실패</td>
                  <td style="text-align: center;">
                    <button class="btn btn-danger btn-small" onclick="window.removeStock('${stock.symbol}')">삭제</button>
                  </td>
                </tr>
              `;
            }

            return `
              <tr style="cursor: pointer;" onclick="window.location.href='detail.html?symbol=${stock.symbol}'">
                <td><strong>${stock.symbol}</strong></td>
                <td>${stock.name}</td>
                <td>${formatCurrency(stock.price)}</td>
                <td class="${stock.isPositive ? 'positive' : 'negative'}">
                  ${formatPercent(stock.change)}
                </td>
                <td>$${formatLargeNumber(stock.marketCap * 1e6)}</td>
                <td style="text-align: center;" onclick="event.stopPropagation();">
                  <button class="btn btn-danger btn-small" onclick="window.removeStock('${stock.symbol}')">삭제</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error loading watchlist:', error);
    container.innerHTML = `
      <div class="error-message">
        관심종목을 불러오는 중 오류가 발생했습니다.
      </div>
    `;
  }
}

// ============================================
// Global Functions (for inline event handlers)
// ============================================
window.removeStock = function(symbol) {
  removeFromWatchlist(symbol);
  loadWatchlist();
};

// ============================================
// Initialize Page
// ============================================
async function init() {
  initTheme();
  initMobileMenu();

  // Clear all button
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearWatchlist);
  }

  await loadWatchlist();
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
