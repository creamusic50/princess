// ============================================================
// BLOG PAGE STATE & INITIALIZATION
// ============================================================

let currentCategory = 'all';
let currentPage = 1;
let currentSearch = '';

// Initialize blog page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupCategoryFilter();
    setupSearch();
    trackReadingProgress();
});

// ============================================================
// LOAD POSTS WITH CLIENT-SIDE CACHING
// ============================================================

async function loadPosts(page = 1, category = 'all', search = '') {
    const cacheKey = `posts:${page}:${category}:${search}`;
    
    // Try to load from client-side cache first
    const cachedData = getCachedPosts(cacheKey);
    if (cachedData) {
        displayPosts(cachedData.posts);
        updatePagination(cachedData.currentPage, cachedData.totalPages);
        currentPage = cachedData.currentPage;
        // Refresh in background
        fetchAndDisplayPosts(page, category, search, cacheKey);
        return;
    }
    
    // No cache, fetch immediately
    await fetchAndDisplayPosts(page, category, search, cacheKey);
}

// Helper: Get posts from cache if available
function getCachedPosts(cacheKey) {
    try {
        const rawCache = localStorage.getItem(CONFIG.CACHE.KEY);
        if (!rawCache) return null;
        
        const cache = JSON.parse(rawCache);
        const entry = cache[cacheKey];
        
        // Check if cache is still valid
        if (entry && (Date.now() - entry.timestamp) < CONFIG.CACHE.TTL_MS) {
            return entry.data;
        }
    } catch (error) {
        console.warn('Cache read error:', error);
    }
    
    return null;
}

// Helper: Fetch posts from API and display
async function fetchAndDisplayPosts(page, category, search, cacheKey) {
    try {
        showLoading();
        
        const data = await fetchPostsFromAPI(page, category, search);
        
        if (data && data.success) {
            savePostsToCache(cacheKey, data);
            displayPosts(data.posts);
            updatePagination(data.currentPage, data.totalPages);
            currentPage = data.currentPage;
        } else {
            showError('Failed to load posts');
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showError('Failed to load posts. Please try again.');
    } finally {
        hideLoading();
    }
}

// Helper: Fetch posts from API
async function fetchPostsFromAPI(page, category, search) {
    let url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.POSTS}?page=${page}&limit=${CONFIG.POSTS_PER_PAGE}`;
    
    if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
    }
    
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }
    
    const response = await fetch(url);
    return await response.json();
}

// Helper: Save posts to cache
function savePostsToCache(cacheKey, data) {
    try {
        const rawCache = localStorage.getItem(CONFIG.CACHE.KEY);
        const cache = rawCache ? JSON.parse(rawCache) : {};
        
        cache[cacheKey] = {
            timestamp: Date.now(),
            data: data
        };
        
        // Keep cache size bounded (max 50 entries)
        const keys = Object.keys(cache);
        if (keys.length > 50) {
            // Remove oldest entry
            keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
            delete cache[keys[0]];
        }
        
        localStorage.setItem(CONFIG.CACHE.KEY, JSON.stringify(cache));
    } catch (error) {
        console.warn('Cache save error:', error);
    }
}

// ============================================================
// DISPLAY POSTS IN GRID
// ============================================================

function displayPosts(posts) {
    const container = document.querySelector(CONFIG.SELECTORS.BLOG_GRID);
    
    if (!container) {
        console.error('Blog grid container not found');
        return;
    }
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <p>No posts found. Try a different category or search term.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <article class="blog-card">
            <div class="blog-card-content">
                <span class="category-badge">${escapeHtml(post.category)}</span>
                <h3><a href="post.html?slug=${post.slug}">${escapeHtml(post.title)}</a></h3>
                <p class="excerpt">${escapeHtml(post.excerpt || '')}</p>
                <div class="blog-card-meta">
                    <span class="date">${formatDate(post.created_at)}</span>
                    <span class="views">👁️ ${post.views || 0} views</span>
                    ${post.author_name ? `<span class="author">By ${escapeHtml(post.author_name)}</span>` : ''}
                </div>
                <a href="post.html?slug=${post.slug}" class="read-more">Read More →</a>
            </div>
        </article>
    `).join('');

    // Ensure any images in rendered content are lazy-loaded and decoded async
    setLazyImages();
}

// Make images non-blocking: lazy-load and async decoding for better LCP/TBT
function setLazyImages() {
    try {
        // Images in dynamically injected content
        const imgs = document.querySelectorAll('img');
        imgs.forEach((img, idx) => {
            // Skip images that explicitly declare loading attribute
            if (img.hasAttribute('loading')) return;
            // Keep first image eager if inside an article; otherwise lazy
            const isInArticle = !!img.closest('.post-body') || !!img.closest('.blog-card');
            if (isInArticle && idx === 0) {
                img.setAttribute('loading', 'eager');
            } else {
                img.setAttribute('loading', 'lazy');
            }
            img.setAttribute('decoding', 'async');
        });
    } catch (e) {
        // Non-fatal
        console.warn('setLazyImages error', e);
    }
}

