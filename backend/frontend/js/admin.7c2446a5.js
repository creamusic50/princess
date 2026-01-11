const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';
// Support both legacy key names: 'token' (used elsewhere) and 'authToken'
let authToken = localStorage.getItem('token') || localStorage.getItem('authToken');
let currentEditPostId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    if (authToken) {
        showDashboard();
        loadPosts();
        loadStats();
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

    // Meta description counter
    document.getElementById('post-meta')?.addEventListener('input', (e) => {
        document.getElementById('meta-count').textContent = e.target.value.length;
    });

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

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', data.token);
            messageEl.className = 'message success';
            messageEl.textContent = 'Login successful!';
            setTimeout(() => {
                showDashboard();
                loadPosts();
                loadStats();
            }, 1000);
        } else {
            messageEl.className = 'message error';
            messageEl.textContent = data.message || 'Login failed';
        }
    } catch (error) {
        messageEl.className = 'message error';
        messageEl.textContent = 'Login failed. Please try again.';
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

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', data.token);
            messageEl.className = 'message success';
            messageEl.textContent = 'Account created successfully!';
            setTimeout(() => {
                showDashboard();
                loadPosts();
                loadStats();
            }, 1000);
        } else {
            messageEl.className = 'message error';
            messageEl.textContent = data.message || 'Registration failed';
        }
    } catch (error) {
        messageEl.className = 'message error';
        messageEl.textContent = 'Registration failed. Please try again.';
    }
}

// Handle logout
function handleLogout() {
    authToken = null;
    localStorage.removeItem('authToken');
    showLogin();
}

// Switch tabs
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');

    if (tab === 'posts') {
        loadPosts();
    } else if (tab === 'stats') {
        loadStats();
    }
}

// Load posts for admin
async function loadPosts() {
    const container = document.getElementById('admin-posts-list');
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

        if (data.posts.length === 0) {
            container.innerHTML = '<p class="error">No posts found.</p>';
            return;
        }

        displayAdminPosts(data.posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        container.innerHTML = '<p class="error">Failed to load posts.</p>';
    }
}

