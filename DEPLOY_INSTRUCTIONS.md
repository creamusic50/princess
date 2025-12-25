## Deploy & Commit Instructions

Run these commands from the repository root to commit all frontend/backend changes before deploying.

```bash
git add backend/frontend/* frontend/*
git commit -m "Add editorial homepage content, 5 articles, expanded contact, and updated sitemap for AdSense review"
git push origin main
```

If your repo uses a different branch, replace `main` with your branch name. After pushing, run your usual deploy script if required.

---

## Google Search Console Checklist

1. Ensure `/sitemap.xml` is reachable: https://tilana.online/sitemap.xml
2. In Search Console: Index -> Sitemaps -> enter `https://tilana.online/sitemap.xml` -> Submit
3. Use URL Inspection for high-priority pages (paste each URL and click "Request Indexing"):
   - https://tilana.online/
   - https://tilana.online/how-to-create-a-personal-budget.html
   - https://tilana.online/common-money-mistakes-that-destroy-your-savings.html
   - https://tilana.online/difference-savings-vs-investing.html
   - https://tilana.online/plan-for-retirement-in-your-20s-30s-40s.html
4. Wait 7–14 days and monitor Coverage and Performance reports for crawl/indexing status.

Optional note: If you use a CDN, invalidate cache for `/` and `/sitemap.xml` after deploy.
