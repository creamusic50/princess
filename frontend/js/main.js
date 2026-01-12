// ============================================================
// BLOG PAGE STATE & INITIALIZATION
// ============================================================

let currentCategory = 'all';
let currentPage = 1;
let currentSearch = '';

// Initialize blog page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Ensure CONFIG is loaded before proceeding
    if (typeof CONFIG === 'undefined') {
        console.error('CONFIG not loaded. Check that config script loaded first.');
        return;
    }
    
    // Critical setup (blocking - must run immediately)
    setupHamburgerMenu();
    loadPosts();
    
    // Non-critical setup (staggered to avoid blocking)
    // Category filter - lower priority, can wait
    setTimeout(setupCategoryFilter, 500);
    
    // Search - medium priority, defer slightly
    setTimeout(setupSearch, 700);
    
    // Reading progress - only on post pages, defer more
    setTimeout(trackReadingProgress, 1000);
});
});

// ============================================================
// HAMBURGER MENU SETUP
// ============================================================

function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const navLinks = document.querySelectorAll('.nav-menu a');

    if (!hamburger || !navMenu) return;

    // Toggle menu on hamburger click
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        if (mobileOverlay) mobileOverlay.classList.toggle('active');
    });

    // Close menu when overlay is clicked
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            mobileOverlay.classList.remove('active');
        });
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            if (mobileOverlay) mobileOverlay.classList.remove('active');
        });
    });

    // Close menu on window resize if screen becomes large
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
            }
        }, 250);
    });
}

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

    // Batch DOM writes using DocumentFragment (reduces reflows)
    const fragment = document.createDocumentFragment();
    
    posts.forEach(post => {
        const article = document.createElement('article');
        article.className = 'blog-card';
        article.innerHTML = `
            <div class="blog-card-content">
                <span class="category-badge" role="note" aria-label="Category">${escapeHtml(post.category)}</span>
                <h3><a href="post.html?slug=${post.slug}">${escapeHtml(post.title)}</a></h3>
                <p class="excerpt">${escapeHtml(post.excerpt || '')}</p>
                <div class="blog-card-meta" aria-label="Post metadata">
                    <span class="date" aria-label="Published date">${formatDate(post.created_at)}</span>
                    <span class="views" aria-label="Views">${post.views || 0} views</span>
                    ${post.author_name ? `<span class="author" aria-label="Author">By ${escapeHtml(post.author_name)}</span>` : ''}
                </div>
                <a href="post.html?slug=${post.slug}" class="read-more" aria-label="Read more about ${escapeHtml(post.title)}">Read More</a>
            </div>
        `;
        fragment.appendChild(article);
    });
    
    // Single reflow: Clear and append all at once
    container.innerHTML = '';
    container.appendChild(fragment);

    // Ensure any images in rendered content are lazy-loaded and decoded async
    setLazyImages();
}

// Make images non-blocking: lazy-load and async decoding for better LCP/TBT
function setLazyImages() {
    try {
        // Batch all DOM operations to reduce reflows
        const imgs = document.querySelectorAll('img');
        const updates = []; // Store changes to batch them
        
        imgs.forEach((img, idx) => {
            // Skip images that already have loading attribute
            if (img.hasAttribute('loading')) return;
            
            // Determine loading strategy (batch read)
            const isInArticle = !!img.closest('.post-body') || !!img.closest('.blog-card');
            const loadingValue = (isInArticle && idx === 0) ? 'eager' : 'lazy';
            
            // Queue updates instead of writing immediately
            updates.push({ img, loading: loadingValue });
        });
        
        // Apply all updates in batch (single reflow)
        updates.forEach(({ img, loading }) => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', loading);
                img.setAttribute('decoding', 'async');
            }
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
    const categoryGrid = document.querySelector('.category-grid');
    if (!categoryGrid) return;
    
    // Event delegation - single listener on parent instead of per-button
    categoryGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (!btn) return;
        
        // Update visual active state
        const categoryButtons = categoryGrid.querySelectorAll('.category-btn');
        categoryButtons.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        
        // Load posts for selected category
        const category = btn.dataset.category;
        currentCategory = category;
        currentPage = 1;
        loadPosts(currentPage, category, currentSearch);
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
        html += `<button class="page-btn" data-action="goToPage" data-arg-page="${currentPage - 1}">← Previous</button>`;
    }
    
    // Page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const isCurrentPage = i === currentPage;
        const isNearCurrent = (i >= currentPage - 1 && i <= currentPage + 1);
        const isEdge = (i === 1 || i === totalPages);
        
            if (isEdge || isNearCurrent) {
            const activeClass = isCurrentPage ? 'active' : '';
            html += `<button class="page-btn ${activeClass}" data-action="goToPage" data-arg-page="${i}">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<button class="page-btn" data-action="goToPage" data-arg-page="${currentPage + 1}">Next →</button>`;
    }
    
    return html;
}

// ============================================================
// PAGE NAVIGATION
// ============================================================

function goToPage(page) {
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Load posts for the requested page
    loadPosts(page, currentCategory, currentSearch);
}

// Expose pagination helper globally for CSP dispatcher
if (typeof goToPage === 'function') window.goToPage = goToPage;

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
                <button data-action="reload">Retry</button>
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

// Track user's reading progress on post detail pages
function trackReadingProgress() {
    // Early exit for non-post pages (avoid unnecessary work)
    if (!window.location.pathname.includes('post.html')) return;
    
    // Only create progress bar on actual post pages
    const progressBar = createProgressBar();
    if (!progressBar) return; // Safety check
    document.body.appendChild(progressBar);
    
    // Use requestAnimationFrame for smooth updates, not scroll events
    let lastScrollPercent = 0;
    let rafId = null;
    let isScrolling = false;
    
    function updateOnFrame() {
        // Batch all DOM reads first (avoid interleaving with writes)
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollableHeight = documentHeight - windowHeight;
        
        if (scrollableHeight > 0) {
            const scrollPercent = Math.min((scrollTop / scrollableHeight) * 100, 100);
            
            // Only write to DOM if value actually changed (reduce reflows)
            if (Math.abs(scrollPercent - lastScrollPercent) > 0.5) {
                lastScrollPercent = scrollPercent;
                // Single batch write to DOM
                progressBar.style.width = `${scrollPercent}%`;
            }
        }
        
        rafId = requestAnimationFrame(updateOnFrame);
    }
    
    // Start animation loop only on scroll
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            isScrolling = true;
            if (!rafId) {
                rafId = requestAnimationFrame(updateOnFrame);
            }
        }
    }, { passive: true });
    
    // Stop animation loop when scrolling stops (save CPU)
    window.addEventListener('scroll', () => {
        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => {
            isScrolling = false;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }, 150);
    }, { passive: true });
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
        will-change: width;
        transform: translateZ(0);
        transition: width 0.05s ease-out;
    `;
    return bar;
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
