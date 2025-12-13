class Pagination {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            currentPage: 1,
            totalPages: 1,
            visiblePages: 5,
            onPageChange: () => {},
            ...options
        };
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        this.render();
        this.bindEvents();
    }
    
    render() {
        const { currentPage, totalPages, visiblePages } = this.options;
        
        if (totalPages <= 1) {
            this.container.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        html += this.createPageButton('previous', currentPage > 1, '←');
        
        // Calculate range of pages to show
        let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        let endPage = Math.min(totalPages, startPage + visiblePages - 1);
        
        // Adjust start if we're near the end
        if (endPage - startPage + 1 < visiblePages) {
            startPage = Math.max(1, endPage - visiblePages + 1);
        }
        
        // First page and ellipsis
        if (startPage > 1) {
            html += this.createPageButton(1, true, '1');
            if (startPage > 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += this.createPageButton(i, true, i.toString(), i === currentPage);
        }
        
        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
            html += this.createPageButton(totalPages, true, totalPages.toString());
        }
        
        // Next button
        html += this.createPageButton('next', currentPage < totalPages, '→');
        
        // Page info
        html += `
            <div class="pagination-info">
                Page ${currentPage} of ${totalPages}
            </div>
        `;
        
        this.container.innerHTML = html;
    }
    
    createPageButton(page, enabled, text, active = false) {
        const disabledClass = enabled ? '' : 'disabled';
        const activeClass = active ? 'active' : '';
        
        return `
            <button class="pagination-btn ${disabledClass} ${activeClass}" 
                    data-page="${page}" 
                    ${!enabled ? 'disabled' : ''}>
                ${text}
            </button>
        `;
    }
    
    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn')) {
                const page = e.target.getAttribute('data-page');
                
                if (page === 'previous') {
                    this.goToPage(this.options.currentPage - 1);
                } else if (page === 'next') {
                    this.goToPage(this.options.currentPage + 1);
                } else {
                    this.goToPage(parseInt(page));
                }
            }
        });
    }
    
    goToPage(page) {
        if (page < 1 || page > this.options.totalPages || page === this.options.currentPage) {
            return;
        }
        
        this.options.currentPage = page;
        this.render();
        
        if (typeof this.options.onPageChange === 'function') {
            this.options.onPageChange(page);
        }
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    update(options) {
        this.options = { ...this.options, ...options };
        this.render();
    }
    
    destroy() {
        this.container.innerHTML = '';
        this.container.removeEventListener('click', this.handleClick);
    }
}

// Add CSS for pagination
const paginationStyles = `
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin: 40px 0;
        flex-wrap: wrap;
    }
    
    .pagination-btn {
        padding: 10px 16px;
        border: 2px solid #667eea;
        background: white;
        color: #667eea;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
        min-width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .pagination-btn:hover:not(.disabled):not(.active) {
        background: #667eea;
        color: white;
        transform: translateY(-2px);
    }
    
    .pagination-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
    }
    
    .pagination-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        border-color: #ddd;
        color: #999;
    }
    
    .pagination-ellipsis {
        padding: 10px 5px;
        color: #666;
        font-weight: bold;
    }
    
    .pagination-info {
        margin-left: 20px;
        color: #666;
        font-size: 14px;
    }
    
    @media (max-width: 768px) {
        .pagination-btn {
            padding: 8px 12px;
            min-width: 36px;
            height: 36px;
            font-size: 14px;
        }
        
        .pagination-info {
            margin-left: 10px;
            font-size: 12px;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = paginationStyles;
document.head.appendChild(styleSheet);

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
}