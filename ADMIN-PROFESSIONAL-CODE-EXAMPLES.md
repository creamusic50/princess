# ADMIN PANEL - CODE EXAMPLES & API USAGE

## Quick Code Snippets

### 1. Make an API Call with Auth
```javascript
// Built-in function in admin-professional.html
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'x-auth-token': APP.token,
        ...options.headers
    };

    const response = await fetch(`${APP.apiBase}${endpoint}`, {
        ...options,
        headers
    });

    return await response.json();
}

// Usage Examples:
// GET request
const posts = await apiCall('/posts?limit=100');

// POST request
const newPost = await apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content, category, published })
});

// PUT request
const updated = await apiCall('/posts/42', {
    method: 'PUT',
    body: JSON.stringify({ title, content })
});

// DELETE request
const deleted = await apiCall('/posts/42', {
    method: 'DELETE'
});
```

### 2. Create a Post
```javascript
const payload = {
    title: "How to Save $1000 Per Month",
    category: "saving-tips",
    excerpt: "Simple strategies for emergency funds",
    content: "Lorem ipsum... (1000+ words)",
    image_url: "https://example.com/image.jpg",
    published: true
};

const result = await apiCall('/posts', {
    method: 'POST',
    body: JSON.stringify(payload)
});

if (result.success) {
    console.log('Post created:', result.post.id);
    showAlert('Post created successfully!');
} else {
    showAlert('Error: ' + result.message, 'error');
}
```

### 3. Get All Posts
```javascript
const result = await apiCall('/posts?limit=100&page=1');

if (result && result.posts) {
    result.posts.forEach(post => {
        console.log(`${post.title} - ${post.views} views`);
    });
    console.log(`Total: ${result.total} posts`);
    console.log(`Page ${result.currentPage} of ${result.totalPages}`);
}
```

### 4. Update a Post
```javascript
const postId = 42;
const updates = {
    title: "Updated Title",
    content: "Updated content here...",
    published: true
};

const result = await apiCall(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
});

if (result.success) {
    showAlert('Post updated!');
    loadPosts(); // Refresh list
}
```

### 5. Delete a Post
```javascript
const postId = 42;

if (confirm('Delete this post?')) {
    const result = await apiCall(`/posts/${postId}`, {
        method: 'DELETE'
    });

    if (result.success) {
        showAlert('Post deleted!');
        loadPosts();
    }
}
```

### 6. Get Analytics Data
```javascript
const stats = await apiCall('/analytics/stats');

if (stats) {
    console.log('Total views:', stats.totalPageViews);
    console.log('Today views:', stats.views24h);
    console.log('This week:', stats.views7days);
    console.log('This month:', stats.views30days);
    console.log('Top countries:', stats.topCountries.slice(0, 5));
    console.log('Recent visitors:', stats.recentVisitors.length);
}
```

### 7. Show Alert Message
```javascript
// Success alert (green)
showAlert('Post created successfully!');

// Error alert (red)
showAlert('Failed to save post', 'error');

// Warning alert (orange)
showAlert('This action cannot be undone', 'warning');

// Auto-dismisses in 5 seconds
```

### 8. Switch Tabs Programmatically
```javascript
// Switch to posts tab
switchTab('posts');

// Switch to analytics
switchTab('analytics');

// Switch to settings
switchTab('settings');

// Switch to dashboard
switchTab('dashboard');
```

### 9. Calculate Word Count
```javascript
const content = "Your article text here...";
const wordCount = content.trim().split(/\s+/).length;

if (wordCount < 1000) {
    showAlert(`Need ${1000 - wordCount} more words`, 'warning');
} else {
    showAlert('Word count OK: ' + wordCount);
}
```

### 10. Handle Form Submission
```javascript
document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('form-title').value;
    const content = document.getElementById('form-content').value;
    const category = document.getElementById('form-category').value;

    // Validate
    if (!title || !content || !category) {
        showAlert('Please fill all required fields', 'error');
        return;
    }

    // Submit
    const result = await apiCall('/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content, category, published: true })
    });

    if (result && result.success) {
        showAlert('Saved!');
        document.getElementById('post-form').reset();
    }
});
```

---

## API Response Examples

### POST /api/posts (Create)
```json
{
  "success": true,
  "post": {
    "id": 42,
    "title": "How to Save Money",
    "slug": "how-to-save-money-654321",
    "category": "saving-tips",
    "excerpt": "Simple strategies",
    "content": "Lorem ipsum...",
    "image_url": "https://...",
    "author_id": 1,
    "views": 0,
    "published": true,
    "created_at": "2024-01-16T10:30:00Z",
    "updated_at": "2024-01-16T10:30:00Z",
    "meta_description": null,
    "keywords": null
  }
}
```

