// API Configuration
import { FINNHUB_KEY, EXCHANGE_KEY } from './config.js';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const EXCHANGE_BASE_URL = 'https://v6.exchangerate-api.com/v6';

// ============================================
// Finnhub API Functions
// ============================================

/**
 * Get real-time quote for a symbol
 * @param {string} symbol - Stock symbol (e.g., 'AAPL')
 * @returns {Promise<Object>} Quote data
 */
export async function getQuote(symbol) {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote: ${response.status}`);
    }

    const data = await response.json();

    // Check if data is valid
    if (data.c === 0 && data.h === 0 && data.l === 0) {
      throw new Error('Invalid symbol or no data available');
    }

    return data;
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
}

/**
 * Get company profile
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Company profile data
 */
export async function getCompanyProfile(symbol) {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch company profile: ${response.status}`);
    }

    const data = await response.json();

    // Check if company exists
    if (!data || Object.keys(data).length === 0) {
      throw new Error('Company not found');
    }

    return data;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
}

/**
 * Get company news
 * @param {string} symbol - Stock symbol
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} News articles
 */
export async function getCompanyNews(symbol, from, to) {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch company news: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching company news:', error);
    throw error;
  }
}

/**
 * Get market news
 * @param {string} category - News category (general, tech, finance, etc.)
 * @returns {Promise<Array>} Market news articles
 */
export async function getMarketNews(category = 'general') {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/news?category=${category}&token=${FINNHUB_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch market news: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    throw error;
  }
}

/**
 * Get basic financials (metrics)
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Financial metrics
 */
export async function getBasicFinancials(symbol) {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch financials: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching financials:', error);
    throw error;
  }
}

/**
 * Search for stock symbols
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export async function searchSymbol(query) {
  try {
    const response = await fetch(
      `${FINNHUB_BASE_URL}/search?q=${query}&token=${FINNHUB_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to search symbol: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching symbol:', error);
    throw error;
  }
}

// ============================================
// ExchangeRate API Functions
// ============================================

/**
 * Get USD to KRW exchange rate
 * @returns {Promise<number>} Exchange rate
 */
export async function getExchangeRate() {
  try {
    const response = await fetch(
      `${EXCHANGE_BASE_URL}/${EXCHANGE_KEY}/latest/USD`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error('Failed to get exchange rate');
    }

    return data.conversion_rates.KRW;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Return fallback rate if API fails
    return 1300;
  }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date range for news (last 7 days)
 * @returns {Object} { from, to }
 */
export function getNewsDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);

  return {
    from: formatDate(from),
    to: formatDate(to)
  };
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '-';
  return num.toLocaleString('en-US');
}

/**
 * Format large numbers (K, M, B, T)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatLargeNumber(num) {
  if (num === null || num === undefined) return '-';

  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';

  return num.toFixed(2);
}

/**
 * Format currency to USD
 * @param {number} value - Value to format
 * @returns {string} Formatted currency
 */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '-';
  return '$' + value.toFixed(2);
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @returns {string} Formatted percentage
 */
export function formatPercent(value) {
  if (value === null || value === undefined) return '-';
  const sign = value >= 0 ? '+' : '';
  return sign + value.toFixed(2) + '%';
}
