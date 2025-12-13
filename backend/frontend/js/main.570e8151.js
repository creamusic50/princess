// Load posts on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupCategoryFilter();
    setupSearch();
    trackReadingProgress();
});

// Global state
let currentCategory = 'all';
let currentPage = 1;
let currentSearch = '';

// Load posts from API with short client-side cache to improve perceived speed
async function loadPosts(page = 1, category = 'all', search = '') {
    const cacheKey = `posts:${page}:${category}:${search}`;
    const CACHE_TTL = 30 * 1000; // 30 seconds

    // Try client-side cache first (fast render)
    try {
        const rawCache = localStorage.getItem('posts_cache_v1');
        if (rawCache) {
            try {
                const cache = JSON.parse(rawCache);
                const entry = cache[cacheKey];
                if (entry && (Date.now() - entry.ts) < CACHE_TTL) {
                    // Render cached data immediately
                    displayPosts(entry.data.posts);
                    updatePagination(entry.data.currentPage, entry.data.totalPages);
                    currentPage = entry.data.currentPage;
                    // Continue to fetch in background to refresh cache
                    fetchAndCache();
                    return;
                }
            } catch (e) {
                // parsing error, fall through to fetch
                console.warn('Posts cache parse error', e);
            }
        }
    } catch (e) {
        console.warn('Accessing localStorage failed', e);
    }

    // No valid cache — fetch and render
    await fetchAndCache();

    async function fetchAndCache() {
        try {
            showLoading();

            const apiUrl = CONFIG.API_BASE_URL;
            let url = `${apiUrl}/posts?page=${page}&limit=${CONFIG.POSTS_PER_PAGE}`;
            if (category && category !== 'all') url += `&category=${encodeURIComponent(category)}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data && data.success) {
                // Save to cache
                try {
                    const raw = localStorage.getItem('posts_cache_v1');
                    const cache = raw ? JSON.parse(raw) : {};
                    cache[cacheKey] = { ts: Date.now(), data };
                    // Keep cache size bounded: remove old keys if too many
                    const keys = Object.keys(cache);
                    if (keys.length > 50) {
                        // remove oldest
                        keys.sort((a, b) => cache[a].ts - cache[b].ts);
                        delete cache[keys[0]];
                    }
                    localStorage.setItem('posts_cache_v1', JSON.stringify(cache));
                } catch (e) {
                    // ignore storage errors
                }

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
}

// Display posts in grid
function displayPosts(posts) {
    const container = document.querySelector('.blog-grid');
    
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

// Setup category filter
function setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Load posts for category
            const category = btn.dataset.category;
            currentCategory = category;
            currentPage = 1;
            loadPosts(currentPage, category, currentSearch);
        });
    });
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (!searchInput) return;
    
    let debounceTimer;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.trim();
            currentPage = 1;
            loadPosts(currentPage, currentCategory, currentSearch);
        }, CONFIG.SEARCH_DEBOUNCE_MS);
    });
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadPosts(currentPage, currentCategory, currentSearch);
        });
    }
}

// Update pagination
function updatePagination(currentPage, totalPages) {
    const container = document.querySelector('.pagination');
    
    if (!container || totalPages <= 1) {
        if (container) container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">← Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span class="page-ellipsis">...</span>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">Next →</button>`;
    }
    
    container.innerHTML = html;
}

// Go to specific page
function goToPage(page) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadPosts(page, currentCategory, currentSearch);
}

// Show loading state
function showLoading() {
    const container = document.querySelector('.blog-grid');
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading posts...</p>
            </div>
        `;
    }
}

// Hide loading state
function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

// Show error message
function showError(message) {
    const container = document.querySelector('.blog-grid');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <p>⚠️ ${escapeHtml(message)}</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Track reading progress
function trackReadingProgress() {
    // Only on post pages
    if (!window.location.pathname.includes('post.html')) return;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        z-index: 9999;
        transition: width 0.1s;
    `;
    
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    });
}

// Share functionality
function sharePost(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Check out this article: ${title}`,
            url: url
        }).catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
}

// Bookmark functionality
function toggleBookmark(postId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const index = bookmarks.indexOf(postId);
    
    if (index === -1) {
        bookmarks.push(postId);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        return true;
    } else {
        bookmarks.splice(index, 1);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        return false;
    }
}

// Check if post is bookmarked
function isBookmarked(postId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    return bookmarks.includes(postId);
}