### GET /api/posts (List)
```json
{
  "success": true,
  "posts": [
    {
      "id": 1,
      "title": "First Post",
      "slug": "first-post-123456",
      "category": "saving-tips",
      "excerpt": "Excerpt here",
      "content": "...",
      "image_url": "https://...",
      "views": 150,
      "published": true,
      "created_at": "2024-01-01T08:00:00Z",
      "updated_at": "2024-01-16T10:30:00Z"
    },
    {
      "id": 2,
      "title": "Second Post",
      "slug": "second-post-654321",
      "category": "investing",
      "excerpt": "Another post",
      "content": "...",
      "image_url": null,
      "views": 75,
      "published": false,
      "created_at": "2024-01-10T09:00:00Z",
      "updated_at": "2024-01-16T11:00:00Z"
    }
  ],
  "total": 2,
  "totalPages": 1,
  "currentPage": 1,
  "limit": 9
}
```

### GET /api/analytics/stats (Dashboard Data)
```json
{
  "totalPageViews": 15250,
  "views24h": 175,
  "views7days": 950,
  "views30days": 3450,
  "dailyViews": [
    { "date": "2024-01-10", "views": 120 },
    { "date": "2024-01-11", "views": 150 },
    { "date": "2024-01-12", "views": 180 },
    { "date": "2024-01-13", "views": 140 },
    { "date": "2024-01-14", "views": 160 },
    { "date": "2024-01-15", "views": 120 },
    { "date": "2024-01-16", "views": 175 }
  ],
  "topCountries": [
    { "country": "United States", "count": 8500 },
    { "country": "United Kingdom", "count": 2100 },
    { "country": "Canada", "count": 1200 },
    { "country": "India", "count": 950 },
    { "country": "Australia", "count": 800 },
    { "country": "Germany", "count": 650 },
    { "country": "France", "count": 580 },
    { "country": "Brazil", "count": 520 },
    { "country": "Mexico", "count": 450 },
    { "country": "Japan", "count": 400 }
  ],
  "topCities": [
    { "city": "New York", "country": "US", "count": 2500 },
    { "city": "Los Angeles", "country": "US", "count": 1800 },
    { "city": "London", "country": "UK", "count": 1200 },
    { "city": "Toronto", "country": "Canada", "count": 850 },
    { "city": "Sydney", "country": "Australia", "count": 650 },
    { "city": "Delhi", "country": "India", "count": 500 },
    { "city": "Mumbai", "country": "India", "count": 450 },
    { "city": "Berlin", "country": "Germany", "count": 400 },
    { "city": "Paris", "country": "France", "count": 350 },
    { "city": "Sao Paulo", "country": "Brazil", "count": 300 }
  ],
  "topPages": [
    {
      "page": "/how-to-save-money.html",
      "count": 2800
    },
    {
      "page": "/best-budgeting-apps.html",
      "count": 2100
    },
    {
      "page": "/retirement-planning-guide.html",
      "count": 1950
    },
    {
      "page": "/credit-card-comparison.html",
      "count": 1650
    },
    {
      "page": "/",
      "count": 1200
    }
  ],
  "topReferrers": [
    { "referrer": "google.com", "count": 6500 },
    { "referrer": "facebook.com", "count": 3200 },
    { "referrer": "reddit.com", "count": 1800 },
    { "referrer": "twitter.com", "count": 1200 },
    { "referrer": null, "count": 2550 }
  ],
  "recentVisitors": [
    {
      "ip": "203.0.113.42",
      "country": "United States",
      "city": "New York",
      "region": "NY",
      "page": "/how-to-save-money.html",
      "referrer": "google.com",
      "timestamp": "2024-01-16T12:45:30Z"
    },
    {
      "ip": "198.51.100.88",
      "country": "Canada",
      "city": "Toronto",
      "region": "ON",
      "page": "/best-budgeting-apps.html",
      "referrer": "reddit.com",
      "timestamp": "2024-01-16T12:40:15Z"
    },
    {
      "ip": "192.0.2.15",
      "country": "United Kingdom",
      "city": "London",
      "region": "England",
      "page": "/retirement-planning-guide.html",
      "referrer": "facebook.com",
      "timestamp": "2024-01-16T12:35:00Z"
    }
  ]
}
```

### POST /api/auth/login
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@smartmoney.com",
    "username": "admin",
    "role": "admin"
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Post must contain at least 1000 words"
}
```

### Error Response (401)
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token"
}
```

### Error Response (404)
```json
{
  "success": false,
  "message": "Post not found"
}
```

---

## JavaScript Patterns Used

