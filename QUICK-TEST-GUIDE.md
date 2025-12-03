# 🚀 Quick Test Guide - CRUD Operations

## Prerequisites
1. Server must be running: `npm start`
2. Database connected (check console for "✅ Connected to PostgreSQL")

---

## Method 1: Automated Testing (Recommended)

### Run the Test Script
```bash
node TEST-CRUD-OPERATIONS.js
```

This will automatically test:
- ✅ Login
- ✅ Create Post
- ✅ Get All Posts
- ✅ Get Single Post
- ✅ Update Post
- ✅ Delete Post
- ✅ Verify Deletion

**Expected Output:**
```
🚀 FINANCE BLOG - CRUD OPERATIONS TEST SUITE
✓ Login successful!
✓ Post created successfully!
✓ Retrieved 10 posts
✓ Post retrieved successfully!
✓ Post updated successfully!
✓ Post deleted successfully!
✓ Verification passed: Post is deleted

📊 TEST SUMMARY
Total Tests: 7
Passed: 7
Failed: 0
```

---

## Method 2: Manual Testing via Admin Panel

### 1. Access Admin Panel
```
http://localhost:5000/admin.html
```

### 2. Login
- Email: `admin@smartmoneyguide.com`
- Password: `Admin@123`

### 3. Test Operations

**CREATE:**
1. Click "New Post" button
2. Fill in all fields:
   - Title: "Test Investment Strategy"
   - Category: Select "investing"
   - Excerpt: "A comprehensive guide..."
   - Content: Write 1000+ words
3. Click "Publish"
4. ✅ Post should appear in the list

**READ:**
1. See all posts in the dashboard
2. Click on a post to view details
3. ✅ All information displays correctly

**UPDATE:**
1. Click "Edit" on any post
2. Modify the title or content
3. Click "Update"
4. ✅ Changes should be saved

**DELETE:**
1. Click "Delete" on any post
2. Confirm deletion
3. ✅ Post should be removed from list

---

## Method 3: Browser Developer Tools

### 1. Open Browser Console (F12)

### 2. Test CREATE
```javascript
fetch('http://localhost:5000/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    title: 'Test Post from Console',
    category: 'investing',
    excerpt: 'Testing from browser',
    content: '<p>' + 'Test content. '.repeat(200) + '</p>',
    published: true
  })
})
.then(r => r.json())
.then(console.log)
```

### 3. Test READ
```javascript
fetch('http://localhost:5000/api/posts')
  .then(r => r.json())
  .then(console.log)
```

### 4. Test UPDATE
```javascript
fetch('http://localhost:5000/api/posts/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  },
  body: JSON.stringify({
    title: 'Updated Title'
  })
})
.then(r => r.json())
.then(console.log)
```

### 5. Test DELETE
```javascript
fetch('http://localhost:5000/api/posts/1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(r => r.json())
.then(console.log)
```

---

## Method 4: Using curl (Command Line)

### Get Token First
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartmoneyguide.com","password":"Admin@123"}'
```

Copy the token from response.

### CREATE
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test curl Post",
    "category": "investing",
    "excerpt": "Test excerpt",
    "content": "<p>Test content repeated... (1000+ words)</p>",
    "published": true
  }'
```

### READ
```bash
curl http://localhost:5000/api/posts
```

### UPDATE
```bash
curl -X PUT http://localhost:5000/api/posts/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated via curl"}'
```

### DELETE
```bash
curl -X DELETE http://localhost:5000/api/posts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Expected Results

### ✅ CREATE Success
```json
{
  "success": true,
  "post": {
    "id": 1,
    "title": "Test Post",
    "slug": "test-post-123456",
    "category": "investing",
    "excerpt": "...",
    "content": "...",
    "published": true,
    "created_at": "2024-12-02T...",
    "updated_at": "2024-12-02T..."
  }
}
```

### ✅ READ Success
```json
{
  "success": true,
  "posts": [...],
  "total": 10,
  "totalPages": 1,
  "currentPage": 1,
  "limit": 10
}
```

### ✅ UPDATE Success
```json
{
  "success": true,
  "post": {
    "id": 1,
    "title": "Updated Title",
    ...
  }
}
```

### ✅ DELETE Success
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

## Common Issues

### ❌ "Not authorized to access this route"
**Solution:** Make sure you're logged in and using the JWT token in Authorization header

### ❌ "Content must be at least 1000 words"
**Solution:** Write longer content (1000+ words)

### ❌ "Post not found"
**Solution:** Check if post ID/slug is correct

### ❌ Database connection error
**Solution:** Check .env file for correct DATABASE_URL

---

## Quick Verification Checklist

After running tests, verify:
- [ ] Can create new posts
- [ ] Can view all posts
- [ ] Can view single post
- [ ] Can update posts
- [ ] Can delete posts
- [ ] Deleted posts are gone
- [ ] Authentication works
- [ ] Validation prevents bad data
- [ ] No server errors in console

---

## Need Help?

1. Check `CRUD-STATUS-REPORT.md` for detailed documentation
2. Check server console for error messages
3. Check browser console for client-side errors
4. Run `node TEST-CRUD-OPERATIONS.js` for automated testing

---

**Status:** All operations working correctly! 🎉
