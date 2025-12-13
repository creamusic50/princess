// ============================================================
// ADMIN DASHBOARD - INITIALIZATION & AUTH
// ============================================================

const API_URL = CONFIG.API_BASE_URL + '/api';
let authToken = localStorage.getItem('token') || localStorage.getItem('authToken');
let currentEditPostId = null;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
    if (authToken) {
        showDashboard();
        loadPosts();
        loadStats();
    } else {
        showLogin();
    }
}

// ============================================================
// EVENT LISTENER SETUP
// ============================================================

// Setup all event listeners for forms and buttons
function setupEventListeners() {
    setupAuthToggleListeners();
    setupFormListeners();
    setupLogoutListener();
    setupTabListeners();
    setupFilterListeners();
    setupModalListeners();
}

// Setup login/register toggle buttons
function setupAuthToggleListeners() {
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthSection('register');
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthSection('login');
    });
}

// Setup form submission listeners
function setupFormListeners() {
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('create-post-form')?.addEventListener('submit', handleCreatePost);
    document.getElementById('edit-post-form')?.addEventListener('submit', handleUpdatePost);
}

// Setup logout button listener
function setupLogoutListener() {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
}

// Setup tab switching listeners
function setupTabListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
}

// Setup filter listeners
function setupFilterListeners() {
    document.getElementById('filter-status')?.addEventListener('change', loadPosts);
    document.getElementById('filter-category')?.addEventListener('change', loadPosts);
    
    // Meta description character counter
    document.getElementById('post-meta')?.addEventListener('input', (e) => {
        const counter = document.getElementById('meta-count');
        if (counter) counter.textContent = e.target.value.length;
    });
}

// Setup modal listeners
function setupModalListeners() {
    document.querySelector('.close')?.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

// ============================================================
// SECTION VISIBILITY HELPERS
// ============================================================

// Toggle between login and register sections
function toggleAuthSection(section) {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    
    if (section === 'register') {
        if (loginSection) loginSection.style.display = 'none';
        if (registerSection) registerSection.style.display = 'block';
    } else {
        if (loginSection) loginSection.style.display = 'block';
        if (registerSection) registerSection.style.display = 'none';
    }
}

// Show login section
function showLogin() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'none';
}

// Show dashboard section
function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('register-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
}

// ============================================================
// AUTHENTICATION HANDLERS
// ============================================================

// Handle login form submission
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

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', data.token);
            showMessage(messageEl, 'Login successful!', 'success');
            
            setTimeout(() => {
                showDashboard();
                loadPosts();
                loadStats();
            }, 1000);
        } else {
            showMessage(messageEl, data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(messageEl, 'Login failed. Please try again.', 'error');
    }
}

// Handle registration form submission
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

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', data.token);
            showMessage(messageEl, 'Account created successfully!', 'success');
            
            setTimeout(() => {
                showDashboard();
                loadPosts();
                loadStats();
            }, 1000);
        } else {
            showMessage(messageEl, data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(messageEl, 'Registration failed. Please try again.', 'error');
    }
}

// Handle logout
function handleLogout() {
    authToken = null;
    localStorage.removeItem('authToken');
    showLogin();
}

// ============================================================
// TAB & POST LOADING
// ============================================================

// Switch between dashboard tabs
function switchTab(tab) {
    // Update button active state
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-tab`)?.classList.add('active');

    // Load content based on tab
    if (tab === 'posts') {
        loadPosts();
    } else if (tab === 'stats') {
        loadStats();
    }
}

// Load all posts for admin view
async function loadPosts() {
    const container = document.getElementById('admin-posts-list');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading posts...</div>';

    const status = document.getElementById('filter-status')?.value || '';
    const category = document.getElementById('filter-category')?.value || '';

    try {
        let url = `${API_URL}/posts?limit=100`;
        if (status) url += `&status=${status}`;
        if (category) url += `&category=${category}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = await response.json();

        if (data.posts && data.posts.length > 0) {
            displayAdminPosts(data.posts);
        } else {
            container.innerHTML = '<p class="error">No posts found.</p>';
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = '<p class="error">Failed to load posts.</p>';
    }
}

// Display posts in admin dashboard
function displayAdminPosts(posts) {
    const container = document.getElementById('admin-posts-list');
    const html = posts.map(post => `
        <div class="admin-post-card">
            <div class="post-info">
                <h3>${escapeHtml(post.title)}</h3>
                <div class="post-stats">
                    <span>📁 ${escapeHtml(post.category)}</span>
                    <span>📊 ${escapeHtml(post.status)}</span>
                    <span>👁️ ${post.views} views</span>
                    <span>📅 ${new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn btn-edit" onclick="editPost('${post._id}')">Edit</button>
                <button class="btn btn-delete" onclick="deletePost('${post._id}')">Delete</button>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// Escape HTML special characters for safe display
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// POST CREATION & EDITING
// ============================================================

const MIN_WORD_COUNT = 1000;

// Handle new post creation
async function handleCreatePost(e) {
    e.preventDefault();
    
    const messageEl = document.getElementById('create-message');
    const publishBtn = document.getElementById('publish-btn');
    const originalBtnText = publishBtn?.textContent || 'Publish Post';
    
    try {
        // Collect post data
        const postData = getPostFormData();
        
        // Get editor content (supports TinyMCE)
        postData.content = getEditorContent();
        
        // Validate word count
        const wordCount = countWords(postData.content);
        if (wordCount < MIN_WORD_COUNT) {
            showMessage(messageEl, `Content must be at least ${MIN_WORD_COUNT} words (currently ${wordCount}).`, 'error');
            return;
        }
        
        // Verify authentication
        if (!authToken) {
            showMessage(messageEl, 'Not authenticated. Please log in.', 'error');
            setTimeout(() => window.location.href = 'login.html', 800);
            return;
        }
        
        // Disable button during submission
        setButtonState(publishBtn, true, 'Publishing...');
        
        // Submit post
        const response = await fetch(`${API_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': authToken
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showMessage(messageEl, 'Post created successfully!', 'success');
            document.getElementById('create-post-form')?.reset();
            resetMetaCounter();
            
            // Refresh dashboard
            setTimeout(() => {
                loadPosts();
                loadStats();
                if (typeof switchTab === 'function') {
                    switchTab('posts');
                }
            }, 1200);
        } else {
            showMessage(messageEl, data.message || 'Failed to create post', 'error');
            console.error('Create post failed:', data);
        }
    } catch (error) {
        console.error('Failed to create post:', error);
        showMessage(messageEl, 'Failed to create post. Please try again.', 'error');
    } finally {
        setButtonState(publishBtn, false, originalBtnText);
    }
}

