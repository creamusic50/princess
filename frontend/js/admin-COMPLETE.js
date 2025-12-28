const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
let authToken = localStorage.getItem('token') || localStorage.getItem('authToken');
let currentEditPostId = null;
let editor = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    initTinyMCE();
});

// Initialize TinyMCE
function initTinyMCE() {
    if (typeof tinymce !== 'undefined') {
        tinymce.init({
            selector: '#post-content, #edit-post-content',
            height: 500,
            menubar: true,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        });
    }
}

// Check authentication
function checkAuth() {
    if (authToken) {
        showDashboard();
        loadDashboard(); // Load dashboard stats
        loadPosts();
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login/Register toggle
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('register-section').style.display = 'block';
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-section').style.display = 'none';
        document.getElementById('login-section').style.display = 'block';
    });

    // Forms
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('create-post-form')?.addEventListener('submit', handleCreatePost);
    document.getElementById('edit-post-form')?.addEventListener('submit', handleUpdatePost);

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Filters
    document.getElementById('filter-status')?.addEventListener('change', loadPosts);
    document.getElementById('filter-category')?.addEventListener('change', loadPosts);

    // Modal close
    document.querySelector('.close')?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// Show sections
function showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
            localStorage.setItem('authToken', authToken);
            showSuccess('Login successful!');
            showDashboard();
            loadDashboard(); // Load dashboard first
            loadPosts();
        } else {
            messageEl.textContent = data.message;
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
        }
    } catch (error) {
        messageEl.textContent = 'Login failed';
        messageEl.className = 'message error';
        messageEl.style.display = 'block';
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const messageEl = document.getElementById('register-message');

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (data.success) {
            messageEl.textContent = 'Registration successful! Please login.';
            messageEl.className = 'message success';
            messageEl.style.display = 'block';
            setTimeout(() => {
                document.getElementById('show-login').click();
            }, 2000);
        } else {
            messageEl.textContent = data.message;
            messageEl.className = 'message error';
            messageEl.style.display = 'block';
        }
    } catch (error) {
        messageEl.textContent = 'Registration failed';
        messageEl.className = 'message error';
        messageEl.style.display = 'block';
    }
}

// Handle logout
function handleLogout() {
    authToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    showLogin();
}

// ========================================
// DASHBOARD STATS - THIS IS THE KEY PART!
// ========================================
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard stats');
        }

        const data = await response.json();
        console.log('Dashboard stats loaded:', data); // Debug
        displayDashboard(data.stats);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard: ' + error.message);
    }
}

function displayDashboard(stats) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) {
        console.error('Stats container not found!');
        return;
    }

    console.log('Displaying stats:', stats); // Debug

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
                <h3>Total Posts</h3>
                <p class="stat-number">${stats.posts?.total_posts || 0}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
                <h3>Published</h3>
                <p class="stat-number">${stats.posts?.published_posts || 0}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📄</div>
            <div class="stat-info">
                <h3>Drafts</h3>
                <p class="stat-number">${stats.posts?.draft_posts || 0}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">👁️</div>
            <div class="stat-info">
                <h3>Total Views</h3>
                <p class="stat-number">${formatNumber(stats.posts?.total_views || 0)}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📂</div>
            <div class="stat-info">
                <h3>Categories</h3>
                <p class="stat-number">${stats.posts?.unique_categories || 0}</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
                <h3>Total Users</h3>
                <p class="stat-number">${stats.users || 0}</p>
            </div>
        </div>
    `;
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Load posts
async function loadPosts() {
    const status = document.getElementById('filter-status')?.value || '';
    const category = document.getElementById('filter-category')?.value || '';

    try {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (category) params.append('category', category);
        params.append('page', 1);
        params.append('limit', 50);

        const response = await fetch(`${API_URL}/admin/posts?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load posts');
        }

        const data = await response.json();
        displayPosts(data.posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        showError('Failed to load posts: ' + error.message);
    }
}