// Display admin posts
function displayAdminPosts(posts) {
    const container = document.getElementById('admin-posts-list');
    const html = posts.map(post => `
        <div class="admin-post-card">
            <div class="post-info">
                <h3>${post.title}</h3>
                <div class="post-stats">
                    <span>${post.category}</span>
                    <span>${post.status}</span>
                    <span>${post.views} views</span>
                    <span>${new Date(post.createdAt).toLocaleDateString()}</span>
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

// Handle create post
async function handleCreatePost(e) {
    e.preventDefault();
    const messageEl = document.getElementById('create-message');
    const publishBtn = document.getElementById('publish-btn');
    const originalText = publishBtn ? publishBtn.textContent : null;
    try {
        if (publishBtn) {
            publishBtn.disabled = true;
            publishBtn.textContent = 'Publishing...';
        }

        const postData = {
            title: document.getElementById('post-title').value,
            category: document.getElementById('post-category').value,
            excerpt: document.getElementById('post-excerpt').value,
            content: '',
            metaDescription: document.getElementById('post-meta') ? document.getElementById('post-meta').value : '',
            keywords: document.getElementById('post-keywords') ? document.getElementById('post-keywords').value.split(',').map(k => k.trim()).filter(k => k) : [],
            status: document.getElementById('post-status') ? document.getElementById('post-status').value : 'published'
        };

        // Read content from TinyMCE if available
        try {
            if (window.tinymce && tinymce.get('post-content')) {
                postData.content = tinymce.get('post-content').getContent();
            } else {
                postData.content = document.getElementById('post-content').value;
            }
        } catch (readErr) {
            console.error('Error reading editor content:', readErr);
            postData.content = document.getElementById('post-content').value || '';
        }

        // Client-side word count (strip HTML)
        const tmp = document.createElement('div'); tmp.innerHTML = postData.content || '';
        const text = tmp.textContent || tmp.innerText || '';
        const wc = text.trim().split(/\s+/).filter(Boolean).length;
        if (wc < 1000) {
            messageEl.className = 'message error';
            messageEl.textContent = `Content must be at least 1000 words (currently ${wc}).`;
            if (publishBtn) { publishBtn.disabled = false; publishBtn.textContent = originalText; }
            return;
        }

        if (!authToken) {
            messageEl.className = 'message error';
            messageEl.textContent = 'Not authenticated. Please log in.';
            if (publishBtn) { publishBtn.disabled = false; publishBtn.textContent = originalText; }
            setTimeout(() => window.location.href = 'login.html', 800);
            return;
        }

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
            messageEl.className = 'message success';
            messageEl.textContent = 'Post created successfully!';
            document.getElementById('create-post-form').reset();
            if (document.getElementById('meta-count')) document.getElementById('meta-count').textContent = '0';
            // For admin.html (form-based UI), hide the form and refresh posts list
            if (typeof hidePostForm === 'function') {
                setTimeout(() => {
                    hidePostForm();
                    loadPosts();
                }, 1200);
            } else {
                // Fallback for other layouts with tabs
                loadStats();
                if (typeof switchTab === 'function') {
                    setTimeout(() => { switchTab('posts'); }, 1200);
                }
            }
        } else {
            messageEl.className = 'message error';
            messageEl.textContent = data.message || 'Failed to create post';
            console.error('Create post failed:', data);
        }
    } catch (error) {
        console.error('Failed to create post:', error);
        messageEl.className = 'message error';
        messageEl.textContent = 'Failed to create post. Please try again.';
    } finally {
        if (publishBtn) { publishBtn.disabled = false; publishBtn.textContent = originalText || 'Publish Post'; }
    }
}

// Edit post
async function editPost(postId) {
    try {
        const response = await fetch(`${API_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        const post = data.posts.find(p => p._id === postId);

        if (!post) return;

        currentEditPostId = postId;
        document.getElementById('edit-post-id').value = post._id;
        document.getElementById('edit-title').value = post.title;
        document.getElementById('edit-category').value = post.category;
        document.getElementById('edit-excerpt').value = post.excerpt;
        document.getElementById('edit-content').value = post.content;
        document.getElementById('edit-meta').value = post.metaDescription;
        document.getElementById('edit-keywords').value = post.keywords.join(', ');
        document.getElementById('edit-status').value = post.status;

        document.getElementById('edit-modal').style.display = 'block';
    } catch (error) {
        alert('Failed to load post details');
    }
}

// Handle update post
async function handleUpdatePost(e) {
    e.preventDefault();
    const messageEl = document.getElementById('edit-message');

    const postData = {
        title: document.getElementById('edit-title').value,
        category: document.getElementById('edit-category').value,
        excerpt: document.getElementById('edit-excerpt').value,
        content: document.getElementById('edit-content').value,
        metaDescription: document.getElementById('edit-meta').value,
        keywords: document.getElementById('edit-keywords').value.split(',').map(k => k.trim()).filter(k => k),
        status: document.getElementById('edit-status').value
    };

    try {
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
            messageEl.className = 'message success';
            messageEl.textContent = 'Post updated successfully!';
            loadPosts();
            loadStats();
            setTimeout(() => {
                closeModal();
            }, 1500);
        } else {
            messageEl.className = 'message error';
            messageEl.textContent = data.message || 'Failed to update post';
        }
    } catch (error) {
        messageEl.className = 'message error';
        messageEl.textContent = 'Failed to update post. Please try again.';
    }
}

// Delete post
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
        alert('Failed to delete post. Please try again.');
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/posts?limit=1000`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();

        const totalPosts = data.posts.length;
        const publishedPosts = data.posts.filter(p => p.status === 'published').length;
        const draftPosts = data.posts.filter(p => p.status === 'draft').length;
        const totalViews = data.posts.reduce((sum, p) => sum + p.views, 0);

        document.getElementById('total-posts').textContent = totalPosts;
        document.getElementById('published-posts').textContent = publishedPosts;
        document.getElementById('draft-posts').textContent = draftPosts;
        document.getElementById('total-views').textContent = totalViews;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Close modal
function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
    document.getElementById('edit-message').textContent = '';
    document.getElementById('edit-message').className = 'message';
}