### App State Object
```javascript
const APP = {
    apiBase: '/api',              // API endpoint
    token: 'jwt-token-here',      // Auth token
    user: { id: 1, email: '...' }, // User info
    currentPostId: null,           // Being edited
    charts: {},                    // Chart instances
    selectedPeriod: '24h'         // Analytics period
};
```

### Try-Catch for API Calls
```javascript
async function loadData() {
    try {
        const result = await apiCall('/posts');
        if (!result) {
            showAlert('Connection error', 'error');
            return;
        }
        // Process result
    } catch (error) {
        console.error('Error:', error);
        showAlert('Something went wrong', 'error');
    }
}
```

### Modal Control
```javascript
function openModal() {
    document.getElementById('post-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('post-modal').classList.remove('active');
}

// Keypress handler
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Click outside handler
modal.addEventListener('click', (e) => {
    if (e.target.id === 'post-modal') closeModal();
});
```

### Event Delegation
```javascript
// Instead of individual listeners
document.getElementById('btn-edit-1').addEventListener('click', editPost1);
document.getElementById('btn-edit-2').addEventListener('click', editPost2);

// Use delegation
document.getElementById('posts-tbody').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-edit')) {
        const postId = e.target.dataset.postId;
        editPost(postId);
    }
});
```

### Conditional Rendering
```javascript
if (posts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No posts yet</td></tr>';
} else {
    tbody.innerHTML = posts.map(post => `
        <tr>
            <td>${post.title}</td>
            <td>${post.views}</td>
        </tr>
    `).join('');
}
```

### Input Validation
```javascript
const validatePost = (post) => {
    const errors = [];

    if (!post.title || post.title.trim() === '') {
        errors.push('Title is required');
    }

    if (!post.content || post.content.trim() === '') {
        errors.push('Content is required');
    }

    if (post.content.split(/\s+/).length < 1000) {
        errors.push('Content must be at least 1000 words');
    }

    return errors;
};

const errors = validatePost(post);
if (errors.length > 0) {
    showAlert(errors[0], 'error');
    return;
}
```

### Chart Management
```javascript
function destroyChart(id) {
    if (APP.charts[id]) {
        APP.charts[id].destroy();
        delete APP.charts[id];
    }
}

// Create new chart
destroyChart('chart-daily-views');
const ctx = document.getElementById('chart-daily-views').getContext('2d');
APP.charts['chart-daily-views'] = new Chart(ctx, {
    type: 'line',
    data: { /* ... */ },
    options: { /* ... */ }
});
```

---

## Common Tasks

### How to Add a New Post Programmatically
```javascript
async function createSamplePost() {
    const post = {
        title: "The Ultimate Guide to Financial Freedom",
        category: "money-management",
        excerpt: "Learn the 7 principles of financial independence",
        content: "Lorem ipsum dolor sit amet... ".repeat(100), // 1000+ words
        image_url: "https://example.com/image.jpg",
        published: true
    };

    const result = await apiCall('/posts', {
        method: 'POST',
        body: JSON.stringify(post)
    });

    if (result.success) {
        console.log('Created post #' + result.post.id);
        return result.post;
    }
}
```

### How to Export Analytics as CSV
```javascript
function exportAnalyticsCSV() {
    const stats = APP.lastStats; // Store after loading
    const csv = [
        ['Metric', 'Value'].join(','),
        ['Total Views', stats.totalPageViews].join(','),
        ['24h Views', stats.views24h].join(','),
        ['7d Views', stats.views7days].join(','),
        ['30d Views', stats.views30days].join(',')
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString()}.csv`;
    a.click();
}
```

### How to Batch Delete Posts
```javascript
async function deleteSelectedPosts(postIds) {
    const confirmed = confirm(`Delete ${postIds.length} posts?`);
    if (!confirmed) return;

    for (const id of postIds) {
        const result = await apiCall(`/posts/${id}`, {
            method: 'DELETE'
        });
        if (!result.success) {
            showAlert(`Failed to delete post #${id}`, 'error');
        }
    }

    showAlert(`Deleted ${postIds.length} posts`);
    loadPosts();
}
```

---

## Testing in Console

```javascript
// Check app state
console.log(APP);

// Check token
console.log(localStorage.getItem('token'));

// Check user
console.log(JSON.parse(localStorage.getItem('user')));

// Make test API call
apiCall('/posts').then(data => console.log(data));

// Manually switch tab
switchTab('analytics');

// Create alert
showAlert('This is a test', 'success');

// Get word count of current post
console.log(
    document.getElementById('form-content').value.split(/\s+/).length
);

// Destroy all charts
Object.keys(APP.charts).forEach(key => {
    APP.charts[key].destroy();
    delete APP.charts[key];
});
```

---

This guide covers all the code patterns, API usage, and examples for the professional admin dashboard!
