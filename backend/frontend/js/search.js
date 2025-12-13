const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

class Search {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchResults = document.getElementById('search-results');
        this.searchOverlay = document.getElementById('search-overlay');
        this.searchClose = document.getElementById('search-close');
        this.searchButton = document.getElementById('search-button');
        
        this.init();
    }
    
    init() {
        if (!this.searchInput) return;
        
        // Event listeners
        this.searchInput.addEventListener('input', this.debounce(this.performSearch.bind(this), 300));
        this.searchInput.addEventListener('focus', this.showSearchResults.bind(this));
        
        if (this.searchClose) {
            this.searchClose.addEventListener('click', this.hideSearchResults.bind(this));
        }
        
        if (this.searchButton) {
            this.searchButton.addEventListener('click', this.toggleSearch.bind(this));
        }
        
        // Close on click outside
        document.addEventListener('click', (e) => {
            if (this.searchResults && 
                !this.searchResults.contains(e.target) && 
                !this.searchInput.contains(e.target)) {
                this.hideSearchResults();
            }
        });
        
        // Handle Enter key
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitSearch();
            }
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    async performSearch() {
        const query = this.searchInput.value.trim();
        
        if (query.length < 2) {
            this.showRecentSearches();
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/posts?search=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            
            if (data.success) {
                this.displaySearchResults(data.posts, query);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    displaySearchResults(posts, query) {
        if (!this.searchResults) return;
        
        if (!posts || posts.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-empty">
                    <p>No results found for "<strong>${this.escapeHtml(query)}</strong>"</p>
                    <p class="search-suggestion">Try different keywords or check spelling</p>
                </div>
            `;
            return;
        }
        
        const html = `
            <div class="search-result-header">
                <h4>Search Results for "${this.escapeHtml(query)}"</h4>
                <span class="search-result-count">${posts.length} results</span>
            </div>
            ${posts.map(post => `
                <a href="post.html?slug=${encodeURIComponent(post.slug)}" class="search-result-item">
                    <div class="search-result-category">${this.escapeHtml(post.category)}</div>
                    <h5>${this.escapeHtml(post.title)}</h5>
                    <p class="search-result-excerpt">${this.escapeHtml(this.truncateText(post.excerpt || '', 100))}</p>
                    <div class="search-result-meta">
                        <span>📅 ${new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>👁️ ${post.views || 0} views</span>
                    </div>
                </a>
            `).join('')}
            ${posts.length >= 5 ? `
                <div class="search-result-footer">
                    <a href="index.html?search=${encodeURIComponent(query)}" class="search-view-all">
                        View all results →
                    </a>
                </div>
            ` : ''}
        `;
        
        this.searchResults.innerHTML = html;
        this.searchResults.style.display = 'block';
    }
    
    showRecentSearches() {
        if (!this.searchResults) return;
        
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        
        if (recentSearches.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-empty">
                    <p>Type to search articles</p>
                    <p class="search-suggestion">Try: "budgeting", "investing", "saving tips"</p>
                </div>
            `;
            return;
        }
        
        const html = `
            <div class="search-result-header">
                <h4>Recent Searches</h4>
                <button class="search-clear-recent" onclick="search.clearRecentSearches()">Clear</button>
            </div>
            ${recentSearches.map(term => `
                <div class="search-recent-item" onclick="search.setSearchTerm('${this.escapeHtml(term)}')">
                    <span class="search-recent-icon">🔍</span>
                    <span class="search-recent-term">${this.escapeHtml(term)}</span>
                    <button class="search-recent-remove" onclick="event.stopPropagation(); search.removeRecentSearch('${this.escapeHtml(term)}')">×</button>
                </div>
            `).join('')}
        `;
        
        this.searchResults.innerHTML = html;
        this.searchResults.style.display = 'block';
    }
    
    showSearchResults() {
        if (!this.searchResults) return;
        
        const query = this.searchInput.value.trim();
        
        if (query.length === 0) {
            this.showRecentSearches();
        } else if (query.length >= 2) {
            this.performSearch();
        }
        
        this.searchResults.style.display = 'block';
    }
    
    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }
    
    toggleSearch() {
        if (this.searchOverlay) {
            const isVisible = this.searchOverlay.style.display === 'flex';
            this.searchOverlay.style.display = isVisible ? 'none' : 'flex';
            
            if (!isVisible) {
                setTimeout(() => {
                    this.searchInput.focus();
                }, 100);
            }
        }
    }
    
    submitSearch() {
        const query = this.searchInput.value.trim();
        
        if (query.length === 0) return;
        
        // Save to recent searches
        this.saveRecentSearch(query);
        
        // Navigate to search results page or show results
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
    
    saveRecentSearch(term) {
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        
        // Remove if already exists
        const index = recentSearches.indexOf(term);
        if (index !== -1) {
            recentSearches.splice(index, 1);
        }
        
        // Add to beginning
        recentSearches.unshift(term);
        
        // Keep only last 5 searches
        if (recentSearches.length > 5) {
            recentSearches.pop();
        }
        
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
    
    clearRecentSearches() {
        localStorage.removeItem('recentSearches');
        this.showRecentSearches();
    }
    
    removeRecentSearch(term) {
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const index = recentSearches.indexOf(term);
        
        if (index !== -1) {
            recentSearches.splice(index, 1);
            localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
            this.showRecentSearches();
        }
    }
    
    setSearchTerm(term) {
        if (this.searchInput) {
            this.searchInput.value = term;
            this.searchInput.focus();
            this.performSearch();
        }
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize search
let search = null;
document.addEventListener('DOMContentLoaded', () => {
    search = new Search();
    window.search = search;
});