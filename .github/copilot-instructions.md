# Smart Money Guide - AI Assistant Instructions

## 🎯 Project Overview
Full-stack finance blog: Node.js/Express backend (PostgreSQL + Neon), vanilla JavaScript frontend. Serves posts through REST API, includes admin dashboard for CRUD operations, and enforces 1000+ word minimum for AdSense compliance.

## 🏗️ Architecture

### Backend Structure (Node.js + Express)
- **server.js** - Entry point; serves frontend files + API routes, configures Helmet/CORS/rate-limiting
- **routes/** - RESTful endpoints grouped by resource (`posts.js`, `auth.js`, `categories.js`, `admin.js`)
- **controllers/** - Business logic extracted from routes (validates, transforms, returns responses)
- **models/** - Direct SQL classes (no ORM); manage schema/queries for `users`, `posts`, `categories`
- **middleware/** - `auth.js` (JWT protect/admin), `errorHandler.js`, `validation.js`
- **config/database.js** - PostgreSQL Pool + transaction helper

**Key Pattern**: Models execute raw SQL with parameterized queries; controllers call models; routes call controllers.

### Frontend Architecture
- **Vanilla JS** - No framework; modular scripts in `js/` directory
- **config.js** - Global CONFIG object; API_BASE_URL auto-detects localhost vs production
- **auth.js** - Auth class manages login/register, stores token in localStorage
- **main.js** - Renders posts, pagination, search
- **admin.js** - Dashboard; create/edit/delete posts via protected endpoints
- **admin.html** - Uses event delegation for CSP compliance (no inline handlers)

**Key Pattern**: Each module uses `authFetch(url, options)` helper which auto-attaches JWT Bearer token.

### Database
PostgreSQL (Neon); key tables:
- **users**: id, email, password (bcrypted), role (admin|user), created_at
- **posts**: id, title, slug (unique), category, content, author_id, published, views, created_at/updated_at
- **categories**: derived via Post.getCategories() query

Indexes on `posts` table: slug, category, published, created_at for query performance.

## 🔌 Data Flow & Integration Points

### Creating/Updating Posts
1. Frontend `admin.js` sends POST /api/posts with title, category, excerpt, content
2. `postController.js::createPost` validates word count (minimum 1000 words, plain text)
3. `Post.create()` generates slug via `slugify(title) + Date.now().slice(-6)`
4. Response includes full post object with generated ID
5. **Important**: Meta descriptions & keywords may not exist in all DB schemas; conditionally insert

### Authentication Flow
1. Frontend `auth.js::login(email, password)` → POST /api/auth/login
2. Backend returns `{ success, token, user: { id, email, role } }`
3. Frontend stores token in `localStorage['token']`, user in `localStorage['user']`
4. All subsequent requests use `authFetch()` which adds `Authorization: Bearer <token>` header
5. Backend `protect` middleware verifies JWT; `admin` middleware checks role='admin'

### API Error Handling
- **400**: Validation failures (word count, missing fields), duplicate slugs
- **401**: Missing/invalid JWT token
- **403**: User lacks admin role
- **404**: Resource not found (post by slug/id)
- **500**: Server errors; logged via Winston logger to `backend/logs/`

Response format: `{ success: boolean, message?: string, [data] }`

## 📋 Common Tasks & Commands

### Start Development
```bash
cd backend
npm install               # First time only
node scripts/migrate.js   # Setup schema + indexes
npm start                 # Start server on :5000 (or PORT env var)
```
Access: http://localhost:5000 (serves frontend) + http://localhost:5000/api/posts (API)

### Database Migrations
- **migrate.js**: Creates tables + indexes if not exist (safe to re-run)
- **seed.js**: Populates sample posts + admin user
- **create-admin.js**: Creates admin user interactively
- **reset-password.js**: Change admin password

### Authentication Debugging
- Default admin credentials: check `backend/scripts/seed.js` or run `node scripts/create-admin.js`
- JWT secret in `.env` as `JWT_SECRET` (never commit .env)
- Token format: Bearer token in `Authorization` header OR `x-auth-token` header

### Post Schema Flexibility
Some deployments lack `meta_description` & `keywords` columns. Check `Post.create()` — only inserts core columns to maintain compatibility.

## 🎨 Conventions & Patterns

### Response Format (Backend)
Always return JSON:
```javascript
res.json({
  success: true,
  posts: [...],
  total: 42,
  totalPages: 5,
  currentPage: 1
});
```

### Error Handling (Backend)
Use `errorHandler` middleware; catches JWT errors, DB unique violations, validation errors. In development, includes stack traces.

### Slug Generation (Post Model)
```javascript
Post.generateSlug(title)  // → slugified-title-123456
// Appends last 6 digits of timestamp to ensure uniqueness
```

### Rate Limiting
Express rate-limit applied to `/api/*` routes; configurable via `RATE_LIMIT_WINDOW_MS` (default 15min) and `RATE_LIMIT_MAX` (default 100 requests).

### Word Count Validation
Posts must be ≥1000 words (plain text, HTML stripped). Applied on create & update. AdSense compliance requirement. Validated client-side (admin.html) and server-side (postController.js).

### Content Security Policy (CSP)
Helmet configured with `scriptSrcAttr: ["'unsafe-inline'"]` to allow inline event handlers in admin.html. However, **prefer event delegation** (attach listeners via JavaScript) for maintainability:
```javascript
element.addEventListener('click', handler)  // Preferred
// vs
// <button onclick="handler()">  // Works but avoid
```

### Frontend Module Pattern
Each module (auth.js, main.js, admin.js) is self-contained; uses global `CONFIG` from config.js for API URLs & settings.

## 🚨 Critical Knowledge for Tasks

- **Never hardcode API URLs**: Use `CONFIG.API_BASE_URL` or `getApiUrl(endpoint)`
- **Always use parameterized SQL queries**: Prevent SQL injection (e.g., `query(sql, [value])`)
- **JWT tokens expire**: Implement refresh logic if needed; currently 401 clears localStorage
- **Slug uniqueness**: Post.generateSlug() includes timestamp; if collision detected, DB constraint throws error
- **Admin-only routes**: POST/PUT/DELETE on posts require `protect` + `admin` middleware
- **CORS origin list**: Check `.env` `CORS_ORIGIN` variable (comma-separated origins or '*')
- **Static file serving**: Frontend files served from `../frontend/` via Express static middleware
- **CSP Compliance**: Avoid inline event handlers in HTML; use `addEventListener` in scripts instead

## 📁 Key Files Reference
| File | Purpose |
|------|---------|
| `backend/server.js` | Express app setup, route mounting, SPA fallback, CSP config |
| `backend/models/Post.js` | Post CRUD, slug generation, queries, pagination |
| `backend/controllers/postController.js` | Request validation, word count check, response formatting |
| `backend/middleware/auth.js` | JWT verification, admin role check |
| `backend/config/database.js` | PostgreSQL Pool, transaction helper |
| `frontend/js/config.js` | Global CONFIG, authFetch helper |
| `frontend/js/auth.js` | Login/register, token storage, auth UI |
| `frontend/admin.html` | Admin dashboard with event delegation (CSP-safe) |

## 💡 Troubleshooting Patterns
- **Posts not loading**: Verify migration ran (`migrate.js`), backend started, frontend API_BASE_URL correct
- **Auth fails**: Check JWT_SECRET in .env, token format in localStorage, middleware order in server.js
- **CORS errors**: Whitelist origin in .env CORS_ORIGIN or check helmet CSP directives in server.js
- **Word count rejection**: Ensure content has ≥1000 plain text words; HTML tags don't count
- **CSP violations**: Check admin.html for inline event handlers; migrate to `addEventListener` approach