// Display posts
function displayPosts(posts) {
    const tableBody = document.getElementById('posts-table-body');
    if (!tableBody) return;

    if (!posts || posts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 20px;">No posts found</td></tr>';
        return;
    }

    tableBody.innerHTML = posts.map(post => `
        <tr>
            <td><strong>#${post.id}</strong></td>
            <td>${post.title}</td>
            <td><span class="badge badge-category">${post.category}</span></td>
            <td>
                <span class="badge ${post.published ? 'badge-success' : 'badge-warning'}">
                    ${post.published ? '✓ Published' : '📝 Draft'}
                </span>
            </td>
            <td><strong>${post.views || 0}</strong> views</td>
            <td>
                <button class="btn btn-sm btn-primary" data-action="editPost" data-arg-id="${post.id}" title="Edit Post">
                    ✏️ Edit
                </button>
                <button class="btn btn-sm btn-danger" data-action="deletePost" data-arg-id="${post.id}" title="Delete Post">
                    🗑️ Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Edit post
async function editPost(postId) {
    try {
        const response = await fetch(`${API_URL}/admin/posts?id=${postId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load post');
        }

        const data = await response.json();
        const post = data.posts.find(p => p.id === postId);
        
        if (post) {
            currentEditPostId = postId;
            populateEditForm(post);
            document.getElementById('edit-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading post:', error);
        showError('Failed to load post');
    }
}

function populateEditForm(post) {
    document.getElementById('edit-post-title').value = post.title;
    document.getElementById('edit-post-category').value = post.category;
    document.getElementById('edit-post-excerpt').value = post.excerpt || '';
    
    // Set TinyMCE content if available
    if (tinymce.get('edit-post-content')) {
        tinymce.get('edit-post-content').setContent(post.content);
    } else {
        document.getElementById('edit-post-content').value = post.content;
    }
    
    document.getElementById('edit-post-published').checked = post.published;
    document.getElementById('edit-post-meta').value = post.meta_description || '';
    document.getElementById('edit-post-keywords').value = post.keywords ? post.keywords.join(', ') : '';
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete post');
        }

        const data = await response.json();
        
        if (data.success) {
            showSuccess('Post deleted successfully!');
            loadPosts();
            loadDashboard(); // Refresh dashboard stats
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        showError('Failed to delete post: ' + error.message);
    }
}

// Handle create post
async function handleCreatePost(e) {
    e.preventDefault();
    
    // Get content from TinyMCE
    const content = tinymce.get('post-content') ? tinymce.get('post-content').getContent() : document.getElementById('post-content').value;
    
    const formData = {
        title: document.getElementById('post-title').value,
        category: document.getElementById('post-category').value,
        excerpt: document.getElementById('post-excerpt').value,
        content: content,
        published: document.getElementById('post-published')?.checked || false,
        meta_description: document.getElementById('post-meta').value,
        keywords: document.getElementById('post-keywords').value
    };

    try {
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Post created successfully!');
            document.getElementById('create-post-form').reset();
            if (tinymce.get('post-content')) {
                tinymce.get('post-content').setContent('');
            }
            switchTab('posts');
            loadPosts();
            loadDashboard(); // Refresh dashboard stats
        } else {
            showError(data.message || 'Failed to create post');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        showError('Failed to create post: ' + error.message);
    }
}

// Handle update post
async function handleUpdatePost(e) {
    e.preventDefault();
    
    // Get content from TinyMCE
    const content = tinymce.get('edit-post-content') ? tinymce.get('edit-post-content').getContent() : document.getElementById('edit-post-content').value;
    
    const formData = {
        title: document.getElementById('edit-post-title').value,
        category: document.getElementById('edit-post-category').value,
        excerpt: document.getElementById('edit-post-excerpt').value,
        content: content,
        published: document.getElementById('edit-post-published').checked,
        meta_description: document.getElementById('edit-post-meta').value,
        keywords: document.getElementById('edit-post-keywords').value
    };

    try {
        const response = await fetch(`${API_URL}/posts/${currentEditPostId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Post updated successfully!');
            closeModal();
            loadPosts();
            loadDashboard(); // Refresh dashboard stats
        } else {
            showError(data.message || 'Failed to update post');
        }
    } catch (error) {
        console.error('Error updating post:', error);
        showError('Failed to update post: ' + error.message);
    }
}

// Switch tabs
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    document.getElementById(`${tab}-tab`)?.classList.add('active');
    
    if (tab === 'posts') {
        loadPosts();
    } else if (tab === 'dashboard') {
        loadDashboard(); // Reload dashboard when switching to it
    }
}

// Close modal
function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
    currentEditPostId = null;
}

// Utility functions
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.innerHTML = `<strong>✓ Success!</strong> ${message}`;
    alert.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px 20px; background: #48bb78; color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.2); animation: slideIn 0.3s ease;';
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = `<strong>✗ Error!</strong> ${message}`;
    alert.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px 20px; background: #f56565; color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.2); animation: slideIn 0.3s ease;';
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Make functions available globally
window.editPost = editPost;
window.deletePost = deletePost;

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
