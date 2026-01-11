// Global Configuration for Finance Blog Frontend
var CONFIG = {
    // API Configuration
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : '/api',
    
    // Pagination
    POSTS_PER_PAGE: 9,
    
    // Search
    SEARCH_DEBOUNCE_MS: 300,
    
    // Categories
    CATEGORIES: [
        { name: 'Saving Tips', icon: '', slug: 'saving-tips' },
        { name: 'Investing', icon: '', slug: 'investing' },
        { name: 'Budgeting', icon: '', slug: 'budgeting' },
        { name: 'Retirement', icon: '', slug: 'retirement' },
        { name: 'Credit Cards', icon: '', slug: 'credit-cards' },
        { name: 'Money Management', icon: '', slug: 'money-management' }
    ],
    
    // Authentication
    TOKEN_KEY: 'token',
    USER_KEY: 'user',
    
    // Site Info
    SITE_NAME: 'Smart Money Guide',
    SITE_DESCRIPTION: 'Your trusted resource for personal finance tips and money management',
    SITE_URL: window.location.origin,
    
    // DOM Selectors (extract hardcodes)
    SELECTORS: {
        BLOG_GRID: '.blog-grid',
        PAGINATION: '.pagination',
        CATEGORY_BTN: '.category-btn',
        SEARCH_INPUT: '#search-input',
        SEARCH_BTN: '#search-btn'
    },
    
    // Cache Settings
    CACHE: {
        KEY: 'posts_cache_v1',
        TTL_MS: 30 * 1000  // 30 seconds
    },
    
    // API Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
        
        // Posts
        POSTS: '/posts',
        POST_BY_SLUG: (slug) => `/posts/${slug}`,
        POST_BY_ID: (id) => `/posts/${id}`,
        
        // Categories
        CATEGORIES: '/categories',
        
        // Contact
        CONTACT: '/contact',
        
        // Admin
        ADMIN_STATS: '/admin/stats',
        ADMIN_POSTS: '/admin/posts'
    }
};

// Helper function to get full API URL
function getApiUrl(endpoint) {
    return CONFIG.API_BASE_URL + endpoint;
}

// Helper function for authenticated requests
async function authFetch(url, options = {}) {
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(getApiUrl(url), mergedOptions);
        const data = await response.json();
        
        // Handle unauthorized
        if (response.status === 401) {
            localStorage.removeItem(CONFIG.TOKEN_KEY);
            localStorage.removeItem(CONFIG.USER_KEY);
            if (window.location.pathname.includes('admin')) {
                window.location.href = '/admin.html';
            }
        }
        
        return { response, data };
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, getApiUrl, authFetch };
}