// Handle post update
async function handleUpdatePost(e) {
    e.preventDefault();
    
    const messageEl = document.getElementById('edit-message');

    try {
        const postData = {
            title: document.getElementById('edit-title')?.value || '',
            category: document.getElementById('edit-category')?.value || '',
            excerpt: document.getElementById('edit-excerpt')?.value || '',
            content: document.getElementById('edit-content')?.value || '',
            metaDescription: document.getElementById('edit-meta')?.value || '',
            keywords: (document.getElementById('edit-keywords')?.value || '').split(',').map(k => k.trim()).filter(k => k),
            status: document.getElementById('edit-status')?.value || 'published'
        };

        const response = await fetch(`${API_URL}/posts/${currentEditPostId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(messageEl, 'Post updated successfully!', 'success');
            loadPosts();
            loadStats();
            
            setTimeout(() => {
                closeModal();
            }, 1500);
        } else {
            showMessage(messageEl, data.message || 'Failed to update post', 'error');
        }
    } catch (error) {
        console.error('Update post error:', error);
        showMessage(messageEl, 'Failed to update post. Please try again.', 'error');
    }
}

// Load post for editing
async function editPost(postId) {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        const post = data.posts.find(p => p._id === postId);

        if (!post) {
            alert('Post not found');
            return;
        }

        // Populate edit form
        currentEditPostId = postId;
        document.getElementById('edit-post-id').value = post._id;
        document.getElementById('edit-title').value = post.title;
        document.getElementById('edit-category').value = post.category;
        document.getElementById('edit-excerpt').value = post.excerpt;
        document.getElementById('edit-content').value = post.content;
        document.getElementById('edit-meta').value = post.metaDescription || '';
        document.getElementById('edit-keywords').value = (post.keywords || []).join(', ');
        document.getElementById('edit-status').value = post.status;

        // Show modal
        document.getElementById('edit-modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading post:', error);
        alert('Failed to load post details');
    }
}

// Delete post with confirmation
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const response = await fetch(`${API_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (response.ok) {
            alert('Post deleted successfully!');
            loadPosts();
            loadStats();
        } else {
            alert('Failed to delete post');
        }
    } catch (error) {
        console.error('Delete post error:', error);
        alert('Failed to delete post. Please try again.');
    }
}

// ============================================================
// STATISTICS LOADING
// ============================================================

// Load and display dashboard statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/posts?limit=1000`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        if (!data.posts) return;

        // Calculate stats
        const totalPosts = data.posts.length;
        const publishedPosts = data.posts.filter(p => p.status === 'published').length;
        const draftPosts = data.posts.filter(p => p.status === 'draft').length;
        const totalViews = data.posts.reduce((sum, p) => sum + (p.views || 0), 0);

        // Update UI
        const statsMap = {
            'total-posts': totalPosts,
            'published-posts': publishedPosts,
            'draft-posts': draftPosts,
            'total-views': totalViews
        };

        Object.entries(statsMap).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============================================================
// MODAL & MESSAGE HELPERS
// ============================================================

// Close modal dialog
function closeModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.style.display = 'none';
        const messageEl = document.getElementById('edit-message');
        if (messageEl) {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }
    }
}

// Display message to user
function showMessage(element, text, type) {
    if (!element) return;
    element.textContent = text;
    element.className = `message ${type}`;
}

// Reset meta description counter
function resetMetaCounter() {
    const counter = document.getElementById('meta-count');
    if (counter) counter.textContent = '0';
}

// Update button disabled state and text
function setButtonState(btn, isLoading, loadingText = 'Loading...') {
    if (!btn) return;
    
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = loadingText;
        btn.disabled = true;
    } else {
        btn.textContent = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
    }
}

// ============================================================
// POST DATA HELPERS
// ============================================================

// Get form data from post creation form
function getPostFormData() {
    return {
        title: document.getElementById('post-title')?.value || '',
        category: document.getElementById('post-category')?.value || '',
        excerpt: document.getElementById('post-excerpt')?.value || '',
        metaDescription: document.getElementById('post-meta')?.value || '',
        keywords: (document.getElementById('post-keywords')?.value || '').split(',').map(k => k.trim()).filter(k => k),
        status: document.getElementById('post-status')?.value || 'published'
    };
}

// Get editor content (supports both TinyMCE and textarea)
function getEditorContent() {
    try {
        // Check for TinyMCE editor
        if (window.tinymce && tinymce.get('post-content')) {
            return tinymce.get('post-content').getContent();
        }
    } catch (error) {
        console.warn('TinyMCE not available:', error);
    }
    
    // Fallback to textarea
    return document.getElementById('post-content')?.value || '';
}

// Count words in text (strips HTML tags)
function countWords(htmlText) {
    const tmp = document.createElement('div');
    tmp.innerHTML = htmlText || '';
    const text = tmp.textContent || tmp.innerText || '';
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
}