// ============================================================
// SETUP CATEGORY FILTER
// ============================================================

function setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll(CONFIG.SELECTORS.CATEGORY_BTN);
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update visual active state
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Load posts for selected category
            const category = btn.dataset.category;
            currentCategory = category;
            currentPage = 1;
            loadPosts(currentPage, category, currentSearch);
        });
    });
}

// ============================================================
// SETUP SEARCH FUNCTIONALITY
// ============================================================

function setupSearch() {
    const searchInput = document.getElementById(CONFIG.SELECTORS.SEARCH_INPUT.replace('#', ''));
    const searchBtn = document.getElementById(CONFIG.SELECTORS.SEARCH_BTN.replace('#', ''));
    
    if (!searchInput) return;
    
    let debounceTimer;
    
    // Search as user types
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query !== currentSearch) {
                currentSearch = query;
                currentPage = 1;
                loadPosts(currentPage, currentCategory, currentSearch);
            }
        }, CONFIG.SEARCH_DEBOUNCE_MS);
    });
    
    // Search on button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query !== currentSearch) {
                currentSearch = query;
                currentPage = 1;
                loadPosts(currentPage, currentCategory, currentSearch);
            }
        });
    }
}

// ============================================================
// UPDATE PAGINATION UI
// ============================================================

function updatePagination(currentPage, totalPages) {
    const container = document.querySelector(CONFIG.SELECTORS.PAGINATION);
    
    // Hide pagination if only one page
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    let html = buildPaginationHtml(currentPage, totalPages);
    container.innerHTML = html;
}

// Helper: Build pagination HTML
function buildPaginationHtml(currentPage, totalPages) {
    let html = '';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">← Previous</button>`;
    }
    
    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const isCurrentPage = i === currentPage;
        const isNearCurrent = (i >= currentPage - 1 && i <= currentPage + 1);
        const isEdge = (i === 1 || i === totalPages);
        
        if (isEdge || isNearCurrent) {
            const activeClass = isCurrentPage ? 'active' : '';
            html += `<button class="page-btn ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">Next →</button>`;
    }
    
    return html;

// ============================================================
// PAGE NAVIGATION
// ============================================================

function goToPage(page) {
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Load posts for the requested page
    loadPosts(page, currentCategory, currentSearch);
}

// ============================================================
// LOADING & ERROR STATES
// ============================================================

function showLoading() {
    const container = document.querySelector(CONFIG.SELECTORS.BLOG_GRID);
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading posts...</p>
            </div>
        `;
    }
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

function showError(message) {
    const container = document.querySelector(CONFIG.SELECTORS.BLOG_GRID);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <p>⚠️ ${escapeHtml(message)}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Format date in readable format (e.g., "January 15, 2025")
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// READING PROGRESS TRACKER
// ============================================================
// READING PROGRESS TRACKER
// ============================================================

// Track user's reading progress on post detail pages
function trackReadingProgress() {
    // Only track on post detail pages
    if (!window.location.pathname.includes('post.html')) return;
    
    // Create progress bar element
    const progressBar = createProgressBar();
    document.body.appendChild(progressBar);
    
    // Update progress bar as user scrolls
    window.addEventListener('scroll', () => {
        updateProgressBar(progressBar);
    });
}

// Helper: Create progress bar DOM element
function createProgressBar() {
    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        z-index: 9999;
        transition: width 0.1s;
    `;
    return bar;
}

// Helper: Update progress bar based on scroll position
function updateProgressBar(progressBar) {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const scrollableHeight = documentHeight - windowHeight;
    const scrollPercent = (scrollTop / scrollableHeight) * 100;
    
    progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
}

// ============================================================
// SHARING & BOOKMARKING FUNCTIONS
// ============================================================

// Share post via native share dialog or copy to clipboard
function sharePost(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Check out this article: ${title}`,
            url: url
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: Copy URL to clipboard
        navigator.clipboard.writeText(url)
            .then(() => alert('Link copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    }
}

// Toggle bookmark status for a post
function toggleBookmark(postId) {
    const bookmarks = getBookmarks();
    const index = bookmarks.indexOf(postId);
    
    if (index === -1) {
        bookmarks.push(postId);
        setBookmarks(bookmarks);
        return true;
    } else {
        bookmarks.splice(index, 1);
        setBookmarks(bookmarks);
        return false;
    }
}

// Check if post is bookmarked
function isBookmarked(postId) {
    return getBookmarks().includes(postId);
}

// Helper: Get bookmarks from storage
function getBookmarks() {
    try {
        return JSON.parse(localStorage.getItem('bookmarks') || '[]');
    } catch {
        return [];
    }
}

// Helper: Save bookmarks to storage
function setBookmarks(bookmarks) {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}
