# Smart Money Guide - Unified Server Setup

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Make sure your `.env` file is set up with:
```env
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
# ... other variables
```

### 3. Start the Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## 📍 Important URLs

Once the server is running, access:

- **Homepage**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin.html or http://localhost:5000/admin
- **Login**: http://localhost:5000/login.html
- **API Health Check**: http://localhost:5000/api/health
- **API Endpoints**: http://localhost:5000/api/*

## 🏗️ Project Structure

```
finance-blog/
├── server.js           # Main unified server (backend + frontend)
├── package.json        # Dependencies
├── .env               # Environment variables
├── frontend/          # All HTML, CSS, JS files
│   ├── index.html
│   ├── admin.html
│   ├── css/
│   └── js/
├── routes/            # API routes
│   ├── posts.js
│   ├── auth.js
│   └── ...
├── controllers/       # Business logic
├── models/           # Database models
├── middleware/       # Custom middleware
└── utils/            # Helper functions
```

## 🔧 How It Works

1. **Single Server**: One Express server handles everything
2. **API Routes**: `/api/*` routes serve backend functionality
3. **Static Files**: All other routes serve frontend files from `/frontend`
4. **SPA Support**: Falls back to `index.html` for client-side routing

## 🛠️ Development Tips

- Backend code changes require server restart
- Frontend changes (HTML/CSS/JS) just need browser refresh
- Use `npm run dev` with nodemon for auto-restart on backend changes
- Admin panel is at `/admin.html` or `/admin`

## 📝 Notes

- Frontend and backend run on the same port (5000 by default)
- No need for separate frontend/backend servers
- CORS is configured for development
- Static files are served with proper caching in production
